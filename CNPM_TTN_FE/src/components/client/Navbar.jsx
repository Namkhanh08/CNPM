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
        `hover:text-primary hover:-translate-y-0.5 transition-all duration-200 inline-block ${isActive ? "text-primary" : ""}`;

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
            <nav className="sticky top-0 z-50 w-full flex items-center justify-between px-8 lg:px-16 py-3 bg-accent-1">
                <div className="flex-shrink-0">
                    <Link to="/" className="inline-block">
                        <h1 className="text-4xl font-bold font-nunito text-white hover:scale-105 transition-all duration-300 hover:text-primary">
                            REVO Coffee.
                        </h1>
                    </Link>
                </div>

                <div className="hidden lg:flex flex-grow justify-center">
                    <ul className="flex items-center gap-12 font-nunito font-bold text-xs uppercase tracking-[0.2em] text-white whitespace-nowrap">
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
                        className="relative w-11 h-11 rounded-full border-2 border-white flex items-center justify-center hover:bg-primary hover:scale-110 transition-all"
                    >
                        <FaShoppingBag className="text-white text-lg" />
                        {totalOrders > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                                {totalOrders > 99 ? "99+" : totalOrders}
                            </span>
                        )}
                    </Link>

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

                    {user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                type="button"
                                onClick={() => setOpenUserMenu((prev) => !prev)}
                                className="flex items-center gap-2 cursor-pointer focus:outline-none"
                            >
                                <div className="relative w-11 h-11 rounded-full border-2 border-white bg-white/10 flex items-center justify-center hover:bg-primary hover:scale-110 transition-all">
                                    <FaUserCircle className="text-white text-2xl" />
                                    {hasTodayOffers && (
                                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-accent-1" />
                                    )}
                                </div>
                                <span className="hidden md:block text-white font-semibold font-nunito text-sm max-w-[100px] truncate">
                                    {displayName}
                                </span>
                                <svg
                                    className={`w-3 h-3 text-white/80 transition-transform duration-200 ${openUserMenu ? "rotate-180" : ""}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {openUserMenu && (
                                <div className="absolute right-0 top-14 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                                    <div className="px-4 py-3 bg-gradient-to-r from-[#7F5539] to-[#5C3D2E] text-white">
                                        <p className="font-bold font-nunito text-sm truncate">{displayName}</p>
                                        <p className="text-white/70 text-xs font-nunito mt-0.5">Tài khoản của tôi</p>
                                    </div>

                                    <Link
                                        to="/profile"
                                        onClick={() => setOpenUserMenu(false)}
                                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-[#F7F2EC] hover:text-[#7F5539] transition-colors font-nunito font-semibold text-sm"
                                    >
                                        <span className="relative">
                                            <FaUser className="text-[#7F5539] shrink-0" />
                                            {hasTodayOffers && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />}
                                        </span>
                                        Hồ sơ cá nhân
                                    </Link>

                                    <Link
                                        to="/orders"
                                        onClick={() => setOpenUserMenu(false)}
                                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-[#F7F2EC] hover:text-[#7F5539] transition-colors font-nunito font-semibold text-sm"
                                    >
                                        <FaClipboardList className="text-[#7F5539] shrink-0" />
                                        Đơn hàng của tôi
                                    </Link>

                                    <div className="border-t border-gray-100" />

                                    <button
                                        type="button"
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
                        <button
                            type="button"
                            onClick={() => setOpenLogin(true)}
                            title="Dang nhap"
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
