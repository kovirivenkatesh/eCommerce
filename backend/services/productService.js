const productRepository = require('../repositories/productRepository');
const { presentProduct } = require('./productPricing');

class ProductService {
  validateProduct(productData) {
    const { name, description, category, image, images, price, stock, offerPercentage } = productData || {};
    let productImages = images;
    if (typeof productImages === 'string') {
      try {
        productImages = JSON.parse(productImages);
      } catch {
        productImages = [productImages];
      }
    }
    if (!Array.isArray(productImages) || !productImages.length) {
      productImages = image ? [image] : [];
    }
    productImages = productImages.filter((url) => typeof url === 'string' && url.trim()).map((url) => url.trim());

    if (!name || !description || !category || !productImages.length || price === undefined || price === null || price === '') {
      throw new Error('Product name, description, category, at least one image, and price are required.');
    }

    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      throw new Error('Price must be greater than 0.');
    }

    const parsedOfferPercentage = Number(offerPercentage || 0);
    if (!Number.isFinite(parsedOfferPercentage) || parsedOfferPercentage < 0 || parsedOfferPercentage >= 100) {
      throw new Error('Offer percentage must be between 0 and 99.99.');
    }

    const parsedStock = Number(stock || 0);
    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      throw new Error('Stock must be a non-negative whole number.');
    }

    return {
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      image: JSON.stringify(productImages),
      price: parsedPrice,
      offerPercentage: parsedOfferPercentage,
      stock: parsedStock,
    };
  }

  async getAllProducts() {
    return (await productRepository.findAll()).map(presentProduct);
  }

  async getProductById(id) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new Error('Product not found.');
    }
    return presentProduct(product);
  }

  async createProduct(productData) {
    const product = this.validateProduct(productData);
    return presentProduct(await productRepository.create(product));
  }

  async updateProduct(id, productData) {
    const product = this.validateProduct({ ...productData, id });
    const existingProduct = await productRepository.findById(id);
    if (!existingProduct) {
      throw new Error('Product not found.');
    }
    return presentProduct(await productRepository.update(id, product));
  }

  async deleteProduct(id) {
    const existingProduct = await productRepository.findById(id);
    if (!existingProduct) {
      throw new Error('Product not found.');
    }
    await productRepository.delete(id);
    return { id, message: 'Product deleted successfully.' };
  }
}

module.exports = new ProductService();
