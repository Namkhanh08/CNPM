import useStore from "../store/useStore";
import { useEffect, useState, useCallback } from "react";
import API from "../services/api";

export default function Profile() {
  const user = useStore((state) => state.user);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorCount, setErrorCount] = useState(0); 

  // 1. Lấy dữ liệu hồ sơ
  const fetchProfile = useCallback(async () => {
    const userId = user?.id || user?.userId || localStorage.getItem("userId");
    if (!userId || userId === "undefined" || errorCount > 3) return;

    try {
      setLoading(true);
      const res = await API.getUserProfile(userId);
      setProfile(res.data);
      setErrorCount(0); 
    } catch (err) {
      console.error("Lỗi API Profile:", err);
      setErrorCount(prev => prev + 1);
      setProfile({}); 
    } finally {
      setLoading(false);
    }
  }, [user, errorCount]);

  useEffect(() => {
    if (!profile && errorCount === 0) {
      fetchProfile();
    }
  }, [profile, fetchProfile, errorCount]);

  // 2. Mapping dữ liệu (Hỗ trợ PascalCase từ .NET và camelCase)
  const getVal = (key) => {
    if (!profile) return "";
    const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
    return profile[key] ?? profile[pascalKey] ?? "";
  };

  const handleChange = (key, value) => {
    setProfile(prev => ({
      ...prev,
      [key]: value,
      [key.charAt(0).toUpperCase() + key.slice(1)]: value 
    }));
  };

  // 3. Logic hiển thị Chức vụ (Khóa cứng, không cho sửa)
  const renderPosition = () => {
    const type = getVal('userType');
    if (type === 1) return "Quản trị viên (Admin)";
    if (type === 2) return "Nhân viên đơn hàng";
    if (type === 3) return "Quản lý kho";
    return "Khách hàng"; // Mặc định là khách hàng
  };

  // 4. Xử lý Upload ảnh
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setLoading(true);
      const res = await API.uploadUserImage(file);
      if (res.data?.url) {
        handleChange('image', res.data.url);
        alert("Đã tải ảnh lên! Nhấn Lưu để cập nhật.");
      }
    } catch (err) {
      alert("Lỗi tải ảnh: " + (err.response?.data || "Định dạng không hỗ trợ"));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const targetId = user?.id || user?.userId || localStorage.getItem("userId");
      await API.updateUserProfile(targetId, profile);
      alert("Cập nhật thành công!");
      setIsEditing(false);
    } catch  {
      alert("Lỗi lưu dữ liệu. Kiểm tra lại đường dẫn API.");
    } finally {
      setLoading(false);
    }
  };

  if (!user && !localStorage.getItem("userId")) return <div className="p-20 text-center font-bold">Vui lòng đăng nhập</div>;

  const avatarUrl = getVal('image') 
    ? `http://localhost:5126${getVal('image')}` 
    : "https://ui-avatars.com/api/?name=User&background=random";

  return (
    <div className="min-h-screen bg-[#F5EFE6] pt-28 px-6 md:px-12 pb-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col md:flex-row items-center gap-6 border border-amber-100">
          <div className="relative group">
            <img
              src={avatarUrl}
              className="w-24 h-24 rounded-full object-cover border-2 border-[#8B4513]"
              alt="Avatar"
              onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=User"; }}
            />
            {isEditing && (
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-all">
                <span className="text-white text-[10px] font-bold">ĐỔI ẢNH</span>
                <input type="file" hidden onChange={handleAvatarChange} />
              </label>
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-[#4E342E]">{getVal('name') || "Người dùng"}</h2>
            <p className="text-amber-700 font-medium">{renderPosition()}</p>
          </div>
          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className={`px-8 py-2 rounded-lg font-bold transition-all shadow-md ${
              isEditing ? "bg-green-600 text-white" : "bg-[#8B4513] text-white hover:bg-[#5D2E0A]"
            }`}
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : isEditing ? "Lưu hồ sơ" : "Sửa hồ sơ"}
          </button>
        </div>

        {/* Thông tin 7 trường */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-amber-100">
          <h3 className="text-xl font-bold text-[#4E342E] mb-6 border-b pb-2 flex items-center gap-2">
             Thông tin tài khoản
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Họ và tên */}
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-600 uppercase tracking-tight">Họ và tên</label>
              <input disabled={!isEditing} className={`w-full p-3 border rounded-xl transition-all ${!isEditing ? "bg-gray-50 text-gray-500" : "border-amber-300 focus:ring-2 ring-amber-100 outline-none"}`}
                value={getVal('name')} onChange={(e) => handleChange('name', e.target.value)} />
            </div>

            {/* 2. Tên đăng nhập (Đã mở khóa cho sửa) */}
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-600 uppercase tracking-tight">Tên đăng nhập</label>
              <input disabled={!isEditing} className={`w-full p-3 border rounded-xl transition-all ${!isEditing ? "bg-gray-50 text-gray-500" : "border-amber-300 focus:ring-2 ring-amber-100 outline-none"}`}
                value={getVal('userName')} onChange={(e) => handleChange('userName', e.target.value)} />
            </div>

            {/* 3. Email */}
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-600 uppercase tracking-tight">Email liên hệ</label>
              <input disabled={!isEditing} className={`w-full p-3 border rounded-xl transition-all ${!isEditing ? "bg-gray-50 text-gray-500" : "border-amber-300 focus:ring-2 ring-amber-100 outline-none"}`}
                value={getVal('email')} onChange={(e) => handleChange('email', e.target.value)} />
            </div>

            {/* 4. Mật khẩu */}
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-600 uppercase tracking-tight">Mật khẩu mới</label>
              <input type="password" disabled={!isEditing} placeholder="Bỏ trống nếu giữ nguyên" className={`w-full p-3 border rounded-xl transition-all ${!isEditing ? "bg-gray-50 text-gray-500" : "border-amber-300 focus:ring-2 ring-amber-100 outline-none"}`}
                onChange={(e) => handleChange('password', e.target.value)} />
            </div>

            {/* 5. Số điện thoại */}
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-600 uppercase tracking-tight">Số điện thoại</label>
              <input disabled={!isEditing} className={`w-full p-3 border rounded-xl transition-all ${!isEditing ? "bg-gray-50 text-gray-500" : "border-amber-300 focus:ring-2 ring-amber-100 outline-none"}`}
                value={getVal('phone')} onChange={(e) => handleChange('phone', e.target.value)} />
            </div>

            {/* 6. Chức vụ (Khóa cứng) */}
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-600 uppercase tracking-tight">Chức vụ</label>
              <input disabled={true} className="w-full p-3 border rounded-xl bg-gray-100 text-gray-400 cursor-not-allowed font-medium"
                value={renderPosition()} />
            </div>

            {/* 7. Địa chỉ / Liên hệ khác */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-bold text-gray-600 uppercase tracking-tight">Địa chỉ / Liên hệ khác</label>
              <input disabled={!isEditing} className={`w-full p-3 border rounded-xl transition-all ${!isEditing ? "bg-gray-50 text-gray-500" : "border-amber-300 focus:ring-2 ring-amber-100 outline-none"}`}
                value={getVal('contact')} onChange={(e) => handleChange('contact', e.target.value)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}