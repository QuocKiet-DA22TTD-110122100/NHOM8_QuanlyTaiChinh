const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const logger = require('../config/logger');
const moment = require('moment');

/**
 * @swagger
 * components:
 *   schemas:
 *     ReportSummary:
 *       type: object
 *       properties:
 *         totalIncome:
 *           type: number
 *         totalExpense:
 *           type: number
 *         balance:
 *           type: number
 *         transactionCount:
 *           type: number
 *         period:
 *           type: string
 *     CategoryReport:
 *       type: object
 *       properties:
 *         category:
 *           type: string
 *         amount:
 *           type: number
 *         count:
 *           type: number
 *         percentage:
 *           type: number
 */

/**
 * @swagger
 * /api/reports/summary:
 *   get:
 *     summary: Lấy báo cáo tổng quan
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year]
 *         description: Khoảng thời gian báo cáo
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
 *                 data:
 *                   $ref: '#/components/schemas/ReportSummary'
 */
router.get('/summary', async (req, res) => {
    try {
        const { period = 'month', startDate, endDate } = req.query;
        const userId = req.user.userId;

        // Xác định khoảng thời gian
        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                date: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate + 'T23:59:59.999Z')
                }
            };
        } else {
            const now = moment();
            let start, end;
            
            switch (period) {
                case 'week':
                    start = now.clone().startOf('week');
                    end = now.clone().endOf('week');
                    break;
                case 'quarter':
                    start = now.clone().startOf('quarter');
                    end = now.clone().endOf('quarter');
                    break;
                case 'year':
                    start = now.clone().startOf('year');
                    end = now.clone().endOf('year');
                    break;
                default: // month
                    start = now.clone().startOf('month');
                    end = now.clone().endOf('month');
            }
            
            dateFilter = {
                date: {
                    $gte: start.toDate(),
                    $lte: end.toDate()
                }
            };
        }

        // Aggregate data
        const summary = await Transaction.aggregate([
            {
                $match: {
                    userId: userId,
                    ...dateFilter
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

        const totalIncome = summary.find(s => s._id === 'income')?.total || 0;
        const totalExpense = summary.find(s => s._id === 'expense')?.total || 0;
        const incomeCount = summary.find(s => s._id === 'income')?.count || 0;
        const expenseCount = summary.find(s => s._id === 'expense')?.count || 0;

        const result = {
            totalIncome,
            totalExpense,
            balance: totalIncome - totalExpense,
            transactionCount: incomeCount + expenseCount,
            period: period,
            dateRange: {
                start: dateFilter.date?.$gte,
                end: dateFilter.date?.$lte
            }
        };

        logger.info(`Report summary generated for user: ${userId}`);
        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        logger.error(`Report summary error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Lỗi tạo báo cáo tổng quan'
        });
    }
});

/**
 * @swagger
 * /api/reports/categories:
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
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year]
 *         description: Khoảng thời gian
 *     responses:
 *       200:
 *         description: Báo cáo danh mục thành công
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
 *                     $ref: '#/components/schemas/CategoryReport'
 */
router.get('/categories', async (req, res) => {
    try {
        const { type = 'expense', period = 'month' } = req.query;
        const userId = req.user.userId;

        // Xác định khoảng thời gian (tương tự như summary)
        const now = moment();
        let start, end;
        
        switch (period) {
            case 'week':
                start = now.clone().startOf('week');
                end = now.clone().endOf('week');
                break;
            case 'quarter':
                start = now.clone().startOf('quarter');
                end = now.clone().endOf('quarter');
                break;
            case 'year':
                start = now.clone().startOf('year');
                end = now.clone().endOf('year');
                break;
            default: // month
                start = now.clone().startOf('month');
                end = now.clone().endOf('month');
        }

        const categories = await Transaction.aggregate([
            {
                $match: {
                    userId: userId,
                    type: type,
                    date: {
                        $gte: start.toDate(),
                        $lte: end.toDate()
                    }
                }
            },
            {
                $group: {
                    _id: '$category',
                    amount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { amount: -1 }
            }
        ]);

        // Tính phần trăm
        const totalAmount = categories.reduce((sum, cat) => sum + cat.amount, 0);
        const result = categories.map(cat => ({
            category: cat._id || 'Không phân loại',
            amount: cat.amount,
            count: cat.count,
            percentage: totalAmount > 0 ? (cat.amount / totalAmount * 100).toFixed(2) : 0
        }));

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        logger.error(`Categories report error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Lỗi tạo báo cáo danh mục'
        });
    }
});

/**
 * @swagger
 * /api/reports/trends:
 *   get:
 *     summary: Báo cáo xu hướng theo thời gian
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *         description: Khoảng thời gian nhóm dữ liệu
 *       - in: query
 *         name: months
 *         schema:
 *           type: number
 *           default: 6
 *         description: Số tháng lùi lại
 *     responses:
 *       200:
 *         description: Báo cáo xu hướng thành công
 */
router.get('/trends', async (req, res) => {
    try {
        const { period = 'monthly', months = 6 } = req.query;
        const userId = req.user.userId;

        const startDate = moment().subtract(months, 'months').startOf('month').toDate();
        const endDate = moment().endOf('month').toDate();

        let groupBy = {};
        switch (period) {
            case 'daily':
                groupBy = {
                    year: { $year: '$date' },
                    month: { $month: '$date' },
                    day: { $dayOfMonth: '$date' }
                };
                break;
            case 'weekly':
                groupBy = {
                    year: { $year: '$date' },
                    week: { $week: '$date' }
                };
                break;
            default: // monthly
                groupBy = {
                    year: { $year: '$date' },
                    month: { $month: '$date' }
                };
        }

        const trends = await Transaction.aggregate([
            {
                $match: {
                    userId: userId,
                    date: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $group: {
                    _id: {
                        ...groupBy,
                        type: '$type'
                    },
                    amount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 }
            }
        ]);

        res.json({
            success: true,
            data: trends
        });

    } catch (error) {
        logger.error(`Trends report error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Lỗi tạo báo cáo xu hướng'
        });
    }
});

/**
 * @swagger
 * /api/reports/export:
 *   get:
 *     summary: Xuất báo cáo Excel
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [excel, pdf]
 *         description: Định dạng xuất
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
 *         description: File báo cáo
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/export', async (req, res) => {
    try {
        const { format = 'excel', startDate, endDate } = req.query;
        const userId = req.user.userId;

        // Lấy dữ liệu giao dịch
        const dateFilter = {};
        if (startDate && endDate) {
            dateFilter.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate + 'T23:59:59.999Z')
            };
        }

        const transactions = await Transaction.find({
            userId: userId,
            ...dateFilter
        }).sort({ date: -1 });

        if (format === 'excel') {
            const ExcelJS = require('exceljs');
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Transactions');

            // Header
            worksheet.columns = [
                { header: 'Ngày', key: 'date', width: 15 },
                { header: 'Loại', key: 'type', width: 10 },
                { header: 'Số tiền', key: 'amount', width: 15 },
                { header: 'Danh mục', key: 'category', width: 20 },
                { header: 'Ghi chú', key: 'note', width: 30 }
            ];

            // Data
            transactions.forEach(transaction => {
                worksheet.addRow({
                    date: moment(transaction.date).format('DD/MM/YYYY'),
                    type: transaction.type === 'income' ? 'Thu nhập' : 'Chi tiêu',
                    amount: transaction.amount,
                    category: transaction.category || '',
                    note: transaction.note || ''
                });
            });

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=transactions_${moment().format('YYYYMMDD')}.xlsx`);

            await workbook.xlsx.write(res);
            res.end();
        } else {
            res.status(400).json({
                success: false,
                message: 'Định dạng không được hỗ trợ'
            });
        }

    } catch (error) {
        logger.error(`Export report error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Lỗi xuất báo cáo'
        });
    }
});

module.exports = router;
