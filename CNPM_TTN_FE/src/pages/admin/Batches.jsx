import React, { useState, useEffect } from "react";
import { Plus, History, Loader2, Coffee, X, Save, User } from "lucide-react";
import API from "../../services/api";

export default function Batches() {
  const [batches, setBatches] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const currentUserName = localStorage.getItem("userName");

  
  const [formData, setFormData] = useState({
    productId: "",
    batchCode: "",
    roastLevel: "Medium",
    inputWeight: "",
    status: "Hoàn thành",
  });

  const getRoastLevelColor = (level) => {
    switch (level) {
      case "Light": return "bg-amber-100 text-amber-700 border-amber-200";
      case "Medium": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Dark": return "bg-zinc-800 text-zinc-100 border-zinc-900";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Đang xử lý": return "bg-sky-100 text-sky-700 border-sky-200";
      case "Hoàn thành": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Đã đóng gói": return "bg-indigo-100 text-indigo-700 border-indigo-200";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [batchRes, prodRes] = await Promise.all([
        API.getBatchesDetail(),
        API.getProducts(),
      ]);
      setBatches(batchRes.data.data || []);
      const allProducts = prodRes.data.data || prodRes.data || [];
      const greenBeans = allProducts.filter((p) => {
        const type = (p.type || p.category || "").toLowerCase();
        return type.includes("green") || type.includes("nhân") || type === "";
      });
      setProducts(greenBeans);
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      
      await API.createBatchDetail(
        parseInt(formData.productId),
        formData.batchCode,
        formData.roastLevel,
        parseFloat(formData.inputWeight),
        formData.status
      );
  
      setIsModalOpen(false);
      alert("Tạo mẻ rang thành công!");
      loadData();
      
      
      setFormData({ productId: "", batchCode: "", roastLevel: "Medium", inputWeight: "", status: "Hoàn thành" });
  
    } catch (err) {
      console.error("Lỗi:", err);
      alert("Lỗi tạo mẻ rang: " + (err.response?.data || "Vui lòng thử lại"));
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="animate-fade-in p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="font-montserrat font-bold text-2xl text-primary flex items-center gap-2">
            <Coffee className="text-accent-1" /> Quản Lý Lô Rang
          </h1>
          <p className="font-nunito text-primary/60 text-sm">Theo dõi nhật ký sản xuất và lịch sử mẻ rang.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg transition-all active:scale-95 whitespace-nowrap"
        >
          <Plus size={18} /> Ghi Lô Rang Mới
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="font-montserrat font-bold text-xl flex items-center gap-2 text-primary">
                <Plus className="text-accent-1" /> Ghi Mẻ Rang Mới
              </h2>
              <X className="cursor-pointer text-gray-400 hover:text-red-500" onClick={() => setIsModalOpen(false)} />
            </div>

            <form onSubmit={handleCreateBatch} className="p-6 space-y-4 font-nunito max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Sản phẩm nhân xanh</label>
                  <select required className="w-full mt-1 bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none focus:ring-2 ring-accent-1"
                    value={formData.productId} onChange={(e) => setFormData({ ...formData, productId: e.target.value })}>
                    <option value="">-- Chọn cà phê ({products.length}) --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} - Tồn: {p.stock}kg</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Mã Lô</label>
                  <input placeholder="VD: BATCH-001" required value={formData.batchCode} className="w-full mt-1 bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none focus:ring-2 ring-accent-1"
                    onChange={(e) => setFormData({ ...formData, batchCode: e.target.value })} />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Khối lượng (Kg)</label>
                  <input type="number" step="0.1" required value={formData.inputWeight} className="w-full mt-1 bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none focus:ring-2 ring-accent-1"
                    onChange={(e) => setFormData({ ...formData, inputWeight: e.target.value })} />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Mức Rang</label>
                  <select className="w-full mt-1 bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none focus:ring-2 ring-accent-1"
                    value={formData.roastLevel} onChange={(e) => setFormData({ ...formData, roastLevel: e.target.value })}>
                    <option value="Light">Light</option>
                    <option value="Medium">Medium</option>
                    <option value="Dark">Dark</option>
                  </select>
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Trạng Thái</label>
                  <select className="w-full mt-1 bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none focus:ring-2 ring-accent-1"
                    value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                    <option value="Đang xử lý">Đang xử lý</option>
                    <option value="Hoàn thành">Hoàn thành</option>
                    <option value="Đã đóng gói">Đã đóng gói</option>
                  </select>
                </div>

           
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Người thực hiện</label>
                  <div className="mt-1 flex items-center gap-3 bg-gray-100 border border-gray-200 rounded-xl p-3 text-gray-600 select-none">
                    <User size={18} className="text-primary/50" />
                    <span className="font-bold">{currentUserName}</span>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-accent-1 transition-all mt-4">
                {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={20} />} Lưu mẻ rang
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bảng dữ liệu */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center"><Loader2 className="animate-spin text-primary" size={40} /></div>
        ) : (
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left font-nunito text-sm min-w-[900px]">
              <thead className="bg-gray-50 border-y border-gray-100 font-bold text-gray-600">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">Mã Lô</th>
                  <th className="px-6 py-4 whitespace-nowrap">Ngày Rang</th>
                  <th className="px-6 py-4 whitespace-nowrap">Sản Phẩm</th>
                  <th className="px-6 py-4 whitespace-nowrap">Mức Rang</th>
                  <th className="px-6 py-4 whitespace-nowrap text-right">Khối Lượng</th>
                  <th className="px-6 py-4 whitespace-nowrap text-center">Người Rang</th>
                  <th className="px-6 py-4 whitespace-nowrap">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {batches.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-primary whitespace-nowrap">{b.batchCode || `#${b.id}`}</td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{new Date(b.date || b.roastDate).toLocaleDateString("vi-VN")}</td>
                    <td className="px-6 py-4 font-semibold text-gray-700">{b.productName}</td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded text-[10px] font-black uppercase border ${getRoastLevelColor(b.roastLevel)}`}>
                        {b.roastLevel}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right font-bold text-primary whitespace-nowrap">{b.weight || b.inputWeight} kg</td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5 text-gray-600">
                        <User size={14} className="text-gray-400" />
                        <span className="font-medium">{b.roasterName || b.roaster || "N/A"}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${getStatusColor(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}