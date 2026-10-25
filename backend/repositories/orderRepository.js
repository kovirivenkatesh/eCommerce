const { Order } = require('../models/Order.ts');

class OrderRepository {
  async create(orderData) {
    return Order.create({
      userId: Number(orderData.userId),
      items: orderData.items,
      total: Number(orderData.total),
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod,
      status: orderData.status,
      trackingNumber: orderData.trackingNumber,
      paymentId: orderData.paymentId || null,
    }, {
      transaction: orderData.transaction,
    });
  }

  async findByUser(userId) {
    return Order.findAll({
      where: { userId: Number(userId) },
      order: [['id', 'DESC']],
    });
  }

  async findById(id) {
    return Order.findByPk(id);
  }

  async findByPaymentId(paymentId) {
    return Order.findOne({ where: { paymentId } });
  }

  async update(id, updates) {
    const order = await this.findById(id);
    if (!order) return null;

    await order.update(updates);
    return order;
  }
}

module.exports = new OrderRepository();
