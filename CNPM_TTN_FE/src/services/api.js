import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5126",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.clear();
    }
    return Promise.reject(error);
  }
);

const API = {
  // Auth
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),

  // Danh mục
  getCategories: () => api.get("/api/admin/categories"),

  // Sản phẩm người dùng
  getProducts: () => api.get("/products"),
  getProductById: (id) => api.get(`/products/${id}`),
  getQuizMatchedProducts: (flavorNotes, region, process, roast, height) =>
    api.get("/products/quiz-match", {
      params: { flavorNotes, region, process, roast, height },
    }),

  // Sản phẩm
  getAll: () => api.get("/api/admin/products"),
  //getProductById: (id) => api.get(`/api/admin/products/${id}`),
  createProduct: (data) => api.post("/api/admin/products", data),
  updateProduct: (id, data) => api.put(`/api/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/api/admin/products/${id}`),

  // CART
  getCart: () => api.get("/api/carts"),
  addToCart: (data) => api.post("/api/carts/add", data),
  updateCartItem: (data) => api.put("/api/carts/update", data),
  removeCartItem: (productId, grindingOptionId, flavorNotes, weight) =>
    api.delete("/api/carts/remove", {
      data: { productId, grindingOptionId, flavorNotes, weight },
    }),

  // ORDER
  getMyOrders: () => api.get("/api/orders"),
  fetchAllOrdersAdmin: (page = 1, searchTerm = "", status = "all") =>
    api.get("/api/orders/admin/all", {
      params: { page, searchTerm, status },
    }),
  updateOrderStatus: (id, status) =>
    api.put(`/api/orders/${id}/status`, null, {
      params: { status },
    }),
  confirmOrder: (id) => api.put(`/api/orders/${id}/confirm`),
  getOrderById: (id) => api.get(`/api/orders/${id}`),
  createOrder: (data) => api.post("/api/orders", data),
  cancelOrder: (orderId) => api.put(`/api/orders/${orderId}/cancel`),
  updateOrder: (id, data) => api.put(`/api/orders/${id}`, data),

  // SHIPPING
  fetchShipperOrders: (page = 1, searchTerm = "") =>
    api.get("/api/orders/shipper/list", {
      params: { page, searchTerm },
    }),
  shipperCompleteOrder: (id) => api.put(`/api/orders/${id}/shipping-complete`),
  shipperFailOrder: (id) => api.put(`/api/orders/${id}/shipper-fail`),

  // DASHBOARD
  getDashboard: () => api.get("/api/dashboard"),

  // VOUCHERS
  getVouchersAdmin: (page = 1, searchTerm = "", status = "all") =>
    api.get("/api/vouchers", {
      params: { page, searchTerm, status },
    }),
  getAvailableVouchers: (data) => api.post("/api/vouchers/available", data),
  getPublicVouchers: () => api.get("/api/vouchers/public"),
  createVoucher: (data) => api.post("/api/vouchers", data),
  updateVoucher: (id, data) => api.put(`/api/vouchers/${id}`, data),
  deleteVoucher: (id) => api.delete(`/api/vouchers/${id}`),
  toggleVoucher: (id, active) =>
    api.patch(`/api/vouchers/${id}/toggle`, null, {
      params: { active },
    }),

  // SUBSCRIPTIONS
  createSubscription: (data) => api.post("/api/subscriptions/create", data),
  getSubscriptions: () => api.get("/api/subscriptions"),
  toggleSkipSubscription: (id) => api.put(`/api/subscriptions/${id}/toggle-skip`),
  cancelSubscription: (id) => api.put(`/api/subscriptions/${id}/cancel`),
  updateSubscriptionConfig: (id, data) =>
    api.put(`/api/subscriptions/${id}/config`, data),

  // KHO
  getProducts1: () => api.get("/api/inventory/products"),
  getRawMaterials: () => api.get("/api/inventory/raw-materials"),
  getInventoryReceipts: (
    page = 1,
    pageSize = 10,
    search = "",
    status = "all"
  ) =>
    api.get("/api/inventory/receipts", {
      params: { page, pageSize, search, status },
    }),

  createRawMaterial: (data) =>
    api.post("/api/inventory/create-raw-material", data),

  // Nhập lô nguyên liệu mới
  importRawMaterial: (data) => api.post("/api/inventory/import-material", data),
  getLogs: (page = 1, pageSize = 10, search = "", action = "all") =>
    api.get("/api/inventory/logs", {
      params: { page, pageSize, search, action },
    }),
  getTotalStock: () => api.get("/api/inventory/total-stock"),

  // Quản lý mẻ rang
  getAvailableReceipts: () => api.get("/api/inventory/available-receipts"),
  getBatchesDetail: (page = 1, pageSize = 10, search = "", status = "all") =>
    api.get("/api/inventory/batches", {
      params: { page, pageSize, search, status },
    }),
  createBatchDetail: (data) =>
    api.post("/api/inventory/create-batch-detail", data),
  updateBatchStatus: (id, statusData) =>
    api.put(`/api/Inventory/update-batch-status/${id}`, statusData),

  // User Profile
  getUserProfile: (id) => api.get(`/api/users/${id}`),
  updateUserProfile: (id, data) => api.put(`/api/users/${id}`, data),

  // Quản lý người dùng (Admin)
  adminGetUsers: () => api.get("/api/users"),
  adminDeleteUser: (id) => api.delete(`/api/users/${id}`),
  adminUpdateUser: (id, data) => api.put(`/api/users/${id}`, data),
  adminCreateUser: (data) => api.post("/api/users", data),

  // upload ảnh đại diện người dùng
  uploadUserImage: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/api/upload/user-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // upload sản phẩm
  uploadProductImage: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/api/upload/product-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default API;
