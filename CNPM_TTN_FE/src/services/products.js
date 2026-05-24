import axiosClient from './axiosClient';

const productsApi = {
    getProducts: (params) => axiosClient.get("/api/admin/products", { params }),
    getAll: (params) => axiosClient.get("/api/admin/products", { params }),
    getCategories: () => axiosClient.get("/api/admin/categories"),
    getRegions: () => axiosClient.get("/api/admin/products/regions"),
    getProductById: (id) => axiosClient.get(`/api/admin/products/${id}`),
    createProduct: (data) => axiosClient.post("/api/admin/products", data),
    updateProduct: (id, data) => axiosClient.put(`/api/admin/products/${id}`, data),
    deleteProduct: (id) => axiosClient.delete(`/api/admin/products/${id}`),
    getProductTraceability: (productId) => axiosClient.get(`/api/admin/products/${productId}/traceability`),
    getBatchTraceability: (batchCode) => axiosClient.get(`/api/traceability/batch/${batchCode}`),
    uploadProductImage: (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return axiosClient.post("/api/upload/product-image", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },
};

export default productsApi;
