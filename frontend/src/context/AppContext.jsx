import { createContext, useState, useContext, useEffect } from 'react';
import { mockProducts } from '../data/products';
import { mockCategories } from '../data/categories';
import { mockUsers } from '../data/users';
import { mockOrders } from '../data/orders';
import { mockReviews } from '../data/reviews';
import { mockCoupons } from '../data/coupons';
import { mockNotifications } from '../data/notifications';

import {
  authAPI,
  healthAPI,
  homeAPI,
  shopAPI,
  cartAPI,
  orderAPI,
  wishlistAPI,
  reviewAPI,
  profileAPI,
  adminAPI,
  reelsAPI
} from '../services/api';

import toast from 'react-hot-toast';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

// ==============================
// Helpers
// ==============================
const safeJsonParse = (value, fallback = null) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const getErrorMessage = (error, fallback = 'Something went wrong') => {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  if (error?.data?.message) return error.data.message;
  if (typeof error === 'object' && error.message) return error.message;
  return fallback;
};

const mapBackendProduct = (p, fallbackProduct = {}) => {
  const product = p?.data || p;

  return {
    id: product?._id || product?.id || fallbackProduct?.id || `PROD-${Date.now()}`,
    _id: product?._id || product?.id,
    name: product?.name || fallbackProduct?.name || 'Unnamed Product',
    description: product?.description || fallbackProduct?.description || '',
    price: Number(product?.price ?? fallbackProduct?.price ?? 0),
    salePrice: product?.salePrice ?? fallbackProduct?.salePrice ?? null,
    oldPrice: product?.oldPrice ?? fallbackProduct?.oldPrice ?? null,
    stock: product?.inventory?.quantity ?? product?.stock ?? fallbackProduct?.stock ?? 10,
    image:
      product?.images?.[0]?.url ||
      product?.image ||
      fallbackProduct?.image ||
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop',
    images:
      product?.images?.map((img) => img.url || img).filter(Boolean) ||
      fallbackProduct?.images ||
      [],
    category:
      product?.category?.name ||
      product?.category ||
      fallbackProduct?.category ||
      'General',
    categoryId: product?.category?._id || product?.category?.id || null,
    sku: product?.sku || fallbackProduct?.sku || 'SKU-GEN',
    brand: product?.brand || fallbackProduct?.brand || 'Luxe Atelier',
    rating: product?.rating?.average ?? product?.rating ?? fallbackProduct?.rating ?? 5.0,
    reviewsCount:
      product?.rating?.count ??
      product?.reviewsCount ??
      fallbackProduct?.reviewsCount ??
      0,
    tags: Array.isArray(product?.tags)
      ? product.tags
      : Array.isArray(fallbackProduct?.tags)
        ? fallbackProduct.tags
        : [],
    isFeatured: product?.isFeatured ?? fallbackProduct?.isFeatured ?? false,
    isActive:
      product?.isActive !== undefined
        ? product.isActive
        : fallbackProduct?.isActive !== undefined
          ? fallbackProduct.isActive
          : true,
    createdAt: product?.createdAt || new Date().toISOString()
  };
};

const normalizeCartProduct = (product = {}) => {
  const raw = product?.product || product?.data || product;

  const id = raw?._id || raw?.id || raw?.productId;

  if (!id) return null;

  const image =
    raw?.image ||
    raw?.thumbnail ||
    raw?.thumbnailUrl ||
    raw?.images?.[0]?.url ||
    raw?.images?.[0] ||
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop';

  const images = Array.isArray(raw?.images)
    ? raw.images.map((img) => img?.url || img).filter(Boolean)
    : image
      ? [image]
      : [];

  const category =
    typeof raw?.category === 'object'
      ? raw.category?.name || 'General'
      : raw?.category || 'General';

  return {
    ...raw,
    id,
    _id: raw?._id || id,
    name: raw?.name || 'Product',
    slug: raw?.slug || id,
    description: raw?.description || '',
    price: Number(raw?.salePrice ?? raw?.price ?? 0),
    salePrice: raw?.salePrice ?? null,
    oldPrice: raw?.oldPrice ?? raw?.compareAtPrice ?? null,
    image,
    images,
    category,
    brand: raw?.brand || 'Luxe Atelier',
    stock: raw?.inventory?.quantity ?? raw?.stock ?? 10,
    quantity: Number(raw?.quantity) || 1,
  };
};

const extractProductsFromResponse = (response) => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.products)) return response.products;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.data?.products)) return response.data.products;
  if (Array.isArray(response.data?.data?.products)) return response.data.data.products;
  return [];
};

const extractCategoriesFromResponse = (response) => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.categories)) return response.categories;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.data?.categories)) return response.data.categories;
  if (Array.isArray(response.data?.data?.categories)) return response.data.data.categories;
  return [];
};

// ==============================
// Default Site Settings
// ==============================
const DEFAULT_SITE_SETTINGS = {
  heroTitle: 'Modern Luxury Fashion',
  heroSubtitle: 'NEW SEASON 2026',
  heroDescription: 'Premium outfits designed for modern lifestyle aesthetics.',
  heroImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop',
  slide2Title: 'Hand-Burnished Italian Leather',
  slide2Subtitle: 'MASTER CRAFTSMANSHIP',
  slide2Description: 'Florence-inspired full-grain leather jackets, custom brass zippers, and bespoke tailored fits.',
  slide2Image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop',
  slide2Category: 'Men',
  slide3Title: 'Mulberry Silk Couture',
  slide3Subtitle: 'SEASONAL EDIT',
  slide3Description: 'Flowing silhouettes, bias-cut skirts, and cowl necklines crafted from organic premium mulberry silks.',
  slide3Image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop',
  slide3Category: 'Women',
  contactPhone: '+91 98765 43210',
  contactEmail: 'concierge@luxestore.com',
  address: '',
  instagram: 'https://instagram.com/luxe_atelier',
  whatsapp: 'https://wa.me/919876543210',
  facebook: '',
  twitter: '',
  currency: 'INR (₹)',
  freeDeliveryThreshold: '999',
  copyright: 'Luxe Store India Ltd. All Rights Reserved.',
  terms: '',
  privacy: '',
  returnPolicy: ''
};

export const AppProvider = ({ children }) => {
  // ==============================
  // Database States
  // ==============================
  const [products, setProducts] = useState(() => {
    try {
      const s = localStorage.getItem('luxe_products');
      if (s) return JSON.parse(s);
    } catch {}
    return mockProducts || [];
  });

  const [categories, setCategories] = useState(() => {
    try {
      const s = localStorage.getItem('luxe_categories');
      if (s) return JSON.parse(s);
    } catch {}
    return mockCategories || [];
  });

  const [users, setUsers] = useState(() => {
    try {
      const s = localStorage.getItem('luxe_users');
      if (s) return JSON.parse(s);
    } catch {}
    return mockUsers || [];
  });

  const [orders, setOrders] = useState(() => {
    try {
      const s = localStorage.getItem('luxe_orders');
      if (s) return JSON.parse(s);
    } catch {}
    return mockOrders || [];
  });

  const [reviews, setReviews] = useState(mockReviews || []);
  const [coupons, setCoupons] = useState(mockCoupons || []);
  const [notifications, setNotifications] = useState(mockNotifications || []);

  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ==============================
  // Auth States
  // ==============================
  const [currentUser, setCurrentUser] = useState(() =>
    safeJsonParse(localStorage.getItem('luxe_user'), null)
  );

  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    !!localStorage.getItem('luxe_token')
  );

  // ==============================
  // Cart / Wishlist States
  // ==============================
  const [cart, setCart] = useState(() => {
    try {
      const s = localStorage.getItem('luxe_cart');
      if (s) return JSON.parse(s);
    } catch {}
    return [];
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const s = localStorage.getItem('luxe_wishlist');
      if (s) return JSON.parse(s);
    } catch {}
    return [];
  });

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  // ==============================
  // Site Settings & Reels
  // ==============================
  const [siteSettings, setSiteSettings] = useState(() => {
    try {
      const s = localStorage.getItem('luxe_site_settings');
      if (s) return { ...DEFAULT_SITE_SETTINGS, ...JSON.parse(s) };
    } catch {}
    return DEFAULT_SITE_SETTINGS;
  });

  const [recentSearches, setRecentSearches] = useState(['Cashmere', 'Trench Coat']);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [homeData, setHomeData] = useState(null);

  // ✅ NEW: Reels State
  const [reels, setReels] = useState(() => {
    try {
      const s = localStorage.getItem('luxe_reels');
      if (s) return JSON.parse(s);
    } catch {}
    return [];
  });

  // ==============================
  // Auto-save
  // ==============================
  useEffect(() => {
    try {
      localStorage.setItem('luxe_products', JSON.stringify(products));
    } catch {}
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('luxe_categories', JSON.stringify(categories));
    } catch {}
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem('luxe_users', JSON.stringify(users));
    } catch {}
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem('luxe_orders', JSON.stringify(orders));
    } catch {}
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('luxe_cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('luxe_wishlist', JSON.stringify(wishlist));
    } catch {}
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem('luxe_site_settings', JSON.stringify(siteSettings));
    } catch {}
  }, [siteSettings]);

  // ✅ NEW: Auto-save reels
  useEffect(() => {
    try {
      localStorage.setItem('luxe_reels', JSON.stringify(reels));
    } catch {}
  }, [reels]);

  useEffect(() => {
    const count = cart.reduce(
      (sum, item) => sum + (Number(item.quantity) || 1),
      0
    );

    setCartCount(count);
  }, [cart]);

  // ==============================
  // User State Helper
  // ==============================
  const updateUserState = (userData) => {
    if (!userData) return;
    setCurrentUser(userData);
    localStorage.setItem('luxe_user', JSON.stringify(userData));
  };

  // ==============================
  // Backend Health
  // ==============================
  const checkBackendHealth = async () => {
    try {
      const response = await healthAPI.checkHealth();

      const isOnline =
        response?.status?.toLowerCase?.() === 'ok' ||
        response?.success === true;

      if (isOnline) {
        setIsBackendConnected(true);
        return true;
      }

      setIsBackendConnected(false);
      return false;
    } catch {
      setIsBackendConnected(false);
      return false;
    }
  };

  useEffect(() => {
    checkBackendHealth();
  }, []);

  useEffect(() => {
    if (isAuthenticated && currentUser) setIsBackendConnected(true);
  }, [isAuthenticated, currentUser]);

  // ==============================
  // Products Refresh
  // ==============================
  const refreshProducts = async () => {
    try {
      if (!isBackendConnected) return products;

      const prodData = await shopAPI.getProducts();
      const rawProducts = extractProductsFromResponse(prodData);

      if (rawProducts.length > 0) {
        const mapped = rawProducts.map((p) => mapBackendProduct(p));
        setProducts(mapped);
        return mapped;
      }

      return products;
    } catch {
      return products;
    }
  };

  const refreshCategories = async () => {
    try {
      if (!isBackendConnected) return categories;

      const catData = await shopAPI.getCategories();
      const raw = extractCategoriesFromResponse(catData);

      if (raw.length > 0) {
        const mapped = raw.map((c) => ({
          id: c._id || c.id,
          _id: c._id || c.id,
          name: c.name,
          slug: c.slug,
          description: c.description || '',
          image: c.image || '',
          isActive: c.isActive !== undefined ? c.isActive : true
        }));

        setCategories(mapped);
        return mapped;
      }

      return categories;
    } catch {
      return categories;
    }
  };

  // ✅ NEW: Refresh Reels
  const refreshReels = async (limit = 10) => {
    try {
      if (!isBackendConnected) return reels;

      const response = await reelsAPI.getPublic(limit);
      const fetchedReels = response?.data?.reels || response?.reels || [];

      if (fetchedReels.length > 0) {
        setReels(fetchedReels);
        return fetchedReels;
      }

      return reels;
    } catch {
      return reels;
    }
  };

  const syncBackendData = async () => {
    try {
      if (!isBackendConnected) return;

      setIsLoading(true);

      try {
        const home = await homeAPI.getHomeData();
        setHomeData(home);
      } catch {}

      await refreshProducts();
      await refreshCategories();
      await refreshReels(); // ✅ NEW

      if (isAuthenticated) await fetchUserData();
    } catch {} finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isBackendConnected) syncBackendData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBackendConnected, isAuthenticated]);

  // ==============================
  // Profile Management
  // ==============================
  const getUserProfile = async () => {
    try {
      if (isBackendConnected && isAuthenticated) {
        const response = await profileAPI.getProfile();
        const userData =
          response?.data?.user ||
          response?.data ||
          response?.user ||
          null;

        if (response?.success && userData) {
          updateUserState(userData);
          return userData;
        }
      }

      return currentUser;
    } catch {
      return currentUser;
    }
  };

  const updateUserProfile = async (profileData) => {
    try {
      setIsLoading(true);

      if (isBackendConnected && isAuthenticated) {
        const response = await profileAPI.updateProfile(profileData);
        const userData =
          response?.data?.user ||
          response?.data ||
          response?.user ||
          null;

        if (response?.success && userData) {
          updateUserState(userData);
          toast.success('Profile updated!');
          return userData;
        }
      }

      const updatedUser = { ...currentUser, ...profileData };
      updateUserState(updatedUser);
      toast.success('Profile updated!');
      return updatedUser;
    } catch (error) {
      toast.error(getErrorMessage(error));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const changeUserPassword = async (passwordData) => {
    try {
      setIsLoading(true);

      if (isBackendConnected && isAuthenticated) {
        const r = await authAPI.changePassword(passwordData);

        if (r?.success) {
          toast.success('Password changed!');
          return r;
        }
      }

      toast.success('Password changed!');
      return { success: true };
    } catch (error) {
      toast.error(getErrorMessage(error));
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const uploadUserAvatar = async (file) => {
    try {
      setIsLoading(true);

      if (isBackendConnected && isAuthenticated) {
        const response = await profileAPI.uploadAvatar(file);

        if (response?.success && response?.data) {
          updateUserState({
            ...currentUser,
            avatar: response.data.avatar
          });

          toast.success('Avatar updated!');
          return response;
        }
      }

      const avatarUrl = URL.createObjectURL(file);

      updateUserState({
        ...currentUser,
        avatar: avatarUrl
      });

      toast.success('Avatar updated!');

      return {
        success: true,
        data: { avatar: avatarUrl }
      };
    } catch (error) {
      toast.error(getErrorMessage(error));
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  // ==============================
  // Address Management
  // ==============================
  const addAddress = async (addressData) => {
    try {
      setIsLoading(true);

      if (isBackendConnected && isAuthenticated) {
        const r = await profileAPI.addAddress(addressData);

        if (r?.success && r?.data) {
          updateUserState(r.data);
          return r;
        }
      }

      const newAddr = {
        _id: Date.now().toString(),
        ...addressData,
        createdAt: new Date()
      };

      let addrs = [...(currentUser?.address || []), newAddr];

      if (addressData.isDefault) {
        addrs = addrs.map((a, i) => ({
          ...a,
          isDefault: i === addrs.length - 1
        }));
      }

      updateUserState({
        ...currentUser,
        address: addrs
      });

      return {
        success: true,
        data: {
          ...currentUser,
          address: addrs
        }
      };
    } catch (error) {
      toast.error(getErrorMessage(error));
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const updateAddress = async (addressId, addressData) => {
    try {
      setIsLoading(true);

      if (isBackendConnected && isAuthenticated) {
        const r = await profileAPI.updateAddress(addressId, addressData);

        if (r?.success && r?.data) {
          updateUserState(r.data);
          return r;
        }
      }

      let addrs =
        currentUser?.address?.map((a) =>
          a._id === addressId ? { ...a, ...addressData } : a
        ) || [];

      if (addressData.isDefault) {
        addrs = addrs.map((a) => ({
          ...a,
          isDefault: a._id === addressId
        }));
      }

      updateUserState({
        ...currentUser,
        address: addrs
      });

      return {
        success: true,
        data: {
          ...currentUser,
          address: addrs
        }
      };
    } catch (error) {
      toast.error(getErrorMessage(error));
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAddress = async (addressId) => {
    try {
      setIsLoading(true);

      if (isBackendConnected && isAuthenticated) {
        const r = await profileAPI.deleteAddress(addressId);

        if (r?.success && r?.data) {
          updateUserState(r.data);
          return r;
        }
      }

      const toDelete = currentUser?.address?.find((a) => a._id === addressId);

      let addrs =
        currentUser?.address?.filter((a) => a._id !== addressId) || [];

      if (toDelete?.isDefault && addrs.length > 0) {
        addrs[0] = {
          ...addrs[0],
          isDefault: true
        };
      }

      updateUserState({
        ...currentUser,
        address: addrs
      });

      return {
        success: true,
        data: {
          ...currentUser,
          address: addrs
        }
      };
    } catch (error) {
      toast.error(getErrorMessage(error));
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const setDefaultAddress = async (addressId) => {
    try {
      setIsLoading(true);

      if (isBackendConnected && isAuthenticated) {
        const r = await profileAPI.setDefaultAddress(addressId);

        if (r?.success && r?.data) {
          updateUserState(r.data);
          return r;
        }
      }

      const addrs =
        currentUser?.address?.map((a) => ({
          ...a,
          isDefault: a._id === addressId
        })) || [];

      updateUserState({
        ...currentUser,
        address: addrs
      });

      return {
        success: true,
        data: {
          ...currentUser,
          address: addrs
        }
      };
    } catch (error) {
      toast.error(getErrorMessage(error));
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  // ==============================
  // Admin Product Actions
  // ==============================
  const addProduct = async (productData) => {
    try {
      setIsLoading(true);

      if (!isBackendConnected) {
        const localProduct = {
          id: `PROD-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          ...productData,
          rating: 5.0,
          reviewsCount: 0,
          isActive: true,
          image:
            productData.image ||
            'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600'
        };

        setProducts((prev) => [localProduct, ...prev]);
        toast.success('Product added!');

        return {
          success: true,
          data: localProduct,
          offline: true
        };
      }

      const matched = categories.find(
        (c) =>
          c.name?.toLowerCase?.() === productData.category?.toLowerCase?.()
      );

      const catId = matched?._id || matched?.id || null;
      const isValid = (id) => /^[0-9a-fA-F]{24}$/.test(String(id || ''));
      const finalCat = isValid(catId)
        ? catId
        : productData.category || 'General';

      const tags = Array.isArray(productData.tags)
        ? productData.tags
        : typeof productData.tags === 'string'
          ? productData.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : ['new'];

      const payload = {
        name: productData.name?.trim() || 'New Product',
        description: productData.description?.trim() || 'Premium item.',
        price: Number(productData.price) || 0,
        salePrice: productData.oldPrice ? Number(productData.oldPrice) : null,
        category: finalCat,
        inventory: {
          quantity: Number(productData.stock) || 10,
          lowStockThreshold: 5
        },
        images: productData.image
          ? [
              {
                url: productData.image,
                alt: productData.name,
                isPrimary: true
              }
            ]
          : [],
        tags,
        isFeatured: Boolean(productData.isFeatured)
      };

      const response = await adminAPI.products.create(payload);

      if (!response?.success) throw response;

      const created = response?.data?.product || response?.data || response;

      const newProd = mapBackendProduct(created, {
        ...productData,
        category: productData.category
      });

      setProducts((prev) => [newProd, ...prev]);
      toast.success('Product added!');

      return {
        success: true,
        data: newProd
      };
    } catch (error) {
      const msg = getErrorMessage(error, 'Failed to add product');
      toast.error(msg);

      return {
        success: false,
        message: msg
      };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (productId) => {
    try {
      setIsLoading(true);

      if (isBackendConnected) {
        try {
          await adminAPI.products.delete(productId);
        } catch {}
      }

      setProducts((prev) =>
        prev.filter((p) => p.id !== productId && p._id !== productId)
      );

      toast.success('Product deleted');
      return { success: true };
    } catch (error) {
      toast.error(getErrorMessage(error));
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const updateProduct = async (productId, updateData) => {
    try {
      setIsLoading(true);

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId || p._id === productId
            ? { ...p, ...updateData }
            : p
        )
      );

      if (isBackendConnected) {
        try {
          await adminAPI.products.update(productId, updateData);
        } catch {}
      }

      return { success: true };
    } catch {
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  // ==============================
  // ✅ NEW: Admin Reels Management
  // ==============================
  const getPublicReels = async (limit = 10) => {
    try {
      setIsLoading(true);

      const response = await reelsAPI.getPublic(limit);
      const fetchedReels = response?.data?.reels || response?.reels || [];

      if (fetchedReels.length > 0) {
        setReels(fetchedReels);
        return {
          success: true,
          data: fetchedReels
        };
      }

      return {
        success: true,
        data: reels
      };
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to fetch reels'));
      return {
        success: false,
        data: reels
      };
    } finally {
      setIsLoading(false);
    }
  };

  const getAdminReels = async () => {
    try {
      setIsLoading(true);

      if (!isBackendConnected || !isAuthenticated) {
        return {
          success: true,
          data: reels
        };
      }

      const response = await reelsAPI.getAdmin();
      const fetchedReels = response?.data?.reels || response?.reels || [];

      if (fetchedReels.length > 0) {
        setReels(fetchedReels);
        return {
          success: true,
          data: fetchedReels
        };
      }

      return {
        success: true,
        data: reels
      };
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to fetch admin reels'));
      return {
        success: false,
        data: reels
      };
    } finally {
      setIsLoading(false);
    }
  };

  const addReel = async (reelData) => {
    try {
      setIsLoading(true);

      if (!isBackendConnected || !isAuthenticated) {
        const localReel = {
          _id: `REEL-${Date.now()}`,
          ...reelData,
          isActive: true,
          createdAt: new Date().toISOString()
        };

        setReels((prev) => [localReel, ...prev]);
        toast.success('Reel added locally!');

        return {
          success: true,
          data: localReel,
          offline: true
        };
      }

      const response = await reelsAPI.create(reelData);

      if (!response?.success) throw response;

      const newReel = response?.data?.reel || response?.data || response;

      setReels((prev) => [newReel, ...prev]);
      toast.success('Reel added successfully!');

      return {
        success: true,
        data: newReel
      };
    } catch (error) {
      const msg = getErrorMessage(error, 'Failed to add reel');
      toast.error(msg);

      return {
        success: false,
        message: msg
      };
    } finally {
      setIsLoading(false);
    }
  };

  const updateReel = async (reelId, reelData) => {
    try {
      setIsLoading(true);

      setReels((prev) =>
        prev.map((r) =>
          r._id === reelId || r.id === reelId
            ? { ...r, ...reelData }
            : r
        )
      );

      if (isBackendConnected && isAuthenticated) {
        try {
          await reelsAPI.update(reelId, reelData);
          toast.success('Reel updated!');
        } catch {}
      }

      return { success: true };
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update reel'));
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const toggleReel = async (reelId) => {
    try {
      setIsLoading(true);

      setReels((prev) =>
        prev.map((r) =>
          r._id === reelId || r.id === reelId
            ? { ...r, isActive: !r.isActive }
            : r
        )
      );

      if (isBackendConnected && isAuthenticated) {
        try {
          await reelsAPI.toggle(reelId);
          toast.success('Reel status toggled!');
        } catch {}
      }

      return { success: true };
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to toggle reel'));
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteReel = async (reelId) => {
    try {
      setIsLoading(true);

      if (isBackendConnected && isAuthenticated) {
        try {
          await reelsAPI.delete(reelId);
        } catch {}
      }

      setReels((prev) =>
        prev.filter((r) => r._id !== reelId && r.id !== reelId)
      );

      toast.success('Reel deleted!');
      return { success: true };
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete reel'));
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Get product linked to a reel
  const getReelProduct = (reel) => {
    if (!reel?.productId && !reel?.product) return null;

    const productId = reel?.product?._id || reel?.product?.id || reel?.productId;

    const product = products.find(
      (p) => p._id === productId || p.id === productId
    );

    return product || null;
  };

  // ✅ Get all reels for a specific product
  const getProductReels = (productId) => {
    return reels.filter(
      (r) =>
        r.productId === productId ||
        r.product?._id === productId ||
        r.product?.id === productId
    );
  };

  // ==============================
  // Admin Order/User Actions
  // ==============================
  const updateOrderStatus = async (orderId, status) => {
    try {
      setIsLoading(true);

      if (isBackendConnected) {
        try {
          await adminAPI.orders.updateStatus(orderId, status);
        } catch {}
      }

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId || o._id === orderId ? { ...o, status } : o
        )
      );

      toast.success('Order status updated');
      return { success: true };
    } catch {
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const assignTrackingId = async (orderId, trackingId) => {
    try {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId || o._id === orderId
            ? { ...o, trackingId }
            : o
        )
      );

      if (isBackendConnected) {
        try {
          await adminAPI.orders.sendUpdate(orderId, { trackingId });
        } catch {}
      }

      toast.success('Tracking ID assigned');
      return { success: true };
    } catch {
      return { success: false };
    }
  };

  const changeUserRole = async (userId, role) => {
    try {
      setIsLoading(true);

      if (isBackendConnected) {
        try {
          await adminAPI.users.updateRole(userId, role);
        } catch {}
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId || u._id === userId ? { ...u, role } : u
        )
      );

      toast.success('Role updated');
      return { success: true };
    } catch {
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const changeUserStatus = async (userId, status) => {
    try {
      setIsLoading(true);

      if (isBackendConnected) {
        try {
          await adminAPI.users.updateStatus(userId, status);
        } catch {}
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId || u._id === userId ? { ...u, status } : u
        )
      );

      toast.success('Status updated');
      return { success: true };
    } catch {
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    try {
      setIsLoading(true);

      if (isBackendConnected) {
        try {
          await adminAPI.users.delete(userId);
        } catch {}
      }

      setUsers((prev) =>
        prev.filter((u) => u.id !== userId && u._id !== userId)
      );

      toast.success('User deleted');
      return { success: true };
    } catch {
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  // ==============================
  // User Data Fetch
  // ==============================
  const fetchUserData = async () => {
    if (!isAuthenticated) return;

    try {
      await getUserProfile();

      try {
        const d = await cartAPI.getCart();
        const items = d?.cart?.items || d?.data?.items || [];

        if (Array.isArray(items)) {
          setCart(
            items.map((i) => {
              const p = i.product || i;
              return normalizeCartProduct({
                ...p,
                quantity: i.quantity || 1,
                _id: p._id || p.id,
                cartItemId: i._id
              });
            }).filter(Boolean)
          );
        }
      } catch {}

      try {
        const d = await wishlistAPI.getWishlist();
        const items = d?.wishlist?.items || d?.data?.items || [];

        if (Array.isArray(items)) {
          setWishlist(
            items.map((i) => ({
              id: i._id || i.id,
              ...i
            }))
          );
        }
      } catch {}

      try {
        const d = await orderAPI.getMyOrders();
        const list = d?.orders || d?.data || [];

        if (Array.isArray(list)) setOrders(list);
      } catch {}

      try {
        const d = await reviewAPI.getMyReviews();
        const list = d?.reviews || d?.data || [];

        if (Array.isArray(list)) setReviews(list);
      } catch {}
    } catch {}
  };

  // ==============================
  // Cart Actions
  // ==============================
  const addToCart = async (product, qty = 1) => {
    try {
      const finalProduct = normalizeCartProduct(product);

      if (!finalProduct) {
        toast.error('Invalid product');
        return {
          success: false,
          message: 'Invalid product'
        };
      }

      const finalQty = Math.max(Number(qty) || 1, 1);

      setCart((prev) => {
        const exists = prev.find(
          (i) =>
            i.id === finalProduct.id ||
            i._id === finalProduct._id ||
            i.id === finalProduct._id ||
            i._id === finalProduct.id
        );

        if (exists) {
          return prev.map((i) =>
            i.id === finalProduct.id ||
            i._id === finalProduct._id ||
            i.id === finalProduct._id ||
            i._id === finalProduct.id
              ? {
                  ...i,
                  quantity: (Number(i.quantity) || 1) + finalQty
                }
              : i
          );
        }

        return [
          ...prev,
          {
            ...finalProduct,
            quantity: finalQty
          }
        ];
      });

      toast.success(`${finalProduct.name} added to cart!`);

      return {
        success: true,
        data: finalProduct
      };
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to add to cart'));

      return {
        success: false,
        message: getErrorMessage(error, 'Failed to add to cart')
      };
    }
  };

  const buyNowProduct = async (product, qty = 1) => {
    const result = await addToCart(product, qty);

    return result;
  };

  const removeFromCart = async (productId) => {
    setCart((prev) =>
      prev.filter((i) => i.id !== productId && i._id !== productId)
    );

    toast.success('Removed from cart');

    return { success: true };
  };

  const updateCartQty = async (productId, qty) => {
    if (qty <= 0) return removeFromCart(productId);

    setCart((prev) =>
      prev.map((i) =>
        i.id === productId || i._id === productId
          ? { ...i, quantity: qty }
          : i
      )
    );

    return { success: true };
  };

  const clearCart = async () => {
    setCart([]);
    setAppliedCoupon(null);
    toast.success('Cart cleared');

    return { success: true };
  };

  // ==============================
  // Auth Actions
  // ==============================
  const loginUser = async (userData, token) => {
    updateUserState(userData);

    if (token) localStorage.setItem('luxe_token', token);

    setIsAuthenticated(true);
    setIsBackendConnected(true);

    setTimeout(() => {
      fetchUserData();
      refreshProducts();
      refreshCategories();
      refreshReels(); // ✅ NEW
    }, 100);
  };

  const updateCurrentUser = (userData) => {
    updateUserState(userData);
  };

  const logoutUser = async () => {
    try {
      if (isBackendConnected) {
        try {
          await authAPI.logout();
        } catch {}
      }
    } catch {} finally {
      setCurrentUser(null);
      setIsAuthenticated(false);
      setCart([]);
      setWishlist([]);
      setAppliedCoupon(null);

      localStorage.removeItem('luxe_token');
      localStorage.removeItem('luxe_user');
      localStorage.removeItem('luxe_cart');
      localStorage.removeItem('luxe_wishlist');

      toast.success('Logged out!');

      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    }
  };

  // ==============================
  // Notifications
  // ==============================
  const readNotification = (notifId) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notifId || n._id === notifId
          ? { ...n, read: true }
          : n
      )
    );
  };

  const clearAllNotifications = () => {
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        read: true
      }))
    );
  };

  // ==============================
  // Wishlist Toggle
  // ==============================
  const toggleWishlist = (product) => {
    const finalProduct = normalizeCartProduct(product) || product;

    setWishlist((prev) => {
      const exists = prev.find(
        (i) =>
          i.id === finalProduct.id ||
          i._id === finalProduct._id ||
          i.id === finalProduct._id ||
          i._id === finalProduct.id
      );

      if (exists) {
        return prev.filter(
          (i) =>
            i.id !== finalProduct.id &&
            i._id !== finalProduct._id &&
            i.id !== finalProduct._id &&
            i._id !== finalProduct.id
        );
      }

      return [...prev, { ...finalProduct }];
    });
  };

  // ==============================
  // Apply Coupon
  // ==============================
  const applyCouponCode = (code) => {
    const valid = [
      {
        code: 'LUXE15',
        discountType: 'percent',
        value: 15,
        minOrder: 2000
      },
      {
        code: 'FLAT500',
        discountType: 'fixed',
        value: 500,
        minOrder: 3000
      },
      {
        code: 'WELCOME10',
        discountType: 'percent',
        value: 10,
        minOrder: 1000
      },
      {
        code: 'LUXE2026',
        discountType: 'percent',
        value: 20,
        minOrder: 5000
      }
    ];

    const coupon = valid.find(
      (c) => c.code.toUpperCase() === code.toUpperCase()
    );

    if (!coupon) {
      return {
        success: false,
        message: 'Invalid code. Try LUXE15, FLAT500, WELCOME10.'
      };
    }

    const total = cart.reduce(
      (a, i) =>
        a + (Number(i.price) || 0) * (Number(i.quantity) || 1),
      0
    );

    if (total < coupon.minOrder) {
      return {
        success: false,
        message: `Min order ₹${coupon.minOrder} required.`
      };
    }

    setAppliedCoupon(coupon);

    return {
      success: true,
      message: `"${coupon.code}" applied! Save ${
        coupon.discountType === 'percent'
          ? coupon.value + '%'
          : '₹' + coupon.value
      }.`
    };
  };

  // ==============================
  // Track Product View
  // ==============================
  const trackProductView = (product) => {
    const finalProduct = normalizeCartProduct(product) || product;

    setRecentlyViewed((prev) => {
      const f = prev.filter(
        (p) =>
          p.id !== finalProduct.id &&
          p._id !== finalProduct._id
      );

      return [finalProduct, ...f].slice(0, 10);
    });
  };

  // ==============================
  // Context Value
  // ==============================
  const contextValue = {
    products,
    setProducts,
    categories,
    setCategories,
    users,
    setUsers,
    orders,
    setOrders,
    reviews,
    setReviews,
    coupons,
    setCoupons,
    notifications,
    setNotifications,
    reels, // ✅ NEW
    setReels, // ✅ NEW

    currentUser,
    isAuthenticated,
    isBackendConnected,
    isLoading,

    cart,
    cartCount,
    wishlist,
    appliedCoupon,

    siteSettings,
    setSiteSettings,

    recentSearches,
    recentlyViewed,
    homeData,

    setRecentSearches,
    setRecentlyViewed,
    setAppliedCoupon,

    refreshProducts,
    refreshCategories,
    refreshReels, // ✅ NEW

    addToCart,
    buyNowProduct,
    removeFromCart,
    updateCartQty,
    clearCart,

    getUserProfile,
    updateUserProfile,
    changeUserPassword,
    uploadUserAvatar,

    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,

    addProduct,
    deleteProduct,
    updateProduct,

    // ✅ NEW: Reels Management
    getPublicReels,
    getAdminReels,
    addReel,
    updateReel,
    toggleReel,
    deleteReel,
    getReelProduct,
    getProductReels,

    updateOrderStatus,
    assignTrackingId,

    changeUserRole,
    changeUserStatus,
    deleteUser,

    loginUser,
    updateCurrentUser,
    logoutUser,

    readNotification,
    clearAllNotifications,

    checkBackendHealth,
    syncBackendData,
    fetchUserData,

    toggleWishlist,
    applyCouponCode,
    trackProductView,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};