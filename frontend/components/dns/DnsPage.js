import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { RiAddLine, RiDeleteBinLine, RiRefreshLine } from 'react-icons/ri'
import api from '../../lib/api'

export default function DnsPage() {
  const [zones, setZones] = useState([])
  const [records, setRecords] = useState([])
  const [selectedZone, setSelectedZone] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [rec, setRec] = useState({ type:'A', name:'', content:'', ttl:3600, priority:'' })
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchZones() }, [])
  useEffect(() => { if(selectedZone) fetchRecords(selectedZone) }, [selectedZone])

  const fetchZones = async () => {
    setLoading(true)
    try { const r = await api.get('/dns/zones'); setZones(r.data.zones || []) }
    catch { setZones([]) } finally { setLoading(false) }
  }

  const fetchRecords = async (zone) => {
    try { const r = await api.get(`/dns/zones/${zone}/records`); setRecords(r.data.records || []) }
    catch { setRecords([]) }
  }

  const addRecord = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/dns/zones/${selectedZone}/records`, rec)
      toast.success('Record added')
      setShowAdd(false)
      fetchRecords(selectedZone)
    } catch(e) { toast.error(e.response?.data?.error || 'Failed') }
  }

  const deleteRecord = async (id) => {
    try { await api.delete(`/dns/records/${id}`); toast.success('Deleted'); fetchRecords(selectedZone) }
    catch { toast.error('Failed') }
  }

  const TYPES = ['A','AAAA','CNAME','MX','TXT','NS','SRV','CAA','PTR']

  return (
    <div>
      <div className="page-header">
        <div><h1>DNS Management</h1><p>PowerDNS — Zones &amp; Records</p></div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)} disabled={!selectedZone}><RiAddLine /> Add Record</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:'1.25rem' }}>
        {/* Zones panel */}
        <div className="card">
          <div style={{ fontWeight:700, marginBottom:'1rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            DNS Zones <button className="btn btn-ghost btn-sm" onClick={fetchZones}><RiRefreshLine /></button>
          </div>
          {loading ? <div className="loading-spinner sm" /> : zones.map((z,i) => (
            <div key={i} onClick={() => setSelectedZone(z.name || z)}
              style={{ padding:'0.65rem 0.75rem', borderRadius:8, cursor:'pointer', marginBottom:'0.25rem',
                background: selectedZone === (z.name||z) ? 'rgba(230,57,70,0.1)' : 'transparent',
                color: selectedZone === (z.name||z) ? '#e63946' : '#f0f0f5',
                border: selectedZone === (z.name||z) ? '1px solid rgba(230,57,70,0.3)' : '1px solid transparent'
              }}>{z.name || z}</div>
          ))}
          {zones.length === 0 && !loading && <p style={{ color:'#555570', fontSize:'0.85rem' }}>No zones found</p>}
        </div>

        {/* Records table */}
        <div>
          {selectedZone ? (
            <div>
              <div style={{ marginBottom:'1rem', fontWeight:700, color:'#e63946' }}>{selectedZone}</div>
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Type</th><th>Name</th><th>Content</th><th>TTL</th><th>Priority</th><th></th></tr></thead>
                  <tbody>
                    {records.map((r,i) => (
                      <tr key={i}>
                        <td><span className="badge red">{r.type}</span></td>
                        <td style={{ fontFamily:'monospace' }}>{r.name}</td>
                        <td style={{ fontFamily:'monospace', maxWidth:200, overflow:'hidden', textOverflow:'ellipsis' }}>{r.content}</td>
                        <td>{r.ttl}</td>
                        <td>{r.priority || '—'}</td>
                        <td><button className="btn btn-danger btn-sm" onClick={() => deleteRecord(r.id)}><RiDeleteBinLine /></button></td>
                      </tr>
                    ))}
                    {records.length === 0 && <tr><td colSpan={6} style={{ textAlign:'center', color:'#555570' }}>No records</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign:'center', padding:'3rem' }}>
              <p style={{ color:'#8888a8' }}>Select a DNS zone to view records</p>
            </div>
          )}
        </div>
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Add DNS Record</h2><button onClick={() => setShowAdd(false)}>×</button></div>
            <form onSubmit={addRecord} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div className="input-group"><label>Record Type</label>
                <select value={rec.type} onChange={e => setRec({...rec, type:e.target.value})}>
                  {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="input-group"><label>Name</label><input value={rec.name} onChange={e => setRec({...rec, name:e.target.value})} placeholder="@ or subdomain" required /></div>
              <div className="input-group"><label>Content / Value</label><input value={rec.content} onChange={e => setRec({...rec, content:e.target.value})} placeholder="IP or hostname" required /></div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                <div className="input-group"><label>TTL (seconds)</label><input type="number" value={rec.ttl} onChange={e => setRec({...rec, ttl:e.target.value})} /></div>
                <div className="input-group"><label>Priority (MX/SRV)</label><input type="number" value={rec.priority} onChange={e => setRec({...rec, priority:e.target.value})} /></div>
              </div>
              <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
