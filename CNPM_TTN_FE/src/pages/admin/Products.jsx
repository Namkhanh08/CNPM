import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Eye, X, Camera } from 'lucide-react';
import API from '../../services/api';
import { getImageUrl, handleImageError } from '../../utils/imageUrl';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view'); 
  const [uploading, setUploading] = useState(false);


  const [formData, setFormData] = useState({
    id: 0, name: "", price: 0, stock: 0, categoryId: "", description: "", imageUrl: "",
    productDetail: {
      region: "", process: "", roast: "", flavorNotes: "",
      acidityLevel: 0, bitternessLevel: 0, bodyLevel: 0,
      bestTime: "", matchTags: "", traceabilityData: ""
    }
  });

  const normalizeDetail = (source = {}) => ({
    region: source.region ?? source.Region ?? "",
    process: source.process ?? source.Process ?? "",
    roast: source.roast ?? source.Roast ?? "",
    flavorNotes: source.flavorNotes ?? source.FlavorNotes ?? "",
    acidityLevel: source.acidityLevel ?? source.AcidityLevel ?? 0,
    bitternessLevel: source.bitternessLevel ?? source.BitternessLevel ?? 0,
    bodyLevel: source.bodyLevel ?? source.BodyLevel ?? 0,
    bestTime: source.bestTime ?? source.BestTime ?? "",
    matchTags: source.matchTags ?? source.MatchTags ?? "",
    traceabilityData: source.traceabilityData ?? source.TraceabilityData ?? ""
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resProd, resCat] = await Promise.all([
        API.getAll(),
        API.getCategories()
      ]);
      const productData = resProd.data?.data || resProd.data?.Data || resProd.data || [];
      const productList = productData.items || productData.Items || productData;
      const categoryList = resCat.data?.data || resCat.data?.Data || resCat.data || [];
      setProducts(Array.isArray(productList) ? productList : []);
      setCategories(Array.isArray(categoryList) ? categoryList : []);
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);


  const handleOpenModal = async (mode, product = null) => {
    setModalMode(mode);
    if (product) {
      const id = product.id ?? product.Id;
      let sourceProduct = product;

      if (mode === 'view' || mode === 'edit') {
        try {
          const res = await API.getProductById(id);
          sourceProduct = res.data?.data || res.data?.Data || res.data || product;
        } catch (err) {
          console.error("Không thể tải chi tiết sản phẩm:", err);
        }
      }

      const baseProduct = sourceProduct.Product ?? sourceProduct.product ?? sourceProduct;
      const sourceDetail = sourceProduct.details || sourceProduct.Details || sourceProduct.productDetail || sourceProduct.ProductDetail || sourceProduct;

      setFormData({
        ...sourceProduct,
        id,
        name: baseProduct.name ?? baseProduct.Name ?? "",
        price: baseProduct.price ?? baseProduct.Price ?? 0,
        stock: baseProduct.stock ?? baseProduct.Stock ?? 0,
        categoryId: baseProduct.categoryId ?? baseProduct.CategoryId ?? "",
        description: baseProduct.description ?? baseProduct.Description ?? "",
        imageUrl: baseProduct.imageUrl ?? baseProduct.ImageUrl ?? "",
        productDetail: normalizeDetail(sourceDetail)
      });
    } else {

      setFormData({
        id: 0, name: "", price: 0, stock: 0, categoryId: categories[0]?.id || "", 
        description: "", imageUrl: "",
        productDetail: {
          region: "", process: "", roast: "", flavorNotes: "",
          acidityLevel: 0, bitternessLevel: 0, bodyLevel: 0,
          bestTime: "", matchTags: "", traceabilityData: ""
        }
      });
    }
    setIsModalOpen(true);
  };


  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploading(true);
      const res = await API.uploadProductImage(file);
      setFormData({ ...formData, imageUrl: res.data.url });
    } catch {
      alert("Lỗi upload ảnh");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (modalMode === 'add') {
        await API.createProduct(formData);
        alert("Thêm thành công");
      } else {
        await API.updateProduct(formData.id, formData);
        alert("Cập nhật thành công");
      }
      setIsModalOpen(false);
      fetchData();
    } catch {
      alert("Thao tác thất bại");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      try {
        const res = await API.deleteProduct(id);
        if (res.data) {
          alert("Xóa thành công");
          fetchData();
        }
      } catch { alert("Không thể xóa sản phẩm này"); }
    }
  };

  const filteredProducts = products.filter(p => (p.name ?? p.Name ?? "").toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="animate-fade-in p-6 font-nunito">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="font-montserrat font-bold text-2xl">Danh Mục Sản Phẩm</h1>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input 
              type="text" placeholder="Tìm tên sản phẩm..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-sm"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          <button 
            onClick={() => handleOpenModal('add')}
            className="bg-primary text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-accent-1 transition-colors whitespace-nowrap"
          >
            <Plus size={18} /> Thêm Sản Phẩm Mới
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Ảnh</th>
                <th className="px-6 py-4">Tên Sản Phẩm</th>
                <th className="px-6 py-4">Loại</th>
                <th className="px-6 py-4 text-right">Đơn Giá</th>
                <th className="px-6 py-4 text-center">Tồn Kho</th>
                <th className="px-6 py-4 text-center">Trạng Thái</th>
                <th className="px-6 py-4 text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="7" className="text-center py-10">Đang tải dữ liệu...</td></tr>
              ) : filteredProducts.map(prod => (
                <tr key={prod.id ?? prod.Id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <img
                      src={getImageUrl(prod.imageUrl ?? prod.ImageUrl)}
                      onError={handleImageError}
                      className="w-12 h-12 object-cover rounded-lg border"
                      alt=""
                    />
                  </td>
                  <td className="px-6 py-4 font-bold text-primary">{prod.name ?? prod.Name}</td>
                  <td className="px-6 py-4">{prod.type ?? prod.Type ?? prod.category?.name ?? prod.Category?.Name ?? "N/A"}</td>
                  <td className="px-6 py-4 font-bold text-accent-1 text-right">{(prod.price ?? prod.Price ?? 0).toLocaleString('vi-VN')}₫</td>
                  <td className="px-6 py-4 text-center font-bold">{prod.stock ?? prod.Stock ?? 0}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${(prod.stock ?? prod.Stock ?? 0) > 20 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {(prod.stock ?? prod.Stock ?? 0) > 20 ? 'Còn hàng' : 'Sắp hết'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleOpenModal('view', prod)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg"><Eye size={18} /></button>
                      <button onClick={() => handleOpenModal('edit', prod)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={18} /></button>
                      <button onClick={() => handleDelete(prod.id ?? prod.Id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM TỔNG HỢP */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-800">
                {modalMode === 'view' ? 'Chi tiết sản phẩm' : modalMode === 'edit' ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/*sản phẩm*/}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-600">Ảnh sản phẩm</label>
                  <div className="relative group aspect-square border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center overflow-hidden bg-gray-50">
                    {formData.imageUrl ? (
                      <img
                        src={getImageUrl(formData.imageUrl)}
                        onError={handleImageError}
                        className="w-full h-full object-contain"
                        alt="Preview"
                      />
                    ) : <Camera className="text-gray-300" size={40} />}
                    {modalMode !== 'view' && (
                      <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer text-white text-xs font-bold">
                        {uploading ? "Đang tải..." : "Thay đổi ảnh"}
                        <input type="file" hidden onChange={handleImageChange} />
                      </label>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-sm font-bold">Tên sản phẩm</label>
                    <input disabled={modalMode === 'view'} type="text" className="w-full p-2.5 border rounded-xl mt-1" 
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-sm font-bold">Loại sản phẩm</label>
                    <select disabled={modalMode === 'view'} className="w-full p-2.5 border rounded-xl mt-1"
                      value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}>
                      {categories.map(cat => <option key={cat.id ?? cat.Id} value={cat.id ?? cat.Id}>{cat.name ?? cat.Name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-bold">Giá bán (₫)</label>
                    <input disabled={modalMode === 'view'} type="number" className="w-full p-2.5 border rounded-xl mt-1" 
                      value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-bold">Số lượng tồn</label>
                    <input disabled={modalMode === 'view'} type="number" className="w-full p-2.5 border rounded-xl mt-1" 
                      value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-bold">Mô tả ngắn</label>
                    <textarea disabled={modalMode === 'view'} className="w-full p-2.5 border rounded-xl mt-1" rows="2"
                      value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                  </div>
                </div>
              </div>

              {/*CHI TIẾT*/}
              <div className="pt-6 border-t">
                <h3 className="text-md font-bold text-primary mb-4">Thông số chi tiết (Product Details)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500">Vùng trồng (Region)</label>
                    <input disabled={modalMode === 'view'} type="text" className="w-full p-2 border rounded-lg mt-1" 
                      value={formData.productDetail.region} onChange={e => setFormData({...formData, productDetail: {...formData.productDetail, region: e.target.value}})} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500">Sơ chế (Process)</label>
                    <input disabled={modalMode === 'view'} type="text" className="w-full p-2 border rounded-lg mt-1" 
                      value={formData.productDetail.process} onChange={e => setFormData({...formData, productDetail: {...formData.productDetail, process: e.target.value}})} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500">Mức rang (Roast)</label>
                    <input disabled={modalMode === 'view'} type="text" className="w-full p-2 border rounded-lg mt-1" 
                      value={formData.productDetail.roast} onChange={e => setFormData({...formData, productDetail: {...formData.productDetail, roast: e.target.value}})} />
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-xs font-bold text-gray-500">Hương vị (Flavor Notes)</label>
                    <input disabled={modalMode === 'view'} type="text" className="w-full p-2 border rounded-lg mt-1" 
                      value={formData.productDetail.flavorNotes} onChange={e => setFormData({...formData, productDetail: {...formData.productDetail, flavorNotes: e.target.value}})} />
                  </div>
                  
                  {/* MỨC ĐỘ 1-5 */}
                  {['acidityLevel', 'bitternessLevel', 'bodyLevel'].map((level) => (
                    <div key={level}>
                      <label className="text-xs font-bold text-gray-500 uppercase">{level.replace('Level','')}</label>
                      <input disabled={modalMode === 'view'} type="number" min="0" max="5" className="w-full p-2 border rounded-lg mt-1" 
                        value={formData.productDetail[level]} onChange={e => setFormData({...formData, productDetail: {...formData.productDetail, [level]: parseInt(e.target.value)}})} />
                    </div>
                  ))}

                  <div className="md:col-span-3">
                    <label className="text-xs font-bold text-gray-500">TraceabilityData (JSON vùng trồng)</label>
                    <textarea
                      disabled={modalMode === 'view'}
                      className="w-full p-2 border rounded-lg mt-1 font-mono text-xs"
                      rows="6"
                      placeholder='{"FarmingZone":{"Name":"Cầu Đất, Lâm Đồng","Altitude":"1600m"},"Farmer":{"Name":"HTX Cầu Đất"},"Certifications":[]}'
                      value={formData.productDetail.traceabilityData}
                      onChange={e => setFormData({...formData, productDetail: {...formData.productDetail, traceabilityData: e.target.value}})}
                    />
                  </div>
                </div>
              </div>

              {/* Nút hành động */}
              {modalMode !== 'view' && (
                <div className="flex justify-end gap-4 pt-6 border-t">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 border rounded-xl font-bold text-gray-600">Hủy</button>
                  <button type="submit" className="px-8 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-accent-1 transition-all">
                    {modalMode === 'add' ? 'Tạo sản phẩm' : 'Lưu cập nhật'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
