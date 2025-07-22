const express = require('express');
const BankAccount = require('../models/BankAccount');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all bank accounts
router.get('/', auth, async (req, res) => {
  try {
    const accounts = await BankAccount.find({ 
      user: req.user.id,
      isActive: true 
    });

    res.json({
      success: true,
      data: accounts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// Add bank account
router.post('/', auth, async (req, res) => {
  try {
    const account = new BankAccount({
      ...req.body,
      user: req.user.id
    });

    await account.save();

    res.status(201).json({
      success: true,
      data: account
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// Update bank account
router.put('/:id', auth, async (req, res) => {
  try {
    const account = await BankAccount.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản ngân hàng'
      });
    }

    res.json({
      success: true,
      data: account
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// Delete bank account
router.delete('/:id', auth, async (req, res) => {
  try {
    const account = await BankAccount.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isActive: false },
      { new: true }
    );

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản ngân hàng'
      });
    }

    res.json({
      success: true,
      message: 'Xóa tài khoản ngân hàng thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// Sync bank account balance
router.post('/:id/sync', auth, async (req, res) => {
  try {
    const account = await BankAccount.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản ngân hàng'
      });
    }

    // TODO: Implement actual bank API integration
    // For now, just update lastSync
    account.lastSync = new Date();
    await account.save();

    res.json({
      success: true,
      message: 'Đồng bộ thành công',
      data: account
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

module.exports = router;