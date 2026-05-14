import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useStore from '../store/useStore';
import { FileText, Truck, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TiDelete } from "react-icons/ti";
import { MdOutlineEdit } from "react-icons/md"; 
import { BiCommentDetail } from "react-icons/bi";
import { MdOutlinePayment } from "react-icons/md";

export default function Orders() {
  const orders = useStore((state) => state.orders);
  const fetchOrders = useStore((state) => state.fetchOrders);
  const [activeTab, setActiveTab] = useState('all');
  const cancelOrder = useStore((state) => state.cancelOrder);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchOrders();
  }, []);

  // 1. Cập nhật ID các tab để khớp với chuỗi Status từ DB
  const tabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'Chờ thanh toán', label: 'Chờ thanh toán' },
    { id: 'Chờ xử lý', label: 'Đang xử lý' }, // Khớp với "Chờ xử lý" trong JSON
    { id: 'Đang giao', label: 'Đang giao' },
    { id: 'Hoàn thành', label: 'Hoàn thành' },
    { id: 'Đã hủy', label: 'Đã hủy' }
  ];
  const translateGrind = (type) => {
    switch (type) {
      case 1: return "Nguyên Hạt";
      case 2: return "Phan Phin";
      case 3: return "Pha Máy";
      case 4: return "Ủ Lạnh";
      case 5: return "Kiểu Pháp";
      default: return type;
    }
  }
  // 2. Sửa o.status -> o.Status
  const filteredOrders = activeTab === 'all'
    ? orders
    : activeTab === 'Chờ xử lý'
      ? orders.filter(o => o.Status === 'Chờ xử lý' || o.Status === 'Đã xác nhận') // Gom cả 2 vào 1 tab cho user đỡ rối
      : orders.filter(o => o.Status === activeTab);

  // 3. Map màu sắc dựa trên chuỗi tiếng Việt
  const translateStatus = (status) => {
    const statusMap = {
      'Chờ thanh toán': { text: 'CHỜ THANH TOÁN', color: 'text-orange-500' },
      'Chờ xử lý': { text: 'ĐANG CHỜ DUYỆT', color: 'text-blue-400' },
      'Đã xác nhận': { text: 'ĐÃ XÁC NHẬN', color: 'text-blue-600' }, // Đậm hơn chút
      'Đang giao': { text: 'ĐANG GIAO HÀNG', color: 'text-indigo-500' },
      'Hoàn thành': { text: 'HOÀN THÀNH', color: 'text-green-500' },
      'Đã hủy': { text: 'ĐÃ HỦY', color: 'text-red-500' },
    };
    return statusMap[status] || { text: status, color: 'text-gray-500' };
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

  return (
    <div className="bg-white min-h-screen py-2 pb-20">
      <div className="container mx-auto px-4 md:px-8 max-w-5xl">
        <div className="w-full">
          <h1 className="font-nunito font-bold text-4xl text-primary mb-6 text-center line-clam-1">ĐƠN HÀNG CỦA TÔI</h1>

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
              filteredOrders.map((order) => (
                <div key={order.Id} className="bg-white rounded-2xl shadow-sm p-6 animate-fade-in group">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
                    <div className="font-nunito text-sm">
                      <span className="font-bold text-primary mr-2">Mã Đơn: #{order.Id}</span>
                      <span className="text-gray-400 hidden sm:inline-block">
                        | {new Date(order.OrderDate).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className={`font-montserrat font-bold text-sm tracking-widest flex items-center gap-2 ${translateStatus(order.Status).color}`}>
                      {order.Status === 'Đang giao' && <Truck size={16} />}
                      {translateStatus(order.Status).text}
                    </div>
                  </div>

                  {/* Order Items - Xử lý trường hợp OrderDetails bị null */}
                  <div className="space-y-4">
                    {order.OrderDetails && order.OrderDetails.length > 0 ? (
                      order.OrderDetails.map((item, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="w-20 h-20 bg-pinky-gray rounded-xl p-2 shrink-0 border border-gray-100">
                            <img src={item.Product.ImageUrl || "https://via.placeholder.com/150"} alt={item.Product.Name} className="w-full h-full object-contain" />
                          </div>
                          <div className="flex-1 flex flex-col sm:flex-row sm:justify-between font-nunito text-left">
                            <div>
                              <h4 className="font-bold text-primary text-base line-clamp-1">{item.Product.Name}</h4>
                              <span className="text-primary/60 text-sm block">Số lượng: {item.Quantity}</span>
                              <span className="text-primary/60 text-sm block">Vị: {item.FlavorNotes}</span>
                              <span className="text-primary/60 text-sm block">Kiểu xay: {translateGrind(item.GrindingOptionId) || item.GrindingOptionId}</span>
                            </div>
                            <div className="text-right hidden sm:block">
                              <div className="font-bold text-primary mt-1">{(item.UnitPrice || 0).toLocaleString('vi-VN')}₫</div>
                            </div>
                          </div>
                        </div>
                      ))
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
                          {(order.TotalAmount || 0).toLocaleString('vi-VN')}₫
                        </span>
                      </div>

                      {/* Action Buttons - Chỉ hiển thị khi đơn hàng chưa hủy hoặc hoàn thành */}
                      <div className="flex gap-3 w-full md:w-auto flex-wrap">

                        {order.Status === 'Chờ xử lý' && (
                          <>
                            <Link
                              to={`/orders/${order.Id}`}
                              className="py-2 px-6 rounded-lg font-nunito font-bold border bg-primary text-white text-center hover:-translate-y-1 transition-all duration-300 hover:scale-110 hover:bg-accent-1"
                            >
                              <BiCommentDetail size={20}/>
                            </Link>
                            <button
                              onClick={() => handleEdit(order.Id)}
                              className="py-2 px-6 rounded-lg font-nunito font-bold bg-blue-400 text-white hover:-translate-y-1 transition-all duration-300 hover:scale-110 hover:bg-blue-600"
                            >
                              <MdOutlineEdit size={20}/>
                            </button>
                            <button
                              onClick={() => handleCancel(order.Id)}
                              className="py-2 px-6 rounded-lg font-nunito font-bold bg-red-500 text-white hover:bg-red-600 hover:-translate-y-1 transition-all duration-300 hover:scale-110"
                            >
                              <TiDelete size={20}/>
                            </button>
                          </>
                        )}

                        {order.Status === 'Chờ thanh toán' && (
                          <>
                            <button className="bg-amber-700 text-white py-2 px-8 rounded-lg font-nunito font-bold hover:bg-amber-800 hover:-translate-y-1 transition-all duration-300 hover:scale-110">
                              <MdOutlinePayment size={20}/>
                            </button>
                            <Link
                              to={`/orders/${order.Id}`}
                              className="py-2 px-6 rounded-lg font-nunito font-bold border bg-primary text-white text-center hover:-translate-y-1 transition-all duration-300 hover:scale-110 hover:bg-accent-1"
                            >
                              <BiCommentDetail size={20}/>
                            </Link>
                            <button
                              onClick={() => handleEdit(order.Id)}
                              className="py-2 px-6 rounded-lg font-nunito font-bold bg-blue-400 text-white hover:-translate-y-1 transition-all duration-300 hover:scale-110"
                            >
                              <MdOutlineEdit size={20}/>
                            </button>
                            <button
                              onClick={() => handleCancel(order.Id)}
                              className="py-2 px-6 rounded-lg font-nunito font-bold bg-red-500 text-white hover:bg-red-500 hover:-translate-y-1 transition-all duration-300 hover:scale-110"
                            >
                              <TiDelete size={20}/>
                            </button>
                          </>

                        )}

                        {(order.Status === 'Hoàn thành' || order.Status === 'Đã hủy') && (
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
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}