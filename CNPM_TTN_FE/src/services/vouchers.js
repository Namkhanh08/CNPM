import axiosClient from './axiosClient';

const vouchers = {
    validateVoucher: (code, total) => {
        return axiosClient.get(`/api/vouchers/validate?code=${code}&total=${total}`);
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
