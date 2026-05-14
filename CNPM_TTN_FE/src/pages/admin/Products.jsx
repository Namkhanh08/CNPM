import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

export default function AdminProducts() {
  const [products] = useState([
    { id: 'SP001', name: 'REVO Morning', type: 'Blend', price: 99000, stock: 150, status: 'Còn hàng' },
    { id: 'SP002', name: 'REVO Everyday', type: 'Blend', price: 85000, stock: 200, status: 'Còn hàng' },
    { id: 'SP003', name: 'REVO Origin', type: 'Single Origin', price: 149000, stock: 0, status: 'Hết hàng' },
    { id: 'SP004', name: 'REVO Đậm Đà', type: 'Robusta', price: 75000, stock: 50, status: 'Sắp hết' },
    { id: 'SP005', name: 'Cold Brew Mộc', type: 'Cold Brew', price: 120000, stock: 30, status: 'Còn hàng' },
  ]);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="font-montserrat font-bold text-2xl">Danh Mục Sản Phẩm</h1>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
             <input type="text" placeholder="Tìm tên sản phẩm..." className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary font-nunito text-sm" />
             <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          <button className="bg-primary text-white px-4 py-2 rounded-xl font-bold font-nunito flex items-center gap-2 hover:bg-accent-1 transition-colors whitespace-nowrap">
            <Plus size={18} /> Thêm Sản Phẩm Mới
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-nunito text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Mã SP</th>
                <th className="px-6 py-4">Tên Sản Phẩm</th>
                <th className="px-6 py-4">Loại Cà Phê</th>
                <th className="px-6 py-4 text-right">Đơn Giá</th>
                <th className="px-6 py-4 text-center">Tồn Kho (Gói)</th>
                <th className="px-6 py-4 text-center">Trạng Thái</th>
                <th className="px-6 py-4 text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(prod => (
                <tr key={prod.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-500">{prod.id}</td>
                  <td className="px-6 py-4 font-bold text-primary">{prod.name}</td>
                  <td className="px-6 py-4">{prod.type}</td>
                  <td className="px-6 py-4 font-bold text-accent-1 text-right">{prod.price.toLocaleString('vi-VN')}₫</td>
                  <td className="px-6 py-4 text-center font-bold">{prod.stock}</td>
                  <td className="px-6 py-4 text-center">
                     <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                         prod.status === 'Còn hàng' ? 'bg-green-100 text-green-600' :
                         prod.status === 'Sắp hết' ? 'bg-orange-100 text-orange-600' :
                         'bg-red-100 text-red-600'
                       }`}>
                         {prod.status}
                     </span>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center justify-center gap-2">
                       <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Chỉnh sửa">
                         <Edit2 size={18} />
                       </button>
                       <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Xóa">
                         <Trash2 size={18} />
                       </button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
