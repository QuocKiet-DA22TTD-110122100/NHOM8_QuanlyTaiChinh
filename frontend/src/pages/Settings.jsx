import { useState, useEffect } from 'react';
import { 
  CogIcon,
  BellIcon,
  MoonIcon,
  SunIcon,
  LanguageIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

function Settings() {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      budget: true,
      transactions: false
    },
    appearance: {
      darkMode: false,
      language: 'vi',
      currency: 'VND'
    },
    privacy: {
      showBalance: true,
      dataSharing: false,
      analytics: true
    },
    security: {
      twoFactor: false,
      sessionTimeout: 30
    }
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = JSON.parse(localStorage.getItem('settings')) || settings;
    setSettings(savedSettings);
  }, []);

  const updateSettings = (section, key, value) => {
    const newSettings = {
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value
      }
    };
    setSettings(newSettings);
    localStorage.setItem('settings', JSON.stringify(newSettings));
    toast.success('Cài đặt đã được cập nhật!');
  };

  const exportData = () => {
    const data = {
      incomes: JSON.parse(localStorage.getItem('incomes') || '[]'),
      expenses: JSON.parse(localStorage.getItem('expenses') || '[]'),
      budgets: JSON.parse(localStorage.getItem('budgets') || '{}'),
      settings: settings
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Dữ liệu đã được xuất thành công!');
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.incomes) localStorage.setItem('incomes', JSON.stringify(data.incomes));
          if (data.expenses) localStorage.setItem('expenses', JSON.stringify(data.expenses));
          if (data.budgets) localStorage.setItem('budgets', JSON.stringify(data.budgets));
          if (data.settings) {
            setSettings(data.settings);
            localStorage.setItem('settings', JSON.stringify(data.settings));
          }
          toast.success('Dữ liệu đã được nhập thành công!');
        } catch (error) {
          toast.error('File không hợp lệ!');
        }
      };
      reader.readAsText(file);
    }
  };

  const deleteAllData = () => {
    localStorage.removeItem('incomes');
    localStorage.removeItem('expenses');
    localStorage.removeItem('budgets');
    localStorage.removeItem('settings');
    setShowDeleteConfirm(false);
    toast.success('Tất cả dữ liệu đã được xóa!');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-8 text-white">
        <div className="flex items-center">
          <CogIcon className="h-8 w-8 mr-3" />
          <div>
            <h1 className="text-3xl font-bold mb-2">Cài đặt</h1>
            <p className="text-purple-100">Tùy chỉnh ứng dụng theo ý muốn của bạn</p>
          </div>
        </div>
      </div>

      {/* Notifications Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-6">
          <BellIcon className="h-6 w-6 text-blue-500 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Thông báo</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Thông báo email</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Nhận thông báo qua email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.email}
                onChange={(e) => updateSettings('notifications', 'email', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Thông báo push</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Nhận thông báo trên trình duyệt</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.push}
                onChange={(e) => updateSettings('notifications', 'push', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Cảnh báo ngân sách</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Thông báo khi vượt ngân sách</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.budget}
                onChange={(e) => updateSettings('notifications', 'budget', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Appearance Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-6">
          {settings.appearance.darkMode ? (
            <MoonIcon className="h-6 w-6 text-indigo-500 mr-3" />
          ) : (
            <SunIcon className="h-6 w-6 text-yellow-500 mr-3" />
          )}
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Giao diện</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Chế độ tối</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Sử dụng giao diện tối</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.appearance.darkMode}
                onChange={(e) => updateSettings('appearance', 'darkMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Ngôn ngữ</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Chọn ngôn ngữ hiển thị</p>
            </div>
            <select
              value={settings.appearance.language}
              onChange={(e) => updateSettings('appearance', 'language', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Đơn vị tiền tệ</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Chọn đơn vị tiền tệ</p>
            </div>
            <select
              value={settings.appearance.currency}
              onChange={(e) => updateSettings('appearance', 'currency', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="VND">VND (₫)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-6">
          <ShieldCheckIcon className="h-6 w-6 text-green-500 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quyền riêng tư</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Hiển thị số dư</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Hiển thị số dư trên dashboard</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.privacy.showBalance}
                onChange={(e) => updateSettings('privacy', 'showBalance', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Chia sẻ dữ liệu</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Chia sẻ dữ liệu ẩn danh để cải thiện dịch vụ</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.privacy.dataSharing}
                onChange={(e) => updateSettings('privacy', 'dataSharing', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-6">
          <ArrowDownTrayIcon className="h-6 w-6 text-blue-500 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quản lý dữ liệu</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Xuất dữ liệu</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tải xuống tất cả dữ liệu của bạn</p>
            </div>
            <button
              onClick={exportData}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              <span>Xuất</span>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Nhập dữ liệu</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Khôi phục dữ liệu từ file backup</p>
            </div>
            <label className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg cursor-pointer transition-colors duration-200">
              <ArrowUpTrayIcon className="h-4 w-4" />
              <span>Nhập</span>
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-red-600 dark:text-red-400">Xóa tất cả dữ liệu</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Xóa vĩnh viễn tất cả dữ liệu</p>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
            >
              <TrashIcon className="h-4 w-4" />
              <span>Xóa</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-blur flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Xác nhận xóa dữ liệu
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Bạn có chắc chắn muốn xóa tất cả dữ liệu? Hành động này không thể hoàn tác.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={deleteAllData}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
              >
                Xóa
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors duration-200"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;
