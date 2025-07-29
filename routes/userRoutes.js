const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/User');
const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');

router.post('/signup', async (req, res) => {
  try {
    const { name, gender, birthday, phonenumber, username, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = new User({
      name,
      gender,
      birthday,
      phonenumber,
      username,
      password: hashedPassword, 
    });

    await user.save();
    res.json({ success: true });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. Find the user
    const user = await User.findOne({ username });

    // 2. If user not found
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    // 3. Check if user is banned BEFORE checking password
    if (user.isBanned) {
      return res.status(403).json({ error: 'Access denied. Your account has been banned by admin.' });
    }

    // 4. Check password match
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    // 5. Login success
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        username: user.username,
        role: user.role || 'user',
      },
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

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
