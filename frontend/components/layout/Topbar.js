import { useState } from 'react';
import { RiMenuLine, RiBellLine, RiSearchLine, RiMoonLine } from 'react-icons/ri';
import { useAuthStore } from '../../store/authStore';

export default function Topbar({ collapsed, setCollapsed }) {
  const { user } = useAuthStore();
  const [notifications] = useState(3);

  return (
    <header className="h-16 border-b border-devil-border bg-devil-surface/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-devil-muted hover:text-devil-text transition-colors p-1.5 rounded-lg hover:bg-devil-surface2"
        >
          <RiMenuLine size={20} />
        </button>
        <div className="hidden md:flex items-center gap-2 bg-devil-surface2 border border-devil-border rounded-lg px-3 py-2 w-64">
          <RiSearchLine size={16} className="text-devil-muted" />
          <input
            placeholder="Search..."
            className="bg-transparent outline-none text-devil-text text-sm placeholder-devil-muted w-full"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        {/* Server status indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-900/20 border border-green-800/30 rounded-lg">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-400 text-xs font-medium">All Systems Operational</span>
        </div>
        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-devil-surface2 text-devil-muted hover:text-devil-text transition-colors">
          <RiBellLine size={20} />
          {notifications > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-devil-red rounded-full text-white text-[10px] flex items-center justify-center font-bold">
              {notifications}
            </span>
          )}
        </button>
        {/* User avatar */}
        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="w-8 h-8 bg-devil-red/20 rounded-full flex items-center justify-center border border-devil-red/30 group-hover:border-devil-red/60 transition-colors">
            <span className="text-devil-red font-semibold text-sm">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="hidden sm:block">
            <div className="text-devil-text text-sm font-medium">{user?.name || 'Admin'}</div>
            <div className="text-devil-muted text-xs">{user?.role || 'admin'}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
