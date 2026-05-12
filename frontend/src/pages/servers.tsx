import Head from 'next/head';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Server, Plus, Play, Square, RotateCcw, Trash2, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ServersPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', ip_address: '', os: 'ubuntu-22.04', plan: 'vps-1gb' });

  const { data: servers = [], isLoading } = useQuery({
    queryKey: ['servers'],
    queryFn: () => api.get('/servers').then(r => r.data),
    refetchInterval: 15000,
  });

  const create = useMutation({
    mutationFn: (d: any) => api.post('/servers', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['servers'] }); toast.success('Server added!'); setShowModal(false); },
  });

  const action = useMutation({
    mutationFn: ({ id, act }: any) => api.post(`/servers/${id}/${act}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['servers'] }); },
  });

  const statusBadge = (s: string) => {
    if (s === 'running') return <span className="badge badge--success">● Running</span>;
    if (s === 'stopped') return <span className="badge badge--danger">● Stopped</span>;
    return <span className="badge badge--warning">● {s}</span>;
  };

  return (
    <>
      <Head><title>Servers — Devil Panel</title></Head>
      <div className="page animate-fade-in">
        <div className="page__header">
          <h1>Servers</h1>
          <button className="btn btn--primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add Server</button>
        </div>

        <div className="card">
          {isLoading ? <div className="page-loader"><div className="spinner" /></div> : (
            <div className="table-wrapper">
              <table className="table">
                <thead><tr><th>Name</th><th>IP</th><th>OS</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {servers.map((s: any) => (
                    <tr key={s.id}>
                      <td><Server size={14} style={{ marginRight: 6, color: '#e60000' }} />{s.name}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>{s.ip_address}</td>
                      <td>{s.os}</td>
                      <td>{statusBadge(s.status || 'running')}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn--ghost btn--sm" title="Start" onClick={() => action.mutate({ id: s.id, act: 'start' })}><Play size={13} /></button>
                          <button className="btn btn--ghost btn--sm" title="Stop" onClick={() => action.mutate({ id: s.id, act: 'stop' })}><Square size={13} /></button>
                          <button className="btn btn--ghost btn--sm" title="Reboot" onClick={() => action.mutate({ id: s.id, act: 'reboot' })}><RotateCcw size={13} /></button>
                          <button className="btn btn--ghost btn--sm" title="Stats"><Activity size={13} /></button>
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
              <div className="modal__header"><h2>Add Server</h2><button className="modal__close" onClick={() => setShowModal(false)}>✕</button></div>
              {(['name','ip_address'] as const).map(f => (
                <div className="form-group" key={f}>
                  <label>{f === 'ip_address' ? 'IP Address' : 'Server Name'}</label>
                  <input className="input" placeholder={f === 'ip_address' ? '192.168.1.1' : 'My Server'} value={form[f]} onChange={e => setForm({...form, [f]: e.target.value})} />
                </div>
              ))}
              <div className="form-group">
                <label>Operating System</label>
                <select className="select" value={form.os} onChange={e => setForm({...form, os: e.target.value})}>
                  <option value="ubuntu-22.04">Ubuntu 22.04 LTS</option>
                  <option value="ubuntu-20.04">Ubuntu 20.04 LTS</option>
                  <option value="debian-12">Debian 12</option>
                  <option value="almalinux-9">AlmaLinux 9</option>
                  <option value="rocky-9">Rocky Linux 9</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn--secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn--primary" style={{ flex: 1 }} onClick={() => create.mutate(form)} disabled={create.isPending}>
                  {create.isPending ? <span className="spinner spinner--sm" /> : <Plus size={16} />} Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
