import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Devil Panel — Next Generation Hosting Control Panel',
  description: 'Lightweight, AI-powered hosting control panel by Devil One Pvt Ltd. Manage websites, VPS, DNS, email, SSL, backups, and more.',
  keywords: 'hosting panel, control panel, VPS management, WordPress hosting, AI hosting',
  authors: [{ name: 'Devil One Pvt Ltd' }],
  themeColor: '#e8202a',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%23e8202a'/><path d='M10 8h8a6 6 0 010 12h-4v4h-4V8z' fill='white'/></svg>" />
      </head>
      <body suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                const t = document.documentElement;
                const s = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                t.setAttribute('data-theme', s);
              })();
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
