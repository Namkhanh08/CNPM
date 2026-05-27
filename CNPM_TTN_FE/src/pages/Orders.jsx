import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useStore from '../store/useStore';
import { FileText, Truck, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TiDelete } from "react-icons/ti";
import { MdOutlineEdit } from "react-icons/md";
import { BiCommentDetail } from "react-icons/bi";
import { MdOutlinePayment } from "react-icons/md";

// 1. Import ảnh mặc định làm fallback tĩnh giống file Products
import defaultImage from '../assets/img/section2/image1.png';

export default function Orders() {
  const orders = useStore((state) => state.orders) || []; 
  const fetchOrders = useStore((state) => state.fetchOrders);
  const [activeTab, setActiveTab] = useState('all');
  const cancelOrder = useStore((state) => state.cancelOrder);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const tabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'Chờ thanh toán', label: 'Chờ thanh toán' },
    { id: 'Chờ xử lý', label: 'Đang xử lý' },
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

  const filteredOrders = activeTab === 'all'
    ? orders
    : activeTab === 'Chờ xử lý'
      ? orders.filter(o => {
          const currentStatus = o.status || o.Status;
          return currentStatus === 'Chờ xử lý' || currentStatus === 'Đã xác nhận' || currentStatus === 'Đã thanh toán';
        })
      : orders.filter(o => (o.status || o.Status) === activeTab);

  const translateStatus = (status) => {
    const statusMap = {
      'Chờ thanh toán': { text: 'CHỜ THANH TOÁN', color: 'text-orange-500' },
      'Đã thanh toán': { text: 'ĐÃ THANH TOÁN', color: 'text-green-500' },
      'Chờ xử lý': { text: 'CHỜ XỬ LÝ', color: 'text-blue-400' },
      'Đã xác nhận': { text: 'ĐÃ XÁC NHẬN', color: 'text-blue-600' },
      'Đang trung chuyển': { text: 'ĐANG TRUNG CHUYỂN', color: 'text-indigo-500' },
      'Shipper đã nhận': { text: 'SHIPPER ĐÃ NHẬN', color: 'text-indigo-500' },
      'Đang giao': { text: 'ĐANG GIAO', color: 'text-indigo-500' },
      'Hoàn thành': { text: 'HOÀN THÀNH', color: 'text-green-500' },
      'Đã hủy': { text: 'ĐÃ HỦY', color: 'text-red-500' },
    };
    return statusMap[status] || { text: status || 'CHƯA RÕ', color: 'text-gray-500' };
  };

  const handleEdit = (orderId) => {
    navigate(`/orders/edit/${orderId}`);
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

  // 2. Hàm xử lý logic URL ảnh đồng bộ từ file Products
  const getProductImage = (imgUrl) => {
    if (!imgUrl) return defaultImage;
    if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) return imgUrl;
    return `http://localhost:5126${imgUrl}`;
  };

  return (
    <div className="bg-white min-h-screen py-20 pb-20">
      <div className="container mx-auto px-4 md:px-8 max-w-5xl">
        <div className="w-full">
          <h1 className="font-nunito font-bold text-4xl text-primary mb-6 text-center">ĐƠN HÀNG CỦA TÔI</h1>

          <div className="bg-white rounded-t-2xl flex overflow-x-auto border-b border-gray-100 shadow-lg sticky top-24 z-10 custom-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[120px] py-4 text-center font-nunito font-bold text-sm transition-all border-b-2 ${activeTab === tab.id
                  ? 'text-accent-1 border-accent-1 bg-accent-1/5'
                  : 'text-primary/60 border-transparent hover:text-primary'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4 mt-4">
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-b-2xl p-16 flex flex-col items-center justify-center text-center shadow-lg h-64">
                <FileText size={48} className="text-gray-300 mb-4" />
                <h3 className="font-montserrat font-bold text-xl text-primary/80 mb-2">Chưa có đơn hàng</h3>
                <Link to="/shop" className="text-accent-1 font-nunito font-bold hover:underline">Tiếp tục mua sắm</Link>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const orderId = order.id ?? order.Id;
                const orderDate = order.orderDate ?? order.OrderDate;
                const orderStatus = order.status ?? order.Status;
                const finalAmount = order.finalAmount ?? order.FinalAmount;
                const totalAmount = order.totalAmount ?? order.TotalAmount;
                const orderDetails = order.orderDetails ?? order.OrderDetails;

                return (
                  <div key={orderId} className="bg-white rounded-2xl shadow-sm p-6 animate-fade-in group">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
                      <div className="font-nunito text-sm">
                        <span className="font-bold text-primary mr-2">Mã Đơn: #{orderId}</span>
                        {orderDate && (
                          <span className="text-gray-400 hidden sm:inline-block">
                            | {new Date(orderDate).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <div className={`font-montserrat font-bold text-sm tracking-widest flex items-center gap-2 ${translateStatus(orderStatus).color}`}>
                        {orderStatus === 'Đang giao' && <Truck size={16} />}
                        {translateStatus(orderStatus).text}
                      </div>
                    </div>

                    {/* Danh sách sản phẩm của đơn hàng */}
                    <div className="space-y-4">
                      {orderDetails && orderDetails.length > 0 ? (
                        orderDetails.map((item, index) => {
                          const productName = item.productName ?? item.ProductName ?? item.product?.name ?? item.Product?.Name ?? "Sản phẩm không tên";
                          const productImageUrl = item.productImageUrl ?? item.ProductImageUrl ?? item.product?.imageUrl ?? item.Product?.ImageUrl;
                          
                          const quantity = item.quantity ?? item.Quantity ?? 0;
                          const unitPrice = item.unitPrice ?? item.UnitPrice ?? 0;
                          const flavorNotes = item.flavorNotes ?? item.FlavorNotes;
                          const grindingOptionId = item.grindingOptionId ?? item.GrindingOptionId;

                          return (
                            <div key={index} className="flex gap-4">
                              {/* Khối hiển thị hình ảnh sản phẩm */}
                              <div className="w-20 h-20 bg-pinky-gray rounded-xl p-2 shrink-0 border border-gray-100 flex items-center justify-center overflow-hidden">
                                <img 
                                  src={getProductImage(productImageUrl)} 
                                  alt={productName} 
                                  className="w-full h-full object-contain transition-transform hover:scale-105" 
                                  onError={(e) => {
                                    // Chuyển sang ảnh fallback local khi lỗi kết nối / link hỏng
                                    e.target.src = defaultImage;
                                  }}
                                />
                              </div>

                              {/* Khối hiển thị thông tin chi tiết */}
                              <div className="flex-1 flex flex-col sm:flex-row sm:justify-between font-nunito text-left">
                                <div>
                                  <h4 className="font-bold text-primary text-base line-clamp-2">
                                    {productName}
                                  </h4>
                                  <span className="text-primary/60 text-sm block mt-1">Số lượng: {quantity}</span>
                                  {flavorNotes && <span className="text-primary/60 text-sm block">Vị: {flavorNotes}</span>}
                                  <span className="text-primary/60 text-sm block">Kiểu xay: {translateGrind(grindingOptionId)}</span>
                                </div>
                                
                                <div className="text-right hidden sm:block">
                                  <div className="font-bold text-primary mt-1">
                                    {(unitPrice).toLocaleString('vi-VN')}₫
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-gray-400 italic text-sm">Sản phẩm đang được cập nhật...</div>
                      )}
                    </div>

                    <div className="border-t border-gray-100 mt-6 pt-4 flex flex-col md:flex-row justify-between items-end gap-4">
                      <div className="text-sm font-nunito text-primary/60 self-start md:self-auto flex items-center gap-2 bg-pinky-gray px-3 py-1.5 rounded-lg">
                        <Package size={14} /> Giao hàng tận nơi
                      </div>

                      <div className="flex flex-col items-end w-full md:w-auto">
                        <div className="font-nunito text-primary flex items-center gap-3 mb-4">
                          <span className="text-sm">Thành tiền:</span>
                          <span className="font-montserrat font-bold text-2xl text-accent-1">
                            {(finalAmount ?? 0).toLocaleString('vi-VN')}₫
                          </span>
                        </div>

                        <div className="flex gap-3 w-full md:w-auto flex-wrap">
                          {(orderStatus === 'Chờ xử lý' || orderStatus === 'Đã thanh toán') && (
                            <>
                              <Link
                                to={`/orders/${orderId}`}
                                className="py-4 px-4 rounded-full font-nunito font-bold text-primary text-center hover:-translate-y-1 transition-all duration-300 hover:scale-110 hover:bg-primary/90 hover:text-white"
                              >
                                <BiCommentDetail size={20} />
                              </Link>
                              <button
                                onClick={() => handleEdit(orderId)}
                                className="py-4 px-4 rounded-full font-nunito font-bold text-blue-500 hover:-translate-y-1 transition-all duration-300 hover:scale-110 hover:bg-blue-600 hover:text-white"
                              >
                                <MdOutlineEdit size={20} />
                              </button>
                              <button
                                onClick={() => handleCancel(orderId)}
                                className="py-4 px-4 rounded-full font-nunito font-bold text-red-500 hover:bg-red-600 hover:-translate-y-1 transition-all duration-300 hover:scale-110 hover:text-white"
                              >
                                <TiDelete size={20} />
                              </button>
                            </>
                          )}

                          {orderStatus === 'Đã xác nhận' && (
                            <>
                              <Link
                                to={`/orders/${orderId}`}
                                className="py-4 px-4 rounded-full font-nunito font-bold text-primary text-center hover:-translate-y-1 transition-all duration-300 hover:scale-110 hover:bg-primary/90 hover:text-white"
                              >
                                <BiCommentDetail size={20} />
                              </Link>
                              <button
                                onClick={() => handleEdit(orderId)}
                                className="py-4 px-4 rounded-full font-nunito font-bold text-blue-500 hover:-translate-y-1 transition-all duration-300 hover:scale-110 hover:bg-blue-600 hover:text-white"
                              >
                                <MdOutlineEdit size={20} />
                              </button>
                              <button
                                onClick={() => handleCancel(orderId)}
                                className="py-4 px-4 rounded-full font-nunito font-bold text-red-500 hover:bg-red-600 hover:-translate-y-1 transition-all duration-300 hover:scale-110 hover:text-white"
                              >
                                <TiDelete size={20} />
                              </button>
                            </>
                          )}

                          {orderStatus === 'Chờ thanh toán' && (
                            <>
                              <button
                                onClick={() => handlePayment(orderId, totalAmount)}
                                className="text-green-500 py-4 px-4 rounded-full font-nunito font-bold hover:bg-green-500 hover:text-white hover:-translate-y-1 transition-all duration-300 hover:scale-110"
                                title="Thanh toán ngay"
                              >
                                <MdOutlinePayment size={20} />
                              </button>
                              <Link
                                to={`/orders/${orderId}`}
                                className="py-4 px-4 rounded-full font-nunito font-bold text-primary text-center hover:-translate-y-1 transition-all duration-300 hover:scale-110 hover:bg-primary/90 hover:text-white"
                              >
                                <BiCommentDetail size={20} />
                              </Link>
                              <button
                                onClick={() => handleEdit(orderId)}
                                className="py-4 px-4 rounded-full font-nunito font-bold text-blue-500 hover:-translate-y-1 transition-all duration-300 hover:scale-110 hover:bg-blue-600 hover:text-white"
                              >
                                <MdOutlineEdit size={20} />
                              </button>
                              <button
                                onClick={() => handleCancel(orderId)}
                                className="py-4 px-4 rounded-full font-nunito font-bold text-red-500 hover:bg-red-600 hover:-translate-y-1 transition-all duration-300 hover:scale-110 hover:text-white"
                              >
                                <TiDelete size={20} />
                              </button>
                            </>
                          )}

                          {(orderStatus === 'Đang giao' || orderStatus === "Hoàn thành" || orderStatus === "Đang trung chuyển" || orderStatus === "Shipper đã nhận") && (
                            <Link
                              to={`/orders/${orderId}`}
                              className="py-4 px-4 rounded-full font-nunito font-bold text-primary text-center hover:-translate-y-1 transition-all duration-300 hover:scale-110 hover:bg-primary/90 hover:text-white"
                            >
                              <BiCommentDetail size={20} />
                            </Link>
                          )}

                          {orderStatus === 'Đã hủy' && (
                            <Link
                              to="/shop"
                              className="py-2 px-6 rounded-lg font-nunito font-bold text-accent-1 border border-accent-1 hover:-translate-y-1 transition-all duration-300 hover:scale-110"
                            >
                              Mua Lại
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
    </div>
  );
}