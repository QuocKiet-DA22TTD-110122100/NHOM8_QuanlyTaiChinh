import { NavLink, useLocation, Link } from 'react-router-dom';
import {
  HomeIcon,
  BanknotesIcon,
  CreditCardIcon,
  WalletIcon,
  ChartPieIcon,
  SunIcon,
  MoonIcon,
  Bars3Icon,
  SparklesIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  BanknotesIcon as BanknotesIconSolid,
  CreditCardIcon as CreditCardIconSolid,
  WalletIcon as WalletIconSolid,
  ChartPieIcon as ChartPieIconSolid
} from '@heroicons/react/24/solid';

const menuItems = [
  { 
    path: '/', 
    icon: HomeIcon, 
    iconSolid: HomeIconSolid,
    text: 'Tổng quan',
    gradient: 'from-blue-500 to-purple-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    textColor: 'text-blue-600 dark:text-blue-400'
  },
  { 
    path: '/thu-nhap', 
    icon: BanknotesIcon, 
    iconSolid: BanknotesIconSolid,
    text: 'Thu nhập',
    gradient: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    textColor: 'text-green-600 dark:text-green-400'
  },
  { 
    path: '/chi-tieu', 
    icon: CreditCardIcon, 
    iconSolid: CreditCardIconSolid,
    text: 'Chi tiêu',
    gradient: 'from-red-500 to-pink-600',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    textColor: 'text-red-600 dark:text-red-400'
  },
  { 
    path: '/ngan-sach', 
    icon: WalletIcon, 
    iconSolid: WalletIconSolid,
    text: 'Ngân sách',
    gradient: 'from-orange-500 to-yellow-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    textColor: 'text-orange-600 dark:text-orange-400'
  },
  { 
    path: '/bao-cao', 
    icon: ChartPieIcon, 
    iconSolid: ChartPieIconSolid,
    text: 'Báo cáo',
    gradient: 'from-purple-500 to-indigo-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    textColor: 'text-purple-600 dark:text-purple-400'
  },
  {
    path: '/bank-sync',
    icon: BanknotesIcon,
    iconSolid: BanknotesIconSolid,
    text: 'Đồng bộ Ngân hàng',
    gradient: 'from-cyan-500 to-blue-600',
    bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
    textColor: 'text-cyan-600 dark:text-cyan-400'
  },
  {
    path: '/admin/users',
    icon: ShieldCheckIcon,
    iconSolid: ShieldCheckIcon,
    text: 'Quản lý người dùng',
    gradient: 'from-indigo-500 to-blue-600',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    textColor: 'text-indigo-600 dark:text-indigo-400'
  },
  {
    path: '/admin/transactions',
    icon: CreditCardIcon,
    iconSolid: CreditCardIconSolid,
    text: 'Quản lý thu chi',
    gradient: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    textColor: 'text-green-600 dark:text-green-400'
  },
  {
    path: '/admin/categories',
    icon: ChartBarIcon,
    iconSolid: ChartBarIcon,
    text: 'Quản lý danh mục',
    gradient: 'from-pink-500 to-yellow-500',
    bgColor: 'bg-pink-50 dark:bg-pink-900/20',
    textColor: 'text-pink-600 dark:text-pink-400'
  },
  {
    path: '/admin/settings',
    icon: CogIcon,
    iconSolid: CogIcon,
    text: 'Cấu hình hệ thống',
    gradient: 'from-gray-500 to-indigo-500',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20',
    textColor: 'text-gray-700 dark:text-gray-200'
  },
];

function Sidebar({ darkMode, setDarkMode, collapsed = false }) {
  const location = useLocation();

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen sticky top-0 transition-all duration-300 shadow-lg`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        {!collapsed ? (
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Quản lý</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tài chính</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        )}
      </div>
      
      {/* Navigation */}
      <nav className="mt-6 px-3">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const IconComponent = isActive ? item.iconSolid : item.icon;
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`group relative flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 transform hover:scale-105 ${
                  isActive 
                    ? `${item.bgColor} ${item.textColor} shadow-lg` 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${item.gradient} rounded-r-full`}></div>
                )}
                
                {/* Icon */}
                <div className={`flex items-center justify-center w-6 h-6 ${collapsed ? '' : 'mr-3'}`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                
                {/* Text */}
                {!collapsed && (
                  <span className="truncate">{item.text}</span>
                )}
                
                {/* Hover effect */}
                {!isActive && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`group flex items-center ${collapsed ? 'justify-center' : 'justify-center'} w-full px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-all duration-200 transform hover:scale-105`}
        >
          <div className="flex items-center justify-center w-5 h-5 mr-2">
            {darkMode ? (
              <SunIcon className="w-5 h-5" />
            ) : (
              <MoonIcon className="w-5 h-5" />
            )}
          </div>
          {!collapsed && (
            <span>{darkMode ? 'Chế độ sáng' : 'Chế độ tối'}</span>
          )}
        </button>
        
        {/* User info section (if not collapsed) */}
        {!collapsed && (
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-white">U</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">Người dùng</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Tài khoản cá nhân</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
