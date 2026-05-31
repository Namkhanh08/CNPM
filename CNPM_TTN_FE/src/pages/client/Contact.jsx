import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Dữ liệu liên hệ:", formData);
        alert("Cảm ơn bạn! Thông tin liên hệ đã được gửi đi thành công.");
        setFormData({ name: '', email: '', message: '' });
    };

    const contactInfos = [
        {
            icon: <MapPin size={24} className="text-accent-1" />,
            title: "Địa chỉ",
            details: [
                "1. Số 236, Hoàng Quốc Việt, Cầu Giấy, Hà Nội",
                "2. Tầng 4 Phòng 416 Học viện Kỹ thuật quân sự, Cầu Giấy, Hà Nội"
            ]
        },
        {
            icon: <Phone size={24} className="text-accent-1" />,
            title: "Điện thoại",
            details: ["+84 999 99 99 99"]
        },
        {
            icon: <Mail size={24} className="text-accent-1" />,
            title: "Email",
            details: ["Revocoffe2005@gmail.com"]
        },
        {
            icon: <Clock size={24} className="text-accent-1" />,
            title: "Giờ mở cửa",
            details: ["Thứ 2 - Thứ 6", "7:00 AM - 10:00 PM"]
        }
    ];

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
                        <p className="text-accent-1 font-nunito font-bold tracking-[0.2em] uppercase mb-4">Kết nối</p>
                        <h1 className="font-nunito font-bold text-4xl md:text-5xl text-amber-950 tracking-wide uppercase">
                            LIÊN HỆ VỚI CHÚNG TÔI
                        </h1>
                    </div>

                    {/* Grid hiển thị 4 cột thông tin */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {contactInfos.map((info, idx) => (
                            <div
                                key={idx}
                                className="bg-white rounded-3xl shadow-sm p-6 border border-amber-900/5 flex flex-col items-center text-center transition-all duration-300 hover:shadow-md group"
                            >
                                <div className="w-12 h-12 bg-amber-950/5 rounded-full flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                                    {info.icon}
                                </div>
                                <h3 className="font-montserrat font-bold text-lg text-amber-950 mb-3">
                                    {info.title}
                                </h3>
                                <div className="space-y-1 font-nunito text-sm text-amber-900/80">
                                    {info.details.map((line, i) => (
                                        <p key={i}>{line}</p>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Bản đồ Google Maps Học viện Kỹ thuật quân sự */}
                    <div className="w-full h-96 rounded-3xl overflow-hidden shadow-sm border border-amber-900/5 mb-12">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.6496356066223!2d105.78206977596956!3d21.046700187158756!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab3453df997d%3A0xed49f3e498c0b56d!2zSHbhu41jIHZp4buHbiBL4bu5IHRodeG6rXQgUXXDom4gc+G7sQ!5e0!3m2!1svi!2s!4v1716636000000!5m2!1svi!2s"
                            className="w-full h-full border-0"
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Học viện Kỹ thuật quân sự"
                        ></iframe>
                    </div>

                    {/* Form Liên hệ */}
                    <div className="bg-white rounded-[40px] shadow-md p-8 md:p-12 max-w-3xl mx-auto border border-amber-900/5">
                        <h2 className="font-montserrat font-bold text-2xl text-amber-950 mb-8 text-center uppercase tracking-wide">
                            Gửi tin nhắn cho chúng tôi
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6 font-nunito">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="name" className="font-bold text-sm text-amber-900/90">
                                        Họ và tên
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Tên của bạn"
                                        required
                                        className="w-full px-5 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent-1 focus:ring-2 focus:ring-accent-1/10 bg-stone-50/55 transition-all"
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="email" className="font-bold text-sm text-amber-900/90">
                                        Địa chỉ Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Email của bạn"
                                        required
                                        className="w-full px-5 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent-1 focus:ring-2 focus:ring-accent-1/10 bg-stone-50/55 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="message" className="font-bold text-sm text-amber-900/90">
                                    Lời nhắn
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows="5"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Lời nhắn gửi tới Revo Coffee..."
                                    required
                                    className="w-full px-5 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent-1 focus:ring-2 focus:ring-accent-1/10 bg-stone-50/55 transition-all resize-none"
                                ></textarea>
                            </div>

                            <div className="text-center pt-2">
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-amber-950 hover:bg-accent-1 text-white font-bold rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:scale-95 uppercase text-sm tracking-wider"
                                >
                                    <Send size={16} />
                                    Gửi liên hệ
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}
