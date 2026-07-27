import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
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
  reelsAPI,
} from '../services/api';

import toast from 'react-hot-toast';

const AppContext = createContext();
export const useApp = () => useContext(AppContext);

const STORAGE_KEYS = {
  products: 'luxe_products',
  categories: 'luxe_categories',
  users: 'luxe_users',
  orders: 'luxe_orders',
  cart: 'luxe_cart',
  wishlist: 'luxe_wishlist',
  siteSettings: 'luxe_site_settings',
  reels: 'luxe_reels',
  token: 'luxe_token',
  user: 'luxe_user',
  isSellerOnboarded: 'isSellerOnboarded',
};

const storage = {
  get: (key, fallback = null) => {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch { }
  },
  setRaw: (key, value) => {
    try { localStorage.setItem(key, value); } catch { }
  },
  remove: (...keys) => {
    keys.forEach((k) => { try { localStorage.removeItem(k); } catch { } });
  },
};

class RequestCache {
  constructor() {
    this._cache   = new Map();
    this._pending = new Map();
  }

  async get(key, fetcher, ttl = 30_000) {
    const hit = this._cache.get(key);
    if (hit && Date.now() - hit.ts < ttl) return hit.data;

    if (this._pending.has(key)) return this._pending.get(key);

    const promise = fetcher()
      .then((data) => {
        this._cache.set(key, { data, ts: Date.now() });
        this._pending.delete(key);
        return data;
      })
      .catch((err) => {
        this._pending.delete(key);
        throw err;
      });

    this._pending.set(key, promise);
    return promise;
  }

  invalidate(...keys) {
    keys.forEach((k) => {
      this._cache.delete(k);
      this._pending.delete(k);
    });
  }

  clear() {
    this._cache.clear();
    this._pending.clear();
  }

  purge(maxAge = 120_000) {
    const now = Date.now();
    for (const [k, v] of this._cache) {
      if (now - v.ts > maxAge) this._cache.delete(k);
    }
  }
}

const getErrorMessage = (error, fallback = 'Something went wrong') => {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  return (
    error?.response?.data?.message ||
    error?.data?.message          ||
    error?.message                ||
    fallback
  );
};

const mapBackendProduct = (p, fb = {}) => {
  const d = p?.data || p;
  return {
    id:           d?._id || d?.id || fb?.id || `PROD-${Date.now()}`,
    _id:          d?._id || d?.id,
    name:         d?.name         || fb?.name         || 'Unnamed Product',
    description:  d?.description  || fb?.description  || '',
    price:        Number(d?.price          ?? fb?.price          ?? 0),
    salePrice:    d?.salePrice    ?? fb?.salePrice    ?? null,
    oldPrice:     d?.oldPrice     ?? fb?.oldPrice     ?? null,
    stock:        d?.inventory?.quantity ?? d?.stock   ?? fb?.stock ?? 10,
    image:        d?.images?.[0]?.url || d?.image || fb?.image ||
                  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop',
    images:       d?.images?.map((i) => i.url || i).filter(Boolean) || fb?.images || [],
    category:     d?.category?.name || d?.category || fb?.category || 'General',
    categoryId:   d?.category?._id  || d?.category?.id || null,
    sku:          d?.sku   || fb?.sku   || 'SKU-GEN',
    brand:        d?.brand || fb?.brand || 'Luxe Atelier',
    rating:       d?.rating?.average ?? d?.rating ?? fb?.rating ?? 5.0,
    reviewsCount: d?.rating?.count   ?? d?.reviewsCount ?? fb?.reviewsCount ?? 0,
    tags:         Array.isArray(d?.tags) ? d.tags : Array.isArray(fb?.tags) ? fb.tags : [],
    isFeatured:   d?.isFeatured  ?? fb?.isFeatured  ?? false,
    isActive:     d?.isActive    ?? fb?.isActive    ?? true,
    createdAt:    d?.createdAt   || new Date().toISOString(),
  };
};

const normalizeCartProduct = (product = {}) => {
  const raw = product?.product || product?.data || product;
  const id  = raw?._id || raw?.id || raw?.productId;
  if (!id) return null;

  const image =
    raw?.image || raw?.thumbnail || raw?.thumbnailUrl ||
    raw?.images?.[0]?.url || raw?.images?.[0] ||
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop';

  const images = Array.isArray(raw?.images)
    ? raw.images.map((i) => i?.url || i).filter(Boolean)
    : [image];

  const category =
    typeof raw?.category === 'object' ? raw.category?.name || 'General' : raw?.category || 'General';

  return {
    ...raw,
    id,
    _id:         raw?._id || id,
    name:        raw?.name        || 'Product',
    slug:        raw?.slug        || id,
    description: raw?.description || '',
    price:       Number(raw?.salePrice ?? raw?.price ?? 0),
    salePrice:   raw?.salePrice   ?? null,
    oldPrice:    raw?.oldPrice    ?? raw?.compareAtPrice ?? null,
    image,
    images,
    category,
    brand:       raw?.brand || 'Luxe Atelier',
    stock:       raw?.inventory?.quantity ?? raw?.stock ?? 10,
    quantity:    Number(raw?.quantity) || 1,
    cartItemId:  raw?.cartItemId || raw?._id || raw?.id,
  };
};

const extractArray = (res, ...paths) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  for (const path of paths) {
    const parts = path.split('.');
    let cur = res;
    for (const p of parts) cur = cur?.[p];
    if (Array.isArray(cur)) return cur;
  }
  return [];
};

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
  terms: '', privacy: '', returnPolicy: '',
};

const usePersist = (key, value, delay = 400) => {
  const timer = useRef(null);
  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => storage.set(key, value), delay);
    return () => clearTimeout(timer.current);
  }, [key, value]);
};

export const AppProvider = ({ children }) => {
  const cache            = useRef(new RequestCache());
  const isMounted        = useRef(true);
  const syncLock         = useRef(false);
  const userFetchLock    = useRef(false);
  const didSync          = useRef(false);
  const didFetchUser     = useRef(false);
  const prevAuthKey      = useRef('');

  useEffect(() => {
    const id = setInterval(() => cache.current.purge(120_000), 120_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const [products,      setProducts]      = useState(() => storage.get(STORAGE_KEYS.products,      mockProducts      || []));
  const [categories,    setCategories]    = useState(() => storage.get(STORAGE_KEYS.categories,    mockCategories    || []));
  const [users,         setUsers]         = useState(() => storage.get(STORAGE_KEYS.users,         mockUsers         || []));
  const [orders,        setOrders]        = useState(() => storage.get(STORAGE_KEYS.orders,        mockOrders        || []));
  const [reviews,       setReviews]       = useState(mockReviews       || []);
  const [coupons,       setCoupons]       = useState(mockCoupons       || []);
  const [notifications, setNotifications] = useState(mockNotifications || []);
  const [reels,         setReels]         = useState(() => storage.get(STORAGE_KEYS.reels,         []));
  const [cart,          setCart]          = useState(() => storage.get(STORAGE_KEYS.cart,          []));
  const [wishlist,      setWishlist]      = useState(() => storage.get(STORAGE_KEYS.wishlist,      []));
  const [siteSettings,  setSiteSettings]  = useState(() => ({
    ...DEFAULT_SITE_SETTINGS,
    ...storage.get(STORAGE_KEYS.siteSettings, {}),
  }));

  const [currentUser,         setCurrentUser]         = useState(() => storage.get(STORAGE_KEYS.user, null));
  const [isAuthenticated,     setIsAuthenticated]     = useState(() => !!localStorage.getItem(STORAGE_KEYS.token));
  const [isBackendConnected,  setIsBackendConnected]  = useState(false);
  const [isLoading,           setIsLoading]           = useState(false);
  const [appliedCoupon,       setAppliedCoupon]       = useState(null);
  const [cartCount,           setCartCount]           = useState(0);
  const [recentSearches,      setRecentSearches]      = useState(['Cashmere', 'Trench Coat']);
  const [recentlyViewed,      setRecentlyViewed]      = useState([]);
  const [homeData,            setHomeData]            = useState(null);

  const [isSellerOnboarded,   setIsSellerOnboarded]   = useState(() => localStorage.getItem('isSellerOnboarded') === 'true');

  usePersist(STORAGE_KEYS.products,     products);
  usePersist(STORAGE_KEYS.categories,   categories);
  usePersist(STORAGE_KEYS.users,        users);
  usePersist(STORAGE_KEYS.orders,       orders);
  usePersist(STORAGE_KEYS.cart,         cart);
  usePersist(STORAGE_KEYS.wishlist,     wishlist);
  usePersist(STORAGE_KEYS.siteSettings, siteSettings);
  usePersist(STORAGE_KEYS.reels,        reels);

  useEffect(() => {
    setCartCount(cart.reduce((s, i) => s + (Number(i.quantity) || 1), 0));
  }, [cart]);

  const updateUserState = useCallback((data) => {
    if (!data || !isMounted.current) return;
    setCurrentUser(data);
    storage.set(STORAGE_KEYS.user, data);
  }, []);

  const checkBackendHealth = useCallback(async () => {
    try {
      const res = await cache.current.get('health', () => healthAPI.checkHealth(), 15_000);
      const ok = res?.status?.toLowerCase() === 'ok' || res?.success === true;
      if (isMounted.current) setIsBackendConnected(ok);
      return ok;
    } catch {
      if (isMounted.current) setIsBackendConnected(false);
      return false;
    }
  }, []);

  const refreshProducts = useCallback(async () => {
    try {
      const res  = await cache.current.get('products', () => shopAPI.getProducts(), 60_000);
      const rows = extractArray(res, 'products', 'data', 'data.products', 'data.data.products');
      if (rows.length && isMounted.current) {
        const mapped = rows.map((p) => mapBackendProduct(p));
        setProducts(mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('[refreshProducts]', e?.message);
    }
    return [];
  }, []);

  const refreshCategories = useCallback(async () => {
    try {
      const res  = await cache.current.get('categories', () => shopAPI.getCategories(), 60_000);
      const rows = extractArray(res, 'categories', 'data', 'data.categories', 'data.data.categories');
      if (rows.length && isMounted.current) {
        const mapped = rows.map((c) => ({
          id: c._id || c.id, _id: c._id || c.id,
          name: c.name, slug: c.slug,
          description: c.description || '',
          image: c.image || '',
          isActive: c.isActive ?? true,
          productCount: c.productCount || 0,
        }));
        setCategories(mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('[refreshCategories]', e?.message);
    }
    return [];
  }, []);

  const refreshReels = useCallback(async (limit = 10) => {
    try {
      const res  = await cache.current.get('reels-public', () => reelsAPI.getPublic(limit), 30_000);
      const rows = res?.data?.reels || res?.reels || [];
      if (rows.length && isMounted.current) { setReels(rows); return rows; }
    } catch (e) {
      console.warn('[refreshReels]', e?.message);
    }
    return [];
  }, []);

  const getUserProfile = useCallback(async () => {
    try {
      const res  = await cache.current.get('profile', () => profileAPI.getProfile(), 20_000);
      const user = res?.data?.user || res?.data || res?.user || null;
      if (res?.success && user && isMounted.current) { updateUserState(user); return user; }
    } catch (e) {
      console.warn('[getUserProfile]', e?.message);
    }
    return null;
  }, [updateUserState]);

  const isSameProduct = (a, b) =>
    a.id === b.id || a._id === b._id || a.id === b._id || a._id === b.id;

  const fetchCartFromBackend = useCallback(async () => {
    try {
      if (!isBackendConnected || !isAuthenticated) return;
      
      const response = await cartAPI.getCart();
      const items = response?.cart?.items || response?.data?.items || response?.items || [];
      
      if (Array.isArray(items) && isMounted.current) {
        const normalizedItems = items.map((item) => {
          const product = item.product || item;
          return normalizeCartProduct({
            ...product,
            quantity: item.quantity || 1,
            cartItemId: item._id || item.id
          });
        }).filter(Boolean);
        
        setCart(normalizedItems);
        cache.current.invalidate('user-cart');
      }
    } catch (error) {
      console.warn('[fetchCartFromBackend]', error?.message);
    }
  }, [isBackendConnected, isAuthenticated]);

  const fetchUserData = useCallback(async () => {
    if (userFetchLock.current) return;
    if (!localStorage.getItem(STORAGE_KEYS.token)) return;

    userFetchLock.current = true;

    try {
      await getUserProfile();
      if (!isMounted.current) return;

      await Promise.allSettled([
        fetchCartFromBackend(),
        (async () => {
          const d     = await wishlistAPI.getWishlist();
          const items = d?.wishlist?.items || d?.data?.items || [];
          if (Array.isArray(items) && items.length && isMounted.current)
            setWishlist(items.map((i) => ({ id: i._id || i.id, ...i })));
        })(),
        (async () => {
          const d    = await orderAPI.getMyOrders();
          const list = d?.orders || d?.data || [];
          if (Array.isArray(list) && list.length && isMounted.current) setOrders(list);
        })(),
        (async () => {
          const d    = await reviewAPI.getMyReviews();
          const list = d?.reviews || d?.data || [];
          if (Array.isArray(list) && list.length && isMounted.current) setReviews(list);
        })(),
      ]);
    } catch (e) {
      console.warn('[fetchUserData]', e?.message);
    } finally {
      setTimeout(() => { userFetchLock.current = false; }, 10_000);
    }
  }, [getUserProfile, fetchCartFromBackend]);

  const syncBackendData = useCallback(async (withUser = false) => {
    if (syncLock.current) return;
    syncLock.current = true;
    if (isMounted.current) setIsLoading(true);

    try {
      const home = await cache.current.get('home', () => homeAPI.getHomeData(), 60_000).catch(() => null);
      if (home && isMounted.current) setHomeData(home);

      await Promise.allSettled([refreshProducts(), refreshCategories(), refreshReels()]);

      if (withUser && localStorage.getItem(STORAGE_KEYS.token) && isMounted.current) {
        await fetchUserData();
      }
    } catch (e) {
      console.warn('[syncBackendData]', e?.message);
    } finally {
      if (isMounted.current) setIsLoading(false);
      syncLock.current = false;
      setTimeout(() => { didSync.current = false; }, 120_000);
    }
  }, [refreshProducts, refreshCategories, refreshReels, fetchUserData]);

  useEffect(() => {
    if (didSync.current) return;
    didSync.current = true;

    let cancelled = false;

    (async () => {
      const online = await checkBackendHealth();
      if (cancelled || !online) return;
      await syncBackendData(!!localStorage.getItem(STORAGE_KEYS.token));
    })();

    return () => { cancelled = true; };
  }, []);

  const userId = useMemo(
    () => currentUser?._id || currentUser?.id || null,
    [currentUser?._id, currentUser?.id],
  );

  useEffect(() => {
    const key = `${isAuthenticated}|${userId ?? ''}`;
    if (prevAuthKey.current === key) return;
    prevAuthKey.current = key;

    if (isAuthenticated && userId && !didFetchUser.current) {
      didFetchUser.current = true;
      setIsBackendConnected(true);
      cache.current.clear();
      fetchUserData();
    }

    if (!isAuthenticated) {
      didFetchUser.current = false;
      userFetchLock.current = false;
    }
  }, [isAuthenticated, userId, fetchUserData]);

  const handleLoginSuccess = useCallback((result) => {
    if (!result?.success || !result?.data) return false;
    
    const { user, token } = result.data;
    if (user && token) {
      updateUserState(user);
      storage.setRaw(STORAGE_KEYS.token, token);
      setIsAuthenticated(true);
      setIsBackendConnected(true);
      
      const role = String(user?.role || '').trim().toLowerCase();
      // Set onboarded state ONLY if they have finished onboarding (has storeName)
      if (role === 'seller' && user?.storeName) {
        setIsSellerOnboarded(true);
        localStorage.setItem('isSellerOnboarded', 'true');
      } else {
        setIsSellerOnboarded(false);
        localStorage.removeItem('isSellerOnboarded');
      }

      didFetchUser.current  = false;
      userFetchLock.current = false;
      cache.current.clear();
      toast.success(`Welcome back, ${user.name || 'User'}!`);
      return true;
    }
    return false;
  }, [updateUserState]);

  const loginWithEmail = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const result = await authAPI.loginWithEmail(email, password);
      if (handleLoginSuccess(result)) {
        return { success: true, data: result.data };
      }
      throw new Error(result?.message || 'Email login failed');
    } catch (error) {
      const message = getErrorMessage(error, 'Email login failed');
      toast.error(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  }, [handleLoginSuccess]);

  const loginWithGoogle = useCallback(async (accessToken) => {
    setIsLoading(true);
    try {
      const result = await authAPI.loginWithGoogle(accessToken);
      if (handleLoginSuccess(result)) {
        return { success: true, data: result.data };
      }
      throw new Error(result?.message || 'Google login failed');
    } catch (error) {
      const message = getErrorMessage(error, 'Google login failed');
      toast.error(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  }, [handleLoginSuccess]);

  const loginWithFacebook = useCallback(async (accessToken) => {
    setIsLoading(true);
    try {
      const result = await authAPI.loginWithFacebook(accessToken);
      if (handleLoginSuccess(result)) {
        return { success: true, data: result.data };
      }
      throw new Error(result?.message || 'Facebook login failed');
    } catch (error) {
      const message = getErrorMessage(error, 'Facebook login failed');
      toast.error(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  }, [handleLoginSuccess]);

  const loginWithPhone = useCallback(async (phone, otp) => {
    setIsLoading(true);
    try {
      const result = await authAPI.loginWithPhone(phone, otp);
      if (handleLoginSuccess(result)) {
        return { success: true, data: result.data };
      }
      throw new Error(result?.message || 'Phone login failed');
    } catch (error) {
      const message = getErrorMessage(error, 'Phone login failed');
      toast.error(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  }, [handleLoginSuccess]);

  const loginWithWhatsApp = useCallback(async (phone, otp) => {
    setIsLoading(true);
    try {
      const result = await authAPI.loginWithWhatsApp(phone, otp);
      if (handleLoginSuccess(result)) {
        return { success: true, data: result.data };
      }
      throw new Error(result?.message || 'WhatsApp login failed');
    } catch (error) {
      const message = getErrorMessage(error, 'WhatsApp login failed');
      toast.error(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  }, [handleLoginSuccess]);

  const sendPhoneOTP = useCallback(async (phone) => {
    try {
      const result = await authAPI.sendPhoneOTP(phone);
      if (result?.success) {
        toast.success('OTP sent to your phone!');
        return { 
          success: true, 
          message: 'OTP sent successfully',
          otp: result.otp || result.data?.otp
        };
      }
      throw new Error(result?.message || 'Failed to send OTP');
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to send OTP');
      toast.error(message);
      return { success: false, message };
    }
  }, []);

  const sendWhatsAppOTP = useCallback(async (phone) => {
    try {
      const result = await authAPI.sendWhatsAppOTP(phone);
      if (result?.success) {
        toast.success('OTP sent to your WhatsApp!');
        return { 
          success: true, 
          message: 'WhatsApp OTP sent successfully',
          otp: result.otp || result.data?.otp
        };
      }
      throw new Error(result?.message || 'Failed to send WhatsApp OTP');
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to send WhatsApp OTP');
      toast.error(message);
      return { success: false, message };
    }
  }, []);

  const updateUserProfile = useCallback(async (profileData) => {
    setIsLoading(true);
    try {
      if (isBackendConnected && isAuthenticated) {
        const res  = await profileAPI.updateProfile(profileData);
        const user = res?.data?.user || res?.data || res?.user || null;
        if (res?.success && user) {
          updateUserState(user);
          cache.current.invalidate('profile');
          toast.success('Profile updated!');
          return user;
        }
      }
      const updated = { ...currentUser, ...profileData };
      updateUserState(updated);
      toast.success('Profile updated!');
      return updated;
    } catch (e) {
      toast.error(getErrorMessage(e));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isBackendConnected, isAuthenticated, currentUser, updateUserState]);

  const changeUserPassword = useCallback(async (passwordData) => {
    setIsLoading(true);
    try {
      if (isBackendConnected && isAuthenticated) {
        const r = await authAPI.changePassword(passwordData);
        if (r?.success) { toast.success('Password changed!'); return r; }
      }
      toast.success('Password changed!');
      return { success: true };
    } catch (e) {
      toast.error(getErrorMessage(e));
      return { success: false };
    } finally { setIsLoading(false); }
  }, [isBackendConnected, isAuthenticated]);

  const uploadUserAvatar = useCallback(async (file) => {
    setIsLoading(true);
    try {
      if (isBackendConnected && isAuthenticated) {
        const res = await profileAPI.uploadAvatar(file);
        if (res?.success && res?.data) {
          updateUserState({ ...currentUser, avatar: res.data.avatar });
          cache.current.invalidate('profile');
          toast.success('Avatar updated!');
          return res;
        }
      }
      const url = URL.createObjectURL(file);
      updateUserState({ ...currentUser, avatar: url });
      toast.success('Avatar updated!');
      return { success: true, data: { avatar: url } };
    } catch (e) {
      toast.error(getErrorMessage(e));
      return { success: false };
    } finally { setIsLoading(false); }
  }, [isBackendConnected, isAuthenticated, currentUser, updateUserState]);

  const _invalidateProfile = () => cache.current.invalidate('profile');

  const addAddress = useCallback(async (addressData) => {
    setIsLoading(true);
    try {
      if (isBackendConnected && isAuthenticated) {
        const r = await profileAPI.addAddress(addressData);
        if (r?.success && r?.data) { updateUserState(r.data); _invalidateProfile(); return r; }
      }
      const newAddr = { _id: String(Date.now()), ...addressData, createdAt: new Date() };
      let addrs    = [...(currentUser?.address || []), newAddr];
      if (addressData.isDefault) addrs = addrs.map((a, i) => ({ ...a, isDefault: i === addrs.length - 1 }));
      const next = { ...currentUser, address: addrs };
      updateUserState(next);
      return { success: true, data: next };
    } catch (e) { toast.error(getErrorMessage(e)); return { success: false }; }
    finally { setIsLoading(false); }
  }, [isBackendConnected, isAuthenticated, currentUser, updateUserState]);

  const updateAddress = useCallback(async (addressId, addressData) => {
    setIsLoading(true);
    try {
      if (isBackendConnected && isAuthenticated) {
        const r = await profileAPI.updateAddress(addressId, addressData);
        if (r?.success && r?.data) { updateUserState(r.data); _invalidateProfile(); return r; }
      }
      let addrs = (currentUser?.address || []).map((a) => a._id === addressId ? { ...a, ...addressData } : a);
      if (addressData.isDefault) addrs = addrs.map((a) => ({ ...a, isDefault: a._id === addressId }));
      const next = { ...currentUser, address: addrs };
      updateUserState(next);
      return { success: true, data: next };
    } catch (e) { toast.error(getErrorMessage(e)); return { success: false }; }
    finally { setIsLoading(false); }
  }, [isBackendConnected, isAuthenticated, currentUser, updateUserState]);

  const deleteAddress = useCallback(async (addressId) => {
    setIsLoading(true);
    try {
      if (isBackendConnected && isAuthenticated) {
        const r = await profileAPI.deleteAddress(addressId);
        if (r?.success && r?.data) { updateUserState(r.data); _invalidateProfile(); return r; }
      }
      const removing = (currentUser?.address || []).find((a) => a._id === addressId);
      let addrs      = (currentUser?.address || []).filter((a) => a._id !== addressId);
      if (removing?.isDefault && addrs.length) addrs[0] = { ...addrs[0], isDefault: true };
      const next = { ...currentUser, address: addrs };
      updateUserState(next);
      return { success: true, data: next };
    } catch (e) { toast.error(getErrorMessage(e)); return { success: false }; }
    finally { setIsLoading(false); }
  }, [isBackendConnected, isAuthenticated, currentUser, updateUserState]);

  const setDefaultAddress = useCallback(async (addressId) => {
    setIsLoading(true);
    try {
      if (isBackendConnected && isAuthenticated) {
        const r = await profileAPI.setDefaultAddress(addressId);
        if (r?.success && r?.data) { updateUserState(r.data); _invalidateProfile(); return r; }
      }
      const addrs = (currentUser?.address || []).map((a) => ({ ...a, isDefault: a._id === addressId }));
      const next  = { ...currentUser, address: addrs };
      updateUserState(next);
      return { success: true, data: next };
    } catch (e) { toast.error(getErrorMessage(e)); return { success: false }; }
    finally { setIsLoading(false); }
  }, [isBackendConnected, isAuthenticated, currentUser, updateUserState]);

  const addToCart = useCallback(async (productData, quantity = 1, variant = null) => {
    try {
      let productId;
      if (typeof productData === 'string') {
        productId = productData;
      } else if (typeof productData === 'object' && productData) {
        productId = productData._id || productData.id || productData.productId;
      } else {
        throw new Error('Invalid product data provided');
      }

      if (!productId) {
        throw new Error('Product ID is required');
      }

      const product = products.find(p => p._id === productId || p.id === productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const optimisticCartItem = normalizeCartProduct({
        ...product,
        quantity: quantity,
        cartItemId: `temp-${Date.now()}`
      });

      let cartSnapshot;
      setCart(prevCart => {
        cartSnapshot = prevCart;
        const existingIndex = prevCart.findIndex(item => 
          isSameProduct(item, optimisticCartItem)
        );

        if (existingIndex > -1) {
          return prevCart.map((item, index) => 
            index === existingIndex 
              ? { ...item, quantity: (Number(item.quantity) || 0) + quantity }
              : item
          );
        } else {
          return [...prevCart, optimisticCartItem];
        }
      });

      if (isBackendConnected && isAuthenticated) {
        try {
          const response = await cartAPI.addToCart({
            productId: productId,
            quantity: quantity,
            variant: variant
          });

          if (response?.success) {
            await fetchCartFromBackend();
            cache.current.invalidate('user-cart');
          } else {
            throw new Error(response?.message || 'Failed to add item to cart');
          }
        } catch (apiError) {
          if (cartSnapshot) setCart(cartSnapshot);
          throw apiError;
        }
      }

      toast.success('Item added to cart!');
      return { success: true };

    } catch (error) {
      console.error('Error adding to cart:', error);
      const errorMessage = getErrorMessage(error, 'Failed to add item to cart');
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [isBackendConnected, isAuthenticated, products, fetchCartFromBackend]);

  const buyNowProduct = useCallback(async (product, qty = 1) => addToCart(product, qty), [addToCart]);

  const removeFromCart = useCallback(async (productId) => {
    let cartSnapshot;
    try {
      setCart(prevCart => {
        cartSnapshot = prevCart;
        return prevCart.filter(item => {
          const itemId = item._id || item.id || item.cartItemId;
          const compareId = typeof productId === 'object' ? (productId._id || productId.id) : productId;
          return itemId !== compareId && itemId !== productId;
        });
      });

      if (isBackendConnected && isAuthenticated) {
        try {
          const cartItem = cartSnapshot?.find(item => {
            const itemId = item._id || item.id || item.cartItemId;
            const compareId = typeof productId === 'object' ? (productId._id || productId.id) : productId;
            return itemId === compareId || itemId === productId;
          });

          if (cartItem?.cartItemId && !cartItem.cartItemId.startsWith('temp-')) {
            await cartAPI.removeItem(cartItem.cartItemId);
          }
          cache.current.invalidate('user-cart');
        } catch (apiError) {
          if (cartSnapshot) setCart(cartSnapshot);
          throw apiError;
        }
      }

      toast.success('Item removed from cart');
      return { success: true };
    } catch (error) {
      if (cartSnapshot) setCart(cartSnapshot);
      const errorMessage = getErrorMessage(error, 'Failed to remove item from cart');
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [isBackendConnected, isAuthenticated]);

  const updateCartQty = useCallback(async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      return removeFromCart(productId);
    }
    let cartSnapshot;
    try {
      setCart(prevCart => {
        cartSnapshot = prevCart;
        return prevCart.map(item => {
          const itemId = item._id || item.id || item.cartItemId;
          const compareId = typeof productId === 'object' ? (productId._id || productId.id) : productId;
          if (itemId === compareId || itemId === productId) {
            return { ...item, quantity: newQuantity };
          }
          return item;
        });
      });

      if (isBackendConnected && isAuthenticated) {
        try {
          const cartItem = cartSnapshot?.find(item => {
            const itemId = item._id || item.id || item.cartItemId;
            const compareId = typeof productId === 'object' ? (productId._id || productId.id) : productId;
            return itemId === compareId || itemId === productId;
          });

          if (cartItem?.cartItemId && !cartItem.cartItemId.startsWith('temp-')) {
            await cartAPI.updateQuantity(cartItem.cartItemId, newQuantity);
          }
          cache.current.invalidate('user-cart');
        } catch (apiError) {
          if (cartSnapshot) setCart(cartSnapshot);
          throw apiError;
        }
      }
      return { success: true };
    } catch (error) {
      if (cartSnapshot) setCart(cartSnapshot);
      const errorMessage = getErrorMessage(error, 'Failed to update quantity');
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [isBackendConnected, isAuthenticated, removeFromCart]);

  const clearCart = useCallback(async () => {
    let cartSnapshot;
    try {
      setCart([]);
      setAppliedCoupon(null);
      if (isBackendConnected && isAuthenticated) {
        try {
          await cartAPI.clearCart();
          cache.current.invalidate('user-cart');
        } catch (apiError) {
          if (cartSnapshot) setCart(cartSnapshot);
          throw apiError;
        }
      }
      toast.success('Cart cleared');
      return { success: true };
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to clear cart');
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [isBackendConnected, isAuthenticated]);

  const addProduct = useCallback(async (productData) => {
    setIsLoading(true);
    try {
      if (!isBackendConnected) {
        const local = {
          id: `PROD-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          ...productData, rating: 5.0, reviewsCount: 0, isActive: true,
          image: productData.image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600',
        };
        setProducts((p) => [local, ...p]);
        toast.success('Product added (offline)!');
        return { success: true, data: local, offline: true };
      }

      const matched  = categories.find((c) => c.name?.toLowerCase() === productData.category?.toLowerCase());
      const catId    = matched?._id || matched?.id || null;
      const isMongoId = (id) => /^[0-9a-fA-F]{24}$/.test(String(id || ''));
      const finalCat = isMongoId(catId) ? catId : productData.category || 'General';

      const tags = Array.isArray(productData.tags)
        ? productData.tags
        : typeof productData.tags === 'string'
          ? productData.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : ['new'];

      const payload = {
        name:        productData.name?.trim()        || 'New Product',
        description: productData.description?.trim() || 'Premium item.',
        price:       Number(productData.price)       || 0,
        salePrice:   productData.oldPrice ? Number(productData.oldPrice) : null,
        category:    finalCat,
        inventory:   { quantity: Number(productData.stock) || 10, lowStockThreshold: 5 },
        images:      productData.image ? [{ url: productData.image, alt: productData.name, isPrimary: true }] : [],
        tags,
        isFeatured:  Boolean(productData.isFeatured),
      };

      const res = await adminAPI.products.create(payload);
      if (!res?.success) throw res;

      const raw    = res?.data?.product || res?.data || res;
      const newProd = mapBackendProduct(raw, { ...productData, category: productData.category });
      setProducts((p) => [newProd, ...p]);
      cache.current.invalidate('products');
      toast.success('Product added!');
      return { success: true, data: newProd };
    } catch (e) {
      const msg = getErrorMessage(e, 'Failed to add product');
      toast.error(msg);
      return { success: false, message: msg };
    } finally { setIsLoading(false); }
  }, [isBackendConnected, categories]);

  const deleteProduct = useCallback(async (productId) => {
    setIsLoading(true);
    try {
      if (isBackendConnected) { try { await adminAPI.products.delete(productId); } catch {} }
      setProducts((p) => p.filter((x) => x.id !== productId && x._id !== productId));
      cache.current.invalidate('products');
      toast.success('Product deleted');
      return { success: true };
    } catch (e) { toast.error(getErrorMessage(e)); return { success: false }; }
    finally { setIsLoading(false); }
  }, [isBackendConnected]);

  const updateProduct = useCallback(async (productId, data) => {
    setIsLoading(true);
    try {
      setProducts((p) => p.map((x) => x.id === productId || x._id === productId ? { ...x, ...data } : x));
      if (isBackendConnected) {
        try { await adminAPI.products.update(productId, data); cache.current.invalidate('products'); }
        catch {}
      }
      return { success: true };
    } catch { return { success: false }; }
    finally { setIsLoading(false); }
  }, [isBackendConnected]);

  const addCategory = useCallback(async (catData) => {
    setIsLoading(true);
    try {
      if (!isBackendConnected) {
        const local = {
          id: catData.slug.toLowerCase(),
          _id: catData.slug.toLowerCase(),
          name: catData.name,
          slug: catData.slug,
          description: catData.description || '',
          image: catData.image || '',
          productCount: 0,
          isActive: true,
        };
        setCategories((c) => [...c, local]);
        toast.success('Category created (offline)!');
        return { success: true, data: local };
      }

      const res = await adminAPI.categories.create({
        name: catData.name,
        slug: catData.slug,
        description: catData.description,
        image: catData.image
      });

      if (res?.success) {
        const raw = res?.data?.category || res?.data || res;
        const newCat = {
          id: raw._id || raw.id,
          _id: raw._id || raw.id,
          name: raw.name,
          slug: raw.slug,
          description: raw.description || '',
          image: raw.image || '',
          isActive: raw.isActive ?? true,
          productCount: raw.productCount || 0,
        };
        setCategories((c) => [...c, newCat]);
        cache.current.invalidate('categories');
        toast.success('Category created!');
        return { success: true, data: newCat };
      }
      throw new Error(res?.message || 'Failed to create category on backend');
    } catch (e) {
      const msg = getErrorMessage(e, 'Failed to create category');
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  }, [isBackendConnected]);

  const deleteCategory = useCallback(async (catId) => {
    setIsLoading(true);
    try {
      if (isBackendConnected) {
        await adminAPI.categories.delete(catId);
      }
      setCategories((c) => c.filter((x) => x.id !== catId && x._id !== catId));
      cache.current.invalidate('categories');
      toast.success('Category deleted');
      return { success: true };
    } catch (e) {
      toast.error(getErrorMessage(e, 'Failed to delete category'));
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, [isBackendConnected]);

  const _invalidateReels = () => cache.current.invalidate('reels-public', 'reels-admin');

  const getPublicReels = useCallback(async (limit = 10) => {
    setIsLoading(true);
    try {
      const res  = await cache.current.get('reels-public', () => reelsAPI.getPublic(limit), 30_000);
      const rows = res?.data?.reels || res?.reels || [];
      if (rows.length && isMounted.current) setReels(rows);
      return { success: true, data: rows };
    } catch (e) { toast.error(getErrorMessage(e, 'Failed to fetch reels')); return { success: false, data: [] }; }
    finally { setIsLoading(false); }
  }, []);

  const getAdminReels = useCallback(async () => {
    if (!isBackendConnected || !isAuthenticated) return { success: true, data: reels };
    setIsLoading(true);
    try {
      const res  = await cache.current.get('reels-admin', () => reelsAPI.getAdmin(), 30_000);
      const rows = res?.data?.reels || res?.reels || [];
      if (rows.length && isMounted.current) setReels(rows);
      return { success: true, data: rows };
    } catch (e) { toast.error(getErrorMessage(e, 'Failed to fetch reels')); return { success: false, data: [] }; }
    finally { setIsLoading(false); }
  }, [isBackendConnected, isAuthenticated, reels]);

  const addReel = useCallback(async (reelData) => {
    setIsLoading(true);
    try {
      if (!isBackendConnected || !isAuthenticated) {
        const local = { _id: `REEL-${Date.now()}`, ...reelData, isActive: true, createdAt: new Date().toISOString() };
        setReels((r) => [local, ...r]);
        toast.success('Reel added locally!');
        return { success: true, data: local, offline: true };
      }
      const res = await reelsAPI.create(reelData);
      if (!res?.success) throw res;
      const newReel = res?.data?.reel || res?.data || res;
      if (isMounted.current) setReels((r) => [newReel, ...r]);
      _invalidateReels();
      toast.success('Reel added!');
      return { success: true, data: newReel };
    } catch (e) {
      const msg = getErrorMessage(e, 'Failed to add reel');
      toast.error(msg);
      return { success: false, message: msg };
    } finally { setIsLoading(false); }
  }, [isBackendConnected, isAuthenticated]);

  const updateReel = useCallback(async (reelId, reelData) => {
    setIsLoading(true);
    try {
      setReels((r) => r.map((x) => x._id === reelId || x.id === reelId ? { ...x, ...reelData } : x));
      if (isBackendConnected && isAuthenticated) {
        try { await reelsAPI.update(reelId, reelData); _invalidateReels(); toast.success('Reel updated!'); } catch {}
      }
      return { success: true };
    } catch (e) { toast.error(getErrorMessage(e, 'Failed to update reel')); return { success: false }; }
    finally { setIsLoading(false); }
  }, [isBackendConnected, isAuthenticated]);

  const toggleReel = useCallback(async (reelId) => {
    setIsLoading(true);
    try {
      setReels((r) => r.map((x) => x._id === reelId || x.id === reelId ? { ...x, isActive: !x.isActive } : x));
      if (isBackendConnected && isAuthenticated) {
        try { await reelsAPI.toggle(reelId); _invalidateReels(); } catch {}
      }
      return { success: true };
    } catch (e) { toast.error(getErrorMessage(e, 'Failed to toggle reel')); return { success: false }; }
    finally { setIsLoading(false); }
  }, [isBackendConnected, isAuthenticated]);

  const deleteReel = useCallback(async (reelId) => {
    setIsLoading(true);
    try {
      if (isBackendConnected && isAuthenticated) { try { await reelsAPI.delete(reelId); } catch {} }
      setReels((r) => r.filter((x) => x._id !== reelId && x.id !== reelId));
      _invalidateReels();
      toast.success('Reel deleted!');
      return { success: true };
    } catch (e) { toast.error(getErrorMessage(e, 'Failed to delete reel')); return { success: false }; }
    finally { setIsLoading(false); }
  }, [isBackendConnected, isAuthenticated]);

  const getReelProduct  = useCallback((reel) => {
    if (!reel?.productId && !reel?.product) return null;
    const pid = reel?.product?._id || reel?.product?.id || reel?.productId;
    return products.find((p) => p._id === pid || p.id === pid) || null;
  }, [products]);

  const getProductReels = useCallback((productId) =>
    reels.filter((r) => r.productId === productId || r.product?._id === productId || r.product?.id === productId),
  [reels]);

  const updateOrderStatus = useCallback(async (orderId, status) => {
    setIsLoading(true);
    try {
      if (isBackendConnected) { try { await adminAPI.orders.updateStatus(orderId, status); } catch {} }
      setOrders((o) => o.map((x) => x.id === orderId || x._id === orderId ? { ...x, status } : x));
      cache.current.invalidate('user-orders');
      toast.success('Order status updated');
      return { success: true };
    } catch { return { success: false }; }
    finally { setIsLoading(false); }
  }, [isBackendConnected]);

  const assignTrackingId = useCallback(async (orderId, trackingId) => {
    try {
      setOrders((o) => o.map((x) => x.id === orderId || x._id === orderId ? { ...x, trackingId } : x));
      if (isBackendConnected) { try { await adminAPI.orders.sendUpdate(orderId, { trackingId }); } catch {} }
      toast.success('Tracking ID assigned');
      return { success: true };
    } catch { return { success: false }; }
  }, [isBackendConnected]);

  const changeUserRole = useCallback(async (uid, role) => {
    setIsLoading(true);
    try {
      if (isBackendConnected) { try { await adminAPI.users.updateRole(uid, role); } catch {} }
      setUsers((u) => u.map((x) => x.id === uid || x._id === uid ? { ...x, role } : x));
      toast.success('Role updated');
      return { success: true };
    } catch { return { success: false }; }
    finally { setIsLoading(false); }
  }, [isBackendConnected]);

  const changeUserStatus = useCallback(async (uid, status) => {
    setIsLoading(true);
    try {
      if (isBackendConnected) { try { await adminAPI.users.updateStatus(uid, status); } catch {} }
      setUsers((u) => u.map((x) => x.id === uid || x._id === uid ? { ...x, status } : x));
      toast.success('Status updated');
      return { success: true };
    } catch { return { success: false }; }
    finally { setIsLoading(false); }
  }, [isBackendConnected]);

  const deleteUser = useCallback(async (uid) => {
    setIsLoading(true);
    try {
      if (isBackendConnected) { try { await adminAPI.users.delete(uid); } catch {} }
      setUsers((u) => u.filter((x) => x.id !== uid && x._id !== uid));
      toast.success('User deleted');
      return { success: true };
    } catch { return { success: false }; }
    finally { setIsLoading(false); }
  }, [isBackendConnected]);

  const loginUser = useCallback(async (userData, token) => {
    updateUserState(userData);
    if (token) storage.setRaw(STORAGE_KEYS.token, token);
    setIsAuthenticated(true);
    setIsBackendConnected(true);
    
    const role = String(userData?.role || '').trim().toLowerCase();
    // Enable onboard state flag only if they completed step 8 (indicated by having a storeName)
    if (role === 'seller' && userData?.storeName) {
      setIsSellerOnboarded(true);
      localStorage.setItem('isSellerOnboarded', 'true');
    } else {
      setIsSellerOnboarded(false);
      localStorage.removeItem('isSellerOnboarded');
    }

    didFetchUser.current  = false;
    userFetchLock.current = false;
    cache.current.clear();
  }, [updateUserState]);

  const updateCurrentUser = useCallback((data) => updateUserState(data), [updateUserState]);

  const logoutUser = useCallback(async () => {
    try { if (isBackendConnected) await authAPI.logout().catch(() => {}); } catch {}

    setCurrentUser(null);
    setIsAuthenticated(false);
    setIsSellerOnboarded(false); 
    setCart([]);
    setWishlist([]);
    setAppliedCoupon(null);

    syncLock.current      = false;
    userFetchLock.current = false;
    didSync.current       = false;
    didFetchUser.current  = false;
    prevAuthKey.current   = '';
    cache.current.clear();

    storage.remove(
      STORAGE_KEYS.token, 
      STORAGE_KEYS.user, 
      STORAGE_KEYS.cart, 
      STORAGE_KEYS.wishlist, 
      'isSellerOnboarded', 
      'seller_onboarding_data'
    );
    toast.success('Logged out!');
    setTimeout(() => { window.location.href = '/'; }, 500);
  }, [isBackendConnected]);

  const readNotification    = useCallback((id) => setNotifications((n) => n.map((x) => x.id === id || x._id === id ? { ...x, read: true } : x)), []);
  const clearAllNotifications = useCallback(() => setNotifications((n) => n.map((x) => ({ ...x, read: true }))), []);

  const toggleWishlist = useCallback((product) => {
    const fp = normalizeCartProduct(product) || product;
    setWishlist((prev) => {
      const exists = prev.find((i) => isSameProduct(i, fp));
      return exists ? prev.filter((i) => !isSameProduct(i, fp)) : [...prev, { ...fp }];
    });
  }, []);

  const COUPONS = [
    { code: 'LUXE15',    discountType: 'percent', value: 15,  minOrder: 2000 },
    { code: 'FLAT500',   discountType: 'fixed',   value: 500, minOrder: 3000 },
    { code: 'WELCOME10', discountType: 'percent', value: 10,  minOrder: 1000 },
    { code: 'LUXE2026',  discountType: 'percent', value: 20,  minOrder: 5000 },
  ];

  const applyCouponCode = useCallback((code) => {
    const coupon = COUPONS.find((c) => c.code.toUpperCase() === code.toUpperCase());
    if (!coupon) return { success: false, message: 'Invalid code. Try LUXE15, FLAT500.' };

    const total = cart.reduce((a, i) => a + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0);
    if (total < coupon.minOrder) return { success: false, message: `Min order ₹${coupon.minOrder} required.` };

    setAppliedCoupon(coupon);
    return {
      success: true,
      message: `"${coupon.code}" applied! Save ${coupon.discountType === 'percent' ? coupon.value + '%' : '₹' + coupon.value}.`,
    };
  }, [cart]);

  const trackProductView = useCallback((product) => {
    const fp = normalizeCartProduct(product) || product;
    setRecentlyViewed((prev) => [fp, ...prev.filter((p) => p.id !== fp.id && p._id !== fp._id)].slice(0, 10));
  }, []);

  const contextValue = useMemo(() => ({
    products, setProducts,
    categories, setCategories,
    users, setUsers,
    orders, setOrders,
    reviews, setReviews,
    coupons, setCoupons,
    notifications, setNotifications,
    reels, setReels,
    currentUser, isAuthenticated, isBackendConnected, isLoading,
    cart, cartCount, wishlist, appliedCoupon,
    siteSettings, setSiteSettings,
    recentSearches, recentlyViewed, homeData,
    setRecentSearches, setRecentlyViewed, setAppliedCoupon,
    refreshProducts, refreshCategories, refreshReels,
    checkBackendHealth, syncBackendData, fetchUserData, fetchCartFromBackend,
    addToCart, buyNowProduct, removeFromCart, updateCartQty, clearCart,
    getUserProfile, updateUserProfile, changeUserPassword, uploadUserAvatar,
    addAddress, updateAddress, deleteAddress, setDefaultAddress,
    addProduct, deleteProduct, updateProduct,
    addCategory, deleteCategory,
    loginWithEmail, loginWithGoogle, loginWithFacebook,
    loginWithPhone, loginWithWhatsApp, sendPhoneOTP, sendWhatsAppOTP,
    loginUser, updateCurrentUser, logoutUser,
    readNotification, clearAllNotifications,
    toggleWishlist, applyCouponCode, trackProductView,
    isSellerOnboarded, setIsSellerOnboarded
  }), [
    products, categories, users, orders, reviews, coupons, notifications, reels,
    currentUser, isAuthenticated, isBackendConnected, isLoading,
    cart, cartCount, wishlist, appliedCoupon,
    siteSettings, recentSearches, recentlyViewed, homeData,
    refreshProducts, refreshCategories, refreshReels,
    checkBackendHealth, syncBackendData, fetchUserData, fetchCartFromBackend,
    addToCart, buyNowProduct, removeFromCart, updateCartQty, clearCart,
    getUserProfile, updateUserProfile, changeUserPassword, uploadUserAvatar,
    addAddress, updateAddress, deleteAddress, setDefaultAddress,
    addProduct, deleteProduct, updateProduct,
    addCategory, deleteCategory,
    loginWithEmail, loginWithGoogle, loginWithFacebook,
    loginWithPhone, loginWithWhatsApp, sendPhoneOTP, sendWhatsAppOTP,
    loginUser, updateCurrentUser, logoutUser,
    readNotification, clearAllNotifications,
    toggleWishlist, applyCouponCode, trackProductView,
    isSellerOnboarded, setIsSellerOnboarded
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};