import { useEffect, useState } from 'react';
import { addProduct, deleteProduct, fetchProducts, updateProduct } from '../../api';
import { formatPrice } from '../../utils/format';
import { getProductPricing } from '../../utils/pricing';

const emptyForm = {
  name: '',
  description: '',
  category: '',
  price: '',
  offerPercentage: '0',
  stock: '',
  images: [],
  imageFiles: [],
};

export default function AdminPage({ products, onProductsChange }) {
  const [form, setForm] = useState(emptyForm);
  const [items, setItems] = useState(products);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const previewOriginalPrice = Number(form.price) || 0;
  const previewOfferPercentage = Number(form.offerPercentage) || 0;
  const previewOfferPrice = Math.round(previewOriginalPrice * (1 - previewOfferPercentage / 100) * 100) / 100;

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setItems(data);
        onProductsChange(data);
      } catch (error) {
        setMessage(error.message || 'Unable to load products.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [onProductsChange]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((current) => ({
      ...current,
      [name]: name === 'imageFiles' ? Array.from(files || []) : value,
    }));
  };

  const startEditing = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name || '',
      description: product.description || '',
      category: product.category || '',
      price: product.price ?? '',
      offerPercentage: product.offerPercentage ?? 0,
      stock: product.stock ?? '',
      images: product.images?.length ? product.images : [product.image].filter(Boolean),
      imageFiles: [],
    });
    setMessage('');
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!editingId && !form.imageFiles.length) {
      setMessage('Please upload at least one product image.');
      return;
    }

    const payload = new FormData();
    payload.append('name', form.name);
    payload.append('description', form.description);
    payload.append('category', form.category);
    payload.append('price', form.price);
    payload.append('offerPercentage', form.offerPercentage || 0);
    payload.append('stock', form.stock || 0);
    if (form.imageFiles.length) {
      form.imageFiles.forEach((file) => payload.append('images', file));
    } else {
      payload.append('images', JSON.stringify(form.images));
    }

    setSaving(true);
    try {
      const savedProduct = editingId
        ? await updateProduct(editingId, payload)
        : await addProduct(payload);
      const nextItems = editingId
        ? items.map((item) => item.id === savedProduct.id ? savedProduct : item)
        : [savedProduct, ...items];
      setItems(nextItems);
      onProductsChange(nextItems);
      setMessage(editingId ? 'Product updated successfully.' : 'Product added successfully.');
      resetForm();
    } catch (error) {
      setMessage(error.message || `Unable to ${editingId ? 'update' : 'add'} product.`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This action cannot be undone.`)) return;

    setMessage('');
    try {
      await deleteProduct(product.id);
      const nextItems = items.filter((item) => item.id !== product.id);
      setItems(nextItems);
      onProductsChange(nextItems);
      if (editingId === product.id) resetForm();
      setMessage('Product deleted successfully.');
    } catch (error) {
      setMessage(error.message || 'Unable to delete product.');
    }
  };

  return (
    <div className="admin-shell">
      <div className="section-heading">
        <p>Admin workspace</p>
        <h1>Product manager</h1>
        <span>Add, update, and remove products from your store.</span>
      </div>

      <form className="product-form" onSubmit={handleSubmit}>
        <h2>{editingId ? 'Update product' : 'Add a product'}</h2>
        <div className="form-grid two-cols">
          <input name="name" value={form.name} onChange={handleChange} placeholder="Product name" required />
          <input name="category" value={form.category} onChange={handleChange} placeholder="Category" required />
          <label className="admin-field">
            <span>Original price</span>
            <input name="price" type="number" min="0.01" step="0.01" value={form.price} onChange={handleChange} placeholder="Original price" required />
          </label>
          <label className="admin-field">
            <span>Offer discount (%)</span>
            <input name="offerPercentage" type="number" min="0" max="99.99" step="0.01" value={form.offerPercentage} onChange={handleChange} placeholder="0" />
          </label>
          <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} placeholder="Stock" />
        </div>
        <div className="offer-preview">
          <span>Customer price</span>
          <strong>{formatPrice(previewOfferPrice)}</strong>
          {previewOfferPercentage > 0 && previewOriginalPrice > 0 && (
            <>
              <del>{formatPrice(previewOriginalPrice)}</del>
              <span className="offer-badge">{previewOfferPercentage}% OFF</span>
              <span className="offer-savings">Customer saves {formatPrice(previewOriginalPrice - previewOfferPrice)}</span>
            </>
          )}
        </div>
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" rows="4" required />
        <label className="admin-image-label">
          {editingId ? 'Replace product images (optional)' : 'Product images'}
          <input
            key={editingId || 'new'}
            name="imageFiles"
            type="file"
            accept="image/*"
            multiple
            onChange={handleChange}
            required={!editingId}
          />
        </label>
        {form.imageFiles.length > 0 ? (
          <p className="admin-image-hint">{form.imageFiles.length} new image{form.imageFiles.length === 1 ? '' : 's'} selected</p>
        ) : form.images.length > 0 ? (
          <div className="admin-image-preview" aria-label="Current product images">
            {form.images.map((image, index) => <img key={`${image}-${index}`} src={image} alt={`Current product image ${index + 1}`} />)}
          </div>
        ) : null}
        <div className="admin-form-actions">
          <button type="submit" className="primary-btn" disabled={saving}>
            {saving ? 'Saving...' : editingId ? 'Update product' : 'Add product'}
          </button>
          {editingId && <button type="button" className="secondary-btn" onClick={resetForm}>Cancel</button>}
        </div>
        {message && <p className="form-message" role="status">{message}</p>}
      </form>

      <section className="admin-product-list">
        <div className="admin-list-heading">
          <h2>Store products</h2>
          <span>{items.length} products</span>
        </div>
        {loading ? <div className="loading">Loading products...</div> : items.length ? items.map((item) => (
          <div className="mini-product" key={item.id}>
            <img src={item.image} alt={item.name} />
            <div className="mini-product-info">
              <h3>{item.name}</h3>
              <p>{item.category} · Stock: {item.stock ?? 0}</p>
            </div>
            <div className="admin-product-prices">
              <strong>{formatPrice(getProductPricing(item).offerPrice)}</strong>
              {getProductPricing(item).offerPercentage > 0 && (
                <><del>{formatPrice(item.price)}</del><span>{getProductPricing(item).offerPercentage}% OFF</span></>
              )}
            </div>
            <div className="mini-product-actions">
              <button type="button" className="small-btn" onClick={() => startEditing(item)}>Edit</button>
              <button type="button" className="small-btn danger-btn" onClick={() => handleDelete(item)}>Delete</button>
            </div>
          </div>
        )) : <p className="empty-state">No products yet. Add your first product above.</p>}
      </section>
    </div>
  );
}
