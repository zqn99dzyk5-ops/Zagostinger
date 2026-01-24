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

/* ==========================================
   1. CORS POSTAVKE
========================================== */
app.use(cors({
  origin: true, // Dozvoljava svim domenima, možeš staviti svoj IP kasnije
  credentials: true,
}));

/* ==========================================
   2. STRIPE WEBHOOK (Mora ići PRE express.json)
========================================== */
// Ova ruta mora primati "raw" body da bi Stripe verifikacija radila
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }));

/* ==========================================
   3. STANDARDNI MIDDLEWARE
========================================== */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* ==========================================
   4. API RUTE
========================================== */
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api', publicRoutes);

/* ==========================================
   5. SERVIRANJE FRONTENDA (React Build)
========================================== */
// Služi statične fajlove iz 'public' foldera (gde ide build tvojeg React-a)
app.use(express.static(path.join(__dirname, 'public')));

// Fallback za React Router - omogućava refresh stranice bez 404 greške
app.get('*', (req, res) => {
  // Ako je zahtev API a nije pronađen, vrati 404 JSON
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ message: 'API endpoint nije pronađen.' });
  }
  // Za sve ostalo, pošalji index.html iz frontenda
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* ==========================================
   6. DATABASE KONEKCIJA I START
========================================== */
const startApp = async () => {
  try {
    // Provera env varijabli
    if (!process.env.MONGO_URL) {
      throw new Error('MONGO_URL nije definisan u .env fajlu!');
    }

    // Povezivanje na MongoDB
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('-----------------------------------------');
    console.log('✅ DATABASE: MongoDB povezan uspešno.');

    // Pokretanje servera
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 SERVER: Continental Academy je ONLINE.`);
      console.log(`📡 PORT: ${PORT}`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
      console.log('-----------------------------------------');
    });
  } catch (error) {
    console.error('❌ ERROR pri pokretanju servera:', error.message);
    process.exit(1); // Ugasi proces ako baza ne radi
  }
};

startApp();
