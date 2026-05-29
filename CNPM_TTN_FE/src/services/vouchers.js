import axiosClient from './axiosClient';

const vouchers = {
    validateVoucher: (code, total, paymentMethod, productIds = []) => {
        return axiosClient.post('/api/vouchers/validate', {
            code,
            orderTotal: total,
            paymentMethod,
            productIds
        });
    },
    getAvailableVouchers: (params) => {
        return axiosClient.get('/api/vouchers/available', { params });
    },
    getAllVouchers: () => {
        return axiosClient.get('/api/vouchers');
    },
    createVoucher: (data) => {
        return axiosClient.post('/api/vouchers', data);
    },
    updateVoucher: (id, data) => {
        return axiosClient.put(`/api/vouchers/${id}`, data);
    },
    deleteVoucher: (id) => {
        return axiosClient.delete(`/api/vouchers/${id}`);
    }
};

export default vouchers;
