import { Menu, Bell, Search, Moon, Sun, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/router';
import { useState } from 'react';

const pageTitles: Record<string, string> = {
  '/dashboard':    'Dashboard',
  '/websites':     'Websites',
  '/servers':      'Servers',
  '/vps':          'VPS Management',
  '/dns':          'DNS Manager',
  '/email':        'Email Hosting',
  '/ssl':          'SSL Certificates',
  '/files':        'File Manager',
  '/backups':      'Backups',
  '/security':     'Security Center',
  '/firewall':     'Firewall',
  '/monitoring':   'Monitoring',
  '/ai':           'AI Assistant',
  '/billing':      'Billing',
  '/reseller':     'Reseller',
  '/users':        'Users',
  '/settings':     'Settings',
  '/notifications':'Notifications',
  '/git':          'Git Deploy',
  '/databases':    'Databases',
};

interface TopbarProps {
  onMenuToggle: () => void;
}

export default function Topbar({ onMenuToggle }: TopbarProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const title = pageTitles[router.pathname] || 'Devil Panel';

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button className="topbar__menu-btn" onClick={onMenuToggle}>
          <Menu size={20} />
        </button>
        <div className="topbar__breadcrumb">
          <span>Devil Panel</span>
          <span>/</span>
          <span className="active">{title}</span>
        </div>
      </div>

      <div className="topbar__right">
        <div className="topbar__search">
          <Search className="topbar__search-icon" size={16} />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="topbar__server-status">
          <span className="dot" />
          Server Online
        </div>

        <button className="topbar__btn">
          <Bell size={18} />
          <span className="topbar__btn-badge" />
        </button>

        <button className="topbar__btn" onClick={() => router.reload()}>
          <RefreshCw size={16} />
        </button>
      </div>
    </header>
  );
}
