import React, { useEffect, useState } from 'react';
import useStore from '../../store/useStore';
import {
    Search,
    Plus,
    Pencil,
    Trash2,
    Copy,
    TicketPercent,
    Calendar,
    BadgePercent,
    Truck,
    Ban,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    CircleDollarSign,
    Clock,
    CreditCard
} from 'lucide-react';

export default function AdminVouchers() {
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1); 

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState(null);

    const [voucherForm, setVoucherForm] = useState({
        code: '',
        title: '',
        discountType: 'percent',
        discountValue: 0,
        maxDiscount: 0,
        minOrderValue: 0,
        usageLimit: 1,
        paymentMethod: 'ALL',
        startDate: '',
        endDate: '',
        isActive: true
    });

    const {
        vouchers,
        voucherStats,
        totalItems,
        fetchVouchersAdmin,
        createVoucher,
        updateVoucher,
        deleteVoucher,
        toggleVoucher
    } = useStore();

    const pageSize = 10; 
    const totalPages = Math.ceil(totalItems / pageSize) || 1;

    useEffect(() => {
        fetchVouchersAdmin(page, searchTerm, statusFilter);
    }, [page, searchTerm, statusFilter, fetchVouchersAdmin]);

    const handleStatusChange = (newStatus) => {
        setStatusFilter(newStatus);
        setPage(1);
    };

    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        setSearchTerm(searchInput);
        setPage(1);
    };

    const formatMoney = (value) => {
        return value?.toLocaleString('vi-VN') + '₫';
    };

    const copyCode = (code) => {
        navigator.clipboard.writeText(code);
        alert(`Đã copy mã: ${code}`);
    };

    const handlePageChange = (targetPage) => {
        if (targetPage >= 1 && targetPage <= totalPages) {
            setPage(targetPage); 
        }
    };

    const handleSaveVoucher = async () => {
        try {
            const payload = {
                code: voucherForm.code,
                title: voucherForm.title,
                discountType: voucherForm.discountType,
                discountValue: Number(voucherForm.discountValue),
                maxDiscount: Number(voucherForm.maxDiscount),
                minOrderValue: Number(voucherForm.minOrderValue),
                usageLimit: Number(voucherForm.usageLimit),
                paymentMethod: voucherForm.paymentMethod,
                startDate: voucherForm.startDate,
                endDate: voucherForm.endDate,
                isActive: voucherForm.isActive
            };

            if (editingVoucher) {
                await updateVoucher(editingVoucher.id, payload);
                alert("Cập nhật voucher thành công!");
            } else {
                await createVoucher(payload);
                alert("Tạo voucher thành công!");
            }

            setShowCreateModal(false);
            setEditingVoucher(null);
            setVoucherForm({
                code: '', title: '', discountType: 'percent', discountValue: 0,
                maxDiscount: 0, minOrderValue: 0, usageLimit: 1, paymentMethod: 'ALL',
                startDate: '', endDate: '', isActive: true
            });
            fetchVouchersAdmin(page, searchTerm, statusFilter);
        } catch (error) {
            console.error(error);
            alert("Lưu voucher thất bại!");
        }
    };

    const handleDeleteVoucher = async (id) => {
        if (!window.confirm("Xóa voucher này?")) return;
        try {
            await deleteVoucher(id);
            alert("Xóa voucher thành công!");
            fetchVouchersAdmin(page, searchTerm, statusFilter);
        } catch (err) {
            console.error(err);
            alert("Xóa voucher thất bại!");
        }
    };

    const handleToggleVoucher = async (voucher) => {
        try {
            await toggleVoucher(voucher.id, !voucher.isActive);
            alert("Đổi trạng thái voucher thành công!");
            fetchVouchersAdmin(page, searchTerm, statusFilter);
        } catch (err) {
            console.error(err);
            alert("Đổi trạng thái thất bại!");
        }
    };

    return (
        <div className="p-6 bg-slate-50/50 min-h-screen font-nunito animate-fade-in">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="font-nunito font-bold text-2xl text-slate-800 tracking-tight flex items-center gap-2">
                        <TicketPercent className="text-accent-1 w-7 h-7" /> Quản Lý Chiến Dịch Voucher
                    </h1>
                    <p className="text-slate-500 text-sm mt-1 font-nunito">
                        Tạo và tối ưu các mã giảm giá kích cầu mua sắm hệ thống.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
                    <button
                        onClick={() => {
                            setEditingVoucher(null);
                            setShowCreateModal(true);
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-accent-1 hover:opacity-90 text-white rounded-xl transition-all text-sm font-bold shadow-sm shadow-primary/20 active:scale-95 font-nunito"
                    >
                        <Plus size={18} /> Tạo Voucher Mới
                    </button>
                </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatsCard
                    icon={<TicketPercent size={24} />}
                    title="Voucher đang hoạt động"
                    value={voucherStats?.activeCount ?? 0}
                    color="primary"
                />
                <StatsCard
                    icon={<BadgePercent size={24} />}
                    title="Tổng lượt đã dùng"
                    value={voucherStats?.usedTodayCount ?? 0}
                    color="blue"
                />
                <StatsCard
                    icon={<Truck size={24} />}
                    title="Voucher Miễn Phí Vận Chuyển"
                    value={voucherStats?.freeshipCount ?? 0}
                    color="green"
                />
            </div>

            {/* FILTER & SEARCH BAR */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
                    <input
                        type="text"
                        placeholder="Tìm mã voucher, tên chiến dịch..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm transition-all font-nunito"
                    />
                    <button type="submit" className="absolute left-3 top-3 text-slate-400 hover:text-primary transition-colors">
                        <Search size={18} />
                    </button>
                    {searchInput && (
                        <button 
                            type="button" 
                            onClick={() => { setSearchInput(''); setSearchTerm(''); setPage(1); }}
                            className="absolute right-3 top-3 text-slate-400 hover:text-red-500 text-xs font-bold font-nunito"
                        >✕</button>
                    )}
                </form>

                <div className="flex gap-3 w-full md:w-auto">
                    <select
                        value={statusFilter}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm cursor-pointer hover:border-slate-300 focus:border-primary transition-all text-slate-700 font-bold font-nunito"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="active">🟢 Đang hoạt động</option>
                        <option value="inactive">🔴 Đã tắt</option>
                    </select>
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap font-nunito">
                        <thead className="bg-slate-50/70 text-slate-600 font-bold border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Mã / Thông tin Voucher</th>
                                <th className="px-6 py-4">Hình thức giảm</th>
                                <th className="px-6 py-4">Mức giảm giá</th>
                                <th className="px-6 py-4">Đơn tối thiểu</th>
                                <th className="px-6 py-4">Tình trạng sử dụng</th>
                                <th className="px-6 py-4">Thời gian áp dụng</th>
                                <th className="px-6 py-4 text-center">Trạng thái</th>
                                <th className="px-6 py-4 text-center">Thao tác</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {(vouchers || []).length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-slate-400 font-bold bg-slate-50/20">
                                        Không tìm thấy voucher nào phù hợp.
                                    </td>
                                </tr>
                            ) : (
                                vouchers.map(voucher => (
                                    <tr key={voucher.id} className="hover:bg-slate-50/40 transition-colors group">
                                        {/* Cột 1: Hiển thị cuống vé */}
                                        <td className="px-6 py-4.5">
                                            <div className="flex items-center gap-4">
                                                {/* Thiết kế Coupon Ticket Cutout */}
                                                <div className="relative w-24 h-12 flex flex-col justify-center items-center bg-accent-1/5 border border-accent-1/20 rounded-lg overflow-hidden shrink-0 select-none">
                                                    <div className="absolute -left-1.5 w-3 h-3 bg-white border border-accent-1/20 rounded-full top-1/2 -translate-y-1/2"></div>
                                                    <div className="absolute -right-1.5 w-3 h-3 bg-white border border-accent-1/20 rounded-full top-1/2 -translate-y-1/2"></div>
                                                    <span className="text-accent-1 font-extrabold text-xs tracking-wider uppercase px-2 text-center truncate w-full">{voucher.code}</span>
                                                    <button 
                                                        onClick={() => copyCode(voucher.code)}
                                                        className="text-[9px] text-accent-1/70 font-bold hover:text-accent-1 flex items-center gap-0.5 mt-0.5 font-nunito"
                                                    >
                                                        <Copy size={10} /> Copy
                                                    </button>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800 text-base group-hover:text-primary transition-colors">{voucher.title}</div>
                                                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                                        <CreditCard size={12} /> Áp dụng: {voucher.paymentMethod}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-4.5">
                                            <VoucherType type={voucher.discountType} />
                                        </td>

                                        <td className="px-6 py-4.5">
                                            <div className="font-extrabold text-slate-900 text-base">
                                                {voucher.discountType === 'percent' && `${voucher.discountValue}%`}
                                                {voucher.discountType === 'fixed' && formatMoney(voucher.discountValue)}
                                                {voucher.discountType === 'shipping' && 'Freeship'}
                                            </div>
                                            {voucher.maxDiscount > 0 && (
                                                <div className="text-xs text-slate-400 mt-0.5">
                                                    Giảm tối đa: {formatMoney(voucher.maxDiscount)}
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-6 py-4.5">
                                            <div className="font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-md text-xs inline-block">
                                                {formatMoney(voucher.minOrderValue)}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4.5 w-44">
                                            <div className="flex justify-between items-center text-xs font-bold text-slate-600 mb-1">
                                                <span>Đã dùng</span>
                                                <span className="text-primary">{voucher.usedCount}/{voucher.usageLimit}</span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-primary to-accent-1 transition-all duration-500"
                                                    style={{
                                                        width: `${Math.min(100, ((voucher.usedCount / (voucher.usageLimit || 1)) * 100))}%`
                                                    }}
                                                ></div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4.5">
                                            <div className="text-slate-600 space-y-0.5 text-xs">
                                                <div className="flex items-center gap-1 text-slate-700 font-bold">
                                                    <Clock size={12} className="text-slate-400" /> <span>{voucher.startDate}</span>
                                                </div>
                                                <div className="text-slate-400 pl-4">đến {voucher.endDate}</div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4.5 text-center">
                                            <VoucherStatus active={voucher.isActive} />
                                        </td>

                                        <td className="px-6 py-4.5 text-center">
                                            <div className="flex justify-center gap-1.5">
                                                <ActionButton
                                                    icon={<Pencil size={15} />}
                                                    color="blue"
                                                    title="Chỉnh sửa"
                                                    onClick={() => {
                                                        setEditingVoucher(voucher);
                                                        setVoucherForm({
                                                            code: voucher.code,
                                                            title: voucher.title,
                                                            discountType: voucher.discountType,
                                                            discountValue: voucher.discountValue,
                                                            maxDiscount: voucher.maxDiscount,
                                                            minOrderValue: voucher.minOrderValue,
                                                            usageLimit: voucher.usageLimit,
                                                            paymentMethod: voucher.paymentMethod,
                                                            startDate: voucher.startDate,
                                                            endDate: voucher.endDate,
                                                            isActive: voucher.isActive
                                                        });
                                                        setShowCreateModal(true);
                                                    }}
                                                />
                                                <ActionButton
                                                    icon={voucher.isActive ? <Ban size={15} /> : <CheckCircle size={15} />}
                                                    color={voucher.isActive ? 'primary-light' : 'green'}
                                                    title={voucher.isActive ? 'Tạm dừng áp dụng' : 'Mở kích hoạt'}
                                                    onClick={() => handleToggleVoucher(voucher)}
                                                />
                                                <ActionButton
                                                    icon={<Trash2 size={15} />}
                                                    color="red"
                                                    title="Xóa voucher"
                                                    onClick={() => handleDeleteVoucher(voucher.id)}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* PAGINATION */}
            <div className="flex flex-col sm:flex-row items-center justify-between bg-white px-6 py-4 border border-slate-100 rounded-2xl shadow-sm gap-4 font-nunito">
                <div className="text-sm text-slate-500">
                    Hiển thị <span className="font-bold text-slate-800">{Math.min((page - 1) * pageSize + 1, totalItems)}</span> - <span className="font-bold text-slate-800">{Math.min(page * pageSize, totalItems)}</span> trên tổng <span className="font-bold text-slate-800">{totalItems}</span> dữ liệu
                </div>
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                            key={p}
                            onClick={() => handlePageChange(p)}
                            className={`w-8.5 h-8.5 rounded-xl font-bold text-xs transition-all font-nunito ${
                                page === p
                                    ? "bg-primary text-white shadow-sm shadow-primary/20"
                                    : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                            {p}
                        </button>
                    ))}

                    <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                        className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* MODAL */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in font-nunito">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-2xl space-y-5 shadow-xl border border-slate-100">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                            <h2 className="text-xl font-nunito font-bold text-slate-800 flex items-center gap-2">
                                {editingVoucher ? "✏️ Hiệu Chỉnh Voucher" : "✨ Thiết Lập Chiến Dịch Voucher Tặng Khách"}
                            </h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-sm font-bold transition-colors"
                            >✕</button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-500">Mã Voucher (Viết liền không dấu)</label>
                                <input
                                    placeholder="Ví dụ: FOODIE50K"
                                    value={voucherForm.code}
                                    onChange={(e) => setVoucherForm({ ...voucherForm, code: e.target.value.toUpperCase() })}
                                    className="border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-primary font-nunito"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-500">Tên chương trình hiển thị</label>
                                <input
                                    placeholder="Ví dụ: Tri ân khách hàng thân thiết"
                                    value={voucherForm.title}
                                    onChange={(e) => setVoucherForm({ ...voucherForm, title: e.target.value })}
                                    className="border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-primary font-nunito"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-500">Loại giảm giá</label>
                                <select
                                    value={voucherForm.discountType}
                                    onChange={(e) => setVoucherForm({ ...voucherForm, discountType: e.target.value })}
                                    className="border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-primary bg-white font-nunito font-bold"
                                >
                                    <option value="percent">Giảm theo %</option>
                                    <option value="fixed">Giảm số tiền cố định</option>
                                    <option value="shipping">Miễn phí vận chuyển (Freeship)</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-500">Giá trị giảm (% hoặc Số tiền)</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={voucherForm.discountValue}
                                    onChange={(e) => setVoucherForm({ ...voucherForm, discountValue: e.target.value })}
                                    className="border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-primary font-nunito"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-500">Mức giảm tối đa (Áp dụng cho giảm %)</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={voucherForm.maxDiscount}
                                    onChange={(e) => setVoucherForm({ ...voucherForm, maxDiscount: e.target.value })}
                                    className="border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-primary font-nunito"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-500">Giá trị đơn hàng tối thiểu</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={voucherForm.minOrderValue}
                                    onChange={(e) => setVoucherForm({ ...voucherForm, minOrderValue: e.target.value })}
                                    className="border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-primary font-nunito"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-500">Tổng số lượt phát hành</label>
                                <input
                                    type="number"
                                    placeholder="1"
                                    value={voucherForm.usageLimit}
                                    onChange={(e) => setVoucherForm({ ...voucherForm, usageLimit: e.target.value })}
                                    className="border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-primary font-nunito"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-500">Phương thức thanh toán áp dụng</label>
                                <select
                                    value={voucherForm.paymentMethod}
                                    onChange={(e) => setVoucherForm({ ...voucherForm, paymentMethod: e.target.value })}
                                    className="border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-primary bg-white font-nunito font-bold"
                                >
                                    <option value="ALL">Tất cả phương thức</option>
                                    <option value="COD">Tiền mặt (COD)</option>
                                    <option value="VNPAY">Ví điện tử VNPAY</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-500">Ngày bắt đầu chiến dịch</label>
                                <input
                                    type="datetime-local"
                                    value={voucherForm.startDate}
                                    onChange={(e) => setVoucherForm({ ...voucherForm, startDate: e.target.value })}
                                    className="border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-primary bg-slate-50 font-nunito"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-500">Ngày kết thúc chiến dịch</label>
                                <input
                                    type="datetime-local"
                                    value={voucherForm.endDate}
                                    onChange={(e) => setVoucherForm({ ...voucherForm, endDate: e.target.value })}
                                    className="border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-primary bg-slate-50 font-nunito"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSaveVoucher}
                            className="w-full bg-gradient-to-r from-primary to-accent-1 text-white py-3.5 rounded-xl font-bold hover:opacity-90 transition-all shadow-md shadow-primary/10 mt-2 font-nunito"
                        >
                            {editingVoucher ? "Cập nhật thay đổi" : "Kích hoạt chiến dịch phát hành"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

{/* SUB-COMPONENTS */}
const VoucherStatus = ({ active }) => {
    return (
        <span className={`px-2.5 py-1 rounded-md text-[11px] font-nunito font-bold uppercase tracking-wide inline-block ${
            active ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
        }`}>
            {active ? '● Hoạt động' : '○ Đang tắt'}
        </span>
    );
};

const VoucherType = ({ type }) => {
    const styles = { 
        percent: 'bg-blue-50 text-blue-600 border border-blue-100', 
        fixed: 'bg-purple-50 text-purple-600 border border-purple-100', 
        shipping: 'bg-accent-1/10 text-accent-1 border border-accent-1/20' 
    };
    const labels = { percent: '🎟️ Giảm phần trăm', fixed: '💰 Giảm tiền mặt', shipping: '🚚 FreeShip Toàn Sàn' };
    return (
        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-nunito ${styles[type] || 'bg-slate-100 text-slate-600'}`}>
            {labels[type] || type}
        </span>
    );
};

const ActionButton = ({ icon, color, onClick, title }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-600 hover:bg-blue-500 hover:shadow-blue-200',
        green: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:shadow-emerald-200',
        red: 'bg-rose-50 text-rose-600 hover:bg-rose-500 hover:shadow-rose-200',
        'primary-light': 'bg-primary/10 text-primary hover:bg-primary hover:shadow-primary/20',
    };
    return (
        <button 
            onClick={onClick} 
            title={title} 
            className={`p-2 rounded-xl transition-all hover:text-white hover:shadow-lg active:scale-90 ${colors[color]}`}
        >
            {icon}
        </button>
    );
};

const StatsCard = ({ icon, title, value, color }) => {
    const colors = { 
        primary: 'bg-primary text-white shadow-primary/10', 
        blue: 'bg-blue-500 text-white shadow-blue-500/10', 
        green: 'bg-emerald-500 text-white shadow-emerald-500/10' 
    };
    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between font-nunito">
            <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</p>
                <h3 className="text-3xl font-black text-slate-800 mt-1.5 tracking-tight">{value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${colors[color]}`}>
                {icon}
            </div>
        </div>
    );
};