import axios from "axios";

// ==============================
// API Configuration
// ==============================
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// ✅ Base URL without /api
const BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5001"
).replace("/api", "");

// ==============================
// Axios Instance
// ==============================
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// ==============================
// Request Interceptor
// ==============================
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("luxe_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ==============================
// Response Interceptor
// ==============================
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized. Clearing session...");

      localStorage.removeItem("luxe_token");
      localStorage.removeItem("luxe_user");
    }

    return Promise.reject(error);
  }
);

// ==============================
// Helper Functions
// ==============================
const saveAuthData = (token, user) => {
  if (token) {
    localStorage.setItem("luxe_token", token);
  }

  if (user) {
    localStorage.setItem("luxe_user", JSON.stringify(user));
  }
};

const clearAuthData = () => {
  localStorage.removeItem("luxe_token");
  localStorage.removeItem("luxe_user");
};

const extractAuthPayload = (data) => {
  const token =
    data?.token ||
    data?.accessToken ||
    data?.access_token ||
    data?.data?.token ||
    data?.data?.accessToken ||
    data?.data?.access_token ||
    data?.data?.data?.token ||
    data?.data?.data?.accessToken;

  const user =
    data?.user ||
    data?.admin ||
    data?.data?.user ||
    data?.data?.admin ||
    data?.data?.data?.user ||
    data?.data?.data?.admin ||
    null;

  return {
    token,
    user,
  };
};

const handleError = (error) => {
  throw error.response?.data || error.message || error;
};

const request = async (config) => {
  try {
    const response = await apiClient(config);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// ==============================
// SECTION 1: ROOT & HEALTH ENDPOINTS
// ==============================
export const healthAPI = {
  getWelcome: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  checkHealth: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/health`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// ==============================
// SECTION 2: AUTHENTICATION API
// ==============================
export const authAPI = {
  register: async (userData) => {
    const data = await request({
      method: "post",
      url: "/auth/register",
      data: userData,
    });

    const { token, user } = extractAuthPayload(data);

    if (token) {
      saveAuthData(token, user);
    }

    return data;
  },

  login: async (email, password) => {
    const data = await request({
      method: "post",
      url: "/auth/login",
      data: {
        email,
        password,
      },
    });

    const { token, user } = extractAuthPayload(data);

    if (token) {
      saveAuthData(token, user);
    }

    return data;
  },

  adminLogin: async (email, password) => {
    const data = await request({
      method: "post",
      url: "/auth/admin/login",
      data: {
        email,
        password,
      },
    });

    const { token, user } = extractAuthPayload(data);

    if (token) {
      saveAuthData(token, user);
    }

    return data;
  },

  logout: async () => {
    try {
      await apiClient.post("/auth/logout");
      clearAuthData();

      return {
        success: true,
        message: "Logged out successfully",
      };
    } catch (error) {
      clearAuthData();

      return {
        success: true,
        message: "Logged out locally",
      };
    }
  },

  getProfile: async () =>
    request({
      method: "get",
      url: "/auth/profile",
    }),

  updateProfile: async (profileData) =>
    request({
      method: "put",
      url: "/auth/profile",
      data: profileData,
    }),

  changePassword: async (passwordData) =>
    request({
      method: "post",
      url: "/auth/change-password",
      data: passwordData,
    }),

  createAdmin: async (adminData) =>
    request({
      method: "post",
      url: "/auth/admin/create",
      data: adminData,
    }),
};

// ==============================
// SECTION 3: HOME PAGE ENDPOINTS
// ==============================
export const homeAPI = {
  getHomeData: async () =>
    request({
      method: "get",
      url: "/home",
    }),

  getStats: async () =>
    request({
      method: "get",
      url: "/stats",
    }),
};

// ==============================
// SECTION 4: SHOP/PRODUCTS ENDPOINTS
// ==============================
export const shopAPI = {
  getProducts: async (params = {}) =>
    request({
      method: "get",
      url: "/shop/products",
      params,
    }),

  getProductById: async (id) =>
    request({
      method: "get",
      url: `/shop/products/${id}`,
    }),

  getCategories: async () =>
    request({
      method: "get",
      url: "/shop/categories",
    }),

  searchProducts: async (query) =>
    request({
      method: "get",
      url: "/shop/search",
      params: {
        q: query,
      },
    }),
};

// ==============================
// SECTION 5: SHOPPING CART ENDPOINTS
// ==============================
export const cartAPI = {
  getCart: async () =>
    request({
      method: "get",
      url: "/cart",
    }),

  getCartCount: async () =>
    request({
      method: "get",
      url: "/cart/count",
    }),

  addToCart: async (productId, quantity = 1, variant = null) =>
    request({
      method: "post",
      url: "/cart/add",
      data: {
        productId,
        quantity,
        variant,
      },
    }),

  updateCartItem: async (itemId, quantity) =>
    request({
      method: "put",
      url: `/cart/items/${itemId}`,
      data: {
        quantity,
      },
    }),

  removeCartItem: async (itemId) =>
    request({
      method: "delete",
      url: `/cart/items/${itemId}`,
    }),

  clearCart: async () =>
    request({
      method: "delete",
      url: "/cart/clear",
    }),
};

// ==============================
// SECTION 6: CHECKOUT ENDPOINTS
// ==============================
export const checkoutAPI = {
  processCheckout: async (checkoutData) =>
    request({
      method: "post",
      url: "/checkout",
      data: checkoutData,
    }),

  validateCoupon: async (code) =>
    request({
      method: "post",
      url: "/checkout/validate-coupon",
      data: {
        code,
      },
    }),

  calculateShipping: async (shippingData) =>
    request({
      method: "post",
      url: "/checkout/calculate-shipping",
      data: shippingData,
    }),
};

// ==============================
// SECTION 7: USER ORDERS ENDPOINTS
// ==============================
export const orderAPI = {
  getMyOrders: async (params = {}) =>
    request({
      method: "get",
      url: "/orders",
      params,
    }),

  getOrderById: async (id) =>
    request({
      method: "get",
      url: `/orders/${id}`,
    }),

  cancelOrder: async (id, reason = "") =>
    request({
      method: "post",
      url: `/orders/${id}/cancel`,
      data: {
        reason,
      },
    }),

  trackOrder: async (id) =>
    request({
      method: "get",
      url: `/orders/${id}/track`,
    }),
};

// ==============================
// SECTION 8: WISHLIST ENDPOINTS
// ==============================
export const wishlistAPI = {
  getWishlist: async () =>
    request({
      method: "get",
      url: "/wishlist",
    }),

  addToWishlist: async (productId) =>
    request({
      method: "post",
      url: "/wishlist/add",
      data: {
        productId,
      },
    }),

  removeFromWishlist: async (productId) =>
    request({
      method: "delete",
      url: `/wishlist/${productId}`,
    }),

  clearWishlist: async () =>
    request({
      method: "delete",
      url: "/wishlist",
    }),

  moveToCart: async (productId) =>
    request({
      method: "post",
      url: `/wishlist/${productId}/move-to-cart`,
    }),
};

// ==============================
// SECTION 9: REVIEWS ENDPOINTS
// ==============================
export const reviewAPI = {
  getProductReviews: async (productId, params = {}) =>
    request({
      method: "get",
      url: `/reviews/product/${productId}`,
      params,
    }),

  getMyReviews: async () =>
    request({
      method: "get",
      url: "/reviews/my-reviews",
    }),

  createReview: async (reviewData) =>
    request({
      method: "post",
      url: "/reviews",
      data: reviewData,
    }),

  updateReview: async (id, reviewData) =>
    request({
      method: "put",
      url: `/reviews/${id}`,
      data: reviewData,
    }),

  deleteReview: async (id) =>
    request({
      method: "delete",
      url: `/reviews/${id}`,
    }),
};

// ==============================
// SECTION 10: USER PROFILE ENDPOINTS
// ==============================
export const profileAPI = {
  getProfile: async () =>
    request({
      method: "get",
      url: "/profile",
    }),

  updateProfile: async (profileData) =>
    request({
      method: "put",
      url: "/profile",
      data: profileData,
    }),

  changePassword: async (passwordData) =>
    request({
      method: "post",
      url: "/profile/change-password",
      data: passwordData,
    }),

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);

    return request({
      method: "post",
      url: "/profile/avatar",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  addAddress: async (addressData) =>
    request({
      method: "post",
      url: "/profile/addresses",
      data: addressData,
    }),

  updateAddress: async (addressId, addressData) =>
    request({
      method: "put",
      url: `/profile/addresses/${addressId}`,
      data: addressData,
    }),

  deleteAddress: async (addressId) =>
    request({
      method: "delete",
      url: `/profile/addresses/${addressId}`,
    }),

  setDefaultAddress: async (addressId) =>
    request({
      method: "post",
      url: `/profile/addresses/${addressId}/default`,
    }),
};

// ==============================
// SECTION 11: INSTAGRAM REELS API
// Public route: /api/reels
// Admin route:  /api/admin/reels
// ==============================
export const reelsAPI = {
  getPublic: (limit = 5) => 
    apiClient.get(`/reels?limit=${limit}`),
  
  getAdmin: () => 
    apiClient.get('/admin/reels'),
  
  create: (data) => 
    apiClient.post('/admin/reels', data),
  
  update: (id, data) => 
    apiClient.put(`/admin/reels/${id}`, data),
  
  remove: (id) => 
    apiClient.delete(`/admin/reels/${id}`),
  
  toggle: (id) => 
    apiClient.patch(`/admin/reels/${id}/toggle`)
};

// ==============================
// SECTION 12-20: ADMIN ENDPOINTS
// ==============================
export const adminAPI = {
  // ==============================
  // ADMIN DASHBOARD
  // ==============================
  dashboard: {
    getStats: async () =>
      request({
        method: "get",
        url: "/admin/dashboard/stats",
      }),

    getRecentActivity: async () =>
      request({
        method: "get",
        url: "/admin/dashboard/recent-activity",
      }),
  },

  // ==============================
  // ADMIN PRODUCTS
  // ==============================
  products: {
    getAll: async (params = {}) =>
      request({
        method: "get",
        url: "/admin/products",
        params,
      }),

    getById: async (id) =>
      request({
        method: "get",
        url: `/admin/products/${id}`,
      }),

    create: async (productData) =>
      request({
        method: "post",
        url: "/admin/products",
        data: productData,
      }),

    update: async (id, productData) =>
      request({
        method: "put",
        url: `/admin/products/${id}`,
        data: productData,
      }),

    delete: async (id) =>
      request({
        method: "delete",
        url: `/admin/products/${id}`,
      }),

    deleteImage: async (productId, imageId) =>
      request({
        method: "delete",
        url: `/admin/products/${productId}/images/${imageId}`,
      }),

    bulkUpdateStatus: async (statusData) =>
      request({
        method: "post",
        url: "/admin/products/bulk/status",
        data: statusData,
      }),

    bulkUpload: async (file) => {
      const formData = new FormData();
      formData.append("excelFile", file);

      return request({
        method: "post",
        url: "/admin/products/bulk/upload",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },

    getSampleExcel: () => {
      return `${API_BASE_URL}/admin/products/bulk/sample`;
    },

    getUploadHistory: async () =>
      request({
        method: "get",
        url: "/admin/products/bulk/history",
      }),
  },

  // ==============================
  // ADMIN INVENTORY
  // ==============================
  inventory: {
    getOverview: async () =>
      request({
        method: "get",
        url: "/admin/inventory/overview",
      }),

    getList: async (params = {}) =>
      request({
        method: "get",
        url: "/admin/inventory/list",
        params,
      }),

    updateStock: async (productId, stockData) =>
      request({
        method: "put",
        url: `/admin/inventory/${productId}/stock`,
        data: stockData,
      }),

    bulkUpdate: async (bulkData) =>
      request({
        method: "post",
        url: "/admin/inventory/bulk-update",
        data: bulkData,
      }),

    getAlerts: async () =>
      request({
        method: "get",
        url: "/admin/inventory/alerts",
      }),

    getHistory: async (productId) =>
      request({
        method: "get",
        url: `/admin/inventory/${productId}/history`,
      }),
  },

  // ==============================
  // ADMIN ORDERS
  // ==============================
  orders: {
    getAll: async (params = {}) =>
      request({
        method: "get",
        url: "/admin/orders",
        params,
      }),

    getStats: async () =>
      request({
        method: "get",
        url: "/admin/orders/stats",
      }),

    getById: async (id) =>
      request({
        method: "get",
        url: `/admin/orders/${id}`,
      }),

    updateStatus: async (id, status, notes = "") =>
      request({
        method: "put",
        url: `/admin/orders/${id}/status`,
        data: {
          status,
          notes,
        },
      }),

    updatePaymentStatus: async (id, paymentStatus) =>
      request({
        method: "put",
        url: `/admin/orders/${id}/payment-status`,
        data: {
          paymentStatus,
        },
      }),

    cancel: async (id, reason = "") =>
      request({
        method: "post",
        url: `/admin/orders/${id}/cancel`,
        data: {
          reason,
        },
      }),

    getInvoice: async (id) =>
      request({
        method: "get",
        url: `/admin/orders/${id}/invoice`,
      }),

    sendUpdate: async (id, updateData) =>
      request({
        method: "post",
        url: `/admin/orders/${id}/send-update`,
        data: updateData,
      }),
  },

  // ==============================
  // ADMIN USERS
  // ==============================
  users: {
    getAll: async (params = {}) =>
      request({
        method: "get",
        url: "/admin/users",
        params,
      }),

    getStats: async () =>
      request({
        method: "get",
        url: "/admin/users/stats",
      }),

    search: async (query) =>
      request({
        method: "get",
        url: "/admin/users/search",
        params: {
          q: query,
        },
      }),

    getById: async (id) =>
      request({
        method: "get",
        url: `/admin/users/${id}`,
      }),

    getUserOrders: async (id) =>
      request({
        method: "get",
        url: `/admin/users/${id}/orders`,
      }),

    updateStatus: async (id, status) =>
      request({
        method: "put",
        url: `/admin/users/${id}/status`,
        data: {
          status,
        },
      }),

    updateRole: async (id, role) =>
      request({
        method: "put",
        url: `/admin/users/${id}/role`,
        data: {
          role,
        },
      }),

    delete: async (id) =>
      request({
        method: "delete",
        url: `/admin/users/${id}`,
      }),
  },

  // ==============================
  // ADMIN CATEGORIES
  // ==============================
  categories: {
    getAll: async () =>
      request({
        method: "get",
        url: "/admin/categories",
      }),

    getTree: async () =>
      request({
        method: "get",
        url: "/admin/categories/tree",
      }),

    getById: async (id) =>
      request({
        method: "get",
        url: `/admin/categories/${id}`,
      }),

    create: async (categoryData) =>
      request({
        method: "post",
        url: "/admin/categories",
        data: categoryData,
      }),

    update: async (id, categoryData) =>
      request({
        method: "put",
        url: `/admin/categories/${id}`,
        data: categoryData,
      }),

    delete: async (id) =>
      request({
        method: "delete",
        url: `/admin/categories/${id}`,
      }),

    updateOrder: async (orderData) =>
      request({
        method: "post",
        url: "/admin/categories/update-order",
        data: orderData,
      }),
  },

  // ==============================
  // ADMIN BANNERS
  // ==============================
  banners: {
    getAll: async () =>
      request({
        method: "get",
        url: "/admin/banners",
      }),

    getById: async (id) =>
      request({
        method: "get",
        url: `/admin/banners/${id}`,
      }),

    create: async (bannerData) =>
      request({
        method: "post",
        url: "/admin/banners",
        data: bannerData,
      }),

    update: async (id, bannerData) =>
      request({
        method: "put",
        url: `/admin/banners/${id}`,
        data: bannerData,
      }),

    delete: async (id) =>
      request({
        method: "delete",
        url: `/admin/banners/${id}`,
      }),

    getHeroBanners: async () =>
      request({
        method: "get",
        url: "/admin/banners/hero",
      }),

    getHeroById: async (id) =>
      request({
        method: "get",
        url: `/admin/banners/hero/${id}`,
      }),

    createHero: async (heroData) =>
      request({
        method: "post",
        url: "/admin/banners/hero",
        data: heroData,
      }),

    updateHero: async (id, heroData) =>
      request({
        method: "put",
        url: `/admin/banners/hero/${id}`,
        data: heroData,
      }),

    deleteHero: async (id) =>
      request({
        method: "delete",
        url: `/admin/banners/hero/${id}`,
      }),

    updateOrder: async (orderData) =>
      request({
        method: "post",
        url: "/admin/banners/update-order",
        data: orderData,
      }),
  },

  // ==============================
  // ADMIN COUPONS
  // ==============================
  coupons: {
    getAll: async (params = {}) =>
      request({
        method: "get",
        url: "/admin/coupons",
        params,
      }),

    getStats: async () =>
      request({
        method: "get",
        url: "/admin/coupons/stats",
      }),

    getById: async (id) =>
      request({
        method: "get",
        url: `/admin/coupons/${id}`,
      }),

    create: async (couponData) =>
      request({
        method: "post",
        url: "/admin/coupons",
        data: couponData,
      }),

    update: async (id, couponData) =>
      request({
        method: "put",
        url: `/admin/coupons/${id}`,
        data: couponData,
      }),

    delete: async (id) =>
      request({
        method: "delete",
        url: `/admin/coupons/${id}`,
      }),

    validate: async (code, orderData = {}) =>
      request({
        method: "post",
        url: "/admin/coupons/validate",
        data: {
          code,
          ...orderData,
        },
      }),
  },

  // ==============================
  // ADMIN INSTAGRAM REELS
  // Backend route: /api/admin/reels
  // ==============================
  reels: {
    getAll: async () =>
      request({
        method: "get",
        url: "/admin/reels",
      }),

    create: async (reelData) =>
      request({
        method: "post",
        url: "/admin/reels",
        data: reelData,
      }),

    update: async (id, reelData) =>
      request({
        method: "put",
        url: `/admin/reels/${id}`,
        data: reelData,
      }),

    toggle: async (id) =>
      request({
        method: "patch",
        url: `/admin/reels/${id}/toggle`,
      }),

    delete: async (id) =>
      request({
        method: "delete",
        url: `/admin/reels/${id}`,
      }),

    remove: async (id) =>
      request({
        method: "delete",
        url: `/admin/reels/${id}`,
      }),
  },

  // ==============================
  // ADMIN SETTINGS
  // ==============================
  settings: {
    getAll: async () =>
      request({
        method: "get",
        url: "/admin/settings",
      }),

    updateGeneral: async (generalData) =>
      request({
        method: "put",
        url: "/admin/settings/general",
        data: generalData,
      }),

    updateSocial: async (socialData) =>
      request({
        method: "put",
        url: "/admin/settings/social",
        data: socialData,
      }),

    updateEmail: async (emailData) =>
      request({
        method: "put",
        url: "/admin/settings/email",
        data: emailData,
      }),

    updatePayment: async (paymentData) =>
      request({
        method: "put",
        url: "/admin/settings/payment",
        data: paymentData,
      }),

    updateInventory: async (inventoryData) =>
      request({
        method: "put",
        url: "/admin/settings/inventory",
        data: inventoryData,
      }),

    testEmail: async (testData) =>
      request({
        method: "post",
        url: "/admin/settings/email/test",
        data: testData,
      }),

    resetSection: async (section) =>
      request({
        method: "post",
        url: "/admin/settings/reset",
        data: {
          section,
        },
      }),

    exportSettings: async () =>
      request({
        method: "get",
        url: "/admin/settings/export",
      }),

    importSettings: async (settingsData) =>
      request({
        method: "post",
        url: "/admin/settings/import",
        data: settingsData,
      }),
  },
};

// ==============================
// LEGACY COMPATIBILITY
// ==============================
export const ProductService = {
  getAll: async (params) => {
    const data = await shopAPI.getProducts(params);

    return {
      data: {
        success: true,
        products: data.products || data,
      },
    };
  },

  getById: async (id) => {
    const data = await shopAPI.getProductById(id);

    return {
      data: {
        success: true,
        product: data.product || data,
      },
    };
  },
};

export const OrderService = {
  create: async (orderData) => {
    const data = await checkoutAPI.processCheckout(orderData);

    return {
      data: {
        success: true,
        orderId: data.orderId || data.id,
      },
    };
  },
};

// ✅ ONLY ONE DEFAULT EXPORT
export default apiClient;