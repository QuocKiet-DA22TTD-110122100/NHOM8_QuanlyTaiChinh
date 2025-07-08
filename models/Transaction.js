const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true // Index for faster queries
  },
  type: { 
    type: String, 
    enum: ['income', 'expense'], 
    required: true,
    index: true
  },
  amount: { 
    type: Number, 
    required: true,
    min: [0, 'Số tiền phải lớn hơn 0'],
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
    index: true
  },
  // Metadata
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag không được quá 30 ký tự']
  }],
  location: {
    name: String,
    address: String,
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
  // Recurring transaction
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringConfig: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly']
    },
    endDate: Date,
    lastGenerated: Date
  },
  // Attachments
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  // Budget tracking
  budgetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Budget'
  },
  // Status
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'completed'
  },
  // Audit fields
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true, // Automatically handle createdAt and updatedAt
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

// Pre-save middleware
transactionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Validate category based on type
  if (this.type === 'income' && this.category) {
    const validIncomeCategories = ['salary', 'bonus', 'freelance', 'investment', 'business', 'other'];
    if (!validIncomeCategories.includes(this.category.toLowerCase())) {
      // Allow custom categories but log them
      console.log(`Custom income category: ${this.category}`);
    }
  }
  
  if (this.type === 'expense' && this.category) {
    const validExpenseCategories = [
      'food', 'transport', 'housing', 'utilities', 'healthcare', 
      'entertainment', 'shopping', 'education', 'insurance', 'other'
    ];
    if (!validExpenseCategories.includes(this.category.toLowerCase())) {
      console.log(`Custom expense category: ${this.category}`);
    }
  }
  
  next();
});

// Static methods
transactionSchema.statics.getMonthlyStats = function(userId, year, month) {
  return this.aggregate([
    {
      $match: {
        userId: userId,
        date: {
          $gte: new Date(year, month - 1, 1),
          $lt: new Date(year, month, 1)
        }
      }
    },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' }
      }
    }
  ]);
};

transactionSchema.statics.getCategoryBreakdown = function(userId, type, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        userId: userId,
        type: type,
        date: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
        transactions: { $push: '$$ROOT' }
      }
    },
    {
      $sort: { total: -1 }
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
    tags: [...this.tags]
  });
  return duplicate;
};

transactionSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  delete obj.__v;
  delete obj.updatedBy;
  delete obj.createdBy;
  return obj;
};

module.exports = mongoose.model('Transaction', transactionSchema);