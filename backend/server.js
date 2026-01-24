require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');

// Rute
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');
const paymentRoutes = require('./routes/payments');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

/* ==========================================
   MIDDLEWARE
========================================== */

// Webhook mora biti PRVI
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

/* ==========================================
   RUTE
========================================== */
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api', publicRoutes);

/* ==========================================
   STATIC FILES
========================================== */
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ message: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* ==========================================
   START
========================================== */
mongoose.connect(process.env.MONGO_URL)
.then(() => {
  console.log('✅ MongoDB Povezan');
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server radi na portu ${PORT}`);
  });
})
.catch((err) => {
  console.error('❌ Greška:', err.message);
});
