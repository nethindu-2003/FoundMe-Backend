const express = require('express');
const router = express.Router();
const LostItem = require('../models/LostItem');

router.post('/lost', async (req, res) => {
  const {
    lostitem, lostdatetime, lostlocation,
    ownername, ownerphonenumber, lostdescription, email
  } = req.body;

  if (!email) return res.status(400).json({ message: "Username required" });

  try {
    const newLost = new LostItem({
      lostitem, lostdatetime, lostlocation,
      ownername, ownerphonenumber, lostdescription,
      email // 🔑 Save it
    });

    await newLost.save();
    res.status(201).json(newLost);
  } catch (error) {
    res.status(500).json({ error: "Failed to save lost item" });
  }
});


router.get('/', async (req, res) => {
  try {
    const { email } = req.query;
    const query = email ? { email } : {};
    const items = await LostItem.find(query);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try{
    const updated = await LostItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await LostItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
