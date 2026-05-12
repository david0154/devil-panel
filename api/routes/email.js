const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const { pool }= require('../db');
const { authenticate, auditLog } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimit');

router.use(authenticate, apiLimiter);

router.get('/accounts', async (req, res) => {
  try {
    const r = await pool.query(`SELECT id,address,quota_mb,created_at FROM email_accounts WHERE user_id=$1`, [req.user.id]);
    res.json({ data: r.rows });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/accounts', auditLog('email.create','email'), async (req, res) => {
  const { address, password, domain_id, quota_mb } = req.body;
  if (!address || !password) return res.status(400).json({ error: 'Address and password required' });
  try {
    const hash = await bcrypt.hash(password, 12);
    const r = await pool.query(
      `INSERT INTO email_accounts (user_id,domain_id,address,password_hash,quota_mb)
       VALUES ($1,$2,$3,$4,$5) RETURNING id,address,quota_mb`,
      [req.user.id, domain_id, address, hash, quota_mb || 1000]
    );
    res.status(201).json({ data: r.rows[0] });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Email address already exists' });
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/accounts/:id', auditLog('email.delete','email'), async (req, res) => {
  try {
    await pool.query('DELETE FROM email_accounts WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    res.json({ message: 'Email account deleted' });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

router.put('/accounts/:id/password', async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password required' });
  try {
    const hash = await bcrypt.hash(password, 12);
    await pool.query('UPDATE email_accounts SET password_hash=$1 WHERE id=$2 AND user_id=$3',
      [hash, req.params.id, req.user.id]);
    res.json({ message: 'Password changed' });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

router.get('/forwarders', async (req, res) => res.json({ data: [], message: 'Forwarders via Postfix' }));
router.post('/forwarders', auditLog('email.forwarder.create','email'), (req, res) => res.status(201).json({ status: 'ok' }));

module.exports = router;
