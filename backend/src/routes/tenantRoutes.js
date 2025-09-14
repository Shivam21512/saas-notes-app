const express = require('express');
const { authenticate, requireAdmin, validateTenantAccess } = require('../middleware/auth');
const { getTenantInfo, upgradeTenant } = require('../controllers/tenantController');

const router = express.Router();

router.use(authenticate);

router.get('/:slug', validateTenantAccess, getTenantInfo);
router.post('/:slug/upgrade', requireAdmin, validateTenantAccess, upgradeTenant);

module.exports = router;
