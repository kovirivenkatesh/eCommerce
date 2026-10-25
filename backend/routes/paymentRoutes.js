const express = require('express');
const { createRazorpayOrder, verifyRazorpayPayment } = require('../controllers/paymentController');
const { requireAuthenticatedUser } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/razorpay/order', requireAuthenticatedUser, createRazorpayOrder);
router.post('/razorpay/verify', requireAuthenticatedUser, verifyRazorpayPayment);

module.exports = router;
