require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');
const paymentRoutes = require('./routes/payments');

// Import models for initialization
const User = require('./models/User');
const Settings = require('./models/Settings');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));

// Parse JSON (except for Stripe webhook)
app.use((req, res, next) => {
  if (req.originalUrl === '/api/payments/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'Continental Academy API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', publicRoutes);
app.use('/api/payments', paymentRoutes);

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'public')));

// React Router - all non-API routes go to index.html
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ detail: 'Not found' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize default data
const initializeDefaults = async () => {
  try {
    // Create default settings if not exists
    const existingSettings = await Settings.findOne({ type: 'site' });
    if (!existingSettings) {
      const settings = new Settings({ type: 'site' });
      await settings.save();
      console.log('✓ Default settings created');
    }
    
    // Create admin user if no users exist
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const adminUser = new User({
        name: 'Admin',
        email: 'admin@test.com',
        password: 'admin123',
        role: 'admin'
      });
      await adminUser.save();
      console.log('✓ Default admin user created (admin@test.com / admin123)');
      
      // Also create a student user
      const studentUser = new User({
        name: 'Student',
        email: 'student@test.com',
        password: 'student123',
        role: 'user'
      });
      await studentUser.save();
      console.log('✓ Default student user created (student@test.com / student123)');
    }
  } catch (error) {
    console.error('Error initializing defaults:', error);
  }
};

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL;
    const dbName = process.env.DB_NAME || 'continental_academy';
    
    if (!mongoUrl) {
      console.error('MONGO_URL not set in environment variables');
      process.exit(1);
    }
    
    console.log('Connecting to MongoDB...');
    
    // Connect with database name
    await mongoose.connect(mongoUrl, {
      dbName: dbName,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log(`✓ Connected to MongoDB (database: ${dbName})`);
    
    // Initialize default data
    await initializeDefaults();
    
    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✓ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

// Start the server
startServer();
