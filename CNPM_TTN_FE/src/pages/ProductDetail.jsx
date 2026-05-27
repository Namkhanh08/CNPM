import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import API from '../services/api.js';

import { LuPercent } from "react-icons/lu";
import { BsFillTicketPerforatedFill } from "react-icons/bs";
import { MdOutlineLocalShipping } from "react-icons/md";
import { IoBagCheck } from "react-icons/io5";

// Giữ lại duy nhất 1 ảnh làm fallback dự phòng lỗi ảnh trên server
import defaultImage from '../assets/img/section2/image1.png';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addToCart = useStore((state) => state.addToCart);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  
  const [grindType, setGrindType] = useState(null);
  const [flavorNotes, setFlavorNotes] = useState('Original');
  const [weights, setWeight] = useState("250g");
  const [publicVouchers, setPublicVouchers] = useState([]);

  // Mảng tùy chọn dữ liệu động công khai
  const [flavorOptions, setFlavorOptions] = useState(["Original"]);
  const [weightOptions, setWeightOptions] = useState(["250g"]);
  const [grindOptions, setGrindOptions] = useState([]);

  const CategoryMap = {
    '1': 'Arabica',
    '2': 'Blend',
    '3': 'Robusta',
    '4': 'Fine Robusta',
  };

  // 1. Fetch Vouchers
  useEffect(() => {
    const fetchPublicVouchers = async () => {
      try {
        const res = await API.getPublicVouchers();
        setPublicVouchers(res.data || []);
      } catch (err) {
        console.error("Lỗi lấy voucher: ", err);
      }
    };
    fetchPublicVouchers();
  }, []);

  // 2. Fetch Chi tiết sản phẩm
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await API.getProductById(id);
        const p = res.data;
        
        if (!p) {
          setError('Không tìm thấy dữ liệu sản phẩm.');
          return;
        }

        // --- KHU VỰC SỬA ĐỔI CHÍNH: KHỚP VỚI ĐỐI TƯỢNG ProductUserResponse ---
        const apiDetails = p.details || p.Details || null;

        const formatted = {
          id: p.id ?? p.Id,
          name: p.name ?? p.Name ?? '',
          desc: p.description ?? p.Description ?? '',
          price: p.price ?? p.Price ?? 0,
          image: p.imageUrl ?? p.ImageUrl ?? '',
          type: String(p.categoryId ?? p.CategoryId ?? '1'),
          
          // Lấy dữ liệu an toàn từ object con details
          region: apiDetails?.region ?? apiDetails?.Region ?? 'Việt Nam',
          process: apiDetails?.process ?? apiDetails?.Process ?? 'Sơ chế tự nhiên',
          roast: apiDetails?.roast ?? apiDetails?.Roast ?? 'Medium Roast',
          flavorNotes: apiDetails?.flavorNotes ?? apiDetails?.FlavorNotes ?? 'Original',
          weight: apiDetails?.weight ?? apiDetails?.Weight ?? '250g',
          height: apiDetails?.height ?? apiDetails?.Height ?? 'Chưa cập nhật',
          grindingOptions: apiDetails?.grindingOptions ?? apiDetails?.GrindingOptions ?? []
        };

        setProduct(formatted);

        // Tách chuỗi bảo mật cao cho Hương Vị
        if (formatted.flavorNotes) {
          const flavors = String(formatted.flavorNotes).split(',').map(f => f.trim()).filter(Boolean);
          if (flavors.length > 0) {
            setFlavorOptions(flavors);
            setFlavorNotes(flavors[0]);
          }
        }
        
        // Tách chuỗi bảo mật cao cho Khối Lượng
        if (formatted.weight) {
          const wLists = String(formatted.weight).split(',').map(w => w.trim()).filter(Boolean);
          if (wLists.length > 0) {
            setWeightOptions(wLists);
            setWeight(wLists[0]);
          }
        }

        // Đổ mảng dữ liệu Kiểu Xay (Grinding Options) từ API vào State
        if (formatted.grindingOptions && formatted.grindingOptions.length > 0) {
          setGrindOptions(formatted.grindingOptions);
          setGrindType(formatted.grindingOptions[0]);
        } else {
          const fallbackGrind = { id: 0, name: 'Nguyên hạt' };
          setGrindOptions([fallbackGrind]);
          setGrindType(fallbackGrind);
        }

      } catch (err) {
        console.error("Lỗi lấy chi tiết sản phẩm: ", err);
        setError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const renderProductImage = (imgSrc) => {
    if (!imgSrc) return defaultImage;
    if (imgSrc.startsWith('http://') || imgSrc.startsWith('https://')) return imgSrc;
    return `http://localhost:5126${imgSrc}`;
  };

  const handleAddToCart = async () => {
    if (!grindType) {
      alert("Vui lòng chọn kiểu xay trước khi thêm vào giỏ hàng.");
      return;
    }
    try {
      // Sửa lại cách bóc tách ID: Thử kiểm tra cả trường hợp viết thường, viết hoa 
      // Nếu vẫn không có, lấy ID mặc định là 1 (hoặc id của phần tử đầu tiên) thay vì số 0
      const targetGrindId = grindType.id || grindType.Id || grindType.grindingOptionId || grindType.GrindingOptionId || 1;

      // Log ra console để bạn dễ dàng kiểm tra xem ID chạy đúng chưa trước khi gửi đi
      console.log("Gửi ID kiểu xay lên Store:", targetGrindId);

      await addToCart(product, quantity, targetGrindId, flavorNotes, weights);
      alert("Sản phẩm đã được thêm vào giỏ hàng!");
    } catch (err) {
      console.error("Lỗi thêm vào giỏ hàng: ", err);
      alert("Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.");
    }
  };
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><span className="text-primary font-nunito text-lg">Đang tải sản phẩm...</span></div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500 font-nunito">{error}</div>;
  }

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500 font-nunito">Sản phẩm không tồn tại.</div>;
  }

  return (
    <div className="bg-white min-h-screen py-16">
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
        <button onClick={() => navigate('/shop')} className="text-primary font-nunito font-bold mb-8 hover:text-accent-1 flex items-center gap-2">
          ← Quay lại cửa hàng
        </button>

        <div className="bg-white rounded-[40px] p-8 lg:p-12 shadow-2xl flex flex-col lg:flex-row gap-12">
          {/* Product Image Gallery */}
          <div className="w-full lg:w-1/2 flex items-center justify-center bg-pinky-gray rounded-3xl p-8 relative">
            <div className="absolute inset-0 bg-accent-1/5 opacity-50 rounded-3xl"></div>
            <img 
              src={renderProductImage(product.image)} 
              alt={product.name} 
              className="max-h-[500px] object-contain drop-shadow-2xl relative z-10 hover:scale-110 transition-all duration-300" 
              onError={(e) => { e.target.src = defaultImage; }}
            />
          </div>

          {/* Product Details Form */}
          <div className="w-full lg:w-1/2 flex flex-col">
            <h1 className="font-montserrat font-black text-4xl lg:text-5xl text-primary mb-2 text-center">{product.name}</h1>
            <p className="font-nunito text-primary/70 mb-6 text-lg text-center">{product.desc}</p>
            <div className="font-montserrat font-black text-3xl text-accent-1 mb-8 text-center">
              {product.price ? Number(product.price).toLocaleString('vi-VN') : '0'}đ
            </div>

            {/* Spec Table */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-8 font-nunito text-sm border-t border-b border-accent-1 py-6 text-center">
              <div><span className="text-primary/60 block mb-1">Giống cà phê</span><span className="font-bold text-primary">{CategoryMap[product.type] || product.type}</span></div>
              <div><span className="text-primary/60 block mb-1">Vùng trồng</span><span className="font-bold text-primary">{product.region}</span></div>
              <div><span className="text-primary/60 block mb-1">Phương pháp sơ chế</span><span className="font-bold text-primary">{product.process}</span></div>
              <div><span className="text-primary/60 block mb-1">Mức độ rang</span><span className="font-bold text-primary">{product.roast}</span></div>
              <div><span className="text-primary/60 block mb-1">Độ cao</span><span className="font-bold text-primary">{product.height}</span></div>
              <div><span className="text-primary/60 block mb-1">Trọng lượng</span><span className="font-bold text-primary">{product.weight}</span></div>
              <div className="col-span-2"><span className="text-primary/60 block mb-1">Hương vị (Flavor Notes)</span><span className="font-bold text-primary">{product.flavorNotes}</span></div>
            </div>

            {/* Flavor Notes Type Selection */}
            <div className="mb-8 border-b border-accent-1 pb-10">
              <h3 className="font-montserrat font-bold text-primary mb-4 uppercase text-center">Chọn hương vị</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {flavorOptions.map((flavor, index) => (
                  <button
                    key={index}
                    type="button"
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

            {/* Weight Type Selection */}
            <div className="mb-8">
              <h3 className="font-montserrat font-bold text-primary mb-4 uppercase text-center">Chọn khối lượng</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {weightOptions.map((weight, index) => (
                  <button
                    key={index}
                    type="button"
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

            {/* GrindType Selection */}
            <div className='mb-8 border-t border-accent-1 pt-6'>
              <h3 className='font-montserrat font-bold text-primary mb-4 uppercase text-center'>Chọn kiểu xay</h3>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
                {grindOptions.map((grind, idx) => {
                  const currentGrindId = grind.id ?? grind.Id ?? idx;
                  const selectedGrindId = grindType?.id ?? grindType?.Id;
                  return (
                    <button
                      key={currentGrindId}
                      type="button"
                      onClick={() => setGrindType(grind)}
                      className={`border-2 py-3 px-4 rounded-xl font-nunito font-semibold text-sm transition-all text-center ${
                        selectedGrindId === currentGrindId
                          ? 'border-primary bg-primary text-white shadow-md'
                          : 'border-gray-200 text-primary/70 hover:border-primary/50'
                      }`}
                    >
                      {grind.name || grind.Name || 'Nguyên hạt'}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Vouchers */}
            {publicVouchers.length > 0 && (
              <div className="mb-8 border-t border-accent-1 pt-4">
                <h3 className="font-montserrat font-bold text-primary mb-4 text-center uppercase flex justify-center items-center gap-2">
                  <LuPercent size={20}/> Ưu đãi hôm nay
                </h3>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {publicVouchers.map((voucher, index) => (
                    <div
                      key={voucher.id || index}
                      className="min-w-[180px] text-primary bg-accent-1/20 rounded-2xl p-2 shadow-lg shrink-0 text-center"
                    >
                      <div className="text-sm opacity-90 mt-1 flex gap-2 items-center justify-center">
                        {voucher.discountType === 'percent' && (
                          <>
                            <BsFillTicketPerforatedFill size={20}/> Giảm {voucher.discountPreview}% tối đa!
                          </>
                        )}
                        {voucher.discountType === 'fixed' && (
                          <>
                            <BsFillTicketPerforatedFill size={20}/>{voucher.title}
                          </>
                        )}
                        {voucher.discountType === 'shipping' && (
                          <>
                            <MdOutlineLocalShipping size={20}/> Miễn phí vận chuyển !!!
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              <div className="flex items-center border border-gray-200 rounded-full h-14 bg-white px-2 w-full sm:w-32 justify-between">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-primary/50 hover:bg-accent-1 hover:text-white font-bold text-xl"
                >-</button>
                <span className="font-montserrat font-bold text-lg w-8 text-center">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-primary/50 hover:bg-accent-1 hover:text-white font-bold text-xl"
                >+</button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 bg-primary text-white font-nunito font-bold text-lg h-14 rounded-full hover:bg-accent-1 shadow-lg hover:shadow-xl transform hover:-translate-y-1 uppercase tracking-wider hover:scale-105 transition-all duration-300"
              >
                Thêm vào giỏ hàng
              </button>
            </div>

            {/* Footer Links */}
            <div className="mt-6 text-center flex items-center justify-center">
              <button type="button" onClick={() => navigate('/subscription')} className="text-primary/80 font-nunito font-bold hover:underline flex items-center gap-2">
                <IoBagCheck size={20}/> Thanh toán khi giao hàng - Hoàn tiền tức thì
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}