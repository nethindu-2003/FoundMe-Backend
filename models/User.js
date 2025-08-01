const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  gender: String,
  birthday: String,
  phonenumber: String,
  email: { type: String, required: true, unique: true },
  password: String,
  isVerified: { type: Boolean, default: false },
  verifyToken: String,
  verifyTokenExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  status: { type: String, enum: ['active', 'banned'], default: 'active' },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  isBanned: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
