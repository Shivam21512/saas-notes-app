const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'Access token is required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).populate('tenantId');
    if (!user || !user.isActive) return res.status(401).json({ success: false, message: 'Invalid token or user not found' });

    req.user = user;
    req.tenant = user.tenantId;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ success: false, message: 'Admin access required' });
  next();
};

const requireMember = (req, res, next) => {
  if (!['admin', 'member'].includes(req.user.role))
    return res.status(403).json({ success: false, message: 'Member access required' });
  next();
};

const validateTenantAccess = (req, res, next) => {
  const tenantSlug = req.params.slug;
  if (tenantSlug && req.tenant.slug !== tenantSlug)
    return res.status(403).json({ success: false, message: 'Access denied to this tenant' });
  next();
};

module.exports = { authenticate, requireAdmin, requireMember, validateTenantAccess };
