const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  amount: { type: Number, required: true },
  category: { type: String },
  date: { type: Date, default: Date.now },
  note: { type: String }
});

module.exports = mongoose.model('Transaction', transactionSchema);
// This code defines a Mongoose schema for a transaction model in a financial application.