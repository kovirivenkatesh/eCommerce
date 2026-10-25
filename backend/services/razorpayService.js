const crypto = require('crypto');
const paymentAttemptRepository = require('../repositories/paymentAttemptRepository');
const productRepository = require('../repositories/productRepository');
const userRepository = require('../repositories/userRepository');
const orderRepository = require('../repositories/orderRepository');
const orderService = require('./orderService');
const { getProductPricing } = require('./productPricing');

const RAZORPAY_API = 'https://api.razorpay.com/v1';

function getCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error('Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in the backend environment.');
  }
  return { keyId, keySecret };
}

async function razorpayRequest(path, options = {}) {
  const { keyId, keySecret } = getCredentials();
  const response = await fetch(`${RAZORPAY_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.description || 'Razorpay request failed.');
  }
  return data;
}

function validateShippingAddress(address) {
  const requiredFields = ['fullName', 'email', 'address', 'city', 'state', 'zip'];
  if (!address || requiredFields.some((field) => !String(address[field] || '').trim())) {
    throw new Error('Complete shipping details are required before payment.');
  }
}

class RazorpayService {
  async createOrder(userId, items, shippingAddress, paymentMethod) {
    validateShippingAddress(shippingAddress);
    if (!['UPI', 'Card'].includes(paymentMethod)) {
      throw new Error('Choose UPI or Card for Razorpay checkout.');
    }
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Your cart is empty.');
    }

    const quantities = new Map();
    for (const item of items) {
      const productId = Number(item.productId);
      const quantity = Number(item.quantity);
      if (!Number.isInteger(productId) || productId <= 0 || !Number.isInteger(quantity) || quantity <= 0) {
        throw new Error('Cart contains an invalid product or quantity.');
      }
      quantities.set(productId, (quantities.get(productId) || 0) + quantity);
    }

    const snapshots = [];
    for (const [productId, quantity] of quantities) {
      const product = await productRepository.findById(productId);
      if (!product) throw new Error(`Product ${productId} does not exist.`);
      if (Number(product.stock) < quantity) throw new Error(`${product.name} does not have enough stock.`);
      const pricing = getProductPricing(product);
      snapshots.push({
        productId,
        name: product.name,
        image: product.image,
        quantity,
        price: pricing.offerPrice,
        originalPrice: pricing.originalPrice,
        offerPercentage: pricing.offerPercentage,
      });
    }

    const total = snapshots.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const amountPaise = Math.round(total * 100);
    if (!Number.isSafeInteger(amountPaise) || amountPaise <= 0) {
      throw new Error('The order total is invalid.');
    }

    const receipt = `nc_${crypto.randomBytes(12).toString('hex')}`;
    const razorpayOrder = await razorpayRequest('/orders', {
      method: 'POST',
      body: JSON.stringify({
        amount: amountPaise,
        currency: 'INR',
        receipt,
        notes: { userId: String(userId), paymentMethod },
      }),
    });

    try {
      await paymentAttemptRepository.create({
        razorpayOrderId: razorpayOrder.id,
        userId: Number(userId),
        items: snapshots,
        amountPaise,
        shippingAddress,
        status: 'created',
        paymentMethod,
      });
    } catch (error) {
      console.error('Unable to save Razorpay payment attempt.', error);
      throw new Error('Could not prepare the payment. Please try again.');
    }

    const { keyId } = getCredentials();
    return {
      keyId,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    };
  }

  async verifyPayment(userId, { razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      throw new Error('Razorpay payment verification details are incomplete.');
    }

    const attempt = await paymentAttemptRepository.findByOrderId(razorpayOrderId);
    if (!attempt || Number(attempt.userId) !== Number(userId)) {
      throw new Error('Payment order not found for this account.');
    }

    if (attempt.status === 'paid') {
      const previousOrder = await orderRepository.findByPaymentId(razorpayPaymentId);
      if (previousOrder) return previousOrder;
      throw new Error('Payment was already processed.');
    }

    const { keySecret } = getCredentials();
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');
    const expected = Buffer.from(expectedSignature, 'hex');
    const received = Buffer.from(String(razorpaySignature), 'hex');
    if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
      throw new Error('Razorpay payment signature could not be verified.');
    }

    const payment = await razorpayRequest(`/payments/${encodeURIComponent(razorpayPaymentId)}`);
    if (payment.order_id !== razorpayOrderId || Number(payment.amount) !== Number(attempt.amountPaise) || payment.currency !== 'INR') {
      throw new Error('Payment details do not match the order amount.');
    }

    let confirmedPayment = payment;
    if (payment.status === 'authorized') {
      confirmedPayment = await razorpayRequest(`/payments/${encodeURIComponent(razorpayPaymentId)}/capture`, {
        method: 'POST',
        body: JSON.stringify({ amount: attempt.amountPaise, currency: 'INR' }),
      });
    }
    if (confirmedPayment.status !== 'captured') {
      throw new Error('Razorpay has not confirmed the payment. No order was placed.');
    }

    const order = await orderService.createVerifiedPaymentOrder({
      userId,
      items: attempt.items,
      shippingAddress: attempt.shippingAddress,
      paymentId: razorpayPaymentId,
      paymentMethod: attempt.get('paymentMethod') || 'Razorpay',
    });
    await paymentAttemptRepository.update(razorpayOrderId, {
      status: 'paid',
      paymentId: razorpayPaymentId,
    });
    await userRepository.updateUser(userId, { cartItems: [] });
    return order;
  }
}

module.exports = new RazorpayService();
