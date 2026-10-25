import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { fetchOrders } from '../../api';
import { formatPrice } from '../../utils/format';

function formatOrderDate(value) {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export default function OrdersPage({ user, onCancelOrder, onReturnOrder }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(location.state?.message || '');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadOrders = async () => {
      try {
        const data = await fetchOrders(user.id);
        setOrders(data);
      } catch (error) {
        setMessage(error.message || 'Unable to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [user, navigate]);

  const handleCancel = async (orderId) => {
    try {
      await onCancelOrder(orderId, user.id);
      const updated = await fetchOrders(user.id);
      setOrders(updated);
      setMessage('Order cancelled successfully.');
    } catch (error) {
      setMessage(error.message || 'Unable to cancel order.');
    }
  };

  const handleReturn = async (orderId) => {
    try {
      await onReturnOrder(orderId, user.id);
      const updated = await fetchOrders(user.id);
      setOrders(updated);
      setMessage('Return request placed successfully.');
    } catch (error) {
      setMessage(error.message || 'Unable to process return.');
    }
  };

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="orders-shell">
      <div className="section-heading">
        <p>Your account</p>
        <h2>Your orders</h2>
      </div>
      {message && <p className="form-message">{message}</p>}
      {loading ? <div className="loading">Loading orders...</div> : orders.length === 0 ? (
        <div className="orders-empty-state">
          <div className="orders-empty-icon" aria-hidden="true">▤</div>
          <h3>You haven’t placed any orders yet</h3>
          <p>When you place an order, it will appear here with its items and delivery details.</p>
          <Link to="/products" className="primary-btn">Start shopping</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div className="order-card" key={order.id}>
              <div className="order-card-heading">
                <div>
                  <p className="order-label">ORDER</p>
                  <h3>#{order.id}</h3>
                </div>
                <div className="order-heading-details">
                  <div className="order-tracking">
                    <span>Tracking number</span>
                    <strong>{order.trackingNumber || 'Not available'}</strong>
                  </div>
                  <div className="order-placed-date">
                    <span>Placed: </span>
                    <strong><time dateTime={order.createdAt}>{formatOrderDate(order.createdAt)}</time></strong>
                  </div>
                </div>
                <span className={`status-badge status-${String(order.status || '').toLowerCase()}`}>
                  {order.status}
                </span>
              </div>
              <div className="order-cart-layout">
                <div className={`order-items${Array.isArray(order.items) && order.items.length === 1 ? ' has-single-item' : ''}`}>
                  {(Array.isArray(order.items) ? order.items : []).map((item, index) => (
                    <div key={`${order.id}-${item.productId || index}`} className="order-item">
                      {item.image ? (
                        <img src={item.image} alt={item.name || 'Ordered product'} />
                      ) : (
                        <div className="order-item-image-placeholder" aria-hidden="true">N</div>
                      )}
                      <div className="order-item-info">
                        <h4>{item.name || 'Product'}</h4>
                        <span>Qty: {item.quantity}</span>
                      </div>
                      <div className="order-item-price">
                        <strong>{formatPrice(Number(item.price) * Number(item.quantity))}</strong>
                        <span>
                          {formatPrice(item.price)} each
                          {item.offerPercentage > 0 && ` · ${item.offerPercentage}% off`}
                        </span>
                        {item.offerPercentage > 0 && (
                          <del>{formatPrice(Number(item.originalPrice) * Number(item.quantity))}</del>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <aside className="order-summary">
                  <h4>Order summary</h4>
                  <div className="summary-row">
                    <span>Items ({Array.isArray(order.items) ? order.items.length : 0})</span>
                    <strong>{formatPrice(order.total)}</strong>
                  </div>
                  <div className="summary-row"><span>Shipping</span><strong>Free</strong></div>
                  {order.paymentMethod && (
                    <div className="summary-row"><span>Payment</span><strong>{order.paymentMethod}</strong></div>
                  )}
                  <div className="summary-row total"><span>Total paid</span><strong>{formatPrice(order.total)}</strong></div>
                  {order.shippingAddress && (
                    <div className="order-delivery">
                      <span>Delivering to</span>
                      <strong>{order.shippingAddress.fullName}</strong>
                      <span>{[
                        order.shippingAddress.address,
                        order.shippingAddress.city,
                        order.shippingAddress.state,
                        order.shippingAddress.zip,
                      ].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                  <div className="order-actions">
                    {order.status !== 'Cancelled' && order.status !== 'Returned' && (
                      <button type="button" className="secondary-btn small-btn" onClick={() => handleCancel(order.id)}>Cancel order</button>
                    )}
                    {order.status === 'Confirmed' && (
                      <button type="button" className="secondary-btn small-btn" onClick={() => handleReturn(order.id)}>Request return</button>
                    )}
                  </div>
                </aside>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
