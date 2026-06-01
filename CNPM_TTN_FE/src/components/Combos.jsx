import React from 'react';
// Thay thế bằng ảnh mọi người đang hái cà phê của bạn
import coffeeHarvest from '../assets/img/header/cc.png';

export default function CoffeeStory() {
  return (
    <section
      id="coffee-story"
      className="py-24 bg-white relative overflow-hidden"
    >
      <div className="container mx-auto px-6 lg:px-16 max-w-6xl relative z-10">

        {/* LƯỚI HAI CỘT: TRÁI CHỮ - PHẢI ẢNH */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* CỘT TRÁI: NỘI DUNG CÂU CHUYỆN (Chiếm 7/12 cột) */}
          <div className="lg:col-span-7 font-nunito text-left">
            <span className="text-[#8c4f2b] font-bold tracking-[0.25em] uppercase text-xs block mb-3">
              Hành trình hạt cà phê Revo
            </span>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-8 leading-tight">
              Giọt Đắng Khởi Đầu <br />
              <span className="text-[#8c4f2b] font-light italic lowercase">vị</span> Đậm Nghệ Thuật
            </h2>

            {/* Đoạn văn miêu tả ngắn gọn */}
            <div className="text-gray-600 text-base md:text-lg leading-relaxed font-light mb-8 space-y-4 text-justify">
              <p>
                Tại <strong className="font-semibold text-black">REVO Coffee</strong>, chúng tôi không định nghĩa cà phê bằng những chiếc máy pha công nghiệp vội vã, mà gói gọn nó trong hai chữ: <span className="italic text-[#8c4f2b] font-medium">"Kiên nhẫn"</span>.
              </p>
              <p>
                Mỗi hạt cà phê chảy qua tách nước của bạn hôm nay đều bắt đầu từ hành trình băng qua những sườn đồi lộng gió tại đất ngàn mây LangBiang. Chúng được hái tay thủ công khi vừa chín mọng đỏ, trải qua hàng trăm giờ ủ men tự nhiên để đánh thức tầng hương tinh túy nhất của đất trời.
              </p>
            </div>

            {/* Khối trích dẫn tối giản trên nền trắng */}

            <blockquote className="border-l-4 border-black pl-5 my-8 text-black font-medium italic text-lg bg-gray-50 py-4 pr-4 rounded-r-xl">

              "Có những ngày ví tiền thật mỏng, nhưng nỗi lòng thì lại quá dày. Đó là lúc bạn cần một ngụm đắng đủ đậm để cân bằng lại thế giới."

            </blockquote>

            {/* KHỐI THÔNG TIN ĐỊA CHỈ & HOTLINE (Giống hệt cấu trúc ảnh mẫu) */}
            <div className="space-y-4 mb-10 text-sm md:text-base text-gray-800 font-medium">
              {/* Địa chỉ */}
              <div className="flex items-start gap-3">
                <span className="text-[#8c4f2b] text-xl mt-0.5">📍</span>
                <div>
                  <p><strong className="text-black">CS1:</strong> Số 236 Hoàng Quốc Việt, Cầu Giấy, Hà Nội</p>
                  <p><strong className="text-black">CS2:</strong> Tầng 4 Học viện Kỹ thuật quân sự, Hoàng Quốc Việt, Cầu Giấy, Hà Nội</p>
                </div>
              </div>

              {/* Hotline */}
              <div className="flex items-center gap-3">
                <span className="text-[#8c4f2b] text-xl">📞</span>
                <p className="font-semibold text-black">+84 999 99 99 99</p>
              </div>
            </div>

            {/* NHÓM HAI NÚT BẤM (Bo tròn trịa chuẩn style ảnh mẫu) */}
            <div className="flex flex-wrap gap-4">
              <a
                href="/about"
                className="inline-block bg-[#1a1a1a] hover:bg-[#8c4f2b] text-white text-sm font-bold px-10 py-4 rounded-full shadow-md transition-all duration-300 transform active:scale-95"
              >
                Tìm hiểu thêm
              </a>
              <a
                href="/shop"
                className="inline-block bg-[#8c4f2b] hover:bg-black text-white text-sm font-bold px-10 py-4 rounded-full shadow-md transition-all duration-300 transform active:scale-95"
              >
                Menu
              </a>
            </div>
          </div>

          {/* CỘT PHẢI: HÌNH ẢNH KHUNG ĐẶC BIỆT + HUY HIỆU NĂM (Chiếm 5/12 cột) */}
          <div className="lg:col-span-5 flex justify-center relative">

            {/* Khung ảnh uốn lượn bất đối xứng (Blob style tương tự ảnh mẫu) */}
            <div className="w-full max-w-[420px] aspect-[4/5] md:aspect-[5/6] lg:aspect-[4/5] overflow-hidden shadow-xl bg-gray-100 group transition-all duration-500 hover:shadow-2xl
              style-blob-frame"
              style={{ borderRadius: '42% 58% 40% 60% / 45% 45% 55% 55%' }}
            >
              <img
                src={coffeeHarvest}
                alt="Hái cà phê tại nông trại Revo"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* HUY HIỆU "SINCE 1946" ĐÈ LÊN MÉP TRÁI CỦA ẢNH */}
            <div className="absolute -left-6 top-8 bg-white border border-dashed border-[#8c4f2b] w-28 h-28 rounded-full flex flex-col items-center justify-center shadow-lg z-20">
              <span className="text-gray-500 text-xs tracking-wider uppercase font-medium">since</span>
              <span className="text-[#8c4f2b] text-2xl font-bold font-serif leading-none mt-0.5">2005</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}