import React from 'react';
import ProtectedRoute from './components/ProtectedRoute';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Subscription from './pages/Subscription';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import OrderDetail from './pages/OrderDetail';
import EditOrder from './pages/EditOrder';
import QuizCoffee from './components/QuizCoffee';
import RecommendationResult from './pages/RecommendationResult';

// Admin imports
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/Orders';
import AdminProducts from './pages/admin/Products';
import AdminBatches from './pages/admin/Batches';
import AdminInventory from './pages/admin/Inventory';

import './App.css';

function App() {
  return (
    <Router>
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
            <Route index element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="batches" element={<AdminBatches />} />
            <Route path="inventory" element={<AdminInventory />} />
          </Route>
        </Route>
        
      </Routes>
    </Router>
  );
}

export default App;
