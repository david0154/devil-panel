import { useState } from 'react';
import Layout from '../components/Layout';

export default function Settings() {
  const [tab, setTab] = useState('general');

  return (
    <Layout title="Settings">
      <div className="page-header">
        <div className="page-title">
          <h1>⚙️ Settings</h1>
          <p>Configure Devil Panel preferences and system settings</p>
        </div>
      </div>

      <div className="tabs">
        {['general', 'security', 'email', 'api', 'language'].map(t => (
          <button key={t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'general' && (
        <div className="card">
          <div className="card-header"><span className="card-title">🏠 General Settings</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="form-group"><label>Panel Name</label><input className="form-input" defaultValue="Devil Panel" /></div>
            <div className="form-group"><label>Company Name</label><input className="form-input" defaultValue="Devil One Pvt Ltd" /></div>
            <div className="form-group"><label>Admin Email</label><input className="form-input" defaultValue="admin@devilpanel.com" /></div>
            <div className="form-group"><label>Support URL</label><input className="form-input" defaultValue="https://support.devilpanel.com" /></div>
            <div className="form-group">
              <label>Default Language</label>
              <select className="form-select">
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="bn">বাংলা</option>
                <option value="ta">தமிழ்</option>
                <option value="te">తెలుగు</option>
                <option value="gu">ગુજરાતી</option>
                <option value="kn">ಕನ್ನಡ</option>
                <option value="ml">മലയാളം</option>
                <option value="pa">ਪੰਜਾਬੀ</option>
                <option value="mr">मराठी</option>
              </select>
            </div>
            <div className="form-group">
              <label>Timezone</label>
              <select className="form-select">
                <option>Asia/Kolkata (IST)</option>
                <option>UTC</option>
                <option>Asia/Singapore</option>
              </select>
            </div>
          </div>
          <button className="btn btn-primary btn-md" style={{ marginTop: 8 }}>💾 Save Settings</button>
        </div>
      )}

      {tab === 'security' && (
        <div className="card">
          <div className="card-header"><span className="card-title">🔒 Security Settings</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: 'Two-Factor Authentication (2FA)', enabled: true },
              { label: 'Login attempt limit (5 max)', enabled: true },
              { label: 'Session timeout (30 min)', enabled: true },
              { label: 'IP whitelist for admin access', enabled: false },
              { label: 'Geo-based login restrictions', enabled: false },
              { label: 'Suspicious login alerts via email', enabled: true },
              { label: 'Audit logging (all admin actions)', enabled: true },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <span style={{ fontSize: 14 }}>{s.label}</span>
                <div style={{
                  width: 44, height: 24,
                  background: s.enabled ? '#ff2d2d' : '#1a1a2e',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12, cursor: 'pointer', position: 'relative'
                }}>
                  <div style={{ position: 'absolute', top: 3, left: s.enabled ? 22 : 3, width: 16, height: 16, background: '#fff', borderRadius: '50%', transition: 'left 0.2s' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'api' && (
        <div className="card">
          <div className="card-header"><span className="card-title">🔑 API Tokens</span>
            <button className="btn btn-primary btn-sm">➕ Create Token</button>
          </div>
          <div className="empty-state">
            <div className="empty-icon">🔑</div>
            <div className="empty-title">No API Tokens</div>
            <div className="empty-text">Create API tokens to integrate Devil Panel with your applications</div>
            <button className="btn btn-primary btn-md">➕ Create First Token</button>
          </div>
        </div>
      )}

      {tab === 'language' && (
        <div className="card">
          <div className="card-header"><span className="card-title">🌍 Multi-Language</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {[
              { code: 'en', name: 'English',    native: 'English',    progress: 100 },
              { code: 'hi', name: 'Hindi',      native: 'हिन्दी',      progress: 80 },
              { code: 'bn', name: 'Bengali',    native: 'বাংলা',       progress: 60 },
              { code: 'ta', name: 'Tamil',      native: 'தமிழ்',       progress: 55 },
              { code: 'te', name: 'Telugu',     native: 'తెలుగు',      progress: 50 },
              { code: 'gu', name: 'Gujarati',   native: 'ગુજરાતી',     progress: 40 },
              { code: 'kn', name: 'Kannada',    native: 'ಕನ್ನಡ',       progress: 35 },
              { code: 'ml', name: 'Malayalam',  native: 'മലയാളം',      progress: 30 },
              { code: 'pa', name: 'Punjabi',    native: 'ਪੰਜਾਬੀ',      progress: 25 },
              { code: 'mr', name: 'Marathi',    native: 'मराठी',       progress: 45 },
            ].map((lang) => (
              <div key={lang.code} className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{lang.native}</div>
                    <div style={{ fontSize: 11, color: '#555577' }}>{lang.name}</div>
                  </div>
                  <span style={{ fontSize: 12, color: '#9999b8' }}>{lang.progress}%</span>
                </div>
                <div className="progress"><div className="progress-bar" style={{ width: `${lang.progress}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
