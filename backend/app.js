require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Rute
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');
const paymentRoutes = require('./routes/payments');

const app = express();
const PORT = process.env.PORT || 3000;

/* =======================
   MIDDLEWARE
======================= */
app.use(cors({
  origin: true,
  credentials: true,
}));

// Standardni JSON parser (pošto nema više webhooka, ne treba nam express.raw)
app.use(express.json({ limit: '1mb' }));

/* =======================
   API RUTE
======================= */
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api', publicRoutes);

/* =======================
   STATIC & FALLBACK
======================= */
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ message: 'API ruta nije pronađena' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* =======================
   START SERVER
======================= */
const startServer = async () => {
  try {
    if (!process.env.MONGO_URL) {
      console.error('❌ MONGO_URL nije postavljen u .env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URL, {
      dbName: process.env.DB_NAME || 'continental_academy',
    });

    console.log('✓ MongoDB povezan');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✓ Server trči na http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Greška pri startovanju:', err);
  }
};

startServer();
