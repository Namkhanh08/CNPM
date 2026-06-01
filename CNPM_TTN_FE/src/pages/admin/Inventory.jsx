import React, { useState, useEffect } from "react";
import {
  Archive,
  Plus,
  X,
  Loader2,
  History,
  User,
  Calendar,
  Truck,
  ArrowRight,
} from "lucide-react";
import API from "../../services/api";

export default function Inventory() {
  const [rawMaterials, setRawMaterials] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [restockForm, setRestockForm] = useState(null);

  const [searchReceipt, setSearchReceipt] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [searchLog, setSearchLog] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const [receiptPage, setReceiptPage] = useState(1);
  const [receiptTotalPages, setReceiptTotalPages] = useState(1);

  const [logPage, setLogPage] = useState(1);
  const [logTotalPages, setLogTotalPages] = useState(1);

  const [firstLoading, setFirstLoading] = useState(true);

  const [debouncedReceipt, setDebouncedReceipt] = useState("");
  const [debouncedLog, setDebouncedLog] = useState("");

  const [newMaterialForm, setNewMaterialForm] = useState({
    name: "",
    unit: "kg",
    categoryId: "",
  });

  const [formData, setFormData] = useState({
    supplier: "",
    quantity: "",
    importDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedReceipt(searchReceipt);
      setReceiptPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchReceipt]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLog(searchLog);
      setLogPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchLog]);
  const fetchData = React.useCallback(async () => {
    try {
      const [matRes, receiptRes, logRes, categoryRes] = await Promise.all([
        API.getRawMaterials(),

        API.getInventoryReceipts(
          receiptPage,
          10,
          debouncedReceipt,
          statusFilter
        ),

        API.getLogs(logPage, 10, debouncedLog, actionFilter),
        API.getCategories(),
      ]);

      setRawMaterials(matRes.data.data || []);
      setCategories(categoryRes.data || []);
      setReceipts(receiptRes.data.data || []);
      setReceiptTotalPages(receiptRes.data.totalPages);

      setLogs(logRes.data.data || []);
      setLogTotalPages(logRes.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setFirstLoading(false);
    }
  }, [
    receiptPage,
    logPage,
    debouncedReceipt,
    statusFilter,
    debouncedLog,
    actionFilter,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateRawMaterial = async (e) => {
    e.preventDefault();

    if (!newMaterialForm.name || !newMaterialForm.categoryId) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      await API.createRawMaterial({
        name: newMaterialForm.name,
        unit: newMaterialForm.unit,
        categoryId: parseInt(newMaterialForm.categoryId),
      });

      alert("Tạo nguyên liệu thành công!");

      setNewMaterialForm({
        name: "",
        unit: "kg",
        categoryId: "",
      });

      fetchData();
    } catch (err) {
      alert(err.response?.data || "Không thể tạo nguyên liệu mới");
    }
  };

  const handleRestockSubmit = async (e, materialId) => {
    e.preventDefault();
    if (!formData.supplier || !formData.quantity || !formData.expiryDate) {
      alert("Vui lòng điền đầy đủ thông tin lô nhập!");
      return;
    }

    try {
      await API.importRawMaterial({
        rawMaterialId: parseInt(materialId),
        supplier: formData.supplier,
        quantity: parseFloat(formData.quantity),
        importDate: new Date(formData.importDate).toISOString(),
        expiryDate: new Date(formData.expiryDate).toISOString(),
      });

      setRestockForm(null);
      setFormData({
        supplier: "",
        quantity: "",
        importDate: new Date().toISOString().split("T")[0],
        expiryDate: "",
      });
      alert("Nhập kho nguyên liệu thành công!");
      fetchData();
    } catch (err) {
      alert(
        "Lỗi nhập kho: " +
          (err.response?.data || "Vui lòng kiểm tra lại thông tin.")
      );
    }
  };

  if (firstLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="animate-spin text-primary mb-2" size={40} />
        <p className="text-gray-500 font-nunito">
          Đang tải dữ liệu hệ thống...
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in p-4 md:p-6 space-y-8">
      <div>
        <h1 className="font-montserrat font-bold text-2xl">
          Quản Lý Kho Nguyên Liệu
        </h1>
        <p className="font-nunito text-primary/60 text-sm mt-1">
          Quản lý danh mục hạt thô và theo dõi thời hạn sử dụng các lô hàng
          nhập.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-bold text-lg mb-4">Tạo nguyên liệu thô mới</h2>

        <form
          onSubmit={handleCreateRawMaterial}
          className="grid grid-cols-1 md:grid-cols-4 gap-3"
        >
          <input
            type="text"
            placeholder="Tên nguyên liệu"
            value={newMaterialForm.name}
            onChange={(e) =>
              setNewMaterialForm({
                ...newMaterialForm,
                name: e.target.value,
              })
            }
            className="px-4 py-2 border rounded-xl"
          />

          <input
            type="text"
            placeholder="Đơn vị"
            value={newMaterialForm.unit}
            onChange={(e) =>
              setNewMaterialForm({
                ...newMaterialForm,
                unit: e.target.value,
              })
            }
            className="px-4 py-2 border rounded-xl"
          />

          <select
            value={newMaterialForm.categoryId}
            onChange={(e) =>
              setNewMaterialForm({
                ...newMaterialForm,
                categoryId: e.target.value,
              })
            }
            className="px-4 py-2 border rounded-xl"
          >
            <option value="">Chọn danh mục</option>

            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="bg-primary text-white rounded-xl px-4 py-2 font-bold"
          >
            Tạo mới
          </button>
        </form>
      </div>

      {/* Danh sách danh mục nguyên liệu thô */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-montserrat font-bold text-lg mb-6 flex items-center gap-2">
          <Archive size={20} className="text-primary" /> Nguyên liệu thô hiện có
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 font-nunito">
          {rawMaterials.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between pb-4 border-b border-gray-100 last:border-0 gap-2"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold text-primary text-base">
                    {item.name}
                  </div>
                  <div className="text-xs text-gray-400">
                    Đơn vị tính: {item.unit || "kg"}
                  </div>
                </div>
                <div>
                  {restockForm !== item.id && (
                    <button
                      onClick={() => setRestockForm(item.id)}
                      className="text-xs text-accent-1 font-bold flex items-center hover:bg-accent-1/10 px-3 py-1.5 rounded-xl border border-accent-1/20"
                    >
                      <Plus size={12} className="mr-1" /> Nhập lô mới
                    </button>
                  )}
                </div>
              </div>

              {/* Form nhập lô */}
              {restockForm === item.id && (
                <form
                  onSubmit={(e) => handleRestockSubmit(e, item.id)}
                  className="bg-gray-50 p-4 rounded-xl space-y-3 border border-gray-100 mt-2 animate-fade-in"
                >
                  <div className="flex justify-between items-center border-b pb-2 mb-1">
                    <span className="text-xs font-bold text-primary flex items-center gap-1">
                      <Truck size={14} /> Chi tiết lô nhập
                    </span>
                    <X
                      size={16}
                      className="cursor-pointer text-gray-400 hover:text-red-500"
                      onClick={() => setRestockForm(null)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="col-span-2">
                      <input
                        required
                        type="text"
                        placeholder="Nhà cung cấp (VD: Hộ ông A - Đắk Lắk)"
                        value={formData.supplier}
                        onChange={(e) =>
                          setFormData({ ...formData, supplier: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-lg bg-white outline-none"
                      />
                    </div>
                    <div>
                      <input
                        required
                        type="number"
                        step="0.1"
                        placeholder="Khối lượng (kg)"
                        value={formData.quantity}
                        onChange={(e) =>
                          setFormData({ ...formData, quantity: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-lg bg-white outline-none"
                      />
                    </div>
                    <div>
                      <input
                        required
                        type="date"
                        title="Hạn sử dụng"
                        value={formData.expiryDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            expiryDate: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg bg-white outline-none"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-primary text-white text-xs font-bold py-2 rounded-lg hover:bg-opacity-90 transition-all flex items-center justify-center gap-1"
                  >
                    <Plus size={14} /> Xác nhận nhập kho
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bảng quản lý Lô hàng thực tế trong kho */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50 space-y-4">
          <h2 className="font-montserrat font-bold text-lg flex items-center gap-2">
            <History size={20} className="text-primary" />
            Trạng thái các lô hạt thô nhập kho
          </h2>

          <div className="flex flex-col md:flex-row gap-3">
            <input
              key="receipt-search"
              type="text"
              placeholder="Tìm theo loại hạt hoặc nhà cung cấp..."
              value={searchReceipt}
              onChange={(e) => setSearchReceipt(e.target.value)}
              className="px-4 py-2 border rounded-xl text-sm outline-none w-full md:w-80"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-xl text-sm outline-none"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="safe">An toàn</option>
              <option value="warning">Gần hạn</option>
              <option value="expired">Hết hạn</option>
              <option value="empty">Hết hàng</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-nunito text-sm min-w-[800px]">
            <thead className="bg-gray-50 text-gray-600 font-bold border-b">
              <tr>
                <th className="px-6 py-4">Mã lô</th>
                <th className="px-6 py-4">Loại hạt</th>
                <th className="px-6 py-4">Nhà cung cấp</th>
                <th className="px-6 py-4 text-right">Ban đầu</th>
                <th className="px-6 py-4 text-right">Tồn hiện tại</th>
                <th className="px-6 py-4">Hạn sử dụng</th>
                <th className="px-6 py-4 text-center">Tình trạng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {receipts.length > 0 ? (
                receipts.map((receipt) => {
                  const expiryDate = new Date(receipt.expiryDate);
                  const today = new Date();
                  const diffTime = expiryDate - today;
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                  return (
                    <tr
                      key={receipt.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-gray-500">
                        {receipt.id}
                      </td>
                      <td className="px-6 py-4 font-bold text-primary">
                        {receipt.rawMaterialName ||
                          receipt.rawMaterial?.name ||
                          "Hạt thô"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {receipt.supplier}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {receipt.quantity} kg
                      </td>
                      <td className="px-6 py-4 text-right font-black text-primary">
                        {receipt.remainingQuantity} kg
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(receipt.expiryDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {receipt.remainingQuantity === 0 ? (
                          <span className="px-2 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-400">
                            Hết hàng
                          </span>
                        ) : diffDays <= 0 ? (
                          <span className="px-2 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-700 animate-pulse">
                            Hết hạn sử dụng
                          </span>
                        ) : diffDays <= 7 ? (
                          <span className="px-2 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700">
                            Cảnh báo: Gần hạn
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-[11px] font-bold bg-green-100 text-green-700">
                            An toàn
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-10 text-gray-400 italic"
                  >
                    Chưa có lô hàng nguyên liệu nào được nhập
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-center items-center gap-2 py-4">
        <button
          disabled={receiptPage === 1}
          onClick={() => setReceiptPage((prev) => prev - 1)}
          className="px-3 py-1 border rounded-lg disabled:opacity-50"
        >
          Prev
        </button>

        <span className="text-sm font-semibold">
          {receiptPage} / {receiptTotalPages}
        </span>

        <button
          disabled={receiptPage === receiptTotalPages}
          onClick={() => setReceiptPage((prev) => prev + 1)}
          className="px-3 py-1 border rounded-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>
      {/* Bảng hiển thị Nhật ký thay đổi kho nguyên liệu thô*/}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50 space-y-4">
          <h2 className="font-montserrat font-bold text-lg flex items-center gap-2">
            <History size={20} className="text-accent-1" />
            Nhật ký biến động kho hạt thô
          </h2>

          <div className="flex flex-col md:flex-row gap-3">
            <input
              key="log-search"
              type="text"
              placeholder="Tìm kiếm nhật ký..."
              value={searchLog}
              onChange={(e) => setSearchLog(e.target.value)}
              className="px-4 py-2 border rounded-xl text-sm outline-none w-full md:w-80"
            />

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-4 py-2 border rounded-xl text-sm outline-none"
            >
              <option value="all">Tất cả hành động</option>
              <option value="NHAP">Nhập kho</option>
              <option value="XUAT">Xuất kho</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left font-nunito text-sm min-w-[1000px] table-layout-fixed">
            <thead className="bg-gray-50 text-gray-600 font-bold border-b whitespace-nowrap">
              <tr>
                <th className="px-6 py-4 w-[160px]">Thời gian</th>
                <th className="px-6 py-4 w-[200px]">Loại hạt</th>
                <th className="px-6 py-4 w-[120px]">Hành động</th>
                <th className="px-6 py-4 text-center w-[150px]">
                  Biến động tồn
                </th>
                <th className="px-6 py-4">Nội dung chi tiết</th>
                <th className="px-6 py-4 w-[180px]">Người thực hiện</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.length > 0 ? (
                logs.map((log) => {
                  const currentUserId = localStorage.getItem("userId");
                  const currentUserName = localStorage.getItem("name");

                  const displayName =
                    log.modifiedBy === currentUserId && currentUserName
                      ? currentUserName
                      : log.modifiedByName ||
                        log.user?.name ||
                        log.modifiedBy ||
                        "Hệ thống";

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                        {new Date(log.modifiedDate).toLocaleString("vi-VN")}
                      </td>

                      <td className="px-6 py-4 font-bold text-primary max-w-[200px] whitespace-normal break-words">
                        {log.rawMaterialName || "Nguyên liệu"}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-black uppercase border ${
                            log.action?.includes("NHAP")
                              ? "bg-green-100 text-green-700 border-green-200"
                              : log.action?.includes("XUAT")
                              ? "bg-blue-100 text-blue-700 border-blue-200"
                              : "bg-red-100 text-red-700 border-red-200"
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center font-medium text-gray-600 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5 text-xs">
                          <span className="text-gray-400">
                            {log.oldQuantity} kg
                          </span>
                          <ArrowRight size={12} className="text-gray-300" />
                          <span className="font-bold text-primary">
                            {log.newQuantity} kg
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-gray-700 text-xs whitespace-normal break-words">
                        {log.reason || "Thay đổi tồn kho hệ thống"}
                      </td>

                      <td className="px-6 py-4 text-gray-600 font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <User
                            size={14}
                            className="text-gray-400 opacity-80"
                          />
                          <span
                            className="truncate max-w-[150px]"
                            title={displayName}
                          >
                            {displayName}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-10 text-gray-400 italic"
                  >
                    Chưa có nhật ký biến động nguyên liệu nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="flex justify-center items-center gap-2 py-4">
            <button
              disabled={logPage === 1}
              onClick={() => setLogPage((prev) => prev - 1)}
              className="px-3 py-1 border rounded-lg disabled:opacity-50"
            >
              Prev
            </button>

            <span className="text-sm font-semibold">
              {logPage} / {logTotalPages}
            </span>

            <button
              disabled={logPage === logTotalPages}
              onClick={() => setLogPage((prev) => prev + 1)}
              className="px-3 py-1 border rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
