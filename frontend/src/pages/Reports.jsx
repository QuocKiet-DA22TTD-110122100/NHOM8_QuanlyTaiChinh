import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

const categories = {
  food: 'Ăn uống',
  transport: 'Di chuyển',
  utilities: 'Hóa đơn & Tiện ích',
  entertainment: 'Giải trí',
  shopping: 'Mua sắm',
  health: 'Sức khỏe',
  education: 'Giáo dục',
  other: 'Khác'
};

function Reports() {
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    const savedIncomes = JSON.parse(localStorage.getItem('incomes')) || [];
    const savedExpenses = JSON.parse(localStorage.getItem('expenses')) || [];
    setIncomes(savedIncomes);
    setExpenses(savedExpenses);
  }, []);

  // Dữ liệu cho biểu đồ thu chi theo tháng
  const getMonthlyData = () => {
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: `T${i + 1}`,
      income: 0,
      expense: 0
    }));

    incomes.forEach(income => {
      if (income.date.startsWith(selectedYear)) {
        const month = parseInt(income.date.split('-')[1]) - 1;
        monthlyData[month].income += income.amount;
      }
    });

    expenses.forEach(expense => {
      if (expense.date.startsWith(selectedYear)) {
        const month = parseInt(expense.date.split('-')[1]) - 1;
        monthlyData[month].expense += expense.amount;
      }
    });

    return monthlyData;
  };

  // Dữ liệu cho biểu đồ chi tiêu theo danh mục
  const getCategoryData = () => {
    const categoryData = {};
    
    expenses.forEach(expense => {
      if (expense.date.startsWith(selectedYear)) {
        categoryData[expense.category] = (categoryData[expense.category] || 0) + expense.amount;
      }
    });

    return Object.entries(categoryData).map(([category, amount]) => ({
      name: categories[category],
      value: amount
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Báo cáo thống kê</h2>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
        >
          {Array.from({ length: 5 }, (_, i) => {
            const year = new Date().getFullYear() - i;
            return (
              <option key={year} value={year}>
                Năm {year}
              </option>
            );
          })}
        </select>
      </div>

      {/* Biểu đồ thu chi theo tháng */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Thu chi theo tháng</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getMonthlyData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value) => `${value.toLocaleString('vi-VN')} ₫`}
              />
              <Legend />
              <Bar dataKey="income" name="Thu nhập" fill="#10B981" />
              <Bar dataKey="expense" name="Chi tiêu" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Biểu đồ chi tiêu theo danh mục */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Chi tiêu theo danh mục</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getCategoryData()}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {getCategoryData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toLocaleString('vi-VN')} ₫`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ xu hướng chi tiêu */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Xu hướng chi tiêu</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getMonthlyData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `${value.toLocaleString('vi-VN')} ₫`} />
                <Legend />
                <Line type="monotone" dataKey="expense" name="Chi tiêu" stroke="#EF4444" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
