import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useStore from "../store/useStore";
import { FileText, Truck, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TiDelete } from "react-icons/ti";
import { MdOutlineEdit } from "react-icons/md";
import { BiCommentDetail } from "react-icons/bi";
import { MdOutlinePayment } from "react-icons/md";

// Import ảnh mặc định làm fallback tĩnh khi không có url hoặc ảnh lỗi
import defaultImage from "../assets/img/section2/image1.png";

export default function OrderDetail() {
  const orders = useStore((state) => state.orders) || [];
  const fetchOrders = useStore((state) => state.fetchOrders);
  const [activeTab, setActiveTab] = useState("all");
  const cancelOrder = useStore((state) => state.cancelOrder);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const tabs = [
    { id: "all", label: "Tất cả" },
    { id: "Chờ thanh toán", label: "Chờ thanh toán" },
    { id: "Chờ xử lý", label: "Đang xử lý" },
    { id: "Đang giao", label: "Đang giao" },
    { id: "Hoàn thành", label: "Hoàn thành" },
    { id: "Đã hủy", label: "Đã hủy" },
  ];

  const translateGrind = (type) => {
    switch (type) {
      case 1:
        return "Nguyên Hạt";
      case 2:
        return "Pha Phin";
      case 3:
        return "Pha Máy";
      case 4:
        return "Ủ Lạnh";
      case 5:
        return "Kiểu Pháp";
      default:
        return type;
    }
  };

  const filteredOrders =
    activeTab === "all"
      ? orders
      : activeTab === "Chờ xử lý"
      ? orders.filter((o) => {
          const currentStatus = o.status || o.Status;
          return (
            currentStatus === "Chờ xử lý" ||
            currentStatus === "Đã xác nhận" ||
            currentStatus === "Đã thanh toán"
          );
        })
      : orders.filter((o) => (o.status || o.Status) === activeTab);

  const translateStatus = (status) => {
    const statusMap = {
      "Chờ thanh toán": { text: "CHỜ THANH TOÁN", color: "text-orange-500" },
      "Đã thanh toán": { text: "ĐÃ THANH TOÁN", color: "text-green-500" },
      "Chờ xử lý": { text: "CHỜ XỬ LÝ", color: "text-blue-400" },
      "Đã xác nhận": { text: "ĐÃ XÁC NHẬN", color: "text-blue-600" },
      "Đang trung chuyển": {
        text: "ĐANG TRUNG CHUYỂN",
        color: "text-indigo-500",
      },
      "Shipper đã nhận": { text: "SHIPPER ĐÃ NHẬN", color: "text-indigo-500" },
      "Đang giao": { text: "ĐANG GIAO", color: "text-indigo-500" },
      "Hoàn thành": { text: "HOÀN THÀNH", color: "text-green-500" },
      "Đã hủy": { text: "ĐÃ HỦY", color: "text-red-500" },
    };
    return (
      statusMap[status] || { text: status || "CHƯA RÕ", color: "text-gray-500" }
    );
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
      state: { amount: totalAmount },
    });
  };

  // =========================================================
  // XỬ LÝ URL ẢNH ĐỘNG TỪ ĐƠN HÀNG (Dùng chung cho component)
  // =========================================================
  const getProductImage = (item) => {
    if (!item) return defaultImage;

    // 1. Quét tất cả các trường có khả năng chứa URL ảnh động trong item (cả chữ HOA và chữ thường)
    const imgUrl =
      item.productImageUrl ||
      item.ProductImageUrl ||
      item.product?.imageUrl ||
      item.Product?.ImageUrl ||
      item.product?.image ||
      item.Product?.Image;

    // Nếu hoàn toàn không tìm thấy URL nào từ API trả về -> Dùng ảnh mặc định
    if (!imgUrl) return defaultImage;

    // 2. Nếu URL động là link đầy đủ dạng http://... hoặc https://... -> Trả về luôn
    if (imgUrl.startsWith("http://") || imgUrl.startsWith("https://")) {
      return imgUrl;
    }

    // 3. Nếu URL động chỉ là đường dẫn tương đối từ backend (vd: /images/product1.png) -> Nối với domain backend của bạn
    return `http://localhost:5126${imgUrl}`;
  };

  return (
    <div className="bg-white min-h-screen py-20 pb-20">
      <div className="container mx-auto px-4 md:px-8 max-w-5xl">
        <div className="w-full">
          <h1 className="font-nunito font-bold text-4xl text-primary mb-6 text-center">
            ĐƠN HÀNG CỦA TÔI
          </h1>

          {/* Tabs thanh điều hướng trạng thái */}
          <div className="bg-white rounded-t-2xl flex overflow-x-auto border-b border-gray-100 shadow-lg sticky top-24 z-10 custom-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[120px] py-4 text-center font-nunito font-bold text-sm transition-all border-b-2 ${
                  activeTab === tab.id
                    ? "text-accent-1 border-accent-1 bg-accent-1/5"
                    : "text-primary/60 border-transparent hover:text-primary"
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
                <h3 className="font-montserrat font-bold text-xl text-primary/80 mb-2">
                  Chưa có đơn hàng
                </h3>
                <Link
                  to="/shop"
                  className="text-accent-1 font-nunito font-bold hover:underline"
                >
                  Tiếp tục mua sắm
                </Link>
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
                  <div
                    key={orderId}
                    className="bg-white rounded-2xl shadow-sm p-6 animate-fade-in group"
                  >
                    <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
                      <div className="font-nunito text-sm">
                        <span className="font-bold text-primary mr-2">
                          Mã Đơn: #{orderId}
                        </span>
                        {orderDate && (
                          <span className="text-gray-400 hidden sm:inline-block">
                            |{" "}
                            {new Date(orderDate).toLocaleDateString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>
                      <div
                        className={`font-montserrat font-bold text-sm tracking-widest flex items-center gap-2 ${
                          translateStatus(orderStatus).color
                        }`}
                      >
                        {orderStatus === "Đang giao" && <Truck size={16} />}
                        {translateStatus(orderStatus).text}
                      </div>
                    </div>

                    {/* Danh sách sản phẩm chi tiết của đơn hàng */}
                    <div className="space-y-4">
                      {orderDetails && orderDetails.length > 0 ? (
                        orderDetails.map((item, index) => {
                          // Bóc tách tên sản phẩm động linh hoạt
                          const productName =
                            item.productName ??
                            item.ProductName ??
                            item.product?.name ??
                            item.Product?.Name ??
                            "Sản phẩm không tên";

                          const quantity = item.quantity ?? item.Quantity ?? 0;
                          const unitPrice =
                            item.unitPrice ?? item.UnitPrice ?? 0;
                          const flavorNotes =
                            item.flavorNotes ?? item.FlavorNotes;
                          const grindingOptionId =
                            item.grindingOptionId ?? item.GrindingOptionId;
                          const weight = item.weight ?? item.Weight;

                          return (
                            <div key={index} className="flex gap-4">
                              {/* Khối hiển thị hình ảnh sản phẩm động */}
                              <div className="w-20 h-20 bg-pinky-gray rounded-xl p-2 shrink-0 border border-gray-100 flex items-center justify-center overflow-hidden">
                                <img
                                  src={getProductImage(item)} // Truyền trực tiếp item vào hàm xử lý URL động
                                  alt={productName}
                                  className="max-h-full max-w-full object-contain transition-transform hover:scale-105"
                                  onError={(e) => {
                                    // Fallback: nếu URL đúng cấu trúc nhưng ảnh bị xoá/lỗi trên host, đổi sang ảnh mặc định nội bộ
                                    e.target.src = defaultImage;
                                  }}
                                />
                              </div>

                              {/* Khối hiển thị thông tin văn bản */}
                              <div className="flex-1 flex flex-col sm:flex-row sm:justify-between font-nunito text-left">
                                <div>
                                  <h4 className="font-bold text-primary text-base line-clamp-2">
                                    {productName}
                                  </h4>
                                  <div className="text-primary/60 text-sm mt-1 space-y-0.5">
                                    <span className="block">
                                      Số lượng: {quantity}
                                    </span>
                                    {flavorNotes && (
                                      <span className="block">
                                        Vị: {flavorNotes}
                                      </span>
                                    )}
                                    <span className="block">
                                      Kiểu xay:{" "}
                                      {translateGrind(grindingOptionId)}
                                    </span>
                                    {weight && (
                                      <span className="block">
                                        Trọng lượng: {weight}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="text-right hidden sm:block">
                                  <div className="font-bold text-primary mt-1">
                                    {unitPrice.toLocaleString("vi-VN")}₫
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-gray-400 italic text-sm text-left">
                          Sản phẩm đang được cập nhật...
                        </div>
                      )}
                    </div>

                    {/* Phần tổng tiền và các nút chức năng hành động */}
                    <div className="border-t border-gray-100 mt-6 pt-4 flex flex-col md:flex-row justify-between items-end gap-4">
                      <div className="text-sm font-nunito text-primary/60 self-start md:self-auto flex items-center gap-2 bg-pinky-gray px-3 py-1.5 rounded-lg">
                        <Package size={14} /> Giao hàng tận nơi
                      </div>

                      <div className="flex flex-col items-end w-full md:w-auto">
                        <div className="font-nunito text-primary flex items-center gap-3 mb-4">
                          <span className="text-sm">Thành tiền:</span>
                          <span className="font-montserrat font-bold text-2xl text-accent-1">
                            {(finalAmount ?? totalAmount ?? 0).toLocaleString(
                              "vi-VN"
                            )}
                            ₫
                          </span>
                        </div>

                        <div className="flex gap-3 w-full md:w-auto flex-wrap justify-end">
                          <Link
                            to={`/orders/${orderId}`}
                            className="py-2 px-4 bg-gray-50 text-gray-600 rounded-full font-nunito font-bold text-center hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-1 border border-gray-100 hover:bg-primary/5 hover:text-primary"
                          >
                            <BiCommentDetail size={18} />
                            <span className="text-xs">Chi tiết</span>
                          </Link>

                          {(orderStatus === "Chờ xử lý" ||
                            orderStatus === "Đã thanh toán" ||
                            orderStatus === "Chờ thanh toán") && (
                            <>
                              <button
                                onClick={() => handleEdit(orderId)}
                                className="py-2 px-4 text-blue-500 bg-blue-50/50 rounded-full font-nunito font-bold hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-1 border border-blue-100 hover:bg-blue-600 hover:text-white"
                              >
                                <MdOutlineEdit size={18} />
                                <span className="text-xs">Sửa</span>
                              </button>
                              <button
                                onClick={() => handleCancel(orderId)}
                                className="py-2 px-4 text-red-500 bg-red-50/50 rounded-full font-nunito font-bold hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-1 border border-red-100 hover:bg-red-600 hover:text-white"
                              >
                                <TiDelete size={18} />
                                <span className="text-xs">Hủy đơn</span>
                              </button>
                            </>
                          )}

                          {orderStatus === "Chờ thanh toán" && (
                            <button
                              onClick={() =>
                                handlePayment(orderId, totalAmount)
                              }
                              className="text-white bg-green-600 py-2 px-4 rounded-full font-nunito font-bold hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-1 shadow-sm hover:bg-green-700"
                            >
                              <MdOutlinePayment size={18} />
                              <span className="text-xs">
                                Thanh toán (VNPAY)
                              </span>
                            </button>
                          )}

                          {(orderStatus === "Đã hủy" ||
                            orderStatus === "Hoàn thành") && (
                            <Link
                              to="/shop"
                              className="py-2 px-5 rounded-full font-nunito font-bold text-accent-1 border border-accent-1 hover:-translate-y-0.5 transition-all duration-300 hover:bg-accent-1 hover:text-white text-xs flex items-center justify-center"
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
