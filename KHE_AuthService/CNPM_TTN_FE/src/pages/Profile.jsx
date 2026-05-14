import useStore from "../store/useStore";
import { useEffect, useState } from "react";
import axios from "axios";
import Field from "../components/Field";

export default function Profile() {
    const user = useStore((state) => state.user);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        if (user) {
            axios.get(`https://localhost:7012/api/nhanvien/${user.id}`)
                .then(res => setProfile(res.data))
                .catch(err => console.log(err));
        }
    }, [user]);

    if (!user) {
        return <div className="p-10 text-center"> Vui lòng đăng nhập </div>
    }

    if (!profile) {
        return <div className="p-10 text-center">Đang tải...</div>
    }

    return (
        <div className="min-h-screen bg-[#F5EFE6] pt-28 px-6 md:px-12">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold">
                        {profile.tenNV?.charAt(0)}
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-primary">
                            {profile.tenNV}
                        </h2>
                        <p className="text-gray-500">
                            {user.role === "Admin" ? "Quản lý" : "Nhân viên"}
                        </p>
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8">

                    <h3 className="text-xl font-semibold mb-6 text-primary border-b pb-2">
                        Thông tin cá nhân
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <Field label="Tên" value={profile.tenNV} />
                        <Field label="SĐT" value={profile.sdt} />
                        <Field label="Địa chỉ" value={profile.diaChi} />
                        <Field label="Chức vụ" value={profile.chucVu} />
                        <Field label="Ngày sinh" value={formatDate(profile.ngaySinh)} />
                        <Field label="CCCD" value={profile.cmnd} />

                    </div>
                </div>

                {/* Account Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8">

                    <h3 className="text-xl font-semibold mb-6 text-primary border-b pb-2">
                        Thông tin tài khoản
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <Field label="Tên tài khoản" value={user.name} />

                        <Field
                            label="Vai trò"
                            value={user.role === "Admin" ? "Quản lý" : "Nhân viên"}
                            highlight
                        />

                    </div>
                </div>

            </div>
        </div>
    );
}

function formatDate(date) {
    if (!date) return "";

    const d = new Date(date);
    return d.toLocaleDateString("vi-VN");
}