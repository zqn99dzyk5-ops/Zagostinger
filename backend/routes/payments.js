const express = require('express');
const Stripe = require('stripe');
const User = require('../models/User');
const Program = require('../models/Program');
const ShopProduct = require('../models/ShopProduct');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Initialize Stripe
const getStripe = () => {
  if (!process.env.STRIPE_API_KEY) {
    throw new Error('Stripe API key not configured');
  }
  return new Stripe(process.env.STRIPE_API_KEY);
};

// Create subscription checkout
router.post('/checkout/subscription', auth, async (req, res) => {
  try {
    const { program_id, origin_url } = req.query;
    
    const program = await Program.findById(program_id);
    if (!program) {
      return res.status(404).json({ detail: 'Program not found' });
    }
    
    const stripe = getStripe();
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: (program.currency || 'eur').toLowerCase(),
            product_data: {
              name: program.name,
              description: program.description
            },
            unit_amount: Math.round(program.price * 100),
            recurring: {
              interval: 'month'
            }
          },
          quantity: 1
        }
      ],
      metadata: {
        user_id: req.user._id.toString(),
        program_id: program_id,
        type: 'subscription'
      },
      success_url: `${origin_url}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin_url}/#programs`
    });
    
    res.json({ checkout_url: session.url, session_id: session.id });
  } catch (error) {
    console.error('Subscription checkout error:', error);
    res.status(500).json({ detail: error.message || 'Payment error' });
  }
});

// Create product checkout
router.post('/checkout/product', auth, async (req, res) => {
  try {
    const { product_id, origin_url } = req.query;
    
    const product = await ShopProduct.findById(product_id);
    if (!product) {
      return res.status(404).json({ detail: 'Product not found' });
    }
    
    const stripe = getStripe();
    
    // Create checkout session
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
    res.status(500).json({ detail: error.message || 'Payment error' });
  }
});

// Get payment status
router.get('/status/:sessionId', auth, async (req, res) => {
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    
    // If payment successful, update user
    if (session.payment_status === 'paid') {
      const { user_id, program_id, product_id, type } = session.metadata;
      
      if (type === 'subscription' && program_id) {
        await User.findByIdAndUpdate(
          user_id,
          { $addToSet: { subscriptions: program_id } }
        );
      }
      
      if (type === 'product' && product_id) {
        await ShopProduct.findByIdAndUpdate(
          product_id,
          { is_available: false }
        );
      }
    }
    
    res.json({
      payment_status: session.payment_status,
      customer_email: session.customer_details?.email
    });
  } catch (error) {
    console.error('Payment status error:', error);
    res.status(500).json({ detail: error.message || 'Status check error' });
  }
});

// Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const stripe = getStripe();
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    let event;
    
    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } else {
      event = JSON.parse(req.body);
    }
    
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        const { user_id, program_id, product_id, type } = session.metadata;
        
        if (type === 'subscription' && program_id) {
          await User.findByIdAndUpdate(
            user_id,
            { $addToSet: { subscriptions: program_id } }
          );
        }
        
        if (type === 'product' && product_id) {
          await ShopProduct.findByIdAndUpdate(
            product_id,
            { is_available: false }
          );
        }
        break;
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ detail: error.message });
  }
});

module.exports = router;