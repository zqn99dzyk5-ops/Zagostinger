const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema({
  event_type: { type: String, required: true },
  page: { type: String },
  user_id: { type: String },
  data: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now }
});

analyticsEventSchema.methods.toJSON = function() {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);
