import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { RiMailLine, RiAddLine, RiDeleteBinLine } from 'react-icons/ri'
import api from '../../lib/api'

export default function EmailPage() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ email:'', password:'', quota:1024 })

  useEffect(() => { fetchAccounts() }, [])

  const fetchAccounts = async () => {
    setLoading(true)
    try { const r = await api.get('/email'); setAccounts(r.data.accounts || []) }
    catch { setAccounts([]) } finally { setLoading(false) }
  }

  const create = async (e) => {
    e.preventDefault()
    try { await api.post('/email', form); toast.success('Email account created'); setShowAdd(false); fetchAccounts() }
    catch(e) { toast.error(e.response?.data?.error || 'Failed') }
  }

  const del = async (id) => {
    if (!confirm('Delete this email account?')) return
    try { await api.delete(`/email/${id}`); toast.success('Deleted'); fetchAccounts() }
    catch { toast.error('Failed') }
  }

  return (
    <div>
      <div className="page-header">
        <div><h1>Email Hosting</h1><p>Postfix + Dovecot — SMTP / IMAP / POP3</p></div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}><RiAddLine /> Create Account</button>
      </div>

      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
        {[{l:'Total Accounts',v:accounts.length},{l:'Active',v:accounts.filter(a=>a.active!==false).length},{l:'Storage Used',v:'2.4 GB'},{l:'Mail Queue',v:'0'}].map((s,i)=>(
          <div key={i} className="stat-card">
            <div className="stat-value">{s.v}</div>
            <div className="stat-label">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="table-wrapper">
        {loading ? <div style={{ padding:'2rem', textAlign:'center' }}><div className="loading-spinner" style={{ margin:'0 auto' }} /></div> : (
          <table>
            <thead><tr><th>Email Address</th><th>Quota</th><th>Used</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {accounts.map((a,i) => (
                <tr key={i}>
                  <td style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}><RiMailLine style={{ color:'#e63946' }} />{a.email}</td>
                  <td>{a.quota} MB</td>
                  <td>{a.used || 0} MB</td>
                  <td><span className={`badge ${a.active!==false?'success':'danger'}`}>{a.active!==false?'Active':'Suspended'}</span></td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => del(a.id)}><RiDeleteBinLine /></button></td>
                </tr>
              ))}
              {accounts.length===0 && <tr><td colSpan={5} style={{ textAlign:'center', color:'#555570' }}>No email accounts yet</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h2>Create Email Account</h2><button onClick={()=>setShowAdd(false)}>×</button></div>
            <form onSubmit={create} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div className="input-group"><label>Email Address</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="user@domain.com" required /></div>
              <div className="input-group"><label>Password</label><input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required /></div>
              <div className="input-group"><label>Quota (MB)</label><input type="number" value={form.quota} onChange={e=>setForm({...form,quota:e.target.value})} /></div>
              <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={()=>setShowAdd(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
