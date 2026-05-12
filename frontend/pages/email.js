import { useState, useEffect } from 'react';
import DashboardShell from '../components/layout/DashboardShell';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { RiMailLine, RiAddLine, RiDeleteBin2Line, RiSettings3Line, RiSendPlaneLine } from 'react-icons/ri';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function EmailPage() {
  const [accounts, setAccounts] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [delTarget, setDelTarget] = useState(null);
  const [form, setForm] = useState({ username: '', domain: '', password: '', quota: 1024 });

  const load = () => api.get('/email').then(r => setAccounts(r.data.accounts || [])).catch(() => {});
  useEffect(load, []);

  const addAccount = async (e) => {
    e.preventDefault();
    try {
      await api.post('/email', form);
      toast.success('Email account created!');
      setAddOpen(false);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  return (
    <DashboardShell>
      <div className="dp-page-header">
        <div>
          <h1 className="dp-page-title">Email Hosting</h1>
          <p className="dp-page-subtitle">Manage email accounts with Postfix + Dovecot</p>
        </div>
        <button className="dp-btn-primary dp-btn" onClick={() => setAddOpen(true)}><RiAddLine />Add Account</button>
      </div>

      {/* Stack info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[['SMTP','Postfix','green'],['IMAP','Dovecot','blue'],['Spam Filter','Rspamd','yellow'],['Antivirus','ClamAV','purple']].map(([label, tool, color]) => (
          <div key={label} className="dp-card-sm">
            <div className={`dp-badge-${color} mb-2`}>{tool}</div>
            <div className="text-devil-muted text-xs">{label}</div>
          </div>
        ))}
      </div>

      <div className="dp-table-wrap">
        {accounts.length === 0 ? (
          <EmptyState icon={RiMailLine} title="No email accounts" description="Create email accounts for your domains"
            action={<button className="dp-btn-primary dp-btn" onClick={() => setAddOpen(true)}><RiAddLine />Add Account</button>} />
        ) : (
          <table className="dp-table">
            <thead><tr><th>Email Address</th><th>Quota</th><th>Used</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {accounts.map(a => (
                <tr key={a.id}>
                  <td className="font-medium"><div className="flex items-center gap-2"><RiMailLine className="text-devil-muted" />{a.username}@{a.domain}</div></td>
                  <td className="text-devil-muted text-xs">{a.quota}MB</td>
                  <td className="text-devil-muted text-xs">{a.used || 0}MB</td>
                  <td><Badge color="green">Active</Badge></td>
                  <td>
                    <div className="flex gap-1">
                      <button className="dp-btn-ghost dp-btn dp-btn-sm" title="Webmail"><RiSendPlaneLine size={14} /></button>
                      <button className="dp-btn-ghost dp-btn dp-btn-sm" title="Settings"><RiSettings3Line size={14} /></button>
                      <button className="dp-btn-danger dp-btn dp-btn-sm" onClick={() => setDelTarget(a.id)}><RiDeleteBin2Line size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Email Account"
        footer={<><button className="dp-btn-secondary dp-btn" onClick={() => setAddOpen(false)}>Cancel</button><button className="dp-btn-primary dp-btn" form="email-form" type="submit">Create</button></>}>
        <form id="email-form" onSubmit={addAccount} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="dp-form-group">
              <label className="dp-label">Username</label>
              <input className="dp-input" placeholder="info" value={form.username} onChange={e => setForm({...form, username: e.target.value})} required />
            </div>
            <div className="dp-form-group">
              <label className="dp-label">Domain</label>
              <input className="dp-input" placeholder="example.com" value={form.domain} onChange={e => setForm({...form, domain: e.target.value})} required />
            </div>
          </div>
          <div className="dp-form-group">
            <label className="dp-label">Password</label>
            <input type="password" className="dp-input" placeholder="Strong password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          </div>
          <div className="dp-form-group">
            <label className="dp-label">Quota (MB)</label>
            <input type="number" className="dp-input" value={form.quota} onChange={e => setForm({...form, quota: +e.target.value})} />
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!delTarget} onClose={() => setDelTarget(null)} onConfirm={() => { api.delete(`/email/${delTarget}`).then(() => { toast.success('Deleted'); load(); }); }}
        title="Delete Email Account" message="This will permanently delete the email account and all its messages." confirmText="Delete" />
    </DashboardShell>
  );
}
