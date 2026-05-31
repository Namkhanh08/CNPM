import React from 'react';
import { Link } from 'react-router-dom';
import Slider from "react-slick";

import coffe from '../../assets/img/header/cc2.png';
import coffe2 from '../../assets/img/header/cc3.png';
import coffe3 from '../../assets/img/header/cc7.png';

import { FaFacebookF } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function Header() {
  // HERO DATA
  const heroData = [
    {
      id: 1,
      title: (
        <>
          <div>TRẢI NGHIỆM <span className='text-accent-1'>CÀ PHÊ</span> ĐÍCH THỰC</div>
        </>
      ),
      desc: (
        <>
          Khám phá hương vị cà phê đích thực, được rang xay thủ công và pha chế bằng{" "}
          <span className="text-primary font-nunito">
            sự đam mê
          </span>{" "}
          để mang lại{" "}
          <span className="text-accent-1 font-nunito">
            trải nghiệm hoàn hảo nhất
          </span>{" "}
          dành riêng cho bạn.
        </>
      ),
      image: coffe,
    },

    {
      id: 2,
      title: (
        <>
          <div>KHÔNG GIAN <span className='text-accent-1'>ĐẬM CHẤT</span> REVO</div>
        </>
      ),
      desc: (
        <>
          REVO Coffee không chỉ là nơi thưởng thức cà phê mà còn là{" "}
          <span className="text-primary font-nunito">
            không gian thư giãn
          </span>
          , kết nối và tận hưởng từng{" "}
          <span className="text-accent-1 font-nunito">
            khoảnh khắc đáng nhớ
          </span>.
        </>
      ),
      image: coffe2,
    },

    {
      id: 3,
      title: (
        <>
          <div><span className='text-accent-1'>CHẤT LƯỢNG</span> TỪNG HẠT CÀ PHÊ</div>
        </>
      ),
      desc: (
        <>
          Từng hạt cà phê được tuyển chọn kỹ lưỡng từ những vùng nguyên liệu{" "}
          <span className="text-primary font-nunito">
            chất lượng cao
          </span>{" "}
          để tạo nên{" "}
          <span className="text-accent-1 font-nunito">
            hương vị khác biệt
          </span>.
        </>
      ),
      image: coffe3,
    },
  ];

  // SLIDER SETTINGS
  const settings = {
    dots: false,
    arrows: false,
    infinite: true,

    speed: 1000,

    slidesToShow: 1,
    slidesToScroll: 1,

    autoplay: true,
    autoplaySpeed: 4000,

    pauseOnHover: true,

    cssEase: "ease-in-out",
  };

  return (
    <header className="relative w-full min-h-screen bg-white">
      {/* HERO SLIDER */}
      <Slider {...settings}>

        {heroData.map((item) => (

          <div key={item.id}>
            <div className="min-h-[calc(100dvh-72px)] lg:min-h-[calc(100dvh-80px)] flex items-center px-6 md:px-12 lg:px-20 bg-white font-nunito py-12 lg:py-0">
              <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 items-center gap-12 lg:gap-16">
                
                {/* LEFT */}
                <div>
                  <h1 className="font-nunito text-4xl md:text-6xl xl:text-[72px] font-black leading-[1.1] text-primary mb-6">
                    {item.title}
                  </h1>

                  <p className="font-nunito text-base md:text-lg text-gray-600 leading-relaxed max-w-xl mb-8 text-justify">
                    {item.desc}
                  </p>

                  {/* BUTTONS */}
                  <div className="flex flex-wrap items-center gap-4">
                    <Link
                      to="/shop"
                      className="bg-primary !text-white font-bold py-4 px-10 rounded-full hover:bg-accent-1 shadow-lg hover:shadow-xl active:scale-95 hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <span className="text-white">XEM SẢN PHẨM</span>
                    </Link>

                    <button className="bg-accent-1 w-12 h-12 rounded-full text-white text-lg flex items-center justify-center hover:bg-primary hover:-translate-y-0.5 active:scale-90 transition-all duration-300 shadow-md hover:shadow-lg">
                      <FaFacebookF />
                    </button>

                    <button className="bg-accent-1 w-12 h-12 rounded-full text-white text-lg flex items-center justify-center hover:bg-primary hover:-translate-y-0.5 active:scale-90 transition-all duration-300 shadow-md hover:shadow-lg">
                      <FaInstagram />
                    </button>

                    <button className="bg-accent-1 w-12 h-12 rounded-full text-white text-lg flex items-center justify-center hover:bg-primary hover:-translate-y-0.5 active:scale-90 transition-all duration-300 shadow-md hover:shadow-lg">
                      <FaTwitter />
                    </button>
                  </div>
                </div>

                {/* RIGHT IMAGE */}
                <div className="flex justify-center lg:justify-end">
                  <div className="relative">
                    <img
                      src={item.image}
                      alt="Coffee"
                      className="relative h-[350px] md:h-[500px] lg:h-[550px] w-full object-contain transition-all duration-500 drop-shadow-[0_20px_50px_rgba(65,81,103,0.22)] hover:scale-[1.03]"
                    />

                    {/* FLOAT BUTTON */}
                    <button className="absolute top-16 left-0 lg:top-24 px-5 py-3 rounded-full bg-accent-1 font-bold font-nunito text-xs md:text-sm text-white shadow-lg hover:shadow-xl hover:bg-primary hover:scale-105 active:scale-95 transition-all duration-300 hover:-translate-y-0.5">
                      Đặt hàng ngay!
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        ))}
      </Slider>
    </header>
  );
}
