import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { RiGlobalLine, RiAddLine, RiDeleteBinLine, RiSettings3Line, RiLinkLine } from 'react-icons/ri'
import api from '../../lib/api'

export default function WebsitesPage() {
  const [domains, setDomains] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ domain:'', php_version:'8.2', type:'wordpress' })

  useEffect(() => { fetch() }, [])

  const fetch = async () => {
    setLoading(true)
    try { const r = await api.get('/domains'); setDomains(r.data.domains || []) }
    catch { setDomains([]) } finally { setLoading(false) }
  }

  const create = async (e) => {
    e.preventDefault()
    try { await api.post('/domains', form); toast.success('Domain added!'); setShowAdd(false); fetch() }
    catch(e) { toast.error(e.response?.data?.error || 'Failed') }
  }

  const del = async (id) => {
    if (!confirm('Delete this domain?')) return
    try { await api.delete(`/domains/${id}`); toast.success('Deleted'); fetch() }
    catch { toast.error('Failed') }
  }

  return (
    <div>
      <div className="page-header">
        <div><h1>Websites</h1><p>Domains • PHP • WordPress • Node.js • Python</p></div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}><RiAddLine /> Add Domain</button>
      </div>

      {loading ? <div style={{ display:'flex', justifyContent:'center', padding:'3rem' }}><div className="loading-spinner" /></div> : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'1.25rem' }}>
          {domains.length === 0 && (
            <div className="card" style={{ textAlign:'center', padding:'3rem', gridColumn:'1/-1' }}>
              <RiGlobalLine style={{ fontSize:'3rem', color:'#555570', marginBottom:'1rem' }} />
              <p style={{ color:'#8888a8' }}>No domains yet. Add your first website.</p>
            </div>
          )}
          {domains.map((d,i) => (
            <div key={i} className="card">
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                  <div style={{ width:40, height:40, borderRadius:8, background:'rgba(96,165,250,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <RiGlobalLine style={{ color:'#60a5fa', fontSize:'1.3rem' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight:700 }}>{d.domain}</div>
                    <div style={{ fontSize:'0.78rem', color:'#8888a8' }}>PHP {d.php_version}</div>
                  </div>
                </div>
                <span className={`badge ${d.status==='active'?'success':d.status==='suspended'?'danger':'info'}`}>{d.status||'active'}</span>
              </div>
              <div style={{ display:'flex', gap:'0.5rem' }}>
                <a href={`https://${d.domain}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm"><RiLinkLine /> Visit</a>
                <button className="btn btn-secondary btn-sm"><RiSettings3Line /> Manage</button>
                <button className="btn btn-danger btn-sm" style={{ marginLeft:'auto' }} onClick={()=>del(d.id)}><RiDeleteBinLine /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h2>Add Domain</h2><button onClick={()=>setShowAdd(false)}>×</button></div>
            <form onSubmit={create} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div className="input-group"><label>Domain Name</label><input value={form.domain} onChange={e=>setForm({...form,domain:e.target.value})} placeholder="example.com" required /></div>
              <div className="input-group"><label>PHP Version</label>
                <select value={form.php_version} onChange={e=>setForm({...form,php_version:e.target.value})}>
                  {['8.3','8.2','8.1','8.0','7.4'].map(v=><option key={v} value={v}>PHP {v}</option>)}
                </select>
              </div>
              <div className="input-group"><label>Type</label>
                <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
                  <option value="wordpress">WordPress</option>
                  <option value="php">PHP App</option>
                  <option value="nodejs">Node.js</option>
                  <option value="python">Python</option>
                  <option value="static">Static HTML</option>
                </select>
              </div>
              <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={()=>setShowAdd(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Domain</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
