const mongoose = require('mongoose');

const lostItemSchema = new mongoose.Schema({
  lostitem: String,
  lostdatetime: String,
  lostlocation: String,
  ownername: String,
  ownerphonenumber: String,
  lostdescription: String,
  email: { type: String, required: true },
});

module.exports = mongoose.model('LostItem', lostItemSchema);
