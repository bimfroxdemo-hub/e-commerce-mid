const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth/auth.controller");
const authenticate = require("../middleware/auth");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

router.post("/send-otp", authController.sendPhoneOTP);
router.post("/whatsapp/send-otp", authController.sendWhatsAppOTP);

router.post("/google/login", authController.login);
router.post("/facebook/login", authController.login);

router.put("/seller/onboard", authenticate, authController.updateSellerProfile);

router.get("/test", (req, res) => {
  res.json({ 
    success: true, 
    message: 'Authentication routes successfully mapped!', 
    availableRoutes: [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'POST /api/auth/logout',
      'POST /api/auth/send-otp',
      'POST /api/auth/whatsapp/send-otp',
      'PUT /api/auth/seller/onboard'
    ] 
  });
});

module.exports = router;