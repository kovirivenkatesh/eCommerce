const authService = require('../services/authService');

async function register(req, res) {
  try {
    const user = await authService.register(req.body);
    return res.status(201).json({ user, message: 'Registration successful.' });
  } catch (error) {
    return res.status(400).json({ message: error.message || 'Registration failed.' });
  }
}

async function login(req, res) {
  try {
    const user = await authService.login(req.body);
    return res.json({ user, message: 'Login successful.' });
  } catch (error) {
    return res.status(401).json({ message: error.message || 'Login failed.' });
  }
}

async function logout(req, res) {
  try {
    const result = await authService.logout(req.authenticatedUser.id);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Unable to logout.' });
  }
}

async function forgotPassword(req, res) {
  try {
    const result = await authService.forgotPassword(req.body);
    return res.json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message || 'Unable to process request.' });
  }
}

async function resetPassword(req, res) {
  try {
    const result = await authService.resetPassword(req.body);
    return res.json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message || 'Unable to reset password.' });
  }
}

module.exports = { register, login, logout, forgotPassword, resetPassword };
