import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { RiShieldLine, RiAlertLine, RiBanLine, RiEyeLine } from 'react-icons/ri'
import api from '../../lib/api'

export default function SecurityPage() {
  const [logs, setLogs] = useState([])
  const [blockedIPs, setBlockedIPs] = useState([])
  const [blockIP, setBlockIP] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [l, b] = await Promise.all([api.get('/security/logs'), api.get('/security/blocked-ips')])
      setLogs(l.data.logs || [])
      setBlockedIPs(b.data.ips || [])
    } catch { } finally { setLoading(false) }
  }

  const block = async () => {
    if (!blockIP) return
    try { await api.post('/firewall/block', { ip: blockIP }); toast.success(`${blockIP} blocked`); setBlockIP(''); fetchData() }
    catch(e) { toast.error(e.response?.data?.error || 'Failed') }
  }

  const unblock = async (ip) => {
    try { await api.post('/firewall/unblock', { ip }); toast.success(`${ip} unblocked`); fetchData() }
    catch { toast.error('Failed') }
  }

  const severityColor = (s) => ({ critical:'#f87171', high:'#fb923c', medium:'#fbbf24', low:'#2dd4bf' }[s] || '#8888a8')

  return (
    <div>
      <div className="page-header">
        <div><h1>Security Center</h1><p>Firewall • Fail2Ban • CrowdSec • ModSecurity • ClamAV</p></div>
        <div style={{ display:'flex', gap:'0.75rem', alignItems:'center' }}>
          <input className="" placeholder="IP to block..." value={blockIP} onChange={e=>setBlockIP(e.target.value)}
            style={{ background:'#1a1a24', border:'1px solid #1e1e2e', borderRadius:8, padding:'0.5rem 0.75rem', color:'#f0f0f5', outline:'none', fontSize:'0.875rem' }} />
          <button className="btn btn-danger" onClick={block}><RiBanLine /> Block IP</button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
        {/* Security Logs */}
        <div>
          <h3 style={{ marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.5rem' }}><RiAlertLine style={{ color:'#e63946' }} /> Security Events</h3>
          <div className="table-wrapper">
            {loading ? <div style={{ padding:'2rem', textAlign:'center' }}><div className="loading-spinner" style={{ margin:'0 auto' }} /></div> : (
              <table>
                <thead><tr><th>Time</th><th>Event</th><th>IP</th><th>Severity</th></tr></thead>
                <tbody>
                  {logs.slice(0,20).map((l,i) => (
                    <tr key={i}>
                      <td style={{ fontSize:'0.78rem', color:'#8888a8', fontFamily:'monospace' }}>{l.created_at ? new Date(l.created_at).toLocaleString() : '—'}</td>
                      <td style={{ fontSize:'0.83rem' }}>{l.action || l.event}</td>
                      <td style={{ fontFamily:'monospace', fontSize:'0.82rem' }}>{l.ip_address || '—'}</td>
                      <td><span style={{ color:severityColor(l.severity), fontWeight:600, fontSize:'0.78rem', textTransform:'uppercase' }}>{l.severity || 'info'}</span></td>
                    </tr>
                  ))}
                  {logs.length===0 && <tr><td colSpan={4} style={{ textAlign:'center', color:'#555570' }}>No security events</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Blocked IPs */}
        <div>
          <h3 style={{ marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.5rem' }}><RiBanLine style={{ color:'#f87171' }} /> Blocked IPs ({blockedIPs.length})</h3>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>IP Address</th><th>Reason</th><th>Blocked At</th><th></th></tr></thead>
              <tbody>
                {blockedIPs.map((b,i) => (
                  <tr key={i}>
                    <td style={{ fontFamily:'monospace', color:'#f87171' }}>{b.ip}</td>
                    <td style={{ fontSize:'0.82rem', color:'#8888a8' }}>{b.reason || 'Manual'}</td>
                    <td style={{ fontSize:'0.78rem', color:'#8888a8' }}>{b.blocked_at ? new Date(b.blocked_at).toLocaleString() : '—'}</td>
                    <td><button className="btn btn-success btn-sm" onClick={()=>unblock(b.ip)}>Unblock</button></td>
                  </tr>
                ))}
                {blockedIPs.length===0 && <tr><td colSpan={4} style={{ textAlign:'center', color:'#555570' }}>No blocked IPs</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
