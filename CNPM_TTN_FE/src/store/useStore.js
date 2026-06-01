import { create } from "zustand";
import { persist } from "zustand/middleware";
import API from "../services/api";

console.log("USESTORE FILE RUNNING");

const useStore = create(
  persist(
    (set, get) => ({
      // --- STATE KHÁCH HÀNG (Cần lưu LocalStorage) ---
      cart: [],
      user: null,
      orders: [], // Chỉ chứa đơn hàng của USER hiện tại

      // --- STATE ADMIN / SHIPPER (KHÔNG lưu LocalStorage để tránh lỗi cache) ---
      //adminOrders: [], // Tách riêng mảng đơn hàng của Admin ra đây
      products: [],
      dashboard: null,
      totalItems: 0,
      currentPage: 1,

      vouchers: [],
      voucherStats: {
        activeCount: 0,
        usedTodayCount: 0,
        freeshipCount: 0,
      },
      availableVouchers: [],
      publicVouchers: [],
      shipperOrders: [],

      // USERS
      setUser: (user) => set({ user }),

      logout: () => {
        localStorage.removeItem("token");
        set({
          user: null,
          cart: [],
          orders: [],
          //  adminOrders: [],
          // dashboard: null,
        });
      },

      // CARTS
      // CARTS
      loadCart: async () => {
        try {
          const res = await API.getCart();
          const items = res.data?.items || [];
          const mapped = items.map((item) => {
            const existed = get().cart.find(
              (i) =>
                i.ProductId === item.ProductId &&
                i.GrindingOptionId === item.GrindingOptionId &&
                i.FlavorNotes === item.FlavorNotes &&
                i.Weight === item.Weight
            );
            return {
              ...item,
              selected: existed ? existed.selected : true,
            };
          });
          set({ cart: mapped });
        } catch (err) {
          console.error(
            "Load cart failed:",
            err.response?.data?.message || err.message
          );
        }
      },

      addToCart: async (
        product,
        quantity,
        grindType,
        flavorNotes,
        weight,
        receiverName,
        receiverPhone,
        shippingProvince,
        shippingDistrict,
        shippingWard,
        shippingDetailAddress,
        shippingNote
      ) => {
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
            shippingNote: shippingNote,
          });
          await get().loadCart();
        } catch (err) {
          console.error(
            "Add to cart failed:",
            err.response?.data?.message || err.message
          );
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
            cart: state.cart.map((item) =>
              item.ProductId === productId &&
              item.GrindingOptionId === grindType &&
              item.FlavorNotes === flavorNotes &&
              item.Weight === weight
                ? { ...item, Quantity: Math.max(1, newQuantity) }
                : item
            ),
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
          const details = order?.orderDetails || [];
          const orderQty = details.reduce(
            (sum, detail) => sum + (detail?.quantity || 0),
            0
          );
          return total + orderQty;
        }, 0),

      toggleSelected: (productId, grindType, flavorNotes, weight) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.productId == productId &&
            item.flavorNotes == flavorNotes &&
            item.grindingOptionId == grindType &&
            item.weight == weight
              ? { ...item, selected: !item.selected }
              : item
          ),
        })),

      //ORDER
      //ORDERS
      createOrder: async (payload) => {
        try {
          const res = await API.createOrder(payload);

          await get().fetchOrders();
          await get().loadCart();
          return res;
        } catch (err) {
          console.error(
            "Create order failed:",
            err.response?.data?.message || err.message
          );
          throw err;
        }
      },

      fetchOrders: async () => {
        try {
          const res = await API.getMyOrders();
          console.log("MY ORDER RESPONSE:", res.data);
          set({ orders: res.data || [] });
        } catch (err) {
          console.error(
            "Fetch orders failed:",
            err.response?.data?.message || err.message
          );
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
            orders: state.orders.find((o) => o.Id === res.data.Id)
              ? state.orders.map((o) => (o.Id === res.data.Id ? res.data : o))
              : [...state.orders, res.data],
          }));
          return res.data;
        } catch (err) {
          console.error("Fetch order detail failed:", err);
        }
      },

      fetchAllOrdersAdmin: async (
        page = 1,
        searchTerm = "",
        status = "all"
      ) => {
        try {
          const res = await API.fetchAllOrdersAdmin(page, searchTerm, status);
          // Lưu ý: res.data bây giờ là object PageResponse { items, totalItems, page, pageSize }
          set({
            orders: res.data.items || [],
            totalItems: res.data.totalItems,
            currentPage: res.data.page,
          });
        } catch (err) {
          console.error("Lỗi lấy danh sách admin:", err);
        }
      },

      updateOrder: async (id, payload) => {
        try {
          const res = await API.updateOrder(id, payload);

          set((state) => ({
            orders: state.orders.map((order) =>
              order.Id === id
                ? {
                    ...order,
                    ...res.data,
                  }
                : order
            ),
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

      confirmOrder: async (id) => {
        try {
          await API.confirmOrder(id);
          // Sau khi confirm thành công, refresh lại danh sách để cập nhật Stock và Status
          const { currentPage } = get();
          await get().fetchAllOrdersAdmin(currentPage);
        } catch (err) {
          alert(
            "Lỗi xác nhận: " + (err.response?.data || "Không đủ hàng trong kho")
          );
          throw err;
        }
      },

      updateOrderStatus: async (id, status) => {
        try {
          const res = await API.updateOrderStatus(id, status);

          set((state) => ({
            orders: state.orders.map((order) =>
              order.Id === id ? res.data : order
            ),
          }));

          return res.data;
        } catch (err) {
          console.error(
            "Update status failed:",
            err.response?.data?.message || err.message
          );

          throw err;
        }
      },

      fetchProducts: async () => {
        try {
          const res = await API.getProducts();
          set({ products: res.data });
        } catch (err) {
          console.error(
            "Fetch products failed:",
            err.response?.data?.message || err.message
          );
        }
      },

      fetchQuizMatchedProducts: async (
        flavorNotes,
        region,
        process,
        roast,
        height
      ) => {
        try {
          const res = await API.getQuizMatchedProducts(
            flavorNotes,
            region,
            process,
            roast,
            height
          );
          return res.data || [];
        } catch (err) {
          console.error(
            "Lỗi khi lấy sản phẩm theo gu: ",
            err.response?.data || err.message
          );
        }
      },

      // ADMIN DASHBOARD
      fetchDashboard: async () => {
        try {
          const res = await API.getDashboard();

          set({
            dashboard: res.data,
          });

          console.log("Dashboard data:", res.data);
        } catch (err) {
          console.error(
            "Fetch dashboard failed:",
            err.response?.data?.message || err.message
          );
        }
      },
      // VOUCHERS ADMIN
      fetchVouchersAdmin: async (page = 1, searchTerm = "", status = "all") => {
        try {
          const res = await API.getVouchersAdmin(page, searchTerm, status);
          const pagedData = res.data.pagedData || {};
          set({
            vouchers: pagedData.items || [],
            totalItems: pagedData.totalItems || 0,
            currentPage: pagedData.page || page,
            voucherStats: {
              activeCount: res.data.activeCount || 0,
              usedTodayCount: res.data.usedCount || 0,
              freeshipCount: res.data.freeshipCount || 0,
            },
          });
        } catch (err) {
          console.error("Lỗi lấy danh sách voucher:", err.message);
        }
      },

      fetchAvailableVouchers: async (items, paymentMethod) => {
        try {
          const payload = {
            items: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
            paymentMethod: paymentMethod === "cod" ? "COD" : "VNPAY",
          };
          const res = await API.getAvailableVouchers(payload);
          set({ availableVouchers: res.data || [] });
        } catch (err) {
          console.error(
            "Fetch vouchers failed:",
            err.response?.data || err.message
          );
        }
      },

      fetchPublicVouchers: async () => {
        try {
          const res = await API.getPublicVouchers();
          set({ publicVouchers: res.data });
        } catch (err) {
          console.error("Fetch public vouchers failed:", err.message);
        }
      },

      createVoucher: async (data) => {
        try {
          await API.createVoucher(data);
          await get().fetchVouchersAdmin();
        } catch (err) {
          console.error(
            "Create voucher failed:",
            err.response?.data || err.message
          );
          throw err;
        }
      },

      updateVoucher: async (id, data) => {
        try {
          await API.updateVoucher(id, data);
          await get().fetchVouchersAdmin();
        } catch (err) {
          console.error(
            "Update voucher failed:",
            err.response?.data || err.message
          );
          throw err;
        }
      },

      deleteVoucher: async (id) => {
        try {
          await API.deleteVoucher(id);
          await get().fetchVouchersAdmin();
        } catch (err) {
          console.error(
            "Delete voucher failed:",
            err.response?.data || err.message
          );
          throw err;
        }
      },

      toggleVoucher: async (id, active) => {
        try {
          await API.toggleVoucher(id, active);
          await get().fetchVouchersAdmin();
        } catch (err) {
          console.error(
            "Toggle voucher failed:",
            err.response?.data || err.message
          );
          throw err;
        }
      },

      // SHIPPER
      fetchShipperOrders: async (page = 1, searchTerm = "") => {
        try {
          const res = await API.fetchShipperOrders(page, searchTerm);
          set({
            shipperOrders: res.data.items || [],
            totalItems: res.data.totalItems || 0,
            currentPage: res.data.page || 1,
          });
        } catch (err) {
          console.error(
            "Lỗi lấy danh sách đơn cho Shipper:",
            err.response?.data || err.message
          );
        }
      },

      updateShipperStatus: async (id, statusAction) => {
        try {
          let res;
          if (statusAction === "Hoàn thành") {
            res = await API.shipperCompleteOrder(id);
          } else {
            res = await API.shipperFailOrder(id);
          }
          set((state) => ({
            shipperOrders: (state.shipperOrders || []).filter(
              (order) => order.Id !== id
            ),
            totalItems: Math.max(0, state.totalItems - 1),
          }));
          return { success: true, data: res.data };
        } catch (err) {
          console.error("Cập nhật đơn hàng Shipper thất bại:", err);
          return {
            success: false,
            error: err.response?.data || "Cập nhật trạng thái thất bại",
          };
        }
      },

      //SUBSCRIPTIONS
      fetchSubscriptions: async () => {
        try {
          const res = await API.getSubscriptions();

          set({
            subscriptions: res.data || [],
          });
        } catch (err) {
          console.error(
            "Fetch subscriptions failed:",
            err.response?.data || err.message
          );
        }
      },

      toggleSkipSubscription: async (id) => {
        try {
          await API.toggleSkipSubscription(id);

          await get().fetchSubscriptions();
        } catch (err) {
          console.error(
            "Toggle subscription failed:",
            err.response?.data || err.message
          );
        }
      },

      cancelSubscription: async (id) => {
        try {
          await API.cancelSubscription(id);

          await get().fetchSubscriptions();
        } catch (err) {
          console.error(
            "Cancel subscription failed:",
            err.response?.data || err.message
          );
        }
      },

      updateSubscriptionConfig: async (id, payload) => {
        try {
          await API.updateSubscriptionConfig(id, payload);

          await get().fetchSubscriptions();
        } catch (err) {
          console.error(
            "Update subscription config failed:",
            err.response?.data || err.message
          );
        }
      },
    }),

    {
      name: "revo-coffee-storage",
      version: 2,
      partialize: (state) => ({
        cart: state.cart,
        user: state.user,
        orders: state.orders,
      }),
    }
  )
);

export default useStore;
