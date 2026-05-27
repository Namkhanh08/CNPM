import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Copy, ArrowRight, CreditCard } from 'lucide-react';
import vietinBank from '../assets/img/header/vietinbank.png';
import QR from '../assets/img/header/qr.png';
import { BsQrCode } from "react-icons/bs";

// IMPORT FILE CẤU HÌNH API CỦA BẠN
// Lưu ý: Kiểm tra lại đường dẫn (.. hoặc ../..) sao cho đúng với cấu trúc thư mục thực tế của bạn
import API from '../services/api.js';

export default function PaymentPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Lấy tổng tiền truyền từ trang Checkout sang, nếu không có thì mặc định hoặc fetch từ API
    const amount = location.state?.amount || 0;

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Thông tin tài khoản ngân hàng của cửa hàng
    const bankInfo = {
        name: "VietinBank iPay (VB)",
        accountNumber: "103880585979",
        accountName: "VU NAM KHANH",
        memo: `REVO${orderId}` // Nội dung chuyển khoản bắt buộc chứa mã đơn hàng
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        alert(`Đã sao chép: ${text}`);
    };

    // Hàm xử lý khi người dùng bấm nút "Tôi đã thanh toán"
    const handleConfirmPayment = async () => {
        setIsSubmitting(true);
        try {
            // SỬA: Gọi qua hàm updateOrderStatus đã được định nghĩa trong file API của bạn
            // Hàm này tự xử lý: endpoint `/orders/${id}/status`, đính params và port 5126
            const response = await API.updateOrderStatus(orderId, "Đã thanh toán");

            if (response.data) {
                alert('Hệ thống đã ghi nhận yêu cầu. Đang chuyển hướng về chi tiết đơn hàng!');
                navigate(`/orders/${orderId}`);
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái thanh toán:", error);
            alert('Có lỗi xảy ra khi cập nhật đơn hàng. Vui lòng thử lại!');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white min-h-screen py-12 font-nunito">
            <div className="container mx-auto px-6 max-w-6xl">

                <div className="grid grid-cols-1 md:grid-cols-10 gap-8 items-start">

                    {/* CỘT BÊN TRÁI: Chiếm 6 phần */}
                    <div className="md:col-span-6 bg-white rounded-[32px] shadow-xl p-8 md:p-10 border border-gray-100">

                        {/* Header trang thanh toán */}
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                                <CreditCard className="text-amber-800" size={32} />
                            </div>
                            <h1 className="font-nunito font-bold text-2xl text-primary mb-2">CỔNG THANH TOÁN REVO</h1>
                            <p className="text-primary/60 text-sm">Đơn hàng <span className="font-bold text-primary">#{orderId}</span> đang được giữ. Vui lòng thanh toán để hoàn tất.</p>
                        </div>

                        {/* Hiển thị số tiền nổi bật */}
                        <div className="bg-red-50 text-center py-5 rounded-2xl mb-8 border border-red-100">
                            <p className="text-xs text-red-800/70 font-nunito font-bold uppercase tracking-wider mb-1">Số tiền cần thanh toán</p>
                            <p className="font-montserrat font-black text-3xl text-red-600">{amount.toLocaleString('vi-VN')}đ</p>
                        </div>

                        {/* Khu vực thông tin chuyển khoản */}
                        <div className="space-y-4 mb-8">
                            <h3 className="font-montserrat font-bold text-primary text-base border-b border-gray-100 pb-2">Thông tin tài khoản</h3>

                            <div className="space-y-3">
                                {/* Ngân hàng */}
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                    <div>
                                        <p className="text-xs text-primary/50">Ngân hàng</p>
                                        <p className="font-bold text-primary text-sm flex justify-between items-center gap-2 pt-2">
                                            <img src={vietinBank} className='w-5 h-5' alt="VietinBank" />
                                            {bankInfo.name}
                                        </p>
                                    </div>
                                </div>

                                {/* Số tài khoản */}
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                    <div>
                                        <p className="text-xs text-primary/50">Số tài khoản</p>
                                        <p className="font-mono font-bold text-primary text-base">{bankInfo.accountNumber}</p>
                                    </div>
                                    <button onClick={() => handleCopy(bankInfo.accountNumber)} className="text-primary hover:text-accent-1 p-2 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center gap-1 text-xs font-bold">
                                        <Copy size={14} /> SAO CHÉP
                                    </button>
                                </div>

                                {/* Tên chủ tài khoản */}
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                    <div>
                                        <p className="text-xs text-primary/50">Chủ tài khoản</p>
                                        <p className="font-bold text-primary text-sm uppercase">{bankInfo.accountName}</p>
                                    </div>
                                </div>

                                {/* Nội dung chuyển khoản */}
                                <div className="flex justify-between items-center p-3 bg-amber-50 rounded-xl border border-amber-200">
                                    <div>
                                        <p className="text-xs text-amber-800/70 font-semibold">Nội dung chuyển khoản (Ghi chính xác)</p>
                                        <p className="font-mono font-black text-amber-900 text-lg">{bankInfo.memo}</p>
                                    </div>
                                    <button onClick={() => handleCopy(bankInfo.memo)} className="text-amber-900 hover:bg-amber-200 p-2 bg-white rounded-lg shadow-sm border border-amber-300 flex items-center gap-1 text-xs font-bold">
                                        <Copy size={14} /> SAO CHÉP
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Hướng dẫn và Lưu ý */}
                        <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 mb-8 text-left text-xs text-blue-900/80 space-y-1">
                            <p className="font-bold text-blue-900">💡 Hướng dẫn các bước:</p>
                            <p>1. Mở ứng dụng ngân hàng của bạn và thực hiện chuyển khoản đến thông tin trên.</p>
                            <p>2. Điền chính xác nội dung chuyển khoản là <span className="font-bold font-mono">{bankInfo.memo}</span>.</p>
                            <p>3. Sau khi chuyển tiền thành công trên ứng dụng ngân hàng, hãy bấm vào nút <span className="font-bold">"Tôi đã thanh toán"</span> bên dưới.</p>
                        </div>

                        {/* Cụm nút bấm xác nhận hành động */}
                        <div className="space-y-3">
                            <button
                                onClick={() => handleConfirmPayment()}
                                disabled={isSubmitting}
                                className="w-full bg-primary text-white font-bold py-4 rounded-full text-lg hover:bg-accent-1 shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSubmitting ? 'ĐANG XỬ LÝ...' : 'TÔI ĐÃ THANH TOÁN'}
                                <CheckCircle size={20} />
                            </button>

                            <button
                                onClick={() => navigate('/orders')}
                                className="w-full bg-transparent text-primary/60 hover:text-primary font-semibold py-2 text-sm flex items-center justify-center gap-1"
                            >
                                Thanh toán sau (Quay lại Đơn hàng) <ArrowRight size={14} />
                            </button>
                        </div>

                    </div>

                    {/* CỘT BÊN PHẢI: Chiếm 4 phần */}
                    <div className="hidden md:block md:col-span-4 shadow-2xl rounded-4xl p-10 bg-white border border-gray-50">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                                <BsQrCode className="text-amber-800" size={32} />
                            </div>
                            <h1 className="font-nunito font-bold text-2xl text-primary mb-2"> HOẶC QUÉT MÃ QR CODE</h1>
                            <img src={QR} className='rounded-2xl pt-2 w-full object-cover shadow-sm' alt="QR Code" />
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}