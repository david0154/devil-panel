const router = require('express').Router();
const { exec } = require('child_process');
const util   = require('util');
const { pool } = require('../db');
const { authenticate, adminOnly, auditLog } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimit');

const execAsync = util.promisify(exec);
router.use(authenticate, apiLimiter);

// GET /firewall/rules
router.get('/rules', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT fr.* FROM firewall_rules fr
       JOIN servers s ON fr.server_id=s.id
       WHERE s.user_id=$1 OR $2='admin'
       ORDER BY fr.created_at DESC`,
      [req.user.id, req.user.role]
    );
    res.json({ data: result.rows });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// POST /firewall/rules
router.post('/rules', auditLog('firewall.rule.create','firewall'), async (req, res) => {
  const { server_id, rule_type, protocol, port, source_ip, description } = req.body;
  if (!server_id || !rule_type || !port)
    return res.status(400).json({ error: 'server_id, rule_type, port required' });
  try {
    const result = await pool.query(
      `INSERT INTO firewall_rules (server_id,rule_type,protocol,port,source_ip,description)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [server_id, rule_type, protocol || 'tcp', port, source_ip, description]
    );
    // Apply ufw rule
    const action = rule_type === 'allow' ? 'allow' : 'deny';
    const from   = source_ip ? `from ${source_ip} ` : '';
    try {
      await execAsync(`ufw ${action} ${from}to any port ${port} proto ${protocol || 'tcp'}`);
    } catch (e) {}
    res.status(201).json({ data: result.rows[0] });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// DELETE /firewall/rules/:id
router.delete('/rules/:id', auditLog('firewall.rule.delete','firewall'), async (req, res) => {
  try {
    const rule = await pool.query('SELECT * FROM firewall_rules WHERE id=$1', [req.params.id]);
    if (!rule.rows.length) return res.status(404).json({ error: 'Rule not found' });
    await pool.query('DELETE FROM firewall_rules WHERE id=$1', [req.params.id]);
    res.json({ message: 'Firewall rule deleted' });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// POST /firewall/block-ip
router.post('/block-ip', adminOnly, auditLog('ip.block','firewall'), async (req, res) => {
  const { ip, reason } = req.body;
  if (!ip) return res.status(400).json({ error: 'IP required' });
  try {
    await pool.query(
      `INSERT INTO blocked_ips (ip_address,reason,blocked_by) VALUES ($1,$2,$3)
       ON CONFLICT (ip_address) DO UPDATE SET reason=$2`,
      [ip, reason, req.user.id]
    );
    try { await execAsync(`iptables -I INPUT -s ${ip} -j DROP`); } catch(e){}
    res.json({ message: `IP ${ip} blocked` });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// POST /firewall/unblock-ip
router.post('/unblock-ip', adminOnly, auditLog('ip.unblock','firewall'), async (req, res) => {
  const { ip } = req.body;
  if (!ip) return res.status(400).json({ error: 'IP required' });
  try {
    await pool.query('DELETE FROM blocked_ips WHERE ip_address=$1', [ip]);
    try { await execAsync(`iptables -D INPUT -s ${ip} -j DROP`); } catch(e){}
    res.json({ message: `IP ${ip} unblocked` });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
