import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  BanknotesIcon,
  CreditCardIcon,
  WalletIcon,
  ChartPieIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';

const menuItems = [
  { path: '/', icon: HomeIcon, text: 'Tổng quan' },
  { path: '/thu-nhap', icon: BanknotesIcon, text: 'Thu nhập' },
  { path: '/chi-tieu', icon: CreditCardIcon, text: 'Chi tiêu' },
  { path: '/ngan-sach', icon: WalletIcon, text: 'Ngân sách' },
  { path: '/bao-cao', icon: ChartPieIcon, text: 'Báo cáo' },
];

function Sidebar({ darkMode, setDarkMode }) {
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen sticky top-0">
      <div className="p-4">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Quản lý Tài chính</h1>
      </div>
      
      <nav className="mt-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                isActive ? 'bg-gray-100 dark:bg-gray-700' : ''
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            <span>{item.text}</span>
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-0 w-full p-4">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="flex items-center justify-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          {darkMode ? (
            <SunIcon className="w-5 h-5 mr-2" />
          ) : (
            <MoonIcon className="w-5 h-5 mr-2" />
          )}
          {darkMode ? 'Chế độ sáng' : 'Chế độ tối'}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
