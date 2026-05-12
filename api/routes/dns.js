const router = require('express').Router();
const { pool } = require('../db');
const { authenticate, auditLog } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimit');

router.use(authenticate, apiLimiter);

const VALID_TYPES = ['A','AAAA','CNAME','MX','TXT','NS','SRV','PTR','CAA'];

router.get('/zones', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM dns_zones WHERE user_id=$1 ORDER BY created_at DESC', [req.user.id]);
    res.json({ data: r.rows });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/zones', auditLog('dns.zone.create','dns'), async (req, res) => {
  const { zone } = req.body;
  if (!zone) return res.status(400).json({ error: 'Zone name required' });
  try {
    const r = await pool.query(
      'INSERT INTO dns_zones (user_id, zone) VALUES ($1,$2) RETURNING *', [req.user.id, zone.toLowerCase()]
    );
    res.status(201).json({ data: r.rows[0] });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Zone already exists' });
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/zones/:zone', auditLog('dns.zone.delete','dns'), async (req, res) => {
  try {
    await pool.query('DELETE FROM dns_zones WHERE zone=$1 AND user_id=$2', [req.params.zone, req.user.id]);
    res.json({ message: 'Zone deleted' });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

router.get('/zones/:zone/records', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT dr.* FROM dns_records dr
       JOIN dns_zones dz ON dr.zone_id=dz.id
       WHERE dz.zone=$1 AND dz.user_id=$2`, [req.params.zone, req.user.id]
    );
    res.json({ data: r.rows });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/zones/:zone/records', auditLog('dns.record.create','dns'), async (req, res) => {
  const { type, name, value, ttl, priority } = req.body;
  if (!type || !name || !value) return res.status(400).json({ error: 'type, name, value required' });
  if (!VALID_TYPES.includes(type.toUpperCase())) return res.status(400).json({ error: 'Invalid record type' });
  try {
    const zone = await pool.query('SELECT id FROM dns_zones WHERE zone=$1 AND user_id=$2', [req.params.zone, req.user.id]);
    if (!zone.rows.length) return res.status(404).json({ error: 'Zone not found' });
    const r = await pool.query(
      `INSERT INTO dns_records (zone_id,type,name,value,ttl,priority) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [zone.rows[0].id, type.toUpperCase(), name, value, ttl || 3600, priority]
    );
    res.status(201).json({ data: r.rows[0] });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

router.put('/zones/:zone/records/:id', auditLog('dns.record.update','dns'), async (req, res) => {
  const { value, ttl } = req.body;
  try {
    await pool.query('UPDATE dns_records SET value=COALESCE($1,value), ttl=COALESCE($2,ttl) WHERE id=$3',
      [value, ttl, req.params.id]);
    res.json({ message: 'Record updated' });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

router.delete('/zones/:zone/records/:id', auditLog('dns.record.delete','dns'), async (req, res) => {
  try {
    await pool.query('DELETE FROM dns_records WHERE id=$1', [req.params.id]);
    res.json({ message: 'Record deleted' });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
