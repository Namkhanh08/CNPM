import React, { useState } from 'react';
import { ShieldCheck, Truck, RotateCcw, FileText, CheckCircle2 } from 'lucide-react';

export default function Policy() {
    const [activeTab, setActiveTab] = useState('shipping');

    const policies = {
        shipping: {
            title: "Chính sách vận chuyển & giao nhận",
            icon: <Truck size={28} className="text-accent-1" />,
            content: (
                <div className="space-y-6 text-amber-900/80 leading-relaxed font-nunito">
                    <p className="font-semibold text-amber-950 text-lg">Revo Coffee cam kết mang những hạt cà phê tươi mới nhất tới tận tay bạn với dịch vụ nhanh chóng.</p>
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <CheckCircle2 className="text-accent-1 shrink-0 mt-1" size={18} />
                            <div>
                                <h4 className="font-bold text-amber-950">Phạm vi giao hàng:</h4>
                                <p>Giao hàng toàn quốc thông qua các đối tác vận chuyển uy tín (Giao Hàng Nhanh, Viettel Post, v.v.).</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <CheckCircle2 className="text-accent-1 shrink-0 mt-1" size={18} />
                            <div>
                                <h4 className="font-bold text-amber-950">Thời gian nhận hàng:</h4>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Nội thành Hà Nội: Nhận hàng trong vòng 4 - 24 giờ kể từ khi xác nhận đơn.</li>
                                    <li>Các tỉnh/thành phố khác: Nhận hàng từ 2 - 4 ngày làm việc.</li>
                                </ul>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <CheckCircle2 className="text-accent-1 shrink-0 mt-1" size={18} />
                            <div>
                                <h4 className="font-bold text-amber-950">Phí vận chuyển:</h4>
                                <p>Đồng giá 30.000đ cho mọi đơn hàng dưới 500.000đ. Miễn phí vận chuyển cho toàn bộ đơn hàng từ 500.000đ trở lên hoặc các gói đăng ký định kỳ (Subscription).</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        return: {
            title: "Chính sách đổi trả & hoàn tiền",
            icon: <RotateCcw size={28} className="text-accent-1" />,
            content: (
                <div className="space-y-6 text-amber-900/80 leading-relaxed font-nunito">
                    <p className="font-semibold text-amber-950 text-lg">Sự hài lòng của khách hàng đối với hương vị cà phê Revo là ưu tiên hàng đầu của chúng tôi.</p>
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <CheckCircle2 className="text-accent-1 shrink-0 mt-1" size={18} />
                            <div>
                                <h4 className="font-bold text-amber-950">Điều kiện đổi trả:</h4>
                                <p>Trong vòng 7 ngày kể từ khi nhận sản phẩm, khách hàng có quyền yêu cầu đổi trả nếu bao bì bị rách hỏng do vận chuyển, giao sai loại sản phẩm, hoặc cà phê có dấu hiệu ẩm mốc, giảm chất lượng trước hạn sử dụng.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <CheckCircle2 className="text-accent-1 shrink-0 mt-1" size={18} />
                            <div>
                                <h4 className="font-bold text-amber-950">Quy trình đổi trả:</h4>
                                <p>Liên hệ hotline: <strong>+84 999 99 99 99</strong> hoặc gửi email về địa chỉ <strong>Revocoffe2005@gmail.com</strong> đính kèm hình ảnh/video khui hàng. Chúng tôi sẽ tiến hành gửi lại sản phẩm mới hoàn toàn miễn phí hoặc hoàn tiền 100% qua tài khoản ngân hàng trong vòng 3 ngày làm việc.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        privacy: {
            title: "Chính sách bảo mật thông tin",
            icon: <ShieldCheck size={28} className="text-accent-1" />,
            content: (
                <div className="space-y-6 text-amber-900/80 leading-relaxed font-nunito">
                    <p className="font-semibold text-amber-950 text-lg">Revo Coffee tôn trọng và cam kết bảo vệ tối đa quyền riêng tư của bạn.</p>
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <CheckCircle2 className="text-accent-1 shrink-0 mt-1" size={18} />
                            <div>
                                <h4 className="font-bold text-amber-950">Mục đích thu thập:</h4>
                                <p>Chúng tôi chỉ thu thập các thông tin cơ bản (họ tên, số điện thoại, địa chỉ, email) nhằm phục vụ trực tiếp cho việc xử lý đơn hàng, giao nhận và cung cấp dịch vụ chăm sóc khách hàng cá nhân hóa.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <CheckCircle2 className="text-accent-1 shrink-0 mt-1" size={18} />
                            <div>
                                <h4 className="font-bold text-amber-950">Bảo mật dữ liệu:</h4>
                                <p>Dữ liệu cá nhân của khách hàng được mã hóa an toàn trên hệ thống máy chủ bảo mật của Revo Coffee. Cam kết không chia sẻ, mua bán hay tiết lộ bất kỳ thông tin nào cho bên thứ ba ngoại trừ mục đích phục vụ vận chuyển giao hàng.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        terms: {
            title: "Điều khoản & Quy định chung",
            icon: <FileText size={28} className="text-accent-1" />,
            content: (
                <div className="space-y-6 text-amber-900/80 leading-relaxed font-nunito">
                    <p className="font-semibold text-amber-950 text-lg">Chào mừng bạn đến với hệ thống đặt hàng trực tuyến của Revo Coffee.</p>
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <CheckCircle2 className="text-accent-1 shrink-0 mt-1" size={18} />
                            <div>
                                <h4 className="font-bold text-amber-950">Chấp thuận điều khoản:</h4>
                                <p>Bằng việc truy cập website và đặt hàng, bạn đồng ý tuân thủ các quy định về giá cả hiển thị, cung cấp thông tin giao nhận chính xác và thực hiện nghĩa vụ thanh toán đơn hàng đúng hạn.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <CheckCircle2 className="text-accent-1 shrink-0 mt-1" size={18} />
                            <div>
                                <h4 className="font-bold text-amber-950">Bản quyền hình ảnh & thương hiệu:</h4>
                                <p>Toàn bộ tài nguyên hình ảnh, nội dung giới thiệu sản phẩm và công thức cà phê độc quyền trên website đều thuộc sở hữu của Revo Coffee. Mọi hành vi sao chép thương mại khi chưa được đồng ý đều bị nghiêm cấm.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    };

    return (
        <div className="bg-[#f4f1ea] min-h-screen py-24 pb-20 relative overflow-hidden">
            {/* Lớp phủ SVG Noise tạo độ nhám giấy mộc */}
            <div 
                className="absolute inset-0 opacity-[0.12] pointer-events-none mix-blend-multiply"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paperNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paperNoise)'/%3E%3C/svg%3E")`
                }}
            />

            <div className="container mx-auto px-4 md:px-8 max-w-5xl relative z-10">
                <div className="w-full">
                    {/* Tiêu đề trang */}
                    <div className="text-center mb-12">
                        <p className="text-accent-1 font-nunito font-bold tracking-[0.2em] uppercase mb-4">Điều khoản</p>
                        <h1 className="font-nunito font-bold text-4xl md:text-5xl text-amber-950 tracking-wide uppercase">
                            CHÍNH SÁCH & ĐIỀU KHOẢN
                        </h1>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                        {/* SIDEBAR TABS */}
                        <div className="md:col-span-4 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible gap-2 pb-4 md:pb-0 scrollbar-none font-montserrat">
                            <button
                                onClick={() => setActiveTab('shipping')}
                                className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-bold text-sm tracking-wide transition-all whitespace-nowrap md:w-full active:scale-98 ${
                                    activeTab === 'shipping'
                                        ? 'bg-amber-950 text-white shadow-md'
                                        : 'bg-white text-amber-950/80 hover:bg-stone-50 border border-amber-900/5'
                                }`}
                            >
                                <Truck size={18} />
                                <span>VẬN CHUYỂN</span>
                            </button>
                            
                            <button
                                onClick={() => setActiveTab('return')}
                                className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-bold text-sm tracking-wide transition-all whitespace-nowrap md:w-full active:scale-98 ${
                                    activeTab === 'return'
                                        ? 'bg-amber-950 text-white shadow-md'
                                        : 'bg-white text-amber-950/80 hover:bg-stone-50 border border-amber-900/5'
                                }`}
                            >
                                <RotateCcw size={18} />
                                <span>ĐỔI TRẢ & HOÀN TIỀN</span>
                            </button>

                            <button
                                onClick={() => setActiveTab('privacy')}
                                className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-bold text-sm tracking-wide transition-all whitespace-nowrap md:w-full active:scale-98 ${
                                    activeTab === 'privacy'
                                        ? 'bg-amber-950 text-white shadow-md'
                                        : 'bg-white text-amber-950/80 hover:bg-stone-50 border border-amber-900/5'
                                }`}
                            >
                                <ShieldCheck size={18} />
                                <span>BẢO MẬT THÔNG TIN</span>
                            </button>

                            <button
                                onClick={() => setActiveTab('terms')}
                                className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-bold text-sm tracking-wide transition-all whitespace-nowrap md:w-full active:scale-98 ${
                                    activeTab === 'terms'
                                        ? 'bg-amber-950 text-white shadow-md'
                                        : 'bg-white text-amber-950/80 hover:bg-stone-50 border border-amber-900/5'
                                }`}
                            >
                                <FileText size={18} />
                                <span>ĐIỀU KHOẢN CHUNG</span>
                            </button>
                        </div>

                        {/* CONTENT AREA */}
                        <div className="md:col-span-8 bg-white rounded-[40px] shadow-md p-8 md:p-12 border border-amber-900/5 min-h-[400px] flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-4 border-b border-amber-900/5 pb-6 mb-8">
                                    <div className="w-14 h-14 bg-amber-950/5 rounded-full flex items-center justify-center">
                                        {policies[activeTab].icon}
                                    </div>
                                    <h2 className="font-montserrat font-black text-2xl text-amber-950 uppercase tracking-wide">
                                        {policies[activeTab].title}
                                    </h2>
                                </div>
                                {policies[activeTab].content}
                            </div>

                            <div className="border-t border-amber-900/5 pt-8 mt-10 text-center font-nunito text-xs text-amber-900/50">
                                Mọi thắc mắc xin vui lòng gửi tin nhắn tại trang <a href="/contact" className="text-accent-1 font-semibold underline hover:text-amber-950 transition-colors">Liên hệ</a> để được phản hồi trong vòng 24 giờ.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}