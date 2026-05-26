import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, PackageCheck, Truck } from 'lucide-react';
import useStore from '../../store/useStore';
import API from '../../services/api.js';
import { getImageUrl, handleImageError } from '../../utils/imageUrl';
import { TraceabilityTimeline } from '../../components';

const CATEGORY_MAP = {
  '1': 'Arabica',
  '2': 'Blend',
  '3': 'Robusta',
  '4': 'Fine Robusta',
};

const splitOptions = (value, fallback) => {
  if (!value) return fallback;
  return String(value).split(',').map((item) => item.trim()).filter(Boolean);
};

const getGrindId = (grind) => grind?.Id ?? grind?.id;
const getGrindName = (grind) => grind?.Name ?? grind?.name ?? 'Mac dinh';

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
  const [weights, setWeight] = useState('250g');
  const [showTrace, setShowTrace] = useState(false);
  const [traceData, setTraceData] = useState(null);
  const [traceLoading, setTraceLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await API.getProductById(id);
        const p = res.data?.data || res.data?.Data || res.data;
        const baseProduct = p.Product ?? p.product ?? p;

        const formatted = {
          id: p.Id ?? p.id ?? baseProduct.Id ?? baseProduct.id,
          name: baseProduct.Name ?? baseProduct.name ?? 'San pham',
          desc: baseProduct.Description ?? baseProduct.description ?? '',
          price: Number(baseProduct.Price ?? baseProduct.price ?? 0),
          image: baseProduct.ImageUrl ?? baseProduct.imageUrl,
          region: p.Region ?? p.region ?? 'Dang cap nhat',
          process: p.Process ?? p.process ?? 'Dang cap nhat',
          roast: p.Roast ?? p.roast ?? 'Dang cap nhat',
          flavorNotes: p.FlavorNotes ?? p.flavorNotes ?? 'Original',
          type: String(baseProduct.CategoryId ?? baseProduct.categoryId ?? ''),
          grindingOptions: p.GrindingOption ?? p.grindingOptions ?? p.GrindingOptions ?? [],
          weight: p.Weight ?? p.weight ?? '250g',
          height: p.Height ?? p.height ?? '1200m',
        };

        setProduct(formatted);
        setFlavorNotes(splitOptions(formatted.flavorNotes, ['Original'])[0]);
        setWeight(splitOptions(formatted.weight, ['250g'])[0]);
        setGrindType(formatted.grindingOptions[0] || null);
      } catch (err) {
        console.error('Loi lay san pham:', err);
        setError('Khong the tai san pham. Vui long thu lai sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const flavorOptions = splitOptions(product?.flavorNotes, ['Original']);
  const weightOptions = splitOptions(product?.weight, ['250g']);
  const grindOptions = product?.grindingOptions || [];

  const handleOpenTrace = async () => {
    try {
      setTraceLoading(true);
      const res = await API.getProductTraceability(product.id);
      const data = res.data?.data || res.data?.Data || res.data;
      setTraceData(data);
      setShowTrace(true);
    } catch (err) {
      console.error('Loi lay thong tin truy xuat:', err);
      alert('Khong the lay thong tin truy xuat nguon goc. Vui long thu lai sau.');
    } finally {
      setTraceLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!grindType) {
      alert('Vui long chon kieu xay truoc khi them vao gio hang.');
      return;
    }

    try {
      await addToCart(product, quantity, getGrindId(grindType), flavorNotes, weights);
      alert('San pham da duoc them vao gio hang!');
    } catch (err) {
      console.error('Loi them vao gio hang:', err);
      alert('Khong the them san pham vao gio hang. Vui long thu lai.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-primary font-nunito text-lg">Dang tai san pham...</span>
      </div>
    );
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500 font-nunito">{error}</div>;
  }

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500 font-nunito">San pham khong ton tai.</div>;
  }

  return (
    <div className="bg-white min-h-screen py-16">
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
        <button
          type="button"
          onClick={() => navigate('/shop')}
          className="text-primary font-nunito font-bold mb-8 hover:text-accent-1 flex items-center gap-2"
        >
          <ArrowLeft size={18} /> Quay lai cua hang
        </button>

        <div className="bg-white rounded-[32px] p-6 lg:p-8 shadow-2xl flex flex-col lg:flex-row gap-10">
          <div className="w-full lg:w-[44%] flex items-center justify-center bg-pinky-gray rounded-3xl p-5 lg:p-6 relative aspect-square max-h-[420px]">
            <div className="absolute inset-0 bg-accent-1/5 opacity-50 rounded-3xl" />
            <img
              src={getImageUrl(product.image)}
              onError={handleImageError}
              alt={product.name}
              className="w-full h-full max-h-[340px] object-contain drop-shadow-2xl relative z-10 hover:scale-105 transition-all duration-300"
            />
          </div>

          <div className="w-full lg:flex-1 flex flex-col">
            <h1 className="font-montserrat font-black text-4xl lg:text-5xl text-primary mb-2 line-clamp-1 text-center">
              {product.name}
            </h1>
            <p className="font-nunito text-primary/70 mb-6 text-lg text-center">
              {product.desc || 'Dang cap nhat mo ta san pham.'}
            </p>
            <div className="font-montserrat font-black text-3xl text-accent-1 mb-8 text-center">
              {product.price.toLocaleString('vi-VN')}d
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-6 font-nunito text-sm border-t border-b border-accent-1 py-6 text-center">
              <div><span className="text-primary/60 block mb-1">Giong ca phe</span><span className="font-bold text-primary">{CATEGORY_MAP[product.type] || product.type}</span></div>
              <div><span className="text-primary/60 block mb-1">Vung trong</span><span className="font-bold text-primary">{product.region}</span></div>
              <div><span className="text-primary/60 block mb-1">Phuong phap so che</span><span className="font-bold text-primary">{product.process}</span></div>
              <div><span className="text-primary/60 block mb-1">Muc do rang</span><span className="font-bold text-primary">{product.roast}</span></div>
              <div><span className="text-primary/60 block mb-1">Do cao</span><span className="font-bold text-primary">{product.height}</span></div>
              <div><span className="text-primary/60 block mb-1">Trong luong</span><span className="font-bold text-primary">{product.weight}</span></div>
              <div className="col-span-2"><span className="text-primary/60 block mb-1">Huong vi</span><span className="font-bold text-primary">{product.flavorNotes}</span></div>
            </div>

            <div className="mb-8">
              <button
                type="button"
                onClick={handleOpenTrace}
                disabled={traceLoading}
                className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-primary to-[#53352A] text-white font-nunito font-bold text-sm shadow-md hover:shadow-lg hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
              >
                {traceLoading ? 'Dang tai nguon goc...' : 'Xem nguon goc & Truy xuat lo hang'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              <div className="flex items-center justify-center gap-2 rounded-2xl bg-pinky-gray px-3 py-3 text-sm font-nunito text-primary">
                <Truck size={18} /> Giao hang nhanh
              </div>
              <div className="flex items-center justify-center gap-2 rounded-2xl bg-pinky-gray px-3 py-3 text-sm font-nunito text-primary">
                <BadgeCheck size={18} /> Rang tuoi moi ngay
              </div>
              <div className="flex items-center justify-center gap-2 rounded-2xl bg-pinky-gray px-3 py-3 text-sm font-nunito text-primary">
                <PackageCheck size={18} /> Doi tra 7 ngay
              </div>
            </div>

            <div className="mb-8 border-b border-accent-1 pb-10">
              <h3 className="font-montserrat font-bold text-primary mb-4 uppercase text-center">Chon huong vi</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {flavorOptions.map((flavor) => (
                  <button
                    key={flavor}
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

            <div className="mb-8">
              <h3 className="font-montserrat font-bold text-primary mb-4 uppercase text-center">Chon khoi luong</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {weightOptions.map((weight) => (
                  <button
                    key={weight}
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

            <div className="mb-8 border-t border-accent-1 pt-6">
              <h3 className="font-montserrat font-bold text-primary mb-4 uppercase text-center">Chon kieu xay</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {grindOptions.map((grind) => (
                  <button
                    key={getGrindId(grind)}
                    type="button"
                    onClick={() => setGrindType(grind)}
                    className={`border-2 py-3 px-4 rounded-xl font-nunito font-semibold text-sm transition-all text-center ${getGrindId(grindType) === getGrindId(grind)
                      ? 'border-primary bg-primary text-white shadow-md'
                      : 'border-gray-200 text-primary/70 hover:border-primary/50'
                    }`}
                  >
                    {getGrindName(grind)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              <div className="flex items-center border border-gray-200 rounded-full h-14 bg-white px-2 w-full sm:w-32 justify-between">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-primary/50 hover:bg-accent-1 hover:text-white font-bold text-xl"
                >
                  -
                </button>
                <span className="font-montserrat font-bold text-lg w-8 text-center">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-primary/50 hover:bg-accent-1 hover:text-white font-bold text-xl"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 bg-primary text-white font-nunito font-bold text-lg h-14 rounded-full hover:bg-accent-1 shadow-lg hover:shadow-xl transform hover:-translate-y-1 uppercase tracking-wider hover:scale-105 transition-all duration-300"
              >
                Them vao gio hang
              </button>
            </div>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => navigate('/subscription')}
                className="text-accent-1 font-nunito font-bold hover:underline"
              >
                Hoac dang ky goi giao dinh ky (Tiet kiem 15%)
              </button>
            </div>
          </div>
        </div>
      </div>
      {showTrace && traceData && (
        <TraceabilityTimeline data={traceData} onClose={() => setShowTrace(false)} />
      )}
    </div>
  );
}
