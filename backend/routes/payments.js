const express = require('express');
const Stripe = require('stripe');
const User = require('../models/User');
const Program = require('../models/Program');
const ShopProduct = require('../models/ShopProduct');
const { auth } = require('../middleware/auth');

const router = express.Router();

// 1. ISPRAVNA GETSTRIPE FUNKCIJA
const getStripe = () => {
  if (!process.env.STRIPE_API_KEY) {
    throw new Error('Stripe API key not configured');
  }
  return new Stripe(process.env.STRIPE_API_KEY);
};

// --- RUTE ---

// ADMIN – Kreiranje programa
router.post('/programs', auth, async (req, res) => {
  try {
    const { name, description, price, currency } = req.body;

    if (!name || !price) {
      return res.status(400).json({ detail: 'Name and price are required' });
    }

    const stripe = getStripe();

    // Kreiraj Stripe Product
    const stripeProduct = await stripe.products.create({
      name,
      description
    });

    // Kreiraj Stripe Price (mjesečna pretplata)
    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: Math.round(price * 100),
      currency: (currency || 'EUR').toLowerCase(),
      recurring: { interval: 'month' }
    });

    // Sačuvaj u tvoju bazu
    const program = await Program.create({
      name,
      description,
      price,
      currency,
      stripe_product_id: stripeProduct.id,
      stripe_price_id: stripePrice.id
    });

    res.status(201).json(program);
  } catch (err) {
    console.error('Create program error:', err);
    res.status(500).json({ detail: err.message });
  }
});

// Checkout za pretplatu (Subscription)
router.post('/checkout/subscription', auth, async (req, res) => {
  try {
    const { program_id, origin_url } = req.body;

    if (!program_id || !origin_url) {
      return res.status(400).json({ detail: 'Missing data' });
    }

    const program = await Program.findById(program_id);
    if (!program || !program.stripe_price_id) {
      return res.status(404).json({ detail: 'Program or Stripe price not found' });
    }

    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: program.stripe_price_id, quantity: 1 }],
      metadata: {
        user_id: req.user._id.toString(),
        program_id: program_id,
        type: 'subscription'
      },
      success_url: `${origin_url}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin_url}/#programs`
    });

    res.json({ checkout_url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ detail: err.message });
  }
});

// Checkout za običan proizvod (Jednokratno plaćanje)
router.post('/checkout/product', auth, async (req, res) => {
  try {
    const { product_id, origin_url } = req.body; // Promijenjeno iz req.query u req.body
    
    const product = await ShopProduct.findById(product_id);
    if (!product) {
      return res.status(404).json({ detail: 'Product not found' });
    }
    
    const stripe = getStripe();
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: (product.currency || 'eur').toLowerCase(),
            product_data: {
              name: product.title,
              description: product.description
            },
            unit_amount: Math.round(product.price * 100)
          },
          quantity: 1
        }
      ],
      metadata: {
        user_id: req.user._id.toString(),
        product_id: product_id,
        type: 'product'
      },
      success_url: `${origin_url}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin_url}/shop`
    });
    
    res.json({ checkout_url: session.url, session_id: session.id });
  } catch (error) {
    console.error('Product checkout error:', error);
    res.status(500).json({ detail: error.message });
  }
});

// Provjera statusa nakon plaćanja
router.get('/status/:sessionId', auth, async (req, res) => {
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    
    if (session.payment_status === 'paid') {
      const { user_id, program_id, product_id, type } = session.metadata;
      
      if (type === 'subscription' && program_id) {
        await User.findByIdAndUpdate(user_id, { $addToSet: { subscriptions: program_id } });
      }
      
      if (type === 'product' && product_id) {
        await ShopProduct.findByIdAndUpdate(product_id, { is_available: false });
      }
    }
    
    res.json({
      payment_status: session.payment_status,
      customer_email: session.customer_details?.email
    });
  } catch (error) {
    console.error('Status error:', error);
    res.status(500).json({ detail: error.message });
  }
});

// Stripe Webhook (za sigurnu obradu u pozadini)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const stripe = getStripe();
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { user_id, program_id, product_id, type } = session.metadata;
    
    if (type === 'subscription' && program_id) {
      await User.findByIdAndUpdate(user_id, { $addToSet: { subscriptions: program_id } });
    }
    
    if (type === 'product' && product_id) {
      await ShopProduct.findByIdAndUpdate(product_id, { is_available: false });
    }
  }
  
  res.json({ received: true });
});

module.exports = router;
