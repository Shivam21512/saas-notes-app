const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validateRequest, authSchemas } = require('../middleware/validation');
const { login, getProfile, inviteUser } = require('../controllers/authController');

const router = express.Router();

router.post('/login', validateRequest(authSchemas.login), login);
router.get('/profile', authenticate, getProfile);
router.post('/invite', authenticate, requireAdmin, inviteUser);

module.exports = router;
