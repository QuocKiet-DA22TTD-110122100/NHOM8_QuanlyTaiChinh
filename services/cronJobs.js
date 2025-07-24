const cron = require('node-cron');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const User = require('../models/User');
const emailService = require('./emailService');
const websocketService = require('./websocket');
const logger = require('../config/logger');

class CronJobService {
  constructor() {
    this.jobs = [];
  }

  // Daily budget check
  startBudgetAlerts() {
    const job = cron.schedule('0 18 * * *', async () => {
      try {
        logger.info('Running daily budget check...');
        
        const users = await User.find({ notifications: { budgetAlerts: true } });
        
        for (const user of users) {
          await this.checkUserBudgets(user);
        }
      } catch (error) {
        logger.error('Budget alert cron error:', error);
      }
    }, {
      scheduled: false
    });

    job.start();
    this.jobs.push(job);
    logger.info('Budget alert cron job started');
  }

  // Monthly reports
  startMonthlyReports() {
    const job = cron.schedule('0 9 1 * *', async () => {
      try {
        logger.info('Sending monthly reports...');
        
        const users = await User.find({ notifications: { monthlyReports: true } });
        
        for (const user of users) {
          await this.sendMonthlyReport(user);
        }
      } catch (error) {
        logger.error('Monthly report cron error:', error);
      }
    }, {
      scheduled: false
    });

    job.start();
    this.jobs.push(job);
    logger.info('Monthly report cron job started');
  }

  async checkUserBudgets(user) {
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const categoriesWithBudget = await Category.find({
      user: user._id,
      'budget.monthly': { $gt: 0 }
    });

    for (const category of categoriesWithBudget) {
      const spent = await Transaction.aggregate([
        {
          $match: {
            user: user._id,
            category: category._id,
            type: 'expense',
            date: { $gte: currentMonth, $lt: nextMonth }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);

      const totalSpent = spent[0]?.total || 0;
      const budget = category.budget.monthly;
      const percentage = (totalSpent / budget) * 100;

      if (percentage >= 80) {
        const alert = {
          category: category.name,
          budget,
          spent: totalSpent,
          percentage: Math.round(percentage),
          type: percentage >= 100 ? 'exceeded' : 'warning'
        };

        // Send WebSocket notification
        websocketService.notifyBudgetAlert(user._id, alert);

        // Send email if percentage >= 90%
        if (percentage >= 90) {
          await emailService.sendBudgetAlert(user, category.name, totalSpent, budget);
        }
      }
    }
  }

  async sendMonthlyReport(user) {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    lastMonth.setDate(1);
    
    const currentMonth = new Date();
    currentMonth.setDate(1);

    const report = await Transaction.aggregate([
      {
        $match: {
          user: user._id,
          date: { $gte: lastMonth, $lt: currentMonth }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    const income = report.find(r => r._id === 'income')?.total || 0;
    const expense = report.find(r => r._id === 'expense')?.total || 0;

    await emailService.sendMonthlyReport(user, { income, expense });
  }

  stopAll() {
    this.jobs.forEach(job => {
      if (job && job.stop) {
        job.stop();
      }
    });
    this.jobs = [];
    logger.info('All cron jobs stopped');
  }
}

module.exports = new CronJobService();

