const User = require('../../models/User');
const { generateToken } = require('../../utils/jwt');
const { sendSuccess, sendError } = require('../../utils/response');
const axios = require('axios');
const twilio = require('twilio');

const twilioClient = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!name?.trim() || !normalizedEmail || !password) {
      return sendError(res, "All fields are required", 400);
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return sendError(res, "User already exists with this email", 400);
    }

    // Set role to 'seller' dynamically if specified by the onboard wizard
    const assignedRole = (role === 'seller' || role === 'admin') ? role : 'user';

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      authProvider: 'email',
      role: assignedRole
    });

    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    return sendSuccess(res, "User registered successfully", { user: userResponse, token }, 201);
  } catch (error) {
    console.error("Register error:", error);
    return sendError(res, error.message, 500);
  }
};

const updateSellerProfile = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return sendError(res, "User session not found", 404);
    }

    const {
      storeName,
      businessName,
      licenseType,
      primaryCategory,
      pincode,
      addressLine1,
      addressLine2,
      city,
      state,
      country,
      shippingMethod,
      shippingFeeType,
      localFee,
      regionalFee,
      nationalFee,
      productTaxCode,
      gstNumber,
      panNumber,
      exemptCategory,
      accountHolder,
      bankName,
      accountNumber,
      ifscCode
    } = req.body;

    user.storeName = storeName || user.storeName;
    user.businessName = businessName || user.businessName;
    user.licenseType = licenseType || user.licenseType;
    user.primaryCategory = primaryCategory || user.primaryCategory;
    user.pincode = pincode || user.pincode;
    user.addressLine1 = addressLine1 || user.addressLine1;
    user.addressLine2 = addressLine2 || user.addressLine2;
    user.city = city || user.city;
    user.state = state || user.state;
    user.country = country || user.country;
    user.shippingMethod = shippingMethod || user.shippingMethod;
    user.shippingFeeType = shippingFeeType || user.shippingFeeType;
    user.localFee = localFee !== undefined ? Number(localFee) : user.localFee;
    user.regionalFee = regionalFee !== undefined ? Number(regionalFee) : user.regionalFee;
    user.nationalFee = nationalFee !== undefined ? Number(nationalFee) : user.nationalFee;
    user.productTaxCode = productTaxCode || user.productTaxCode;
    user.gstNumber = gstNumber || user.gstNumber;
    user.panNumber = panNumber || user.panNumber;
    user.exemptCategory = exemptCategory !== undefined ? exemptCategory : user.exemptCategory;
    user.accountHolder = accountHolder || user.accountHolder;
    user.bankName = bankName || user.bankName;
    user.accountNumber = accountNumber || user.accountNumber;
    user.ifscCode = ifscCode || user.ifscCode;

    user.role = 'seller'; 

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    return sendSuccess(res, "Seller profile onboarded successfully", { user: userResponse });
  } catch (error) {
    console.error("Seller onboarding error:", error);
    return sendError(res, error.message || "Failed to submit onboarding profile", 500);
  }
};

const logout = async (req, res) => {
  try {
    return sendSuccess(res, "Logged out successfully");
  } catch (error) {
    console.error("Logout error:", error);
    return sendError(res, "An error occurred during logout", 500);
  }
};

const loginWithEmail = async (credentials) => {
  try {
    const { email, password } = credentials;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return { success: false, message: "Email and password are required", status: 400 };
    }

    const user = await User.findOne({ email: normalizedEmail }).select("+password");
    if (!user) {
      return { success: false, message: "Invalid credentials", status: 401 };
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return { success: false, message: "Invalid credentials", status: 401 };
    }

    if (user.isActive === false) {
      return { success: false, message: "Account is deactivated", status: 403 };
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken({ id: user._id, email: user.email, role: user.role });
    const userResponse = user.toObject();
    delete userResponse.password;

    return { success: true, user: userResponse, token };
  } catch (error) {
    console.error("Email login error:", error);
    return { success: false, message: "Server error", status: 500 };
  }
};

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return sendError(res, "Email and password are required", 400);
    }

    const user = await User.findOne({ email: normalizedEmail }).select("+password");
    if (!user) {
      return sendError(res, "Invalid credentials", 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, "Invalid credentials", 401);
    }

    if (user.role !== 'admin') {
      return sendError(res, "Access denied. Admin role required.", 403);
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken({ id: user._id, email: user.email, role: user.role });
    const userResponse = user.toObject();
    delete userResponse.password;

    return sendSuccess(res, "Admin logged in successfully", { user: userResponse, token });
  } catch (error) {
    console.error("Admin login error:", error);
    return sendError(res, "Server error during admin authentication", 500);
  }
};

const loginWithGoogle = async (credentials) => {
  try {
    const { accessToken } = credentials;
    if (!accessToken) {
      return { success: false, message: "Google access token required", status: 400 };
    }
    const googleRes = await axios.get(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
    );
    const { id, email, name, picture } = googleRes.data;

    let user = await User.findOne({
      $or: [{ googleId: id }, { email: email?.toLowerCase() }]
    });

    if (user) {
      if (!user.googleId) {
        user.googleId = id;
        user.authProvider = 'google';
        user.emailVerified = true;
        await user.save();
      }
    } else {
      user = await User.create({
        name,
        email: email?.toLowerCase() || null,
        googleId: id,
        avatar: picture || null,
        authProvider: 'google',
        emailVerified: true,
        phoneVerified: false,
        role: 'user'
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken({ id: user._id, email: user.email, role: user.role });
    const userResponse = user.toObject();
    delete userResponse.password;

    return { success: true, user: userResponse, token };
  } catch (error) {
    console.error("Google login error:", error);
    return { success: false, message: "Google authentication failed", status: 401 };
  }
};

const loginWithFacebook = async (credentials) => {
  try {
    const { accessToken } = credentials;
    if (!accessToken) {
      return { success: false, message: "Facebook access token required", status: 400 };
    }
    const fbRes = await axios.get(
      `https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,email,picture`
    );
    const { id, email, name, picture } = fbRes.data;

    let user = await User.findOne({
      $or: [{ facebookId: id }, { email: email?.toLowerCase() }]
    });

    if (user) {
      if (!user.facebookId) {
        user.facebookId = id;
        user.authProvider = 'facebook';
        user.emailVerified = !!email;
        await user.save();
      }
    } else {
      user = await User.create({
        name,
        email: email?.toLowerCase() || null,
        facebookId: id,
        avatar: picture?.data?.url || null,
        authProvider: 'facebook',
        emailVerified: !!email,
        role: 'user'
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken({ id: user._id, email: user.email, role: user.role });
    const userResponse = user.toObject();
    delete userResponse.password;

    return { success: true, user: userResponse, token };
  } catch (error) {
    console.error("Facebook login error:", error);
    return { success: false, message: "Facebook authentication failed", status: 401 };
  }
};

const loginWithPhone = async (credentials) => {
  try {
    const { phone, otp } = credentials;
    if (!phone || !otp) {
      return { success: false, message: "Phone and OTP are required", status: 400 };
    }
    const rawDigits = String(phone).replace(/\D/g, '').trim();
    const user = await User.findOne({
      $or: [{ phone: rawDigits }, { whatsappId: rawDigits }]
    });

    if (!user) {
      return { success: false, message: "Phone number not registered", status: 401 };
    }

    if (!user.phoneOTP || user.phoneOTP.code !== otp || user.phoneOTP.expiresAt < new Date()) {
      return { success: false, message: "Invalid or expired OTP", status: 401 };
    }

    user.phoneOTP = undefined;
    user.phoneVerified = true;
    user.authProvider = user.authProvider || 'phone';
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken({ id: user._id, email: user.email, role: user.role });
    const userResponse = user.toObject();
    delete userResponse.password;

    return { success: true, user: userResponse, token };
  } catch (error) {
    console.error("Phone login error:", error);
    return { success: false, message: "Phone authentication failed", status: 500 };
  }
};

const loginWithWhatsApp = async (credentials) => {
  try {
    const { phone, otp } = credentials;
    if (!phone || !otp) {
      return { success: false, message: "Phone and OTP are required", status: 400 };
    }
    const rawDigits = String(phone).replace(/\D/g, '').trim();
    const user = await User.findOne({
      $or: [{ phone: rawDigits }, { whatsappId: rawDigits }]
    });

    if (!user) {
      return { success: false, message: "WhatsApp number not registered", status: 401 };
    }

    if (!user.phoneOTP || user.phoneOTP.code !== otp || user.phoneOTP.expiresAt < new Date()) {
      return { success: false, message: "Invalid or expired WhatsApp OTP", status: 401 };
    }

    user.phoneOTP = undefined;
    user.phoneVerified = true;
    user.whatsappVerified = true;
    user.whatsappId = user.whatsappId || rawDigits;
    user.authProvider = user.authProvider === 'email' ? 'whatsapp' : (user.authProvider || 'whatsapp');
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken({ id: user._id, email: user.email, role: user.role });
    const userResponse = user.toObject();
    delete userResponse.password;

    return { success: true, user: userResponse, token };
  } catch (error) {
    console.error("WhatsApp login error:", error);
    return { success: false, message: "WhatsApp authentication failed", status: 500 };
  }
};

const sendPhoneOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return sendError(res, "Phone number is required", 400);

    const rawDigits = String(phone).replace(/\D/g, '').trim();
    if (rawDigits.length < 10) {
      return sendError(res, "Valid phone number is required", 400);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    let user = await User.findOne({ $or: [{ phone: rawDigits }, { whatsappId: rawDigits }] });
    if (!user) {
      user = await User.create({
        name: `User${rawDigits.slice(-4)}`,
        phone: rawDigits,
        whatsappId: rawDigits,
        email: `phone_${rawDigits}@luxestore.temp`,
        authProvider: 'phone',
        role: 'user'
      });
    }

    user.phoneOTP = { code: otp, expiresAt };
    await user.save();

    console.log(`PHONE OTP for ${rawDigits}: ${otp}`);

    if (twilioClient) {
      const formattedPhone = rawDigits.startsWith('+') ? rawDigits : (rawDigits.length === 10 ? `+91${rawDigits}` : `+${rawDigits}`);
      await twilioClient.messages.create({
        body: `Your Luxe Store OTP is: ${otp}. Valid for 5 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedPhone
      });
    }

    return sendSuccess(res, "OTP sent successfully", {
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    console.error("Send Phone OTP error:", error);
    return sendError(res, error.message, 500);
  }
};

const sendWhatsAppOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return sendError(res, "Phone number is required", 400);

    const rawDigits = String(phone).replace(/\D/g, '').trim();
    if (rawDigits.length < 10) {
      return sendError(res, "Valid phone number is required", 400);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    let user = await User.findOne({ $or: [{ phone: rawDigits }, { whatsappId: rawDigits }] });
    if (!user) {
      user = await User.create({
        name: `WhatsApp User ${rawDigits.slice(-4)}`,
        whatsappId: rawDigits,
        phone: rawDigits,
        email: `whatsapp_${rawDigits}@luxestore.temp`,
        authProvider: 'whatsapp',
        role: 'user'
      });
    }

    user.phoneOTP = { code: otp, expiresAt };
    user.authProvider = user.authProvider || 'whatsapp';
    await user.save();

    console.log(`WHATSAPP OTP for ${rawDigits}: ${otp}`);

    if (twilioClient) {
      const formattedPhone = rawDigits.startsWith('+') ? rawDigits : (rawDigits.length === 10 ? `+91${rawDigits}` : `+${rawDigits}`);
      await twilioClient.messages.create({
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        body: `Your Luxe Store verification code is ${otp}`,
        to: `whatsapp:${formattedPhone}`
      });
    }

    return sendSuccess(res, "WhatsApp OTP sent", {
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    console.error("Send WhatsApp OTP error:", error);
    return sendError(res, error.message, 500);
  }
};

const login = async (req, res) => {
  try {
    const { loginType, ...credentials } = req.body;
    let result;

    switch (loginType) {
      case 'email':
        result = await loginWithEmail(credentials);
        break;
      case 'google':
        result = await loginWithGoogle(credentials);
        break;
      case 'facebook':
        result = await loginWithFacebook(credentials);
        break;
      case 'phone':
        result = await loginWithPhone(credentials);
        break;
      case 'whatsapp':
        result = await loginWithWhatsApp(credentials);
        break;
      default:
        if (credentials.email && credentials.password) {
          result = await loginWithEmail({
            email: credentials.email,
            password: credentials.password
          });
        } else {
          return sendError(res, "Login type not specified or missing credentials", 400);
        }
    }

    if (result && result.success) {
      return sendSuccess(res, "Login successful", {
        user: result.user,
        token: result.token
      });
    } else if (result) {
      return sendError(res, result.message || "Login failed", result.status || 401);
    } else {
      return sendError(res, "Unknown login error", 500);
    }
  } catch (error) {
    console.error("Login error:", error);
    return sendError(res, "Server error", 500);
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    sendSuccess(res, 'Profile fetched successfully', user);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, address },
      { new: true, runValidators: true }
    ).select('-password');
    sendSuccess(res, 'Profile updated successfully', user);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return sendError(res, 'Current password is incorrect', 400);
    }
    user.password = newPassword;
    await user.save();
    sendSuccess(res, 'Password changed successfully');
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

module.exports = {
  register,
  login,
  adminLogin,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  updateSellerProfile,
  loginWithEmail,
  loginWithGoogle,
  loginWithPhone,
  loginWithFacebook,
  loginWithWhatsApp,
  sendPhoneOTP,
  sendWhatsAppOTP
};