import axiosClient from './axiosClient';

const usersApi = {
    getUsers: () => axiosClient.get("/api/users"),
    createUser: (data) => axiosClient.post("/api/users", data),
    updateUser: (id, data) => axiosClient.put(`/api/users/${id}`, data),
    deleteUser: (id) => axiosClient.delete(`/api/users/${id}`),

    // Profile self-management
    getProfile: () => axiosClient.get("/api/profile"),
    updateProfile: (data) => axiosClient.put("/api/profile", data),
    changePassword: (data) => axiosClient.put("/api/profile/change-password", data),
};

export default usersApi;
