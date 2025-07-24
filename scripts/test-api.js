const axios = require('axios');
const colors = require('colors');

class APITester {
  constructor(baseURL = 'http://localhost:5000/api/v1') {
    this.baseURL = baseURL;
    this.authToken = null;
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async runTests() {
    console.log('🚀 Starting API Tests...\n'.cyan);

    // Check if server is running
    try {
      const healthCheck = await axios.get(`${this.baseURL.replace('/api/v1', '')}/health`);
      console.log('✅ Server is running'.green);
    } catch (error) {
      console.error('❌ Server is not running. Please start server first:'.red);
      console.error('npm run dev'.yellow);
      return;
    }

    try {
      await this.testAuthentication();
      await this.testTransactions();
      await this.testReports();
      await this.testPerformance();
      
      this.printResults();
    } catch (error) {
      console.error('Test suite failed:', error.message);
    }
  }

  async testAuthentication() {
    console.log('🔐 Testing Authentication...'.yellow);

    // Test Registration
    await this.test('User Registration', async () => {
      const response = await axios.post(`${this.baseURL}/auth/register`, {
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        name: 'Test User'
      });
      return response.status === 200 && response.data.success;
    });

    // Test Login
    await this.test('User Login', async () => {
      const response = await axios.post(`${this.baseURL}/auth/login`, {
        email: 'test@example.com',
        password: 'password123'
      });
      
      if (response.status === 200 && response.data.token) {
        this.authToken = response.data.token;
        return true;
      }
      return false;
    });

    // Test Invalid Login
    await this.test('Invalid Login Rejection', async () => {
      try {
        await axios.post(`${this.baseURL}/auth/login`, {
          email: 'wrong@example.com',
          password: 'wrongpassword'
        });
        return false;
      } catch (error) {
        return error.response.status === 401;
      }
    });
  }

  async testTransactions() {
    console.log('💰 Testing Transactions...'.yellow);

    const headers = { Authorization: `Bearer ${this.authToken}` };

    // Test Create Transaction
    let transactionId;
    await this.test('Create Transaction', async () => {
      const response = await axios.post(`${this.baseURL}/transactions`, {
        type: 'expense',
        amount: 50000,
        category: 'food',
        description: 'Test transaction'
      }, { headers });

      if (response.status === 201 && response.data.success) {
        transactionId = response.data.data._id;
        return true;
      }
      return false;
    });

    // Test Get Transactions
    await this.test('Get Transactions', async () => {
      const response = await axios.get(`${this.baseURL}/transactions`, { headers });
      return response.status === 200 && Array.isArray(response.data.data.transactions);
    });

    // Test Update Transaction
    if (transactionId) {
      await this.test('Update Transaction', async () => {
        const response = await axios.put(`${this.baseURL}/transactions/${transactionId}`, {
          amount: 75000,
          description: 'Updated transaction'
        }, { headers });
        return response.status === 200 && response.data.success;
      });
    }

    // Test Validation
    await this.test('Transaction Validation', async () => {
      try {
        await axios.post(`${this.baseURL}/transactions`, {
          type: 'invalid',
          amount: -1000
        }, { headers });
        return false;
      } catch (error) {
        return error.response.status === 400;
      }
    });
  }

  async testReports() {
    console.log('📊 Testing Reports...'.yellow);

    const headers = { Authorization: `Bearer ${this.authToken}` };

    // Test Dashboard
    await this.test('Dashboard Report', async () => {
      const response = await axios.get(`${this.baseURL}/reports/dashboard`, { headers });
      return response.status === 200 && response.data.success;
    });

    // Test Excel Export
    await this.test('Excel Export', async () => {
      const response = await axios.get(`${this.baseURL}/reports/export/excel`, { 
        headers,
        responseType: 'stream'
      });
      return response.status === 200 && 
             response.headers['content-type'].includes('spreadsheet');
    });
  }

  async testPerformance() {
    console.log('⚡ Testing Performance...'.yellow);

    const headers = { Authorization: `Bearer ${this.authToken}` };

    // Test Response Time
    await this.test('Response Time < 500ms', async () => {
      const startTime = Date.now();
      await axios.get(`${this.baseURL}/transactions`, { headers });
      const responseTime = Date.now() - startTime;
      return responseTime < 500;
    });

    // Test Concurrent Requests
    await this.test('Concurrent Requests', async () => {
      const promises = Array.from({ length: 10 }, () =>
        axios.get(`${this.baseURL}/transactions`, { headers })
      );
      
      const results = await Promise.allSettled(promises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      return successful >= 8; // Allow 2 failures
    });
  }

  async test(name, testFunction) {
    try {
      const startTime = Date.now();
      const result = await testFunction();
      const duration = Date.now() - startTime;

      if (result) {
        console.log(`  ✅ ${name} (${duration}ms)`.green);
        this.results.passed++;
      } else {
        console.log(`  ❌ ${name} (${duration}ms)`.red);
        this.results.failed++;
      }

      this.results.tests.push({ name, passed: result, duration });
    } catch (error) {
      console.log(`  ❌ ${name} - Error: ${error.message}`.red);
      console.log(`     Status: ${error.response?.status || 'No response'}`.yellow);
      console.log(`     URL: ${error.config?.url || 'Unknown URL'}`.yellow);
      this.results.failed++;
      this.results.tests.push({ name, passed: false, error: error.message });
    }
  }

  printResults() {
    console.log('\n📋 Test Results:'.cyan);
    console.log(`  Passed: ${this.results.passed}`.green);
    console.log(`  Failed: ${this.results.failed}`.red);
    console.log(`  Total: ${this.results.passed + this.results.failed}`);
    
    const successRate = (this.results.passed / (this.results.passed + this.results.failed)) * 100;
    console.log(`  Success Rate: ${successRate.toFixed(1)}%`);

    if (this.results.failed > 0) {
      console.log('\n❌ Failed Tests:'.red);
      this.results.tests
        .filter(t => !t.passed)
        .forEach(t => console.log(`  - ${t.name}${t.error ? `: ${t.error}` : ''}`));
    }
  }
}

// Run tests
if (require.main === module) {
  const tester = new APITester();
  tester.runTests();
}

module.exports = APITester;


