import React, { useEffect, useState } from 'react';
import useStore from '../../store/useStore';
import { Search, Filter, Truck, CheckCircle, XCircle, Check, Package } from 'lucide-react';
import { FaArrowRight } from "react-icons/fa";

export default function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const {
    adminOrders,
    totalItems,
    fetchAllOrdersAdmin,
    updateOrderStatus
  } = useStore();


  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAllOrdersAdmin(currentPage, searchTerm, statusFilter);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, statusFilter, searchTerm, fetchAllOrdersAdmin]);

  const handleUpdateStatus = async (id, newStatus) => {
    if (newStatus === 'Đã hủy' && !window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
      return;
    }
    
    try {
      await updateOrderStatus(id, newStatus);
      alert(`Cập nhật trạng thái sang "${newStatus}" thành công!`);
      await fetchAllOrdersAdmin(currentPage, searchTerm, statusFilter);
    } catch (error) {
      console.error(error);
      alert("Cập nhật trạng thái thất bại!");
    }
  };

  const handleConfirmAll = async () => {
    
    const pendingOrders = (adminOrders || []).filter(o => {
      const currentStatus = o.status || o.Status;
      return currentStatus === 'Chờ xử lý' || currentStatus === 'Đã thanh toán' || currentStatus === 'Pending';
    });

    if (pendingOrders.length === 0) {
      return alert("Không có đơn hàng nào chờ xử lý.");
    }
    if (window.confirm(`Xác nhận tất cả ${pendingOrders.length} đơn hàng đang chờ?`)) {
      try {
        
        await Promise.all(
          pendingOrders.map(order =>
            updateOrderStatus(order.id || order.Id, 'Đã xác nhận')
          )
        );
        await fetchAllOrdersAdmin(currentPage, searchTerm, statusFilter);
        alert("Đã duyệt tất cả đơn!");
      } catch (err) {
        console.error(err);
        alert("Duyệt đơn thất bại!");
      }
    }
  };

  const translateGrind = (type) => {
    switch (Number(type)) { 
      case 1: return "Nguyên Hạt";
      case 2: return "Pha Phin";
      case 3: return "Pha Máy";
      case 4: return "Ủ Lạnh";
      case 5: return "Kiểu Pháp";
      default: return type;
    }
  };

  console.log("Dữ liệu adminOrders thực tế tại component:", adminOrders);

  return (
    <div className="p-6 animate-fade-in">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-montserrat font-bold text-2xl text-gray-800">Quản Lý Đơn Hàng</h1>
          <p className="text-gray-500 text-sm font-nunito flex items-center gap-2">
            Quy trình: <span className="text-blue-500">Xác nhận</span> <FaArrowRight size={10} /> <span className="text-indigo-500">Giao hàng</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button
            onClick={handleConfirmAll}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all text-sm font-bold shadow-sm"
          >
            <CheckCircle size={18} /> Duyệt nhanh đơn chờ
          </button>

          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Mã đơn, khách hàng..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm"
            />
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl outline-none text-sm"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Chờ thanh toán">Chờ thanh toán</option>
            <option value="Đã thanh toán">Đã thanh toán</option>
            <option value="Chờ xử lý">Chờ xử lý</option>
            <option value="Đã xác nhận">Đã xác nhận</option>
            <option value="Đang trung chuyển">Đang trung chuyển</option>
            <option value="Shipper đã nhận">Shipper đã nhận</option>
            <option value="Đang giao">Đang giao</option>
            <option value="Hoàn thành">Hoàn thành</option>
            <option value="Đã hủy">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-nunito text-sm">
            <thead className="bg-gray-50 text-gray-600 font-bold border-b">
              <tr>
                <th className="px-6 py-4">Mã Đơn</th>
                <th className="px-6 py-4">Khách Hàng</th>
                <th className="px-6 py-4">Sản Phẩm</th>
                <th className="px-6 py-4 text-right">Tổng Tiền</th>
                <th className="px-6 py-4 text-center">Trạng Thái</th>
                <th className="px-6 py-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {adminOrders && adminOrders.length > 0 ? (
                adminOrders.map(order => {
                  
                  const orderId = order.id || order.Id;
                  const receiverName = order.receiverName || order.ReceiverName;
                  const receiverPhone = order.receiverPhone || order.ReceiverPhone;
                  const details = order.orderDetails || order.OrderDetails;
                  const finalAmount = order.finalAmount ?? order.FinalAmount ?? 0;
                  const paymentMethod = order.paymentMethod || order.PaymentMethod;
                  const status = order.status || order.Status;

                  return (
                    <tr key={orderId} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-blue-600">{orderId}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-800">{receiverName}</div>
                        <div className="text-xs text-gray-400">{receiverPhone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {details && details.length > 0 ? (
                            details.map((item, idx) => {
                              const pName = item.productName || item.ProductName || item.product?.name || item.Product?.Name;
                              const qty = item.quantity || item.Quantity || 0;
                              const weight = item.weight || item.Weight;
                              const flavor = item.flavorNotes || item.FlavorNotes;
                              const grindId = item.grindingOptionId || item.GrindingOptionId;

                              return (
                                <div key={idx} className="flex flex-col mb-2 border-b border-gray-50 last:border-0 pb-1">
                                  <div className="flex items-center gap-1 text-xs">
                                    <Package size={14} className="text-amber-600" />
                                    <span className="font-medium text-gray-800">{pName}</span>
                                    <span className="text-gray-500 font-bold ml-1">x{qty}</span>
                                  </div>
                                  <div className="text-[10px] text-gray-400 ml-4 mt-0.5">
                                    {weight && <span>{weight}g </span>}
                                    {flavor && <span>| {flavor} </span>}
                                    {grindId && <span>| Kiểu xay: {translateGrind(grindId)}</span>}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <span className="text-red-400 italic text-xs">Không có chi tiết đơn hàng</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-right text-gray-900">
                        {finalAmount.toLocaleString('vi-VN')}₫
                        <div className='text-[10px] text-gray-400 font-normal mt-0.5'>{paymentMethod}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusBadge status={status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          {/* ĐÃ SỬA: Check điều kiện nút bấm hỗ trợ cả trạng thái Pending từ SQL mẫu */}
                          {['Chờ xử lý', 'Đã thanh toán', 'Pending'].includes(status) && (
                            <ActionButton icon={<Check size={16} />} color="blue" onClick={() => handleUpdateStatus(orderId, 'Đã xác nhận')} title="Xác nhận" />
                          )}
                          {status === 'Đã xác nhận' && (
                            <ActionButton icon={<Truck size={16} />} color="indigo" onClick={() => handleUpdateStatus(orderId, 'Đang trung chuyển')} title="Giao hàng" />
                          )}
                          {!['Hoàn thành', 'Đang giao', 'Đã hủy', 'Shipper đã nhận'].includes(status) && (
                            <ActionButton icon={<XCircle size={16} />} color="red" onClick={() => handleUpdateStatus(orderId, 'Đã hủy')} title="Hủy đơn" />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-400 italic">
                    Không tìm thấy đơn hàng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t flex justify-between items-center bg-gray-50/50">
          <span className="text-gray-500 text-xs italic">Tổng cộng: {totalItems || 0} đơn hàng</span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-1.5 border rounded-lg bg-white disabled:opacity-50 hover:bg-gray-50 transition-colors text-xs"
            >
              Trước
            </button>
            <div className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-xs">{currentPage}</div>
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage * 10 >= (totalItems || 0)}
              className="px-4 py-1.5 border rounded-lg bg-white disabled:opacity-50 hover:bg-gray-50 transition-colors text-xs"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const StatusBadge = ({ status }) => {
  const styles = {
    'Chờ thanh toán': 'bg-orange-100 text-orange-600',
    'Đã thanh toán': 'bg-green-100 text-green-600',
    'Chờ xử lý': 'bg-blue-100 text-blue-600',

    'Đã xác nhận': 'bg-purple-100 text-purple-600',
    'Đang trung chuyển': 'bg-indigo-100 text-indigo-600',
    'Shipper đã nhận': 'bg-amber-100 text-amber-600',
    'Đang giao': 'bg-indigo-100 text-indigo-600',
    'Hoàn thành': 'bg-green-100 text-green-600',
    'Đã hủy': 'bg-red-100 text-red-600',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status === 'Pending' ? 'CHỜ XỬ LÝ' : (status || 'Không rõ')}
    </span>
  );
};

const ActionButton = ({ icon, color, onClick, title }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600',
    green: 'bg-green-50 text-green-600 hover:bg-green-600',
    red: 'bg-red-50 text-red-600 hover:bg-red-600',
  };
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg transition-all hover:text-white ${colors[color]}`}
    >
      {icon}
    </button>
  );
};