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

  // CARTS
  getCart: () => api.get("/api/carts"),
  addToCart: (data) => api.post("/api/carts/add", data),

  updateCartItem: (data) => api.put("/api/carts/update", data),

  removeCartItem: (productId, grindingOptionId, flavorNotes, weight) =>
    api.delete("/api/carts/remove", {
      data: {
        productId,
        grindingOptionId,
        flavorNotes,
        weight,
      },
    }),

  // ORDERS
  getMyOrders: () => api.get("/orders"),

  fetchAllOrdersAdmin: (page = 1, searchTerm = "", status = "all") =>
    api.get("/orders/admin/all", {
      params: { page, searchTerm, status },
    }),

  updateOrderStatus: (id, status) =>
    api.put(`/orders/${id}/status`, null, {
      params: { status },
    }),

  confirmOrder: (id) => api.put(`/orders/${id}/confirm`),

  getOrderById: (id) => api.get(`/orders/${id}`),

  createOrder: (data) => api.post("/orders", data),

  cancelOrder: (orderId) => api.put(`/orders/${orderId}/cancel`),

  updateOrder: (id, data) => api.put(`/orders/edit/${id}`, data),

  //SHIPPING
  fetchShipperOrders: (page = 1, searchTerm = "") =>
    api.get("/orders/shipper/list", {
      params: { page, searchTerm },
    }),

  shipperCompleteOrder: (id) => api.put(`/orders/${id}/shipping-complete`),

  shipperFailOrder: (id) => api.put(`/orders/${id}/shipper-fail`),

  // DASHBOARD
  getDashboard: () => api.get("/dashboard"),

  // VOUCHERS
  getVouchersAdmin: (page = 1, searchTerm = "", status = "all") =>
    api.get("/vouchers", {
      params: { page, searchTerm, status },
    }),

  getAvailableVouchers: (data) => api.post("/vouchers/available", data),

  getPublicVouchers: () => api.get("/vouchers/public"),

  createVoucher: (data) => api.post("/vouchers", data),

  updateVoucher: (id, data) => api.put(`/vouchers/${id}`, data),

  deleteVoucher: (id) => api.delete(`/vouchers/${id}`),

  toggleVoucher: (id, active) =>
    api.patch(`/vouchers/${id}/toggle`, null, {
      params: { active },
    }),

  // KHO
  getProducts1: () => api.get("/api/inventory/products"),
  getRawMaterials: () => api.get("/api/inventory/raw-materials"),
  getInventoryReceipts: () => api.get("/api/inventory/receipts"),

  // Nhập lô nguyên liệu mới
  importRawMaterial: (data) => api.post("/api/inventory/import-material", data),

  getLogs: () => api.get("/api/inventory/logs"),
  getTotalStock: () => api.get("/api/inventory/total-stock"),

  // Quản lý mẻ rang
  getBatchesDetail: () => api.get("/api/inventory/batches"),
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
