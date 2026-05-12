const router = require('express').Router();
const { pool } = require('../db');
const { authenticate, auditLog } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimit');

router.use(authenticate, apiLimiter);

router.get('/', async (req, res) => {
  try {
    const r = await pool.query(`SELECT * FROM domains WHERE user_id=$1 ORDER BY created_at DESC`, [req.user.id]);
    res.json({ data: r.rows });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/', auditLog('domain.create','domains'), async (req, res) => {
  const { domain, server_id, php_version, document_root } = req.body;
  if (!domain || !server_id) return res.status(400).json({ error: 'Domain and server_id required' });
  if (!/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/.test(domain))
    return res.status(400).json({ error: 'Invalid domain format' });
  try {
    const r = await pool.query(
      `INSERT INTO domains (user_id,server_id,domain,php_version,document_root)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.user.id, server_id, domain.toLowerCase(), php_version || '8.2', document_root || `/var/www/${domain}`]
    );
    res.status(201).json({ data: r.rows[0] });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Domain already exists' });
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM domains WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Domain not found' });
    res.json({ data: r.rows[0] });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

router.put('/:id', auditLog('domain.update','domains'), async (req, res) => {
  const { php_version } = req.body;
  try {
    await pool.query(`UPDATE domains SET php_version=COALESCE($1,php_version) WHERE id=$2 AND user_id=$3`,
      [php_version, req.params.id, req.user.id]);
    res.json({ message: 'Domain updated' });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

router.delete('/:id', auditLog('domain.delete','domains'), async (req, res) => {
  try {
    await pool.query('DELETE FROM domains WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    res.json({ message: 'Domain deleted' });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/:id/php-version', auditLog('domain.php','domains'), async (req, res) => {
  const { version } = req.body;
  const valid = ['7.4','8.0','8.1','8.2','8.3'];
  if (!valid.includes(version)) return res.status(400).json({ error: 'Invalid PHP version' });
  try {
    await pool.query('UPDATE domains SET php_version=$1 WHERE id=$2 AND user_id=$3', [version, req.params.id, req.user.id]);
    res.json({ message: `PHP version changed to ${version}` });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
