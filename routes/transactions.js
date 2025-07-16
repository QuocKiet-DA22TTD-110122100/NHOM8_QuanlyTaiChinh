const express = require('express');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all transactions with filters
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      category,
      startDate,
      endDate,
      tags,
      search
    } = req.query;

    const query = { user: req.user.id };

    // Filters
    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (tags) query.tags = { $in: tags.split(',') };
    if (search) {
      query.description = { $regex: search, $options: 'i' };
    }

    const transactions = await Transaction.find(query)
      .populate('category', 'name icon color')
      .populate('bankAccount', 'bankName accountNumber')
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(query);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server' 
    });
  }
});

// Create transaction
router.post('/', auth, async (req, res) => {
  try {
    const transaction = new Transaction({
      ...req.body,
      user: req.user.id
    });

    await transaction.save();
    await transaction.populate('category', 'name icon color');

    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server' 
    });
  }
});

// Update transaction
router.put('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    ).populate('category', 'name icon color');

    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy giao dịch' 
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server' 
    });
  }
});

// Delete transaction
router.delete('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy giao dịch' 
      });
    }

    res.json({
      success: true,
      message: 'Xóa giao dịch thành công'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server' 
    });
  }
});

// Get transaction statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let startDate = new Date();
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const stats = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      income: { total: 0, count: 0 },
      expense: { total: 0, count: 0 }
    };

    stats.forEach(stat => {
      result[stat._id] = {
        total: stat.total,
        count: stat.count
      };
    });

    result.balance = result.income.total - result.expense.total;

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server' 
    });
  }
});

module.exports = router;


