import { useState } from 'react';
import { resetPassword } from '../../api';

export default function ResetPasswordPage() {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await resetPassword({ token, newPassword: password });
      setMessage(response.message || 'Password reset successful.');
    } catch (error) {
      setMessage(error.message || 'Unable to reset password.');
    }
  };

  return (
    <div className="auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Reset password</h2>
        <input type="text" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Reset token" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" required />
        <button type="submit" className="primary-btn">Reset password</button>
        {message && <p className="form-message">{message}</p>}
      </form>
    </div>
  );
}
