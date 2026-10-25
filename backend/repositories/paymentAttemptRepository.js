const { PaymentAttempt } = require('../models/PaymentAttempt.ts');

class PaymentAttemptRepository {
  async create(paymentData) {
    return PaymentAttempt.create(paymentData);
  }

  async findByOrderId(razorpayOrderId) {
    return PaymentAttempt.findByPk(razorpayOrderId);
  }

  async update(razorpayOrderId, updates) {
    const attempt = await this.findByOrderId(razorpayOrderId);
    if (!attempt) return null;
    await attempt.update(updates);
    return attempt;
  }
}

module.exports = new PaymentAttemptRepository();
