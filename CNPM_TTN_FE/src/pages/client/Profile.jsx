import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../../store/useStore";
import API from "../../services/api";
import { Edit3, Key, Lock, Mail, MapPin, Phone, Save, User, Award, Calendar, ClipboardCopy } from "lucide-react";

const roleLabels = {
    0: "Khách hàng",
    1: "Quản lý",
    2: "Nhân viên",
    3: "Quản lý kho",
};

export default function Profile() {
    const navigate = useNavigate();
    const user = useStore((state) => state.user);
    const setUser = useStore((state) => state.setUser);

    const [activeTab, setActiveTab] = useState("info");
    const [profileLoading, setProfileLoading] = useState(false);
    const [loading, setLoading] = useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [contact, setContact] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [infoMessage, setInfoMessage] = useState({ text: "", type: "" });
    const [pwMessage, setPwMessage] = useState({ text: "", type: "" });

    // Loyalty states
    const [loyaltyInfo, setLoyaltyInfo] = useState(null);
    const [loyaltyLoading, setLoyaltyLoading] = useState(false);
    const [redeemPointsAmount, setRedeemPointsAmount] = useState(100);
    const [redeemMessage, setRedeemMessage] = useState({ text: "", type: "" });
    const [redeemedVoucherCode, setRedeemedVoucherCode] = useState("");

    // Subscriptions states
    const [subs, setSubs] = useState([]);
    const [subsLoading, setSubsLoading] = useState(false);

    const fetchLoyaltyInfo = async () => {
        setLoyaltyLoading(true);
        setRedeemMessage({ text: "", type: "" });
        try {
            const res = await API.getLoyaltyInfo();
            // Backend trả về ApiResponse<LoyaltyInfoDto>, data nằm trong res.data.Data
            const info = res.data?.Data ?? res.data?.data ?? res.data;
            setLoyaltyInfo(info);
        } catch (err) {
            console.error("Fetch loyalty failed:", err);
        } finally {
            setLoyaltyLoading(false);
        }
    };

    const fetchSubscriptions = async () => {
        setSubsLoading(true);
        try {
            const res = await API.getMySubscriptions();
            setSubs(res.data);
        } catch (err) {
            console.error("Fetch subscriptions failed:", err);
        } finally {
            setSubsLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === "loyalty") {
            fetchLoyaltyInfo();
        } else if (activeTab === "subscriptions") {
            fetchSubscriptions();
        }
    }, [activeTab]);

    const handleRedeemPoints = async (e) => {
        e.preventDefault();
        setRedeemMessage({ text: "", type: "" });
        setRedeemedVoucherCode("");
        if (redeemPointsAmount < 100 || redeemPointsAmount % 100 !== 0) {
            setRedeemMessage({ text: "Số điểm đổi phải là bội số của 100 (tối thiểu 100 điểm).", type: "error" });
            return;
        }
        if (loyaltyInfo && (loyaltyInfo.TotalPoints ?? loyaltyInfo.totalPoints ?? loyaltyInfo.points ?? 0) < redeemPointsAmount) {
            setRedeemMessage({ text: "Bạn không đủ điểm để thực hiện giao dịch này.", type: "error" });
            return;
        }
        setLoading(true);
        try {
            const res = await API.redeemPoints(redeemPointsAmount);
            const success = res.data.Success ?? res.data.success;
            const message = res.data.Message ?? res.data.message;
            if (success) {
                // Data trong ApiResponse: res.data.Data là VoucherDto
                const voucherCode = res.data?.Data?.Code ?? res.data?.data?.code ?? res.data?.VoucherCode ?? res.data?.voucherCode;
                setRedeemedVoucherCode(voucherCode ?? "");
                fetchLoyaltyInfo(); // Refresh points
            } else {
                setRedeemMessage({ text: message || "Đổi điểm thất bại.", type: "error" });
            }
        } catch (err) {
            setRedeemMessage({ text: err.response?.data?.Message || err.response?.data?.message || "Lỗi khi đổi điểm.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handlePauseSub = async (subId) => {
        if (!window.confirm("Bạn có chắc chắn muốn tạm dừng gói đăng ký này không?")) return;
        try {
            await API.pauseSubscription(subId);
            alert("Đã tạm dừng đăng ký thành công!");
            fetchSubscriptions();
        } catch (err) {
            alert(err.response?.data?.Message || err.response?.data?.message || "Lỗi khi tạm dừng đăng ký.");
        }
    };

    const handleResumeSub = async (subId) => {
        if (!window.confirm("Bạn có chắc chắn muốn kích hoạt lại gói đăng ký này không?")) return;
        try {
            await API.resumeSubscription(subId);
            alert("Đã kích hoạt lại đăng ký thành công!");
            fetchSubscriptions();
        } catch (err) {
            alert(err.response?.data?.Message || err.response?.data?.message || "Lỗi khi kích hoạt lại đăng ký.");
        }
    };

    const handleCancelSub = async (subId) => {
        if (!window.confirm("Bạn có chắc chắn muốn HỦY gói đăng ký này không? Hành động này không thể hoàn tác.")) return;
        try {
            await API.cancelSubscription(subId);
            alert("Đã hủy đăng ký thành công!");
            fetchSubscriptions();
        } catch (err) {
            alert(err.response?.data?.Message || err.response?.data?.message || "Lỗi khi hủy đăng ký.");
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        let isMounted = true;

        const loadProfile = async () => {
            setProfileLoading(true);
            try {
                const res = await API.getProfile();
                const success = res.data.Success ?? res.data.success;
                const data = res.data.Data ?? res.data.data;

                if (isMounted && success && data) {
                    setUser(data);
                }
            } catch (err) {
                if (isMounted && err.response?.status === 401) {
                    setUser(null);
                }
            } finally {
                if (isMounted) {
                    setProfileLoading(false);
                }
            }
        };

        loadProfile();

        return () => {
            isMounted = false;
        };
    }, [setUser]);

    useEffect(() => {
        if (!user) return;

        setName(user.Name || user.name || "");
        setEmail(user.Email || user.email || "");
        setPhone(user.Phone || user.phone || "");
        setContact(user.Contact || user.contact || "");
    }, [user]);

    const userName = user?.UserName || user?.userName || localStorage.getItem("userName") || "";
    const userType = Number(user?.UserType ?? user?.userType ?? localStorage.getItem("userType") ?? 0);
    const hasProfileData = Boolean(user?.Name || user?.name || user?.Email || user?.email);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setInfoMessage({ text: "", type: "" });

        try {
            const res = await API.updateProfile({
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim(),
                contact: contact.trim(),
            });

            const success = res.data.Success ?? res.data.success;
            const message = res.data.Message ?? res.data.message;

            if (success) {
                setInfoMessage({ text: "Cập nhật thông tin cá nhân thành công!", type: "success" });

                const profileRes = await API.getProfile();
                const profileSuccess = profileRes.data.Success ?? profileRes.data.success;
                const profileData = profileRes.data.Data ?? profileRes.data.data;

                if (profileSuccess && profileData) {
                    setUser(profileData);
                }
            } else {
                setInfoMessage({ text: message || "Cập nhật thất bại.", type: "error" });
            }
        } catch (err) {
            setInfoMessage({
                text: err.response?.data?.Message || err.response?.data?.message || "Đã xảy ra lỗi kết nối hệ thống.",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPwMessage({ text: "", type: "" });

        if (newPassword !== confirmPassword) {
            setPwMessage({ text: "Mật khẩu xác nhận không khớp.", type: "error" });
            return;
        }

        setLoading(true);
        try {
            const res = await API.changePassword({
                currentPassword,
                newPassword,
            });

            const success = res.data.Success ?? res.data.success;
            const message = res.data.Message ?? res.data.message;

            if (success) {
                setPwMessage({ text: "Đổi mật khẩu thành công!", type: "success" });
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                setPwMessage({ text: message || "Đổi mật khẩu thất bại.", type: "error" });
            }
        } catch (err) {
            setPwMessage({
                text: err.response?.data?.Message || err.response?.data?.message || "Mật khẩu cũ không chính xác hoặc lỗi hệ thống.",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    if (profileLoading && !hasProfileData) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center bg-[#FDFBF7] px-6">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-[#EEDFCE]">
                    <p className="text-[#5C3D2E] font-bold font-nunito">Đang tải thông tin hồ sơ...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#FDFBF7] px-6">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-[#EEDFCE]">
                    <h2 className="text-3xl font-black text-[#5C3D2E] mb-4 font-montserrat">VUI LÒNG ĐĂNG NHẬP</h2>
                    <p className="text-gray-500 mb-6 font-nunito">Bạn cần đăng nhập để xem và quản lý thông tin tài khoản cá nhân của mình.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFBF7] pt-28 pb-20 px-4 md:px-12 font-nunito">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-3xl p-6 shadow-md border border-[#F2ECE4] text-center flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full bg-[#7F5539] flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-[#7F5539]/20 mb-4 transition-transform hover:scale-105 duration-300">
                            {(userName || name || "U").charAt(0).toUpperCase()}
                        </div>
                        <h2 className="text-2xl font-black text-[#5C3D2E] font-montserrat">{userName || name || "User"}</h2>
                        <span className="mt-1 px-4 py-1.5 rounded-full bg-[#EEDFCE] text-[#7F5539] text-xs font-bold uppercase tracking-wider">
                            {roleLabels[userType] || "Khách hàng"}
                        </span>

                        <div className="w-full border-t border-gray-100 my-6"></div>

                        <div className="w-full space-y-2">
                            <button
                                type="button"
                                onClick={() => setActiveTab("info")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all duration-300 ${
                                    activeTab === "info"
                                        ? "bg-[#7F5539] text-white shadow-md shadow-[#7F5539]/10"
                                        : "text-[#7F5539] hover:bg-[#F7F2EC]"
                                }`}
                            >
                                <User size={18} />
                                Thông tin tài khoản
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("password")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all duration-300 ${
                                    activeTab === "password"
                                        ? "bg-[#7F5539] text-white shadow-md shadow-[#7F5539]/10"
                                        : "text-[#7F5539] hover:bg-[#F7F2EC]"
                                }`}
                            >
                                <Lock size={18} />
                                Đổi mật khẩu
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("loyalty")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all duration-300 ${
                                    activeTab === "loyalty"
                                        ? "bg-[#7F5539] text-white shadow-md shadow-[#7F5539]/10"
                                        : "text-[#7F5539] hover:bg-[#F7F2EC]"
                                }`}
                            >
                                <Award size={18} />
                                Điểm tích lũy & Ưu đãi
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("subscriptions")}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all duration-300 ${
                                    activeTab === "subscriptions"
                                        ? "bg-[#7F5539] text-white shadow-md shadow-[#7F5539]/10"
                                        : "text-[#7F5539] hover:bg-[#F7F2EC]"
                                }`}
                            >
                                <Calendar size={18} />
                                Gói đăng ký định kỳ
                            </button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8">
                    <div className="bg-white rounded-3xl p-8 shadow-md border border-[#F2ECE4] min-h-[450px]">
                        {activeTab === "info" && (
                            <div>
                                <h3 className="text-2xl font-black text-[#5C3D2E] font-montserrat mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                                    <Edit3 size={22} className="text-[#7F5539]" /> Cập Nhật Hồ Sơ Cá Nhân
                                </h3>

                                {infoMessage.text && (
                                    <div className={`p-4 mb-6 rounded-2xl text-sm font-bold ${
                                        infoMessage.type === "success"
                                            ? "bg-green-50 text-green-700 border border-green-200"
                                            : "bg-red-50 text-red-700 border border-red-200"
                                    }`}
                                    >
                                        {infoMessage.text}
                                    </div>
                                )}

                                <form onSubmit={handleUpdateProfile} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold text-[#7F5539]">Họ và tên</label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7F5539] focus:border-transparent font-semibold text-gray-800 transition-all"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold text-[#7F5539]">Email</label>
                                            <div className="relative">
                                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7F5539] focus:border-transparent font-semibold text-gray-800 transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold text-[#7F5539]">Số điện thoại</label>
                                            <div className="relative">
                                                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="tel"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    placeholder="Chưa cập nhật SĐT"
                                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7F5539] focus:border-transparent font-semibold text-gray-800 transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold text-[#7F5539]">Địa chỉ / Liên hệ</label>
                                            <div className="relative">
                                                <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={contact}
                                                    onChange={(e) => setContact(e.target.value)}
                                                    placeholder="Chưa cập nhật địa chỉ"
                                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7F5539] focus:border-transparent font-semibold text-gray-800 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="bg-[#7F5539] text-white font-bold py-3.5 px-8 rounded-full shadow-lg shadow-[#7F5539]/20 hover:bg-[#5C3D2E] hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 uppercase tracking-wide text-sm"
                                        >
                                            <Save size={18} />
                                            {loading ? "Đang lưu..." : "Lưu thay đổi"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === "password" && (
                            <div>
                                <h3 className="text-2xl font-black text-[#5C3D2E] font-montserrat mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                                    <Key size={22} className="text-[#7F5539]" /> Thay Đổi Mật Khẩu Đăng Nhập
                                </h3>

                                {pwMessage.text && (
                                    <div className={`p-4 mb-6 rounded-2xl text-sm font-bold ${
                                        pwMessage.type === "success"
                                            ? "bg-green-50 text-green-700 border border-green-200"
                                            : "bg-red-50 text-red-700 border border-red-200"
                                    }`}
                                    >
                                        {pwMessage.text}
                                    </div>
                                )}

                                <form onSubmit={handleChangePassword} className="space-y-6 max-w-lg">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-[#7F5539]">Mật khẩu hiện tại</label>
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7F5539] focus:border-transparent font-semibold text-gray-800 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-[#7F5539]">Mật khẩu mới</label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            minLength={6}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7F5539] focus:border-transparent font-semibold text-gray-800 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-[#7F5539]">Xác nhận mật khẩu mới</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7F5539] focus:border-transparent font-semibold text-gray-800 transition-all"
                                        />
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="bg-[#7F5539] text-white font-bold py-3.5 px-8 rounded-full shadow-lg shadow-[#7F5539]/20 hover:bg-[#5C3D2E] hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 uppercase tracking-wide text-sm"
                                        >
                                            <Key size={18} />
                                            {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === "loyalty" && (
                            <div>
                                <h3 className="text-2xl font-black text-[#5C3D2E] font-montserrat mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                                    <Award size={22} className="text-[#7F5539]" /> Điểm Tích Lũy & Ưu Đãi Hội Viên
                                </h3>

                                {loyaltyLoading ? (
                                    <p className="text-gray-500 font-semibold">Đang tải thông tin điểm tích lũy...</p>
                                ) : (
                                    <div className="space-y-8">
                                        {/* Member Tier & Points Display */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gradient-to-br from-[#7F5539] to-[#5C3D2E] rounded-3xl p-6 text-white shadow-xl">
                                            <div>
                                                <p className="text-white/70 text-sm font-bold uppercase tracking-wider">Hạng hội viên</p>
                                                <h4 className="text-3xl font-black font-montserrat mt-1 uppercase tracking-wide">
                                                    {loyaltyInfo?.MemberTier ?? loyaltyInfo?.memberTier ?? loyaltyInfo?.Tier ?? loyaltyInfo?.tier ?? "Bronze"}
                                                </h4>
                                                <p className="text-white/60 text-xs mt-2 font-semibold">
                                                    Hạng Diamond được giảm giá trực tiếp 10% trên mọi hóa đơn mua hàng!
                                                </p>
                                            </div>
                                            <div className="md:text-right flex flex-col justify-between items-start md:items-end">
                                                <div>
                                                    <p className="text-white/70 text-sm font-bold uppercase tracking-wider">Điểm khả dụng</p>
                                                    <h4 className="text-4xl font-black font-montserrat mt-1">
                                                        {(loyaltyInfo?.TotalPoints ?? loyaltyInfo?.totalPoints ?? loyaltyInfo?.points ?? 0).toLocaleString()} <span className="text-lg font-bold text-white/80">điểm</span>
                                                    </h4>
                                                </div>
                                                <p className="text-white/60 text-xs mt-2 font-semibold">
                                                    1,000đ chi tiêu = 1 điểm. 100 điểm = Voucher 10,000đ
                                                </p>
                                            </div>
                                        </div>

                                        {/* Redeem Section */}
                                        <div className="bg-amber-50/50 border border-amber-200/60 rounded-3xl p-6">
                                            <h4 className="text-lg font-bold text-[#5C3D2E] mb-2 font-montserrat">Đổi Điểm Lấy Voucher</h4>
                                            <p className="text-sm text-gray-600 mb-4">
                                                Bạn có thể quy đổi điểm thành các voucher giảm giá. Mỗi 100 điểm đổi được voucher 10,000đ.
                                            </p>

                                            {/* Hiển thị lỗi nếu có */}
                                            {redeemMessage.text && redeemMessage.type === "error" && (
                                                <div className="p-4 mb-4 rounded-2xl bg-red-50 text-red-700 border border-red-200 text-sm font-bold">
                                                    {redeemMessage.text}
                                                </div>
                                            )}

                                            {/* Hiển thị duy nhất mã voucher và ký hiệu sao chép khi đổi thành công */}
                                            {redeemedVoucherCode && (
                                                <div className="mb-4 flex items-center justify-between rounded-xl bg-green-50 border border-green-150 p-4 gap-3">
                                                    <span className="font-mono font-black text-green-800 tracking-widest text-lg break-all">
                                                        {redeemedVoucherCode}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(redeemedVoucherCode);
                                                            alert(`Đã copy mã: ${redeemedVoucherCode}`);
                                                        }}
                                                        className="text-green-700 hover:text-green-950 transition-colors p-1"
                                                        title="Sao chép mã voucher"
                                                        aria-label="Sao chép mã voucher"
                                                    >
                                                        <ClipboardCopy size={22} />
                                                    </button>
                                                </div>
                                            )}

                                            <form onSubmit={handleRedeemPoints} className="flex flex-col sm:flex-row gap-4 items-end">
                                                <div className="flex-1 space-y-1">
                                                    <label className="block text-xs font-bold text-[#7F5539] uppercase">Số điểm muốn đổi</label>
                                                    <select
                                                        value={redeemPointsAmount}
                                                        onChange={(e) => setRedeemPointsAmount(Number(e.target.value))}
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7F5539] font-bold text-[#7F5539]"
                                                    >
                                                        <option value={100}>100 điểm (Voucher 10,000đ)</option>
                                                        <option value={200}>200 điểm (Voucher 20,000đ)</option>
                                                        <option value={300}>300 điểm (Voucher 30,000đ)</option>
                                                        <option value={500}>500 điểm (Voucher 50,000đ)</option>
                                                        <option value={1000}>1,000 điểm (Voucher 100,000đ)</option>
                                                    </select>
                                                </div>
                                                <button
                                                    type="submit"
                                                    disabled={loading || (loyaltyInfo?.TotalPoints ?? loyaltyInfo?.totalPoints ?? loyaltyInfo?.points ?? 0) < redeemPointsAmount}
                                                    className="w-full sm:w-auto bg-[#7F5539] hover:bg-[#5C3D2E] text-white font-bold px-6 py-3.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-wider whitespace-nowrap"
                                                >
                                                    {loading ? "Đang xử lý..." : "Đổi ngay"}
                                                </button>
                                            </form>
                                        </div>

                                        {/* History Section */}
                                        <div>
                                            <h4 className="text-lg font-bold text-[#5C3D2E] mb-4 font-montserrat">Lịch Sử Điểm Tích Lũy</h4>
                                            {!(loyaltyInfo?.History ?? loyaltyInfo?.history)?.length ? (
                                                <div className="text-center py-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-500 font-medium text-sm">
                                                    Chưa có lịch sử giao dịch điểm.
                                                </div>
                                            ) : (
                                                <div className="overflow-x-auto border border-gray-100 rounded-2xl">
                                                    <table className="w-full border-collapse text-left text-sm text-gray-500">
                                                        <thead className="bg-gray-50 text-xs font-bold uppercase text-[#7F5539] border-b border-gray-100">
                                                            <tr>
                                                                <th className="px-6 py-4">Ngày</th>
                                                                <th className="px-6 py-4">Số điểm</th>
                                                                <th className="px-6 py-4">Nội dung</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100 font-semibold">
                                                            {(loyaltyInfo?.History ?? loyaltyInfo?.history ?? []).map((item) => (
                                                                <tr key={item.id || item.Id} className="hover:bg-gray-50">
                                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                                                        {new Date(item.CreatedAt ?? item.createdAt ?? item.date ?? item.Date).toLocaleDateString("vi-VN", {
                                                                            year: "numeric",
                                                                            month: "2-digit",
                                                                            day: "2-digit",
                                                                            hour: "2-digit",
                                                                            minute: "2-digit",
                                                                        })}
                                                                    </td>
                                                                    <td className={`px-6 py-4 whitespace-nowrap font-bold ${
                                                                        (item.Points ?? item.points ?? 0) >= 0 ? "text-green-600" : "text-red-500"
                                                                    }`}>
                                                                        {(item.Points ?? item.points ?? 0) >= 0 ? "+" : ""}{(item.Points ?? item.points ?? 0).toLocaleString()}
                                                                    </td>
                                                                    <td className="px-6 py-4 text-gray-700">
                                                                        {item.description || item.Description}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "subscriptions" && (
                            <div>
                                <h3 className="text-2xl font-black text-[#5C3D2E] font-montserrat mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                                    <Calendar size={22} className="text-[#7F5539]" /> Gói Đăng Ký Cà Phê Định Kỳ
                                </h3>

                                {subsLoading ? (
                                    <p className="text-gray-500 font-semibold">Đang tải danh sách đăng ký định kỳ...</p>
                                ) : !subs.length ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                        <p className="text-gray-500 font-bold mb-4">Bạn chưa đăng ký gói cà phê định kỳ nào.</p>
                                        <button
                                            onClick={() => navigate("/subscription")}
                                            className="bg-[#7F5539] hover:bg-[#5C3D2E] text-white font-bold px-6 py-3 rounded-full text-sm uppercase tracking-wider transition-colors"
                                        >
                                            Đăng ký ngay
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {subs.map((sub) => (
                                            <div
                                                key={sub.id || sub.Id}
                                                className="bg-white rounded-3xl border border-[#F2ECE4] p-6 shadow-sm hover:shadow-md transition-all duration-300 grid grid-cols-1 md:grid-cols-12 gap-6"
                                            >
                                                {/* Left: Product Image & Info */}
                                                <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left space-y-4">
                                                    <div className="w-24 h-24 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center p-2">
                                                        <img
                                                            src={sub.productImage || sub.ProductImage || "/placeholder-coffee.png"}
                                                            alt={sub.productName || sub.ProductName}
                                                            className="max-h-full max-w-full object-contain"
                                                            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=200&auto=format&fit=crop"; }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-[#5C3D2E] text-lg font-montserrat">
                                                            {sub.productName || sub.ProductName}
                                                        </h4>
                                                        <div className="mt-2 flex flex-wrap gap-2 justify-center md:justify-start">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                                (sub.status || sub.Status) === "active"
                                                                    ? "bg-green-100 text-green-700"
                                                                    : (sub.status || sub.Status) === "paused"
                                                                    ? "bg-amber-100 text-amber-700"
                                                                    : "bg-gray-100 text-gray-500"
                                                            }`}>
                                                                {(sub.status || sub.Status) === "active" ? "Đang hoạt động" : (sub.status || sub.Status) === "paused" ? "Đang tạm dừng" : "Đã hủy"}
                                                            </span>
                                                            <span className="px-3 py-1 rounded-full bg-[#EEDFCE] text-[#7F5539] text-xs font-bold">
                                                                {(sub.frequency || sub.Frequency) === "weekly"
                                                                    ? "Mỗi tuần"
                                                                    : (sub.frequency || sub.Frequency) === "biweekly"
                                                                    ? "Mỗi 2 tuần"
                                                                    : "Mỗi tháng"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Center: Details */}
                                                <div className="md:col-span-5 space-y-2 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 text-sm">
                                                    <p className="text-gray-600">
                                                        <strong className="text-[#5C3D2E]">Xay hạt:</strong> {
                                                            (sub.grindingOptionId || sub.GrindingOptionId) === 1 ? "Nguyên hạt" :
                                                            (sub.grindingOptionId || sub.GrindingOptionId) === 2 ? "Pha phin" : "Pha máy"
                                                        }
                                                    </p>
                                                    <p className="text-gray-600">
                                                        <strong className="text-[#5C3D2E]">Hương vị:</strong> {sub.flavorNotes || sub.FlavorNotes || "Mặc định"}
                                                    </p>
                                                    <p className="text-gray-600">
                                                        <strong className="text-[#5C3D2E]">Trọng lượng / SL:</strong> {sub.weight || sub.Weight || "250g"} | {sub.quantity || sub.Quantity} túi
                                                    </p>
                                                    <p className="text-gray-600">
                                                        <strong className="text-[#5C3D2E]">Người nhận:</strong> {sub.receiverName || sub.ReceiverName} ({sub.receiverPhone || sub.ReceiverPhone})
                                                    </p>
                                                    <p className="text-gray-600 truncate" title={`${sub.shippingDetailAddress || sub.ShippingDetailAddress}, ${sub.shippingWard || sub.ShippingWard}, ${sub.shippingDistrict || sub.ShippingDistrict}, ${sub.shippingProvince || sub.ShippingProvince}`}>
                                                        <strong className="text-[#5C3D2E]">Địa chỉ:</strong> {sub.shippingDetailAddress || sub.ShippingDetailAddress}, {sub.shippingWard || sub.ShippingWard}, {sub.shippingDistrict || sub.ShippingDistrict}, {sub.shippingProvince || sub.ShippingProvince}
                                                    </p>
                                                    <p className="text-gray-600">
                                                        <strong className="text-[#5C3D2E]">Thanh toán:</strong> {sub.paymentMethod || sub.PaymentMethod || "COD"}
                                                    </p>
                                                </div>

                                                {/* Right: Dates & Controls */}
                                                <div className="md:col-span-3 flex flex-col justify-between items-stretch md:items-end border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 text-xs font-semibold">
                                                    <div className="space-y-1.5 md:text-right">
                                                        <p className="text-gray-400 font-bold uppercase">Ngày đăng ký</p>
                                                        <p className="text-gray-700 font-bold">
                                                            {new Date(sub.createdAt || sub.CreatedAt).toLocaleDateString("vi-VN")}
                                                        </p>
                                                        <p className="text-gray-400 font-bold uppercase mt-2">Đợt giao tiếp theo</p>
                                                        <p className="text-[#7F5539] font-black text-sm">
                                                            {new Date(sub.nextDeliveryDate || sub.NextDeliveryDate).toLocaleDateString("vi-VN")}
                                                        </p>
                                                    </div>

                                                    {/* Control Actions */}
                                                    <div className="mt-4 md:mt-0 flex flex-row md:flex-col gap-2 w-full">
                                                        {(sub.status || sub.Status) === "active" && (
                                                            <button
                                                                onClick={() => handlePauseSub(sub.id || sub.Id)}
                                                                className="flex-1 md:w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded-xl transition-colors uppercase tracking-wider text-[10px]"
                                                            >
                                                                Tạm dừng
                                                            </button>
                                                        )}
                                                        {(sub.status || sub.Status) === "paused" && (
                                                            <button
                                                                onClick={() => handleResumeSub(sub.id || sub.Id)}
                                                                className="flex-1 md:w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-xl transition-colors uppercase tracking-wider text-[10px]"
                                                            >
                                                                Kích hoạt lại
                                                            </button>
                                                        )}
                                                        {(sub.status || sub.Status) !== "cancelled" && (
                                                            <button
                                                                onClick={() => handleCancelSub(sub.id || sub.Id)}
                                                                className="flex-1 md:w-full border border-red-200 text-red-500 hover:bg-red-50 font-bold py-2 rounded-xl transition-colors uppercase tracking-wider text-[10px]"
                                                            >
                                                                Hủy đăng ký
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
