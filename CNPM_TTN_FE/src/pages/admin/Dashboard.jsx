import React, { useEffect } from 'react';
import { 
  TrendingUp, ShoppingBag, Users, DollarSign, Package, 
  Calendar, ArrowDownRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';
import useStore from '../../store/useStore';

export default function Dashboard() {
  const dashboard = useStore(state => state.dashboard);
  const fetchDashboard = useStore.getState().fetchDashboard; 

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (!dashboard) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-3 bg-gray-50/50 font-nunito">
        <div className="w-12 h-12 border-4 border-accent-1 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-primary text-sm font-semibold animate-pulse">
          Đang kết nối API mã hóa dữ liệu...
        </span>
      </div>
    );
  }

  // Động hóa biểu đồ cột ngang: Lấy trực tiếp từ API TopProducts của .NET
  const topProductsChartData = (dashboard.topProducts || []).map(p => ({
    name: p.productName.length > 12 ? p.productName.substring(0, 12) + '...' : p.productName,
    "Lượt bán": p.totalSold
  }));

  return (
    <div className="animate-fade-in space-y-8 p-6 text-left font-nunito bg-gray-50/30 min-h-screen selection:bg-accent-1/20">
      
      {/* CONTROL HEADER TIÊU CHUẨN */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="fotn-nunito font-bold text-2xl lg:text-3xl text-primary tracking-tight">
            Hệ Thống Phân Tích Thực Thời
          </h1>
        </div>
        
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200/80 text-xs font-bold text-primary/70 shadow-sm">
          <Calendar size={14} className="text-accent-1" />
          <span>Báo cáo: Tự động cập nhật</span>
        </div>
      </div>

      {/* KHỐI KẾT NỐI KPI ĐỘNG */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* CARD 1: DOANH THU ĐỘNG + % TĂNG TRƯỞNG BIẾN ĐỘNG THỰC TẾ TỪ BACKEND */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-11 h-11 rounded-xl bg-accent-1/10 text-accent-1 flex items-center justify-center">
              <DollarSign size={22} className="stroke-[2.5]" />
            </div>
            
            {/* Tự động đổi màu Xanh/Đỏ theo số tăng trưởng âm hay dương */}
            <div className={`flex items-center gap-1 text-[11px] font-extrabold px-2 py-1 rounded-lg ${
              (dashboard.revenueGrowthRate ?? 0) >= 0 ? 'text-green-600 bg-green-50' : 'text-rose-600 bg-rose-50'
            }`}>
              {(dashboard.revenueGrowthRate ?? 0) >= 0 ? <TrendingUp size={12} /> : <ArrowDownRight size={12} />}
              <span>
                {(dashboard.revenueGrowthRate ?? 0) >= 0 ? `+${dashboard.revenueGrowthRate}%` : `${dashboard.revenueGrowthRate}%`}
              </span>
            </div>
          </div>
          <p className="text-xs font-bold text-primary/40 uppercase tracking-wider">Doanh thu dự kiến</p>
          <h3 className="font-black text-2xl text-primary mt-1 tracking-tight">
            {(dashboard.expectedRevenue ?? 0).toLocaleString('vi-VN')}₫
          </h3>
          <p className="text-[11px] text-primary/50 mt-1 font-medium">So với ngày hôm qua</p>
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-accent-1 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </div>

        {/* CARD 2: SỐ ĐƠN CẦN XỬ LÝ THẬT */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShoppingBag size={22} className="stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg uppercase">
              Chờ duyệt
            </span>
          </div>
          <p className="text-xs font-bold text-primary/40 uppercase tracking-wider">Đơn cần xử lý</p>
          <h3 className="font-black text-3xl text-primary mt-1 tracking-tight">
            {dashboard.pendingOrders ?? 0}
          </h3>
          <p className="text-[11px] text-primary/50 mt-1 font-medium">Tổng các đơn hàng đang vận hành</p>
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </div>

        {/* CARD 3: TRẠNG THÁI TỒN KHO ĐỘNG TỪ DATABASE */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package size={22} className="stroke-[2.5]" />
            </div>
            
            {dashboard.isStockLow ? (
              <div className="flex items-center gap-1 text-[11px] font-extrabold text-rose-500 bg-rose-50 px-2 py-1 rounded-lg animate-pulse">
                <ArrowDownRight size={12} />
                <span>Sắp hết</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[11px] font-extrabold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                <span>An toàn</span>
              </div>
            )}
          </div>
          <p className="text-xs font-bold text-primary/40 uppercase tracking-wider">Trạng thái kho hàng</p>
          <h3 className="font-nunito font-bold text-2xl text-primary mt-1 tracking-tight">
            {dashboard.isStockLow ? "Cần nhập hàng" : "Hàng ổn định"}
          </h3>
          <p className="text-[11px] text-primary/50 mt-1 font-medium">Hệ thống tự quét dữ liệu kho</p>
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </div>

        {/* CARD 4: SUBSCRIPTIONS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users size={22} className="stroke-[2.5]" />
            </div>
            <div className="flex items-center gap-1 text-[11px] font-extrabold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">
              <span>Mới</span>
            </div>
          </div>
          <p className="text-xs font-bold text-primary/40 uppercase tracking-wider">Subscriptions mới</p>
          <h3 className="font-black text-3xl text-primary mt-1 tracking-tight">
            12
          </h3>
          <p className="text-[11px] text-primary/50 mt-1 font-medium">Gói giao định kỳ tuần này</p>
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-purple-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </div>
      </div>

      {/* KHỐI ĐỒ THỊ LIÊN KẾT ĐỘNG HOÀN TOÀN TỪ BACKEND */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Đồ thị diện tích Doanh thu */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-bold text-lg text-primary">Biểu Đồ Doanh Thu 7 Ngày Gần Nhất</h2>
            </div>
          </div>
          <div className="w-full h-80 text-xs">
            <ResponsiveContainer width="100%" h="100%">
              <AreaChart data={dashboard.revenueHistory || []} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E05B24" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#E05B24" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} stroke="#9CA3AF" className="font-semibold" />
                
                {/* Trục Y đã chỉnh sửa độ rộng không che chữ, format gọn theo 'Tr' và 'k' ăn theo font-nunito */}
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  stroke="#9CA3AF" 
                  width={80} 
                  className="font-semibold"
                  tickFormatter={(v) => {
                    if (v >= 1000000) return `${(v / 1000000).toFixed(1)} Tr`; 
                    if (v >= 1000) return `${(v / 1000).toLocaleString()} k`; 
                    return v;
                  }} 
                />
                
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff', fontFamily: 'Nunito' }}
                  formatter={(value) => [`${value.toLocaleString('vi-VN')} ₫`, 'Doanh Thu Thực']}
                />
                <Area type="monotone" dataKey="amount" stroke="#E05B24" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Đồ thị cột sản phẩm bán chạy */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div>
            <h2 className="font-bold text-lg text-primary">Top Sản Phẩm Bán Chạy</h2>
            <p className="text-xs text-primary/40 mb-6 font-medium">Xếp hạng thực tế dựa trên số lượng đặt hàng</p>
          </div>
          <div className="w-full h-80 text-xs">
            <ResponsiveContainer width="100%" h="100%">
              <BarChart data={topProductsChartData} layout="vertical" margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                <XAxis type="number" axisLine={false} tickLine={false} stroke="#9CA3AF" className="font-semibold" />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} stroke="#1E293B" className="font-bold text-xs" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff', fontFamily: 'Nunito' }}
                />
                <Bar dataKey="Lượt bán" fill="#1E293B" radius={[0, 8, 8, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* DANH SÁCH ĐƠN HÀNG MỚI NHẤT TỪ DB */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div>
              <h2 className="font-bold text-lg text-primary">Nhật Ký Giao Dịch Gần Recent</h2>
            </div>
          </div>
          
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-left text-sm min-w-[700px]">
              <thead className="bg-gray-50/70 text-primary/50 border-b border-gray-100 font-bold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Mã Đơn</th>
                  <th className="py-3.5 px-4">Khách hàng</th>
                  <th className="py-3.5 px-4 text-right">Ngày đặt đơn</th>
                  <th className="py-3.5 px-4 text-right">Tổng thanh toán</th>
                  <th className="py-3.5 px-4 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-primary/80">
                {(dashboard.latestOrders || []).map(order => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4 font-bold text-primary">#{order.id}</td>
                    <td className="py-4 px-4 font-bold text-primary">
                      {order.receiverName || 'Khách vãng lai'}
                    </td>
                    <td className="py-4 px-4 text-right text-primary/60 text-xs font-semibold">
                      {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-4 px-4 font-black text-right text-accent-1 text-base">
                      {order.totalAmount.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-block px-3 py-1.5 rounded-xl text-xs font-nunito font-bold tracking-wide ${
                          order.status === 'Chờ thanh toán' ? 'bg-amber-50 text-amber-600 border border-amber-200/50' :
                          order.status === 'Chờ xử lý' ? 'bg-blue-50 text-blue-600 border border-blue-200/50' :
                          order.status === 'Đang giao' ? 'bg-indigo-50 text-indigo-600 border border-indigo-200/50' :
                          order.status === 'Hoàn thành' ? 'bg-green-50 text-green-700 border border-green-200/50' :
                          order.status === 'Đã xác nhận' ? 'bg-teal-50 text-teal-600 border border-teal-200/50' :
                          'bg-rose-50 text-rose-600 border border-rose-200/50'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
                
                {(dashboard.latestOrders || []).length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-primary/40 font-semibold">
                      Hệ thống chưa ghi nhận bất cứ giao dịch nào từ API
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}