import React, { useState } from 'react';
// TÓM TẮT THAY ĐỔI: Thay đổi Link thành NavLink để sử dụng tính năng active state
import { Link, NavLink } from 'react-router-dom';
import useStore from '../store/useStore';
import LoginModal from "../components/LoginModal";

import cartIcon from '../assets/img/header/cart-icon.svg';
import { IoIosArrowBack } from "react-icons/io";
import vn from '../assets/img/header/vn.jpg';
import logo from '../assets/img/header/logo2.png';
import coffeeCup from '../assets/img/header/revo4.png';

import {
  FaShoppingBag,
  FaUserCircle,
  FaFacebookF,
  FaInstagram,
  FaTwitter
} from "react-icons/fa";

export default function Header() {
  const totalItems = useStore((state) => state.getTotalQuantity());
  const totalOrders = useStore((state) => state.getTotalQuantityOrder());
  const user = useStore((state) => state.user);
  const logout = useStore((state) => state.logout);

  const [openLogin, setOpenLogin] = useState(false);

  // Hàm helper quản lý class màu sắc: Nếu active thì đổi màu vàng cam, ngược lại màu trắng khi hover mới đổi
  const getMenuClass = ({ isActive }) =>
    isActive
      ? "text-accent-1 flex items-center justify-center transition-colors duration-300"
      : "text-white hover:text-accent-1 flex items-center justify-center transition-colors duration-300";

  return (
    <header className="relative w-full min-h-screen bg-black overflow-hidden">

      {/* KHU VỰC CSS ANIMATION KHÓI */}
      <style>{`
            @keyframes smokeFloat1 {
              0% {
                transform: translate(-50%, 0) scale(0.6) rotate(0deg);
                opacity: 0;
                filter: blur(6px);
              }

              15% {
                opacity: 0.9;
              }

              40% {
                transform: translate(-60%, -80px) scale(1.2) rotate(-8deg);
                opacity: 0.55;
                filter: blur(12px);
              }

              70% {
                transform: translate(-40%, -180px) scale(1.8) rotate(12deg);
                opacity: 0.18;
                filter: blur(20px);
              }

              100% {
                transform: translate(-50%, -280px) scale(2.4) rotate(18deg);
                opacity: 0;
                filter: blur(30px);
              }
            }

            @keyframes smokeFloat2 {
              0% {
                transform: translate(-50%, 0) scale(0.5) rotate(0deg);
                opacity: 0;
                filter: blur(4px);
              }

              20% {
                opacity: 0.85;
              }

              50% {
                transform: translate(-30%, -110px) scale(1.5) rotate(10deg);
                opacity: 0.45;
                filter: blur(16px);
              }

              80% {
                transform: translate(-60%, -220px) scale(2) rotate(-10deg);
                opacity: 0.12;
                filter: blur(24px);
              }

              100% {
                transform: translate(-50%, -320px) scale(2.8) rotate(20deg);
                opacity: 0;
                filter: blur(34px);
              }
            }

            @keyframes smokeFloat3 {
              0% {
                transform: translate(-50%, 0) scale(0.4);
                opacity: 0;
                filter: blur(5px);
              }

              25% {
                opacity: 0.7;
              }

              60% {
                transform: translate(-70%, -140px) scale(1.7);
                opacity: 0.3;
                filter: blur(18px);
              }

              100% {
                transform: translate(-50%, -300px) scale(2.5);
                opacity: 0;
                filter: blur(32px);
              }
            }

            .smoke {
              position: absolute;
              bottom: 0;
              left: 50%;
              border-radius: 9999px;
              background: radial-gradient(
                circle,
                rgba(255,255,255,0.55) 0%,
                rgba(255,255,255,0.18) 40%,
                rgba(255,255,255,0) 75%
              );

              mix-blend-mode: screen;
            }

            .smoke-1 {
              width: 90px;
              height: 180px;
              animation: smokeFloat1 7s infinite ease-out;
            }

            .smoke-2 {
              width: 120px;
              height: 220px;
              animation: smokeFloat2 8s infinite ease-out;
              animation-delay: 1.5s;
            }

            .smoke-3 {
              width: 100px;
              height: 200px;
              animation: smokeFloat3 6s infinite ease-out;
              animation-delay: 3s;
            }

            .smoke-4 {
              width: 140px;
              height: 240px;
              animation: smokeFloat1 9s infinite ease-out;
              animation-delay: 2s;
              opacity: 0.6;
            }
      `}</style>

      {/* NAVBAR */}
      <nav className="font-nunito absolute top-0 left-0 z-50 w-full flex flex-col items-center px-8 lg:px-16 py-5 text-white">
        {/* TOP */}
        <div className="w-full flex items-center justify-between gap-4">
          {/* LEFT */}
          <div className="flex-1 flex items-center gap-4">
            <h1 className="text-sm tracking-widest text-white/70">Follow us</h1>
            <a href="#" className="border rounded-full p-3 border-accent-1 text-accent-1 hover:bg-accent-1 hover:text-white hover:scale-105 transition-all duration-300">
              <FaFacebookF size={16} />
            </a>
            <a href="#" className="border rounded-full p-3 border-accent-1 text-accent-1 hover:bg-accent-1 hover:text-white hover:scale-105 transition-all duration-300">
              <FaInstagram size={16} />
            </a>
            <a href="#" className="border rounded-full p-3 border-accent-1 text-accent-1 hover:bg-accent-1 hover:text-white hover:scale-105 transition-all duration-300">
              <FaTwitter size={16} />
            </a>
          </div>

          {/* LOGO */}
          <div className="flex-1 flex justify-center">
            <Link to="/">
              <img src={logo} className='w-65 h-40' alt="Logo" />
            </Link>
          </div>

          {/* RIGHT */}
          <div className="flex-1 flex justify-end items-center gap-4">
            {/* ORDERS */}
            <Link to="/orders" className="relative w-11 h-11 rounded-full border border-white/20 flex items-center justify-center hover:bg-accent-1 hover:scale-110 transition-all duration-300">
              <FaShoppingBag className="text-white text-base" />
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent-1 text-white text-[10px] font-bold flex items-center justify-center">
                {totalOrders > 99 ? "99+" : totalOrders}
              </span>
            </Link>

            {/* CART */}
            <Link to="/cart" className="relative w-11 h-11 rounded-full border border-white/20 flex items-center justify-center hover:bg-accent-1 hover:scale-110 transition-all duration-300">
              <img src={cartIcon} alt="Cart" className="w-4 h-4 brightness-0 invert" />
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent-1 text-white text-[10px] font-bold flex items-center justify-center">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            </Link>

            {/* USER */}
            {user ? (
              <div className="relative group flex items-center gap-3">
                <div className="flex items-center gap-2 cursor-pointer">
                  <div className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center hover:bg-accent-1 hover:scale-110 transition-all duration-300">
                    <FaUserCircle className="text-white text-xl" />
                  </div>
                  <span className="hidden md:block text-white font-semibold text-xs">
                    {user.name || user.username || "User"}
                  </span>
                </div>

                {/* DROPDOWN */}
                <div className="absolute -right-2 top-12 w-44 bg-zinc-900 border border-white/10 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden text-sm text-center">
                  <Link to="/profile" className="block px-4 py-3 hover:bg-zinc-800">Hồ sơ</Link>
                  <Link to="/orders" className="block px-4 py-3 hover:bg-zinc-800">Đơn hàng</Link>
                  <button onClick={logout} className="w-full px-4 py-3 text-red-400 hover:bg-zinc-800 border-t border-white/10 text-center">
                    Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setOpenLogin(true)} className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center hover:bg-accent-1 hover:scale-110 transition-all duration-300">
                <FaUserCircle className="text-white text-xl" />
              </button>
            )}
          </div>
        </div>

        {/* THAY ĐỔI CHÍNH Ở ĐÂY: MENU TỰ ĐỔI MÀU Dựa VÀO NAVLINK */}
        <div className="w-full flex justify-center mt-3">
          <ul className="flex items-center gap-10 font-bold font-nunito text-xs tracking-[0.2em] uppercase text-white">

            <li>
              {/* Thêm thuộc tính end để chỉ nhận active khi chính xác là đường dẫn "/" */}
              <NavLink to="/" end className={getMenuClass}>
                Trang chủ <IoIosArrowBack size={12} className='text-accent-1 ml-1 rotate-270' />
              </NavLink>
            </li>

            <li>
              <NavLink to="/shop" className={getMenuClass}>
                Sản phẩm <IoIosArrowBack size={12} className='text-accent-1 ml-1 rotate-270' />
              </NavLink>
            </li>

            <li>
              <NavLink to="/subscription" className={getMenuClass}>
                Đăng ký định kỳ <IoIosArrowBack size={12} className='text-accent-1 ml-1 rotate-270' />
              </NavLink>
            </li>

            <li>
              <NavLink to="/contact" className={getMenuClass}>
                Liên hệ <IoIosArrowBack size={12} className='text-accent-1 ml-1 rotate-270' />
              </NavLink>
            </li>

            <li>
              <NavLink to="/policy" className={getMenuClass}>
                Chính sách <IoIosArrowBack size={12} className='text-accent-1 ml-1 rotate-270' />
              </NavLink>
            </li>

            <li>
              <Link to="/policy" className="hover:text-accent-1 flex items-center justify-center">
                <img src={vn} className='w-7 h-5' alt="VN" />
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div
        className="w-full min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center px-6 md:px-12 pt-48 pb-20"
        style={{
          backgroundImage: `
            linear-gradient(
              to bottom,
              rgba(0,0,0,0.6),
              rgba(0,0,0,0.75)
            ),
            url('https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=1961&auto=format&fit=crop')
          `
        }}
      >
        {/* CONTENT */}
        <div className="max-w-4xl text-center text-white flex flex-col items-center pt-30">

          <style>
            {`@import url('https://fonts.googleapis.com/css2?family=Allura&family=Great+Vibes&family=Pacifico&family=Roboto+Condensed:ital,wght@0,100..900;1,100..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap');`}
          </style>

          <h1
            style={{ fontFamily: '"Pacifico", cursive' }}
            className="text-6xl md:text-7xl xl:text-8xl text-accent-1 text-center font-normal tracking-wide pb-20"
          >
            Đủ Đậm Để Nhớ
          </h1>

          {/* Giữ nguyên các phần bên dưới của bạn */}
          <h2 className='font-nunito font-bold text-white text-5xl pb-6'>
            Nơi chữa lành ví tiền nhưng làm đầy tâm trạng
          </h2>

          <p className="text-base md:text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto mb-5">
            REVO Coffe nằm khiêm nhường sâu trong một con ngõ nhỏ 234 Hoàng Quốc Việt, thuộc khu Bắc Từ Liêm. Quán có thể khó tìm, nhưng những trải nghiệm mà bạn có được rất xứng đáng để bỏ công tìm kiếm.
          </p>

          {/* CỐC CÀ PHÊ & HIỆU ỨNG KHÓI BỐC LÊN */}
          <div className="relative transition-transform duration-500 hover:scale-105 flex justify-center">
            <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 w-[520px] h-[420px] pointer-events-none z-20">
              <div className="smoke smoke-1"></div>
              <div className="smoke smoke-2"></div>
              <div className="smoke smoke-3"></div>
              <div className="smoke smoke-4"></div>
              <div className="smoke smoke-5"></div>
              <div className="smoke smoke-6"></div>
            </div>

            <img
              src={coffeeCup}
              alt="Coffee Cup"
              className="w-180 h-180 object-contain drop-shadow-[0_25px_45px_rgba(0,0,0,0.8)] animate-[float_4s_ease-in-out_infinite]"
            />
          </div>
        </div>
      </div>

      <LoginModal isOpen={openLogin} onClose={() => setOpenLogin(false)} />
    </header>
  );
}