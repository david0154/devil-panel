const router   = require('express').Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode   = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../db');
const { authenticate, auditLog } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');
const { logger } = require('../utils/logger');

// ── POST /auth/login ─────────────────────────────────────
router.post('/login', authLimiter, async (req, res) => {
  const { username_or_email, password, totp_code } = req.body;
  if (!username_or_email || !password)
    return res.status(400).json({ error: 'Username/email and password required' });

  try {
    const result = await pool.query(
      `SELECT id,username,email,password_hash,role,is_active,is_suspended,
              two_fa_enabled,two_fa_secret FROM users
       WHERE (username=$1 OR email=$1)`,
      [username_or_email]
    );
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash)))
      return res.status(401).json({ error: 'Invalid credentials' });
    if (user.is_suspended)
      return res.status(403).json({ error: 'Account suspended' });
    if (!user.is_active)
      return res.status(401).json({ error: 'Account not activated. Check your email.' });

    // 2FA check
    if (user.two_fa_enabled) {
      if (!totp_code)
        return res.status(200).json({ requires_2fa: true });
      const valid = speakeasy.totp.verify({
        secret: user.two_fa_secret,
        encoding: 'base32',
        token: totp_code,
        window: 2
      });
      if (!valid)
        return res.status(401).json({ error: 'Invalid 2FA code' });
    }

    await pool.query(
      'UPDATE users SET last_login=$1, last_login_ip=$2 WHERE id=$3',
      [new Date(), req.ip, user.id]
    );

    const accessToken = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    const refreshToken = jwt.sign(
      { id: user.id, type: 'refresh' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Store session
    await pool.query(
      `INSERT INTO sessions (user_id, token, ip_address, user_agent, expires_at)
       VALUES ($1,$2,$3,$4, NOW() + INTERVAL '7 days')`,
      [user.id, refreshToken, req.ip, req.headers['user-agent']]
    );

    res.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: 86400,
      user: { id: user.id, username: user.username, email: user.email, role: user.role }
    });
  } catch (e) {
    logger.error('Login error:', e.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /auth/register ──────────────────────────────────
router.post('/register', authLimiter, async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: 'All fields required' });
  if (password.length < 8)
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  if (!/^[a-zA-Z0-9_-]{3,50}$/.test(username))
    return res.status(400).json({ error: 'Username invalid (3-50 chars, alphanumeric/_/-)' });

  try {
    const hash = await bcrypt.hash(password, 12);
    const verifyToken = uuidv4();
    const result = await pool.query(
      `INSERT INTO users (username,email,password_hash,role,is_active,verify_token)
       VALUES ($1,$2,$3,'user',true,$4) RETURNING id`,
      [username, email, hash, verifyToken]
    );
    res.status(201).json({ message: 'Account created successfully', user_id: result.rows[0].id });
  } catch (e) {
    if (e.code === '23505')
      return res.status(409).json({ error: 'Username or email already exists' });
    logger.error('Register error:', e.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /auth/logout ────────────────────────────────────
router.post('/logout', authenticate, async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  try {
    await pool.query('DELETE FROM sessions WHERE token=$1', [token]);
  } catch (e) {}
  res.json({ message: 'Logged out successfully' });
});

// ── POST /auth/refresh ───────────────────────────────────
router.post('/refresh', async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) return res.status(400).json({ error: 'Refresh token required' });
  try {
    const decoded = jwt.verify(refresh_token, process.env.JWT_SECRET);
    const sess = await pool.query(
      'SELECT * FROM sessions WHERE token=$1 AND expires_at > NOW()', [refresh_token]
    );
    if (!sess.rows.length) return res.status(401).json({ error: 'Session expired or invalid' });
    const userRes = await pool.query('SELECT id,username,email,role FROM users WHERE id=$1', [decoded.id]);
    const user = userRes.rows[0];
    const accessToken = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      process.env.JWT_SECRET, { expiresIn: '24h' }
    );
    res.json({ access_token: accessToken, token_type: 'Bearer', expires_in: 86400 });
  } catch (e) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// ── POST /auth/forgot-password ───────────────────────────
router.post('/forgot-password', authLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  try {
    const token = uuidv4();
    await pool.query(
      `UPDATE users SET reset_token=$1, reset_expires=NOW()+INTERVAL '1 hour' WHERE email=$2`,
      [token, email]
    );
  } catch (e) {}
  // Always respond same to prevent email enumeration
  res.json({ message: 'If that email exists, a reset link has been sent.' });
});

// ── POST /auth/reset-password ────────────────────────────
router.post('/reset-password', authLimiter, async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Token and password required' });
  try {
    const result = await pool.query(
      `SELECT id FROM users WHERE reset_token=$1 AND reset_expires > NOW()`, [token]
    );
    if (!result.rows.length) return res.status(400).json({ error: 'Invalid or expired reset token' });
    const hash = await bcrypt.hash(password, 12);
    await pool.query(
      `UPDATE users SET password_hash=$1, reset_token=NULL, reset_expires=NULL WHERE id=$2`,
      [hash, result.rows[0].id]
    );
    res.json({ message: 'Password reset successful' });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /auth/verify-email/:token ────────────────────────
router.get('/verify-email/:token', async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE users SET email_verified=true, verify_token=NULL, is_active=true
       WHERE verify_token=$1 RETURNING id`, [req.params.token]
    );
    if (!result.rows.length) return res.status(400).json({ error: 'Invalid token' });
    res.json({ message: 'Email verified successfully' });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /auth/2fa/enable ────────────────────────────────
router.post('/2fa/enable', authenticate, async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({
      name: `DevilPanel:${req.user.email}`,
      length: 20
    });
    await pool.query(
      'UPDATE users SET two_fa_secret=$1 WHERE id=$2',
      [secret.base32, req.user.id]
    );
    const qrUrl = await QRCode.toDataURL(secret.otpauth_url);
    res.json({ secret: secret.base32, qr_code: qrUrl });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /auth/2fa/verify ────────────────────────────────
router.post('/2fa/verify', authenticate, async (req, res) => {
  const { totp_code } = req.body;
  if (!totp_code) return res.status(400).json({ error: 'TOTP code required' });
  try {
    const result = await pool.query(
      'SELECT two_fa_secret FROM users WHERE id=$1', [req.user.id]
    );
    const valid = speakeasy.totp.verify({
      secret: result.rows[0].two_fa_secret,
      encoding: 'base32',
      token: totp_code,
      window: 2
    });
    if (!valid) return res.status(400).json({ error: 'Invalid code' });
    await pool.query('UPDATE users SET two_fa_enabled=true WHERE id=$1', [req.user.id]);
    res.json({ message: '2FA enabled successfully' });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
