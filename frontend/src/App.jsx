import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import Auth from './components/Auth';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import BankSyncPage from './pages/BankSyncPage';
import AdminUsers from './pages/AdminUsers';
import AdminTransactions from './pages/AdminTransactions';
import AdminCategories from './pages/AdminCategories';
import AdminSystemSettings from './pages/AdminSystemSettings';
import AdminReports from './pages/AdminReports';
import AdminRoute from './components/AdminRoute';

function AnimatedRoutes({ user, handleLogin, handleLogout }) {
  const location = useLocation();
  return (
    <TransitionGroup component={null}>
      <CSSTransition key={location.pathname} classNames="page" timeout={400}>
        <div className="page-transition">
          {!user ? (
            <Auth onLogin={handleLogin} />
          ) : (
            <DashboardLayout user={user} onLogout={handleLogout}>
              <Routes location={location}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/bank-sync" element={<BankSyncPage />} />
                <Route path="/thu-nhap" element={<div>Thu nhập page</div>} />
                <Route path="/chi-tieu" element={<div>Chi tiêu page</div>} />
                <Route path="/ngan-sach" element={<div>Ngân sách page</div>} />
                <Route path="/bao-cao" element={<div>Báo cáo page</div>} />
                <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
                <Route path="/admin/transactions" element={<AdminRoute><AdminTransactions /></AdminRoute>} />
                <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
                <Route path="/admin/settings" element={<AdminRoute><AdminSystemSettings /></AdminRoute>} />
                <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </DashboardLayout>
          )}
        </div>
      </CSSTransition>
    </TransitionGroup>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      // Validate token and get user info
      setUser({ name: 'User' }); // Mock user
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <AnimatedRoutes user={user} handleLogin={handleLogin} handleLogout={handleLogout} />
      </div>
    </Router>
  );
}

export default App;
