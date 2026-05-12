const jwt      = require('jsonwebtoken');
const { pool } = require('../db');
const { logger } = require('../utils/logger');

// ── JWT Authentication ───────────────────────────────────
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Check if user still exists and is not suspended
    const result = await pool.query(
      'SELECT id, username, email, role, is_active, is_suspended FROM users WHERE id = $1',
      [decoded.id]
    );
    const user = result.rows[0];
    if (!user || !user.is_active || user.is_suspended)
      return res.status(401).json({ error: 'Account inactive or suspended' });

    req.user = { ...decoded, role: user.role };
    next();
  } catch (e) {
    if (e.name === 'TokenExpiredError')
      return res.status(401).json({ error: 'Token expired' });
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// ── Admin Only ───────────────────────────────────────────
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ error: 'Admin access required' });
  next();
};

// ── Audit Logger ─────────────────────────────────────────
const auditLog = (action, resource) => async (req, res, next) => {
  const origJson = res.json.bind(res);
  res.json = async (data) => {
    if (res.statusCode < 400) {
      try {
        await pool.query(
          `INSERT INTO audit_logs (user_id, action, resource, ip_address, user_agent, details)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [
            req.user?.id || null,
            action,
            resource,
            req.ip,
            req.headers['user-agent'],
            JSON.stringify({ body: req.body, params: req.params })
          ]
        );
      } catch (e) {
        logger.error('Audit log error:', e.message);
      }
    }
    return origJson(data);
  };
  next();
};

module.exports = { authenticate, adminOnly, auditLog };
