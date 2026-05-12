import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/stores/authStore';
import { Eye, EyeOff, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import Head from 'next/head';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ username: '', password: '', totp: '' });
  const [showPass, setShowPass] = useState(false);
  const [showTotp, setShowTotp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.username, form.password, form.totp || undefined);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Login failed';
      if (msg.includes('2FA') || msg.includes('totp')) setShowTotp(true);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head><title>Login — Devil Panel</title></Head>
      <div className="login-page">
        <div className="login-page__box">
          <div className="login-page__logo">
            <div className="login-page__logo-icon">D</div>
            <h1>Devil Panel</h1>
            <p>Powering Fast, Secure & Intelligent Hosting</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username or Email</label>
              <input
                className="input"
                type="text"
                placeholder="admin"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {showTotp && (
              <div className="form-group">
                <label>2FA Code</label>
                <input
                  className="input"
                  type="text"
                  placeholder="000000"
                  value={form.totp}
                  onChange={e => setForm({ ...form, totp: e.target.value })}
                  maxLength={6}
                  autoFocus
                />
              </div>
            )}

            <button
              type="submit"
              className="btn btn--primary btn--lg"
              style={{ width: '100%', marginTop: '8px', justifyContent: 'center' }}
              disabled={loading}
            >
              {loading ? <span className="spinner spinner--sm" /> : <Shield size={16} />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: '#555' }}>
            Devil Panel v1.0 — © 2025 Devil One Pvt Ltd
          </div>
        </div>
      </div>
    </>
  );
}
