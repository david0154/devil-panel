import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout({ children, title = 'Dashboard' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('dp_sidebar_collapsed');
    if (stored) setCollapsed(stored === 'true');
  }, []);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('dp_sidebar_collapsed', String(next));
  };

  return (
    <div className="dp-layout">
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <Sidebar
        open={sidebarOpen}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        onClose={() => setSidebarOpen(false)}
      />
      <main className={`dp-main${collapsed ? ' sidebar-collapsed' : ''}`}>
        <Topbar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <div className="dp-content">{children}</div>
      </main>
      {sidebarOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 199,
            backdropFilter: 'blur(2px)'
          }}
        />
      )}
    </div>
  );
}
