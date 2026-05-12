const router = require('express').Router();
const { pool } = require('../db');
const { authenticate, adminOnly, auditLog } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimit');

router.use(authenticate, apiLimiter);

router.get('/plans', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM billing_plans WHERE is_active=true ORDER BY price');
    res.json({ data: r.rows });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

router.get('/invoices', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT i.*,p.name as plan_name FROM invoices i
       LEFT JOIN billing_plans p ON i.plan_id=p.id
       WHERE i.user_id=$1 ORDER BY i.created_at DESC`, [req.user.id]
    );
    res.json({ data: r.rows });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/pay', auditLog('billing.pay','billing'), async (req, res) => {
  const { invoice_id, payment_method } = req.body;
  if (!invoice_id) return res.status(400).json({ error: 'invoice_id required' });
  try {
    const inv = await pool.query('SELECT * FROM invoices WHERE id=$1 AND user_id=$2', [invoice_id, req.user.id]);
    if (!inv.rows.length) return res.status(404).json({ error: 'Invoice not found' });
    if (inv.rows[0].status === 'paid') return res.status(400).json({ error: 'Already paid' });
    // Payment gateway integration placeholder (Stripe/Razorpay)
    await pool.query(`UPDATE invoices SET status='paid', paid_at=NOW() WHERE id=$1`, [invoice_id]);
    res.json({ status: 'payment_initiated', invoice_id });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// Admin: create plan
router.post('/plans', adminOnly, auditLog('billing.plan.create','billing'), async (req, res) => {
  const { name, price, billing_cycle, features } = req.body;
  if (!name || !price) return res.status(400).json({ error: 'name and price required' });
  try {
    const r = await pool.query(
      `INSERT INTO billing_plans (name,price,billing_cycle,features) VALUES ($1,$2,$3,$4) RETURNING *`,
      [name, price, billing_cycle || 'monthly', JSON.stringify(features || {})]
    );
    res.status(201).json({ data: r.rows[0] });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
