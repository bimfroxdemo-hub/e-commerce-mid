export const mockOrders = [
  {
    id: "LUX-99831",
    userId: 101, // Vishal Nishad
    date: "2026-07-02",
    items: [
      {
        id: 1,
        name: "Classic Cashmere Trench Coat",
        brand: "Luxe Atelier",
        price: 14999,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?q=80&w=600&auto=format&fit=crop"
      },
      {
        id: 10,
        name: "Luxury Acetate Cat-Eye Sunglasses",
        brand: "Vanguard",
        price: 4999,
        quantity: 2,
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop"
      }
    ],
    subtotal: 24997,
    discount: 1500, // Coupon code applied: LUXE1500
    shipping: 0, // Free above 999
    total: 23497,
    paymentMethod: "UPI / NetBanking",
    shippingAddress: {
      fullName: "Vishal Nishad",
      street: "404 Luxe Towers, Sector 62",
      city: "Noida",
      state: "Uttar Pradesh",
      pincode: "201301",
      phone: "+91 98765 43210"
    },
    status: "Shipped", // Ordered, Confirmed, Shipped, Out for Delivery, Delivered, Cancelled
    trackingId: "SFY-882903-IND",
    timeline: [
      { title: "Order Placed", time: "2026-07-02 10:14 AM", desc: "Your order has been successfully logged.", active: true },
      { title: "Order Confirmed", time: "2026-07-02 02:30 PM", desc: "Payment verified & items reserved.", active: true },
      { title: "Shipped", time: "2026-07-03 11:00 AM", desc: "In transit from Delhi Hub. Carrier: BlueDart.", active: true },
      { title: "Out for Delivery", time: "", desc: "Awaiting local hub receipt.", active: false },
      { title: "Delivered", time: "", desc: "Proof of delivery required.", active: false }
    ]
  },
  {
    id: "LUX-99804",
    userId: 101, // Vishal Nishad
    date: "2026-06-25",
    items: [
      {
        id: 3,
        name: "Monochrome Minimalist Sneaker",
        brand: "Aero",
        price: 8499,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600&auto=format&fit=crop"
      }
    ],
    subtotal: 8499,
    discount: 0,
    shipping: 0,
    total: 8499,
    paymentMethod: "Credit Card (Visa)",
    shippingAddress: {
      fullName: "Vishal Nishad",
      street: "404 Luxe Towers, Sector 62",
      city: "Noida",
      state: "Uttar Pradesh",
      pincode: "201301",
      phone: "+91 98765 43210"
    },
    status: "Delivered",
    trackingId: "SFY-773821-IND",
    timeline: [
      { title: "Order Placed", time: "2026-06-25 04:22 PM", desc: "Your order has been successfully logged.", active: true },
      { title: "Order Confirmed", time: "2026-06-25 05:40 PM", desc: "Payment verified & items reserved.", active: true },
      { title: "Shipped", time: "2026-06-26 09:15 AM", desc: "In transit. Carrier: BlueDart.", active: true },
      { title: "Out for Delivery", time: "2026-06-28 08:30 AM", desc: "Out for delivery with BlueDart agent.", active: true },
      { title: "Delivered", time: "2026-06-28 01:10 PM", desc: "Delivered & signed by self.", active: true }
    ]
  },
  {
    id: "LUX-99712",
    userId: 102, // Aarav Sharma
    date: "2026-07-04",
    items: [
      {
        id: 2,
        name: "Tailored Italian Leather Jacket",
        brand: "Veloce",
        price: 18999,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=600&auto=format&fit=crop"
      }
    ],
    subtotal: 18999,
    discount: 1000,
    shipping: 0,
    total: 17999,
    paymentMethod: "Paytm Wallet",
    shippingAddress: {
      fullName: "Aarav Sharma",
      street: "12B, Regency Enclave, Bandra West",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400050",
      phone: "+91 91234 56789"
    },
    status: "Confirmed",
    trackingId: "",
    timeline: [
      { title: "Order Placed", time: "2026-07-04 11:30 PM", desc: "Your order has been successfully logged.", active: true },
      { title: "Order Confirmed", time: "2026-07-05 10:00 AM", desc: "Payment verified & items reserved.", active: true },
      { title: "Shipped", time: "", desc: "Carrier dispatch pending.", active: false },
      { title: "Out for Delivery", time: "", desc: "", active: false },
      { title: "Delivered", time: "", desc: "", active: false }
    ]
  },
  {
    id: "LUX-99602",
    userId: 103, // Priya Patel
    date: "2026-07-05",
    items: [
      {
        id: 9,
        name: "Oversized Knit Cashmere Sweater",
        brand: "Luxe Atelier",
        price: 7999,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1574164904299-3a102b110380?q=80&w=600&auto=format&fit=crop"
      }
    ],
    subtotal: 7999,
    discount: 500,
    shipping: 0,
    total: 7499,
    paymentMethod: "Cash on Delivery",
    shippingAddress: {
      fullName: "Priya Patel",
      street: "Flat 401, Sapphire Heights, Indiranagar",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560038",
      phone: "+91 88776 65544"
    },
    status: "Ordered",
    trackingId: "",
    timeline: [
      { title: "Order Placed", time: "2026-07-05 02:45 PM", desc: "Your order has been placed. Waiting for payment or COD confirmation.", active: true },
      { title: "Order Confirmed", time: "", desc: "", active: false },
      { title: "Shipped", time: "", desc: "", active: false },
      { title: "Out for Delivery", time: "", desc: "", active: false },
      { title: "Delivered", time: "", desc: "", active: false }
    ]
  }
];
