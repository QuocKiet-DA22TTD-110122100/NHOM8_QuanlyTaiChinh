const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       required:
 *         - amount
 *         - type
 *         - category
 *       properties:
 *         _id:
 *           type: string
 *         amount:
 *           type: number
 *           minimum: 0.01
 *         type:
 *           type: string
 *           enum: [income, expense]
 *         category:
 *           type: string
 *         description:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *         paymentMethod:
 *           type: string
 *           enum: [cash, card, bank_transfer, e_wallet, other]
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         location:
 *           type: string
 *         receipt:
 *           type: string
 *         note:
 *           type: string
 */

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: Lấy danh sách giao dịch
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Danh sách giao dịch
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 */
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, category, startDate, endDate, search } = req.query;
    
    const filter = { userId: req.user._id };
    
    // Type filter
    if (type) filter.type = type;
    
    // Category filter
    if (category) filter.category = new RegExp(category, 'i');
    
    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    // Search filter
    if (search) {
      filter.$or = [
        { description: new RegExp(search, 'i') },
        { category: new RegExp(search, 'i') },
        { note: new RegExp(search, 'i') }
      ];
    }

    const transactions = await Transaction.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Transaction.countDocuments(filter);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @swagger
 * /transactions:
 *   post:
 *     summary: Tạo giao dịch mới
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - type
 *               - category
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 100000
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *                 example: expense
 *               category:
 *                 type: string
 *                 example: "Ăn uống"
 *               description:
 *                 type: string
 *                 example: "Ăn trưa"
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, card, bank_transfer, e_wallet, other]
 *                 example: cash
 *               date:
 *                 type: string
 *                 format: date-time
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               location:
 *                 type: string
 *               note:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo giao dịch thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.post('/', auth, [
  body('type').isIn(['income', 'expense']).withMessage('Loại giao dịch không hợp lệ'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Số tiền phải lớn hơn 0'),
  body('category').notEmpty().withMessage('Danh mục là bắt buộc'),
  body('description').optional().isLength({ max: 500 }).withMessage('Mô tả không được quá 500 ký tự'),
  body('paymentMethod').optional().isIn(['cash', 'card', 'bank_transfer', 'e_wallet', 'other']),
  body('date').optional().isISO8601().withMessage('Ngày không hợp lệ'),
  body('tags').optional().isArray().withMessage('Tags phải là mảng'),
  body('location').optional().isLength({ max: 200 }).withMessage('Địa điểm không được quá 200 ký tự'),
  body('note').optional().isLength({ max: 1000 }).withMessage('Ghi chú không được quá 1000 ký tự')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }

    const transaction = new Transaction({
      ...req.body,
      userId: req.user._id,
      date: req.body.date || new Date()
    });
    
    await transaction.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Tạo giao dịch thành công',
      data: transaction 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Lỗi tạo giao dịch'
    });
  }
});

/**
 * @swagger
 * /transactions/{id}:
 *   get:
 *     summary: Lấy chi tiết giao dịch
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết giao dịch
 *       404:
 *         description: Không tìm thấy giao dịch
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy giao dịch' 
      });
    }

    res.json({ success: true, data: transaction });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: 'ID giao dịch không hợp lệ' 
    });
  }
});

/**
 * @swagger
 * /transactions/{id}:
 *   put:
 *     summary: Cập nhật giao dịch (toàn bộ)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Transaction'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy giao dịch
 */
router.put('/:id', auth, [
  body('type').optional().isIn(['income', 'expense']),
  body('amount').optional().isFloat({ min: 0.01 }),
  body('category').optional().notEmpty(),
  body('description').optional().isLength({ max: 500 }),
  body('date').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy giao dịch' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Cập nhật giao dịch thành công',
      data: transaction 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Lỗi cập nhật giao dịch'
    });
  }
});

/**
 * @swagger
 * /transactions/{id}:
 *   patch:
 *     summary: Cập nhật một phần giao dịch
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy giao dịch
 */
router.patch('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy giao dịch' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Cập nhật giao dịch thành công',
      data: transaction 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Lỗi cập nhật giao dịch'
    });
  }
});

/**
 * @swagger
 * /transactions/{id}:
 *   delete:
 *     summary: Xóa giao dịch
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy giao dịch
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy giao dịch' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Xóa giao dịch thành công',
      data: transaction 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: 'Lỗi xóa giao dịch' 
    });
  }
});

// HEAD /transactions/:id - Kiểm tra giao dịch có tồn tại
router.head('/:id', auth, async (req, res) => {
  try {
    const exists = await Transaction.exists({
      _id: req.params.id,
      userId: req.user._id
    });

    if (exists) {
      res.status(200).end();
    } else {
      res.status(404).end();
    }
  } catch (error) {
    res.status(400).end();
  }
});

// OPTIONS /transactions - Trả về các methods được hỗ trợ
router.options('/', (req, res) => {
  res.set({
    'Allow': 'GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS'
  });
  res.status(200).end();
});

module.exports = router;

