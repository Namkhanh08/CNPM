import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api.js';
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import { BiSearch, BiFilterAlt } from "react-icons/bi";

import image1 from '../assets/img/section2/image1.png';
import image2 from '../assets/img/section2/image2.png';
import image3 from '../assets/img/section2/image3.png';
import image4 from '../assets/img/section2/image4.png';
import image5 from '../assets/img/section2/image5.png';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const CategoryMap = {
    '1': 'Arabica',
    '2': 'Blend',
    '3': 'Robusta',
    '4': 'Fine Robusta',
  };

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

  // Xử lý Lọc & Sắp xếp dữ liệu
  const filteredProducts = products
    .filter(p => {
      if (filterType !== 'all' && p.type !== filterType) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 font-nunito">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <span className="ml-3 text-primary font-medium">Đang tải sản phẩm...</span>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-8 text-[14px] font-nunito">
      <div className="container mx-auto px-4 max-w-7xl">
        
        <div className="flex flex-col md:flex-row gap-6">
          
          {/* 1. SIDEBAR BỘ LỌC */}
          <div className="w-full md:w-[260px] shrink-0 bg-white p-5 rounded-xl border border-gray-200/80 h-fit shadow-sm">
            <div className="flex items-center gap-2 font-montserrat font-bold text-base text-primary mb-4 pb-3 border-b border-accent-1/30">
              <BiFilterAlt className="text-lg text-accent-1" />
              <span className="uppercase tracking-wide">BỘ LỌC TÌM KIẾM</span>
            </div>

            {/* Ô Tìm kiếm */}
            <div className="mb-5 relative flex items-center">
              <input
                type="text"
                placeholder="Tìm cà phê..."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 pr-9 outline-none focus:border-accent-1 focus:bg-white transition-all text-sm"
              />
              <BiSearch className="absolute right-3 text-gray-400 text-lg" />
            </div>

            {/* Lọc theo Danh Mục */}
            <div className="mb-5">
              <h3 className="font-montserrat font-bold text-primary mb-3 text-sm">Theo Danh Mục</h3>
              <div className="space-y-2.5 pl-1">
                {['all', '1', '2', '3', '4'].map((type) => (
                  <label key={type} className="flex items-center gap-2.5 cursor-pointer text-primary/80 hover:text-accent-1 transition-colors">
                    <input
                      type="radio"
                      name="category"
                      checked={filterType === type}
                      onChange={() => setFilterType(type)}
                      className="w-4 h-4 accent-accent-1 cursor-pointer"
                    />
                    <span className={filterType === type ? "font-bold text-accent-1" : ""}>
                      {type === 'all' ? 'Tất cả sản phẩm' : CategoryMap[type]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Khoảng Giá */}
            <div className="mb-5 border-t border-gray-100 pt-4">
              <h3 className="font-montserrat font-bold text-primary mb-3 text-sm">Khoảng Giá</h3>
              <div className="space-y-2.5 pl-1">
                {['Dưới 100.000đ', '100.000đ - 200.000đ', 'Trên 200.000đ'].map((priceLabel, idx) => (
                  <label key={idx} className="flex items-center gap-2.5 cursor-pointer text-primary/80 hover:text-accent-1 transition-colors">
                    <input type="checkbox" className="w-4 h-4 accent-accent-1 rounded cursor-pointer" />
                    <span>{priceLabel}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Mức Rang */}
            <div className="mb-6 border-t border-gray-100 pt-4">
              <h3 className="font-montserrat font-bold text-primary mb-3 text-sm">Mức Rang</h3>
              <div className="space-y-2.5 pl-1">
                {['Light Roast', 'Medium Roast', 'Dark Roast'].map((roast, idx) => (
                  <label key={idx} className="flex items-center gap-2.5 cursor-pointer text-primary/80 hover:text-accent-1 transition-colors">
                    <input type="checkbox" className="w-4 h-4 accent-accent-1 rounded cursor-pointer" />
                    <span>{roast}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Nút Xóa Bộ Lọc */}
            <button 
              onClick={() => { setFilterType('all'); setSortBy('default'); }}
              className="w-full border border-accent-1 text-accent-1 font-bold py-2 rounded-lg text-xs uppercase tracking-wider hover:bg-accent-1 hover:text-white transition-all shadow-sm"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>

          {/* 2. HIỂN THỊ SẢN PHẨM */}
          <div className="flex-1">
            
            {/* Thanh Sắp Xếp Ngang (Chuẩn Shopee Layout) */}
            <div className="bg-[#eaeaea]/60 px-4 py-2.5 rounded-xl flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 flex-wrap text-sm">
                <span className="text-primary/70">Sắp xếp theo</span>
                <button 
                  onClick={() => setSortBy('default')}
                  className={`px-4 py-1.5 rounded-lg font-bold text-xs shadow-sm transition-all ${sortBy === 'default' ? 'bg-primary text-white' : 'bg-white text-primary hover:bg-gray-50'}`}
                >
                  Phổ biến
                </button>
                <button className="px-4 py-1.5 bg-white text-primary rounded-lg font-bold text-xs shadow-sm hover:bg-gray-50 transition-all">
                  Mới nhất
                </button>
                <button className="px-4 py-1.5 bg-white text-primary rounded-lg font-bold text-xs shadow-sm hover:bg-gray-50 transition-all">
                  Bán chạy
                </button>
                
                {/* Dropdown Giá */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white text-primary font-bold text-xs px-4 py-1.5 rounded-lg shadow-sm outline-none border-none cursor-pointer min-w-[140px] h-[32px]"
                >
                  <option value="default">Giá</option>
                  <option value="price-asc">Giá: Thấp đến Cao</option>
                  <option value="price-desc">Giá: Cao đến Thấp</option>
                </select>
              </div>

              <div className="text-primary/80 text-xs font-medium">
                Hiển thị <span className="font-bold text-accent-1">{filteredProducts.length}</span> sản phẩm
              </div>
            </div>

            {/* Grid Danh Sách Sản Phẩm */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map(product => (
                <Link 
                  to={`/product/${product.id}`} 
                  key={product.id} 
                  className="bg-white rounded-xl overflow-hidden flex flex-col hover:shadow-md border border-gray-100 hover:border-accent-1/50 transition-all relative duration-300 group"
                >
                  {/* Tag Yêu Thích đặc trưng Shopee dùng màu thương hiệu của bạn */}
                  <div className="absolute top-2.5 left-[-4px] bg-accent-1 text-white text-[10px] px-2 py-0.5 rounded-r font-bold z-10 shadow-sm uppercase tracking-wider">
                    Hot
                  </div>

                  {/* Ảnh sản phẩm vuông tỉ lệ 1:1 */}
                  <div className="w-full aspect-square bg-gray-50/50 flex items-center justify-center relative overflow-hidden p-3 border-b border-gray-100/50">
                    <img 
                      src={ImageMap[product.image] || product.image} 
                      alt={product.name} 
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>

                  {/* Thông tin sản phẩm */}
                  <div className="p-3 flex flex-col flex-1 justify-between">
                    <div>
                      {/* Thể loại hạt nhỏ phía trên */}
                      <span className="text-[10px] font-bold text-accent-1 uppercase tracking-widest block mb-1">
                        {CategoryMap[product.type] || product.type}
                      </span>

                      {/* Tên sản phẩm dùng font-montserrat cho tiêu đề, giới hạn 2 dòng */}
                      <h3 className="font-montserrat font-bold text-primary text-xs sm:text-sm leading-snug line-clamp-2 mb-2 group-hover:text-accent-1 transition-colors min-h-[36px]">
                        {product.name}
                      </h3>
                    </div>

                    {/* Phần giá tiền dưới đáy card */}
                    <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between flex-wrap gap-1">
                      <span className="font-montserrat font-bold text-primary text-sm sm:text-base">
                        {Number(product.price).toLocaleString('vi-VN')}đ
                      </span>
                      <span className="text-[11px] text-primary/50 font-medium">
                        Đã bán 120+
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Giao diện khi trống */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100 mt-2">
                <p className="text-primary/60 text-base">Không tìm thấy sản phẩm phù hợp.</p>
                <button 
                  onClick={() => { setFilterType('all'); setSortBy('default'); }}
                  className="mt-2 text-sm text-accent-1 font-bold hover:underline"
                >
                  Xóa bộ lọc để thử lại
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}