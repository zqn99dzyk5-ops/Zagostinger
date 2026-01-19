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

// Get all programs (public)
router.get('/programs', async (req, res) => {
  try {
    const programs = await Program.find({ is_active: true }).sort({ created_at: -1 });
    res.json(programs.map(p => p.toJSON()));
  } catch (error) {
    console.error('Get programs error:', error);
    res.status(500).json({ detail: 'Server error' });
  }
});

// Get all courses (public)
router.get('/courses', async (req, res) => {
  try {
    const { program_id } = req.query;
    const filter = { is_active: true };
    if (program_id) filter.program_id = program_id;
    
    const courses = await Course.find(filter).sort({ order: 1 });
    
    // Add lesson counts
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

// Get single course with lessons (protected)
router.get('/courses/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ detail: 'Course not found' });
    }
    
    // Check if user has access
    const user = req.user;
    const hasCourseAccess = user.courses?.includes(req.params.id);
    const hasProgramAccess = user.subscriptions?.includes(course.program_id);
    const isAdmin = user.role === 'admin';
    
    if (!hasCourseAccess && !hasProgramAccess && !isAdmin) {
      return res.status(403).json({ detail: 'Access denied' });
    }
    
    // Get lessons
    const lessons = await Lesson.find({ course_id: req.params.id }).sort({ order: 1 });
    
    const courseJson = course.toJSON();
    courseJson.lessons = lessons.map(l => l.toJSON());
    courseJson.lesson_count = lessons.length;
    
    res.json(courseJson);
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ detail: 'Server error' });
  }
});

// Get lessons for a course
router.get('/lessons/:courseId', async (req, res) => {
  try {
    const lessons = await Lesson.find({ course_id: req.params.courseId }).sort({ order: 1 });
    res.json(lessons.map(l => l.toJSON()));
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({ detail: 'Server error' });
  }
});

// Get single lesson
router.get('/lesson/:id', auth, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    
    if (!lesson) {
      return res.status(404).json({ detail: 'Lesson not found' });
    }
    
    // Check access through course
    const course = await Course.findById(lesson.course_id);
    if (!course) {
      return res.status(404).json({ detail: 'Course not found' });
    }
    
    const user = req.user;
    const hasCourseAccess = user.courses?.includes(course._id.toString());
    const hasProgramAccess = user.subscriptions?.includes(course.program_id);
    const isAdmin = user.role === 'admin';
    const isFree = lesson.is_free;
    
    if (!hasCourseAccess && !hasProgramAccess && !isAdmin && !isFree) {
      return res.status(403).json({ detail: 'Access denied' });
    }
    
    res.json(lesson.toJSON());
  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({ detail: 'Server error' });
  }
});

// Get shop products (public)
router.get('/shop/products', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category) filter.category = category;
    
    const products = await ShopProduct.find(filter).sort({ created_at: -1 });
    res.json(products.map(p => p.toJSON()));
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ detail: 'Server error' });
  }
});

// Get single product (public)
router.get('/shop/products/:id', async (req, res) => {
  try {
    const product = await ShopProduct.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ detail: 'Product not found' });
    }
    
    res.json(product.toJSON());
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ detail: 'Server error' });
  }
});

// Get FAQs (public)
router.get('/faqs', async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ order: 1 });
    res.json(faqs.map(f => f.toJSON()));
  } catch (error) {
    console.error('Get FAQs error:', error);
    res.status(500).json({ detail: 'Server error' });
  }
});

// Get results (public)
router.get('/results', async (req, res) => {
  try {
    const results = await Result.find().sort({ order: 1 });
    res.json(results.map(r => r.toJSON()));
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ detail: 'Server error' });
  }
});

// Get settings (public)
router.get('/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne({ type: 'site' });
    
    if (!settings) {
      // Create default settings
      settings = new Settings({ type: 'site' });
      await settings.save();
    }
    
    res.json(settings.toJSON());
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ detail: 'Server error' });
  }
});

// Track analytics event
router.post('/analytics/event', async (req, res) => {
  try {
    const event = new AnalyticsEvent(req.body);
    await event.save();
    res.status(201).json({ message: 'Event tracked' });
  } catch (error) {
    console.error('Track event error:', error);
    res.status(500).json({ detail: 'Server error' });
  }
});

module.exports = router;
