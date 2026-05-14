import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import image1 from '../assets/img/section2/image1.png';
import image3 from '../assets/img/section2/image3.png';
import { Coffee, CalendarSync, CreditCard, ChevronRight } from 'lucide-react';
import API from '../services/api';


export default function Subscription() {
  const navigate = useNavigate();
  const products = useStore((state) => state.products);
  const fetchProducts = useStore((state) => state.fetchProducts);
  const [productDetail, setProductDetail] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  useEffect(() => {
    fetchProducts();
  }, []);
  const [step, setStep] = useState(1); // 1: Product, 2: Grind & Qty, 3: Frequency

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [grindType, setGrindType] = useState('whole');
  const [weights, setWeight] = useState(""); // in grams
  const [frequency, setFrequency] = useState('2weeks'); // 1week, 2weeks, 1month
  const [flavorNotes, setFlavorNotes] = useState('Original');
  const [quantity, setQuantity] = useState(1);

  const handleSubscribe = () => {
    alert(`Đã đăng ký thành công gói giao cà phê định kỳ: ${selectedProduct.name} (${weight}g) mỗi ${frequency === '1week' ? '1 tuần' : frequency === '2weeks' ? '2 tuần' : '1 tháng'}.`);
    navigate('/');
  };
  const handleSelectProduct = async (product) => {

    setSelectedProduct(product);

    try {

      const res = await API.getProductById(product.Id);

      const detail = res.data;

      console.log("DETAIL:", detail);

      setProductDetail(detail);

      // Flavor options
      const flavors = detail.FlavorNotes
        ? detail.FlavorNotes.split(',').map(f => f.trim())
        : [];

      // Weight options
      const weightList = detail.Weight
        ? detail.Weight.split(',').map(w => w.trim())
        : [];

      // Default selected values
      setFlavorNotes(flavors[0] || "");
      setWeight(weightList[0] || "");
      setGrindType(detail.GrindingOption?.[0] || null);

    } catch (err) {

      console.error(err);

    }

  };
  useEffect(() => {

    if (products.length > 0 && !selectedProduct) {

      handleSelectProduct(products[0]);

    }

  }, [products]);
  const CategoryMap = {
    '1': 'Arabica',
    '2': 'Blend',
    '3': 'Robusta',
    '4': 'Fine Robusta',

  }
  const steps = [
    { id: 1, label: 'Chọn Cà phê' },
    { id: 2, label: 'Định lượng' },
    { id: 3, label: 'Chu kỳ Giao' }
  ];
  const flavorOptions = productDetail?.FlavorNotes
    ? productDetail.FlavorNotes.split(',').map(f => f.trim())
    : [];

  const weightOptions = productDetail?.Weight
    ? productDetail.Weight.split(',').map(w => w.trim())
    : [];

  const grindOptions = productDetail?.GrindingOption || [];

  if (!products.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Đang tải sản phẩm...</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-12">
      <div className="container mx-auto px-6 lg:px-12 max-w-5xl">
        <div className="text-center mb-12">
          <p className="text-accent-1 font-nunito font-bold tracking-[0.2em] uppercase mb-4 text-2xl pb-2">Dịch vụ giao cà phê định kỳ</p>
          <h1 className="font-montserrat font-black text-5xl text-primary pb-2">REVO SUBSCRIPTION</h1>
          <p className="font-nunito text-primary/70 mt-4 max-w-2xl mx-auto text-xl">Tận hưởng cà phê tươi mới được rang xay và giao đến tận cửa nhà bạn theo lịch trình tuỳ chỉnh. Trải nghiệm tiện lợi đích thực.</p>
        </div>

        {/* Progress Bar */}
        <div className="flex justify-between items-center mb-12 px-0 md:px-20 relative">

          {/* Background line */}
          <div className="absolute top-6 left-0 w-full h-[3px] bg-gray-200 rounded-full"></div>

          {/* Active progress */}
          <div
            className="absolute top-6 left-0 h-[3px] bg-primary rounded-full transition-all duration-500"
            style={{
              width:
                step === 1
                  ? '16%'
                  : step === 2
                    ? '50%'
                    : '85%'
            }}
          ></div>

          {steps.map((s) => (

            <div
              key={s.id}
              className="flex flex-col items-center z-10 cursor-pointer"
              onClick={() => {
                if (s.id === 1) {
                  setStep(1);
                }

                if (s.id === 2 && selectedProduct) {
                  setStep(2);
                }

                if (s.id === 3 && selectedProduct) {
                  setStep(3);
                }
              }}
            >

              {/* Circle */}
              <div
                className={`
          w-12 h-12 rounded-full flex items-center justify-center
          font-montserrat font-bold text-lg mb-2
          transition-all duration-300
          ${step >= s.id
                    ? 'bg-primary text-white shadow-lg scale-110'
                    : 'bg-white border-2 border-gray-300 text-gray-400'
                  }
        `}
              >
                {s.id}
              </div>

              {/* Label */}
              <span
                className={`
          font-nunito text-sm font-bold transition-colors
          ${step >= s.id
                    ? 'text-primary'
                    : 'text-gray-400'
                  }
        `}
              >
                {s.label}
              </span>

            </div>

          ))}
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-[40px] p-8 lg:p-12 shadow-2xl border-2 min-h-[400px]">

          {/* Step 1: Chọn Cà phê */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="font-montserrat font-bold text-2xl text-primary mb-8 text-center"><Coffee className="inline mr-2" /> Bạn muốn uống loại cà phê nào?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                {products.map(p => (
                  <div
                    key={p.Id}
                    onClick={() => handleSelectProduct(p)}
                    className={`border-2 rounded-3xl p-6 cursor-pointer hover:shadow-lg transition-all flex flex-col items-center group relative overflow-hidden hover:-translate-y-1 transition-all duration-300 hover:scale-110 ${selectedProduct?.Id === p.Id ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-primary/30'}`}
                  >
                    {selectedProduct?.Id === p.Id && <div className="absolute top-4 right-4 bg-primary text-white rounded-full p-1"><Check size={16} /></div>}
                    <div className="h-32 mb-4">
                      <img src={p.ImageUrl} alt={p.Name} className={`h-full object-contain filter drop-shadow-md transition-transform duration-500 ${selectedProduct?.Id === p.Id ? 'scale-110' : 'group-hover:scale-105'}`} />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center ">

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/product/${p.Id}`);
                          }}
                          className="bg-white text-primary px-6 py-3 rounded-full font-bold hover:bg-primary hover:text-white transition-all"
                        >
                          Xem chi tiết
                        </button>

                      </div>
                    </div>
                    <h3 className="font-montserrat font-bold text-lg text-accent-1 text-center line-clamp-2">{CategoryMap[p.CategoryId] || p.CategoryId}</h3>
                    <h3 className="font-montserrat font-bold text-lg text-primary text-center line-clamp-2">{p.Name}</h3>
                  </div>
                ))}
              </div>
              <div className="flex justify-center mt-12">
                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedProduct}
                  className="bg-primary text-white font-nunito font-bold py-3 px-12 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent-1 transition-colors flex items-center gap-2"
                >
                  Tiếp theo <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Định lượng & Kiểu xay */}
          {step === 2 && (
            <div className="animate-fade-in max-w-3xl mx-auto">
              <h2 className="font-montserrat font-bold text-2xl text-primary mb-8 text-center">Tùy chỉnh thông số</h2>

              {/* Flavor Notes Type Selection - Mức ưu tiên thiết kế trải nghiệm */}
              <div className="mb-8 border-b border-accent-1 pb-10">
                <h3 className="font-montserrat font-bold text-primary mb-4 uppercase text-center">Chọn hương vị</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {flavorOptions.map((flavor, index) => (
                    <button
                      key={index}
                      onClick={() => setFlavorNotes(flavor)}
                      className={`border-2 py-3 px-4 rounded-xl font-nunito font-semibold text-sm transition-all text-center ${flavorNotes === flavor
                        ? 'border-primary bg-primary text-white shadow-md'
                        : 'border-gray-200 text-primary/70 hover:border-primary/50'
                        }`}
                    >
                      {flavor}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weight Type Selection - Mức ưu tiên thiết kế trải nghiệm */}
              <div className="mb-8">
                <h3 className="font-montserrat font-bold text-primary mb-4 uppercase text-center">Chọn khối lượng</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {weightOptions.map((weight, index) => (
                    <button
                      key={index}
                      onClick={() => setWeight(weight)}
                      className={`border-2 py-3 px-4 rounded-xl font-nunito font-semibold text-sm transition-all text-center ${weights === weight
                        ? 'border-primary bg-primary text-white shadow-md'
                        : 'border-gray-200 text-primary/70 hover:border-primary/50'
                        }`}
                    >
                      {weight}
                    </button>
                  ))}
                </div>
              </div>

              {/* GrindType Selecttion */}
              <div className='mb-8 border-t border-accent-1 pt-6'>
                <h3 className='font-montserrat font-bold text-primary mb-4 uppercase text-center'>Chọn kiểu xay</h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
                  {grindOptions.map((grind) => (
                    <button
                      key={grind.Id}
                      onClick={() => setGrindType(grind)}
                      className={`border-2 py-3 px-4 rounded-xl font-nunito font-semibold text-sm transition-all text-center ${grindType?.Id === grind.Id
                        ? 'border-primary bg-primary text-white shadow-md'
                        : 'border-gray-200 text-primary/70 hover:border-primary/50'
                        }`}
                    >
                      {grind.Name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selection */}
              <div className='mb-8 border-t border-accent-1 pt-6'>

                <h3 className='font-montserrat font-bold text-primary mb-4 uppercase text-center'>
                  Chọn số lượng
                </h3>

                <div className='flex items-center justify-center gap-6'>

                  <div className='flex border p-2 rounded-full'>
                    <button
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className='w-12 h-12 rounded-full text-primary text-2xl font-bold hover:bg-accent-1 hover:border-none hover:text-white transition-all'
                    >
                      -
                    </button>

                    <div className='text-3xl font-montserrat font-black text-accent-1 min-w-[60px] text-center'>
                      {quantity}
                    </div>

                    <button
                      onClick={() => setQuantity(prev => prev + 1)}
                      className='w-12 h-12 rounded-full text-primary text-2xl font-bold hover:bg-accent-1 hover:border-none  hover:text-white transition-all'
                    >
                      +
                    </button>
                  </div>

                </div>

              </div>

              <div className="flex justify-between mt-12">
                <button onClick={() => setStep(1)} className="text-primary font-nunito font-bold hover:text-accent-1 px-4">Quay lại</button>
                <button
                  onClick={() => setStep(3)}
                  className="bg-primary text-white font-nunito font-bold py-3 px-12 rounded-full hover:bg-accent-1 transition-colors flex items-center gap-2"
                >
                  Tiếp theo <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Chu kỳ giao */}
          {step === 3 && (
            <div className="animate-fade-in max-w-3xl mx-auto">

              <h2 className="font-montserrat font-bold text-2xl text-primary mb-8 text-center">
                <CalendarSync className="inline mr-2" />
                Bạn muốn nhận cà phê bao lâu một lần?
              </h2>

              {/* Frequency Options */}
              <div className="flex flex-col gap-4 mb-10">

                {[
                  {
                    id: '1week',
                    title: '1 TUẦN / LẦN',
                    desc: 'Lựa chọn phổ biến nhất. Đảm bảo cà phê luôn tươi mới nhất.',
                    discount: 'Giảm 15%'
                  },
                  {
                    id: '2weeks',
                    title: '2 TUẦN / LẦN',
                    desc: 'Phù hợp cho người uống 1-2 ly mỗi ngày.',
                    discount: 'Giảm 10%'
                  },
                  {
                    id: '1month',
                    title: '1 THÁNG / LẦN',
                    desc: 'Cung cấp đủ cho cả tháng của bạn.',
                    discount: 'Giảm 5%'
                  }
                ].map((f) => (

                  <div
                    key={f.id}
                    onClick={() => setFrequency(f.id)}
                    className={`
            flex items-center justify-between
            p-6 border-2 rounded-2xl cursor-pointer
            transition-all
            ${frequency === f.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-100 hover:border-primary/30'
                      }
          `}
                  >

                    <div>
                      <h4 className="font-montserrat font-bold text-lg text-primary flex items-center gap-4">

                        {f.title}

                        <span className="bg-red-custom text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                          {f.discount}
                        </span>

                      </h4>

                      <p className="font-nunito text-primary/70 text-sm">
                        {f.desc}
                      </p>
                    </div>

                    <div
                      className={`
              w-6 h-6 rounded-full flex items-center justify-center border-2
              ${frequency === f.id
                          ? 'border-primary'
                          : 'border-gray-300'
                        }
            `}
                    >
                      {frequency === f.id && (
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                      )}
                    </div>

                  </div>

                ))}

              </div>

              {/* Payment */}
              <div className="space-y-4 mb-12 border-t border-accent-1 pt-10 border-b border-accent-1 pb-10">
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

              {/* Summary Setup */}
              <div className="bg-pinky-gray p-6 rounded-2xl mb-8 font-nunito border border-gray-200">

                <h4 className="font-bold text-primary mb-4 border-b border-gray-300 pb-2">
                  Tóm tắt Gói Đăng Ký
                </h4>

                {/* Product */}
                <div className="flex justify-between mb-3">
                  <span className="text-primary/70">
                    Sản phẩm:
                  </span>

                  <span className="font-bold text-primary">
                    {selectedProduct?.Name}
                  </span>
                </div>

                {/* Flavor */}
                <div className="flex justify-between mb-3">
                  <span className="text-primary/70">
                    Hương vị:
                  </span>

                  <span className="font-bold text-primary">
                    {flavorNotes}
                  </span>
                </div>

                {/* Weight + Grind */}
                <div className="flex justify-between mb-3">
                  <span className="text-primary/70">
                    Thể thức:
                  </span>

                  <span className="font-bold text-primary">
                    {weights} - {grindType?.Name}
                  </span>
                </div>

                {/* Frequency */}
                <div className="flex justify-between">
                  <span className="text-primary/70">
                    Chu kỳ:
                  </span>

                  <span className="font-bold text-primary">

                    {
                      frequency === '1week'
                        ? 'Mỗi 1 tuần'
                        : frequency === '2weeks'
                          ? 'Mỗi 2 tuần'
                          : 'Mỗi 1 tháng'
                    }

                  </span>
                </div>

              </div>

              {/* Summary User */}
              {/* Summary Setup */}
              <div className="bg-pinky-gray p-6 rounded-2xl mb-8 font-nunito border border-gray-200">

                <h4 className="font-bold text-primary mb-4 border-b border-gray-300 pb-2">
                  Tóm tắt thông tin
                </h4>

                {/* Product */}
                <div className="flex justify-between mb-3">
                  <span className="text-primary/70">
                    Họ và tên:
                  </span>

                  <span className="font-bold text-primary">
                    {selectedProduct?.Name}
                  </span>
                </div>

                {/* Flavor */}
                <div className="flex justify-between mb-3">
                  <span className="text-primary/70">
                    Số điện thoại:
                  </span>

                  <span className="font-bold text-primary">
                    {flavorNotes}
                  </span>
                </div>

                <div className="flex justify-between mb-3">
                  <span className="text-primary/70">
                    Địa chỉ:
                  </span>

                  <span className="font-bold text-primary">
                    {flavorNotes}
                  </span>
                </div>

                {/* Weight + Grind */}
                <div className="flex justify-between mb-3">
                  <span className="text-primary/70">
                    Phương thức thanh toán:
                  </span>

                  <span className="font-bold text-primary">
                    {weights} - {grindType?.Name}
                  </span>
                </div>

                {/* Frequency */}
                <div className="flex justify-between">
                  <span className="text-primary/70">
                    Tổng tiền:
                  </span>

                  <span className="font-bold text-primary">

                    {
                      frequency === '1week'
                        ? 'Mỗi 1 tuần'
                        : frequency === '2weeks'
                          ? 'Mỗi 2 tuần'
                          : 'Mỗi 1 tháng'
                    }

                  </span>
                </div>

              </div>

              {/* Actions */}
              <div className="flex justify-between mt-12 items-center">

                <button
                  onClick={() => setStep(2)}
                  className="text-primary font-nunito font-bold hover:text-accent-1 px-4"
                >
                  Quay lại
                </button>

                <button
                  onClick={handleSubscribe}
                  className="
          bg-primary text-white
          font-nunito font-bold
          py-4 px-12 rounded-full
          hover:bg-accent-1
          transition-colors
          shadow-lg hover:shadow-xl
          hover:-translate-y-1
          uppercase
        "
                >
                  XÁC NHẬN ĐĂNG KÝ
                </button>

              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// Icon component mock if needed
function Check({ size }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
}
