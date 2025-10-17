const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');

router.get('/', auth, (req, res) => {
  // req.user was set by middleware
  res.json({ msg: `Welcome ${req.user.name}`, user: req.user });
});

module.exports = router;
