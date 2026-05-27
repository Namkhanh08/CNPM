import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useStore from '../store/useStore';
import { Info } from 'lucide-react';
import axios from 'axios';

export default function EditOrder() {
    const navigate = useNavigate();
    const { id } = useParams();
    const orders = useStore((state) => state.orders);
    const updateUserOrder = useStore((state) => state.updateUserOrder);

    const order = orders.find(o => o.Id === Number(id));

    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    
    const isPaymentLocked =
        order?.Status === "Đã xác nhận" ||
        order?.Status === "Đang giao" ||
        order?.Status === "Hoàn thành" || 
        order?.Status === 'Đã thanh toán';

    const [paymentMethod, setPaymentMethod] = useState('cod');

    const [form, setForm] = useState({
        receiverName: '',
        receiverPhone: '',
        shippingProvince: '',
        shippingDistrict: '',
        shippingWard: '',
        shippingDetailAddress: '',
        shippingNote: '',
    });

    // 1. Fetch danh sách Tỉnh/Thành phố ban đầu
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const res = await axios.get('https://provinces.open-api.vn/api/p/');
                setProvinces(res.data);
            } catch (error) {
                console.error("Lỗi fetch provinces:", error);
            }
        };
        fetchProvinces();
    }, []);

    // 2. Đồng bộ dữ liệu cũ của đơn hàng và tự động đổ dữ liệu Quận/Huyện/Xã tương ứng
    useEffect(() => {
        if (!order || provinces.length === 0) return;

        setForm({
            receiverName: order.ReceiverName || '',
            receiverPhone: order.ReceiverPhone || '',
            shippingProvince: order.ShippingProvince || '',
            shippingDistrict: order.ShippingDistrict || '',
            shippingWard: order.ShippingWard || '',
            shippingDetailAddress: order.ShippingDetailAddress || '',
            shippingNote: order.ShippingNote || '',
        });

        setPaymentMethod(order.PaymentMethod === 'VNPAY' ? 'vnpay' : 'cod');

        const loadDeeperLocation = async () => {
            const foundProvince = provinces.find(p => p.name === order.ShippingProvince);
            if (foundProvince) {
                try {
                    const distRes = await axios.get(`https://provinces.open-api.vn/api/p/${foundProvince.code}?depth=2`);
                    setDistricts(distRes.data.districts);

                    const foundDistrict = distRes.data.districts.find(d => d.name === order.ShippingDistrict);
                    if (foundDistrict) {
                        const wardRes = await axios.get(`https://provinces.open-api.vn/api/d/${foundDistrict.code}?depth=2`);
                        setWards(wardRes.data.wards);
                    }
                } catch (err) {
                    console.error("Lỗi load dữ liệu địa chỉ cũ:", err);
                }
            }
        };

        loadDeeperLocation();
    }, [order, provinces]);

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

    const totalPrice = order?.OrderDetails?.reduce(
        (total, item) => total + ((item.UnitPrice || 0) * (item.Quantity || 0)), 0
    ) || 0;

    const shippingFee = 30000;

    const handleUpdate = async (e) => {
        e.preventDefault();

        try {
            const payload = {
                receiverName: form.receiverName,
                receiverPhone: form.receiverPhone,
                shippingProvince: form.shippingProvince,
                shippingDistrict: form.shippingDistrict,
                shippingWard: form.shippingWard,
                shippingDetailAddress: form.shippingDetailAddress,
                shippingNote: form.shippingNote,
                paymentMethod: paymentMethod === 'cod' ? 'COD' : 'VNPAY'
            };

            await updateUserOrder(order.Id, payload);
            alert('Cập nhật đơn hàng thành công!');
            navigate('/orders');
        } catch (error) {
            console.error(error);
            alert('Cập nhật thất bại!');
        }
    };

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Đang tải dữ liệu đơn hàng...
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen py-12 pb-20">
            <form onSubmit={handleUpdate} className="container mx-auto px-6 lg:px-12 max-w-7xl">
                <h1 className="font-nunito font-bold text-4xl text-primary mb-10 text-center">
                    CHỈNH SỬA ĐƠN HÀNG
                </h1>

                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="w-full lg:w-3/5">
                        <div className="bg-white rounded-[32px] p-8 shadow-sm mb-8 border border-gray-100">
                            <h2 className="font-montserrat font-bold text-xl text-primary mb-6 border-b border-gray-100 pb-4 text-center">
                                Thông tin giao hàng
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="font-nunito font-semibold text-primary/80">Họ và tên <span className="text-red-500">*</span></label>
                                    <input required type="text" value={form.receiverName} className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none font-nunito" placeholder="Nhập họ và tên"
                                        onChange={e => setForm({ ...form, receiverName: e.target.value })} />
                                </div>

                                <div className="space-y-2">
                                    <label className="font-nunito font-semibold text-primary/80">Số điện thoại <span className="text-red-500">*</span></label>
                                    <input required type="tel" value={form.receiverPhone} className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none font-nunito" placeholder="Nhập SĐT"
                                        onChange={e => setForm({ ...form, receiverPhone: e.target.value })} />
                                </div>

                                <div className="space-y-2 border-gray-200/50 border p-2 rounded-xl bg-gray-50">
                                    <label className="font-nunito font-semibold text-primary/80">Tỉnh / Thành phố <span className="text-red-500">*</span></label>
                                    <select required value={form.shippingProvince} onChange={handleProvinceChange} className="w-full rounded-xl px-4 py-3 bg-white outline-none font-nunito">
                                        <option value="">Chọn tỉnh / thành phố</option>
                                        {provinces.map(p => <option key={p.code} value={p.name}>{p.name}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2 border-gray-200/50 border p-2 rounded-xl bg-gray-50">
                                    <label className="font-nunito font-semibold text-primary/80">Quận / Huyện <span className="text-red-500">*</span></label>
                                    <select required disabled={!form.shippingProvince} value={form.shippingDistrict} onChange={handleDistrictChange} className="w-full rounded-xl px-4 py-3 bg-white outline-none font-nunito disabled:opacity-50">
                                        <option value="">Chọn quận / huyện</option>
                                        {districts.map(d => <option key={d.code} value={d.name}>{d.name}</option>)}
                                    </select>
                                </div>

                                <div className="col-span-1 md:col-span-2 space-y-2 border-gray-200/50 border p-2 rounded-xl bg-gray-50">
                                    <label className="block font-nunito font-semibold text-primary/80">Phường / Xã <span className="text-red-500">*</span></label>
                                    <select required disabled={!form.shippingDistrict} value={form.shippingWard} onChange={e => setForm({ ...form, shippingWard: e.target.value })} className="w-full rounded-xl px-4 py-3 bg-white outline-none font-nunito disabled:opacity-50">
                                        <option value="">Chọn phường / xã</option>
                                        {wards.map(w => <option key={w.code} value={w.name}>{w.name}</option>)}
                                    </select>
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <label className="font-nunito font-semibold text-primary/80">Địa chỉ cụ thể</label>
                                    <input type="text" value={form.shippingDetailAddress} onChange={(e) => setForm({ ...form, shippingDetailAddress: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3" />
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <label className="font-nunito font-semibold text-primary/80">Ghi chú</label>
                                    <textarea value={form.shippingNote} onChange={(e) => setForm({ ...form, shippingNote: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 min-h-[120px]" />
                                </div>
                            </div>
                        </div>

                        <div className={`space-y-4 ${isPaymentLocked ? 'opacity-60 pointer-events-none' : ''}`}>
                            {isPaymentLocked && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-4 text-sm text-yellow-700 font-nunito">
                                    Phương thức thanh toán đã bị khóa vì đơn hàng đang xử lý hoặc đã thanh toán.
                                </div>
                            )}
                            <label className={`flex items-start gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-gray-100'}`}>
                                <input type="radio" disabled={isPaymentLocked} name="payment" value="cod" checked={paymentMethod === 'cod'} className="mt-1" onChange={() => setPaymentMethod('cod')} />
                                <div>
                                    <h3 className="font-montserrat font-bold text-primary mb-1">Thanh toán khi nhận hàng (COD)</h3>
                                    <p className="font-nunito text-primary/60 text-sm">Trả bằng tiền mặt hoặc chuyển khoản cho Shipper.</p>
                                </div>
                            </label>

                            <label className={`flex items-start gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'vnpay' ? 'border-primary bg-primary/5' : 'border-gray-100'}`}>
                                <input type="radio" name="payment" disabled={isPaymentLocked} value="vnpay" checked={paymentMethod === 'vnpay'} className="mt-1" onChange={() => setPaymentMethod('vnpay')} />
                                <div>
                                    <h3 className="font-montserrat font-bold text-primary mb-1">Chuyển khoản trực tuyến / VNPAY</h3>
                                    <p className="font-nunito text-primary/60 text-sm">Thanh toán an toàn qua cổng VNPAY.</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="w-full lg:w-2/5">
                        <div className="bg-gray-50 rounded-[32px] p-8 border border-gray-200/50 sticky top-24">
                            <h2 className="font-montserrat font-bold text-xl text-primary mb-6 border-b border-gray-200 pb-4">
                                Sản phẩm trong đơn
                            </h2>

                            <div className="space-y-4 mb-8 opacity-60 pointer-events-none select-none">
                                {order.OrderDetails?.map((item, index) => (
                                    <div key={index} className="flex gap-4 bg-white rounded-2xl p-4 border border-gray-100">
                                        <div className="w-16 h-16 bg-white rounded-xl p-1 shrink-0">
                                            <img src={item.Product?.ImageUrl} alt={item.Product?.Name} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-1 font-nunito text-left">
                                            <h4 className="font-bold text-primary text-sm">{item.Product?.Name}</h4>
                                            <p className="text-primary/60 text-xs">Số lượng: {item.Quantity} | Xay: {translateGrind(item.GrindingOptionId)}</p>
                                            <p className="font-bold text-accent-1 text-sm mt-1">{(item.UnitPrice * item.Quantity).toLocaleString('vi-VN')}đ</p>
                                        </div>
                                    </div>
                                ))}
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
                                <div className="flex justify-between">
                                    <span className='text-green-500'>Giảm giá</span>
                                    <span className="font-bold text-green-500">- {(order.DiscountAmount || 0).toLocaleString()}đ</span>
                                </div>
                                <div className="flex justify-between pt-4 border-t border-gray-200 items-center">
                                    <span className="font-montserrat font-bold text-xl text-primary">TỔNG CỘNG</span>
                                    <span className="font-montserrat font-black text-3xl text-red-600">{(order.FinalAmount || 0).toLocaleString()}đ</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <button type="submit" className="w-full bg-primary text-white font-nunito font-bold py-4 rounded-full text-lg hover:bg-opacity-90 transition-all duration-300">
                                    CẬP NHẬT
                                </button>
                                <button type="button" onClick={() => navigate('/orders')} className="w-full border border-red-400 text-red-500 font-nunito font-bold py-4 rounded-full text-lg hover:bg-red-50 transition-all duration-300">
                                    HỦY
                                </button>
                            </div>

                            <div className="flex items-center justify-center gap-2 mt-4 text-primary/50 font-nunito text-sm">
                                <Info size={16} />
                                Chỉnh sửa sẽ cập nhật trực tiếp đơn hàng hiện tại
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}