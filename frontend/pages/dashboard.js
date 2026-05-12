import { useEffect, useState } from 'react';
import DashboardShell from '../components/layout/DashboardShell';
import StatCard from '../components/ui/StatCard';
import ProgressBar from '../components/ui/ProgressBar';
import {
  RiServerLine, RiGlobalLine, RiShieldLine, RiRobotLine,
  RiMailLine, RiAlertLine, RiCheckLine, RiArrowRightLine, RiDatabase2Line
} from 'react-icons/ri';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import api from '../lib/api';
import Link from 'next/link';

const mockTraffic = [
  { t: '00:00', in: 120, out: 80 }, { t: '04:00', in: 200, out: 140 },
  { t: '08:00', in: 450, out: 300 }, { t: '12:00', in: 600, out: 420 },
  { t: '16:00', in: 520, out: 380 }, { t: '20:00', in: 380, out: 260 },
  { t: '23:59', in: 280, out: 200 },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/servers/stats').then(r => setStats(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const cpu = stats?.cpu || 34;
  const ram = stats?.ram || 52;
  const disk = stats?.disk || 41;

  return (
    <DashboardShell>
      {/* Header */}
      <div className="dp-page-header">
        <div>
          <h1 className="dp-page-title">Dashboard</h1>
          <p className="dp-page-subtitle">Welcome back! Here's what's happening with your servers.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="dp-badge-green">All Systems Normal</div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Active Websites" value="24" icon={RiGlobalLine} color="blue" change={4} />
        <StatCard label="Servers" value="6" icon={RiServerLine} color="green" change={0} />
        <StatCard label="Emails" value="148" icon={RiMailLine} color="purple" change={12} />
        <StatCard label="Security Events" value="3" icon={RiShieldLine} color="yellow" />
      </div>

      {/* Resource Usage + Traffic */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Resource Usage */}
        <div className="dp-card">
          <h3 className="text-devil-text font-semibold mb-4">Resource Usage</h3>
          <div className="flex flex-col gap-5">
            <ProgressBar label="CPU Usage" value={cpu} color="auto" />
            <ProgressBar label="RAM Usage" value={ram} color="auto" />
            <ProgressBar label="Disk Usage" value={disk} color="auto" />
            <div className="grid grid-cols-3 gap-3 mt-1">
              {[
                { label: 'CPU', value: `${cpu}%`, color: 'text-green-400' },
                { label: 'RAM', value: `${ram}%`, color: 'text-yellow-400' },
                { label: 'Disk', value: `${disk}%`, color: 'text-green-400' },
              ].map(s => (
                <div key={s.label} className="text-center p-2 bg-devil-surface2 rounded-lg">
                  <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-devil-muted text-xs">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Network Traffic */}
        <div className="dp-card col-span-1 lg:col-span-2">
          <h3 className="text-devil-text font-semibold mb-4">Network Traffic (Today)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={mockTraffic}>
              <defs>
                <linearGradient id="inGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e11d48" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="outGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
              <XAxis dataKey="t" stroke="#8888aa" tick={{ fontSize: 11 }} />
              <YAxis stroke="#8888aa" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#12121a', border: '1px solid #2a2a3e', borderRadius: '8px', color: '#e2e2f0', fontSize: '12px' }}
                cursor={{ stroke: '#e11d48', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area type="monotone" dataKey="in" stroke="#e11d48" strokeWidth={2} fill="url(#inGrad)" name="Inbound MB/s" />
              <Area type="monotone" dataKey="out" stroke="#3b82f6" strokeWidth={2} fill="url(#outGrad)" name="Outbound MB/s" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="dp-card">
          <h3 className="text-devil-text font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Add Website', href: '/websites', icon: RiGlobalLine, color: 'blue' },
              { label: 'Add Server', href: '/vps', icon: RiServerLine, color: 'green' },
              { label: 'AI Assistant', href: '/ai', icon: RiRobotLine, color: 'purple' },
              { label: 'DNS Manager', href: '/dns', icon: RiDatabase2Line, color: 'cyan' },
            ].map(a => (
              <Link key={a.href} href={a.href}
                className="flex items-center gap-3 p-3 bg-devil-surface2 hover:bg-devil-surface3 border border-devil-border hover:border-devil-red/30 rounded-lg transition-all duration-200 group"
              >
                <a.icon size={20} className="text-devil-muted group-hover:text-devil-red transition-colors" />
                <span className="text-devil-text text-sm font-medium">{a.label}</span>
                <RiArrowRightLine size={14} className="text-devil-border group-hover:text-devil-red ml-auto transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dp-card">
          <h3 className="text-devil-text font-semibold mb-4">Recent Activity</h3>
          <div className="flex flex-col gap-3">
            {[
              { msg: 'SSL certificate renewed for example.com', type: 'success', time: '2m ago' },
              { msg: 'New website deployed: shop.domain.in', type: 'success', time: '15m ago' },
              { msg: 'Failed login attempt blocked from 45.33.32.11', type: 'warning', time: '1h ago' },
              { msg: 'Backup completed for server-01', type: 'success', time: '2h ago' },
              { msg: 'High CPU usage detected on vps-02', type: 'alert', time: '3h ago' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-2.5 bg-devil-surface2/50 rounded-lg">
                <div className={`mt-0.5 flex-shrink-0 ${
                  item.type === 'success' ? 'text-green-400' :
                  item.type === 'warning' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {item.type === 'success' ? <RiCheckLine size={16} /> : <RiAlertLine size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-devil-text text-xs leading-relaxed">{item.msg}</p>
                  <p className="text-devil-muted text-[10px] mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
