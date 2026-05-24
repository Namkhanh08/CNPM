import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { GrLinkNext } from 'react-icons/gr';
import API from '../services/api.js';
import { getImageUrl, handleImageError } from '../utils/imageUrl';

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
  name: product.Name ?? product.name ?? 'San pham',
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
          throw new Error('API san pham khong tra ve danh sach hop le');
        }

        setProducts(productList.map(normalizeProduct).filter((product) => product.id));
      } catch (err) {
        console.error('Fetch featured products failed:', err);
        setError('Khong the tai san pham noi bat.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const featuredProduct = products[0];
  const otherProducts = useMemo(() => products.slice(1, 5), [products]);

  return (
    <section id="products" className="py-24 bg-white relative">
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between md:items-end mb-16 gap-6">
          <div>
            <p className="text-accent-1 font-nunito font-bold tracking-[0.2em] uppercase mb-4">
              San Pham Cua Chung Toi
            </p>
            <h2 className="text-4xl md:text-5xl font-nunito font-bold text-primary">
              CAC LOAI CA PHE <br className="hidden md:block" />{' '}
              <span className="text-accent-1 leading-[1.2]">NOI BAT</span>
            </h2>
          </div>
          <Link
            to="/shop"
            className="flex items-center gap-3 text-primary font-nunito font-bold border-b border-primary hover:text-accent-1 hover:border-accent-1 transition-colors pb-1 w-fit"
          >
            XEM TAT CA SAN PHAM <GrLinkNext className="w-5 text-accent-1" />
          </Link>
        </div>

        {loading && (
          <div className="bg-pinky-gray rounded-3xl p-10 text-center font-nunito font-bold text-primary">
            Dang tai san pham noi bat...
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 rounded-3xl p-10 text-center font-nunito font-bold text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="bg-pinky-gray rounded-3xl p-10 text-center font-nunito text-primary/70">
            Chua co san pham noi bat de hien thi.
          </div>
        )}

        {!loading && !error && featuredProduct && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 bg-white border rounded-[40px] p-10 flex flex-col md:flex-row items-center gap-8 shadow-sm hover:shadow-xl transition-shadow group relative overflow-hidden">
              <div className="w-full md:w-1/2 relative z-10 flex justify-center">
                <img
                  src={getImageUrl(featuredProduct.image)}
                  onError={handleImageError}
                  alt={featuredProduct.name}
                  className="max-w-[200px] md:max-w-full drop-shadow-2xl group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="w-full md:w-1/2 relative z-10 text-center md:text-left">
                <span className="text-accent-1 font-nunito font-bold tracking-widest uppercase text-sm block mb-2">
                  Noi bat
                </span>
                <h3 className="font-montserrat font-bold text-3xl text-primary mb-3">
                  {featuredProduct.name}
                </h3>
                <p className="font-nunito text-primary/70 mb-6">
                  {featuredProduct.desc || 'Dang cap nhat mo ta san pham.'}
                </p>
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <span className="font-montserrat font-bold text-2xl text-accent-1">
                    {featuredProduct.price.toLocaleString('vi-VN')}d
                  </span>
                  <Link
                    to={`/product/${featuredProduct.id}`}
                    className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-accent-1 transition-colors"
                  >
                    <span className="font-bold text-lg leading-none mb-1">+</span>
                  </Link>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-1/2 h-full bg-accent-2/30 rounded-l-[100px] -z-0" />
            </div>

            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-8">
              {otherProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white border rounded-3xl p-6 flex flex-col hover:shadow-2xl group h-full hover:-translate-y-2 duration-300 transition-all"
                >
                  <div className="flex justify-center mb-4 h-40">
                    <img
                      src={getImageUrl(product.image)}
                      onError={handleImageError}
                      alt={product.name}
                      className="h-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="mt-auto">
                    <h3 className="font-montserrat font-bold text-xl text-primary mb-2 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="font-nunito text-primary/70 text-sm mb-4 line-clamp-2 min-h-10">
                      {product.desc || 'Dang cap nhat mo ta san pham.'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-montserrat font-bold text-lg text-primary">
                        {product.price.toLocaleString('vi-VN')}d
                      </span>
                      <Link
                        to={`/product/${product.id}`}
                        className="bg-pinky-gray text-primary w-8 h-8 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                      >
                        <span className="font-bold text-sm leading-none mb-0.5">+</span>
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
