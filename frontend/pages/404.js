import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-devil-bg grid-bg flex items-center justify-center p-4">
      <div className="text-center animate-fade-in">
        <div className="text-[120px] font-black leading-none neon-text">404</div>
        <h2 className="text-2xl font-bold text-devil-text mt-2">Page Not Found</h2>
        <p className="text-devil-muted mt-2 mb-8">The page you're looking for doesn't exist.</p>
        <Link href="/dashboard" className="dp-btn-primary dp-btn dp-btn-lg">Back to Dashboard</Link>
      </div>
    </div>
  );
}
