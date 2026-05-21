import axiosClient from './axiosClient';

const dashboardApi = {
    getDashboardSummary: () => axiosClient.get("/api/admin/dashboard/summary"),
};

export default dashboardApi;
