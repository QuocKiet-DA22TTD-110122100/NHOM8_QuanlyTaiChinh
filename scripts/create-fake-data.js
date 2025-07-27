const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000';
const LOGIN_ENDPOINT = '/api/v1/auth/login';
const TRANSACTIONS_ENDPOINT = '/api/v1/transactions';

const users = [
  { name: 'duy', email: 'duy@example.com', password: '123456' },
  { name: 'hoang', email: 'hoang@example.com', password: '123456' },
  { name: 'kha', email: 'kha@example.com', password: '123456' },
  { name: 'hung', email: 'hung@example.com', password: '123456' },
  { name: 'hao', email: 'hao@example.com', password: '123456' },
  { name: 'khanh', email: 'khanh@example.com', password: '123456' },
  { name: 'duy han', email: 'duyhan@example.com', password: '123456' },
  { name: 'ngan', email: 'ngan@example.com', password: '123456' },
  { name: 'phat', email: 'phat@example.com', password: '123456' },
  { name: 'trang', email: 'trang@example.com', password: '123456' },
  { name: 'tham', email: 'tham@example.com', password: '123456' }
];

// Dữ liệu ảo cho từng user
const userData = {
  'duy': {
    income: [
      { amount: 15000000, description: 'Lương tháng', category: 'salary', date: '2024-01-15' },
      { amount: 2000000, description: 'Thưởng dự án', category: 'bonus', date: '2024-01-20' },
      { amount: 500000, description: 'Làm thêm cuối tuần', category: 'overtime', date: '2024-01-25' }
    ],
    expenses: [
      { amount: 3000000, description: 'Tiền nhà', category: 'housing', date: '2024-01-05' },
      { amount: 1500000, description: 'Ăn uống', category: 'food', date: '2024-01-10' },
      { amount: 500000, description: 'Điện nước', category: 'utilities', date: '2024-01-12' },
      { amount: 800000, description: 'Xăng xe', category: 'transport', date: '2024-01-15' },
      { amount: 1200000, description: 'Mua sắm', category: 'shopping', date: '2024-01-18' }
    ]
  },
  'hoang': {
    income: [
      { amount: 12000000, description: 'Lương cơ bản', category: 'salary', date: '2024-01-10' },
      { amount: 1500000, description: 'Thưởng KPI', category: 'bonus', date: '2024-01-25' }
    ],
    expenses: [
      { amount: 2500000, description: 'Thuê phòng', category: 'housing', date: '2024-01-03' },
      { amount: 1200000, description: 'Chi phí ăn uống', category: 'food', date: '2024-01-08' },
      { amount: 300000, description: 'Internet', category: 'utilities', date: '2024-01-10' },
      { amount: 600000, description: 'Grab đi làm', category: 'transport', date: '2024-01-12' }
    ]
  },
  'kha': {
    income: [
      { amount: 18000000, description: 'Lương senior', category: 'salary', date: '2024-01-12' },
      { amount: 3000000, description: 'Thưởng cuối năm', category: 'bonus', date: '2024-01-28' },
      { amount: 1000000, description: 'Freelance', category: 'freelance', date: '2024-01-20' }
    ],
    expenses: [
      { amount: 5000000, description: 'Trả góp xe', category: 'loan', date: '2024-01-05' },
      { amount: 2000000, description: 'Tiền nhà', category: 'housing', date: '2024-01-08' },
      { amount: 1800000, description: 'Ăn uống', category: 'food', date: '2024-01-15' },
      { amount: 800000, description: 'Điện nước', category: 'utilities', date: '2024-01-12' },
      { amount: 1500000, description: 'Mua sắm', category: 'shopping', date: '2024-01-22' }
    ]
  },
  'hung': {
    income: [
      { amount: 10000000, description: 'Lương tháng', category: 'salary', date: '2024-01-08' },
      { amount: 800000, description: 'Làm thêm', category: 'overtime', date: '2024-01-18' }
    ],
    expenses: [
      { amount: 2000000, description: 'Tiền phòng', category: 'housing', date: '2024-01-05' },
      { amount: 1000000, description: 'Ăn uống', category: 'food', date: '2024-01-10' },
      { amount: 400000, description: 'Điện nước', category: 'utilities', date: '2024-01-12' },
      { amount: 500000, description: 'Xe buýt', category: 'transport', date: '2024-01-15' }
    ]
  },
  'hao': {
    income: [
      { amount: 14000000, description: 'Lương tháng', category: 'salary', date: '2024-01-15' },
      { amount: 1200000, description: 'Thưởng', category: 'bonus', date: '2024-01-22' }
    ],
    expenses: [
      { amount: 3000000, description: 'Tiền nhà', category: 'housing', date: '2024-01-03' },
      { amount: 1500000, description: 'Ăn uống', category: 'food', date: '2024-01-08' },
      { amount: 600000, description: 'Điện nước', category: 'utilities', date: '2024-01-10' },
      { amount: 1000000, description: 'Mua sắm', category: 'shopping', date: '2024-01-18' }
    ]
  },
  'khanh': {
    income: [
      { amount: 16000000, description: 'Lương tháng', category: 'salary', date: '2024-01-10' },
      { amount: 2000000, description: 'Thưởng dự án', category: 'bonus', date: '2024-01-25' }
    ],
    expenses: [
      { amount: 4000000, description: 'Trả góp xe', category: 'loan', date: '2024-01-05' },
      { amount: 2500000, description: 'Tiền nhà', category: 'housing', date: '2024-01-08' },
      { amount: 1800000, description: 'Ăn uống', category: 'food', date: '2024-01-12' },
      { amount: 800000, description: 'Điện nước', category: 'utilities', date: '2024-01-15' },
      { amount: 1200000, description: 'Mua sắm', category: 'shopping', date: '2024-01-20' }
    ]
  },
  'duy han': {
    income: [
      { amount: 13000000, description: 'Lương tháng', category: 'salary', date: '2024-01-12' },
      { amount: 1500000, description: 'Thưởng', category: 'bonus', date: '2024-01-28' }
    ],
    expenses: [
      { amount: 2200000, description: 'Tiền phòng', category: 'housing', date: '2024-01-05' },
      { amount: 1200000, description: 'Ăn uống', category: 'food', date: '2024-01-10' },
      { amount: 500000, description: 'Điện nước', category: 'utilities', date: '2024-01-12' },
      { amount: 800000, description: 'Grab', category: 'transport', date: '2024-01-15' },
      { amount: 1000000, description: 'Mua sắm', category: 'shopping', date: '2024-01-18' }
    ]
  },
  'ngan': {
    income: [
      { amount: 11000000, description: 'Lương tháng', category: 'salary', date: '2024-01-08' },
      { amount: 1000000, description: 'Làm thêm', category: 'overtime', date: '2024-01-20' }
    ],
    expenses: [
      { amount: 1800000, description: 'Tiền phòng', category: 'housing', date: '2024-01-03' },
      { amount: 1000000, description: 'Ăn uống', category: 'food', date: '2024-01-08' },
      { amount: 400000, description: 'Điện nước', category: 'utilities', date: '2024-01-10' },
      { amount: 600000, description: 'Xe buýt', category: 'transport', date: '2024-01-12' }
    ]
  },
  'phat': {
    income: [
      { amount: 17000000, description: 'Lương tháng', category: 'salary', date: '2024-01-15' },
      { amount: 2500000, description: 'Thưởng cuối năm', category: 'bonus', date: '2024-01-30' }
    ],
    expenses: [
      { amount: 4500000, description: 'Trả góp xe', category: 'loan', date: '2024-01-05' },
      { amount: 3000000, description: 'Tiền nhà', category: 'housing', date: '2024-01-08' },
      { amount: 2000000, description: 'Ăn uống', category: 'food', date: '2024-01-12' },
      { amount: 1000000, description: 'Điện nước', category: 'utilities', date: '2024-01-15' },
      { amount: 1500000, description: 'Mua sắm', category: 'shopping', date: '2024-01-22' }
    ]
  },
  'trang': {
    income: [
      { amount: 12000000, description: 'Lương tháng', category: 'salary', date: '2024-01-10' },
      { amount: 1200000, description: 'Thưởng', category: 'bonus', date: '2024-01-25' }
    ],
    expenses: [
      { amount: 2000000, description: 'Tiền phòng', category: 'housing', date: '2024-01-05' },
      { amount: 1200000, description: 'Ăn uống', category: 'food', date: '2024-01-08' },
      { amount: 500000, description: 'Điện nước', category: 'utilities', date: '2024-01-10' },
      { amount: 800000, description: 'Grab', category: 'transport', date: '2024-01-12' },
      { amount: 1000000, description: 'Mua sắm', category: 'shopping', date: '2024-01-18' }
    ]
  },
  'tham': {
    income: [
      { amount: 15000000, description: 'Lương tháng', category: 'salary', date: '2024-01-12' },
      { amount: 1800000, description: 'Thưởng dự án', category: 'bonus', date: '2024-01-28' }
    ],
    expenses: [
      { amount: 3500000, description: 'Trả góp xe', category: 'loan', date: '2024-01-05' },
      { amount: 2800000, description: 'Tiền nhà', category: 'housing', date: '2024-01-08' },
      { amount: 1800000, description: 'Ăn uống', category: 'food', date: '2024-01-12' },
      { amount: 900000, description: 'Điện nước', category: 'utilities', date: '2024-01-15' },
      { amount: 1300000, description: 'Mua sắm', category: 'shopping', date: '2024-01-20' }
    ]
  }
};

async function loginUser(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}${LOGIN_ENDPOINT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    return data.success ? data.token : null;
  } catch (error) {
    console.error(`Login error for ${email}:`, error.message);
    return null;
  }
}

async function createTransaction(token, transaction) {
  try {
    const response = await fetch(`${API_BASE_URL}${TRANSACTIONS_ENDPOINT}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(transaction)
    });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Transaction creation error:', error.message);
    return false;
  }
}

async function createFakeDataForUser(user) {
  console.log(`\n📊 Creating fake data for: ${user.name} (${user.email})`);
  
  // Login to get token
  const token = await loginUser(user.email, user.password);
  if (!token) {
    console.log(`❌ Failed to login for ${user.name}`);
    return;
  }
  
  const userTransactions = userData[user.name];
  if (!userTransactions) {
    console.log(`❌ No data template for ${user.name}`);
    return;
  }
  
  let successCount = 0;
  let totalTransactions = 0;
  
  // Create income transactions
  for (const income of userTransactions.income) {
    const transaction = {
      type: 'income',
      amount: income.amount,
      description: income.description,
      category: income.category,
      date: income.date,
      paymentMethod: 'bank_transfer'
    };
    
    const success = await createTransaction(token, transaction);
    if (success) {
      successCount++;
      console.log(`✅ Created income: ${income.description} - ${income.amount.toLocaleString()} VND`);
    }
    totalTransactions++;
  }
  
  // Create expense transactions
  for (const expense of userTransactions.expenses) {
    const transaction = {
      type: 'expense',
      amount: expense.amount,
      description: expense.description,
      category: expense.category,
      date: expense.date,
      paymentMethod: 'cash'
    };
    
    const success = await createTransaction(token, transaction);
    if (success) {
      successCount++;
      console.log(`✅ Created expense: ${expense.description} - ${expense.amount.toLocaleString()} VND`);
    }
    totalTransactions++;
  }
  
  console.log(`📈 ${user.name}: ${successCount}/${totalTransactions} transactions created successfully`);
  return successCount;
}

async function createFakeDataForAllUsers() {
  console.log('🚀 Starting to create fake data for all users...\n');
  
  let totalSuccess = 0;
  let totalTransactions = 0;
  
  for (const user of users) {
    const successCount = await createFakeDataForUser(user);
    if (successCount) {
      totalSuccess += successCount;
      totalTransactions += userData[user.name] ? 
        userData[user.name].income.length + userData[user.name].expenses.length : 0;
    }
    
    // Add delay between users
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🎉 Fake data creation completed!');
  console.log(`📊 Total transactions created: ${totalSuccess}/${totalTransactions}`);
  console.log(`📈 Success rate: ${((totalSuccess / totalTransactions) * 100).toFixed(1)}%`);
}

createFakeDataForAllUsers(); 