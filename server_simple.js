require('dotenv').config();
const express = require('express');

const app = express();

// Basic middleware
app.use(express.json());

// Test routes
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

app.get('/api/v1/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Simple server running on port ${PORT}`);
});

// Kết nối database sau (không crash server nếu lỗi)
setTimeout(async () => {
  try {
    const connectDB = require('./config/database');
    await connectDB();
    console.log('Database connected');
  } catch (error) {
    console.log('Database connection failed, but server still running');
  }
}, 1000);

