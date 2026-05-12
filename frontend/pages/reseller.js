import { useState } from 'react';
import Layout from '../components/Layout';

const MOCK_RESELLERS = [
  { id: 1, name: 'HostIndia Pvt Ltd', accounts: 45, disk: '120 GB', bw: '500 GB', status: 'active', plan: 'Pro', revenue: '₹24,500' },
  { id: 2, name: 'WebSpace Solutions', accounts: 12, disk: '40 GB',  bw: '100 GB', status: 'active', plan: 'Starter', revenue: '₹6,200' },
  { id: 3, name: 'CloudHost Agency',   accounts: 89, disk: '450 GB', bw: '2 TB',   status: 'suspended', plan: 'Enterprise', revenue: '₹0' },
];

const PLANS = [
  { name: 'Starter',    accounts: 10,  disk: '50 GB',   bw: '200 GB', price: '₹999/mo' },
  { name: 'Pro',        accounts: 50,  disk: '200 GB',  bw: '1 TB',   price: '₹2,499/mo' },
  { name: 'Enterprise', accounts: 999, disk: '1 TB',    bw: 'Unlimited', price: '₹7,999/mo' },
];

export default function Reseller() {
  const [tab, setTab] = useState('accounts');
  const [showCreate, setShowCreate] = useState(false);

  return (
    <Layout title="Reseller">
      <div className="page-header">
        <div className="page-title">
          <h1>🏬 Reseller System</h1>
          <p>WHM-style reseller management &amp; white-label hosting</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-md" onClick={() => setShowCreate(true)}>
            ➕ New Reseller
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { icon: '🏬', value: '3', label: 'Resellers' },
          { icon: '👥', value: '146', label: 'Total Accounts' },
          { icon: '💰', value: '₹30,700', label: 'Monthly Revenue' },
          { icon: '📊', value: '610 GB', label: 'Disk Used' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['accounts', 'plans', 'branding'].map(t => (
          <button key={t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'accounts' && (
        <div className="card" style={{ padding: 0 }}>
          <div className="dp-table-wrap">
            <table className="dp-table">
              <thead>
                <tr>
                  <th>Reseller</th><th>Plan</th><th>Accounts</th>
                  <th>Disk</th><th>Bandwidth</th><th>Revenue</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_RESELLERS.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.name}</td>
                    <td><span className="badge-muted">{r.plan}</span></td>
                    <td>{r.accounts}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.disk}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.bw}</td>
                    <td style={{ color: '#00e676', fontWeight: 600 }}>{r.revenue}</td>
                    <td>
                      <span className={`badge-${r.status === 'active' ? 'success' : 'danger'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm">✏️ Edit</button>
                        <button className={`btn btn-sm btn-${r.status === 'active' ? 'warning' : 'success'}`}>
                          {r.status === 'active' ? '🚫 Suspend' : '▶️ Activate'}
                        </button>
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
            <div key={i} className="card clickable" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="card-header">
                <span className="card-title">{p.name}</span>
                <span style={{ color: '#ff2d2d', fontWeight: 700, fontSize: 18 }}>{p.price}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9999b8' }}>Accounts</span>
                  <span style={{ fontWeight: 600 }}>{p.accounts === 999 ? 'Unlimited' : p.accounts}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9999b8' }}>Disk Space</span>
                  <span style={{ fontWeight: 600 }}>{p.disk}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9999b8' }}>Bandwidth</span>
                  <span style={{ fontWeight: 600 }}>{p.bw}</span>
                </div>
              </div>
              <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-sm">✏️ Edit</button>
                <button className="btn btn-primary btn-sm">Assign</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'branding' && (
        <div className="card">
          <div className="card-header"><span className="card-title">🎨 White-Label Branding</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="form-group">
              <label>Panel Brand Name</label>
              <input className="form-input" defaultValue="My Hosting Panel" />
            </div>
            <div className="form-group">
              <label>Support Email</label>
              <input className="form-input" defaultValue="support@myhost.com" />
            </div>
            <div className="form-group">
              <label>Logo URL</label>
              <input className="form-input" placeholder="https://myhost.com/logo.png" />
            </div>
            <div className="form-group">
              <label>Primary Color</label>
              <input className="form-input" defaultValue="#ff2d2d" />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label>Custom CSS</label>
              <textarea className="form-textarea" placeholder="/* Custom styles for white-label panel */" />
            </div>
          </div>
          <button className="btn btn-primary btn-md" style={{ marginTop: 16 }}>💾 Save Branding</button>
        </div>
      )}
    </Layout>
  );
}
