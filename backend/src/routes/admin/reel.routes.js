const express = require('express');
const router = express.Router();
const authenticate = require('../../middleware/auth');
const adminOnly = require('../../middleware/admin');


const {
  getReels,
  createReel,
  updateReel,
  deleteReel,
  toggleReelStatus,
} = require('../../controllers/admin/reel.controller');
router.use(authenticate);
router.use(adminOnly);

router.get('/', getReels);
router.post('/', createReel);
router.put('/:id', updateReel);
router.patch('/:id/toggle', toggleReelStatus);
router.delete('/:id', deleteReel);

module.exports = router;