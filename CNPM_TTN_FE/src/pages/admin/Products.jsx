import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import API from '../../services/api'; 

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await API.getAll();
      if (res.data) {
        setProducts(res.data);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách sản phẩm:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Hàm xóa sản phẩm
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      try {
        const res = await API.deleteProduct(id); 
        if (res.data.success) {
          alert("Xóa thành công");
          fetchProducts();
        }
      } catch  {
        alert("Không thể xóa sản phẩm này");
      }
    }
  };

  // Logic lọc tìm kiếm
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="font-montserrat font-bold text-2xl">Danh Mục Sản Phẩm</h1>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
             <input 
                type="text" 
                placeholder="Tìm tên sản phẩm..." 
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary font-nunito text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
             <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          <button className="bg-primary text-white px-4 py-2 rounded-xl font-bold font-nunito flex items-center gap-2 hover:bg-accent-1 transition-colors whitespace-nowrap">
            <Plus size={18} /> Thêm Sản Phẩm Mới
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-nunito text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Mã SP</th>
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
                <tr key={prod.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-500">{prod.id}</td>
                  <td className="px-6 py-4 font-bold text-primary">{prod.name}</td>
                  <td className="px-6 py-4">{prod.category?.name || "N/A"}</td>
                  <td className="px-6 py-4 font-bold text-accent-1 text-right">
                    {prod.price?.toLocaleString('vi-VN')}₫
                  </td>
                  <td className="px-6 py-4 text-center font-bold">{prod.stock}</td>
                  <td className="px-6 py-4 text-center">
                     <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                         prod.stock > 10 ? 'bg-green-100 text-green-600' :
                         prod.stock > 0 ? 'bg-orange-100 text-orange-600' :
                         'bg-red-100 text-red-600'
                       }`}>
                         {prod.stock > 10 ? 'Còn hàng' : prod.stock > 0 ? 'Sắp hết' : 'Hết hàng'}
                     </span>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center justify-center gap-2">
                       <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                         <Edit2 size={18} />
                       </button>
                       <button 
                        onClick={() => handleDelete(prod.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                       >
                         <Trash2 size={18} />
                       </button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}