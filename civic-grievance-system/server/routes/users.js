const express = require('express');
const router = express.Router();
const { getDB } = require('../database');

// GET all officers
router.get('/officers', (req, res) => {
  try {
    const db = getDB();
    const officers = db.prepare("SELECT id, name, email, department FROM users WHERE role = 'officer'").all();
    res.json(officers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
