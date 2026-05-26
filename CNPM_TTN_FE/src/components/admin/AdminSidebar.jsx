import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';

export default function AdminSidebar({ currentPath, navItems, handleLogout }) {
  return (
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
                  ? 'bg-primary !text-white shadow-md' 
                  : 'text-primary/70 hover:bg-gray-100'
              }`}
            >
              {item.icon} {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-100">
        <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full py-3 text-red-500 font-bold hover:bg-red-50 rounded-xl transition-colors">
          <LogOut size={20} /> Thoát hệ thống
        </button>
      </div>
    </aside>
  );
}
