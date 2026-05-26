import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Archive, Database, Users } from 'lucide-react';
import useStore from '../store/useStore';
import { AdminSidebar, AdminHeader } from '../components';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const logout = useStore((state) => state.logout);
  const userType = Number(localStorage.getItem("userType") ?? 0);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userType");
    navigate('/');
  };

  const navItems = [
    { name: 'Tổng quan', path: '/admin', icon: <LayoutDashboard size={20} />, roles: [1] },
    { name: 'Đơn hàng', path: '/admin/orders', icon: <ShoppingCart size={20} />, roles: [1, 2] },
    { name: 'Sản phẩm', path: '/admin/products', icon: <Package size={20} />, roles: [1] },
    { name: 'Người dùng', path: '/admin/users', icon: <Users size={20} />, roles: [1] },
    { name: 'Lô rang', path: '/admin/batches', icon: <Database size={20} />, roles: [1, 2] },
    { name: 'Tồn kho', path: '/admin/inventory', icon: <Archive size={20} />, roles: [1, 3] },
  ].filter((item) => item.roles.includes(userType));

  return (
    <div className="flex bg-gray-50 min-h-screen font-nunito text-primary">
      {/* Sidebar */}
      <AdminSidebar currentPath={currentPath} navItems={navItems} handleLogout={handleLogout} />

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Header Admin */}
        <AdminHeader />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      
    </div>
  );
}
