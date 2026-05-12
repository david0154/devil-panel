import { useState, useEffect } from 'react';
import DashboardShell from '../components/layout/DashboardShell';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import { RiGlobalLine, RiAddLine, RiDeleteBin2Line, RiSettings3Line, RiRefreshLine, RiShieldKeyholeLine, RiCodeSSlashLine } from 'react-icons/ri';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function Websites() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [delTarget, setDelTarget] = useState(null);
  const [form, setForm] = useState({ domain: '', php_version: '8.2', type: 'wordpress' });

  const load = () => {
    setLoading(true);
    api.get('/domains').then(r => setSites(r.data.domains || [])).catch(() => setSites([])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/domains', form);
      toast.success('Website created!');
      setAddOpen(false);
      setForm({ domain: '', php_version: '8.2', type: 'wordpress' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create website');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/domains/${id}`);
      toast.success('Website removed');
      load();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <DashboardShell>
      <div className="dp-page-header">
        <div>
          <h1 className="dp-page-title">Websites</h1>
          <p className="dp-page-subtitle">Manage all your hosted websites and domains</p>
        </div>
        <button className="dp-btn-primary dp-btn" onClick={() => setAddOpen(true)}>
          <RiAddLine size={18} /> Add Website
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Sites', value: sites.length },
          { label: 'Active', value: sites.filter(s => s.status === 'active').length },
          { label: 'SSL Secured', value: sites.filter(s => s.ssl_enabled).length },
        ].map(s => (
          <div key={s.label} className="dp-card-sm text-center">
            <div className="text-2xl font-bold text-devil-text">{s.value}</div>
            <div className="text-devil-muted text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="dp-table-wrap">
        {loading ? (
          <div className="p-12 text-center text-devil-muted">Loading...</div>
        ) : sites.length === 0 ? (
          <EmptyState icon={RiGlobalLine} title="No websites yet" description="Create your first website to get started" action={
            <button className="dp-btn-primary dp-btn" onClick={() => setAddOpen(true)}><RiAddLine />Add Website</button>
          } />
        ) : (
          <table className="dp-table">
            <thead>
              <tr>
                <th>Domain</th><th>Type</th><th>PHP</th><th>SSL</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sites.map(s => (
                <tr key={s.id}>
                  <td className="font-medium">
                    <div className="flex items-center gap-2">
                      <RiGlobalLine className="text-devil-muted" />{s.domain}
                    </div>
                  </td>
                  <td><Badge color="blue">{s.type || 'html'}</Badge></td>
                  <td><code className="dp-code">PHP {s.php_version || '8.2'}</code></td>
                  <td>{s.ssl_enabled ? <Badge color="green">SSL ON</Badge> : <Badge color="gray">No SSL</Badge>}</td>
                  <td>{s.status === 'active' ? <Badge color="green">Active</Badge> : <Badge color="red">Inactive</Badge>}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button className="dp-btn-ghost dp-btn dp-btn-sm" title="SSL"><RiShieldKeyholeLine size={15} /></button>
                      <button className="dp-btn-ghost dp-btn dp-btn-sm" title="Files"><RiCodeSSlashLine size={15} /></button>
                      <button className="dp-btn-ghost dp-btn dp-btn-sm" title="Settings"><RiSettings3Line size={15} /></button>
                      <button className="dp-btn-danger dp-btn dp-btn-sm" onClick={() => setDelTarget(s.id)} title="Delete"><RiDeleteBin2Line size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New Website" footer={
        <>
          <button className="dp-btn-secondary dp-btn" onClick={() => setAddOpen(false)}>Cancel</button>
          <button className="dp-btn-primary dp-btn" form="add-site-form" type="submit">Create Website</button>
        </>
      }>
        <form id="add-site-form" onSubmit={handleAdd} className="flex flex-col gap-4">
          <div className="dp-form-group">
            <label className="dp-label">Domain Name</label>
            <input className="dp-input" placeholder="example.com" value={form.domain}
              onChange={e => setForm({ ...form, domain: e.target.value })} required />
          </div>
          <div className="dp-form-group">
            <label className="dp-label">Site Type</label>
            <select className="dp-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="wordpress">WordPress</option>
              <option value="html">Static HTML</option>
              <option value="nodejs">Node.js</option>
              <option value="python">Python</option>
              <option value="php">PHP App</option>
            </select>
          </div>
          <div className="dp-form-group">
            <label className="dp-label">PHP Version</label>
            <select className="dp-select" value={form.php_version} onChange={e => setForm({ ...form, php_version: e.target.value })}>
              {['7.4','8.0','8.1','8.2','8.3'].map(v => <option key={v} value={v}>PHP {v}</option>)}
            </select>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!delTarget} onClose={() => setDelTarget(null)}
        onConfirm={() => handleDelete(delTarget)}
        title="Delete Website" message="Are you sure? This will remove the website and all its files permanently."
        confirmText="Delete Website" />
    </DashboardShell>
  );
}
