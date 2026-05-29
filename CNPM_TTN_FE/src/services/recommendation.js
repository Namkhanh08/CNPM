import axiosClient from './axiosClient';

const recommendationApi = {
    getRecommendation: (answers) => axiosClient.post("/api/recommendation", answers),
};

export default recommendationApi;
