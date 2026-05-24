import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Search, X } from 'lucide-react';
import API from '../services/api.js';
import { getImageUrl, handleImageError } from '../utils/imageUrl';

const CATEGORY_MAP = {
  '1': 'Arabica',
  '2': 'Blend',
  '3': 'Robusta',
  '4': 'Fine Robusta',
};

const DEFAULT_MAX_PRICE = 500000;

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
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(DEFAULT_MAX_PRICE);
  const [availableRegions, setAvailableRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [openFilter, setOpenFilter] = useState('type');
  const [sortBy, setSortBy] = useState('default');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(9);
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
          region: selectedRegion === 'all' ? undefined : selectedRegion,
          minPrice,
          maxPrice,
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
          name: p.Name ?? p.name ?? 'San pham',
          price: Number(p.Price ?? p.price ?? 0),
          image: p.ImageUrl ?? p.imageUrl,
          description: p.Description ?? p.description ?? '',
          type: String(p.CategoryId ?? p.categoryId ?? ''),
          stock: p.Stock ?? p.stock,
          region: p.Region ?? p.region,
        }));

        setTotalCount(pageData.totalCount || pageData.TotalCount || formattedProducts.length);
        setProducts(formattedProducts);
      } catch (err) {
        console.error('Loi lay san pham:', err);
        setError('Khong the tai san pham. Vui long thu lai sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page, pageSize, searchTerm, filterType, minPrice, maxPrice, selectedRegion]);

  const hasActiveFilters =
    searchTerm ||
    filterType !== 'all' ||
    minPrice > 0 ||
    maxPrice < DEFAULT_MAX_PRICE ||
    selectedRegion !== 'all' ||
    sortBy !== 'default';

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const updateFilterType = (type) => {
    setFilterType(type);
    setPage(1);
  };

  const updateRegion = (regionName) => {
    setSelectedRegion(regionName);
    setPage(1);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setMinPrice(0);
    setMaxPrice(DEFAULT_MAX_PRICE);
    setSelectedRegion('all');
    setSortBy('default');
    setPage(1);
  };

  const filteredProducts = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    const result = products.filter((product) => {
      const name = product.name?.toLowerCase() || '';
      const description = product.description?.toLowerCase() || '';
      const matchesSearch = !keyword || name.includes(keyword) || description.includes(keyword);
      const matchesCategory = filterType === 'all' || product.type === filterType;
      const matchesPrice = product.price >= minPrice && product.price <= maxPrice;
      const matchesRegion = selectedRegion === 'all' || product.region === selectedRegion;

      return matchesSearch && matchesCategory && matchesPrice && matchesRegion;
    });

    return [...result].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'vi');
      return 0;
    });
  }, [products, searchTerm, filterType, minPrice, maxPrice, selectedRegion, sortBy]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-primary font-nunito font-bold text-lg">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mr-3" />
        Dang tai san pham...
      </div>
    );
  }

  return (
    <div className="bg-pinky-gray min-h-screen py-12">
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-1/4 flex flex-col gap-4">
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-2">
              <Search size={20} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Tim kiem san pham..."
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
                  aria-label="Xoa tim kiem"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
              <div className="flex justify-between items-center mb-2 border-b border-gray-100 pb-4">
                <h2 className="font-montserrat font-bold text-xl text-primary uppercase">Bo loc</h2>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-xs font-nunito font-bold text-accent-1 hover:underline"
                  >
                    Xoa bo loc
                  </button>
                )}
              </div>

              <FilterSection
                title="Giong ca phe"
                summary={filterType === 'all' ? 'Tat ca giong ca phe' : CATEGORY_MAP[filterType]}
                isOpen={openFilter === 'type'}
                onToggle={() => setOpenFilter(openFilter === 'type' ? null : 'type')}
              >
                <div className="space-y-2 font-nunito text-primary/80">
                  {[
                    ['all', 'Tat ca'],
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
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              <FilterSection
                title="Khoang gia"
                summary={`${minPrice.toLocaleString('vi-VN')}d - ${maxPrice.toLocaleString('vi-VN')}d`}
                isOpen={openFilter === 'price'}
                onToggle={() => setOpenFilter(openFilter === 'price' ? null : 'price')}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1">
                    <span className="text-xs font-nunito text-primary/60 block mb-1">Tu (d)</span>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => {
                        setMinPrice(Math.max(0, Number(e.target.value)));
                        setPage(1);
                      }}
                      className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-sm font-nunito text-primary focus:outline-none focus:border-accent-1 focus:ring-1 focus:ring-accent-1"
                    />
                  </div>
                  <span className="text-primary/40 mt-4">-</span>
                  <div className="flex-1">
                    <span className="text-xs font-nunito text-primary/60 block mb-1">Den (d)</span>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => {
                        setMaxPrice(Math.max(minPrice, Number(e.target.value)));
                        setPage(1);
                      }}
                      className="w-full border border-gray-200 rounded-xl px-3 py-1.5 text-sm font-nunito text-primary focus:outline-none focus:border-accent-1 focus:ring-1 focus:ring-accent-1"
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
                  <span>0d</span>
                  <span>500.000d+</span>
                </div>
              </FilterSection>

              <FilterSection
                title="Vung trong"
                summary={selectedRegion === 'all' ? 'Tat ca vung trong' : selectedRegion}
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
                    <span>Tat ca</span>
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

              <div className="mt-5">
                <span className="font-montserrat font-bold text-primary block mb-2">Sap xep</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full border border-gray-200 rounded-full px-4 py-3 outline-none focus:border-accent-1 font-nunito text-primary"
                >
                  <option value="default">Mac dinh</option>
                  <option value="price-asc">Gia tang dan</option>
                  <option value="price-desc">Gia giam dan</option>
                  <option value="name">Ten A-Z</option>
                </select>
              </div>

              <button
                type="button"
                onClick={resetFilters}
                className="w-full mt-5 bg-gray-100 text-primary font-nunito font-bold py-2.5 rounded-full hover:bg-gray-200 transition-colors text-sm"
              >
                THIET LAP LAI
              </button>
            </div>
          </aside>

          <section className="w-full md:w-3/4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-8">
              <h1 className="font-montserrat font-black text-3xl text-primary">CUA HANG</h1>
              <span className="font-nunito text-primary/70">
                Hien thi {filteredProducts.length}/{totalCount} san pham
              </span>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-3xl font-nunito text-center mb-8">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl p-6 flex flex-col hover:shadow-xl transition-all group border border-gray-50 hover:-translate-y-1"
                >
                  <div className="flex justify-center mb-4 h-48 relative overflow-hidden bg-gray-50 rounded-2xl p-4">
                    <img
                      src={getImageUrl(product.image)}
                      onError={handleImageError}
                      alt={product.name}
                      className="h-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="mt-auto">
                    <span className="text-xs font-nunito tracking-widest text-accent-1 uppercase font-bold mb-1 block">
                      {CATEGORY_MAP[product.type] || 'Khac'}
                    </span>
                    <h3 className="font-montserrat font-bold text-xl text-primary mb-2 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-sm font-nunito text-primary/60 mb-4 line-clamp-2">
                      {product.description || 'Dang cap nhat mo ta san pham.'}
                    </p>
                    <div className="flex items-center justify-between gap-3 mt-4 border-t border-gray-50 pt-4">
                      <span className="font-montserrat font-bold text-lg text-primary whitespace-nowrap">
                        {product.price.toLocaleString('vi-VN')}d
                      </span>
                      <Link
                        to={`/product/${product.id}`}
                        className="bg-primary text-white px-4 py-2 rounded-full text-sm font-nunito font-bold hover:bg-accent-1 transition-colors min-w-[130px] text-center"
                        style={{ color: '#ffffff' }}
                      >
                        XEM CHI TIET
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm mt-6">
                <Search size={48} className="text-primary/40 mx-auto mb-4" />
                <p className="font-nunito text-lg text-primary/60">
                  Khong tim thay san pham nao phu hop voi bo loc.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-4 text-sm font-nunito font-bold text-accent-1 hover:underline"
                >
                  Xoa bo loc de xem tat ca san pham
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
                  Truoc
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
