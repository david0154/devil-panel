'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', totp: '' });
  const [step, setStep] = useState<'creds' | '2fa'>('creds');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (data.requires2fa) { setStep('2fa'); setLoading(false); return; }
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('dp_token', data.token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handle2fa(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, token: form.totp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '2FA failed');
      localStorage.setItem('dp_token', data.token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      {/* Hero panel */}
      <div className="login-hero">
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* SVG Logo */}
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-label="Devil Panel" style={{ marginBottom: 'var(--space-6)' }}>
            <rect width="48" height="48" rx="12" fill="#e8202a"/>
            <path d="M14 12h14a10 10 0 010 20H20v4h-6V12z" fill="white"/>
            <circle cx="33" cy="22" r="4" fill="rgba(255,255,255,0.3)"/>
          </svg>
          <h1 className="login-hero-title">
            Devil<span className="accent"> Panel</span>
          </h1>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 'var(--space-6)' }}>
            Devil One Pvt Ltd
          </p>
          <p className="login-hero-desc">
            Next generation hosting control panel. Manage websites, VPS, DNS, email, SSL, and AI-powered server analysis — all from one place.
          </p>
          <div style={{ marginTop: 'var(--space-10)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {['🚀 Lightweight — runs on 2GB RAM VPS', '🤖 AI-powered server analysis', '🔒 Built-in CSF + Fail2Ban security', '🌏 11 Indian languages supported'].map(f => (
              <div key={f} style={{ fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Login panel */}
      <div className="login-panel">
        {/* Top branding for mobile */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, letterSpacing: '-0.02em' }}>
            Sign in to Devil Panel
          </h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
            {step === 'creds' ? 'Enter your credentials to continue' : 'Enter your 2FA code'}
          </p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
            <span>⚠</span> {error}
          </div>
        )}

        {step === 'creds' ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" placeholder="admin@example.com" required
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="••••••••••" required
                value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'calc(-1 * var(--space-2))' }}>
              <a href="/forgot-password" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', textDecoration: 'none' }}>Forgot password?</a>
            </div>
            <button className="btn btn-primary btn-lg w-full" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handle2fa} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">Two-Factor Authentication Code</label>
              <input className="form-input font-mono" type="text" inputMode="numeric" maxLength={6}
                placeholder="000000" required
                value={form.totp} onChange={e => setForm(p => ({ ...p, totp: e.target.value }))} />
              <span className="form-hint">Enter the 6-digit code from your authenticator app</span>
            </div>
            <button className="btn btn-primary btn-lg w-full" type="submit" disabled={loading}>
              {loading ? 'Verifying…' : 'Verify & Sign In'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setStep('creds')}>
              ← Back
            </button>
          </form>
        )}

        <div className="divider" />
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', textAlign: 'center', lineHeight: 1.6 }}>
          Devil Panel v2.0 · Devil One Pvt Ltd · Protected by 2FA & Rate Limiting
        </p>
      </div>
    </div>
  );
}
