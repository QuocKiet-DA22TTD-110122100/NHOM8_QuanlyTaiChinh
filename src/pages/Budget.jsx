import { useState, useEffect } from 'react';

const categories = [
  { id: 'food', name: 'Ăn uống' },
  { id: 'transport', name: 'Di chuyển' },
  { id: 'utilities', name: 'Hóa đơn & Tiện ích' },
  { id: 'entertainment', name: 'Giải trí' },
  { id: 'shopping', name: 'Mua sắm' },
  { id: 'health', name: 'Sức khỏe' },
  { id: 'education', name: 'Giáo dục' },
  { id: 'other', name: 'Khác' }
];

function Budget() {
  const [budgets, setBudgets] = useState({});
  const [expenses, setExpenses] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    const savedBudgets = JSON.parse(localStorage.getItem('budgets')) || {};
    const savedExpenses = JSON.parse(localStorage.getItem('expenses')) || [];
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
    localStorage.setItem('budgets', JSON.stringify(updatedBudgets));
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Quản lý ngân sách</h2>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {categories.map(category => {
          const spent = getExpensesByCategory(category.id);
          const budget = getBudgetForCategory(category.id);
          const progress = getProgressPercentage(spent, budget);

          return (
            <div key={category.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white">{category.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Đã chi: {spent.toLocaleString('vi-VN')} ₫
                  </p>
                </div>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="0"
                    value={budget || ''}
                    onChange={(e) => handleBudgetChange(category.id, e.target.value)}
                    placeholder="Ngân sách"
                    className="w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="ml-1 text-gray-500 dark:text-gray-400">₫</span>
                </div>
              </div>

              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200 dark:text-blue-200 dark:bg-blue-800">
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-blue-600 dark:text-blue-400">
                      {budget ? `${budget.toLocaleString('vi-VN')} ₫` : 'Chưa đặt ngân sách'}
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200 dark:bg-blue-800">
                  <div
                    style={{ width: `${progress}%` }}
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                      progress >= 100 ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Budget;
