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
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  ChartBarIcon,
  ChartPieIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CalendarIcon,
  DocumentChartBarIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];

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
  const [selectedPeriod, setSelectedPeriod] = useState('year');

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
      expense: 0,
      balance: 0
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

    monthlyData.forEach(data => {
      data.balance = data.income - data.expense;
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

    return Object.entries(categoryData)
      .map(([category, amount]) => ({
        name: categories[category],
        value: amount,
        category: category
      }))
      .sort((a, b) => b.value - a.value);
  };

  // Tính toán thống kê tổng quan
  const getYearlyStats = () => {
    const yearIncomes = incomes.filter(income => income.date.startsWith(selectedYear));
    const yearExpenses = expenses.filter(expense => expense.date.startsWith(selectedYear));
    
    const totalIncome = yearIncomes.reduce((sum, income) => sum + income.amount, 0);
    const totalExpense = yearExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const balance = totalIncome - totalExpense;
    
    // Tính tăng trưởng so với năm trước
    const lastYear = (parseInt(selectedYear) - 1).toString();
    const lastYearIncomes = incomes.filter(income => income.date.startsWith(lastYear));
    const lastYearExpenses = expenses.filter(expense => expense.date.startsWith(lastYear));
    
    const lastYearTotalIncome = lastYearIncomes.reduce((sum, income) => sum + income.amount, 0);
    const lastYearTotalExpense = lastYearExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    const incomeGrowth = lastYearTotalIncome > 0 ? ((totalIncome - lastYearTotalIncome) / lastYearTotalIncome) * 100 : 0;
    const expenseGrowth = lastYearTotalExpense > 0 ? ((totalExpense - lastYearTotalExpense) / lastYearTotalExpense) * 100 : 0;
    
    return {
      totalIncome,
      totalExpense,
      balance,
      incomeGrowth,
      expenseGrowth,
      transactionCount: yearIncomes.length + yearExpenses.length
    };
  };

  const yearlyStats = getYearlyStats();
  const monthlyData = getMonthlyData();
  const categoryData = getCategoryData();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Báo cáo thống kê</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Phân tích chi tiết tình hình tài chính của bạn</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-gray-500" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
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
          <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
            <ArrowDownTrayIcon className="h-5 w-5" />
            <span>Xuất báo cáo</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 p-6 rounded-2xl border border-green-200 dark:border-green-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 dark:text-green-400 text-sm font-medium mb-1">Tổng thu nhập</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {yearlyStats.totalIncome.toLocaleString('vi-VN')} ₫
              </p>
              <div className="flex items-center mt-2">
                {yearlyStats.incomeGrowth >= 0 ? (
                  <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-xs ${yearlyStats.incomeGrowth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {yearlyStats.incomeGrowth >= 0 ? '+' : ''}{yearlyStats.incomeGrowth.toFixed(1)}% so với năm trước
                </span>
              </div>
            </div>
            <div className="bg-green-500 p-3 rounded-xl">
              <TrendingUpIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-900/20 dark:to-pink-800/20 p-6 rounded-2xl border border-red-200 dark:border-red-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 dark:text-red-400 text-sm font-medium mb-1">Tổng chi tiêu</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                {yearlyStats.totalExpense.toLocaleString('vi-VN')} ₫
              </p>
              <div className="flex items-center mt-2">
                {yearlyStats.expenseGrowth >= 0 ? (
                  <TrendingUpIcon className="h-4 w-4 text-red-500 mr-1" />
                ) : (
                  <TrendingDownIcon className="h-4 w-4 text-green-500 mr-1" />
                )}
                <span className={`text-xs ${yearlyStats.expenseGrowth >= 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  {yearlyStats.expenseGrowth >= 0 ? '+' : ''}{yearlyStats.expenseGrowth.toFixed(1)}% so với năm trước
                </span>
              </div>
            </div>
            <div className="bg-red-500 p-3 rounded-xl">
              <TrendingDownIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 dark:text-blue-400 text-sm font-medium mb-1">Số dư ròng</p>
              <p className={`text-2xl font-bold ${yearlyStats.balance >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-red-700 dark:text-red-300'}`}>
                {yearlyStats.balance.toLocaleString('vi-VN')} ₫
              </p>
              <div className="flex items-center mt-2">
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  {yearlyStats.balance >= 0 ? 'Tiết kiệm được' : 'Thâm hụt'}
                </span>
              </div>
            </div>
            <div className="bg-blue-500 p-3 rounded-xl">
              <ChartBarIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 dark:text-purple-400 text-sm font-medium mb-1">Giao dịch</p>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {yearlyStats.transactionCount}
              </p>
              <div className="flex items-center mt-2">
                <span className="text-xs text-purple-600 dark:text-purple-400">
                  Tổng số giao dịch
                </span>
              </div>
            </div>
            <div className="bg-purple-500 p-3 rounded-xl">
              <DocumentChartBarIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Income vs Expense */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Thu chi theo tháng</h3>
            <ChartBarIcon className="h-6 w-6 text-gray-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value) => [value.toLocaleString('vi-VN') + ' ₫', '']}
                />
                <Legend />
                <Bar dataKey="income" name="Thu nhập" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Chi tiêu" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Chi tiêu theo danh mục</h3>
            <ChartPieIcon className="h-6 w-6 text-gray-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={40}
                  paddingAngle={5}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value.toLocaleString('vi-VN') + ' ₫', '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {categoryData.slice(0, 6).map((category, index) => (
              <div key={index} className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-sm text-gray-600 dark:text-gray-400 truncate">{category.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Balance Trend */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Xu hướng số dư</h3>
            <TrendingUpIcon className="h-6 w-6 text-gray-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value) => [value.toLocaleString('vi-VN') + ' ₫', 'Số dư']}
                />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#3B82F6" 
                  fill="url(#colorBalance)"
                  strokeWidth={3}
                />
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Details Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Chi tiết chi tiêu theo danh mục</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Danh mục</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Số tiền</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tỷ lệ</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Xu hướng</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {categoryData.map((category, index) => {
                const percentage = (category.value / yearlyStats.totalExpense) * 100;
                return (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{category.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                      {category.value.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="h-2 rounded-full" 
                            style={{ 
                              width: `${percentage}%`, 
                              backgroundColor: COLORS[index % COLORS.length] 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{percentage.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200">
                        Ổn định
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Reports;
