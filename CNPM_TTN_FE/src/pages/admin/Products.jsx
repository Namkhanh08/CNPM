import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import API from '../../services/api'; 

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Gọi API getAll có truyền phân trang và tìm kiếm lên backend
      const res = await API.getAll({
        page,
        pageSize,
        searchTerm: searchTerm.trim() || undefined,
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

      if (Array.isArray(productList)) {
        setProducts(productList);
        setTotalCount(
          pageData.totalCount ?? 
          pageData.TotalCount ?? 
          (res.data?.data?.totalCount ?? res.data?.data?.TotalCount ?? productList.length)
        );
      } else {
        console.error("API không trả về một mảng sản phẩm hợp lệ:", res);
        setProducts([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách sản phẩm:", err);
      setProducts([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Hàm xóa sản phẩm
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      try {
        const res = await API.deleteProduct(id); 
        const isSuccess = res.data?.success || res.data?.Success;
        if (isSuccess) {
          alert("Xóa thành công");
          fetchProducts();
        } else {
          alert(res.data?.message || res.data?.Message || "Không thể xóa sản phẩm này");
        }
      } catch (err) {
        console.error("Lỗi khi xóa sản phẩm:", err);
        alert("Không thể xóa sản phẩm này");
      }
    }
  };

  // Logic lọc tìm kiếm an toàn (nếu backend đã lọc thì filteredProducts chính là products, 
  // nhưng vẫn giữ để đề phòng hoặc lọc client-side khi search term chưa được gửi)
  const filteredProducts = products.filter(p => {
    const name = p?.name ?? p?.Name ?? "";
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

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
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1); // reset về trang 1 khi tìm kiếm
                }}
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
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-500 font-bold">
                    Không tìm thấy sản phẩm nào.
                  </td>
                </tr>
              ) : filteredProducts.map(prod => {
                const id = prod?.id ?? prod?.Id;
                const name = prod?.name ?? prod?.Name ?? 'N/A';
                const categoryName = prod?.category?.name ?? prod?.category?.Name ?? prod?.Category?.name ?? prod?.Category?.Name ?? 'N/A';
                const price = prod?.price ?? prod?.Price ?? 0;
                const stock = prod?.stock ?? prod?.Stock ?? 0;

                return (
                  <tr key={id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-500">{id}</td>
                    <td className="px-6 py-4 font-bold text-primary">{name}</td>
                    <td className="px-6 py-4">{categoryName}</td>
                    <td className="px-6 py-4 font-bold text-accent-1 text-right">
                      {price.toLocaleString('vi-VN')}₫
                    </td>
                    <td className="px-6 py-4 text-center font-bold">{stock}</td>
                    <td className="px-6 py-4 text-center">
                       <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                           stock > 10 ? 'bg-green-100 text-green-600' :
                           stock > 0 ? 'bg-orange-100 text-orange-600' :
                           'bg-red-100 text-red-600'
                         }`}>
                           {stock > 10 ? 'Còn hàng' : stock > 0 ? 'Sắp hết' : 'Hết hàng'}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center justify-center gap-2">
                         <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                           <Edit2 size={18} />
                         </button>
                         <button 
                          onClick={() => handleDelete(id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                         >
                           <Trash2 size={18} />
                         </button>
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 mt-5">
          <button
            disabled={page === 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white font-bold text-primary disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            Trước
          </button>
          <span className="px-4 py-2 font-bold text-primary text-sm">
            Trang {page}/{totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white font-bold text-primary disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}