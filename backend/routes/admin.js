const express = require('express');
const User = require('../models/User');
const Program = require('../models/Program');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const ShopProduct = require('../models/ShopProduct');
const FAQ = require('../models/FAQ');
const Result = require('../models/Result');
const Settings = require('../models/Settings');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// ============= USERS =============

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().sort({ created_at: -1 });
    res.json(users.map(u => u.toJSON()));
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ detail: 'Server error' });
  }
});

// Update user role
router.put('/users/:userId/role', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.query;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ detail: 'Invalid role' });
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ detail: 'User not found' });
    }
    
    res.json(user.toJSON());
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ detail: 'Server error' });
  }
});

// Get user courses
router.get('/users/:userId/courses', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ detail: 'User not found' });
    }
    
    res.json(user.courses || []);
  } catch (error) {
    console.error('Get user courses error:', error);
    res.status(500).json({ detail: 'Server error' });
  }
});

// Update user courses
router.put('/users/:userId/courses', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const courseIds = req.body;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { courses: courseIds },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ detail: 'User not found' });
    }
    
    res.json(user.courses);
  } catch (error) {
    console.error('Update user courses error:', error);
    res.status(500).json({ detail: 'Server error' });
  }
});

// Add course to user
router.post('/users/:userId/courses/add', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { course_id } = req.query;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ detail: 'User not found' });
    }
    
    if (!user.courses.includes(course_id)) {
      user.courses.push(course_id);
      await user.save();
    }
    
    res.json({ message: 'Course added', courses: user.courses });
  } catch (error) {
    console.error('Add course error:', error);
    res.status(500).json({ detail: 'Server error' });
  }
});

// Remove course from user
router.post('/users/:userId/courses/remove', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { course_id } = req.query;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ detail: 'User not found' });
    }
    
    user.courses = user.courses.filter(c => c !== course_id);
    await user.save();
    
    res.json({ message: 'Course removed', courses: user.courses });
  } catch (error) {
    console.error('Remove course error:', error);
    res.status(500).json({ detail: 'Server error' });
  }
});

// Update user subscriptions
router.put('/users/:userId/subscriptions', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const programIds = req.body;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { subscriptions: programIds },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ detail: 'User not found' });
    }
    
    res.json(user.subscriptions);
  } catch (error) {
    console.error('Update subscriptions error:', error);
    res.status(500).json({ detail: 'Server error' });
  }
});

// ============= PROGRAMS =============

// Get all programs (admin)
router.get('/programs', adminAuth, async (req, res) => {
  try {
    const programs = await Program.find().sort({ created_at: -1 });
    res.json(programs.map(p => p.toJSON()));
  } catch (error) {
    console.error('Get programs error:', error);
    res.status(500).json({ detail: 'Server error' });
  }
});

// Create program
router.post('/programs', adminAuth, async (req, res) => {
  try {
    const program = new Program(req.body);
    await program.save();
    res.status(201).json(program.toJSON());
  } catch (error) {
    console.error('Create program error:', error);
    res.status(500).json({ detail: 'Server error' });
  }
});

// Update program
router.put('/programs/:id', adminAuth, async (req, res) => {
  try {
    const program = await Program.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!program) {
      return res.status(404).json({ detail: 'Program not found' });
    }
    
    res.json(program.toJSON());
  } catch (error) {
    console.error('Update program error:', error);
    res.status(500).json({ detail: 'Server error' });
  }
});

// Delete program
router.delete('/programs/:id', adminAuth, async (req, res) => {
  try {
    const program = await Program.findByIdAndDelete(req.params.id);
    
    if (!program) {
      return res.status(404).json({ detail: 'Program not found' });
    }
    
    res.json({ message: 'Program deleted' });
  } catch (error) {
    console.error('Delete program error:', error);
    res.status(500).json({ detail: 'Server error' });
  }
});

// ============= COURSES =============

// Get all courses (admin)
router.get('/courses', adminAuth, async (req, res) => {
  try {
    const courses = await Course.find().sort({ order: 1, created_at: -1 });
    
    // Get lesson counts and program names
    const programs = await Program.find();
    const programMap = {};
    programs.forEach(p => { programMap[p._id.toString()] = p.name; });
    
    const coursesWithInfo = await Promise.all(courses.map(async (course) => {
      const lessonCount = await Lesson.countDocuments({ course_id: course._id.toString() });
      const courseJson = course.toJSON();
      courseJson.lesson_count = lessonCount;
      courseJson.program_name = programMap[course.program_id] || 'No program';
      return courseJson;
    }));
    
    res.json(coursesWithInfo);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ detail: 'Server error' });
  }
});

// Create course
router.post('/courses', adminAuth, async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.status(201).json(course.toJSON());
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ detail: 'Server error' });
  }
});

// Update course
router.put('/courses/:id', adminAuth, async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!course) {
      return res.status(404).json({ detail: 'Course not found' });
    }
    
    res.json(course.toJSON());
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ detail: 'Server error' });
  }
});

// Delete course
router.delete('/courses/:id', adminAuth, async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    
    if (!course) {
      return res.status(404).json({ detail: 'Course not found' });
    }
    
    // Also delete all lessons in this course
    await Lesson.deleteMany({ course_id: req.params.id });
    
    res.json({ message: 'Course deleted' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ detail: 'Server error' });
  }
});

// ============= LESSONS =============

// Create lesson
router.post('/lessons', adminAuth, async (req, res) => {
  try {
    const lesson = new Lesson(req.body);
    await lesson.save();
    res.status(201).json(lesson.toJSON());
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({ detail: 'Server error' });
  }
});

// Update lesson
router.put('/lessons/:id', adminAuth, async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!lesson) {
      return res.status(404).json({ detail: 'Lesson not found' });
    }
    
    res.json(lesson.toJSON());
  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({ detail: 'Server error' });
  }
});

// Delete lesson
router.delete('/lessons/:id', adminAuth, async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.id);
    
    if (!lesson) {
      return res.status(404).json({ detail: 'Lesson not found' });
    }
    
    res.json({ message: 'Lesson deleted' });
  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({ detail: 'Server error' });
  }
});

// Reorder lessons
router.put('/lessons/reorder', adminAuth, async (req, res) => {
  try {
    const lessonOrders = req.body; // Array of { id, order }
    
    for (const item of lessonOrders) {
      await Lesson.findByIdAndUpdate(item.id, { order: item.order });
    }
    
    res.json({ message: 'Lessons reordered' });
  } catch (error) {
    console.error('Reorder lessons error:', error);
    res.status(500).json({ detail: 'Server error' });
  }
});

// ============= SHOP =============

// Get all products (admin)
router.get('/shop/products', adminAuth, async (req, res) => {
  try {
    const products = await ShopProduct.find().sort({ created_at: -1 });
    res.json(products.map(p => p.toJSON()));
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ detail: 'Server error' });
  }
});

// Create product
router.post('/shop/products', adminAuth, async (req, res) => {
  try {
    const product = new ShopProduct(req.body);
    await product.save();
    res.status(201).json(product.toJSON());
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ detail: 'Server error' });
  }
});

// Update product
router.put('/shop/products/:id', adminAuth, async (req, res) => {
  try {
    const product = await ShopProduct.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ detail: 'Product not found' });
    }
    
    res.json(product.toJSON());
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ detail: 'Server error' });
  }
});

// Delete product
router.delete('/shop/products/:id', adminAuth, async (req, res) => {
  try {
    const product = await ShopProduct.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ detail: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ detail: 'Server error' });
  }
});

// ============= FAQs =============

// Create FAQ
router.post('/faqs', adminAuth, async (req, res) => {
  try {
    const faq = new FAQ(req.body);
    await faq.save();
    res.status(201).json(faq.toJSON());
  } catch (error) {
    console.error('Create FAQ error:', error);
    res.status(500).json({ detail: 'Server error' });
  }
});

// Update FAQ
router.put('/faqs/:id', adminAuth, async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!faq) {
      return res.status(404).json({ detail: 'FAQ not found' });
    }
    
    res.json(faq.toJSON());
  } catch (error) {
    console.error('Update FAQ error:', error);
    res.status(500).json({ detail: 'Server error' });
  }
});

// Delete FAQ
router.delete('/faqs/:id', adminAuth, async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    
    if (!faq) {
      return res.status(404).json({ detail: 'FAQ not found' });
    }
    
    res.json({ message: 'FAQ deleted' });
  } catch (error) {
    console.error('Delete FAQ error:', error);
    res.status(500).json({ detail: 'Server error' });
  }
});

// ============= RESULTS =============

// Create result
router.post('/results', adminAuth, async (req, res) => {
  try {
    const result = new Result(req.body);
    await result.save();
    res.status(201).json(result.toJSON());
  } catch (error) {
    console.error('Create result error:', error);
    res.status(500).json({ detail: 'Server error' });
  }
});

// Delete result
router.delete('/results/:id', adminAuth, async (req, res) => {
  try {
    const result = await Result.findByIdAndDelete(req.params.id);
    
    if (!result) {
      return res.status(404).json({ detail: 'Result not found' });
    }
    
    res.json({ message: 'Result deleted' });
  } catch (error) {
    console.error('Delete result error:', error);
    res.status(500).json({ detail: 'Server error' });
  }
});

// ============= SETTINGS =============

// Update settings
router.put('/settings', adminAuth, async (req, res) => {
  try {
    let settings = await Settings.findOne({ type: 'site' });
    
    if (!settings) {
      settings = new Settings({ type: 'site', ...req.body });
    } else {
      Object.assign(settings, req.body);
    }
    
    await settings.save();
    res.json(settings.toJSON());
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ detail: 'Server error' });
  }
});

// ============= ANALYTICS =============

// Get analytics stats
router.get('/analytics', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSubscriptions = await User.countDocuments({ 'subscriptions.0': { $exists: true } });
    const recentEvents = await AnalyticsEvent.find()
      .sort({ timestamp: -1 })
      .limit(20);
    
    res.json({
      total_users: totalUsers,
      total_subscriptions: totalSubscriptions,
      recent_events: recentEvents.map(e => e.toJSON())
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ detail: 'Server error' });
  }
});

// ============= SEED DATA =============

router.post('/seed', adminAuth, async (req, res) => {
  try {
    // Create default settings if not exists
    let settings = await Settings.findOne({ type: 'site' });
    if (!settings) {
      settings = new Settings({ type: 'site' });
      await settings.save();
    }
    
    res.json({ message: 'Seed complete' });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ detail: 'Server error' });
  }
});

module.exports = router;
