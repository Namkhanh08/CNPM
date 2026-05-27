import React, { useEffect } from 'react';
import { TrendingUp, ShoppingBag, Users, DollarSign, Package } from 'lucide-react';
import useStore from '../../store/useStore';

export default function Dashboard() {
  const dashboard = useStore(state => state.dashboard);
  // Thay vì lấy trực tiếp thế này: const fetchDashboard = useStore(state => state.fetchDashboard);
  // Hãy dùng hàm gọi của Zustand để đảm bảo ổn định:
  const fetchDashboard = useStore.getState().fetchDashboard; 

  useEffect(() => {
    fetchDashboard();
  }, []); // Chỉ chạy 1 lần duy nhất khi Mount

  if (!dashboard) {
    return <div>Đang tải ....</div>
  }


  return (
    <div className="animate-fade-in">
      <h1 className="font-montserrat font-bold text-2xl mb-8">Tổng Quan Hoạt Động (Hôm Nay)</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-bold mb-1">Doanh thu dự kiến</p>
            <h3 className="font-montserrat font-black text-xl text-primary">{dashboard.expectedRevenue.toLocaleString('vi-VN')}₫</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-bold mb-1">Đơn cần xử lý</p>
            <h3 className="font-montserrat font-black text-2xl text-primary">{dashboard.pendingOrders}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-bold mb-1">Cà phê đã rang (Stock)</p>
            <h3 className="font-montserrat font-black text-2xl text-primary">124 kg</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-bold mb-1">Subscriptions mới</p>
            <h3 className="font-montserrat font-black text-2xl text-primary">12</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders List */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-montserrat font-bold text-lg">Đơn hàng mới nhất</h2>
            <button className="text-accent-1 text-sm font-bold hover:underline">Xem tất cả</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-nunito text-sm">
              <thead className="text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="pb-3 font-semibold">Mã Đơn</th>
                  <th className="pb-3 font-semibold">Khách hàng</th>
                  <th className="pb-3 font-semibold text-right">Tổng tiền</th>
                  <th className="pb-3 font-semibold text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {dashboard.latestOrders.map(order => (
                  <tr key={order.Id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 font-bold text-primary">{order.Id}</td>
                    <td className="py-4 truncate max-w-[150px]">{order.ReceiverName || 'Đang tải..'}</td>
                    <td className="py-4 font-bold text-right text-accent-1">
                      {order.TotalAmount.toLocaleString('vi-VN')}₫
                    </td>
                    <td className="py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${order.Status === 'Chờ thanh toán'
                          ? 'bg-orange-100 text-orange-600'
                          : order.Status === 'Chờ xử lý' 
                            ? 'bg-blue-100 text-blue-600'
                            : order.Status === 'Đang giao'
                              ? 'bg-indigo-100 text-indigo-600'
                              : order.Status === 'Hoàn thành'
                                ? 'bg-green-100 text-green-600'
                                : order.Status === 'Đã xác nhận' 
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-red-100 text-red-600'
                          }`}
                      >
                        {order.Status}
                      </span>
                    </td>
                  </tr>
                ))}
                {dashboard.latestOrders.length === 0 && (
                  <tr><td colSpan="4" className="py-8 text-center text-gray-400">Chưa có đơn hàng nào</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Products Mock */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-montserrat font-bold text-lg">Bán chạy nhất</h2>
          </div>
          <div className="space-y-4">
            {dashboard.topProducts.map((prod, idx) => (
              <div key={prod.productId} className="flex items-center justify-between border-b border-gray-50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center text-primary font-bold">
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">
                      {prod.productName}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {prod.totalSold} lượt mua
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
