import React from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./layouts/Layout";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Subscription from "./pages/Subscription";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import OrderDetail from "./pages/OrderDetail";
import EditOrder from "./pages/EditOrder";
import PaymentPage from "./pages/PaymentPage";
import Contact from './pages/Contact';
import SubscriptionPortal from './pages/SubscriptionPortal';


// Admin imports
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminOrders from "./pages/admin/Orders";
import AdminProducts from "./pages/admin/Products";
import AdminBatches from "./pages/admin/Batches";
import AdminInventory from "./pages/admin/Inventory";
import AdminUsers from "./pages/admin/Users";
import AdminVouchers from "./pages/admin/Vouchers";
import AdminShipping from "./pages/admin/ShipperOrders";
import AdminSubscriptions from './pages/admin/Subscription';

import "./App.css";

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
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="orders/edit/:id" element={<EditOrder />} />
          <Route path="checkout/payment/:orderId" element={<PaymentPage />} />
          <Route path="contact" element={<Contact />} />
          <Route path="portal" element={<SubscriptionPortal />} />
        </Route>

        <Route
          element={<ProtectedRoute allowedRoles={[1, 2, 3]} fallbackTo="/" />}
        >
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="batches" element={<AdminBatches />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="vouchers" element={<AdminVouchers />} />
            <Route path="shipping" element={<AdminShipping />} />
            <Route path="subscriptions" element={<AdminSubscriptions />} />
            <Route
              element={
                <ProtectedRoute allowedRoles={[1]} fallbackTo="/admin" />
              }
            >
              <Route path="users" element={<AdminUsers />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    
    </Router>
  );
}

export default App;
