import axiosClient from './axiosClient';

const inventoryApi = {
    getInventory: () => axiosClient.get("/api/Inventory/products"),
    updateStock: (dataOrProductId, quantity, reason) => {
        if (typeof dataOrProductId === "object") {
            return axiosClient.post("/api/Inventory/update-stock", dataOrProductId);
        }

        return axiosClient.post("/api/Inventory/update-stock", {
            productId: dataOrProductId,
            quantity,
            reason,
        });
    },
    getInventoryLogs: () => axiosClient.get("/api/Inventory/logs"),
    getLogs: () => axiosClient.get("/api/Inventory/logs"),
    getTotalStock: () => axiosClient.get("/api/Inventory/total-stock"),
    getBatches: () => axiosClient.get("/api/Inventory/batches"),
    getBatchesDetail: () => axiosClient.get("/api/Inventory/batches"),
    createBatch: (data) => axiosClient.post("/api/Inventory/create-batch-detail", data),
    createBatchDetail: (productId, batchCode, roastLevel, inputWeight, status) =>
        axiosClient.post("/api/Inventory/create-batch-detail", {
            productId,
            batchCode,
            roastLevel,
            inputWeight,
            status,
        }),
    updateBatchStatus: (id, status) =>
        axiosClient.patch(`/api/Inventory/batches/${id}/status`, { status }),
};

export default inventoryApi;
