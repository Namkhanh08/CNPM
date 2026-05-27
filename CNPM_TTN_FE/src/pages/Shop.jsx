import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api.js';
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import { BiSearch } from "react-icons/bi";

// Giữ lại duy nhất 1 tệp tĩnh để làm ảnh dự phòng (fallback) nếu sản phẩm hệ thống thiếu ảnh
import defaultImage from '../assets/img/section2/image1.png';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openFilter, setOpenFilter] = useState(null);

  const [priceFilter, setPriceFilter] = useState('all'); // 'all', 'under100', '100to200', 'above200'
  const [roastFilter, setRoastFilter] = useState('all'); // 'all', 'Light', 'Medium', 'Dark'
  const [selectedFlavor, setSelectedFlavor] = useState('all'); // 'all', 'Chocolate', 'Caramel', ...
  const [selectedRegion, setSelectedRegion] = useState('all'); // 'all', 'Đà Lạt', 'Đắk Lắk', 'Cầu Đất'
  const [sortType, setSortType] = useState('default'); // 'default', 'asc', 'desc', 'newest', 'best'

  // Bản đồ danh mục hạt
  const CategoryMap = {
    '1': 'Arabica',
    '2': 'Blend',
    '3': 'Robusta',
    '4': 'Fine Robusta',
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.getProducts();
      
      // Chống sập nếu res.data rỗng hoặc lỗi cấu trúc
      const rawData = Array.isArray(res.data) ? res.data : (res.data?.products || []);

      const formattedProducts = rawData.map(p => {
        const imgPath = p.ImageUrl || p.imageUrl || p.Image || p.image || '';
        // Lấy thông tin mở rộng nếu backend đính kèm phẳng hoặc lồng trong details
        const details = p.details || p.Details || null;
        return {
          id: p.Id ?? p.id,
          name: p.Name ?? p.name ?? 'Sản phẩm chưa đặt tên',
          price: p.Price ?? p.price ?? 0,
          image: imgPath,
          description: p.Description ?? p.description ?? '',
          type: String(p.CategoryId ?? p.categoryId ?? '1'),
          stock: p.Stock ?? p.stock ?? 0,
          // Đưa các trường lọc nâng cao vào để xử lý lọc Client-side chính xác
          roast: p.roast ?? p.Roast ?? details?.roast ?? details?.Roast ?? '',
          flavorNotes: p.flavorNotes ?? p.FlavorNotes ?? details?.flavorNotes ?? details?.FlavorNotes ?? '',
          region: p.region ?? p.Region ?? details?.region ?? details?.Region ?? '',
          createdAt: p.createdAt || p.Id || 0, 
          salesCount: p.salesCount || 0 
        };
      });

      setProducts(formattedProducts);
    } catch (err) {
      console.error("Lỗi lấy danh sách sản phẩm: ", err);
      setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Cơ chế gọi ảnh Server Admin tĩnh / động đồng bộ
  const handleDisplayImage = (imagePath) => {
    if (!imagePath) return defaultImage;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return `http://localhost:5126${imagePath}`;
  };

  const toggleFilter = (filterName) => {
    setOpenFilter(openFilter === filterName ? null : filterName);
  };

  // Xử lý xóa toàn bộ bộ lọc về trạng thái ban đầu
  const handleResetFilters = () => {
    setFilterType('all');
    setSearchTerm('');
    setPriceFilter('all');
    setRoastFilter('all');
    setSelectedFlavor('all');
    setSelectedRegion('all');
    setSortType('default');
  };

  // Xử lý bộ lọc kết hợp nâng cao
  const filteredProducts = products
    .filter(p => {
      // 1. Lọc theo Giống hạt
      const matchesType = filterType === 'all' || p.type === filterType;
      
      // 2. Lọc theo Từ khóa tìm kiếm
      const productName = p.name ? String(p.name) : '';
      const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase());
      
      // 3. Lọc theo Khoảng giá
      let matchesPrice = true;
      if (priceFilter === 'under100') matchesPrice = p.price < 100000;
      else if (priceFilter === '100to200') matchesPrice = p.price >= 100000 && p.price <= 200000;
      else if (priceFilter === 'above200') matchesPrice = p.price > 200000;

      // 4. Lọc theo Mức rang
      const matchesRoast = roastFilter === 'all' || 
        String(p.roast || '').toLowerCase().includes(roastFilter.toLowerCase());

      // 5. Lọc theo Hương vị 
      const matchesFlavor = selectedFlavor === 'all' || 
        String(p.flavorNotes || '').toLowerCase().includes(selectedFlavor.toLowerCase());

      // 6. Lọc theo Vùng trồng
      const matchesRegion = selectedRegion === 'all' || 
        String(p.region || '').toLowerCase().includes(selectedRegion.toLowerCase());

      return matchesType && matchesSearch && matchesPrice && matchesRoast && matchesFlavor && matchesRegion;
    })
    .sort((a, b) => {
      // Xử lý Sắp xếp dữ liệu theo lựa chọn
      if (sortType === 'asc') return a.price - b.price;
      if (sortType === 'desc') return b.price - a.price;
      if (sortType === 'newest') return b.createdAt > a.createdAt ? 1 : -1;
      if (sortType === 'best') return b.salesCount - a.salesCount;
      return 0; // Mặc định giữ nguyên thứ tự gốc từ API
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg font-bold text-primary">
        Đang tải danh sách sản phẩm...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500 font-bold">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-12 mb-8">
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
        <div className="flex flex-col md:flex-row gap-8">

          {/* ================= SIDEBAR BỘ LỌC ĐÃ LIÊN KẾT LOGIC ================= */}
          <div className="w-full md:w-1/4 bg-white p-6 rounded-3xl shadow-2xl border-2 h-fit">
            
            <h2 className="font-montserrat font-bold text-xl text-primary mb-6 uppercase border-b border-accent-1 pb-4 text-center">
              Bộ Lọc
            </h2>

            {/* Tìm kiếm */}
            <div className="mb-6 flex items-center justify-center border-2 border-accent-1 rounded-full px-2 bg-white">
              <input
                type="text"
                placeholder="Tìm cà phê..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-full px-4 py-3 outline-none font-nunito text-sm"
              /> 
              <BiSearch size={20} className="text-gray-400 mr-2"/>
            </div>

            {/* Giống cà phê */}
            <div className="border-b border-accent-1 py-3">
              <button
                type="button"
                onClick={() => toggleFilter('type')}
                className="w-full flex items-center justify-between"
              >
                <span className="font-montserrat font-bold text-primary">Giống cà phê</span>
                <span className="text-xl">
                  {openFilter === 'type' ? <IoIosArrowUp /> : <IoIosArrowDown />}
                </span>
              </button>

              {openFilter === 'type' && (
                <div className="mt-4 space-y-2 font-nunito text-primary/80">
                  {['all', '1', '2', '3', '4'].map((catId) => (
                    <label key={catId} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        checked={filterType === catId}
                        onChange={() => setFilterType(catId)}
                        className="accent-accent-1"
                      />
                      <span>{catId === 'all' ? 'Tất cả' : CategoryMap[catId]}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Khoảng giá */}
            <div className="border-b border-accent-1 py-3">
              <button
                type="button"
                onClick={() => toggleFilter('price')}
                className="w-full flex items-center justify-between"
              >
                <span className="font-montserrat font-bold text-primary">Khoảng giá</span>
                <span className="text-xl">
                  {openFilter === 'price' ? <IoIosArrowUp /> : <IoIosArrowDown />}
                </span>
              </button>

              {openFilter === 'price' && (
                <div className="mt-4 space-y-2 font-nunito text-primary/80">
                  {[
                    { value: 'all', label: 'Tất cả khoảng giá' },
                    { value: 'under100', label: 'Dưới 100.000đ' },
                    { value: '100to200', label: '100.000đ - 200.000đ' },
                    { value: 'above200', label: 'Trên 200.000đ' }
                  ].map((item) => (
                    <label key={item.value} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="price-filter"
                        checked={priceFilter === item.value}
                        onChange={() => setPriceFilter(item.value)}
                        className="accent-accent-1" 
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Mức rang */}
            <div className="border-b border-accent-1 py-3">
              <button
                type="button"
                onClick={() => toggleFilter('roast')}
                className="w-full flex items-center justify-between"
              >
                <span className="font-montserrat font-bold text-primary">Mức rang</span>
                <span className="text-xl">
                  {openFilter === 'roast' ? <IoIosArrowUp /> : <IoIosArrowDown />}
                </span>
              </button>

              {openFilter === 'roast' && (
                <div className="mt-4 space-y-2 font-nunito text-primary/80">
                  {[
                    { value: 'all', label: 'Tất cả các mức' },
                    { value: 'Light', label: 'Light Roast' },
                    { value: 'Medium', label: 'Medium Roast' },
                    { value: 'Dark', label: 'Dark Roast' }
                  ].map((item) => (
                    <label key={item.value} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="roast-filter"
                        checked={roastFilter === item.value}
                        onChange={() => setRoastFilter(item.value)}
                        className="accent-accent-1" 
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Hương vị */}
            <div className="border-b border-accent-1 py-3">
              <button
                type="button"
                onClick={() => toggleFilter('flavor')}
                className="w-full flex items-center justify-between"
              >
                <span className="font-montserrat font-bold text-primary">Hương vị</span>
                <span className="text-xl">
                  {openFilter === 'flavor' ? <IoIosArrowUp /> : <IoIosArrowDown />}
                </span>
              </button>

              {openFilter === 'flavor' && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {['all', 'Chocolate', 'Caramel', 'Hoa nhài', 'Cam vàng', 'Mật ong', 'Hạnh nhân', 'Cacao đắng', 'Gỗ sồi', 'Hạt dẻ','Socola đen', 'Mật mía', 'Berry', 'Chanh'].map((flavor) => (
                    <button 
                      key={flavor} 
                      type="button" 
                      onClick={() => setSelectedFlavor(flavor)}
                      className={`px-3 py-1 rounded-full border text-sm transition-all ${
                        selectedFlavor === flavor 
                          ? 'bg-primary text-white border-primary' 
                          : 'bg-white text-primary border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {flavor === 'all' ? 'Tất cả' : flavor}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Vùng trồng */}
            <div className="border-b border-accent-1 py-3">
              <button
                type="button"
                onClick={() => toggleFilter('region')}
                className="w-full flex items-center justify-between"
              >
                <span className="font-montserrat font-bold text-primary">Vùng trồng</span>
                <span className="text-xl">
                  {openFilter === 'region' ? <IoIosArrowUp /> : <IoIosArrowDown />}
                </span>
              </button>

              {openFilter === 'region' && (
                <div className="mt-4 space-y-2 font-nunito text-primary/80">
                  {[
                    { value: 'all', label: 'Tất cả vùng trồng' },
                    { value: 'Đà Lạt', label: 'Đà Lạt' },
                    { value: 'Đắk Lắk', label: 'Đắk Lắk' },
                    { value: 'Cầu Đất', label: 'Cầu Đất' },
                    { value: 'Buôn Ma Thuột', label: 'Buôn Ma Thuột' },
                    { value: 'Gia Lai', label: 'Gia Lai' },
                    { value: 'Lâm Đồng', label: 'Lâm Đồng' },
                    { value: 'Ethiopia Yirgacheffe', label: 'Ethiopia Yirgacheffe' },
                    { value : 'Colombia', label: 'Colombia' }

                  ].map((item) => (
                    <label key={item.value} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="region-filter"
                        checked={selectedRegion === item.value}
                        onChange={() => setSelectedRegion(item.value)}
                        className="accent-accent-1 rounded" 
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Bộ chọn sắp xếp dữ liệu động */}
            <div className="mt-6">
              <select 
                value={sortType} 
                onChange={(e) => setSortType(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-full px-4 py-3 outline-none focus:border-accent-1 font-nunito text-sm bg-white"
              >
                <option value="default">Mặc định</option>
                <option value="asc">Giá tăng dần</option>
                <option value="desc">Giá giảm dần</option>
                <option value="newest">Mới nhất</option>
                <option value="best">Bán chạy</option>
              </select>
            </div>

            {/* Hệ thống nút hành động */}
            <div className="flex flex-col gap-3 mt-6">
              <button 
                type="button" 
                onClick={() => setOpenFilter(null)} // Đóng bảng thu gọn bộ lọc
                className="w-full bg-primary text-white font-nunito font-bold py-3 rounded-full hover:bg-accent-1 transition-colors text-sm uppercase"
              >
                Áp Dụng Bộ Lọc
              </button>
              <button 
                type="button" 
                onClick={handleResetFilters}
                className="w-full border-2 border-primary text-primary font-nunito font-bold py-3 rounded-full hover:bg-primary hover:text-white transition-all text-sm uppercase"
              >
                Xóa Bộ Lọc
              </button>
            </div>

          </div>

          {/* ================= LƯỚI HIỂN THỊ SẢN PHẨM HOÀN CHỈNH ================= */}
          <div className="w-full md:w-3/4">
            <div className="flex justify-between items-center mb-8">
              <h1 className="font-nunito font-bold text-4xl text-primary">CỬA HÀNG</h1>
              <span className="font-nunito text-accent-1/90">Hiển thị {filteredProducts.length} sản phẩm</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white rounded-3xl p-6 flex flex-col hover:shadow-lg transition-all group border-2 hover:-translate-y-1 duration-300 hover:scale-105">
                  
                  {/* Image wrapper */}
                  <div className="flex justify-center mb-4 h-48 relative overflow-hidden">
                    <img 
                      src={handleDisplayImage(product.image)} 
                      alt={product.name} 
                      className="h-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform duration-500" 
                      onError={(e) => { e.target.src = defaultImage; }} 
                    />
                  </div>

                  {/* Thông tin thẻ sản phẩm */}
                  <div className="mt-auto">
                    <span className="text-xs font-nunito tracking-widest text-accent-1 uppercase font-bold mb-1 block">
                      {CategoryMap[product.type] || 'Arabica'}
                    </span>
                    <h3 className="font-montserrat font-bold text-xl text-primary mb-2 line-clamp-1">
                      {product.name}
                    </h3>
                    
                    <div className="flex items-center justify-between mt-4">
                      <span className="font-montserrat font-bold text-lg text-primary">
                        {product.price != null ? Number(product.price).toLocaleString('vi-VN') : '0'}đ
                      </span>
                      <Link to={`/product/${product.id}`} className="bg-primary text-white px-4 py-2 rounded-full text-sm font-nunito font-bold hover:bg-accent-1 transition-colors">
                        XEM CHI TIẾT
                      </Link>
                    </div>
                  </div>

                </div>
              ))}
            </div>

            {/* Fallback khi mảng trống */}
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