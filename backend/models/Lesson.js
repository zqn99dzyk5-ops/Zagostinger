const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  course_id: { type: String, required: true },
  video_url: { type: String },
  mux_playback_id: { type: String },
  duration_minutes: { type: Number },
  order: { type: Number, default: 0 },
  is_free: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

lessonSchema.methods.toJSON = function() {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Lesson', lessonSchema);
