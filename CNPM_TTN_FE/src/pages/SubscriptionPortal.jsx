import React, { useState, useEffect } from 'react';
import {
  Settings,
  RotateCcw,
  X,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Crown,
  Coffee,
  Sparkles,
  ArrowRight,
  CreditCard,
  History,
  Truck,
  CheckCircle2,
  Filter
} from 'lucide-react';

import useStore from '../store/useStore';

export default function MultiSubscriptionPortal() {
  // =========================================================
  // STORE
  // =========================================================
  const {
    subscriptions = [],
    fetchSubscriptions,
    toggleSkipSubscription,
    cancelSubscription,
    updateSubscriptionConfig
  } = useStore();
  const user = useStore((state) => state.user);

  // =========================================================
  // STATES
  // =========================================================
  const [activeSubId, setActiveSubId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, ACTIVE, SKIPPED, CANCELLED

  // =========================================================
  // FETCH DATA FROM DATABASE
  // =========================================================
  useEffect(() => {
    fetchSubscriptions();
  }, []);

  // =========================================================
  // FILTERED SUBSCRIPTIONS
  // =========================================================
  const filteredSubscriptions = subscriptions.filter(sub => {
    if (statusFilter === 'ALL') return true;
    return sub.status === statusFilter;
  });

  // =========================================================
  // AUTO SELECT FIRST FILTERED SUB
  // =========================================================
  useEffect(() => {
    if (filteredSubscriptions.length > 0) {
      // Nếu gói hiện tại không nằm trong danh sách lọc, tự động chọn gói đầu tiên của danh sách lọc
      const isStillAvailable = filteredSubscriptions.some(sub => sub.id === activeSubId);
      if (!isStillAvailable) {
        setActiveSubId(filteredSubscriptions[0].id);
      }
    }
  }, [filteredSubscriptions, activeSubId, statusFilter]);

  // Fallback chọn gói đầu tiên tổng thể nếu chưa chọn gì
  useEffect(() => {
    if (subscriptions.length > 0 && !activeSubId) {
      setActiveSubId(subscriptions[0].id);
    }
  }, [subscriptions, activeSubId]);

  // =========================================================
  // CURRENT SUB
  // =========================================================
  const currentSub = subscriptions.find((sub) => sub.id === activeSubId) || filteredSubscriptions[0] || subscriptions[0];

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] font-nunito">
        <div className="text-center p-8 max-w-sm">
          <div className="w-16 h-16 bg-primary text-accent-1 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-spin shadow-xl">
            <Coffee size={24} />
          </div>
          <h2 className="text-xl font-bold text-primary mb-2 tracking-wide">
            Đang tải không gian đăng ký...
          </h2>
          <p className="text-sm text-neutral-500 leading-relaxed">
            Hệ thống đang chuẩn bị các đặc quyền và gói dịch vụ dành riêng cho bạn.
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // DYNAMIC OPTIONS FROM DATABASE
  // =========================================================
  const getDynamicFlavors = () => {
    if (!currentSub) return [];
    if (Array.isArray(currentSub.product?.flavors)) return currentSub.product.flavors;
    if (Array.isArray(currentSub.flavors)) return currentSub.flavors;
    if (typeof currentSub.product?.flavorNotes === 'string') {
      return currentSub.product.flavorNotes.split(',').map(item => item.trim());
    }
    return currentSub.flavor ? [currentSub.flavor] : [];
  };

  const getDynamicGrinds = () => {
    if (!currentSub) return [];
    if (Array.isArray(currentSub.product?.grindTypes)) return currentSub.product.grindTypes;
    if (Array.isArray(currentSub.grindTypes)) return currentSub.grindTypes;
    if (typeof currentSub.product?.availableGrinds === 'string') {
      return currentSub.product.availableGrinds.split(',').map(item => item.trim());
    }
    return currentSub.grindType ? [currentSub.grindType] : [];
  };

  const availableFlavorsFromDb = getDynamicFlavors();
  const availableGrindsFromDb = getDynamicGrinds();

  // =========================================================
  // ACTIONS
  // =========================================================
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleToggleSkip = async (id) => {
    try {
      await toggleSkipSubscription(id);
      triggerToast('Đã cập nhật trạng thái lịch giao định kỳ thành công');
    } catch (error) {
      console.error(error);
      triggerToast('Không thể cập nhật lịch giao, vui lòng thử lại');
    }
  };

  const handleCancelSub = async (id) => {
    const confirmCancel = window.confirm(
      'Hành động này sẽ tạm dừng toàn bộ đặc quyền ưu đãi của gói định kỳ hiện tại. Bạn có chắc chắn muốn hủy?'
    );
    if (!confirmCancel) return;

    try {
      await cancelSubscription(id);
      triggerToast('Đã dừng gói dịch vụ đăng ký định kỳ');
    } catch (error) {
      console.error(error);
      triggerToast('Gặp lỗi khi hủy gói, vui lòng liên hệ CSKH để được hỗ trợ');
    }
  };

  const openConfigModal = (sub) => {
    setModalData({ ...sub });
    setIsModalOpen(true);
  };

  const handleSaveConfig = async () => {
    try {
      await updateSubscriptionConfig(modalData.id, {
        flavor: modalData.flavor,
        grindType: modalData.grindType
      });
      setIsModalOpen(false);
      triggerToast('Cập nhật cấu hình hương vị thành công');
    } catch (error) {
      console.error(error);
      triggerToast('Cập nhật cấu hình thất bại');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-primary antialiased pb-24 relative font-nunito selection:bg-accent-1/20">
      
      <style>{`
        @keyframes modalEnter {
          from { opacity: 0; transform: scale(0.97) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes toastEnter {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-modal-enter { animation: modalEnter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-toast-enter { animation: toastEnter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        /* Ẩn scrollbar cho danh sách vuốt ngang trên mobile */
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-primary text-white px-6 py-3.5 rounded-2xl shadow-xl z-50 flex items-center gap-3 border border-white/10 animate-toast-enter backdrop-blur-md">
          <div className="w-5 h-5 rounded-lg bg-accent-1/20 flex items-center justify-center text-accent-1">
            <ShieldCheck size={14} />
          </div>
          <span className="font-semibold text-xs tracking-wide whitespace-nowrap">{toastMessage}</span>
        </div>
      )}

      {/* HEADER */}
      <header className="sticky top-0 bg-[#FAF9F6]/80 backdrop-blur-md border-b border-neutral-200/50 py-4 px-6 md:px-12 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary text-accent-1 rounded-xl flex items-center justify-center font-bold text-base shadow-md">R</div>
            <div className="flex flex-col text-left">
              <span className="font-black text-lg text-primary tracking-wider leading-none">REVO</span>
              <span className="text-[9px] font-bold text-accent-1 tracking-widest uppercase mt-1">PREMIUM HUB</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-neutral-200/60 text-primary px-4 py-2 rounded-xl shadow-sm">
              <Crown size={14} className="text-accent-1" fill="currentColor" />
              <span className="font-bold text-xs tracking-wide text-neutral-700">{user?.name || "Premium Member"}</span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN PORTAL SPACE */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 mt-8 relative z-10">
        
        {/* HERO TITLE BLOCK */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200/60 pb-6">
          <div className="text-left">
            <div className="flex items-center gap-2 text-accent-1 text-xs font-bold tracking-widest uppercase mb-1">
              <Sparkles size={14} /> Quản lý dịch vụ thông minh
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-primary tracking-tight">Gói Đăng Ký Định Kỳ</h1>
          </div>
          
          {/* FILTER TABS - Giúp thu gọn và tìm kiếm cực nhanh */}
          <div className="flex items-center gap-1.5 bg-neutral-200/50 p-1 rounded-xl self-start md:self-center overflow-x-auto no-scrollbar max-w-full">
            {[
              { key: 'ALL', label: 'Tất cả' },
              { key: 'ACTIVE', label: 'Đang giao' },
              { key: 'SKIPPED', label: 'Tạm hoãn' },
              { key: 'CANCELLED', label: 'Đã đóng' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap ${
                  statusFilter === tab.key 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'text-neutral-500 hover:text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* WORKSPACE LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================= */}
          {/* MOBILE VIEW: HORIZONTAL SCROLL CARDS (Ẩn trên Desktop) */}
          {/* ========================================================= */}
          <div className="block lg:hidden w-full -mb-2">
            <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3 px-1 flex items-center gap-2">
              <Layers size={14} className="text-accent-1" /> Bạn có {filteredSubscriptions.length} gói phù hợp
            </div>
            
            <div className="flex gap-3 overflow-x-auto pb-4 pt-1 px-1 no-scrollbar snap-x snap-mandatory">
              {filteredSubscriptions.map((sub) => {
                const isSelected = sub.id === activeSubId;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSubId(sub.id)}
                    className={`
                      snap-start shrink-0 w-[280px] text-left p-4 rounded-xl border transition-all duration-200 relative flex flex-col justify-between min-h-[115px]
                      ${isSelected ? 'bg-primary border-primary shadow-md text-white' : 'bg-white border-neutral-200 shadow-sm text-primary'}
                    `}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${isSelected ? 'bg-white/10 text-accent-1' : 'bg-neutral-50 text-neutral-400 border border-neutral-200'}`}>
                        #{sub.id}
                      </span>
                      <span className={`text-[11px] font-bold ${sub.status === 'ACTIVE' ? 'text-emerald-500' : sub.status === 'SKIPP0ED' ? 'text-amber-500' : 'text-neutral-400'}`}>
                        • {sub.status === 'ACTIVE' ? 'Đang giao' : sub.status === 'SKIPPED' ? 'Hoãn' : 'Đóng'}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold truncate mt-2 tracking-tight">{sub.productName}</h4>
                    <div className="flex justify-between items-center border-t border-neutral-100/10 pt-2 mt-2 text-xs opacity-90">
                      <span className="font-medium text-[11px] opacity-70">{sub.frequency}</span>
                      <span className={`font-extrabold ${isSelected ? 'text-accent-1' : 'text-primary'}`}>
                        {sub.price.toLocaleString('vi-VN')}₫
                      </span>
                    </div>
                  </button>
                );
              })}
              {filteredSubscriptions.length === 0 && (
                <div className="w-full text-center py-6 bg-white rounded-xl border text-xs text-neutral-400 italic">
                  Không tìm thấy gói đăng ký nào ở trạng thái này.
                </div>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* DESKTOP VIEW: SIDEBAR CỐ ĐỊNH CHIỀU CAO (Ẩn trên Mobile) */}
          {/* ========================================================= */}
          <div className="hidden lg:block lg:col-span-4 space-y-3 sticky top-24">
            <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider px-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-accent-1" /> Danh sách đăng ký
              </div>
              <span className="text-[11px] bg-neutral-200 px-2 py-0.5 rounded-full font-black text-neutral-600">
                {filteredSubscriptions.length} Gói
              </span>
            </div>

            {/* Khung cuộn giới hạn chiều cao tinh tế, không làm dài trang */}
            <div className="space-y-2.5 max-h-[calc(100vh-240px)] overflow-y-auto pr-2 custom-scrollbar">
              {filteredSubscriptions.map((sub) => {
                const isSelected = sub.id === activeSubId;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSubId(sub.id)}
                    className={`
                      w-full text-left p-4 rounded-xl border transition-all duration-200 relative flex flex-col gap-2 group/card
                      ${isSelected ? 'bg-primary border-primary shadow-md translate-x-1' : 'bg-white border-neutral-200/70 hover:border-neutral-300 shadow-sm'}
                    `}
                  >
                    <div className="flex justify-between items-center w-full text-[10px]">
                      <span className={`font-mono px-1.5 py-0.5 rounded font-bold ${isSelected ? 'bg-white/10 text-accent-1' : 'bg-neutral-50 text-neutral-400 border border-neutral-200'}`}>
                        #{sub.id}
                      </span>
                      <span className={`font-bold tracking-wide flex items-center gap-1 ${
                        sub.status === 'ACTIVE' ? (isSelected ? 'text-emerald-400' : 'text-emerald-600') :
                        sub.status === 'SKIPPED' ? 'text-amber-500' : 'text-neutral-400'
                      }`}>
                        {sub.status === 'ACTIVE' && <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />}
                        {sub.status === 'ACTIVE' ? 'Đang giao' : sub.status === 'SKIPPED' ? 'Tạm ngưng' : 'Đã đóng'}
                      </span>
                    </div>

                    <h4 className={`text-sm font-bold truncate pr-4 transition-colors tracking-tight ${isSelected ? 'text-white' : 'text-neutral-800 group-hover/card:text-primary'}`}>
                      {sub.productName}
                    </h4>

                    <div className={`flex justify-between items-center border-t pt-2 mt-1 text-xs ${isSelected ? 'border-white/10 text-neutral-400' : 'border-neutral-100 text-neutral-400'}`}>
                      <span className="font-semibold text-[11px]">{sub.frequency}</span>
                      <span className={`font-extrabold ${isSelected ? 'text-accent-1' : 'text-primary'}`}>
                        {sub.price.toLocaleString('vi-VN')}₫
                      </span>
                    </div>
                  </button>
                );
              })}
              
              {filteredSubscriptions.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed text-xs text-neutral-400 italic">
                  Không có gói đăng ký nào.
                </div>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: DETAIL WORKSPACE (HIỂN THỊ CHI TIẾT GÓI ĐÃ CHỌN) */}
          {/* ========================================================= */}
          <div className="lg:col-span-8 space-y-6 text-left w-full">
            {currentSub ? (
              <>
                <div className="bg-white rounded-3xl border border-neutral-200/50 shadow-sm p-6 md:p-8 relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] text-neutral-500 font-mono bg-neutral-50 border border-neutral-200 px-2 py-0.5 rounded-md font-bold">#{currentSub.id}</span>
                        <span className="text-xs text-neutral-400 font-semibold">Chu kỳ: {currentSub.frequency}</span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-primary mt-2">{currentSub.productName}</h3>
                    </div>
                    <div className="shrink-0">
                      {currentSub.status === 'ACTIVE' && <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Hệ thống đang vận hành</span>}
                      {currentSub.status === 'SKIPPED' && <span className="bg-amber-50 text-amber-700 border border-amber-200/60 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">⚠️ Đang tạm hoãn lịch</span>}
                      {currentSub.status === 'CANCELLED' && <span className="bg-rose-50 text-rose-700 border border-rose-200/60 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">✕ Đã dừng dịch vụ</span>}
                    </div>
                  </div>

                  {/* TASTE CONFIG PROFILE MATRIX */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#FAF9F6] p-5 rounded-2xl border border-neutral-200/60 mb-5">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider block">Hương vị lựa chọn</span>
                      <span className="font-bold text-primary block text-sm">{currentSub.flavor}</span>
                    </div>
                    <div className="space-y-0.5 sm:border-l border-neutral-200 sm:pl-4">
                      <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider block">Hình thức xay</span>
                      <span className="font-bold text-primary block text-sm">{currentSub.grindType}</span>
                    </div>
                    <div className="space-y-0.5 sm:border-l border-neutral-200 sm:pl-4">
                      <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider block">Khối lượng</span>
                      <span className="font-bold text-primary block text-sm">
                        {currentSub.weight} <span className="text-[10px] font-bold text-neutral-400 bg-white border border-neutral-200 px-1 py-0.5 rounded ml-1">x{currentSub.quantity}</span>
                      </span>
                    </div>
                  </div>

                  {currentSub.status !== 'CANCELLED' && (
                    <button
                      onClick={() => openConfigModal(currentSub)}
                      className="w-full bg-primary hover:bg-accent-1 text-white hover:text-primary text-xs font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-sm"
                    >
                      <Settings size={14} /> Thay đổi hương vị & Độ mịn hạt
                    </button>
                  )}
                </div>

                {/* TWIN INTUITIVE GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-3xl border border-neutral-200/50 shadow-sm p-6 flex flex-col justify-between min-h-[180px]">
                    <h4 className="font-bold text-xs text-neutral-400 uppercase tracking-wider flex items-center gap-2 border-b border-neutral-100 pb-3">
                      <img src="/assets/img/truck-icon.png" alt="" className="w-3.5 h-3.5 hidden" />
                      <Truck size={14} className="text-accent-1" /> Hành trình vận chuyển
                    </h4>
                    {currentSub.status === 'CANCELLED' ? (
                      <p className="text-xs text-neutral-400 py-6 text-center italic">Gói dịch vụ đã kết thúc chu kỳ giao hàng.</p>
                    ) : currentSub.status === 'SKIPPED' ? (
                      <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 flex gap-2 items-start mt-2">
                        <AlertTriangle size={15} className="shrink-0 mt-0.5 text-amber-600" />
                        <span>Lịch trình rang mẻ kế tiếp đang được tạm ngưng theo yêu cầu của bạn.</span>
                      </div>
                    ) : (
                      <div className="relative flex items-center justify-between px-2 py-2 mt-2">
                        <div className="absolute left-0 right-0 top-[23px] h-[2px] bg-neutral-100 z-0 rounded-full" />
                        <div className="absolute left-0 right-1/2 top-[23px] h-[2px] bg-primary z-0 rounded-full" />
                        <div className="z-10 flex flex-col items-center">
                          <div className="w-6 h-6 rounded-lg bg-primary text-accent-1 flex items-center justify-center text-[10px] font-bold shadow">✓</div>
                          <span className="text-[10px] font-bold text-neutral-700 mt-2">Đã nhận đơn</span>
                        </div>
                        <div className="z-10 flex flex-col items-center">
                          <div className="w-6 h-6 rounded-lg bg-primary text-white flex items-center justify-center text-[10px] font-bold ring-4 ring-accent-1/20 animate-pulse">2</div>
                          <span className="text-[10px] font-bold text-accent-1 mt-2">Đang xử lý mẻ</span>
                        </div>
                        <div className="z-10 flex flex-col items-center">
                          <div className="w-6 h-6 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-400 flex items-center justify-center text-[10px] font-bold">3</div>
                          <span className="text-[10px] font-bold text-neutral-400 mt-2">Giao hỏa tốc</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-3xl border border-neutral-200/50 shadow-sm p-6 flex flex-col justify-between">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-400 flex items-center gap-2 border-b border-neutral-100 pb-3">
                      <CreditCard size={14} className="text-accent-1" /> Thông tin thanh toán
                    </h4>
                    <div className="space-y-3 text-xs mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-400 font-medium">Hình thức:</span>
                        <span className="font-mono bg-primary text-accent-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wide">{currentSub.status === 'CANCELLED' ? 'N/A' : currentSub.cardInfo}</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-neutral-100 pt-2.5">
                        <span className="text-neutral-400 font-medium">Gia hạn tiếp theo:</span>
                        <span className="font-bold text-neutral-800">{currentSub.status === 'ACTIVE' ? currentSub.nextBilling : currentSub.status === 'SKIPPED' ? 'Đang hoãn chu kỳ' : 'Đã hoàn tất đơn'}</span>
                      </div>
                      <div className="border-t border-neutral-100 pt-2.5 flex justify-between items-end">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Tổng tiền / kỳ:</span>
                        <span className="font-black text-lg text-primary">{(currentSub.price).toLocaleString('vi-VN')}₫</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* LOWER ACTIONS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-3xl border border-neutral-200/50 shadow-sm p-6">
                    <h4 className="font-bold text-xs text-neutral-400 mb-3 uppercase tracking-wider flex items-center gap-2 border-b border-neutral-100 pb-3">
                      <History size={14} className="text-accent-1" /> Nhật ký hoạt động gói
                    </h4>
                    <div className="text-xs bg-[#FAF9F6] p-4 rounded-xl border border-neutral-200/40">
                      <p className="font-medium text-neutral-700 leading-relaxed">“{currentSub.history}”</p>
                      <p className="text-neutral-400 text-[10px] mt-3 font-bold border-t border-neutral-200/60 pt-2 flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-accent-1" /> Tiêu chuẩn: {currentSub.weight} • {currentSub.flavor}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl border border-neutral-200/50 shadow-sm p-6 flex flex-col justify-center gap-2.5">
                    {currentSub.status !== 'CANCELLED' ? (
                      <>
                        <button
                          onClick={() => handleToggleSkip(currentSub.id)}
                          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 border shadow-sm ${currentSub.status === 'SKIPPED' ? 'bg-primary text-white border-primary hover:bg-neutral-800' : 'bg-[#FAF9F6] hover:bg-neutral-100 border-neutral-200 text-neutral-800'}`}
                        >
                          <RotateCcw size={14} />
                          {currentSub.status === 'SKIPPED' ? 'Tái kích hoạt nhận hàng' : 'Tạm hoãn kỳ giao tới'}
                        </button>
                        <button
                          onClick={() => handleCancelSub(currentSub.id)}
                          className="w-full bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-neutral-200 hover:border-rose-200 py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200"
                        >
                          Hủy đăng ký gói định kỳ này
                        </button>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-xs text-neutral-400 italic font-medium">Hồ sơ đăng ký đã đóng và được lưu trữ lịch sử.</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-3xl border border-neutral-200/50 shadow-sm p-12 text-center text-neutral-400 italic text-sm">
                Không tìm thấy gói sản phẩm thỏa mãn điều kiện bộ lọc.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ========================================================= */}
      {/* SELECTION MODAL */}
      {/* ========================================================= */}
      {isModalOpen && modalData && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 md:p-8 shadow-2xl border border-neutral-200/60 relative font-nunito animate-modal-enter max-h-[85vh] overflow-y-auto">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-neutral-400 hover:text-primary p-2 rounded-xl bg-[#FAF9F6] transition-colors border border-neutral-200"
            >
              <X size={14} />
            </button>

            <div className="mb-6 text-left pb-4 border-b border-neutral-100">
              <span className="text-xs font-bold text-accent-1 uppercase tracking-wider">Cập nhật gu thưởng thức</span>
              <h3 className="text-lg md:text-xl font-black text-primary mt-1">Cấu Hình Đăng Ký Hương Vị</h3>
              <p className="text-xs text-neutral-400 mt-1">Mã gói sản phẩm: #{modalData.id}</p>
            </div>

            {/* DYNAMIC FLAVOR SELECTION */}
            <div className="mb-6 text-left">
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
                1. Chọn biên độ hương vị mẻ rang (Dữ liệu thực tế)
              </label>
              
              {availableFlavorsFromDb.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {availableFlavorsFromDb.map((f) => {
                    const optionValue = typeof f === 'object' ? f.name : f;
                    const isMatch = modalData.flavor === optionValue;
                    
                    return (
                      <button
                        key={typeof f === 'object' ? f.id : f}
                        type="button"
                        onClick={() => setModalData((prev) => ({ ...prev, flavor: optionValue }))}
                        className={`p-3 rounded-xl text-left font-bold transition-all duration-200 truncate border ${
                          isMatch ? 'border-primary bg-primary text-white shadow-md' : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400'
                        }`}
                      >
                        {optionValue}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-neutral-400 italic">Không có danh sách hương vị khả dụng cho sản phẩm này.</p>
              )}
            </div>

            {/* DYNAMIC GRIND OPTION SELECTION */}
            <div className="mb-8 text-left">
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
                2. Độ mịn kỹ thuật khi xay hạt (Dữ liệu thực tế)
              </label>

              {availableGrindsFromDb.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {availableGrindsFromDb.map((g) => {
                    const optionValue = typeof g === 'object' ? g.name : g;
                    const isMatch = modalData.grindType === optionValue;
                    
                    return (
                      <button
                        key={typeof g === 'object' ? g.id : g}
                        type="button"
                        onClick={() => setModalData((prev) => ({ ...prev, grindType: optionValue }))}
                        className={`p-3 rounded-xl text-left font-bold transition-all duration-200 truncate border ${
                          isMatch ? 'border-primary bg-primary text-white shadow-md' : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400'
                        }`}
                      >
                        {optionValue}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-neutral-400 italic">Không có kiểu xay khả dụng cho sản phẩm này.</p>
              )}
            </div>

            <button
              onClick={handleSaveConfig}
              className="w-full bg-primary hover:bg-accent-1 text-white hover:text-primary font-bold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 shadow-md"
            >
              Lưu thay đổi & Cập nhật lịch giao
            </button>

          </div>
        </div>
      )}
    </div>
  );
}