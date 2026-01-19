const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  program_id: { type: String },
  thumbnail_url: { type: String },
  duration_hours: { type: Number },
  order: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now }
});

// Virtual for lesson count (will be calculated when needed)
courseSchema.virtual('lesson_count').get(function() {
  return this._lesson_count || 0;
});

courseSchema.methods.toJSON = function() {
  const obj = this.toObject({ virtuals: true });
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Course', courseSchema);
