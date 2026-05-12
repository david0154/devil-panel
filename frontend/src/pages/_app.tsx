import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import '@/styles/globals.scss';
import '@/styles/_sidebar.scss';
import '@/styles/_topbar.scss';
import '@/styles/_dashboard.scss';
import '@/styles/_components.scss';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } }
});

const noLayoutPages = ['/login', '/register', '/forgot-password', '/reset-password'];

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const noLayout = noLayoutPages.includes(router.pathname);

  return (
    <QueryClientProvider client={queryClient}>
      {noLayout ? (
        <Component {...pageProps} />
      ) : (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      )}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1a1a1a',
            color: '#ffffff',
            border: '1px solid #222222',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#00c853', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#e60000', secondary: '#fff' } },
        }}
      />
    </QueryClientProvider>
  );
}
