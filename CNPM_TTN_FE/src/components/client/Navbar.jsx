import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import useStore from "../../store/useStore";
import LoginModal from "./LoginModal";
import API from "../../services/api";

import cartIcon from "../../assets/img/header/cart-icon.svg";

import { FaShoppingBag, FaUserCircle, FaSignOutAlt, FaClipboardList, FaUser } from "react-icons/fa";

const getUserOfferIdentity = (user) =>
    user?.Id || user?.id || user?.UserName || user?.userName || localStorage.getItem("userName") || "guest";
const getTodayOfferSeenKey = (identity) => `revo_seen_offers_${identity}_${new Date().toISOString().slice(0, 10)}`;
const hasSeenTodayOffers = (identity) => localStorage.getItem(getTodayOfferSeenKey(identity)) === "true";

export default function Navbar() {
    const totalItems = useStore((state) => state.getTotalQuantity());
    const totalOrders = useStore((state) => state.getTotalQuantityOrder());
    const user = useStore((state) => state.user);
    const logout = useStore((state) => state.logout);
    const navigate = useNavigate();

    const [openLogin, setOpenLogin] = useState(false);
    const [openUserMenu, setOpenUserMenu] = useState(false);
    const [hasTodayOffers, setHasTodayOffers] = useState(false);
    const dropdownRef = useRef(null);

    const displayName = user?.Name || user?.UserName || user?.name || user?.userName || "User";
    const offerIdentity = getUserOfferIdentity(user);
    const navLinkClass = ({ isActive }) =>
        `relative py-2 hover:text-[#f9f5e8] transition-colors duration-300 ${
            isActive ? "text-[#f9f5e8] after:scale-x-100" : "text-white after:scale-x-0"
        } after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-0.5 after:bg-[#f9f5e8] after:origin-left hover:after:scale-x-100 after:transition-transform after:duration-300`;

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenUserMenu(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        let cancelled = false;

        const loadTodayOffers = async () => {
            if (!user) {
                setHasTodayOffers(false);
                return;
            }

            try {
                const res = await API.getAvailableVouchers();
                const items = res.data?.Data ?? res.data?.data ?? res.data ?? [];
                if (!cancelled) setHasTodayOffers(Array.isArray(items) && items.length > 0 && !hasSeenTodayOffers(offerIdentity));
            } catch {
                if (!cancelled) setHasTodayOffers(false);
            }
        };

        loadTodayOffers();
        const handleOffersSeen = (event) => {
            if (!event.detail?.identity || event.detail.identity === offerIdentity) {
                setHasTodayOffers(false);
            }
        };
        const handleStorage = (event) => {
            if (event.key === getTodayOfferSeenKey(offerIdentity)) setHasTodayOffers(false);
        };

        window.addEventListener("revo-offers-seen", handleOffersSeen);
        window.addEventListener("storage", handleStorage);
        return () => {
            cancelled = true;
            window.removeEventListener("revo-offers-seen", handleOffersSeen);
            window.removeEventListener("storage", handleStorage);
        };
    }, [user, offerIdentity]);

    const handleLogout = () => {
        setOpenUserMenu(false);
        logout();
        navigate("/");
    };

    return (
        <>
            <nav className="sticky top-0 z-50 w-full flex items-center justify-between px-8 lg:px-16 py-4 bg-accent-1 shadow-md">
                <div className="flex-shrink-0">
                    <Link to="/" className="inline-block">
                        <h1 className="text-3xl font-black font-montserrat tracking-tight text-white hover:scale-[1.03] active:scale-95 transition-all duration-300 hover:text-[#f9f5e8]">
                            REVO Coffee.
                        </h1>
                    </Link>
                </div>

                <div className="hidden lg:flex flex-grow justify-center">
                    <ul className="flex items-center gap-10 font-nunito font-bold text-xs uppercase tracking-[0.2em] text-white whitespace-nowrap">
                        <li><NavLink to="/" end className={navLinkClass}>Trang chủ</NavLink></li>
                        <li><NavLink to="/shop" className={navLinkClass}>Sản phẩm</NavLink></li>
                        <li><NavLink to="/subscription" className={navLinkClass}>Đăng ký</NavLink></li>
                        <li><NavLink to="/quiz" className={navLinkClass}>Gợi ý cà phê</NavLink></li>
                    </ul>
                </div>

                <div className="flex-shrink-0 flex justify-end items-center gap-4">
                    <Link
                        to="/orders"
                        title="Đơn hàng của tôi"
                        className="relative w-10 h-10 rounded-full border border-white/40 flex items-center justify-center hover:bg-white/15 active:scale-90 transition-all duration-200 shadow-sm"
                    >
                        <FaShoppingBag className="text-white text-base" />
                        {totalOrders > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center border border-accent-1 animate-pulse">
                                {totalOrders > 99 ? "99+" : totalOrders}
                            </span>
                        )}
                    </Link>

                    <Link
                        to="/cart"
                        title="Giỏ hàng"
                        className="relative w-10 h-10 rounded-full border border-white/40 flex items-center justify-center hover:bg-white/15 active:scale-90 transition-all duration-200 shadow-sm"
                    >
                        <img src={cartIcon} alt="Cart" className="w-4 h-4 brightness-0 invert" />
                        {totalItems > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center border border-accent-1 animate-pulse">
                                {totalItems > 99 ? "99+" : totalItems}
                            </span>
                        )}
                    </Link>

                    {user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                type="button"
                                onClick={() => setOpenUserMenu((prev) => !prev)}
                                className="flex items-center gap-2 cursor-pointer focus:outline-none group active:scale-98 transition-all duration-150"
                            >
                                <div className="relative w-10 h-10 rounded-full border border-white/40 bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all shadow-sm">
                                    <FaUserCircle className="text-white text-xl" />
                                    {hasTodayOffers && (
                                        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 border border-accent-1 animate-ping" />
                                    )}
                                </div>
                                <span className="hidden md:block text-white font-bold font-nunito text-xs tracking-wider max-w-[100px] truncate uppercase">
                                    {displayName}
                                </span>
                                <svg
                                    className={`w-3 h-3 text-white/80 transition-transform duration-300 ${openUserMenu ? "rotate-180" : ""}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {openUserMenu && (
                                <div className="absolute right-0 top-13 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-slide-up origin-top-right">
                                    <div className="px-4 py-3.5 bg-gradient-to-br from-[#7F5539] to-[#5C3D2E] text-white">
                                        <p className="font-bold font-nunito text-sm truncate">{displayName}</p>
                                        <p className="text-white/70 text-[10px] uppercase tracking-wider font-bold font-nunito mt-0.5">Tài khoản của tôi</p>
                                    </div>

                                    <Link
                                        to="/profile"
                                        onClick={() => setOpenUserMenu(false)}
                                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-[#F7F2EC] hover:text-[#7F5539] transition-all font-nunito font-semibold text-sm active:pl-5"
                                    >
                                        <span className="relative flex items-center">
                                            <FaUser className="text-[#7F5539] shrink-0" />
                                            {hasTodayOffers && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border border-white" />}
                                        </span>
                                        Hồ sơ cá nhân
                                    </Link>

                                    <Link
                                        to="/orders"
                                        onClick={() => setOpenUserMenu(false)}
                                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-[#F7F2EC] hover:text-[#7F5539] transition-all font-nunito font-semibold text-sm active:pl-5"
                                    >
                                        <FaClipboardList className="text-[#7F5539] shrink-0" />
                                        Đơn hàng của tôi
                                    </Link>

                                    <div className="border-t border-gray-100" />

                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 transition-all font-nunito font-semibold text-sm active:pl-5"
                                    >
                                        <FaSignOutAlt className="shrink-0" />
                                        Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setOpenLogin(true)}
                            title="Đăng nhập"
                            className="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center hover:bg-white/15 active:scale-90 transition-all duration-200 shadow-sm"
                        >
                            <FaUserCircle className="text-white text-xl" />
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
