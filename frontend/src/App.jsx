import { useCallback, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { cancelOrder, fetchProducts, fetchUserCart, logoutUser, placeOrder as placeOrderRequest, returnOrderRequest, saveUserCart } from './api';
import HomePage from './pages/HomePage';
import ProductCatalogPage from './pages/ProductCatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminPage from './pages/AdminPage';
import ProfileMenu from './components/ProfileMenu';

const getStoredValue = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

function StorefrontLayout({ user, cart, cartError, onLogout, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isProductDetail = /^\/products\/[^/]+$/.test(location.pathname);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const logoutAndOpenLogin = async () => {
    const loggedOut = await onLogout();
    if (loggedOut === false) return;
    navigate('/login', { replace: true });
  };

  return (
    <div className={`page-shell${isProductDetail ? ' detail-route-shell' : ''}`}>
      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-mark">N</div>
          <Link to="/" className="brand-name">NovaCart</Link>
        </div>

        <nav className="nav-links">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/products">Shop</NavLink>
          <NavLink to="/orders">Orders</NavLink>
          <NavLink to="/cart">Cart ({totalItems})</NavLink>
          {user && <ProfileMenu user={user} onLogout={logoutAndOpenLogin} />}
        </nav>
      </header>

      <main className="content-wrap">
        {cartError && <p className="cart-sync-error" role="alert">{cartError}</p>}
        {children}
      </main>
    </div>
  );
}

function AdminLayout({ user, onLogout, products, onProductsChange }) {
  const navigate = useNavigate();
  const logoutAndOpenLogin = async () => {
    const loggedOut = await onLogout();
    if (loggedOut === false) return;
    navigate('/login', { replace: true });
  };

  return (
    <div className="admin-page-shell">
      <header className="admin-topbar">
        <Link to="/admin" className="admin-brand">NovaCart Admin</Link>
        <div className="admin-account">
          <ProfileMenu user={user} onLogout={logoutAndOpenLogin} />
        </div>
      </header>
      <main className="admin-content">
        <AdminPage products={products} onProductsChange={onProductsChange} />
      </main>
    </div>
  );
}

function AppLayout() {
  const [user, setUser] = useState(() => getStoredValue('ecommerce_user', null));
  const [cart, setCart] = useState([]);
  const [cartOwnerId, setCartOwnerId] = useState(null);
  const [cartError, setCartError] = useState('');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    localStorage.setItem('ecommerce_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== 'user' || !user.accessToken) {
      setCart([]);
      setCartOwnerId(null);
      return undefined;
    }

    let active = true;
    const userId = String(user.id);
    setCart([]);
    setCartOwnerId(null);
    setCartError('');

    fetchUserCart()
      .then(({ items }) => {
        if (!active) return;
        setCart(items);
        setCartOwnerId(userId);
      })
      .catch((error) => {
        if (!active) return;
        console.error('Unable to load the saved cart.', error);
        setCartError(`Unable to load your saved cart: ${error.message}`);
      });

    return () => {
      active = false;
    };
  }, [user?.accessToken, user?.id, user?.role]);

  useEffect(() => {
    if (!user || user.role !== 'user' || cartOwnerId !== String(user.id)) return undefined;

    const timeout = window.setTimeout(() => {
      saveUserCart(cart)
        .then(() => setCartError(''))
        .catch((error) => {
          console.error('Unable to save the cart.', error);
          setCartError(`Unable to save your cart: ${error.message}`);
        });
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [cart, cartOwnerId, user]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        if (Array.isArray(data) && data.length) setProducts(data);
      } catch (error) {
        console.error(error);
      }
    };

    loadProducts();
  }, []);

  const addToCart = (product) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...current, { ...product, quantity: 1 }];
    });
  };

  const updateCartItem = (productId, change) => {
    setCart((current) =>
      current
        .map((item) => (item.id === productId ? { ...item, quantity: Math.max(0, item.quantity + change) } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId) => {
    setCart((current) => current.filter((item) => item.id !== productId));
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    if (user?.role === 'user' && cartOwnerId === String(user.id)) {
      try {
        await saveUserCart(cart);
      } catch (error) {
        console.error('Unable to save the cart before logout.', error);
        window.alert(`Your cart could not be saved. Please try again before logging out.\n\n${error.message}`);
        return false;
      }
    }

    if (user?.accessToken) {
      try {
        await logoutUser();
      } catch (error) {
        console.error(error);
      }
    }
    setUser(null);
    setCart([]);
    setCartOwnerId(null);
    setCartError('');
    return true;
  };

  const handleProductsChange = useCallback((nextProducts) => {
    setProducts(nextProducts);
  }, []);

  const refreshProducts = async () => {
    try {
      const updatedProducts = await fetchProducts();
      setProducts(updatedProducts);
    } catch (error) {
      console.error('Order succeeded, but product stock could not be refreshed.', error);
    }
  };

  const placeOrder = async (payload) => {
    const order = await placeOrderRequest(payload);
    setCart([]);
    await refreshProducts();
    saveUserCart([]).catch((error) => {
      console.error('Unable to clear the saved cart after placing the order.', error);
      setCartError(`Your order was placed, but the saved cart could not be cleared: ${error.message}`);
    });
    return order;
  };

  const handlePaidCart = async () => {
    setCart([]);
    await refreshProducts();
  };

  const handleOrderCancel = async (orderId, userId) => {
    await cancelOrder(orderId, userId);
  };

  const handleReturnOrder = async (orderId, userId) => {
    await returnOrderRequest(orderId, userId);
  };

  return (
    <Router>
      <Routes>
        <Route path="/admin/login" element={
          <Navigate to={user?.role === 'admin' ? '/admin' : user ? '/' : '/login'} replace />
        } />
        <Route path="/admin" element={
          user?.role === 'admin'
            ? <AdminLayout user={user} onLogout={handleLogout} products={products} onProductsChange={handleProductsChange} />
            : <Navigate to={user ? '/' : '/login'} replace />
        } />
        <Route path="/login" element={
          user?.role === 'admin'
            ? <Navigate to="/admin" replace />
            : user
              ? <Navigate to="/" replace />
              : <LoginPage onLogin={handleLogin} />
        } />
        <Route path="/register" element={
          user ? <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace /> : (
            <StorefrontLayout user={null} cart={cart} cartError={cartError} onLogout={handleLogout}>
              <RegisterPage onLogin={handleLogin} />
            </StorefrontLayout>
          )
        } />
        <Route path="/forgot-password" element={
          <StorefrontLayout user={user} cart={cart} cartError={cartError} onLogout={handleLogout}>
            <ForgotPasswordPage />
          </StorefrontLayout>
        } />
        <Route path="/reset-password" element={
          <StorefrontLayout user={user} cart={cart} cartError={cartError} onLogout={handleLogout}>
            <ResetPasswordPage />
          </StorefrontLayout>
        } />
        <Route path="*" element={
          !user
            ? <Navigate to="/login" replace />
            : user.role === 'admin'
              ? <Navigate to="/admin" replace />
              : (
                <StorefrontLayout user={user} cart={cart} cartError={cartError} onLogout={handleLogout}>
                  <Routes>
                    <Route path="/" element={<HomePage products={products} onAddToCart={addToCart} />} />
                    <Route path="/products" element={<ProductCatalogPage products={products} onAddToCart={addToCart} />} />
                    <Route path="/products/:productId" element={<ProductDetailPage products={products} onAddToCart={addToCart} />} />
                    <Route path="/cart" element={<CartPage cart={cart} onUpdateQuantity={updateCartItem} onRemoveFromCart={removeFromCart} />} />
                    <Route path="/checkout" element={<CheckoutPage user={user} cart={cart} onPlaceOrder={placeOrder} onCartPurchased={handlePaidCart} />} />
                    <Route path="/orders" element={<OrdersPage user={user} onCancelOrder={handleOrderCancel} onReturnOrder={handleReturnOrder} />} />
                  </Routes>
                </StorefrontLayout>
              )
        } />
      </Routes>
    </Router>
  );
}

export default function App() {
  return <AppLayout />;
}
