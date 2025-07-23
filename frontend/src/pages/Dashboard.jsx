import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { 
  CurrencyDollarIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  BanknotesIcon,
  ChartBarIcon,
  EyeIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { reportsAPI, unifiedAPI } from '../services/api';

function Dashboard() {
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    monthlyGrowth: 0,
    transactionCount: 0
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animateCards, setAnimateCards] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Lấy dữ liệu giao dịch
        const transactions = await unifiedAPI.getTransactions();
        
        // Tính toán tổng thu nhập và chi tiêu
        const incomeTransactions = transactions.filter(t => t.type === 'income');
        const expenseTransactions = transactions.filter(t => t.type === 'expense');
        
        const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
        const balance = totalIncome - totalExpense;
        
        // Tính tăng trưởng theo tháng (so với tháng trước)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        
        const currentMonthTransactions = transactions.filter(t => {
          const date = new Date(t.date);
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });
        
        const lastMonthTransactions = transactions.filter(t => {
          const date = new Date(t.date);
          return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
        });
        
        const currentMonthBalance = currentMonthTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0) - 
          currentMonthTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
          
        const lastMonthBalance = lastMonthTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0) - 
          lastMonthTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
          
        const monthlyGrowth = lastMonthBalance !== 0 
          ? ((currentMonthBalance - lastMonthBalance) / Math.abs(lastMonthBalance)) * 100
          : currentMonthBalance > 0 ? 100 : 0;
        
        setSummary({
          totalIncome,
          totalExpense,
          balance,
          monthlyGrowth: parseFloat(monthlyGrowth.toFixed(1)),
          transactionCount: transactions.length
        });
        
        // Tạo dữ liệu biểu đồ theo tháng (6 tháng gần nhất)
        const monthlyChartData = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const month = date.getMonth();
          const year = date.getFullYear();
          
          const monthTransactions = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate.getMonth() === month && tDate.getFullYear() === year;
          });
          
          const income = monthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
          const expense = monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
          
          monthlyChartData.push({
            name: `T${month + 1}`,
            income,
            expense
          });
        }
        setMonthlyData(monthlyChartData);
        
        // Tạo dữ liệu phân bổ chi tiêu theo danh mục
        // Bản đồ chuyển mã danh mục sang nhãn tiếng Việt
        const labelMap = {
          food: 'Ăn uống',
          transport: 'Di chuyển',
          utilities: 'Hóa đơn & Tiện ích',
          entertainment: 'Giải trí',
          shopping: 'Mua sắm',
          health: 'Sức khỏe',
          education: 'Giáo dục',
          other: 'Khác'
        };
        // Gom nhóm chi tiêu theo danh mục
        const categoryExpenses = {};
        expenseTransactions.forEach(t => {
          // `t.category` có thể là chuỗi (giá trị danh mục) hoặc object
          const categoryName = (typeof t.category === 'string' && t.category)
            || t.category?.name
            || t.categoryName
            || 'Khác';
          const displayName = labelMap[(categoryName || '').toLowerCase()] || categoryName;
          categoryExpenses[displayName] = (categoryExpenses[displayName] || 0) + t.amount;
        });
        
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
        const categoryData = Object.entries(categoryExpenses)
          .map(([name, value], index) => ({
            name,
            value,
            color: colors[index % colors.length]
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 7); // Lấy top 7 danh mục
          
        setExpenseCategories(categoryData);
        
        // Tạo dữ liệu xu hướng số dư (6 tháng gần nhất)
        const trendChartData = [];
        let runningBalance = 0;
        
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const month = date.getMonth();
          const year = date.getFullYear();
          
          const monthTransactions = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate.getMonth() === month && tDate.getFullYear() === year;
          });
          
          const monthIncome = monthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
          const monthExpense = monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
          
          runningBalance += (monthIncome - monthExpense);
          
          trendChartData.push({
            name: `T${month + 1}`,
            balance: runningBalance
          });
        }
        setTrendData(trendChartData);
        
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu dashboard:', error);
        // Fallback to empty data
        setSummary({
          totalIncome: 0,
          totalExpense: 0,
          balance: 0,
          monthlyGrowth: 0,
          transactionCount: 0
        });
        setMonthlyData([]);
        setExpenseCategories([]);
        setTrendData([]);
      } finally {
        setLoading(false);
        setTimeout(() => setAnimateCards(true), 100);
      }
    };
    
    fetchDashboardData();
  }, []);



  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-gray-200 h-32 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-200 h-80 rounded-xl"></div>
          <div className="bg-gray-200 h-80 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tổng quan tài chính</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Theo dõi tình hình tài chính của bạn</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <CalendarIcon className="h-4 w-4" />
          <span>{new Date().toLocaleDateString('vi-VN')}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Income Card */}
        <div className={`bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-2xl border border-green-200 dark:border-green-700 transform transition-all duration-500 hover:scale-105 hover:shadow-lg ${
          animateCards ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 dark:text-green-400 text-sm font-medium mb-1">Tổng thu nhập</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {summary.totalIncome.toLocaleString('vi-VN')} ₫
              </p>
              <div className="flex items-center mt-2">
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-xs text-green-600 dark:text-green-400">+8.2% so với tháng trước</span>
              </div>
            </div>
            <div className="bg-green-500 p-3 rounded-xl">
              <BanknotesIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Total Expense Card */}
        <div className={`bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-6 rounded-2xl border border-red-200 dark:border-red-700 transform transition-all duration-500 hover:scale-105 hover:shadow-lg ${
          animateCards ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`} style={{animationDelay: '100ms'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 dark:text-red-400 text-sm font-medium mb-1">Tổng chi tiêu</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                {summary.totalExpense.toLocaleString('vi-VN')} ₫
              </p>
              <div className="flex items-center mt-2">
                <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-xs text-red-600 dark:text-red-400">-3.1% so với tháng trước</span>
              </div>
            </div>
            <div className="bg-red-500 p-3 rounded-xl">
              <CurrencyDollarIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div className={`bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-700 transform transition-all duration-500 hover:scale-105 hover:shadow-lg ${
          animateCards ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`} style={{animationDelay: '200ms'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 dark:text-blue-400 text-sm font-medium mb-1">Số dư hiện tại</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {summary.balance.toLocaleString('vi-VN')} ₫
              </p>
              <div className="flex items-center mt-2">
                <ArrowTrendingUpIcon className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  {summary.monthlyGrowth > 0 ? '+' : ''}{summary.monthlyGrowth}% tháng này
                </span>
              </div>
            </div>
            <div className="bg-blue-500 p-3 rounded-xl">
              <ChartBarIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Transactions Card */}
        <div className={`bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-700 transform transition-all duration-500 hover:scale-105 hover:shadow-lg ${
          animateCards ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`} style={{animationDelay: '300ms'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 dark:text-purple-400 text-sm font-medium mb-1">Giao dịch</p>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {summary.transactionCount}
              </p>
              <div className="flex items-center mt-2">
                <EyeIcon className="h-4 w-4 text-purple-500 mr-1" />
                <span className="text-xs text-purple-600 dark:text-purple-400">Tháng này</span>
              </div>
            </div>
            <div className="bg-purple-500 p-3 rounded-xl">
              <ArrowTrendingUpIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Income vs Expense Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Thu chi theo tháng</h3>
            <div className="flex space-x-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Thu nhập</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Chi tiêu</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#666" />
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
                <Bar dataKey="income" name="Thu nhập" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Chi tiêu" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Categories Pie Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Phân bổ chi tiêu</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseCategories}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={40}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value.toLocaleString('vi-VN') + ' ₫', '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {expenseCategories.map((category, index) => (
              <div key={index} className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: category.color }}></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">{category.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Balance Trend Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Xu hướng số dư</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#666" />
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
              <Line 
                type="monotone" 
                dataKey="balance" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
