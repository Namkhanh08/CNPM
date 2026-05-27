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
    ChevronRight
} from 'lucide-react';

export default function AdminVouchers() {
    // SỬA: Tách searchInput (để gõ) và searchTerm (để trigger API) nhằm tránh loop request
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

    // Lấy dữ liệu và các thông tin phân trang từ Zustand store
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

    // Định nghĩa số lượng item trên một trang
    const pageSize = 10; 
    const totalPages = Math.ceil(totalItems / pageSize) || 1;

    
    useEffect(() => {
        fetchVouchersAdmin(page, searchTerm, statusFilter);
    }, [page, searchTerm, statusFilter, fetchVouchersAdmin]);

    // SỬA: Khi đổi bộ lọc trạng thái, chủ động đưa về trang 1 và gọi API luôn
    const handleStatusChange = (newStatus) => {
        setStatusFilter(newStatus);
        setPage(1);
    };

    // SỬA: Hàm xử lý hành động Tìm kiếm khi bấm Enter hoặc click biểu tượng kính lúp
    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        setSearchTerm(searchInput); // Cập nhật searchTerm thực tế để kích hoạt useEffect fetch API
        setPage(1); // Tìm kiếm mới luôn đưa về trang đầu
    };

    const formatMoney = (value) => {
        return value?.toLocaleString('vi-VN') + '₫';
    };

    const copyCode = (code) => {
        navigator.clipboard.writeText(code);
        alert(`Đã copy mã: ${code}`);
    };

    // Chuyển trang
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
                description: voucherForm.description || "",
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
                await updateVoucher(editingVoucher.Id, payload);
                alert("Cập nhật voucher thành công!");
            } else {
                await createVoucher(payload);
                alert("Tạo voucher thành công!");
            }

            setShowCreateModal(false);
            setEditingVoucher(null);
            setVoucherForm({
                code: '',
                title: '',
                description: '',
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
            // Tải lại dữ liệu trang hiện tại sau khi lưu
            fetchVouchersAdmin(page, searchTerm, statusFilter);
        } catch (error) {
            console.error(error);
            alert("Lưu voucher thất bại!");
        }
    };

    const handleDeleteVoucher = async (id) => {
        if (!window.confirm("Xóa voucher này?")) {
            return;
        }
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
            await toggleVoucher(voucher.Id, !voucher.IsActive);
            alert("Đổi trạng thái voucher thành công!");
            fetchVouchersAdmin(page, searchTerm, statusFilter);
        } catch (err) {
            console.error(err);
            alert("Đổi trạng thái thất bại!");
        }
    };

    return (
        <div className="p-6 animate-fade-in">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="font-montserrat font-bold text-2xl text-gray-800">
                        Quản Lý Voucher
                    </h1>
                    <p className="text-gray-500 text-sm font-nunito flex items-center gap-2">
                        Marketing:
                        <span className="text-green-500">Tạo voucher</span>
                        →
                        <span className="text-indigo-500">Theo dõi sử dụng</span>
                    </p>
                </div>

                <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
                    {/* CREATE BUTTON */}
                    <button
                        onClick={() => {
                            setEditingVoucher(null);
                            setShowCreateModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all text-sm font-bold shadow-sm"
                    >Tạo Vouchers</button>
                    
                    {showCreateModal && (
                        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl space-y-5">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold">
                                        {editingVoucher ? "Chỉnh Sửa Voucher" : "Tạo Voucher"}
                                    </h2>
                                    <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="text-gray-400 hover:text-red-500"
                                    >✕</button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        placeholder="Mã voucher"
                                        value={voucherForm.code}
                                        onChange={(e) => setVoucherForm({ ...voucherForm, code: e.target.value })}
                                        className="border p-3 rounded-xl"
                                    />
                                    <input
                                        placeholder="Tiêu đề"
                                        value={voucherForm.title}
                                        onChange={(e) => setVoucherForm({ ...voucherForm, title: e.target.value })}
                                        className="border p-3 rounded-xl"
                                    />
                                    <select
                                        value={voucherForm.discountType}
                                        onChange={(e) => setVoucherForm({ ...voucherForm, discountType: e.target.value })}
                                        className="border p-3 rounded-xl"
                                    >
                                        <option value="percent">Giảm %</option>
                                        <option value="fixed">Giảm tiền</option>
                                        <option value="shipping">Freeship</option>
                                    </select>
                                    <input
                                        type="number"
                                        placeholder="Giá trị giảm"
                                        value={voucherForm.discountValue}
                                        onChange={(e) => setVoucherForm({ ...voucherForm, discountValue: e.target.value })}
                                        className="border p-3 rounded-xl"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Giảm tối đa"
                                        value={voucherForm.maxDiscount}
                                        onChange={(e) => setVoucherForm({ ...voucherForm, maxDiscount: e.target.value })}
                                        className="border p-3 rounded-xl"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Đơn tối thiểu"
                                        value={voucherForm.minOrderValue}
                                        onChange={(e) => setVoucherForm({ ...voucherForm, minOrderValue: e.target.value })}
                                        className="border p-3 rounded-xl"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Giới hạn lượt dùng"
                                        value={voucherForm.usageLimit}
                                        onChange={(e) => setVoucherForm({ ...voucherForm, usageLimit: e.target.value })}
                                        className="border p-3 rounded-xl"
                                    />
                                    <select
                                        value={voucherForm.paymentMethod}
                                        onChange={(e) => setVoucherForm({ ...voucherForm, paymentMethod: e.target.value })}
                                        className="border p-3 rounded-xl"
                                    >
                                        <option value="ALL">ALL</option>
                                        <option value="COD">COD</option>
                                        <option value="VNPAY">VNPAY</option>
                                    </select>
                                    <input
                                        type="datetime-local"
                                        value={voucherForm.startDate}
                                        onChange={(e) => setVoucherForm({ ...voucherForm, startDate: e.target.value })}
                                        className="border p-3 rounded-xl"
                                    />
                                    <input
                                        type="datetime-local"
                                        value={voucherForm.endDate}
                                        onChange={(e) => setVoucherForm({ ...voucherForm, endDate: e.target.value })}
                                        className="border p-3 rounded-xl"
                                    />
                                </div>

                                <button
                                    onClick={handleSaveVoucher}
                                    className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700"
                                >
                                    {editingVoucher ? "Chỉnh sửa Voucher" : "Tạo Voucher"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* SEARCH BOX BỌC TRONG FORM ĐỂ SUBMIT KHI ANTER */}
                    <form onSubmit={handleSearchSubmit} className="relative flex-1 md:w-72">
                        <input
                            type="text"
                            placeholder="Tìm mã voucher (Ấn Enter)..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 outline-none text-sm"
                        />
                        <button type="submit" className="absolute left-3 top-2.5 text-gray-400 hover:text-green-600">
                            <Search size={18} />
                        </button>
                        {searchInput && (
                            <button 
                                type="button" 
                                onClick={() => { setSearchInput(''); setSearchTerm(''); setPage(1); }}
                                className="absolute right-3 top-2.5 text-gray-400 hover:text-red-500 text-xs font-bold"
                            >✕</button>
                        )}
                    </form>

                    {/* FILTER STATUS */}
                    <select
                        value={statusFilter}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl outline-none text-sm cursor-pointer"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="active">Đang hoạt động</option>
                        <option value="inactive">Đã tắt</option>
                    </select>
                </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                <StatsCard
                    icon={<TicketPercent size={22} />}
                    title="Voucher đang hoạt động"
                    value={voucherStats?.activeCount ?? 0}
                    color="green"
                />
                <StatsCard
                    icon={<BadgePercent size={22} />}
                    title="Tổng lượt đã sử dụng"
                    value={voucherStats?.usedTodayCount ?? 0}
                    color="blue"
                />
                <StatsCard
                    icon={<Truck size={22} />}
                    title="Voucher freeship"
                    value={voucherStats?.freeshipCount ?? 0}
                    color="indigo"
                />
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left font-nunito text-sm">
                        <thead className="bg-gray-50 text-gray-600 font-bold border-b">
                            <tr>
                                <th className="px-6 py-4">Mã Voucher</th>
                                <th className="px-6 py-4">Loại</th>
                                <th className="px-6 py-4">Giảm Giá</th>
                                <th className="px-6 py-4">Điều Kiện</th>
                                <th className="px-6 py-4">Đã Dùng</th>
                                <th className="px-6 py-4">Hiệu Lực</th>
                                <th className="px-6 py-4">Thanh Toán</th>
                                <th className="px-6 py-4 text-center">Trạng Thái</th>
                                <th className="px-6 py-4 text-center">Thao Tác</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {(vouchers || []).length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="px-6 py-10 text-center text-gray-400 font-medium">
                                        Không tìm thấy voucher nào phù hợp.
                                    </td>
                                </tr>
                            ) : (
                                vouchers.map(voucher => (
                                    <tr key={voucher.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center text-accent-1">
                                                    <TicketPercent size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-primary">{voucher.code}</div>
                                                    <div className="text-xs text-gray-400">{voucher.title}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <VoucherType type={voucher.discountType} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-800">
                                                {voucher.discountType === 'percent' && `${voucher.discountValue}%`}
                                                {voucher.discountType === 'fixed' && formatMoney(voucher.discountValue)}
                                                {voucher.discountType === 'shipping' && 'Freeship'}
                                            </div>
                                            {voucher.maxDiscount && (
                                                <div className="text-xs text-gray-400">
                                                    Tối đa {formatMoney(voucher.maxDiscount)}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium">{formatMoney(voucher.minOrderValue)}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-primary">
                                                {voucher.usedCount}/{voucher.usageLimit}
                                            </div>
                                            <div className="w-full h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                                                <div
                                                    className="h-full bg-green-500"
                                                    style={{
                                                        width: `${Math.min(100, ((voucher.usedCount / (voucher.usageLimit || 1)) * 100))}%`
                                                    }}
                                                ></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar size={14} className="text-gray-400" />
                                                <div>
                                                    <div>{voucher.startDate}</div>
                                                    <div className="text-gray-400 text-xs">đến {voucher.endDate}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`
                                                px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider
                                                ${voucher.paymentMethod === 'VNPAY'
                                                    ? 'bg-blue-100 text-blue-600'
                                                    : 'bg-gray-100 text-gray-600'
                                                }
                                            `}>
                                                {voucher.paymentMethod}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <VoucherStatus active={voucher.isActive} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-2">
                                                <ActionButton
                                                    icon={<Copy size={16} />}
                                                    color="gray"
                                                    onClick={() => copyCode(voucher.code)}
                                                    title="Copy mã"
                                                />
                                                <ActionButton
                                                    icon={<Pencil size={16} />}
                                                    color="blue"
                                                    title="Chỉnh sửa"
                                                    onClick={() => {
                                                        setEditingVoucher(voucher);
                                                        setVoucherForm({
                                                            code: voucher.Code,
                                                            title: voucher.Title,
                                                            discountType: voucher.DiscountType,
                                                            discountValue: voucher.DiscountValue,
                                                            maxDiscount: voucher.MaxDiscount,
                                                            minOrderValue: voucher.MinOrderValue,
                                                            usageLimit: voucher.UsageLimit,
                                                            paymentMethod: voucher.PaymentMethod,
                                                            startDate: voucher.StartDate,
                                                            endDate: voucher.EndDate,
                                                            isActive: voucher.IsActive
                                                        });
                                                        setShowCreateModal(true);
                                                    }}
                                                />
                                                <ActionButton
                                                    icon={voucher.IsActive ? <Ban size={16} /> : <CheckCircle size={16} />}
                                                    color={voucher.IsActive ? 'orange' : 'green'}
                                                    title={voucher.IsActive ? 'Tắt voucher' : 'Kích hoạt'}
                                                    onClick={() => handleToggleVoucher(voucher)}
                                                />
                                                <ActionButton
                                                    icon={<Trash2 size={16} />}
                                                    color="red"
                                                    onClick={() => handleDeleteVoucher(voucher.Id)}
                                                    title="Xóa"
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

            {/* PHÂN TRANG (PAGINATION) */}
            <div className="flex items-center justify-between bg-white px-6 py-4 border border-gray-100 rounded-2xl shadow-sm font-nunito">
                <div className="text-sm text-gray-500">
                    Hiển thị từ <span className="font-semibold">{Math.min((page - 1) * pageSize + 1, totalItems)}</span> đến{" "}
                    <span className="font-semibold">{Math.min(page * pageSize, totalItems)}</span> trong tổng số{" "}
                    <span className="font-semibold">{totalItems}</span> voucher
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-all"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                            key={p}
                            onClick={() => handlePageChange(p)}
                            className={`w-9 h-9 rounded-xl font-bold text-sm transition-all ${
                                page === p
                                    ? "bg-green-600 text-white shadow-md shadow-green-600/20"
                                    : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            {p}
                        </button>
                    ))}

                    <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                        className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-all"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

        </div>
    );
}

const VoucherStatus = ({ active }) => {
    return (
        <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {active ? 'Đang hoạt động' : 'Đã tắt'}
        </span>
    );
};

const VoucherType = ({ type }) => {
    const styles = { percent: 'bg-blue-100 text-blue-600', fixed: 'bg-purple-100 text-purple-600', shipping: 'bg-orange-100 text-orange-600' };
    const labels = { percent: 'Giảm %', fixed: 'Giảm tiền', shipping: 'Freeship' };
    return (
        <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${styles[type] || 'bg-gray-100 text-gray-600'}`}>
            {labels[type] || type}
        </span>
    );
};

const ActionButton = ({ icon, color, onClick, title }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-600 hover:bg-blue-600',
        green: 'bg-green-50 text-green-600 hover:bg-green-600',
        red: 'bg-red-50 text-red-600 hover:bg-red-600',
        orange: 'bg-orange-50 text-orange-600 hover:bg-orange-600',
        gray: 'bg-gray-100 text-gray-600 hover:bg-gray-600',
    };
    return (
        <button onClick={onClick} title={title} className={`p-2 rounded-lg transition-all hover:text-white ${colors[color]}`}>
            {icon}
        </button>
    );
};

const StatsCard = ({ icon, title, value, color }) => {
    const colors = { green: 'bg-green-100 text-green-600', blue: 'bg-blue-100 text-blue-600', indigo: 'bg-indigo-100 text-indigo-600' };
    return (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-400 text-sm font-medium">{title}</p>
                    <h3 className="text-3xl font-black text-gray-800 mt-2">{value}</h3>
                </div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colors[color]}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
};