import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import {
  RiDashboardLine, RiGlobalLine, RiServerLine, RiShieldLine,
  RiMailLine, RiDatabase2Line, RiRobotLine, RiBarChartLine,
  RiWalletLine, RiUserSettingsLine, RiSettings3Line, RiMenuLine,
  RiCloseLine, RiShieldKeyholeLine, RiCodeSSlashLine, RiVipCrownLine,
  RiCloudLine, RiTerminalLine
} from 'react-icons/ri';
import { useAuthStore } from '../../store/authStore';
import clsx from 'clsx';

const navGroups = [
  {
    label: 'Main',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: RiDashboardLine },
      { href: '/websites', label: 'Websites', icon: RiGlobalLine },
      { href: '/vps', label: 'VPS', icon: RiServerLine },
      { href: '/dns', label: 'DNS', icon: RiDatabase2Line },
    ],
  },
  {
    label: 'Services',
    items: [
      { href: '/email', label: 'Email', icon: RiMailLine },
      { href: '/ssl', label: 'SSL', icon: RiShieldKeyholeLine },
      { href: '/backups', label: 'Backups', icon: RiCloudLine },
      { href: '/filemanager', label: 'File Manager', icon: RiCodeSSlashLine },
      { href: '/terminal', label: 'Terminal', icon: RiTerminalLine },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { href: '/ai', label: 'AI Assistant', icon: RiRobotLine },
      { href: '/monitoring', label: 'Monitoring', icon: RiBarChartLine },
      { href: '/security', label: 'Security', icon: RiShieldLine },
    ],
  },
  {
    label: 'Business',
    items: [
      { href: '/billing', label: 'Billing', icon: RiWalletLine },
      { href: '/reseller', label: 'Reseller', icon: RiVipCrownLine },
      { href: '/admin', label: 'Admin', icon: RiUserSettingsLine },
    ],
  },
  {
    label: 'Account',
    items: [
      { href: '/settings', label: 'Settings', icon: RiSettings3Line },
    ],
  },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  return (
    <aside className={clsx(
      'dp-sidebar transition-all duration-300',
      collapsed ? 'w-16' : 'w-[260px]'
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-devil-border">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-devil-gradient rounded-lg flex items-center justify-center shadow-neon-sm">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <div>
              <div className="font-bold text-devil-text text-sm leading-none">Devil Panel</div>
              <div className="text-devil-muted text-[10px] mt-0.5">Devil One Pvt Ltd</div>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-devil-gradient rounded-lg flex items-center justify-center shadow-neon-sm mx-auto">
            <span className="text-white font-bold text-sm">D</span>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="text-devil-muted hover:text-devil-text p-1 rounded"
          >
            <RiCloseLine size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-6">
            {!collapsed && (
              <div className="text-devil-muted text-[10px] font-semibold uppercase tracking-widest px-2 mb-2">
                {group.label}
              </div>
            )}
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active = router.pathname === item.href || router.pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      'dp-nav-item',
                      active && 'active',
                      collapsed && 'justify-center px-2'
                    )}
                    title={collapsed ? item.label : ''}
                  >
                    <item.icon size={18} className="flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-devil-border">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-devil-red/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-devil-red font-semibold text-sm">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-devil-text text-sm font-medium truncate">{user?.name || 'User'}</div>
              <div className="text-devil-muted text-xs truncate">{user?.role || 'admin'}</div>
            </div>
            <button
              onClick={logout}
              className="text-devil-muted hover:text-devil-red p-1 rounded text-xs"
              title="Logout"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-devil-red/20 rounded-full flex items-center justify-center">
              <span className="text-devil-red font-semibold text-sm">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
