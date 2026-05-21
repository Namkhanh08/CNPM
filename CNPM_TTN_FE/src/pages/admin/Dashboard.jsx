import React, { useEffect, useState } from 'react';
import { DollarSign, Package, ShoppingBag, Users } from 'lucide-react';
import API from '../../services/api';

const statusLabels = {
  unpaid: 'Cho thanh toan',
  processing: 'Dang xu ly',
  shipping: 'Dang giao',
  completed: 'Hoan thanh',
  cancelled: 'Da huy',
};

const statusClasses = {
  unpaid: 'bg-orange-100 text-orange-600',
  processing: 'bg-blue-100 text-blue-600',
  shipping: 'bg-indigo-100 text-indigo-600',
  completed: 'bg-green-100 text-green-600',
  cancelled: 'bg-red-100 text-red-600',
};

export default function Dashboard() {
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    pendingOrders: 0,
    totalStock: 0,
    newUsersToday: 0,
    recentOrders: [],
    topProducts: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const res = await API.getDashboardSummary();
        const data = res.data?.data || res.data?.Data || res.data || {};
        setSummary({
          totalRevenue: data.totalRevenue ?? data.TotalRevenue ?? 0,
          pendingOrders: data.pendingOrders ?? data.PendingOrders ?? 0,
          totalStock: data.totalStock ?? data.TotalStock ?? 0,
          newUsersToday: data.newUsersToday ?? data.NewUsersToday ?? 0,
          recentOrders: data.recentOrders ?? data.RecentOrders ?? [],
          topProducts: data.topProducts ?? data.TopProducts ?? [],
        });
        setError(null);
      } catch (err) {
        console.error('Lay du lieu dashboard that bai:', err);
        setError('Khong the tai du lieu tong quan.');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const kpis = [
    {
      label: 'Doanh thu',
      value: `${summary.totalRevenue.toLocaleString('vi-VN')}₫`,
      icon: <DollarSign size={24} />,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Don can xu ly',
      value: summary.pendingOrders,
      icon: <ShoppingBag size={24} />,
      color: 'bg-orange-100 text-orange-600',
    },
    {
      label: 'Ton kho',
      value: `${summary.totalStock.toLocaleString('vi-VN')} kg`,
      icon: <Package size={24} />,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Nguoi dung moi hom nay',
      value: summary.newUsersToday,
      icon: <Users size={24} />,
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-montserrat font-bold text-2xl">Tong quan hoat dong</h1>
        {loading && <span className="text-sm text-primary/60 font-bold">Dang tai...</span>}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl font-nunito text-center mb-8">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((item) => (
          <div key={item.label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${item.color}`}>
              {item.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500 font-bold mb-1">{item.label}</p>
              <h3 className="font-montserrat font-black text-xl text-primary">{item.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-montserrat font-bold text-lg">Don hang moi nhat</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-nunito text-sm">
              <thead className="text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="pb-3 font-semibold">Ma don</th>
                  <th className="pb-3 font-semibold">Khach hang</th>
                  <th className="pb-3 font-semibold text-right">Tong tien</th>
                  <th className="pb-3 font-semibold text-center">Trang thai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {summary.recentOrders.map((order) => {
                  const id = order.id ?? order.Id;
                  const status = (order.status ?? order.Status ?? '').toLowerCase();
                  const totalAmount = order.totalAmount ?? order.TotalAmount ?? 0;
                  const customerName = order.customerName ?? order.CustomerName ?? 'Guest';

                  return (
                    <tr key={id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 font-bold text-primary">#{id}</td>
                      <td className="py-4 truncate max-w-[150px]">{customerName}</td>
                      <td className="py-4 font-bold text-right text-accent-1">
                        {totalAmount.toLocaleString('vi-VN')}₫
                      </td>
                      <td className="py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusClasses[status] || 'bg-gray-100 text-gray-600'}`}>
                          {statusLabels[status] || status || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {summary.recentOrders.length === 0 && (
                  <tr><td colSpan="4" className="py-8 text-center text-gray-400">Chua co don hang nao</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-montserrat font-bold text-lg">Ban chay nhat</h2>
          </div>
          <div className="space-y-4">
            {summary.topProducts.map((product, index) => {
              const id = product.productId ?? product.ProductId ?? index;
              const name = product.name ?? product.Name ?? 'N/A';
              const sales = product.sales ?? product.Sales ?? 0;
              const stock = product.stock ?? product.Stock ?? 0;

              return (
                <div key={id} className="flex items-center justify-between border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center text-primary font-bold shrink-0">
                      #{index + 1}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm line-clamp-1">{name}</h4>
                      <p className="text-xs text-gray-500">{sales} luot mua · ton {stock}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            {summary.topProducts.length === 0 && (
              <div className="text-center py-8 text-gray-400">Chua co du lieu ban hang</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
