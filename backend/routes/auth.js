const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // 1. Provjera ulaznih podataka
    if (!name || !email || !password) {
      return res.status(400).json({ detail: 'Sva polja su obavezna (name, email, password)' });
    }
    
    // 2. Provjera da li korisnik već postoji
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ detail: 'Email je već registrovan' });
    }
    
    // 3. Kreiranje korisnika
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password
    });
    
    await user.save();
    console.log(`✓ Novi korisnik registrovan: ${user.email}`);
    
    // 4. Provjera JWT tajne (da server ne pukne)
    const secret = process.env.JWT_SECRET || 'privremena_tajna_123';
    
    // 5. Generisanje tokena
    const token = jwt.sign(
      { user_id: user._id.toString() },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    res.status(201).json({
      access_token: token,
      token_type: 'bearer',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Register error detalji:', error);
    res.status(500).json({ detail: 'Greška na serveru prilikom registracije' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ detail: 'Email i lozinka su obavezni' });
    }
    
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ detail: 'Pogrešni kredencijali' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ detail: 'Pogrešni kredencijali' });
    }
    
    const secret = process.env.JWT_SECRET || 'privremena_tajna_123';
    const token = jwt.sign(
      { user_id: user._id.toString() },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    res.json({
      access_token: token,
      token_type: 'bearer',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ detail: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    res.json(req.user.toJSON());
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ detail: 'Server error' });
  }
});

module.exports = router;
