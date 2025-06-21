const express = require('express');
const router = express.Router();
const User = require('../models/User'); // ইউজার মডেল

// ইউজার ডেটা পাওয়ার রাউট
router.get('/:phone', async (req, res) => {
  const { phone } = req.params;
  try {
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: 'ইউজার পাওয়া যায়নি' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'সার্ভার এরর' });
  }
});

// ইউজার আপডেট রাউট
router.put('/:phone', async (req, res) => {
  const { phone } = req.params;
  const { name, age } = req.body;
  try {
    const updated = await User.findOneAndUpdate(
      { phone },
      { name, age },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'ইউজার পাওয়া যায়নি' });
    res.json({ message: 'আপডেট সফল হয়েছে' });
  } catch (err) {
    res.status(500).json({ message: 'সার্ভার এরর' });
  }
});

module.exports = router;
