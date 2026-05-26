import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');
  if (!token) {
    // Thay vì /login, hãy về / và kèm theo trạng thái yêu cầu đăng nhập
    alert("Vui lòng đăng nhập để truy cập khu vực này!");
    return <Navigate to="/" replace />; 
  }
  if (allowedRoles && !allowedRoles.includes(parseInt(userType))) {
    alert("Bạn không có quyền truy cập vào khu vực này!");
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;