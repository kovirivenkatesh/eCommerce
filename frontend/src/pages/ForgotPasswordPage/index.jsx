import { useState } from 'react';
import { forgotPassword } from '../../api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await forgotPassword({ email });
      setMessage(response.message || 'Reset email sent.');
    } catch (error) {
      setMessage(error.message || 'Unable to send reset link.');
    }
  };

  return (
    <div className="auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Forgot password</h2>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" required />
        <button type="submit" className="primary-btn">Send reset link</button>
        {message && <p className="form-message">{message}</p>}
      </form>
    </div>
  );
}
