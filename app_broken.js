const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const swaggerUi = require('swagger-ui-express');
const { Server } = require('ws');
const http = require('http');

const logger = require('./config/logger');
const swaggerSpec = require('./config/swagger');
const { auth } = require('./middleware/auth');
const { globalErrorHandler, CustomError } = require('./utils/errorHandler'); // Import CustomError

// Import routes
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const reportRoutes = require('./routes/reports');

const app = express();
const server = http.createServer(app);
const wss = new Server({ server });

// Security Middleware
app.use(helmet());

// CORS Configuration
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://your-frontend-domain.com']
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'CORS policy does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body Parser
app.use(express.json({ limit: '10kb' }));

// Rate Limiter
const rateLimiter = new RateLimiterMemory({
  points: 100,
  duration: 3600,
  blockDuration: 3600,
  keyPrefix: 'rate_limit',
});

app.use((req, res, next) => {
  rateLimiter.consume(req.ip)
    .then(() => next())
    .catch(() => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({ success: false, message: 'Too Many Requests' });
    });
});

// Static Files
app.use(express.static('public'));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'healthy', uptime: process.uptime() });
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/transactions', auth, transactionRoutes);
app.use('/api/v1/reports', auth, reportRoutes);

// Catch-all for undefined routes
app.all('*', (req, res, next) => {
  next(new CustomError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// WebSocket server
wss.on('connection', (ws) => {
  logger.info('New WebSocket connection established');
  ws.send('Welcome to the WebSocket server!');
});

// Global Error Handling
app.use(globalErrorHandler);

module.exports = app; // Export app for use in server.js
/**
 * @swagger
 * /api/v1/reports/summary:
 *   get:
 *     summary: Get financial summary for a given period
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Start date for the report (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: End date for the report (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Financial summary for the specified period
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalIncome: { type: number, example: 5000000 }
 *                     totalExpense: { type: number, example: 3000000 }
 */
app.get('/api/v1/reports/summary', auth, async (req, res, next) => {
  const { startDate, endDate } = req.query;
  try { 
    // Validate dates
    if (!startDate || !endDate) {
      return next(new CustomError('Start date and end date are required', 400));
    }

    // Fetch summary from database (example logic)
    const summary = await Transaction.aggregate([
      {
        $match: {
          date: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }
      },
      {
        $group: {
          _id: null,
          totalIncome: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
          totalExpense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } }
        }
      }
    ]);

    if (!summary.length) {
      return res.status(200).json({ success: true, data: { totalIncome: 0, totalExpense: 0 } });
    }

    // Example of caching logic (not implemented here)
    const cacheKey = `report_summary_${startDate}_${endDate}`;
    // Assume we have a cache service to set the cache
    if (cacheService) {
      cacheService.set(cacheKey, summary);
    } else {
      logger.warn('Cache service not available, skipping caching');
    }
    res.status(200).json({
      success: true,
      data: summary[0] // Return the first (and only) result
    });
  } catch (error) {
    logger.error(`Error fetching report summary: ${error.message}`, { stack: error.stack });
    next(error);
  }
});

