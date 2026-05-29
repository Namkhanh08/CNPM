import React, { useEffect, useState, useCallback, useRef } from 'react';
import { DollarSign, Package, ShoppingBag, Users, TrendingUp, Calendar } from 'lucide-react';
import API from '../../services/api';

const statusLabels = {
  unpaid: 'Chờ thanh toán',
  processing: 'Đang xử lý',
  shipping: 'Đang giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

const statusClasses = {
  unpaid: 'bg-orange-100 text-orange-600',
  processing: 'bg-blue-100 text-blue-600',
  shipping: 'bg-indigo-100 text-indigo-600',
  completed: 'bg-green-100 text-green-600',
  cancelled: 'bg-red-100 text-red-600',
};

const RANGE_OPTIONS = [
  { label: '7 ngày', value: 7 },
  { label: '14 ngày', value: 14 },
  { label: '30 ngày', value: 30 },
  { label: '90 ngày', value: 90 },
];

const getFormattedDate = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export default function Dashboard() {
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    pendingOrders: 0,
    totalStock: 0,
    newUsersToday: 0,
    recentOrders: [],
    topProducts: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Date picker & range states
  const todayStr = getFormattedDate(new Date());
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const sevenDaysAgoStr = getFormattedDate(sevenDaysAgo);

  const [startDate, setStartDate] = useState(sevenDaysAgoStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [rangeType, setRangeType] = useState('7');

  const startDateRef = useRef(null);
  const endDateRef = useRef(null);

  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);

  // Fetch summary
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const res = await API.getDashboardSummary();
        const data = res.data?.data || res.data?.Data || res.data || {};
        setSummary({
          totalRevenue: data.totalRevenue ?? data.TotalRevenue ?? 0,
          pendingOrders: data.pendingOrders ?? data.PendingOrders ?? 0,
          totalStock: data.totalStock ?? data.TotalStock ?? 0,
          newUsersToday: data.newUsersToday ?? data.NewUsersToday ?? 0,
          recentOrders: data.recentOrders ?? data.RecentOrders ?? [],
          topProducts: data.topProducts ?? data.TopProducts ?? [],
        });
        setError(null);
      } catch (err) {
        console.error('Lỗi dashboard:', err);
        setError('Không thể tải dữ liệu tổng quan.');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  // Fetch chart khi đổi khoảng ngày
  const fetchChart = useCallback(async (params) => {
    setChartLoading(true);
    try {
      const res = await API.getRevenueChart(params);
      const raw = res.data?.Data ?? res.data?.data ?? res.data ?? [];
      setChartData(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error('Lỗi tải biểu đồ:', err);
      setChartData([]);
    } finally {
      setChartLoading(false);
    }
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchChart({ startDate, endDate });
    }
  }, [startDate, endDate, fetchChart]);

  const handleRangeSelect = (days) => {
    setRangeType(String(days));
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - (days - 1));
    
    setStartDate(getFormattedDate(from));
    setEndDate(getFormattedDate(to));
  };

  const handleDateChange = (type, val) => {
    setRangeType('custom');
    if (type === 'start') {
      setStartDate(val);
    } else {
      setEndDate(val);
    }
  };

  const getDaysDiff = (start, end) => {
    if (!start || !end) return 7;
    const diffTime = Math.abs(new Date(end) - new Date(start));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const activeDaysCount = rangeType !== 'custom' ? Number(rangeType) : getDaysDiff(startDate, endDate);

  const formatDateVN = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  // Tính max để chuẩn hóa bar height
  const maxRevenue = Math.max(...chartData.map(d => Number(d.Revenue ?? d.revenue ?? 0)), 1);
  const totalChartRevenue = chartData.reduce((sum, d) => sum + Number(d.Revenue ?? d.revenue ?? 0), 0);

  const kpis = [
    {
      label: 'Tổng doanh thu',
      value: `${summary.totalRevenue.toLocaleString('vi-VN')}₫`,
      icon: <DollarSign size={22} />,
      color: 'bg-blue-50 text-blue-600',
      border: 'border-blue-100',
    },
    {
      label: 'Đơn cần xử lý',
      value: summary.pendingOrders,
      icon: <ShoppingBag size={22} />,
      color: 'bg-orange-50 text-orange-600',
      border: 'border-orange-100',
    },
    {
      label: 'Tồn kho',
      value: `${summary.totalStock.toLocaleString('vi-VN')} kg`,
      icon: <Package size={22} />,
      color: 'bg-emerald-50 text-emerald-600',
      border: 'border-emerald-100',
    },
    {
      label: 'Người dùng mới hôm nay',
      value: summary.newUsersToday,
      icon: <Users size={22} />,
      color: 'bg-purple-50 text-purple-600',
      border: 'border-purple-100',
    },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-montserrat font-bold text-2xl text-primary">Tổng quan hoạt động</h1>
          <p className="text-sm text-primary/50 font-nunito mt-0.5">Cập nhật theo thời gian thực</p>
        </div>
        {loading && <span className="text-sm text-primary/60 font-bold animate-pulse">Đang tải...</span>}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl font-nunito text-center border border-red-100">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((item) => (
          <div
            key={item.label}
            className={`bg-white p-5 rounded-2xl shadow-sm border ${item.border} flex items-center gap-4 hover:shadow-md transition-shadow`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
              {item.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-1 truncate">{item.label}</p>
              <h3 className="font-montserrat font-black text-xl text-primary">{item.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {/* Chart header */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-500" />
            <div>
              <h2 className="font-montserrat font-bold text-lg text-primary">Doanh thu theo ngày</h2>
              <p className="text-xs text-gray-400 font-nunito mt-0.5">
                {rangeType !== 'custom' ? `${rangeType} ngày gần nhất` : `${formatDateVN(startDate)} - ${formatDateVN(endDate)}`} •{' '}
                <span className="font-bold text-blue-600">{totalChartRevenue.toLocaleString('vi-VN')}₫</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Bộ chọn ngày tùy chỉnh */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
              <span className="text-xs text-gray-500 font-bold">Từ</span>
              <div 
                className="relative flex items-center cursor-pointer"
                onClick={() => startDateRef.current && startDateRef.current.showPicker()}
              >
                <span className="text-xs font-bold text-primary hover:text-blue-600 transition-colors border-b border-dashed border-primary/30 pb-0.5">
                  {formatDateVN(startDate)}
                </span>
                <input
                  ref={startDateRef}
                  type="date"
                  value={startDate}
                  onChange={(e) => handleDateChange('start', e.target.value)}
                  max={endDate || undefined}
                  className="absolute opacity-0 w-0 h-0 pointer-events-none"
                />
              </div>

              <span className="text-xs text-gray-500 font-bold">Đến</span>
              <div 
                className="relative flex items-center cursor-pointer"
                onClick={() => endDateRef.current && endDateRef.current.showPicker()}
              >
                <span className="text-xs font-bold text-primary hover:text-blue-600 transition-colors border-b border-dashed border-primary/30 pb-0.5">
                  {formatDateVN(endDate)}
                </span>
                <input
                  ref={endDateRef}
                  type="date"
                  value={endDate}
                  onChange={(e) => handleDateChange('end', e.target.value)}
                  min={startDate || undefined}
                  max={todayStr}
                  className="absolute opacity-0 w-0 h-0 pointer-events-none"
                />
              </div>
            </div>

            {/* Bộ chọn nhanh */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              <Calendar size={14} className="text-gray-400 ml-2 shrink-0" />
              {RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleRangeSelect(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                    rangeType === String(opt.value)
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-500 hover:text-primary'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        {chartLoading ? (
          <div className="h-52 flex items-center justify-center text-gray-400">
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-bold">Đang tải dữ liệu...</span>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Y-axis labels */}
            <div className="flex">
              <div className="w-16 shrink-0 flex flex-col justify-between text-right pr-3 text-[10px] text-gray-400 font-bold" style={{ height: '180px' }}>
                <span>{(maxRevenue).toLocaleString('vi-VN', { notation: 'compact', maximumFractionDigits: 1 })}</span>
                <span>{(maxRevenue * 0.75).toLocaleString('vi-VN', { notation: 'compact', maximumFractionDigits: 1 })}</span>
                <span>{(maxRevenue * 0.5).toLocaleString('vi-VN', { notation: 'compact', maximumFractionDigits: 1 })}</span>
                <span>{(maxRevenue * 0.25).toLocaleString('vi-VN', { notation: 'compact', maximumFractionDigits: 1 })}</span>
                <span>0</span>
              </div>

              {/* Bars area */}
              <div className="flex-1 relative" style={{ height: '180px' }}>
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map((pct) => (
                  <div
                    key={pct}
                    className="absolute left-0 right-0 border-t border-gray-100"
                    style={{ bottom: `${pct}%` }}
                  />
                ))}

                {/* Bars */}
                <div className="absolute inset-0 flex items-end gap-1 px-1">
                  {chartData.map((d, i) => {
                    const rev = Number(d.Revenue ?? d.revenue ?? 0);
                    const heightPct = maxRevenue > 0 ? (rev / maxRevenue) * 100 : 0;
                    const date = d.Date ?? d.date ?? '';
                    const orders = d.OrderCount ?? d.orderCount ?? 0;

                    return (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-center gap-1 group relative"
                        style={{ height: '100%', justifyContent: 'flex-end' }}
                      >
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white rounded-lg px-2.5 py-1.5 text-[10px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                          <p className="text-gray-300">{date}</p>
                          <p className="text-blue-300">{rev.toLocaleString('vi-VN')}₫</p>
                          <p className="text-gray-400">{orders} đơn</p>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                        </div>

                        {/* Bar */}
                        <div
                          className={`w-full rounded-t-md transition-all duration-500 cursor-pointer group-hover:brightness-110 ${
                            rev > 0 ? 'bg-gradient-to-t from-blue-600 to-blue-400' : 'bg-gray-100'
                          }`}
                          style={{
                            height: `${Math.max(heightPct, rev > 0 ? 3 : 0)}%`,
                            minHeight: rev > 0 ? '4px' : '0',
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* X-axis labels - chỉ hiện một số nhãn để tránh chật */}
            <div className="flex mt-2 pl-16">
              {chartData.map((d, i) => {
                const date = d.Date ?? d.date ?? '';
                const skip = activeDaysCount > 14 ? Math.ceil(activeDaysCount / 10) : 1;
                const show = i % skip === 0 || i === chartData.length - 1;
                return (
                  <div key={i} className="flex-1 text-center">
                    {show && (
                      <span className="text-[9px] text-gray-400 font-bold">{date}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom grid: Recent Orders + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-montserrat font-bold text-lg text-primary">Đơn hàng mới nhất</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-nunito text-sm">
              <thead className="text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="pb-3 font-semibold">Mã đơn</th>
                  <th className="pb-3 font-semibold">Khách hàng</th>
                  <th className="pb-3 font-semibold text-right">Tổng tiền</th>
                  <th className="pb-3 font-semibold text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {summary.recentOrders.map((order) => {
                  const id = order.id ?? order.Id;
                  const status = (order.status ?? order.Status ?? '').toLowerCase();
                  const totalAmount = order.totalAmount ?? order.TotalAmount ?? 0;
                  const customerName = order.customerName ?? order.CustomerName ?? 'Khách';

                  return (
                    <tr key={id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3.5 font-bold text-primary">#{id}</td>
                      <td className="py-3.5 truncate max-w-[140px] text-gray-700">{customerName}</td>
                      <td className="py-3.5 font-bold text-right text-accent-1">
                        {totalAmount.toLocaleString('vi-VN')}₫
                      </td>
                      <td className="py-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${statusClasses[status] || 'bg-gray-100 text-gray-600'}`}>
                          {statusLabels[status] || status || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {summary.recentOrders.length === 0 && (
                  <tr><td colSpan="4" className="py-8 text-center text-gray-400">Chưa có đơn hàng nào</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-montserrat font-bold text-lg text-primary">Bán chạy nhất</h2>
          </div>
          <div className="space-y-3">
            {summary.topProducts.map((product, index) => {
              const id = product.productId ?? product.ProductId ?? index;
              const name = product.name ?? product.Name ?? 'N/A';
              const sales = product.sales ?? product.Sales ?? 0;
              const stock = product.stock ?? product.Stock ?? 0;
              const colors = [
                'bg-yellow-400', 'bg-gray-400', 'bg-orange-400',
                'bg-blue-400', 'bg-purple-400'
              ];

              return (
                <div key={id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-xs shrink-0 ${colors[index] || 'bg-gray-300'}`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-primary line-clamp-1">{name}</h4>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[11px] text-emerald-600 font-bold">{sales} lượt mua</span>
                      <span className="text-[11px] text-gray-400">Tồn {stock}</span>
                    </div>
                    {/* Mini progress bar */}
                    <div className="mt-1.5 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${colors[index] || 'bg-gray-300'}`}
                        style={{ width: `${Math.min((sales / (summary.topProducts[0]?.sales ?? summary.topProducts[0]?.Sales ?? 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            {summary.topProducts.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">Chưa có dữ liệu bán hàng</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
