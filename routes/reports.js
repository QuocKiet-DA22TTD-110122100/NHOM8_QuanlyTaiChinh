const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Báo cáo và thống kê tài chính
 */

/**
 * @swagger
 * /reports/summary:
 *   get:
 *     summary: Báo cáo tổng quan tài chính
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Tháng cần báo cáo (1-12)
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           minimum: 2020
 *         description: Năm cần báo cáo
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày bắt đầu (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày kết thúc (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Báo cáo tổng quan thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     income:
 *                       type: number
 *                       example: 5000000
 *                     expense:
 *                       type: number
 *                       example: 3000000
 *                     balance:
 *                       type: number
 *                       example: 2000000
 *                     transactions:
 *                       type: integer
 *                       example: 25
 *                     avgIncome:
 *                       type: number
 *                       example: 500000
 *                     avgExpense:
 *                       type: number
 *                       example: 150000
 *                     period:
 *                       type: object
 *                       properties:
 *                         startDate:
 *                           type: string
 *                           format: date
 *                         endDate:
 *                           type: string
 *                           format: date
 *                         month:
 *                           type: integer
 *                         year:
 *                           type: integer
 *       400:
 *         description: Tham số không hợp lệ
 *       401:
 *         description: Chưa xác thực
 *       500:
 *         description: Lỗi server
 */
router.get('/summary', auth, async (req, res) => {
  try {
    const { month, year, startDate, endDate } = req.query;
    const currentDate = new Date();
    
    // Validate input parameters
    if (month && (month < 1 || month > 12)) {
      return res.status(400).json({
        success: false,
        message: 'Tháng phải từ 1 đến 12'
      });
    }
    
    if (year && year < 2020) {
      return res.status(400).json({
        success: false,
        message: 'Năm không hợp lệ'
      });
    }

    // Determine date range
    let dateFilter = {};
    let periodInfo = {};
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start > end) {
        return res.status(400).json({
          success: false,
          message: 'Ngày bắt đầu phải nhỏ hơn ngày kết thúc'
        });
      }
      
      dateFilter = { $gte: start, $lte: end };
      periodInfo = { startDate: start, endDate: end };
    } else {
      const targetMonth = parseInt(month) || currentDate.getMonth() + 1;
      const targetYear = parseInt(year) || currentDate.getFullYear();
      
      const start = new Date(targetYear, targetMonth - 1, 1);
      const end = new Date(targetYear, targetMonth, 0);
      
      dateFilter = { $gte: start, $lte: end };
      periodInfo = { 
        startDate: start, 
        endDate: end, 
        month: targetMonth, 
        year: targetYear 
      };
    }

    // Enhanced aggregation with more statistics
    const summary = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: dateFilter
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' },
          maxAmount: { $max: '$amount' },
          minAmount: { $min: '$amount' }
        }
      }
    ]);

    // Get category breakdown
    const categoryBreakdown = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: dateFilter
        }
      },
      {
        $group: {
          _id: { type: '$type', category: '$category' },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.type',
          categories: {
            $push: {
              category: '$_id.category',
              total: '$total',
              count: '$count'
            }
          }
        }
      }
    ]);

    // Initialize result object
    const result = {
      income: 0,
      expense: 0,
      balance: 0,
      transactions: 0,
      avgIncome: 0,
      avgExpense: 0,
      maxIncome: 0,
      maxExpense: 0,
      minIncome: 0,
      minExpense: 0,
      categoryBreakdown: {
        income: [],
        expense: []
      },
      period: periodInfo
    };

    // Process summary data
    summary.forEach(item => {
      if (item._id === 'income') {
        result.income = item.total;
        result.avgIncome = Math.round(item.avgAmount || 0);
        result.maxIncome = item.maxAmount || 0;
        result.minIncome = item.minAmount || 0;
      } else if (item._id === 'expense') {
        result.expense = item.total;
        result.avgExpense = Math.round(item.avgAmount || 0);
        result.maxExpense = item.maxAmount || 0;
        result.minExpense = item.minAmount || 0;
      }
      result.transactions += item.count;
    });

    // Process category breakdown
    categoryBreakdown.forEach(breakdown => {
      if (breakdown._id === 'income') {
        result.categoryBreakdown.income = breakdown.categories.sort((a, b) => b.total - a.total);
      } else if (breakdown._id === 'expense') {
        result.categoryBreakdown.expense = breakdown.categories.sort((a, b) => b.total - a.total);
      }
    });

    result.balance = result.income - result.expense;

    // Add savings rate if there's income
    if (result.income > 0) {
      result.savingsRate = Math.round((result.balance / result.income) * 100);
    } else {
      result.savingsRate = 0;
    }

    res.json({ 
      success: true, 
      data: result,
      message: 'Lấy báo cáo tổng quan thành công'
    });
  } catch (error) {
    console.error('Error in /reports/summary:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi tạo báo cáo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @swagger
 * /reports/categories:
 *   get:
 *     summary: Báo cáo theo danh mục
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *         description: Loại giao dịch
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Báo cáo danh mục thành công
 */
router.get('/categories', auth, async (req, res) => {
  try {
    const { type, month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = parseInt(month) || currentDate.getMonth() + 1;
    const targetYear = parseInt(year) || currentDate.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0);

    const matchFilter = {
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    };

    if (type) {
      matchFilter.type = type;
    }

    const categories = await Transaction.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: { type: '$type', category: '$category' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      },
      {
        $group: {
          _id: '$_id.type',
          categories: {
            $push: {
              category: '$_id.category',
              total: '$total',
              count: '$count',
              avgAmount: { $round: ['$avgAmount', 0] }
            }
          },
          totalAmount: { $sum: '$total' }
        }
      }
    ]);

    res.json({
      success: true,
      data: categories,
      period: { month: targetMonth, year: targetYear }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo báo cáo danh mục'
    });
  }
});

module.exports = router;
