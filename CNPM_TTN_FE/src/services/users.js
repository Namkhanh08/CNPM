import axiosClient from './axiosClient';

const usersApi = {
    getUsers: () => axiosClient.get("/api/users"),
    createUser: (data) => axiosClient.post("/api/users", data),
    updateUser: (id, data) => axiosClient.put(`/api/users/${id}`, data),
    deleteUser: (id) => axiosClient.delete(`/api/users/${id}`),
    adminGetUsers: () => axiosClient.get("/api/users"),
    adminCreateUser: (data) => axiosClient.post("/api/users", data),
    adminUpdateUser: (id, data) => axiosClient.put(`/api/users/${id}`, data),
    adminDeleteUser: (id) => axiosClient.delete(`/api/users/${id}`),

    // Profile self-management
    getProfile: () => axiosClient.get("/api/profile"),
    updateProfile: (data) => axiosClient.put("/api/profile", data),
    changePassword: (data) => axiosClient.put("/api/profile/change-password", data),
    getUserProfile: (id) => axiosClient.get(`/api/users/${id}`),
    updateUserProfile: (id, data) => axiosClient.put(`/api/users/${id}`, data),
    uploadUserImage: (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return axiosClient.post("/api/upload/user-image", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },
};

export default usersApi;
