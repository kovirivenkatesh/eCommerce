const cartService = require('../services/cartService');

async function getCart(req, res) {
  try {
    const items = await cartService.getCart(req.authenticatedUser.id);
    return res.json({ items });
  } catch (error) {
    return res.status(error.message === 'User not found.' ? 404 : 500)
      .json({ message: error.message || 'Unable to load cart.' });
  }
}

async function saveCart(req, res) {
  try {
    const items = await cartService.saveCart(req.authenticatedUser.id, req.body.items);
    return res.json({ items, message: 'Cart saved successfully.' });
  } catch (error) {
    return res.status(error.message.includes('does not exist') || error.message.includes('valid product') || error.message.includes('must be an array') ? 400 : 500)
      .json({ message: error.message || 'Unable to save cart.' });
  }
}

module.exports = { getCart, saveCart };
