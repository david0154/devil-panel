import { useState, useEffect } from 'react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { RiServerLine, RiGlobalLine, RiShieldLine, RiBrainLine, RiArrowUpLine, RiArrowDownLine } from 'react-icons/ri'
import api from '../../lib/api'
import styles from '../../styles/dashboard.module.scss'

const mockTraffic = [
  { t:'00:00', in:120, out:80 }, { t:'04:00', in:90, out:60 }, { t:'08:00', in:340, out:200 },
  { t:'12:00', in:520, out:380 }, { t:'16:00', in:480, out:290 }, { t:'20:00', in:310, out:180 }, { t:'Now', in:290, out:160 }
]
const mockCpu = [
  { h:'1h', v:45 },{ h:'2h', v:62 },{ h:'3h', v:38 },{ h:'4h', v:55 },{ h:'5h', v:71 },{ h:'6h', v:48 },{ h:'Now', v:53 }
]
const STATS = [
  { label:'Active Servers', value:'12', icon:<RiServerLine />, trend:'+2', up:true, cls:'red' },
  { label:'Websites', value:'47', icon:<RiGlobalLine />, trend:'+5', up:true, cls:'green' },
  { label:'Security Alerts', value:'3', icon:<RiShieldLine />, trend:'-1', up:false, cls:'yellow' },
  { label:'AI Queries Today', value:'284', icon:<RiBrainLine />, trend:'+34%', up:true, cls:'blue' },
]
const ACTIVITY = [
  { dot:'#2dd4bf', text: <><strong>New website</strong> example.com added</>, time:'2m ago' },
  { dot:'#e63946', text: <><strong>SSL certificate</strong> renewed for shop.com</>, time:'18m ago' },
  { dot:'#fbbf24', text: <><strong>Backup</strong> completed for Server 01</>, time:'1h ago' },
  { dot:'#60a5fa', text: <><strong>AI</strong> detected high CPU on vps-02</>, time:'2h ago' },
  { dot:'#2dd4bf', text: <><strong>DNS</strong> zone updated for domain.in</>, time:'3h ago' },
]
const SERVERS = [
  { name:'VPS-01 Mumbai', ip:'103.21.x.x', status:'online' },
  { name:'VPS-02 Delhi', ip:'45.90.x.x', status:'online' },
  { name:'Dedicated-01', ip:'192.168.x.x', status:'warning' },
  { name:'Backup Node', ip:'10.0.x.x', status:'offline' },
]
const QUICK = [
  { icon:'🌐', label:'Add Website' },{ icon:'🛡️', label:'Run Scan' },
  { icon:'💾', label:'Backup Now' },{ icon:'🤖', label:'Ask AI' },
  { icon:'🔒', label:'Issue SSL' },{ icon:'📊', label:'Reports' },
]

export default function DashboardPage() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/servers/stats').then(r => setStats(r.data)).catch(() => {})
  }, [])

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background:'#13131a', border:'1px solid #1e1e2e', borderRadius:8, padding:'8px 12px', fontSize:'0.8rem' }}>
        <p style={{ color:'#8888a8', marginBottom:4 }}>{label}</p>
        {payload.map((p,i) => <p key={i} style={{ color:p.color }}>{p.name}: {p.value}</p>)}
      </div>
    )
  }

  return (
    <div className={styles.dashboard}>
      <div className="page-header">
        <div><h1>Dashboard</h1><p>Welcome back! Here\'s what\'s happening.</p></div>
        <div style={{ display:'flex', gap:'0.5rem' }}>
          <button className="btn btn-secondary btn-sm">Export</button>
          <button className="btn btn-primary btn-sm">+ New Server</button>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        {STATS.map((s,i) => (
          <div key={i} className={`${styles.statCard} ${styles[s.cls]}`}>
            <div className={styles.icon}>{s.icon}</div>
            <div className={styles.value}>{s.value}</div>
            <div className={styles.label}>{s.label}</div>
            <div className={`${styles.trend} ${s.up ? styles.up : styles.down}`}>
              {s.up ? <RiArrowUpLine /> : <RiArrowDownLine />} {s.trend} this week
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <div className={styles.chartTitle}><h3>Network Traffic</h3><span>Last 24h (Mbps)</span></div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={mockTraffic}>
              <defs>
                <linearGradient id="gIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e63946" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#e63946" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
              <XAxis dataKey="t" stroke="#555570" tick={{ fontSize:11 }} />
              <YAxis stroke="#555570" tick={{ fontSize:11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="in" name="Inbound" stroke="#e63946" fill="url(#gIn)" strokeWidth={2} />
              <Area type="monotone" dataKey="out" name="Outbound" stroke="#60a5fa" fill="url(#gOut)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartTitle}><h3>CPU Usage</h3><span>Last 7h (%)</span></div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={mockCpu}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
              <XAxis dataKey="h" stroke="#555570" tick={{ fontSize:11 }} />
              <YAxis stroke="#555570" tick={{ fontSize:11 }} domain={[0,100]} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="v" name="CPU %" fill="#e63946" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className={styles.bottomRow}>
        <div className={styles.activityFeed}>
          <div className={styles.feedTitle}>Recent Activity</div>
          {ACTIVITY.map((a,i) => (
            <div key={i} className={styles.feedItem}>
              <div className={styles.dot} style={{ background:a.dot }} />
              <div><div className={styles.text}>{a.text}</div><div className={styles.time}>{a.time}</div></div>
            </div>
          ))}
        </div>

        <div className={styles.serverStatus}>
          <div className={styles.title}>Server Status</div>
          {SERVERS.map((s,i) => (
            <div key={i} className={styles.serverItem}>
              <div>
                <div className={styles.name}>{s.name}</div>
                <div className={styles.ip}>{s.ip}</div>
              </div>
              <div className={`${styles.statusDot} ${styles[s.status]}`} />
            </div>
          ))}
        </div>

        <div className={styles.quickActions}>
          <div className={styles.title}>Quick Actions</div>
          <div className={styles.actions}>
            {QUICK.map((q,i) => (
              <div key={i} className={styles.actionBtn}>
                <span className={styles.icon}>{q.icon}</span>
                <span>{q.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
