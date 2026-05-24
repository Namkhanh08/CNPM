import React, { useState } from 'react';
import { MapPin, User, Sprout, Flame, Package, Award, ArrowLeft, Download, Eye, AlertCircle } from 'lucide-react';

const pick = (obj, pascalName, camelName) => obj?.[pascalName] ?? obj?.[camelName];

export default function TraceabilityTimeline({ data, onClose }) {
  const [activeTab, setActiveTab] = useState('timeline');
  const [selectedCert, setSelectedCert] = useState(null);

  if (!data) return null;

  const productName = pick(data, 'ProductName', 'productName');
  const process = pick(data, 'Process', 'process');
  const region = pick(data, 'Region', 'region');
  const batchCode = pick(data, 'BatchCode', 'batchCode');
  const roastDate = pick(data, 'RoastDate', 'roastDate');
  const roastLevel = pick(data, 'RoastLevel', 'roastLevel');
  const roasterName = pick(data, 'RoasterName', 'roasterName');
  const harvestBatchCode = pick(data, 'HarvestBatchCode', 'harvestBatchCode');
  const importDate = pick(data, 'ImportDate', 'importDate');
  const supplierName = pick(data, 'SupplierName', 'supplierName');
  const farmingZone = pick(data, 'FarmingZone', 'farmingZone');
  const farmer = pick(data, 'Farmer', 'farmer');
  const certifications = pick(data, 'Certifications', 'certifications') || [];
  const dataSource = pick(data, 'DataSource', 'dataSource');
  const warningMessage = pick(data, 'WarningMessage', 'warningMessage');

  const zoneName = pick(farmingZone, 'Name', 'name');
  const zoneImage = pick(farmingZone, 'Image', 'image');
  const zoneDescription = pick(farmingZone, 'Description', 'description');
  const zoneAltitude = pick(farmingZone, 'Altitude', 'altitude');
  const zoneSoil = pick(farmingZone, 'Soil', 'soil');
  const zoneClimate = pick(farmingZone, 'Climate', 'climate');

  const farmerName = pick(farmer, 'Name', 'name');
  const farmerScale = pick(farmer, 'Scale', 'scale');
  const farmerMethod = pick(farmer, 'FarmingMethod', 'farmingMethod');
  const farmerStory = pick(farmer, 'Story', 'story');

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Đang cập nhật';
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return 'Đang cập nhật';
    return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const steps = [
    {
      id: 'zone',
      title: 'Vùng trồng cà phê',
      subtitle: region || zoneName || 'Đang cập nhật',
      icon: MapPin,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-500',
      details: farmingZone ? (
        <div className="space-y-2 mt-2">
          {zoneImage && (
            <img src={zoneImage} alt={zoneName || 'Vùng trồng'} className="w-full h-32 object-cover rounded-xl mb-2 shadow-sm" />
          )}
          <p className="text-sm text-gray-600 leading-relaxed">{zoneDescription || 'Không có mô tả chi tiết.'}</p>
          <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-semibold text-gray-700">
            <div className="bg-emerald-50 p-2 rounded-lg"><span className="text-gray-400 block font-normal">Độ cao:</span> {zoneAltitude || 'Chưa cập nhật'}</div>
            <div className="bg-emerald-50 p-2 rounded-lg"><span className="text-gray-400 block font-normal">Thổ nhưỡng:</span> {zoneSoil || 'Chưa cập nhật'}</div>
            <div className="bg-emerald-50 p-2 rounded-lg col-span-2"><span className="text-gray-400 block font-normal">Khí hậu:</span> {zoneClimate || 'Chưa cập nhật'}</div>
          </div>
        </div>
      ) : <p className="text-sm text-gray-500 italic mt-1">Thông tin chi tiết vùng trồng đang được cập nhật...</p>
    },
    {
      id: 'farmer',
      title: 'Hộ nông dân & Canh tác',
      subtitle: supplierName || farmerName || 'Hộ nông dân đối tác Revo',
      icon: User,
      color: 'bg-amber-500',
      textColor: 'text-amber-500',
      details: farmer ? (
        <div className="space-y-2 mt-2">
          <p className="text-sm font-medium text-gray-800">Phương pháp canh tác: <span className="text-amber-600 font-semibold">{farmerMethod || 'Tự nhiên'}</span></p>
          <p className="text-sm text-gray-600 leading-relaxed italic">"{farmerStory || 'Không có câu chuyện chia sẻ.'}"</p>
          {farmerScale && (
            <div className="bg-amber-50 p-2 rounded-lg text-xs font-semibold text-gray-700 w-fit">
              <span className="text-gray-400 font-normal">Quy mô trang trại:</span> {farmerScale}
            </div>
          )}
        </div>
      ) : <p className="text-sm text-gray-500 italic mt-1">Thông tin nông hộ đang được cập nhật...</p>
    },
    {
      id: 'harvest',
      title: 'Thu hoạch & Sơ chế',
      subtitle: process || 'Chưa cập nhật',
      icon: Sprout,
      color: 'bg-teal-500',
      textColor: 'text-teal-500',
      details: (
        <div className="space-y-2 mt-2 text-sm text-gray-600">
          <p>Mã lô thu hoạch: <span className="font-semibold text-gray-800">{harvestBatchCode || 'Chưa có lô'}</span></p>
          <p>Phương pháp sơ chế: <span className="font-semibold text-gray-800">{process || 'Chưa xác định'}</span></p>
          <p>Ngày nhập kho nguyên liệu: <span className="font-semibold text-gray-800">{formatDate(importDate)}</span></p>
        </div>
      )
    },
    {
      id: 'roast',
      title: 'Mẻ rang thành phẩm (Roast Batch)',
      subtitle: batchCode ? `Lô rang: ${batchCode}` : 'Chưa có thông tin lô rang',
      icon: Flame,
      color: 'bg-red-500',
      textColor: 'text-red-500',
      details: batchCode ? (
        <div className="space-y-2 mt-2 text-sm text-gray-600">
          <p>Mức độ rang: <span className="font-semibold text-gray-800">{roastLevel || 'Medium'}</span></p>
          <p>Ngày rang mẻ: <span className="font-semibold text-gray-800">{formatDate(roastDate)}</span></p>
          {roasterName && <p>Chịu trách nhiệm rang: <span className="font-semibold text-gray-800">{roasterName}</span></p>}
        </div>
      ) : <p className="text-sm text-gray-500 italic mt-1">Sản phẩm hiện đang được sản xuất gối đầu từ nhiều lô hàng mới nhất.</p>
    },
    {
      id: 'package',
      title: 'Sản phẩm hoàn thiện',
      subtitle: productName || 'Sản phẩm Revo Coffee',
      icon: Package,
      color: 'bg-primary',
      textColor: 'text-primary',
      details: (
        <div className="space-y-1 mt-2 text-sm text-gray-600">
          <p>Đóng gói và kiểm duyệt chất lượng tại nhà máy Revo Coffee.</p>
          <p className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-1">
            Đã kiểm định chất lượng & cho phép lưu hành.
          </p>
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white/95 w-full max-w-3xl rounded-[32px] shadow-2xl overflow-hidden border border-white/20 flex flex-col max-h-[90vh]">
        <div className="p-6 bg-gradient-to-r from-primary to-[#53352A] text-white flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-accent-1/90">Hành trình hạt cà phê</span>
            <h2 className="text-2xl font-montserrat font-black mt-1">Truy Xuất Nguồn Gốc</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white" type="button">
            <ArrowLeft size={24} />
          </button>
        </div>

        <div className="flex border-b border-gray-100 bg-gray-50/50">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 py-4 text-center font-montserrat font-bold text-sm transition-all border-b-2 ${
              activeTab === 'timeline' ? 'border-primary text-primary bg-white' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
            type="button"
          >
            Chuỗi Cung Ứng (Timeline)
          </button>
          <button
            onClick={() => setActiveTab('certs')}
            className={`flex-1 py-4 text-center font-montserrat font-bold text-sm transition-all border-b-2 relative ${
              activeTab === 'certs' ? 'border-primary text-primary bg-white' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
            type="button"
          >
            Chứng Nhận Chất Lượng ({certifications.length})
            {certifications.length > 0 && (
              <span className="absolute right-[22%] top-[34%] w-2 h-2 rounded-full bg-accent-1 animate-pulse" />
            )}
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto max-h-[60vh] bg-white">
          {warningMessage && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3 text-amber-800 text-sm">
              <AlertCircle className="shrink-0 text-amber-500" size={20} />
              <div>
                <p className="font-semibold">Lưu ý nghiệp vụ</p>
                <p className="mt-0.5 text-amber-700/90 leading-relaxed">{warningMessage}</p>
              </div>
            </div>
          )}

          {activeTab === 'timeline' ? (
            <div className="relative border-l-2 border-gray-100 ml-4 pl-8 space-y-8 py-2">
              {steps.map((step, idx) => {
                const IconComponent = step.icon;
                return (
                  <div key={step.id} className="relative group animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
                    <div className={`absolute -left-[45px] top-1.5 w-8 h-8 rounded-full ${step.color} text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent size={16} />
                    </div>
                    <div className="bg-pinky-gray/30 hover:bg-pinky-gray/50 rounded-2xl p-5 border border-transparent hover:border-accent-1/10 transition-all duration-300">
                      <span className={`text-xs font-bold uppercase tracking-wider ${step.textColor} block mb-1`}>
                        Bước {idx + 1}
                      </span>
                      <h4 className="font-montserrat font-bold text-primary text-lg">{step.title}</h4>
                      <p className="text-gray-500 text-sm mt-0.5 font-medium">{step.subtitle}</p>
                      <div className="mt-2 text-gray-700">{step.details}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {certifications.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {certifications.map((cert, index) => {
                    const certName = pick(cert, 'Name', 'name');
                    const certIssuer = pick(cert, 'Issuer', 'issuer');
                    const certExpiryDate = pick(cert, 'ExpiryDate', 'expiryDate');
                    const certImage = pick(cert, 'Image', 'image');

                    return (
                      <div key={`${certName || 'cert'}-${index}`} className="border border-gray-100 rounded-2xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                        <div>
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                            <Award size={22} />
                          </div>
                          <h4 className="font-montserrat font-bold text-primary text-base">{certName || 'Chứng nhận'}</h4>
                          <p className="text-xs text-gray-400 mt-1">Tổ chức cấp: {certIssuer || 'Đang cập nhật'}</p>
                          <p className="text-xs font-medium text-emerald-600 mt-2">Hạn hiệu lực: {certExpiryDate ? formatDate(certExpiryDate) : 'Không xác định'}</p>
                        </div>

                        {certImage && (
                          <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                            <button
                              onClick={() => setSelectedCert(cert)}
                              className="flex-1 py-2 px-3 rounded-lg bg-pinky-gray text-primary hover:bg-primary hover:text-white transition-colors text-xs font-semibold flex items-center justify-center gap-1.5"
                              type="button"
                            >
                              <Eye size={14} /> Xem ảnh gốc
                            </button>
                            <a href={certImage} download className="py-2 px-3 rounded-lg border border-gray-200 text-gray-500 hover:text-primary transition-colors flex items-center justify-center" target="_blank" rel="noopener noreferrer">
                              <Download size={14} />
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Award size={48} className="mx-auto opacity-30 mb-3" />
                  <p className="font-medium">Chưa cập nhật chứng nhận quốc tế cho lô hàng này.</p>
                  <p className="text-xs mt-1">Sản phẩm vẫn tuân thủ đầy đủ quy trình kiểm nghiệm chất lượng nội bộ Revo Gate.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center text-xs text-gray-400 font-medium">
          Dữ liệu truy xuất nguồn gốc được xác thực & quản lý bởi Revo Coffee. Nguồn dữ liệu: {dataSource === 'RoastBatch' ? 'Nhật ký lô rang hệ thống' : 'Cấu hình sản phẩm mặc định'}.
        </div>
      </div>

      {selectedCert && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-4 overflow-hidden relative flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-montserrat font-bold text-primary text-lg">{pick(selectedCert, 'Name', 'name') || 'Chứng nhận'}</h3>
              <button onClick={() => setSelectedCert(null)} className="text-gray-400 hover:text-gray-700 font-semibold" type="button">
                Đóng
              </button>
            </div>
            <div className="flex-1 max-h-[70vh] flex items-center justify-center bg-gray-100 rounded-2xl overflow-hidden p-2">
              <img src={pick(selectedCert, 'Image', 'image')} alt={pick(selectedCert, 'Name', 'name') || 'Chứng nhận'} className="max-w-full max-h-full object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
