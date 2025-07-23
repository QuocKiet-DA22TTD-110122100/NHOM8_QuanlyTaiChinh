const mongoose = require('mongoose');

const bankAccountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bankName: {
    type: String,
    required: true
  },
  accountNumber: {
    type: String,
    required: true
  },
  accountName: String,
  balance: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'VND'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastSync: Date,
  apiCredentials: {
    accessToken: String,
    refreshToken: String,
    expiresAt: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BankAccount', bankAccountSchema);