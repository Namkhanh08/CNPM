import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function CoffeeStory() {
  
  // GIỮ NGUYÊN HOÀN TOÀN HỆ THỐNG ANIMATION ANCHOR CỦA BẠN
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.18, 
      },
    },
  };

  const textVariants = {
    hidden: { opacity: 0, x: 40, scale: 0.98 },
    visible: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 60, damping: 20, duration: 0.8 } 
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, x: -60, rotate: -3, scale: 0.9 },
    visible: { 
      opacity: 1, 
      x: 0, 
      rotate: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 45, damping: 18, duration: 0.9 } 
    },
  };

  return (
    <section
      id="coffee-story" 
      className="py-28 sm:py-36 bg-[#faf9f6] relative overflow-hidden"
    >
      {/* Lớp phủ ánh sáng tơ lụa kỹ thuật số tăng chiều sâu cho không gian */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] rounded-full bg-accent-1/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-20 max-w-7xl relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          
          {/* CỘT TRÁI: HÌNH ẢNH CONCEPTUAL & THE CARD BUNG RA THEO TRỤC CUỘN MÀN HÌNH */}
          <div className="lg:col-span-5 flex justify-center relative">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.3 }}
              variants={imageVariants}
              className="w-full max-w-[380px] md:max-w-[440px] aspect-[4/5] relative group"
            >
              {/* Khung ảnh chính: Editorial Studio Minimalist (Không dùng ảnh ly cốc đại trà) */}
              <div className="absolute inset-0 rounded-[32px] overflow-hidden bg-primary/10 border border-primary/5 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.12)]">
                <img
                  src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop" 
                  alt="Revo Premium Concept"
                  className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-out"
                />
              </div>

              {/* Thẻ Tab Thông số Kính mờ (Floating Luxury Info Card) bay lơ lửng tương tác */}
              <motion.div 
                whileHover={{ y: -6, scale: 1.02 }}
                className="absolute -bottom-6 -right-6 md:-right-8 bg-white/80 backdrop-blur-xl border border-accent-1/20 p-6 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.08)] max-w-[220px] text-left hidden sm:block z-20"
              >
                <span className="text-[10px] tracking-widest text-accent-1 font-bold uppercase block mb-1">Single Origin</span>
                <h4 className="text-primary font-black text-lg leading-tight mb-2">LangBiang 1650m</h4>
                <p className="text-xs text-primary/60 font-light leading-relaxed">
                  100% hạt Arabica thượng hạng được lên men đa tầng sinh học.
                </p>
              </motion.div>
              
              {/* Vòng bezel mảnh mạ vàng xước ẩn hiện nghệ thuật */}
              <div className="absolute -inset-4 border border-accent-1/10 rounded-[38px] -z-10 pointer-events-none scale-95 group-hover:scale-100 transition-transform duration-700" />
            </motion.div>
          </div>

          {/* CỘT PHẢI: TOÀN BỘ CHỮ NHẢY RA TUẦN TỰ MƯỢT MÀ */}
          <motion.div 
            className="lg:col-span-7 text-left"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            variants={containerVariants}
          >
            <motion.span 
              variants={textVariants}
              className="text-accent-1 font-bold tracking-[0.35em] uppercase text-[11px] block mb-5 bg-accent-1/10 w-fit px-4 py-1.5 rounded-full"
            >
              The Art of Micro-Batch Roasting
            </motion.span>
            
            <motion.h2 
              variants={textVariants}
              className="text-4xl sm:text-5xl xl:text-6xl font-black text-primary mb-8 leading-[1.12] tracking-tight uppercase"
            >
              Giọt Đắng Khởi Đầu <br />
              <span className="text-accent-1 font-light italic lowercase normal-case font-serif tracking-normal">vị</span> Đậm Nghệ Thuật
            </motion.h2>

            {/* Nội dung chữ tinh chỉnh khoảng cách thoáng đạt (Airy Layout) */}
            <div className="space-y-6 text-primary/70 text-base md:text-lg leading-relaxed text-justify font-light tracking-wide">
              <motion.p variants={textVariants}>
                Tại <strong className="font-bold text-primary">REVO Atelier</strong>, chúng tôi từ chối định nghĩa cà phê thông qua những dây chuyền công nghiệp vội vã. Chúng tôi nâng niu thức uống này như một tôn giáo của sự <span className="italic text-accent-1 font-medium">"Kiên nhẫn tối thượng"</span>.
              </motion.p>
              
              <motion.p variants={textVariants}>
                Mỗi giọt tinh chất chạm vào vị giác của bạn hôm nay đều sở hữu một bản hồ sơ lý lịch đặc biệt từ vùng đất ngàn mây LangBiang. Được hái chọn lọc bằng tay khi đạt độ chín mọng hoàn hảo, trải qua hàng trăm giờ ủ men tự nhiên trong môi trường kiểm soát nghiêm ngặt trước khi được rang củi mộc bản bởi những nghệ nhân lành nghề nhất.
              </motion.p>

              {/* Khối trích dẫn phong cách tạp chí thời trang (Premium Blockquote) */}
              <motion.div variants={textVariants} className="relative my-10 py-1">
                <blockquote className="border-l-[3px] border-accent-1 pl-6 text-primary font-medium italic text-lg sm:text-xl bg-gradient-to-r from-accent-1/5 to-transparent py-5 pr-6 rounded-r-2xl backdrop-blur-xs">
                  "Xa xỉ không nằm ở nhãn mác đắt đỏ. Xa xỉ là khi giữa lòng phố thị xô bồ, bạn sẵn sàng dành ra một giờ đồng hồ tĩnh lặng chỉ để đợi chờ một dòng chảy nguyên bản lắng đọng."
                </blockquote>
              </motion.div>

              <motion.p variants={textVariants}>
                Nằm ẩn mình tách biệt, REVO không phô diễn ồn ào. Ở đây chỉ có tiếng hạt xay lách tách đồng điệu, hương thơm tinh dầu tự nhiên lan tỏa và những ly cà phê mang chiều sâu di sản khiến tâm hồn bạn phải dừng lại ngắm nhìn.
              </motion.p>
            </div>

            {/* NÚT BẤM HIỆN ĐẠI BUNG RA CUỐI LUỒNG */}
            <motion.div variants={textVariants} className="mt-12">
              <Link
                to="/shop"
                className="relative inline-flex items-center justify-center bg-primary text-white text-xs font-bold tracking-[0.25em] uppercase px-10 py-4.5 rounded-full shadow-xl hover:shadow-accent-1/10 transition-all duration-350 transform hover:-translate-y-1 active:translate-y-0 group overflow-hidden"
              >
                {/* Hiệu ứng Liquid fill độc quyền */}
                <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-accent-1 rounded-full group-hover:w-80 group-hover:h-80" />
                <span className="relative z-10">Khám phá bộ sưu tập vị</span>
              </Link>
            </motion.div>
          </motion.div>

        </div>
        
      </div>
    </section>
  );
}