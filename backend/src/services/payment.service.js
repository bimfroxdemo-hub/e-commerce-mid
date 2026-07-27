const Razorpay = require('razorpay');
const crypto = require('crypto');

class PaymentService {
  constructor() {
    // Initialize the Razorpay client using your test credentials from .env
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  /**
   * Creates a Razorpay Order.
   * Standard checkout requires creating an order on the backend first.
   * @param {number} amount - Amount in INR (e.g., 500)
   * @param {string} receiptId - A unique identifier (typically your local Database Order ID)
   */
  async createOrder(amount, receiptId) {
    try {
      const options = {
        amount: Math.round(amount * 100), // Razorpay handles currency in paise (e.g. 500 INR = 50000 paise)
        currency: 'INR',
        receipt: receiptId,
      };

      const order = await this.razorpay.orders.create(options);
      return order;
    } catch (error) {
      throw new Error('Razorpay Order Creation Failed: ' + error.message);
    }
  }

  /**
   * Verifies the cryptographic payment signature returned by the frontend popup.
   * This ensures the transaction was actual, successful, and untampered.
   */
  verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
    try {
      const text = `${razorpayOrderId}|${razorpayPaymentId}`;
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(text)
        .digest('hex');

      return generatedSignature === razorpaySignature;
    } catch (error) {
      return false;
    }
  }

  /**
   * Processes a refund via Razorpay APIs.
   * @param {string} paymentId - The Razorpay payment ID (e.g., pay_xxxxx)
   * @param {number} amount - Amount to refund in INR
   */
  async refundPayment(paymentId, amount) {
    try {
      const options = {
        amount: Math.round(amount * 100), // convert to paise
      };

      // Perform real refund request
      const refund = await this.razorpay.payments.refund(paymentId, options);

      return {
        success: true,
        refundId: refund.id,
        transactionId: paymentId,
        amount: refund.amount / 100, // convert back to INR for your logs
        status: refund.status
      };
    } catch (error) {
      throw new Error('Razorpay Refund Failed: ' + error.message);
    }
  }

  /**
   * Legacy Mock Helper:
   * Standard Razorpay integrations collect cards safely on the frontend modal (PCI-DSS compliant).
   * Your server should not receive or validate credit cards directly anymore.
   */
  async validateCard(cardDetails) {
    // Left in place to prevent errors if called elsewhere.
    // Card inputs are handled automatically by the secure Razorpay Checkout UI.
    return true;
  }
}

module.exports = new PaymentService();