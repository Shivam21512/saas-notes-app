const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  content: { type: String, required: true, maxlength: 10000 },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  tags: [{ type: String, trim: true }],
  isArchived: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

noteSchema.index({ tenantId: 1, createdAt: -1 });
noteSchema.index({ tenantId: 1, authorId: 1 });
noteSchema.index({ tenantId: 1, isArchived: 1 });

noteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

noteSchema.statics.checkNoteLimit = async function(tenantId) {
  const Tenant = require('./Tenant');
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) throw new Error('Tenant not found');
  if (tenant.subscription === 'pro') return { canCreate: true, limit: -1, current: 0 };

  const noteCount = await this.countDocuments({ tenantId, isArchived: false });
  return {
    canCreate: noteCount < tenant.maxNotes,
    limit: tenant.maxNotes,
    current: noteCount
  };
};

module.exports = mongoose.model('Note', noteSchema);
