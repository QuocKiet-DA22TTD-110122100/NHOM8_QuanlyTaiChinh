const express = require('express');
const router = express.Router();

// Sample GET endpoint
router.get('/', (req, res) => {
  res.json({ message: 'Reports route is working!',
    user: req.user
    
  });
});

module.exports = router;
