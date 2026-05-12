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
    const r = await pool.query(
      `SELECT sc.*, d.domain as domain_name FROM ssl_certificates sc
       JOIN domains d ON sc.domain_id=d.id WHERE d.user_id=$1`, [req.user.id]
    );
    res.json({ data: r.rows });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/issue', auditLog('ssl.issue','ssl'), async (req, res) => {
  const { domain_id, domain } = req.body;
  if (!domain) return res.status(400).json({ error: 'Domain required' });
  try {
    // Issue Let's Encrypt cert via certbot
    execAsync(`certbot certonly --webroot -w /var/www/${domain} -d ${domain} --non-interactive --agree-tos --email admin@${domain}`)
      .then(async () => {
        const exp = new Date(Date.now() + 90 * 24 * 3600000);
        await pool.query(
          `INSERT INTO ssl_certificates (domain_id,domain,issuer,expires_at) VALUES ($1,$2,'Let\'s Encrypt',$3)
           ON CONFLICT DO NOTHING`,
          [domain_id, domain, exp]
        );
      }).catch(() => {});
    res.json({ status: 'issuing', message: 'Certificate request submitted' });
  } catch (e) { res.status(500).json({ error: 'SSL issue failed' }); }
});

router.post('/renew/:id', auditLog('ssl.renew','ssl'), async (req, res) => {
  try {
    const cert = await pool.query('SELECT * FROM ssl_certificates WHERE id=$1', [req.params.id]);
    if (!cert.rows.length) return res.status(404).json({ error: 'Certificate not found' });
    execAsync(`certbot renew --cert-name ${cert.rows[0].domain} --non-interactive`).catch(() => {});
    res.json({ status: 'renewing' });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

router.delete('/:id', auditLog('ssl.delete','ssl'), async (req, res) => {
  try {
    await pool.query('DELETE FROM ssl_certificates WHERE id=$1', [req.params.id]);
    res.json({ message: 'Certificate deleted' });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/:id/force-https', auditLog('ssl.force_https','ssl'), async (req, res) => {
  try {
    await pool.query('UPDATE ssl_certificates SET force_https=true WHERE id=$1', [req.params.id]);
    res.json({ message: 'Force HTTPS enabled' });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
