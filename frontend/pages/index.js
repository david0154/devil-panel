import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import Spinner from '../components/ui/Spinner';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) router.replace('/dashboard');
    else router.replace('/login');
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-devil-bg flex items-center justify-center">
      <Spinner text="Loading Devil Panel..." />
    </div>
  );
}
