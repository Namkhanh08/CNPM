import axiosClient from './axiosClient';

const subscriptions = {
    getMySubscriptions: () => {
        return axiosClient.get('/api/subscriptions');
    },
    getSubscriptions: () => {
        return axiosClient.get('/api/subscriptions');
    },
    createSubscription: (data) => {
        return axiosClient.post('/api/subscriptions', data);
    },
    pauseSubscription: (id) => {
        return axiosClient.put(`/api/subscriptions/${id}/pause`);
    },
    toggleSkipSubscription: (id) => {
        return axiosClient.put(`/api/subscriptions/${id}/toggle-skip`);
    },
    resumeSubscription: (id) => {
        return axiosClient.put(`/api/subscriptions/${id}/resume`);
    },
    cancelSubscription: (id) => {
        return axiosClient.put(`/api/subscriptions/${id}/cancel`);
    },
    processDueSubscriptions: () => {
        return axiosClient.post('/api/subscriptions/process-due');
    },
    adminGetSubscriptions: (params) => {
        return axiosClient.get('/api/subscriptions/admin', { params });
    },
    adminUpdateSubscriptionStatus: (id, status) => {
        return axiosClient.put(`/api/subscriptions/admin/${id}/status`, { status });
    },
    updateSubscriptionConfig: (id, data) => {
        return axiosClient.put(`/api/subscriptions/${id}/config`, data);
    }
};

export default subscriptions;
