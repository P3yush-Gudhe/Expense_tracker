import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        if (!form.name.trim()) { setError('Name is required'); setLoading(false); return; }
        await register(form.name, form.email, form.password);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => { setIsLogin(!isLogin); setError(''); setForm({ name: '', email: '', password: '' }); };

  return (
    <div className="auth-page">
      {/* Left decorative panel */}
      <div className="auth-left">
        <div className="auth-left-blob1" />
        <div className="auth-left-blob2" />
        <div className="auth-left-content">
          <div className="auth-left-icon">
            <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2>Smart Money,<br />Smarter Decisions</h2>
          <p>Track every expense, set budgets, and understand your spending patterns in one place.</p>
          <div className="auth-features">
            {[
              { emoji: '📊', text: 'Visual analytics & spending trends' },
              { emoji: '🎯', text: 'Set budgets and stay on track' },
              { emoji: '🔒', text: 'Secure, private, and personal' },
            ].map(f => (
              <div className="auth-feature-item" key={f.text}>
                <div className="auth-feature-dot">{f.emoji}</div>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <div className="auth-card-logo">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="auth-card-title">{isLogin ? 'Welcome back!' : 'Create account'}</div>
            <div className="auth-card-subtitle">{isLogin ? 'Sign in to your ExpenseIQ account' : 'Start tracking your expenses today'}</div>
          </div>

          {error && (
            <div className="alert alert-error">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{flexShrink:0}}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="form-stack">
            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" name="name" type="text" placeholder="John Doe" value={form.name} onChange={handleChange} required autoComplete="name" />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input className="form-input" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required autoComplete="email" />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" name="password" type="password" placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required autoComplete={isLogin ? 'current-password' : 'new-password'} />
            </div>
            <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{marginTop: 4}}>
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-secondary)' }}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button className="link-btn" onClick={switchMode}>
              {isLogin ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
