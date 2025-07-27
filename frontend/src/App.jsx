import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';
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
import Reports from './pages/Reports';
import Income from './pages/Income';
import Expense from './pages/Expense';
import Budget from './pages/Budget';
import Profile from './pages/Profile';
import AdminRoute from './components/AdminRoute';

export const UserContext = createContext({ user: null, setUser: () => {} });

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
                <Route path="/thu-nhap" element={<Income />} />
                <Route path="/chi-tieu" element={<Expense />} />
                <Route path="/ngan-sach" element={<Budget />} />
                <Route path="/bao-cao" element={<Reports />} />
                <Route path="/ho-so" element={<Profile />} />
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
    let userData = null;
    try {
      userData = JSON.parse(localStorage.getItem('user'));
    } catch {}
    if (token && userData) {
      setUser(userData);
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
    <UserContext.Provider value={{ user, setUser }}>
      <Router>
        <div className="App">
          <AnimatedRoutes user={user} handleLogin={handleLogin} handleLogout={handleLogout} />
        </div>
      </Router>
    </UserContext.Provider>
  );
}

export default App;
