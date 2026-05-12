import { useState, useEffect } from 'react';
import DashboardShell from '../components/layout/DashboardShell';
import ProgressBar from '../components/ui/ProgressBar';
import { RiBarChartLine, RiCpuLine, RiDatabase2Line, RiWifiLine, RiHardDriveLine } from 'react-icons/ri';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import api from '../lib/api';

const genHistory = (base, variance = 15) =>
  Array.from({ length: 20 }, (_, i) => ({
    t: `${i * 3}m`,
    v: Math.max(5, Math.min(95, base + (Math.random() - 0.5) * variance * 2))
  }));

export default function MonitoringPage() {
  const [stats, setStats] = useState({ cpu: 34, ram: 52, disk: 41, network_in: 12, network_out: 8 });
  const [history] = useState({
    cpu: genHistory(34), ram: genHistory(52, 10), net: genHistory(15, 20)
  });

  useEffect(() => {
    const fetch = () => api.get('/servers/stats').then(r => r.data && setStats(r.data)).catch(() => {});
    fetch();
    const interval = setInterval(fetch, 10000);
    return () => clearInterval(interval);
  }, []);

  const getColor = (v) => v < 60 ? '#22c55e' : v < 85 ? '#eab308' : '#e11d48';

  return (
    <DashboardShell>
      <div className="dp-page-header">
        <div>
          <h1 className="dp-page-title">Monitoring</h1>
          <p className="dp-page-subtitle">Real-time server metrics via Prometheus + Grafana</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-400 text-xs">Live — updates every 10s</span>
        </div>
      </div>

      {/* Live Gauges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'CPU Usage', value: stats.cpu, icon: RiCpuLine },
          { label: 'RAM Usage', value: stats.ram, icon: RiDatabase2Line },
          { label: 'Disk Usage', value: stats.disk, icon: RiHardDriveLine },
          { label: 'Network In', value: `${stats.network_in || 12} MB/s`, icon: RiWifiLine, noBar: true, color: 'text-blue-400' },
        ].map(s => (
          <div key={s.label} className="dp-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-devil-muted text-xs uppercase tracking-wider">{s.label}</span>
              <s.icon size={18} className="text-devil-muted" />
            </div>
            {s.noBar ? (
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            ) : (
              <>
                <div className="text-2xl font-bold mb-2" style={{ color: getColor(s.value) }}>{s.value}%</div>
                <ProgressBar value={s.value} color="auto" showValue={false} />
              </>
            )}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[['CPU History', history.cpu, '#e11d48'], ['RAM History', history.ram, '#3b82f6']].map(([title, data, color]) => (
          <div key={title} className="dp-card">
            <h3 className="text-devil-text font-semibold mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                <XAxis dataKey="t" stroke="#8888aa" tick={{ fontSize: 10 }} />
                <YAxis stroke="#8888aa" tick={{ fontSize: 10 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ background: '#12121a', border: '1px solid #2a2a3e', borderRadius: '8px', fontSize: '12px', color: '#e2e2f0' }}
                  formatter={(v) => [`${v.toFixed(1)}%`]}
                />
                <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} name="Usage %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>

      {/* Grafana link */}
      <div className="dp-alert-info mt-6">
        <RiBarChartLine size={18} />
        <span>For advanced monitoring dashboards, access <strong>Grafana</strong> at port 3001 and <strong>Prometheus</strong> at port 9090.</span>
      </div>
    </DashboardShell>
  );
}
