const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getAccessToken() {
  try {
    const user = JSON.parse(localStorage.getItem('ecommerce_user') || 'null');
    return user?.accessToken || null;
  } catch (error) {
    console.error('Unable to read the saved session.', error);
    return null;
  }
}

async function apiRequest(path, options = {}) {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const accessToken = getAccessToken();

  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

export async function fetchProducts() {
  return apiRequest('/products');
}

export async function addProduct(product) {
  return apiRequest('/products', {
    method: 'POST',
    body: product,
  });
}

export async function updateProduct(productId, product) {
  return apiRequest(`/products/${productId}`, {
    method: 'PUT',
    body: product,
  });
}

export async function deleteProduct(productId) {
  return apiRequest(`/products/${productId}`, {
    method: 'DELETE',
  });
}

export async function registerUser(payload) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function logoutUser() {
  return apiRequest('/auth/logout', { method: 'POST' });
}

export async function fetchUserCart() {
  return apiRequest('/cart');
}

export async function saveUserCart(items) {
  return apiRequest('/cart', {
    method: 'PUT',
    body: JSON.stringify({
      items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
    }),
  });
}

export async function forgotPassword(payload) {
  return apiRequest('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function resetPassword(payload) {
  return apiRequest('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function placeOrder(payload) {
  return apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function createRazorpayOrder(payload) {
  return apiRequest('/payments/razorpay/order', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function verifyRazorpayPayment(payload) {
  return apiRequest('/payments/razorpay/verify', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchOrders(userId) {
  return apiRequest(`/orders?userId=${userId}`);
}

export async function cancelOrder(orderId, userId) {
  return apiRequest(`/orders/${orderId}/cancel`, {
    method: 'PUT',
    body: JSON.stringify({ userId }),
  });
}

export async function returnOrderRequest(orderId, userId) {
  return apiRequest(`/orders/${orderId}/return`, {
    method: 'PUT',
    body: JSON.stringify({ userId }),
  });
}
