const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_API_KEY);
const User = require('../models/User'); // Putanja do tvog User modela

// 1. KREIRANJE SESIJE ZA SHOP (JEDNOKRATNO)
router.post('/checkout/product', async (req, res) => {
  try {
    const { product_id } = req.query;
    
    // Ovde možeš dodati logiku da iz baze izvučeš pravu cenu proizvoda
    // Za sada je hardkodovano 25€ (2500 centi)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { 
            name: 'Digital Asset - Continental',
            metadata: { product_id } 
          },
          unit_amount: 2500, 
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/dashboard?success=true`,
      cancel_url: `${process.env.CLIENT_URL}/shop`,
    });

    res.json({ checkout_url: session.url });
  } catch (error) {
    console.error('Stripe Error:', error);
    res.status(500).json({ error: 'Greška pri kreiranju sesije' });
  }
});

// 2. KREIRANJE SESIJE ZA AKADEMIJU (PROGRAMI)
router.post('/checkout/subscription', async (req, res) => {
  try {
    const { program_id } = req.query;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { 
            name: 'Academy Membership',
            metadata: { program_id }
          },
          unit_amount: 4900, 
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/dashboard?success=true`,
      cancel_url: `${process.env.CLIENT_URL}/#programs`,
    });

    res.json({ checkout_url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. WEBHOOK (Mozak operacije)
// Ovu rutu Stripe zove automatski kada uplata prođe
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Ako je plaćanje uspelo
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // OVDE IDE LOGIKA ZA OTKLJUČAVANJE:
    // 1. Pronađi korisnika preko emaila iz Stripe sesije
    // 2. Dodaj mu kupljeni proizvod ili program u profil u bazi
    console.log('💰 Uplata primljena za:', session.customer_details.email);
    
    // Primer update-a baze:
    // await User.findOneAndUpdate({ email: session.customer_details.email }, { isPremium: true });
  }

  res.json({ received: true });
});

module.exports = router;
