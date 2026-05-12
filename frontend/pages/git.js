import { useState } from 'react';
import Layout from '../components/Layout';

const REPOS = [
  { id: 1, name: 'my-website',     url: 'github.com/user/my-website',     branch: 'main',    status: 'deployed', lastDeploy: '2 hours ago',  site: 'mysite.com' },
  { id: 2, name: 'shop-backend',   url: 'github.com/user/shop-backend',   branch: 'develop', status: 'pending',  lastDeploy: '1 day ago',    site: 'shop.com' },
  { id: 3, name: 'portfolio-site', url: 'github.com/user/portfolio-site', branch: 'main',    status: 'failed',   lastDeploy: '3 days ago',   site: 'portfolio.dev' },
];

export default function Git() {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <Layout title="Git Deploy">
      <div className="page-header">
        <div className="page-title">
          <h1>📦 Git Deployment</h1>
          <p>Auto-deploy from GitHub, GitLab &amp; Bitbucket</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-md" onClick={() => setShowAdd(true)}>
            ➕ Connect Repository
          </button>
        </div>
      </div>

      {/* Providers */}
      <div className="content-grid cols-3" style={{ marginBottom: 24 }}>
        {[
          { name: 'GitHub',    icon: '🐙', status: 'Connected', color: '#00e676' },
          { name: 'GitLab',   icon: '🦊', status: 'Connect', color: '#9999b8' },
          { name: 'Bitbucket',icon: '🚢', status: 'Connect', color: '#9999b8' },
        ].map((p, i) => (
          <div key={i} className="card clickable" style={{ animationDelay: `${i * 80}ms` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 28 }}>{p.icon}</span>
              <div>
                <div style={{ fontWeight: 600 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: p.color }}>{p.status}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Repos table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="card-header" style={{ padding: '16px 20px' }}>
          <span className="card-title">📋 Deployment Repositories</span>
        </div>
        <div className="dp-table-wrap">
          <table className="dp-table">
            <thead>
              <tr><th>Repository</th><th>Website</th><th>Branch</th><th>Status</th><th>Last Deploy</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {REPOS.map(r => (
                <tr key={r.id}>
                  <td>
                    <div>
                      <div style={{ fontWeight: 600 }}>{r.name}</div>
                      <div style={{ fontSize: 11, color: '#555577', fontFamily: 'monospace' }}>{r.url}</div>
                    </div>
                  </td>
                  <td style={{ color: '#40c4ff', fontSize: 13 }}>{r.site}</td>
                  <td><code style={{ background: '#1a1a2e', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>{r.branch}</code></td>
                  <td>
                    <span className={`badge-${r.status === 'deployed' ? 'success' : r.status === 'pending' ? 'warning' : 'danger'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td style={{ color: '#9999b8', fontSize: 12 }}>{r.lastDeploy}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-primary btn-sm">🚀 Deploy</button>
                      <button className="btn btn-ghost btn-sm">📜 Logs</button>
                      <button className="btn btn-ghost btn-sm">⚙️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📦 Connect Repository</h2>
              <button className="modal-close" onClick={() => setShowAdd(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Git Provider</label>
                <select className="form-select">
                  <option>GitHub</option><option>GitLab</option><option>Bitbucket</option>
                </select>
              </div>
              <div className="form-group">
                <label>Repository URL</label>
                <input className="form-input" placeholder="https://github.com/user/repo" />
              </div>
              <div className="form-group">
                <label>Branch</label>
                <input className="form-input" defaultValue="main" />
              </div>
              <div className="form-group">
                <label>Deploy to Website</label>
                <select className="form-select">
                  <option>mysite.com</option><option>shop.com</option>
                </select>
              </div>
              <div className="form-group">
                <label>Deploy Path</label>
                <input className="form-input" defaultValue="/home/user/public_html" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost btn-md" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn btn-primary btn-md">🔗 Connect &amp; Deploy</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
