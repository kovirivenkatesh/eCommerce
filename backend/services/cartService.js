const productRepository = require('../repositories/productRepository');
const userRepository = require('../repositories/userRepository');
const { presentProduct } = require('./productPricing');

class CartService {
  async getCart(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('User not found.');

    const cartItems = Array.isArray(user.cartItems) ? user.cartItems : [];
    const hydratedItems = await Promise.all(cartItems.map(async ({ productId, quantity }) => {
      const product = await productRepository.findById(productId);
      return product ? { ...presentProduct(product), quantity } : null;
    }));
    const validItems = hydratedItems.filter(Boolean);

    if (validItems.length !== cartItems.length) {
      await userRepository.updateUser(userId, {
        cartItems: validItems.map(({ id, quantity }) => ({ productId: id, quantity })),
      });
    }

    return validItems;
  }

  async saveCart(userId, items) {
    if (!Array.isArray(items)) {
      throw new Error('Cart items must be an array.');
    }

    const quantities = new Map();
    for (const item of items) {
      const productId = Number(item.productId ?? item.id);
      const quantity = Number(item.quantity);
      if (!Number.isInteger(productId) || productId <= 0 || !Number.isInteger(quantity) || quantity <= 0) {
        throw new Error('Each cart item needs a valid product and positive whole-number quantity.');
      }
      quantities.set(productId, (quantities.get(productId) || 0) + quantity);
    }

    const normalizedItems = [...quantities].map(([productId, quantity]) => ({ productId, quantity }));
    for (const item of normalizedItems) {
      const product = await productRepository.findById(item.productId);
      if (!product) throw new Error(`Product ${item.productId} does not exist.`);
    }

    const user = await userRepository.updateUser(userId, { cartItems: normalizedItems });
    if (!user) throw new Error('User not found.');

    return this.getCart(userId);
  }
}

module.exports = new CartService();
