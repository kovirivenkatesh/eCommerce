import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../api';

export default function RegisterPage({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await registerUser(form);
      onLogin(result.user);
      navigate('/');
    } catch (error) {
      setMessage(error.message || 'Unable to register.');
    }
  };

  return (
    <div className="auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Create account</h2>
        <input name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" required />
        <input name="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email address" required />
        <input name="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" required />
        <button type="submit" className="primary-btn">Register</button>
        <div className="auth-links"><Link to="/login">Already have an account?</Link></div>
        {message && <p className="form-message">{message}</p>}
      </form>
    </div>
  );
}
