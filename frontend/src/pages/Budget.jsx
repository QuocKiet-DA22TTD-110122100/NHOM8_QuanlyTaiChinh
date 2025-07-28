import { useState, useEffect } from 'react';
import { 
  WalletIcon, 
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlusIcon,
  PencilIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

// Helper function to get user-specific key
const getUserKey = (baseKey) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.id || user?.email || 'anonymous';
  return `${baseKey}_${userId}`;
};

const categories = [
  { id: 'food', name: 'Ăn uống', color: 'bg-red-100 text-red-800', icon: '🍴', budgetColor: 'from-red-500 to-pink-600' },
  { id: 'transport', name: 'Di chuyển', color: 'bg-blue-100 text-blue-800', icon: '🚗', budgetColor: 'from-blue-500 to-indigo-600' },
  { id: 'utilities', name: 'Hóa đơn & Tiện ích', color: 'bg-yellow-100 text-yellow-800', icon: '⚡', budgetColor: 'from-yellow-500 to-orange-600' },
  { id: 'entertainment', name: 'Giải trí', color: 'bg-purple-100 text-purple-800', icon: '🎬', budgetColor: 'from-purple-500 to-indigo-600' },
  { id: 'shopping', name: 'Mua sắm', color: 'bg-pink-100 text-pink-800', icon: '🛍️', budgetColor: 'from-pink-500 to-rose-600' },
  { id: 'health', name: 'Sức khỏe', color: 'bg-green-100 text-green-800', icon: '🏥', budgetColor: 'from-green-500 to-emerald-600' },
  { id: 'education', name: 'Giáo dục', color: 'bg-indigo-100 text-indigo-800', icon: '📚', budgetColor: 'from-indigo-500 to-blue-600' },
  { id: 'other', name: 'Khác', color: 'bg-gray-100 text-gray-800', icon: '💰', budgetColor: 'from-gray-500 to-slate-600' }
];

function Budget() {
  const [budgets, setBudgets] = useState({});
  const [expenses, setExpenses] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [editingCategory, setEditingCategory] = useState(null);
  const [tempBudget, setTempBudget] = useState('');

  useEffect(() => {
    let savedBudgets = JSON.parse(localStorage.getItem(getUserKey('budgets'))) || {};
    let savedExpenses = JSON.parse(localStorage.getItem(getUserKey('expenses'))) || [];
    
    // Nếu không có dữ liệu ngân sách, tạo dữ liệu mẫu
    const currentMonth = new Date().toISOString().slice(0, 7);
    if (!savedBudgets[currentMonth]) {
      const sampleBudgets = {
        [currentMonth]: {
          food: 5000000,
          transport: 3000000,
          utilities: 2000000,
          entertainment: 1500000,
          shopping: 2000000,
          health: 1000000,
          education: 3000000,
          other: 1000000
        }
      };
      savedBudgets = { ...savedBudgets, ...sampleBudgets };
      localStorage.setItem(getUserKey('budgets'), JSON.stringify(savedBudgets));
    }
    
    setBudgets(savedBudgets);
    setExpenses(savedExpenses);
  }, []);

  const handleBudgetChange = (category, value) => {
    const updatedBudgets = {
      ...budgets,
      [selectedMonth]: {
        ...(budgets[selectedMonth] || {}),
        [category]: parseFloat(value) || 0
      }
    };
    setBudgets(updatedBudgets);
    localStorage.setItem(getUserKey('budgets'), JSON.stringify(updatedBudgets));
    toast.success('Cập nhật ngân sách thành công!');
  };

  const getExpensesByCategory = (category) => {
    return expenses
      .filter(expense => 
        expense.category === category && 
        expense.date.startsWith(selectedMonth)
      )
      .reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getBudgetForCategory = (category) => {
    return budgets[selectedMonth]?.[category] || 0;
  };

  const getProgressPercentage = (spent, budget) => {
    if (budget === 0) return 0;
    return Math.min((spent / budget) * 100, 100);
  };

  const getTotalBudget = () => {
    return Object.values(budgets[selectedMonth] || {}).reduce((sum, budget) => sum + budget, 0);
  };

  const getTotalSpent = () => {
    return categories.reduce((sum, cat) => sum + getExpensesByCategory(cat.id), 0);
  };

  const getOverBudgetCategories = () => {
    return categories.filter(cat => {
      const spent = getExpensesByCategory(cat.id);
      const budget = getBudgetForCategory(cat.id);
      return budget > 0 && spent > budget;
    });
  };

  const startEdit = (categoryId) => {
    setEditingCategory(categoryId);
    setTempBudget(getBudgetForCategory(categoryId).toString());
  };

  const saveEdit = (categoryId) => {
    handleBudgetChange(categoryId, tempBudget);
    setEditingCategory(null);
    setTempBudget('');
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setTempBudget('');
  };

  const totalBudget = getTotalBudget();
  const totalSpent = getTotalSpent();
  const overBudgetCategories = getOverBudgetCategories();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý ngân sách</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Theo dõi và kiểm soát chi tiêu theo từng danh mục</p>
        </div>
        <div className="flex items-center space-x-3">
          <CalendarIcon className="h-5 w-5 text-gray-500" />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 dark:text-blue-400 text-sm font-medium mb-1">Tổng ngân sách</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {totalBudget.toLocaleString('vi-VN')} ₫
              </p>
            </div>
            <div className="bg-blue-500 p-3 rounded-xl">
              <WalletIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-6 rounded-2xl border border-red-200 dark:border-red-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 dark:text-red-400 text-sm font-medium mb-1">Đã chi tiêu</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                {totalSpent.toLocaleString('vi-VN')} ₫
              </p>
            </div>
            <div className="bg-red-500 p-3 rounded-xl">
              <ChartBarIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-2xl border border-green-200 dark:border-green-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 dark:text-green-400 text-sm font-medium mb-1">Còn lại</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {(totalBudget - totalSpent).toLocaleString('vi-VN')} ₫
              </p>
            </div>
            <div className="bg-green-500 p-3 rounded-xl">
              <CheckCircleIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {overBudgetCategories.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Cảnh báo vượt ngân sách</h3>
              <p className="text-red-600 dark:text-red-300 mt-1">
                {overBudgetCategories.length} danh mục đã vượt ngân sách: {overBudgetCategories.map(cat => cat.name).join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Budget Categories */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {categories.map(category => {
          const spent = getExpensesByCategory(category.id);
          const budget = getBudgetForCategory(category.id);
          const progress = getProgressPercentage(spent, budget);
          const isOverBudget = budget > 0 && spent > budget;
          const isEditing = editingCategory === category.id;

          return (
            <div key={category.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{category.name}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${category.color}`}>
                      {category.name}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {isEditing ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        value={tempBudget}
                        onChange={(e) => setTempBudget(e.target.value)}
                        className="w-24 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="0"
                        autoFocus
                      />
                      <button
                        onClick={() => saveEdit(category.id)}
                        className="p-1 text-green-600 hover:text-green-700 dark:text-green-400"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-1 text-gray-600 hover:text-gray-700 dark:text-gray-400"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {budget > 0 ? `${budget.toLocaleString('vi-VN')} ₫` : 'Chưa đặt'}
                      </span>
                      <button
                        onClick={() => startEdit(category.id)}
                        className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Đã chi tiêu:</span>
                  <span className={`font-semibold ${isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-white'}`}>
                    {spent.toLocaleString('vi-VN')} ₫
                  </span>
                </div>

                {budget > 0 && (
                  <>
                    <div className="relative">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${
                            isOverBudget 
                              ? 'bg-gradient-to-r from-red-500 to-red-600' 
                              : `bg-gradient-to-r ${category.budgetColor}`
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                      </div>
                      {isOverBudget && (
                        <div className="absolute top-0 right-0 h-3 bg-red-600 rounded-r-full" style={{ width: '4px' }}></div>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className={`font-medium ${isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                        {progress.toFixed(1)}%
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        Còn lại: {Math.max(0, budget - spent).toLocaleString('vi-VN')} ₫
                      </span>
                    </div>

                    {isOverBudget && (
                      <div className="flex items-center space-x-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <ExclamationTriangleIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                          Vượt ngân sách {(spent - budget).toLocaleString('vi-VN')} ₫
                        </span>
                      </div>
                    )}
                  </>
                )}

                {budget === 0 && (
                  <button
                    onClick={() => startEdit(category.id)}
                    className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span className="text-sm">Đặt ngân sách</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Budget;
