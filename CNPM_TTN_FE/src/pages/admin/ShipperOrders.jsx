import React, { useEffect, useState } from 'react';
import useStore from '../../store/useStore';
import { Search, CheckCircle, XCircle, Phone, Package, RefreshCw, MapPin, Navigation, DollarSign, ArrowRight } from 'lucide-react';
import { MdOutlineLocalShipping } from "react-icons/md";
import { TiTick } from "react-icons/ti";

export default function ShipperOrders() {
  const [searchTerm, setSearchTerm] = useState('');

  // Gọi đúng các state và hàm dành riêng cho SHIPPER từ Zustand Store
  const {
    shipperOrders,
    totalItems,
    currentPage,
    fetchShipperOrders,
    updateOrderStatus
  } = useStore();

  useEffect(() => {
    fetchShipperOrders(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handleRefresh = () => {
    fetchShipperOrders(currentPage, searchTerm);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateOrderStatus(id, newStatus);
      await fetchShipperOrders(currentPage, searchTerm);
      alert(`Đã chuyển trạng thái đơn hàng #${id} thành: ${newStatus}`);
    } catch (error) {
      console.error(error);
      alert("Cập nhật trạng thái thất bại!");
    }
  };

  const translateGrind = (type) => {
    switch (type) {
      case 1: return "Nguyên Hạt";
      case 2: return "Pha Phin";
      case 3: return "Pha Máy";
      case 4: return "Ủ Lạnh";
      case 5: return "Kiểu Pháp";
      default: return "Chưa chọn";
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    fetchShipperOrders(1, e.target.value);
  };

  const handlePageChange = (direction) => {
    const nextPage = direction === 'next' ? currentPage + 1 : Math.max(currentPage - 1, 1);
    fetchShipperOrders(nextPage, searchTerm);
  };

  return (
    <div className="p-4 md:p-6 bg-slate-50 min-h-screen font-nunito antialiased text-slate-800">
      
      {/* HEADER & THÔNG TIN ĐƠN */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-white bg-accent-1 px-2.5 py-1 rounded-full">
            Shipper Revo
          </span>
          <h1 className="font-nunito font-bold text-2xl text-slate-900 tracking-tight mt-1.5">
            Tuyến Đường Giao Hàng
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Bạn đang đảm nhận <span className="text-primary font-nunito font-bold text-base">{totalItems || 0} đơn hàng</span> trong ca làm việc.
          </p>
        </div>

        {/* CÔNG CỤ TÌM KIẾM NHANH */}
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Tìm khách, số điện thoại, mã đơn..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm transition-all"
            />
            <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
          </div>
          <button
            onClick={handleRefresh}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 active:scale-95 transition-all shadow-xs"
            title="Tải lại danh sách"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* DANH SÁCH ĐƠN HÀNG DẠNG THẺ (CARD GRID) - TỐI ƯU CHO DI ĐỘNG & ĐẸP TRÊN PC */}
      {shipperOrders && shipperOrders.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {shipperOrders.map((order) => (
            <div 
              key={order.id} 
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              {/* PHẦN ĐẦU THẺ: Mã đơn và Phương thức thanh toán */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-black text-primary text-base">OD{order.id}</span>
                  <StatusIndicator status={order.status} />
                </div>
                <div>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                    order.paymentMethod === 'VNPAY' 
                      ? 'bg-blue-50 text-blue-600 border-blue-200' 
                      : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                  }`}>
                    {order.paymentMethod || "COD"}
                  </span>
                </div>
              </div>

              {/* PHẦN THÂN THẺ: tin khách hàng và Địa chỉ */}
              <div className="p-4 space-y-3.5 flex-1">
                {/* Khách hàng */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">{order.receiverName || "Khách mua lẻ"}</h3>
                    <div className="text-slate-500 font-medium text-xs mt-0.5 flex items-center gap-1">
                      <Phone size={12} className="text-slate-400" /> {order.receiverPhone}
                    </div>
                  </div>
                  {/* Nút Call To hành động nhanh lớn dễ bấm */}
                  <a
                    href={`tel:${order.receiverPhone}`}
                    className="flex items-center justify-center p-3 bg-accent-1 text-white hover:opacity-90 rounded-xl shadow-md shadow-accent-1/20 transition-transform active:scale-90"
                    title="Gọi cho khách"
                  >
                    <Phone size={16} fill="currentColor" />
                  </a>
                </div>

                {/* Địa chỉ giao nhận */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                  <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed">
                    {order.shippingDetailAddress
                      ? `${order.shippingDetailAddress}, ${order.shippingWard}, ${order.shippingDistrict}, ${order.shippingProvince}`
                      : "Chưa cập nhật địa chỉ nhận hàng"}
                    
                    {order.shippingNote && (
                      <div className="text-xs text-rose-500 font-bold mt-1.5 bg-rose-50 border border-rose-100 px-2 py-1 rounded-md">
                        ⚠️ Ghi chú: {order.shippingNote}
                      </div>
                    )}
                  </div>
                </div>

                {/* Chi tiết kiện hàng sản phẩm Revo Coffee */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Package size={12} /> Kiện hàng bao gồm:
                  </div>
                  <div className="max-h-24 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                    {order.orderDetails && order.orderDetails.length > 0 ? (
                      order.orderDetails.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-slate-800 block truncate">
                              {item.product?.name || `Mặt hàng #${item.productId}`}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {item.weight ? `${item.weight}` : ""} {item.grindingOptionId ? `| Xay: ${translateGrind(item.grindingOptionId)}` : ""}
                            </span>
                          </div>
                          <span className="font-extrabold text-primary bg-primary/5 border border-primary/10 px-2 py-0.5 rounded ml-2">
                            x{item.quantity}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-slate-400 italic text-xs">Không có dữ liệu đóng gói</span>
                    )}
                  </div>
                </div>
              </div>

              {/* PHẦN ĐUÔI THẺ: Số tiền thu và Action Bar */}
              <div className="p-4 bg-slate-50/30 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Số tiền cần thu */}
                <div className="flex items-center sm:block justify-between">
                  <span className="text-xs font-bold text-slate-400 sm:block">TIỀN THU HỘ (COD):</span>
                  <div className="font-black text-rose-600 text-lg sm:mt-0.5">
                    {order.paymentMethod === 'VNPAY' ? '0 ₫ (Đã Thanh Toán)' : `${order.finalAmount?.toLocaleString('vi-VN')} ₫`}
                  </div>
                </div>

                {/* KHU VỰC THAO TÁC RẼ NHÁNH CHO SHIPPER */}
                <div className="shrink-0 flex items-center">
                  {/* BƯỚC 1: Đang trung chuyển -> Shipper nhận */}
                  {order.status === 'Đang trung chuyển' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'Shipper đã nhận')}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all text-xs font-nunito font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-200"
                    >
                      <TiTick size={16} /> Xác nhận đơn hàng
                    </button>
                  )}

                  {/* BƯỚC 2: Shipper đã nhận -> Đang giao */}
                  {order.status === 'Shipper đã nhận' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'Đang giao')}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary text-white transition-all text-xs font-nunito font-bold flex items-center justify-center gap-1.5 shadow-md shadow-primary/20"
                    >
                      <MdOutlineLocalShipping size={16} /> Bắt đầu đi giao
                    </button>
                  )}

                  {/* BƯỚC 3: Đang giao -> Hoàn thành / Thất bại */}
                  {order.status === 'Đang giao' && (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'Hoàn thành')}
                        className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all text-xs font-extrabold flex items-center justify-center gap-1 shadow-md shadow-emerald-200"
                      >
                        <CheckCircle size={14} /> Thành công
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(order.id, 'Đã hủy')}
                        className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 text-rose-600 transition-all text-xs font-nunito font-bold flex items-center justify-center gap-1"
                      >
                        <XCircle size={14} /> Thất bại
                      </button>
                    </div>
                  )}

                  {/* CÁC TRẠNG THÁI CUỐI ĐƯỜNG ĐUA */}
                  {['Hoàn thành', 'Đã hủy'].includes(order.status) && (
                    <span className="w-full sm:w-auto text-center px-4 py-1.5 bg-slate-100 text-slate-400 font-bold text-xs rounded-lg border border-slate-200">
                      Đã đóng hồ sơ đơn
                    </span>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-xs">
          <div className="flex flex-col items-center justify-center gap-3 max-w-sm mx-auto">
            <div className="p-4 bg-slate-50 text-slate-300 rounded-full">
              <Package size={40} />
            </div>
            <h3 className="font-extrabold text-slate-800 text-base">Hành trình trống</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Hiện tại không tìm thấy đơn hàng nào cần bạn xử lý hoặc giao nhận. Thử bấm "Làm mới" xem nhé!
            </p>
          </div>
        </div>
      )}

      {/* BỘ PHÂN TRANG HIỆN ĐẠI (PAGINATION) */}
      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center bg-white border border-slate-200 p-4 rounded-2xl gap-3 shadow-xs">
        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
          Trang hiện tại: {currentPage}
        </span>
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => handlePageChange('prev')}
            disabled={currentPage === 1}
            className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 rounded-xl bg-white disabled:opacity-40 font-bold text-xs text-slate-700 transition-colors shadow-2xs"
          >
            Trước
          </button>
          <div className="px-4 py-2 bg-primary text-white rounded-xl font-black text-xs shadow-sm flex items-center justify-center min-w-[32px]">
            {currentPage}
          </div>
          <button
            onClick={() => handlePageChange('next')}
            disabled={currentPage * 10 >= totalItems}
            className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 rounded-xl bg-white disabled:opacity-40 font-bold text-xs text-slate-700 transition-colors shadow-2xs"
          >
            Sau
          </button>
        </div>
      </div>

    </div>
  );
}

// SUB-COMPONENT: ĐÈN CHỈ BÁO TRẠNG THÁI NHỎ GỌN TẬP TRUNG CHUYÊN MÔN
const StatusIndicator = ({ status }) => {
  const styles = {
    'Đang trung chuyển': 'bg-indigo-500',
    'Shipper đã nhận': 'bg-blue-500',
    'Đang giao': 'bg-amber-500 animation-pulse',
    'Hoàn thành': 'bg-emerald-500',
    'Đã hủy': 'bg-rose-500',
  };

  return (
    <div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">
      <span className={`w-2 h-2 rounded-full ${styles[status] || 'bg-slate-400'}`} />
      <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">{status}</span>
    </div>
  );
};