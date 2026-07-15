const express = require('express');
const router = express.Router();

const { getPublicReels } = require('../../controllers/user/reel.controller');

// Base URL: /api/reels
router.get('/', getPublicReels);

module.exports = router;