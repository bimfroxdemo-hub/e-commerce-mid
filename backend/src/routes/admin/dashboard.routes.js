const express = require('express');
const router = express.Router();
const { getDashboardStats, getRecentActivity } = require('../../controllers/admin/dashboard.controller');
const authModule = require('../../middleware/auth');

// Resolve authentication and shared role-permission middlewares
const authenticate = typeof authModule === 'function' ? authModule : authModule.authenticate;
const adminOrSeller = authModule.adminOrSeller;

router.use(authenticate);
router.use(adminOrSeller); // Allows both administrators and onboarding merchants

router.get('/stats', getDashboardStats);
router.get('/recent-activity', getRecentActivity);

module.exports = router;