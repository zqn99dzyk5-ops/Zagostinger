const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  type: { type: String, default: 'site', unique: true },
  site_name: { type: String, default: 'Continental Academy' },
  logo_url: { type: String, default: '' },
  favicon_url: { type: String, default: '' },
  hero_headline: { type: String, default: 'Pokreni svoj Online Biznis' },
  hero_subheadline: { type: String, default: 'Nauči kako da zarađuješ na društvenim mrežama od profesionalaca koji su to već uradili.' },
  hero_video_url: { type: String, default: '' },
  discord_invite_url: { type: String, default: '' },
  theme: { type: String, default: 'dark-luxury' },
  social_links: {
    instagram: { type: String, default: '' },
    youtube: { type: String, default: '' },
    tiktok: { type: String, default: '' },
    facebook: { type: String, default: '' }
  },
  contact_email: { type: String, default: '' },
  contact_phone: { type: String, default: '' },
  footer_text: { type: String, default: '' },
  show_results_section: { type: Boolean, default: true },
  show_faq_section: { type: Boolean, default: true },
  currency: { type: String, default: 'EUR' }
});

settingsSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj._id;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Settings', settingsSchema);
