import React, { useState, useEffect } from "react";
import {
  Plus,
  Loader2,
  Coffee,
  X,
  Save,
  User,
  Layers,
  Edit2,
} from "lucide-react";
import API from "../../services/api";

export default function Batches() {
  const [batches, setBatches] = useState([]);
  const [products, setProducts] = useState([]);
  const [receipts, setReceipts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const currentUserName = localStorage.getItem("userName");

  const [formData, setFormData] = useState({
    productId: "", 
    inventoryReceiptId: "",
    batchCode: "",
    roastLevel: "Medium",
    inputWeight: "",
    status: "Hoàn thành",
  });

  const getRoastLevelColor = (level) => {
    switch (level) {
      case "Light":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "Medium":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Dark":
        return "bg-zinc-800 text-zinc-100 border-zinc-900";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Đang xử lý":
        return "bg-sky-100 text-sky-700 border-sky-200";
      case "Hoàn thành":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Đã đóng gói":
        return "bg-indigo-100 text-indigo-700 border-indigo-200";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [batchRes, prodRes, receiptRes] = await Promise.all([
        API.getBatchesDetail(),
        API.getProducts(),
        API.getInventoryReceipts(),
      ]);
      setBatches(batchRes.data.data || []);
      setProducts(prodRes.data.data || []);

      const activeReceipts = (receiptRes.data.data || []).filter(
        (r) => r.remainingQuantity > 0 && !r.isExpired
      );
      setReceipts(activeReceipts);
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await API.createBatchDetail({
        productId: parseInt(formData.productId),
        inventoryReceiptId: parseInt(formData.inventoryReceiptId),
        batchCode: formData.batchCode,
        roastLevel: formData.roastLevel,
        inputWeight: parseFloat(formData.inputWeight),
        status: formData.status,
      });

      setIsModalOpen(false);
      alert("Ghi nhận mẻ rang mới thành công!");
      loadData();
      setFormData({
        productId: "",
        inventoryReceiptId: "",
        batchCode: "",
        roastLevel: "Medium",
        inputWeight: "",
        status: "Hoàn thành",
      });
    } catch (err) {
      console.error("Lỗi:", err);
      alert(
        "Lỗi tạo mẻ rang: " + (err.response?.data || "Vui lòng kiểm tra lại hệ thống!")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (batchId, newStatus) => {
    setUpdatingId(batchId);
    try {
      await API.updateBatchStatus(batchId, { status: newStatus });
      alert("Cập nhật trạng thái và đồng bộ dữ liệu thành công!");
      loadData();
    } catch (err) {
      console.error(err);
      alert("Lỗi cập nhật: " + (err.response?.data || "Không thể đổi trạng thái"));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="animate-fade-in p-4 md:p-6 w-full max-w-full box-border overflow-hidden">
   
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="max-w-full md:max-w-[70%]">
          <h1 className="font-montserrat font-bold text-2xl text-primary flex items-center gap-2">
            <Coffee className="text-accent-1 shrink-0" /> Quản Lý Lô Rang Cà Phê
          </h1>
          <p className="font-nunito text-primary/60 text-sm mt-1 whitespace-normal break-words">
            Theo dõi tiêu thụ hạt thô. Kho thành phẩm chỉ cộng dồn khi mẻ rang chuyển sang trạng thái "Đã đóng gói".
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg transition-all active:scale-95 whitespace-nowrap shrink-0"
        >
          <Plus size={18} /> Ghi Lô Rang Mới
        </button>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="font-montserrat font-bold text-xl flex items-center gap-2 text-primary">
                <Plus className="text-accent-1" /> Ghi Mẻ Rang Mới
              </h2>
              <X
                className="cursor-pointer text-gray-400 hover:text-red-500"
                onClick={() => setIsModalOpen(false)}
              />
            </div>

            <form
              onSubmit={handleCreateBatch}
              className="p-6 space-y-4 font-nunito max-h-[80vh] overflow-y-auto"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <Layers size={12} /> Lô hạt thô tiêu thụ (Đầu vào)
                  </label>
                  <select
                    required
                    className="w-full mt-1 bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none focus:ring-2 ring-accent-1"
                    value={formData.inventoryReceiptId}
                    onChange={(e) =>
                      setFormData({ ...formData, inventoryReceiptId: e.target.value })
                    }
                  >
                    <option value="">-- Chọn lô nguyên liệu thô còn trống ({receipts.length}) --</option>
                    {receipts.map((r) => (
                      <option key={r.id} value={r.id}>
                        Lô {r.id} - {r.rawMaterialName} (Còn: {r.remainingQuantity}kg - NCC: {r.supplier})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <Coffee size={12} /> Sản phẩm phân phối đóng gói 
                  </label>
                  <select
                    required
                    className="w-full mt-1 bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none focus:ring-2 ring-accent-1"
                    value={formData.productId}
                    onChange={(e) =>
                      setFormData({ ...formData, productId: e.target.value })
                    }
                  >
                    <option value="">-- Chọn sản phẩm đóng gói bán lẻ ({products.length}) --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Tồn hiện tại: {p.stock}kg)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Mã Lô Rang</label>
                  <input
                    placeholder="VD: BATCH-2026-01"
                    required
                    value={formData.batchCode}
                    className="w-full mt-1 bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none focus:ring-2 ring-accent-1"
                    onChange={(e) => setFormData({ ...formData, batchCode: e.target.value })}
                  />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Khối lượng mang rang (Kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="VD: 10"
                    required
                    value={formData.inputWeight}
                    className="w-full mt-1 bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none focus:ring-2 ring-accent-1"
                    onChange={(e) => setFormData({ ...formData, inputWeight: e.target.value })}
                  />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Mức Rang</label>
                  <select
                    className="w-full mt-1 bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none focus:ring-2 ring-accent-1"
                    value={formData.roastLevel}
                    onChange={(e) => setFormData({ ...formData, roastLevel: e.target.value })}
                  >
                    <option value="Light">Light</option>
                    <option value="Medium">Medium</option>
                    <option value="Dark">Dark</option>
                  </select>
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Trạng Thái Ban Đầu</label>
                  <select
                    className="w-full mt-1 bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none focus:ring-2 ring-accent-1"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Đang xử lý">Đang xử lý</option>
                    <option value="Hoàn thành">Hoàn thành</option>
                    <option value="Đã đóng gói">Đã đóng gói</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Người thực hiện</label>
                  <div className="mt-1 flex items-center gap-3 bg-gray-100 border border-gray-200 rounded-xl p-3 text-gray-600 select-none">
                    <User size={18} className="text-primary/50" />
                    <span className="font-bold">{currentUserName || "Hệ thống"}</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-accent-1 transition-all mt-4"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={20} />} 
                Lưu mẻ rang
              </button>
            </form>
          </div>
        </div>
      )}

    
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-full">
        {loading ? (
          <div className="py-20 flex flex-col items-center">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : (
          <div className="w-full overflow-hidden">
            <table className="w-full text-left font-nunito text-sm table-fixed">
              <thead className="bg-gray-50 border-y border-gray-100 font-bold text-gray-600">
                <tr>
                  <th className="px-3 py-4 w-[10%]">Mã Lô</th>
                  <th className="px-3 py-4 w-[12%]">Ngày Rang</th>
                  <th className="px-3 py-4 w-[20%]">Hạt thô đầu vào</th>
                  <th className="px-3 py-4 w-[18%]">Thành phẩm đầu ra</th>
                  <th className="px-3 py-4 w-[10%]">Mức Rang</th>
                  <th className="px-3 py-4 text-right w-[10%]">K.Lượng</th>
                  <th className="px-3 py-4 text-center w-[10%]">Người Rang</th>
                  <th className="px-3 py-4 text-center w-[10%]">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {batches.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 py-4 font-bold text-primary break-all whitespace-normal">
                      {b.batchCode || `#${b.id}`}
                    </td>
                    <td className="px-3 py-4 text-gray-500 whitespace-normal">
                      {new Date(b.date).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-3 py-4 text-gray-600 italic whitespace-normal break-words" title={b.rawMaterialName}>
                      {b.rawMaterialName}
                    </td>
                    <td className="px-3 py-4 font-semibold text-gray-700 whitespace-normal break-words" title={b.productName}>
                      {b.productName}
                    </td>
                    <td className="px-3 py-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border inline-block ${getRoastLevelColor(b.roastLevel)}`}>
                        {b.roastLevel}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-right font-bold text-primary whitespace-nowrap">
                      {b.weight} kg
                    </td>
                
                    <td className="px-3 py-4 text-center whitespace-normal break-words text-gray-600 font-medium text-xs">
                      {b.roasterName || "Hệ thống"}
                    </td>
                    <td className="px-3 py-4">
                      {updatingId === b.id ? (
                        <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                          <Loader2 size={12} className="animate-spin" />
                        </div>
                      ) : b.status === "Đã đóng gói" ? (
                        <div className="text-center">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold border block truncate ${getStatusColor(b.status)}`}>
                            {b.status}
                          </span>
                        </div>
                      ) : (
                        <div className="relative w-full flex justify-center">
                          <select
                            value={b.status}
                            onChange={(e) => handleStatusChange(b.id, e.target.value)}
                            className={`w-full max-w-[100px] pl-1 pr-4 py-0.5 rounded-full text-[10px] font-bold border cursor-pointer focus:outline-none appearance-none ${getStatusColor(b.status)}`}
                          >
                            <option value="Đang xử lý">Đang xử lý</option>
                            <option value="Hoàn thành">Hoàn thành</option>
                            <option value="Đã đóng gói">Đã đóng gói ✔</option>
                          </select>
                          <Edit2 size={8} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      )}
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