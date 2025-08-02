const mongoose = require('mongoose');

const foundItemSchema = new mongoose.Schema({
  founditem: String,
  founddatetime: Date,
  foundlocation: String,
  findercontact: String,
  founddescription: String,
  email: { type: String, required: true },
});

module.exports = mongoose.model('FoundItem', foundItemSchema);
