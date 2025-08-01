const express = require('express');
const router = express.Router();
const FoundItem = require('../models/FoundItem');

router.post('/found', async (req, res) => {
  const {
    founditem, founddatetime, foundlocation,
    findercontact, founddescription,email
  } = req.body;

  if (!email) return res.status(400).json({ message: "Email required" });

  try {
    const newFound = new FoundItem({
      founditem, founddatetime, foundlocation,
      findercontact, founddescription,
      email
    });

    await newFound.save();
    res.status(201).json(newFound);
  } catch (error) {
    res.status(500).json({ error: "Failed to save found item" });
  }
});


router.get('/', async (req, res) => {
  try {
    const { email } = req.query;
    const query = email ? { email } : {};
    const items = await FoundItem.find(query);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const updated = await FoundItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await FoundItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
