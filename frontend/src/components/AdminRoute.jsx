import { Navigate } from 'react-router-dom';

export default function AdminRoute({ children }) {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch (e) {
    user = null;
  }
  if (user?.role !== 'admin') {
    // Nếu không phải admin, chuyển hướng về trang chủ
    return <Navigate to="/" replace />;
  }
  return children;
} 