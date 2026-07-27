const express = require('express');
const router = express.Router();
const {
  getAllOrders,
  getOrder,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  getOrderStats,
  generateInvoice,
  sendOrderUpdate
} = require('../../controllers/admin/order.controller');
const { updateOrderStatusValidation } = require('../../validations/order.validation');
const authModule = require('../../middleware/auth');
const validateModule = require('../../middleware/validate');

const authenticate = typeof authModule === 'function' ? authModule : authModule.authenticate;
const adminOrSeller = authModule.adminOrSeller;

const validate =
  typeof validateModule === 'function'
    ? validateModule
    : validateModule.validate;

router.use(authenticate);
router.use(adminOrSeller); // Updated to allow scoped seller order tracking

router.get('/', getAllOrders);
router.get('/stats', getOrderStats);
router.get('/:id', getOrder);
router.put('/:id/status', updateOrderStatusValidation, validate, updateOrderStatus);
router.put('/:id/payment-status', updatePaymentStatus);
router.post('/:id/cancel', cancelOrder);
router.get('/:id/invoice', generateInvoice);
router.post('/:id/send-update', sendOrderUpdate);

module.exports = router;