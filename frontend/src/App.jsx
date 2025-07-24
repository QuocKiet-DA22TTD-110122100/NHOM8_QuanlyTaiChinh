import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Auth from './components/Auth';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import BankSyncPage from './pages/BankSyncPage';
import './App.css';

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
        {!user ? (
          <Auth onLogin={handleLogin} />
        ) : (
          <DashboardLayout user={user} onLogout={handleLogout}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/bank-sync" element={<BankSyncPage />} />
              <Route path="/thu-nhap" element={<div>Thu nhập page</div>} />
              <Route path="/chi-tieu" element={<div>Chi tiêu page</div>} />
              <Route path="/ngan-sach" element={<div>Ngân sách page</div>} />
              <Route path="/bao-cao" element={<div>Báo cáo page</div>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </DashboardLayout>
        )}
      </div>
    </Router>
  );
}

export default App;
