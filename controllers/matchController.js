const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const User = require('../models/User');
const nodemailer = require('nodemailer');

exports.getSuggestedMatches = async (req, res) => {
  try {
    const lostItems = await LostItem.find();
    const foundItems = await FoundItem.find();

    const matches = [];

    lostItems.forEach(lost => {
      foundItems.forEach(found => {
        const dateDiff = Math.abs(new Date(lost.lostdatetime) - new Date(found.founddatetime));
        const dateOK = dateDiff <= 1000 * 60 * 60 * 24 * 3; // within 3 days
        const sameLocation = lost.lostlocation.toLowerCase() === found.foundlocation.toLowerCase();
        const sameItem = lost.lostitem.toLowerCase() === found.founditem.toLowerCase();

        if (sameLocation && sameItem && dateOK) {
          matches.push({
            lostId: lost._id,
            foundId: found._id,
            lostItem: lost,
            foundItem: found,
          });
        }
      });
    });

    res.json({ success: true, matches });
  } catch (error) {
    console.error('Match suggestion error:', error);
    res.status(500).json({ success: false, error: 'Failed to suggest matches' });
  }
};

exports.approveMatch = async (req, res) => {
  try {
    const { lostItemId, foundItemId } = req.body;

    const lostItem = await LostItem.findById(lostItemId);
    const foundItem = await FoundItem.findById(foundItemId);

    if (!lostItem || !foundItem) {
      return res.status(404).json({ error: 'Items not found' });
    }

    // Notify both users
    const lostUser = await User.findOne({ email: lostItem.email });
    const foundUser = await User.findOne({ email: foundItem.email });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptionsLost = {
      from: process.env.EMAIL_USER,
      to: lostUser.email,
      subject: 'Lost Item Match Found',
      text: `We found a potential match for your lost item: ${foundItem.founditem}.\nFinder Contact: ${foundItem.findercontact}\nDescription: ${foundItem.founddescription}`
    };

    const mailOptionsFound = {
      from: process.env.EMAIL_USER,
      to: foundUser.email,
      subject: 'Found Item Match Confirmed',
      text: `Your found item matches someone’s lost report: ${lostItem.lostitem}.\nOwner Contact: ${lostItem.ownercontact}\nDescription: ${lostItem.lostdescription}`
    };

    await transporter.sendMail(mailOptionsLost);
    await transporter.sendMail(mailOptionsFound);

    res.status(200).json({ message: 'Match approved and users notified' });

  } catch (err) {
    console.error('Approval error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};