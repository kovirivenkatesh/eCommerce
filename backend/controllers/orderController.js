const orderService = require('../services/orderService');

async function createOrder(req, res) {
  try {
    const order = await orderService.createOrder({ ...req.body, userId: req.authenticatedUser.id });
    return res.status(201).json(order);
  } catch (error) {
    return res.status(400).json({ message: error.message || 'Unable to place order.' });
  }
}

async function getOrders(req, res) {
  try {
    const userId = req.authenticatedUser.id;
    const orders = await orderService.listOrders(userId);
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Unable to fetch orders.' });
  }
}

async function cancelOrder(req, res) {
  try {
    const order = await orderService.cancelOrder(req.params.id, req.authenticatedUser.id);
    return res.json({ message: 'Order cancelled successfully.', order });
  } catch (error) {
    return res.status(400).json({ message: error.message || 'Unable to cancel order.' });
  }
}

async function returnOrder(req, res) {
  try {
    const order = await orderService.returnOrder(req.params.id, req.authenticatedUser.id);
    return res.json({ message: 'Return request placed successfully.', order });
  } catch (error) {
    return res.status(400).json({ message: error.message || 'Unable to process return.' });
  }
}

module.exports = { createOrder, getOrders, cancelOrder, returnOrder };
