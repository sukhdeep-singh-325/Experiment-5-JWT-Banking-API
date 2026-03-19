const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { jwtSecret, jwtExpire, refreshExpireDays } = require('../config/keys');

const router = express.Router();

// Generate Access Token
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    jwtSecret,
    { expiresIn: jwtExpire }
  );
};

// Generate Refresh Token
const generateRefreshToken = async (user) => {
  const token = crypto.randomBytes(40).toString('hex');
  const expires = new Date(Date.now() + refreshExpireDays * 24 * 60 * 60 * 1000);
  const refreshToken = await RefreshToken.create({ user: user._id, token, expires });
  return refreshToken.token;
};

// @route POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password, role });
    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    if (user.accountStatus === 'blocked') {
      return res.status(403).json({ message: 'Account is blocked. Contact support.' });
    }
    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);
    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken: requestToken } = req.body;
    if (!requestToken) return res.status(400).json({ message: 'Refresh token required' });
    const stored = await RefreshToken.findOne({ token: requestToken }).populate('user');
    if (!stored) return res.status(403).json({ message: 'Refresh token not found' });
    if (!stored.isActive) {
      return res.status(403).json({ message: 'Refresh token expired or revoked. Please login again.' });
    }
    const newAccessToken = generateAccessToken(stored.user);
    const newRefreshToken = await generateRefreshToken(stored.user);
    stored.revoked = new Date();
    stored.replacedByToken = newRefreshToken;
    await stored.save();
    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route POST /api/auth/logout
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: 'Refresh token required' });
    const stored = await RefreshToken.findOne({ token: refreshToken });
    if (!stored) return res.status(200).json({ message: 'Already logged out' });
    stored.revoked = new Date();
    await stored.save();
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
