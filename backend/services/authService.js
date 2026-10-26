const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');

const BCRYPT_ROUNDS = 12;

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
      password: await bcrypt.hash(password.trim(), BCRYPT_ROUNDS),
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
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const submittedPassword = password.trim();
    const storedPassword = String(user.password || '');
    const hasBcryptHash = /^\$2[ab]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(storedPassword);
    const passwordMatches = hasBcryptHash
      ? await bcrypt.compare(submittedPassword, storedPassword)
      : storedPassword === submittedPassword;

    if (!passwordMatches) {
      throw new Error('Invalid email or password.');
    }

    if (!hasBcryptHash) {
      await userRepository.updateUser(user.id, {
        password: await bcrypt.hash(submittedPassword, BCRYPT_ROUNDS),
      });
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
      password: await bcrypt.hash(newPassword.trim(), BCRYPT_ROUNDS),
      resetToken: null,
      sessionToken: null,
    });

    return { message: 'Password reset successfully.' };
  }
}

module.exports = new AuthService();
