import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Income from './pages/Income';
import Expense from './pages/Expense';
import Budget from './pages/Budget';
import Reports from './pages/Reports';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <Router>
      <div className={`min-h-screen flex ${darkMode ? 'dark' : ''}`}>
        <Sidebar setDarkMode={setDarkMode} darkMode={darkMode} />
        <main className="flex-1 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/thu-nhap" element={<Income />} />
              <Route path="/chi-tieu" element={<Expense />} />
              <Route path="/ngan-sach" element={<Budget />} />
              <Route path="/bao-cao" element={<Reports />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
