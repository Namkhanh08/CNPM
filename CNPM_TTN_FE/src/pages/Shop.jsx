import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api.js';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500000);
  const [regions, setRegions] = useState({
    'Đà Lạt': false,
    'Đắk Lắk': false,
    'Cầu Đất': false
  });
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
  }

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await API.getProducts();
      
      const productList =
        res.data?.data?.items ||
        res.data?.data?.Items ||
        res.data?.Items ||
        res.data?.items ||
        res.data;

      if (!Array.isArray(productList)) {
        throw new Error("API sản phẩm không trả về danh sách hợp lệ");
      }
      
      const formattedProducts = productList.map(p => ({
        id: p.Id ?? p.id,
        name: p.Name ?? p.name,
        price: p.Price ?? p.price,
        image: p.ImageUrl ?? p.imageUrl,
        description: p.Description ?? p.description,
        type: String(p.CategoryId ?? p.categoryId),
        stock: p.Stock ?? p.stock,
      }));

      setProducts(formattedProducts);
    } catch (err) {
      console.error("Lỗi lấy sản phẩm: ", err);
      setError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegionChange = (regionName) => {
    setRegions(prev => ({
      ...prev,
      [regionName]: !prev[regionName]
    }));
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setMinPrice(0);
    setMaxPrice(500000);
    setRegions({
      'Đà Lạt': false,
      'Đắk Lắk': false,
      'Cầu Đất': false
    });
  };

  // Thuật toán lọc phía Client cực kỳ mượt mà, cập nhật tức thì (Real-time Filtering)
  const filteredProducts = products.filter(p => {
    // 1. Lọc theo từ khóa tìm kiếm (tên hoặc mô tả sản phẩm)
    const matchesSearch = !searchTerm.trim() || 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. Lọc theo giống cà phê (Category)
    // Khớp mã Category với Dữ liệu DB: '1': Arabica, '3': Robusta, '4': Fine Robusta
    const matchesCategory = filterType === 'all' || p.type === filterType;

    // 3. Lọc theo khoảng giá
    const matchesPrice = p.price >= minPrice && p.price <= maxPrice;

    // 4. Lọc theo vùng trồng trong mô tả / tên
    const selectedRegionsList = Object.keys(regions).filter(r => regions[r]);
    const matchesRegion = selectedRegionsList.length === 0 || selectedRegionsList.some(r => 
      p.description.toLowerCase().includes(r.toLowerCase()) || 
      p.name.toLowerCase().includes(r.toLowerCase())
    );

    return matchesSearch && matchesCategory && matchesPrice && matchesRegion;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-primary font-nunito font-bold text-lg">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mr-3"></div>
        Đang tải sản phẩm...
      </div>
    );
  }

  return (
    <div className="bg-pinky-gray min-h-screen py-12">
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Filter */}
          <div className="w-full md:w-1/4 flex flex-col gap-4">
            
            {/* Search Input Box (Nằm trên chữ BỘ LỌC như yêu cầu) */}
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z" />
              </svg>
              <input 
                type="text" 
                placeholder="Tìm kiếm sản phẩm..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full bg-transparent border-none text-sm font-nunito text-primary placeholder-gray-400 focus:outline-none"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="text-gray-400 hover:text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Khung BỘ LỌC */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <h2 className="font-montserrat font-bold text-xl text-primary uppercase">Bộ Lọc</h2>
                {(searchTerm || filterType !== 'all' || minPrice > 0 || maxPrice < 500000 || Object.values(regions).some(v => v)) && (
                  <button onClick={resetFilters} className="text-xs font-nunito font-bold text-accent-1 hover:underline">
                    Xóa bộ lọc
                  </button>
                )}
              </div>
              
              {/* Giống cà phê */}
              <div className="mb-6">
                <h3 className="font-montserrat font-bold text-primary mb-3">Giống cà phê</h3>
                <div className="space-y-2 font-nunito text-primary/80">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="type" checked={filterType === 'all'} onChange={() => setFilterType('all')} className="accent-accent-1" />
                    <span>Tất cả</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="type" checked={filterType === '1'} onChange={() => setFilterType('1')} className="accent-accent-1" />
                    <span>Arabica</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="type" checked={filterType === '3'} onChange={() => setFilterType('3')} className="accent-accent-1" />
                    <span>Robusta</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="type" checked={filterType === '4'} onChange={() => setFilterType('4')} className="accent-accent-1" />
                    <span>Fine Robusta</span>
                  </label>
                </div>
              </div>

              {/* Lọc theo giá sản phẩm với thanh điều chỉnh (Slider) */}
              <div className="mb-6 border-t border-gray-50 pt-4">
                <h3 className="font-montserrat font-bold text-primary mb-3">Khoảng giá</h3>
                
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1">
                    <span className="text-xs font-nunito text-primary/60 block mb-1">Từ (đ)</span>
                    <input 
                      type="number" 
                      value={minPrice} 
                      onChange={(e) => setMinPrice(Math.max(0, Number(e.target.value)))} 
                      className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-sm font-nunito text-primary focus:outline-none focus:border-accent-1 focus:ring-1 focus:ring-accent-1"
                    />
                  </div>
                  <span className="text-primary/40 mt-4">—</span>
                  <div className="flex-1">
                    <span className="text-xs font-nunito text-primary/60 block mb-1">Đến (đ)</span>
                    <input 
                      type="number" 
                      value={maxPrice} 
                      onChange={(e) => setMaxPrice(Math.max(minPrice, Number(e.target.value)))} 
                      className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-sm font-nunito text-primary focus:outline-none focus:border-accent-1 focus:ring-1 focus:ring-accent-1"
                    />
                  </div>
                </div>

                <input 
                  type="range" 
                  min="0" 
                  max="500000" 
                  step="5000"
                  value={maxPrice} 
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val >= minPrice) {
                      setMaxPrice(val);
                    }
                  }} 
                  className="w-full accent-accent-1 cursor-pointer mt-2"
                />
                
                <div className="flex justify-between text-xs font-nunito text-primary/50 mt-1">
                  <span>0đ</span>
                  <span>500.000đ+</span>
                </div>
              </div>

              {/* Vùng trồng */}
              <div className="mb-6 border-t border-gray-50 pt-4">
                <h3 className="font-montserrat font-bold text-primary mb-3">Vùng trồng</h3>
                <div className="space-y-2 font-nunito text-primary/80">
                  {Object.keys(regions).map(region => (
                    <label key={region} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={regions[region]} 
                        onChange={() => handleRegionChange(region)}
                        className="accent-accent-1 rounded" 
                      /> 
                      <span>{region}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button 
                onClick={resetFilters}
                className="w-full bg-gray-100 text-primary font-nunito font-bold py-2.5 rounded-full hover:bg-gray-200 transition-colors text-sm"
              >
                THIẾT LẬP LẠI
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="w-full md:w-3/4">
            <div className="flex justify-between items-center mb-8">
              <h1 className="font-montserrat font-black text-3xl text-primary">CỬA HÀNG</h1>
              <span className="font-nunito text-primary/70">Hiển thị {filteredProducts.length} sản phẩm</span>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-3xl font-nunito text-center mb-8">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white rounded-3xl p-6 flex flex-col hover:shadow-lg transition-all group border border-gray-50">
                  <div className="flex justify-center mb-4 h-48 relative overflow-hidden bg-gray-50 rounded-2xl p-4">
                    <img src={product.image} alt={product.name} className="h-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="mt-auto">
                    <span className="text-xs font-nunito tracking-widest text-accent-1 uppercase font-bold mb-1 block">
                      {CategoryMap[product.type] || "Khác"}
                    </span>
                    <h3 className="font-montserrat font-bold text-xl text-primary mb-2 line-clamp-1">{product.name}</h3>
                    <p className="text-sm font-nunito text-primary/60 mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between mt-4 border-t border-gray-50 pt-4">
                      <span className="font-montserrat font-bold text-lg text-primary">{product.price.toLocaleString('vi-VN')}đ</span>
                      <Link to={`/product/${product.id}`} className="bg-primary text-white px-4 py-2 rounded-full text-sm font-nunito font-bold hover:bg-accent-1 transition-colors">
                        XEM CHI TIẾT
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredProducts.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm mt-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-primary/40 mx-auto mb-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z" />
                </svg>
                <p className="font-nunito text-lg text-primary/60">Không tìm thấy sản phẩm nào phù hợp với bộ lọc.</p>
                <button onClick={resetFilters} className="mt-4 text-sm font-nunito font-bold text-accent-1 hover:underline">
                  Xóa bộ lọc để xem tất cả sản phẩm
                </button>
              </div>
            )}
            
          </div>

        </div>
      </div>
    </div>
  );
}
