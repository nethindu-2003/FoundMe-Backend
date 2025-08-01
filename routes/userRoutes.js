const express = require('express');
const router = express.Router();
const User = require('../models/User');
const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const authController = require('../controllers/authController');

router.post('/signup', authController.signup);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user status (active/banned)
router.put('/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle ban/unban user
router.patch('/:id/toggle-ban', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isBanned = !user.isBanned;
    await user.save();

    res.status(200).json({ message: `User ${user.isBanned ? 'banned' : 'unbanned'} successfully` });
  } catch (err) {
    console.error('Error toggling ban:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id/details', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    const lostItems = await LostItem.find({ owner: user._id });
    const foundItems = await FoundItem.find({ owner: user._id });

    res.json({ user, lostItems, foundItems });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

module.exports = router;
