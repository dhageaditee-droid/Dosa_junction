const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const cleanDishName = (name) => {
  if (!name) return '';
  return name.replace(/\s*\([\u0900-\u097F\s\w]+\)/g, '').replace(/\s*\([^)]*\)/g, '').trim();
};

export const apiCall = async (endpoint, method = 'GET', data = null, customToken = null) => {
  let token = customToken;
  if (!token) {
    token = localStorage.getItem('dakshin_admin_token') || localStorage.getItem('dakshin_customer_token');
  }

  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, options);
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || 'API Request failed');
    }
    return result;
  } catch (error) {
    console.error(`API_ERROR [${method} ${endpoint}]:`, error.message);
    throw error;
  }
};

// Convenience API Service Methods
export const apiService = {
  // Menu & Categories
  getMenu: (params = '') => apiCall(`/menu${params ? `?${params}` : ''}`),
  getMenuItem: (id) => apiCall(`/menu/${id}`),
  getCategories: () => apiCall('/categories'),

  // Orders & Coupons
  createOrder: (orderData) => apiCall('/orders', 'POST', orderData),
  trackOrder: (orderNumber) => apiCall(`/orders/track/${orderNumber}`),
  getMyOrders: () => apiCall('/orders/my-orders'),
  validateCoupon: (code, subtotal) => apiCall('/coupons/validate', 'POST', { code, subtotal }),

  // Offers & Enquiries
  getOffers: () => apiCall('/offers'),
  sendContactEnquiry: (data) => apiCall('/contact', 'POST', data),
  getReviews: () => apiCall('/reviews'),

  // Auth
  customerRegister: (data) => apiCall('/auth/customer/register', 'POST', data),
  customerLogin: (data) => apiCall('/auth/customer/login', 'POST', data),
  adminLogin: (data) => apiCall('/auth/login', 'POST', data),
  getProfile: () => apiCall('/auth/profile'),

  // Admin Portal APIs
  getAdminStats: () => apiCall('/orders/admin/dashboard-stats', 'GET', null, localStorage.getItem('dakshin_admin_token')),
  getAdminOrders: (params = '') => apiCall(`/orders/admin/all${params ? `?${params}` : ''}`, 'GET', null, localStorage.getItem('dakshin_admin_token')),
  updateOrderStatus: (id, status) => apiCall(`/orders/admin/${id}/status`, 'PATCH', { status }, localStorage.getItem('dakshin_admin_token')),
  updatePaymentStatus: (id, paymentStatus) => apiCall(`/orders/admin/${id}/payment`, 'PATCH', { paymentStatus }, localStorage.getItem('dakshin_admin_token')),

  getAdminMenu: () => apiCall('/menu?availableOnly=false'),
  createMenuItem: (data) => apiCall('/menu/admin', 'POST', data, localStorage.getItem('dakshin_admin_token')),
  updateMenuItem: (id, data) => apiCall(`/menu/admin/${id}`, 'PUT', data, localStorage.getItem('dakshin_admin_token')),
  deleteMenuItem: (id) => apiCall(`/menu/admin/${id}`, 'DELETE', null, localStorage.getItem('dakshin_admin_token')),

  getAdminOffers: () => apiCall('/offers/admin/all', 'GET', null, localStorage.getItem('dakshin_admin_token')),
  createOffer: (data) => apiCall('/offers/admin', 'POST', data, localStorage.getItem('dakshin_admin_token')),
  updateOffer: (id, data) => apiCall(`/offers/admin/${id}`, 'PUT', data, localStorage.getItem('dakshin_admin_token')),
  deleteOffer: (id) => apiCall(`/offers/admin/${id}`, 'DELETE', null, localStorage.getItem('dakshin_admin_token')),

  getAdminCoupons: () => apiCall('/coupons/admin/all', 'GET', null, localStorage.getItem('dakshin_admin_token')),
  createCoupon: (data) => apiCall('/coupons/admin', 'POST', data, localStorage.getItem('dakshin_admin_token')),
  updateCoupon: (id, data) => apiCall(`/coupons/admin/${id}`, 'PUT', data, localStorage.getItem('dakshin_admin_token')),
  deleteCoupon: (id) => apiCall(`/coupons/admin/${id}`, 'DELETE', null, localStorage.getItem('dakshin_admin_token')),

  getAdminEnquiries: () => apiCall('/contact/admin/all', 'GET', null, localStorage.getItem('dakshin_admin_token')),
  getAdminSettings: () => apiCall('/settings'),
  updateAdminSettings: (data) => apiCall('/settings/admin', 'PUT', data, localStorage.getItem('dakshin_admin_token'))
};
