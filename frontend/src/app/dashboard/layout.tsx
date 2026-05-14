'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const NAV = [
  { section: 'Overview', items: [
    { href: '/dashboard', icon: '⊞', label: 'Dashboard' },
    { href: '/dashboard/servers', icon: '⬡', label: 'Servers' },
  ]},
  { section: 'Hosting', items: [
    { href: '/dashboard/websites', icon: '◉', label: 'Websites' },
    { href: '/dashboard/vps', icon: '⬢', label: 'VPS' },
    { href: '/dashboard/wordpress', icon: '⊕', label: 'WordPress' },
    { href: '/dashboard/filemanager', icon: '◈', label: 'File Manager' },
    { href: '/dashboard/databases', icon: '⊗', label: 'Databases' },
  ]},
  { section: 'Services', items: [
    { href: '/dashboard/dns', icon: '◎', label: 'DNS' },
    { href: '/dashboard/email', icon: '◌', label: 'Email' },
    { href: '/dashboard/ssl', icon: '⊘', label: 'SSL' },
    { href: '/dashboard/backups', icon: '⊛', label: 'Backups' },
  ]},
  { section: 'Security', items: [
    { href: '/dashboard/security', icon: '◆', label: 'Security' },
    { href: '/dashboard/firewall', icon: '◇', label: 'Firewall' },
  ]},
  { section: 'Intelligence', items: [
    { href: '/dashboard/ai', icon: '⬡', label: 'AI Assistant' },
    { href: '/dashboard/monitoring', icon: '◈', label: 'Monitoring' },
  ]},
  { section: 'Business', items: [
    { href: '/dashboard/billing', icon: '◉', label: 'Billing' },
    { href: '/dashboard/reseller', icon: '⊕', label: 'Reseller' },
    { href: '/dashboard/git', icon: '◎', label: 'Git Deploy' },
  ]},
  { section: 'System', items: [
    { href: '/dashboard/admin', icon: '◆', label: 'Admin' },
    { href: '/dashboard/settings', icon: '⊞', label: 'Settings' },
  ]},
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const token = localStorage.getItem('dp_token');
    if (!token) router.push('/login');
  }, [router]);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  }

  function logout() {
    localStorage.removeItem('dp_token');
    router.push('/login');
  }

  return (
    <div className="app-shell" id="app-shell">
      {/* TOPBAR */}
      <header className="app-topbar">
        <button className="btn btn-ghost btn-icon" style={{ display: 'flex' }}
          aria-label="Toggle sidebar" onClick={() => setSidebarOpen(p => !p)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        <a className="topbar-brand" href="/dashboard">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none" aria-label="Devil Panel">
            <rect width="32" height="32" rx="7" fill="#e8202a"/>
            <path d="M9 8h10a7 7 0 010 14h-5v3H9V8z" fill="white"/>
          </svg>
          <span>Devil<span style={{ color: 'var(--color-primary)' }}>Panel</span></span>
        </a>

        <div className="topbar-search">
          <svg className="topbar-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input placeholder="Search anything… (Ctrl+K)" />
        </div>

        <div className="topbar-actions">
          <button className="topbar-btn" aria-label="Notifications">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span className="badge" />
          </button>

          <button className="topbar-btn" aria-label="Toggle theme" onClick={toggleTheme}>
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          <div className="user-avatar" title="Profile" onClick={() => router.push('/dashboard/settings')}>DA</div>
        </div>
      </header>

      {/* SIDEBAR */}
      <aside className={`app-sidebar${sidebarOpen ? ' mobile-open' : ''}`}>
        <a className="sidebar-logo" href="/dashboard">
          <div className="sidebar-logo-icon">
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
              <path d="M9 8h10a7 7 0 010 14h-5v3H9V8z" fill="white"/>
            </svg>
          </div>
          <div>
            <div className="sidebar-logo-text">Devil<span>Panel</span></div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>v2.0</div>
          </div>
        </a>

        {NAV.map(section => (
          <div key={section.section} className="sidebar-section">
            <div className="sidebar-section-label">{section.section}</div>
            {section.items.map(item => (
              <a key={item.href} href={item.href}
                className={`sidebar-nav-item${path === item.href ? ' active' : ''}`}
                onClick={() => setSidebarOpen(false)}>
                <span style={{ fontSize: '16px', lineHeight: 1, flexShrink: 0 }}>{item.icon}</span>
                <span>{item.label}</span>
                {item.label === 'AI Assistant' && <span className="nav-badge">New</span>}
              </a>
            ))}
          </div>
        ))}

        <div style={{ marginTop: 'auto', padding: 'var(--space-4) var(--space-3)' }}>
          <button className="sidebar-nav-item w-full btn" style={{ color: 'var(--color-error)' }} onClick={logout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="app-main">
        {children}
      </main>
    </div>
  );
}
