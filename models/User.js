const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: [true, 'Email là bắt buộc'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Email không hợp lệ'
    },
    index: true
  },
  password: { 
    type: String, 
    required: [true, 'Mật khẩu là bắt buộc'],
    minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
    validate: {
      validator: function(password) {
        // Only validate on new passwords, not hashed ones
        if (this.isNew || this.isModified('password')) {
          return password.length >= 6;
        }
        return true;
      },
      message: 'Mật khẩu phải có ít nhất 6 ký tự'
    }
  },
  name: { 
    type: String, 
    required: [true, 'Tên là bắt buộc'],
    trim: true,
    minlength: [2, 'Tên phải có ít nhất 2 ký tự'],
    maxlength: [50, 'Tên không được quá 50 ký tự']
  },
  // Additional user information
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    phone: {
      type: String,
      validate: {
        validator: function(phone) {
          return !phone || /^[0-9+\-\s()]{10,15}$/.test(phone);
        },
        message: 'Số điện thoại không hợp lệ'
      }
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    }
  },
  // Account settings
  settings: {
    currency: {
      type: String,
      default: 'VND',
      enum: ['VND', 'USD', 'EUR']
    },
    language: {
      type: String,
      default: 'vi',
      enum: ['vi', 'en']
    },
    timezone: {
      type: String,
      default: 'Asia/Ho_Chi_Minh'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      weeklyReport: {
        type: Boolean,
        default: true
      },
      monthlyReport: {
        type: Boolean,
        default: true
      }
    },
    budgetAlerts: {
      enabled: {
        type: Boolean,
        default: true
      },
      threshold: {
        type: Number,
        default: 80, // 80% of budget
        min: 0,
        max: 100
      }
    }
  },
  // Security
  security: {
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    twoFactorSecret: String,
    recoveryTokens: [String],
    lastLogin: Date,
    loginAttempts: {
      count: {
        type: Number,
        default: 0
      },
      lastAttempt: Date,
      lockedUntil: Date
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    isEmailVerified: {
      type: Boolean,
      default: false
    }
  },
  // Subscription and limits
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'premium', 'enterprise'],
      default: 'free'
    },
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: true
    },
    transactionLimit: {
      type: Number,
      default: 100 // Monthly limit for free plan
    }
  },
  // Status and metadata
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'deleted'],
    default: 'active'
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  // Audit fields
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.security.twoFactorSecret;
      delete ret.security.recoveryTokens;
      delete ret.security.passwordResetToken;
      delete ret.security.emailVerificationToken;
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes for better performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ 'security.lastLogin': -1 });
userSchema.index({ status: 1 });
userSchema.index({ createdAt: -1 });

// Virtual fields
userSchema.virtual('fullName').get(function() {
  if (this.profile && this.profile.firstName && this.profile.lastName) {
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }
  return this.name;
});

userSchema.virtual('isAccountLocked').get(function() {
  return this.security.loginAttempts.lockedUntil && 
         this.security.loginAttempts.lockedUntil > Date.now();
});

userSchema.virtual('daysSinceRegistration').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware
userSchema.pre('save', async function(next) {
  // Update timestamp
  this.updatedAt = Date.now();
  
  // Hash password if modified
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance methods
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!candidatePassword || !this.password) {
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generatePasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.security.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.security.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

userSchema.methods.generateEmailVerificationToken = function() {
  const verifyToken = crypto.randomBytes(32).toString('hex');
  this.security.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verifyToken)
    .digest('hex');
  this.security.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return verifyToken;
};

userSchema.methods.incrementLoginAttempts = function() {
  // Reset count if last attempt was more than 2 hours ago
  if (this.security.loginAttempts.lastAttempt && 
      Date.now() - this.security.loginAttempts.lastAttempt > 2 * 60 * 60 * 1000) {
    this.security.loginAttempts.count = 0;
  }
  
  this.security.loginAttempts.count += 1;
  this.security.loginAttempts.lastAttempt = Date.now();
  
  // Lock account after 5 failed attempts for 30 minutes
  if (this.security.loginAttempts.count >= 5) {
    this.security.loginAttempts.lockedUntil = Date.now() + 30 * 60 * 1000;
  }
};

userSchema.methods.resetLoginAttempts = function() {
  this.security.loginAttempts.count = 0;
  this.security.loginAttempts.lastAttempt = undefined;
  this.security.loginAttempts.lockedUntil = undefined;
};

userSchema.methods.updateLastLogin = function() {
  this.security.lastLogin = Date.now();
  this.lastActive = Date.now();
  this.resetLoginAttempts();
};

userSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.security.twoFactorSecret;
  delete obj.security.recoveryTokens;
  delete obj.security.passwordResetToken;
  delete obj.security.emailVerificationToken;
  delete obj.__v;
  return obj;
};

userSchema.methods.canCreateTransaction = function() {
  if (this.subscription.plan === 'free') {
    // Check monthly transaction limit for free users
    // This would need to be implemented with actual transaction counting
    return true; // Simplified for now
  }
  return true;
};

// Static methods
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ 
    email: email.toLowerCase(),
    status: { $ne: 'deleted' }
  });
};

userSchema.statics.findActiveUsers = function() {
  return this.find({ 
    status: 'active',
    'security.lastLogin': { 
      $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
    }
  });
};

userSchema.statics.getRegistrationStats = function(days = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);
};

// Compound indexes
userSchema.index({ 
  email: 1, 
  status: 1 
});

userSchema.index({ 
  'subscription.plan': 1, 
  'subscription.isActive': 1 
});

module.exports = mongoose.model('User', userSchema);
