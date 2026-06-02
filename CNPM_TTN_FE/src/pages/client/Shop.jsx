import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Filter, Search, X } from 'lucide-react';
import API from '../../services/api.js';
import { getImageUrl, handleImageError } from '../../utils/imageUrl';

const CATEGORY_MAP = {
  '1': 'Arabica',
  '2': 'Blend',
  '3': 'Robusta',
  '4': 'Fine Robusta',
};

const DEFAULT_MAX_PRICE = 500000;

const PRICE_PRESETS = [
  { label: 'Dưới 100.000đ', min: 0, max: 100000 },
  { label: '100.000đ - 200.000đ', min: 100000, max: 200000 },
  { label: 'Trên 200.000đ', min: 200000, max: DEFAULT_MAX_PRICE },
];

const SORT_PARAMS = {
  popular: { sortBy: 'popular', descending: true },
  newest: { sortBy: 'newest', descending: true },
  'best-selling': { sortBy: 'sold', descending: true },
  'price-asc': { sortBy: 'price', descending: false },
  'price-desc': { sortBy: 'price', descending: true },
};

function FilterSection({ title, summary, isOpen, onToggle, children }) {
  return (
    <div className="border-b border-gray-100 py-4">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 text-left"
        aria-expanded={isOpen}
      >
        <span>
          <span className="font-montserrat font-bold text-primary block">{title}</span>
          {summary && (
            <span className="font-nunito text-xs text-primary/50 mt-1 block">{summary}</span>
          )}
        </span>
        <ChevronDown
          size={20}
          className={`text-primary/50 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && <div className="mt-4">{children}</div>}
    </div>
  );
}

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [filterRoast, setFilterRoast] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(DEFAULT_MAX_PRICE);
  const [availableRegions, setAvailableRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [openFilter, setOpenFilter] = useState('type');
  const [sortBy, setSortBy] = useState('popular');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const loadRegions = async () => {
      try {
        const res = await API.getRegions();
        setAvailableRegions(res.data?.data || res.data?.Data || []);
      } catch (err) {
        console.error('Loi lay danh sach vung trong:', err);
      }
    };

    loadRegions();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await API.getProducts({
          page,
          pageSize,
          searchTerm: searchTerm.trim() || undefined,
          categoryId: filterType === 'all' ? undefined : Number(filterType),
          roast: filterRoast === 'all' ? undefined : filterRoast,
          region: selectedRegion === 'all' ? undefined : selectedRegion,
          minPrice,
          maxPrice,
          ...(SORT_PARAMS[sortBy] || SORT_PARAMS.popular),
        });

        const pageData = res.data?.data || res.data?.Data || {};
        const productList =
          pageData.items ||
          pageData.Items ||
          res.data?.data?.items ||
          res.data?.data?.Items ||
          res.data?.Items ||
          res.data?.items ||
          res.data;

        if (!Array.isArray(productList)) {
          throw new Error('API san pham khong tra ve danh sach hop le');
        }

        const formattedProducts = productList.map((p) => ({
          id: p.Id ?? p.id,
          name: p.Name ?? p.name ?? 'Sản phẩm',
          price: Number(p.Price ?? p.price ?? 0),
          image: p.ImageUrl ?? p.imageUrl,
          description: p.Description ?? p.description ?? '',
          type: String(p.CategoryId ?? p.categoryId ?? ''),
          stock: p.Stock ?? p.stock,
          region: p.Region ?? p.region,
          soldCount: Number(p.SoldCount ?? p.soldCount ?? 0),
        }));

        setTotalCount(pageData.totalCount || pageData.TotalCount || formattedProducts.length);
        setProducts(formattedProducts);
      } catch (err) {
        console.error('Loi lay san pham:', err);
        setError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page, pageSize, searchTerm, filterType, filterRoast, minPrice, maxPrice, selectedRegion, sortBy]);

  const hasActiveFilters =
    searchTerm ||
    filterType !== 'all' ||
    filterRoast !== 'all' ||
    minPrice > 0 ||
    maxPrice < DEFAULT_MAX_PRICE ||
    selectedRegion !== 'all' ||
    sortBy !== 'popular';

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const updateFilterType = (type) => {
    setFilterType(type);
    setPage(1);
  };

  const updateFilterRoast = (roast) => {
    setFilterRoast(roast);
    setPage(1);
  };

  const updateRegion = (regionName) => {
    setSelectedRegion(regionName);
    setPage(1);
  };

  const updatePricePreset = (min, max) => {
    setMinPrice(min);
    setMaxPrice(max);
    setPage(1);
  };

  const updateSort = (value) => {
    setSortBy(value);
    setPage(1);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterRoast('all');
    setMinPrice(0);
    setMaxPrice(DEFAULT_MAX_PRICE);
    setSelectedRegion('all');
    setSortBy('popular');
    setPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-primary font-nunito font-bold text-lg">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mr-3" />
        Đang tải sản phẩm...
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-8 text-[14px] font-nunito">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row gap-6">
          <aside className="w-full md:w-[270px] shrink-0 flex flex-col gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200/80 flex items-center gap-2">
              <Search size={20} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Tìm cà phê..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-transparent border-none text-sm font-nunito text-primary placeholder-gray-400 focus:outline-none"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setPage(1);
                  }}
                  className="text-gray-400 hover:text-primary"
                  aria-label="Xóa tìm kiếm"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200/80">
              <div className="flex justify-between items-center mb-2 border-b border-accent-1/30 pb-4">
                <h2 className="font-montserrat font-bold text-base text-primary uppercase tracking-wide flex items-center gap-2">
                  <Filter size={18} className="text-accent-1" />
                  Bộ lọc tìm kiếm
                </h2>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-xs font-nunito font-bold text-accent-1 hover:underline"
                  >
                    Xóa
                  </button>
                )}
              </div>

              <FilterSection
                title="Theo danh mục"
                summary={filterType === 'all' ? 'Tất cả sản phẩm' : CATEGORY_MAP[filterType]}
                isOpen={openFilter === 'type'}
                onToggle={() => setOpenFilter(openFilter === 'type' ? null : 'type')}
              >
                <div className="space-y-2 font-nunito text-primary/80">
                  {[
                    ['all', 'Tất cả sản phẩm'],
                    ['1', 'Arabica'],
                    ['2', 'Blend'],
                    ['3', 'Robusta'],
                    ['4', 'Fine Robusta'],
                  ].map(([value, label]) => (
                    <label key={value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        checked={filterType === value}
                        onChange={() => updateFilterType(value)}
                        className="accent-accent-1"
                      />
                      <span className={filterType === value ? 'font-bold text-accent-1' : ''}>
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              <FilterSection
                title="Mức rang"
                summary={filterRoast === 'all' ? 'Tất cả mức rang' : `${filterRoast} Roast`}
                isOpen={openFilter === 'roast'}
                onToggle={() => setOpenFilter(openFilter === 'roast' ? null : 'roast')}
              >
                <div className="space-y-2 font-nunito text-primary/80">
                  {[
                    ['all', 'Tất cả'],
                    ['Light', 'Light Roast'],
                    ['Medium', 'Medium Roast'],
                    ['Dark', 'Dark Roast'],
                  ].map(([value, label]) => (
                    <label key={value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="roast"
                        checked={filterRoast === value}
                        onChange={() => updateFilterRoast(value)}
                        className="accent-accent-1"
                      />
                      <span className={filterRoast === value ? 'font-bold text-accent-1' : ''}>
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              <FilterSection
                title="Khoảng giá"
                summary={`${minPrice.toLocaleString('vi-VN')}đ - ${maxPrice.toLocaleString('vi-VN')}đ`}
                isOpen={openFilter === 'price'}
                onToggle={() => setOpenFilter(openFilter === 'price' ? null : 'price')}
              >
                <div className="space-y-2 mb-4">
                  {PRICE_PRESETS.map((preset) => {
                    const active = minPrice === preset.min && maxPrice === preset.max;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => updatePricePreset(preset.min, preset.max)}
                        className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                          active
                            ? 'border-accent-1 bg-accent-1/10 text-accent-1 font-bold'
                            : 'border-gray-100 text-primary/80 hover:border-accent-1/50'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1">
                    <span className="text-xs font-nunito text-primary/60 block mb-1">Từ (đ)</span>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => {
                        setMinPrice(Math.max(0, Number(e.target.value)));
                        setPage(1);
                      }}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-nunito text-primary focus:outline-none focus:border-accent-1 focus:ring-1 focus:ring-accent-1"
                    />
                  </div>
                  <span className="text-primary/40 mt-4">-</span>
                  <div className="flex-1">
                    <span className="text-xs font-nunito text-primary/60 block mb-1">Đến (đ)</span>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => {
                        setMaxPrice(Math.max(minPrice, Number(e.target.value)));
                        setPage(1);
                      }}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-nunito text-primary focus:outline-none focus:border-accent-1 focus:ring-1 focus:ring-accent-1"
                    />
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max={DEFAULT_MAX_PRICE}
                  step="5000"
                  value={maxPrice}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value >= minPrice) {
                      setMaxPrice(value);
                      setPage(1);
                    }
                  }}
                  className="w-full accent-accent-1 cursor-pointer mt-2"
                />

                <div className="flex justify-between text-xs font-nunito text-primary/50 mt-1">
                  <span>0đ</span>
                  <span>500.000đ+</span>
                </div>
              </FilterSection>

              <FilterSection
                title="Vùng trồng"
                summary={selectedRegion === 'all' ? 'Tất cả vùng trồng' : selectedRegion}
                isOpen={openFilter === 'region'}
                onToggle={() => setOpenFilter(openFilter === 'region' ? null : 'region')}
              >
                <div className="space-y-2 font-nunito text-primary/80">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="region"
                      checked={selectedRegion === 'all'}
                      onChange={() => updateRegion('all')}
                      className="accent-accent-1"
                    />
                    <span>Tất cả</span>
                  </label>
                  {availableRegions.map((region) => (
                    <label key={region} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="region"
                        checked={selectedRegion === region}
                        onChange={() => updateRegion(region)}
                        className="accent-accent-1"
                      />
                      <span>{region}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              <button
                type="button"
                onClick={resetFilters}
                className="w-full mt-5 border border-accent-1 text-accent-1 font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider hover:bg-accent-1 hover:text-white transition-all"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          </aside>

          <section className="flex-1">
            <div className="bg-[#eaeaea]/60 px-4 py-2.5 rounded-xl flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 flex-wrap text-sm">
                <span className="text-primary/70">Sắp xếp theo</span>
                {[
                  ['popular', 'Phổ biến'],
                  ['newest', 'Mới nhất'],
                  ['best-selling', 'Bán chạy'],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => updateSort(value)}
                    className={`px-4 py-1.5 rounded-lg font-bold text-xs shadow-sm transition-all ${
                      sortBy === value ? 'bg-primary text-white' : 'bg-white text-primary hover:bg-gray-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
                <select
                  value={sortBy.startsWith('price') ? sortBy : ''}
                  onChange={(e) => updateSort(e.target.value || 'popular')}
                  className="bg-white text-primary font-bold text-xs px-4 py-1.5 rounded-lg shadow-sm outline-none border-none cursor-pointer min-w-[150px] h-[32px]"
                >
                  <option value="">Giá</option>
                  <option value="price-asc">Giá: Thấp đến Cao</option>
                  <option value="price-desc">Giá: Cao đến Thấp</option>
                </select>
              </div>

              <div className="text-primary/80 text-xs font-medium">
                Hiển thị <span className="font-bold text-accent-1">{products.length}</span>/{totalCount} sản phẩm
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl font-nunito text-center mb-4">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {products.map((product) => (
                <Link
                  to={`/product/${product.id}`}
                  key={product.id}
                  className="bg-white rounded-xl overflow-hidden flex flex-col hover:shadow-md border border-gray-100 hover:border-accent-1/50 transition-all relative duration-300 group"
                >
                  {product.soldCount > 0 && (
                    <div className="absolute top-2.5 left-[-4px] bg-accent-1 text-white text-[10px] px-2 py-0.5 rounded-r font-bold z-10 shadow-sm uppercase tracking-wider">
                      Hot
                    </div>
                  )}

                  <div className="w-full aspect-square bg-gray-50/50 flex items-center justify-center relative overflow-hidden p-3 border-b border-gray-100/50">
                    <img
                      src={getImageUrl(product.image)}
                      onError={handleImageError}
                      alt={product.name}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-3 flex flex-col flex-1 justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-accent-1 uppercase tracking-widest block mb-1">
                        {CATEGORY_MAP[product.type] || 'Khác'}
                      </span>

                      <h3 className="font-montserrat font-bold text-primary text-xs sm:text-sm leading-snug line-clamp-2 mb-2 group-hover:text-accent-1 transition-colors min-h-[36px]">
                        {product.name}
                      </h3>
                    </div>

                    <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between flex-wrap gap-1">
                      <span className="font-montserrat font-bold text-primary text-sm sm:text-base">
                        {product.price.toLocaleString('vi-VN')}đ
                      </span>
                      <span className="text-[11px] text-primary/50 font-medium">
                        Đã bán {product.soldCount}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {products.length === 0 && (
              <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100 mt-2">
                <Search size={48} className="text-primary/40 mx-auto mb-4" />
                <p className="font-nunito text-lg text-primary/60">
                  Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-4 text-sm font-nunito font-bold text-accent-1 hover:underline"
                >
                  Xóa bộ lọc để xem tất cả sản phẩm
                </button>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  className="px-4 py-2 rounded-xl border border-gray-200 bg-white font-bold text-primary disabled:opacity-50"
                >
                  Trước
                </button>
                <span className="px-4 py-2 font-bold text-primary">
                  Trang {page}/{totalPages}
                </span>
                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                  className="px-4 py-2 rounded-xl border border-gray-200 bg-white font-bold text-primary disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
