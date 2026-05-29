import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';
import { Check, Info, CreditCard, X, QrCode } from 'lucide-react';
import axios from 'axios';
import { Giftsets, Combos } from '../../components';
import API from '../../services/api';

export default function Checkout() {
  const navigate = useNavigate();
  const cart = useStore((state) => state.cart);
  const createOrder = useStore((state) => state.createOrder);

  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const user = useStore((state) => state.user);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [finalTotal, setFinalTotal] = useState(0);
  
  // Voucher & Loyalty states
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState('');
  const [voucherSuccess, setVoucherSuccess] = useState('');
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const voucherInputRef = useRef(null);
  const [showVNPayModal, setShowVNPayModal] = useState(false);
  const [countdown, setCountdown] = useState(900);
  useEffect(() => {
    if (!showVNPayModal) return;
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showVNPayModal]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProvinceChange = async (e) => {
    const provinceName = e.target.value;
    const province = provinces.find(p => p.name === provinceName);

    // Cập nhật form
    setForm(prev => ({
      ...prev,
      shippingProvince: provinceName,
      shippingDistrict: '',
      shippingWard: ''
    }));
    setDistricts([]); // Xóa danh sách cũ
    setWards([]);

    if (province) {
      const res = await axios.get(`https://provinces.open-api.vn/api/p/${province.code}?depth=2`);
      setDistricts(res.data.districts);
    }
  };

  //Hàm xử lý khi chọn Huyện -> Đi lấy danh sách Xã
  const handleDistrictChange = async (e) => {
    const districtName = e.target.value;
    const district = districts.find(d => d.name === districtName);

    setForm(prev => ({
      ...prev,
      shippingDistrict: districtName,
      shippingWard: ''
    }));
    setWards([]);

    if (district) {
      const res = await axios.get(`https://provinces.open-api.vn/api/d/${district.code}?depth=2`);
      setWards(res.data.wards);
    }
  };

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await axios.get('https://provinces.open-api.vn/api/p/');
        setProvinces(res.data);
      } catch (error) {
        console.error("Không lấy được danh sách tỉnh", error);
      }
    };
    fetchProvinces();
  }, []);
  // Tổng tiền hàng
  const totalPrice = cart.filter(item => item.selected).reduce((total, item) => total + (item.Product?.Price * item.Quantity || 0), 0);
  // Phí ship tuỳ ý (giả lập 30.000)
  const shippingFee = 30000;
  
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const isDiamond = user?.memberTier === 'Diamond' || user?.MemberTier === 'Diamond';
  const tierDiscount = isDiamond ? Math.round(totalPrice * 0.1) : 0;
  const discount = appliedVoucher ? (appliedVoucher.DiscountAmount ?? appliedVoucher.discountAmount ?? 0) : 0;
  const computedFinalTotal = Math.max(0, totalPrice + shippingFee - (discount + tierDiscount));
  const selectedProductIds = cart
    .filter(item => item.selected)
    .map(item => item.ProductId)
    .filter(Boolean);

  useEffect(() => {
    let cancelled = false;

    const loadAvailableVouchers = async () => {
      if (!user || totalPrice <= 0) {
        setAvailableVouchers([]);
        return;
      }

      try {
        const res = await API.getAvailableVouchers({
          total: totalPrice,
          paymentMethod: paymentMethod === 'cod' ? 'COD' : 'VNPAY',
          productIds: [...new Set(selectedProductIds)].join(','),
        });
        const items = res.data?.Data ?? res.data?.data ?? res.data ?? [];
        if (!cancelled) setAvailableVouchers(Array.isArray(items) ? items : []);
      } catch {
        if (!cancelled) setAvailableVouchers([]);
      }
    };

    loadAvailableVouchers();
    return () => {
      cancelled = true;
    };
  }, [user, totalPrice, paymentMethod, cart]);

  const getVoucherCode = (voucher) => voucher?.Code ?? voucher?.code ?? '';
  const getVoucherName = (voucher) => voucher?.Title ?? voucher?.title ?? voucher?.Name ?? voucher?.name ?? getVoucherCode(voucher);
  const getVoucherDiscountText = (voucher) => {
    const type = voucher?.DiscountType ?? voucher?.discountType;
    const value = Number(voucher?.DiscountValue ?? voucher?.discountValue ?? 0);
    return type === 'percent' ? `Gi\u1EA3m ${value}%` : `Gi\u1EA3m ${value.toLocaleString('vi-VN')}\u0111`;
  };
  const getVoucherExpiryText = (voucher) => {
    const value = voucher?.EndDate ?? voucher?.endDate;
    if (!value) return 'Kh\u00f4ng gi\u1edbi h\u1ea1n';

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Kh\u00f4ng gi\u1edbi h\u1ea1n' : date.toLocaleDateString('vi-VN');
  };

  const handleSelectVoucher = async (voucher) => {
    const code = getVoucherCode(voucher);
    setVoucherCodeInput(code);
    setVoucherError('');
    setVoucherSuccess('');
    await applyVoucher(code);
    voucherInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => voucherInputRef.current?.focus(), 250);
  };

  const [form, setForm] = useState({
    receiverName: '',
    receiverPhone: '',

    shippingProvince: '',
    shippingDistrict: '',
    shippingWard: '',
    shippingDetailAddress: '',
    shippingNote: '',

    updateProfile: false, // Có cập nhật thông tin cá nhân hay không
  })
  useEffect(() => {
    if (orderSuccess && successRef.current) {
      successRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [orderSuccess]);
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        receiverName: user.name || '',
        receiverPhone: user.phone || ''
      }));
    }
  }, [user]);
  const isFormValid =
    (form.receiverName || '').trim() !== '' &&
    (form.receiverPhone || '').trim() !== '' &&
    (form.shippingProvince || '').trim() !== '' &&
    (form.shippingDistrict || '').trim() !== '' &&
    (form.shippingWard || '').trim() !== '' &&
    (form.shippingDetailAddress || '').trim() !== '';
  const selectedItems = cart.filter(item => item.selected);
  const translateGrind = (type) => {
    switch (type) {
      case 1: return "Nguyên Hạt";
      case 2: return "Pha Phin";
      case 3: return "Pha Máy";
      case 4: return "Ủ Lạnh";
      case 5: return "Kiểu Pháp";
      default: return type;
    }
  }
  const successRef = React.useRef(null);
  useEffect(() => {
    // Chỉ chuyển hướng nếu giỏ hàng thực sự trống VÀ không phải là do vừa đặt hàng thành công
    if (cart.length === 0 && orderSuccess === false) {
      const timeout = setTimeout(() => {
        navigate('/shop');
      }, 100); // Thêm một khoảng delay nhỏ để chắc chắn state đã cập nhật
      return () => clearTimeout(timeout);
    }
  }, [cart.length, orderSuccess, navigate]);
  const applyVoucher = async (code) => {
    if (!code.trim()) {
      setVoucherError('Vui lòng nhập mã giảm giá.');
      setVoucherSuccess('');
      return;
    }
    try {
      const normalizedCode = code.trim().toUpperCase();
      const res = await API.validateVoucher(normalizedCode, totalPrice, paymentMethod === 'cod' ? 'COD' : 'VNPAY', [...new Set(selectedProductIds)]);
      const validateInfo = res.data?.Data ?? res.data?.data ?? res.data;
      const isValid = validateInfo?.IsValid ?? validateInfo?.isValid;
      const discountAmount = validateInfo?.DiscountAmount ?? validateInfo?.discountAmount ?? 0;
      if (isValid) {
        setAppliedVoucher(validateInfo);
        setVoucherSuccess(validateInfo.Message ?? validateInfo.message ?? `Áp dụng mã giảm giá thành công! Giảm ${discountAmount.toLocaleString('vi-VN')}đ`);
        setVoucherError('');
      } else {
        setAppliedVoucher(null);
        setVoucherError(validateInfo?.Message ?? validateInfo?.message ?? 'Mã giảm giá không hợp lệ.');
        setVoucherSuccess('');
      }
    } catch (error) {
      setAppliedVoucher(null);
      const msg = error.response?.data?.Message || error.response?.data?.message || 'Có lỗi xảy ra khi xác thực voucher.';
      setVoucherError(msg);
      setVoucherSuccess('');
    }
  };

  const handleApplyVoucher = async (e) => {
    e.preventDefault();
    await applyVoucher(voucherCodeInput);
  };

  const handleOrder = async (e) => {
    e.preventDefault();

    // Tạo data order
    const payload = {
      Items: selectedItems.map(item => ({
        ProductId: item.ProductId,
        Quantity: item.Quantity,
        GrindingOptionId: item.GrindingOptionId,
        FlavorNotes: item.FlavorNotes,
        Weight: item.Weight
      })),

      ReceiverName: form.receiverName,
      ReceiverPhone: form.receiverPhone,
      ShippingProvince: form.shippingProvince,
      ShippingDistrict: form.shippingDistrict,
      ShippingWard: form.shippingWard,
      ShippingDetailAddress: form.shippingDetailAddress,
      ShippingNote: form.shippingNote,
      PaymentMethod: paymentMethod === 'cod' ? 'COD' : 'VNPAY',
      VoucherCode: appliedVoucher
        ? (appliedVoucher.Voucher?.Code ?? appliedVoucher.voucher?.code ?? appliedVoucher.Code ?? appliedVoucher.code)
        : null
    };

    try {
      const res = await createOrder(payload);
      console.log('Order created:', res.data);

      setFinalTotal(computedFinalTotal);
      setCreatedOrder(res.data);

      if (paymentMethod === 'vnpay') {
        setCountdown(900);
        setShowVNPayModal(true);
      } else {
        setOrderSuccess(true);
        alert('Đơn hàng của bạn đã được tạo thành công!');
      }
    } catch (error) {
      const message = error.response?.data?.Message || error.response?.data?.message;
      if (message) {
        alert(message);
        return;
      }
      console.error("Lỗi khi tạo đơn hàng:", error);
      alert('Đã có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại sau.');
    }
  };

  if (orderSuccess) {
    return (
      <div ref={successRef} className="bg-white min-h-screen py-16">
        <div className="container mx-auto px-6 max-w-5xl">

          {/* Success Box */}
          <div className="bg-white rounded-[32px] shadow-2xl p-10 text-center mb-12">

            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <Check className="text-green-600" size={48} />
            </div>

            <h1 className="font-montserrat text-4xl text-primary mb-4">
              ĐẶT HÀNG THÀNH CÔNG
            </h1>

            <p className="font-nunito text-lg text-primary/70 mb-2">
              Đơn hàng của bạn đã được tạo thành công.
            </p>
            <p className="font-nunito text-primary/60 mb-8">
              Chúng tôi sẽ sớm xác nhận và giao hàng đến bạn.
            </p>

            {createdOrder && (
              <div className="bg-pinky-gray/40 rounded-2xl p-6 text-left max-w-xl mx-auto mb-8 shadow-lg">
                <h3 className="font-montserrat font-bold text-primary mb-4">
                  Thông tin đơn hàng
                </h3>

                <div className="space-y-2 font-nunito text-primary/80">
                  <p>
                    <span className="font-bold">Mã đơn:</span>{" "}
                    #{createdOrder.id || createdOrder.Id}
                  </p>

                  <p>
                    <span className="font-bold">Người nhận:</span>{" "}
                    {form.receiverName}
                  </p>

                  <p>
                    <span className="font-bold">Số điện thoại:</span>{" "}
                    {form.receiverPhone}
                  </p>

                  <p>
                    <span className="font-bold">Tổng tiền:</span>{" "}
                    {finalTotal.toLocaleString('vi-VN')}đ
                  </p>
                  <p>
                    <span className="font-bold">Địa chỉ:</span>{" "}
                    {form.shippingWard}, {form.shippingDistrict}, {form.shippingProvince}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate('/orders')}
                className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-accent-1 hover:-translate-y-1 transition-all duration-300 hover:scale-110"
              >
                THEO DÕI ĐƠN HÀNG
              </button>

              <button
                onClick={() => navigate('/shop')}
                className="border border-primary text-primary px-8 py-3 rounded-full font-bold hover:bg-primary hover:text-white hover:-translate-y-1 transition-all duration-300 hover:scale-110"
              >
                TIẾP TỤC MUA SẮM
              </button>
            </div>
          </div>

          {/* Giftset Section */}
          <div className="mt-10">
            <h2 className="font-montserrat font-bold text-3xl text-primary text-center">
              CÓ THỂ BẠN SẼ THÍCH
            </h2>

            <Giftsets />
            <Combos />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-12">
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
        <h1 className="font-montserrat font-black text-4xl text-primary mb-10 text-center">THANH TOÁN</h1>

        <div className="flex flex-col lg:flex-row gap-12">

          {/* Form Thông tin */}
          <div className="w-full lg:w-3/5">
            <form onSubmit={handleOrder} id="checkout-form">
              <div className="bg-white rounded-[32px] p-8 shadow-lg mb-8">
                <h2 className="font-montserrat font-bold text-xl text-primary mb-6 border-b border-gray-100 pb-4">Thông tin giao hàng</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-nunito font-semibold text-primary/80">Họ và tên <span className="text-red-500">*</span></label>
                    <input required type="text" value={form.receiverName} className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-pinky-gray/30 focus:bg-white focus:border-accent-1 outline-none transition-colors font-nunito" placeholder="Nhập họ và tên"
                      onChange={e => setForm({ ...form, receiverName: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="font-nunito font-semibold text-primary/80">Số điện thoại <span className="text-red-500">*</span></label>
                    <input required type="tel" value={form.receiverPhone} className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-pinky-gray/30 focus:bg-white focus:border-accent-1 outline-none transition-colors font-nunito" placeholder="Nhập SĐT"
                      onChange={e => setForm({ ...form, receiverPhone: e.target.value })} />
                  </div>
                  <div className="space-y-2 border-gray-200/50 border p-2 rounded-xl bg-gray-50">
                    <label className="font-nunito font-semibold text-primary/80">
                      Tỉnh / Thành phố <span className="text-red-500">*</span>
                    </label>
                    {/* Tỉnh/Thành phố */}
                    <select
                      required
                      value={form.shippingProvince}
                      onChange={handleProvinceChange}
                      className="w-full rounded-xl px-4 py-3 bg-pinky-gray/30 focus:bg-white focus:border-accent-1 outline-none font-nunito"
                    >
                      <option value="">Chọn tỉnh / thành phố</option>
                      {provinces.map(p => (
                        <option key={p.code} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 border-gray-200/50 border p-2 rounded-xl bg-gray-50">
                    <label className="font-nunito font-semibold text-primary/80">
                      Quận / Huyện <span className="text-red-500">*</span>
                    </label>
                    {/* Quận/Huyện */}
                    <select
                      required
                      disabled={!form.shippingProvince}
                      value={form.shippingDistrict}
                      onChange={handleDistrictChange}
                      className="w-full rounded-xl px-4 py-3 bg-pinky-gray/30 focus:bg-white focus:border-accent-1 outline-none font-nunito disabled:opacity-50"
                    >
                      <option value="">Chọn quận / huyện</option>
                      {districts.map(d => (
                        <option key={d.code} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-1 md:col-span-2 space-y-2 border-gray-200/50 border p-2 rounded-xl bg-gray-50">
                    <label className="block text-center font-nunito font-semibold text-primary/80">
                      Phường / Xã <span className="text-red-500">*</span>
                    </label>
                    {/* Phường/Xã */}
                    <select
                      required
                      disabled={!form.shippingDistrict}
                      value={form.shippingWard}
                      onChange={e => setForm({ ...form, shippingWard: e.target.value })}
                      className="w-full rounded-xl px-4 py-3 bg-pinky-gray/30 focus:bg-white focus:border-accent-1 outline-none font-nunito disabled:opacity-50"
                    >
                      <option value="">Chọn phường / xã</option>
                      {wards.map(w => (
                        <option key={w.code} value={w.name}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="font-nunito font-semibold text-primary/80">Địa chỉ cụ thể <span className="text-red-500">*</span></label>
                    <input required type="text" value={form.shippingDetailAddress} className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-pinky-gray/30 focus:bg-white focus:border-accent-1 outline-none transition-colors font-nunito" placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành"
                      onChange={e => setForm({ ...form, shippingDetailAddress: e.target.value })} />
                  </div>
                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="font-nunito font-semibold text-primary/80">Ghi chú đơn hàng (Tùy chọn)</label>
                    <textarea className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-pinky-gray/30 focus:bg-white focus:border-accent-1 outline-none transition-colors font-nunito min-h-[100px]" placeholder="Bạn có lưu ý gì về giờ nhận hàng không?"
                      onChange={e => setForm({ ...form, shippingNote: e.target.value })}></textarea>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[32px] p-8 shadow-lg">
                <h2 className="font-montserrat font-bold text-xl text-primary mb-6 border-b border-gray-100 pb-4">Phương thức thanh toán</h2>

                <div className="space-y-4">
                  <label className={`flex items-start gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-gray-100'}`}>
                    <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'cod' ? 'border-primary' : 'border-gray-300'}`}>
                      {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>}
                    </div>
                    <input type="radio" name="payment" value="cod" className="hidden" onChange={() => setPaymentMethod('cod')} />
                    <div>
                      <h3 className="font-montserrat font-bold text-primary mb-1">Thanh toán khi nhận hàng (COD)</h3>
                      <p className="font-nunito text-primary/60 text-sm">Trả bằng tiền mặt hoặc chuyển khoản QR Code cho Shipper khi giao cà phê đến tay bạn.</p>
                    </div>
                  </label>

                  <label className={`flex items-start gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'vnpay' ? 'border-primary bg-primary/5' : 'border-gray-100'}`}>
                    <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'vnpay' ? 'border-primary' : 'border-gray-300'}`}>
                      {paymentMethod === 'vnpay' && <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>}
                    </div>
                    <input type="radio" name="payment" value="vnpay" className="hidden" onChange={() => setPaymentMethod('vnpay')} />
                    <div>
                      <h3 className="font-montserrat font-bold text-primary mb-1">Chuyển khoản trực tuyến / VNPAY</h3>
                      <p className="font-nunito text-primary/60 text-sm">Thanh toán qua ví điện tử VNPay hoặc ứng dụng ngân hàng chuẩn bảo mật.</p>
                    </div>
                  </label>
                </div>
              </div>
            </form>
          </div>

          {/* Đơn hàng (Summary) */}
          <div className="w-full lg:w-2/5">
            <div className="bg-pinky-gray/50 rounded-[32px] p-8 border border-gray-200/50 sticky top-24 shadow-2xl">
              <h2 className="font-montserrat font-bold text-xl text-primary mb-6 border-b border-gray-200 pb-4">Tóm tắt đơn hàng ({cart.length} SP)</h2>

              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {selectedItems.map((item) => (
                  <div key={`${item.ProductId}-${item.GrindingOptionId}`} className="flex gap-4">
                    <div className="w-16 h-16 bg-white rounded-xl p-1 shrink-0 relative mt-2">
                      <img src={item.Product?.ImageUrl} alt={item.Product?.Name} className="w-full h-full object-contain" />
                      <span className="absolute -top-2 -right-2 bg-primary text-white w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold font-nunito">{item.Quantity}</span>
                    </div>
                    <div className="flex-1 font-nunito text-left">
                      <h4 className="font-bold text-primary text-sm line-clamp-1">{item.Product?.Name}</h4>
                      <p className="text-primary/60 text-xs mb-1">Xay: {translateGrind(item.GrindingOptionId) || item.GrindingOptionId}</p>
                      <p className="text-primary/60 text-xs mb-1">Vị: {item.FlavorNotes}</p>
                      <p className="text-primary/60 text-xs mb-1">Khối lượng: {item.Weight}</p>
                      <p className="font-bold text-accent-1 text-sm">{(item.Product?.Price * item.Quantity).toLocaleString('vi-VN')}đ</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Loyalty Code / Discount */}
              <div className="border-t border-b border-gray-200 py-6 mb-6">

                {/* Banner voucher đang áp dụng */}
                {appliedVoucher && (
                  <div className="flex items-center justify-between gap-3 mb-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 animate-fadeIn">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-green-600 text-lg shrink-0">✔</span>
                      <div className="min-w-0">
                        <p className="font-black text-green-700 text-sm font-nunito truncate">
                          {appliedVoucher.Voucher?.Code ?? appliedVoucher.voucher?.code ?? appliedVoucher.Code ?? appliedVoucher.code}
                        </p>
                        <p className="text-green-600 text-xs font-nunito">
                          Giảm {(appliedVoucher.DiscountAmount ?? appliedVoucher.discountAmount ?? 0).toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedVoucher(null);
                        setVoucherCodeInput('');
                        setVoucherSuccess('');
                        setVoucherError('');
                      }}
                      title="Bỏ mã giảm giá"
                      className="shrink-0 p-1.5 rounded-lg text-green-600 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    ref={voucherInputRef}
                    type="text"
                    value={voucherCodeInput}
                    onChange={(e) => setVoucherCodeInput(e.target.value)}
                    placeholder={appliedVoucher ? 'Nhập mã khác để thay thế...' : 'Mã giảm giá (ví dụ: COFFEE50)'}
                    className="flex-1 border border-gray-200 rounded-xl px-4 font-nunito outline-none focus:border-primary uppercase transition-colors"
                    disabled={!!appliedVoucher}
                  />
                  {appliedVoucher ? (
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedVoucher(null);
                        setVoucherCodeInput('');
                        setVoucherSuccess('');
                        setVoucherError('');
                        setTimeout(() => voucherInputRef.current?.focus(), 50);
                      }}
                      className="bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-500 font-nunito font-bold px-5 py-3 rounded-xl transition-all duration-200 active:scale-95 flex items-center gap-1.5"
                    >
                      <X size={15} /> Đổi mã
                    </button>
                  ) : (
                    <button
                      onClick={handleApplyVoucher}
                      className="bg-primary hover:bg-accent-1 text-white font-nunito font-bold px-6 py-3 rounded-xl hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
                    >
                      ÁP DỤNG
                    </button>
                  )}
                </div>

                {/* Danh sách voucher khả dụng */}
                {!appliedVoucher && availableVouchers.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-bold text-primary/60 uppercase tracking-wide text-left">Ưu đãi hôm nay</p>
                    <div className="grid grid-cols-1 gap-2">
                      {availableVouchers.map((voucher) => (
                        <button
                          key={getVoucherCode(voucher)}
                          type="button"
                          onClick={() => handleSelectVoucher(voucher)}
                          className="text-left rounded-xl border border-red-100 bg-red-50/70 px-3 py-2 hover:border-red-300 hover:bg-red-50 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-black text-red-600 text-sm">{getVoucherCode(voucher)}</span>
                            <span className="text-xs font-bold text-red-500">{getVoucherDiscountText(voucher)}</span>
                          </div>
                          <p className="text-xs text-primary/70 mt-0.5">{getVoucherName(voucher)}</p>
                          <p className="text-[11px] font-bold text-red-500/80 mt-1">HSD: {getVoucherExpiryText(voucher)}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {voucherError && (
                  <p className="text-red-500 font-nunito text-xs mt-2 text-left font-semibold">
                    ⚠ {voucherError}
                  </p>
                )}
                {!appliedVoucher && voucherSuccess && (
                  <p className="text-green-600 font-nunito text-xs mt-2 text-left font-semibold">
                    ✔ {voucherSuccess}
                  </p>
                )}
              </div>

              <div className="space-y-4 mb-8 font-nunito text-primary/80">
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span className="font-bold">{totalPrice.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí giao hàng</span>
                  <span className="font-bold">{shippingFee.toLocaleString('vi-VN')}đ</span>
                </div>
                {tierDiscount > 0 && (
                  <div className="flex justify-between text-[#7F5539] font-semibold">
                    <span>Ưu đãi hội viên Diamond (10%)</span>
                    <span>-{tierDiscount.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Giảm giá ({appliedVoucher?.Voucher?.Code ?? appliedVoucher?.voucher?.code ?? appliedVoucher?.code ?? appliedVoucher?.Code})</span>
                    <span>-{discount.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                <div className="flex justify-between pt-4 border-t border-gray-200 items-center">
                  <span className="font-montserrat font-bold text-xl text-primary">TỔNG CỘNG</span>
                  <span className="font-montserrat font-black text-3xl text-red-custom">{computedFinalTotal.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={!isFormValid}
                className="w-full bg-primary text-white font-nunito font-bold py-4 rounded-full text-lg hover:bg-accent-1 shadow-lg hover:-translate-y-1 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                ĐẶT HÀNG NGAY
              </button>
              <div className="flex items-center justify-center gap-2 mt-4 text-primary/50 font-nunito text-sm">
                <Info size={16} /> Chúng tôi cam kết bảo mật thông tin của bạn
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* MODAL GIẢ LẬP VNPAY */}
      {showVNPayModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-[32px] shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 flex flex-col transform transition-all scale-100">
            {/* Header VNPay Mockup */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 text-white text-center relative">
              <h2 className="font-montserrat font-black text-2xl tracking-wider">VNPAY GATEWAY</h2>
              <p className="text-white/80 font-nunito text-sm mt-1">Cổng thanh toán giả lập hệ thống Revo Coffee</p>
              <div className="absolute top-4 right-4">
                <button 
                  onClick={() => setShowVNPayModal(false)}
                  className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6 text-center">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex flex-col items-center">
                <span className="text-blue-800 font-nunito text-xs font-bold uppercase tracking-wider mb-1">
                  Số tiền thanh toán
                </span>
                <span className="font-montserrat font-black text-3xl text-blue-900">
                  {computedFinalTotal.toLocaleString('vi-VN')}đ
                </span>
                <span className="text-primary/60 font-nunito text-xs mt-2">
                  Đơn hàng: #{createdOrder?.id || createdOrder?.Id}
                </span>
              </div>

              {/* QR Code section */}
              <div className="flex flex-col items-center justify-center">
                <div className="bg-white p-4 rounded-3xl shadow-md border border-gray-100 relative">
                  <div className="w-48 h-48 bg-gray-50 flex items-center justify-center rounded-2xl border-2 border-dashed border-gray-200">
                    {/* Simulated elegant QR code using SVG */}
                    <svg viewBox="0 0 100 100" className="w-40 h-40 text-blue-900">
                      <rect width="100" height="100" fill="none" />
                      {/* Quiet zones & anchor points */}
                      <rect x="5" y="5" width="20" height="20" fill="currentColor" />
                      <rect x="8" y="8" width="14" height="14" fill="white" />
                      <rect x="11" y="11" width="8" height="8" fill="currentColor" />
                      
                      <rect x="75" y="5" width="20" height="20" fill="currentColor" />
                      <rect x="78" y="8" width="14" height="14" fill="white" />
                      <rect x="81" y="11" width="8" height="8" fill="currentColor" />

                      <rect x="5" y="75" width="20" height="20" fill="currentColor" />
                      <rect x="8" y="78" width="14" height="14" fill="white" />
                      <rect x="11" y="81" width="8" height="8" fill="currentColor" />

                      {/* Random QR code pixels block */}
                      <path d="M 30,5 H 40 V 15 H 30 Z M 45,5 H 55 V 10 H 45 Z M 60,5 H 70 V 20 H 60 Z" fill="currentColor" />
                      <path d="M 30,20 H 35 V 35 H 30 Z M 40,25 H 50 V 30 H 40 Z M 55,25 H 70 V 35 H 55 Z" fill="currentColor" />
                      <path d="M 5,30 H 15 V 45 H 5 Z M 20,35 H 25 V 50 H 20 Z M 35,40 H 45 V 60 H 35 Z" fill="currentColor" />
                      <path d="M 50,45 H 65 V 50 H 50 Z M 70,45 H 95 V 55 H 70 Z M 80,60 H 90 V 70 H 80 Z" fill="currentColor" />
                      <path d="M 5,55 H 10 V 70 H 5 Z M 15,60 H 30 V 65 H 15 Z M 25,70 H 30 V 75 H 25 Z" fill="currentColor" />
                      <path d="M 50,65 H 55 V 80 H 50 Z M 60,70 H 70 V 90 H 60 Z M 75,75 H 95 V 80 H 75 Z" fill="currentColor" />
                      <path d="M 35,80 H 45 V 95 H 35 Z M 15,85 H 25 V 90 H 15 Z M 80,85 H 90 V 95 H 80 Z" fill="currentColor" />
                    </svg>
                  </div>
                  <div className="absolute inset-0 bg-blue-900/5 rounded-3xl pointer-events-none"></div>
                </div>
                <div className="flex items-center gap-2 mt-4 text-xs font-nunito font-semibold text-gray-500">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></span>
                  Quét mã QR để thanh toán nhanh qua ứng dụng Ngân hàng
                </div>
              </div>

              {/* Instructions and Bank Details */}
              <div className="bg-pinky-gray/30 rounded-2xl p-4 text-left text-sm font-nunito space-y-2">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-primary/60">Tên tài khoản:</span>
                  <span className="font-bold text-primary">CÔNG TY CỔ PHẦN CÀ PHÊ REVO</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-primary/60">Ngân hàng:</span>
                  <span className="font-bold text-primary">NCB Bank (Giả lập)</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-primary/60">Số tài khoản:</span>
                  <span className="font-bold text-primary">9704198526137596</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary/60">Nội dung chuyển khoản:</span>
                  <span className="font-bold text-red-500">REVO_ORDER_{createdOrder?.id || createdOrder?.Id}</span>
                </div>
              </div>

              {/* Expiry Timer */}
              <div className="text-sm font-nunito text-gray-500">
                Giao dịch sẽ hết hạn sau: <span className="font-bold text-red-500">{formatTime(countdown)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gray-50 p-6 flex flex-col gap-3 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowVNPayModal(false);
                  setOrderSuccess(true);
                  alert('Thanh toán thành công! Đơn hàng của bạn đã chuyển sang trạng thái xử lý.');
                }}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-nunito font-bold py-3.5 rounded-full text-base transition-colors shadow-lg active:scale-95"
              >
                XÁC NHẬN ĐÃ THANH TOÁN (Giả lập)
              </button>
              <button
                onClick={() => {
                  setShowVNPayModal(false);
                  alert('Giao dịch đã được hủy. Đơn hàng của bạn ở trạng thái chờ thanh toán.');
                  setOrderSuccess(true); // Vẫn chuyển qua trang thành công để theo dõi
                }}
                className="w-full bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 font-nunito font-bold py-3.5 rounded-full text-base transition-colors active:scale-95"
              >
                HỦY GIAO DỊCH
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


