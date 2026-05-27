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
  Search,
  Scale,
  Filter,
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
  const [searchQuery, setSearchQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");

  const currentUserName = localStorage.getItem("userName");

  const [formData, setFormData] = useState({
    productId: "",
    inventoryReceiptId: "",
    batchCode: "",
    roastLevel: "Medium",
    inputWeight: "",
    outputWeight: null,
    status: "Đang xử lý",
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

  const getFilterLabel = (filter) => {
    switch (filter) {
      case "Đang xử lý":
        return `Đang xử lý (${
          batches.filter((b) => b.status === "Đang xử lý").length
        })`;
      case "Hoàn thành":
        return `Hoàn thành (${
          batches.filter((b) => b.status === "Hoàn thành").length
        })`;
      case "Đã đóng gói":
        return `Đã đóng gói (${
          batches.filter((b) => b.status === "Đã đóng gói").length
        })`;
      default:
        return `Tất cả (${batches.length})`;
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [batchRes, prodRes, receiptRes] = await Promise.all([
        API.getBatchesDetail(),
        API.getProducts1(),
        API.getInventoryReceipts(),
      ]);
      setBatches(batchRes.data.data || []);
      setProducts(prodRes.data.data || []);
      setReceipts(
        (receiptRes.data.data || []).filter(
          (r) => r.remainingQuantity > 0 && !r.isExpired
        )
      );
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

    const submitData = {
      productId: parseInt(formData.productId),
      inventoryReceiptId: parseInt(formData.inventoryReceiptId),
      batchCode: formData.batchCode,
      roastLevel: formData.roastLevel,
      inputWeight: parseFloat(formData.inputWeight),
      outputWeight:
        formData.status === "Hoàn thành" || formData.status === "Đã đóng gói"
          ? parseFloat(formData.outputWeight)
          : null,
      status: formData.status,
    };

    try {
      await API.createBatchDetail(submitData);
      setIsModalOpen(false);
      alert("Ghi nhận mẻ rang mới thành công!");
      loadData();

      setFormData({
        productId: "",
        inventoryReceiptId: "",
        batchCode: "",
        roastLevel: "Medium",
        inputWeight: "",
        outputWeight: null,
        status: "Đang xử lý",
      });
    } catch (err) {
      console.error(err);
      alert(
        "Lỗi tạo mẻ rang: " +
          (err.response?.data?.message ||
            err.response?.data ||
            "Kiểm tra lại dữ liệu!")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (batchId, newStatus) => {
    const currentBatch = batches.find((b) => b.id === batchId);
    if (!currentBatch) return;

    if (currentBatch.status === "Hoàn thành" && newStatus === "Đang xử lý") {
      alert("Mẻ rang đã hoàn thành không thể quay về trạng thái Đang xử lý!");
      return;
    }

    let outputWeightInput = currentBatch.outputWeight;

    if (newStatus === "Hoàn thành" || newStatus === "Đã đóng gói") {
      if (!outputWeightInput || outputWeightInput <= 0) {
        const promptValue = prompt(
          `Mẻ rang chưa có khối lượng đầu ra thực tế.\nNhập khối lượng thành phẩm đầu ra thực tế (kg):`
        );

        if (promptValue === null) return;

        outputWeightInput = parseFloat(promptValue);
        if (isNaN(outputWeightInput) || outputWeightInput <= 0) {
          alert("Khối lượng thành phẩm nhập vào không hợp lệ!");
          return;
        }
      }
    } else if (newStatus === "Đang xử lý") {
      outputWeightInput = null;
    }

    setUpdatingId(batchId);
    try {
      await API.updateBatchStatus(batchId, {
        status: newStatus,
        outputWeight: outputWeightInput,
      });
      alert(
        `Chuyển trạng thái sang "${newStatus}" và đồng bộ dữ liệu thành công!`
      );
      loadData();
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
      alert(
        "Lỗi cập nhật: " + (err.response?.data || "Không thể đổi trạng thái")
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredBatches = batches.filter((batch) => {
    const matchesSearch =
      !searchQuery.trim() ||
      batch.batchCode?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || batch.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="animate-fade-in p-4 md:p-6 w-full max-w-full box-border overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="font-montserrat font-bold text-2xl text-primary flex items-center gap-2">
            <Coffee className="text-accent-1 shrink-0" /> Quản Lý Lô Rang Cà Phê
          </h1>
          <p className="font-nunito text-primary/60 text-sm mt-1">
            Theo dõi tiêu thụ hạt thô
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg transition-all active:scale-95"
        >
          <Plus size={18} /> Ghi Lô Rang Mới
        </button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 overflow-visible">
        <div className="relative flex items-center w-full sm:max-w-xs md:max-w-md">
          <Search
            size={18}
            className="absolute left-4 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã lô rang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full font-nunito pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none text-sm focus:ring-2 ring-accent-1 transition-all"
          />
          {searchQuery && (
            <X
              size={16}
              className="absolute right-4 text-gray-400 hover:text-red-500 cursor-pointer"
              onClick={() => setSearchQuery("")}
            />
          )}
        </div>

        <div className="relative inline-block text-left group font-nunito text-sm w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl font-bold text-gray-700 cursor-pointer shadow-sm hover:bg-gray-50 transition-colors justify-between sm:justify-start">
            <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
              <Filter size={14} className="text-gray-400" /> Trạng thái:
            </span>
            <span className="text-primary text-xs font-bold bg-primary/5 px-2 py-0.5 rounded-md">
              {getFilterLabel(statusFilter)}
            </span>
          </div>

          <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-40 opacity-0 invisible scale-95 -translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:scale-100 group-hover:translate-y-0 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
            <button
              type="button"
              onClick={() => setStatusFilter("All")}
              className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${
                statusFilter === "All"
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Tất cả ({batches.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("Đang xử lý")}
              className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${
                statusFilter === "Đang xử lý"
                  ? "bg-sky-50 text-sky-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Đang xử lý (
              {batches.filter((b) => b.status === "Đang xử lý").length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("Hoàn thành")}
              className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${
                statusFilter === "Hoàn thành"
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Hoàn thành (
              {batches.filter((b) => b.status === "Hoàn thành").length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("Đã đóng gói")}
              className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${
                statusFilter === "Đã đóng gói"
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Đã đóng gói (
              {batches.filter((b) => b.status === "Đã đóng gói").length})
            </button>
          </div>
        </div>
      </div>

      {/* Modal Thêm Mới */}
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
                    <Layers size={12} /> Lô hạt thô đầu vào
                  </label>
                  <select
                    required
                    className="w-full mt-1 bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none focus:ring-2 ring-accent-1"
                    value={formData.inventoryReceiptId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        inventoryReceiptId: e.target.value,
                      })
                    }
                  >
                    <option value="">-- Chọn lô nguyên liệu thô --</option>
                    {receipts.map((r) => (
                      <option key={r.id} value={r.id}>
                        Lô {r.id} - {r.rawMaterialName} (Còn:{" "}
                        {r.remainingQuantity}kg)
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
                    <option value="">-- Chọn sản phẩm đóng gói --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Tồn: {p.stock}kg)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    Mã Lô Rang
                  </label>
                  <input
                    placeholder="VD: BR-001"
                    required
                    value={formData.batchCode}
                    className="w-full mt-1 bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none focus:ring-2 ring-accent-1"
                    onChange={(e) =>
                      setFormData({ ...formData, batchCode: e.target.value })
                    }
                  />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    Khối lượng mang rang (Kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="VD: 12"
                    required
                    value={formData.inputWeight}
                    className="w-full mt-1 bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none focus:ring-2 ring-accent-1"
                    onChange={(e) =>
                      setFormData({ ...formData, inputWeight: e.target.value })
                    }
                  />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    Mức Rang
                  </label>
                  <select
                    className="w-full mt-1 bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none focus:ring-2 ring-accent-1"
                    value={formData.roastLevel}
                    onChange={(e) =>
                      setFormData({ ...formData, roastLevel: e.target.value })
                    }
                  >
                    <option value="Light">Light</option>
                    <option value="Medium">Medium</option>
                    <option value="Dark">Dark</option>
                  </select>
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    Trạng Thái
                  </label>
                  <select
                    className="w-full mt-1 bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none focus:ring-2 ring-accent-1"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value,
                        outputWeight:
                          e.target.value === "Đang xử lý"
                            ? null
                            : formData.outputWeight,
                      })
                    }
                  >
                    <option value="Đang xử lý">Đang xử lý</option>
                    <option value="Hoàn thành">Hoàn thành</option>
                    <option value="Đã đóng gói">Đã đóng gói</option>
                  </select>
                </div>

                {formData.status !== "Đang xử lý" && (
                  <div className="col-span-2 animate-fade-in">
                    <label className="text-[10px] font-black text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                      <Scale size={12} /> Khối lượng đầu ra thực tế (Kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Nhập khối lượng thu được..."
                      required
                      value={formData.outputWeight || ""}
                      className="w-full mt-1 bg-emerald-50/30 border border-emerald-100 rounded-xl p-3 outline-none text-emerald-700 font-bold"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          outputWeight: e.target.value,
                        })
                      }
                    />
                  </div>
                )}

                <div className="col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    Người thực hiện
                  </label>
                  <div className="mt-1 flex items-center gap-3 bg-gray-100 border border-gray-200 rounded-xl p-3 text-gray-600 font-bold select-none">
                    <User size={18} className="text-primary/50" />
                    <span>{currentUserName || "Hệ thống"}</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-accent-1 transition-all"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Save size={20} />
                )}
                Lưu mẻ rang
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bảng Dữ Liệu */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-full">
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left font-nunito text-sm min-w-[1100px]">
              <thead className="bg-gray-50 border-y border-gray-100 font-bold text-gray-600">
                <tr>
                  <th className="px-4 py-4 w-[110px]">Mã Lô</th>
                  <th className="px-4 py-4 w-[110px]">Ngày Rang</th>
                  <th className="px-4 py-4">Hạt thô đầu vào</th>
                  <th className="px-4 py-4">Thành phẩm đầu ra</th>
                  <th className="px-4 py-4 text-center w-[100px]">Mức Rang</th>
                  <th className="px-4 py-4 text-right w-[110px]">Khối Lượng</th>
                  <th className="px-4 py-4 text-center w-[90px]">Tỷ Lệ Đạt</th>
                  <th className="px-4 py-4 text-center w-[130px]">
                    Người Rang
                  </th>
                  <th className="px-4 py-4 text-center w-[140px]">
                    Trạng Thái
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBatches.length > 0 ? (
                  filteredBatches.map((b) => (
                    <tr
                      key={b.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-4 py-4 font-bold text-primary">
                        {b.batchCode || `#${b.id}`}
                      </td>
                      <td className="px-4 py-4 text-gray-500">
                        {new Date(b.date).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-4 py-4 text-gray-600 italic max-w-[250px] break-words">
                        {b.rawMaterialName}
                      </td>
                      <td className="px-4 py-4 font-semibold text-gray-700 max-w-[220px] break-words">
                        {b.productName}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${getRoastLevelColor(
                            b.roastLevel
                          )}`}
                        >
                          {b.roastLevel}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex flex-col text-xs">
                          <span>
                            Vào:{" "}
                            <strong className="text-primary">
                              {b.inputWeight || b.weight} kg
                            </strong>
                          </span>
                          <span className="text-emerald-600 font-semibold mt-0.5">
                            Ra:{" "}
                            {b.outputWeight !== null && b.outputWeight > 0
                              ? `${b.outputWeight} kg`
                              : "---"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {b.recoveryRate > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-100">
                            {b.recoveryRate}%
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">---</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center text-gray-600 text-xs">
                        {b.roasterName || "Hệ thống"}
                      </td>
                      <td className="px-4 py-4">
                        {updatingId === b.id ? (
                          <div className="flex items-center justify-center text-xs text-gray-400">
                            <Loader2 size={14} className="animate-spin" />
                          </div>
                        ) : b.status === "Đã đóng gói" ? (
                          <div className="text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-[11px] font-bold border ${getStatusColor(
                                b.status
                              )}`}
                            >
                              {b.status}
                            </span>
                          </div>
                        ) : (
                          <div className="relative w-full flex justify-center">
                            <select
                              value={b.status}
                              onChange={(e) =>
                                handleStatusChange(b.id, e.target.value)
                              }
                              className={`w-full max-w-[130px] pl-3 pr-7 py-1 rounded-full text-[11px] font-bold border cursor-pointer appearance-none ${getStatusColor(
                                b.status
                              )}`}
                            >
                              {b.status !== "Hoàn thành" && (
                                <option value="Đang xử lý">Đang xử lý</option>
                              )}

                              <option value="Hoàn thành">Hoàn thành</option>
                              <option value="Đã đóng gói">Đã đóng gói ✔</option>
                            </select>
                            <Edit2
                              size={10}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                            />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="9"
                      className="px-4 py-10 text-center text-gray-400 italic"
                    >
                      Không tìm thấy mẻ rang nào thuộc bộ lọc này.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
