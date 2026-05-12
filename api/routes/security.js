const router = require('express').Router();
const { exec } = require('child_process');
const util   = require('util');
const { pool } = require('../db');
const { authenticate, adminOnly, auditLog } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimit');

const execAsync = util.promisify(exec);
router.use(authenticate, apiLimiter);

// GET /security/audit-logs
router.get('/audit-logs', async (req, res) => {
  const { limit = 50, offset = 0 } = req.query;
  try {
    const query = req.user.role === 'admin'
      ? `SELECT a.*,u.username FROM audit_logs a
         LEFT JOIN users u ON a.user_id=u.id
         ORDER BY a.created_at DESC LIMIT $1 OFFSET $2`
      : `SELECT id,action,resource,created_at FROM audit_logs
         WHERE user_id=$3 ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
    const params = req.user.role === 'admin'
      ? [limit, offset]
      : [limit, offset, req.user.id];
    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// GET /security/blocked-ips
router.get('/blocked-ips', adminOnly, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM blocked_ips ORDER BY created_at DESC'
    );
    res.json({ data: result.rows });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// POST /security/block-ip
router.post('/block-ip', adminOnly, auditLog('ip.block','security'), async (req, res) => {
  const { ip, reason, expires_hours } = req.body;
  if (!ip) return res.status(400).json({ error: 'IP address required' });
  try {
    const expiresAt = expires_hours
      ? new Date(Date.now() + expires_hours * 3600000)
      : null;
    await pool.query(
      `INSERT INTO blocked_ips (ip_address,reason,blocked_by,expires_at)
       VALUES ($1,$2,$3,$4) ON CONFLICT (ip_address) DO UPDATE
       SET reason=$2, expires_at=$4`,
      [ip, reason, req.user.id, expiresAt]
    );
    // Apply iptables rule
    try {
      await execAsync(`iptables -I INPUT -s ${ip} -j DROP`);
    } catch (e) {} // May need root
    res.json({ message: `IP ${ip} blocked successfully` });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// DELETE /security/block-ip/:ip
router.delete('/block-ip/:ip', adminOnly, auditLog('ip.unblock','security'), async (req, res) => {
  try {
    await pool.query('DELETE FROM blocked_ips WHERE ip_address=$1', [req.params.ip]);
    try {
      await execAsync(`iptables -D INPUT -s ${req.params.ip} -j DROP`);
    } catch (e) {}
    res.json({ message: `IP ${req.params.ip} unblocked` });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// GET /security/failed-logins
router.get('/failed-logins', adminOnly, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ip_address, COUNT(*) as attempts, MAX(created_at) as last_attempt
       FROM audit_logs WHERE action='login.failed'
       GROUP BY ip_address ORDER BY attempts DESC LIMIT 50`
    );
    res.json({ data: result.rows });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// GET /security/ssl-expiry
router.get('/ssl-expiry', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT domain, expires_at,
        EXTRACT(DAY FROM expires_at - NOW()) as days_remaining
       FROM ssl_certificates
       WHERE expires_at < NOW() + INTERVAL '30 days'
       ORDER BY expires_at ASC`
    );
    res.json({ data: result.rows });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
