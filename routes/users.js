const express = require('express');
const router = express.Router();

// Get user profile
router.get('/profile', (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user.userId,
        email: req.user.email,
        name: 'User Name'
      }
    }
  });
});

module.exports = router;
