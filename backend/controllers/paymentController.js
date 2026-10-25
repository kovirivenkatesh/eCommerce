const razorpayService = require('../services/razorpayService');

async function createRazorpayOrder(req, res) {
  try {
    const payment = await razorpayService.createOrder(
      req.authenticatedUser.id,
      req.body.items,
      req.body.shippingAddress,
      req.body.paymentMethod
    );
    return res.status(201).json(payment);
  } catch (error) {
    const status = error.message.includes('not configured') ? 503 : 400;
    return res.status(status).json({ message: error.message || 'Unable to start Razorpay checkout.' });
  }
}

async function verifyRazorpayPayment(req, res) {
  try {
    const order = await razorpayService.verifyPayment(req.authenticatedUser.id, req.body);
    return res.status(201).json({ order, message: 'Payment verified and order placed.' });
  } catch (error) {
    return res.status(400).json({ message: error.message || 'Unable to verify payment.' });
  }
}

module.exports = { createRazorpayOrder, verifyRazorpayPayment };
