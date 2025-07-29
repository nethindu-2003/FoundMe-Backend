const mongoose = require('mongoose');

const foundItemSchema = new mongoose.Schema({
  founditem: String,
  founddatetime: String,
  foundlocation: String,
  findercontact: String,
  founddescription: String,
  username: { type: String, required: true },
});

module.exports = mongoose.model('FoundItem', foundItemSchema);
