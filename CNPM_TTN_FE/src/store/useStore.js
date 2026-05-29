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
      subscriptions: [],

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
          const items = res.data?.items || res.data?.Items || [];
          const mapped = items.map(item => {
            const normalizedItem = {
              Id: item.id ?? item.Id,
              ProductId: item.productId ?? item.ProductId,
              GrindingOptionId: item.grindingOptionId ?? item.GrindingOptionId,
              FlavorNotes: item.flavorNotes ?? item.FlavorNotes ?? 'Original',
              Weight: item.weight ?? item.Weight ?? '250g',
              Quantity: item.quantity ?? item.Quantity ?? 1,
              Product: item.product ? {
                Id: item.product.id ?? item.product.Id,
                Name: item.product.name ?? item.product.Name,
                Price: item.product.price ?? item.product.Price ?? 0,
                ImageUrl: item.product.imageUrl ?? item.product.ImageUrl
              } : (item.Product ? {
                Id: item.Product.Id ?? item.Product.id,
                Name: item.Product.Name ?? item.Product.name,
                Price: item.Product.Price ?? item.Product.price ?? 0,
                ImageUrl: item.Product.ImageUrl ?? item.Product.imageUrl
              } : null)
            };

            const existed = get().cart.find(i =>
              i.ProductId === normalizedItem.ProductId &&
              i.GrindingOptionId === normalizedItem.GrindingOptionId &&
              i.FlavorNotes === normalizedItem.FlavorNotes && 
              i.Weight === normalizedItem.Weight
            );
            return {
              ...normalizedItem,
              selected: existed ? existed.selected : true
            };
          });
          set({ cart: mapped });
        } catch (err) {
          console.error("Load cart failed:", err.response?.data?.Message || err.response?.data?.message || err.message);
          if (err.response?.status === 401) {
            set({ user: null, cart: [], orders: [] });
          }
        }
      },

      addToCart: async (product, quantity, grindType, flavorNotes, weight, receiverName, receiverPhone, shippingProvince, shippingDistrict, shippingWard, shippingDetailAddress, shippingNote) => {
        try {
          const productId = product?.id ?? product?.Id ?? product?.productId ?? product?.ProductId;
          if (!productId) {
            throw new Error("Không xác định được sản phẩm để thêm vào giỏ hàng.");
          }

          await API.addToCart({
            productId,
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
          console.error("Add to cart failed:", err.response?.data?.Message || err.response?.data?.message || err.message);
          throw err;
        }
      },

      removeFromCart: async (cartItemId) => {
        try {
          await API.removeCartItem(cartItemId);
          await get().loadCart();
        } catch (err) {
          console.error("Remove item failed:", err.response?.data?.Message || err.response?.data?.message || err.message);
          throw err;
        }
      },

      updateQuantity: async (cartItemId, newQuantity) => {
        try {
          await API.updateCartItem({
            cartItemId: cartItemId,
            id: cartItemId,
            quantity: newQuantity,
          });

          set((state) => ({
            cart: state.cart.map(item =>
              item.Id === cartItemId
                ? {
                  ...item,
                  Quantity: Math.max(1, newQuantity)
                }
                : item
            )
          }));

          await get().loadCart();

        } catch (err) {
          console.error("Update quantity failed:", err.response?.data?.Message || err.response?.data?.message || err.message);
          throw err;
        }
      },

      clearCart: () => set({ cart: [] }),

      getTotalQuantity: () =>
        get().cart.reduce((total, item) => total + item.Quantity, 0),

      getTotalQuantityOrder: () =>
        get().orders.reduce((total, order) => {
          const details = order.OrderDetails ?? order.orderDetails ?? [];
          const orderQty = details.reduce(
            (sum, detail) => sum + (detail.Quantity ?? detail.quantity ?? 0),
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
          console.error("Create order failed:", err.response?.data?.Message || err.response?.data?.message || err.message);
          throw err;
        }
      },

      fetchOrders: async () => {
        try {
          const res = await API.getMyOrders();
          set({ orders: res.data || [] });
        } catch (err) {
          console.error("Fetch orders failed:", err.response?.data?.Message || err.response?.data?.message || err.message);
          if (err.response?.status === 401) {
            set({ user: null, cart: [], orders: [] });
          }
        }
      },

      cancelOrder: async (orderId) => {
        await API.cancelOrder(orderId);
        await get().fetchOrders();
      },

      completeOrder: async (orderId) => {
        const res = await API.completeOrder(orderId);
        set((state) => ({
          orders: state.orders.map(order =>
            (order.Id === orderId || order.id === orderId) ? res.data : order
          )
        }));
        return res.data;
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
            err.response?.data?.Message || err.response?.data?.message || err.message
          );

          throw err;
        }
      },

      fetchAdminOrders: async () => {
        try {
          const res = await API.getAdminOrders();
          set({ orders: res.data || [] });
        } catch (err) {
          console.error("Fetch admin orders failed:", err.response?.data?.Message || err.response?.data?.message || err.message);
        }
      },

      updateOrderStatus: async (id, status) => {
        try {
          const res = await API.updateOrderStatus(id, status);
          set((state) => ({
            orders: state.orders.map(order =>
              (order.Id === id || order.id === id) ? res.data : order
            )
          }));
          return res.data;
        } catch (err) {
          console.error("Update order status failed:", err.response?.data?.Message || err.response?.data?.message || err.message);
          throw err;
        }
      },

      fetchProducts: async () => {
        try{
          const res = await API.getProducts();
          console.log("PRODUCT API:", res.data);
          const pageData = res.data?.data || res.data?.Data || {};
          const productList =
            pageData.items ||
            pageData.Items ||
            res.data?.items ||
            res.data?.Items ||
            res.data ||
            [];

          set({
            products: Array.isArray(productList) ? productList : []
          });
        }catch(err){
          console.error("Fetch products failed:", err.response?.data?.Message || err.response?.data?.message || err.message);
        }
      },

      fetchSubscriptions: async () => {
        try {
          const res = await (API.getSubscriptions ? API.getSubscriptions() : API.getMySubscriptions());
          const items = res.data?.data || res.data?.Data || res.data || [];
          set({ subscriptions: Array.isArray(items) ? items : [] });
        } catch (err) {
          console.error("Fetch subscriptions failed:", err.response?.data || err.message);
        }
      },

      toggleSkipSubscription: async (id) => {
        try {
          if (API.toggleSkipSubscription) {
            await API.toggleSkipSubscription(id);
          } else if (API.pauseSubscription) {
            await API.pauseSubscription(id);
          }
          await get().fetchSubscriptions();
        } catch (err) {
          console.error("Toggle subscription failed:", err.response?.data || err.message);
          throw err;
        }
      },

      cancelSubscription: async (id) => {
        try {
          await API.cancelSubscription(id);
          await get().fetchSubscriptions();
        } catch (err) {
          console.error("Cancel subscription failed:", err.response?.data || err.message);
          throw err;
        }
      },

      updateSubscriptionConfig: async (id, payload) => {
        try {
          await API.updateSubscriptionConfig(id, payload);
          await get().fetchSubscriptions();
        } catch (err) {
          console.error("Update subscription config failed:", err.response?.data || err.message);
          throw err;
        }
      }



    }),
    {
      name: 'revo-coffee-storage',
      partialize: (state) => ({
        user: state.user,
        cart: state.cart,
      }),
    }
  )
);
console.log(useStore.getState());
export default useStore;
