import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import API from '../services/api.js';

import image1 from '../assets/img/section2/image1.png';
import image2 from '../assets/img/section2/image2.png';
import image3 from '../assets/img/section2/image3.png';
import image4 from '../assets/img/section2/image4.png';
import image5 from '../assets/img/section2/image5.png';

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
  useEffect(() => {
    if (flavorOptions.length > 0) {
      setFlavorNotes(flavorOptions[0]);
    }
  }, [product]);

  useEffect(() => {
    if (weightOptions.length > 0) {
      setWeight(weightOptions[0]);
    }
  }, [product]);

  useEffect(() => {
    if (grindOptions.length > 0) {
      setGrindType(grindOptions[0]);
    }
  }, [product]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.getProductById(id);

        const p = res.data;
        const formatted = {
          id: p.Id,
          name: p.product?.Name,
          desc: p.product?.Description,
          price: p.product?.Price,
          image: p.product?.ImageUrl,
          region: p.Region,
          process: p.Process,
          roast: p.Roast,
          flavorNotes: p.FlavorNotes,
          type: p.product?.CategoryId,
          grindingOptions: p.GrindingOption || [],
          weight: p.Weight,
          height: p.Height
        };
        setProduct(formatted);
      } catch (err) {
        console.error("Lỗi lấy sản phẩm: ", err);
        setError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const flavorOptions = product?.flavorNotes ? product.flavorNotes.split(',').map(f => f.trim()) : ["whole-bean"];
  const weightOptions = product?.weight ? product.weight.split(',').map(f => f.trim()) : ["250g"];
  const grindOptions = product?.grindingOptions || [];
  const handleAddToCart = async () => {
    if (!grindType) {
      alert("Vui lòng chọn kiểu xay trước khi thêm vào giỏ hàng.");
      return;
    }
    try {
      await addToCart(product, quantity, grindType.Id, flavorNotes, weights);
      alert("Sản phẩm đã được thêm vào giỏ hàng!");
    } catch (err) {
      console.error("Lỗi thêm vào giỏ hàng: ", err);
      alert("Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.");
    }
  }
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
            <img src={ImageMap[product.image] || product.image} alt={product.name} className="max-h-[500px] object-contain drop-shadow-2xl relative z-10 hover:scale-110 transition-all duration-300" />
          </div>

          {/* Product Details Form */}
          <div className="w-full lg:w-1/2 flex flex-col">
            <h1 className="font-montserrat font-black text-4xl lg:text-5xl text-primary mb-2 line-clamp-1 text-center">{product.name}</h1>
            <p className="font-nunito text-primary/70 mb-6 text-lg text-center">{product.desc}</p>
            <div className="font-montserrat font-black text-3xl text-accent-1 mb-8 text-center">{product.price.toLocaleString('vi-VN')}đ</div>

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
              <h3 className='font-montserrat font-bold text-primary mb-4 uppercase'>Chọn kiểu xay</h3>
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

            {/* Quantity and Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              {/* Quantity Input */}
              <div className="flex items-center border border-gray-200 rounded-full h-14 bg-white px-2 w-full sm:w-32 justify-between">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-primary/50 hover:bg-accent-1 hover:text-white font-bold text-xl"
                >-</button>
                <span className="font-montserrat font-bold text-lg w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-primary/50 hover:bg-accent-1 hover:text-white font-bold text-xl"
                >+</button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-primary text-white font-nunito font-bold text-lg h-14 rounded-full hover:bg-accent-1 shadow-lg hover:shadow-xl transform hover:-translate-y-1 uppercase tracking-wider hover:scale-105 transition-all duration-300"
              >
                Thêm vào giỏ hàng
              </button>
            </div>

            {/* Link to Subscription */}
            <div className="mt-6 text-center">
              <button onClick={() => navigate('/subscription')} className="text-accent-1 font-nunito font-bold hover:underline">
                Hoặc đăng ký gói giao định kỳ (Tiết kiệm 15%)
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
