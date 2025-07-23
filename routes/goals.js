const express = require('express');
const Goal = require('../models/Goal');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all goals
router.get('/', auth, async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id })
      .populate('category', 'name icon color')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: goals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// Create goal
router.post('/', auth, async (req, res) => {
  try {
    const goal = new Goal({
      ...req.body,
      user: req.user.id
    });

    await goal.save();
    await goal.populate('category', 'name icon color');

    res.status(201).json({
      success: true,
      data: goal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// Update goal
router.put('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    ).populate('category', 'name icon color');

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy mục tiêu'
      });
    }

    res.json({
      success: true,
      data: goal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// Add progress to goal
router.post('/:id/progress', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy mục tiêu'
      });
    }

    goal.currentAmount += amount;
    
    if (goal.currentAmount >= goal.targetAmount) {
      goal.status = 'completed';
    }

    await goal.save();

    res.json({
      success: true,
      data: goal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// Delete goal
router.delete('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy mục tiêu'
      });
    }

    res.json({
      success: true,
      message: 'Xóa mục tiêu thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});
const User = require('../models/User');
const jwt = require('jsonwebtoken');    

module.exports = router;