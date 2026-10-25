const express = require('express');
const { getCart, saveCart } = require('../controllers/cartController');
const { requireAuthenticatedUser } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', requireAuthenticatedUser, getCart);
router.put('/', requireAuthenticatedUser, saveCart);

module.exports = router;
