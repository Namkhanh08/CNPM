import React, { useEffect } from 'react';
import { 
  TrendingUp, ShoppingBag, DollarSign, Package, 
  Calendar, ArrowDownRight, CheckCircle2, XCircle, CreditCard, PieChart as PieIcon
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar,
  PieChart, Pie, Cell
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

  // --- CƠ CHẾ FIX LỖI: CHUẨN HÓA DỮ LIỆU ĐỂ TRÁNH LỖI PHÂN BIỆT CHỮ HOA/THƯỜNG ---
  const actualRevenue = dashboard.actualRevenue ?? dashboard.ActualRevenue ?? 0;
  const expectedRevenue = dashboard.expectedRevenue ?? dashboard.ExpectedRevenue ?? 0;
  const pendingOrders = dashboard.pendingOrders ?? dashboard.PendingOrders ?? 0;
  const revenueGrowthRate = dashboard.revenueGrowthRate ?? dashboard.RevenueGrowthRate ?? 0;
  const isStockLow = dashboard.isStockLow ?? dashboard.IsStockLow ?? false;

  const fulfillmentRate = dashboard.fulfillmentRate ?? dashboard.FulfillmentRate ?? 0;
  const cancellationRate = dashboard.cancellationRate ?? dashboard.CancellationRate ?? 0;
  const onlinePaymentRate = dashboard.onlinePaymentRate ?? dashboard.OnlinePaymentRate ?? 0;

  const orderStatusSummary = dashboard.orderStatusSummary ?? dashboard.OrderStatusSummary ?? {};
  const revenueHistory = dashboard.revenueHistory ?? dashboard.RevenueHistory ?? [];
  const latestOrders = dashboard.latestOrders ?? dashboard.LatestOrders ?? [];
  const topProducts = dashboard.topProducts ?? dashboard.TopProducts ?? [];
  // ----------------------------------------------------------------------------

  // Khai báo bảng màu động cho Biểu đồ tròn Trạng thái đơn hàng
  const statusColors = {
    "Chờ thanh toán": "#F59E0B",
    "Chờ xử lý": "#3B82F6",
    "Đang giao": "#6366F1",
    "Hoàn thành": "#10B981",
    "Đã xác nhận": "#14B8A6",
    "Đã hủy": "#EF4444",
    "Đã thanh toán": "#06B6D4",
    "Đang trung chuyển": "#8B5CF6",
    "Không xác định": "#9CA3AF"
  };

  // Convert dữ liệu dạng Object Dictionary từ API sang mảng để Recharts vẽ được
  const orderStatusChartData = Object.entries(orderStatusSummary).map(([key, value]) => ({
    name: key,
    value: value
  }));

  // Khớp dữ liệu cho Biểu đồ cột ngang Top sản phẩm bán chạy
  const topProductsChartData = topProducts.map(p => ({
    name: p.productName && p.productName.length > 12 ? p.productName.substring(0, 12) + '...' : (p.productName || 'Sản phẩm ẩn'),
    "Lượt bán": p.totalSold ?? 0
  }));

  return (
    <div className="animate-fade-in space-y-8 p-6 text-left font-nunito bg-gray-50/30 min-h-screen selection:bg-accent-1/20">
      
      {/* CONTROL HEADER TIÊU CHUẨN */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="font-nunito font-bold text-2xl lg:text-3xl text-primary tracking-tight">
            Hệ Thống Phân Tích Thực Thời
          </h1>
        </div>
        
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200/80 text-xs font-bold text-primary/70 shadow-sm">
          <Calendar size={14} className="text-accent-1" />
          <span>Báo cáo: Tự động cập nhật</span>
        </div>
      </div>

      {/* KHỐI CÁC CARD TỔNG QUAN CHÍNH (4 CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* CARD 1: DOANH THU THỰC TẾ (SỐ TIỀN THỰC THU) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={22} className="stroke-[2.5]" />
            </div>
            <span className="text-[11px] font-nunito font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase">
              Thực thu
            </span>
          </div>
          <p className="text-xs font-bold text-primary/40 uppercase tracking-wider">Doanh thu thực tế</p>
          <h3 className="font-black text-2xl text-primary mt-1 tracking-tight">
            {actualRevenue.toLocaleString('vi-VN')}₫
          </h3>
          <p className="text-[11px] text-primary/50 mt-1 font-medium">Tiền thu từ đơn "Hoàn thành" và "Đã thanh toán"</p>
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </div>

        {/* CARD 2: DOANH THU DỰ KIẾN (BAO GỒM CÁC ĐƠN ĐANG XỬ LÝ) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-11 h-11 rounded-xl bg-accent-1/10 text-accent-1 flex items-center justify-center">
              <DollarSign size={22} className="stroke-[2.5]" />
            </div>
            
            <div className={`flex items-center gap-1 text-[11px] font-extrabold px-2 py-1 rounded-lg ${
              revenueGrowthRate >= 0 ? 'text-green-600 bg-green-50' : 'text-rose-600 bg-rose-50'
            }`}>
              {revenueGrowthRate >= 0 ? <TrendingUp size={12} /> : <ArrowDownRight size={12} />}
              <span>
                {revenueGrowthRate >= 0 ? `+${revenueGrowthRate}%` : `${revenueGrowthRate}%`}
              </span>
            </div>
          </div>
          <p className="text-xs font-bold text-primary/40 uppercase tracking-wider">Doanh thu dự kiến</p>
          <h3 className="font-black text-2xl text-primary mt-1 tracking-tight">
            {expectedRevenue.toLocaleString('vi-VN')}₫
          </h3>
          <p className="text-[11px] text-primary/50 mt-1 font-medium">Biến động so với hôm qua</p>
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-accent-1 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </div>

        {/* CARD 3: ĐƠN CẦN XỬ LÝ KHẨN CẤP */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShoppingBag size={22} className="stroke-[2.5]" />
            </div>
            <span className="text-[11px] font-nunito font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg uppercase">
              Chờ duyệt
            </span>
          </div>
          <p className="text-xs font-bold text-primary/40 uppercase tracking-wider">Đơn cần xử lý</p>
          <h3 className="font-black text-3xl text-primary mt-1 tracking-tight">
            {pendingOrders}
          </h3>
          <p className="text-[11px] text-primary/50 mt-1 font-medium">Các đơn chưa hoàn thành hoặc hủy</p>
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </div>

        {/* CARD 4: TRẠNG THÁI KHO HÀNG */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package size={22} className="stroke-[2.5]" />
            </div>
            
            {isStockLow ? (
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
          <p className="text-xs font-bold text-primary/40 uppercase tracking-wider">Trạng thái kho</p>
          <h3 className="font-bold text-2xl text-primary mt-1 tracking-tight">
            {isStockLow ? "Cần nhập hàng" : "Hàng ổn định"}
          </h3>
          <p className="text-[11px] text-primary/50 mt-1 font-medium">Hệ thống quét tự động sản phẩm</p>
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </div>
      </div>

      {/* KHỐI 3 THANH TIẾN TRÌNH TỶ LỆ HIỆU SUẤT VẬN HÀNH (MỚI) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* TỶ LỆ HOÀN THÀNH ĐƠN */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div className="w-full">
            <div className="flex justify-between items-center text-xs font-bold text-primary/40 mb-1">
              <span>TỶ LỆ HOÀN THÀNH</span>
              <span className="text-green-600 font-extrabold text-sm">{fulfillmentRate}%</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div className="bg-green-500 h-full transition-all duration-500" style={{ width: `${fulfillmentRate}%` }}></div>
            </div>
          </div>
        </div>

        {/* TỶ LỆ HỦY ĐƠN */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <XCircle size={24} />
          </div>
          <div className="w-full">
            <div className="flex justify-between items-center text-xs font-bold text-primary/40 mb-1">
              <span>TỶ LỆ HỦY ĐƠN</span>
              <span className="text-rose-600 font-extrabold text-sm">{cancellationRate}%</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div className="bg-rose-500 h-full transition-all duration-500" style={{ width: `${cancellationRate}%` }}></div>
            </div>
          </div>
        </div>

        {/* TỶ LỆ THANH TOÁN ONLINE THẺ/VÍ */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <CreditCard size={24} />
          </div>
          <div className="w-full">
            <div className="flex justify-between items-center text-xs font-bold text-primary/40 mb-1">
              <span>THANH TOÁN ONLINE</span>
              <span className="text-indigo-600 font-extrabold text-sm">{onlinePaymentRate}%</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full transition-all duration-500" style={{ width: `${onlinePaymentRate}%` }}></div>
            </div>
          </div>
        </div>

      </div>

      {/* KHỐI ĐỒ THỊ BIỂU ĐỒ DIỆN TÍCH DOANH THU & BIỂU ĐỒ TRÒN TRẠNG THÁI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Đồ thị diện tích Doanh thu 7 ngày */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="mb-6">
            <h2 className="font-bold text-lg text-primary">Biểu Đồ Doanh Thu Theo Dòng Thời Gian</h2>
          </div>
          <div className="w-full h-80 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueHistory} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E05B24" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#E05B24" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} stroke="#9CA3AF" className="font-semibold" />
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
                  formatter={(value) => [`${value.toLocaleString('vi-VN')} ₫`, 'Doanh Thu Ngày']}
                />
                <Area type="monotone" dataKey="amount" stroke="#E05B24" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BIỂU ĐỒ TRÒN: CẤU TRÚC PHÂN CHIA TRẠNG THÁI ĐƠN HÀNG (MỚI) */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PieIcon size={18} className="text-primary/70" />
              <h2 className="font-bold text-lg text-primary">Cấu Trúc Trạng Thái Đơn</h2>
            </div>
            <p className="text-xs text-primary/40 font-medium">Tỷ lệ phân nhóm theo luồng vận hành</p>
          </div>

          <div className="w-full h-56 my-2 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {orderStatusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={statusColors[entry.name] || statusColors["Không xác định"]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} đơn hàng`, 'Số lượng']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Danh mục ghi chú (Legend) các màu sắc trạng thái */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-50 text-[11px] font-bold text-primary/70">
            {orderStatusChartData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5 truncate">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: statusColors[entry.name] || statusColors["Không xác định"] }} />
                <span className="truncate">{entry.name}: <span className="text-primary font-black">{entry.value}</span></span>
              </div>
            ))}
            {orderStatusChartData.length === 0 && (
              <span className="col-span-2 text-center text-primary/30 font-medium">Chưa ghi nhận đơn hàng</span>
            )}
          </div>
        </div>

      </div>

      {/* BIỂU ĐỒ CỘT NGANG: SẢN PHẨM BÁN CHẠY (TOP PRODUCTS) */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div>
            <h2 className="font-bold text-lg text-primary">Top Sản Phẩm Bán Chạy</h2>
            <p className="text-xs text-primary/40 mb-6 font-medium">Xếp hạng thực tế dựa trên số lượng đặt hàng thành công</p>
          </div>
          <div className="w-full h-80 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsChartData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                <XAxis type="number" axisLine={false} tickLine={false} stroke="#9CA3AF" className="font-semibold" />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} stroke="#1E293B" className="font-bold text-xs" width={100} />
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff', fontFamily: 'Nunito' }} />
                <Bar dataKey="Lượt bán" fill="#1E293B" radius={[0, 8, 8, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* DANH SÁCH NHẬT KÝ 5 ĐƠN HÀNG MỚI NHẤT */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="mb-6">
            <h2 className="font-bold text-lg text-primary">Nhật Ký Giao Dịch Gần Đây</h2>
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
                {latestOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4 font-bold text-primary">#{order.id}</td>
                    <td className="py-4 px-4 font-bold text-primary">
                      {order.receiverName || 'Khách vãng lai'}
                    </td>
                    <td className="py-4 px-4 text-right text-primary/60 text-xs font-semibold">
                      {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-4 px-4 font-black text-right text-accent-1 text-base">
                      {(order.totalAmount ?? 0).toLocaleString('vi-VN')} ₫
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
                
                {latestOrders.length === 0 && (
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