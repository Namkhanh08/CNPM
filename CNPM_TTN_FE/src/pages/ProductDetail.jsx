import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import API from '../services/api.js';

import image1 from '../assets/img/section2/image1.png';
import image2 from '../assets/img/section2/image2.png';
import image3 from '../assets/img/section2/image3.png';
import image4 from '../assets/img/section2/image4.png';
import image5 from '../assets/img/section2/image5.png';
import { LuPercent } from "react-icons/lu";
import { BsFillTicketPerforatedFill, BsStarFill, BsStarHalf } from "react-icons/bs";
import { MdOutlineLocalShipping } from "react-icons/md";
import { IoBagCheck } from "react-icons/io5";
import { FiShoppingCart } from "react-icons/fi";

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

  useEffect(() => {
    const fetchPublicVouchers = async () => {
      try {
        const res = await API.getPublicVouchers();
        setPublicVouchers(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPublicVouchers();
  }, []);
  
  const [activeImage, setActiveImage] = useState(null);

  const ImageMap = {
    '/assets/img/section2/image1.png': image1,
    '/assets/img/section2/image2.png': image2,
    '/assets/img/section2/image3.png': image3,
    '/assets/img/section2/image4.png': image4,
    '/assets/img/section2/image5.png': image5,
  }

  const CategoryMap = {
    '1': 'Arabica',
    '2': 'Blend',
    '3': 'Robusta',
    '4': 'Fine Robusta',
  }

  const flavorOptions = product?.flavorNotes ? product.flavorNotes.split(',').map(f => f.trim()) : ["Whole-bean"];
  const weightOptions = product?.weight ? product.weight.split(',').map(f => f.trim()) : ["250g"];
  const grindOptions = product?.grindingOptions || [];

  useEffect(() => {
    if (flavorOptions.length > 0) setFlavorNotes(flavorOptions[0]);
  }, [product]);

  useEffect(() => {
    if (weightOptions.length > 0) setWeight(weightOptions[0]);
  }, [product]);

  useEffect(() => {
    if (grindOptions.length > 0) setGrindType(grindOptions[0]);
  }, [product]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.getProductById(id);
        const p = res.data;
        const formatted = {
          id: p.id,
          name: p.product?.name,
          desc: p.product?.description,
          price: p.product?.price,
          image: p.product?.imageUrl,
          region: p.region,
          process: p.process,
          roast: p.roast,
          flavorNotes: p.flavorNotes,
          type: p.product?.categoryId,
          grindingOptions: p.grindingOptions || [],
          weight: p.weight,
          height: p.height
        };
        setProduct(formatted);
        setActiveImage(ImageMap[formatted.image] || formatted.image);
      } catch (err) {
        console.error("Lỗi lấy sản phẩm: ", err);
        setError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async (isBuyNow = false) => {
    if (!grindType) {
      alert("Vui lòng chọn kiểu xay trước khi mua hàng.");
      return;
    }
    try {
      await addToCart(product, quantity, grindType.id, flavorNotes, weights);
      if (isBuyNow) {
        navigate('/cart');
      } else {
        alert("Sản phẩm đã được thêm vào giỏ hàng!");
      }
    } catch (err) {
      console.error("Lỗi xử lý giỏ hàng: ", err);
      alert("Không thể thực hiện hành động. Vui lòng thử lại.");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-nunito">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent-1 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <span className="text-primary text-lg font-bold animate-pulse">Đang rang xay sản phẩm...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-nunito">
        <div className="bg-white p-6 rounded-xl shadow-sm text-center max-w-md border border-gray-100">
          <p className="text-red-500 font-bold text-lg mb-2">Đã xảy ra lỗi</p>
          <p className="text-primary/60 text-sm mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold transition-all hover:bg-primary/90">Thử lại</button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 font-nunito bg-gray-50">
        Sản phẩm không tồn tại hoặc đã ngừng kinh doanh.
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 min-h-screen py-10 antialiased selection:bg-accent-1/20 font-nunito">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Breadcrumb điều hướng */}
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-primary/50 mb-6 select-none uppercase">
          <span className="hover:text-accent-1 cursor-pointer transition-colors" onClick={() => navigate('/')}>REVO Coffee</span>
          <span className="text-primary/30">/</span>
          <span className="hover:text-accent-1 cursor-pointer transition-colors" onClick={() => navigate('/shop')}>Cửa hàng</span>
          <span className="text-primary/30">/</span>
          <span className="text-primary/80 truncate max-w-[180px]">{product.name}</span>
        </div>

        {/* Khối nội dung chính (Giao diện mua hàng) */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 lg:p-10 flex flex-col lg:flex-row gap-12">
          
          {/* CỘT TRÁI: Gallery hình ảnh */}
          <div className="w-full lg:w-[42%] flex flex-col gap-4">
            {/* Khung ảnh chính lớn */}
            <div className="w-full aspect-square bg-neutral-50 rounded-xl p-8 flex items-center justify-center border border-gray-100/80 overflow-hidden relative group">
              <img 
                src={activeImage} 
                alt={product.name} 
                className="max-h-full max-w-full object-contain transition-all duration-500 group-hover:scale-105" 
              />
            </div>
            
            {/* Danh sách ảnh nhỏ phía dưới */}
            <div className="flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin snap-x">
              {Object.values(ImageMap).map((imgUrl, index) => (
                <button
                  key={index}
                  onMouseEnter={() => setActiveImage(imgUrl)}
                  onClick={() => setActiveImage(imgUrl)}
                  className={`w-16 h-16 border-2 rounded-lg p-1.5 bg-neutral-50 shrink-0 flex items-center justify-center transition-all duration-200 snap-start ${
                    activeImage === imgUrl 
                      ? 'border-accent-1 bg-white shadow-sm ring-2 ring-accent-1/10' 
                      : 'border-transparent hover:border-primary/20 hover:bg-white'
                  }`}
                >
                  <img src={imgUrl} alt={`sub-${index}`} className="max-h-full object-contain rounded" />
                </button>
              ))}
            </div>
          </div>

          {/* CỘT PHẢI: Thông tin biến thể & Hành động */}
          <div className="w-full lg:w-[58%] flex flex-col text-left justify-between">
            <div>
              {/* Tag thương hiệu nhỏ */}
              <div className="mb-2">
                <span className="text-[10px] font-bold tracking-widest text-accent-1 uppercase bg-accent-1/5 px-2.5 py-1 rounded-full">Premium Coffee</span>
              </div>
              
              {/* Tiêu đề sản phẩm */}
              <h1 className="font-extrabold text-2xl lg:text-3xl text-primary leading-tight mb-4 tracking-tight">
                {product.name}
              </h1>

              {/* Banner hiển thị giá độc quyền */}
              <div className="bg-gradient-to-r from-neutral-50 to-neutral-50/30 rounded-xl p-5 border border-neutral-100 mb-6 flex items-baseline gap-4">
                <span className="font-black text-3xl lg:text-4xl text-accent-1 tracking-tight">
                  {product.price?.toLocaleString('vi-VN')}đ
                </span>
                <span className="text-sm text-primary/30 line-through">{(product.price * 1.2).toLocaleString('vi-VN')}đ</span>
                <span className="bg-red-50 text-red-500 text-xs px-2 py-0.5 rounded-md font-bold border border-red-100">-20%</span>
              </div>

              {/* Khối Voucher giảm giá */}
              {publicVouchers.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm py-2 mb-4 border-b border-gray-50 pb-4">
                  <span className="w-28 text-primary/40 font-bold uppercase tracking-wider text-xs shrink-0">Ưu đãi độc quyền</span>
                  <div className="flex flex-wrap gap-2">
                    {publicVouchers.map((voucher) => (
                      <div 
                        key={voucher.id} 
                        className="inline-flex items-center gap-1.5 bg-accent-1/[0.03] border border-dashed border-accent-1/60 text-accent-1 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors hover:bg-accent-1/[0.06]"
                      >
                        <BsFillTicketPerforatedFill size={13} className="opacity-80"/>
                        {voucher.discountType === 'percent' && `Giảm ${voucher.discountPreview}%`}
                        {voucher.discountType === 'fixed' && `${voucher.title}`}
                        {voucher.discountType === 'shipping' && `Freeship`}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* KHU VỰC CHỌN BIẾN THỂ PHÂN LOẠI */}
              <div className="flex flex-col gap-5 py-4 mb-8 text-sm">
                
                {/* Hương vị */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <span className="w-28 text-primary/50 font-bold shrink-0">Hương vị</span>
                  <div className="flex flex-wrap gap-2">
                    {flavorOptions.map((flavor, index) => (
                      <button
                        key={index}
                        onClick={() => setFlavorNotes(flavor)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wide border transition-all duration-200 ${
                          flavorNotes === flavor
                            ? 'border-primary text-white bg-primary shadow-sm'
                            : 'border-gray-200 text-primary/70 bg-white hover:border-primary/40 hover:text-primary'
                        }`}
                      >
                        {flavor}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Khối lượng */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <span className="w-28 text-primary/50 font-bold shrink-0">Khối lượng</span>
                  <div className="flex flex-wrap gap-2">
                    {weightOptions.map((weight, index) => (
                      <button
                        key={index}
                        onClick={() => setWeight(weight)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wide border transition-all duration-200 ${
                          weights === weight
                            ? 'border-primary text-white bg-primary shadow-sm'
                            : 'border-gray-200 text-primary/70 bg-white hover:border-primary/40 hover:text-primary'
                        }`}
                      >
                        {weight}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Kiểu xay */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <span className="w-28 text-primary/50 font-bold shrink-0">Kiểu xay</span>
                  <div className="flex flex-wrap gap-2">
                    {grindOptions.map((grind) => (
                      <button
                        key={grind.id}
                        onClick={() => setGrindType(grind)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wide border transition-all duration-200 ${
                          grindType?.id === grind.id
                            ? 'border-primary text-white bg-primary shadow-sm'
                            : 'border-gray-200 text-primary/70 bg-white hover:border-primary/40 hover:text-primary'
                        }`}
                      >
                        {grind.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tăng giảm số lượng */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
                  <span className="w-28 text-primary/50 font-bold shrink-0">Số lượng</span>
                  <div className="flex items-center">
                    <div className="flex items-center border border-gray-200 rounded-lg bg-neutral-50/50 h-9 p-0.5 overflow-hidden">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-full flex items-center justify-center text-primary/60 hover:bg-white hover:shadow-xs rounded font-extrabold text-base transition-all"
                      >-</button>
                      <span className="font-extrabold text-sm w-10 text-center text-primary">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-8 h-full flex items-center justify-center text-primary/60 hover:bg-white hover:shadow-xs rounded font-extrabold text-base transition-all"
                      >+</button>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* CẶP NÚT CTA HÀNH ĐỘNG */}
            <div>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                {/* Thêm Vào Giỏ Hàng */}
                <button
                  onClick={() => handleAddToCart(false)}
                  className="flex items-center justify-center gap-2.5 px-6 h-13 rounded-xl border-2 border-primary text-primary bg-transparent font-bold text-sm hover:bg-primary hover:text-white transform active:scale-95 transition-all duration-200 sm:flex-1"
                >
                  <FiShoppingCart size={18} />
                  Thêm Vào Giỏ Hàng
                </button>

                {/* Mua Ngay */}
                <button
                  onClick={() => handleAddToCart(true)}
                  className="flex items-center justify-center px-8 h-13 rounded-xl bg-accent-1 text-white font-bold text-sm hover:bg-accent-1/90 shadow-md shadow-accent-1/10 transform active:scale-95 transition-all duration-200 sm:w-56"
                >
                  Mua Ngay
                </button>
              </div>

              {/* Chân cam kết thương hiệu dạng tối giản */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-5 border-t border-gray-100 text-[11px] font-bold text-primary/40 uppercase tracking-wider">
                <div className="flex items-center gap-2"><span className="text-accent-1 text-sm">✓</span> 7 Ngày Miễn Phí Trả Hàng</div>
                <div className="flex items-center gap-2"><span className="text-accent-1 text-sm">✓</span> Hàng Chính Hãng 100%</div>
                <div className="flex items-center gap-2"><span className="text-accent-1 text-sm">✓</span> Giao Toàn Quốc Miễn Phí</div>
                <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/subscription')}>
                  <span className="text-accent-1 text-sm group-hover:scale-110 transition-transform">✓</span> 
                  <span className="group-hover:text-accent-1 transition-colors">Đăng ký định kỳ tiết kiệm 15%</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* THÔNG TIN CHI TIẾT VÀ MÔ TẢ PHÍA DƯỚI */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 lg:p-10 mt-8 text-left">
          
          {/* Section Chi tiết */}
          <h2 className="font-extrabold text-base text-primary uppercase tracking-wider mb-6 flex items-center gap-2">
            <span className="w-1 h-5 bg-primary rounded-full"></span> Chi tiết sản phẩm
          </h2>
          
          <div className="max-w-4xl divide-y divide-gray-100 border-b border-gray-100 mb-10">
            <div className="flex py-3.5 items-center text-sm">
              <span className="w-52 text-primary/40 font-bold">Danh Mục</span>
              <span className="text-accent-1 font-extrabold hover:underline cursor-pointer transition-all">
                Cà phê &gt; {CategoryMap[product.type] || product.type}
              </span>
            </div>
            
            <div className="flex py-3.5 items-center text-sm">
              <span className="w-52 text-primary/40 font-bold">Vùng trồng (Region)</span>
              <span className="text-primary font-bold">{product.region || "Đang cập nhật"}</span>
            </div>
            
            <div className="flex py-3.5 items-center text-sm">
              <span className="w-52 text-primary/40 font-bold">Phương pháp sơ chế</span>
              <span className="text-primary/80 font-medium">{product.process || "Đang cập nhật"}</span>
            </div>
            
            <div className="flex py-3.5 items-center text-sm">
              <span className="w-52 text-primary/40 font-bold">Mức độ rang (Roast)</span>
              <span className="text-primary/80 font-medium">{product.roast || "Đang cập nhật"}</span>
            </div>
            
            <div className="flex py-3.5 items-center text-sm">
              <span className="w-52 text-primary/40 font-bold">Độ cao nông trại</span>
              <span className="text-primary/80 font-medium">{product.height || "Đang cập nhật"}</span>
            </div>

            <div className="flex py-3.5 items-center text-sm">
              <span className="w-52 text-primary/40 font-bold">Hương vị mặc định</span>
              <span className="text-primary font-bold text-neutral-800">{product.flavorNotes || "Đang cập nhật"}</span>
            </div>

            <div className="flex py-3.5 items-center text-sm">
              <span className="w-52 text-primary/40 font-bold">Trọng lượng đóng bao</span>
              <span className="text-primary/80 font-medium">{product.weight || "250g"}</span>
            </div>
            
            <div className="flex py-3.5 items-center text-sm">
              <span className="w-52 text-primary/40 font-bold">Hạn sử dụng</span>
              <span className="text-primary font-bold text-neutral-700">12 tháng kể từ ngày rang đóng gói</span>
            </div>
          </div>

          {/* Section Mô tả */}
          <h2 className="font-extrabold text-base text-primary uppercase tracking-wider mb-6 flex items-center gap-2">
            <span className="w-1 h-5 bg-primary rounded-full"></span> Mô tả sản phẩm
          </h2>
          
          <div className="text-primary/80 text-sm leading-relaxed whitespace-pre-line max-w-4xl space-y-4">
            <p className="font-extrabold text-primary text-base flex items-center gap-1.5 text-neutral-800">
              <span>☕</span> THƯỞNG THỨC HƯƠNG VỊ NGUYÊN BẢN TỪ HỆ THỐNG NÔNG SẢN CHẤT LƯỢNG CAO
            </p>
            
            <p className="text-neutral-600 font-bold">{product.desc || "Thông tin mô tả sản phẩm hiện đang được cập nhật thêm nội dung chi tiết từ nhà rang..."}</p>
            
            {/* Box mẹo vặt nhỏ nhắn tinh tế */}
            <div className="bg-neutral-50 p-5 rounded-xl border border-neutral-200/60 mt-8 text-xs text-primary/70 relative overflow-hidden">
              <div className="absolute top-0 left-0 h-full w-1 bg-accent-1"></div>
              <p className="font-extrabold text-primary mb-1.5 flex items-center gap-1 text-neutral-800">
                <span>💡</span> Mẹo nhỏ bảo quản từ REVO:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-neutral-500 font-bold">
                <li>Giữ kín miệng túi sau mỗi lần sử dụng bằng nẹp hoặc khóa zip tích hợp sẵn trên bao bì.</li>
                <li>Để sản phẩm ở không gian khô ráo, thoáng mát, tránh ánh nắng và các nguồn mùi tạp chất mạnh để giữ trọn vẹn hương vị mộc bản.</li>
              </ul>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}