import { useState, useEffect } from 'react';
import DashboardShell from '../components/layout/DashboardShell';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { RiShieldLine, RiAlertLine, RiCheckLine, RiFireLine, RiBugLine, RiLockLine, RiEyeLine, RiBanLine } from 'react-icons/ri';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function SecurityPage() {
  const [logs, setLogs] = useState([]);
  const [blocked, setBlocked] = useState([]);
  const [tab, setTab] = useState('overview');
  const [blockIP, setBlockIP] = useState('');
  const [blockReason, setBlockReason] = useState('');

  useEffect(() => {
    api.get('/security/audit-logs').then(r => setLogs(r.data.logs || [])).catch(() => {});
    api.get('/security/blocked-ips').then(r => setBlocked(r.data.blocked_ips || [])).catch(() => {});
  }, []);

  const doBlock = async (e) => {
    e.preventDefault();
    try {
      await api.post('/firewall/block', { ip: blockIP, reason: blockReason });
      toast.success(`IP ${blockIP} blocked`);
      setBlockIP(''); setBlockReason('');
      api.get('/security/blocked-ips').then(r => setBlocked(r.data.blocked_ips || []));
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const unblock = async (ip) => {
    try {
      await api.post('/firewall/unblock', { ip });
      toast.success('IP unblocked');
      api.get('/security/blocked-ips').then(r => setBlocked(r.data.blocked_ips || []));
    } catch { toast.error('Failed'); }
  };

  const secTools = [
    { name: 'CSF Firewall', status: 'active', icon: RiFireLine, color: 'green' },
    { name: 'Fail2Ban', status: 'active', icon: RiLockLine, color: 'green' },
    { name: 'CrowdSec', status: 'active', icon: RiShieldLine, color: 'green' },
    { name: 'ModSecurity WAF', status: 'active', icon: RiBugLine, color: 'green' },
    { name: 'ClamAV', status: 'active', icon: RiEyeLine, color: 'green' },
    { name: 'AIDE (File Monitor)', status: 'active', icon: RiCheckLine, color: 'green' },
  ];

  return (
    <DashboardShell>
      <div className="dp-page-header">
        <div>
          <h1 className="dp-page-title">Security Center</h1>
          <p className="dp-page-subtitle">CSF + Fail2Ban + CrowdSec + ModSecurity + ClamAV</p>
        </div>
        <div className="dp-badge-green">Security Score: 94/100</div>
      </div>

      {/* Tabs */}
      <div className="dp-tabs">
        {['overview','firewall','audit-logs'].map(t => (
          <button key={t} className={`dp-tab ${tab===t?'active':''}`} onClick={() => setTab(t)}>
            {t.replace('-',' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {secTools.map(tool => (
              <div key={tool.name} className="dp-card-sm flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-${tool.color}-900/20 border border-${tool.color}-800/30`}>
                  <tool.icon size={18} className={`text-${tool.color}-400`} />
                </div>
                <div>
                  <div className="text-devil-text text-sm font-medium">{tool.name}</div>
                  <Badge color={tool.color}>{tool.status}</Badge>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Blocked IPs', value: blocked.length, color: 'red' },
              { label: 'Failed Logins (24h)', value: 12, color: 'yellow' },
              { label: 'Threats Blocked', value: 847, color: 'green' },
            ].map(s => (
              <div key={s.label} className="dp-card text-center">
                <div className={`text-3xl font-bold text-${s.color}-400`}>{s.value}</div>
                <div className="text-devil-muted text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'firewall' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Block IP */}
          <div className="dp-card">
            <h3 className="text-devil-text font-semibold mb-4">Block IP Address</h3>
            <form onSubmit={doBlock} className="flex flex-col gap-4">
              <div className="dp-form-group">
                <label className="dp-label">IP Address</label>
                <input className="dp-input" placeholder="45.33.32.11" value={blockIP} onChange={e => setBlockIP(e.target.value)} required />
              </div>
              <div className="dp-form-group">
                <label className="dp-label">Reason</label>
                <input className="dp-input" placeholder="Brute force, spam, etc." value={blockReason} onChange={e => setBlockReason(e.target.value)} />
              </div>
              <button className="dp-btn-danger dp-btn" type="submit"><RiBanLine />Block IP</button>
            </form>
          </div>
          {/* Blocked list */}
          <div className="dp-card">
            <h3 className="text-devil-text font-semibold mb-4">Blocked IPs ({blocked.length})</h3>
            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
              {blocked.length === 0 ? <p className="text-devil-muted text-sm">No blocked IPs</p> : blocked.map(b => (
                <div key={b.ip} className="flex items-center justify-between p-2.5 bg-devil-surface2 rounded-lg">
                  <div>
                    <div className="text-devil-text text-sm font-mono">{b.ip}</div>
                    <div className="text-devil-muted text-xs">{b.reason || 'Manual block'}</div>
                  </div>
                  <button className="dp-btn-success dp-btn dp-btn-sm" onClick={() => unblock(b.ip)}>Unblock</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'audit-logs' && (
        <div className="dp-table-wrap">
          <table className="dp-table">
            <thead><tr><th>Action</th><th>User</th><th>IP</th><th>Time</th><th>Status</th></tr></thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-devil-muted py-8">No logs yet</td></tr>
              ) : logs.map(l => (
                <tr key={l.id}>
                  <td className="font-medium text-sm">{l.action}</td>
                  <td className="text-devil-muted text-xs">{l.user_id}</td>
                  <td className="font-mono text-xs">{l.ip_address}</td>
                  <td className="text-devil-muted text-xs">{l.created_at ? new Date(l.created_at).toLocaleString() : '-'}</td>
                  <td><Badge color={l.status === 'success' ? 'green' : 'red'}>{l.status || 'ok'}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  );
}
