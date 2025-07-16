const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  icon: String,
  color: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  budget: {
    monthly: Number,
    yearly: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);