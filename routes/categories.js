const express = require('express');
const Category = require('../models/Category');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all categories
router.get('/', auth, async (req, res) => {
  try {
    const categories = await Category.find({
      $or: [
        { user: req.user.id },
        { isDefault: true }
      ]
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server' 
    });
  }
});

// Create category
router.post('/', auth, async (req, res) => {
  try {
    const category = new Category({
      ...req.body,
      user: req.user.id
    });

    await category.save();

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server' 
    });
  }
});

// Update category
router.put('/:id', auth, async (req, res) => {
  try {
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy danh mục' 
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server' 
    });
  }
});

// Delete category
router.delete('/:id', auth, async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
      isDefault: false
    });

    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy danh mục hoặc không thể xóa' 
      });
    }

    res.json({
      success: true,
      message: 'Xóa danh mục thành công'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server' 
    });
  }
});

module.exports = router;