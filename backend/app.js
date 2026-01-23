require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
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
const PORT = process.env.PORT || 3000;

/* =======================
   CORS
======================= */
app.use(cors({
  origin: true, 
  credentials: true,
}));

/* =======================
   BODY PARSERS (VAŽAN REDOSLIJED)
======================= */

// 1. Stripe webhook MORA ići prije express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// 2. Standardni JSON parser za sve ostale rute
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
   API ROUTES
======================= */
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api', publicRoutes);

// Fix za Analytics
app.post('/api/analytics/event', async (req, res) => {
  res.status(204).end();
});

/* =======================
   STATIC REACT BUILD
======================= */
app.use(express.static(path.join(__dirname, 'public')));

/* =======================
   REACT ROUTER FALLBACK
======================= */
app.get('*', (req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ message: 'API route not found' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
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
      console.log('✓ Admin created: admin@test.com / ' + adminPassword);
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
      console.log(`✓ Server running on port ${PORT}`);
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
