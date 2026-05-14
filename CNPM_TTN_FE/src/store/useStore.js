//ĐÂY LÀ CODE CŨ XỬ LÝ API





import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import API from '../services/api';
console.log("USESTORE FILE RUNNING");

const useStore = create(
  persist(
    (set, get) => ({
      cart: [],
      user: null,
      orders: [],
      products: [],

      setUser: (user) => set({ user }),

      logout: () => {
        localStorage.removeItem("token");
        set({
          user: null,
          cart: [],
          orders: [],
        });
      },

      loadCart: async () => {
        try {
          const res = await API.getCart();
          const items = res.data?.items || [];
          const mapped = items.map(item => {
            const existed = get().cart.find(i =>
              i.ProductId === item.ProductId &&
              i.GrindingOptionId === item.GrindingOptionId &&
              i.FlavorNotes === item.FlavorNotes && 
              i.Weight === item.Weight
            );
            return {
              ...item,
              selected: existed ? existed.selected : true
            };
          });
          set({ cart: mapped });
        } catch (err) {
          console.error("Load cart failed:", err.response?.data?.message || err.message);
        }
      },

      addToCart: async (product, quantity, grindType, flavorNotes, weight, receiverName, receiverPhone, shippingProvince, shippingDistrict, shippingWard, shippingDetailAddress, shippingNote) => {
        try {
          await API.addToCart({
            productId: product.id,
            quantity: quantity,
            grindingOptionId: grindType,
            flavorNotes: flavorNotes,
            weight: weight,
            receiverName: receiverName,
            receiverPhone: receiverPhone,
            shippingProvince: shippingProvince,
            shippingDistrict: shippingDistrict,
            shippingWard: shippingWard,
            shippingDetailAddress: shippingDetailAddress,
            shippingNote: shippingNote
          });

          await get().loadCart();

        } catch (err) {
          console.error("Add to cart failed:", err.response?.data?.message || err.message);
        }
      },

      removeFromCart: async (productId, grindType, flavorNotes, weight) => {
        try {
          await API.removeCartItem(productId, grindType, flavorNotes, weight);
          await get().loadCart();
        } catch (err) {
          console.log("Remove item failed:", err);
        }
      },

      updateQuantity: async (
        productId,
        grindType,
        newQuantity,
        flavorNotes,
        weight
      ) => {
        try {
          await API.updateCartItem({
            productId: productId,
            quantity: newQuantity,
            grindingOptionId: grindType,
            flavorNotes: flavorNotes,
            weight: weight,
          });
          set((state) => ({
            cart: state.cart.map(item =>
              (
                item.ProductId === productId &&
                item.GrindingOptionId === grindType &&
                item.FlavorNotes === flavorNotes && 
                item.Weight === weight
              )
                ? {
                  ...item,
                  Quantity: Math.max(1, newQuantity)
                }
                : item
            )
          }));

          await get().loadCart();

        } catch (err) {
          console.log("Update quantity failed:", err);
        }
      },

      clearCart: () => set({ cart: [] }),

      getTotalQuantity: () =>
        get().cart.reduce((total, item) => total + item.Quantity, 0),

      getTotalQuantityOrder: () =>
        get().orders.reduce((total, order) => {
          const orderQty = order.OrderDetails.reduce(
            (sum, detail) => sum + detail.Quantity,
            0
          );

          return total + orderQty;
        }, 0),

      toggleSelected: (productId, grindType, flavorNotes, weight) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.ProductId == productId && item.FlavorNotes == flavorNotes && item.GrindingOptionId == grindType && item.Weight == weight
              ? { ...item, selected: !item.selected }
              : item)
        })),

      createOrder: async (payload) => {
        try {
          const res = await API.createOrder(payload);

          await get().fetchOrders();
          await get().loadCart();
          return res;
        } catch (err) {
          console.error("Create order failed:", err.response?.data?.message || err.message);
          throw err;
        }
      },

      fetchOrders: async () => {
        try {
          const res = await API.getMyOrders();
          set({ orders: res.data || [] });
        } catch (err) {
          console.error("Fetch orders failed:", err.response?.data?.message || err.message);
        }
      },

      cancelOrder: async (orderId) => {
        await API.cancelOrder(orderId);
        await get().fetchOrders();
      },

      fetchOrderById: async (id) => {
        try {
          const res = await API.getOrderById(id);
          set((state) => ({
            orders: state.orders.find(o => o.Id === res.data.Id)
              ? state.orders.map(o => o.Id === res.data.Id ? res.data : o)
              : [...state.orders, res.data]
          }));
          return res.data;
        } catch (err) {
          console.error("Fetch order detail failed:", err);
        }
      },

      updateOrder: async (id, payload) => {
        try {

          const res = await API.updateOrder(id, payload);

          set((state) => ({
            orders: state.orders.map(order =>
              order.Id === id
                ? res.data
                : order
            )
          }));

          return res.data;

        } catch (err) {

          console.error(
            "Update order failed:",
            err.response?.data?.message || err.message
          );

          throw err;
        }
      },

      fetchProducts: async () => {
        try{
          const res = await API.getProducts();
          console.log("PRODUCT API:", res.data);

          set({
            products: res.data
          });
        }catch(err){
          console.error("Fetch products failed:", err.response?.data?.message || err.message);
        }
      }



    }),
    {
      name: 'revo-coffee-storage',
    }
  )
);
console.log(useStore.getState());
export default useStore;