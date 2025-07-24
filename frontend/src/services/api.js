const isDevelopment = process.env.NODE_ENV === 'development';

export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:5000/api/v1'  // Sửa từ 5001 thành 5000
  : '/api/v1';

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY: '/auth/verify'
  },
  HEALTH: '/health'
};

// Auth API
export const authAPI = {
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse(response);
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  verify: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Transactions API
export const transactionsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  create: async (transactionData) => {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(transactionData)
    });
    return handleResponse(response);
  },

  update: async (id, transactionData) => {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(transactionData)
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Categories API
export const categoriesAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  create: async (categoryData) => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(categoryData)
    });
    return handleResponse(response);
  }
};

// Reports API
export const reportsAPI = {
  getMonthlyReport: async (year, month) => {
    const response = await fetch(`${API_BASE_URL}/reports/monthly?year=${year}&month=${month}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getYearlyReport: async (year) => {
    const response = await fetch(`${API_BASE_URL}/reports/yearly?year=${year}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getCategoryReport: async (year) => {
    const response = await fetch(`${API_BASE_URL}/reports/categories?year=${year}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Notifications API
export const notificationsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  markAsRead: async (id) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Fallback to localStorage if API is not available
export const localStorageAPI = {
  // Income operations
  getIncomes: () => {
    return JSON.parse(localStorage.getItem('incomes')) || [];
  },

  saveIncome: (income) => {
    const incomes = localStorageAPI.getIncomes();
    const newIncome = {
      ...income,
      id: Date.now().toString(),
      date: income.date || new Date().toISOString().split('T')[0]
    };
    incomes.push(newIncome);
    localStorage.setItem('incomes', JSON.stringify(incomes));
    return newIncome;
  },

  deleteIncome: (id) => {
    const incomes = localStorageAPI.getIncomes();
    const filteredIncomes = incomes.filter(income => income.id !== id);
    localStorage.setItem('incomes', JSON.stringify(filteredIncomes));
  },

  // Expense operations
  getExpenses: () => {
    return JSON.parse(localStorage.getItem('expenses')) || [];
  },

  saveExpense: (expense) => {
    const expenses = localStorageAPI.getExpenses();
    const newExpense = {
      ...expense,
      id: Date.now().toString(),
      date: expense.date || new Date().toISOString().split('T')[0]
    };
    expenses.push(newExpense);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    return newExpense;
  },

  deleteExpense: (id) => {
    const expenses = localStorageAPI.getExpenses();
    const filteredExpenses = expenses.filter(expense => expense.id !== id);
    localStorage.setItem('expenses', JSON.stringify(filteredExpenses));
  },

  // Budget operations
  getBudgets: () => {
    return JSON.parse(localStorage.getItem('budgets')) || {};
  },

  saveBudget: (category, amount) => {
    const budgets = localStorageAPI.getBudgets();
    budgets[category] = amount;
    localStorage.setItem('budgets', JSON.stringify(budgets));
  },

  // Notifications operations
  getNotifications: () => {
    return JSON.parse(localStorage.getItem('notifications')) || [];
  },

  saveNotification: (notification) => {
    const notifications = localStorageAPI.getNotifications();
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
      time: new Date().toLocaleString('vi-VN')
    };
    notifications.unshift(newNotification);
    localStorage.setItem('notifications', JSON.stringify(notifications));
    return newNotification;
  },

  markNotificationAsRead: (id) => {
    const notifications = localStorageAPI.getNotifications();
    const updatedNotifications = notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    );
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  },

  clearAllNotifications: () => {
    localStorage.setItem('notifications', JSON.stringify([]));
  }
};

// Unified API that tries backend first, falls back to localStorage
export const unifiedAPI = {
  // Check if backend is available
  checkBackend: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  },

  // Transactions
  getTransactions: async () => {
    try {
      const isBackendAvailable = await unifiedAPI.checkBackend();
      if (isBackendAvailable) {
        const data = await transactionsAPI.getAll();
        return data.transactions || [];
      }
    } catch (error) {
      console.warn('Backend not available, using localStorage:', error.message);
    }
    
    // Fallback to localStorage
    const incomes = localStorageAPI.getIncomes().map(item => ({ ...item, type: 'income' }));
    const expenses = localStorageAPI.getExpenses().map(item => ({ ...item, type: 'expense' }));
    return [...incomes, ...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  createTransaction: async (transactionData) => {
    try {
      const isBackendAvailable = await unifiedAPI.checkBackend();
      if (isBackendAvailable) {
        return await transactionsAPI.create(transactionData);
      }
    } catch (error) {
      console.warn('Backend not available, using localStorage:', error.message);
    }
    
    // Fallback to localStorage
    if (transactionData.type === 'income') {
      return localStorageAPI.saveIncome(transactionData);
    } else {
      return localStorageAPI.saveExpense(transactionData);
    }
  },

  deleteTransaction: async (id, type) => {
    try {
      const isBackendAvailable = await unifiedAPI.checkBackend();
      if (isBackendAvailable) {
        return await transactionsAPI.delete(id);
      }
    } catch (error) {
      console.warn('Backend not available, using localStorage:', error.message);
    }
    
    // Fallback to localStorage
    if (type === 'income') {
      localStorageAPI.deleteIncome(id);
    } else {
      localStorageAPI.deleteExpense(id);
    }
  },

  // Notifications
  getNotifications: async () => {
    try {
      const isBackendAvailable = await unifiedAPI.checkBackend();
      if (isBackendAvailable) {
        const data = await notificationsAPI.getAll();
        return data.notifications || [];
      }
    } catch (error) {
      console.warn('Backend not available, using localStorage:', error.message);
    }
    
    return localStorageAPI.getNotifications();
  },

  markNotificationAsRead: async (id) => {
    try {
      const isBackendAvailable = await unifiedAPI.checkBackend();
      if (isBackendAvailable) {
        return await notificationsAPI.markAsRead(id);
      }
    } catch (error) {
      console.warn('Backend not available, using localStorage:', error.message);
    }
    
    localStorageAPI.markNotificationAsRead(id);
  }
};

export default unifiedAPI;
