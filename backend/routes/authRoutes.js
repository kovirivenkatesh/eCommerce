const express = require('express');
const { register, login, logout, forgotPassword, resetPassword } = require('../controllers/authController');
const { requireAuthenticatedUser } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', requireAuthenticatedUser, logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
