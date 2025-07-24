import { API_ENDPOINTS } from '../config/api';

const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5001/api/v1'  
  : '/api/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
};

export const bankAPI = {
  // Lấy giao dịch từ ngân hàng
  getTransactions: async (accountNumber, fromDate, toDate) => {
    const params = new URLSearchParams({ accountNumber });
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);

    const response = await fetch(`${API_BASE_URL}/bank/transactions?${params}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Đồng bộ giao dịch vào hệ thống
  syncTransactions: async (accountNumber, transactionIds = null) => {
    const response = await fetch(`${API_BASE_URL}/bank/sync`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ accountNumber, transactionIds })
    });
    return handleResponse(response);
  },

  // Lấy số dư tài khoản
  getBalance: async (accountNumber) => {
    const response = await fetch(`${API_BASE_URL}/bank/balance?accountNumber=${accountNumber}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

