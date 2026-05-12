const router = require('express').Router();
const { exec } = require('child_process');
const util   = require('util');
const { pool } = require('../db');
const { authenticate, auditLog } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimit');

const execAsync = util.promisify(exec);
router.use(authenticate, apiLimiter);

router.get('/', async (req, res) => {
  try {
    const r = await pool.query(`SELECT * FROM wordpress_installs WHERE user_id=$1 ORDER BY created_at DESC`, [req.user.id]);
    res.json({ data: r.rows });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/install', auditLog('wordpress.install','wordpress'), async (req, res) => {
  const { domain_id, site_url, admin_user, admin_email, admin_password, db_name } = req.body;
  if (!domain_id || !site_url || !admin_user || !admin_email || !admin_password)
    return res.status(400).json({ error: 'domain_id, site_url, admin_user, admin_email, admin_password required' });
  try {
    const r = await pool.query(
      `INSERT INTO wordpress_installs (user_id,domain_id,site_url,admin_user,db_name,status)
       VALUES ($1,$2,$3,$4,$5,'installing') RETURNING *`,
      [req.user.id, domain_id, site_url, admin_user, db_name || `wp_${admin_user}`]
    );
    const wpId = r.rows[0].id;
    // WP-CLI install async
    const docRoot = `/var/www/${site_url.replace(/https?:\/\//, '')}`;
    execAsync(
      `mkdir -p ${docRoot} && \
       wp core download --path=${docRoot} --allow-root && \
       wp config create --path=${docRoot} --dbname=${db_name || 'wordpress'} --dbuser=devilpanel --dbpass=${process.env.DB_PASSWORD} --allow-root && \
       wp core install --path=${docRoot} --url=${site_url} --title="My Site" --admin_user=${admin_user} --admin_email=${admin_email} --admin_password=${admin_password} --allow-root`
    ).then(async () => {
      await pool.query(`UPDATE wordpress_installs SET status='installed', wp_version='latest' WHERE id=$1`, [wpId]);
    }).catch(async (e) => {
      await pool.query(`UPDATE wordpress_installs SET status='failed' WHERE id=$1`, [wpId]);
    });
    res.json({ status: 'installing', wp_id: wpId });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/:id/update', auditLog('wordpress.update','wordpress'), async (req, res) => {
  res.json({ status: 'updating' });
});

router.post('/:id/backup', auditLog('wordpress.backup','wordpress'), async (req, res) => {
  res.json({ status: 'backup_started' });
});

router.get('/:id/plugins', async (req, res) => {
  res.json({ data: [], message: 'Use WP-CLI to list plugins' });
});

module.exports = router;
