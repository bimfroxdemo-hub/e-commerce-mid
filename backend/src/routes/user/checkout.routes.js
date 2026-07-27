const express = require('express');
const router = express.Router();
const {
  processCheckout,
  validateCoupon
} = require('../../controllers/user/checkout.controller');
const authenticate = require('../../middleware/auth');

router.use(authenticate);

router.post('/', processCheckout);
router.post('/validate-coupon', validateCoupon);

module.exports = router;