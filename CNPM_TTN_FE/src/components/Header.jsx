import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Slider from "react-slick";

import useStore from '../store/useStore';

import cartIcon from '../assets/img/header/cart-icon.svg';
import coffe from '../assets/img/header/cc2.png';
import coffe2 from '../assets/img/header/cc3.png';
import coffe3 from '../assets/img/header/cc7.png';

import LoginModal from "../components/LoginModal";

import { FaShoppingBag } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";
import { FaFacebookF } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function Header() {

  const totalItems = useStore((state) => state.getTotalQuantity());

  const [openLogin, setOpenLogin] = useState(false);

  const user = useStore((state) => state.user);

  const logout = useStore((state) => state.logout);

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

            <div
              className="
                h-[calc(100vh-80px)]
                flex items-center
                px-6 md:px-12 lg:px-20
                bg-white font-nunito
              "
            >

              <div
                className="
                  max-w-7xl
                  mx-auto
                  w-full
                  grid
                  lg:grid-cols-2
                  items-center
                  gap-16
                "
              >

                {/* LEFT */}
                <div>

                  <h1
                    className="
                      font-nunito
                      text-5xl
                      md:text-7xl
                      xl:text-[82px]
                      font-bold
                      leading-[1]
                      text-primary
                      mb-8 font-nunito
                    "
                  >
                    {item.title}
                  </h1>

                  <p
                    className="
                      font-nunito
                      text-lg
                      text-gray-600
                      leading-relaxed
                      max-w-xl
                      mb-10
                      text-justify
                    "
                  >
                    {item.desc}
                  </p>

                  {/* BUTTONS */}
                  <div className="flex flex-wrap gap-4">

                    <Link
                      to="/shop"
                      className="
                        bg-primary
                        text-white
                        font-bold
                        py-4 px-10
                        rounded-full
                        hover:bg-accent-1
                        shadow-2xl hover:-translate-y-1 transition-all duration-300 hover:scale-110
                      "
                    >
                      XEM SẢN PHẨM
                    </Link>

                    <button
                      className="
                        bg-accent-1
                        px-5 py-5
                        rounded-2xl
                        text-white text-xl
                        hover:bg-primary
                        hover:scale-110
                        transition-all duration-300
                      "
                    >
                      <FaFacebookF />
                    </button>

                    <button
                      className="
                        bg-accent-1
                        px-5 py-5
                        rounded-2xl
                        text-white text-xl
                        hover:bg-primary
                        hover:scale-110
                        transition-all duration-300
                      "
                    >
                      <FaInstagram />
                    </button>

                    <button
                      className="
                        bg-accent-1
                        px-5 py-5
                        rounded-2xl
                        text-white text-xl
                        hover:bg-primary
                        hover:scale-110
                        transition-all duration-300
                      "
                    >
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
                      className="
                        relative
                        h-[650px]
                        w-full
                        object-contain
                        transition-all duration-700
                        drop-shadow-[10px_10px_20px_rgba(0,0,0,0.45)] hover:scale-110
                      "
                    />

                    {/* FLOAT BUTTON */}
                    <button
                      className="
                        absolute top-24 left-0
                        px-6 py-4
                        rounded-full
                        bg-accent-1
                        font-bold
                        font-nunito
                        text-white
                        shadow-2xl
                        hover:bg-primary
                        hover:scale-105
                        transition-all duration-300 hover:-translate-y-1
                      "
                    >
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