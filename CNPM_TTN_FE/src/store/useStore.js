import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import API from '../services/api';
console.log("USESTORE FILE RUNNING");
console.log("API imported:", API);
console.log("getDashboard:", API.getDashboard);
console.log("getVouchers:", API.getAvailableVouchers);
console.log("API KEYS:", Object.keys(API));
console.log("QUIZ API EXISTS:", typeof API.getQuizMatchedProducts);

const useStore = create(
  persist(
    (set, get) => ({
      cart: [],
      user: null,
      orders: [],
      products: [],
      dashboard: null,
      totalItems: 0,
      currentPage: 1,


      vouchers: [],
      voucherStats: {
        activeCount: 0,
        usedTodayCount: 0,
        freeshipCount: 0
      },
      availableVouchers: [],
      publicVouchers: [],
      shipperOrders: [],


      //USERS
      setUser: (user) => set({ user }),

      logout: () => {
        localStorage.removeItem("token");
        set({
          user: null,
          cart: [],
          orders: [],
        });
      },


      //CARTS
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
        get().cart.reduce((total, item) => total + item.quantity, 0),

      getTotalQuantityOrder: () =>
        (get().orders || []).reduce((total, order) => {

          const details = order?.OrderDetails || [];

          const orderQty = details.reduce(
            (sum, detail) => sum + (detail?.Quantity || 0),
            0
          );

          return total + orderQty;

        }, 0),

      toggleSelected: (productId, grindType, flavorNotes, weight) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.productId == productId && item.flavorNotes == flavorNotes && item.grindingOptionId == grindType && item.weight == weight
              ? { ...item, selected: !item.selected }
              : item)
        })),

    }),
    {
      name: 'revo-coffee-storage',
      version: 5,
      partialize: (state) => ({
        cart: state.cart,
        user: state.user,
        orders: state.orders,
        dashboard: state.dashboard
      })
    }
  )
);
console.log(useStore.getState());
export default useStore;