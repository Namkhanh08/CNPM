import React from 'react';
import logo from '../assets/img/header/logo.svg';

export default function Footer() {
  return (
    <footer className="bg-dark-gray text-white pt-10 pb-10">
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="lg:col-span-2">
            <img src={logo} alt="REVO Coffee Logo" className="h-32 w-32 mb-8 filter brightness-0 invert" />
            <p className="font-nunito text-pinky-gray/70 max-w-md leading-relaxed mb-8">
              REVO Coffee tự hào mang đến những hạt cà phê hảo hạng nhất, được chọn lọc và rang xay thủ công với niềm đam mê bất tận để tạo nên hương vị nguyên bản khó quên cho mỗi trải nghiệm thưởng thức của bạn.
            </p>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/nam.khanh.237840" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent-1 transition-colors">
                <span className="font-bold">FB</span>
              </a>
              <a href="https://www.facebook.com/nam.khanh.237840" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent-1 transition-colors">
                <span className="font-bold">IG</span>
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-montserrat font-bold text-lg mb-6 uppercase text-accent-1 tracking-wider">Về chúng tôi</h4>
            <ul className="font-nunito text-pinky-gray/70 space-y-4">
              <li><a href="#" className="hover:text-accent-1 hover:translate-x-1 inline-block transition-transform">Câu chuyện REVO</a></li>
              <li><a href="#" className="hover:text-accent-1 hover:translate-x-1 inline-block transition-transform">Sản phẩm cà phê</a></li>
              <li><a href="#" className="hover:text-accent-1 hover:translate-x-1 inline-block transition-transform">Hệ thống cửa hàng</a></li>
              <li><a href="#" className="hover:text-accent-1 hover:translate-x-1 inline-block transition-transform">Tuyển dụng</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-montserrat font-bold text-lg mb-6 uppercase text-accent-1 tracking-wider">Liên hệ</h4>
            <ul className="font-nunito text-pinky-gray/70 space-y-4">
              <li className="flex items-start gap-3">
                <span className="font-bold text-white min-w-[60px]">Email:</span>
                <a href="mailto:hi@revocoffee.com" className="hover:text-accent-1 transition-colors">hi@revocoffee.com</a>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-white min-w-[60px]">Hotline:</span>
                <a href="tel:19001234" className="hover:text-accent-1 transition-colors">1900 1234</a>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-white min-w-[60px]">Địa chỉ:</span>
                <span className="leading-relaxed">236 Hoàng Quốc Việt, Bắc Từ Liêm, Hà Nội, Việt Nam</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4">
          <p className="font-nunito text-sm text-pinky-gray/50">
            &copy; {new Date().getFullYear()} Revo Coffee. All rights reserved. Designed with passion.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-pinky-gray/50 font-nunito">
            <a href="#" className="hover:text-accent-1 transition-colors">Chính sách bảo mật</a>
            <a href="#" className="hover:text-accent-1 transition-colors">Điều khoản dịch vụ</a>
            <a href="#" className="hover:text-accent-1 transition-colors">Chính sách đổi trả</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
