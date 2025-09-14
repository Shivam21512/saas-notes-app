const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, isActive: true }).populate('tenantId');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = generateToken(user._id);
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          tenant: {
            id: user.tenantId._id,
            slug: user.tenantId.slug,
            name: user.tenantId.name,
            subscription: user.tenantId.subscription,
          }
        }
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('tenantId');
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          tenant: {
            id: user.tenantId._id,
            slug: user.tenantId.slug,
            name: user.tenantId.name,
            subscription: user.tenantId.subscription,
          }
        }
      }
    });
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const inviteUser = async (req, res) => {
  try {
    const { email, role = 'member', firstName, lastName } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: 'User with this email already exists' });

    const newUser = new User({
      email,
      password: 'password',
      role,
      firstName,
      lastName,
      tenantId: req.tenant._id,
    });
    await newUser.save();
    res.status(201).json({ success: true, message: 'User invited successfully', data: { user: newUser } });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { login, getProfile, inviteUser };
