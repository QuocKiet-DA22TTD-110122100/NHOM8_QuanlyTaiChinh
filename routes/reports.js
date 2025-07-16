const express = require('express');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const auth = require('../middleware/auth');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

const router = express.Router();

// Get monthly report
router.get('/monthly', auth, async (req, res) => {
  try {
    const { year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = req.query;
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const report = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $group: {
          _id: {
            type: '$type',
            category: '$category',
            categoryName: { $arrayElemAt: ['$categoryInfo.name', 0] }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          transactions: { $push: '$$ROOT' }
        }
      },
      {
        $group: {
          _id: '$_id.type',
          categories: {
            $push: {
              category: '$_id.category',
              name: '$_id.categoryName',
              total: '$total',
              count: '$count'
            }
          },
          totalAmount: { $sum: '$total' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        period: { year, month },
        report
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server' 
    });
  }
});

// Get yearly report
router.get('/yearly', auth, async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const report = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            type: '$type',
            month: { $month: '$date' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.type',
          months: {
            $push: {
              month: '$_id.month',
              total: '$total',
              count: '$count'
            }
          },
          totalAmount: { $sum: '$total' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        year,
        report
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server' 
    });
  }
});

// Export to Excel
router.get('/export/excel', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = { user: req.user._id };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .populate('category', 'name')
      .sort({ date: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Transactions');

    worksheet.columns = [
      { header: 'Ngày', key: 'date', width: 15 },
      { header: 'Loại', key: 'type', width: 10 },
      { header: 'Số tiền', key: 'amount', width: 15 },
      { header: 'Danh mục', key: 'category', width: 20 },
      { header: 'Mô tả', key: 'description', width: 30 },
      { header: 'Tags', key: 'tags', width: 20 }
    ];

    transactions.forEach(transaction => {
      worksheet.addRow({
        date: transaction.date.toLocaleDateString('vi-VN'),
        type: transaction.type === 'income' ? 'Thu nhập' : 'Chi tiêu',
        amount: transaction.amount,
        category: transaction.category?.name || '',
        description: transaction.description || '',
        tags: transaction.tags.join(', ')
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server' 
    });
  }
});

// Export to PDF
router.get('/export/pdf', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = { user: req.user._id };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .populate('category', 'name')
      .sort({ date: -1 });

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.pdf');

    doc.pipe(res);

    doc.fontSize(20).text('Báo cáo giao dịch', 100, 100);
    doc.fontSize(12);

    let y = 150;
    transactions.forEach(transaction => {
      doc.text(`${transaction.date.toLocaleDateString('vi-VN')} - ${transaction.type === 'income' ? 'Thu' : 'Chi'}: ${transaction.amount.toLocaleString()} VND`, 100, y);
      doc.text(`Danh mục: ${transaction.category?.name || ''} - ${transaction.description || ''}`, 100, y + 15);
      y += 40;
      
      if (y > 700) {
        doc.addPage();
        y = 100;
      }
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server' 
    });
  }
});

module.exports = router;


