import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { Check, Info } from 'lucide-react';
import addressData from 'vietnam-address-database';
import axios from 'axios';
import Giftsets from '../components/Giftsets';
import Combos from '../components/Combos';

export default function Checkout() {
  const navigate = useNavigate();
  const cart = useStore((state) => state.cart);
  const clearCart = useStore((state) => state.clearCart);
  const createOrder = useStore((state) => state.createOrder);

  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const user = useStore((state) => state.user);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [finalTotal, setFinalTotal] = useState(0);

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
  const [paymentMethod, setPaymentMethod] = useState('cod');
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
      case 2: return "Phan Phin";
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
      PaymentMethod: paymentMethod === 'cod' ? 'COD' : 'VNPAY'
    };

    try {
      const res = await createOrder(payload);
      console.log('Order created:', res.data);

      setFinalTotal(totalPrice + shippingFee);
      setCreatedOrder(res.data);
      setOrderSuccess(true);

      alert('Đơn hàng của bạn đã được tạo thành công!');
    } catch (error) {
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
              <div className="flex gap-2 mb-6 border-t border-b border-gray-200 py-6">
                <input type="text" placeholder="Mã giảm giá" className="flex-1 border border-gray-200 rounded-xl px-4 font-nunito outline-none focus:border-primary" />
                <button className="bg-primary hover:bg-accent-1 text-white font-nunito font-bold px-6 py-3 rounded-xl hover:-translate-y-1 transition-all duration-300 hover:scale-105">ÁP DỤNG</button>
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
                <div className="flex justify-between pt-4 border-t border-gray-200 items-center">
                  <span className="font-montserrat font-bold text-xl text-primary">TỔNG CỘNG</span>
                  <span className="font-montserrat font-black text-3xl text-red-custom">{(totalPrice + shippingFee).toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                className="w-full bg-primary text-white font-nunito font-bold py-4 rounded-full text-lg hover:bg-accent-1 shadow-lg hover:-translate-y-1 transition-all duration-300 hover:scale-110"
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
    </div>
  );
}
