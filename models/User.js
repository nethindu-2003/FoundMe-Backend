const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  gender: String,
  birthday: String,
  phonenumber: String,
  username: { type: String, required: true, unique: true },
  password: String,
});

module.exports = mongoose.model('User', userSchema);
