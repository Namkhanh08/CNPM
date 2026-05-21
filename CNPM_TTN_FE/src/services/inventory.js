import axiosClient from './axiosClient';

const inventoryApi = {
    getInventory: () => axiosClient.get("/api/Inventory/products"),
    updateStock: (data) => axiosClient.post("/api/Inventory/update-stock", data),
    getInventoryLogs: () => axiosClient.get("/api/Inventory/logs"),
    getTotalStock: () => axiosClient.get("/api/Inventory/total-stock"),
    getBatches: () => axiosClient.get("/api/Inventory/batches"),
    createBatch: (data) => axiosClient.post("/api/Inventory/create-batch-detail", data),
};

export default inventoryApi;
