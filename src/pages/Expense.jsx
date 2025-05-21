import { useState, useEffect } from 'react';

function Expense() {
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'food'
  });

  useEffect(() => {
    const savedExpenses = JSON.parse(localStorage.getItem('expenses')) || [];
    setExpenses(savedExpenses);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newExpense = {
      id: Date.now(),
      ...formData,
      amount: parseFloat(formData.amount)
    };

    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);
    localStorage.setItem('expenses', JSON.stringify(updatedExpenses));

    // Reset form
    setFormData({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      category: 'food'
    });
  };

  const handleDelete = (id) => {
    const updatedExpenses = expenses.filter(expense => expense.id !== id);
    setExpenses(updatedExpenses);
    localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Quản lý chi tiêu</h2>

      {/* Form thêm chi tiêu */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Thêm khoản chi tiêu mới</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mô tả</label>
              <input
                type="text"
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Số tiền</label>
              <input
                type="number"
                required
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ngày</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Danh mục</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="food">Ăn uống</option>
                <option value="transport">Di chuyển</option>
                <option value="utilities">Hóa đơn & Tiện ích</option>
                <option value="entertainment">Giải trí</option>
                <option value="shopping">Mua sắm</option>
                <option value="health">Sức khỏe</option>
                <option value="education">Giáo dục</option>
                <option value="other">Khác</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Thêm chi tiêu
            </button>
          </div>
        </form>
      </div>

      {/* Bảng danh sách chi tiêu */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow overflow-x-auto">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Danh sách chi tiêu</h3>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ngày</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mô tả</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Danh mục</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Số tiền</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {expenses.map((expense) => (
              <tr key={expense.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{expense.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-white">{expense.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {expense.category === 'food' && 'Ăn uống'}
                  {expense.category === 'transport' && 'Di chuyển'}
                  {expense.category === 'utilities' && 'Hóa đơn & Tiện ích'}
                  {expense.category === 'entertainment' && 'Giải trí'}
                  {expense.category === 'shopping' && 'Mua sắm'}
                  {expense.category === 'health' && 'Sức khỏe'}
                  {expense.category === 'education' && 'Giáo dục'}
                  {expense.category === 'other' && 'Khác'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">
                  {expense.amount.toLocaleString('vi-VN')} ₫
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Expense;
