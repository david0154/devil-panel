const router = require('express').Router();
const { pool } = require('../db');
const { authenticate, adminOnly, auditLog } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimit');
const si = require('systeminformation');

router.use(authenticate, adminOnly, apiLimiter);

// GET /admin/users
router.get('/users', async (req, res) => {
  const { page = 1, limit = 20, search = '' } = req.query;
  const offset = (page - 1) * limit;
  try {
    const r = await pool.query(
      `SELECT id,uuid,username,email,role,is_active,is_suspended,last_login,created_at
       FROM users WHERE username ILIKE $1 OR email ILIKE $1
       ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [`%${search}%`, limit, offset]
    );
    const count = await pool.query(`SELECT COUNT(*) FROM users WHERE username ILIKE $1 OR email ILIKE $1`, [`%${search}%`]);
    res.json({ data: r.rows, total: parseInt(count.rows[0].count), page: parseInt(page) });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// PUT /admin/users/:id/suspend
router.put('/users/:id/suspend', auditLog('admin.user.suspend','admin'), async (req, res) => {
  try {
    await pool.query('UPDATE users SET is_suspended=true WHERE id=$1', [req.params.id]);
    // Invalidate all sessions
    await pool.query('DELETE FROM sessions WHERE user_id=$1', [req.params.id]);
    res.json({ message: 'User suspended and sessions revoked' });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// PUT /admin/users/:id/activate
router.put('/users/:id/activate', auditLog('admin.user.activate','admin'), async (req, res) => {
  try {
    await pool.query('UPDATE users SET is_suspended=false, is_active=true WHERE id=$1', [req.params.id]);
    res.json({ message: 'User activated' });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// GET /admin/servers — all servers
router.get('/servers', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT s.*,u.username as owner FROM servers s
       JOIN users u ON s.user_id=u.id ORDER BY s.created_at DESC`
    );
    res.json({ data: r.rows });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// GET /admin/stats — global dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [users, servers, domains, invoices, cpu, mem] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM servers'),
      pool.query('SELECT COUNT(*) FROM domains'),
      pool.query(`SELECT SUM(amount) FROM invoices WHERE status='paid'`),
      si.currentLoad(),
      si.mem()
    ]);
    res.json({
      users:   parseInt(users.rows[0].count),
      servers: parseInt(servers.rows[0].count),
      domains: parseInt(domains.rows[0].count),
      revenue: parseFloat(invoices.rows[0].sum || 0),
      system:  {
        cpu_usage:  Math.round(cpu.currentLoad),
        ram_used:   mem.used,
        ram_total:  mem.total,
        ram_percent: Math.round((mem.used / mem.total) * 100)
      }
    });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// GET /admin/audit-logs
router.get('/audit-logs', async (req, res) => {
  const { limit = 100, offset = 0 } = req.query;
  try {
    const r = await pool.query(
      `SELECT a.*,u.username FROM audit_logs a
       LEFT JOIN users u ON a.user_id=u.id
       ORDER BY a.created_at DESC LIMIT $1 OFFSET $2`, [limit, offset]
    );
    res.json({ data: r.rows });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
