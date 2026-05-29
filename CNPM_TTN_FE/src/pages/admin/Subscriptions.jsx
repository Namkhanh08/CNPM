import React, { useState, useEffect } from 'react';
import { Search, Filter, PlayCircle, PauseCircle, XCircle, RefreshCw, MapPin, Package, Calendar, User, Phone } from 'lucide-react';
import API from '../../services/api';

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [cronRunning, setCronRunning] = useState(false);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        pageSize,
        status: statusFilter === 'all' ? null : statusFilter,
        searchTerm: searchTerm.trim() || null
      };
      const res = await API.adminGetSubscriptions(params);
      if (res.data && res.data.Success) {
        setSubscriptions(res.data.Data.Items || []);
        setTotalCount(res.data.Data.TotalCount || 0);
      }
    } catch (err) {
      console.error("Fetch subscriptions failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchSubscriptions();
  };

  const handleUpdateStatus = async (id, newStatus) => {
    let confirmMsg = "";
    if (newStatus === "active") confirmMsg = `Xác nhận kích hoạt lại gói đăng ký #${id}?`;
    else if (newStatus === "paused") confirmMsg = `Xác nhận tạm dừng gói đăng ký #${id}?`;
    else if (newStatus === "cancelled") confirmMsg = `Xác nhận hủy gói đăng ký #${id}?`;

    if (window.confirm(confirmMsg)) {
      try {
        const res = await API.adminUpdateSubscriptionStatus(id, newStatus);
        if (res.data && res.data.Success) {
          alert(res.data.Message || "Cập nhật thành công!");
          fetchSubscriptions();
        }
      } catch (err) {
        alert(err.response?.data?.Message || err.response?.data?.message || "Cập nhật thất bại!");
      }
    }
  };

  const handleRunCron = async () => {
    setCronRunning(true);
    try {
      const res = await API.processDueSubscriptions();
      if (res.data && res.data.Success) {
        alert("Đã chạy xử lý quét hóa đơn định kỳ thành công!");
        fetchSubscriptions();
      }
    } catch (err) {
      alert(err.response?.data?.Message || err.response?.data?.message || "Lỗi khi chạy quét đơn định kỳ!");
    } finally {
      setCronRunning(false);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'active', label: 'Đang hoạt động (Active)' },
    { value: 'paused', label: 'Tạm dừng (Paused)' },
    { value: 'cancelled', label: 'Đã hủy (Cancelled)' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-montserrat font-bold text-2xl">Quản Lý Đăng Ký Định Kỳ</h1>
          <p className="text-sm text-gray-500 font-nunito mt-1">Theo dõi, cập nhật trạng thái và kích hoạt các đợt giao cà phê định kỳ.</p>
        </div>
        
        <button
          onClick={handleRunCron}
          disabled={cronRunning}
          className="flex items-center gap-2 bg-[#7F5539] hover:bg-[#5C3D2E] text-white px-5 py-2.5 rounded-xl font-bold font-nunito text-sm shadow-md transition disabled:opacity-50"
        >
          <RefreshCw size={16} className={cronRunning ? "animate-spin" : ""} />
          {cronRunning ? "Đang xử lý..." : "Quét Đơn Đến Hạn Ngay"}
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center mb-6 gap-4">
        {/* Search Form */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-auto flex-1 max-w-md">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Tên KH, SĐT, Sản phẩm..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#7F5539] font-nunito text-sm shadow-sm"
            />
            <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
          </div>
          <button type="submit" className="bg-primary text-white px-5 rounded-xl font-bold font-nunito text-sm hover:bg-black transition shadow-sm">
            Tìm kiếm
          </button>
        </form>

        {/* Filter Dropdown */}
        <div className="relative w-full md:w-auto">
          <select 
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-56 pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#7F5539] font-nunito text-sm shadow-sm appearance-none cursor-pointer"
          >
            {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <Filter size={16} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-nunito text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Mã Gói</th>
                <th className="px-6 py-4">Khách Hàng (Tài khoản)</th>
                <th className="px-6 py-4">Thông Tin Nhận Hàng</th>
                <th className="px-6 py-4">Sản Phẩm & Cấu Hình</th>
                <th className="px-6 py-4">Lịch Trình</th>
                <th className="px-6 py-4 text-center">Trạng Thái</th>
                <th className="px-6 py-4 text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500 font-semibold">
                    Đang tải dữ liệu đăng ký...
                  </td>
                </tr>
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500 font-bold">
                    Không tìm thấy gói đăng ký nào.
                  </td>
                </tr>
              ) : (
                subscriptions.map(sub => {
                  const id = sub.Id ?? sub.id;
                  const prodName = sub.ProductName ?? sub.productName ?? 'Sản phẩm';
                  const prodImg = sub.ProductImage ?? sub.productImage;
                  const weight = sub.Weight ?? sub.weight ?? '250g';
                  const grindName = sub.GrindingOptionName ?? sub.grindingOptionName ?? 'Nguyên hạt';
                  const flavor = sub.FlavorNotes ?? sub.flavorNotes ?? 'Original';
                  const qty = sub.Quantity ?? sub.quantity ?? 1;
                  const freq = sub.Frequency ?? sub.frequency;
                  const nextDate = sub.NextDeliveryDate ?? sub.nextDeliveryDate;
                  const receiverName = sub.ReceiverName ?? sub.receiverName;
                  const receiverPhone = sub.ReceiverPhone ?? sub.receiverPhone;
                  const province = sub.ShippingProvince ?? sub.shippingProvince;
                  const district = sub.ShippingDistrict ?? sub.shippingDistrict;
                  const ward = sub.ShippingWard ?? sub.shippingWard;
                  const detailAddr = sub.ShippingDetailAddress ?? sub.shippingDetailAddress;
                  const userEmail = sub.UserEmail ?? sub.userEmail;
                  const userFullName = sub.UserFullName ?? sub.userFullName ?? 'Khách';
                  const status = sub.Status ?? sub.status;

                  return (
                    <tr key={id} className="hover:bg-gray-50 transition-colors">
                      {/* Mã Gói */}
                      <td className="px-6 py-4 font-bold text-primary">#{id}</td>

                      {/* Khách hàng tài khoản */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-gray-400" />
                          <span className="font-bold">{userFullName}</span>
                        </div>
                        {userEmail && (
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <span className="truncate max-w-[150px]">{userEmail}</span>
                          </div>
                        )}
                      </td>

                      {/* Thông tin nhận hàng */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800">{receiverName}</div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                          <Phone size={12} />
                          <span>{receiverPhone}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1 max-w-[220px] truncate" title={`${detailAddr}, ${ward}, ${district}, ${province}`}>
                          <MapPin size={12} className="shrink-0" />
                          <span className="truncate">{detailAddr}, {ward}, {district}, {province}</span>
                        </div>
                      </td>

                      {/* Sản phẩm & Cấu hình */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {prodImg && (
                            <img src={prodImg} alt={prodName} className="w-10 h-10 object-contain rounded bg-gray-50 shrink-0" />
                          )}
                          <div>
                            <div className="font-bold text-gray-800 line-clamp-1 max-w-[180px]">{prodName}</div>
                            <div className="text-[11px] text-[#7F5539] font-medium mt-0.5">
                              {weight} | {grindName} | {flavor} | x{qty}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Lịch trình */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full inline-block uppercase">
                          {freq === 'weekly' ? 'Hàng tuần' : freq === 'biweekly' ? '2 tuần/lần' : 'Hàng tháng'}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1.5">
                          <Calendar size={12} />
                          <span>Kỳ sau: {nextDate ? new Date(nextDate).toLocaleDateString('vi-VN') : 'Chưa định'}</span>
                        </div>
                      </td>

                      {/* Trạng thái */}
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          status === 'active' ? 'bg-green-100 text-green-700' :
                          status === 'paused' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {status === 'active' ? 'Đang chạy' :
                           status === 'paused' ? 'Tạm dừng' : 'Đã hủy'}
                        </span>
                      </td>

                      {/* Hành động */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {status !== 'active' && (
                            <button 
                              onClick={() => handleUpdateStatus(id, 'active')} 
                              className="p-1.5 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-lg transition" 
                              title="Kích hoạt lại"
                            >
                              <PlayCircle size={18} />
                            </button>
                          )}
                          {status === 'active' && (
                            <button 
                              onClick={() => handleUpdateStatus(id, 'paused')} 
                              className="p-1.5 bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white rounded-lg transition" 
                              title="Tạm dừng gói"
                            >
                              <PauseCircle size={18} />
                            </button>
                          )}
                          {status !== 'cancelled' && (
                            <button 
                              onClick={() => handleUpdateStatus(id, 'cancelled')} 
                              className="p-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition" 
                              title="Hủy gói đăng ký"
                            >
                              <XCircle size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-100 font-nunito text-sm">
            <span className="text-gray-500">
              Hiển thị trang <strong className="text-gray-700">{page}</strong> trên <strong className="text-gray-700">{totalPages}</strong> ({totalCount} gói đăng ký)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium bg-white"
              >
                Trước
              </button>
              <button
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium bg-white"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
