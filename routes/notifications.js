const express = require('express');
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');

const router = express.Router();

// Get upcoming recurring payments
router.get('/upcoming', auth, async (req, res) => {
  try {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcomingPayments = await Transaction.find({
      user: req.user.id,
      'recurring.enabled': true,
      'recurring.nextDate': { $lte: nextWeek }
    }).populate('category', 'name icon');

    res.json({
      success: true,
      data: upcomingPayments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// Get budget alerts
router.get('/budget-alerts', auth, async (req, res) => {
  try {
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    // Get categories with budgets
    const categoriesWithBudget = await Category.find({
      $or: [{ user: req.user.id }, { isDefault: true }],
      'budget.monthly': { $exists: true, $gt: 0 }
    });

    const alerts = [];

    for (const category of categoriesWithBudget) {
      const spent = await Transaction.aggregate([
        {
          $match: {
            user: req.user._id,
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
        alerts.push({
          category: category.name,
          budget,
          spent: totalSpent,
          percentage: Math.round(percentage),
          type: percentage >= 100 ? 'exceeded' : 'warning'
        });
      }
    }

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    // Implementation for marking notifications as read
    // This would require a Notification model
    res.json({
      success: true,
      message: 'Đánh dấu đã đọc thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

module.exports = router;