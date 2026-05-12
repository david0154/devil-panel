import Head from 'next/head';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Globe, Plus, Trash2, RefreshCw, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WebsitesPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ domain: '', php_version: '8.2' });

  const { data: domains = [], isLoading } = useQuery({
    queryKey: ['domains'],
    queryFn: () => api.get('/domains').then(r => r.data),
  });

  const create = useMutation({
    mutationFn: (d: any) => api.post('/domains', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['domains'] }); toast.success('Domain created!'); setShowModal(false); },
  });

  const remove = useMutation({
    mutationFn: (id: number) => api.delete(`/domains/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['domains'] }); toast.success('Domain removed.'); },
  });

  return (
    <>
      <Head><title>Websites — Devil Panel</title></Head>
      <div className="page animate-fade-in">
        <div className="page__header">
          <h1>Websites</h1>
          <button className="btn btn--primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add Domain
          </button>
        </div>

        <div className="card">
          {isLoading ? (
            <div className="page-loader"><div className="spinner" /></div>
          ) : domains.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon"><Globe size={28} /></div>
              <h3>No domains yet</h3>
              <p>Add your first domain to get started.</p>
              <button className="btn btn--primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add Domain</button>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr><th>Domain</th><th>PHP</th><th>Status</th><th>Created</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {domains.map((d: any) => (
                    <tr key={d.id}>
                      <td><Globe size={14} style={{ marginRight: 6, color: '#e60000' }} />{d.domain}</td>
                      <td><span className="badge badge--info">PHP {d.php_version}</span></td>
                      <td><span className="badge badge--success">● Active</span></td>
                      <td style={{ color: '#555', fontSize: '12px' }}>{new Date(d.created_at).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn--ghost btn--sm"><Settings size={14} /></button>
                          <button className="btn btn--danger btn--sm" onClick={() => remove.mutate(d.id)}><Trash2 size={14} /></button>
                        </div>
                      </td>
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
              <div className="modal__header">
                <h2>Add Domain</h2>
                <button className="modal__close" onClick={() => setShowModal(false)}>✕</button>
              </div>
              <div className="form-group">
                <label>Domain Name</label>
                <input className="input" placeholder="example.com" value={form.domain} onChange={e => setForm({...form, domain: e.target.value})} />
              </div>
              <div className="form-group">
                <label>PHP Version</label>
                <select className="select" value={form.php_version} onChange={e => setForm({...form, php_version: e.target.value})}>
                  <option value="8.3">PHP 8.3</option>
                  <option value="8.2">PHP 8.2</option>
                  <option value="8.1">PHP 8.1</option>
                  <option value="8.0">PHP 8.0</option>
                  <option value="7.4">PHP 7.4</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button className="btn btn--secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn--primary" style={{ flex: 1 }} onClick={() => create.mutate(form)} disabled={create.isPending}>
                  {create.isPending ? <span className="spinner spinner--sm" /> : <Plus size={16} />} Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
