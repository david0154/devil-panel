import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

const NAV_ITEMS = [
  { section: 'Main' },
  { href: '/dashboard',   icon: '🏠', key: 'nav.dashboard' },
  { href: '/websites',    icon: '🌐', key: 'nav.websites' },
  { href: '/vps',         icon: '🖥️', key: 'nav.vps' },
  { href: '/dns',         icon: '🔍', key: 'nav.dns' },
  { href: '/email',       icon: '✉️', key: 'nav.email' },
  { section: 'Tools' },
  { href: '/ssl',         icon: '🔒', key: 'nav.ssl' },
  { href: '/security',    icon: '🛡️', key: 'nav.security' },
  { href: '/filemanager', icon: '📁', key: 'nav.filemanager' },
  { href: '/wordpress',   icon: '📝', key: 'nav.wordpress' },
  { href: '/git',         icon: '📦', key: 'nav.git' },
  { section: 'Infrastructure' },
  { href: '/backups',     icon: '💾', key: 'nav.backups' },
  { href: '/monitoring',  icon: '📊', key: 'nav.monitoring' },
  { href: '/ai',          icon: '🤖', key: 'nav.ai', badge: 'AI' },
  { section: 'Business' },
  { href: '/billing',     icon: '💳', key: 'nav.billing' },
  { href: '/reseller',    icon: '🏬', key: 'nav.reseller' },
  { href: '/settings',    icon: '⚙️', key: 'nav.settings' },
];

export default function Sidebar({ open, collapsed, onToggleCollapse, onClose }) {
  const router = useRouter();
  const { t } = useTranslation('common');

  const navLabel = (key) => {
    const labels = {
      'nav.dashboard':   'Dashboard',
      'nav.websites':    'Websites',
      'nav.vps':         'VPS',
      'nav.dns':         'DNS',
      'nav.email':       'Email',
      'nav.ssl':         'SSL',
      'nav.security':    'Security',
      'nav.filemanager': 'File Manager',
      'nav.wordpress':   'WordPress',
      'nav.git':         'Git Deploy',
      'nav.backups':     'Backups',
      'nav.monitoring':  'Monitoring',
      'nav.ai':          'AI Assistant',
      'nav.billing':     'Billing',
      'nav.reseller':    'Reseller',
      'nav.settings':    'Settings',
    };
    return labels[key] || key;
  };

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}${open ? ' open' : ''}`}>
      <div className="sidebar-logo">
        <Link href="/dashboard" className="logo-brand" onClick={onClose}>
          <div className="logo-icon">D</div>
          <div className="logo-text">
            <span className="name">Devil Panel</span>
            <span className="tagline">Hosting Control</span>
          </div>
        </Link>
        <button className="sidebar-toggle" onClick={onToggleCollapse} title="Toggle sidebar">
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {NAV_ITEMS.map((item, i) => {
        if (item.section) {
          return (
            <div key={i} className="nav-section">
              <div className="nav-section-title">{item.section}</div>
            </div>
          );
        }
        const isActive = router.pathname === item.href;
        return (
          <nav key={i} className="nav-list">
            <Link
              href={item.href}
              className={`nav-item${isActive ? ' active' : ''}`}
              onClick={onClose}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{navLabel(item.key)}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </Link>
          </nav>
        );
      })}

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">A</div>
          <div className="user-details">
            <div className="user-name">Admin User</div>
            <div className="user-role">Super Administrator</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
