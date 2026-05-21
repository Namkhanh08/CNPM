import axiosClient from './axiosClient';

const productsApi = {
    getProducts: (params) => axiosClient.get("/api/admin/products", { params }),
    getAll: (params) => axiosClient.get("/api/admin/products", { params }),
    getProductById: (id) => axiosClient.get(`/api/admin/products/${id}`),
    deleteProduct: (id) => axiosClient.delete(`/api/admin/products/${id}`),
};

export default productsApi;
