import React, { useState, useEffect } from 'react';
import { Archive, Plus, X, Loader2, History, User } from 'lucide-react';
import API from '../../services/api'; 

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restockForm, setRestockForm] = useState(null);
  const [restockAmount, setRestockAmount] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, logRes] = await Promise.all([
        API.getProducts(),
        API.getLogs()
      ]);
      setInventory(prodRes.data.data || []);
      setLogs(logRes.data.data || []);
    } catch (err) {
      console.error("Lỗi khi đồng bộ dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRestock = async (e, id) => {
    e.preventDefault();
    if(restockAmount && Number(restockAmount) > 0) {
      try {
        await API.updateStock(id, parseInt(restockAmount), "Nhập kho định kỳ");
        setRestockForm(null);
        setRestockAmount('');
        fetchData();
      } catch (err) {
        alert("Lỗi nhập kho: " + (err.response?.data || "Vui lòng kiểm tra quyền hạn."));
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="animate-spin text-primary mb-2" size={40} />
        <p className="text-gray-500 font-nunito">Đang tải dữ liệu hệ thống...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in p-4 md:p-6 space-y-8">
      <div>
        <h1 className="font-montserrat font-bold text-2xl">Quản Lý Tồn Kho</h1>
        <p className="font-nunito text-primary/60 text-sm mt-1">Theo dõi và cập nhật số lượng tồn kho sản phẩm.</p>
      </div>

      {/* Bảng sản phẩm - Đã bỏ lọc */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-montserrat font-bold text-lg mb-6 flex items-center gap-2">
          <Archive size={20} className="text-primary" /> Tất cả sản phẩm
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 font-nunito">
          {inventory.map(item => (
            <div key={item.id} className="flex justify-between items-center pb-4 border-b border-gray-100 last:border-0">
              <div>
                <div className="font-bold text-primary">{item.name}</div>
                <div className="text-xs text-gray-500">Mã: {item.id}</div>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <div className="font-bold text-xl text-primary">
                  {item.stock} <span className="text-sm font-normal text-gray-400">{item.unit || 'kg'}</span>
                </div>
                {restockForm === item.id ? (
                  <form onSubmit={(e) => handleRestock(e, item.id)} className="flex items-center gap-2">
                    <input 
                      type="number" autoFocus value={restockAmount}
                      onChange={(e) => setRestockAmount(e.target.value)}
                      className="w-20 px-2 py-1 text-sm border border-primary rounded-md outline-none" 
                      placeholder="+ SL" 
                    />
                    <button type="submit" className="bg-primary text-white p-1 rounded hover:bg-accent-1"><Plus size={16}/></button>
                    <button type="button" onClick={() => setRestockForm(null)} className="text-gray-400 p-1 hover:text-red-500"><X size={16}/></button>
                  </form>
                ) : (
                  <button 
                    onClick={() => setRestockForm(item.id)}
                    className="text-xs text-accent-1 font-bold flex items-center hover:bg-accent-1/10 px-2 py-1 rounded"
                  >
                    <Plus size={12} className="mr-1"/> Nhập thêm
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nhật ký thay đổi kho */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
          <h2 className="font-montserrat font-bold text-lg flex items-center gap-2">
            <History size={20} className="text-accent-1" /> Nhật ký thay đổi kho
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-nunito text-sm">
            <thead className="bg-gray-50 text-gray-600 font-bold">
              <tr>
                <th className="px-6 py-4">Thời gian</th>
                <th className="px-6 py-4">Sản phẩm</th>
                <th className="px-6 py-4">Hành động</th>
                <th className="px-6 py-4 text-center">Thay đổi</th>
                <th className="px-6 py-4">Người thực hiện</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.length > 0 ? logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(log.modifiedDate).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 font-bold text-primary">{log.productName}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                      log.action === 'NHAP_KHO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {log.action === 'NHAP_KHO' ? 'Nhập kho' : 'Rang Cà Phê'}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-center font-bold ${log.quantityChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {log.quantityChange > 0 ? `+${log.quantityChange}` : log.quantityChange}
                  </td>
                  <td className="px-6 py-4 text-gray-500 flex items-center gap-1">
                    <User size={14} className="opacity-50" /> {log.modifiedBy || 'N/A'}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5" className="text-center py-10 text-gray-400 italic">Chưa có lịch sử thay đổi nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}