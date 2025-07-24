// models/Transaction.js
const mongoose = require('mongoose');
const logger = require('../config/logger'); // Import logger

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: [true, 'Số tiền là bắt buộc'],
    min: [0.01, 'Số tiền phải lớn hơn 0'], // Changed to 0.01 for practical use
    validate: {
      validator: function(v) {
        return v > 0;
      },
      message: 'Số tiền phải lớn hơn 0'
    }
  },
  category: {
    type: String,
    trim: true,
    maxlength: [50, 'Danh mục không được quá 50 ký tự'],
    required: [true, 'Danh mục là bắt buộc'],
    index: true
  },
  subcategory: {
    type: String,
    trim: true,
    maxlength: [50, 'Danh mục con không được quá 50 ký tự']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Mô tả không được quá 500 ký tự']
  },
  note: {
    type: String,
    trim: true,
    maxlength: [200, 'Ghi chú không được quá 200 ký tự']
  },
  date: {
    type: Date,
    default: Date.now,
    required: [true, 'Ngày giao dịch là bắt buộc'],
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag không được quá 30 ký tự']
  }],
  location: {
    name: { type: String, trim: true },
    address: { type: String, trim: true },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer', 'e_wallet', 'other'],
    default: 'cash'
  },
  currency: {
    type: String,
    default: 'VND',
    enum: ['VND', 'USD', 'EUR']
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringConfig: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly', null] // null if not recurring
    },
    endDate: Date,
    lastGenerated: Date
  },
  budgetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Budget' // Assuming you'll have a Budget model
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'completed'
  },
  // Mongoose timestamps will handle createdAt and updatedAt
  bankReference: {
    type: String,
    index: true // Để tránh duplicate khi sync
  },
  bankAccount: {
    type: String // Số tài khoản ngân hàng
  },
  syncedAt: {
    type: Date // Thời gian đồng bộ từ ngân hàng
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1, date: -1 });
transactionSchema.index({ userId: 1, createdAt: -1 });

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: this.currency || 'VND'
  }).format(this.amount);
});

// Virtual for days since creation
transactionSchema.virtual('daysSinceCreation').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware for category validation (optional, can be done in controller)
transactionSchema.pre('save', function(next) {
  const validIncomeCategories = ['salary', 'bonus', 'freelance', 'investment', 'business', 'gift', 'other'];
  const validExpenseCategories = [
    'food', 'transport', 'housing', 'utilities', 'healthcare',
    'entertainment', 'shopping', 'education', 'insurance', 'bills', 'personal care', 'other'
  ];

  const lowerCaseCategory = this.category.toLowerCase();

  if (this.type === 'income' && !validIncomeCategories.includes(lowerCaseCategory)) {
    logger.warn(`Custom income category used: ${this.category} by user ${this.userId}`);
    // Optionally, you could throw an error here if you want strict validation
    // return next(new Error(`Invalid income category: ${this.category}`));
  } else if (this.type === 'expense' && !validExpenseCategories.includes(lowerCaseCategory)) {
    logger.warn(`Custom expense category used: ${this.category} by user ${this.userId}`);
    // Optionally, you could throw an error here
    // return next(new Error(`Invalid expense category: ${this.category}`));
  }
  next();
});

// Static methods
transactionSchema.statics.getMonthlyStats = async function(userId, year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // Sửa từ month, 1 thành month, 0

  return this.aggregate([
    {
      $match: {
        userId: userId,
        date: { $gte: startDate, $lte: endDate } // Sửa từ $lt thành $lte
      }
    },
    {
      $group: {
        _id: '$type',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
        averageAmount: { $avg: '$amount' }
      }
    }
  ]);
};

transactionSchema.statics.getSummaryStats = async function(userId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        userId: userId,
        date: { $gte: startDate, $lte: endDate }
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
};

transactionSchema.statics.getCategoryBreakdownByType = async function(userId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        userId: userId,
        date: { $gte: startDate, $lte: endDate }
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
};

transactionSchema.virtual('isPositiveBalance').get(function() {
  return this.type === 'income';
});

transactionSchema.statics.getCategoryBreakdown = async function(userId, type, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        userId: userId,
        type: type,
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$category',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
        // transactions: { $push: '$$ROOT' } // Can be heavy for large datasets
      }
    },
    {
      $sort: { totalAmount: -1 }
    }
  ]);
};

// Instance methods
transactionSchema.methods.duplicate = function() {
  const duplicate = new this.constructor({
    userId: this.userId,
    type: this.type,
    amount: this.amount,
    category: this.category,
    subcategory: this.subcategory,
    description: this.description,
    note: `Copy of: ${this.note || ''}`.trim(),
    paymentMethod: this.paymentMethod,
    currency: this.currency,
    tags: [...this.tags],
    date: new Date() // Set current date for duplicated transaction
  });
  return duplicate;
};

transactionSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  delete obj.__v;
  // You might want to keep createdBy/updatedBy for audit logs
  // delete obj.updatedBy;
  // delete obj.createdBy;
  return obj;
};

module.exports = mongoose.model('Transaction', transactionSchema);
