const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../config/logger');
const moment = require('moment');

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../uploads/transactions');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Chỉ cho phép upload file ảnh và tài liệu'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

// Validation helpers
const validateTransactionData = (data) => {
    const errors = [];
    
    if (!data.type || !['income', 'expense'].includes(data.type)) {
        errors.push('Loại giao dịch không hợp lệ');
    }
    
    if (!data.amount || data.amount <= 0) {
        errors.push('Số tiền phải lớn hơn 0');
    }
    
    if (data.amount > 1000000000) { // 1 billion limit
        errors.push('Số tiền quá lớn');
    }
    
    if (data.description && data.description.length > 500) {
        errors.push('Mô tả không được quá 500 ký tự');
    }
    
    if (data.category && data.category.length > 50) {
        errors.push('Danh mục không được quá 50 ký tự');
    }
    
    return errors;
};

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       required:
 *         - type
 *         - amount
 *       properties:
 *         id:
 *           type: string
 *         type:
 *           type: string
 *           enum: [income, expense]
 *         amount:
 *           type: number
 *           minimum: 0
 *         category:
 *           type: string
 *         subcategory:
 *           type: string
 *         description:
 *           type: string
 *         note:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *         paymentMethod:
 *           type: string
 *           enum: [cash, card, bank_transfer, e_wallet, other]
 *         currency:
 *           type: string
 *           enum: [VND, USD, EUR]
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         location:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             address:
 *               type: string
 *             coordinates:
 *               type: object
 *               properties:
 *                 lat:
 *                   type: number
 *                 lng:
 *                   type: number
 *     TransactionCreate:
 *       type: object
 *       required:
 *         - type
 *         - amount
 *       properties:
 *         type:
 *           type: string
 *           enum: [income, expense]
 *           example: expense
 *         amount:
 *           type: number
 *           minimum: 0
 *           example: 50000
 *         category:
 *           type: string
 *           example: food
 *         subcategory:
 *           type: string
 *           example: restaurant
 *         description:
 *           type: string
 *           example: Ăn trưa tại nhà hàng ABC
 *         note:
 *           type: string
 *           example: Ghi chú thêm
 *         date:
 *           type: string
 *           format: date-time
 *           example: 2024-01-15T10:30:00Z
 *         paymentMethod:
 *           type: string
 *           enum: [cash, card, bank_transfer, e_wallet, other]
 *           example: card
 *         currency:
 *           type: string
 *           enum: [VND, USD, EUR]
 *           example: VND
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["lunch", "weekend"]
 */

/**
 * @swagger
 * /api/transactions:
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
 *           minimum: 1
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Số giao dịch trên mỗi trang
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm trong mô tả và ghi chú
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
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            type,
            category,
            startDate,
            endDate,
            search,
            sortBy = 'date',
            sortOrder = 'desc'
        } = req.query;

        const userId = req.user.userId;
        const skip = (page - 1) * limit;

        // Build filter
        const filter = { userId };
        
        if (type) filter.type = type;
        if (category) filter.category = new RegExp(category, 'i');
        
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate + 'T23:59:59.999Z');
        }
        
        if (search) {
            filter.$or = [
                { description: new RegExp(search, 'i') },
                { note: new RegExp(search, 'i') },
                { category: new RegExp(search, 'i') }
            ];
        }

        // Build sort
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Execute query
        const [transactions, total] = await Promise.all([
            Transaction.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .select('-attachments -__v'),
            Transaction.countDocuments(filter)
        ]);

        const pages = Math.ceil(total / limit);

        logger.info(`Retrieved ${transactions.length} transactions for user: ${userId}`);

        res.json({
            success: true,
            data: transactions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages
            }
        });

    } catch (error) {
        logger.error(`Get transactions error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy danh sách giao dịch'
        });
    }
});

/**
 * @swagger
 * /api/transactions:
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
 *             $ref: '#/components/schemas/TransactionCreate'
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
 *                 data:
 *                   $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.post('/', async (req, res) => {
    try {
        const userId = req.user.userId;
        const transactionData = { ...req.body, userId, createdBy: userId, updatedBy: userId };

        // Validation
        const validationErrors = validateTransactionData(transactionData);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu không hợp lệ',
                errors: validationErrors
            });
        }

        const transaction = new Transaction(transactionData);
        await transaction.save();

        logger.info(`Transaction created: ${transaction._id} by user: ${userId}`);

        res.status(201).json({
            success: true,
            data: transaction.toSafeObject(),
            message: 'Tạo giao dịch thành công'
        });

    } catch (error) {
        logger.error(`Create transaction error: ${error.message}`);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Lỗi validation',
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Lỗi tạo giao dịch'
        });
    }
});

/**
 * @swagger
 * /api/transactions/{id}:
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
 *         description: ID của giao dịch
 *     responses:
 *       200:
 *         description: Chi tiết giao dịch
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: Không tìm thấy giao dịch
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const transaction = await Transaction.findOne({ _id: id, userId });
        
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy giao dịch'
            });
        }

        res.json({
            success: true,
            data: transaction.toSafeObject()
        });

    } catch (error) {
        logger.error(`Get transaction error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy chi tiết giao dịch'
        });
    }
});

/**
 * @swagger
 * /api/transactions/{id}:
 *   put:
 *     summary: Cập nhật giao dịch
 *     tags: [Transactions]
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
 *             $ref: '#/components/schemas/TransactionCreate'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy giao dịch
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const updateData = { ...req.body, updatedBy: userId };

        // Validation
        const validationErrors = validateTransactionData(updateData);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu không hợp lệ',
                errors: validationErrors
            });
        }

        const transaction = await Transaction.findOneAndUpdate(
            { _id: id, userId },
            updateData,
            { new: true, runValidators: true }
        );

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy giao dịch'
            });
        }

        logger.info(`Transaction updated: ${id} by user: ${userId}`);

        res.json({
            success: true,
            data: transaction.toSafeObject(),
            message: 'Cập nhật giao dịch thành công'
        });

    } catch (error) {
        logger.error(`Update transaction error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Lỗi cập nhật giao dịch'
        });
    }
});

/**
 * @swagger
 * /api/transactions/{id}:
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
 *         description: ID của giao dịch
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       404:
 *         description: Không tìm thấy giao dịch
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const transaction = await Transaction.findOneAndDelete({ _id: id, userId });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy giao dịch'
            });
        }

        // Delete attached files if any
        if (transaction.attachments && transaction.attachments.length > 0) {
            transaction.attachments.forEach(attachment => {
                const filePath = path.join(__dirname, '../', attachment.path);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
        }

        logger.info(`Transaction deleted: ${id} by user: ${userId}`);

        res.json({
            success: true,
            message: 'Xóa giao dịch thành công'
        });

    } catch (error) {
        logger.error(`Delete transaction error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Lỗi xóa giao dịch'
        });
    }
});

/**
 * @swagger
 * /api/transactions/{id}/duplicate:
 *   post:
 *     summary: Nhân bản giao dịch
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của giao dịch cần nhân bản
 *     responses:
 *       201:
 *         description: Nhân bản thành công
 *       404:
 *         description: Không tìm thấy giao dịch
 */
router.post('/:id/duplicate', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const originalTransaction = await Transaction.findOne({ _id: id, userId });

        if (!originalTransaction) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy giao dịch'
            });
        }

        const duplicateTransaction = originalTransaction.duplicate();
        duplicateTransaction.createdBy = userId;
        duplicateTransaction.updatedBy = userId;
        
        await duplicateTransaction.save();

        logger.info(`Transaction duplicated: ${id} -> ${duplicateTransaction._id} by user: ${userId}`);

        res.status(201).json({
            success: true,
            data: duplicateTransaction.toSafeObject(),
            message: 'Nhân bản giao dịch thành công'
        });

    } catch (error) {
        logger.error(`Duplicate transaction error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Lỗi nhân bản giao dịch'
        });
    }
});

/**
 * @swagger
 * /api/transactions/{id}/attachments:
 *   post:
 *     summary: Upload file đính kèm
 *     tags: [Transactions]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Upload thành công
 *       404:
 *         description: Không tìm thấy giao dịch
 */
router.post('/:id/attachments', upload.array('files', 5), async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const transaction = await Transaction.findOne({ _id: id, userId });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy giao dịch'
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Không có file nào được upload'
            });
        }

        const attachments = req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            path: `uploads/transactions/${file.filename}`
        }));

        transaction.attachments.push(...attachments);
        transaction.updatedBy = userId;
        await transaction.save();

        logger.info(`${attachments.length} attachments added to transaction: ${id} by user: ${userId}`);

        res.json({
            success: true,
            data: attachments,
            message: 'Upload file thành công'
        });

    } catch (error) {
        logger.error(`Upload attachment error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Lỗi upload file'
        });
    }
});

/**
 * @swagger
 * /api/transactions/bulk:
 *   post:
 *     summary: Tạo nhiều giao dịch cùng lúc
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transactions:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/TransactionCreate'
 *     responses:
 *       201:
 *         description: Tạo bulk thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.post('/bulk', async (req, res) => {
    try {
        const { transactions } = req.body;
        const userId = req.user.userId;

        if (!Array.isArray(transactions) || transactions.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu giao dịch không hợp lệ'
            });
        }

        if (transactions.length > 100) {
            return res.status(400).json({
                success: false,
                message: 'Không thể tạo quá 100 giao dịch cùng lúc'
            });
        }

        // Validate all transactions
        const validationErrors = [];
        transactions.forEach((transaction, index) => {
            const errors = validateTransactionData(transaction);
            if (errors.length > 0) {
                validationErrors.push({ index, errors });
            }
        });

        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Có lỗi validation trong dữ liệu',
                validationErrors
            });
        }

        // Prepare transactions for insertion
        const transactionsToInsert = transactions.map(transaction => ({
            ...transaction,
            userId,
            createdBy: userId,
            updatedBy: userId
        }));

        const createdTransactions = await Transaction.insertMany(transactionsToInsert);

        logger.info(`${createdTransactions.length} transactions created in bulk by user: ${userId}`);

        res.status(201).json({
            success: true,
            data: createdTransactions.map(t => t.toSafeObject()),
            message: `Tạo thành công ${createdTransactions.length} giao dịch`
        });

    } catch (error) {
        logger.error(`Bulk create transactions error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Lỗi tạo giao dịch hàng loạt'
        });
    }
});

module.exports = router;
