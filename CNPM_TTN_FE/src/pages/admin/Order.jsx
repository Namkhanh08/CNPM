import React, { useEffect, useState } from 'react';
import useStore from '../../store/useStore';
import { Search, Truck, CheckCircle, XCircle, Check, Package, User, Phone, Filter, ArrowRight } from 'lucide-react';

export default function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const cancelOrder = useStore((state) => state.cancelOrder);

  const {
    orders,
    totalItems,
    fetchAllOrdersAdmin,
    updateOrderStatus,
  } = useStore();

  useEffect(() => {
    fetchAllOrdersAdmin(currentPage, searchTerm, statusFilter === 'all' ? '' : statusFilter);
  }, [currentPage, statusFilter, searchTerm]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateOrderStatus(id, newStatus);
      await fetchAllOrdersAdmin(currentPage, searchTerm, statusFilter === 'all' ? '' : statusFilter);
    } catch (error) {
      console.error(error);
      alert("Cập nhật trạng thái thất bại!");
    }
  };

  const handleConfirmAll = async () => {
    const pendingOrders = orders.filter(o => o.status === 'Chờ xử lý' || o.Status === 'Chờ xử lý');
    if (pendingOrders.length === 0) {
      return alert("Không có đơn hàng nào chờ xử lý.");
    }
    if (window.confirm(`Xác nhận hàng loạt ${pendingOrders.length} đơn hàng đang chờ xử lý?`)) {
      try {
        await Promise.all(
          pendingOrders.map(order => updateOrderStatus(order.id || order.Id, 'Đã xác nhận'))
        );
        await fetchAllOrdersAdmin(currentPage, searchTerm, statusFilter === 'all' ? '' : statusFilter);
        alert("Đã duyệt hàng loạt thành công!");
      } catch (err) {
        console.error(err);
        alert("Duyệt đơn thất bại!");
      }
    }
  };

  const translateGrind = (type) => {
    switch (type) {
      case 1: return "Nguyên Hạt";
      case 2: return "Pha Phin";
      case 3: return "Pha Máy";
      case 4: return "Ủ Lạnh";
      case 5: return "Kiểu Pháp";
      default: return type;
    }
  };

  const tabs = [
    { id: 'all', label: 'Tất cả đơn' },
    { id: 'Chờ thanh toán', label: 'Chờ thanh toán' },
    { id: 'Chờ xử lý', label: 'Chờ xử lý' },
    { id: 'Đã xác nhận', label: 'Đã xác nhận' },
    { id: 'Đang trung chuyển', label: 'Đang trung chuyển' },
    { id: 'Đang giao', label: 'Đang giao' },
    { id: 'Hoàn thành', label: 'Hoàn thành' },
    { id: 'Đã hủy', label: 'Đã hủy' },
  ];

  return (
    <div className="p-6 bg-slate-50/50 min-h-screen font-nunito antialiased text-slate-800">
      
      {/* 1. TOP HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-nunito font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Quản Lý Đơn Hàng
          </h1>
          <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
            Vận hành hệ thống: <span className="text-primary font-semibold">Xác nhận</span> 
            <ArrowRight size={12} className="text-slate-400" /> 
            <span className="text-accent-1 font-semibold">Giao hàng</span>
          </p>
        </div>
        
        {/* Nút duyệt nhanh sử dụng màu primary đồng bộ */}
        <button
          onClick={handleConfirmAll}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl transition-all text-sm font-bold shadow-md shadow-primary/10 hover:opacity-90 active:scale-[0.98]"
        >
          <CheckCircle size={18} /> Duyệt nhanh đơn chờ xử lý
        </button>
      </div>

      {/* 2. SHOPEE TABS NAVIGATION (Đồng bộ màu accent-1 / primary làm nền nhấn) */}
      <div className="bg-white rounded-t-2xl border border-slate-200/80 overflow-x-auto scrollbar-none flex shadow-sm">
        {tabs.map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setStatusFilter(tab.id); setCurrentPage(1); }}
              className={`px-6 py-4.5 text-sm font-semibold whitespace-nowrap transition-all border-b-2 relative ${
                isActive 
                  ? 'text-primary border-primary bg-slate-50/60 font-bold' 
                  : 'text-slate-500 border-transparent hover:text-primary hover:bg-slate-50/30'
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary to-accent-1 rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* 3. SEARCH & CONTROLS BAR */}
      <div className="bg-white p-4 border-x border-b border-slate-200/80 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm rounded-b-2xl mb-6">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Tìm mã đơn, tên khách hàng, số điện thoại..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-400"
          />
          <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Filter size={14} className="text-accent-1" />
          <span>Hệ thống hiển thị thời gian thực</span>
        </div>
      </div>

      {/* 4. PREMIUM DATA TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50/70 text-slate-600 font-bold border-b border-slate-200/60">
              <tr>
                <th className="px-6 py-4 font-bold w-28 text-slate-700">MÃ ĐƠN</th>
                <th className="px-6 py-4 font-bold w-56 text-slate-700">KHÁCH HÀNG</th>
                <th className="px-6 py-4 font-bold text-slate-700">CHI TIẾT SẢN PHẨM</th>
                <th className="px-6 py-4 font-bold text-right w-44 text-slate-700">TỔNG GIÁ TRỊ</th>
                <th className="px-6 py-4 font-bold text-center w-36 text-slate-700">TRẠNG THÁI</th>
                <th className="px-6 py-4 font-bold text-center w-44 text-slate-700">XỬ LÝ ĐƠN HÀNG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders && orders.length > 0 ? (
                orders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/40 transition-colors group">
                    
                    {/* Mã Đơn */}
                    <td className="px-6 py-5 align-top">
                      <span className="font-bold text-primary group-hover:text-accent-1 transition-colors block cursor-pointer">
                        #{order.id}
                      </span>
                    </td>
                    
                    {/* Khách hàng */}
                    <td className="px-6 py-5 align-top">
                      <div className="space-y-1.5">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <User size={14} className="text-slate-400 shrink-0" />
                          <span className="truncate max-w-[170px]">{order.receiverName}</span>
                        </div>
                        <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
                          <Phone size={14} className="text-slate-400 shrink-0" />
                          <span>{order.receiverPhone}</span>
                        </div>
                      </div>
                    </td>
                    
                    {/* Chi tiết sản phẩm với viền bọc tinh tế */}
                    <td className="px-6 py-5 align-top">
                      <div className="space-y-2.5">
                        {order.orderDetails && order.orderDetails.length > 0 ? (
                          order.orderDetails.map((item, idx) => (
                            <div key={idx} className="flex gap-3 items-start bg-slate-50/60 p-2.5 rounded-xl border border-slate-100/70 hover:border-slate-200 transition-all">
                              <div className="p-2 bg-white text-accent-1 rounded-lg border border-slate-100 shadow-xs">
                                <Package size={16} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-slate-800 text-sm truncate">
                                  {item.product?.name || "Sản phẩm không xác định"}
                                </div>
                                <div className="flex flex-wrap gap-x-2 gap-y-1 mt-1 text-[11px] font-medium items-center text-slate-400">
                                  {item.weight && <span className="bg-white px-2 py-0.5 rounded-md text-slate-600 border border-slate-100">{item.weight}</span>}
                                  {item.flavorNotes && <span className="text-slate-500">{item.flavorNotes}</span>}
                                  {item.grindingOptionId && (
                                    <>
                                      <span className="text-slate-200">|</span>
                                      <span className="text-primary bg-primary/5 px-1.5 py-0.5 rounded font-bold">Xay: {translateGrind(item.grindingOptionId)}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="text-right shrink-0 pl-2">
                                <span className="text-xs font-extrabold bg-slate-200/70 text-slate-600 px-2 py-0.5 rounded-md">x{item.quantity}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <span className="text-red-400 font-medium italic text-xs block pt-1">Không có chi tiết sản phẩm</span>
                        )}
                      </div>
                    </td>
                    
                    {/* Tổng giá trị đơn hàng */}
                    <td className="px-6 py-5 align-top text-right">
                      <div className="font-nunito font-bold text-slate-900 text-base tracking-tight">
                        {order.finalAmount?.toLocaleString('vi-VN')}₫
                      </div>
                      <div className="mt-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-accent-1 bg-accent-1/5 px-2 py-0.5 rounded-md border border-accent-1/10">
                          {order.paymentMethod || 'COD'}
                        </span>
                      </div>
                    </td>
                    
                    {/* Trạng thái sử dụng bảng màu dịu hài hòa */}
                    <td className="px-6 py-5 align-top text-center ">
                      <StatusBadge status={order.status || order.Status} />
                    </td>
                    
                    {/* Các nút xử lý quy trình dạng nút dài sang trọng */}
                    <td className="px-6 py-5 align-top">
                      <div className="flex flex-col gap-2 max-w-[150px] mx-auto ">
                        {((order.status || order.Status) === 'Chờ xử lý' || (order.status || order.Status) === 'Đã thanh toán') && (
                          <button 
                            onClick={() => handleUpdateStatus(order.id, 'Đã xác nhận')}
                            className="w-full py-2 px-3 bg-primary hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
                          >
                            <Check size={14} strokeWidth={2.5} /> Xác nhận đơn
                          </button>
                        )}
                        {(order.status || order.Status) === 'Đã xác nhận' && (
                          <button 
                            onClick={() => handleUpdateStatus(order.id, 'Đang trung chuyển')}
                            className="w-full py-2 px-3 bg-accent-1 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
                          >
                            <Truck size={14} /> Giao ĐVVC
                          </button>
                        )}
                        
                        {!['Hoàn thành', 'Đang giao', 'Đã hủy', 'Shipper đã nhận'].includes(order.status || order.Status) && (
                          <button 
                            onClick={() => handleUpdateStatus(order.id, 'Đã hủy')}
                            className="w-full py-1.5 px-3 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-500 hover:text-red-600 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1"
                          >
                            <XCircle size={13} /> Hủy đơn
                          </button>
                        )}
                        
                        {['Hoàn thành', 'Đã hủy', 'Đang giao'].includes(order.status || order.Status) && (
                          <span className="text-xs text-slate-400 font-semibold bg-slate-50 py-1 px-2 rounded-lg border border-slate-100 text-center block">
                            Đã hoàn tất xử lý
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-16 text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package size={44} className="text-slate-300" />
                      <span className="text-sm font-semibold">Hệ thống trống / Không tìm thấy đơn hàng</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 5. PREMIUM PAGINATION */}
        <div className="p-4 border-t border-slate-200/80 flex flex-col sm:flex-row justify-between items-center bg-slate-50/40 gap-3">
          <span className="text-slate-500 text-xs sm:text-sm font-semibold">
            Tổng cộng: <span className="text-slate-800 font-extrabold">{totalItems || 0}</span> đơn hàng toàn hệ thống
          </span>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3.5 py-1.5 text-xs font-bold border border-slate-200 rounded-xl bg-white disabled:opacity-40 hover:bg-slate-50 text-slate-700 transition-colors shadow-xs"
            >
              Trước
            </button>
            <div className="px-4 py-1.5 bg-primary text-white text-xs rounded-xl font-extrabold shadow-sm">
              {currentPage}
            </div>
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={(currentPage * 10) >= (totalItems || 0)}
              className="px-3.5 py-1.5 text-xs font-bold border border-slate-200 rounded-xl bg-white disabled:opacity-40 hover:bg-slate-50 text-slate-700 transition-colors shadow-xs"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// SUB-COMPONENT: STATUS BADGE ĐỒNG BỘ THEO NHẬN DIỆN THƯƠNG HIỆU
const StatusBadge = ({ status }) => {
  const styles = {
    'Chờ thanh toán': 'bg-amber-50 text-amber-600 border-amber-200/70',
    'Đã thanh toán': 'bg-sky-50 text-sky-600 border-sky-200/70',
    'Chờ xử lý': 'bg-violet-50 text-violet-600 border-violet-200/70',
    'Đã xác nhận': 'bg-emerald-50 text-emerald-600 border-emerald-200/70',
    'Đang trung chuyển': 'bg-indigo-50 text-indigo-600 border-indigo-200/70',
    'Shipper đã nhận': 'bg-teal-50 text-teal-600 border-teal-200/70',
    'Đang giao': 'bg-blue-50 text-blue-600 border-blue-200/70',
    'Hoàn thành': 'bg-green-50 text-green-600 border-green-200/70',
    'Đã hủy': 'bg-rose-50 text-rose-500 border-rose-200/70',
  };

  return (
    <span className={`px-2.5 py-1 rounded-lg border text-[12px] font-nunito font-bold tracking-wide inline-block whitespace-nowrap shadow-2xs ${styles[status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
      {status}
    </span>
  );
};