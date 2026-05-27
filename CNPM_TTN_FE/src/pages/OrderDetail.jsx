import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft, MapPin, Phone, User, FileText,
    Check, Truck, PackageCheck, HelpCircle, Star, X, Sparkles, Heart, HeartHandshake
} from 'lucide-react';
import useStore from '../store/useStore';
import { IoCheckmarkCircle } from "react-icons/io5";
import { GrRadialSelected } from "react-icons/gr";
import { FaShippingFast } from "react-icons/fa";
import { TbMoneybagMoveBack } from "react-icons/tb";

export default function OrderDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { fetchOrderById, cancelOrder, fetchOrders } = useStore();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isTrackingOpen, setIsTrackingOpen] = useState(false); 

    // --- STATE KHỐI ĐÁNH GIÁ SẢN PHẨM ---
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedProductToReview, setSelectedProductToReview] = useState(null);
    const [rating, setRating] = useState(5);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [reviewComment, setReviewComment] = useState("");
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    // --- STATE KHỐI HỦY ĐƠN HÀNG ---
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [customCancelReason, setCustomCancelReason] = useState("");
    // Thêm state để người dùng chọn số sao trải nghiệm hủy đơn
    const [cancelRating, setCancelRating] = useState(5);
    const [hoveredCancelRating, setHoveredCancelRating] = useState(0);

    const cancelReasonsList = [
        "Muốn thay đổi địa chỉ giao hàng",
        "Muốn thay đổi sản phẩm trong đơn (kích cỡ, màu sắc, số lượng...)",
        "Tìm thấy giá rẻ hơn ở nơi khác",
        "Không có nhu cầu mua nữa",
        "Thủ tục thanh toán quá rắc rối",
        "Lý do khác"
    ];

    const quickTags = [
        "☕ Hương vị đậm đà",
        "📦 Đóng gói siêu cẩn thận",
        "⚡ Giao hàng hỏa tốc",
        "💁 Phục vụ tận tình",
        "💎 Đáng giá đồng tiền",
        "🔥 Sẽ ủng hộ dài dài"
    ];

    const getFeedbackText = (stars) => {
        switch (stars) {
            case 1: return "Quá tệ hại 😞 Quy trình cần cải thiện gấp!";
            case 2: return "Chưa hài lòng 🙁 Chất lượng chưa đúng kỳ vọng.";
            case 3: return "Tạm ổn 😐 Cần thêm điểm nhấn đặc sắc hơn.";
            case 4: return "Rất tốt 🙂 Sản phẩm chất lượng ổn định.";
            case 5: return "Tuyệt vời ông mặt trời! 🥰 Yêu thương ngập tràn.";
            default: return "";
        }
    };

    // Hàm trả về mô tả mức độ hài lòng khi hủy đơn tương ứng số sao chọn
    const getCancelFeedbackText = (stars) => {
        switch (stars) {
            case 1: return "Rất không hài lòng 😡";
            case 2: return "Không hài lòng 🙁";
            case 3: return "Bình thường 😐";
            case 4: return "Hài lòng 🙂";
            case 5: return "Rất hài lòng 🥰";
            default: return "";
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

    useEffect(() => {
        const getDetail = async () => {
            setLoading(true);
            try {
                const data = await fetchOrderById(id);
                await fetchOrders(); 
                setOrder(data);
            } catch (error) {
                console.error("Lỗi lấy dữ liệu chi tiết đơn hàng:", error);
            } finally {
                setLoading(false);
            }
        };
        getDetail();
    }, [id]);

    if (loading) return <div className="p-20 text-center font-bold">Đang tải dữ liệu đơn hàng...</div>;
    if (!order) return <div className="p-20 text-center font-bold text-red-500">Không tìm thấy đơn hàng #{id}</div>;

    const orderDate = new Date(order.orderDate);
    const estimatedDate = new Date(orderDate);
    estimatedDate.setDate(orderDate.getDate() + 5); 

    const formatDate = (date) => {
        return date.toLocaleDateString('vi-VN');
    };

    const steps = [
        { id: 'Chờ xử lý', label: 'Đã đặt hàng', icon: <Check size={18} /> },
        { id: 'Đã xác nhận', label: 'Đã xác nhận', icon: <Check size={18} /> },
        { id: 'Đang giao', label: 'Đang giao', icon: <Truck size={18} /> },
        { id: 'Hoàn thành', label: 'Hoàn thành', icon: <PackageCheck size={18} /> },
    ];

    const steps_shipper = [
        { id: 'Chờ xử lý', label: 'Đã đặt hàng', icon: <Check size={18} /> },
        { id: 'Đã xác nhận', label: 'Đang chuẩn bị hàng', icon: <Check size={18} /> },
        { id: 'Đang trung chuyển', label: 'Đang trung chuyển', icon: <Truck size={18} /> },
        { id: 'Shipper đã nhận', label: 'Đã lấy đơn hàng', icon: <Check size={18} /> },
        { id: 'Đang giao', label: 'Đang trên đường giao', icon: <Truck size={18} /> },
        { id: 'Hoàn thành', label: 'Đã giao thành công', icon: <PackageCheck size={18} /> },
    ];

    const getMappedStatus = (status) => {
        if (status === 'Chờ thanh toán' || status === 'Đã thanh toán' ) return 'Chờ xử lý';
        if (['Shipper đã nhận', 'Đang trung chuyển', 'Đang giao'].includes(status)) {
            return 'Đang giao';
        }
        return status;
    };

    const mappedStatus = getMappedStatus(order.status);
    const currentStepIndex = steps.findIndex(s => s.id === mappedStatus);
    const currentShipperStepIndex = steps_shipper.findIndex(s => {
        if (s.id === 'Chờ xử lý') return order.status === 'Chờ xử lý' || order.status === 'Chờ thanh toán' || order.status === 'Đã thanh toán';
        return s.id === order.status;
    });

    const isCancelled = order.status === 'Đã hủy';

    const handleCancelSubmit = async () => {
        const finalReason = cancelReason === "Lý do khác" ? customCancelReason : cancelReason;
        if (!finalReason) {
            alert("Vui lòng chọn hoặc nhập lý do hủy đơn của bạn!");
            return;
        }

        try {
            // Truyền cả lý do hủy và số sao đánh giá lên API Backend
            await cancelOrder(order.id, { 
                reason: finalReason, 
                rating: cancelRating 
            });
            
            setOrder(prev => ({ 
                ...prev, 
                status: 'Đã hủy',
                CancelReason: finalReason,
                CancelRating: cancelRating, // Cập nhật state cục bộ để hiển thị luôn lên giao diện công khai
                CancelDate: new Date()
            }));
            setIsCancelModalOpen(false);
            alert(`Hủy đơn hàng thành công! Cảm ơn bạn đã đánh giá đơn hàng ${cancelRating} sao.`);
        } catch (error) {
            alert(error.response?.data || "Hủy đơn hàng thất bại, vui lòng thử lại!");
        }
    };

    const handleReviewSubmit = () => {
        setIsSubmittingReview(true);
        setTimeout(() => {
            alert(`🎉 Gửi đánh giá thành công lộng lẫy cho sản phẩm: ${selectedProductToReview?.Product?.Name}\nMức độ: ${rating} Sao\nNội dung: ${reviewComment}`);
            setIsSubmittingReview(false);
            setIsReviewModalOpen(false);
            setRating(5);
            setReviewComment("");
        }, 1200);
    };

    const handleQuickTagClick = (tagText) => {
        const pureText = tagText.substring(2);
        setReviewComment(prev => prev ? `${prev}, ${pureText}` : pureText);
    };

    const handlePayment = (orderId, totalAmount) => {
        navigate(`/checkout/payment/${orderId}`, { state: { amount: totalAmount } });
    };

    const handleEdit = (orderId) => {
        navigate(`/orders/edit/${orderId}`);
    };

    const handleReorder = () => {
        navigate('/shop');
    };

    const canPay = order.status === "Chờ thanh toán" && order.PaymentMethod === "VNPAY";
    const canEdit = ["Chờ thanh toán", "Chờ xử lý", "Đã xác nhận","Đã thanh toán"].includes(order.status);
    const canCancel = ["Chờ thanh toán", "Chờ xử lý", "Đã thanh toán"].includes(order.status);
    const canReorder = ["Hoàn thành", "Đã hủy"].includes(order.status);

    return (
        <div className="min-h-screen bg-white py-2 text-[#2D3748] pb-20 selection:bg-amber-100 selection:text-amber-900">
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

                {/* Khối Thông báo thành công */}
                <div className="flex items-center justify-center gap-2 mb-16">
                    <IoCheckmarkCircle size={30} className={isCancelled ? "text-red-500" : "text-green-500"} />
                    <span className="font-bold tracking-wide text-2xl uppercase font-nunito">
                        {isCancelled ? "Đơn hàng đã hủy" : "Đặt hàng thành công"}
                    </span>
                </div>

                {/* Tiêu đề chính & Trạng thái Badge */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[#1A202C] font-nunito tracking-tight">Chi tiết đơn hàng #{order.id}</h1>
                        <p className="text-gray-400 mt-1 text-left">
                            Ngày đặt: {formatDate(orderDate)}
                        </p>
                        {!isCancelled && (
                            <p className="text-gray-400 mt-1 text-left">
                                Thời gian nhận dự kiến: <span className='text-accent-1 font-semibold'>{formatDate(orderDate)} - {formatDate(estimatedDate)}</span>
                            </p>
                        )}
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-sm font-bold border flex items-center gap-2 ${isCancelled ? 'bg-red-50 text-red-500 border-red-100' : 'bg-accent-1 text-white border-orange-100'}`}>
                        <GrRadialSelected size={15} />
                        <span>{['Đang trung chuyển', 'Shipper đã nhận', 'Đang giao'].includes(order.status) ? 'Đang giao' : order.status}</span>
                    </div>
                </div>

                {/* KHỐI HIỂN THỊ CHI TIẾT LÝ DO HỦY ĐƠN HÀNG */}
                {isCancelled && (
                    <div className="bg-amber-50/40 border border-amber-100 rounded-2xl p-6 mb-8 text-left font-nunito animate-fade-in">
                        <div className="flex items-center gap-3 border-b border-amber-100 pb-4 mb-4">
                            <X size={22} className="text-red-500 bg-red-100 rounded-full p-0.5" />
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">Hoàn tiền đã được phê duyệt</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Yêu cầu hoàn trả & hủy đơn đã hoàn tất xử lý trên hệ thống bưu cục.</p>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                            <p><span className="text-gray-400 inline-block w-28">Lý do:</span> <span className="font-semibold text-gray-800">{order.CancelReason || "Không cần nữa / Thay đổi ý định"}</span></p>
                            
                            {/* Hiển thị số sao trải nghiệm hủy đơn đã lưu */}
                            <p className="flex items-center">
                                <span className="text-gray-400 inline-block w-28">Đánh giá dịch vụ:</span> 
                                <span className="flex gap-0.5 ml-0">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star 
                                            key={star} 
                                            size={14} 
                                            className={star <= (order.CancelRating || cancelRating) ? "text-amber-500" : "text-gray-200"} 
                                            fill={star <= (order.CancelRating || cancelRating) ? "#F59E0B" : "none"} 
                                        />
                                    ))}
                                </span>
                            </p>

                            <p><span className="text-gray-400 inline-block w-28">Giải pháp:</span> Hủy đơn hàng & Hoàn trả ví/thẻ hệ thống</p>
                            <p><span className="text-gray-400 inline-block w-28">Tổng tiền hoàn lại:</span> <span className="font-black text-green-600">0₫</span> (Áp dụng cho đơn thanh toán COD)</p>
                            <p><span className="text-gray-400 inline-block w-28">Ngày yêu cầu:</span> {order.CancelDate ? formatDate(new Date(order.CancelDate)) : formatDate(new Date())} 5:14 PM</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* CỘT TRÁI */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* 1. Trạng thái vận chuyển dạng NGANG */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                            <h2 className="text-xl font-bold mb-10 text-left">Trạng thái vận chuyển</h2>
                            {!isCancelled ? (
                                <div className="relative flex justify-between">
                                    <div className="absolute top-5 left-6 right-6 h-[2px] bg-gray-100 z-0"></div>
                                    <div
                                        className="absolute top-5 left-6 right-6 h-[2px] bg-accent-1 z-0 transition-all duration-500"
                                        style={{ width: `${currentStepIndex <= 0 ? 0 : (currentStepIndex / (steps.length - 1)) * 100}%` }}
                                    ></div>

                                    {steps.map((step, idx) => {
                                        const active = idx <= currentStepIndex;
                                        return (
                                            <div key={step.id} className="relative z-10 flex flex-col items-center">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${active ? 'bg-accent-1 border-[#F3F0ED] text-white' : 'bg-white border-white text-gray-300 shadow-sm'}`}>
                                                    {step.icon}
                                                </div>
                                                <p className={`mt-3 text-sm font-bold ${active ? 'text-[#1A202C]' : 'text-gray-300'}`}>{step.label}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-2 text-red-500 font-bold italic text-left text-sm">Đơn hàng này đã bị hủy bỏ bởi người dùng.</div>
                            )}
                            <div className='text-justify pt-6 font-nunito text-sm text-primary/80 flex items-start gap-3 border-t border-gray-50 mt-6'> 
                                <FaShippingFast size={22} className="text-accent-1 shrink-0 mt-0.5" /> 
                                <span>Dịch vụ <strong>Đảm bảo giao hàng đúng hạn</strong> cam kết đơn hàng sẽ được giao chậm nhất vào ngày {formatDate(estimatedDate)}. Nhận ngay voucher đền bù nếu đơn hàng đến muộn hơn thời gian trên.</span>
                            </div>
                        </div>

                        {/* 2. Accordion hành trình chi tiết shipper (DỌC) */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300">
                            <button
                                onClick={() => !isCancelled && setIsTrackingOpen(!isTrackingOpen)}
                                disabled={isCancelled}
                                className={`w-full p-6 flex items-center justify-between transition-colors border-b border-gray-50 ${isCancelled ? 'bg-gray-50 cursor-not-allowed' : 'bg-gray-50/50 hover:bg-gray-50'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <Truck size={22} className={!isCancelled ? 'text-green-500' : 'text-gray-400'} />
                                    <div className="text-left font-nunito">
                                        <h2 className="text-lg font-bold text-[#1A202C]">Theo dõi đơn hàng chi tiết</h2>
                                        <p className="text-xs text-gray-400">
                                            {!isCancelled ? 'Bấm vào để xem hành trình di chuyển thực tế của shipper' : 'Không khả dụng cho đơn hàng đã hủy'}
                                        </p>
                                    </div>
                                </div>
                                {!isCancelled && (
                                    <div className={`transform transition-transform duration-300 text-gray-400 ${isTrackingOpen ? 'rotate-180' : ''}`}>
                                        <ChevronLeft size={20} className="-rotate-90" />
                                    </div>
                                )}
                            </button>

                            <div className={`transition-all duration-300 ease-in-out ${isTrackingOpen ? 'max-h-[1200px] p-6 md:p-8 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                                {!isCancelled && (
                                    <div className="relative flex flex-col font-nunito max-w-2xl mx-auto py-4">
                                        <div className="absolute top-3 bottom-3 left-6 sm:left-1/2 sm:-translate-x-1/2 w-[2px] bg-gray-100 z-0"></div>

                                        <div
                                            className="absolute top-3 left-6 sm:left-1/2 sm:-translate-x-1/2 w-[2px] bg-green-500 z-0 transition-all duration-500"
                                            style={{
                                                height: currentShipperStepIndex <= 0 ? '0%' : `${(currentShipperStepIndex / (steps_shipper.length - 1)) * 100}%`,
                                                maxHeight: 'calc(100% - 32px)'
                                            }}
                                        ></div>

                                        <div className="space-y-8 relative z-10">
                                            {steps_shipper.map((step, idx) => {
                                                const isPassedOrCurrent = idx <= currentShipperStepIndex;
                                                const isCurrent = idx === currentShipperStepIndex;

                                                return (
                                                    <div key={step.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 relative pl-12 sm:pl-0">
                                                        <div className="w-full sm:w-[45%] text-left sm:text-right sm:pr-8">
                                                            {isPassedOrCurrent ? (
                                                                <p className={`text-xs font-bold ${isCurrent ? 'text-green-500' : 'text-gray-400'}`}>
                                                                    {idx === 0 ? formatDate(orderDate) : 'Đang cập nhật'}
                                                                </p>
                                                            ) : (
                                                                <p className="text-xs text-gray-300 italic">Chưa thực hiện</p>
                                                            )}
                                                        </div>

                                                        <div className="absolute left-3 sm:relative sm:left-auto flex items-center justify-center w-6 h-6 sm:mx-auto bg-white rounded-full">
                                                            <div className={`rounded-full transition-all duration-300 ${isCurrent ? 'w-4 h-4 bg-green-500 ring-4 ring-green-100 animate-pulse' : isPassedOrCurrent ? 'w-3 h-3 bg-green-500' : 'w-3 h-3 bg-gray-200 border-2 border-white shadow-sm'}`} />
                                                        </div>

                                                        <div className="w-full sm:w-[45%] sm:pl-8 text-left">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className={`text-sm font-black transition-colors ${isCurrent ? 'text-green-600 text-base' : isPassedOrCurrent ? 'text-gray-700' : 'text-gray-400'}`}>
                                                                    {step.label}
                                                                </h4>
                                                                {isCurrent && (
                                                                    <span className="text-[9px] uppercase font-black bg-green-100 text-green-700 px-1.5 py-0.5 rounded tracking-wider">
                                                                        Mới nhất
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {isPassedOrCurrent && (
                                                                <div className="mt-1 text-xs text-gray-500 leading-relaxed">
                                                                    {step.id === 'Chờ xử lý' && "Đơn hàng đã được ghi nhận trên hệ thống."}
                                                                    {step.id === 'Đã xác nhận' && "Hệ thống kiểm tra thành công, kho đang đóng gói hàng hóa."}
                                                                    {step.id === 'Shipper đã nhận' && "Đơn vị vận chuyển đối tác đã lấy hàng khỏi kho."}
                                                                    {step.id === 'Đang trung chuyển' && "Đơn hàng đang điều phối qua các bưu cục tổng."}
                                                                    {step.id === 'Đang giao' && (
                                                                        <div className="mt-2 p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-[11px] text-gray-600 space-y-0.5 max-w-xs shadow-sm">
                                                                            <p>Tài xế giao hàng: <span className="font-bold text-gray-800">Vũ Nam Khánh</span></p>
                                                                            <p className="text-blue-600 font-medium">SĐT liên hệ: +84974233552</p>
                                                                            <p className='text-red-500'>Hotline hỗ trợ nhanh: <span className="font-bold text-gray-800">1900 1000</span></p>
                                                                        </div>
                                                                    )}
                                                                    {step.id === 'Hoàn thành' && (
                                                                        <div className="max-w-[200px] rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-white mt-2">
                                                                            <img
                                                                                src="https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?q=80&w=200"
                                                                                alt="Hình ảnh giao hàng thành công"
                                                                                className="w-full h-24 object-cover"
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. Danh sách các sản phẩm */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-xl font-bold text-left">Sản phẩm đã chọn</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50/50">
                                            <th className="px-6 py-4 font-bold text-sm text-accent-1">Sản phẩm</th>
                                            <th className="px-6 py-4 text-center font-bold text-sm text-accent-1">Số lượng</th>
                                            <th className="px-6 py-4 text-right font-bold text-sm text-accent-1">Đơn giá</th>
                                            <th className="px-6 py-4 text-right font-bold text-sm text-accent-1">Tổng cộng</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {order.orderDetails && order.orderDetails.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                                                <td className="px-6 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-16 h-16 bg-[#F7F7F7] rounded-xl p-2 flex items-center justify-center shrink-0">
                                                            <img src={item.product?.imageUrl} alt={item.product?.name} className="max-h-full object-contain" />
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="font-bold text-[#1A202C]">{item.product?.name}</p>
                                                            <div className="text-[11px] text-gray-400 mt-1 space-y-0.5">
                                                                <p>Vị: {item.flavorNotes || 'Mặc định'}</p>
                                                                <p>Xay: {translateGrind(item.grindingOptionId)}</p>
                                                                <p>Trọng lượng: {item.weight || 'Không rõ'}</p>
                                                            </div>

                                                            {order.status === "Hoàn thành" && (
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedProductToReview(item);
                                                                        setIsReviewModalOpen(true);
                                                                    }}
                                                                    className="mt-3 px-4 py-1.5 bg-gradient-to-r from-accent-1 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 group transform hover:-translate-y-0.5"
                                                                >
                                                                    <Star size={13} fill="white" className="group-hover:rotate-45 transition-transform" />
                                                                    Đánh giá sản phẩm
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-center font-bold text-gray-700">{item.quantity}</td>
                                                <td className="px-6 py-6 text-right text-gray-500">{(item.unitPrice || 0).toLocaleString()}₫</td>
                                                <td className="px-6 py-6 text-right font-black text-[#1A202C]">{((item.unitPrice || 0) * item.quantity).toLocaleString()}₫</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* CỘT PHẢI */}
                    <div className="space-y-6">
                        
                        {/* Khối Thông tin nhận hàng */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                            <h3 className="font-bold mb-6 text-[#1A202C] text-left text-lg">Thông tin nhận hàng</h3>
                            <div className="space-y-5">
                                <div className="flex gap-4 text-left">
                                    <User size={18} className="text-accent-1 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">{order.receiverName || "Chưa cập nhật danh tính"}</p>
                                        <p className="text-[11px] font-bold tracking-wider text-accent-1 uppercase">Người nhận</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 text-left">
                                    <Phone size={18} className="text-accent-1 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">{order.receiverPhone || "Chưa có số điện thoại"}</p>
                                        <p className="text-[11px] font-bold tracking-wider text-accent-1 uppercase">Số điện thoại</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 text-left">
                                    <MapPin size={18} className="text-accent-1 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold leading-relaxed text-gray-800">
                                            {order.shippingDetailAddress ?
                                                `${order.shippingDetailAddress}, ${order.shippingWard}, ${order.shippingDistrict}, ${order.shippingProvince}`
                                                : "Chưa ghi nhận địa chỉ giao hàng"}
                                        </p>
                                        <p className="text-[11px] font-bold tracking-wider text-accent-1 uppercase">Địa chỉ giao nhận</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-[#F1F5F9] rounded-xl flex gap-3 items-start text-left">
                                <FileText size={16} className="text-accent-1 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs italic text-gray-500">"{order.shippingNote || 'Không có ghi chú thêm cho shipper'}"</p>
                                    <p className="text-[11px] font-bold mt-1 text-accent-1 uppercase tracking-wide">Ghi chú</p>
                                </div>
                            </div>
                        </div>

                        {/* Khối Chi tiết thanh toán */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 font-nunito">
                            <h3 className="font-bold mb-4 text-left text-lg">Chi tiết thanh toán</h3>
                            <div className="space-y-3 text-sm border-b border-gray-100 pb-4">
                                <div className="flex justify-between text-gray-400">
                                    <span>Tạm tính giá gốc</span>
                                    <span className="font-bold text-gray-600">{(order.totalAmount || 0).toLocaleString()}₫</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Phí giao hàng toàn quốc</span>
                                    <span className="font-bold text-gray-600">30.000₫</span>
                                </div>
                                <div className="flex justify-between text-green-500">
                                    <span>Voucher giảm giá áp dụng</span>
                                    <span className="font-bold">- {(order.discountAmount || 0).toLocaleString()}₫</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-4">
                                <span className="font-bold text-gray-800">Tổng tiền cuối cùng</span>
                                <span className="text-xl font-black text-[#1A202C]">{(order.finalAmount || 0).toLocaleString()}₫</span>
                            </div>

                            <div className="mt-8 space-y-3">
                                {canPay && (
                                    <button
                                        onClick={() => handlePayment(order.id, order.totalAmount)}
                                        className="w-full font-bold bg-green-600 text-white py-3.5 rounded-xl uppercase tracking-widest text-xs hover:bg-green-700 shadow-md transition-all transform hover:-translate-y-0.5"
                                    >
                                        Tiến hành Thanh toán (VNPAY)
                                    </button>
                                )}

                                {canEdit && (
                                    <button
                                        onClick={() => handleEdit(order.id)}
                                        className="w-full font-bold bg-[#2B6CB0] text-white py-3.5 rounded-xl uppercase tracking-widest text-xs hover:bg-[#2C5282] shadow-md transition-all transform hover:-translate-y-0.5"
                                    >
                                        Chỉnh sửa thông tin nhận hàng
                                    </button>
                                )}

                                {canCancel && (
                                    <button
                                        onClick={() => setIsCancelModalOpen(true)}
                                        className="w-full border-2 text-red-500 border-red-500 py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-red-500 hover:text-white transition-all transform hover:-translate-y-0.5"
                                    >
                                        Yêu cầu hủy đơn hàng
                                    </button>
                                )}

                                {canReorder && (
                                    <button
                                        onClick={handleReorder}
                                        className="w-full border-2 text-amber-900 border-amber-900 py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-amber-900 hover:text-white transition-all transform hover:-translate-y-0.5"
                                    >
                                        Mua lại đơn hàng này
                                    </button>
                                )}
                            </div>
                        </div>

                        {order.status === "Hoàn thành" && (
                            <div className='flex items-center justify-center gap-2 text-center text-sm font-bold text-green-600 bg-green-50 p-4 rounded-2xl border border-green-100 shadow-sm animate-fade-in'>
                                <TbMoneybagMoveBack size={22} className="shrink-0" />
                                <span>Đơn hàng thỏa mãn chính sách bảo hộ: Hỗ trợ trả hàng/hoàn tiền miễn phí trong vòng 7 ngày đầu.</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ==================== MODAL ĐÁNH GIÁ SẢN PHẨM ==================== */}
            {isReviewModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl relative font-nunito border border-slate-100 overflow-hidden transform transition-all scale-100 animate-scale-in">
                        
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-orange-200/20 rounded-full blur-3xl pointer-events-none" />

                        <button 
                            onClick={() => setIsReviewModalOpen(false)}
                            className="absolute top-5 right-5 text-gray-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-all"
                        >
                            <X size={18} />
                        </button>

                        <div className="flex items-center gap-2 mb-2 text-left">
                            <div className="bg-gradient-to-r from-accent-1 to-orange-500 p-2 rounded-xl text-white shadow-md shadow-orange-500/20">
                                <Sparkles size={20} className="animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Đánh giá dịch vụ</h3>
                                <p className="text-xs text-slate-400">Trải nghiệm của bạn giúp cửa hàng cải thiện tốt hơn mỗi ngày</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 bg-slate-50/80 border border-slate-100 p-4 rounded-2xl mb-6 text-left mt-4">
                            <div className="w-14 h-14 bg-white rounded-xl p-1.5 border border-slate-100 shadow-sm shrink-0 flex items-center justify-center">
                                <img src={selectedProductToReview?.product?.imageUrl} className="max-h-full object-contain" alt="" />
                            </div>
                            <div className="overflow-hidden">
                                <p className="font-bold text-sm text-slate-800 truncate">{selectedProductToReview?.product?.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[11px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-md">
                                        {translateGrind(selectedProductToReview?.grindingOptionId)}
                                    </span>
                                    <span className="text-[11px] text-slate-400">Số lượng: x{selectedProductToReview?.quantity}</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-center bg-slate-50/40 border border-dashed border-slate-200 rounded-2xl py-5 px-4 mb-5">
                            <label className="block text-xs uppercase font-black tracking-widest text-slate-400 mb-3">Mức độ hài lòng của bạn</label>
                            
                            <div className="flex justify-center gap-3">
                                {[1, 2, 3, 4, 5].map((star) => {
                                    const isLit = star <= (hoveredRating || rating);
                                    return (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoveredRating(star)}
                                            onMouseLeave={() => setHoveredRating(0)}
                                            className="transition-transform duration-150 active:scale-95 transform hover:scale-125 focus:outline-none"
                                        >
                                            <Star
                                                size={36}
                                                className={`transition-colors duration-200 ${isLit ? "text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]" : "text-slate-200"}`}
                                                fill={isLit ? "#F59E0B" : "none"}
                                                strokeWidth={isLit ? 1.5 : 1}
                                            />
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-3 min-h-[20px]">
                                <p className="text-sm font-bold text-amber-600 transition-all animate-fade-in">
                                    {getFeedbackText(hoveredRating || rating)}
                                </p>
                            </div>
                        </div>

                        <div className="text-left mb-4">
                            <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mb-2">
                                <HeartHandshake size={13} /> Chọn nhanh từ khóa nhận xét:
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {quickTags.map((tag, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleQuickTagClick(tag)}
                                        className="text-xs bg-slate-50 border border-slate-200 text-slate-600 px-2.5 py-1.5 rounded-xl hover:bg-amber-50 hover:border-amber-300 hover:text-amber-800 transition-all font-medium"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="text-left mb-6">
                            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1">
                                <Heart size={14} className="text-red-400" /> Chia sẻ chi tiết trải nghiệm
                            </label>
                            <textarea
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                rows={4}
                                className="w-full border border-slate-200 rounded-2xl p-4 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-sm resize-none transition-all placeholder:text-slate-400 bg-slate-50/30"
                                placeholder="Hãy chia sẻ cảm nhận thực tế của bạn về chất lượng đóng gói, hương vị sản phẩm hoặc dịch vụ giao nhận nhé..."
                            ></textarea>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setIsReviewModalOpen(false)}
                                disabled={isSubmittingReview}
                                className="w-1/3 border border-slate-200 py-3.5 rounded-2xl font-bold text-sm text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50"
                            >
                                Đóng lại
                            </button>
                            <button
                                type="button"
                                onClick={handleReviewSubmit}
                                disabled={isSubmittingReview}
                                className="w-2/3 bg-gradient-to-r from-accent-1 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-3.5 rounded-2xl font-black text-sm tracking-wide transition-all shadow-lg shadow-orange-500/20 active:translate-y-0 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {isSubmittingReview ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Đang gửi đi...
                                    </>
                                ) : (
                                    <>Gửi đánh giá ngay ✨</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================== MODAL LÝ DO HỦY ĐƠN HÀNG + CHẤM SAO TRẢI NGHIỆM ==================== */}
            {isCancelModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative font-nunito animate-scale-in">
                        <button 
                            onClick={() => setIsCancelModalOpen(false)} 
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={20} />
                        </button>
                        <h3 className="text-xl font-bold text-gray-800 mb-2 text-left">Lý do hủy đơn hàng</h3>
                        <p className="text-xs text-red-500 mb-4 text-left">Lưu ý: Hành động này không thể hoàn tác sau khi xác nhận.</p>
                        
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-1 mb-4 text-left">
                            {cancelReasonsList.map((reason, idx) => (
                                <label 
                                    key={idx} 
                                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${cancelReason === reason ? 'border-red-500 bg-red-50/30' : 'border-gray-100 hover:bg-gray-50'}`}
                                >
                                    <input 
                                        type="radio" 
                                        name="cancelReason" 
                                        value={reason} 
                                        checked={cancelReason === reason} 
                                        onChange={(e) => setCancelReason(e.target.value)} 
                                        className="w-4 h-4 accent-red-500" 
                                    />
                                    <span className="text-sm font-medium text-gray-700">{reason}</span>
                                </label>
                            ))}
                        </div>

                        {cancelReason === "Lý do khác" && (
                            <div className="mb-4 text-left animate-fade-in">
                                <textarea 
                                    value={customCancelReason} 
                                    onChange={(e) => setCustomCancelReason(e.target.value)} 
                                    rows={2} 
                                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-none" 
                                    placeholder="Vui lòng nhập lý do cụ thể..."
                                ></textarea>
                            </div>
                        )}

                        {/* --- KHỐI CHỌN SỐ SAO CHO TRẢI NGHIỆM HỦY ĐƠN TỰA TIKTOK SHOP --- */}
                        <div className="border-t border-gray-100 pt-4 mb-5 text-center">
                            <label className="block text-xs uppercase font-black tracking-wider text-gray-400 mb-2">
                                Đánh giá trải nghiệm quy trình hủy đơn hàng:
                            </label>
                            <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => {
                                    const isLit = star <= (hoveredCancelRating || cancelRating);
                                    return (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setCancelRating(star)}
                                            onMouseEnter={() => setHoveredCancelRating(star)}
                                            onMouseLeave={() => setHoveredCancelRating(0)}
                                            className="transition-transform duration-100 active:scale-95 transform hover:scale-110 focus:outline-none"
                                        >
                                            <Star
                                                size={28}
                                                className={`transition-colors duration-200 ${isLit ? "text-amber-400 drop-shadow-sm" : "text-gray-200"}`}
                                                fill={isLit ? "#F59E0B" : "none"}
                                                strokeWidth={isLit ? 1.5 : 1}
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="mt-1 min-h-[16px]">
                                <p className="text-xs font-bold text-amber-600 transition-all">
                                    {getCancelFeedbackText(hoveredCancelRating || cancelRating)}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => setIsCancelModalOpen(false)} 
                                className="w-1/2 border py-3 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                            >
                                Quay lại
                            </button>
                            <button 
                                onClick={handleCancelSubmit} 
                                className="w-1/2 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold text-sm transition-all"
                            >
                                Xác nhận hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}