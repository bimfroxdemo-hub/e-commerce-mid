export const mockCoupons = [
  {
    code: "LUXE1500",
    discountType: "fixed",
    value: 1500,
    minOrderValue: 10000,
    description: "Get ₹1,500 off on premium orders above ₹10,000",
    expiryDate: "2026-12-31"
  },
  {
    code: "FIRST20",
    discountType: "percent",
    value: 20,
    minOrderValue: 2000,
    description: "Enjoy 20% off on your first modern luxury order",
    expiryDate: "2026-09-30"
  },
  {
    code: "FREE999",
    discountType: "percent",
    value: 100, // free shipping or complimentary gift
    minOrderValue: 999,
    description: "Complimentary priority shipping and modern dustbags",
    expiryDate: "2026-08-15"
  }
];
