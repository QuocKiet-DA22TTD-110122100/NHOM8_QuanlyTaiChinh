import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const mockUsers = ['Tất cả', 'Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C'];
const mockCategories = ['Tất cả', 'Ăn uống', 'Lương', 'Đi lại'];
const mockData = [
  { month: 'T1', income: 15000000, expense: 5000000, balance: 10000000, category: 'Lương' },
  { month: 'T2', income: 12000000, expense: 6000000, balance: 6000000, category: 'Ăn uống' },
  { month: 'T3', income: 17000000, expense: 7000000, balance: 10000000, category: 'Đi lại' },
  { month: 'T4', income: 14000000, expense: 4000000, balance: 10000000, category: 'Lương' },
  { month: 'T5', income: 16000000, expense: 8000000, balance: 8000000, category: 'Ăn uống' },
  { month: 'T6', income: 18000000, expense: 9000000, balance: 9000000, category: 'Đi lại' },
];
const pieData = [
  { name: 'Ăn uống', value: 12000000 },
  { name: 'Lương', value: 40000000 },
  { name: 'Đi lại', value: 6000000 },
];
const COLORS = ['#10B981', '#6366F1', '#F59E42', '#EF4444', '#60A5FA', '#FBBF24'];

export default function AdminReports() {
  const [year, setYear] = useState('2023');
  const [month, setMonth] = useState('all');
  const [user, setUser] = useState('Tất cả');
  const [category, setCategory] = useState('Tất cả');

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Thống kê tài chính</h1>
      <div className="flex flex-wrap gap-4 mb-8">
        <select className="px-3 py-2 border rounded" value={year} onChange={e => setYear(e.target.value)}>
          <option value="2023">2023</option>
          <option value="2022">2022</option>
        </select>
        <select className="px-3 py-2 border rounded" value={month} onChange={e => setMonth(e.target.value)}>
          <option value="all">Cả năm</option>
          {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => <option key={m} value={m}>{`Tháng ${m}`}</option>)}
        </select>
        <select className="px-3 py-2 border rounded" value={user} onChange={e => setUser(e.target.value)}>
          {mockUsers.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
        <select className="px-3 py-2 border rounded" value={category} onChange={e => setCategory(e.target.value)}>
          {mockCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Xuất PDF</button>
        <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Xuất Excel</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
        {/* Line Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow border">
          <h2 className="font-semibold mb-2">Xu hướng thu/chi theo tháng</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={mockData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="income" name="Thu nhập" stroke="#10B981" strokeWidth={3} dot={false} isAnimationActive={true} />
              <Line type="monotone" dataKey="expense" name="Chi tiêu" stroke="#EF4444" strokeWidth={3} dot={false} isAnimationActive={true} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Bar Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow border">
          <h2 className="font-semibold mb-2">So sánh tổng thu/chi từng tháng</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mockData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" name="Thu nhập" fill="#10B981" radius={[4, 4, 0, 0]} isAnimationActive={true} />
              <Bar dataKey="expense" name="Chi tiêu" fill="#EF4444" radius={[4, 4, 0, 0]} isAnimationActive={true} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Pie Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow border">
          <h2 className="font-semibold mb-2">Tỷ trọng các danh mục</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label isAnimationActive={true}>
                {pieData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Bảng dữ liệu tổng hợp */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow border">
        <h2 className="font-semibold mb-4">Bảng tổng hợp thu chi</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                <th className="py-2 px-4">Tháng</th>
                <th className="py-2 px-4">Thu nhập</th>
                <th className="py-2 px-4">Chi tiêu</th>
                <th className="py-2 px-4">Số dư</th>
                <th className="py-2 px-4">Danh mục nổi bật</th>
              </tr>
            </thead>
            <tbody>
              {mockData.map(row => (
                <tr key={row.month} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="py-2 px-4 font-medium">{row.month}</td>
                  <td className="py-2 px-4 text-green-600">{row.income.toLocaleString('vi-VN')} ₫</td>
                  <td className="py-2 px-4 text-red-600">{row.expense.toLocaleString('vi-VN')} ₫</td>
                  <td className="py-2 px-4 font-semibold">{row.balance.toLocaleString('vi-VN')} ₫</td>
                  <td className="py-2 px-4">{row.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 