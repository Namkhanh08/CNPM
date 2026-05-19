import axios from 'axios';


const api = axios.create({
    baseURL: "http://localhost:5126",
    headers: {
        "Content-Type": "application/json"
    },
});


api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});


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

    // Sản phẩm
    getAll: () => api.get("/api/admin/products"),
    getProductById: (id) => api.get(`/api/admin/products/${id}`),
    createProduct: (data) => api.post("/api/admin/products", data),
    updateProduct: (id, data) => api.put(`/api/admin/products/${id}`, data),
    deleteProduct: (id) => api.delete(`/api/admin/products/${id}`),

    // Giỏ hàng
    getCart: () => api.get("/carts"),
    addToCart: (data) => api.post("/carts/add", data),
    updateCartItem: (data) => api.put("/carts/update", data),
    removeCartItem: (productId, grindingOptionId, flavorNotes, weight) =>
        api.delete("/carts/remove", { 
            data: { productId, grindingOptionId, flavorNotes, weight } 
        }),

    // Đơn hàng (Khách hàng)
    getMyOrders: () => api.get("/orders"),
    getOrderById: (id) => api.get(`/orders/${id}`),
    createOrder: (data) => api.post("/orders", data),
    cancelOrder: (orderId) => api.put(`/orders/${orderId}/cancel`),
    updateOrder: (id, data) => api.put(`/orders/${id}`, data),

    // Quản trị (Admin/Staff/Stock) 
    getAdminOrders: () => api.get("/admin/orders"),
    updateOrderStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }),
    getInventory: () => api.get("/admin/inventory"),
    getBatches: () => api.get("/admin/batches"),

    // Inventory Management
    getProducts: () => api.get('/api/inventory/products'),
    updateStock: (productId, quantity, reason) => 
      api.post(`/api/inventory/update-stock?productId=${productId}&quantity=${quantity}&reason=${reason}`),
    getLogs: () => api.get('/api/inventory/logs'),
    getTotalStock: () => api.get('/api/inventory/total-stock'),

    // Quản lý mẻ rang 
    getBatchesDetail: () => api.get('/api/inventory/batches'), 
    createBatchDetail: (productId, batchCode, roastLevel, inputWeight, status) => 
    api.post(`/api/inventory/create-batch-detail?productId=${productId}&batchCode=${batchCode}&roastLevel=${roastLevel}&inputWeight=${inputWeight}&status=${status}`),

    // User Profile
    getUserProfile: (id) => api.get(`/api/users/${id}`),
    updateUserProfile: (id, data) => api.put(`/api/users/${id}`, data),

    // Quản lý người dùng (Admin)
    adminGetUsers: () => api.get("/api/users"),
    adminDeleteUser: (id) => api.delete(`/api/users/${id}`),
    adminUpdateUser: (id, data) => api.put(`/api/users/${id}`, data),
    adminCreateUser: (data) => api.post('/api/users', data),
    
    // upload ảnh đại diện người dùng
    uploadUserImage: (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return api.post("/api/upload/user-image", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
    },
  
    // upload sản phẩm
    uploadProductImage: (file) => {
        const formData = new FormData();
        formData.append("file", file); 
        return api.post("/api/upload/product-image", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
    },
};

export default API;