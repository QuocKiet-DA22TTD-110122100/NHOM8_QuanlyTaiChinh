const express = require('express');
const crypto = require('crypto');
const logger = require('../config/logger');
const Transaction = require('../models/Transaction');
const websocketService = require('../services/websocket');

const router = express.Router();

// Webhook signature verification
const verifyWebhookSignature = (req, res, next) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);
  const secret = process.env.WEBHOOK_SECRET || 'webhook-secret';
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  if (signature !== `sha256=${expectedSignature}`) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  next();
};

// Bank webhook for transaction updates
router.post('/bank/transaction', verifyWebhookSignature, async (req, res) => {
  try {
    const { accountId, transaction, userId } = req.body;

    // Create transaction in database
    const newTransaction = new Transaction({
      userId,
      type: transaction.amount > 0 ? 'income' : 'expense',
      amount: Math.abs(transaction.amount),
      category: transaction.category || 'bank_transfer',
      description: transaction.description,
      date: new Date(transaction.date),
      bankReference: transaction.reference
    });

    await newTransaction.save();

    // Notify user via WebSocket
    websocketService.notifyTransaction(userId, newTransaction);

    logger.info(`Bank webhook processed: ${transaction.reference}`);
    res.status(200).json({ success: true });

  } catch (error) {
    logger.error('Bank webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Third-party integration webhook
router.post('/integration/:service', verifyWebhookSignature, async (req, res) => {
  try {
    const { service } = req.params;
    const payload = req.body;

    logger.info(`Webhook received from ${service}:`, payload);

    // Process based on service type
    switch (service) {
      case 'payment-gateway':
        await handlePaymentWebhook(payload);
        break;
      case 'expense-tracker':
        await handleExpenseWebhook(payload);
        break;
      default:
        logger.warn(`Unknown webhook service: ${service}`);
    }

    res.status(200).json({ success: true });

  } catch (error) {
    logger.error('Integration webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

async function handlePaymentWebhook(payload) {
  // Handle payment gateway webhooks
  logger.info('Processing payment webhook:', payload);
}

async function handleExpenseWebhook(payload) {
  // Handle expense tracking webhooks
  logger.info('Processing expense webhook:', payload);
}

module.exports = router;