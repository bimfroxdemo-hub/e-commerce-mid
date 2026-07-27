const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
    default: null
  },
  password: {
    type: String,
    select: false
  },
  avatar: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
    default: null
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  facebookId: {
    type: String,
    unique: true,
    sparse: true
  },
  whatsappId: {
    type: String,
    unique: true,
    sparse: true
  },
  authProvider: {
    type: String,
    enum: ['email', 'google', 'facebook', 'phone', 'whatsapp'],
    default: 'email'
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  phoneOTP: {
    code: String,
    expiresAt: Date
  },
  address: [{
    label: { 
      type: String, 
      required: true,
      enum: ['home', 'work', 'other']
    },
    fullName: { 
      type: String, 
      required: true,
      trim: true
    },
    phone: { 
      type: String, 
      required: true
    },
    street: { 
      type: String, 
      required: true,
      trim: true
    },
    city: { 
      type: String, 
      required: true,
      trim: true
    },
    state: { 
      type: String, 
      required: true,
      trim: true
    },
    pincode: { 
      type: String, 
      required: true
    },
    isDefault: { 
      type: Boolean, 
      default: false 
    }
  }],

  // ==============================
  // SELLER CENTRAL ONBOARDING FIELDS
  // ==============================
  storeName: { type: String, default: '' },
  businessName: { type: String, default: '' },
  licenseType: { type: String, default: 'GSTIN' },
  primaryCategory: { type: String, default: '' },
  pincode: { type: String, default: '' },
  addressLine1: { type: String, default: '' },
  addressLine2: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  country: { type: String, default: 'India' },
  
  shippingMethod: { type: String, default: 'self_ship', enum: ['kabira_fba', 'easy_ship', 'self_ship'] },
  shippingFeeType: { type: String, default: 'free', enum: ['free', 'set_fee'] },
  localFee: { type: Number, default: 40 },
  regionalFee: { type: Number, default: 50 },
  nationalFee: { type: Number, default: 60 },
  productTaxCode: { type: String, default: 'A_GEN_STANDARD' },
  
  gstNumber: { type: String, default: '' },
  panNumber: { type: String, default: '' },
  exemptCategory: { type: Boolean, default: false },
  
  accountHolder: { type: String, default: '' },
  bankName: { type: String, default: '' },
  accountNumber: { type: String, default: '' },
  ifscCode: { type: String, default: '' },
  
  isHolidayMode: { type: Boolean, default: false },
  holidayStart: { type: Date, default: null },
  holidayEnd: { type: Date, default: null },
  holidayPolicy: { type: String, default: 'deactivate', enum: ['deactivate', 'delay_warning'] },
  holidayMessage: { type: String, default: 'We are temporarily away on vacation.' },

  role: {
    type: String,
    enum: ['user', 'admin', 'seller'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password || this.authProvider !== 'email') {
    return next();
  }
  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);