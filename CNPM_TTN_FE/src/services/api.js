import axios from 'axios';

// FE chỉ gọi 1 cổng duy nhất — cấu hình trong file .env (VITE_API_URL)
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5126",
    headers: {
        "Content-Type": "application/json"
    },
});

// Request interceptor: tự động đính kèm JWT token vào mọi request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor: xử lý lỗi tập trung
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token hết hạn → xóa token và redirect về trang chủ
            localStorage.removeItem("token");
            window.location.href = "/";
        }
        return Promise.reject(error);
    }
);

const API = {
    // Auth — đi qua /auth/... → Gateway forward đến C# :7110
    login: (data) => api.post("/auth/login", data),

    // Products — đi qua /products/... → Gateway forward đến Java :8080
    getProducts: () => api.get("/products"),
    getProductById: (id) => api.get(`/products/${id}`),

    // Carts — đi qua /carts/... → Gateway forward đến Java :8080
    getCart: () => api.get("/carts"),
    addToCart: (data) => api.post("/carts/add", data),
    updateCartItem: (data) => api.put("/carts/update", data),
    removeCartItem: (productId, grindingOptionId, flavorNotes, weight) =>
        api.delete("/carts/remove", { data: { productId, grindingOptionId, flavorNotes, weight } }),

    // Orrders — đi qua /orders/... → Gateway forward đến Java :8080
    getMyOrders: () => api.get("/orders"),
    getOrderById: (id) => api.get(`/orders/${id}`),
    createOrder: (data) => api.post("/orders", data),
    cancelOrder: (orderId) => api.put(`/orders/${orderId}/cancel`),
    updateOrder: (id, data) => api.put(`/orders/${id}`, data),
}

export default API;