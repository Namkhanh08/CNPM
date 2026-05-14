import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    ChevronLeft, MapPin, Phone, User, FileText,
    Check, Truck, PackageCheck, HelpCircle
} from 'lucide-react';
import useStore from '../store/useStore';
import { IoCheckmarkCircle } from "react-icons/io5";
import { GrRadialSelected } from "react-icons/gr";

export default function OrderDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { fetchOrderById } = useStore();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const user = useStore((state) => state.user);
    const cancelOrder = useStore((state) => state.cancelOrder);
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

    useEffect(() => {
        const getDetail = async () => {
            setLoading(true);
            try {
                const data = await fetchOrderById(id);
                setOrder(data);
            } catch (error) {
                console.error("Lỗi lấy dữ liệu từ BE:", error);
            } finally {
                setLoading(false);
            }
        };
        getDetail();
    }, [id]);

    if (loading) return <div className="p-20 text-center font-bold">Đang tải dữ liệu thực tế...</div>;
    if (!order) return <div className="p-20 text-center">Không tìm thấy đơn hàng #{id}</div>;

    // Logic Stepper dựa trên dữ liệu BE
    const steps = [
        { id: 'Chờ xử lý', label: 'Đã đặt hàng', icon: <Check size={18} /> },
        { id: 'Đã xác nhận', label: 'Đã xác nhận', icon: <Check size={18} /> },
        { id: 'Đang giao', label: 'Đang giao', icon: <Truck size={18} /> },
        { id: 'Hoàn thành', label: 'Hoàn thành', icon: <PackageCheck size={18} /> },
    ];

    const currentStepIndex =
        order.Status === 'Chờ thanh toán'
            ? 0
            : steps.findIndex(s => s.id === order.Status);
    const isCancelled = order.Status === 'Đã hủy';
    const handleCancel = async (orderId) => {
        if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
            try {
                await cancelOrder(orderId);
                // Cập nhật state cục bộ để giao diện đổi sang trạng thái Đã hủy ngay lập tức
                setOrder(prev => ({ ...prev, Status: 'Đã hủy' }));
                alert("Hủy đơn hàng thành công!");
            } catch (error) {
                alert(error.response?.data || "Hủy đơn thất bại!");
            }
        }
    };
    const handleReorder = () => {
        // Giả sử bạn có hàm addToCart trong store
        // order.OrderDetails.forEach(item => addToCart(item.Product, item.Quantity));
        navigate('/shop');
        console.log("Thực hiện logic mua lại đơn hàng:", order.Id);
    };
    const handleEdit = (orderId) => {
        navigate(`/orders/edit/${orderId}`);
    };
    const showPaymentButton =
        order.PaymentMethod === "VNPAY" &&
        order.Status === "Chờ thanh toán";
    return (
        <div className="min-h-screen bg-white py-2 text-[#2D3748] pb-20">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header điều hướng */}
                <div className="flex justify-between items-center mb-16">
                    <button
                        onClick={() => navigate('/orders')}
                        className="flex items-center gap-2 text-gray-500 hover:text-accent-1 font-bold transition-colors"
                    >
                        <ChevronLeft size={20} /> Đơn hàng của bạn
                    </button>
                    <HelpCircle size={20} className="text-gray-400 cursor-pointer" />
                </div>
                <div className="flex items-center justify-center gap-2 mb-16">
                    <IoCheckmarkCircle size={30} className="text-green-500" />
                    <span className="font-bold tracking-wide text-2xl">ĐẶT HÀNG THÀNH CÔNG</span>
                </div>
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[#1A202C] font-nunito">Chi tiết đơn hàng #{order.Id}</h1>
                        <p className="text-gray-400 mt-1 text-left">Ngày đặt: {new Date(order.OrderDate).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-sm font-bold border flex items-center gap-2 ${isCancelled ? 'bg-red-50 text-red-500 border-red-100' : 'bg-accent-1 text-white border-orange-100'
                        }`}>
                        <GrRadialSelected size={15} />
                        <span>{order.Status}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* CỘT TRÁI */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* 1. Trạng thái vận chuyển */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                            <h2 className="text-xl font-bold mb-10">Trạng thái vận chuyển</h2>
                            {!isCancelled ? (
                                <div className="relative flex justify-between">
                                    <div className="absolute top-5 left-6 right-6 w-full h-[2px] bg-gray-100 z-0"></div>
                                    <div
                                        className="absolute top-5 left-6 right-6 h-[2px] bg-accent-1 z-0 transition-all duration-500"
                                        style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                                    ></div>

                                    {steps.map((step, idx) => {
                                        const active = idx <= currentStepIndex;
                                        return (
                                            <div key={step.id} className="relative z-10 flex flex-col items-center">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${active ? 'bg-accent-1 border-[#F3F0ED] text-white' : 'bg-white border-white text-gray-300 shadow-sm'
                                                    }`}>
                                                    {step.icon}
                                                </div>
                                                <p className={`mt-3 text-sm font-bold ${active ? 'text-[#1A202C]' : 'text-gray-300'}`}>{step.label}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-4 text-red-500 font-bold italic">Đơn hàng này đã bị hủy bỏ.</div>
                            )}
                        </div>

                        {/* 2. Sản phẩm */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-xl font-bold text-left">Sản phẩm đã chọn</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left ">
                                    <thead>
                                        <tr className="text-gray-400 text-[10px] uppercase tracking-[2px] border-b border-[#644D37]">
                                            <th className="px-6 py-4 font-bold text-sm text-accent-1">Sản phẩm</th>
                                            <th className="px-6 py-4  text-center font-bold text-sm text-accent-1">Số lượng</th>
                                            <th className="px-6 py-4  text-right font-bold text-sm text-accent-1">Đơn giá</th>
                                            <th className="px-6 py-4  text-right font-bold text-sm text-accent-1">Tổng cộng</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#644D37]">
                                        {order.OrderDetails.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-16 h-16 bg-[#F7F7F7] rounded-xl p-2 flex items-center justify-center">
                                                            <img src={item.Product.ImageUrl} alt="" className="max-h-full object-contain" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-[#1A202C]">{item.Product.Name}</p>
                                                            <p className="text-xs text-gray-400 mt-1">Vi: {item.FlavorNotes || 'Không ghi chú'}</p>
                                                            <p className="text-xs text-gray-400 mt-1">Kiểu xay: {translateGrind(item.GrindingOptionId) || 'Không ghi chú'}</p>
                                                            <p className="text-xs text-gray-400 mt-1">Khối lượng: {item.Weight || 'Không ghi chú'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-center font-bold">{item.Quantity}</td>
                                                <td className="px-6 py-6 text-right text-gray-500">{item.UnitPrice.toLocaleString()}₫</td>
                                                <td className="px-6 py-6 text-right font-black">{(item.UnitPrice * item.Quantity).toLocaleString()}₫</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* CỘT PHẢI */}
                    <div className="space-y-6">
                        {/* Thông tin nhận hàng */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                            <h3 className="font-bold mb-6 text-[#1A202C]">Thông tin nhận hàng</h3>
                            <div className="space-y-5">
                                <div className="flex gap-4 text-left ">
                                    <User size={18} className="text-accent-1" />
                                    <div>
                                        <p className="text-sm font-bold">{order.ReceiverName || "Chưa có tên"}</p>
                                        <p className="text-[11px] font-bold tracking-wider text-accent-1">Người nhận</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 text-left">
                                    <Phone size={18} className="text-accent-1" />
                                    <div>
                                        <p className="text-sm font-bold">{order.ReceiverPhone || "Chưa có SĐT"}</p>
                                        <p className="text-[11px] font-bold tracking-wider text-accent-1">Số điện thoại</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 text-left">
                                    <MapPin size={18} className="text-accent-1" />
                                    <div>
                                        <p className="text-sm font-bold leading-relaxed">
                                            {order.ShippingDetailAddress ?
                                                `${order.ShippingDetailAddress}, ${order.ShippingWard}, ${order.ShippingDistrict}, ${order.ShippingProvince}`
                                                : "Chưa có địa chỉ"}
                                        </p>
                                        <p className="text-[11px] font-bold tracking-wider text-accent-1">Địa chỉ giao hàng</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-[#F1F5F9] rounded-xl flex gap-3 items-start">
                                <FileText size={16} className="text-accent-1 mt-0.5" />
                                <div>
                                    <p className="text-xs italic text-gray-500">"{order.ShippingNote || 'Không có ghi chú'}"</p>
                                    <p className="text-[12px] font-bold mt-1 text-accent-1 text-left">Ghi chú</p>
                                </div>
                            </div>
                        </div>

                        {/* Tổng cộng */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                            <h3 className="font-bold mb-4">Tổng cộng</h3>
                            <div className="space-y-3 text-sm border-b border-gray-50 pb-4">
                                <div className="flex justify-between text-gray-400">
                                    <span>Tạm tính</span>
                                    <span className="font-bold text-gray-600">{order.TotalAmount.toLocaleString()}₫</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Phí vận chuyển</span>
                                    <span className="font-bold text-gray-600">30.000₫</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-4">
                                <span className="font-bold">Tổng thanh toán</span>
                                <span className="text-xl font-black text-[#1A202C]">{(order.TotalAmount + 30000).toLocaleString()}₫</span>
                            </div>

                            <div className="mt-8 space-y-3">
                                {showPaymentButton ? (
                                    <button
                                        onClick={() => handlePayment(order.Id)}
                                        className="w-full font-bold bg-green-600 text-white py-4 rounded-xl uppercase tracking-widest text-xs hover:bg-green-700 shadow-lg hover:-translate-y-1 transition-all duration-300 hover:scale-110"
                                    >
                                        Thanh toán
                                    </button>
                                ) : (
                                    <button className="w-full font-bold bg-accent-1 text-white py-4 rounded-xl uppercase tracking-widest text-xs hover:bg-[#4E3B2A] shadow-lg hover:-translate-y-1 transition-all duration-300 hover:scale-110">
                                        Theo dõi đơn hàng
                                    </button>
                                )}
                                <button onClick={() => handleEdit(order.Id)} className="w-full font-bold bg-primary/90 text-white py-4 rounded-xl uppercase font-nunito tracking-widest text-xs hover:bg-primary hover:text-white shadow-lg shadow-blue-500/20 hover:-translate-y-1 transition-all duration-300 hover:scale-110">
                                    Chỉnh sửa
                                </button>

                                {isCancelled ? (
                                    /* Nút MUA LẠI hiện lên khi đơn đã hủy */
                                    <button
                                        onClick={handleReorder}
                                        className="w-full border-2 text-amber-900 py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-amber-900 hover:text-white shadow-md hover:-translate-y-1 transition-all duration-300 hover:scale-110"
                                    >
                                        Mua lại
                                    </button>
                                ) : (
                                    /* Nút HỦY ĐƠN hiện khi đơn chưa hủy */
                                    <button
                                        className="w-full border-2 text-red-500 border-red-500 py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-red-500 hover:text-white hover:-translate-y-1 transition-all duration-300 hover:scale-110"
                                        onClick={() => handleCancel(order.Id)}
                                    >
                                        Hủy đơn
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className='text-center'>Bạn cần hỗ trợ? <span className='text-amber-700'><Link className='hover:underline'>Liên hệ chúng tôi.</Link></span></div>
                    </div>
                </div>
            </div>
        </div>
    );
}