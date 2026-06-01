import React, { useState } from 'react';
import { 
  Flame, Users, DollarSign, Layers, CheckCircle2, 
  Truck, AlertCircle, RefreshCw, Search, Filter, 
  Download, PauseCircle, PlayCircle, Ban, TrendingUp, 
  Calendar, Printer, Send, ClipboardList, CheckSquare, Square
} from 'lucide-react';

export default function SubscriptionAdmin() {
  // ==========================================
  // 1. DATA MOCK SUBSCRIPTION ĐẦY ĐỦ CHU KỲ
  // ==========================================
  const [subscriptions, setSubscriptions] = useState([
    {
      id: "#REVO-SUB-2026",
      customerName: "Nguyễn Thế Anh",
      email: "theanh@revo.vn",
      productName: "Revo Đậm Đà (Fine Robusta)",
      flavor: "Socola đắng đậm",
      grindType: "Pha Phin",
      weight: "500g",
      quantity: 1,
      price: 185000,
      status: "ACTIVE",
      nextBilling: "2026-06-02", // Đáo hạn đầu tuần tới
      preferredShipDay: "Thứ 3",
    },
    {
      id: "#REVO-SUB-2027",
      customerName: "Trần Thu Hà",
      email: "ha.tran@gmail.com",
      productName: "Revo Đậm Đà (Fine Robusta)",
      flavor: "Trái cây nhiệt đới",
      grindType: "Pha Máy Espresso",
      weight: "500g",
      quantity: 2,
      price: 370000,
      status: "ACTIVE",
      nextBilling: "2026-06-02", // Cùng ngày với Thế Anh
      preferredShipDay: "Thứ 3",
    },
    {
      id: "#REVO-SUB-2028",
      customerName: "Lê Minh Hoàng",
      email: "hoanglm@yahoo.com",
      productName: "Revo Đậm Đà (Fine Robusta)",
      flavor: "Socola đắng đậm",
      grindType: "Hạt nguyên bản",
      weight: "500g",
      quantity: 1,
      price: 185000,
      status: "SKIPPED", // Khách chủ động hoãn kỳ tới từ Portal
      nextBilling: "2026-06-02",
      preferredShipDay: "Thứ 3",
    },
    {
      id: "#REVO-SUB-2029",
      customerName: "Phạm Minh Đức",
      email: "ducpm@Gmail.com",
      productName: "Revo Đậm Đà (Fine Robusta)",
      flavor: "Chocolate sữa",
      grindType: "Pha Phin",
      weight: "500g",
      quantity: 3,
      price: 555000,
      status: "ACTIVE",
      nextBilling: "2026-06-04", // Đáo hạn cuối tuần tới
      preferredShipDay: "Thứ 5",
    },
    {
      id: "#REVO-SUB-2030",
      customerName: "Hoàng Thúy Vy",
      email: "vyht@hotmail.com",
      productName: "Revo Đậm Đà (Fine Robusta)",
      flavor: "Hương hoa cỏ tự nhiên",
      grindType: "Pha Pour-Over",
      weight: "500g",
      quantity: 1,
      price: 185000,
      status: "CANCELLED", // Gói đã hủy
      nextBilling: "---",
      preferredShipDay: "Thứ 3",
    }
  ]);

  // ==========================================
  // 2. STATE QUẢN LÝ BỘ LỌC NÂNG CAO & CHỌN LÔ
  // ==========================================
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('2026-06-01'); // Mặc định lọc tuần đầu tháng 6/2026
  const [endDate, setEndDate] = useState('2026-06-07');
  const [shipDayFilter, setShipDayFilter] = useState('ALL');
  
  const [selectedIds, setSelectedIds] = useState([]); // State xử lý tích chọn hàng loạt
  const [toast, setToast] = useState('');
  const [isProcessingCron, setIsProcessingCron] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  // ==========================================
  // 3. LOGIC XỬ LÝ ĐƠN HÀNG VÀ ĐIỀU PHỐI
  // ==========================================
  
  // Hàm xử lý Tích chọn / Bỏ chọn từng dòng
  const handleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Hàm xử lý Tích chọn TẤT CẢ các đơn đang hiển thị (Thỏa mãn bộ lọc và không bị CANCELLED)
  const handleSelectAllFiltered = (filteredItems) => {
    const validFilteredItems = filteredItems.filter(item => item.status !== 'CANCELLED');
    const validFilteredIds = validFilteredItems.map(item => item.id);
    
    // Kiểm tra xem tất cả các đơn hàng đang lọc đã được chọn chưa
    const isAllSelected = validFilteredIds.length > 0 && validFilteredIds.every(id => selectedIds.includes(id));

    if (isAllSelected) {
      // Bỏ chọn những đơn hàng thuộc bộ lọc hiện tại ra khỏi selectedIds
      setSelectedIds(selectedIds.filter(id => !validFilteredIds.includes(id)));
    } else {
      // Hợp nhất các đơn hàng đang lọc vào danh sách đã chọn (tránh trùng lặp)
      const newSelection = [...new Set([...selectedIds, ...validFilteredIds])];
      setSelectedIds(newSelection);
    }
  };

  // HÀM GOM MẺ RANG HÀNG LOẠT (Bulk Action 1)
  const handleBulkPrintLabels = () => {
    if (selectedIds.length === 0) return showToast("⚠️ Vui lòng tích chọn các đơn hàng cần in tem!");
    showToast(`🖨️ Đang xuất file in ${selectedIds.length} tem định danh mẻ rang cá nhân hóa cho xưởng đóng gói!`);
  };

  // HÀM BẮN VẬN ĐƠN HÀNG LOẠT SANG SHIPPER (Bulk Action 2)
  const handleBulkDeployShipping = () => {
    if (selectedIds.length === 0) return showToast("⚠️ Vui lòng tích chọn các đơn hàng cần đẩy vận chuyển!");
    showToast(`🚚 Đã đẩy dữ liệu ${selectedIds.length} đơn sang GHTK/Viettel Post thành công! Trạng thái Timeline của khách đã chuyển sang 'VẬN CHUYỂN'.`);
    setSelectedIds([]);
  };

  // GIẢ LẬP CRON JOB AUTO-BILLING CHẠY NGẦM LÚC 00:00
  const handleTriggerAutoBilling = () => {
    setIsProcessingCron(true);
    setTimeout(() => {
      showToast("🤖 Hệ thống Auto-Billing: Đã quét chu kỳ rổ đơn tuần này. Tự động charge tiền thành công các gói ACTIVE, bỏ qua các gói SKIPPED.");
      setIsProcessingCron(false);
    }, 1200);
  };

  const updateStatus = (id, newStatus) => {
    setSubscriptions(subscriptions.map(sub => 
      sub.id === id ? { ...sub, status: newStatus, nextBilling: newStatus === 'CANCELLED' ? '---' : sub.nextBilling } : sub
    ));
    // Nếu đơn hàng bị chuyển trạng thái thành CANCELLED, tự động bỏ tích chọn đơn đó
    if (newStatus === 'CANCELLED') {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
    showToast(`Đã chuyển trạng thái đơn ${id} sang ${newStatus}`);
  };

  // ==========================================
  // 4. BỘ THUẬT TOÁN LỌC DỮ LIỆU ĐA TẦNG
  // ==========================================
  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || sub.id.includes(searchTerm);
    const matchesStatus = statusFilter === 'ALL' || sub.status === statusFilter;
    const matchesShipDay = shipDayFilter === 'ALL' || sub.preferredShipDay === shipDayFilter;
    
    // Thuật toán quét khoảng ngày đáo hạn nạp tiền (Date Range Scan)
    let matchesDate = true;
    if (sub.status !== 'CANCELLED' && startDate && endDate) {
      matchesDate = sub.nextBilling >= startDate && sub.nextBilling <= endDate;
    }

    return matchesSearch && matchesStatus && matchesShipDay && matchesDate;
  });

  // ==========================================
  // 5. BẢNG TỰ ĐỘNG GOM MẺ RANG CHO THỢ XƯỞNG (Aggregation View)
  // ==========================================
  const flavorAggregation = filteredSubscriptions
    .filter(sub => sub.status === 'ACTIVE') // Chỉ gom lò những ông thực sự lấy hàng chu kỳ này
    .reduce((acc, current) => {
      const key = `${current.flavor} (${current.grindType})`;
      const weightInGrams = parseInt(current.weight) * current.quantity;
      acc[key] = (acc[key] || 0) + weightInGrams;
      return acc;
    }, {});

  // Tính các chỉ số Subscription đặc thù
  const activeSubs = subscriptions.filter(s => s.status === 'ACTIVE');
  const totalWeightKg = Object.values(flavorAggregation).reduce((a, b) => a + b, 0) / 1000;

  // Kiểm tra xem nút check tổng ở đầu bảng nên hiển thị trạng thái nào dựa trên dữ liệu đang hiển thị
  const visibleValidIds = filteredSubscriptions.filter(item => item.status !== 'CANCELLED').map(item => item.id);
  const isAllFilteredSelected = visibleValidIds.length > 0 && visibleValidIds.every(id => selectedIds.includes(id));

  return (
    <div className="min-h-screen bg-slate-50 font-nunito pb-16 text-slate-800 selection:bg-amber-100">
      
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed top-6 right-6 bg-slate-950 text-white px-5 py-3.5 rounded-xl shadow-2xl z-50 flex items-center gap-3 text-xs md:text-sm border border-slate-800 animate-bounce-short">
          <CheckCircle2 className="text-amber-400 w-5 h-5 shrink-0" />
          <span className="font-semibold">{toast}</span>
        </div>
      )}

      {/* HEADER QUẢN TRỊ */}
      <header className="bg-slate-900 text-white py-4 px-6 shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="font-mono font-black text-2xl text-amber-400 tracking-wider">REVO COFFEE</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded-md font-bold uppercase tracking-widest border border-amber-500/30">
              Vận Hành Hệ Thống Lô Đơn Định Kỳ
            </span>
          </div>
          <button 
            onClick={handleTriggerAutoBilling}
            disabled={isProcessingCron}
            className="bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md"
          >
            <RefreshCw size={14} className={isProcessingCron ? "animate-spin" : ""} />
            {isProcessingCron ? "Đang quét Auto-Billing..." : "Kích Hoạt Auto-Billing Thủ Công"}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 mt-8 space-y-8">
        
        {/* TIÊU ĐỀ TRANG */}
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">MÀN HÌNH ĐIỀU PHỐI XƯỞNG RANG VÀ GIAO ĐƠN HÀNG LOẠT</h1>
          <p className="text-slate-500 text-xs md:text-sm mt-0.5">Hệ thống tự động hóa gom tụ dữ liệu cấu hình hạt, giảm tải thao tác click chuột thủ công.</p>
        </div>

        {/* THÔNG SỐ ĐO LƯỜNG TỔNG QUAN */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tổng doanh thu chu kỳ hiện hành</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{(activeSubs.reduce((sum, s) => sum + s.price, 0)).toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><DollarSign size={20} /></div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tổng số gói Đang chạy (Active)</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{activeSubs.length} Khách hàng</span>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={20} /></div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 border-amber-200 bg-amber-50/20 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Tổng khối lượng hạt mẻ rang lọc theo lô</span>
              <span className="text-2xl font-black text-amber-900 mt-1 block">{totalWeightKg.toFixed(1)} kg Thành phẩm</span>
            </div>
            <div className="p-3 bg-amber-100 text-amber-800 rounded-xl"><Layers size={20} /></div>
          </div>
        </div>

        {/* ==========================================
            BẢNG GOM MẺ RANG TỰ ĐỘNG CHO THỢ XƯỞNG
           ========================================== */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="text-amber-400 animate-pulse" size={18} />
            <h3 className="font-mono font-bold text-sm tracking-wide uppercase text-amber-400">Bảng gom lò mẻ rang tự động (Dành cho thợ rang)</h3>
          </div>
          <p className="text-slate-400 text-xs mb-4">Hệ thống tự động cộng dồn khối lượng dựa trên bộ lọc ngày và gu hạt của các đơn đang Active dưới bảng.</p>
          
          {Object.keys(flavorAggregation).length === 0 ? (
            <p className="text-slate-500 text-xs italic">Không có mẻ rang nào cần chuẩn bị cho bộ lọc hiện tại.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(flavorAggregation).map(([flavorKey, totalGram]) => (
                <div key={flavorKey} className="bg-slate-800 border border-slate-700/60 p-3.5 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">{flavorKey}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Tiêu chuẩn mẻ rang REVO</span>
                  </div>
                  <span className="text-sm font-mono font-black text-amber-400">{(totalGram / 1000).toFixed(1)} kg</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BẢNG ĐIỀU PHỐI ĐƠN HÀNG CHÍNH */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* ==========================================
              BỘ LỌC ĐA TẦNG NÂNG CAO (DATE RANGE & SHIP DAY)
             ========================================== */}
          <div className="p-4 bg-slate-100/80 border-b border-slate-200 flex flex-col gap-4">
            
            {/* Hàng lọc 1: Ô tìm kiếm và Ngày đáo hạn */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              
              <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs shadow-sm focus-within:border-amber-500 transition-colors">
                <Search size={14} className="text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Tìm mã đơn, tên khách..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="outline-none bg-transparent w-full"
                />
              </div>

              <div className="flex items-center gap-2 text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
                <span className="text-slate-400 shrink-0 font-medium">Từ ngày đáo hạn:</span>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                  className="outline-none w-full text-slate-700 font-bold"
                />
              </div>

              <div className="flex items-center gap-2 text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
                <span className="text-slate-400 shrink-0 font-medium">Đến ngày đáo hạn:</span>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  className="outline-none w-full text-slate-700 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white border border-slate-200 px-2 py-1.5 rounded-xl text-xs font-semibold outline-none shadow-sm"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="ACTIVE">Đang hoạt động</option>
                  <option value="SKIPPED">Khách đã hoãn</option>
                  <option value="CANCELLED">Đã hủy gói</option>
                </select>

                <select 
                  value={shipDayFilter}
                  onChange={(e) => setShipDayFilter(e.target.value)}
                  className="bg-white border border-slate-200 px-2 py-1.5 rounded-xl text-xs font-semibold outline-none shadow-sm"
                >
                  <option value="ALL">Tất cả lịch ship</option>
                  <option value="Thứ 3">Giao Thứ 3</option>
                  <option value="Thứ 5">Giao Thứ 5</option>
                </select>
              </div>

            </div>

            {/* ==========================================
                THANH THAO TÁC HÀNG LOẠT (BULK ACTION CONTROL)
               ========================================== */}
            {selectedIds.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-3 animate-fade-in">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <ClipboardList size={16} />
                  <span>Đang chọn {selectedIds.length} đơn hàng trong chu kỳ tuần này để xử lý lô hàng loạt</span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button 
                    onClick={handleBulkPrintLabels}
                    className="bg-white hover:bg-slate-50 border border-amber-300 text-slate-900 text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1.5 shadow-sm w-full sm:w-auto justify-center transition-all"
                  >
                    <Printer size={13} /> In Lô {selectedIds.length} Tem Nhãn Xưởng
                  </button>
                  <button 
                    onClick={handleBulkDeployShipping}
                    className="bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1.5 shadow-sm w-full sm:w-auto justify-center transition-all"
                  >
                    <Send size={13} /> Đẩy Lô {selectedIds.length} Mã Vận Đơn Ship
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* BẢNG HIỂN THỊ DỮ LIỆU ĐƠN HÀNG */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4 w-12 text-center">
                    {/* Nút Checkbox tổng ở đầu bảng */}
                    <button 
                      onClick={() => handleSelectAllFiltered(filteredSubscriptions)}
                      className="text-slate-500 hover:text-slate-700"
                    >
                      {isAllFilteredSelected ? (
                        <CheckSquare size={16} className="text-amber-500" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                  <th className="p-4">Mã Gói & Khách Hàng</th>
                  <th className="p-4">Cấu Hình Gu Hạt Tự Chọn</th>
                  <th className="p-4">Doanh Thu / Chu Kỳ</th>
                  <th className="p-4">Ngày Đáo Hạn Đơn</th>
                  <th className="p-4">Lịch Giao Cố Định</th>
                  <th className="p-4">Trạng Thái Gói</th>
                  <th className="p-4 text-right">Tổng Đài Can Thiệp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredSubscriptions.map((sub) => (
                  <tr 
                    key={sub.id} 
                    className={`transition-colors ${
                      selectedIds.includes(sub.id) ? 'bg-amber-500/5 hover:bg-amber-500/10' : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Hộp Checkbox chọn dòng */}
                    <td className="p-4 text-center">
                      <button 
                        disabled={sub.status === 'CANCELLED'}
                        onClick={() => handleSelectRow(sub.id)}
                        className={`text-slate-400 ${sub.status === 'CANCELLED' ? 'opacity-30 cursor-not-allowed' : 'hover:text-slate-600'}`}
                      >
                        {selectedIds.includes(sub.id) ? (
                          <CheckSquare size={16} className="text-amber-500" />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </td>

                    {/* Tên khách & Mã gói */}
                    <td className="p-4">
                      <span className="font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">{sub.id}</span>
                      <div className="font-bold text-slate-900 mt-1">{sub.customerName}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{sub.email}</div>
                    </td>

                    {/* Cấu hình hạt */}
                    <td className="p-4">
                      <div className="text-slate-900 font-semibold">{sub.productName}</div>
                      <div className="text-slate-500 text-[11px] flex items-center gap-1.5 mt-0.5">
                        <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold text-[10px]">{sub.flavor}</span>
                        <span>•</span>
                        <span className="text-slate-600 font-medium">{sub.grindType}</span>
                        <span>•</span>
                        <span className="font-bold text-amber-700">{sub.weight} (x{sub.quantity})</span>
                      </div>
                    </td>

                    {/* Giá tiền */}
                    <td className="p-4">
                      <span className="font-bold text-slate-900">{(sub.price).toLocaleString('vi-VN')}đ</span>
                      <span className="block text-[10px] text-slate-400 font-normal mt-0.5">Chu kỳ: 2 tuần</span>
                    </td>

                    {/* Ngày đáo hạn thanh toán */}
                    <td className="p-4 font-mono text-slate-700 font-semibold">
                      {sub.nextBilling}
                    </td>

                    {/* Lịch giao cố định */}
                    <td className="p-4">
                      <span className="bg-slate-100 border border-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-md text-[11px]">
                        {sub.preferredShipDay}
                      </span>
                    </td>

                    {/* Trạng thái gói */}
                    <td className="p-4">
                      {sub.status === 'ACTIVE' && (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Đang chạy
                        </span>
                      )}
                      {sub.status === 'SKIPPED' && (
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1 shadow-sm">
                          ⚠️ Khách hoãn kì tới
                        </span>
                      )}
                      {sub.status === 'CANCELLED' && (
                        <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1 shadow-sm">
                          ✕ Đã hủy hẳn
                        </span>
                      )}
                    </td>

                    {/* Quyền can thiệp nhanh của CSKH */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {sub.status === 'ACTIVE' && (
                          <button 
                            onClick={() => updateStatus(sub.id, 'SKIPPED')}
                            className="p-1 hover:bg-amber-50 rounded text-amber-600 transition-colors flex items-center gap-1 text-[11px] font-bold"
                            title="Hoãn kỳ giao hộ khách hàng"
                          >
                            <PauseCircle size={14} /> Hoãn hộ
                          </button>
                        )}
                        {(sub.status === 'SKIPPED' || sub.status === 'CANCELLED') && (
                          <button 
                            onClick={() => updateStatus(sub.id, 'ACTIVE')}
                            className="p-1 hover:bg-emerald-50 rounded text-emerald-600 transition-colors flex items-center gap-1 text-[11px] font-bold"
                            title="Tái kích hoạt gói đăng ký"
                          >
                            <PlayCircle size={14} /> Chạy lại
                          </button>
                        )}
                        {sub.status !== 'CANCELLED' && (
                          <button 
                            onClick={() => {
                              if(window.confirm(`Xác nhận cưỡng chế dừng gói ${sub.id}?`)) {
                                updateStatus(sub.id, 'CANCELLED');
                              }
                            }}
                            className="p-1 hover:bg-rose-50 rounded text-rose-600 transition-colors flex items-center gap-1 text-[11px] font-bold"
                            title="Khóa/Hủy gói do khách vi phạm hoặc yêu cầu"
                          >
                            <Ban size={14} /> Khóa gói
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))}

                {filteredSubscriptions.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-slate-400 font-medium italic">
                      Không tìm thấy dữ liệu gói đăng ký nào khớp với bộ lọc ngày hoặc lịch trình ship đã chọn!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* CHÂN TRANG BẢNG */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 text-slate-400 text-[11px] font-medium flex justify-between items-center">
            <span>Hiển thị thực tế {filteredSubscriptions.length} đơn trên hệ thống tổng</span>
            <span className="font-mono text-slate-500">REVO MASS CONSOLE v3.0</span>
          </div>

        </div>

      </main>
    </div>
  );
}