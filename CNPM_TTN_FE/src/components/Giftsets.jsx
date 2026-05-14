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
    altitude: 'Độ cao: 800 - 1000m',
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
  };

  return (
    <section
      id="giftset"
      className="py-24 bg-white relative overflow-hidden"
    >
      <div className="container mx-auto px-6 lg:px-12 max-w-1xl">

        {/* HEADER */}
        <div className="text-center mb-16">

          <p
            className="
              text-accent-1
              font-nunito
              font-bold
              tracking-[0.2em]
              uppercase
              mb-4
            "
          >
            Món quà từ trái tim
          </p>

          <h2
            className="
              text-4xl
              md:text-5xl
              font-nunito
              font-bold
              text-primary
              mb-4
            "
          >
            SET QUÀ TẶNG THƯỢNG HẠNG
          </h2>

          <p
            className="
              font-nunito
              text-primary/70
              leading-relaxed
              max-w-2xl
              mx-auto
            "
          >
            Trọn bộ quà tặng tinh tế và đẳng cấp từ Revo Coffee.
            Sự lựa chọn hoàn hảo để dành tặng đối tác,
            khách hàng hoặc những người thân yêu.
          </p>
        </div>

        {/* SLIDER */}
        <Slider {...settings}>

          {giftsets.map((set) => (

            <div key={set.id} className="p-4">

              {/* CARD */}
              <div
                className="
                  bg-white
                  rounded-[40px]
                  overflow-hidden border
                  hover:shadow-2xl
                  transition-all duration-500
                  hover:-translate-y-2
                  group
                "
              >

                {/* IMAGE */}
                <div
                  className="
                    bg-pinky-gray
                    flex justify-center items-center
                    p-10
                    relative
                    overflow-hidden
                  "
                >

                  <div
                    className="
                      absolute inset-0
                      bg-primary/5
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
                      drop-shadow-2xl
                      group-hover:scale-105
                      transition-transform duration-500
                      relative z-10
                    "
                  />
                </div>

                {/* CONTENT */}
                <div className="p-8 text-center">

                  <h3
                    className="
                      font-montserrat
                      font-black
                      text-3xl
                      text-primary
                      mb-4
                    "
                  >
                    {set.name}
                  </h3>

                  <p
                    className="
                      font-nunito
                      text-primary/70
                      italic
                      leading-relaxed
                      mb-8
                    "
                  >
                    {set.desc}
                  </p>

                  {/* INFO */}
                  <div className="space-y-4 mb-8">

                    <div className="flex items-center justify-center gap-3">

                      <img
                        src={coffeeBeansIcon}
                        alt="Coffee Beans"
                        className="w-5 h-5"
                      />

                      <span className="font-nunito text-primary">
                        {set.coffeeTypes}
                      </span>
                    </div>

                    <div className="flex items-center justify-center gap-3">

                      <img
                        src={mountainIcon}
                        alt="Mountain"
                        className="w-5 h-5"
                      />

                      <span className="font-nunito text-primary">
                        {set.altitude}
                      </span>
                    </div>
                  </div>

                  {/* BOTTOM */}
                  <div className="flex items-center justify-between">

                    <span
                      className="
                        font-montserrat
                        font-black
                        text-3xl
                        text-accent-1
                      "
                    >
                      {set.price}đ
                    </span>

                    <button
                      onClick={() => handleAddGiftset(set)}
                      className="
                        bg-primary
                        hover:bg-accent-1
                        text-white
                        font-bold
                        py-3 px-6
                        rounded-full
                        shadow-lg
                        hover:shadow-2xl
                        transition-all duration-300
                        hover:scale-105
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