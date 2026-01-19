const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  image_url: { type: String, required: true },
  caption: { type: String },
  order: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now }
});

resultSchema.methods.toJSON = function() {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Result', resultSchema);
