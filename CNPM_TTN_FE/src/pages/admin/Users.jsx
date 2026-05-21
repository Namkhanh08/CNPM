import React, { useEffect, useState } from "react";
import { UserPlus, Trash2, Edit3, ShieldAlert, X, Camera } from "lucide-react";
import API from "../../services/api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    userName: "",
    password: "",
    phone: "",
    contact: "",
    position: "",
    image: "",
    userType: 0,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.adminGetUsers();
      const userList = res.data?.data || res.data?.Data || res.data || [];
      setUsers(Array.isArray(userList) ? userList : []);
    } catch {
      console.error("Không thể lấy danh sách user");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await API.uploadUserImage(file);
      if (res.data?.url) {
        setFormData((prev) => ({ ...prev, image: res.data.url }));
        alert("Tải ảnh lên thành công!");
      }
    } catch (err) {
      alert("Lỗi tải ảnh: " + (err.response?.data || "Định dạng không hỗ trợ"));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      try {
        await API.adminDeleteUser(id);
        setUsers(users.filter((u) => (u.id ?? u.Id) !== id));
        alert("Xóa người dùng thành công!");
      } catch {
        alert(
          "Không thể xóa người dùng này vì đã có dữ liệu đơn hàng liên quan."
        );
      }
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setFormData({
      ...user,
      password: "", 
    });
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      userName: "",
      password: "",
      phone: "",
      contact: "",
      position: "",
      image: "",
      userType: 0,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await API.adminUpdateUser(editingUser.id ?? editingUser.Id, formData);
        alert("Cập nhật thành công!");
      } else {
        await API.adminCreateUser(formData); 
        alert("Thêm người dùng thành công!");
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Có lỗi xảy ra khi lưu dữ liệu!");
    }
  };

  const getUserRoleName = (type) => {
    const roles = { 1: "Admin", 2: "Staff", 3: "Stock" };
    return roles[type] || "User";
  };

  if (loading)
    return <div className="p-6 text-center italic">Đang tải danh sách...</div>;

  return (
    <div className="animate-fade-in p-6 relative">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-montserrat font-bold text-2xl flex items-center gap-2">
          <ShieldAlert className="text-red-500" /> Quản lý Người dùng
        </h1>
        <button
          onClick={handleAddClick}
          className="bg-[#8B4513] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-orange-900 transition-all shadow-md"
        >
          <UserPlus size={20} /> Thêm tài khoản
        </button>
      </div>

      {/* Bảng danh sách người dùng */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left font-nunito border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm uppercase">
              <th className="p-4 font-bold">Người dùng</th>
              <th className="p-4 font-bold">Tên đăng nhập</th>
              <th className="p-4 font-bold">Liên hệ</th>
              <th className="p-4 font-bold">Chức vụ</th>
              <th className="p-4 font-bold text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((u) => (
              <tr key={u.id ?? u.Id} className="hover:bg-blue-50/30 transition-colors">
                <td className="p-4 flex items-center gap-3">
                  <img
                    src={
                      u.image
                        ? `http://localhost:5126${u.image}`
                        : `https://ui-avatars.com/api/?name=${u.name ?? u.Name ?? "User"}`
                    }
                    className="w-10 h-10 rounded-full object-cover border-2 border-amber-100"
                    alt=""
                  />
                  <div>
                    <p className="font-bold text-[#8B4513]">{u.name ?? u.Name}</p>
                    <p className="text-xs text-gray-400">{u.email ?? u.Email}</p>
                  </div>
                </td>
                <td className="p-4 text-sm font-mono text-blue-600 font-bold">
                  {u.userName ?? u.UserName}
                </td>
                <td className="p-4">
                  <p className="text-sm font-bold">{u.phone ?? u.Phone}</p>
                  <p className="text-xs text-blue-500 italic truncate max-w-[150px]">
                    {u.contact ?? u.Contact ?? "Chưa có thông tin"}
                  </p>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      (u.userType ?? u.UserType) === 1
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {getUserRoleName(u.userType ?? u.UserType)}
                  </span>
                </td>
                <td className="p-4">
                  <span className="text-sm bg-gray-100 px-2 py-1 rounded border italic">
                    {u.position ?? u.Position ?? "N/A"}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleEditClick(u)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(u.id ?? u.Id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL THÊM/SỬA --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl animate-in zoom-in duration-200 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b bg-gray-50">
              <h2 className="text-xl font-bold font-montserrat">
                {editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-4 font-nunito max-h-[80vh] overflow-y-auto"
            >
              {/* PHẦN CHỌN ẢNH */}
              <div className="flex flex-col items-center mb-4">
                <div className="relative group">
                  <img
                    src={
                      formData.image
                        ? `http://localhost:5126${formData.image}`
                        : "https://ui-avatars.com/api/?name=New+User"
                    }
                    className="w-24 h-24 rounded-full object-cover border-4 border-amber-100 shadow-md"
                    alt="Preview"
                  />
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-all">
                    <Camera className="text-white" size={24} />
                    <input
                      type="file"
                      hidden
                      onChange={handleAvatarChange}
                      disabled={uploading}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {uploading ? "Đang tải ảnh..." : "Nhấp vào ảnh để thay đổi"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-600">Họ và tên</label>
                  <input
                    type="text"
                    required
                    className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-amber-200"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-600">Username</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingUser}
                    className={`w-full p-2.5 border rounded-xl outline-none ${
                      editingUser ? "bg-gray-100 cursor-not-allowed" : "focus:ring-2 focus:ring-amber-200"
                    }`}
                    value={formData.userName}
                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-600">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-amber-200"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-600">Số điện thoại</label>
                  <input
                    type="text"
                    className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-amber-200"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-600">Thông tin liên hệ (Contact)</label>
                  <input
                    type="text"
                    placeholder="Địa chỉ hoặc ghi chú..."
                    className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-amber-200"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-600">Mật khẩu mới</label>
                  <input
                    type="password"
                    required={!editingUser}
                    placeholder={editingUser ? "Bỏ trống nếu giữ nguyên" : "Nhập mật khẩu"}
                    className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-amber-200"
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-600">Loại tài khoản</label>
                  <select
                    className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-amber-200"
                    value={formData.userType}
                    onChange={(e) => setFormData({ ...formData, userType: parseInt(e.target.value) })}
                  >
                    <option value={0}>Khách hàng(User)</option>
                    <option value={1}>Quản trị viên (Admin)</option>
                    <option value={2}>Nhân viên (Staff)</option>
                    <option value={3}>Kho hàng (Stock)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-600">Vị trí (Position)</label>
                  <input
                    type="text"
                    className="w-full p-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-amber-200"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-8 py-2.5 bg-[#8B4513] text-white rounded-xl font-bold shadow-lg hover:bg-orange-900 transition-all disabled:bg-gray-400"
                >
                  {editingUser ? "Cập nhật" : "Tạo tài khoản"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
