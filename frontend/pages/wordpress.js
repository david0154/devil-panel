import { useState } from 'react';
import Layout from '../components/Layout';

const WP_SITES = [
  { id: 1, domain: 'myblog.com',    version: '6.5.2', plugins: 14, themes: 3, status: 'online',  updates: 2, size: '2.1 GB' },
  { id: 2, domain: 'shop.mysite.com', version: '6.4.3', plugins: 28, themes: 5, status: 'online',  updates: 0, size: '4.8 GB' },
  { id: 3, domain: 'staging.dev',  version: '6.5.2', plugins: 14, themes: 3, status: 'offline', updates: 0, size: '1.2 GB' },
];

export default function WordPress() {
  const [tab, setTab] = useState('sites');
  const [showInstall, setShowInstall] = useState(false);

  return (
    <Layout title="WordPress">
      <div className="page-header">
        <div className="page-title">
          <h1>📝 WordPress Manager</h1>
          <p>One-click install, update, stage &amp; secure WordPress sites</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-md" onClick={() => setShowInstall(true)}>
            ➕ Install WordPress
          </button>
        </div>
      </div>

      <div className="tabs">
        {['sites', 'plugins', 'themes', 'staging'].map(t => (
          <button key={t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'sites' && (
        <div className="content-grid cols-auto">
          {WP_SITES.map((site, i) => (
            <div key={site.id} className="card clickable" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="card-header">
                <span className="card-title">📝 {site.domain}</span>
                <span className={`badge-${site.status === 'online' ? 'success' : 'danger'}`}>{site.status}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9999b8' }}>WP Version</span>
                  <span style={{ fontFamily: 'monospace' }}>v{site.version}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9999b8' }}>Plugins</span>
                  <span>{site.plugins} {site.updates > 0 && <span style={{ color: '#ffab00', fontSize: 11 }}>({site.updates} updates)</span>}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9999b8' }}>Disk Size</span>
                  <span>{site.size}</span>
                </div>
              </div>
              <div style={{ marginTop: 16, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button className="btn btn-primary btn-sm">💻 WP Admin</button>
                <button className="btn btn-ghost btn-sm">🔄 Update All</button>
                <button className="btn btn-ghost btn-sm">💾 Backup</button>
                <button className="btn btn-ghost btn-sm">🧪 Stage</button>
                <button className="btn btn-danger btn-sm">🔒 Harden</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'staging' && (
        <div className="card">
          <div className="card-header"><span className="card-title">🧪 Staging Environments</span></div>
          <p style={{ color: '#9999b8', marginBottom: 20 }}>
            Create isolated staging copies to test changes before pushing to production.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {WP_SITES.filter(s => s.status === 'online').map(s => (
              <div key={s.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: 16, background: '#0f0f1a', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)'
              }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{s.domain}</div>
                  <div style={{ fontSize: 12, color: '#555577' }}>No active staging environment</div>
                </div>
                <button className="btn btn-primary btn-sm">🧪 Create Staging</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showInstall && (
        <div className="modal-overlay" onClick={() => setShowInstall(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📝 Install WordPress</h2>
              <button className="modal-close" onClick={() => setShowInstall(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Domain</label>
                <select className="form-select"><option>myblog.com</option><option>shop.com</option></select>
              </div>
              <div className="form-group">
                <label>Install Path</label>
                <input className="form-input" defaultValue="/" placeholder="/ or /blog" />
              </div>
              <div className="form-group">
                <label>Admin Username</label>
                <input className="form-input" defaultValue="admin" />
              </div>
              <div className="form-group">
                <label>Admin Email</label>
                <input className="form-input" placeholder="admin@domain.com" />
              </div>
              <div className="form-group">
                <label>Site Title</label>
                <input className="form-input" placeholder="My WordPress Site" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost btn-md" onClick={() => setShowInstall(false)}>Cancel</button>
              <button className="btn btn-primary btn-md">🚀 Install Now</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
