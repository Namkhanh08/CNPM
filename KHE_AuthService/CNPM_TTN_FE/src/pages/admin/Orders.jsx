import React, { useState } from 'react';
import useStore from '../../store/useStore';
import { Search, Filter, Truck, CheckCircle, XCircle } from 'lucide-react';

export default function AdminOrders() {
  const orders = useStore(state => state.orders);
  const updateOrderStatus = useStore(state => state.updateOrderStatus);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (order.shippingInfo?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = (id, newStatus) => {
    if(window.confirm(`Xác nhận chuyển đơn ${id} sang trạng thái mới?`)) {
      updateOrderStatus(id, newStatus);
    }
  };

  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'unpaid', label: 'Chờ thanh toán (COD/VNPAY Pending)' },
    { value: 'processing', label: 'Đang chuẩn bị (Đã TN/COD)' },
    { value: 'shipping', label: 'Đang giao hàng' },
    { value: 'completed', label: 'Đã hoàn thành' },
    { value: 'cancelled', label: 'Đã hủy' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="font-montserrat font-bold text-2xl">Quản Lý Đơn Hàng</h1>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
             <input 
               type="text" 
               placeholder="Tìm mã đơn, tên KH..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary font-nunito text-sm"
             />
             <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          <div className="relative">
             <select 
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
               className="pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary font-nunito text-sm appearance-none"
             >
               {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
             </select>
             <Filter size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-nunito text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Mã Đơn</th>
                <th className="px-6 py-4">Ngày Đặt</th>
                <th className="px-6 py-4">Khách Hàng</th>
                <th className="px-6 py-4">Sản Phẩm</th>
                <th className="px-6 py-4 text-right">Tổng Tiền</th>
                <th className="px-6 py-4 text-center">Trạng Thái</th>
                <th className="px-6 py-4 text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-primary">{order.id}</td>
                  <td className="px-6 py-4 text-gray-500">{new Date(order.date).toLocaleString('vi-VN')}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold">{order.shippingInfo?.name}</div>
                    <div className="text-xs text-gray-500">{order.shippingInfo?.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="max-w-[200px] truncate" title={order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}>
                       {order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                     </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-accent-1 text-right">
                    {order.total.toLocaleString('vi-VN')}₫
                    <div className="text-xs text-gray-400 font-normal">{order.paymentMethod === 'vnpay' ? 'VNPAY' : 'COD'}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                         order.status === 'unpaid' ? 'bg-orange-100 text-orange-600' :
                         order.status === 'processing' ? 'bg-blue-100 text-blue-600' :
                         order.status === 'shipping' ? 'bg-indigo-100 text-indigo-600' :
                         order.status === 'completed' ? 'bg-green-100 text-green-600' :
                         'bg-red-100 text-red-600'
                       }`}>
                         {order.status === 'unpaid' ? 'Chờ thanh toán' :
                          order.status === 'processing' ? 'Đang xử lý' :
                          order.status === 'shipping' ? 'Đang giao' :
                          order.status === 'completed' ? 'Hoàn thiện' : 'Đã hủy'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center justify-center gap-2">
                       {order.status === 'processing' && (
                         <button onClick={() => handleUpdateStatus(order.id, 'shipping')} className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg transition-colors" title="Giao cho vận chuyển">
                           <Truck size={18} />
                         </button>
                       )}
                       {order.status === 'shipping' && (
                         <button onClick={() => handleUpdateStatus(order.id, 'completed')} className="p-1.5 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-lg transition-colors" title="Báo cáo hoàn thành">
                           <CheckCircle size={18} />
                         </button>
                       )}
                       {order.status !== 'completed' && order.status !== 'cancelled' && (
                         <button onClick={() => handleUpdateStatus(order.id, 'cancelled')} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors" title="Hủy đơn">
                           <XCircle size={18} />
                         </button>
                       )}
                     </div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500 font-bold">
                    Không tìm thấy đơn hàng nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
