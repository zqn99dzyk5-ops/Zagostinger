const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_API_KEY);

// Checkout za Shop
router.post('/checkout/product', async (req, res) => {
  try {
    const { product_id } = req.query;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: 'Digital Asset - Continental Academy' },
          unit_amount: 2500, // 25.00€
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/dashboard?success=true`,
      cancel_url: `${process.env.CLIENT_URL}/shop`,
    });
    res.json({ checkout_url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Checkout za Programe (Home)
router.post('/checkout/subscription', async (req, res) => {
  try {
    const { program_id } = req.query;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: 'Academy Membership' },
          unit_amount: 4900, // 49.00€
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

module.exports = router;
