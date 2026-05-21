import axiosClient from './axiosClient';

const cartsApi = {
    getCart: () => axiosClient.get("/api/carts"),
    addToCart: (data) => axiosClient.post("/api/carts/add", data),
    updateCartItem: (data) => axiosClient.put("/api/carts/update", data),
    removeCartItem: (cartItemId) =>
        axiosClient.delete("/api/carts/remove", { 
            data: { cartItemId, id: cartItemId } 
        }),
};

export default cartsApi;
