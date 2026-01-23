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
const corsOrigins =
  process.env.CORS_ORIGINS === '*'
    ? true
    : process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
    : ['http://localhost:3000'];

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);

/* =======================
   BODY PARSERS
======================= */

// Stripe webhook needs raw body
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Everything else uses JSON
app.use(express.json({ limit: '1mb' }));

/* =======================
   HEALTH CHECK
======================= */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Continental Academy API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

/* =======================
   ROUTES
======================= */
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api', publicRoutes);

/* =======================
   ANALYTICS (FIX ZA 405)
======================= */
app.post('/api/analytics/event', async (req, res) => {
  try {
    // možeš kasnije spremati u DB
    res.status(204).end(); // silent success
  } catch {
    res.status(204).end();
  }
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

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const adminPassword = crypto.randomBytes(8).toString('hex');

      await new User({
        name: 'Admin',
        email: 'admin@test.com',
        password: adminPassword,
        role: 'admin',
      }).save();

      await new User({
        name: 'Student',
        email: 'student@test.com',
        password: 'student123',
        role: 'user',
      }).save();

      console.log('✓ Admin user created');
      console.log(`  admin@test.com / ${adminPassword}`);
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
      serverSelectionTimeoutMS: 10000,
    });

    console.log('✓ MongoDB connected');

    await initializeDefaults();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

/* =======================
   GRACEFUL SHUTDOWN
======================= */
const shutdown = async () => {
  console.log('\nShutting down...');
  await mongoose.connection.close();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startServer();