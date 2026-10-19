import axios from 'axios';

// Base URL configuration for API calls
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Configured Axios instance with Base URL and auto-injected Auth tokens
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Automatically attach Bearer token from localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format error messages uniformly
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

/**
 * Standardized API service functions using Axios
 */
export const api = {
  // Authentication
  async login(email, password) {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data;
  },

  async register(name, email, password, role = 'USER') {
    const res = await apiClient.post('/auth/register', { name, email, password, role });
    return res.data;
  },

  async getMe() {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  async getDemoAccounts() {
    const res = await apiClient.get('/auth/demo-accounts');
    return res.data;
  },

  // Categories
  async getCategories() {
    const res = await apiClient.get('/categories');
    return res.data;
  },

  async createCategory(catData) {
    const res = await apiClient.post('/categories', catData);
    return res.data;
  },

  // Products
  async getProducts(params = {}) {
    const cleanParams = {};
    if (params.category && params.category !== 'all') {
      cleanParams.category = params.category;
    }
    if (params.search) cleanParams.search = params.search;
    if (params.sort) cleanParams.sort = params.sort;
    if (params.featured) cleanParams.featured = 'true';

    const res = await apiClient.get('/products', { params: cleanParams });
    return res.data;
  },

  async getProduct(id) {
    const res = await apiClient.get(`/products/${id}`);
    return res.data;
  },

  async createProduct(productData) {
    const res = await apiClient.post('/products', productData);
    return res.data;
  },

  async updateProduct(id, productData) {
    const res = await apiClient.put(`/products/${id}`, productData);
    return res.data;
  },

  async deleteProduct(id) {
    const res = await apiClient.delete(`/products/${id}`);
    return res.data;
  },

  // Cart
  async getCart() {
    const res = await apiClient.get('/cart');
    return res.data;
  },

  async addToCart(productId, quantity = 1) {
    const res = await apiClient.post('/cart', { productId, quantity });
    return res.data;
  },

  async updateCartItem(id, quantity) {
    const res = await apiClient.put(`/cart/${id}`, { quantity });
    return res.data;
  },

  async removeCartItem(id) {
    const res = await apiClient.delete(`/cart/${id}`);
    return res.data;
  },

  async clearCart() {
    const res = await apiClient.delete('/cart');
    return res.data;
  },

  // Orders
  async createOrder(orderData) {
    const res = await apiClient.post('/orders', orderData);
    return res.data;
  },

  async getMyOrders() {
    const res = await apiClient.get('/orders/my-orders');
    return res.data;
  },

  async getOrder(id) {
    const res = await apiClient.get(`/orders/${id}`);
    return res.data;
  },

  // Inventory (Admin)
  async getInventory() {
    const res = await apiClient.get('/inventory');
    return res.data;
  },

  async updateStock(id, stock, delta) {
    const res = await apiClient.put(`/inventory/${id}/stock`, { stock, delta });
    return res.data;
  },

  // Admin
  async getAdminStats() {
    const res = await apiClient.get('/admin/stats');
    return res.data;
  },

  async getAdminOrders(status = 'ALL', search = '') {
    const params = {};
    if (status && status !== 'ALL') params.status = status;
    if (search) params.search = search;

    const res = await apiClient.get('/admin/orders', { params });
    return res.data;
  },

  async updateOrderStatus(orderId, status) {
    const res = await apiClient.put(`/admin/orders/${orderId}/status`, { status });
    return res.data;
  },

  async getAdminCustomers() {
    const res = await apiClient.get('/admin/customers');
    return res.data;
  }
};

export default api;
