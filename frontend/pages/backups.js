import { useState, useEffect } from 'react';
import DashboardShell from '../components/layout/DashboardShell';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { RiCloudLine, RiAddLine, RiDownloadLine, RiDeleteBin2Line, RiRefreshLine, RiHistoryLine } from 'react-icons/ri';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function BackupsPage() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ type: 'full', server_id: '' });
  const [createOpen, setCreateOpen] = useState(false);

  const load = () => api.get('/backups').then(r => setBackups(r.data.backups || [])).catch(() => {}).finally(() => setLoading(false));
  useEffect(load, []);

  const create = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/backups', form);
      toast.success('Backup started! It will complete in the background.');
      setCreateOpen(false);
      setTimeout(load, 3000);
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setCreating(false); }
  };

  const restore = async (id) => {
    try {
      await api.post(`/backups/${id}/restore`);
      toast.success('Restore initiated!');
    } catch { toast.error('Restore failed'); }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '-';
    if (bytes > 1e9) return (bytes/1e9).toFixed(2)+' GB';
    if (bytes > 1e6) return (bytes/1e6).toFixed(2)+' MB';
    return (bytes/1e3).toFixed(1)+' KB';
  };

  return (
    <DashboardShell>
      <div className="dp-page-header">
        <div>
          <h1 className="dp-page-title">Backups</h1>
          <p className="dp-page-subtitle">Full, incremental and remote backups powered by Restic</p>
        </div>
        <button className="dp-btn-primary dp-btn" onClick={() => setCreateOpen(true)}><RiAddLine />Create Backup</button>
      </div>

      {/* Storage options */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[['AWS S3','blue'],['Backblaze B2','green'],['MinIO','yellow'],['Local','gray']].map(([name, color]) => (
          <div key={name} className="dp-card-sm flex items-center gap-3">
            <RiCloudLine className={`text-${color === 'gray' ? 'devil-muted' : color+'-400'}`} size={20} />
            <span className="text-devil-text text-sm">{name}</span>
          </div>
        ))}
      </div>

      <div className="dp-table-wrap">
        {loading ? <div className="p-12 text-center text-devil-muted">Loading...</div>
        : backups.length === 0 ? (
          <EmptyState icon={RiHistoryLine} title="No backups yet" description="Create your first backup to protect your data"
            action={<button className="dp-btn-primary dp-btn" onClick={() => setCreateOpen(true)}><RiAddLine />Create Backup</button>} />
        ) : (
          <table className="dp-table">
            <thead><tr><th>Name</th><th>Type</th><th>Size</th><th>Storage</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              {backups.map(b => (
                <tr key={b.id}>
                  <td className="font-medium text-sm">{b.name}</td>
                  <td><Badge color={b.type==='full'?'blue':'green'}>{b.type}</Badge></td>
                  <td className="text-devil-muted text-xs">{formatSize(b.size_bytes)}</td>
                  <td><Badge color="gray">{b.storage || 'local'}</Badge></td>
                  <td>{b.status === 'completed' ? <Badge color="green">Done</Badge> : b.status === 'running' ? <Badge color="yellow">Running</Badge> : <Badge color="red">Failed</Badge>}</td>
                  <td className="text-devil-muted text-xs">{b.created_at ? new Date(b.created_at).toLocaleDateString() : '-'}</td>
                  <td>
                    <div className="flex gap-1">
                      <button className="dp-btn-success dp-btn dp-btn-sm" onClick={() => restore(b.id)} title="Restore"><RiRefreshLine size={13} /></button>
                      <button className="dp-btn-ghost dp-btn dp-btn-sm" title="Download"><RiDownloadLine size={13} /></button>
                      <button className="dp-btn-danger dp-btn dp-btn-sm" title="Delete"><RiDeleteBin2Line size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Backup"
        footer={<><button className="dp-btn-secondary dp-btn" onClick={() => setCreateOpen(false)}>Cancel</button><button className="dp-btn-primary dp-btn" form="backup-form" type="submit" disabled={creating}>{creating ? 'Starting...' : 'Start Backup'}</button></>}>
        <form id="backup-form" onSubmit={create} className="flex flex-col gap-4">
          <div className="dp-form-group">
            <label className="dp-label">Backup Type</label>
            <select className="dp-select" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
              <option value="full">Full Backup</option>
              <option value="incremental">Incremental</option>
              <option value="website">Website Only</option>
              <option value="database">Database Only</option>
            </select>
          </div>
          <div className="dp-form-group">
            <label className="dp-label">Storage</label>
            <select className="dp-select" value={form.storage} onChange={e => setForm({...form, storage: e.target.value})}>
              <option value="local">Local Storage</option>
              <option value="s3">AWS S3</option>
              <option value="b2">Backblaze B2</option>
              <option value="minio">MinIO</option>
            </select>
          </div>
        </form>
      </Modal>
    </DashboardShell>
  );
}
