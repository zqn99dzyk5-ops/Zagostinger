require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto');

// Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');
const paymentRoutes = require('./routes/payments');

// Models
const User = require('./models/User');
const Settings = require('./models/Settings');

const app = express();
const PORT = process.env.PORT || 8001;

/* =======================
   CORS
======================= */
const corsOrigins = process.env.CORS_ORIGINS === '*'
    ? true
    : process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
    : ['http://localhost:3000'];

app.use(cors({
    origin: corsOrigins,
    credentials: true,
}));

/* =======================
   BODY PARSERS (VAŽAN REDOSLIJED)
======================= */

// 1. Stripe webhook MORA biti definisan prije express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// 2. Standardni JSON parser
app.use(express.json({ limit: '1mb' }));

/* =======================
   API ROUTES
======================= */
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api', publicRoutes);

app.post('/api/analytics/event', async (req, res) => {
  res.status(204).end();
});

/* =======================
   INITIAL DATA
======================= */
const initializeDefaults = async () => {
  try {
    const existingSettings = await Settings.findOne({ type: 'site' });
    if (!existingSettings) {
      await new Settings({ type: 'site' }).save();
      console.log('✓ Default settings created');
    }
  } catch (err) {
    console.error('Error initializing defaults:', err);
  }
};

/* =======================
   START SERVER
======================= */
const startServer = async () => {
  try {
    if (!process.env.MONGO_URL) {
      console.error('❌ MONGO_URL not set');
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URL, {
      dbName: process.env.DB_NAME || 'continental_academy',
    });
    console.log('✓ MongoDB connected');
    await initializeDefaults();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✓ API Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

startServer();
