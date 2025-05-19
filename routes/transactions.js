const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const auth = require('../middlewares/auth');

router.use(auth);

router.post('/', async (req, res) => {
  const transaction = new Transaction({ ...req.body, userId: req.user.userId });
  await transaction.save();
  res.json(transaction);
});

router.get('/', async (req, res) => {
  const transactions = await Transaction.find({ userId: req.user.userId });
  res.json(transactions);
});

module.exports = router;
