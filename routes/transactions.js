const express = require('express');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Create transaction với validation
router.post('/', auth, [
  body('type').isIn(['income', 'expense']).withMessage('Loại giao dịch không hợp lệ'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Số tiền phải lớn hơn 0'),
  body('category').notEmpty().withMessage('Danh mục là bắt buộc'),
  body('description').optional().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(err => err.msg)
      });
    }

    const transaction = new Transaction({
      ...req.body,
      userId: req.user._id
    });

    await transaction.save();

    res.status(201).json({
      success: true,
      message: 'Tạo giao dịch thành công',
      data: transaction
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server' 
    });
  }
});

// Get transactions
router.get('/', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id })
      .sort({ date: -1 });

    res.json({
      success: true,
      transactions
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server' 
    });
  }
});

module.exports = router;

