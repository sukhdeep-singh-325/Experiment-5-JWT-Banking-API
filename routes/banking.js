const express = require('express');
const Account = require('../models/Account');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route POST /api/banking/accounts - Create bank account
router.post('/accounts', protect, async (req, res) => {
  try {
    const { accountType } = req.body;
    const accountNumber = 'AC' + Date.now() + Math.floor(Math.random() * 1000);
    const account = await Account.create({
      user: req.user._id,
      accountNumber,
      balance: 0,
      accountType: accountType || 'savings'
    });
    res.status(201).json({ message: 'Bank account created successfully', account });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route GET /api/banking/accounts - Get all accounts for logged-in user
router.get('/accounts', protect, async (req, res) => {
  try {
    const accounts = await Account.find({ user: req.user._id });
    res.json({ count: accounts.length, accounts });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route GET /api/banking/accounts/:id - Get single account
router.get('/accounts/:id', protect, async (req, res) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, user: req.user._id });
    if (!account) return res.status(404).json({ message: 'Account not found' });
    res.json({ account });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route POST /api/banking/accounts/:id/deposit - Deposit money
router.post('/accounts/:id/deposit', protect, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Please provide a valid amount' });
    }
    const account = await Account.findOne({ _id: req.params.id, user: req.user._id });
    if (!account) return res.status(404).json({ message: 'Account not found' });
    account.balance += Number(amount);
    await account.save();
    res.json({
      message: `Successfully deposited ${amount} ${account.currency}`,
      balance: account.balance,
      account
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route POST /api/banking/accounts/:id/withdraw - Withdraw money
router.post('/accounts/:id/withdraw', protect, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Please provide a valid amount' });
    }
    const account = await Account.findOne({ _id: req.params.id, user: req.user._id });
    if (!account) return res.status(404).json({ message: 'Account not found' });
    if (account.balance < amount) {
      return res.status(400).json({
        message: 'Insufficient balance',
        availableBalance: account.balance
      });
    }
    account.balance -= Number(amount);
    await account.save();
    res.json({
      message: `Successfully withdrawn ${amount} ${account.currency}`,
      balance: account.balance,
      account
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route GET /api/banking/profile - Get logged-in user profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const accounts = await Account.find({ user: req.user._id });
    res.json({ user, accounts });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route POST /api/banking/admin/block-user/:userId - Admin: block a user
router.post('/admin/block-user/:userId', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.accountStatus = 'blocked';
    await user.save();
    res.json({ message: 'User account blocked', userId: user._id });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route GET /api/banking/admin/users - Admin: get all users
router.get('/admin/users', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ count: users.length, users });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
