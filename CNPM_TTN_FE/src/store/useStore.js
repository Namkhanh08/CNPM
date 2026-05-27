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
      adminOrders: [], // Tách riêng mảng đơn hàng của Admin ra đây
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
          adminOrders: [],
          dashboard: null,
        });
      },

      // CARTS
      loadCart: async () => {
        try {
          const res = await API.getCart();
          // Backend trả về danh sách items, nếu null/undefined thì mặc định mảng rỗng
          const items = res.data?.items || res.data || [];
          
          const mapped = items.map((item) => {
            const currentProductId = item.productId || item.ProductId || item.product?.id || item.Product?.Id;
            const currentGrindId = item.grindingOptionId || item.GrindingOptionId;
            const currentFlavor = item.flavorNotes || item.FlavorNotes || "";
            const currentWeight = item.weight || item.Weight || "";
            const currentQuantity = item.quantity || item.Quantity || 1;
            const currentPrice = item.price || item.Price || item.product?.price || item.Product?.Price || 0;

            // Kiểm tra trạng thái selected từ LocalStorage cũ nếu có
            const existed = (get().cart || []).find(
              (i) =>
                ((i.productId || i.ProductId) === currentProductId) &&
                ((i.grindingOptionId || i.GrindingOptionId) === currentGrindId) &&
                ((i.flavorNotes || i.FlavorNotes) === currentFlavor) &&
                ((i.weight || i.Weight) === currentWeight)
            );

            return {
              ...item,
              id: item.id || item.Id,
              productId: currentProductId,
              grindingOptionId: currentGrindId,
              flavorNotes: currentFlavor,
              weight: currentWeight,
              quantity: currentQuantity,
              price: currentPrice,

              Id: item.id || item.Id,
              ProductId: currentProductId,
              GrindingOptionId: currentGrindId,
              FlavorNotes: currentFlavor,
              Weight: currentWeight,
              Quantity: currentQuantity,
              Price: currentPrice,

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
        weight
        // BỎ CÁC TRƯỜNG ĐỊA CHỈ GIAO HÀNG ĐÃ THỪA Ở ĐÂY
      ) => {
        try {
          // Đảm bảo dữ liệu gửi lên Backend chuẩn xác theo kiểu dữ liệu (số và chuỗi)
          await API.addToCart({
            productId: Number(product.id || product.Id),
            quantity: Number(quantity),
            grindingOptionId: Number(grindType),
            flavorNotes: flavorNotes || "",
            weight: weight || "",
          });
          
          // Sau khi backend lưu thành công vào Database, gọi hàm load lại giỏ hàng để cập nhật UI
          await get().loadCart();
        } catch (err) {
          console.error(
            "Add to cart failed:",
            err.response?.data?.message || err.response?.data || err.message
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
          
          // ĐÃ SỬA: Đồng bộ kiểm tra chữ thường tại Store để cập nhật tức thì (State)
          set((state) => ({
            cart: state.cart.map((item) =>
              (item.productId === productId) &&
              (item.grindingOptionId === grindType) &&
              (item.flavorNotes === flavorNotes) &&
              (item.weight === weight)
                ? { ...item, quantity: Math.max(1, newQuantity) }
                : item
            ),
          }));
          await get().loadCart();
        } catch (err) {
          console.log("Update quantity failed:", err);
        }
      },

      clearCart: () => set({ cart: [] }),

      // ĐÃ SỬA: Tính tổng số lượng dựa trên thuộc tính `item.quantity` chữ thường
      getTotalQuantity: () =>
        (get().cart || []).reduce((total, item) => total + (item.quantity || item.Quantity || 0), 0),

      getTotalQuantityOrder: () =>
        (get().orders || []).reduce((total, order) => {
          const details = order?.orderDetails || order?.OrderDetails || [];
          const orderQty = details.reduce(
            (sum, detail) => sum + (detail?.quantity || detail?.Quantity || 0),
            0
          );
          return total + orderQty;
        }, 0),

      // ĐÃ SỬA: Đồng bộ chữ thường cho hàm toggle checkbox chọn hàng
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

      // ORDERS (USER)
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
          set({ orders: res.data || [] });
        } catch (err) {
          console.error(
            "Fetch orders failed:",
            err.response?.data?.message || err.message
          );
        }
      },

      cancelOrder: async (orderId) => {
        try {
          await API.cancelOrder(orderId);
          await get().fetchOrders();
        } catch (err) {
          console.error("Cancel order failed:", err);
          throw err;
        }
      },

      fetchOrderById: async (id) => {
        try {
          const res = await API.getOrderById(id);
          set((state) => ({
            orders: state.orders.find((o) => (o.id || o.Id) === (res.data.id || res.data.Id))
              ? state.orders.map((o) => ((o.id || o.Id) === (res.data.id || res.data.Id) ? res.data : o))
              : [...state.orders, res.data],
          }));
          return res.data;
        } catch (err) {
          console.error("Fetch order detail failed:", err);
        }
      },
      updateUserOrder: async (id, payload) => {
        try {
          const res = await API.updateOrder(id, payload); // Dùng chung API với Admin nếu backend hỗ trợ
          set((state) => ({
            orders: state.orders.map((o) => 
              (o.id === id || o.Id === id) ? { ...o, ...res.data } : o
            ),
          }));
          return res.data;
        } catch (err) {
          console.error("Update order failed:", err);
          throw err;
        }
      },

      // --- ORDERS (ADMIN) ---
      fetchAllOrdersAdmin: async (
        page = 1,
        searchTerm = "",
        status = "all"
      ) => {
        try {
          const res = await API.fetchAllOrdersAdmin(page, searchTerm, status);
          set({
            adminOrders: res.data.orders || [], 
            totalItems: res.data.totalItems || 0,
            currentPage: res.data.page || 1,
          });
        } catch (err) {
          console.error("Lỗi lấy danh sách admin:", err);
          set({ adminOrders: [], totalItems: 0 }); 
        }
      },

      updateOrder: async (id, payload) => {
        try {
          const res = await API.updateOrder(id, payload);
          set((state) => ({
            adminOrders: state.adminOrders.map((order) =>
              (order.id === id || order.Id === id) ? { ...order, ...res.data } : order
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
            adminOrders: state.adminOrders.map((order) =>
              (order.id === id || order.Id === id) ? { ...order, ...res.data } : order
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
          set({ dashboard: res.data });
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
          set({
            vouchers: res.data.voucher || [],
            totalItems: res.data.totalItems || 0,
            voucherStats: {
              activeCount: res.data.activeCount || 0,
              usedTodayCount: res.data.usedTodayCount || 0,
              freeshipCount: res.data.freeshipCount || 0,
            },
          });
        } catch (err) {
          console.error(
            "Fetch vouchers failed:",
            err.response?.data?.message || err.message
          );
        }
      },

      fetchAvailableVouchers: async (items, paymentMethod) => {
        try {
          const payload = {
            items: items.map((item) => ({
              productId: item.productId || item.ProductId,
              quantity: item.quantity || item.Quantity,
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
          console.error(err);
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
              (order) => order.id !== id && order.Id !== id
            ),
            totalItems: Math.max(0, state.totalItems - 1),
          }));
          return { success: true, data: res.data };
        } catch (err) {
          console.error("Cập nhật đơn hàng Shipper thất bại:", err);
          const errorMsg =
            err.response?.data || "Cập nhật trạng thái đơn hàng thất bại";
          return { success: false, error: errorMsg };
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