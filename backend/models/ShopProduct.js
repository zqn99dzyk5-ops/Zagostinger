const mongoose = require('mongoose');

const shopProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, default: 'tiktok' }, // tiktok, youtube, facebook, etc
  price: { type: Number, required: true },
  currency: { type: String, default: 'EUR' },
  image_url: { type: String },
  followers: { type: Number },
  specs: { type: mongoose.Schema.Types.Mixed },
  is_available: { type: Boolean, default: true },
  stripe_price_id: { type: String },
  created_at: { type: Date, default: Date.now }
});

shopProductSchema.methods.toJSON = function() {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('ShopProduct', shopProductSchema);
