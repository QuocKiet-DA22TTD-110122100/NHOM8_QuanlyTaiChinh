const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /api/v1/bank/accounts:
 *   get:
 *     tags: [Bank Integration]
 *     summary: Lấy danh sách tài khoản ngân hàng
 *     description: Lấy thông tin các tài khoản ngân hàng của người dùng
 *     responses:
 *       200:
 *         description: Lấy danh sách tài khoản thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     accounts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "1"
 *                           bankName:
 *                             type: string
 *                             example: "Vietcombank"
 *                           accountNumber:
 *                             type: string
 *                             example: "****1234"
 *                           balance:
 *                             type: number
 *                             example: 5000000
 */

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

