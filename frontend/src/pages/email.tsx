import Head from 'next/head';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Mail, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EmailPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ username: '', domain: '', password: '', quota_mb: 1024 });

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['email-accounts'],
    queryFn: () => api.get('/email').then(r => r.data),
  });

  const create = useMutation({
    mutationFn: (d: any) => api.post('/email', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['email-accounts'] }); toast.success('Email account created!'); setShowModal(false); },
  });

  const remove = useMutation({
    mutationFn: (id: number) => api.delete(`/email/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['email-accounts'] }),
  });

  return (
    <>
      <Head><title>Email — Devil Panel</title></Head>
      <div className="page animate-fade-in">
        <div className="page__header">
          <h1>Email Hosting</h1>
          <button className="btn btn--primary" onClick={() => setShowModal(true)}><Plus size={16} /> New Account</button>
        </div>

        <div className="card">
          {isLoading ? <div className="page-loader"><div className="spinner" /></div> : accounts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon"><Mail size={28} /></div>
              <h3>No email accounts</h3>
              <p>Create your first email account to get started.</p>
              <button className="btn btn--primary" onClick={() => setShowModal(true)}><Plus size={16} /> Create Account</button>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead><tr><th>Email Address</th><th>Quota</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {accounts.map((a: any) => (
                    <tr key={a.id}>
                      <td><Mail size={13} style={{ marginRight: 6, color: '#e60000' }} />{a.username}@{a.domain}</td>
                      <td>{(a.quota_mb / 1024).toFixed(1)} GB</td>
                      <td><span className="badge badge--success">● Active</span></td>
                      <td><button className="btn btn--danger btn--sm" onClick={() => remove.mutate(a.id)}><Trash2 size={13} /></button></td>
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
              <div className="modal__header"><h2>New Email Account</h2><button className="modal__close" onClick={() => setShowModal(false)}>✕</button></div>
              <div className="form-group"><label>Username</label><input className="input" placeholder="user" value={form.username} onChange={e => setForm({...form, username: e.target.value})} /></div>
              <div className="form-group"><label>Domain</label><input className="input" placeholder="example.com" value={form.domain} onChange={e => setForm({...form, domain: e.target.value})} /></div>
              <div className="form-group"><label>Password</label><input className="input" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} /></div>
              <div className="form-group"><label>Quota (MB)</label><input className="input" type="number" value={form.quota_mb} onChange={e => setForm({...form, quota_mb: +e.target.value})} /></div>
              <div style={{ display: 'flex', gap: 12 }}>
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
