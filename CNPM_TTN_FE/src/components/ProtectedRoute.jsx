import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles, fallbackTo = "/" }) => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');

  // Trường hợp 1: Chưa đăng nhập -> Đẩy thẳng ra trang chủ/login bên ngoài
  if (!token) {
    alert("Vui lòng đăng nhập để truy cập khu vực này!");
    return <Navigate to="/" replace />; 
  }

  // Trường hợp 2: Sai quyền -> Đẩy về trang chỉ định (ví dụ: quay lại /admin thay vì văng ra ngoài)
  if (allowedRoles && !allowedRoles.includes(parseInt(userType))) {
    alert("Bạn không có quyền truy cập vào khu vực này!");
    return <Navigate to={fallbackTo} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;