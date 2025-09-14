const Tenant = require('../models/Tenant');
const Note = require('../models/Note');

const getTenantInfo = async (req, res) => {
  try {
    const tenant = req.tenant;
    const noteCount = await Note.countDocuments({ tenantId: tenant._id, isArchived: false });

    res.json({
      success: true,
      data: {
        tenant: {
          id: tenant._id,
          slug: tenant.slug,
          name: tenant.name,
          subscription: tenant.subscription,
          maxNotes: tenant.maxNotes,
          currentNotes: noteCount,
          canCreateNotes: tenant.subscription === 'pro' || noteCount < tenant.maxNotes
        }
      }
    });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const upgradeTenant = async (req, res) => {
  try {
    if (req.tenant.slug !== req.params.slug)
      return res.status(403).json({ success: false, message: 'Access denied' });

    if (req.tenant.subscription === 'pro')
      return res.status(400).json({ success: false, message: 'Tenant already on Pro plan' });

    const updatedTenant = await Tenant.findByIdAndUpdate(req.tenant._id,
      { subscription: 'pro', maxNotes: -1, updatedAt: Date.now() }, { new: true });

    res.json({ success: true, message: 'Tenant upgraded to Pro plan', data: { tenant: updatedTenant } });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getTenantInfo, upgradeTenant };
