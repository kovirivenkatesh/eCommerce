import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/format';
import { getProductPricing } from '../utils/pricing';

export default function ProductCard({ product, onAddToCart }) {
  const pricing = getProductPricing(product);

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="product-image-wrap" aria-label={`View ${product.name}`}>
        <img src={product.image} alt={product.name} />
      </Link>
      <div className="product-body">
        <span className="category-tag">{product.category}</span>
        <Link to={`/products/${product.id}`} className="product-title-link">
          <h3>{product.name}</h3>
        </Link>
        <p className="product-description">{product.description}</p>
        <div className="product-meta">
          <div className="product-offer-price">
            <strong className="product-price">{formatPrice(pricing.offerPrice)}</strong>
            {pricing.offerPercentage > 0 && (
              <span className="product-discount">-{pricing.offerPercentage}%</span>
            )}
          </div>
          {pricing.offerPercentage > 0 && (
            <span className="product-original-price">List price: <del>{formatPrice(pricing.originalPrice)}</del></span>
          )}
          <span className={Number(product.stock) > 0 ? 'stock-available' : 'stock-unavailable'}>
            {Number(product.stock) > 0 ? 'In stock' : 'Out of stock'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onAddToCart(product)}
          disabled={Number(product.stock) <= 0}
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}
