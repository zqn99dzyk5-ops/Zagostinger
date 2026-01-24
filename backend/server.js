require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const helmet = require('helmet');
const compression = require('compression');

// Tvoje rute koje si imao
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');
const paymentRoutes = require('./routes/payments');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

/* ==========================================
   MIDDLEWARE (Tvoj originalni setup)
========================================== */

// Webhook mora biti PRVI i mora biti RAW
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(helmet({
  contentSecurityPolicy: false, // Isključeno da ti ne blokira video i slike sa drugih domena
}));
app.use(compression());
app.use(cors({
  origin: true,
  credentials: true
}));

// Povećani limiti za upload koje si verovatno imao
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

/* ==========================================
   LOGGING (Ono što si verovatno imao u dugom kodu)
========================================== */
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

/* ==========================================
   RUTE
========================================== */
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api', publicRoutes);

/* ==========================================
   STATIC FILES & REACT
========================================== */
app.use(express.static(path.join(__dirname, 'public')));

// Serviranje slika iz upload foldera ako ga imaš
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('*', (req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ message: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* ==========================================
   DATABASE & SERVER START
========================================== */
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('-----------------------------------------');
  console.log('✅ MONGO: Konekcija uspostavljena');
  
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SERVER: Aktivan na portu ${PORT}`);
    console.log('-----------------------------------------');
  });
})
.catch((err) => {
  console.error('❌ MONGO GREŠKA:', err.message);
  process.exit(1);
});

// Sprečavanje pucanja servera kod grešaka
process.on('uncaughtException', (err) => {
  console.error('❌ UNCAUGHT EXCEPTION:', err);
});
