import axiosClient from './axiosClient';

const ordersApi = {
    getMyOrders: () => axiosClient.get("/api/orders"),
    getOrderById: (id) => axiosClient.get(`/api/orders/${id}`),
    createOrder: (data) => axiosClient.post("/api/orders", data),
    cancelOrder: (orderId) => axiosClient.put(`/api/orders/${orderId}/cancel`),
    completeOrder: (orderId) => axiosClient.put(`/api/orders/${orderId}/complete`),
    updateOrder: (id, data) => axiosClient.put(`/api/orders/${id}`, data),

    // Admin/Staff
    getAdminOrders: () => axiosClient.get("/api/admin/orders"),
    updateOrderStatus: (id, status) => axiosClient.put(`/api/admin/orders/${id}/status`, { status }),
};

export default ordersApi;
