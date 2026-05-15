import axios from 'axios';

// Tất cả request đều đi qua Gateway này
const api = axios.create({
    baseURL: "http://localhost:5126",
    headers: {
        "Content-Type": "application/json"
    },
});

// Interceptor: Tự động đính kèm JWT token vào header nếu có
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Xử lý lỗi tập trung (Ví dụ: Token hết hạn)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Có thể xử lý logout tự động ở đây nếu token hết hạn
            localStorage.clear();
        }
        return Promise.reject(error);
    }
);

const API = {
    // Auth
    login: (data) => api.post("/auth/login", data),
    register: (data) => api.post("/auth/register", data),

    // Sản phẩm
    getAll: () => api.get("/api/admin/products"),
    getProductById: (id) => api.get(`/admin/products/${id}`),
    deleteProduct: (id) => api.delete(`/admin/products/${id}`),

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

   
 
};

export default API;