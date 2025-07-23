const { Server } = require('ws');
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

class WebSocketService {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // userId -> ws connection
  }

  initialize(server) {
    this.wss = new Server({ server });

    this.wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });

    logger.info('WebSocket server initialized');
  }

  async handleConnection(ws, req) {
    try {
      // Authenticate WebSocket connection
      const token = new URL(req.url, 'http://localhost').searchParams.get('token');
      
      if (!token) {
        ws.close(1008, 'Token required');
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;

      // Store connection
      this.clients.set(userId, ws);
      logger.info(`WebSocket client connected: ${userId}`);

      ws.on('close', () => {
        this.clients.delete(userId);
        logger.info(`WebSocket client disconnected: ${userId}`);
      });

      ws.on('error', (error) => {
        logger.error('WebSocket error:', error);
        this.clients.delete(userId);
      });

      // Send welcome message
      this.sendToUser(userId, {
        type: 'connection',
        message: 'Connected successfully'
      });

    } catch (error) {
      logger.error('WebSocket authentication failed:', error);
      ws.close(1008, 'Authentication failed');
    }
  }

  sendToUser(userId, data) {
    const ws = this.clients.get(userId);
    if (ws && ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(data));
      return true;
    }
    return false;
  }

  broadcast(data) {
    this.clients.forEach((ws, userId) => {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(data));
      }
    });
  }

  // Notify user about new transaction
  notifyTransaction(userId, transaction) {
    this.sendToUser(userId, {
      type: 'transaction',
      action: 'created',
      data: transaction
    });
  }

  // Notify user about budget alert
  notifyBudgetAlert(userId, alert) {
    this.sendToUser(userId, {
      type: 'budget_alert',
      data: alert
    });
  }
}

module.exports = new WebSocketService();