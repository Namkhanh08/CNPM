import React, { useState } from 'react';
import { Archive, Plus, X } from 'lucide-react';
import useStore from '../../store/useStore';

export default function Inventory() {
  const inventory = useStore(state => state.inventory);
  const restockItem = useStore(state => state.restockItem);
  
  const [restockForm, setRestockForm] = useState(null); // id of item being restocked
  const [restockAmount, setRestockAmount] = useState('');

  const handleRestock = (e, id) => {
    e.preventDefault();
    if(restockAmount && Number(restockAmount) > 0) {
      if(window.confirm(`Xác nhận nhập thêm ${restockAmount} cho mã ${id}?`)) {
        restockItem(id, restockAmount);
        setRestockForm(null);
        setRestockAmount('');
        alert('Nhập kho thành công!');
      }
    }
  };

  const greenBeans = inventory.filter(item => item.type === 'Green Beans');
  const packaging = inventory.filter(item => item.type === 'Packaging');

  return (
    <div className="animate-fade-in">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
           <h1 className="font-montserrat font-bold text-2xl">Quản Lý Tồn Kho</h1>
           <p className="font-nunito text-primary/60 text-sm mt-1">Kiểm soát cà phê nhân xanh & bao bì.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
         {/* Green Beans */}
         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-montserrat font-bold text-lg mb-6 flex items-center gap-2">
               <Archive size={20} className="text-green-600" /> Cà Phê Nhân Xanh (Green Beans)
            </h2>
            <div className="space-y-4 font-nunito">
               {greenBeans.map(item => (
                 <div key={item.id} className="flex justify-between items-center pb-4 border-b border-gray-50 last:border-0">
                    <div>
                      <div className="font-bold text-primary">{item.name}</div>
                      <div className="text-xs text-gray-500">Mã: {item.id}</div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <div className="font-bold text-xl text-primary">{item.quantity} {item.unit}</div>
                      
                      {restockForm === item.id ? (
                        <form onSubmit={(e) => handleRestock(e, item.id)} className="flex items-center gap-2">
                          <input 
                            type="number" 
                            autoFocus
                            value={restockAmount}
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
                          className="text-xs text-accent-1 font-bold flex items-center hover:bg-accent-1/10 px-2 py-1 rounded transition-colors"
                        >
                          <Plus size={12} className="mr-1"/> Nhập thêm
                        </button>
                      )}
                    </div>
                 </div>
               ))}
            </div>
         </div>

         {/* Packaging */}
         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-montserrat font-bold text-lg mb-6 flex items-center gap-2">
               <Archive size={20} className="text-gray-600" /> Bao bì & Vật tư
            </h2>
            <div className="space-y-4 font-nunito">
               {packaging.map(item => (
                 <div key={item.id} className="flex justify-between items-center pb-4 border-b border-gray-50 last:border-0">
                    <div>
                      <div className="font-bold text-primary">{item.name}</div>
                      <div className="text-xs text-gray-500">Mã: {item.id}</div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <div className={`font-bold text-xl ${item.quantity < 500 ? 'text-orange-500' : 'text-primary'}`}>{item.quantity} {item.unit}</div>
                      
                      {restockForm === item.id ? (
                        <form onSubmit={(e) => handleRestock(e, item.id)} className="flex items-center gap-2">
                          <input 
                            type="number" 
                            autoFocus
                            value={restockAmount}
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
                          className="text-xs text-accent-1 font-bold flex items-center hover:bg-accent-1/10 px-2 py-1 rounded transition-colors"
                        >
                          <Plus size={12} className="mr-1"/> Nhập thêm
                        </button>
                      )}
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
