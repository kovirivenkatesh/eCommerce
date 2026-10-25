const productService = require('../services/productService');

async function getProducts(req, res) {
  try {
    const products = await productService.getAllProducts();
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error fetching products.' });
  }
}

async function getProductById(req, res) {
  try {
    const product = await productService.getProductById(req.params.id);
    return res.json(product);
  } catch (error) {
    const status = error.message === 'Product not found.' ? 404 : 500;
    return res.status(status).json({ message: error.message || 'Product lookup failed.' });
  }
}

async function createProduct(req, res) {
  try {
    const product = await productService.createProduct(req.body);
    return res.status(201).json(product);
  } catch (error) {
    return res.status(400).json({ message: error.message || 'Unable to create product.' });
  }
}

async function updateProduct(req, res) {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    return res.json(product);
  } catch (error) {
    const status = error.message === 'Product not found.' ? 404 : 400;
    return res.status(status).json({ message: error.message || 'Unable to update product.' });
  }
}

async function deleteProduct(req, res) {
  try {
    const result = await productService.deleteProduct(req.params.id);
    return res.json(result);
  } catch (error) {
    const status = error.message === 'Product not found.' ? 404 : 500;
    return res.status(status).json({ message: error.message || 'Unable to delete product.' });
  }
}

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
