import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { GrLinkNext } from 'react-icons/gr';
import { FaPlus } from 'react-icons/fa';
import API from '../../services/api.js';
import { getImageUrl, handleImageError } from '../../utils/imageUrl';

const getProductList = (responseData) => {
  const pageData = responseData?.data || responseData?.Data || {};

  return (
    pageData.items ||
    pageData.Items ||
    responseData?.data?.items ||
    responseData?.data?.Items ||
    responseData?.Items ||
    responseData?.items ||
    responseData ||
    []
  );
};

const normalizeProduct = (product) => ({
  id: product.Id ?? product.id,
  name: product.Name ?? product.name ?? 'Sản phẩm',
  desc: product.Description ?? product.description ?? '',
  price: Number(product.Price ?? product.price ?? 0),
  image: product.ImageUrl ?? product.imageUrl ?? '',
});

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await API.getProducts({ page: 1, pageSize: 5 });
        const productList = getProductList(res.data);

        if (!Array.isArray(productList)) {
          throw new Error('API sản phẩm không trả về danh sách hợp lệ');
        }

        setProducts(productList.map(normalizeProduct).filter((product) => product.id));
      } catch (err) {
        console.error('Fetch featured products failed:', err);
        setError('Không thể tải sản phẩm nổi bật.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const featuredProduct = products[0];
  const otherProducts = useMemo(() => products.slice(1, 5), [products]);

  return (
    <section id="products" className="py-24 bg-[#f4f1ea] relative overflow-hidden">
      {/* Lớp phủ SVG Noise tạo độ nhám giấy mộc */}
      <div
        className="absolute inset-0 opacity-[0.12] pointer-events-none mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paperNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paperNoise)'/%3E%3C/svg%3E")`
        }}
      />

      <div className="container mx-auto px-6 lg:px-12 max-w-7xl relative z-10">
        <div className="flex flex-col md:flex-row justify-between md:items-end mb-16 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-nunito font-bold text-amber-950 uppercase">
              CÁC LOẠI CÀ PHÊ <br className="hidden md:block" />{' '}
              <span className="text-accent-1 leading-[1.2]">NỔI BẬT</span>
            </h2>
          </div>
          <Link
            to="/shop"
            className="flex items-center gap-3 text-amber-950 font-nunito font-bold border-b-2 border-amber-950 hover:text-accent-1 hover:border-accent-1 transition-all pb-1 w-fit hover:scale-102 active:scale-98 duration-200"
          >
            XEM TẤT CẢ SẢN PHẨM <GrLinkNext className="w-4 text-accent-1" />
          </Link>
        </div>

        {loading && (
          <div className="bg-[#e6dfd5] rounded-3xl p-12 text-center font-nunito font-bold text-amber-950 animate-pulse">
            Đang tải sản phẩm nổi bật...
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 rounded-3xl p-12 text-center font-nunito font-bold text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="bg-[#e6dfd5] rounded-3xl p-12 text-center font-nunito text-amber-900/70">
            Chưa có sản phẩm nổi bật để hiển thị.
          </div>
        )}

        {!loading && !error && featuredProduct && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* FEATURED LARGE CARD */}
            <div className="lg:col-span-6 bg-white border border-amber-900/5 rounded-3xl p-10 flex flex-col md:flex-row items-center gap-8 shadow-[0_10px_30px_rgba(139,92,26,0.04)] hover:shadow-[0_20px_50px_rgba(139,92,26,0.12)] hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden">
              <div className="w-full md:w-1/2 relative z-10 flex justify-center">
                <img
                  src={getImageUrl(featuredProduct.image)}
                  onError={handleImageError}
                  alt={featuredProduct.name}
                  className="max-w-[180px] md:max-w-full drop-shadow-[0_15px_30px_rgba(0,0,0,0.15)] group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="w-full md:w-1/2 relative z-10 text-center md:text-left">
                <span className="text-accent-1 font-nunito font-bold tracking-[0.15em] uppercase text-xs block mb-3">
                  NỔI BẬT NHẤT
                </span>
                <h3 className="font-montserrat font-bold text-3xl text-amber-950 mb-3 leading-tight uppercase">
                  {featuredProduct.name}
                </h3>
                <p className="font-nunito text-amber-900/80 text-sm mb-6 leading-relaxed">
                  {featuredProduct.desc || 'Đang cập nhật mô tả sản phẩm.'}
                </p>
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <span className="font-montserrat font-black text-2xl text-accent-1">
                    {featuredProduct.price.toLocaleString('vi-VN')}đ
                  </span>
                  <Link
                    to={`/product/${featuredProduct.id}`}
                    className="bg-amber-950 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-accent-1 active:scale-90 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <FaPlus className="text-sm" />
                  </Link>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-1/2 h-full bg-[#f9f5e8]/40 rounded-l-[100px] -z-0 pointer-events-none" />
            </div>

            {/* OTHER 4 CARDS GRID */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {otherProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white border border-amber-900/5 rounded-3xl p-6 flex flex-col shadow-[0_10px_30px_rgba(139,92,26,0.03)] hover:shadow-[0_20px_40px_rgba(139,92,26,0.08)] group h-full hover:-translate-y-1 duration-300 transition-all"
                >
                  <div className="flex justify-center mb-6 h-36 shrink-0">
                    <img
                      src={getImageUrl(product.image)}
                      onError={handleImageError}
                      alt={product.name}
                      className="h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.12)] group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex flex-col flex-1">
                    <h3 className="font-montserrat font-bold text-lg text-amber-950 mb-2 line-clamp-1 uppercase tracking-wide">
                      {product.name}
                    </h3>
                    <p className="font-nunito text-amber-900/80 text-xs mb-4 line-clamp-2 min-h-[32px] leading-relaxed">
                      {product.desc || 'Đang cập nhật mô tả sản phẩm.'}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="font-montserrat font-bold text-lg text-accent-1">
                        {product.price.toLocaleString('vi-VN')}đ
                      </span>
                      <Link
                        to={`/product/${product.id}`}
                        className="bg-stone-100 text-[#7F5539] w-9 h-9 rounded-full flex items-center justify-center hover:bg-amber-950 hover:text-white active:scale-90 transition-all duration-300 shadow-sm"
                      >
                        <FaPlus className="text-xs" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

