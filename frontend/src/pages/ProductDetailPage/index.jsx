import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { formatPrice } from '../../utils/format';
import { getProductPricing } from '../../utils/pricing';

export default function ProductDetailPage({ products, onAddToCart }) {
  const { productId } = useParams();
  const product = products.find((item) => String(item.id) === String(productId));

  if (!product) {
    return <div className="empty-state">Product not found.</div>;
  }

  const images = product.images?.length ? product.images : [product.image].filter(Boolean);
  return <ProductDetails key={product.id} product={product} images={images} onAddToCart={onAddToCart} />;
}

function ProductDetails({ product, images, onAddToCart }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const selectedImage = images[selectedImageIndex];
  const pricing = getProductPricing(product);

  return (
    <div className="product-detail-page">
      <Link to="/products" className="detail-back-link">‹ Continue shopping</Link>
      <div className="product-detail-shell">
        <div className="detail-image-wrap">
          <div className="detail-gallery-thumbnails" aria-label="Product images">
            {images.map((image, index) => (
              <button
                type="button"
                className={`detail-thumbnail${selectedImageIndex === index ? ' is-selected' : ''}`}
                key={`${image}-${index}`}
                onClick={() => setSelectedImageIndex(index)}
                aria-label={`Show product image ${index + 1}`}
                aria-pressed={selectedImageIndex === index}
              >
                <img src={image} alt="" />
              </button>
            ))}
          </div>
          <div className="detail-main-image">
            <img src={selectedImage} alt={product.name} />
          </div>
        </div>
        <div className="detail-info">
          <span className="category-tag">{product.category}</span>
          <h1>{product.name}</h1>
          <div className="detail-price-row">
            <p className="detail-price">{formatPrice(pricing.offerPrice)}</p>
            {pricing.offerPercentage > 0 && (
              <div className="detail-discount-info">
                <span className="product-discount">-{pricing.offerPercentage}%</span>
                <span>List price: <del>{formatPrice(pricing.originalPrice)}</del></span>
                <strong>You save {formatPrice(pricing.discountAmount)}</strong>
              </div>
            )}
          </div>
          <p className="detail-description">{product.description}</p>
          <div className="detail-purchase-box">
            <div className="detail-meta">
              <span className={Number(product.stock) > 0 ? 'stock-available' : 'stock-unavailable'}>
                {Number(product.stock) > 0 ? `${product.stock} available` : 'Currently unavailable'}
              </span>
              <span>Free delivery</span>
            </div>
            <button
              type="button"
              className="primary-btn detail-add-btn"
              onClick={() => onAddToCart(product)}
              disabled={Number(product.stock) <= 0}
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
