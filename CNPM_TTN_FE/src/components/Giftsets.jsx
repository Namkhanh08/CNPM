import React from 'react';
import giftset1Img from '../assets/img/section3/giftset1Img.png';
import giftset2Img from '../assets/img/section3/giftset2Img.png';
import giftset3Img from '../assets/img/section3/giftset3Img.png';
import coffeeBeansIcon from '../assets/img/section3/coffeeBeansIcon.svg';
import mountainIcon from '../assets/img/section3/mountainIcon.svg';
import useStore from '../store/useStore';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const giftsets = [
  {
    id: 1,
    name: 'GIFTSET 1',
    price: '285.000',
    desc: 'Món quà tuyệt vời dành cho người sành cà phê',
    coffeeTypes: 'Loại hạt: Fine Robusta Blend',
    altitude: 'Độ cao: 700 - 800m',
    image: giftset1Img
  },
  {
    id: 2,
    name: 'GIFTSET 2',
    price: '305.000',
    desc: 'Dành tặng cho những ai yêu thích hương vị đậm đà',
    coffeeTypes: 'Loại hạt: 100% Robusta Honey',
    altitude: 'Độ cao: 800 - 1000m',
    image: giftset2Img
  },
  {
    id: 3,
    name: 'GIFTSET 3',
    price: '345.000',
    desc: 'Trải nghiệm đỉnh cao từ dòng Arabica thượng hạng',
    coffeeTypes: 'Loại hạt: 100% Arabica Cầu Đất',
    altitude: 'Độ cao: > 1500m',
    image: giftset3Img
  },
  {
    id: 4,
    name: 'GIFTSET 1',
    price: '285.000',
    desc: 'Món quà tuyệt vời dành cho người sành cà phê',
    coffeeTypes: 'Loại hạt: Fine Robusta Blend',
    altitude: 'Độ cao: 700 - 800m',
    image: giftset1Img
  },
  {
    id: 5,
    name: 'GIFTSET 2',
    price: '305.000',
    desc: 'Dành tặng cho những ai yêu thích hương vị đậm đà',
    coffeeTypes: 'Loại hạt: 100% Robusta Honey',
    altitude: 'Đ0̣ cao: 800 - 1000m',
    image: giftset2Img
  },
  {
    id: 6,
    name: 'GIFTSET 3',
    price: '345.000',
    desc: 'Trải nghiệm đỉnh cao từ dòng Arabica thượng hạng',
    coffeeTypes: 'Loại hạt: 100% Arabica Cầu Đất',
    altitude: 'Độ cao: > 1500m',
    image: giftset3Img
  }
];

export default function Giftsets() {
  const addToCart = useStore((state) => state.addToCart);

  const handleAddGiftset = (set) => {
    addToCart(
      {
        id: `giftset-${set.id}`,
        name: set.name,
        price: parseInt(set.price.replace('.', '')),
        image: set.image,
        grindType: 'Hộp Quà'
      },
      1,
      'Hộp Quà'
    );
    alert(`Đã thêm ${set.name} vào giỏ hàng!`);
  };

  const settings = {
    dots: true,
    arrows: false,
    infinite: true,
    speed: 800,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    cssEase: "ease-in-out",
    pauseOnHover: true,
    // Thêm responsive để slider mượt mà trên cả điện thoại/máy tính bảng
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        }
      }
    ]
  };

  return (
    /* THAY ĐỔI 1: Thay đổi nền bg-white thành đồng bộ màu nền giấy kem mộc `#f4f1ea` giống Features */
    <section
      id="giftset"
      className="py-24 bg-[#f4f1ea] relative overflow-hidden"
    >
      {/* THAY ĐỔI 2: Chèn lớp phủ SVG tạo độ nhám xơ của bề mặt bìa giấy giấy */}
      <div 
        className="absolute inset-0 opacity-[0.12] pointer-events-none mix-blend-multiply z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paperNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paperNoise)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Container chính cần để relative z-10 để nội dung luôn đè lên trên lớp nhám */}
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl relative z-10">

        {/* HEADER */}
        <div className="text-center mb-16">
          <p className="text-accent-1 font-nunito font-bold tracking-[0.2em] uppercase mb-4">
            Món quà từ trái tim
          </p>

          {/* THAY ĐỔI 3: Đổi màu text tiêu đề sang màu nâu đất trầm sang trọng text-amber-950 */}
          <h2 className="text-4xl md:text-5xl font-nunito font-bold text-amber-950 mb-4 tracking-wide">
            SET QUÀ TẶNG THƯỢNG HẠNG
          </h2>

          <p className="font-nunito text-amber-900/80 leading-relaxed max-w-2xl mx-auto font-medium">
            Trọn bộ quà tặng tinh tế và đẳng cấp từ Revo Coffee.
            Sự lựa chọn hoàn hảo để dành tặng đối tác,
            khách hàng hoặc những người thân yêu.
          </p>
        </div>

        {/* SLIDER */}
        <Slider {...settings} className="giftset-slider">
          {giftsets.map((set) => (
            <div key={set.id} className="p-4">

              {/* CARD */}
              {/* THAY ĐỔI 4: Đổi border nhẹ nhàng hơn để tiệp vào nền giấy và hiệu ứng bóng đổ mịn màng */}
              <div
                className="
                  bg-white
                  rounded-[40px]
                  overflow-hidden 
                  border border-amber-900/5
                  shadow-[0_10px_30px_rgba(139,92,26,0.04)]
                  hover:shadow-[0_20px_40px_rgba(139,92,26,0.1)]
                  transition-all duration-500
                  hover:-translate-y-2
                  group
                "
              >
                {/* IMAGE */}
                {/* THAY ĐỔI 5: Đổi màu nền bọc ảnh từ pinky-gray cũ sang tông xám kem nhạt mix-blend để tôn sản phẩm */}
                <div
                  className="
                    bg-stone-100/80
                    flex justify-center items-center
                    p-10
                    relative
                    overflow-hidden
                  "
                >
                  <div
                    className="
                      absolute inset-0
                      bg-amber-950/5
                      opacity-0
                      group-hover:opacity-100
                      transition-opacity duration-500
                    "
                  ></div>

                  <img
                    src={set.image}
                    alt={set.name}
                    className="
                      h-[220px]
                      object-contain
                      drop-shadow-[0_10px_15px_rgba(0,0,0,0.15)]
                      group-hover:scale-105
                      transition-transform duration-500
                      relative z-10
                    "
                  />
                </div>

                {/* CONTENT */}
                <div className="p-8 text-center">
                  
                  {/* THAY ĐỔI 6: Đồng bộ toàn bộ chữ thông tin thẻ Card sang tông nâu Amber mềm mại */}
                  <h3 className="font-montserrat font-black text-3xl text-amber-950 mb-4 tracking-tight">
                    {set.name}
                  </h3>

                  <p className="font-nunito text-amber-900/70 italic leading-relaxed mb-8 min-h-[48px]">
                    {set.desc}
                  </p>

                  {/* INFO */}
                  <div className="space-y-4 mb-8 border-y border-amber-900/5 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <img
                        src={coffeeBeansIcon}
                        alt="Coffee Beans"
                        className="w-5 h-5 opacity-80"
                      />
                      <span className="font-nunito text-amber-900/90 font-medium">
                        {set.coffeeTypes}
                      </span>
                    </div>

                    <div className="flex items-center justify-center gap-3">
                      <img
                        src={mountainIcon}
                        alt="Mountain"
                        className="w-5 h-5 opacity-80"
                      />
                      <span className="font-nunito text-amber-900/90 font-medium">
                        {set.altitude}
                      </span>
                    </div>
                  </div>

                  {/* BOTTOM */}
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-montserrat font-black text-2xl text-accent-1">
                      {set.price}đ
                    </span>

                    {/* THAY ĐỔI 7: Đổi màu nút mặc định từ primary cũ sang màu nâu đất ấm áp bg-amber-950 */}
                    <button
                      onClick={() => handleAddGiftset(set)}
                      className="
                        bg-amber-950
                        hover:bg-accent-1
                        text-white
                        font-bold
                        text-xs
                        tracking-wider
                        py-3.5 px-6
                        rounded-full
                        shadow-md
                        hover:shadow-xl
                        transition-all duration-300
                        hover:scale-105
                        uppercase
                      "
                    >
                      CHỌN MUA
                    </button>
                  </div>

                </div>
              </div>

            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
}