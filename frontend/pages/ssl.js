import { useState, useEffect } from 'react';
import DashboardShell from '../components/layout/DashboardShell';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { RiShieldKeyholeLine, RiAddLine, RiRefreshLine, RiDeleteBin2Line, RiCheckLine, RiTimeLine } from 'react-icons/ri';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function SSLPage() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [issueOpen, setIssueOpen] = useState(false);
  const [form, setForm] = useState({ domain: '', type: 'standard' });
  const [issuing, setIssuing] = useState(false);

  const load = () => {
    api.get('/ssl').then(r => setCerts(r.data.certificates || [])).catch(() => setCerts([])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const issueCert = async (e) => {
    e.preventDefault();
    setIssuing(true);
    try {
      await api.post('/ssl/issue', form);
      toast.success('SSL certificate issued via Let\'s Encrypt!');
      setIssueOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to issue SSL');
    } finally { setIssuing(false); }
  };

  const renew = async (id) => {
    try {
      await api.post(`/ssl/${id}/renew`);
      toast.success('Certificate renewed!');
      load();
    } catch { toast.error('Renewal failed'); }
  };

  const daysLeft = (exp) => {
    if (!exp) return 0;
    return Math.max(0, Math.floor((new Date(exp) - new Date()) / (1000 * 60 * 60 * 24)));
  };

  return (
    <DashboardShell>
      <div className="dp-page-header">
        <div>
          <h1 className="dp-page-title">SSL Certificates</h1>
          <p className="dp-page-subtitle">Free Let's Encrypt SSL with auto-renewal</p>
        </div>
        <button className="dp-btn-primary dp-btn" onClick={() => setIssueOpen(true)}>
          <RiAddLine /> Issue SSL
        </button>
      </div>

      {/* Info banner */}
      <div className="dp-alert-info mb-6">
        <RiShieldKeyholeLine size={18} />
        <span>SSL certificates are issued via <strong>Let's Encrypt (Certbot)</strong> and auto-renewed 30 days before expiry.</span>
      </div>

      <div className="dp-table-wrap">
        {loading ? <div className="p-12 text-center text-devil-muted">Loading...</div>
        : certs.length === 0 ? (
          <EmptyState icon={RiShieldKeyholeLine} title="No SSL certificates" description="Issue your first free SSL certificate" action={
            <button className="dp-btn-primary dp-btn" onClick={() => setIssueOpen(true)}><RiAddLine />Issue SSL</button>
          } />
        ) : (
          <table className="dp-table">
            <thead><tr><th>Domain</th><th>Type</th><th>Issuer</th><th>Expires</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {certs.map(c => {
                const days = daysLeft(c.expires_at);
                return (
                  <tr key={c.id}>
                    <td className="font-medium">{c.domain}</td>
                    <td><Badge color="blue">{c.type || 'Standard'}</Badge></td>
                    <td className="text-devil-muted text-xs">Let's Encrypt</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <RiTimeLine size={14} className={days < 30 ? 'text-yellow-400' : 'text-green-400'} />
                        <span className={`text-xs ${days < 30 ? 'text-yellow-400' : 'text-devil-muted'}`}>{days} days</span>
                      </div>
                    </td>
                    <td>{c.status === 'active' ? <Badge color="green">Active</Badge> : <Badge color="yellow">Pending</Badge>}</td>
                    <td>
                      <div className="flex gap-1">
                        <button className="dp-btn-success dp-btn dp-btn-sm" onClick={() => renew(c.id)} title="Renew">
                          <RiRefreshLine size={13} />
                        </button>
                        <button className="dp-btn-danger dp-btn dp-btn-sm" title="Revoke">
                          <RiDeleteBin2Line size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={issueOpen} onClose={() => setIssueOpen(false)} title="Issue SSL Certificate"
        footer={<><button className="dp-btn-secondary dp-btn" onClick={() => setIssueOpen(false)}>Cancel</button><button className="dp-btn-primary dp-btn" form="ssl-form" type="submit" disabled={issuing}>{issuing ? 'Issuing...' : 'Issue Certificate'}</button></>}>
        <form id="ssl-form" onSubmit={issueCert} className="flex flex-col gap-4">
          <div className="dp-form-group">
            <label className="dp-label">Domain</label>
            <input className="dp-input" placeholder="example.com" value={form.domain} onChange={e => setForm({...form, domain: e.target.value})} required />
          </div>
          <div className="dp-form-group">
            <label className="dp-label">Certificate Type</label>
            <select className="dp-select" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
              <option value="standard">Standard (Single Domain)</option>
              <option value="wildcard">Wildcard (*.domain.com)</option>
            </select>
          </div>
          <div className="dp-alert-info">
            <RiCheckLine size={16} />
            <span className="text-xs">DNS must be pointed to this server before issuing. Auto-renewal enabled.</span>
          </div>
        </form>
      </Modal>
    </DashboardShell>
  );
}
