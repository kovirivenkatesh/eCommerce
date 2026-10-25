import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRazorpayOrder, placeOrder as placeOrderRequest, verifyRazorpayPayment } from '../../api';
import { formatPrice } from '../../utils/format';
import { getProductPricing } from '../../utils/pricing';

function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage({ user, cart, onPlaceOrder, onCartPurchased }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
    zip: '',
    paymentMethod: 'Cash on Delivery',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const total = cart.reduce((sum, item) => sum + getProductPricing(item).offerPrice * item.quantity, 0);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (!cart.length) {
      setMessage('Your cart is empty.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const shippingAddress = {
        fullName: form.fullName,
        email: form.email,
        address: form.address,
        city: form.city,
        state: form.state,
        zip: form.zip,
      };
      const items = cart.map((item) => ({ productId: item.id, quantity: item.quantity }));

      if (form.paymentMethod === 'Cash on Delivery') {
        const order = await onPlaceOrder({
          items,
          shippingAddress,
          paymentMethod: form.paymentMethod,
        });
        navigate('/orders', { state: { message: `Order ${order.trackingNumber} placed successfully.` } });
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Could not load Razorpay checkout. Check your internet connection and try again.');

      const paymentOrder = await createRazorpayOrder({
        items,
        shippingAddress,
        paymentMethod: form.paymentMethod,
      });
      const razorpay = new window.Razorpay({
        key: paymentOrder.keyId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: 'NovaCart',
        description: 'Secure order payment',
        order_id: paymentOrder.orderId,
        prefill: { name: form.fullName, email: form.email },
        theme: { color: '#4f46e5' },
        modal: {
          ondismiss: () => setLoading(false),
        },
        handler: async (response) => {
          try {
            const result = await verifyRazorpayPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            onCartPurchased();
            navigate('/orders', {
              state: { message: `Payment successful. Order ${result.order.trackingNumber} has been placed.` },
            });
          } catch (error) {
            setMessage(error.message || 'Unable to verify your payment.');
          } finally {
            setLoading(false);
          }
        },
      });
      razorpay.on('payment.failed', (response) => {
        setMessage(response.error?.description || 'Payment failed. No order was placed.');
        setLoading(false);
      });
      razorpay.open();
    } catch (error) {
      setMessage(error.message || 'Place order failed.');
      setLoading(false);
    }
  };

  return (
    <div className="checkout-shell">
      <div className="section-heading">
        <p>NovaCart checkout</p>
        <h2>Review and place your order</h2>
      </div>

      <form className="checkout-form" onSubmit={handleSubmit}>
        <div className="checkout-progress" aria-label="Checkout steps">
          <div className="checkout-step is-complete"><span>1</span><strong>Delivery</strong></div>
          <div className="checkout-step is-current"><span>2</span><strong>Payment</strong></div>
          <div className="checkout-step"><span>3</span><strong>Review</strong></div>
        </div>

        <div className="checkout-layout">
          <div className="checkout-main">
            <section className="checkout-box">
              <div className="checkout-section-heading">
                <span className="checkout-section-number">1</span>
                <div><h3>Delivery address</h3><p>Where should we send your order?</p></div>
              </div>
              <div className="form-grid two-cols">
                <label className="checkout-field"><span>Full name</span><input name="fullName" autoComplete="name" placeholder="Full name" value={form.fullName} onChange={handleChange} required /></label>
                <label className="checkout-field"><span>Email address</span><input name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required /></label>
                <label className="checkout-field full-width"><span>Street address</span><input className="full-width" name="address" autoComplete="street-address" placeholder="House number and street" value={form.address} onChange={handleChange} required /></label>
                <label className="checkout-field"><span>City</span><input name="city" autoComplete="address-level2" placeholder="City" value={form.city} onChange={handleChange} required /></label>
                <label className="checkout-field"><span>State</span><input name="state" autoComplete="address-level1" placeholder="State" value={form.state} onChange={handleChange} required /></label>
                <label className="checkout-field"><span>ZIP code</span><input name="zip" autoComplete="postal-code" placeholder="ZIP code" value={form.zip} onChange={handleChange} required /></label>
              </div>
            </section>

            <section className="checkout-box">
              <div className="checkout-section-heading">
                <span className="checkout-section-number">2</span>
                <div><h3>Payment method</h3><p>Choose how you would like to pay.</p></div>
              </div>
              <div className="payment-methods">
                <label className={`payment-option${form.paymentMethod === 'Cash on Delivery' ? ' selected' : ''}`}>
                  <input type="radio" name="paymentMethod" value="Cash on Delivery" checked={form.paymentMethod === 'Cash on Delivery'} onChange={handleChange} />
                  <span className="payment-method-icon" aria-hidden="true">₹</span>
                  <span className="payment-method-copy"><strong>Cash on delivery</strong><small>Pay when your order arrives</small></span>
                  <span className="payment-radio-indicator" aria-hidden="true" />
                </label>
                <label className={`payment-option${form.paymentMethod === 'UPI' ? ' selected' : ''}`}>
                  <input type="radio" name="paymentMethod" value="UPI" checked={form.paymentMethod === 'UPI'} onChange={handleChange} />
                  <span className="payment-method-icon" aria-hidden="true">▦</span>
                  <span className="payment-method-copy"><strong>UPI</strong><small>Google Pay, PhonePe, Paytm</small></span>
                  <span className="payment-radio-indicator" aria-hidden="true" />
                </label>
                <label className={`payment-option${form.paymentMethod === 'Card' ? ' selected' : ''}`}>
                  <input type="radio" name="paymentMethod" value="Card" checked={form.paymentMethod === 'Card'} onChange={handleChange} />
                  <span className="payment-method-icon" aria-hidden="true">▰</span>
                  <span className="payment-method-copy"><strong>Credit or debit card</strong><small>Visa, Mastercard and RuPay</small></span>
                  <span className="payment-radio-indicator" aria-hidden="true" />
                </label>
              </div>
              {form.paymentMethod !== 'Cash on Delivery' && (
                <p className="payment-setup-note">
                  You’ll complete your payment securely in Razorpay Checkout.
                </p>
              )}
            </section>
          </div>

          <aside className="checkout-order-summary">
            <div className="checkout-summary-heading">
              <h3>Order summary</h3>
              <span>{cart.reduce((sum, item) => sum + item.quantity, 0)} items</span>
            </div>
            <div className="checkout-summary-items">
              {cart.map((item) => (
                <div className="checkout-summary-item" key={item.id}>
                  <img src={item.image} alt="" />
                  <div><strong>{item.name}</strong><span>Qty: {item.quantity}</span></div>
                  <strong>{formatPrice(getProductPricing(item).offerPrice * item.quantity)}</strong>
                </div>
              ))}
            </div>
            <div className="checkout-summary-totals">
              <div className="summary-row"><span>Subtotal</span><strong>{formatPrice(total)}</strong></div>
              <div className="summary-row"><span>Delivery</span><strong className="free-delivery">FREE</strong></div>
              <div className="summary-row total"><span>Order total</span><strong>{formatPrice(total)}</strong></div>
            </div>
            <button type="submit" className="primary-btn checkout-submit" disabled={loading || cart.length === 0}>
              {loading ? 'Processing...' : form.paymentMethod === 'Cash on Delivery'
                ? `Place your order · ${formatPrice(total)}`
                : `Pay securely · ${formatPrice(total)}`}
            </button>
            <p className="checkout-secure-note"><span aria-hidden="true">▣</span> Your order details are securely submitted.</p>
            {message && <p className="form-message checkout-message" role="alert">{message}</p>}
          </aside>
        </div>
      </form>
    </div>
  );
}
