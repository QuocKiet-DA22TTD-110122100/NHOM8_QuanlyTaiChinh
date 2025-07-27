import { useState, useEffect, useRef, useContext } from 'react';
import {
  BellIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App';

function Header({ user: _userProp, onLogout }) {
  const navigate = useNavigate();
  const { user: currentUser } = useContext(UserContext);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);

  const currentTime = new Date().toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const currentDate = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  useEffect(() => {
    // Load notifications from localStorage
    const savedNotifications = JSON.parse(localStorage.getItem('notifications')) || [
      {
        id: 1,
        title: 'Chào mừng bạn!',
        message: 'Cảm ơn bạn đã sử dụng ứng dụng quản lý tài chính',
        time: '5 phút trước',
        read: false,
        type: 'info'
      },
      {
        id: 2,
        title: 'Cảnh báo ngân sách',
        message: 'Bạn đã chi tiêu 80% ngân sách tháng này',
        time: '1 giờ trước',
        read: false,
        type: 'warning'
      },
      {
        id: 3,
        title: 'Giao dịch mới',
        message: 'Đã thêm giao dịch thu nhập 5,000,000 ₫',
        time: '2 giờ trước',
        read: true,
        type: 'success'
      }
    ];
    setNotifications(savedNotifications);

    // Close dropdowns when clicking outside
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const markAsRead = (id) => {
    const updatedNotifications = notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    );
    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.setItem('notifications', JSON.stringify([]));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleProfileClick = () => {
    setShowUserMenu(false);
    navigate('/ho-so');
  };



  const handleLogout = () => {
    setShowUserMenu(false);
    onLogout();
  };

  // Lấy user từ localStorage nếu chưa có
  // let currentUser = user; // This line is removed as user is now from UserContext
  // if (!currentUser) {
  //   try {
  //     currentUser = JSON.parse(localStorage.getItem('user'));
  //   } catch (e) {
  //     currentUser = null;
  //   }
  // }

  // Lấy tên user ưu tiên name, fallback sang email
  const displayName = currentUser?.name || currentUser?.email || 'User';

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left section */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {currentUser ? `Chào mừng, ${displayName}!` : 'Bảng điều khiển'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {currentTime} - {currentDate}
              </p>
            </div>
          </div>

          {/* Center section - Empty space */}
          <div className="flex-1"></div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              >
                <BellIcon className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Thông báo</h3>
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-xs text-red-600 dark:text-red-400 hover:underline"
                      >
                        Xóa tất cả
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        Không có thông báo nào
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 cursor-pointer ${
                            !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${
                                !notification.read ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'
                              }`}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                {notification.time}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 ml-2"></div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:block font-medium">{displayName}</span>
                <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${
                  showUserMenu ? 'rotate-180' : ''
                }`} />
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-2">
                    <button 
                      onClick={handleProfileClick}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                    >
                      <UserIcon className="h-4 w-4" />
                      <span>Hồ sơ cá nhân</span>
                    </button>

                    <hr className="my-2 border-gray-200 dark:border-gray-600" />
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
