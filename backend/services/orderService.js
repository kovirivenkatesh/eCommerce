const orderRepository = require('../repositories/orderRepository');
const productRepository = require('../repositories/productRepository');
const { getProductPricing } = require('./productPricing');

class OrderService {
  async createOrder({ userId, items, shippingAddress, paymentMethod }) {
    if (!userId || !Array.isArray(items) || items.length === 0) {
      throw new Error('Order data is invalid.');
    }

    const parsedUserId = Number(userId);
    if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
      throw new Error('A valid user id is required to place the order.');
    }

    if (paymentMethod !== 'Cash on Delivery') {
      throw new Error('Online payments must be completed using Razorpay checkout.');
    }
    const requiredAddressFields = ['fullName', 'email', 'address', 'city', 'state', 'zip'];
    if (!shippingAddress || requiredAddressFields.some((field) => !String(shippingAddress[field] || '').trim())) {
      throw new Error('Complete shipping details are required.');
    }

    return productRepository.transaction(async (transaction) => {
      const pricedItems = await this.priceOrderItems(items, transaction);
      await this.decreaseInventory(pricedItems, transaction);
      const total = pricedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      return orderRepository.create({
        userId: parsedUserId,
        items: pricedItems,
        total,
        shippingAddress,
        paymentMethod,
        status: 'Confirmed',
        trackingNumber: `TRK-${Date.now()}`,
        transaction,
      });
    });
  }

  async priceOrderItems(items, transaction) {
    if (!Array.isArray(items) || !items.length) {
      throw new Error('Order items are required.');
    }

    const requestedQuantities = new Map();
    for (const item of items) {
      const productId = Number(item.productId);
      const quantity = Number(item.quantity);
      if (!Number.isInteger(productId) || productId <= 0 || !Number.isInteger(quantity) || quantity <= 0) {
        throw new Error('Order contains an invalid product or quantity.');
      }
      requestedQuantities.set(productId, (requestedQuantities.get(productId) || 0) + quantity);
    }

    const pricedItems = [];
    for (const [productId, quantity] of requestedQuantities) {
      const product = await productRepository.findById(productId);
      if (!product) throw new Error(`Product ${productId} does not exist.`);
      const availableStock = Number(product.stock);
      if (availableStock < quantity) {
        throw new Error(`${product.name} has ${availableStock} available, but ${quantity} requested.`);
      }

      const pricing = getProductPricing(product);
      pricedItems.push({
        productId,
        name: product.name,
        image: product.image,
        quantity,
        price: pricing.offerPrice,
        originalPrice: pricing.originalPrice,
        offerPercentage: pricing.offerPercentage,
      });
    }

    return pricedItems;
  }

  async decreaseInventory(items, transaction) {
    const quantities = new Map();
    for (const item of items) {
      quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity);
    }

    for (const [productId, quantity] of quantities) {
      const decreased = await productRepository.decreaseStock(productId, quantity, transaction);
      if (!decreased) {
        const product = await productRepository.findById(productId);
        const availableStock = Number(product?.stock ?? 0);
        throw new Error(`${product?.name || 'Product'} has ${availableStock} available, but ${quantity} requested.`);
      }
    }
  }

  async createVerifiedPaymentOrder({ userId, items, shippingAddress, paymentId, paymentMethod }) {
    const existing = await orderRepository.findByPaymentId(paymentId);
    if (existing) {
      if (Number(existing.userId) !== Number(userId)) throw new Error('Payment is already linked to another account.');
      return existing;
    }

    return productRepository.transaction(async (transaction) => {
      await this.decreaseInventory(items, transaction);
      const total = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
      return orderRepository.create({
        userId: Number(userId),
        items,
        total,
        shippingAddress,
        paymentMethod: paymentMethod || 'Razorpay',
        status: 'Confirmed',
        trackingNumber: `TRK-${Date.now()}`,
        paymentId,
        transaction,
      });
    });
  }

  async listOrders(userId) {
    return orderRepository.findByUser(userId);
  }

  async cancelOrder(orderId, userId) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new Error('Order not found.');
    if (Number(order.userId) !== Number(userId)) throw new Error('Access denied.');

    return orderRepository.update(orderId, { status: 'Cancelled' });
  }

  async returnOrder(orderId, userId) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new Error('Order not found.');
    if (Number(order.userId) !== Number(userId)) throw new Error('Access denied.');

    return orderRepository.update(orderId, { status: 'Returned' });
  }
}

module.exports = new OrderService();
