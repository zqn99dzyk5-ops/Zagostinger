require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Uvoz ruta
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');
const paymentRoutes = require('./routes/payments');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// API Rute
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api', publicRoutes);

// Static files (React Build)
app.use(express.static(path.join(__dirname, 'public')));

// Fallback za React Router
app.get('*', (req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ message: 'Ruta ne postoji' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Database & Start
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log('✓ MongoDB Povezan');
    app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server online na portu ${PORT}`));
  })
  .catch(err => console.error('❌ Greška pri startovanju:', err));
