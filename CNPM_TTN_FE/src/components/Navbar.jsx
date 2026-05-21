import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useStore from "../store/useStore";
import LoginModal from "./LoginModal";

import cartIcon from "../assets/img/header/cart-icon.svg";

import { FaShoppingBag, FaUserCircle, FaSignOutAlt, FaClipboardList, FaUser } from "react-icons/fa";

export default function Navbar() {
    const totalItems = useStore((state) => state.getTotalQuantity());
    const totalOrders = useStore((state) => state.getTotalQuantityOrder());
    const user = useStore((state) => state.user);
    const logout = useStore((state) => state.logout);
    const navigate = useNavigate();

    const [openLogin, setOpenLogin] = useState(false);
    const [openUserMenu, setOpenUserMenu] = useState(false);
    const dropdownRef = useRef(null);

    // Hỗ trợ cả PascalCase (từ API .NET) lẫn camelCase
    const displayName = user?.Name || user?.UserName || user?.name || user?.userName || "User";

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenUserMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        setOpenUserMenu(false);
        logout();
        navigate("/");
    };

    return (
        <>
            <nav className="sticky top-0 z-50 w-full flex items-center justify-between px-8 lg:px-16 py-3 bg-accent-1">

                {/* LEFT - Logo */}
                <div className="flex-shrink-0">
                    <Link to="/" className="inline-block">
                        <h1 className="text-4xl font-bold font-nunito text-white hover:scale-105 transition-all duration-300 hover:text-primary">
                            REVO Coffee.
                        </h1>
                    </Link>
                </div>

                {/* CENTER - Nav links */}
                <div className="hidden lg:flex flex-grow justify-center">
                    <ul className="flex items-center gap-12 font-nunito font-bold text-xs uppercase tracking-[0.2em] text-white whitespace-nowrap">
                        <li><Link to="/" className="hover:text-primary hover:-translate-y-0.5 transition-all duration-200 inline-block">Trang chủ</Link></li>
                        <li><Link to="/shop" className="hover:text-primary hover:-translate-y-0.5 transition-all duration-200 inline-block">Sản phẩm</Link></li>
                        <li><Link to="/subscription" className="hover:text-primary hover:-translate-y-0.5 transition-all duration-200 inline-block">Đăng ký</Link></li>
                        <li><Link to="/quiz" className="hover:text-primary hover:-translate-y-0.5 transition-all duration-200 inline-block">Gợi ý cà phê</Link></li>
                    </ul>
                </div>

                {/* RIGHT - Icons + User */}
                <div className="flex-shrink-0 flex justify-end items-center gap-4">

                    {/* Đơn hàng */}
                    <Link
                        to="/orders"
                        title="Đơn hàng của tôi"
                        className="relative w-11 h-11 rounded-full border-2 border-white flex items-center justify-center hover:bg-primary hover:scale-110 transition-all"
                    >
                        <FaShoppingBag className="text-white text-lg" />
                        {totalOrders > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                                {totalOrders > 99 ? "99+" : totalOrders}
                            </span>
                        )}
                    </Link>

                    {/* Giỏ hàng */}
                    <Link
                        to="/cart"
                        title="Giỏ hàng"
                        className="relative w-11 h-11 rounded-full border-2 border-white flex items-center justify-center hover:bg-primary hover:scale-110 transition-all"
                    >
                        <img src={cartIcon} alt="Cart" className="w-5 h-5 brightness-0 invert" />
                        {totalItems > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                                {totalItems > 99 ? "99+" : totalItems}
                            </span>
                        )}
                    </Link>

                    {/* User: Đã đăng nhập */}
                    {user ? (
                        <div className="relative" ref={dropdownRef}>

                            {/* Nút mở dropdown — CLICK-based, không phải hover */}
                            <button
                                onClick={() => setOpenUserMenu(prev => !prev)}
                                className="flex items-center gap-2 cursor-pointer focus:outline-none"
                            >
                                <div className="w-11 h-11 rounded-full border-2 border-white bg-white/10 flex items-center justify-center hover:bg-primary hover:scale-110 transition-all">
                                    <FaUserCircle className="text-white text-2xl" />
                                </div>
                                <span className="hidden md:block text-white font-semibold font-nunito text-sm max-w-[100px] truncate">
                                    {displayName}
                                </span>
                                {/* Mũi tên xoay theo trạng thái */}
                                <svg
                                    className={`w-3 h-3 text-white/80 transition-transform duration-200 ${openUserMenu ? "rotate-180" : ""}`}
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {openUserMenu && (
                                <div className="absolute right-0 top-14 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                                    {/* Header dropdown */}
                                    <div className="px-4 py-3 bg-gradient-to-r from-[#7F5539] to-[#5C3D2E] text-white">
                                        <p className="font-bold font-nunito text-sm truncate">{displayName}</p>
                                        <p className="text-white/70 text-xs font-nunito mt-0.5">Tài khoản của tôi</p>
                                    </div>

                                    {/* Hồ sơ */}
                                    <Link
                                        to="/profile"
                                        onClick={() => setOpenUserMenu(false)}
                                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-[#F7F2EC] hover:text-[#7F5539] transition-colors font-nunito font-semibold text-sm"
                                    >
                                        <FaUser className="text-[#7F5539] shrink-0" />
                                        Hồ sơ cá nhân
                                    </Link>

                                    {/* Đơn hàng */}
                                    <Link
                                        to="/orders"
                                        onClick={() => setOpenUserMenu(false)}
                                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-[#F7F2EC] hover:text-[#7F5539] transition-colors font-nunito font-semibold text-sm"
                                    >
                                        <FaClipboardList className="text-[#7F5539] shrink-0" />
                                        Đơn hàng của tôi
                                    </Link>

                                    <div className="border-t border-gray-100" />

                                    {/* Đăng xuất */}
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 transition-colors font-nunito font-semibold text-sm"
                                    >
                                        <FaSignOutAlt className="shrink-0" />
                                        Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Chưa đăng nhập */
                        <button
                            onClick={() => setOpenLogin(true)}
                            title="Đăng nhập"
                            className="w-11 h-11 rounded-full border-2 border-white flex items-center justify-center hover:bg-primary hover:scale-110 transition-all"
                        >
                            <FaUserCircle className="text-white text-2xl" />
                        </button>
                    )}
                </div>
            </nav>

            <LoginModal
                isOpen={openLogin}
                onClose={() => setOpenLogin(false)}
            />
        </>
    );
}
