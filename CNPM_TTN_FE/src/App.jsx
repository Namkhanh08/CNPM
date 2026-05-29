import React, { Suspense, lazy, useEffect } from 'react';
import { ProtectedRoute, QuizCoffee } from './components';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import useStore from './store/useStore';

// Lazy load client pages
const Home = lazy(() => import('./pages/client/Home'));
const Shop = lazy(() => import('./pages/client/Shop'));
const ProductDetail = lazy(() => import('./pages/client/ProductDetail'));
const Cart = lazy(() => import('./pages/client/Cart'));
const Checkout = lazy(() => import('./pages/client/Checkout'));
const Subscription = lazy(() => import('./pages/client/Subscription'));
const Orders = lazy(() => import('./pages/client/Orders'));
const Profile = lazy(() => import('./pages/client/Profile'));
const OrderDetail = lazy(() => import('./pages/client/OrderDetail'));
const EditOrder = lazy(() => import('./pages/client/EditOrder'));
const RecommendationResult = lazy(() => import('./pages/client/RecommendationResult'));

// Lazy load admin pages
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const AdminBatches = lazy(() => import('./pages/admin/Batches'));
const AdminInventory = lazy(() => import('./pages/admin/Inventory'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminVouchers = lazy(() => import('./pages/admin/Vouchers'));
const AdminSubscriptions = lazy(() => import('./pages/admin/Subscriptions'));

import './App.css';

function App() {
  const user = useStore((state) => state.user);
  const loadCart = useStore((state) => state.loadCart);
  const fetchOrders = useStore((state) => state.fetchOrders);

  // Tự động đồng bộ giỏ hàng và đơn hàng khi người dùng đã đăng nhập
  useEffect(() => {
    if (user) {
      loadCart();
      fetchOrders();
    }
  }, [user, loadCart, fetchOrders]);

  return (
    <Router>
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#F7F2EC] text-[#7F5539] font-nunito">
          <div className="w-12 h-12 border-4 border-[#7F5539] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg font-semibold tracking-wide">Đang tải trang...</p>
        </div>
      }>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="shop" element={<Shop />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="subscription" element={<Subscription />} />
            <Route path="orders" element={<Orders />} />
            <Route path="profile" element={<Profile />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="/orders/edit/:id" element={<EditOrder />} />
          </Route>

          {/* Quiz & Recommendation — layout riêng, không có Header/Footer của Layout */}
          <Route path="/quiz" element={<QuizCoffee />} />
          <Route path="/recommendation/result" element={<RecommendationResult />} />

          {/* Lớp Admin Routing */}
          <Route element={<ProtectedRoute allowedRoles={[1, 2, 3]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route element={<ProtectedRoute allowedRoles={[1]} />}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="vouchers" element={<AdminVouchers />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={[1, 2]} />}>
                <Route path="orders" element={<AdminOrders />} />
                <Route path="batches" element={<AdminBatches />} />
                <Route path="subscriptions" element={<AdminSubscriptions />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={[1, 3]} />}>
                <Route path="inventory" element={<AdminInventory />} />
              </Route>
            </Route>
          </Route>
          
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
