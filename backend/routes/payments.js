const express = require('express');
const Stripe = require('stripe');
const { Resend } = require('resend'); // Dodato za email
const User = require('../models/User');
const Program = require('../models/Program');
const ShopProduct = require('../models/ShopProduct');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Initialize Stripe & Resend
const getStripe = () => {
  if (!process.env.STRIPE_API_KEY) throw new Error('Stripe API key not configured');
  return new Stripe(process.env.STRIPE_API_KEY);
};

const resend = new Resend(process.env.RESEND_API_KEY);

// --- POMOĆNA FUNKCIJA ZA SLANJE EMAILA ---
const sendThankYouEmail = async (email, itemName, type) => {
  try {
    await resend.emails.send({
      from: 'Continental Academy <office@tvojadomena.com>', // Zamijeni sa svojom domenom
      to: email,
      subject: `Uspješna kupovina: ${itemName} ✅`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; background: #0a0a0a; color: #ffffff; padding: 40px; border-radius: 20px; border: 1px solid #333;">
          <h1 style="color: #FFD700; text-align: center;">Continental Academy</h1>
          <h2 style="text-align: center;">Hvala na kupovini!</h2>
          <p>Zdravo,</p>
          <p>Tvoja uplata za <strong>${itemName}</strong> je uspješno obrađena.</p>
          <p>${type === 'subscription' 
            ? 'Pristup tvom novom kursu/programu je sada aktiviran na dashboardu.' 
            : 'Tvoj digitalni proizvod je spreman za preuzimanje/korištenje.'}</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard" 
               style="background: #FFD700; color: #000; padding: 15px 25px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">
               PRISTUPI DASHBOARDU
            </a>
          </div>
          <p style="font-size: 12px; color: #666; margin-top: 40px; text-align: center;">
            Ako imaš bilo kakvih pitanja, slobodno nam odgovori na ovaj email.
          </p>
        </div>
      `
    });
    console.log(`Email poslat na: ${email}`);
  } catch (error) {
    console.error('Greška pri slanju emaila:', error);
  }
};

// --- ROUTES ---

// Create subscription checkout
router.post('/checkout/subscription', auth, async (req, res) => {
  try {
    const { program_id, origin_url } = req.query;
    if (!program_id) return res.status(400).json({ detail: 'Program ID is required' });
    
    const program = await Program.findById(program_id);
    if (!program) return res.status(404).json({ detail: 'Program not found' });
    
    const stripe = getStripe();
    const baseUrl = origin_url || process.env.CLIENT_URL || 'http://localhost:3000';
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: req.user.email, // Automatski puni email kupca
      line_items: [{
        price_data: {
          currency: (program.currency || 'eur').toLowerCase(),
          product_data: {
            name: program.name || 'Subscription',
            description: program.description || 'Monthly subscription'
          },
          unit_amount: Math.round((program.price || 0) * 100),
          recurring: { interval: 'month' }
        },
        quantity: 1
      }],
      metadata: {
        user_id: req.user._id.toString(),
        item_id: program_id,
        type: 'subscription',
        item_name: program.name
      },
      success_url: `${baseUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/#programs`
    });
    
    res.json({ checkout_url: session.url, session_id: session.id });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
});

// Create product checkout
router.post('/checkout/product', auth, async (req, res) => {
  try {
    const { product_id, origin_url } = req.query;
    if (!product_id) return res.status(400).json({ detail: 'Product ID is required' });
    
    const product = await ShopProduct.findById(product_id);
    if (!product) return res.status(404).json({ detail: 'Product not found' });
    
    const stripe = getStripe();
    const baseUrl = origin_url || process.env.CLIENT_URL || 'http://localhost:3000';
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: req.user.email,
      line_items: [{
        price_data: {
          currency: (product.currency || 'eur').toLowerCase(),
          product_data: {
            name: product.title || 'Product',
            description: product.description || 'One-time purchase'
          },
          unit_amount: Math.round((product.price || 0) * 100)
        },
        quantity: 1
      }],
      metadata: {
        user_id: req.user._id.toString(),
        item_id: product_id,
        type: 'product',
        item_name: product.title
      },
      success_url: `${baseUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/shop`
    });
    
    res.json({ checkout_url: session.url, session_id: session.id });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
});

// Stripe webhook (Full integracija sa bazom i mailom)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const stripe = getStripe();
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { user_id, item_id, type, item_name } = session.metadata;
    const customerEmail = session.customer_details.email;

    // 1. Ažuriraj bazu (Kursevi)
    if (type === 'subscription') {
      await User.findByIdAndUpdate(user_id, { $addToSet: { subscriptions: item_id } });
    }
    
    // 2. Ažuriraj bazu (Shop - ako je unikatni nalog, označi kao prodato)
    if (type === 'product') {
      await ShopProduct.findByIdAndUpdate(item_id, { is_available: false });
    }

    // 3. POŠALJI EMAIL ZAHVALNICE
    await sendThankYouEmail(customerEmail, item_name, type);
  }
  
  res.json({ received: true });
});

module.exports = router;
