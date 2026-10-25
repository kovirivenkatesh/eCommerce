import { Link } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';

export default function HomePage({ products, onAddToCart }) {
  const featured = products.slice(0, 4);

  return (
    <div>
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">New season arrivals</span>
          <h1>Upgrade your everyday essentials.</h1>
          <p>Curated gadgets, premium clothing, home upgrades, and everyday essentials for a better lifestyle.</p>
          <div className="hero-actions">
            <Link to="/products" className="primary-btn">Shop now</Link>
          </div>
          <div className="stats-row">
            <div><strong>10k+</strong><span>Happy buyers</span></div>
            <div><strong>150+</strong><span>Brands</span></div>
            <div><strong>4.9/5</strong><span>Ratings</span></div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="card-floating card-top">Free shipping</div>
          <div className="product-showcase">
            <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80" alt="Featured product" />
          </div>
          <div className="card-floating card-bottom">Trending now</div>
        </div>
      </section>

      <section className="features">
        <div className="feature-box"><span>🚚</span><h3>Fast delivery</h3><p>Quick shipping across major cities.</p></div>
        <div className="feature-box"><span>🔒</span><h3>Secure checkout</h3><p>Protected transactions and trusted payments.</p></div>
        <div className="feature-box"><span>💬</span><h3>24/7 support</h3><p>Always available to help you out.</p></div>
      </section>

      <section className="products-section">
        <div className="section-heading">
          <p>Featured collection</p>
          <h2>Popular products</h2>
        </div>
        <div className="product-grid">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
          ))}
        </div>
      </section>
    </div>
  );
}
