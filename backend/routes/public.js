const express = require('express');
const Program = require('../models/Program');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const ShopProduct = require('../models/ShopProduct');
const FAQ = require('../models/FAQ');
const Result = require('../models/Result');
const Settings = require('../models/Settings');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const { auth } = require('../middleware/auth');

const router = express.Router();

// ============= PUBLIC ENDPOINTS =============

// Get all programs
router.get('/programs', async (req, res) => {
  try {
    const programs = await Program.find().sort({ created_at: -1 });
    res.json(programs);
  } catch (error) {
    console.error('Get programs error:', error);
    res.status(500).json({ detail: 'Server error' });
  }
});

// Get all courses (FIX: Uklonjen restriktivan filter da bi se vidjeli)
router.get('/courses', async (req, res) => {
  try {
    const { program_id } = req.query;
    const filter = {}; // Prikazuje sve dok ne podesiš is_active u bazi
    if (program_id) filter.program_id = program_id;
    
    const courses = await Course.find(filter).sort({ order: 1 });
    
    const coursesWithInfo = await Promise.all(courses.map(async (course) => {
      const lessonCount = await Lesson.countDocuments({ course_id: course._id.toString() });
      const courseJson = course.toJSON();
      courseJson.lesson_count = lessonCount;
      return courseJson;
    }));
    
    res.json(coursesWithInfo);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ detail: 'Server error' });
  }
});

// Track analytics event (FIX za 405 error)
router.post('/analytics/event', async (req, res) => {
  try {
    const event = new AnalyticsEvent(req.body);
    await event.save();
    res.status(201).json({ message: 'Event tracked' });
  } catch (error) {
    // Čak i ako analytics padne, ne želimo da srušimo frontend
    res.status(200).json({ message: 'Log ignored' });
  }
});

// Get shop products
router.get('/shop/products', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category) filter.category = category;
    const products = await ShopProduct.find(filter).sort({ created_at: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ detail: 'Server error' });
  }
});

// Get settings
router.get('/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne({ type: 'site' });
    if (!settings) {
      settings = new Settings({ type: 'site' });
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ detail: 'Server error' });
  }
});

// Ostale rute (FAQs i Results)
router.get('/faqs', async (req, res) => {
  const faqs = await FAQ.find().sort({ order: 1 });
  res.json(faqs);
});

router.get('/results', async (req, res) => {
  const results = await Result.find().sort({ order: 1 });
  res.json(results);
});

module.exports = router;
