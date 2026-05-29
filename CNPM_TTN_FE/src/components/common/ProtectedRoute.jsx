import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');
  if (!token) {
    return <Navigate to="/" replace />; 
  }
  if (allowedRoles && !allowedRoles.includes(parseInt(userType))) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;