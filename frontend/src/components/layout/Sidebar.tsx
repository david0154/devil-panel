import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard, Globe, Server, Shield, Mail, Lock,
  Activity, Bot, CreditCard, Users, Settings, LogOut,
  Database, GitBranch, HardDrive, Network, Bell, ChevronLeft,
  Package, FolderOpen, Layers
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import clsx from 'clsx';

const navSections = [
  {
    title: 'Main',
    items: [
      { href: '/dashboard',  label: 'Dashboard',   icon: LayoutDashboard },
      { href: '/websites',   label: 'Websites',    icon: Globe },
      { href: '/servers',    label: 'Servers',     icon: Server },
      { href: '/vps',        label: 'VPS',         icon: Layers },
    ]
  },
  {
    title: 'Services',
    items: [
      { href: '/dns',        label: 'DNS',         icon: Network },
      { href: '/email',      label: 'Email',       icon: Mail },
      { href: '/ssl',        label: 'SSL',         icon: Lock },
      { href: '/databases',  label: 'Databases',   icon: Database },
      { href: '/files',      label: 'File Manager',icon: FolderOpen },
      { href: '/git',        label: 'Git Deploy',  icon: GitBranch },
      { href: '/backups',    label: 'Backups',     icon: HardDrive },
    ]
  },
  {
    title: 'Security & AI',
    items: [
      { href: '/security',   label: 'Security',    icon: Shield },
      { href: '/firewall',   label: 'Firewall',    icon: Shield },
      { href: '/monitoring', label: 'Monitoring',  icon: Activity },
      { href: '/ai',         label: 'AI Assistant',icon: Bot },
    ]
  },
  {
    title: 'Business',
    items: [
      { href: '/billing',    label: 'Billing',     icon: CreditCard },
      { href: '/reseller',   label: 'Reseller',    icon: Package },
      { href: '/users',      label: 'Users',       icon: Users },
    ]
  },
  {
    title: 'System',
    items: [
      { href: '/notifications', label: 'Alerts',  icon: Bell },
      { href: '/settings',   label: 'Settings',   icon: Settings },
    ]
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  return (
    <>
      {mobileOpen && <div className="sidebar-overlay" onClick={onMobileClose} />}
      <aside className={clsx('sidebar', { 'sidebar--collapsed': collapsed, 'sidebar--open': mobileOpen })}>
        {/* Logo */}
        <Link href="/dashboard" className="sidebar__logo">
          <div className="sidebar__logo-icon">D</div>
          <div className="sidebar__logo-text">
            <strong>Devil Panel</strong>
            <span>by Devil One</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="sidebar__nav">
          {navSections.map((section) => (
            <div key={section.title} className="sidebar__section">
              <div className="sidebar__section-title">{section.title}</div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = router.pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx('sidebar__item', { 'sidebar__item--active': active })}
                    onClick={onMobileClose}
                  >
                    <Icon className="sidebar__item-icon" size={18} />
                    <span className="sidebar__item-label">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="sidebar__bottom">
          <div className="sidebar__user">
            <div className="sidebar__user-avatar">
              {(user?.username?.[0] || 'U').toUpperCase()}
            </div>
            <div className="sidebar__user-info">
              <strong>{user?.username || 'Admin'}</strong>
              <span>{user?.role || 'Administrator'}</span>
            </div>
          </div>
          <button
            className="sidebar__item"
            onClick={async () => { await logout(); router.push('/login'); }}
            style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}
          >
            <LogOut className="sidebar__item-icon" size={18} />
            <span className="sidebar__item-label">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
