import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';

// Generate Token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'fbe7ef8429df34ab9c34d284ab91d09e8432a101f3bb91dbf81dbce6e44b9a91',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate Token
    const token = generateToken(user._id);

    // Get specific profile details based on role
    let profile = null;
    if (user.role === 'student') {
      profile = await Student.findOne({ user: user._id }).populate('class');
    } else if (user.role === 'teacher') {
      profile = await Teacher.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      },
      profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let profile = null;

    if (user.role === 'student') {
      profile = await Student.findOne({ user: user._id }).populate('class');
    } else if (user.role === 'teacher') {
      profile = await Teacher.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      user,
      profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile password/avatar
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    if (req.body.name) user.name = req.body.name;
    if (req.body.avatar) user.avatar = req.body.avatar;

    // Check if updating password
    if (req.body.password && req.body.newPassword) {
      const isMatch = await user.matchPassword(req.body.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          error: 'Current password does not match'
        });
      }
      user.password = req.body.newPassword;
    }

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};
