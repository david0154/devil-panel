import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuthStore } from '../../store/authStore';
import clsx from 'clsx';

export default function DashboardShell({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const { isAuthenticated, checkAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated]);

  return (
    <div className="flex h-screen bg-devil-bg overflow-hidden">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div
        className="flex-1 flex flex-col overflow-hidden transition-all duration-300"
        style={{ marginLeft: collapsed ? '64px' : '260px' }}
      >
        <Topbar collapsed={collapsed} setCollapsed={setCollapsed} />
        <main className="flex-1 overflow-y-auto p-6 grid-bg">
          <div className="max-w-[1400px] mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export function withDashboard(Component) {
  const Wrapped = (props) => (
    <DashboardShell>
      <Component {...props} />
    </DashboardShell>
  );
  Wrapped.getLayout = (page) => page;
  return Wrapped;
}
