import React from 'react';

export default function AdminHeader() {
  return (
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
  );
}
