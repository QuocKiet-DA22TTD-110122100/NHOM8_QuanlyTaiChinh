import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  TrashIcon, 
  BanknotesIcon,
  CalendarIcon,
  TagIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

// Helper function to get user-specific key
const getUserKey = (baseKey) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.id || user?.email || 'anonymous';
  return `${baseKey}_${userId}`;
};

function Income() {
  const [incomes, setIncomes] = useState([]);
  const [filteredIncomes, setFilteredIncomes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'salary'
  });

  const categories = [
    { value: 'salary', label: 'Lương', color: 'bg-blue-100 text-blue-800', icon: '💼' },
    { value: 'business', label: 'Kinh doanh', color: 'bg-green-100 text-green-800', icon: '🏢' },
    { value: 'investment', label: 'Đầu tư', color: 'bg-purple-100 text-purple-800', icon: '📈' },
    { value: 'other', label: 'Khác', color: 'bg-gray-100 text-gray-800', icon: '💰' },
  ];

  useEffect(() => {
    let savedIncomes = JSON.parse(localStorage.getItem(getUserKey('incomes'))) || [];
    
    // Nếu không có dữ liệu, tạo dữ liệu mẫu
    if (savedIncomes.length === 0) {
      const sampleIncomes = [
        {
          id: 1,
          description: 'Lương tháng 7',
          amount: 15000000,
          date: new Date().toISOString().split('T')[0],
          category: 'salary'
        },
        {
          id: 2,
          description: 'Thưởng dự án',
          amount: 5000000,
          date: new Date().toISOString().split('T')[0],
          category: 'business'
        },
        {
          id: 3,
          description: 'Lãi tiết kiệm',
          amount: 2000000,
          date: new Date().toISOString().split('T')[0],
          category: 'investment'
        }
      ];
      savedIncomes = sampleIncomes;
      localStorage.setItem(getUserKey('incomes'), JSON.stringify(sampleIncomes));
    }
    
    setIncomes(savedIncomes);
  }, []);

  // Filter and search effect
  useEffect(() => {
    let filtered = incomes;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(income => income.category === selectedCategory);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(income => 
        income.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredIncomes(filtered);
  }, [incomes, selectedCategory, searchTerm]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newIncome = {
      id: Date.now(),
      ...formData,
      amount: parseFloat(formData.amount)
    };

    const updatedIncomes = [...incomes, newIncome];
    setIncomes(updatedIncomes);
    localStorage.setItem(getUserKey('incomes'), JSON.stringify(updatedIncomes));
    
    toast.success('Thêm thu nhập thành công!');
    setShowForm(false);

    // Reset form
    setFormData({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      category: 'salary'
    });
  };

  const handleDelete = (id) => {
    const updatedIncomes = incomes.filter(income => income.id !== id);
    setIncomes(updatedIncomes);
    localStorage.setItem(getUserKey('incomes'), JSON.stringify(updatedIncomes));
    toast.success('Xóa thu nhập thành công!');
  };

  const totalIncome = filteredIncomes.reduce((sum, income) => sum + income.amount, 0);
  const getCategoryInfo = (categoryValue) => {
    return categories.find(cat => cat.value === categoryValue) || categories[3];
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý thu nhập</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Theo dõi và quản lý các khoản thu nhập của bạn</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Thêm thu nhập</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 p-6 rounded-2xl border border-green-200 dark:border-green-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 dark:text-green-400 text-sm font-medium mb-1">Tổng thu nhập</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {totalIncome.toLocaleString('vi-VN')} ₫
              </p>
            </div>
            <div className="bg-green-500 p-3 rounded-xl">
              <BanknotesIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 dark:text-blue-400 text-sm font-medium mb-1">Số giao dịch</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {filteredIncomes.length}
              </p>
            </div>
            <div className="bg-blue-500 p-3 rounded-xl">
              <CalendarIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 dark:text-purple-400 text-sm font-medium mb-1">Trung bình</p>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {filteredIncomes.length > 0 ? (totalIncome / filteredIncomes.length).toLocaleString('vi-VN') : '0'} ₫
              </p>
            </div>
            <div className="bg-purple-500 p-3 rounded-xl">
              <TagIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Add Income Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 transform transition-all duration-300">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Thêm khoản thu nhập mới</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mô tả</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                  placeholder="Nhập mô tả thu nhập..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Số tiền</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ngày</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Danh mục</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Thêm thu nhập
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo mô tả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
              />
            </div>
          </div>
          
          <div className="sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Income List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Danh sách thu nhập</h3>
        </div>
        
        {filteredIncomes.length === 0 ? (
          <div className="text-center py-12">
            <BanknotesIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Chưa có khoản thu nhập nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ngày</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mô tả</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Danh mục</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Số tiền</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredIncomes.map((income, index) => {
                  const categoryInfo = getCategoryInfo(income.category);
                  return (
                    <tr key={income.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {new Date(income.date).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-white font-medium">
                        {income.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`}>
                          <span className="mr-1">{categoryInfo.icon}</span>
                          {categoryInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600 dark:text-green-400">
                        {income.amount.toLocaleString('vi-VN')} ₫
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDelete(income.id)}
                          className="inline-flex items-center p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Income;
