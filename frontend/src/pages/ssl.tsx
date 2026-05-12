import Head from 'next/head';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Lock, Plus, RefreshCw, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SSLPage() {
  const qc = useQueryClient();
  const [domain, setDomain] = useState('');
  const [wildcard, setWildcard] = useState(false);

  const { data: certs = [], isLoading } = useQuery({
    queryKey: ['ssl-certs'],
    queryFn: () => api.get('/ssl').then(r => r.data),
  });

  const issue = useMutation({
    mutationFn: (d: any) => api.post('/ssl/issue', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ssl-certs'] }); toast.success('SSL certificate issued!'); setDomain(''); },
  });

  const renew = useMutation({
    mutationFn: (d: string) => api.post('/ssl/renew', { domain: d }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ssl-certs'] }); toast.success('Certificate renewed!'); },
  });

  const daysLeft = (expiry: string) => {
    const d = Math.floor((new Date(expiry).getTime() - Date.now()) / 86400000);
    return d;
  };

  return (
    <>
      <Head><title>SSL — Devil Panel</title></Head>
      <div className="page animate-fade-in">
        <div className="page__header"><h1>SSL Certificates</h1></div>

        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card__header"><span className="card__header-title">Issue New SSL Certificate</span></div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 1, margin: 0, minWidth: 200 }}>
              <label>Domain</label>
              <input className="input" placeholder="example.com" value={domain} onChange={e => setDomain(e.target.value)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 4 }}>
              <label className="toggle">
                <input type="checkbox" checked={wildcard} onChange={e => setWildcard(e.target.checked)} />
                <span className="toggle__slider" />
              </label>
              <span style={{ fontSize: '14px', color: '#a0a0a0' }}>Wildcard SSL</span>
            </div>
            <button
              className="btn btn--primary"
              onClick={() => issue.mutate({ domain, wildcard })}
              disabled={!domain || issue.isPending}
            >
              {issue.isPending ? <span className="spinner spinner--sm" /> : <Lock size={16} />}
              {issue.isPending ? 'Issuing...' : 'Issue Certificate'}
            </button>
          </div>
        </div>

        <div className="card">
          {isLoading ? <div className="page-loader"><div className="spinner" /></div> : certs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon"><Lock size={28} /></div>
              <h3>No SSL certificates</h3>
              <p>Issue a free Let's Encrypt certificate above.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead><tr><th>Domain</th><th>Type</th><th>Expires</th><th>Days Left</th><th>Actions</th></tr></thead>
                <tbody>
                  {certs.map((c: any) => {
                    const days = daysLeft(c.expires_at);
                    return (
                      <tr key={c.id}>
                        <td><Lock size={13} style={{ marginRight: 6, color: '#e60000' }} />{c.domain}</td>
                        <td><span className="badge badge--info">{c.wildcard ? 'Wildcard' : 'Standard'}</span></td>
                        <td style={{ fontSize: '12px', color: '#a0a0a0' }}>{new Date(c.expires_at).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge ${days > 30 ? 'badge--success' : days > 7 ? 'badge--warning' : 'badge--danger'}`}>
                            {days} days
                          </span>
                        </td>
                        <td>
                          <button className="btn btn--secondary btn--sm" onClick={() => renew.mutate(c.domain)}>
                            <RefreshCw size={13} /> Renew
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
