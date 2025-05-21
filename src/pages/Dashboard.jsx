import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Dashboard() {
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0
  });

  useEffect(() => {
    // Lấy dữ liệu từ localStorage
    const incomes = JSON.parse(localStorage.getItem('incomes')) || [];
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];

    const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
    const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);

    setSummary({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense
    });
  }, []);

  const data = [
    { name: 'T1', income: 5000000, expense: 3000000 },
    { name: 'T2', income: 6000000, expense: 4000000 },
    { name: 'T3', income: 4500000, expense: 3500000 },
    { name: 'T4', income: 7000000, expense: 5000000 },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Tổng quan tài chính</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tổng thu nhập</h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {summary.totalIncome.toLocaleString('vi-VN')} ₫
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tổng chi tiêu</h3>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {summary.totalExpense.toLocaleString('vi-VN')} ₫
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Số dư</h3>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {summary.balance.toLocaleString('vi-VN')} ₫
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Biểu đồ thu chi theo tháng</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" name="Thu nhập" fill="#10B981" />
              <Bar dataKey="expense" name="Chi tiêu" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
