const router   = require('express').Router();
const bcrypt   = require('bcryptjs');
const { pool } = require('../db');
const { authenticate, auditLog } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimit');

router.use(authenticate, apiLimiter);

// GET /users/me
router.get('/me', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id,uuid,username,email,role,two_fa_enabled,email_verified,last_login,last_login_ip,created_at
       FROM users WHERE id=$1`, [req.user.id]
    );
    res.json({ data: result.rows[0] });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// PUT /users/me
router.put('/me', auditLog('user.update', 'users'), async (req, res) => {
  const { username, email } = req.body;
  try {
    await pool.query(
      `UPDATE users SET username=COALESCE($1,username), email=COALESCE($2,email),
       updated_at=NOW() WHERE id=$3`,
      [username, email, req.user.id]
    );
    res.json({ message: 'Profile updated' });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Username or email taken' });
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /users/me/password
router.put('/me/password', async (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password)
    return res.status(400).json({ error: 'Both passwords required' });
  if (new_password.length < 8)
    return res.status(400).json({ error: 'Password must be 8+ characters' });
  try {
    const result = await pool.query('SELECT password_hash FROM users WHERE id=$1', [req.user.id]);
    const valid = await require('bcryptjs').compare(current_password, result.rows[0].password_hash);
    if (!valid) return res.status(401).json({ error: 'Current password incorrect' });
    const hash = await require('bcryptjs').hash(new_password, 12);
    await pool.query('UPDATE users SET password_hash=$1, updated_at=NOW() WHERE id=$2', [hash, req.user.id]);
    res.json({ message: 'Password changed successfully' });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// GET /users/me/sessions
router.get('/me/sessions', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id,ip_address,user_agent,created_at,expires_at FROM sessions
       WHERE user_id=$1 AND expires_at > NOW() ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ data: result.rows });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// DELETE /users/me/sessions/:id
router.delete('/me/sessions/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM sessions WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    res.json({ message: 'Session revoked' });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
