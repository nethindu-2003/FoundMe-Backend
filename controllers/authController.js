const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const JWT_SECRET = process.env.JWT_SECRET;

// Register
exports.signup = async (req, res) => {
  try {
    const { name, gender, birthday, phonenumber, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate email verification token
    const verifyToken = crypto.randomBytes(32).toString('hex');

    // Create new user
    const user = new User({
      name,
      gender,
      birthday,
      phonenumber,
      email,
      password: hashedPassword,
      verifyToken,
      verifyTokenExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    await user.save();

    // Send verification email
    const verifyLink = `http://localhost:3001/api/auth/verify-email/${verifyToken}`;
    const html = `
      <p>Hi ${name},</p>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verifyLink}">${verifyLink}</a>
      <p>This link will expire in 1 hour.</p>
    `;
    await sendEmail(email, 'Email Verification', html);

    res.status(201).json({ message: 'User registered. Please check your email to verify your account.' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ message: 'Invalid email or password' });

    if (user.isBanned)
      return res.status(403).json({ message: 'Your account has been banned by admin.' });

    if (!user.isVerified)
      return res.status(401).json({ message: 'Please verify your email before logging in.' });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch)
      return res.status(400).json({ message: 'Invalid email or password' });

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        email: user.email,
        role: user.role || 'user',
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// Verify Email
exports.verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({
      verifyToken: req.params.token,
      verifyTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.redirect('http://localhost:3000/login?verified=fail');
    }

    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpires = undefined;
    await user.save();

    return res.redirect('http://localhost:3000/login?verified=success');
  } catch (err) {
    console.error('Verification error:', err);
    return res.redirect('http://localhost:3000/login?verified=error');
  }
};


// Forgot Password
exports.forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user || !user.isVerified)
    return res.status(400).json({ message: 'User not found or not verified' });

  const token = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save();

  const link = `http://localhost:3000/login?resetToken=${token}`;
  const html = `
  <p>Click the link below to reset your password:</p>
  <a href="${link}">${link}</a>
  <p>This link will expire in 1 hour.</p>
`;
  await sendEmail(user.email, 'Reset Your Password', html );

  res.json({ message: 'Password reset email sent' });
};


// Reset Password
exports.resetPassword = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user)
    return res.status(400).json({ message: 'Invalid or expired token' });

  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: 'Password reset successful' });
};