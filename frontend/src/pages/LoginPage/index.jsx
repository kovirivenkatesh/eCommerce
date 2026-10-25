import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../../api';

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const result = await loginUser(form);
      const role = String(result.user?.role || '').trim().toLowerCase();
      if (!['admin', 'user'].includes(role)) {
        setMessage(`This account has an unsupported role${role ? ` ("${role}")` : ''}. Please contact support.`);
        return;
      }

      onLogin({ ...result.user, role });
      navigate(role === 'admin' ? '/admin' : '/');
    } catch (error) {
      setMessage(error.message || 'Unable to login.');
    }
  };

  return (
    <div className="auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-brand">
          <span className="brand-mark">N</span>
          <span>NovaCart</span>
        </div>
        <div className="auth-heading">
          <p className="auth-eyebrow">WELCOME BACK</p>
          <h1>Sign in to your account</h1>
          <p>Discover something you'll love today.</p>
        </div>
        <label className="auth-field">
          <span>Email address</span>
          <input name="email" type="email" autoComplete="username" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required />
        </label>
        <label className="auth-field">
          <span>Password</span>
          <input name="password" type="password" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter your password" required />
        </label>
        <button type="submit" className="primary-btn">Sign in</button>
        <div className="auth-links">
          <Link to="/register">Create account</Link>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
        {message && <p className="form-message">{message}</p>}
        <div className="auth-secure-note">
          <span aria-hidden="true">✓</span>
          Secure sign in for your NovaCart account
        </div>
      </form>
    </div>
  );
}
