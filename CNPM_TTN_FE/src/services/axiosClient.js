import axios from 'axios';

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5126",
    headers: {
        "Content-Type": "application/json"
    },
});

// Interceptor: Tự động đính kèm JWT token vào header nếu có
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Xử lý lỗi tập trung (Ví dụ: Token hết hạn)
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.clear();
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
