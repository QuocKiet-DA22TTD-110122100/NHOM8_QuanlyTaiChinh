const express = require('express');
const router = express.Router();

// Get bank accounts
router.get('/accounts', (req, res) => {
  res.json({
    success: true,
    data: {
      accounts: [
        {
          id: '1',
          bankName: 'Vietcombank',
          accountNumber: '****1234',
          balance: 5000000
        }
      ]
    }
  });
});

module.exports = router;

