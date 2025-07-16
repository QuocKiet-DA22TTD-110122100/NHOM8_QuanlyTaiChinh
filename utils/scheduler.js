const cron = require('node-cron');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const logger = require('../config/logger');

// Check for recurring transactions every day at 9 AM
cron.schedule('0 9 * * *', async () => {
  try {
    logger.info('Checking for recurring transactions...');
    
    const today = new Date();
    const recurringTransactions = await Transaction.find({
      'recurring.enabled': true,
      'recurring.nextDate': { $lte: today }
    }).populate('user');

    for (const transaction of recurringTransactions) {
      // Create new transaction
      const newTransaction = new Transaction({
        user: transaction.user._id,
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
        description: `${transaction.description} (Tự động)`,
        date: new Date(),
        tags: transaction.tags
      });

      await newTransaction.save();

      // Update next date
      const nextDate = new Date(transaction.recurring.nextDate);
      switch (transaction.recurring.frequency) {
        case 'daily':
          nextDate.setDate(nextDate.getDate() + 1);
          break;
        case 'weekly':
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        case 'yearly':
          nextDate.setFullYear(nextDate.getFullYear() + 1);
          break;
      }

      transaction.recurring.nextDate = nextDate;
      await transaction.save();

      // Create notification
      await Notification.create({
        user: transaction.user._id,
        type: 'recurring_payment',
        title: 'Giao dịch định kỳ',
        message: `Đã tạo giao dịch định kỳ: ${transaction.description}`,
        data: { transactionId: newTransaction._id }
      });

      logger.info(`Created recurring transaction for user ${transaction.user._id}`);
    }
  } catch (error) {
    logger.error('Error processing recurring transactions:', error);
  }
});

// Check budget alerts every day at 8 PM
cron.schedule('0 20 * * *', async () => {
  try {
    logger.info('Checking budget alerts...');
    
    // Implementation for budget alerts
    // This would check spending against budgets and create notifications
    
  } catch (error) {
    logger.error('Error checking budget alerts:', error);
  }
});

module.exports = {
  // Export any utility functions if needed
};