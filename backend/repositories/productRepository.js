const { Product } = require('../models/Product.ts');
const { QueryTypes } = require('sequelize');

class ProductRepository {
  async findAll() {
    return Product.findAll({ order: [['id', 'DESC']] });
  }

  async findById(id) {
    return Product.findByPk(id);
  }

  async transaction(callback) {
    return Product.sequelize.transaction(callback);
  }

  async decreaseStock(id, quantity, transaction) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error('Stock reduction quantity must be a positive whole number.');
    }
    const affectedRows = await Product.sequelize.query(
      'UPDATE tbl_products SET stock = stock - :quantity WHERE id = :id AND stock >= :quantity',
      {
      replacements: { id, quantity },
      transaction,
      type: QueryTypes.BULKUPDATE,
      }
    );
    return affectedRows > 0;
  }

  async create(productData) {
    return Product.create({
      name: productData.name,
      description: productData.description,
      category: productData.category,
      image: productData.image,
      price: Number(productData.price),
      offerPercentage: Number(productData.offerPercentage || 0),
      stock: Number(productData.stock || 0),
    });
  }

  async update(id, productData) {
    const product = await this.findById(id);
    if (!product) return null;

    await product.update({
      name: productData.name,
      description: productData.description,
      category: productData.category,
      image: productData.image,
      price: Number(productData.price),
      offerPercentage: Number(productData.offerPercentage || 0),
      stock: Number(productData.stock || 0),
    });

    return product;
  }

  async delete(id) {
    const product = await this.findById(id);
    if (!product) return null;
    await product.destroy();
    return true;
  }
}

module.exports = new ProductRepository();
