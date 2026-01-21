const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  currency: { type: String, default: 'EUR' },
  thumbnail_url: { type: String, default: '' }, // DODANO: Polje za sliku programa
  features: [{ type: String }],
  is_active: { type: Boolean, default: true },
  stripe_price_id: { type: String },
  created_at: { type: Date, default: Date.now }
});

programSchema.methods.toJSON = function() {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Program', programSchema);
