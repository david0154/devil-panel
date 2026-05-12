import { useState, useEffect } from 'react'
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import api from '../../lib/api'

export default function MonitoringPage() {
  const [metrics, setMetrics] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMetrics()
    const int = setInterval(fetchMetrics, 10000)
    return () => clearInterval(int)
  }, [])

  const fetchMetrics = async () => {
    try {
      const r = await api.get('/monitor/stats')
      const m = r.data
      setMetrics(m)
      setHistory(prev => [...prev.slice(-29), {
        t: new Date().toLocaleTimeString(),
        cpu: m.cpu || 0,
        ram: m.ram || 0,
        disk: m.disk || 0
      }])
    } catch { } finally { setLoading(false) }
  }

  const Gauge = ({ value, label, color }) => (
    <div className="card" style={{ textAlign:'center' }}>
      <div style={{ fontSize:'3rem', fontWeight:900, color, lineHeight:1 }}>{value?.toFixed(1) || 0}<span style={{ fontSize:'1.25rem' }}>%</span></div>
      <div style={{ color:'#8888a8', fontSize:'0.85rem', marginTop:'0.5rem' }}>{label}</div>
      <div style={{ height:6, background:'#1e1e2e', borderRadius:3, marginTop:'0.75rem' }}>
        <div style={{ height:'100%', width:`${value||0}%`, background:color, borderRadius:3, transition:'width 0.5s' }} />
      </div>
    </div>
  )

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background:'#13131a', border:'1px solid #1e1e2e', borderRadius:8, padding:'8px 12px', fontSize:'0.8rem' }}>
        <p style={{ color:'#8888a8', marginBottom:4 }}>{label}</p>
        {payload.map((p,i) => <p key={i} style={{ color:p.color }}>{p.name}: {p.value?.toFixed(1)}%</p>)}
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div><h1>Monitoring</h1><p>Real-time server metrics — refreshes every 10s</p></div>
        <span className="badge success" style={{ gap:'0.5rem' }}>
          <span style={{ width:8, height:8, background:'#2dd4bf', borderRadius:'50%', display:'inline-block', animation:'pulse 2s infinite' }} />
          Live
        </span>
      </div>

      {loading ? <div style={{ display:'flex', justifyContent:'center', padding:'3rem' }}><div className="loading-spinner" /></div> : (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
            <Gauge value={metrics?.cpu} label="CPU Usage" color="#e63946" />
            <Gauge value={metrics?.ram} label="RAM Usage" color="#60a5fa" />
            <Gauge value={metrics?.disk} label="Disk Usage" color="#fbbf24" />
            <div className="card" style={{ textAlign:'center' }}>
              <div style={{ fontSize:'1.5rem', fontWeight:800, color:'#2dd4bf' }}>{metrics?.load?.toFixed(2) || '0.00'}</div>
              <div style={{ color:'#8888a8', fontSize:'0.85rem', marginTop:'0.5rem' }}>Load Average</div>
              <div style={{ fontSize:'0.78rem', color:'#555570', marginTop:'0.5rem' }}>1 min avg</div>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem' }}>
            <div className="card">
              <h3 style={{ marginBottom:'1rem' }}>CPU &amp; RAM History</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                  <XAxis dataKey="t" stroke="#555570" tick={{ fontSize:10 }} />
                  <YAxis stroke="#555570" tick={{ fontSize:10 }} domain={[0,100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="cpu" name="CPU %" stroke="#e63946" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="ram" name="RAM %" stroke="#60a5fa" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <h3 style={{ marginBottom:'1rem' }}>Disk Usage Trend</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="diskGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                  <XAxis dataKey="t" stroke="#555570" tick={{ fontSize:10 }} />
                  <YAxis stroke="#555570" tick={{ fontSize:10 }} domain={[0,100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="disk" name="Disk %" stroke="#fbbf24" fill="url(#diskGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {metrics?.processes && (
            <div className="card" style={{ marginTop:'1.25rem' }}>
              <h3 style={{ marginBottom:'1rem' }}>Top Processes</h3>
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>PID</th><th>Name</th><th>CPU%</th><th>RAM%</th></tr></thead>
                  <tbody>
                    {metrics.processes.slice(0,10).map((p,i) => (
                      <tr key={i}>
                        <td style={{ fontFamily:'monospace' }}>{p.pid}</td>
                        <td>{p.name}</td>
                        <td style={{ color:'#e63946' }}>{p.cpu?.toFixed(1)}%</td>
                        <td style={{ color:'#60a5fa' }}>{p.mem?.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
