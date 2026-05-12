import Head from 'next/head';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Server, Globe, Mail, Shield, HardDrive, Activity, Bot, CreditCard } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { useAuthStore } from '@/stores/authStore';

const cpuData = [
  { t: '00:00', cpu: 22, ram: 45 }, { t: '04:00', cpu: 18, ram: 42 },
  { t: '08:00', cpu: 55, ram: 58 }, { t: '12:00', cpu: 72, ram: 65 },
  { t: '16:00', cpu: 48, ram: 60 }, { t: '20:00', cpu: 35, ram: 52 },
  { t: 'Now',   cpu: 41, ram: 55 },
];

const diskData = [
  { name: 'Used', value: 45, color: '#e60000' },
  { name: 'Free', value: 55, color: '#222222' },
];

export default function Dashboard() {
  const { user } = useAuthStore();

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/servers').then(r => r.data),
    refetchInterval: 30000,
  });

  const statCards = [
    { label: 'Servers',    value: stats?.length || 0,  icon: Server,   trend: '+0 today' },
    { label: 'Websites',   value: '--',                icon: Globe,    trend: 'Active' },
    { label: 'Emails',     value: '--',                icon: Mail,     trend: 'Running' },
    { label: 'SSL Active', value: '--',                icon: Shield,   trend: 'Secure' },
    { label: 'Backups',    value: '--',                icon: HardDrive,trend: 'Latest: Today' },
    { label: 'CPU Usage',  value: '41%',               icon: Activity, trend: 'Normal' },
    { label: 'AI Queries', value: '--',                icon: Bot,      trend: 'Today' },
    { label: 'Revenue',    value: '--',                icon: CreditCard,trend: 'This month' },
  ];

  return (
    <>
      <Head><title>Dashboard — Devil Panel</title></Head>
      <div className="page animate-fade-in">

        {/* Welcome */}
        <div className="dashboard__welcome">
          <div>
            <h2>Welcome back, <span>{user?.username || 'Admin'}</span> 👋</h2>
            <p>Devil Panel is running. All systems operational.</p>
          </div>
          <div className="badge badge--success">● All Systems Online</div>
        </div>

        {/* Stat cards */}
        <div className="stats-grid">
          {statCards.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="stat-card">
                <div className="stat-card__icon"><Icon size={20} /></div>
                <div className="stat-card__label">{s.label}</div>
                <div className="stat-card__value">{s.value}</div>
                <div className="stat-card__trend">{s.trend}</div>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="dashboard__charts">
          <div className="card">
            <div className="card__header">
              <span className="card__header-title">CPU & RAM (24h)</span>
              <span className="badge badge--info">Live</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={cpuData}>
                <defs>
                  <linearGradient id="cpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e60000" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#e60000" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ram" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2196f3" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2196f3" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1c1c1c" />
                <XAxis dataKey="t" tick={{ fill: '#555', fontSize: 11 }} />
                <YAxis tick={{ fill: '#555', fontSize: 11 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ background: '#1a1a1a', border: '1px solid #222', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="cpu" stroke="#e60000" fill="url(#cpu)" name="CPU %" strokeWidth={2} />
                <Area type="monotone" dataKey="ram" stroke="#2196f3" fill="url(#ram)" name="RAM %" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <div className="card__header">
              <span className="card__header-title">Disk Usage</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={diskData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={3} dataKey="value">
                  {diskData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Legend formatter={(v) => <span style={{ color: '#a0a0a0', fontSize: '12px' }}>{v}</span>} />
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #222', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick actions */}
        <div className="card">
          <div className="card__header">
            <span className="card__header-title">Quick Actions</span>
          </div>
          <div className="dashboard__quick-actions">
            {[
              { href: '/websites',  icon: '🌐', label: 'Add Website' },
              { href: '/dns',       icon: '🔗', label: 'Manage DNS' },
              { href: '/ssl',       icon: '🔒', label: 'Issue SSL' },
              { href: '/email',     icon: '📧', label: 'New Email' },
              { href: '/backups',   icon: '💾', label: 'New Backup' },
              { href: '/ai',        icon: '🤖', label: 'Ask AI' },
              { href: '/firewall',  icon: '🛡️', label: 'Firewall' },
              { href: '/monitoring',icon: '📊', label: 'Monitor' },
            ].map(a => (
              <a key={a.href} href={a.href} className="dashboard__quick-actions-item">
                <div className="dashboard__quick-actions-item-icon">{a.icon}</div>
                <span>{a.label}</span>
              </a>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
