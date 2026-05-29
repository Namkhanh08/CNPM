import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useStore from '../../store/useStore';
import { Coffee, CalendarSync, CreditCard, ChevronRight, X, Info } from 'lucide-react';
import API from '../../services/api';
import axios from 'axios';

const getValue = (obj, pascalKey, camelKey) => obj?.[pascalKey] ?? obj?.[camelKey];
const getProductId = (product) => getValue(product, 'Id', 'id');
const getProductName = (product) => getValue(product, 'Name', 'name');
const getProductPrice = (product) => Number(getValue(product, 'Price', 'price') ?? 0);
const getProductImage = (product) => getValue(product, 'ImageUrl', 'imageUrl');
const getProductCategoryId = (product) => getValue(product, 'CategoryId', 'categoryId');

export default function Subscription() {
  const navigate = useNavigate();
  const location = useLocation();
  const products = useStore((state) => state.products);
  const fetchProducts = useStore((state) => state.fetchProducts);
  const user = useStore((state) => state.user);
  
  const [productDetail, setProductDetail] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [step, setStep] = useState(1); // 1: Product, 2: Grind & Qty, 3: Frequency

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [grindType, setGrindType] = useState(null);
  const [weights, setWeight] = useState(""); // in grams
  const [frequency, setFrequency] = useState('2weeks'); // 1week, 2weeks, 1month
  const [flavorNotes, setFlavorNotes] = useState('Original');
  const [quantity, setQuantity] = useState(1);

  const getFrequencyDiscountRate = (freq) => {
    if (freq === '1week') return 0.10; // Giảm 10%
    if (freq === '2weeks') return 0.05; // Giảm 5%
    return 0;
  };

  const getPriceSummary = () => {
    const unitPrice = getProductPrice(selectedProduct);
    const originalPrice = unitPrice * quantity;
    const discountRate = getFrequencyDiscountRate(frequency);
    const discountAmount = Math.round(originalPrice * discountRate);
    
    const memberTier = user?.memberTier ?? user?.MemberTier ?? user?.Tier ?? "";
    const isDiamond = "Diamond".toLowerCase() === memberTier.toLowerCase();
    const tierDiscountAmount = isDiamond ? Math.round((originalPrice - discountAmount) * 0.10) : 0;
    
    const finalPrice = originalPrice - discountAmount - tierDiscountAmount;
    return {
      originalPrice,
      discountRate,
      discountAmount,
      tierDiscountAmount,
      finalPrice
    };
  };

  // Shipping Form States
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [loading, setLoading] = useState(false);

  // VNPay Modal States
  const [showVNPayModal, setShowVNPayModal] = useState(false);
  const [createdSubscription, setCreatedSubscription] = useState(null);
  const [countdown, setCountdown] = useState(300);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (user) {
      setReceiverName(user.fullName || user.FullName || user.Name || '');
      setReceiverPhone(user.phoneNumber || user.PhoneNumber || '');
    }
  }, [user]);

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

  const handleProvinceChange = async (e) => {
    const provinceName = e.target.value;
    const province = provinces.find(p => p.name === provinceName);
    setSelectedProvince(provinceName);
    setSelectedDistrict('');
    setSelectedWard('');
    setDistricts([]);
    setWards([]);

    if (province) {
      try {
        const res = await axios.get(`https://provinces.open-api.vn/api/p/${province.code}?depth=2`);
        setDistricts(res.data.districts);
      } catch (err) {
        console.error("Lỗi lấy danh sách quận huyện", err);
      }
    }
  };

  const handleDistrictChange = async (e) => {
    const districtName = e.target.value;
    const district = districts.find(d => d.name === districtName);
    setSelectedDistrict(districtName);
    setSelectedWard('');
    setWards([]);

    if (district) {
      try {
        const res = await axios.get(`https://provinces.open-api.vn/api/d/${district.code}?depth=2`);
        setWards(res.data.wards);
      } catch (err) {
        console.error("Lỗi lấy danh sách xã phường", err);
      }
    }
  };

  const mapFrequency = (freq) => {
    if (freq === '1week') return 'weekly';
    if (freq === '2weeks') return 'biweekly';
    return 'monthly';
  };

  const handleSubscribeSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!user) {
      alert("Vui lòng đăng nhập để sử dụng dịch vụ đăng ký cà phê định kỳ.");
      navigate('/login');
      return;
    }

    if (!receiverName || !receiverPhone || !selectedProvince || !selectedDistrict || !selectedWard || !detailAddress) {
      alert("Vui lòng điền đầy đủ thông tin giao hàng.");
      return;
    }

    const payload = {
      ProductId: getProductId(selectedProduct),
      GrindingOptionId: getValue(grindType, 'Id', 'id') || 1,
      FlavorNotes: flavorNotes || "Original",
      Weight: weights || "250g",
      Quantity: quantity,
      Frequency: mapFrequency(frequency),
      StartDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      ReceiverName: receiverName,
      ReceiverPhone: receiverPhone,
      ShippingProvince: selectedProvince,
      ShippingDistrict: selectedDistrict,
      ShippingWard: selectedWard,
      ShippingDetailAddress: detailAddress,
      PaymentMethod: paymentMethod.toUpperCase(),
    };

    setLoading(true);
    try {
      if (paymentMethod === 'vnpay') {
        setCreatedSubscription(payload);
        setShowVNPayModal(true);
        setCountdown(300);
      } else {
        await API.createSubscription(payload);
        alert("Đăng ký gói giao cà phê định kỳ thành công!");
        navigate('/profile', { state: { activeTab: 'subscriptions' } });
      }
    } catch (err) {
      alert(err.response?.data?.Message || err.response?.data?.message || "Lỗi khi đăng ký gói.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmVNPayPayment = async () => {
    if (!createdSubscription) return;
    setLoading(true);
    try {
      await API.createSubscription(createdSubscription);
      setShowVNPayModal(false);
      alert("Thanh toán thành công! Gói giao cà phê định kỳ đã được kích hoạt.");
      navigate('/profile', { state: { activeTab: 'subscriptions' } });
    } catch (err) {
      alert(err.response?.data?.Message || err.response?.data?.message || "Lỗi khi kích hoạt gói sau thanh toán.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!showVNPayModal) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowVNPayModal(false);
          alert("Giao dịch thanh toán VNPAY đã hết hạn.");
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
  const handleSelectProduct = useCallback(async (product) => {

    setSelectedProduct(product);

    try {

      const res = await API.getProductById(getProductId(product));

      const detail = res.data;

      console.log("DETAIL:", detail);

      setProductDetail(detail);

      // Flavor options
      const flavors = (detail.FlavorNotes ?? detail.flavorNotes)
        ? (detail.FlavorNotes ?? detail.flavorNotes).split(',').map(f => f.trim())
        : [];

      // Weight options
      const weightList = (detail.WeightOptions ?? detail.weightOptions)
        ? (detail.WeightOptions ?? detail.weightOptions).split(',').map(w => w.trim())
        : [];

      // Default selected values
      setFlavorNotes(flavors[0] || "");
      setWeight(weightList[0] || "");
      setGrindType(detail.GrindingOption?.[0] || detail.grindingOption?.[0] || null);

    } catch (err) {

      console.error(err);

    }

  }, []);
  useEffect(() => {
    if (products.length > 0) {
      const stateProductId = location.state?.productId;
      if (stateProductId) {
        const found = products.find(p => getProductId(p) === stateProductId || String(p.id) === String(stateProductId) || String(p.ProductId) === String(stateProductId));
        if (found) {
          handleSelectProduct(found);
          return;
        }
      }
      if (!selectedProduct) {
        handleSelectProduct(products[0]);
      }
    }
  }, [handleSelectProduct, products, selectedProduct, location.state]);
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
  const flavorOptions = (productDetail?.FlavorNotes ?? productDetail?.flavorNotes)
    ? (productDetail.FlavorNotes ?? productDetail.flavorNotes).split(',').map(f => f.trim())
    : [];

  const weightOptions = (productDetail?.WeightOptions ?? productDetail?.weightOptions)
    ? (productDetail.WeightOptions ?? productDetail.weightOptions).split(',').map(w => w.trim())
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
                    key={getProductId(p)}
                    onClick={() => handleSelectProduct(p)}
                    className={`border-2 rounded-3xl p-6 cursor-pointer hover:shadow-lg transition-all flex flex-col items-center group relative overflow-hidden hover:-translate-y-1 transition-all duration-300 hover:scale-110 ${getProductId(selectedProduct) === getProductId(p) ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-primary/30'}`}
                  >
                    {getProductId(selectedProduct) === getProductId(p) && <div className="absolute top-4 right-4 bg-primary text-white rounded-full p-1"><Check size={16} /></div>}
                    <div className="h-32 mb-4">
                      <img src={getProductImage(p)} alt={getProductName(p)} className={`h-full object-contain filter drop-shadow-md transition-transform duration-500 ${getProductId(selectedProduct) === getProductId(p) ? 'scale-110' : 'group-hover:scale-105'}`} />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center ">

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/product/${getProductId(p)}`);
                          }}
                          className="bg-white text-primary px-6 py-3 rounded-full font-bold hover:bg-primary hover:text-white transition-all"
                        >
                          Xem chi tiết
                        </button>

                      </div>
                    </div>
                    <h3 className="font-montserrat font-bold text-lg text-accent-1 text-center line-clamp-2">{CategoryMap[getProductCategoryId(p)] || getProductCategoryId(p)}</h3>
                    <h3 className="font-montserrat font-bold text-lg text-primary text-center line-clamp-2">{getProductName(p)}</h3>
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
                      key={getValue(grind, 'Id', 'id')}
                      onClick={() => setGrindType(grind)}
                      className={`border-2 py-3 px-4 rounded-xl font-nunito font-semibold text-sm transition-all text-center ${getValue(grindType, 'Id', 'id') === getValue(grind, 'Id', 'id')
                        ? 'border-primary bg-primary text-white shadow-md'
                        : 'border-gray-200 text-primary/70 hover:border-primary/50'
                        }`}
                    >
                      {getValue(grind, 'Name', 'name')}
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
            <div className="animate-fade-in max-w-3xl mx-auto space-y-10">

              <div>
                <h2 className="font-montserrat font-black text-2xl text-[#5C3D2E] mb-6 text-center flex items-center justify-center gap-2">
                  <CalendarSync className="text-[#7F5539]" />
                  Bạn muốn nhận cà phê bao lâu một lần?
                </h2>

                {/* Frequency Options */}
                <div className="flex flex-col gap-4">
                  {[
                    {
                      id: '1week',
                      title: '1 TUẦN / LẦN',
                      desc: 'Lựa chọn phổ biến nhất. Đảm bảo cà phê luôn tươi mới nhất.',
                      discount: 'Tích lũy x1.5 điểm Loyalty'
                    },
                    {
                      id: '2weeks',
                      title: '2 TUẦN / LẦN',
                      desc: 'Phù hợp cho người uống 1-2 ly mỗi ngày.',
                      discount: 'Tích lũy x1.2 điểm Loyalty'
                    },
                    {
                      id: '1month',
                      title: '1 THÁNG / LẦN',
                      desc: 'Cung cấp đủ cho cả tháng của bạn.',
                      discount: 'Gói cơ bản'
                    }
                  ].map((f) => (
                    <div
                      key={f.id}
                      onClick={() => setFrequency(f.id)}
                      className={`
                        flex items-center justify-between
                        p-6 border-2 rounded-2xl cursor-pointer
                        transition-all duration-300
                        ${frequency === f.id
                          ? 'border-[#7F5539] bg-[#7F5539]/5 shadow-sm'
                          : 'border-gray-100 hover:border-[#7F5539]/30 hover:bg-gray-50'
                        }
                      `}
                    >
                      <div>
                        <h4 className="font-montserrat font-bold text-lg text-[#5C3D2E] flex items-center gap-4">
                          {f.title}
                          <span className="bg-[#7F5539] text-white text-[10px] px-2.5 py-1 rounded-full whitespace-nowrap uppercase tracking-wider font-bold">
                            {f.discount}
                          </span>
                        </h4>
                        <p className="font-nunito text-gray-500 text-sm mt-1">
                          {f.desc}
                        </p>
                      </div>

                      <div
                        className={`
                          w-6 h-6 rounded-full flex items-center justify-center border-2
                          ${frequency === f.id ? 'border-[#7F5539]' : 'border-gray-300'}
                        `}
                      >
                        {frequency === f.id && (
                          <div className="w-3 h-3 bg-[#7F5539] rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address Form */}
              <div className="border-t border-[#F2ECE4] pt-8">
                <h3 className="font-montserrat font-black text-xl text-[#5C3D2E] mb-6 flex items-center gap-2">
                  <span className="w-2.5 h-6 bg-[#7F5539] rounded-full"></span> Thông tin giao hàng
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Receiver Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#7F5539] uppercase tracking-wider">Họ và tên người nhận</label>
                    <input
                      type="text"
                      required
                      placeholder="Nhập họ và tên"
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7F5539] font-medium text-gray-800"
                    />
                  </div>

                  {/* Receiver Phone */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#7F5539] uppercase tracking-wider">Số điện thoại người nhận</label>
                    <input
                      type="tel"
                      required
                      placeholder="Nhập số điện thoại"
                      value={receiverPhone}
                      onChange={(e) => setReceiverPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7F5539] font-medium text-gray-800"
                    />
                  </div>

                  {/* Province Selection */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#7F5539] uppercase tracking-wider">Tỉnh / Thành phố</label>
                    <select
                      required
                      value={selectedProvince}
                      onChange={handleProvinceChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7F5539] font-medium text-gray-800"
                    >
                      <option value="">-- Chọn Tỉnh/Thành phố --</option>
                      {provinces.map((prov) => (
                        <option key={prov.code} value={prov.name}>{prov.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* District Selection */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#7F5539] uppercase tracking-wider">Quận / Huyện</label>
                    <select
                      required
                      disabled={!selectedProvince}
                      value={selectedDistrict}
                      onChange={handleDistrictChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7F5539] font-medium text-gray-800 disabled:bg-gray-50"
                    >
                      <option value="">-- Chọn Quận/Huyện --</option>
                      {districts.map((dist) => (
                        <option key={dist.code} value={dist.name}>{dist.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Ward Selection */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#7F5539] uppercase tracking-wider">Phường / Xã</label>
                    <select
                      required
                      disabled={!selectedDistrict}
                      value={selectedWard}
                      onChange={(e) => setSelectedWard(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7F5539] font-medium text-gray-800 disabled:bg-gray-50"
                    >
                      <option value="">-- Chọn Phường/Xã --</option>
                      {wards.map((ward) => (
                        <option key={ward.code} value={ward.name}>{ward.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Detail Address */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="block text-xs font-bold text-[#7F5539] uppercase tracking-wider">Địa chỉ chi tiết (Số nhà, tên đường...)</label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: 123 Đường Nguyễn Huệ"
                      value={detailAddress}
                      onChange={(e) => setDetailAddress(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7F5539] font-medium text-gray-800"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Selection */}
              <div className="border-t border-[#F2ECE4] pt-8">
                <h3 className="font-montserrat font-black text-xl text-[#5C3D2E] mb-6 flex items-center gap-2">
                  <span className="w-2.5 h-6 bg-[#7F5539] rounded-full"></span> Phương thức thanh toán mỗi đợt
                </h3>

                <div className="space-y-4">
                  <label className={`flex items-start gap-4 p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${paymentMethod === 'cod' ? 'border-[#7F5539] bg-[#7F5539]/5 shadow-sm' : 'border-gray-100 hover:bg-gray-50'}`}>
                    <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'cod' ? 'border-[#7F5539]' : 'border-gray-300'}`}>
                      {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 bg-[#7F5539] rounded-full"></div>}
                    </div>
                    <input type="radio" name="payment" value="cod" className="hidden" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                    <div>
                      <h3 className="font-montserrat font-bold text-[#5C3D2E] mb-1">Thanh toán khi nhận hàng (COD)</h3>
                      <p className="font-nunito text-gray-500 text-sm">Trả bằng tiền mặt hoặc chuyển khoản QR Code cho Shipper khi giao cà phê đến tay bạn.</p>
                    </div>
                  </label>

                  <label className={`flex items-start gap-4 p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${paymentMethod === 'vnpay' ? 'border-[#7F5539] bg-[#7F5539]/5 shadow-sm' : 'border-gray-100 hover:bg-gray-50'}`}>
                    <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'vnpay' ? 'border-[#7F5539]' : 'border-gray-300'}`}>
                      {paymentMethod === 'vnpay' && <div className="w-2.5 h-2.5 bg-[#7F5539] rounded-full"></div>}
                    </div>
                    <input type="radio" name="payment" value="vnpay" className="hidden" checked={paymentMethod === 'vnpay'} onChange={() => setPaymentMethod('vnpay')} />
                    <div>
                      <h3 className="font-montserrat font-bold text-[#5C3D2E] mb-1">Chuyển khoản trực tuyến qua VNPAY (Giả lập)</h3>
                      <p className="font-nunito text-gray-500 text-sm">Thanh toán qua ví điện tử VNPay hoặc quét mã ngân hàng chuẩn bảo mật của Revo Coffee.</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Summary Setup */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[#F2ECE4]">
                <div className="bg-[#FAF7F2] p-6 rounded-3xl border border-[#F2ECE4] space-y-4">
                  <h4 className="font-montserrat font-bold text-[#5C3D2E] border-b border-[#F2ECE4] pb-2 uppercase tracking-wider text-xs">
                    Tóm tắt Gói Đăng Ký
                  </h4>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Sản phẩm:</span>
                    <span className="font-bold text-[#5C3D2E]">{getProductName(selectedProduct)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Hương vị:</span>
                    <span className="font-bold text-[#5C3D2E]">{flavorNotes}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Thể thức:</span>
                    <span className="font-bold text-[#5C3D2E]">{weights} - {getValue(grindType, 'Name', 'name') || "Nguyên hạt"}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Số lượng mỗi đợt:</span>
                    <span className="font-bold text-[#5C3D2E]">{quantity} túi</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Chu kỳ giao:</span>
                    <span className="font-bold text-[#5C3D2E]">
                      {frequency === '1week' ? 'Mỗi 1 tuần' : frequency === '2weeks' ? 'Mỗi 2 tuần' : 'Mỗi 1 tháng'}
                    </span>
                  </div>
                </div>

                <div className="bg-[#FAF7F2] p-6 rounded-3xl border border-[#F2ECE4] space-y-4">
                  <h4 className="font-montserrat font-bold text-[#5C3D2E] border-b border-[#F2ECE4] pb-2 uppercase tracking-wider text-xs">
                    Thông tin giao nhận
                  </h4>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Người nhận:</span>
                    <span className="font-bold text-[#5C3D2E]">{receiverName || "Chưa nhập"}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">SĐT nhận hàng:</span>
                    <span className="font-bold text-[#5C3D2E]">{receiverPhone || "Chưa nhập"}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Hình thức:</span>
                    <span className="font-bold text-[#5C3D2E]">{paymentMethod === 'cod' ? 'Thanh toán COD' : 'Ví VNPAY'}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Đơn giá mỗi kỳ:</span>
                    <span className="font-bold text-[#5C3D2E]">{getProductPrice(selectedProduct).toLocaleString('vi-VN')}đ</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tạm tính mỗi kỳ:</span>
                    <span className="font-bold text-[#5C3D2E]">{getPriceSummary().originalPrice.toLocaleString('vi-VN')}đ</span>
                  </div>

                  {getPriceSummary().discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Ưu đãi chu kỳ ({getPriceSummary().discountRate * 100}%):</span>
                      <span className="font-bold">-{getPriceSummary().discountAmount.toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}

                  {getPriceSummary().tierDiscountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Ưu đãi Diamond (10%):</span>
                      <span className="font-bold">-{getPriceSummary().tierDiscountAmount.toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center border-t border-[#F2ECE4] pt-2 text-[#5C3D2E]">
                    <span className="font-bold text-sm">Tổng cộng mỗi kỳ:</span>
                    <span className="font-black text-xl text-[#7F5539]">
                      {getPriceSummary().finalPrice.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-6 border-t border-[#F2ECE4]">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-[#7F5539] font-nunito font-bold hover:text-[#5C3D2E] px-4 transition-colors"
                >
                  Quay lại
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSubscribeSubmit}
                  className="
                    bg-[#7F5539] text-white
                    font-nunito font-bold
                    py-4 px-12 rounded-full
                    hover:bg-[#5C3D2E]
                    transition-all duration-300
                    shadow-lg hover:shadow-xl
                    hover:-translate-y-0.5
                    uppercase tracking-wider text-sm
                    disabled:opacity-50
                  "
                >
                  {loading ? "Đang xử lý..." : "XÁC NHẬN ĐĂNG KÝ"}
                </button>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* MODAL GIẢ LẬP VNPAY */}
      {showVNPayModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 flex flex-col transform transition-all scale-100">
            {/* Header VNPay Mockup */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 text-white text-center relative">
              <h2 className="font-montserrat font-black text-2xl tracking-wider">VNPAY GATEWAY</h2>
              <p className="text-white/80 font-nunito text-sm mt-1">Cổng thanh toán đăng ký định kỳ Revo Coffee</p>
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
                  Số tiền thanh toán mỗi kỳ
                </span>
                <span className="font-montserrat font-black text-3xl text-blue-900">
                  {getPriceSummary().finalPrice.toLocaleString('vi-VN')}đ
                </span>
                <span className="text-primary/60 font-nunito text-xs mt-2 font-semibold">
                  Đăng ký: {getProductName(selectedProduct)} ({quantity} túi)
                </span>
              </div>

              {/* QR Code section */}
              <div className="flex flex-col items-center justify-center">
                <div className="bg-white p-4 rounded-3xl shadow-md border border-gray-100 relative">
                  <div className="w-48 h-48 bg-gray-50 flex items-center justify-center rounded-2xl border-2 border-dashed border-gray-200">
                    <svg viewBox="0 0 100 100" className="w-40 h-40 text-blue-900">
                      <rect width="100" height="100" fill="none" />
                      <rect x="5" y="5" width="20" height="20" fill="currentColor" />
                      <rect x="8" y="8" width="14" height="14" fill="white" />
                      <rect x="11" y="11" width="8" height="8" fill="currentColor" />
                      
                      <rect x="75" y="5" width="20" height="20" fill="currentColor" />
                      <rect x="78" y="8" width="14" height="14" fill="white" />
                      <rect x="81" y="11" width="8" height="8" fill="currentColor" />

                      <rect x="5" y="75" width="20" height="20" fill="currentColor" />
                      <rect x="8" y="78" width="14" height="14" fill="white" />
                      <rect x="11" y="81" width="8" height="8" fill="currentColor" />

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
                  Quét mã QR để thanh toán đăng ký Revo Coffee
                </div>
              </div>

              {/* Instructions and Bank Details */}
              <div className="bg-gray-50 rounded-2xl p-4 text-left text-sm font-nunito space-y-2 border border-gray-100">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">Tên tài khoản:</span>
                  <span className="font-bold text-primary">CÔNG TY CỔ PHẦN CÀ PHÊ REVO</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">Ngân hàng:</span>
                  <span className="font-bold text-primary">NCB Bank (Giả lập)</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500">Số tài khoản:</span>
                  <span className="font-bold text-primary">9704198526137596</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Nội dung chuyển khoản:</span>
                  <span className="font-bold text-red-500">REVO_SUB_PAYMENT</span>
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
                onClick={handleConfirmVNPayPayment}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-nunito font-bold py-3.5 rounded-full text-base transition-colors shadow-lg active:scale-95"
              >
                XÁC NHẬN ĐÃ THANH TOÁN (Giả lập)
              </button>
              <button
                onClick={() => {
                  setShowVNPayModal(false);
                  alert('Giao dịch đã bị hủy.');
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

// Icon component mock if needed
function Check({ size }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
}
