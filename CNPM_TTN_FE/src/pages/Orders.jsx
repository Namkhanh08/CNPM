import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { FileText, Truck, Package, Store, ChevronRight, MessageSquare, CreditCard, RefreshCw } from 'lucide-react';

export default function Orders() {
  const orders = useStore((state) => state.orders);
  const fetchOrders = useStore((state) => state.fetchOrders);
  const cancelOrder = useStore((state) => state.cancelOrder);
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const tabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'Chờ thanh toán', label: 'Chờ thanh toán' },
    { id: 'Chờ xử lý', label: 'Chờ xử lý' },
    { id: 'Đang giao', label: 'Đang giao' },
    { id: 'Hoàn thành', label: 'Hoàn thành' },
    { id: 'Đã hủy', label: 'Đã hủy' }
  ];

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

  // Cập nhật bộ lọc để Tab "Đã hủy" gom cả các đơn đang chạy luồng hoàn tiền
  const filteredOrders =
    activeTab === 'all'
      ? orders
      : activeTab === 'Chờ xử lý'
        ? orders.filter(o =>
          ['Chờ xử lý', 'Đã xác nhận', 'Đã thanh toán']
            .includes(o.status)
        )
        : activeTab === 'Đang giao'
          ? orders.filter(o =>
            [
              'Đang giao',
              'Đang trung chuyển',
              'Shipper đã nhận'
            ].includes(o.status)
          )
          : activeTab === 'Đã hủy'
            ? orders.filter(o => 
              ['Đã hủy', 'Chờ hoàn tiền', 'Đã hoàn tiền']
                .includes(o.status)
            )
            : orders.filter(o => o.status === activeTab);

  const translateStatus = (status) => {
    const statusMap = {
      'Chờ thanh toán': { text: 'CHỜ THANH TOÁN', color: 'text-amber-500 bg-amber-50 border-amber-100' },
      'Đã thanh toán': { text: 'ĐÃ THANH TOÁN', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
      'Chờ xử lý': { text: 'CHỜ XỬ LÝ', color: 'text-blue-500 bg-blue-50 border-blue-100' },
      'Đã xác nhận': { text: 'ĐÃ XÁC NHẬN', color: 'text-sky-600 bg-sky-50 border-sky-100' },
      'Đang trung chuyển': { text: 'ĐANG GIAO HÀNG', color: 'text-indigo-500 bg-indigo-50 border-indigo-100' },
      'Shipper đã nhận': { text: 'ĐANG GIAO HÀNG', color: 'text-indigo-500 bg-indigo-50 border-indigo-100' },
      'Đang giao': { text: 'ĐANG GIAO HÀNG', color: 'text-indigo-500 bg-indigo-50 border-indigo-100' },
      'Hoàn thành': { text: 'HOÀN THÀNH', color: 'text-emerald-500 bg-emerald-50 border-emerald-100' },
      'Chờ hoàn tiền': { text: 'ĐÃ HỦY', color: 'text-rose-500 bg-rose-50 border-rose-100' },
      'Đã hoàn tiền': { text: 'ĐÃ HỦY', color: 'text-rose-500 bg-rose-50 border-rose-100' },
      'Đã hủy': { text: 'ĐÃ HỦY', color: 'text-rose-500 bg-rose-50 border-rose-100' },
      'Chờ hoàn tiền': { text: 'CHỜ HOÀN TIỀN', color: 'text-rose-400 bg-rose-50 border-rose-100' },
      'Đang hoàn tiền': { text: 'ĐANG HOÀN TIỀN', color: 'text-rose-600 bg-rose-50 border-rose-100' },
    };
    return statusMap[status] || { text: status, color: 'text-gray-500 bg-gray-50 border-gray-100' };
  };

  const handleCancel = async (orderId) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
      try {
        await cancelOrder(orderId);
        alert("Hủy đơn hàng thành công!");
      } catch (error) {
        alert(error.response?.data || "Hủy đơn thất bại!");
      }
    }
  };

  const handlePayment = (orderId, totalAmount) => {
    navigate(`/checkout/payment/${orderId}`, {
      state: { amount: totalAmount }
    });
  };

  return (
    <div className="bg-gray-50/50 min-h-screen py-12 pb-24 font-nunito">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">

        {/* Tabs Điều Hướng Kiểu Shopee */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex overflow-x-auto sticky top-20 z-20 md:scrollbar-none mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[110px] sm:min-w-0 py-4 text-center font-bold text-[15px] transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-accent-1' : 'text-gray-500 hover:text-gray-900'
                }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-accent-1 rounded-full animate-fade-in" />
              )}
            </button>
          ))}
        </div>

        {/* Danh Sách Đơn Hàng */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 flex flex-col items-center justify-center text-center shadow-sm border border-gray-100 min-h-[400px]">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
                <FileText size={36} strokeWidth={1.5} />
              </div>
              <h3 className="font-montserrat font-bold text-lg text-gray-800 mb-1">Chưa có đơn hàng</h3>
              <p className="text-gray-400 text-sm mb-6">Bạn chưa có đơn hàng nào trong trạng thái này.</p>
              <Link
                to="/shop"
                className="bg-accent-1 text-white px-8 py-2.5 rounded-lg font-bold text-sm hover:bg-accent-1/90 shadow-sm shadow-accent-1/10 transition-all hover:-translate-y-0.5"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const statusInfo = translateStatus(order.status);
              const totalItems = order.orderDetails?.reduce((sum, item) => sum + item.quantity, 0) || 0;

              return (
                <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">

                  {/* Card Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 bg-gray-50/20">
                    <div className="flex items-center gap-2">
                      <Store size={16} className="text-gray-700" />
                      <span className="font-bold text-gray-800 text-sm">REVO Coffe</span>
                      <ChevronRight size={14} className="text-gray-400" />
                      <span className="text-xs text-gray-400 ml-2 font-mono">#{order.id}</span>
                    </div>
                    <div className={`px-2.5 py-1 text-xs font-bold tracking-wide rounded border uppercase ${statusInfo.color} flex items-center gap-1.5`}>
                      {order.status === 'Đang giao' && <Truck size={12} className="animate-bounce" />}
                      {statusInfo.text}
                    </div>
                  </div>

                  {/* Card Items */}
                  <div className="divide-y divide-gray-50 px-6">
                    {order.orderDetails && order.orderDetails.length > 0 ? (
                      order.orderDetails.map((item, index) => (
                        <div key={index} className="py-4 flex gap-4 items-start first:pt-4 last:pb-4">
                          <div className="w-20 h-20 bg-gray-50 rounded-xl p-1.5 shrink-0 border border-gray-100/80 overflow-hidden">
                            <img
                              src={item.product?.imageUrl || "https://via.placeholder.com/150"}
                              alt={item.product?.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                          <div className="flex-1 flex flex-col sm:flex-row sm:justify-between gap-2">
                            <div className="text-left">
                              <h4 className="font-bold text-gray-800 text-[15px] line-clamp-1 leading-snug">{item.product?.name}</h4>
                              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-gray-400">
                                <span>Phân loại: {translateGrind(item.grindingOptionId)}</span>
                                {item.flavorNotes && <span>• Vị: {item.flavorNotes}</span>}
                                {item.weight && <span>• Khối lượng: {item.weight}</span>}
                              </div>
                              <span className="text-xs text-gray-500 font-medium block mt-1">x{item.quantity}</span>
                            </div>
                            <div className="text-right sm:self-center">
                              <div className="font-semibold text-gray-700 text-sm">
                                {(item.unitPrice || 0).toLocaleString('vi-VN')}₫
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-gray-400 italic text-sm text-center">Sản phẩm đang được cập nhật...</div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="bg-gray-50/10 px-6 py-4 border-t border-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                    {/* Ngày đặt hàng */}
                    <div className="text-xs text-gray-400 text-left">
                      Đặt lúc: {new Date(order.orderDate).toLocaleDateString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </div>

                    <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
                      {/* Tổng Tiền */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Thành tiền ({totalItems} sản phẩm):</span>
                        <span className="font-montserrat font-bold text-xl text-accent-1">
                          {(order.finalAmount || 0).toLocaleString('vi-VN')}₫
                        </span>
                      </div>

                      {/* Các Nút Hành Động */}
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">

                        {/* Luôn hiển thị nút Xem chi tiết. Nếu là trạng thái hủy thì đổi nhãn chuyên dụng */}
                        <Link
                          to={`/orders/${order.id}`}
                          className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          <MessageSquare size={14} /> 
                          {['Đã hủy', 'Chờ hoàn tiền', 'Đã hoàn tiền'].includes(order.status)
                            ? 'Chi tiết hủy đơn'
                            : 'Chi tiết đơn hàng'
                          }
                        </Link>

                        {/* Button Thanh toán nhanh */}
                        {order.status === 'Chờ thanh toán' && (
                          <>
                            <button
                              onClick={() => handlePayment(order.id, order.totalAmount)}
                              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-sm shadow-emerald-500/10 transition-colors"
                            >
                              <CreditCard size={14} /> Thanh toán
                            </button>
                          </>
                        )}

                        {/* Mua lại cho đơn đã hủy hoặc hoàn thành */}
                        {(order.status === 'Đã hủy' || order.status === 'Hoàn thành' || order.status === 'Chờ hoàn tiền' || order.status === 'Đã hoàn tiền') && (
                          <Link
                            to="/shop"
                            className="flex items-center gap-1.5 px-5 py-2 bg-accent-1 hover:bg-accent-1/90 text-white rounded-lg text-xs font-bold shadow-sm shadow-accent-1/10 transition-all hover:-translate-y-0.5"
                          >
                            <RefreshCw size={13} /> Mua lại
                          </Link>
                        )}

                      </div>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}