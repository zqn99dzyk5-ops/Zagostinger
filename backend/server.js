require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');

// DODANO: Model za kreiranje Admina
const User = require('./models/User'); 

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
   START & DATABASE
========================================== */
mongoose.connect(process.env.MONGO_URL)
.then(async () => {
  console.log('✅ MongoDB Povezan');

  // --- AUTOMATSKI ADMIN ACCOUNT START ---
  try {
    const adminEmail = 'admin@test.com';
    const checkAdmin = await User.findOne({ email: adminEmail });

    if (!checkAdmin) {
      // Ako ne postoji, napravi ga
      const newAdmin = new User({
        name: 'Super Admin',
        email: adminEmail,
        password: 'password123', // Ovo će se heširati
        role: 'admin',
        is_verified: true
      });

      await newAdmin.save();
      console.log('👑 KREIRAN ADMIN: admin@test.com | Šifra: password123');
    } else {
      // Ako postoji, provjeri da li je admin
      if (checkAdmin.role !== 'admin') {
        checkAdmin.role = 'admin';
        await checkAdmin.save();
        console.log('👑 Korisnik admin@test.com je unaprijeđen u ADMINA.');
      } else {
        console.log('👑 Admin account već postoji (admin@test.com)');
      }
    }
  } catch (error) {
    console.error('⚠️ Greška pri kreiranju admina:', error.message);
  }
  // --- AUTOMATSKI ADMIN ACCOUNT END ---

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server radi na portu ${PORT}`);
  });
})
.catch((err) => {
  console.error('❌ Greška:', err.message);
});
