import React, { useState } from "react";
import { Link } from "react-router-dom";
import useStore from "../store/useStore";
import LoginModal from "./LoginModal";

import cartIcon from "../assets/img/header/cart-icon.svg";

import { FaShoppingBag, FaUserCircle } from "react-icons/fa";

export default function Navbar() {
    const totalItems = useStore((state) => state.getTotalQuantity());
    const totalOrders = useStore((state) => state.getTotalQuantityOrder());
    const user = useStore((state) => state.user);
    const logout = useStore((state) => state.logout);

    const [openLogin, setOpenLogin] = useState(false);

    return (
        <>
            <nav className="sticky top-0 z-50 w-full flex items-center justify-between px-8 lg:px-16 py-3 bg-accent-1">

                {/* LEFT */}
                <div className="flex-1">
                    <Link to="/" className="inline-block">
                        <h1 className="text-4xl font-bold font-nunito text-white hover:scale-105 transition-all duration-300 hover:text-primary">
                            REVO Coffee.
                        </h1>
                    </Link>
                </div>

                {/* CENTER */}
                <div className="hidden lg:flex flex-1 justify-center">
                    <ul className="flex items-center gap-12 font-nunito font-bold text-xs uppercase tracking-[0.2em] text-white whitespace-nowrap hover:-translate-y-1 transition-all duration-300 hover:scale-110">
                        <li><Link to="/" className="hover:text-primary">Trang chủ</Link></li>
                        <li><Link to="/shop" className="hover:text-primary">Sản phẩm</Link></li>
                        <li><Link to="/subscription" className="hover:text-primary">Đăng ký</Link></li>
                        <li><Link to="/quiz" className="hover:text-primary">Gợi ý cà phê</Link></li>
                        <li><Link to="/about" className="hover:text-primary">Về chúng tôi</Link></li>
                    </ul>
                </div>

                {/* RIGHT */}
                <div className="flex-1 flex justify-end items-center gap-4">

                    <Link
                        to="/orders"
                        className="relative w-11 h-11 rounded-full border-2 border-white flex items-center justify-center hover:bg-primary hover:scale-110 transition-all"
                    >
                        <FaShoppingBag className="text-white text-lg" />
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                            {totalOrders > 99 ? "99+" : totalOrders}
                        </span>
                    </Link>

                    <Link
                        to="/cart"
                        className="relative w-11 h-11 rounded-full border-2 border-white flex items-center justify-center hover:bg-primary hover:scale-110 transition-all"
                    >
                        <img src={cartIcon} alt="Cart" className="w-5 h-5 brightness-0 invert" />

                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                            {totalItems > 99 ? "99+" : totalItems}
                        </span>
                    </Link>

                    {user ? (
                        <div className="relative group flex items-center gap-3">
                            <div className="flex items-center gap-2 cursor-pointer">
                                <div className="w-11 h-11 rounded-full border-2 border-white flex items-center justify-center hover:bg-primary hover:scale-110 transition-all">
                                    <FaUserCircle className="text-white text-2xl" />
                                </div>

                                <span className="hidden md:block text-white font-semibold font-nunito text-sm">
                                    {user.name || user.username || "User"}
                                </span>
                            </div>

                            <div className="absolute -right-5 top-12 w-48 bg-white rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-center">
                                <Link to="/profile" className="block px-4 py-3 hover:bg-gray-100">Hồ sơ</Link>
                                <Link to="/orders" className="block px-4 py-3 hover:bg-gray-100">Đơn hàng</Link>

                                <button
                                    onClick={logout}
                                    className="w-full text-center px-4 py-3 text-red-500 hover:bg-gray-100"
                                >
                                    Đăng xuất
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setOpenLogin(true)}
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