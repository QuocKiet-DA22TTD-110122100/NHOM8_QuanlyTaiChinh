import React, { useState, useEffect } from 'react';
import { bankAPI } from '../services/bankApi';

const BankSync = () => {
  const [bankTransactions, setBankTransactions] = useState([]);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [accountNumber, setAccountNumber] = useState('1234567890');
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);

  const fetchBankTransactions = async () => {
    setLoading(true);
    try {
      const result = await bankAPI.getTransactions(accountNumber);
      setBankTransactions(result.data || []);
      
      const balanceResult = await bankAPI.getBalance(accountNumber);
      setBalance(balanceResult.data.balance);
    } catch (error) {
      console.error('Error fetching bank transactions:', error);
    }
    setLoading(false);
  };

  const handleSync = async () => {
    if (selectedTransactions.length === 0) {
      alert('Vui lòng chọn ít nhất một giao dịch');
      return;
    }

    setLoading(true);
    try {
      const result = await bankAPI.syncTransactions(accountNumber, selectedTransactions);
      alert(result.message);
      setSelectedTransactions([]);
    } catch (error) {
      alert('Lỗi khi đồng bộ: ' + error.message);
    }
    setLoading(false);
  };

  const toggleTransaction = (transactionId) => {
    setSelectedTransactions(prev => 
      prev.includes(transactionId)
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  useEffect(() => {
    fetchBankTransactions();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">🏦 Đồng bộ Ngân hàng</h2>
      
      <div className="mb-4 flex gap-4 items-center">
        <input
          type="text"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          placeholder="Số tài khoản"
          className="border rounded px-3 py-2"
        />
        <button
          onClick={fetchBankTransactions}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {loading ? 'Đang tải...' : 'Lấy giao dịch'}
        </button>
        <div className="text-lg font-semibold">
          Số dư: {balance.toLocaleString('vi-VN')} VND
        </div>
      </div>

      {bankTransactions.length > 0 && (
        <>
          <div className="mb-4">
            <button
              onClick={handleSync}
              disabled={loading || selectedTransactions.length === 0}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Đồng bộ ({selectedTransactions.length}) giao dịch
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Chọn</th>
                  <th className="border p-2">Ngày</th>
                  <th className="border p-2">Mô tả</th>
                  <th className="border p-2">Số tiền</th>
                  <th className="border p-2">Loại</th>
                  <th className="border p-2">Số dư</th>
                </tr>
              </thead>
              <tbody>
                {bankTransactions.map(txn => (
                  <tr key={txn.id}>
                    <td className="border p-2 text-center">
                      <input
                        type="checkbox"
                        checked={selectedTransactions.includes(txn.id)}
                        onChange={() => toggleTransaction(txn.id)}
                      />
                    </td>
                    <td className="border p-2">
                      {new Date(txn.transactionDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="border p-2">{txn.description}</td>
                    <td className={`border p-2 ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {txn.type === 'credit' ? '+' : '-'}{txn.amount.toLocaleString('vi-VN')}
                    </td>
                    <td className="border p-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        txn.type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {txn.type === 'credit' ? 'Tiền vào' : 'Tiền ra'}
                      </span>
                    </td>
                    <td className="border p-2">{txn.balance.toLocaleString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default BankSync;