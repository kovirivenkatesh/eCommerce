const crypto = require('crypto');
const userRepository = require('../repositories/userRepository');

function normalizeRole(role) {
  return String(role || '').trim().toLowerCase();
}

class AuthService {
  async register({ name, email, password }) {
    if (!name || !email || !password) {
      throw new Error('Name, email and password are required.');
    }

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists with this email.');
    }

    const user = await userRepository.create({
      name: name.trim(),
      email: email.trim(),
      password: password.trim(),
    });
    const accessToken = crypto.randomBytes(32).toString('hex');
    await userRepository.updateUser(user.id, { sessionToken: accessToken });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: normalizeRole(user.role),
      accessToken,
    };
  }

  async login({ email, password }) {
    if (!email || !password) {
      throw new Error('Email and password are required.');
    }

    const user = await userRepository.findByEmail(email);
    if (!user || user.password !== password.trim()) {
      throw new Error('Invalid email or password.');
    }

    const role = normalizeRole(user.role);
    if (!['admin', 'user'].includes(role)) {
      throw new Error('This account does not have a valid role. Please contact support.');
    }

    const accessToken = crypto.randomBytes(32).toString('hex');
    await userRepository.updateUser(user.id, { sessionToken: accessToken });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role,
      accessToken,
    };
  }

  async logout(userId) {
    await userRepository.updateUser(userId, { sessionToken: null });
    return { message: 'Logout successful.' };
  }

  async forgotPassword({ email }) {
    if (!email) {
      throw new Error('Email is required.');
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      return { message: 'If this email is registered, a reset link has been sent.' };
    }

    const token = `reset-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    await userRepository.updateUser(user.id, { resetToken: token });

    return {
      message: 'Password reset token generated successfully.',
      token,
    };
  }

  async resetPassword({ token, newPassword }) {
    if (!token || !newPassword) {
      throw new Error('Reset token and new password are required.');
    }

    const user = await userRepository.findByResetToken(token);
    if (!user) {
      throw new Error('Invalid or expired reset token.');
    }

    await userRepository.updateUser(user.id, {
      password: newPassword.trim(),
      resetToken: null,
      sessionToken: null,
    });

    return { message: 'Password reset successfully.' };
  }
}

module.exports = new AuthService();
