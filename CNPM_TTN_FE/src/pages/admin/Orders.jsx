import React, { useState, useEffect } from 'react';
import useStore from '../../store/useStore';
import { Search, Filter, Truck, CheckCircle, XCircle } from 'lucide-react';

const mapDbStatusToKey = (dbStatus) => {
  if (!dbStatus) return 'unpaid';
  const statusLower = dbStatus.toLowerCase();
  if (statusLower === 'chờ thanh toán') return 'unpaid';
  if (statusLower === 'chờ xử lý' || statusLower === 'đang chuẩn bị') return 'processing';
  if (statusLower === 'đang giao' || statusLower === 'đang giao hàng') return 'shipping';
  if (statusLower === 'hoàn thành' || statusLower === 'hoàn thiện') return 'completed';
  if (statusLower === 'đã hủy') return 'cancelled';
  
  if (statusLower === 'unpaid') return 'unpaid';
  if (statusLower === 'processing') return 'processing';
  if (statusLower === 'shipping') return 'shipping';
  if (statusLower === 'completed') return 'completed';
  if (statusLower === 'cancelled') return 'cancelled';
  
  return statusLower;
};

const mapKeyToDbStatus = (key) => {
  switch (key) {
    case 'unpaid': return 'Chờ thanh toán';
    case 'processing': return 'Chờ xử lý';
    case 'shipping': return 'Đang giao';
    case 'completed': return 'Hoàn thành';
    case 'cancelled': return 'Đã hủy';
    default: return key;
  }
};

export default function AdminOrders() {
  const orders = useStore(state => state.orders || []);
  const fetchAdminOrders = useStore(state => state.fetchAdminOrders);
  const updateOrderStatus = useStore(state => state.updateOrderStatus);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (fetchAdminOrders) {
      fetchAdminOrders();
    }
  }, [fetchAdminOrders]);

  const filteredOrders = orders.filter(order => {
    const id = order.Id ?? order.id ?? '';
    const name = order.ReceiverName ?? order.shippingInfo?.name ?? '';
    const status = mapDbStatusToKey(order.Status ?? order.status);

    const matchesSearch = 
      String(id).toLowerCase().includes(searchTerm.toLowerCase()) || 
      name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (id, newStatus) => {
    if(window.confirm(`Xác nhận chuyển đơn #${id} sang trạng thái mới?`)) {
      try {
        await updateOrderStatus(id, mapKeyToDbStatus(newStatus));
      } catch (err) {
        alert(err.response?.data?.message || err.message || "Cập nhật thất bại!");
      }
    }
  };

  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'unpaid', label: 'Chờ thanh toán (COD/VNPAY Pending)' },
    { value: 'processing', label: 'Đang chuẩn bị (Chờ xử lý)' },
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
              {filteredOrders.map(order => {
                const id = order.Id ?? order.id;
                const orderDate = order.OrderDate ?? order.orderDate ?? order.date;
                const receiverName = order.ReceiverName ?? order.shippingInfo?.name ?? 'Guest';
                const receiverPhone = order.ReceiverPhone ?? order.shippingInfo?.phone ?? '';
                const details = order.OrderDetails ?? order.orderDetails ?? order.items ?? [];
                const totalAmount = order.TotalAmount ?? order.totalAmount ?? order.total ?? 0;
                const paymentMethod = order.PaymentMethod ?? order.paymentMethod ?? 'COD';
                const status = mapDbStatusToKey(order.Status ?? order.status);

                return (
                  <tr key={id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-primary">#{id}</td>
                    <td className="px-6 py-4 text-gray-500">{orderDate ? new Date(orderDate).toLocaleString('vi-VN') : 'N/A'}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold">{receiverName}</div>
                      <div className="text-xs text-gray-500">{receiverPhone}</div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="max-w-[200px] truncate" title={details.map(i => `${i.ProductName ?? i.productName ?? i.name ?? '' } (x${i.Quantity ?? i.quantity})`).join(', ')}>
                         {details.map(i => `${i.ProductName ?? i.productName ?? i.name ?? '' } (x${i.Quantity ?? i.quantity})`).join(', ')}
                       </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-accent-1 text-right">
                      {totalAmount.toLocaleString('vi-VN')}₫
                      <div className="text-xs text-gray-400 font-normal">{paymentMethod}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                           status === 'unpaid' ? 'bg-orange-100 text-orange-600' :
                           status === 'processing' ? 'bg-blue-100 text-blue-600' :
                           status === 'shipping' ? 'bg-indigo-100 text-indigo-600' :
                           status === 'completed' ? 'bg-green-100 text-green-600' :
                           'bg-red-100 text-red-600'
                         }`}>
                           {status === 'unpaid' ? 'Chờ thanh toán' :
                            status === 'processing' ? 'Đang xử lý' :
                            status === 'shipping' ? 'Đang giao' :
                            status === 'completed' ? 'Hoàn thiện' : 'Đã hủy'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center justify-center gap-2">
                         {status === 'processing' && (
                           <button onClick={() => handleUpdateStatus(id, 'shipping')} className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg transition-colors" title="Giao cho vận chuyển">
                             <Truck size={18} />
                           </button>
                         )}
                         {status === 'shipping' && (
                           <button onClick={() => handleUpdateStatus(id, 'completed')} className="p-1.5 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-lg transition-colors" title="Báo cáo hoàn thành">
                             <CheckCircle size={18} />
                           </button>
                         )}
                         {status !== 'completed' && status !== 'cancelled' && (
                           <button onClick={() => handleUpdateStatus(id, 'cancelled')} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors" title="Hủy đơn">
                             <XCircle size={18} />
                           </button>
                         )}
                       </div>
                    </td>
                  </tr>
                );
              })}
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
