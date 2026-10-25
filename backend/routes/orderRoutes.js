const express = require('express');
const { createOrder, getOrders, cancelOrder, returnOrder } = require('../controllers/orderController');
const { requireAuthenticatedUser } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', requireAuthenticatedUser, getOrders);
router.post('/', requireAuthenticatedUser, createOrder);
router.put('/:id/cancel', requireAuthenticatedUser, cancelOrder);
router.put('/:id/return', requireAuthenticatedUser, returnOrder);

module.exports = router;
