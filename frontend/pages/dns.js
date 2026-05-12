import { useState, useEffect } from 'react';
import DashboardShell from '../components/layout/DashboardShell';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { RiDatabase2Line, RiAddLine, RiDeleteBin2Line } from 'react-icons/ri';
import api from '../lib/api';
import toast from 'react-hot-toast';

const RECORD_TYPES = ['A','AAAA','CNAME','MX','TXT','NS','SRV','CAA'];

export default function DNS() {
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [records, setRecords] = useState([]);
  const [addZoneOpen, setAddZoneOpen] = useState(false);
  const [addRecordOpen, setAddRecordOpen] = useState(false);
  const [zoneDomain, setZoneDomain] = useState('');
  const [recForm, setRecForm] = useState({ type: 'A', name: '', content: '', ttl: 3600, priority: 10 });

  useEffect(() => {
    api.get('/dns/zones').then(r => setZones(r.data.zones || [])).catch(() => {});
  }, []);

  const loadRecords = (zoneId) => {
    setSelectedZone(zoneId);
    api.get(`/dns/zones/${zoneId}/records`).then(r => setRecords(r.data.records || [])).catch(() => {});
  };

  const addZone = async (e) => {
    e.preventDefault();
    try {
      await api.post('/dns/zones', { domain: zoneDomain });
      toast.success('DNS zone created');
      setAddZoneOpen(false);
      api.get('/dns/zones').then(r => setZones(r.data.zones || []));
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const addRecord = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/dns/zones/${selectedZone}/records`, recForm);
      toast.success('Record added');
      setAddRecordOpen(false);
      loadRecords(selectedZone);
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const delRecord = async (id) => {
    try {
      await api.delete(`/dns/zones/${selectedZone}/records/${id}`);
      toast.success('Record deleted');
      loadRecords(selectedZone);
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <DashboardShell>
      <div className="dp-page-header">
        <div>
          <h1 className="dp-page-title">DNS Manager</h1>
          <p className="dp-page-subtitle">Manage DNS zones and records via PowerDNS</p>
        </div>
        <button className="dp-btn-primary dp-btn" onClick={() => setAddZoneOpen(true)}>
          <RiAddLine /> Add Zone
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Zones */}
        <div className="dp-card">
          <h3 className="text-devil-text font-semibold mb-4">DNS Zones</h3>
          {zones.length === 0 ? (
            <EmptyState icon={RiDatabase2Line} title="No zones" description="Add your first DNS zone" />
          ) : (
            <div className="flex flex-col gap-2">
              {zones.map(z => (
                <button key={z.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all duration-200 ${
                    selectedZone === z.id ? 'border-devil-red bg-devil-red/10 text-devil-text' : 'border-devil-border bg-devil-surface2 text-devil-muted hover:text-devil-text hover:border-devil-red/30'
                  }`}
                  onClick={() => loadRecords(z.id)}
                >
                  <RiDatabase2Line size={16} />
                  <span className="text-sm font-medium">{z.domain}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Records */}
        <div className="dp-card col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-devil-text font-semibold">DNS Records</h3>
            {selectedZone && (
              <button className="dp-btn-primary dp-btn dp-btn-sm" onClick={() => setAddRecordOpen(true)}>
                <RiAddLine size={14} /> Add Record
              </button>
            )}
          </div>
          {!selectedZone ? (
            <div className="text-devil-muted text-sm text-center py-8">Select a zone to view records</div>
          ) : records.length === 0 ? (
            <EmptyState icon={RiDatabase2Line} title="No records" description="Add DNS records for this zone" />
          ) : (
            <table className="dp-table">
              <thead><tr><th>Type</th><th>Name</th><th>Content</th><th>TTL</th><th></th></tr></thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id}>
                    <td><Badge color={r.type==='A'?'blue':r.type==='MX'?'purple':r.type==='TXT'?'yellow':'gray'}>{r.type}</Badge></td>
                    <td className="font-mono text-xs">{r.name}</td>
                    <td className="font-mono text-xs text-devil-muted max-w-[200px] truncate">{r.content}</td>
                    <td className="text-devil-muted text-xs">{r.ttl}s</td>
                    <td>
                      <button className="dp-btn-danger dp-btn dp-btn-sm" onClick={() => delRecord(r.id)}>
                        <RiDeleteBin2Line size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal open={addZoneOpen} onClose={() => setAddZoneOpen(false)} title="Add DNS Zone" size="sm"
        footer={<><button className="dp-btn-secondary dp-btn" onClick={() => setAddZoneOpen(false)}>Cancel</button><button className="dp-btn-primary dp-btn" form="zone-form" type="submit">Add Zone</button></>}>
        <form id="zone-form" onSubmit={addZone}>
          <div className="dp-form-group">
            <label className="dp-label">Domain</label>
            <input className="dp-input" placeholder="example.com" value={zoneDomain} onChange={e => setZoneDomain(e.target.value)} required />
          </div>
        </form>
      </Modal>

      <Modal open={addRecordOpen} onClose={() => setAddRecordOpen(false)} title="Add DNS Record"
        footer={<><button className="dp-btn-secondary dp-btn" onClick={() => setAddRecordOpen(false)}>Cancel</button><button className="dp-btn-primary dp-btn" form="rec-form" type="submit">Add Record</button></>}>
        <form id="rec-form" onSubmit={addRecord} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="dp-form-group">
              <label className="dp-label">Type</label>
              <select className="dp-select" value={recForm.type} onChange={e => setRecForm({...recForm, type: e.target.value})}>
                {RECORD_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="dp-form-group">
              <label className="dp-label">TTL (seconds)</label>
              <input className="dp-input" type="number" value={recForm.ttl} onChange={e => setRecForm({...recForm, ttl: +e.target.value})} />
            </div>
          </div>
          <div className="dp-form-group">
            <label className="dp-label">Name</label>
            <input className="dp-input" placeholder="@ or subdomain" value={recForm.name} onChange={e => setRecForm({...recForm, name: e.target.value})} required />
          </div>
          <div className="dp-form-group">
            <label className="dp-label">Content / Value</label>
            <input className="dp-input" placeholder="IP address or value" value={recForm.content} onChange={e => setRecForm({...recForm, content: e.target.value})} required />
          </div>
        </form>
      </Modal>
    </DashboardShell>
  );
}
