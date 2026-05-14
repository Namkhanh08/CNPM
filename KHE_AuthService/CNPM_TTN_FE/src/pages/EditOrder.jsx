import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useStore from '../store/useStore';
import { Info } from 'lucide-react';
import axios from 'axios';

export default function EditOrder() {
    const navigate = useNavigate();
    const { id } = useParams();
    const user = useStore((state) => state.user);
    const orders = useStore((state) => state.orders);
    const updateOrder = useStore((state) => state.updateOrder);
    console.log(useStore.getState().updateOrder);

    const order = orders.find(o => o.Id === Number(id));

    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

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

    useEffect(() => {
        if (!order) return;

        setForm({
            receiverName: order.ReceiverName || '',
            receiverPhone: order.ReceiverPhone || '',
            shippingProvince: order.ShippingProvince || '',
            shippingDistrict: order.ShippingDistrict || '',
            shippingWard: order.ShippingWard || '',
            shippingDetailAddress: order.ShippingDetailAddress || '',
            shippingNote: order.ShippingNote || '',
        });

        setPaymentMethod(
            order.PaymentMethod === 'VNPAY'
                ? 'vnpay'
                : 'cod'
        );
    }, [order]);

    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const res = await axios.get(
                    'https://provinces.open-api.vn/api/p/'
                );
                setProvinces(res.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchProvinces();
    }, []);

    const handleProvinceChange = async (e) => {
        const provinceName = e.target.value;

        const province = provinces.find(
            p => p.name === provinceName
        );

        setForm(prev => ({
            ...prev,
            shippingProvince: provinceName,
            shippingDistrict: '',
            shippingWard: ''
        }));

        setDistricts([]);
        setWards([]);

        if (province) {
            const res = await axios.get(
                `https://provinces.open-api.vn/api/p/${province.code}?depth=2`
            );

            setDistricts(res.data.districts);
        }
    };

    const handleDistrictChange = async (e) => {
        const districtName = e.target.value;

        const district = districts.find(
            d => d.name === districtName
        );

        setForm(prev => ({
            ...prev,
            shippingDistrict: districtName,
            shippingWard: ''
        }));

        setWards([]);

        if (district) {
            const res = await axios.get(
                `https://provinces.open-api.vn/api/d/${district.code}?depth=2`
            );

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

    const totalPrice =
        order?.OrderDetails?.reduce(
            (total, item) =>
                total + ((item.UnitPrice || 0) * item.Quantity),
            0
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

                paymentMethod:
                    paymentMethod === 'cod'
                        ? 'COD'
                        : 'VNPAY'
            };

            await updateOrder(order.Id, payload);

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
                Không tìm thấy đơn hàng
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen py-12 pb-20">
            <div className="container mx-auto px-6 lg:px-12 max-w-7xl">

                <h1 className="font-nunito font-bold text-4xl text-primary mb-10 text-center">
                    CHỈNH SỬA ĐƠN HÀNG
                </h1>

                <div className="flex flex-col lg:flex-row gap-12">

                    {/* FORM */}
                    <div className="w-full lg:w-3/5">

                        <form onSubmit={handleUpdate}>

                            {/* SHIPPING */}
                            <div className="bg-white rounded-[32px] p-8 shadow-sm mb-8">

                                <h2 className="font-montserrat font-bold text-xl text-primary mb-6 border-b border-gray-100 pb-4">
                                    Thông tin giao hàng
                                </h2>

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

                                    {/* Province */}
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

                                    {/* District */}
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

                                    {/* Ward */}
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

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="font-nunito font-semibold text-primary/80">
                                            Địa chỉ cụ thể
                                        </label>

                                        <input
                                            type="text"
                                            value={form.shippingDetailAddress}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    shippingDetailAddress: e.target.value
                                                })
                                            }
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-pinky-gray/30"
                                        />
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="font-nunito font-semibold text-primary/80">
                                            Ghi chú
                                        </label>

                                        <textarea
                                            value={form.shippingNote}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    shippingNote: e.target.value
                                                })
                                            }
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-pinky-gray/30 min-h-[120px]"
                                        />
                                    </div>

                                </div>
                            </div>

                            {/* PAYMENT */}
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

                        </form>
                    </div>

                    {/* SUMMARY */}
                    <div className="w-full lg:w-2/5">

                        <div className="bg-pinky-gray/50 rounded-[32px] p-8 border border-gray-200/50 sticky top-24">

                            <h2 className="font-montserrat font-bold text-xl text-primary mb-6 border-b border-gray-200 pb-4">
                                Sản phẩm trong đơn
                            </h2>

                            <div className="space-y-4 mb-8 opacity-60 pointer-events-none select-none ">

                                {order.OrderDetails?.map((item, index) => (

                                    <div
                                        key={index}
                                        className="flex gap-4 bg-white rounded-2xl p-4"
                                    >

                                        <div className="w-16 h-16 bg-white rounded-xl p-1 shrink-0">

                                            <img
                                                src={item.Product?.ImageUrl}
                                                alt={item.Product?.Name}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>

                                        <div className="flex-1 font-nunito text-left">

                                            <h4 className="font-bold text-primary text-sm">
                                                {item.Product?.Name}
                                            </h4>

                                            <p className="text-primary/60 text-xs">
                                                Số lượng: {item.Quantity}
                                            </p>

                                            <p className="text-primary/60 text-xs">
                                                Xay: {translateGrind(item.GrindingOptionId)}
                                            </p>

                                            <p className="text-primary/60 text-xs">
                                                Vị: {item.FlavorNotes}
                                            </p>

                                            <p className="text-primary/60 text-xs">
                                                Khối lượng: {item.Weight}
                                            </p>

                                            <p className="font-bold text-accent-1 text-sm mt-1">
                                                {(item.UnitPrice * item.Quantity).toLocaleString('vi-VN')}đ
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6 text-sm text-yellow-700 font-nunito">
                                Sản phẩm trong đơn hàng không thể chỉnh sửa.
                                Bạn chỉ có thể thay đổi thông tin nhận hàng và phương thức thanh toán.
                            </div>

                            <div className="space-y-4 mb-8 font-nunito text-primary/80">

                                <div className="flex justify-between">
                                    <span>Tạm tính</span>

                                    <span className="font-bold">
                                        {totalPrice.toLocaleString('vi-VN')}đ
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Phí giao hàng</span>

                                    <span className="font-bold">
                                        {shippingFee.toLocaleString('vi-VN')}đ
                                    </span>
                                </div>

                                <div className="flex justify-between pt-4 border-t border-gray-200 items-center">

                                    <span className="font-montserrat font-bold text-xl text-primary">
                                        TỔNG CỘNG
                                    </span>

                                    <span className="font-montserrat font-black text-3xl text-red-custom">
                                        {(totalPrice + shippingFee).toLocaleString('vi-VN')}đ
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">

                                <button
                                    onClick={handleUpdate}
                                    className="w-full bg-primary text-white font-nunito font-bold py-4 rounded-full text-lg hover:bg-accent-1 hover:-translate-y-1 transition-all duration-300 hover:scale-110"
                                >
                                    CẬP NHẬT
                                </button>

                                <button
                                    onClick={() => navigate('/orders')}
                                    className="w-full border border-red-400 text-red-500 font-nunito font-bold py-4 rounded-full text-lg hover:bg-red-50 hover:-translate-y-1 transition-all duration-300 hover:scale-110"
                                >
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
            </div>
        </div>
    );
}
