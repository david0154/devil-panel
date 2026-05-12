import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { RiEyeLine, RiEyeOffLine, RiShieldLine } from 'react-icons/ri';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [twoFA, setTwoFA] = useState(false);
  const [token2FA, setToken2FA] = useState('');
  const { login, loading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(form.email, form.password, twoFA ? token2FA : undefined);
    if (res.success) {
      toast.success('Welcome back!');
      router.push('/dashboard');
    } else if (res.requires2FA) {
      setTwoFA(true);
    } else {
      toast.error(res.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-devil-bg grid-bg flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="fixed inset-0 bg-glow-gradient pointer-events-none" />

      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-devil-gradient rounded-2xl shadow-neon mb-4">
            <span className="text-white font-black text-2xl">D</span>
          </div>
          <h1 className="text-2xl font-bold text-devil-text">Devil Panel</h1>
          <p className="text-devil-muted text-sm mt-1">Powering Fast, Secure & Intelligent Hosting</p>
        </div>

        {/* Card */}
        <div className="dp-card">
          <h2 className="text-lg font-semibold text-devil-text mb-6">
            {twoFA ? 'Two-Factor Authentication' : 'Sign in to your account'}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!twoFA ? (
              <>
                <div className="dp-form-group">
                  <label className="dp-label">Email Address</label>
                  <input
                    type="email"
                    className="dp-input"
                    placeholder="admin@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div className="dp-form-group">
                  <label className="dp-label">Password</label>
                  <div className="relative">
                    <input
                      type={show ? 'text' : 'password'}
                      className="dp-input pr-10"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-devil-muted hover:text-devil-text"
                      onClick={() => setShow(!show)}
                    >
                      {show ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <a href="/forgot-password" className="text-devil-red text-xs hover:underline">Forgot password?</a>
                </div>
              </>
            ) : (
              <div className="dp-form-group">
                <div className="flex items-center gap-2 p-3 bg-blue-900/20 border border-blue-800/30 rounded-lg mb-3">
                  <RiShieldLine className="text-blue-400" />
                  <span className="text-blue-300 text-sm">Enter the 6-digit code from your authenticator app</span>
                </div>
                <label className="dp-label">Authentication Code</label>
                <input
                  type="text"
                  className="dp-input text-center text-2xl tracking-widest font-mono"
                  placeholder="000000"
                  maxLength={6}
                  value={token2FA}
                  onChange={(e) => setToken2FA(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="dp-btn-primary dp-btn w-full dp-btn-lg mt-2"
              disabled={loading}
            >
              {loading ? <span className="dp-spinner" /> : (twoFA ? 'Verify' : 'Sign In')}
            </button>
          </form>
        </div>

        <p className="text-center text-devil-muted text-xs mt-6">
          &copy; 2025 Devil One Pvt Ltd &mdash; Devil Panel v1.0
        </p>
      </div>
    </div>
  );
}
