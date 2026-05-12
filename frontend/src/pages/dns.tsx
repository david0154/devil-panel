import Head from 'next/head';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Network, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DNSPage() {
  const qc = useQueryClient();
  const [zone, setZone] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [rec, setRec] = useState({ zone_id: 0, name: '', type: 'A', content: '', ttl: 3600, priority: 0 });

  const { data: zones = [] } = useQuery({ queryKey: ['dns-zones'], queryFn: () => api.get('/dns/zones').then(r => r.data) });
  const { data: records = [] } = useQuery({
    queryKey: ['dns-records', zone],
    queryFn: () => zone ? api.get(`/dns/zones/${zone}/records`).then(r => r.data) : Promise.resolve([]),
    enabled: !!zone,
  });

  const addRecord = useMutation({
    mutationFn: (d: any) => api.post(`/dns/zones/${zone}/records`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['dns-records', zone] }); toast.success('Record added!'); setShowModal(false); },
  });

  const delRecord = useMutation({
    mutationFn: (id: number) => api.delete(`/dns/zones/${zone}/records/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['dns-records', zone] }); },
  });

  return (
    <>
      <Head><title>DNS — Devil Panel</title></Head>
      <div className="page animate-fade-in">
        <div className="page__header">
          <h1>DNS Manager</h1>
          <button className="btn btn--primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add Record</button>
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Select Zone</label>
            <select className="select" value={zone} onChange={e => setZone(e.target.value)}>
              <option value="">-- Select a domain --</option>
              {zones.map((z: any) => <option key={z.id} value={z.id}>{z.name}</option>)}
            </select>
          </div>
        </div>

        <div className="card">
          <div className="card__header"><span className="card__header-title">DNS Records</span></div>
          {!zone ? (
            <div className="empty-state">
              <div className="empty-state__icon"><Network size={28} /></div>
              <h3>Select a zone</h3><p>Choose a domain above to manage its DNS records.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead><tr><th>Name</th><th>Type</th><th>Content</th><th>TTL</th><th>Actions</th></tr></thead>
                <tbody>
                  {records.map((r: any) => (
                    <tr key={r.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>{r.name}</td>
                      <td><span className="badge badge--info">{r.type}</span></td>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px', color: '#a0a0a0' }}>{r.content}</td>
                      <td>{r.ttl}s</td>
                      <td><button className="btn btn--danger btn--sm" onClick={() => delRecord.mutate(r.id)}><Trash2 size={13} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showModal && (
          <div className="modal-backdrop" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal__header"><h2>Add DNS Record</h2><button className="modal__close" onClick={() => setShowModal(false)}>✕</button></div>
              <div className="form-group"><label>Name</label><input className="input" placeholder="@ or subdomain" value={rec.name} onChange={e => setRec({...rec, name: e.target.value})} /></div>
              <div className="form-group">
                <label>Type</label>
                <select className="select" value={rec.type} onChange={e => setRec({...rec, type: e.target.value})}>
                  {['A','AAAA','CNAME','MX','TXT','NS','SRV','CAA'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Content</label><input className="input" placeholder="IP or value" value={rec.content} onChange={e => setRec({...rec, content: e.target.value})} /></div>
              <div className="form-group"><label>TTL (seconds)</label><input className="input" type="number" value={rec.ttl} onChange={e => setRec({...rec, ttl: +e.target.value})} /></div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn--secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn--primary" style={{ flex: 1 }} onClick={() => addRecord.mutate({...rec, zone_id: +zone})} disabled={!zone}>
                  <Plus size={16} /> Add Record
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
