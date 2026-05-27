import React, { useEffect, useState } from 'react';
import useStore from '../../store/useStore';
import { Search, CheckCircle, XCircle, Phone, Package, RefreshCw, MapPin } from 'lucide-react';
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

  // Khởi chạy lấy danh sách đơn của riêng shipper này
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
      alert(`Bạn đã xác nhận đơn hàng #${id}`);
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
    fetchShipperOrders(1, e.target.value); // Tìm kiếm đẩy về trang 1
  };

  const handlePageChange = (direction) => {
    const nextPage = direction === 'next' ? currentPage + 1 : Math.max(currentPage - 1, 1);
    fetchShipperOrders(nextPage, searchTerm);
  };

  return (
    <div className="p-6 animate-fade-in font-nunito">
      {/* Tiêu đề & Thanh công cụ */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-montserrat font-bold text-2xl text-gray-800 tracking-tight">Tuyến Đường Giao Hàng</h1>
          <p className="text-gray-500 text-sm mt-1">
            Bạn có <span className="text-amber-700 font-extrabold">{totalItems || 0} đơn hàng</span> cần xử lý công việc.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all text-sm font-bold shadow-sm"
          >
            <RefreshCw size={16} /> Làm mới
          </button>

          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Tìm tên khách, số điện thoại..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 outline-none text-sm transition-all"
            />
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Danh sách đơn hàng dưới dạng Bảng (Table) tương thích Admin Layout */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Mã Đơn</th>
                <th className="px-6 py-4">Khách Hàng</th>
                <th className="px-6 py-4">Địa Chỉ Nhận Hàng</th>
                <th className="px-6 py-4">Sản Phẩm Đóng Gói</th>
                <th className="px-6 py-4 text-right">Tiền Thu Hộ</th>
                <th className="px-6 py-4 text-center">Thao Tác Giao Hàng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {shipperOrders && shipperOrders.length > 0 ? (
                shipperOrders.map((order) => (
                  <tr key={order.Id} className="hover:bg-gray-50/40 transition-colors">
                    {/* 1. Mã đơn & Huy hiệu Trạng thái */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-amber-800">#{order.Id}</div>
                    </td>

                    {/* 2. Khách hàng */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800">{order.ReceiverName || "Khách mua lẻ"}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1 font-nunito">
                        <Phone size={12} className="text-gray-400" /> {order.ReceiverPhone}
                      </div>
                    </td>

                    {/* 3. Địa chỉ chuẩn PascalCase từ Backend Revo Coffee */}
                    <td className="px-6 py-4 max-w-xs">
                      <div className="text-gray-600 text-xs bg-amber-50/40 p-2 rounded-xl border border-amber-100/60 line-clamp-2 whitespace-normal flex items-start gap-1">
                        <MapPin size={14} className="text-amber-700 shrink-0 mt-0.5" />
                        <span>
                          {order.ShippingDetailAddress
                            ? `${order.ShippingDetailAddress}, ${order.ShippingWard}, ${order.ShippingDistrict}, ${order.ShippingProvince}`
                            : "Chưa cập nhật địa chỉ"}
                        </span>
                      </div>
                      {order.ShippingNote && (
                        <div className="text-[11px] text-red-500 font-medium mt-1 pl-4 italic">
                          * Chú ý: {order.ShippingNote}
                        </div>
                      )}
                    </td>

                    {/* 4. Sản phẩm hiển thị chi tiết cân nặng & cách xay */}
                    <td className="px-6 py-4">
                      <div className="space-y-1.5">
                        {order.OrderDetails && order.OrderDetails.length > 0 ? (
                          order.OrderDetails.map((item, idx) => (
                            <div key={idx} className="flex flex-col border-b border-gray-50 last:border-0 pb-1">
                              <div className="flex items-center gap-1 text-xs">
                                <Package size={13} className="text-amber-700 shrink-0" />
                                <span className="font-semibold text-gray-800">
                                  {item.Product?.Name || `Sản phẩm #${item.ProductId}`}
                                </span>
                                <span className="text-amber-800 font-bold bg-amber-50 px-1.5 py-0.2 rounded ml-1 text-[10px]">
                                  x{item.Quantity}
                                </span>
                              </div>
                              <div className="text-[10px] text-gray-400 ml-4 mt-0.5">
                                {item.Weight && <span>{item.Weight}g</span>}
                                {item.GrindingOptionId && <span> | {translateGrind(item.GrindingOptionId)}</span>}
                                {item.FlavorNotes && <span className="italic text-gray-400"> ({item.FlavorNotes})</span>}
                              </div>
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-400 italic text-xs">Không có thông tin mặt hàng</span>
                        )}
                      </div>
                    </td>

                    {/* 5. Tiền thu hộ */}
                    <td className="px-6 py-4 font-bold text-right whitespace-nowrap">
                      <div className="text-red-600 font-nunito text-base">
                        {(order.FinalAmount || 0).toLocaleString('vi-VN')}₫
                      </div>
                      <span className="inline-block text-[9px] uppercase tracking-wider font-extrabold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md mt-1">
                        {order.PaymentMethod || "COD"}
                      </span>
                    </td>

                    {/* 6. Thao tác điều hướng thông minh rẽ nhánh theo ĐÚNG LUỒNG LOGIC */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap justify-center items-center gap-2 max-w-[220px] mx-auto">
                        {/* Nút gọi điện luôn hiện để liên lạc bất cứ lúc nào */}
                        <a
                          href={`tel:${order.ReceiverPhone}`}
                          title="Gọi điện cho khách hàng"
                          className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-amber-800 hover:text-white transition-all shadow-sm"
                        >
                          <Phone size={15} />
                        </a>

                        {/* BƯỚC 1: Chỉ hiện nút "Xác nhận đơn hàng" khi đơn ở trạng thái 'Đang trung chuyển' */}
                        {order.Status === 'Đang trung chuyển' && (
                          <button
                            onClick={() => handleUpdateStatus(order.Id, 'Shipper đã nhận')}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white transition-all text-xs font-bold shadow-sm"
                          >
                            <TiTick size={14} /> Xác nhận đơn hàng
                          </button>
                        )}

                        {/* BƯỚC 2: Chỉ hiện nút "Bắt đầu giao" khi đơn đã ở trạng thái 'Shipper đã nhận' */}
                        {order.Status === 'Shipper đã nhận' && (
                          <button
                            onClick={() => handleUpdateStatus(order.Id, 'Đang giao')}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white transition-all text-xs font-bold shadow-sm"
                          >
                            <MdOutlineLocalShipping size={14} /> Bắt đầu giao
                          </button>
                        )}

                        {/* BƯỚC 3: Chỉ hiện nút "Hoàn thành" & "Thất bại" khi xe đang chạy trên đường ('Đang giao') */}
                        {order.Status === 'Đang giao' && (
                          <div className='flex justify-center items-center'>
                            <button
                              onClick={() => handleUpdateStatus(order.Id, 'Hoàn thành')}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all text-xs font-bold shadow-sm"
                            >
                              <CheckCircle size={14} /> Hoàn thành
                            </button>

                            <button
                              onClick={() => handleUpdateStatus(order.Id, 'Đã hủy')}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white transition-all text-xs font-bold shadow-sm"
                            >
                              <XCircle size={14} /> Thất bại
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-16 text-gray-400 italic">
                    Không tìm thấy đơn hàng nào cần giao trong danh sách của bạn.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Bộ phân trang dữ liệu từ Backend */}
        <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/40">
          <span className="text-gray-400 text-xs italic">Hiển thị trang số {currentPage}</span>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange('prev')}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-gray-200 rounded-xl bg-white disabled:opacity-40 hover:bg-gray-50 transition-colors text-xs font-bold shadow-sm"
            >
              Trước
            </button>
            <div className="px-3 py-1.5 bg-amber-800 text-white rounded-xl font-bold text-xs shadow-sm min-w-[28px] text-center">
              {currentPage}
            </div>
            <button
              onClick={() => handlePageChange('next')}
              disabled={currentPage * 10 >= totalItems}
              className="px-3 py-1.5 border border-gray-200 rounded-xl bg-white disabled:opacity-40 hover:bg-gray-50 transition-colors text-xs font-bold shadow-sm"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}