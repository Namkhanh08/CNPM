import React from 'react';
// Import bức ảnh ly cà phê hoặc gói sản phẩm đẹp nhất của bạn ở đây
import coffeeMain from '../assets/img/header/revo1.png'; 

export default function CoffeeStory() {
  return (
    <section
      id="coffee-story"
      className="py-28 bg-white relative overflow-hidden"
    >
      <div className="container mx-auto px-6 lg:px-16 max-w-6xl relative z-10">
        
        {/* LƯỚI HAI CỘT ĐỨNG YÊN TỐI GIẢN */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          
          {/* CỘT TRÁI: HÌNH ẢNH NỔI BẬT TRÊN NỀN TRẮNG (Chiếm 5/12 cột) */}
          <div className="lg:col-span-5 flex justify-center relative">
            <div className="w-full max-w-[340px] md:max-w-[450px] aspect-square flex items-center justify-center relative group">
              
              {/* Ảnh ly cà phê tách nền sắc nét */}
              <img
                src={coffeeMain}
                alt="Revo Coffee Original"
                className="h-[300px] md:h-[450px] object-contain drop-shadow-[10px_20px_35px_rgba(0,0,0,0.4)] group-hover:scale-105 transition-transform duration-500 z-10"
              />
              
              {/* Bóng đổ chân thực tinh tế */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-44 h-4 bg-black/[0.03] rounded-full blur-lg z-0"></div>
            </div>
          </div>

          {/* CỘT PHẢI: NỘI DUNG CÂU CHUYỆN (Chiếm 7/12 cột) */}
          <div className="lg:col-span-7 font-nunito text-left">
            <span className="text-[#8c4f2b] font-bold tracking-[0.25em] uppercase text-xs block mb-3">
              Hành trình hạt cà phê Revo
            </span>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-nunito font-bold text-primary mb-8 leading-tight uppercase tracking-tight">
              Giọt Đắng Khởi Đầu <br />
              <span className="text-[#8c4f2b] font-light italic lowercase">vị</span> Đậm Nghệ Thuật
            </h2>

            {/* NỘI DUNG CÂU CHUYỆN */}
            <div className="space-y-6 text-gray-600 text-base md:text-lg leading-relaxed font-light text-justify">
              <p>
                Tại <strong className="font-semibold text-black">REVO Coffee</strong>, chúng tôi không định nghĩa cà phê bằng những chiếc máy pha công nghiệp vội vã, mà gói gọn nó trong hai chữ: <span className="italic text-[#8c4f2b] font-medium">"Kiên nhẫn"</span>.
              </p>
              
              <p>
                Mỗi hạt cà phê chảy qua tách nước của bạn hôm nay đều bắt đầu từ hành trình băng qua những sườn đồi lộng gió tại đất ngàn mây LangBiang. Chúng được hái tay thủ công khi vừa chín mọng đỏ, trải qua hàng trăm giờ ủ men tự nhiên để đánh thức tầng hương tinh túy nhất của đất trời trước khi bước vào công đoạn rang củi mộc mạc.
              </p>

              {/* Khối trích dẫn tối giản trên nền trắng */}
              <blockquote className="border-l-4 border-black pl-5 my-8 text-black font-medium italic text-lg bg-gray-50 py-4 pr-4 rounded-r-xl">
                "Có những ngày ví tiền thật mỏng, nhưng nỗi lòng thì lại quá dày. Đó là lúc bạn cần một ngụm đắng đủ đậm để cân bằng lại thế giới."
              </blockquote>

              <p>
                Nằm sâu trong lòng phố thị, REVO là nơi dừng chân của những tâm hồn tìm kiếm sự yên ả. Không ồn ào phô diễn, chỉ có tiếng hạt xay lách tách, hương thơm nồng nàn lan tỏa và một ly cà phê nguyên bản đủ đậm sâu để bạn nhớ mãi không quên.
              </p>
            </div>

            {/* NÚT BẤM ĐEN/TRẮNG CHUẨN LOOKBOOK */}
            <div className="mt-10">
              <a
                href="/shop"
                className="inline-block bg-accent-1 hover:bg-[#8c4f2b] text-white text-xs font-nunito font-bold tracking-widest uppercase px-8 py-4 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform active:scale-95"
              >
                Khám phá menu thưởng thức
              </a>
            </div>
          </div>

        </div>
        
      </div>
    </section>
  );
}