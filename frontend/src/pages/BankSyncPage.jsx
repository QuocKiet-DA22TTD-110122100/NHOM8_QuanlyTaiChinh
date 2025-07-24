import React, { useState, useEffect } from 'react';
import {
  BanknotesIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

const BankSyncPage = () => {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [accountNumber, setAccountNumber] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, loading, success, error

  // Mock data for demo
  const mockTransactions = [
    {
      id: '1',
      date: '2025-01-23',
      description: 'Chuyển khoản từ ATM',
      amount: 500000,
      type: 'income',
      balance: 2500000
    },
    {
      id: '2', 
      date: '2025-01-22',
      description: 'Thanh toán hóa đơn điện',
      amount: -150000,
      type: 'expense',
      balance: 2000000
    },
    {
      id: '3',
      date: '2025-01-21', 
      description: 'Lương tháng 1',
      amount: 15000000,
      type: 'income',
      balance: 2150000
    }
  ];

  const handleSync = async () => {
    setLoading(true);
    setSyncStatus('loading');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTransactions(mockTransactions);
      setSyncStatus('success');
    } catch (error) {
      setSyncStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            🏦 Đồng bộ Ngân hàng
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Kết nối và đồng bộ giao dịch từ tài khoản ngân hàng
          </p>
        </div>
      </div>

      {/* Sync Form */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Thông tin tài khoản
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Số tài khoản
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Nhập số tài khoản"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Từ ngày
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Đến ngày
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <button
          onClick={handleSync}
          disabled={loading || !accountNumber}
          className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200"
        >
          <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Đang đồng bộ...' : 'Đồng bộ giao dịch'}</span>
        </button>

        {/* Status Messages */}
        {syncStatus === 'success' && (
          <div className="mt-4 flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg">
            <CheckCircleIcon className="h-5 w-5" />
            <span>Đồng bộ thành công! Tìm thấy {transactions.length} giao dịch.</span>
          </div>
        )}

        {syncStatus === 'error' && (
          <div className="mt-4 flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
            <ExclamationTriangleIcon className="h-5 w-5" />
            <span>Có lỗi xảy ra khi đồng bộ. Vui lòng thử lại.</span>
          </div>
        )}
      </div>

      {/* Transactions List */}
      {transactions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Giao dịch đã đồng bộ
          </h2>
          
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${
                    transaction.type === 'income' 
                      ? 'bg-green-100 dark:bg-green-900/20' 
                      : 'bg-red-100 dark:bg-red-900/20'
                  }`}>
                    {transaction.type === 'income' ? (
                      <BanknotesIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <CreditCardIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(transaction.date).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.type === 'income'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {transaction.type === 'income' ? '+' : ''}{formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Số dư: {formatCurrency(transaction.balance)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BankSyncPage;

