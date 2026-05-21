import React from 'react';
import coffe from '../assets/img/header/cc2.png';

export default function NewLetter() {
  // TÓM TẮT THAY ĐỔI: Sử dụng Multiple Backgrounds trong CSS để xếp chồng cốc cafe lên trên lớp vân giấy nhám
  const backgroundStyle = {
    backgroundImage: `
      url(${coffe}),
      url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paperNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paperNoise)'/%3E%3C/svg%3E")
    `,
    backgroundRepeat: "no-repeat, repeat",
    backgroundSize: "contain, auto",
    backgroundPosition: "right 135px center, center center",
    backgroundColor: "#f4f1ea", // Đồng bộ màu nền ngà kem của hệ thống
  };

  return (
    <section 
      className="relative overflow-hidden border-t border-amber-900/5"
      style={backgroundStyle}
    >
      {/* Thêm một lớp mix-blend để phần vân giấy hòa trộn mượt mà với màu nền */}
      <div className="absolute inset-0 bg-multiply pointer-events-none opacity-[0.12] z-0"></div>

      {/* Sửa lỗi chính tả 'containe' thành 'container' của bản gốc để căn giữa chuẩn */}
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
          
          {/* TEXT SECTION */}
          {/* Đổi text-center thành lg:text-left để khi lên màn hình lớn, chữ một bên, cốc cafe một bên rất đẹp */}
          <div className="space-y-4 text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl font-nunito font-bold text-amber-950 tracking-wide">
              Sẵn sàng bắt đầu?
            </h2>
            <p className="font-nunito text-amber-900/80 font-medium max-w-md mx-auto lg:mx-0">
              Đăng ký để nhận những thông tin ưu đãi và câu chuyện cà phê mới nhất từ REVO Coffee.
            </p>
          </div>

          {/* INPUT SECTION */}
          <div className="flex justify-center lg:justify-start items-center">
            <div className="flex w-full max-w-md shadow-md hover:shadow-lg transition-shadow duration-300 rounded-xl overflow-hidden">
              <input
                type="email"
                placeholder="Điền email của bạn..."
                className="w-full px-5 py-3.5 focus:outline-none text-amber-950 bg-white placeholder-amber-900/40 font-nunito font-medium text-sm border border-r-0 border-amber-900/10 rounded-l-xl"
              />
              <button className="bg-amber-950 hover:bg-accent-1 text-white font-bold text-xs tracking-wider px-7 py-3.5 transition-colors duration-300 rounded-r-xl uppercase whitespace-nowrap">
                Bắt đầu
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}