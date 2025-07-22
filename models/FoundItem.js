const mongoose = require('mongoose');

const foundItemSchema = new mongoose.Schema({
  founditem: String,
  founddatetime: String,
  foundlocation: String,
  findercontact: String,
  founddescription: String,
});

module.exports = mongoose.model('FoundItem', foundItemSchema);
