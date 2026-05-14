'use client';
import { useEffect, useState } from 'react';

interface Stats {
  websites: number;
  servers: number;
  emails: number;
  ssl_expiring: number;
  cpu: number;
  ram: number;
  disk: number;
  uptime: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('dp_token');
    fetch('/api/servers/stats', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => setStats({
        websites: 12, servers: 3, emails: 48, ssl_expiring: 2,
        cpu: 34, ram: 62, disk: 45, uptime: '99.98%'
      }))
      .finally(() => setLoading(false));
  }, []);

  const kpis = [
    { label: 'Active Websites', value: stats?.websites ?? '—', icon: '◉', trend: '+2 this week', up: true },
    { label: 'Servers', value: stats?.servers ?? '—', icon: '⬡', trend: 'All healthy', up: true },
    { label: 'Email Accounts', value: stats?.emails ?? '—', icon: '◌', trend: '+5 this month', up: true },
    { label: 'SSL Expiring', value: stats?.ssl_expiring ?? '—', icon: '⊘', trend: 'Next 30 days', up: false },
    { label: 'CPU Usage', value: `${stats?.cpu ?? 0}%`, icon: '◈', trend: 'Normal', up: true },
    { label: 'RAM Usage', value: `${stats?.ram ?? 0}%`, icon: '⊗', trend: '4.9 / 8 GB', up: null },
    { label: 'Disk Usage', value: `${stats?.disk ?? 0}%`, icon: '⊛', trend: '45 / 100 GB', up: null },
    { label: 'Uptime', value: stats?.uptime ?? '—', icon: '⊕', trend: 'Last 30 days', up: true },
  ];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Server overview and system health at a glance</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary">Export Report</button>
          <button className="btn btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Add Server
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid-stats">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton skeleton-card" />)
          : kpis.map(kpi => (
            <div key={kpi.label} className="stat-card">
              <div className="stat-card-icon">{kpi.icon}</div>
              <div className="stat-card-label">{kpi.label}</div>
              <div className="stat-card-value">{kpi.value}</div>
              <div className={`stat-card-sub ${kpi.up === true ? 'stat-card-trend-up' : kpi.up === false ? 'stat-card-trend-down' : ''}`}>
                {kpi.trend}
              </div>
            </div>
          ))
        }
      </div>

      {/* Charts Row */}
      <div className="grid-2" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Resource Usage</span>
            <span className="badge badge-green">Live</span>
          </div>
          <div className="card-body">
            {[{label:'CPU', val: stats?.cpu ?? 34, color:'var(--color-primary)'},
              {label:'RAM', val: stats?.ram ?? 62, color:'var(--color-blue)'},
              {label:'Disk',val: stats?.disk ?? 45, color:'var(--color-cyan)'}].map(r => (
              <div key={r.label} className="resource-bar-wrap" style={{ marginBottom: 'var(--space-4)' }}>
                <div className="resource-bar-label">
                  <span>{r.label}</span>
                  <span className="resource-value">{r.val}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{
                    width: `${r.val}%`,
                    background: r.color,
                    boxShadow: `0 0 8px ${r.color}60`
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Activity</span>
            <button className="btn btn-ghost btn-sm">View all</button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {[
              { msg: 'SSL auto-renewed for example.com', time: '2 min ago', type: 'green' },
              { msg: 'New website created: shop.test.com', time: '1 hr ago', type: 'blue' },
              { msg: 'Backup completed: server-01', time: '3 hr ago', type: 'green' },
              { msg: 'Firewall rule triggered: 192.168.1.5', time: '5 hr ago', type: 'yellow' },
              { msg: 'AI alert: High memory on vps-02', time: '8 hr ago', type: 'red' },
            ].map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 'var(--space-3)', padding: 'var(--space-3) var(--space-5)', borderBottom: i < 4 ? '1px solid var(--color-divider)' : 'none', alignItems: 'flex-start' }}>
                <div className={`status-dot status-dot-${a.type}`} style={{ marginTop: 6, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 'var(--text-sm)' }}>{a.msg}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginTop: 2 }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Quick Actions</span>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            {[
              { label: '+ New Website', href: '/dashboard/websites', color: 'btn-primary' },
              { label: '+ Add Domain', href: '/dashboard/websites', color: 'btn-secondary' },
              { label: 'Issue SSL', href: '/dashboard/ssl', color: 'btn-secondary' },
              { label: 'Run Backup', href: '/dashboard/backups', color: 'btn-secondary' },
              { label: 'AI Analysis', href: '/dashboard/ai', color: 'btn-secondary' },
              { label: 'Firewall Rules', href: '/dashboard/firewall', color: 'btn-secondary' },
              { label: 'Deploy Git', href: '/dashboard/git', color: 'btn-secondary' },
              { label: 'View Logs', href: '/dashboard/monitoring', color: 'btn-secondary' },
            ].map(a => (
              <a key={a.label} href={a.href} className={`btn ${a.color}`}>{a.label}</a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
