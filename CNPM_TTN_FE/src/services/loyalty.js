import axiosClient from './axiosClient';

const loyalty = {
    getLoyaltyInfo: () => {
        return axiosClient.get('/api/loyalty');
    },
    redeemPoints: (points) => {
        return axiosClient.post('/api/loyalty/redeem', { points });
    }
};

export default loyalty;
