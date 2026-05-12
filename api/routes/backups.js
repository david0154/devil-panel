const router = require('express').Router();
const { exec } = require('child_process');
const util   = require('util');
const path   = require('path');
const { pool } = require('../db');
const { authenticate, auditLog } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimit');

const execAsync = util.promisify(exec);
router.use(authenticate, apiLimiter);

router.get('/', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT b.*,s.name as server_name FROM backups b
       LEFT JOIN servers s ON b.server_id=s.id
       WHERE b.user_id=$1 ORDER BY b.created_at DESC`, [req.user.id]
    );
    res.json({ data: r.rows });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/', auditLog('backup.create','backups'), async (req, res) => {
  const { server_id, backup_type } = req.body;
  if (!server_id) return res.status(400).json({ error: 'server_id required' });
  try {
    const filename = `backup_${req.user.id}_${Date.now()}.tar.gz`;
    const r = await pool.query(
      `INSERT INTO backups (user_id,server_id,filename,status,backup_type)
       VALUES ($1,$2,$3,'pending',$4) RETURNING *`,
      [req.user.id, server_id, filename, backup_type || 'full']
    );
    const backupId = r.rows[0].id;
    // Run backup async
    const backupDir = process.env.BACKUP_DIR || '/var/backups/devilpanel';
    execAsync(`mkdir -p ${backupDir} && tar -czf ${backupDir}/${filename} /var/www 2>/dev/null || true`)
      .then(async () => {
        await pool.query(`UPDATE backups SET status='completed' WHERE id=$1`, [backupId]);
      })
      .catch(async () => {
        await pool.query(`UPDATE backups SET status='failed' WHERE id=$1`, [backupId]);
      });
    res.json({ status: 'started', backup_id: backupId });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/:id/restore', auditLog('backup.restore','backups'), async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM backups WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Backup not found' });
    res.json({ status: 'restoring', filename: r.rows[0].filename });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

router.delete('/:id', auditLog('backup.delete','backups'), async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM backups WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Backup not found' });
    const backupDir = process.env.BACKUP_DIR || '/var/backups/devilpanel';
    execAsync(`rm -f ${backupDir}/${r.rows[0].filename}`).catch(() => {});
    await pool.query('DELETE FROM backups WHERE id=$1', [req.params.id]);
    res.json({ message: 'Backup deleted' });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
