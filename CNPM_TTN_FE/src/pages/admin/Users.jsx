import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Trash2, X } from 'lucide-react';
import API from '../../services/api';

const roleLabels = {
  0: 'Khach hang',
  1: 'Admin',
  2: 'Nhan vien',
  3: 'Quan ly kho',
};

const emptyForm = {
  name: '',
  userName: '',
  email: '',
  password: '',
  phone: '',
  position: '',
  contact: '',
  image: '',
  userType: 0,
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.getUsers();
      const userList = res.data?.data || res.data?.Data || res.data || [];
      setUsers(Array.isArray(userList) ? userList : []);
    } catch (err) {
      console.error('Lay danh sach nguoi dung that bai:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return users;

    return users.filter((user) => {
      const name = user.name ?? user.Name ?? '';
      const userName = user.userName ?? user.UserName ?? '';
      const email = user.email ?? user.Email ?? '';
      return [name, userName, email].some((value) => value.toLowerCase().includes(keyword));
    });
  }, [users, searchTerm]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'userType' ? Number(value) : value,
    }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      await API.createUser(form);
      setForm(emptyForm);
      setShowForm(false);
      await fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.Message || 'Khong the tao nguoi dung');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Ban co chac chan muon xoa nguoi dung nay?')) return;

    try {
      await API.deleteUser(id);
      await fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.Message || 'Khong the xoa nguoi dung');
    }
  };

  return (
    <div className="animate-fade-in p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-montserrat font-bold text-2xl">Quan ly nguoi dung</h1>
          <p className="text-sm text-primary/60 mt-1">Theo doi tai khoan, vai tro va thong tin lien he.</p>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <input
              type="text"
              placeholder="Tim ten, username, email..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary font-nunito text-sm"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="bg-primary text-white px-4 py-2 rounded-xl font-bold font-nunito flex items-center gap-2 hover:bg-accent-1 transition-colors whitespace-nowrap"
          >
            <Plus size={18} /> Them nguoi dung
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-montserrat font-bold text-lg">Tao tai khoan moi</h2>
            <button type="button" onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input name="name" value={form.name} onChange={handleChange} required placeholder="Ho ten" className="border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:border-primary" />
            <input name="userName" value={form.userName} onChange={handleChange} required placeholder="Ten dang nhap" className="border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:border-primary" />
            <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="Email" className="border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:border-primary" />
            <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={6} placeholder="Mat khau" className="border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:border-primary" />
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="So dien thoai" className="border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:border-primary" />
            <input name="position" value={form.position} onChange={handleChange} placeholder="Chuc vu" className="border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:border-primary" />
            <input name="contact" value={form.contact} onChange={handleChange} placeholder="Lien he" className="border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:border-primary" />
            <input name="image" value={form.image} onChange={handleChange} placeholder="Anh dai dien URL" className="border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:border-primary" />
            <select name="userType" value={form.userType} onChange={handleChange} className="border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:border-primary">
              {Object.entries(roleLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="mt-5 flex justify-end">
            <button disabled={saving} className="bg-primary text-white px-5 py-2 rounded-xl font-bold hover:bg-accent-1 disabled:opacity-60">
              {saving ? 'Dang luu...' : 'Tao nguoi dung'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-nunito text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Ten</th>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Vai tro</th>
                <th className="px-6 py-4">Trang thai</th>
                <th className="px-6 py-4 text-center">Hanh dong</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-10">Dang tai du lieu...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-10 text-primary/60">Khong co nguoi dung phu hop.</td></tr>
              ) : filteredUsers.map((user) => {
                const id = user.id ?? user.Id;
                const userType = user.userType ?? user.UserType;
                const isActive = user.isActive ?? user.IsActive;

                return (
                  <tr key={id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-primary">{user.name ?? user.Name}</td>
                    <td className="px-6 py-4">{user.userName ?? user.UserName}</td>
                    <td className="px-6 py-4">{user.email ?? user.Email}</td>
                    <td className="px-6 py-4">{roleLabels[userType] || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                        {isActive ? 'Hoat dong' : 'Tam khoa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => handleDelete(id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
