import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api.js';
import { IoIosArrowUp } from "react-icons/io";
import { IoIosArrowDown } from "react-icons/io";
import { BiSearch } from "react-icons/bi";

import image1 from '../assets/img/section2/image1.png';
import image2 from '../assets/img/section2/image2.png';
import image3 from '../assets/img/section2/image3.png';
import image4 from '../assets/img/section2/image4.png';
import image5 from '../assets/img/section2/image5.png';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const CategoryMap = {
    '1': 'Arabica',
    '2': 'Blend',
    '3': 'Robusta',
    '4': 'Fine Robusta',

  }

  const ImageMap = {
    '/assets/img/section2/image1.png': image1,
    '/assets/img/section2/image2.png': image2,
    '/assets/img/section2/image3.png': image3,
    '/assets/img/section2/image4.png': image4,
    '/assets/img/section2/image5.png': image5,
  };

  const fetchProducts = async () => {
    try {
      const res = await API.getProducts();

      const formattedProducts = res.data.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.imageUrl,
        description: p.description,
        type: p.categoryId,
        stock: p.stock,
      }));

      setProducts(formattedProducts);
    } catch (err) {
      console.error("Lỗi lấy sản phẩm: ", err);
      setError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // State
  const [openFilter, setOpenFilter] = useState(null);

  // Toggle
  const toggleFilter = (filterName) => {
    setOpenFilter(openFilter === filterName ? null : filterName);
  };

  const filteredProducts = filterType === 'all'
    ? products
    : products.filter(p => p.type === filterType);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">Đang tải sản phẩm...</div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-12 mb-8">
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
        <div className="flex flex-col md:flex-row gap-8">

          {/* Sidebar Filter */}
          <div className="w-full md:w-1/4 bg-white p-6 rounded-3xl shadow-2xl border-2 h-fit">

            <h2 className="font-montserrat font-bold text-xl text-primary mb-6 uppercase border-b border-accent-1 pb-4 text-center">
              Bộ Lọc
            </h2>

            {/* Search */}
            <div className="mb-6 flex items-center justify-center border-2 border-accent-1 rounded-full  px-2">
              <input
                type="text"
                placeholder="Tìm cà phê..."
                className="
        w-full
        rounded-full px-4 py-3
        outline-none
        focus:border-accent-1
        font-nunito
      "
              /> 
              <BiSearch size={20}/>
            </div>

            {/* Coffee Type */}
            <div className="border-b border-accent-1 py-3">

              <button
                onClick={() => toggleFilter('type')}
                className="w-full flex items-center justify-between"
              >
                <span className="font-montserrat font-bold text-primary">
                  Giống cà phê
                </span>

                <span className="text-xl">
                  {openFilter === 'type' ? <IoIosArrowUp /> : <IoIosArrowDown />}
                </span>
              </button>

              {openFilter === 'type' && (
                <div className="mt-4 space-y-2 font-nunito text-primary/80">

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      checked={filterType === 'all'}
                      onChange={() => setFilterType('all')}
                      className="accent-accent-1"
                    />
                    <span>Tất cả</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      checked={filterType === '1'}
                      onChange={() => setFilterType('1')}
                      className="accent-accent-1"
                    />
                    <span>Arabica</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      checked={filterType === '2'}
                      onChange={() => setFilterType('2')}
                      className="accent-accent-1"
                    />
                    <span>Blend</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      checked={filterType === '3'}
                      onChange={() => setFilterType('3')}
                      className="accent-accent-1"
                    />
                    <span>Robusta</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      checked={filterType === '4'}
                      onChange={() => setFilterType('4')}
                      className="accent-accent-1"
                    />
                    <span>Fine Robusta</span>
                  </label>

                </div>
              )}

            </div>

            {/* Price */}
            <div className="border-b border-accent-1 py-3">

              <button
                onClick={() => toggleFilter('price')}
                className="w-full flex items-center justify-between"
              >
                <span className="font-montserrat font-bold text-primary">
                  Khoảng giá
                </span>

                <span className="text-xl">
                  {openFilter === 'type' ? <IoIosArrowUp /> : <IoIosArrowDown />}
                </span>
              </button>

              {openFilter === 'price' && (
                <div className="mt-4 space-y-2 font-nunito text-primary/80">

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="accent-accent-1" />
                    <span>Dưới 100.000đ</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="accent-accent-1" />
                    <span>100.000đ - 200.000đ</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="accent-accent-1" />
                    <span>Trên 200.000đ</span>
                  </label>

                </div>
              )}

            </div>

            {/* Roast */}
            <div className="border-b border-accent-1 py-3">

              <button
                onClick={() => toggleFilter('roast')}
                className="w-full flex items-center justify-between"
              >
                <span className="font-montserrat font-bold text-primary">
                  Mức rang
                </span>

                <span className="text-xl">
                  {openFilter === 'type' ? <IoIosArrowUp /> : <IoIosArrowDown />}
                </span>
              </button>

              {openFilter === 'roast' && (
                <div className="mt-4 space-y-2 font-nunito text-primary/80">

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="accent-accent-1" />
                    <span>Light Roast</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="accent-accent-1" />
                    <span>Medium Roast</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="accent-accent-1" />
                    <span>Dark Roast</span>
                  </label>

                </div>
              )}

            </div>

            {/* Flavor */}
            <div className="border-b border-accent-1 py-3">

              <button
                onClick={() => toggleFilter('flavor')}
                className="w-full flex items-center justify-between"
              >
                <span className="font-montserrat font-bold text-primary">
                  Hương vị
                </span>

                <span className="text-xl">
                  {openFilter === 'type' ? <IoIosArrowUp /> : <IoIosArrowDown />}
                </span>
              </button>

              {openFilter === 'flavor' && (
                <div className="mt-4 flex flex-wrap gap-2">

                  <button className="px-3 py-1 rounded-full border text-sm hover:bg-primary hover:text-white transition-all">
                    Chocolate
                  </button>

                  <button className="px-3 py-1 rounded-full border text-sm hover:bg-primary hover:text-white transition-all">
                    Caramel
                  </button>

                  <button className="px-3 py-1 rounded-full border text-sm hover:bg-primary hover:text-white transition-all">
                    Fruity
                  </button>

                  <button className="px-3 py-1 rounded-full border text-sm hover:bg-primary hover:text-white transition-all">
                    Floral
                  </button>

                </div>
              )}

            </div>

            {/* Region */}
            <div className="border-b border-accent-1 py-3">

              <button
                onClick={() => toggleFilter('region')}
                className="w-full flex items-center justify-between"
              >
                <span className="font-montserrat font-bold text-primary">
                  Vùng trồng
                </span>

                <span className="text-xl">
                  {openFilter === 'type' ? <IoIosArrowUp /> : <IoIosArrowDown />}
                </span>
              </button>

              {openFilter === 'region' && (
                <div className="mt-4 space-y-2 font-nunito text-primary/80">

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="accent-accent-1 rounded" />
                    <span>Đà Lạt</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="accent-accent-1 rounded" />
                    <span>Đắk Lắk</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="accent-accent-1 rounded" />
                    <span>Cầu Đất</span>
                  </label>

                </div>
              )}

            </div>

            {/* Sort */}
            <div className="mt-6">

              <select
                className="
        w-full border-2 border-gray-200
        rounded-full px-4 py-3
        outline-none
        focus:border-accent-1
        font-nunito
      "
              >
                <option>Mặc định</option>
                <option>Giá tăng dần</option>
                <option>Giá giảm dần</option>
                <option>Mới nhất</option>
                <option>Bán chạy</option>
              </select>

            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3 mt-6">

              <button
                className="
        w-full bg-primary text-white
        font-nunito font-bold py-3
        rounded-full hover:bg-accent-1
        transition-colors
      "
              >
                ÁP DỤNG BỘ LỌC
              </button>

              <button
                className="
        w-full border-2 border-primary
        text-primary
        font-nunito font-bold py-3
        rounded-full hover:bg-primary
        hover:text-white
        transition-all
      "
              >
                XÓA BỘ LỌC
              </button>

            </div>

          </div>

          {/* Product Grid */}
          <div className="w-full md:w-3/4">
            <div className="flex justify-between items-center mb-8">
              <h1 className="font-nunito font-bold text-4xl text-primary">CỬA HÀNG</h1>
              <span className="font-nunito text-accent-1/90">Hiển thị {filteredProducts.length} sản phẩm</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white rounded-3xl p-6 flex flex-col hover:shadow-lg transition-all group border-2 hover:-translate-y-1 duration-300 hover:scale-110">
                  <div className="flex justify-center mb-4 h-48 relative overflow-hidden">
                    <img src={ImageMap[product.image] || product.image} alt={product.name} className="h-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="mt-auto text-center">
                    <span className="text-xs font-nunito tracking-widest text-accent-1 uppercase font-bold mb-1 block">{CategoryMap[product.type] || product.type}</span>
                    <h3 className="font-montserrat font-bold text-xl text-primary mb-2 line-clamp-1">{product.name}</h3>
                    <div className="flex items-center justify-between mt-4">
                      <span className="font-montserrat font-bold text-lg text-primary">{product.price}đ</span>
                      <Link to={`/product/${product.id}`} className="bg-primary text-white px-4 py-2 rounded-full text-sm font-nunito font-bold hover:bg-accent-1 transition-colors">
                        XEM CHI TIẾT
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <p className="font-nunito text-xl text-primary/60">Không tìm thấy sản phẩm phù hợp.</p>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
