import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft, MapPin, Phone, User, FileText,
    Check, Truck, PackageCheck, HelpCircle, Star, X, Copy
} from 'lucide-react';
import useStore from '../store/useStore';
import { IoCheckmarkCircle } from "react-icons/io5";
import { GrRadialSelected } from "react-icons/gr";
import { FaShippingFast } from "react-icons/fa";
import { TbMoneybagMoveBack } from "react-icons/tb";
import { CheckCircle } from 'lucide-react';

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
    const [fillYourBank, setFillYourBank] = useState("");
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    // --- STATE KHỐI HỦY ĐƠN HÀNG ---
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [customCancelReason, setCustomCancelReason] = useState("");
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

    const reviewText = [
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

    const formatDateTime = (date) => {
        return `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
    };

    // Lấy phương thức thanh toán chuẩn hóa
    const currentPaymentMethod = order.PaymentMethod || order.paymentMethod || "COD";
    const isCODOrder =
        currentPaymentMethod.toUpperCase() === "COD" ||
        order.status === "Chờ thanh toán" ||
        order.status === "Đã hủy";

    // --- ĐÃ ĐƯA VỀ 4 TRẠNG THÁI ĐƠN HÀNG NHƯ CŨ ---
    const currentSteps = [
        { id: 'Chờ xử lý', label: 'Đã đặt hàng', icon: <Check size={18} /> },
        { id: 'Đã xác nhận', label: 'Đã xác nhận', icon: <Check size={18} /> },
        { id: 'Đang giao', label: 'Đang giao', icon: <Truck size={18} /> },
        { id: 'Hoàn thành', label: 'Hoàn thành', icon: <PackageCheck size={18} /> },
    ];

    // --- ĐÃ ĐƯA VỀ 6 BƯỚC THEO DÕI SHIPPER CHI TIẾT NHƯ CŨ ---
    const currentShipperSteps = [
        { id: 'Chờ xử lý', label: 'Đã đặt hàng', icon: <Check size={18} /> },
        { id: 'Đã xác nhận', label: 'Đang chuẩn bị hàng', icon: <Check size={18} /> },
        { id: 'Đang trung chuyển', label: 'Đang trung chuyển', icon: <Truck size={18} /> },
        { id: 'Shipper đã nhận', label: 'Đã lấy đơn hàng', icon: <Check size={18} /> },
        { id: 'Đang giao', label: 'Đang trên đường giao', icon: <Truck size={18} /> },
        { id: 'Hoàn thành', label: 'Đã giao thành công', icon: <PackageCheck size={18} /> },
    ];

    // Hàm xác định xem bước hiện tại có được kích hoạt hay không
    const getStepStatus = (currentStatus, stepIndex) => {
        const statusOrder = {
            'Đã hủy': 1,          // Đơn hàng đã bị hủy (COD) - Không hoàn tiền, hoặc VNPAY - Bắt đầu quy trình hoàn tiền
            'Chờ hoàn tiền': 1,           // Mới gửi yêu cầu hủy
            'Đã hủy': 2,           // Đơn hàng đã bị hủy (COD) - Không hoàn tiền
            'Đã hoàn tiền': 2,    // Admin đang xét duyệt
            'Đã hoàn tiền': 3,   // Đang đẩy lệnh qua cổng VNPAY`
            'Đã hoàn tiền': 4,      // Hoàn tất 100%,
        };

        const currentLevel = statusOrder[currentStatus] || 0;

        if (currentLevel >= stepIndex) return 'completed'; // Đã qua hoặc đang ở bước này (màu xanh)
        return 'pending'; // Chưa tới (màu xám)
    };

    // Luồng tiến trình hủy hoàn tiền cố định
    // Cập nhật lại mảng refundSteps đối với luồng !isCODOrder (VNPAY)
    const refundSteps = isCODOrder
        ? [
            { id: 'Đã hủy', label: 'Gửi yêu cầu hủy', description: 'Yêu cầu hủy đơn đã được ghi nhận thành công' },
            { id: 'Đã hoàn tiền', label: 'Hoàn tiền phê duyệt', description: 'Thủ tục hoàn tất / Đơn hàng đã hủy trực tiếp' },
        ]
        : [
            { id: 'Chờ hoàn tiền', label: 'Gửi yêu cầu hủy', description: 'Yêu cầu hủy đơn đã được ghi nhận thành công' },
            { id: 'Đã hoàn tiền', label: 'Admin xét duyệt', description: 'Hệ thống bưu cục đang đối soát kiểm tra dòng tiền' },
            { id: 'Đã hoàn tiền', label: 'Cổng ví xử lý', description: 'Ngân hàng đối tác thực hiện lệnh trả tiền mặt' },
            { id: 'Đã hoàn tiền', label: 'Hoàn tiền phê duyệt', description: 'Tiền đã hoàn về tài khoản / Thủ tục hoàn tất' },
        ];

    const getMappedStatus = (status) => {
        if (status === 'Chờ thanh toán' || status === 'Đã thanh toán') return 'Chờ xử lý';
        if (['Shipper đã nhận', 'Đang trung chuyển', 'Đang giao'].includes(status)) {
            return 'Đang giao';
        }
        return status;
    };

    const mappedStatus = getMappedStatus(order.status);
    const currentStepIndex = currentSteps.findIndex(s => s.id === mappedStatus);

    const currentShipperStepIndex = currentShipperSteps.findIndex(s => {
        if (s.id === 'Chờ xử lý') return order.status === 'Chờ xử lý' || order.status === 'Chờ thanh toán' || order.status === 'Đã thanh toán';
        return s.id === order.status;
    });

    // --- KIỂM TRA TRẠNG THÁI HỦY / HOÀN TIỀN ---
    // Cập nhật lại phạm vi bắt các trạng thái hoàn tiền
    const isCancelled = order.status === 'Đã hủy' || order.status === 'Đã hoàn tiền';
    const isRefundFlow = ['Chờ hoàn tiền', 'Đã hoàn tiền', 'Đã hoàn tiền', 'Đã hoàn tiền'].includes(order.status);

    const getRefundStepIndex = (status) => {
        // Nếu thuộc luồng hủy trực tiếp (isCODOrder bao gồm cả đơn Chờ thanh toán)
        if (isCODOrder) {
            return status === 'Đã hoàn tiền' || status === 'Đã hủy' ? 2 : 1;
        } else {
            if (status === 'Chờ hoàn tiền') return 1;
            if (status === 'Đã hoàn tiền') return 2;
            // ... giữ nguyên đoạn sau của bạn
            return 0;
        }
    };
    const currentRefundStepIndex = getRefundStepIndex(order.status);

    const handleCancelSubmit = async () => {
        const finalReason = cancelReason === "Lý do khác" ? customCancelReason : cancelReason;
        if (!finalReason) {
            alert("Vui lòng chọn hoặc nhập lý do hủy đơn của bạn!");
            return;
        }

        try {
            await cancelOrder(order.id, {
                reason: finalReason,
                rating: cancelRating
            });

            // Cập nhật logic chọn trạng thái đích tại đây:
            // Nếu là đơn COD hoặc đang "Chờ thanh toán" thì đích đến là "Đã hủy"
            const isDirectCancel = currentPaymentMethod.toUpperCase() === "COD" || order.status === "Chờ thanh toán";
            const targetStatus = isDirectCancel ? "Đã hủy" : "Chờ hoàn tiền";

            setOrder(prev => ({
                ...prev,
                status: targetStatus,
                CancelReason: finalReason,
                CancelRating: cancelRating,
                CancelDate: new Date()
            }));
            setIsCancelModalOpen(false);

            // Thay đổi câu thông báo cho phù hợp với từng ngữ cảnh
            if (isDirectCancel) {
                alert("Hủy đơn hàng thành công!");
            } else {
                alert("Gửi yêu cầu hủy đơn hàng thành công! Đơn hàng của bạn bắt đầu vào quy trình hoàn tiền.");
            }
        } catch (error) {
            alert(error.response?.data || "Hủy đơn hàng thất bại, vui lòng thử lại!");
        }
    };

    // --- XỬ LÝ GỬI ĐÁNH GIÁ SẢN PHẨM ---
    const handleReviewSubmit = async () => {
        if (!reviewComment.trim()) {
            alert("Vui lòng nhập nội dung nhận xét sản phẩm!");
            return;
        }
        setIsSubmittingReview(true);
        try {
            // Giả lập/Gọi hàm xử lý API Submit Review từ Store của bạn ở đây nếu cần
            // await submitProductReview(order.id, selectedProductToReview.productId, { rating, comment: reviewComment });
            alert(`Đánh giá sản phẩm ${selectedProductToReview?.product?.name} thành công với mức ${rating} sao!`);
            setIsReviewModalOpen(false);
            setReviewComment("");

            setRating(5);
        } catch (error) {
            alert("Gửi đánh giá thất bại, vui lòng thử lại!");
        } finally {
            setIsSubmittingReview(false);
        }
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

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert("Đã sao chép vào bộ nhớ tạm!");
    };

    const canPay = order.status === "Chờ thanh toán" && currentPaymentMethod === "VNPAY";
    const canEdit = ["Chờ thanh toán", "Chờ xử lý", "Đã xác nhận", "Đã thanh toán"].includes(order.status) && !isRefundFlow;
    const canCancel = ["Chờ thanh toán", "Chờ xử lý", "Đã thanh toán"].includes(order.status) && !isRefundFlow;
    const canReorder = ["Hoàn thành", "Đã hủy"].includes(order.status);

    if (isCancelled || isRefundFlow) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] py-4 text-[#2D3748] pb-20 font-nunito selection:bg-red-100">
                <div className="container mx-auto px-4 max-w-2xl bg-white min-h-screen shadow-sm border-x border-gray-100 p-0">

                    <div className="flex items-center justify-between py-4 border-b border-gray-100 px-4 sticky top-0 bg-white z-20">
                        <button onClick={() => navigate('/orders')} className="text-gray-700 hover:text-black">
                            <ChevronLeft size={24} />
                        </button>
                        <h1 className="text-lg font-bold text-gray-900">
                            {order.status === 'Đã hủy' ? 'Hoàn tiền đã được phê duyệt' : 'Chi tiết Hoàn tiền / Hủy đơn'}
                        </h1>
                        <HelpCircle size={22} className="text-gray-400 cursor-pointer" />
                    </div>

                    <div className="bg-white p-6 border-b-8 border-gray-100 text-left">
                        <div className="relative space-y-6">
                            <div className="absolute top-2 bottom-2 left-3 w-[2px] bg-gray-100 z-0 -translate-x-1/2"></div>

                            <div
                                className="absolute top-2 left-3 w-[2px] bg-emerald-500 z-0 -translate-x-1/2 transition-all duration-500"
                                style={{ height: `${(currentRefundStepIndex / (refundSteps.length - 1)) * 100}%`, maxHeight: 'calc(100% - 16px)' }}
                            ></div>

                            {refundSteps.map((step, idx) => {
                                const stepNumber = idx + 1;
                                // Gọi hàm helper để kiểm tra xem bước này đã được hoàn thành chưa
                                const isStepCompleted = getStepStatus(order.status, stepNumber) === 'completed';
                                const isStepCurrent = getRefundStepIndex(order.status) === stepNumber;

                                return (
                                    <div key={step.id} className="relative z-10 flex items-start gap-4">
                                        <div className="w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                                            {isStepCompleted ? (
                                                // Nếu đã hoàn thành hoặc đang ở bước này => Hiện dấu tích xanh hoặc chấm xanh sáng
                                                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">✓</div>
                                            ) : (
                                                // Nếu chưa tới bước này => Hiện chấm xám
                                                <div className="w-3.5 h-3.5 rounded-full bg-gray-200 border-2 border-white shadow-sm"></div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className={`text-sm font-bold ${isStepCompleted ? 'text-emerald-600' : 'text-gray-600'}`}>
                                                {step.label}
                                            </h4>
                                            <p className="text-xs text-gray-400 mt-0.5">{step.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-white p-6 border-b-8 border-gray-100 text-left">
                        <h3 className="text-sm font-bold text-gray-800 mb-3">Mức độ hài lòng của bạn về quy trình xử lý hủy đơn này?</h3>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    size={28}
                                    className={(star <= (order.CancelRating || cancelRating)) ? "text-amber-400" : "text-gray-200"}
                                    fill={(star <= (order.CancelRating || cancelRating)) ? "#F59E0B" : "none"}
                                />
                            ))}
                        </div>
                        <p className="text-xs font-bold text-amber-600 mt-2">
                            {getCancelFeedbackText(order.CancelRating || cancelRating)}
                        </p>
                    </div>

                    <div className="bg-white p-6 border-b-8 border-gray-100 text-left">
                        <h3 className="text-sm font-bold text-gray-900 mb-4">Mặt hàng hoàn tiền</h3>
                        <div className="space-y-4">
                            {order.orderDetails && order.orderDetails.map((item, idx) => (
                                <div key={idx} className="flex gap-4 border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                                    <div className="w-16 h-16 bg-gray-50 rounded-lg p-1 border border-gray-100 shrink-0 flex items-center justify-center">
                                        <img src={item.product?.imageUrl} className="max-h-full object-contain" alt="" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-800 font-medium truncate">{item.product?.name}</p>
                                        <p className="text-xs text-gray-400 mt-1">Xay: {translateGrind(item.grindingOptionId)}, Vị: {item.flavorNotes || 'Mặc định'}</p>
                                        <p className="text-xs text-gray-600 mt-1 font-semibold">Số lượng: x{item.quantity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100 space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium">Hình thức thanh toán gốc:</span>
                                <span className="font-bold text-gray-800 bg-gray-100 px-2.5 py-1 rounded-lg text-xs">
                                    {currentPaymentMethod}
                                </span>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium">Tổng tiền đã thanh toán:</span>
                                <span className="font-bold text-gray-800">
                                    {isCODOrder ? "0₫" : `${(order.totalAmount + 30000 - order.discountAmount || 0).toLocaleString()}₫`}
                                </span>
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-100">
                                <span className="text-gray-900 font-bold text-sm">Số tiền hoàn trả thực tế:</span>
                                <span className="font-black text-red-500 text-lg">
                                    {isCODOrder ? "0₫" : `${(order.totalAmount + 30000 - order.discountAmount || 0).toLocaleString()}₫`}
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 space-y-2 text-xs text-gray-500 pt-3 border-t border-gray-50">
                            <div className="flex justify-between">
                                <span>Lý do hủy đơn</span>
                                <span className="text-gray-800 font-medium">{order.CancelReason || "Không còn nhu cầu mua nữa"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Giải pháp hoàn trả</span>
                                <span className="text-gray-800 font-medium">
                                    {isCODOrder
                                        ? "Hủy đơn trực tiếp (Không phát sinh dòng tiền hoàn)"
                                        : `Hoàn trả về tài khoản liên kết ${currentPaymentMethod}`
                                    }
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 text-left text-xs text-gray-500 space-y-3">
                        <h3 className="text-sm font-bold text-gray-900 mb-4">Chi tiết yêu cầu</h3>
                        <div className="flex justify-between items-center">
                            <span>Số yêu cầu hoàn tiền</span>
                            <span className="text-gray-800 font-medium flex items-center gap-1">
                                {`YEUCAUHOANTIEN${order.id || '72392'}`}
                                <Copy size={13} className="cursor-pointer text-gray-400 hover:text-gray-600" onClick={() => copyToClipboard(`REFUND404022${order.id}`)} />
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Thời gian yêu cầu</span>
                            <span className="text-gray-800 font-medium">
                                {order.CancelDate ? formatDateTime(new Date(order.CancelDate)) : formatDateTime(new Date())}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Mã số đơn hàng gốc</span>
                            <span className="text-gray-800 font-medium flex items-center gap-1">
                                {`DONHANG${order.id || '3768'}`}
                                <Copy size={13} className="cursor-pointer text-gray-400 hover:text-gray-600" onClick={() => copyToClipboard(`DONHANG${order.id}`)} />
                            </span>
                        </div>

                        <div className="pt-8">
                            <button
                                onClick={handleReorder}
                                className="w-full bg-accent-1 text-white font-bold py-3.5 rounded-xl uppercase tracking-wider text-xs hover:bg-amber-900 transition-colors shadow-sm"
                            >
                                Mua lại đơn hàng này
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white py-2 text-[#2D3748] pb-20 selection:bg-amber-100 selection:text-amber-900">
            <div className="container mx-auto px-4 max-w-6xl">

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
                    <span className="font-bold tracking-wide text-2xl uppercase font-nunito">
                        Đặt hàng thành công
                    </span>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[#1A202C] font-nunito tracking-tight">Chi tiết đơn hàng #{order.id}</h1>
                        <p className="text-gray-400 mt-1 text-left">
                            Ngày đặt: {formatDate(orderDate)}
                        </p>
                        <p className="text-gray-400 mt-1 text-left">
                            Thời gian nhận dự kiến: <span className='text-accent-1 font-semibold'>{formatDate(orderDate)} - {formatDate(estimatedDate)}</span>
                        </p>
                    </div>
                    <div className="px-4 py-1.5 rounded-full text-sm font-bold border flex items-center gap-2 bg-accent-1 text-white border-orange-100">
                        <GrRadialSelected size={15} />
                        <span>{['Đang trung chuyển', 'Shipper đã nhận', 'Đang giao'].includes(order.status) ? 'Đang giao' : order.status}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <div className="lg:col-span-2 space-y-6">

                        {/* THANH TIẾN TRÌNH 4 BƯỚC CỐ ĐỊNH NHƯ CŨ */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                            <h2 className="text-xl font-bold mb-10 text-left">Trạng thái vận chuyển</h2>
                            <div className="relative flex justify-between">
                                <div className="absolute top-5 left-6 right-6 h-[2px] bg-gray-100 z-0"></div>
                                <div
                                    className="absolute top-5 left-6 right-6 h-[2px] bg-accent-1 z-0 transition-all duration-500"
                                    style={{ width: `${currentStepIndex <= 0 ? 0 : (currentStepIndex / (currentSteps.length - 1)) * 100}%` }}
                                ></div>

                                {currentSteps.map((step, idx) => {
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
                            <div className='text-justify pt-6 font-nunito text-sm text-primary/80 flex items-start gap-3 border-t border-gray-50 mt-6'>
                                <FaShippingFast size={22} className="text-accent-1 shrink-0 mt-0.5" />
                                <span>Dịch vụ <strong>Đảm bảo giao hàng đúng hạn</strong> cam kết đơn hàng sẽ được giao chậm nhất vào ngày {formatDate(estimatedDate)}. Nhận ngay voucher đền bù nếu đơn hàng đến muộn hơn thời gian trên.</span>
                            </div>
                        </div>

                        {/* ACCORDION THEO DÕI 6 BƯỚC SHIPPER CỐ ĐỊNH NHƯ CŨ */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300">
                            <button
                                onClick={() => setIsTrackingOpen(!isTrackingOpen)}
                                className="w-full p-6 flex items-center justify-between transition-colors border-b border-gray-50 bg-gray-50/50 hover:bg-gray-50"
                            >
                                <div className="flex items-center gap-3">
                                    <Truck size={22} className='text-green-500' />
                                    <div className="text-left font-nunito">
                                        <h2 className="text-lg font-bold text-[#1A202C]">Theo dõi đơn hàng chi tiết</h2>
                                        <p className="text-xs text-gray-400">Bấm vào để xem hành trình di chuyển thực tế của hệ thống</p>
                                    </div>
                                </div>
                                <div className={`transform transition-transform duration-300 text-gray-400 ${isTrackingOpen ? 'rotate-180' : ''}`}>
                                    <ChevronLeft size={20} className="-rotate-90" />
                                </div>
                            </button>

                            <div className={`transition-all duration-300 ease-in-out ${isTrackingOpen ? 'max-h-[1200px] p-6 md:p-8 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                                <div className="relative flex flex-col font-nunito max-w-2xl mx-auto py-4">
                                    <div className="absolute top-3 bottom-3 left-6 sm:left-1/2 sm:-translate-x-1/2 w-[2px] bg-gray-100 z-0"></div>

                                    <div
                                        className="absolute top-3 left-6 sm:left-1/2 sm:-translate-x-1/2 w-[2px] bg-green-500 z-0 transition-all duration-500"
                                        style={{
                                            height: currentShipperStepIndex <= 0 ? '0%' : `${(currentShipperStepIndex / (currentShipperSteps.length - 1)) * 100}%`,
                                            maxHeight: 'calc(100% - 32px)'
                                        }}
                                    ></div>

                                    <div className="space-y-8 relative z-10">
                                        {currentShipperSteps.map((step, idx) => {
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
                            </div>
                        </div>

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

                    <div className="space-y-6">
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

            {/* --- MODAL ĐÁNH GIÁ SẢN PHẨM HOÀN THÀNH (FOODIE PREMIUM STYLE) --- */}
            {isReviewModalOpen && selectedProductToReview && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl transform transition-all font-nunito relative animate-scale-in">

                        {/* Nút đóng góc phải */}
                        <button
                            onClick={() => {
                                setIsReviewModalOpen(false);
                                setReviewComment("");
                                setFillYourBank("");
                                setRating(5);
                            }}
                            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={18} />
                        </button>

                        {/* Header Modal */}
                        <div className="text-center mb-5">
                            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-2 text-emerald-500 shadow-sm">
                                <IoCheckmarkCircle size={28} />
                            </div>
                            <h3 className="text-xl font-black text-gray-900">Đánh giá sản phẩm</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Trải nghiệm của bạn giúp REVO cải thiện mỗi ngày</p>
                        </div>

                        {/* Khối thông tin sản phẩm đang được chọn để đánh giá */}
                        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl mb-5 text-left border border-slate-100/50">
                            <div className="w-14 h-14 bg-white rounded-xl p-1.5 border border-gray-100 flex items-center justify-center shrink-0 shadow-sm">
                                <img
                                    src={selectedProductToReview.product?.imageUrl}
                                    alt=""
                                    className="max-h-full object-contain"
                                />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="text-sm font-bold text-gray-800 truncate">{selectedProductToReview.product?.name}</h4>
                                <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                                    Xay: {translateGrind(selectedProductToReview.grindingOptionId)} | Vị: {selectedProductToReview.flavorNotes || 'Mặc định'}
                                </p>
                            </div>
                        </div>

                        {/* Khối chọn số sao tương tác */}
                        <div className="mb-5 text-center bg-amber-50/30 border border-amber-100/40 py-4 rounded-2xl">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Mức độ hài lòng của bạn?</p>

                            <div className="flex justify-center gap-1.5 mb-2">
                                {[1, 2, 3, 4, 5].map((star) => {
                                    const isLit = star <= (hoveredRating || rating);
                                    return (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoveredRating(star)}
                                            onMouseLeave={() => setHoveredRating(0)}
                                            className="p-1 hover:scale-125 transition-transform duration-150 focus:outline-none"
                                        >
                                            <Star
                                                size={34}
                                                className={`${isLit ? "text-amber-400 drop-shadow-sm" : "text-gray-200"} transition-colors`}
                                                fill={isLit ? "#F59E0B" : "none"}
                                                strokeWidth={isLit ? 1.2 : 2}
                                            />
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Dòng chữ cảm xúc động chân thực */}
                            <div className="min-h-[18px]">
                                <p className="text-xs font-black text-amber-600">
                                    {getFeedbackText(hoveredRating || rating)}
                                </p>
                            </div>
                        </div>

                        {/* Khối gợi ý Tag nhanh (Sử dụng chuẩn mảng reviewText của bạn) */}
                        <div className="mb-5 text-left">
                            <span className="text-xs font-bold text-gray-600 block mb-2">Chọn nhanh nhận xét:</span>
                            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                                {reviewText.map((tag, idx) => {
                                    const isSelected = reviewComment.includes(tag.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, "").trim());
                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => {
                                                // Chuẩn hóa chuỗi để nối tag mượt mà
                                                const cleanTag = tag.trim();
                                                if (!reviewComment.includes(cleanTag)) {
                                                    setReviewComment(prev => prev ? `${prev}, ${cleanTag}` : cleanTag);
                                                }
                                            }}
                                            className={`text-[11px] px-2.5 py-1.5 rounded-xl font-medium border transition-all ${isSelected
                                                ? 'bg-amber-500 border-amber-500 text-white shadow-sm font-bold'
                                                : 'bg-white border-gray-100 hover:border-amber-300 text-gray-600 hover:bg-amber-50/30'
                                                }`}
                                        >
                                            {tag}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Ô nhập ý kiến đóng góp ý kiến tự do */}
                        <div className="mb-6 text-left">
                            <label className="block text-xs font-bold text-gray-600 mb-1.5">
                                Chia sẻ thêm chi tiết cảm nhận
                            </label>
                            <textarea
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                placeholder="Sản phẩm rất hợp khẩu vị, bao bì đóng gói đẹp và chắc chắn..."
                                rows={3}
                                className="w-full p-3.5 border border-gray-200 rounded-2xl text-xs focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 bg-slate-50/30 resize-none transition-all leading-relaxed"
                            />
                        </div>

                        {/* Nhóm nút điều hướng xác nhận dưới chân Modal */}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsReviewModalOpen(false);
                                    setReviewComment("");
                                    setRating(5);
                                }}
                                className="w-1/3 border border-gray-200 py-3 rounded-xl font-bold text-xs text-gray-500 hover:bg-gray-50 transition-colors"
                            >
                                Để sau
                            </button>
                            <button
                                type="button"
                                onClick={handleReviewSubmit}
                                disabled={isSubmittingReview}
                                className="w-2/3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-3 rounded-xl font-bold text-xs shadow-md shadow-orange-500/10 hover:shadow-lg transition-all flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmittingReview ? "Đang gửi..." : "Gửi đánh giá công khai"}
                            </button>
                        </div>

                    </div>
                </div>
            )}
            {/* ==================== MODAL LÝ DO HỦY ĐƠN HÀNG ==================== */}
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

                        <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-left text-xs text-gray-500 mb-4">
                            {/* Kiểm tra nếu là COD hoặc Chờ thanh toán */}
                            {(currentPaymentMethod.toUpperCase() === "COD" || order.status === "Chờ thanh toán") ? (
                                <p>ℹ️ Đơn hàng chưa được thanh toán thành công hoặc áp dụng COD. Bạn có thể hủy trực tiếp không mất phí.</p>
                            ) : (
                                <p className="text-amber-600 font-medium">⚠️ Đơn hàng đã thanh toán qua {currentPaymentMethod}. Sau khi hủy, hệ thống sẽ chuyển sang luồng <strong>Chờ hoàn tiền</strong> để Admin đối soát bưu cục duyệt.</p>
                            )}
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