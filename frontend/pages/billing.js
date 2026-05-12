import { useState } from 'react';
import Layout from '../components/Layout';

const INVOICES = [
  { id: 'INV-001', client: 'Raj Sharma', plan: 'Pro Hosting', amount: '₹2,499', status: 'paid',    date: '2026-05-01' },
  { id: 'INV-002', client: 'Priya Patel', plan: 'VPS Basic',  amount: '₹999',   status: 'pending', date: '2026-05-05' },
  { id: 'INV-003', client: 'Amit Singh',  plan: 'Reseller Pro', amount: '₹4,999', status: 'paid',    date: '2026-04-28' },
  { id: 'INV-004', client: 'Sneha Joshi', plan: 'Starter',    amount: '₹499',   status: 'overdue', date: '2026-04-15' },
];

const PLANS = [
  { name: 'Starter',    price: '₹499',   features: ['1 Website', '5 GB SSD', '10 GB BW', 'Free SSL'], popular: false },
  { name: 'Pro',        price: '₹2,499', features: ['Unlimited Websites', '100 GB NVMe', '1 TB BW', 'Free SSL', 'Daily Backup'], popular: true },
  { name: 'Enterprise', price: '₹7,999', features: ['Unlimited Everything', '500 GB NVMe', 'Unmetered BW', 'Dedicated IP', '24/7 Support', 'AI Assistant'], popular: false },
];

export default function Billing() {
  const [tab, setTab] = useState('invoices');

  return (
    <Layout title="Billing">
      <div className="page-header">
        <div className="page-title">
          <h1>💳 Billing &amp; Payments</h1>
          <p>Manage invoices, plans and payment gateways</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-md">➕ Create Invoice</button>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { icon: '💰', value: '₹45,820', label: 'Monthly Revenue' },
          { icon: '📋', value: '24',     label: 'Active Plans' },
          { icon: '⏳', value: '3',        label: 'Pending Invoices' },
          { icon: '⚠️', value: '1',         label: 'Overdue' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="tabs">
        {['invoices', 'plans', 'gateways', 'automation'].map(t => (
          <button key={t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'invoices' && (
        <div className="card" style={{ padding: 0 }}>
          <div className="dp-table-wrap">
            <table className="dp-table">
              <thead>
                <tr><th>Invoice #</th><th>Client</th><th>Plan</th><th>Amount</th><th>Date</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {INVOICES.map(inv => (
                  <tr key={inv.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{inv.id}</td>
                    <td>{inv.client}</td>
                    <td><span className="badge-muted">{inv.plan}</span></td>
                    <td style={{ fontWeight: 700, color: '#00e676' }}>{inv.amount}</td>
                    <td style={{ color: '#9999b8', fontSize: 12 }}>{inv.date}</td>
                    <td>
                      <span className={`badge-${ inv.status === 'paid' ? 'success' : inv.status === 'pending' ? 'warning' : 'danger' }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm">👁️ View</button>
                        <button className="btn btn-ghost btn-sm">📧 Send</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'plans' && (
        <div className="content-grid cols-3">
          {PLANS.map((p, i) => (
            <div key={i} className="card" style={{
              animationDelay: `${i * 100}ms`,
              border: p.popular ? '1px solid rgba(255,45,45,0.4)' : undefined,
              position: 'relative', overflow: 'hidden'
            }}>
              {p.popular && (
                <div style={{
                  position: 'absolute', top: 12, right: -24, background: '#ff2d2d',
                  color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 32px',
                  transform: 'rotate(45deg)'
                }}>POPULAR</div>
              )}
              <div className="card-header">
                <span className="card-title">{p.name}</span>
                <span style={{ color: '#ff2d2d', fontWeight: 800, fontSize: 22 }}>{p.price}<small style={{ fontSize: 12, fontWeight: 400 }}>/mo</small></span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {p.features.map((f, j) => (
                  <li key={j} style={{ fontSize: 13, color: '#9999b8', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#00e676' }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <button className="btn btn-primary btn-md" style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}>
                Edit Plan
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'gateways' && (
        <div className="content-grid cols-auto">
          {[
            { name: 'Razorpay', icon: '🇮🇳', status: 'active',   desc: 'Indian payment gateway — UPI, Cards, NetBanking' },
            { name: 'Stripe',   icon: '💳', status: 'active',   desc: 'International cards — USD, EUR, INR' },
            { name: 'PayPal',   icon: '💸', status: 'inactive', desc: 'PayPal global payments' },
            { name: 'UPI',      icon: '🇮🇳', status: 'active',   desc: 'Direct UPI payments — GPay, PhonePe, Paytm' },
            { name: 'Crypto',   icon: '₿',  status: 'inactive', desc: 'BTC, ETH, USDT payments via CoinGate' },
          ].map((g, i) => (
            <div key={i} className="card clickable">
              <div className="card-header">
                <span className="card-title">{g.icon} {g.name}</span>
                <span className={`badge-${g.status === 'active' ? 'success' : 'muted'}`}>{g.status}</span>
              </div>
              <p style={{ fontSize: 13, color: '#9999b8', marginBottom: 16 }}>{g.desc}</p>
              <button className="btn btn-ghost btn-sm">⚙️ Configure</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'automation' && (
        <div className="card">
          <div className="card-header"><span className="card-title">🤖 Billing Automation</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: 'Auto suspend on non-payment', enabled: true },
              { label: 'Auto renewal invoices', enabled: true },
              { label: 'Send invoice email on creation', enabled: true },
              { label: 'Failed payment alert to admin', enabled: true },
              { label: 'WHMCS sync integration', enabled: false },
              { label: 'Blesta sync integration', enabled: false },
            ].map((rule, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <span style={{ fontSize: 14 }}>{rule.label}</span>
                <div style={{
                  width: 44, height: 24, background: rule.enabled ? '#ff2d2d' : '#1a1a2e',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
                  cursor: 'pointer', position: 'relative', transition: 'all 0.2s'
                }}>
                  <div style={{
                    position: 'absolute', top: 3,
                    left: rule.enabled ? 22 : 3,
                    width: 16, height: 16, background: '#fff',
                    borderRadius: '50%', transition: 'left 0.2s'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
