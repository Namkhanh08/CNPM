import axiosClient from './axiosClient';

const dashboardApi = {
    getDashboardSummary: () => axiosClient.get("/api/admin/dashboard/summary"),
    getRevenueChart: (params) => axiosClient.get("/api/admin/dashboard/revenue", { params }),
};

export default dashboardApi;
