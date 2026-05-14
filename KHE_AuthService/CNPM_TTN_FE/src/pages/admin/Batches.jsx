import React, { useState } from 'react';
import { Plus, History } from 'lucide-react';

export default function Batches() {
  const [batches] = useState([
    { id: 'B20231015-ARA', coffee: 'Arabica Cầu Đất', roastLevel: 'Medium', weight: 15, date: '15/10/2023', roaster: 'Nguyễn Văn A', status: 'Đã đóng gói' },
    { id: 'B20231014-ROB', coffee: 'Robusta Đắk Lắk', roastLevel: 'Dark', weight: 20, date: '14/10/2023', roaster: 'Trần Thị B', status: 'Đã đóng gói' },
    { id: 'B20231016-BLD', coffee: 'Revo Blend', roastLevel: 'Medium Dark', weight: 30, date: '16/10/2023', roaster: 'Lê Văn C', status: 'Đang de-gas' },
  ]);

  return (
     <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
           <h1 className="font-montserrat font-bold text-2xl">Quản Lý Lô Rang (Batches)</h1>
           <p className="font-nunito text-primary/60 text-sm mt-1">Ghi chú và theo dõi lịch sử các mẻ rang của xưởng.</p>
        </div>
        <button className="bg-primary text-white px-4 py-2 rounded-xl font-bold font-nunito flex items-center gap-2 hover:bg-accent-1 transition-colors whitespace-nowrap">
          <Plus size={18} /> Ghi Lô Rang Mới
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-montserrat font-bold text-lg mb-6 flex items-center gap-2">
           <History size={20} className="text-accent-1" /> Lịch sử rang gần đây
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-nunito text-sm whitespace-nowrap">
            <thead className="bg-pinky-gray/50 text-gray-600 font-bold border-y border-gray-100">
              <tr>
                <th className="px-4 py-4">Mã Lô (Batch ID)</th>
                <th className="px-4 py-4">Ngày Rang</th>
                <th className="px-4 py-4">Loại Cà Phê Nhân</th>
                <th className="px-4 py-4 text-center">Mức Rang</th>
                <th className="px-4 py-4 text-right">Khối Lượng Thô</th>
                <th className="px-4 py-4">Thợ Rang</th>
                <th className="px-4 py-4 text-center">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {batches.map(b => (
                 <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 font-bold text-primary">{b.id}</td>
                    <td className="px-4 py-4">{b.date}</td>
                    <td className="px-4 py-4 font-bold">{b.coffee}</td>
                    <td className="px-4 py-4 text-center">
                       <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">{b.roastLevel}</span>
                    </td>
                    <td className="px-4 py-4 text-right font-bold text-accent-1">{b.weight} kg</td>
                    <td className="px-4 py-4">{b.roaster}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                         b.status === 'Đã đóng gói' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                       }`}>
                         {b.status}
                      </span>
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
