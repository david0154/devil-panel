import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { RiLockLine, RiShieldCheckLine, RiRefreshLine, RiAddLine } from 'react-icons/ri'
import api from '../../lib/api'

export default function SslPage() {
  const [certs, setCerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showIssue, setShowIssue] = useState(false)
  const [form, setForm] = useState({ domain:'', type:'letsencrypt' })

  useEffect(() => { fetchCerts() }, [])

  const fetchCerts = async () => {
    setLoading(true)
    try { const r = await api.get('/ssl'); setCerts(r.data.certificates || []) }
    catch { setCerts([]) } finally { setLoading(false) }
  }

  const issue = async (e) => {
    e.preventDefault()
    try { await api.post('/ssl/issue', form); toast.success('SSL certificate issued!'); setShowIssue(false); fetchCerts() }
    catch(e) { toast.error(e.response?.data?.error || 'Failed') }
  }

  const renew = async (id) => {
    try { await api.post(`/ssl/${id}/renew`); toast.success('Renewal initiated'); fetchCerts() }
    catch { toast.error('Renewal failed') }
  }

  const expiryColor = (days) => days < 15 ? '#f87171' : days < 30 ? '#fbbf24' : '#2dd4bf'
  const daysLeft = (exp) => Math.ceil((new Date(exp) - new Date()) / 86400000)

  return (
    <div>
      <div className="page-header">
        <div><h1>SSL Certificates</h1><p>Let\'s Encrypt — Free Wildcard SSL Auto-Renewal</p></div>
        <button className="btn btn-primary" onClick={() => setShowIssue(true)}><RiAddLine /> Issue SSL</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
        {[{l:'Total Certs',v:certs.length,c:'#e63946'},{l:'Valid',v:certs.filter(c=>daysLeft(c.expiry)>0).length,c:'#2dd4bf'},{l:'Expiring Soon',v:certs.filter(c=>daysLeft(c.expiry)<30).length,c:'#fbbf24'}].map((s,i)=>(
          <div key={i} className="card" style={{ textAlign:'center' }}>
            <div style={{ fontSize:'2rem', fontWeight:800, color:s.c }}>{s.v}</div>
            <div style={{ color:'#8888a8', fontSize:'0.85rem' }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div className="table-wrapper">
        {loading ? <div style={{ padding:'2rem', textAlign:'center' }}><div className="loading-spinner" style={{ margin:'0 auto' }} /></div> : (
          <table>
            <thead><tr><th>Domain</th><th>Type</th><th>Issued</th><th>Expires</th><th>Days Left</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {certs.map((c,i) => {
                const days = daysLeft(c.expiry)
                return (
                  <tr key={i}>
                    <td style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}><RiLockLine style={{ color:'#2dd4bf' }} />{c.domain}</td>
                    <td><span className="badge info">{c.type}</span></td>
                    <td style={{ fontSize:'0.82rem', color:'#8888a8' }}>{c.issued_at ? new Date(c.issued_at).toLocaleDateString() : '—'}</td>
                    <td style={{ fontSize:'0.82rem', color:'#8888a8' }}>{c.expiry ? new Date(c.expiry).toLocaleDateString() : '—'}</td>
                    <td><span style={{ color:expiryColor(days), fontWeight:700 }}>{days}d</span></td>
                    <td><span className={`badge ${days>30?'success':days>0?'warning':'danger'}`}>{days>30?'Valid':days>0?'Expiring':'Expired'}</span></td>
                    <td style={{ display:'flex', gap:'0.5rem' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => renew(c.id)}><RiRefreshLine /> Renew</button>
                      <button className="btn btn-ghost btn-sm"><RiShieldCheckLine /></button>
                    </td>
                  </tr>
                )
              })}
              {certs.length===0 && <tr><td colSpan={7} style={{ textAlign:'center', color:'#555570' }}>No SSL certificates</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {showIssue && (
        <div className="modal-overlay" onClick={() => setShowIssue(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h2>Issue SSL Certificate</h2><button onClick={()=>setShowIssue(false)}>×</button></div>
            <form onSubmit={issue} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div className="input-group"><label>Domain Name</label><input value={form.domain} onChange={e=>setForm({...form,domain:e.target.value})} placeholder="example.com or *.example.com" required /></div>
              <div className="input-group"><label>Certificate Type</label>
                <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
                  <option value="letsencrypt">Let\'s Encrypt (Free)</option>
                  <option value="wildcard">Wildcard (Free)</option>
                  <option value="custom">Custom / Upload</option>
                </select>
              </div>
              <div style={{ background:'rgba(45,212,191,0.08)', border:'1px solid rgba(45,212,191,0.2)', borderRadius:8, padding:'0.75rem', fontSize:'0.82rem', color:'#2dd4bf' }}>
                ℹ️ Certificate will be issued via Certbot. Make sure DNS is pointing to this server.
              </div>
              <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={()=>setShowIssue(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><RiLockLine /> Issue Certificate</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
