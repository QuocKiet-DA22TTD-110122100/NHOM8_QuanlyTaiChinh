const axios = require('axios');
const logger = require('../config/logger');

class BankApiService {
  constructor() {
    this.apiKey = process.env.BANK_API_KEY;
    this.apiSecret = process.env.BANK_API_SECRET;
    this.baseUrl = 'https://api.bank.com/v1'; // Example
  }

  async getAccountBalance(accountId) {
    try {
      const response = await axios.get(`${this.baseUrl}/accounts/${accountId}/balance`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        balance: response.data.balance,
        currency: response.data.currency
      };
    } catch (error) {
      logger.error('Bank API - Get balance error:', error);
      return { success: false, error: error.message };
    }
  }

  async getTransactions(accountId, fromDate, toDate) {
    try {
      const response = await axios.get(`${this.baseUrl}/accounts/${accountId}/transactions`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          from: fromDate,
          to: toDate,
          limit: 100
        }
      });

      return {
        success: true,
        transactions: response.data.transactions
      };
    } catch (error) {
      logger.error('Bank API - Get transactions error:', error);
      return { success: false, error: error.message };
    }
  }

  async syncTransactions(userId, accountId) {
    try {
      const result = await this.getTransactions(accountId, 
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        new Date()
      );

      if (result.success) {
        // Process and save transactions to database
        // This would integrate with your Transaction model
        logger.info(`Synced ${result.transactions.length} transactions for user ${userId}`);
        return result.transactions;
      }

      return [];
    } catch (error) {
      logger.error('Bank sync error:', error);
      return [];
    }
  }
}

module.exports = new BankApiService();