const router = require('express').Router();
const { pool } = require('../db');
const { authenticate, adminOnly, auditLog } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimit');
const si = require('systeminformation');

router.use(authenticate, apiLimiter);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM servers WHERE user_id=$1 ORDER BY created_at DESC`, [req.user.id]
    );
    res.json({ data: result.rows });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/', auditLog('server.create','servers'), async (req, res) => {
  const { name, hostname, ip_address, plan } = req.body;
  if (!name) return res.status(400).json({ error: 'Server name required' });
  try {
    const result = await pool.query(
      `INSERT INTO servers (user_id,name,hostname,ip_address,plan) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.user.id, name, hostname, ip_address, plan]
    );
    res.status(201).json({ data: result.rows[0] });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM servers WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ data: result.rows[0] });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

router.put('/:id', auditLog('server.update','servers'), async (req, res) => {
  const { name, hostname } = req.body;
  try {
    await pool.query(
      `UPDATE servers SET name=COALESCE($1,name), hostname=COALESCE($2,hostname) WHERE id=$3 AND user_id=$4`,
      [name, hostname, req.params.id, req.user.id]
    );
    res.json({ message: 'Server updated' });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

router.delete('/:id', auditLog('server.delete','servers'), async (req, res) => {
  try {
    await pool.query('DELETE FROM servers WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    res.json({ message: 'Server deleted' });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/:id/reboot', auditLog('server.reboot','servers'), (req, res) => res.json({ status: 'rebooting' }));
router.post('/:id/start',  auditLog('server.start','servers'),  (req, res) => res.json({ status: 'starting' }));
router.post('/:id/stop',   auditLog('server.stop','servers'),   (req, res) => res.json({ status: 'stopping' }));

router.get('/:id/stats', async (req, res) => {
  try {
    const [cpu, mem, disk] = await Promise.all([si.currentLoad(), si.mem(), si.fsSize()]);
    res.json({
      cpu: Math.round(cpu.currentLoad),
      ram_used: mem.used, ram_total: mem.total,
      disk: disk[0] ? { used: disk[0].used, size: disk[0].size } : {}
    });
  } catch (e) { res.status(500).json({ error: 'Stats error' }); }
});

module.exports = router;
