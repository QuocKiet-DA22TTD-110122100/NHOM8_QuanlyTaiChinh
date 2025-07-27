const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { auth } = require('../middlewares/auth');
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
 * /api/v1/transactions:
 *   get:
 *     tags: [Transactions]
 *     summary: Lấy danh sách giao dịch
 *     description: Lấy tất cả giao dịch của người dùng với phân trang và lọc
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *         description: Lọc theo loại giao dịch
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Lọc theo danh mục
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số giao dịch mỗi trang
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Lọc từ ngày
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Lọc đến ngày
 *     responses:
 *       200:
 *         description: Lấy danh sách giao dịch thành công
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
 *                     transactions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Transaction'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       401:
 *         description: Không có quyền truy cập
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Helper: build filter theo quyền
function buildTransactionFilter(req) {
  const { type, category, startDate, endDate, search, userId } = req.query;
  const filter = {};
  // Nếu không phải admin thì chỉ lấy giao dịch của chính mình
  if (!req.user.role || req.user.role !== 'admin') {
    filter.userId = req.user._id;
  } else if (userId) {
    filter.userId = userId;
  }
  if (type) filter.type = type;
  if (category) filter.category = new RegExp(category, 'i');
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }
  if (search) {
    filter.$or = [
      { description: new RegExp(search, 'i') },
      { category: new RegExp(search, 'i') },
      { note: new RegExp(search, 'i') }
    ];
  }
  return filter;
}

router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const filter = buildTransactionFilter(req);
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
 * /api/v1/transactions:
 *   post:
 *     tags: [Transactions]
 *     summary: Tạo giao dịch mới
 *     description: Thêm giao dịch thu nhập hoặc chi tiêu mới
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - amount
 *               - category
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *                 example: expense
 *                 description: Loại giao dịch
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *                 example: 50000
 *                 description: Số tiền (phải lớn hơn 0)
 *               category:
 *                 type: string
 *                 example: food
 *                 description: Danh mục giao dịch
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Ăn trưa tại nhà hàng"
 *                 description: Mô tả giao dịch
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, card, bank_transfer, e_wallet, other]
 *                 example: cash
 *                 description: Phương thức thanh toán
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-15T12:00:00Z"
 *                 description: Ngày giao dịch
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["ăn uống", "nhà hàng"]
 *                 description: Các tag cho giao dịch
 *               location:
 *                 type: string
 *                 maxLength: 200
 *                 example: "Nhà hàng ABC, Quận 1"
 *                 description: Địa điểm giao dịch
 *               note:
 *                 type: string
 *                 maxLength: 1000
 *                 example: "Ghi chú thêm"
 *                 description: Ghi chú
 *     responses:
 *       201:
 *         description: Tạo giao dịch thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Tạo giao dịch thành công"
 *                 data:
 *                   $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Dữ liệu không hợp lệ"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                       param:
 *                         type: string
 *                       location:
 *                         type: string
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
 * /api/v1/transactions/{id}:
 *   get:
 *     tags: [Transactions]
 *     summary: Lấy giao dịch theo ID
 *     description: Lấy thông tin chi tiết của một giao dịch
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của giao dịch
 *     responses:
 *       200:
 *         description: Lấy giao dịch thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: Không tìm thấy giao dịch
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Không tìm thấy giao dịch"
 *       400:
 *         description: ID giao dịch không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (!req.user.role || req.user.role !== 'admin') {
      filter.userId = req.user._id;
    }
    const transaction = await Transaction.findOne(filter);
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
 * /api/v1/transactions/{id}:
 *   put:
 *     tags: [Transactions]
 *     summary: Cập nhật giao dịch (toàn bộ)
 *     description: Cập nhật toàn bộ thông tin của một giao dịch
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của giao dịch
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Transaction'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Cập nhật giao dịch thành công"
 *                 data:
 *                   $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: Không tìm thấy giao dịch
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
    const filter = { _id: req.params.id };
    if (!req.user.role || req.user.role !== 'admin') {
      filter.userId = req.user._id;
    }
    const transaction = await Transaction.findOneAndUpdate(
      filter,
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
 * /api/v1/transactions/{id}:
 *   patch:
 *     tags: [Transactions]
 *     summary: Cập nhật giao dịch (một phần)
 *     description: Cập nhật một phần thông tin của giao dịch
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của giao dịch
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 75000
 *               description:
 *                 type: string
 *                 example: "Cập nhật mô tả"
 *               category:
 *                 type: string
 *                 example: "transport"
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Cập nhật giao dịch thành công"
 *                 data:
 *                   $ref: '#/components/schemas/Transaction'
 */
router.patch('/:id', auth, async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (!req.user.role || req.user.role !== 'admin') {
      filter.userId = req.user._id;
    }
    const transaction = await Transaction.findOneAndUpdate(
      filter,
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
 * /api/v1/transactions/{id}:
 *   delete:
 *     tags: [Transactions]
 *     summary: Xóa giao dịch
 *     description: Xóa một giao dịch theo ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của giao dịch
 *     responses:
 *       200:
 *         description: Xóa thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Xóa giao dịch thành công"
 *       404:
 *         description: Không tìm thấy giao dịch
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (!req.user.role || req.user.role !== 'admin') {
      filter.userId = req.user._id;
    }
    const transaction = await Transaction.findOneAndDelete(filter);
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

/**
 * @swagger
 * /api/v1/transactions/{id}:
 *   head:
 *     tags: [Transactions]
 *     summary: Kiểm tra giao dịch có tồn tại
 *     description: Kiểm tra xem giao dịch có tồn tại hay không (chỉ trả về status code)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của giao dịch
 *     responses:
 *       200:
 *         description: Giao dịch tồn tại
 *       404:
 *         description: Giao dịch không tồn tại
 *       400:
 *         description: ID không hợp lệ
 */
router.head('/:id', auth, async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (!req.user.role || req.user.role !== 'admin') {
      filter.userId = req.user._id;
    }
    const exists = await Transaction.exists(filter);

    if (exists) {
      res.status(200).end();
    } else {
      res.status(404).end();
    }
  } catch (error) {
    res.status(400).end();
  }
});

/**
 * @swagger
 * /api/v1/transactions:
 *   options:
 *     tags: [Transactions]
 *     summary: Lấy danh sách methods được hỗ trợ
 *     description: Trả về các HTTP methods được hỗ trợ cho endpoint transactions
 *     responses:
 *       200:
 *         description: Danh sách methods được hỗ trợ
 *         headers:
 *           Allow:
 *             schema:
 *               type: string
 *               example: "GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS"
 *           Access-Control-Allow-Methods:
 *             schema:
 *               type: string
 *               example: "GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS"
 */
router.options('/', (req, res) => {
  res.set({
    'Allow': 'GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS'
  });
  res.status(200).end();
});

module.exports = router;

