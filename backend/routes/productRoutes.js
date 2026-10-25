const express = require('express');
const path = require('path');
const multer = require('multer');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const targetDir = path.join(process.cwd(), 'uploads');
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage, limits: { files: 8, fileSize: 10 * 1024 * 1024 } });

router.get('/', getProducts);
router.get('/:id', getProductById);
const attachUploadedImages = (req, res, next) => {
  const uploadedFiles = [
    ...(req.files?.images || []),
    ...(req.files?.image || []),
  ];
  if (uploadedFiles.length) {
    const baseUrl = (process.env.APP_URL || 'https://ecommerce-0d5n.onrender.com').replace(/\/+$/, '');
    req.body.images = JSON.stringify(uploadedFiles.map((file) => `${baseUrl}/uploads/${file.filename}`));
  }
  next();
};

const productImageFields = upload.fields([
  { name: 'images', maxCount: 8 },
  { name: 'image', maxCount: 1 },
]);

router.post('/', requireAdmin, productImageFields, attachUploadedImages, createProduct);
router.put('/:id', requireAdmin, productImageFields, attachUploadedImages, updateProduct);
router.delete('/:id', requireAdmin, deleteProduct);

module.exports = router;
