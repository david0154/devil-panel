import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { RiServerLine, RiPlayLine, RiStopLine, RiRestartLine, RiAddLine, RiDeleteBinLine } from 'react-icons/ri'
import api from '../../lib/api'

export default function VpsPage() {
  const [vpsList, setVpsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name:'', plan:'basic', os:'ubuntu-22.04', ipv4:'' })

  useEffect(() => { fetchVPS() }, [])

  const fetchVPS = async () => {
    setLoading(true)
    try {
      const r = await api.get('/servers')
      setVpsList(r.data.servers || [])
    } catch { setVpsList([]) } finally { setLoading(false) }
  }

  const action = async (id, act) => {
    try {
      await api.post(`/servers/${id}/${act}`)
      toast.success(`Server ${act} initiated`)
      fetchVPS()
    } catch (e) { toast.error(e.response?.data?.error || 'Failed') }
  }

  const createVPS = async (e) => {
    e.preventDefault()
    try {
      await api.post('/servers', form)
      toast.success('VPS created!')
      setShowCreate(false)
      fetchVPS()
    } catch (e) { toast.error(e.response?.data?.error || 'Failed') }
  }

  const statusColor = (s) => ({ running:'#2dd4bf', stopped:'#f87171', warning:'#fbbf24' }[s] || '#8888a8')

  return (
    <div>
      <div className="page-header">
        <div><h1>VPS Management</h1><p>KVM / QEMU / LXC Virtual Servers</p></div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}><RiAddLine /> New VPS</button>
      </div>

      {loading ? <div style={{ display:'flex', justifyContent:'center', padding:'3rem' }}><div className="loading-spinner" /></div> : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:'1.25rem' }}>
          {vpsList.length === 0 && (
            <div className="card" style={{ textAlign:'center', padding:'3rem', gridColumn:'1/-1' }}>
              <RiServerLine style={{ fontSize:'3rem', color:'#555570', marginBottom:'1rem' }} />
              <p style={{ color:'#8888a8' }}>No VPS servers yet. Create your first one.</p>
            </div>
          )}
          {vpsList.map(v => (
            <div key={v.id} className="card">
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                  <div style={{ width:40, height:40, borderRadius:8, background:'rgba(230,57,70,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem' }}><RiServerLine style={{ color:'#e63946' }} /></div>
                  <div>
                    <div style={{ fontWeight:700 }}>{v.name}</div>
                    <div style={{ fontSize:'0.78rem', color:'#8888a8', fontFamily:'monospace' }}>{v.ip_address || 'No IP'}</div>
                  </div>
                </div>
                <span className="badge" style={{ background:`rgba(${statusColor(v.status)},0.15)`, color:statusColor(v.status) }}>
                  {v.status || 'unknown'}
                </span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem', marginBottom:'1rem', fontSize:'0.82rem' }}>
                <div style={{ background:'#111118', borderRadius:6, padding:'0.5rem' }}>
                  <div style={{ color:'#555570' }}>CPU</div>
                  <div style={{ fontWeight:600 }}>{v.cpu || 1} vCPU</div>
                </div>
                <div style={{ background:'#111118', borderRadius:6, padding:'0.5rem' }}>
                  <div style={{ color:'#555570' }}>RAM</div>
                  <div style={{ fontWeight:600 }}>{v.ram || 1024} MB</div>
                </div>
                <div style={{ background:'#111118', borderRadius:6, padding:'0.5rem' }}>
                  <div style={{ color:'#555570' }}>Storage</div>
                  <div style={{ fontWeight:600 }}>{v.disk || 20} GB</div>
                </div>
                <div style={{ background:'#111118', borderRadius:6, padding:'0.5rem' }}>
                  <div style={{ color:'#555570' }}>OS</div>
                  <div style={{ fontWeight:600, fontSize:'0.78rem' }}>{v.os || 'Ubuntu 22'}</div>
                </div>
              </div>
              <div style={{ display:'flex', gap:'0.5rem' }}>
                <button className="btn btn-success btn-sm" onClick={() => action(v.id,'start')}><RiPlayLine /> Start</button>
                <button className="btn btn-danger btn-sm" onClick={() => action(v.id,'stop')}><RiStopLine /> Stop</button>
                <button className="btn btn-secondary btn-sm" onClick={() => action(v.id,'reboot')}><RiRestartLine /> Reboot</button>
                <button className="btn btn-ghost btn-sm" style={{ marginLeft:'auto' }} onClick={() => action(v.id,'delete')}><RiDeleteBinLine /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create VPS</h2>
              <button onClick={() => setShowCreate(false)}>×</button>
            </div>
            <form onSubmit={createVPS} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div className="input-group"><label>Server Name</label><input value={form.name} onChange={e => setForm({...form, name:e.target.value})} placeholder="vps-01" required /></div>
              <div className="input-group"><label>Operating System</label>
                <select value={form.os} onChange={e => setForm({...form, os:e.target.value})}>
                  <option value="ubuntu-22.04">Ubuntu 22.04 LTS</option>
                  <option value="ubuntu-20.04">Ubuntu 20.04 LTS</option>
                  <option value="debian-12">Debian 12</option>
                  <option value="almalinux-9">AlmaLinux 9</option>
                  <option value="rocky-9">Rocky Linux 9</option>
                </select>
              </div>
              <div className="input-group"><label>Plan</label>
                <select value={form.plan} onChange={e => setForm({...form, plan:e.target.value})}>
                  <option value="basic">Basic — 1 vCPU / 1GB RAM / 20GB</option>
                  <option value="standard">Standard — 2 vCPU / 4GB RAM / 80GB</option>
                  <option value="pro">Pro — 4 vCPU / 8GB RAM / 160GB</option>
                  <option value="enterprise">Enterprise — 8 vCPU / 16GB RAM / 320GB</option>
                </select>
              </div>
              <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create VPS</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
