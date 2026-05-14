import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Archive, Database, Settings, LogOut } from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { name: 'Tổng quan', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Đơn hàng', path: '/admin/orders', icon: <ShoppingCart size={20} /> },
    { name: 'Sản phẩm', path: '/admin/products', icon: <Package size={20} /> },
    { name: 'Lô rang', path: '/admin/batches', icon: <Database size={20} /> },
    { name: 'Tồn kho', path: '/admin/inventory', icon: <Archive size={20} /> },
  ];

  return (
    <div className="flex bg-gray-50 min-h-screen font-nunito text-primary">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10 transition-all duration-300">
        <div className="h-16 flex items-center justify-center border-b border-gray-100">
          <Link to="/" className="font-montserrat font-black text-xl text-primary tracking-widest uppercase">
            REVO <span className="text-accent-1">ADMIN</span>
          </Link>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${
                  isActive 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-primary/70 hover:bg-gray-100'
                }`}
              >
                {item.icon} {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-100">
          <Link to="/" className="flex items-center justify-center gap-2 w-full py-3 text-red-500 font-bold hover:bg-red-50 rounded-xl transition-colors">
            <LogOut size={20} /> Thoát hệ thống
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Header Admin */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <div className="font-nunito font-bold text-primary/60">
            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="font-bold text-sm">Quản lý Cấp cao</p>
              <p className="text-xs text-primary/60">admin@revocoffee.vn</p>
            </div>
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-montserrat font-bold">
              AD
            </div>
          </div>
        </header>

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
