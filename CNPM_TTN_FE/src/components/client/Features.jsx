import React from 'react';
import icon1 from '../../assets/img/section1/icon1.svg';
import icon2 from '../../assets/img/section1/icon2.svg';
import icon3 from '../../assets/img/section1/icon3.svg';
import icon4 from '../../assets/img/section1/icon4.svg';

const features = [
  { 
    id: 1, 
    title: 'Nguồn gốc', 
    desc: 'Những hạt cà phê ngon nhất từ nguồn gốc rõ ràng, tuyển chọn kĩ lưỡng.', 
    icon: icon1 
  },
  { 
    id: 2, 
    title: 'Chất lượng', 
    desc: 'Từng hạt được tinh tuyển và phân loại cẩn thận đạt chuẩn xuất khẩu.', 
    icon: icon2 
  },
  { 
    id: 3, 
    title: 'Các loại hạt', 
    desc: '70% hạt Robusta mang vị đắng ngọt dịu, 30% Arabica tạo hương thơm chua thanh.', 
    icon: icon3 
  },
  { 
    id: 4, 
    title: 'Pha chế', 
    desc: 'Bí quyết rang xay tạo nên tách cà phê với hương vị trọn vẹn đặc trưng.', 
    icon: icon4 
  }
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white relative">
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
        <div className="text-center mb-16">
          <p className="text-accent-1 font-nunito font-bold tracking-[0.2em] uppercase mb-4">Câu chuyện của chúng tôi</p>
          <h2 className="text-4xl md:text-5xl font-nunito font-black text-primary uppercase">TẠI SAO LẠI CHỌN <br className="md:hidden"/> <span className="text-accent-1">REVO Coffee</span></h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div 
              key={feature.id} 
              className="flex flex-col items-center text-center p-8 bg-white border border-[#edf0f5] rounded-3xl transition-all duration-300 hover:shadow-[0_20px_40px_rgba(65,81,103,0.06)] hover:-translate-y-1 group"
            >
              <div className="mb-6 h-16 w-16 flex items-center justify-center bg-[#f9f5e8] rounded-2xl group-hover:scale-105 transition-transform duration-300">
                <img src={feature.icon} alt={feature.title} className="h-8 w-8 object-contain" />
              </div>
              <h3 className="font-montserrat font-bold text-xl text-primary mb-3 uppercase tracking-wide">{feature.title}</h3>
              <p className="font-nunito text-primary/80 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
