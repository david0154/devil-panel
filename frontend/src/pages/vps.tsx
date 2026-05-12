import Head from 'next/head';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Layers, Plus, Play, Square, RotateCcw, Trash2, Terminal } from 'lucide-react';
import toast from 'react-hot-toast';

const VPS_PLANS = [
  { id: 'vps-1gb',  label: '1 vCPU / 1GB RAM / 25GB SSD',  price: '$5/mo' },
  { id: 'vps-2gb',  label: '1 vCPU / 2GB RAM / 50GB SSD',  price: '$10/mo' },
  { id: 'vps-4gb',  label: '2 vCPU / 4GB RAM / 80GB SSD',  price: '$20/mo' },
  { id: 'vps-8gb',  label: '4 vCPU / 8GB RAM / 160GB SSD', price: '$40/mo' },
];

export default function VPSPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ hostname: '', plan: 'vps-2gb', os: 'ubuntu-22.04', region: 'in-mum' });

  const { data: vps = [], isLoading } = useQuery({
    queryKey: ['vps-list'],
    queryFn: () => api.get('/servers').then(r => r.data.filter((s: any) => s.type === 'vps' || true)),
    refetchInterval: 10000,
  });

  const create = useMutation({
    mutationFn: (d: any) => api.post('/servers', { ...d, type: 'vps' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vps-list'] }); toast.success('VPS provisioned!'); setShowModal(false); },
  });

  const action = useMutation({
    mutationFn: ({ id, act }: any) => api.post(`/servers/${id}/${act}`),
    onSuccess: (_, v) => { toast.success(`${v.act} sent`); qc.invalidateQueries({ queryKey: ['vps-list'] }); },
  });

  const statusBadge = (s: string) => {
    if (s === 'running') return <span className="badge badge--success">● Running</span>;
    if (s === 'stopped') return <span className="badge badge--danger">● Stopped</span>;
    return <span className="badge badge--warning">● Provisioning</span>;
  };

  return (
    <>
      <Head><title>VPS — Devil Panel</title></Head>
      <div className="page animate-fade-in">
        <div className="page__header">
          <h1>VPS Management</h1>
          <button className="btn btn--primary" onClick={() => setShowModal(true)}><Plus size={16} /> Deploy VPS</button>
        </div>

        <div className="card">
          {isLoading ? <div className="page-loader"><div className="spinner" /></div> : vps.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon"><Layers size={28} /></div>
              <h3>No VPS instances</h3>
              <p>Deploy your first VPS instance to get started.</p>
              <button className="btn btn--primary" onClick={() => setShowModal(true)}><Plus size={16} /> Deploy VPS</button>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead><tr><th>Hostname</th><th>IP</th><th>Plan</th><th>OS</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {vps.map((v: any) => (
                    <tr key={v.id}>
                      <td><Layers size={13} style={{ marginRight: 6, color: '#e60000' }} />{v.name}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>{v.ip_address}</td>
                      <td>{v.plan || 'Standard'}</td>
                      <td>{v.os || 'Ubuntu 22.04'}</td>
                      <td>{statusBadge(v.status || 'running')}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn--ghost btn--sm" onClick={() => action.mutate({ id: v.id, act: 'start' })}><Play size={13} /></button>
                          <button className="btn btn--ghost btn--sm" onClick={() => action.mutate({ id: v.id, act: 'stop' })}><Square size={13} /></button>
                          <button className="btn btn--ghost btn--sm" onClick={() => action.mutate({ id: v.id, act: 'reboot' })}><RotateCcw size={13} /></button>
                          <button className="btn btn--ghost btn--sm"><Terminal size={13} /></button>
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
              <div className="modal__header"><h2>Deploy VPS</h2><button className="modal__close" onClick={() => setShowModal(false)}>✕</button></div>
              <div className="form-group"><label>Hostname</label><input className="input" placeholder="my-vps-01" value={form.hostname} onChange={e => setForm({...form, hostname: e.target.value})} /></div>
              <div className="form-group">
                <label>Plan</label>
                <select className="select" value={form.plan} onChange={e => setForm({...form, plan: e.target.value})}>
                  {VPS_PLANS.map(p => <option key={p.id} value={p.id}>{p.label} — {p.price}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Operating System</label>
                <select className="select" value={form.os} onChange={e => setForm({...form, os: e.target.value})}>
                  <option value="ubuntu-22.04">Ubuntu 22.04 LTS</option>
                  <option value="debian-12">Debian 12</option>
                  <option value="almalinux-9">AlmaLinux 9</option>
                  <option value="rocky-9">Rocky Linux 9</option>
                </select>
              </div>
              <div className="form-group">
                <label>Region</label>
                <select className="select" value={form.region} onChange={e => setForm({...form, region: e.target.value})}>
                  <option value="in-mum">Mumbai, India</option>
                  <option value="in-del">Delhi, India</option>
                  <option value="sg-sin">Singapore</option>
                  <option value="us-nyc">New York, USA</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn--secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn--primary" style={{ flex: 1 }} onClick={() => create.mutate({...form, name: form.hostname, ip_address: '0.0.0.0'})} disabled={create.isPending}>
                  {create.isPending ? <span className="spinner spinner--sm" /> : <Plus size={16} />} Deploy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
