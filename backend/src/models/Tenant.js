const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  subscription: { type: String, enum: ['free', 'pro'], default: 'free' },
  maxNotes: { type: Number, default: 3 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

tenantSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (this.subscription === 'pro') this.maxNotes = -1;
  else this.maxNotes = 3;
  next();
});

module.exports = mongoose.model('Tenant', tenantSchema);
