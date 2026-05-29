import React, { useEffect, useMemo, useState } from 'react';
import { Edit3, Plus, RefreshCcw, Save, Ticket, Trash2, X } from 'lucide-react';
import API from '../../services/api';

const emptyForm = {
  code: '',
  name: '',
  title: '',
  description: '',
  discountType: 'percent',
  discountValue: 10,
  maxDiscount: '',
  minOrderValue: 0,
  maxUsage: 0,
  usageLimit: '',
  paymentMethod: '',
  startDate: '',
  endDate: '',
  isActive: true,
};

const fieldClass = 'w-full h-11 rounded-lg border border-gray-200 px-3 text-sm font-semibold text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 bg-white';

const unwrap = (res) => res.data?.Data ?? res.data?.data ?? res.data;
const pick = (obj, pascal, camel) => obj?.[pascal] ?? obj?.[camel];
const toInputDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 16);
};

export default function Vouchers() {
  const [vouchers, setVouchers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const activeCount = useMemo(() => vouchers.filter((v) => pick(v, 'IsActive', 'isActive')).length, [vouchers]);

  const loadVouchers = async () => {
    setLoading(true);
    try {
      const res = await API.getAllVouchers();
      setVouchers(unwrap(res) || []);
    } catch (error) {
      setMessage(error.response?.data?.Message || error.response?.data?.message || 'Không tải được danh sách voucher.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVouchers();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const startEdit = (voucher) => {
    setEditingId(pick(voucher, 'Id', 'id'));
    setForm({
      code: pick(voucher, 'Code', 'code') || '',
      name: pick(voucher, 'Name', 'name') || '',
      title: pick(voucher, 'Title', 'title') || '',
      description: pick(voucher, 'Description', 'description') || '',
      discountType: pick(voucher, 'DiscountType', 'discountType') || 'percent',
      discountValue: pick(voucher, 'DiscountValue', 'discountValue') || 0,
      maxDiscount: pick(voucher, 'MaxDiscount', 'maxDiscount') || '',
      minOrderValue: pick(voucher, 'MinOrderValue', 'minOrderValue') || 0,
      maxUsage: pick(voucher, 'MaxUsage', 'maxUsage') || 0,
      usageLimit: pick(voucher, 'UsageLimit', 'usageLimit') || '',
      paymentMethod: pick(voucher, 'PaymentMethod', 'paymentMethod') || '',
      startDate: toInputDate(pick(voucher, 'StartDate', 'startDate')),
      endDate: toInputDate(pick(voucher, 'EndDate', 'endDate')),
      isActive: pick(voucher, 'IsActive', 'isActive') ?? true,
    });
  };

  const buildPayload = () => ({
    Code: form.code.trim().toUpperCase(),
    Name: form.name.trim(),
    Title: form.title.trim() || null,
    Description: form.description.trim() || null,
    DiscountType: form.discountType,
    DiscountValue: Number(form.discountValue),
    MaxDiscount: form.maxDiscount === '' ? null : Number(form.maxDiscount),
    MinOrderValue: Number(form.minOrderValue || 0),
    MaxUsage: Number(form.maxUsage || 0),
    UsageLimit: form.usageLimit === '' ? null : Number(form.usageLimit),
    PaymentMethod: form.paymentMethod || null,
    StartDate: form.startDate,
    EndDate: form.endDate,
    IsActive: form.isActive,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      if (editingId) {
        await API.updateVoucher(editingId, buildPayload());
        setMessage('Đã cập nhật voucher.');
      } else {
        await API.createVoucher(buildPayload());
        setMessage('Đã tạo voucher mới.');
      }

      resetForm();
      loadVouchers();
    } catch (error) {
      setMessage(error.response?.data?.Message || error.response?.data?.message || 'Không lưu được voucher.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa voucher này?')) return;

    try {
      await API.deleteVoucher(id);
      loadVouchers();
    } catch (error) {
      setMessage(error.response?.data?.Message || error.response?.data?.message || 'Không xóa được voucher.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-primary font-montserrat flex items-center gap-2">
            <Ticket size={28} /> Voucher & Đổi điểm
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý mã giảm giá công khai và voucher sinh từ chương trình điểm thưởng.
          </p>
        </div>
        <button onClick={loadVouchers} className="inline-flex items-center gap-2 rounded-lg bg-white border px-4 py-2 font-bold text-primary shadow-sm" type="button">
          <RefreshCcw size={16} /> Tải lại
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-5 shadow-sm border">
          <p className="text-xs uppercase font-bold text-gray-400">Tổng voucher</p>
          <p className="text-3xl font-black text-primary">{vouchers.length}</p>
        </div>
        <div className="bg-white rounded-lg p-5 shadow-sm border">
          <p className="text-xs uppercase font-bold text-gray-400">Đang hoạt động</p>
          <p className="text-3xl font-black text-emerald-600">{activeCount}</p>
        </div>
        <div className="bg-white rounded-lg p-5 shadow-sm border">
          <p className="text-xs uppercase font-bold text-gray-400">Đổi điểm</p>
          <p className="text-sm font-bold text-primary mt-2">100 điểm = voucher 10,000đ</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 shadow-sm border space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-primary text-lg">{editingId ? 'Cập nhật voucher' : 'Tạo voucher mới'}</h2>
          {editingId && (
            <button type="button" onClick={resetForm} className="text-gray-500 hover:text-red-500 inline-flex items-center gap-1 text-sm font-bold">
              <X size={16} /> Hủy sửa
            </button>
          )}
        </div>

        {message && <div className="rounded-lg bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 text-sm font-semibold">{message}</div>}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Field label="Mã voucher">
            <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className={fieldClass} placeholder="COFFEE50" />
          </Field>
          <Field label="Tên">
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={fieldClass} />
          </Field>
          <Field label="Kiểu giảm">
            <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })} className={fieldClass}>
              <option value="percent">Phần trăm</option>
              <option value="amount">Số tiền</option>
            </select>
          </Field>
          <Field label="Giá trị giảm">
            <input required type="number" min="1" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} className={fieldClass} />
          </Field>

          <Field label="Giảm tối đa">
            <input type="number" min="0" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} className={fieldClass} placeholder="Bỏ trống nếu không giới hạn" />
          </Field>
          <Field label="Đơn tối thiểu">
            <input type="number" min="0" value={form.minOrderValue} onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })} className={fieldClass} />
          </Field>
          <Field label="Tổng lượt dùng">
            <input type="number" min="0" value={form.maxUsage} onChange={(e) => setForm({ ...form, maxUsage: e.target.value })} className={fieldClass} />
          </Field>
          <Field label="Giới hạn lượt">
            <input type="number" min="0" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} className={fieldClass} placeholder="Mặc định theo tổng lượt" />
          </Field>

          <Field label="Thanh toán">
            <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} className={fieldClass}>
              <option value="">Tất cả</option>
              <option value="COD">COD</option>
              <option value="VNPAY">VNPAY</option>
            </select>
          </Field>
          <Field label="Ngày bắt đầu">
            <input required type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={fieldClass} />
          </Field>
          <Field label="Ngày kết thúc">
            <input required type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className={fieldClass} />
          </Field>
          <Field label="Trạng thái">
            <label className="h-11 flex items-center gap-2 rounded-lg border border-gray-200 px-3 font-bold text-primary">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              Đang bật
            </label>
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Tiêu đề hiển thị">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={fieldClass} />
          </Field>
          <Field label="Mô tả">
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={fieldClass} />
          </Field>
        </div>

        <button type="submit" className="inline-flex items-center gap-2 bg-primary text-white rounded-lg px-5 py-3 font-bold hover:bg-accent-1">
          {editingId ? <Save size={18} /> : <Plus size={18} />} {editingId ? 'Lưu thay đổi' : 'Tạo voucher'}
        </button>
      </form>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Mã</th>
              <th className="px-4 py-3">Giảm</th>
              <th className="px-4 py-3">Điều kiện</th>
              <th className="px-4 py-3">Lượt</th>
              <th className="px-4 py-3">Hạn</th>
              <th className="px-4 py-3">Thanh toán</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-500">Đang tải...</td></tr>
            ) : vouchers.map((voucher) => {
              const id = pick(voucher, 'Id', 'id');
              const type = pick(voucher, 'DiscountType', 'discountType');
              const value = pick(voucher, 'DiscountValue', 'discountValue');
              const used = pick(voucher, 'UsedCount', 'usedCount') || 0;
              const limit = pick(voucher, 'UsageLimit', 'usageLimit') || pick(voucher, 'MaxUsage', 'maxUsage') || 0;
              const isActive = pick(voucher, 'IsActive', 'isActive');

              return (
                <tr key={id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-black text-primary">{pick(voucher, 'Code', 'code')}</p>
                    <p className="text-xs text-gray-500">{pick(voucher, 'Title', 'title') || pick(voucher, 'Name', 'name')}</p>
                  </td>
                  <td className="px-4 py-3 font-bold text-emerald-600">
                    {type === 'percent' ? `${value}%` : `${Number(value).toLocaleString('vi-VN')}đ`}
                    {pick(voucher, 'MaxDiscount', 'maxDiscount') ? (
                      <p className="text-xs text-gray-400 font-normal">tối đa {Number(pick(voucher, 'MaxDiscount', 'maxDiscount')).toLocaleString('vi-VN')}đ</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    Đơn từ {Number(pick(voucher, 'MinOrderValue', 'minOrderValue') || 0).toLocaleString('vi-VN')}đ
                  </td>
                  <td className="px-4 py-3">{used}/{limit || '∞'}</td>
                  <td className="px-4 py-3 text-gray-600">{new Date(pick(voucher, 'EndDate', 'endDate')).toLocaleDateString('vi-VN')}</td>
                  <td className="px-4 py-3">
                    {(() => {
                      const pm = pick(voucher, 'PaymentMethod', 'paymentMethod');
                      if (!pm || pm === 'ALL') return <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600">Tất cả</span>;
                      if (pm === 'COD') return <span className="px-2 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-600">COD</span>;
                      if (pm === 'VNPAY') return <span className="px-2 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600">VNPAY</span>;
                      return <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500">{pm}</span>;
                    })()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {isActive ? 'Bật' : 'Tắt'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => startEdit(voucher)} className="p-2 rounded-lg text-primary hover:bg-primary/10" type="button"><Edit3 size={16} /></button>
                      <button onClick={() => handleDelete(id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50" type="button"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs uppercase font-bold text-gray-500 block mb-1">{label}</span>
      {children}
    </label>
  );
}
