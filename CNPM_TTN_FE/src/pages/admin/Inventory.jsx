import React, { useEffect, useState } from 'react';
import { Archive, Plus, X } from 'lucide-react';
import API from '../../services/api';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [restockForm, setRestockForm] = useState(null);
  const [restockAmount, setRestockAmount] = useState('');
  const [reason, setReason] = useState('');

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const [productRes, logRes] = await Promise.all([
        API.getInventory(),
        API.getInventoryLogs(),
      ]);

      const productList =
        productRes.data?.data ||
        productRes.data?.Data ||
        productRes.data ||
        [];

      const logList =
        logRes.data?.data ||
        logRes.data?.Data ||
        logRes.data ||
        [];

      setProducts(Array.isArray(productList) ? productList : []);
      setLogs(Array.isArray(logList) ? logList : []);
      setError(null);
    } catch (err) {
      console.error('Lay ton kho that bai:', err);
      setError('Khong the tai du lieu ton kho.');
      setProducts([]);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleRestock = async (event, productId) => {
    event.preventDefault();
    const quantity = Number(restockAmount);

    if (!quantity) return;

    try {
      await API.updateStock({
        productId,
        quantity,
        reason: reason.trim() || 'Cap nhat ton kho',
      });

      setRestockForm(null);
      setRestockAmount('');
      setReason('');
      await fetchInventory();
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.Message || 'Cap nhat kho that bai');
    }
  };

  const totalStock = products.reduce((sum, item) => sum + (item.stock ?? item.Stock ?? 0), 0);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-montserrat font-bold text-2xl">Quan ly ton kho</h1>
          <p className="font-nunito text-primary/60 text-sm mt-1">Theo doi va cap nhat so luong san pham trong kho.</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl px-5 py-3 shadow-sm">
          <p className="text-xs text-primary/60 font-bold">Tong ton</p>
          <p className="text-xl font-montserrat font-black text-primary">{totalStock.toLocaleString('vi-VN')}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-center font-bold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-montserrat font-bold text-lg mb-6 flex items-center gap-2">
            <Archive size={20} className="text-green-600" /> San pham trong kho
          </h2>

          <div className="space-y-4 font-nunito">
            {loading ? (
              <div className="text-center py-10 text-primary/60">Dang tai du lieu...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-10 text-primary/60">Chua co san pham trong kho.</div>
            ) : products.map((item) => {
              const id = item.id ?? item.Id;
              const name = item.name ?? item.Name;
              const stock = item.stock ?? item.Stock ?? 0;

              return (
                <div key={id} className="flex justify-between items-center pb-4 border-b border-gray-50 last:border-0">
                  <div>
                    <div className="font-bold text-primary">{name}</div>
                    <div className="text-xs text-gray-500">Ma SP: {id}</div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <div className={`font-bold text-xl ${stock <= 10 ? 'text-orange-500' : 'text-primary'}`}>
                      {stock.toLocaleString('vi-VN')}
                    </div>

                    {restockForm === id ? (
                      <form onSubmit={(event) => handleRestock(event, id)} className="flex flex-wrap justify-end items-center gap-2">
                        <input
                          type="number"
                          autoFocus
                          value={restockAmount}
                          onChange={(event) => setRestockAmount(event.target.value)}
                          className="w-24 px-2 py-1 text-sm border border-primary rounded-md outline-none"
                          placeholder="+/- SL"
                        />
                        <input
                          value={reason}
                          onChange={(event) => setReason(event.target.value)}
                          className="w-40 px-2 py-1 text-sm border border-gray-200 rounded-md outline-none"
                          placeholder="Ly do"
                        />
                        <button type="submit" className="bg-primary text-white p-1 rounded hover:bg-accent-1"><Plus size={16} /></button>
                        <button type="button" onClick={() => setRestockForm(null)} className="text-gray-400 p-1 hover:text-red-500"><X size={16} /></button>
                      </form>
                    ) : (
                      <button
                        onClick={() => setRestockForm(id)}
                        className="text-xs text-accent-1 font-bold flex items-center hover:bg-accent-1/10 px-2 py-1 rounded transition-colors"
                      >
                        <Plus size={12} className="mr-1" /> Cap nhat kho
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-montserrat font-bold text-lg mb-6">Nhat ky gan day</h2>
          <div className="space-y-4">
            {logs.length === 0 ? (
              <div className="text-center py-8 text-primary/60">Chua co nhat ky kho.</div>
            ) : logs.slice(0, 8).map((log) => {
              const id = log.id ?? log.Id;
              const productName = log.productName ?? log.ProductName;
              const action = log.action ?? log.Action;
              const change = log.quantityChange ?? log.QuantityChange ?? 0;

              return (
                <div key={id} className="border-b border-gray-50 pb-3 last:border-0">
                  <div className="font-bold text-sm text-primary line-clamp-1">{productName}</div>
                  <div className="text-xs text-primary/60">{action}</div>
                  <div className={`text-sm font-bold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {change >= 0 ? '+' : ''}{change}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
