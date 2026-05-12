import { useState, useEffect } from 'react';
import DashboardShell from '../components/layout/DashboardShell';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import ProgressBar from '../components/ui/ProgressBar';
import { RiServerLine, RiAddLine, RiPlayLine, RiStopLine, RiRefreshLine, RiDeleteBin2Line, RiSettings3Line, RiTerminalLine } from 'react-icons/ri';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function VPSPage() {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [statsModal, setStatsModal] = useState(null);
  const [form, setForm] = useState({ name: '', ip: '', type: 'kvm', os: 'ubuntu-22.04', ram_gb: 2, cpu_cores: 2, disk_gb: 50 });

  const load = () => {
    api.get('/servers').then(r => setServers(r.data.servers || [])).catch(() => setServers([])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const add = async (e) => {
    e.preventDefault();
    try {
      await api.post('/servers', form);
      toast.success('Server added!');
      setAddOpen(false);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const action = async (id, act) => {
    try {
      await api.post(`/servers/${id}/${act}`);
      toast.success(`Server ${act} initiated`);
      setTimeout(load, 2000);
    } catch { toast.error('Action failed'); }
  };

  return (
    <DashboardShell>
      <div className="dp-page-header">
        <div>
          <h1 className="dp-page-title">VPS Management</h1>
          <p className="dp-page-subtitle">KVM, QEMU, LXC virtualization with live stats</p>
        </div>
        <button className="dp-btn-primary dp-btn" onClick={() => setAddOpen(true)}><RiAddLine />Add Server</button>
      </div>

      {loading ? <div className="text-center text-devil-muted py-16">Loading servers...</div>
      : servers.length === 0 ? (
        <EmptyState icon={RiServerLine} title="No servers" description="Add your first VPS or dedicated server"
          action={<button className="dp-btn-primary dp-btn" onClick={() => setAddOpen(true)}><RiAddLine />Add Server</button>} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {servers.map(s => (
            <div key={s.id} className="dp-card group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-devil-surface3 rounded-xl border border-devil-border">
                    <RiServerLine size={22} className="text-devil-red" />
                  </div>
                  <div>
                    <div className="text-devil-text font-semibold">{s.name}</div>
                    <div className="text-devil-muted text-xs font-mono">{s.ip}</div>
                  </div>
                </div>
                <Badge color={s.status === 'running' ? 'green' : s.status === 'stopped' ? 'red' : 'yellow'}>
                  {s.status || 'unknown'}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                {[['CPU', `${s.cpu_cores} Cores`],['RAM', `${s.ram_gb}GB`],['Disk', `${s.disk_gb}GB`]].map(([l,v]) => (
                  <div key={l} className="bg-devil-surface2 rounded-lg p-2">
                    <div className="text-devil-text text-sm font-semibold">{v}</div>
                    <div className="text-devil-muted text-xs">{l}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button className="dp-btn-success dp-btn dp-btn-sm" onClick={() => action(s.id,'start')} title="Start"><RiPlayLine size={14} /></button>
                <button className="dp-btn-danger dp-btn dp-btn-sm" onClick={() => action(s.id,'stop')} title="Stop"><RiStopLine size={14} /></button>
                <button className="dp-btn-secondary dp-btn dp-btn-sm" onClick={() => action(s.id,'reboot')} title="Reboot"><RiRefreshLine size={14} /></button>
                <button className="dp-btn-ghost dp-btn dp-btn-sm" title="Terminal"><RiTerminalLine size={14} /></button>
                <button className="dp-btn-ghost dp-btn dp-btn-sm ml-auto" onClick={() => setStatsModal(s)} title="Stats"><RiSettings3Line size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Server"
        footer={<><button className="dp-btn-secondary dp-btn" onClick={() => setAddOpen(false)}>Cancel</button><button className="dp-btn-primary dp-btn" form="vps-form" type="submit">Add Server</button></>}>
        <form id="vps-form" onSubmit={add} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="dp-form-group">
              <label className="dp-label">Server Name</label>
              <input className="dp-input" placeholder="vps-01" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div className="dp-form-group">
              <label className="dp-label">IP Address</label>
              <input className="dp-input" placeholder="192.168.1.1" value={form.ip} onChange={e => setForm({...form, ip: e.target.value})} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="dp-form-group">
              <label className="dp-label">Type</label>
              <select className="dp-select" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                {['kvm','qemu','lxc','dedicated'].map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
              </select>
            </div>
            <div className="dp-form-group">
              <label className="dp-label">OS</label>
              <select className="dp-select" value={form.os} onChange={e => setForm({...form, os: e.target.value})}>
                {['ubuntu-22.04','debian-12','almalinux-9','rocky-9'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="dp-form-group">
              <label className="dp-label">RAM (GB)</label>
              <input type="number" className="dp-input" value={form.ram_gb} onChange={e => setForm({...form, ram_gb: +e.target.value})} />
            </div>
            <div className="dp-form-group">
              <label className="dp-label">CPU Cores</label>
              <input type="number" className="dp-input" value={form.cpu_cores} onChange={e => setForm({...form, cpu_cores: +e.target.value})} />
            </div>
            <div className="dp-form-group">
              <label className="dp-label">Disk (GB)</label>
              <input type="number" className="dp-input" value={form.disk_gb} onChange={e => setForm({...form, disk_gb: +e.target.value})} />
            </div>
          </div>
        </form>
      </Modal>
    </DashboardShell>
  );
}
