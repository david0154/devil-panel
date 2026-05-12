import Head from 'next/head';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function MonitoringPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['monitoring-stats'],
    queryFn: () => api.get('/servers').then(r => r.data[0]?.stats || null),
    refetchInterval: 5000,
  });

  const mockHistory = Array.from({ length: 20 }, (_, i) => ({
    t: `${i}m`,
    cpu: Math.floor(20 + Math.random() * 60),
    ram: Math.floor(40 + Math.random() * 40),
    net: Math.floor(Math.random() * 100),
  }));

  const gauges = [
    { label: 'CPU Usage',     value: stats?.cpu_usage    || 41,  unit: '%',  color: '#e60000' },
    { label: 'RAM Usage',     value: stats?.ram_used_pct || 55,  unit: '%',  color: '#2196f3' },
    { label: 'Disk Usage',    value: stats?.disk_used_pct|| 38,  unit: '%',  color: '#ff9800' },
    { label: 'Network In',    value: stats?.net_in_mb    || 12,  unit: 'MB/s', color: '#00c853' },
  ];

  return (
    <>
      <Head><title>Monitoring — Devil Panel</title></Head>
      <div className="page animate-fade-in">
        <div className="page__header">
          <h1>Monitoring</h1>
          <span className="badge badge--success"><span className="pulse-dot" style={{ marginRight: 6 }} />Live</span>
        </div>

        <div className="stats-grid" style={{ marginBottom: 32 }}>
          {gauges.map(g => (
            <div key={g.label} className="stat-card">
              <div className="stat-card__label">{g.label}</div>
              <div className="stat-card__value" style={{ color: g.color }}>{g.value}{g.unit}</div>
              <div className="progress" style={{ marginTop: 8 }}>
                <div className="progress__bar" style={{ width: `${Math.min(g.value, 100)}%`, background: g.color }} />
              </div>
            </div>
          ))}
        </div>

        <div className="monitoring__grid">
          <div className="card">
            <div className="card__header"><span className="card__header-title">CPU & RAM History</span></div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={mockHistory}>
                <defs>
                  <linearGradient id="c" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e60000" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#e60000" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="r" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2196f3" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2196f3" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1c1c1c" />
                <XAxis dataKey="t" tick={{ fill: '#555', fontSize: 10 }} />
                <YAxis tick={{ fill: '#555', fontSize: 10 }} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #222', borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="cpu" stroke="#e60000" fill="url(#c)" name="CPU %" strokeWidth={2} />
                <Area type="monotone" dataKey="ram" stroke="#2196f3" fill="url(#r)" name="RAM %" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <div className="card__header"><span className="card__header-title">Network Traffic</span></div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={mockHistory}>
                <CartesianGrid stroke="#1c1c1c" />
                <XAxis dataKey="t" tick={{ fill: '#555', fontSize: 10 }} />
                <YAxis tick={{ fill: '#555', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #222', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="net" stroke="#00c853" strokeWidth={2} dot={false} name="MB/s" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}
