import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/format';
import { getProductPricing } from '../../utils/pricing';

export default function CartPage({ cart, onUpdateQuantity, onRemoveFromCart }) {
  const total = cart.reduce((sum, item) => sum + getProductPricing(item).offerPrice * item.quantity, 0);

  return (
    <div className="cart-shell">
      <div className="section-heading">
        <p>Cart</p>
        <h2>Your shopping bag</h2>
      </div>

      {cart.length === 0 ? (
        <div className="empty-state">Your cart is empty. Start shopping to add products.</div>
      ) : (
        <div className="cart-layout">
          <div className="cart-list">
            {cart.map((item) => (
              <div className="cart-item" key={item.id}>
                <img src={item.image} alt={item.name} />
                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <p className="cart-item-price">
                    {formatPrice(getProductPricing(item).offerPrice)}
                    {getProductPricing(item).offerPercentage > 0 && (
                      <><del> {formatPrice(getProductPricing(item).originalPrice)}</del><span className="product-discount">-{getProductPricing(item).offerPercentage}%</span></>
                    )}
                  </p>
                  <div className="quantity-controls">
                    <button type="button" onClick={() => onUpdateQuantity(item.id, -1)}>-</button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => onUpdateQuantity(item.id, 1)}>+</button>
                  </div>
                </div>
                <div className="cart-actions">
                  <strong>{formatPrice(getProductPricing(item).offerPrice * item.quantity)}</strong>
                  <button type="button" className="remove-btn" onClick={() => onRemoveFromCart(item.id)}>Remove</button>
                </div>
              </div>
            ))}
          </div>

          <aside className="summary-box">
            <div className="cart-summary-heading">
              <div><p>YOUR ORDER</p><h3>Order summary</h3></div>
              <span className="cart-summary-count">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </div>
            <div className="cart-summary-delivery"><span aria-hidden="true">✓</span> Free delivery on this order</div>
            <div className="summary-row"><span>Subtotal</span><strong>{formatPrice(total)}</strong></div>
            <div className="summary-row"><span>Delivery</span><strong className="free-delivery">FREE</strong></div>
            <div className="summary-row total"><span>Order total</span><strong>{formatPrice(total)}</strong></div>
            <Link to="/checkout" className="primary-btn summary-button">Continue to checkout <span aria-hidden="true">→</span></Link>
            <p className="cart-secure-note"><span aria-hidden="true">▣</span> Secure checkout</p>
          </aside>
        </div>
      )}
    </div>
  );
}
