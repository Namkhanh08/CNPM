import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { Check, Info } from 'lucide-react';
import axios from 'axios';
import Giftsets from '../components/Giftsets';
import Combos from '../components/Combos';
import { LuTicketPercent } from "react-icons/lu";

// Khai báo domain Backend .NET để load ảnh static
const BACKEND_URL = "http://localhost:5126";

export default function Checkout() {
  const navigate = useNavigate();
  const cart = useStore((state) => state.cart) || []; // ĐÃ SỬA: Phòng ngừa cart bị null/undefined
  const clearCart = useStore((state) => state.clearCart);
  const createOrder = useStore((state) => state.createOrder);

  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const user = useStore((state) => state.user);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [finalTotal, setFinalTotal] = useState(0);
  const availableVouchers = useStore((state) => state.availableVouchers) || []; // ĐÃ SỬA: Tránh lỗi map voucher

  const fetchAvailableVouchers = useStore((state) => state.fetchAvailableVouchers);

  const [form, setForm] = useState({
    receiverName: '',
    receiverPhone: '',
    shippingProvince: '',
    shippingDistrict: '',
    shippingWard: '',
    shippingDetailAddress: '',
    shippingNote: '',
    updateProfile: false,
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');

  const handleProvinceChange = async (e) => {
    const provinceName = e.target.value;
    const province = provinces.find(p => p.name === provinceName);

    setForm(prev => ({
      ...prev,
      shippingProvince: provinceName,
      shippingDistrict: '',
      shippingWard: ''
    }));
    setDistricts([]);
    setWards([]);

    if (province) {
      const res = await axios.get(`https://provinces.open-api.vn/api/p/${province.code}?depth=2`);
      setDistricts(res.data.districts);
    }
  };

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

  // ĐÃ SỬA: Chuyển toàn bộ sang chữ thường khớp với cấu trúc giỏ hàng mới (product.price, quantity)
  const totalPrice = cart
    .filter(item => item.selected)
    .reduce((total, item) => total + ((item.product?.price || 0) * (item.quantity || 0)), 0);
    
  const shippingFee = 30000;

  const successRef = React.useRef(null);

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
  
  
  useEffect(() => {
    if (!selectedItems.length) return;
    fetchAvailableVouchers(selectedItems, paymentMethod);
  }, [paymentMethod, cart]);

  const translateGrind = (type) => {
    switch (type) {
      case 1: return "Nguyên Hạt";
      case 2: return "Pha Phin"; 
      case 3: return "Pha Máy";
      case 4: return "Ủ Lạnh";
      case 5: return "Kiểu Pháp";
      default: return type;
    }
  };

  useEffect(() => {
    if (cart.length === 0 && orderSuccess === false) {
      const timeout = setTimeout(() => {
        navigate('/shop');
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [cart.length, orderSuccess, navigate]);

  const [showVoucherList, setShowVoucherList] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const discountAmount = selectedVoucher ? selectedVoucher.discountPreview || 0 : 0;

  const finalPrice = totalPrice + shippingFee - discountAmount;

  const handleOrder = async (e) => {
    e.preventDefault();

    const payload = {
      Items: selectedItems.map(item => ({
        ProductId: item.productId,
        Quantity: item.quantity,
        GrindingOptionId: item.grindingOptionId,
        FlavorNotes: item.flavorNotes,
        Weight: item.weight
      })),
      ReceiverName: form.receiverName,
      ReceiverPhone: form.receiverPhone,
      ShippingProvince: form.shippingProvince,
      ShippingDistrict: form.shippingDistrict,
      ShippingWard: form.shippingWard,
      ShippingDetailAddress: form.shippingDetailAddress,
      ShippingNote: form.shippingNote,
      PaymentMethod: paymentMethod === 'cod' ? 'COD' : 'VNPAY',
      VoucherCode: selectedVoucher?.code || null,
      DiscountAmount: discountAmount,
      FinalAmount: finalPrice
    };

    try {
      console.log("PAYLOAD SEND TO BACKEND:", payload);
      const res = await createOrder(payload);
      console.log('Order created successfully response data:', res);

      // ĐÃ SỬA: Dự phòng bóc tách ID linh hoạt theo mọi kiểu trả về từ Store hoặc Axios
      // Đảm bảo bóc được dữ liệu bất kể Store trả về nguyên bản `res` hay bóc trước `res.data`
      const newOrderId = res?.data?.id || res?.data?.Id || 
                         res?.id || res?.Id || 
                         res?.data?.order?.id || res?.data?.order?.Id ||
                         res?.order?.id;

      if (!newOrderId && paymentMethod === 'vnpay') {
         console.error("Không bóc tách được ID đơn hàng từ kết quả trả về:", res);
         alert("Đặt hàng thành công nhưng không tìm thấy ID đơn hàng để tạo link thanh toán!");
         return;
      }

      setFinalTotal(finalPrice);
      
      // Lưu thông tin đơn hàng an toàn (không bị crash nếu res.data bị khuyết)
      setCreatedOrder(res?.data ? res.data : res);
      
      clearCart(); 

      if (paymentMethod === 'vnpay') {
        // Chuyển hướng sang trang thanh toán kèm ID đơn hàng sạch
        navigate(`/checkout/payment/${newOrderId}`, {
          state: { amount: finalPrice }
        });
      } else {
        setOrderSuccess(true);
        alert('Đơn hàng của bạn đã được đặt thành công!');
      }
    } catch (error) {
      console.error("Lỗi khi tạo đơn hàng:", error);
      alert('Đã có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại sau.');
    }
  };

  if (orderSuccess) {
    return (
      <div ref={successRef} className="bg-white min-h-screen py-16">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="bg-white rounded-[32px] shadow-2xl p-10 text-center mb-12">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <Check className="text-green-600" size={48} />
            </div>
            <h1 className="font-montserrat text-4xl text-primary mb-4">ĐẶT HÀNG THÀNH CÔNG</h1>
            <p className="font-nunito text-lg text-primary/70 mb-2">Đơn hàng của bạn đã được tạo thành công.</p>
            <p className="font-nunito text-primary/60 mb-8">Chúng tôi sẽ sớm xác nhận và giao hàng đến bạn.</p>

            {createdOrder && (
              <div className="bg-pinky-gray/40 rounded-2xl p-6 text-left max-w-xl mx-auto mb-8 shadow-lg">
                <h3 className="font-montserrat font-bold text-primary mb-4">Thông tin đơn hàng</h3>
                <div className="space-y-2 font-nunito text-primary/80">
                  <p><span className="font-bold">Mã đơn:</span> #{createdOrder.id || createdOrder.Id}</p>
                  <p><span className="font-bold">Người nhận:</span> {form.receiverName}</p>
                  <p><span className="font-bold">Số điện thoại:</span> {form.receiverPhone}</p>
                  <p><span className="font-bold">Tổng tiền:</span> {finalTotal.toLocaleString('vi-VN')}đ</p>
                  <p><span className="font-bold">Địa chỉ:</span> {form.shippingWard}, {form.shippingDistrict}, {form.shippingProvince}</p>
                </div>
              </div>
            )}

            <div className="flex justify-center gap-4">
              <button onClick={() => navigate('/orders')} className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-accent-1 hover:-translate-y-1 transition-all duration-300 hover:scale-110">
                THEO DÕI ĐƠN HÀNG
              </button>
              <button onClick={() => navigate('/shop')} className="border border-primary text-primary px-8 py-3 rounded-full font-bold hover:bg-primary hover:text-white hover:-translate-y-1 transition-all duration-300 hover:scale-110">
                TIẾP TỤC MUA SẮM
              </button>
            </div>
          </div>

          <div className="mt-10">
            <h2 className="font-montserrat font-bold text-3xl text-primary text-center">CÓ THỂ BẠN SẼ THÍCH</h2>
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

        <form onSubmit={handleOrder} id="checkout-form" className="flex flex-col lg:flex-row gap-12">

          {/* CỘT TRÁI: THÔNG TIN GIAO HÀNG */}
          <div className="w-full lg:w-3/5">
            <div className="bg-white rounded-[32px] p-8 shadow-lg mb-8">
              <h2 className="font-montserrat font-bold text-xl text-primary mb-6 border-b border-gray-100 pb-4 text-center">Thông tin giao hàng</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
                <div className="space-y-2">
                  <label className="font-nunito font-semibold text-primary/80">Họ và tên <span className="text-red-500">*</span></label>
                  <input required type="text" value={form.receiverName} className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-pinky-gray/30 focus:bg-white focus:border-accent-1 outline-none transition-colors font-nunito" placeholder="Nhập họ và tên"
                    onChange={e => setForm({ ...form, receiverName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="font-nunito font-semibold text-primary/80 text-center">Số điện thoại <span className="text-red-500">*</span></label>
                  <input required type="tel" value={form.receiverPhone} className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-pinky-gray/30 focus:bg-white focus:border-accent-1 outline-none transition-colors font-nunito" placeholder="Nhập SĐT"
                    onChange={e => setForm({ ...form, receiverPhone: e.target.value })} />
                </div>
                <div className="space-y-2 border border-gray-200/50 p-2 rounded-xl bg-gray-50 text-center">
                  <label className="font-nunito font-semibold text-primary/80 text-center">Tỉnh / Thành phố <span className="text-red-500">*</span></label>
                  <select required value={form.shippingProvince} onChange={handleProvinceChange} className="w-full rounded-xl px-4 py-3 bg-pinky-gray/30 focus:bg-white focus:border-accent-1 outline-none font-nunito">
                    <option value="">Chọn tỉnh / thành phố</option>
                    {provinces.map(p => (
                      <option key={p.code} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 border border-gray-200/50 p-2 rounded-xl bg-gray-50 text-center">
                  <label className="font-nunito font-semibold text-primary/80 text-center">Quận / Huyện <span className="text-red-500">*</span></label>
                  <select required disabled={!form.shippingProvince} value={form.shippingDistrict} onChange={handleDistrictChange} className="w-full rounded-xl px-4 py-3 bg-pinky-gray/30 focus:bg-white focus:border-accent-1 outline-none font-nunito disabled:opacity-50">
                    <option value="">Chọn quận / huyện</option>
                    {districts.map(d => (
                      <option key={d.code} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-1 md:col-span-2 space-y-2 border border-gray-200/50 p-2 rounded-xl bg-gray-50">
                  <label className="block text-center font-nunito font-semibold text-primary/80">Phường / Xã <span className="text-red-500">*</span></label>
                  <select required disabled={!form.shippingDistrict} value={form.shippingWard} onChange={e => setForm({ ...form, shippingWard: e.target.value })} className="w-full rounded-xl px-4 py-3 bg-pinky-gray/30 focus:bg-white focus:border-accent-1 outline-none font-nunito disabled:opacity-50">
                    <option value="">Chọn phường / xã</option>
                    {wards.map(w => (
                      <option key={w.code} value={w.name}>{w.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-1 md:col-span-2 space-y-2 text-center">
                  <label className="font-nunito font-semibold text-primary/80 text-center">Địa chỉ cụ thể <span className="text-red-500">*</span></label>
                  <input required type="text" value={form.shippingDetailAddress} className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-pinky-gray/30 focus:bg-white focus:border-accent-1 outline-none transition-colors font-nunito" placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành"
                    onChange={e => setForm({ ...form, shippingDetailAddress: e.target.value })} />
                </div>
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="font-nunito font-semibold text-primary/80 text-center">Ghi chú đơn hàng (Tùy chọn)</label>
                  <textarea className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-pinky-gray/30 focus:bg-white focus:border-accent-1 outline-none transition-colors font-nunito min-h-[100px]" placeholder="Bạn có lưu ý gì về giờ nhận hàng không?"
                    onChange={e => setForm({ ...form, shippingNote: e.target.value })}></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG + THANH TOÁN */}
          <div className="w-full lg:w-2/5">
            <div className="bg-pinky-gray/50 rounded-[32px] p-8 border border-gray-200/50 sticky top-24 shadow-2xl space-y-6">

              {/* 1. Tóm tắt sản phẩm */}
              <div>
                <h2 className="font-montserrat font-bold text-xl text-primary mb-4 border-b border-gray-200 pb-4 text-center">Tóm tắt đơn hàng ({selectedItems.length} SP)</h2>
                <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {selectedItems.map((item) => (
                    <div key={`${item.productId}-${item.grindingOptionId}-${item.flavorNotes}-${item.weight}-${item.quantity}`} className="flex gap-4">
                      <div className="w-16 h-16 bg-white rounded-xl p-1 shrink-0 relative mt-2 flex items-center justify-center overflow-hidden">
                        <img 
                          src={
                            item.product?.imageUrl?.startsWith("http") 
                              ? item.product.imageUrl 
                              : `${BACKEND_URL}${item.product?.imageUrl || ""}`
                          } 
                          alt={item.product?.name} 
                          className="w-full h-full object-contain" 
                          onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=No+Image"; }}
                        />
                        <span className="absolute -top-2 -right-2 bg-primary text-white w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold font-nunito">{item.quantity}</span>
                      </div>
                      <div className="flex-1 font-nunito text-left">
                        <h4 className="font-bold text-primary text-sm line-clamp-1">{item.product?.name}</h4>
                        <p className="text-primary/60 text-xs mb-1">Xay: {translateGrind(item.grindingOptionId)}</p>
                        <p className="text-primary/60 text-xs mb-1">Vị: {item.flavorNotes}</p>
                        <p className="text-primary/60 text-xs mb-1">Khối lượng: {item.weight}</p>
                        <p className="font-bold text-accent-1 text-sm">{((item.product?.price || 0) * (item.quantity || 0)).toLocaleString('vi-VN')}đ</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Voucher / Mã giảm giá */}
              <div className="border-t border-b border-gray-200 py-4">
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setShowVoucherList(!showVoucherList)}
                    className="w-full flex items-center justify-between bg-white border rounded-2xl px-4 py-4 hover:border-primary transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <LuTicketPercent size={20} className="text-primary" />
                      <div className="text-left">
                        <h3 className="font-bold text-primary">Voucher & Khuyến mãi</h3>
                        {selectedVoucher ? (
                          <p className="text-sm text-accent-1 font-semibold">Đang áp dụng: {selectedVoucher.code}</p>
                        ) : (
                          <p className="text-sm text-gray-400">Chọn voucher phù hợp</p>
                        )}
                      </div>
                    </div>
                    <div className={`transition-transform duration-300 ${showVoucherList ? 'rotate-180' : ''}`}>▼</div>
                  </button>

                  {showVoucherList && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      {availableVouchers.length === 0 ? (
                        <div className="text-sm text-gray-400 px-2">Không có voucher phù hợp</div>
                      ) : (
                        availableVouchers.map((voucher) => (
                          <button
                            key={voucher.id}
                            type="button"
                            onClick={() => {
                              setSelectedVoucher(voucher);
                              setShowVoucherList(false);
                            }}
                            className={`w-full flex items-start gap-3 p-4 border-2 rounded-2xl transition-all text-left
                              ${selectedVoucher?.id === voucher.id ? 'border-primary bg-primary/5' : 'border-gray-200 bg-white hover:border-primary/40'}`}
                          >
                            <div className={`mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0
                                ${selectedVoucher?.id === voucher.id ? 'border-primary' : 'border-gray-300'}`}>
                              {selectedVoucher?.id === voucher.id && <div className="w-2 h-2 rounded-full bg-primary"></div>}
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-accent-1">{voucher.code}</div>
                              <div className="text-sm text-gray-500">{voucher.title}</div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Chi tiết tính toán tiền bạc */}
              <div className="space-y-3 font-nunito text-primary/80">
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span className="font-bold">{totalPrice.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí giao hàng</span>
                  <span className="font-bold">{shippingFee.toLocaleString('vi-VN')}đ</span>
                </div>
                {selectedVoucher && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá</span>
                    <span>-{discountAmount.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                <div className="flex justify-between pt-4 border-t border-gray-200 items-center">
                  <span className="font-montserrat font-bold text-xl text-primary">TỔNG CỘNG</span>
                  <span className="font-montserrat font-black text-3xl text-red-custom">{finalPrice.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              {/* 4. Phương thức thanh toán */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <h3 className="font-montserrat font-bold text-lg text-primary mb-2 text-left">Phương thức thanh toán</h3>
                <div className="space-y-3">
                  <label className={`flex items-start gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-gray-200/70 bg-white'}`}>
                    <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'cod' ? 'border-primary' : 'border-gray-300'}`}>
                      {paymentMethod === 'cod' && <div className="w-2 h-2 bg-primary rounded-full"></div>}
                    </div>
                    <input type="radio" name="payment" value="cod" className="hidden" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                    <div className="text-left">
                      <h4 className="font-montserrat font-bold text-primary text-sm">Thanh toán khi nhận hàng (COD)</h4>
                      <p className="font-nunito text-primary/60 text-xs mt-0.5">Trả bằng tiền mặt/QR cho Shipper khi giao.</p>
                    </div>
                  </label>

                  <label className={`flex items-start gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'vnpay' ? 'border-primary bg-primary/5' : 'border-gray-200/70 bg-white'}`}>
                    <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'vnpay' ? 'border-primary' : 'border-gray-300'}`}>
                      {paymentMethod === 'vnpay' && <div className="w-2 h-2 bg-primary rounded-full"></div>}
                    </div>
                    <input type="radio" name="payment" value="vnpay" className="hidden" checked={paymentMethod === 'vnpay'} onChange={() => setPaymentMethod('vnpay')} />
                    <div className="text-left">
                      <h4 className="font-montserrat font-bold text-primary text-sm flex items-center gap-2">Chuyển khoản / VNPAY</h4>
                      <p className="font-nunito text-primary/60 text-xs mt-0.5">Quét mã QR qua ứng dụng Ngân hàng.</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* 5. Nút và thông tin bảo mật */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!isFormValid || selectedItems.length === 0}
                  className={`w-full font-nunito font-bold py-4 rounded-full text-lg shadow-lg transition-all duration-300 text-center uppercase tracking-wider
                    ${(isFormValid && selectedItems.length > 0)
                      ? "bg-primary text-white hover:bg-accent-1 hover:-translate-y-1 hover:scale-105 cursor-pointer"
                      : "bg-gray-300 text-gray-500 opacity-60 cursor-not-allowed shadow-none transform-none"
                    }`}
                >
                  {paymentMethod === 'cod' ? 'ĐẶT HÀNG NGAY' : 'TIẾN HÀNH THANH TOÁN'}
                </button>
                <div className="flex items-center justify-center gap-2 mt-4 text-primary/50 font-nunito text-xs">
                  <Info size={14} /> Patrons cam kết bảo mật thông tin của bạn
                </div>
              </div>

            </div>
          </div>

        </form>
      </div>
    </div>
  );
}