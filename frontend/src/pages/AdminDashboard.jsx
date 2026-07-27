import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import InventoryManagement from '../components/admin/InventoryManagement';
import AdminReelManager from '../components/admin/AdminReelManager';

// ✅ IMPORT THE NEW SELLER TRACKER LIST
import SellerTracker from '../components/admin/SellerTracker';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import {
  LayoutGrid, Package, ShoppingBag, Users as UsersIcon, Sliders, Settings as SettingsIcon,
  Plus, Trash2, Edit3, Download, Upload, CheckCircle2, AlertTriangle, FileText,
  X, Save, Check, ShieldAlert, PhoneCall, ArrowRight, Heart, Star, Flame, Percent,
  Image as ImageIcon, RefreshCw, Layers, Lock, Unlock, Search, Filter, HelpCircle,
  TrendingUp, Activity, Zap, Crown, Bell, ChevronRight, Eye, MoreHorizontal,
  ArrowUpRight, ShoppingCart, DollarSign, BarChart2, PieChart, Circle, LogOut, Menu,
  Calendar, CreditCard, Globe
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function AdminDashboard({ onNavigate }) {
  const {
    products = [], setProducts,
    categories = [], addCategory, deleteCategory, uploadCategoryImage,
    users = [], setUsers,
    orders = [], setOrders,
    siteSettings = {}, setSiteSettings,
    addProduct, deleteProduct, updateProduct,
    updateOrderStatus, assignTrackingId,
    changeUserRole, changeUserStatus, deleteUser,
    logoutUser,
    
    // DESTRUCTURED SELLER CENTRAL NOTIFICATION HOOKS FROM CONTEXT
    notifications = [], readNotification, clearAllNotifications 
  } = useApp();

  // Main tab states
  const [activeTab, setActiveTab] = useState("dashboard");
  const [inventorySubTab, setInventorySubTab] = useState("add-single");
  const [contentsSubTab, setContentsSubTab] = useState("hero-banners");
  const [settingsSubTab, setSettingsSubTab] = useState("site-info");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ACTIVE HEADER BELL DROPDOWN TOGGLE STATE
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Navbar menu settings state
  const [navMenuSettings, setNavMenuSettings] = useState({});

  // Product form states
  const [newProdName, setNewProdName] = useState("");
  const [newProdBrand, setNewProdBrand] = useState("Kabiraaz Fashion");
  const [newProdCategory, setNewProdCategory] = useState("Women");
  const [newProdPrice, setNewProdPrice] = useState(5000);
  const [newProdOldPrice, setNewProdOldPrice] = useState(7000);
  const [newProdStock, setNewProdStock] = useState(10);
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdImg, setNewProdImg] = useState("");
  const [newProdTagInput, setNewProdTagInput] = useState("new");

  // Bulk upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [validationReport, setValidationReport] = useState(null);
  const [isImportCommitted, setIsImportCommitted] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Category form states
  const [newCatName, setNewCatName] = useState("");
  const [newCatSlug, setNewCatSlug] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [newCatImg, setNewCatImg] = useState("");
  const [isUploadingImg, setIsUploadingImg] = useState(false);
  // Filter states
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState("all");

  // Banner states
  const [banner1Badge, setBanner1Badge] = useState("Heritage Leather");
  const [banner1Title, setBanner1Title] = useState("Italian Leather Atelier");
  const [banner1Desc, setBanner1Desc] = useState("Every curve tailored with authentic, durable hides crafted to withstand generations.");
  const [banner1Img, setBanner1Img] = useState("https://images.unsplash.com/photo-1520975916090-3105956dac55?q=80&w=500");

  const [banner2Badge, setBanner2Badge] = useState("The Trench Series");
  const [banner2Title, setBanner2Title] = useState("High-Grade Cashmere");
  const [banner2Desc, setBanner2Desc] = useState("Ultra-lightweight protection and warm drapes designed for world-class city strolls.");
  const [banner2Img, setBanner2Img] = useState("https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=500");

  // Computed values
  const totalRevenue = useMemo(() => orders.reduce((sum, o) => sum + (o.total || 0), 0), [orders]);
  const activeUsersCount = useMemo(() => users.filter(u => u.status === 'Active').length, [users]);
  const lowStockProducts = useMemo(() => products.filter(p => (p.stock || 0) <= 5), [products]);

  // Load navigation menu settings
  useEffect(() => {
    try {
      const savedNavSettings = localStorage.getItem('kabiraaz_nav_settings');
      if (savedNavSettings) {
        setNavMenuSettings(JSON.parse(savedNavSettings));
      } else {
        // Set default values
        setNavMenuSettings({
          menTshirts: true,
          menJeans: true,
          menShirts: true,
          menSports: true,
          menFootwear: true,
          menAccessories: true,
          womenDresses: true,
          womenTops: true,
          womenEthnic: true,
          womenWestern: true,
          womenLingerie: true,
          womenFootwear: true,
          womenAccessories: true,
          kidsBoys: true,
          kidsGirls: true,
          kidsBaby: true,
          kidsUniforms: true,
          kidsFootwear: true,
          kidsToys: true
        });
      }
    } catch (error) {
      console.warn("Failed to load navigation settings:", error);
    }
  }, []);

  // Auto-generate slug when category name changes
  useEffect(() => {
    if (newCatName) {
      const slug = newCatName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setNewCatSlug(slug);
    }
  }, [newCatName]);

  // Load saved banners from localStorage
  useEffect(() => {
    try {
      const savedBanners = localStorage.getItem('luxe_banners_config');
      if (savedBanners) {
        const config = JSON.parse(savedBanners);
        setBanner1Badge(config.banner1?.badge || banner1Badge);
        setBanner1Title(config.banner1?.title || banner1Title);
        setBanner1Desc(config.banner1?.description || banner1Desc);
        setBanner1Img(config.banner1?.image || banner1Img);

        setBanner2Badge(config.banner2?.badge || banner2Badge);
        setBanner2Title(config.banner2?.title || banner2Title);
        setBanner2Desc(config.banner2?.description || banner2Desc);
        setBanner2Img(config.banner2?.image || banner2Img);
      }
    } catch (error) {
      console.warn("Failed to load banners config:", error);
    }
  }, []);

  const salesChartData = [
    { month: 'Jan', Sales: 180000, Orders: 45 },
    { month: 'Feb', Sales: 220000, Orders: 52 },
    { month: 'Mar', Sales: 310000, Orders: 74 },
    { month: 'Apr', Sales: 280000, Orders: 65 },
    { month: 'May', Sales: 420000, Orders: 98 },
    { month: 'Jun', Sales: 510000, Orders: 120 },
    { month: 'Jul', Sales: 680000, Orders: 165 }
  ];

  const categoryChartData = useMemo(() => {
    const counts = {};
    products.forEach(p => {
      const category = p.category || 'General';
      counts[category] = (counts[category] || 0) + (p.stock || 0);
    });
    return Object.keys(counts).map(cat => ({ category: cat, Stock: counts[cat] }));
  }, [products]);

  // Handle logout
  const handleLogout = () => {
    if (logoutUser) logoutUser();
    if (onNavigate) onNavigate('home');
    toast.success("Successfully logged out from Admin Panel");
  };

  // Product handlers
  const handleSingleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdPrice) {
      toast.error("Product name and price are required.");
      return;
    }

    try {
      const tagsArray = newProdTagInput.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
      if (newProdStock <= 5) tagsArray.push('low-stock');

      const result = await addProduct({
        name: newProdName.trim(),
        brand: newProdBrand,
        category: newProdCategory,
        price: Number(newProdPrice),
        oldPrice: Number(newProdOldPrice) || Number(newProdPrice) * 1.3,
        stock: Number(newProdStock),
        description: newProdDesc || "Expertly crafted premium addition to our boutique catalog.",
        image: newProdImg || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400",
        tags: tagsArray.length ? tagsArray : ["new"],
        specs: { "Material": "Premium Blend", "Origin": "Made in India" }
      });

      if (result?.success) {
        toast.success(`${newProdName} added successfully!`);
        setNewProdName(""); setNewProdPrice(5000); setNewProdOldPrice(7000);
        setNewProdStock(10); setNewProdDesc(""); setNewProdImg(""); setNewProdTagInput("new");
      }
    } catch (error) {
      console.error("Add product error:", error);
      toast.error("Failed to add product");
    }
  };

  // Content management handlers
  const handleSaveHeroSlides = () => {
    toast.success("Hero Slides updated!");
  };

  const handleSavePromoBanners = () => {
    try {
      const bannersConfig = {
        banner1: {
          badge: banner1Badge,
          title: banner1Title,
          description: banner1Desc,
          image: banner1Img
        },
        banner2: {
          badge: banner2Badge,
          title: banner2Title,
          description: banner2Desc,
          image: banner2Img
        },
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem('luxe_banners_config', JSON.stringify(bannersConfig));
      toast.success("Promotional banners saved successfully!");
    } catch (error) {
      console.error("Save banners error:", error);
      toast.error("Failed to save banners");
    }
  };

  const handleAddNewCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim() || !newCatSlug.trim()) {
      toast.error("Name and Slug required.");
      return;
    }

    try {
      // Calls AppContext to save the category to MongoDB
      const result = await addCategory({
        name: newCatName.trim(),
        slug: newCatSlug.toLowerCase(),
        image: newCatImg,
        description: newCatDesc
      });

      if (result?.success) {
        setNewCatName("");
        setNewCatSlug("");
        setNewCatDesc("");
        setNewCatImg("");
      }
    } catch (error) {
      console.error("Add category error:", error);
      toast.error("Failed to create category");
    }
  };

  const handleDeleteCategory = async (catId) => {
    const category = categories.find(c => c.id === catId || c._id === catId);
    if (!category) return;

    const result = await deleteCategory(catId);
    if (result?.success) {
      toast.success(`Category "${category.name}" deleted.`);
    }
  };

  const handleToggleProductTag = (productId, tag) => {
    try {
      setProducts(products.map(p => {
        if (p.id === productId) {
          const currentTags = Array.isArray(p.tags) ? p.tags : [];
          const hasTag = currentTags.includes(tag);
          const newTags = hasTag
            ? currentTags.filter(t => t !== tag)
            : [...currentTags, tag];
          return { ...p, tags: newTags };
        }
        return p;
      }));
      toast.success(`Product tag "${tag}" toggled!`);
    } catch (error) {
      console.error("Toggle tag error:", error);
      toast.error("Failed to toggle tag");
    }
  };

  const handleTriggerEditProduct = (prod) => {
    setEditingProduct({ ...prod });
  };

  const handleSaveProductEdit = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
      toast.success(`"${editingProduct.name}" updated.`);
      setEditingProduct(null);
    } catch (error) {
      console.error("Edit product error:", error);
      toast.error("Failed to update product");
    }
  };

  const handleExportStockReport = () => {
    let csv = "SKU ID,Product Name,Category,Price,Stock,Alert Level\n";
    products.forEach(p => {
      const stock = p.stock || 0;
      const alert = stock === 0 ? "OUT OF STOCK" : stock <= 5 ? "LOW STOCK" : "STABLE";
      csv += `"${p.id}","${p.name}","${p.category}",₹${p.price},${stock},"${alert}"\n`;
    });
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", "inventory_stock_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Stock report exported!");
  };

  const handleExportOrdersToCSV = () => {
    let csv = "Order ID,Customer Name,Email,City,Total,Status,Tracking ID\n";
    orders.forEach(o => {
      csv += `"${o.id}","${o.shippingAddress?.fullName || 'N/A'}","${o.customerEmail || ''}","${o.shippingAddress?.city || 'N/A'}",₹${o.total || 0},"${o.status || 'Pending'}","${o.trackingId || 'N/A'}"\n`;
    });
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", "orders_database.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Orders exported!");
  };

  const handleToggleBlockUser = (userId) => {
    const userObj = users.find(u => u.id === userId);
    if (!userObj) return;
    const newStatus = userObj.status === "Blocked" ? "Active" : "Blocked";
    changeUserStatus(userId, newStatus);
    toast.success(`${userObj.name} is now ${newStatus}.`);
  };

  // Filtered catalog for products table
  const filteredCatalog = useMemo(() => {
    if (!products || products.length === 0) return [];
    return products.filter(p => {
      if (!p) return false;
      const searchTerm = catalogSearch.toLowerCase().trim();
      const matchesSearch = searchTerm === '' ||
        p.name?.toLowerCase().includes(searchTerm) ||
        p.brand?.toLowerCase().includes(searchTerm);
      const matchesCategory = catalogCategoryFilter === "all" ||
        p.category?.toLowerCase() === catalogCategoryFilter.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [products, catalogSearch, catalogCategoryFilter]);

  // ✅ ADDED "B2B SELLERS" TO SIDEBAR ITEMS
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutGrid size={16} />, badge: null },
    { id: "inventory", label: "Inventory", icon: <Package size={16} />, badge: products.length },
    { id: "orders", label: "Orders", icon: <ShoppingBag size={16} />, badge: orders.length },
    { id: "sellers", label: "B2B Sellers", icon: <UsersIcon size={16} />, badge: users.filter(u => u.role?.toLowerCase() === 'seller').length }, // ✅ New B2B sellers count badge
    { id: "users", label: "Users", icon: <UsersIcon size={16} />, badge: users.filter(u => u.role?.toLowerCase() !== 'seller').length },
    { id: "contents", label: "Contents", icon: <Sliders size={16} />, badge: null },
    { id: "settings", label: "Settings", icon: <SettingsIcon size={16} />, badge: null }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-100 rounded-2xl p-3 shadow-xl text-xs">
          <p className="font-bold text-[#333333] mb-1">{label}</p>
          {payload.map((entry, i) => (
            <p key={i} style={{ color: entry.color }} className="font-semibold">
              {entry.name}: {entry.name === 'Sales' ? `₹${entry.value.toLocaleString()}` : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F8F8] via-white to-gray-50">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">

        {/* ═══════════════ TOP HEADER BAR ═══════════════ */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden w-10 h-10 bg-[#1A1A3A] rounded-xl flex items-center justify-center shadow-lg"
            >
              <Menu size={18} className="text-white" />
            </button>

            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#1A1A3A] to-[#2E3192] rounded-2xl flex items-center justify-center shadow-lg">
              <Crown size={18} className="text-[#D4AF37]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="font-black text-base sm:text-xl text-[#1A1A3A] tracking-tight">Kabiraaz Control</h1>
                <span className="hidden sm:inline-block text-[9px] bg-[#007A8A] text-white font-bold uppercase tracking-widest px-2 py-0.5 rounded-full animate-pulse">
                  LIVE
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
            <div className="hidden sm:flex items-center gap-2 bg-white border border-gray-100 rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 shadow-sm">
              <div className="w-2 h-2 bg-[#007A8A] rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold text-[#333333]">Active</span>
            </div>
            
            {/* ✅ REAL-TIME SELLER AUDIT ALERTS DROPDOWN */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative w-9 h-9 sm:w-10 sm:h-10 bg-white border border-gray-100 rounded-2xl flex items-center justify-center shadow-sm hover:bg-slate-50 transition-all cursor-pointer outline-none"
              >
                <Bell size={14} className="text-[#333333]" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#D4AF37] text-[#1A1A3A] text-[8px] font-bold rounded-full flex items-center justify-center animate-bounce">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl py-3 px-4 z-50 max-h-96 overflow-y-auto"
                  >
                    <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-3">
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Seller Activity Logs</h4>
                      <button 
                        onClick={() => {
                          clearAllNotifications();
                          toast.success("All seller alerts marked as read!");
                        }}
                        className="text-[10px] text-blue-600 hover:underline font-bold animate-pulse"
                      >
                        Mark all read
                      </button>
                    </div>
                    {notifications.length === 0 ? (
                      <p className="text-center py-8 text-gray-400 text-xs">No recent seller activities</p>
                    ) : (
                      <div className="space-y-3">
                        {notifications.map((n) => (
                          <div 
                            key={n.id || n._id}
                            onClick={() => {
                              readNotification(n.id || n._id);
                              if (n.type === 'PRODUCT_CREATED' || n.type === 'PRICE_CHANGED' || n.type === 'LOW_STOCK') {
                                setActiveTab("inventory");
                              } else if (n.type === 'ORDER_RECEIVED') {
                                setActiveTab("orders");
                              }
                              setNotificationsOpen(false);
                            }}
                            className={`p-2.5 rounded-xl border text-[11px] transition-all cursor-pointer ${
                              n.read 
                                ? 'bg-white border-gray-100 text-gray-500' 
                                : 'bg-orange-50/20 border-orange-100 text-slate-800 font-medium'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider ${
                                n.type === 'PRODUCT_CREATED' ? 'bg-green-100 text-green-700' :
                                n.type === 'PRICE_CHANGED' ? 'bg-orange-100 text-orange-700' :
                                'bg-rose-100 text-rose-700'
                              }`}>
                                {n.type?.replace('_', ' ')}
                              </span>
                              <span className="text-[8px] text-gray-400">
                                {new Date(n.createdAt || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                            <p className="leading-relaxed">{n.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">

          {/* ═══════════════ SIDEBAR ═══════════════ */}
          <aside className={`
            fixed lg:relative inset-0 z-50 lg:z-0
            lg:col-span-3 
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            {/* Overlay for mobile */}
            <div
              className={`fixed inset-0 bg-black/50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
              onClick={() => setSidebarOpen(false)}
            ></div>

            {/* Sidebar content */}
            <div className="relative bg-white lg:bg-transparent h-full lg:h-auto overflow-y-auto lg:overflow-visible w-80 lg:w-full">
              <div className="space-y-2 p-4 lg:p-0">
                {/* Close button for mobile */}
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center"
                >
                  <X size={16} />
                </button>

                {/* Nav Card */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-br from-[#1A1A3A] to-[#2E3192] p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face"
                        alt="Admin"
                        className="w-10 h-10 rounded-2xl object-cover border-2 border-[#D4AF37]/30"
                      />
                      <div>
                        <p className="text-white font-bold text-xs sm:text-sm">Vishal Nishad</p>
                        <p className="text-white/50 text-[10px] font-medium">Super Administrator</p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {[
                        { label: "Products", val: products.length },
                        { label: "Orders", val: orders.length },
                        { label: "Users", val: users.length }
                      ].map((s, i) => (
                        <div key={i} className="bg-white/10 rounded-xl p-2 text-center backdrop-blur-sm">
                          <p className="text-white font-black text-sm sm:text-base">{s.val}</p>
                          <p className="text-white/50 text-[8px] font-bold uppercase">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 space-y-1">
                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest px-3 py-2">Navigation</p>
                    {navItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setSidebarOpen(false); // Close sidebar on mobile after selection
                        }}
                        className={`w-full text-left py-2.5 sm:py-3 px-3 sm:px-4 rounded-2xl text-xs font-bold flex items-center justify-between transition-all duration-200 cursor-pointer group ${activeTab === item.id
                            ? 'bg-gradient-to-r from-[#1A1A3A] to-[#2E3192] text-white shadow-lg shadow-[#1A1A3A]/20'
                            : 'hover:bg-slate-50 text-[#333333] hover:text-[#1A1A3A]'
                          }`}
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className={`transition-transform duration-200 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-105'}`}>
                            {item.icon}
                          </div>
                          <span className="font-semibold text-[11px] uppercase tracking-wider">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {item.badge !== null && (
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${activeTab === item.id ? 'bg-[#D4AF37] text-[#1A1A3A]' : 'bg-slate-100 text-gray-500'
                              }`}>
                              {item.badge}
                            </span>
                          )}
                          <ChevronRight size={12} className={`transition-transform ${activeTab === item.id ? 'translate-x-0.5' : 'opacity-0 group-hover:opacity-50'}`} />
                        </div>
                      </button>
                    ))}

                    {/* Logout Button */}
                    <div className="mt-4 pt-4 border-t border-gray-50">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left py-2.5 sm:py-3 px-3 sm:px-4 rounded-2xl text-xs font-bold flex items-center gap-2 sm:gap-3 transition-all duration-200 cursor-pointer text-rose-500 hover:bg-rose-50 hover:text-rose-600 group"
                      >
                        <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-semibold text-[11px] uppercase tracking-wider">Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-3xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={13} className="text-amber-600" />
                    <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider">Stock Alerts</span>
                  </div>
                  {lowStockProducts.length === 0 ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-[#007A8A]" />
                      <span className="text-[11px] text-[#007A8A] font-semibold">All stock levels healthy</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {lowStockProducts.slice(0, 3).map(p => (
                        <div key={p.id} className="flex items-center justify-between">
                          <span className="text-[10px] text-[#333333] font-semibold truncate max-w-[120px]">{p.name}</span>
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${p.stock === 0 ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                            }`}>
                            {p.stock === 0 ? 'OUT' : `${p.stock} left`}
                          </span>
                        </div>
                      ))}
                      {lowStockProducts.length > 3 && (
                        <p className="text-[9px] text-amber-600 font-bold">+{lowStockProducts.length - 3} more items</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* ═══════════════ MAIN CONTENT ═══════════════ */}
          <main className="lg:col-span-9 min-h-[500px] sm:min-h-[700px]">

            {/* ─── DASHBOARD ─── */}
            {activeTab === "dashboard" && (
              <div className="space-y-4 sm:space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {[
                    {
                      title: "Total Revenue",
                      val: `₹${totalRevenue.toLocaleString()}`,
                      change: "+18.2%",
                      positive: true,
                      icon: <DollarSign size={16} />,
                      color: "from-[#2E3192] to-[#007A8A]",
                      bg: "from-violet-50 to-blue-50",
                      border: "border-blue-100"
                    },
                    {
                      title: "Total Orders",
                      val: orders.length,
                      change: "+12.5%",
                      positive: true,
                      icon: <ShoppingCart size={16} />,
                      color: "from-[#007A8A] to-[#2E3192]",
                      bg: "from-blue-50 to-cyan-50",
                      border: "border-cyan-100"
                    },
                    {
                      title: "Active Users",
                      val: users.length,
                      change: "+8.1%",
                      positive: true,
                      icon: <UsersIcon size={16} />,
                      color: "from-[#007A8A] to-teal-600",
                      bg: "from-emerald-50 to-teal-50",
                      border: "border-emerald-100"
                    },
                    {
                      title: "Low Stock",
                      val: lowStockProducts.length,
                      change: "Needs attention",
                      positive: false,
                      icon: <AlertTriangle size={16} />,
                      color: "from-rose-500 to-orange-500",
                      bg: "from-rose-50 to-orange-50",
                      border: "border-rose-100"
                    }
                  ].map((st, i) => (
                    <div key={i} className={`bg-gradient-to-br ${st.bg} border ${st.border} rounded-2xl sm:rounded-3xl p-3 sm:p-5 relative overflow-hidden group hover:shadow-lg transition-all duration-300`}>
                      <div className={`absolute -top-4 -right-4 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br ${st.color} rounded-full opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                      <div className={`w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br ${st.color} rounded-xl flex items-center justify-center text-white mb-3 sm:mb-4 shadow-lg`}>
                        {st.icon}
                      </div>
                      <p className="text-[8px] sm:text-[9px] text-gray-500 font-black uppercase tracking-widest">{st.title}</p>
                      <p className="text-lg sm:text-2xl font-black text-[#1A1A3A] mt-1">{st.val}</p>
                      <div className="flex items-center gap-1 mt-2">
                        {st.positive ? <ArrowUpRight size={10} className="text-[#007A8A]" /> : <AlertTriangle size={9} className="text-amber-600" />}
                        <span className={`text-[9px] font-bold ${st.positive ? 'text-[#007A8A]' : 'text-amber-600'}`}>{st.change}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-5">
                  {/* Sales Chart */}
                  <div className="lg:col-span-3 bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0 mb-4 sm:mb-6">
                      <div>
                        <h3 className="font-black text-xs sm:text-sm text-[#1A1A3A] uppercase tracking-wide">Revenue Trajectory</h3>
                        <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Monthly net sales</p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-[#007A8A]/10 border border-[#007A8A]/20 px-3 py-1.5 rounded-full">
                        <TrendingUp size={11} className="text-[#007A8A]" />
                        <span className="text-[10px] text-[#007A8A] font-black">+18% YoY</span>
                      </div>
                    </div>
                    <div className="h-44 sm:h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={salesChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#007A8A" stopOpacity={0.3} />
                              <stop offset="100%" stopColor="#007A8A" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                          <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#94A3B8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 9, fill: '#94A3B8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey="Sales" stroke="#007A8A" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGrad)" dot={{ fill: '#007A8A', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#007A8A', strokeWidth: 2, stroke: '#fff' }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Category Chart */}
                  <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-6 shadow-sm">
                    <div className="mb-4 sm:mb-6">
                      <h3 className="font-black text-xs sm:text-sm text-[#1A1A3A] uppercase tracking-wide">Stock Distribution</h3>
                      <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Live inventory</p>
                    </div>
                    <div className="h-44 sm:h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#007A8A" />
                              <stop offset="100%" stopColor="#2E3192" />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                          <XAxis dataKey="category" tick={{ fontSize: 8, fill: '#94A3B8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 9, fill: '#94A3B8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="Stock" fill="url(#barGrad)" radius={[8, 8, 0, 0]} barSize={20} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Recent Orders Table */}
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 sm:p-6 border-b border-gray-50">
                    <div>
                      <h3 className="font-black text-xs sm:text-sm text-[#1A1A3A] uppercase tracking-wide">Recent Orders</h3>
                      <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Latest fulfillment pipeline</p>
                    </div>
                    <button
                      onClick={() => setActiveTab("orders")}
                      className="flex items-center gap-2 text-[10px] font-black text-[#1A1A3A] uppercase tracking-wider hover:gap-3 transition-all"
                    >
                      View All <ArrowRight size={12} />
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50/80">
                          <th className="text-left p-3 sm:p-4 text-gray-400 font-black uppercase text-[9px] tracking-widest">Order ID</th>
                          <th className="text-left p-3 sm:p-4 text-gray-400 font-black uppercase text-[9px] tracking-widest">Client</th>
                          <th className="text-left p-3 sm:p-4 text-gray-400 font-black uppercase text-[9px] tracking-widest">Amount</th>
                          <th className="text-left p-3 sm:p-4 text-gray-400 font-black uppercase text-[9px] tracking-widest">Status</th>
                          <th className="text-left p-3 sm:p-4 text-gray-400 font-black uppercase text-[9px] tracking-widest hidden sm:table-cell">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 4).map((o, idx) => (
                          <tr key={o.id} className={`border-b border-gray-50 hover:bg-slate-50/50 transition-colors ${idx === orders.slice(0, 4).length - 1 ? 'border-0' : ''}`}>
                            <td className="p-3 sm:p-4 font-black text-[#1A1A3A] font-mono text-[10px] sm:text-[11px]">{o.id}</td>
                            <td className="p-3 sm:p-4">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
                                  <span className="text-[9px] sm:text-[10px] font-black text-[#333333]">
                                    {o.shippingAddress?.fullName?.charAt(0) || 'U'}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-bold text-[#1A1A3A] text-[10px] sm:text-[11px]">{o.shippingAddress?.fullName || 'Unknown'}</p>
                                  <p className="text-gray-400 text-[9px]">{o.shippingAddress?.city || 'Unknown'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 sm:p-4 font-black text-[#1A1A3A] font-mono text-[10px] sm:text-xs">₹{(o.total || 0).toLocaleString()}</td>
                            <td className="p-3 sm:p-4">
                              <span className={`px-2 py-1 rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${o.status === 'Delivered' ? 'bg-[#007A8A]/10 text-[#007A8A] border border-[#007A8A]/20' :
                                  o.status === 'Shipped' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                    'bg-amber-50 text-amber-700 border border-amber-100'
                                }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${o.status === 'Delivered' ? 'bg-[#007A8A]' :
                                    o.status === 'Shipped' ? 'bg-blue-500' : 'bg-amber-500'
                                  }`}></span>
                                {o.status || 'Pending'}
                              </span>
                            </td>
                            <td className="p-3 sm:p-4 hidden sm:table-cell">
                              <button
                                onClick={() => setActiveTab("orders")}
                                className="text-[10px] font-black text-[#1A1A3A] border border-gray-200 hover:border-[#1A1A3A] hover:bg-[#1A1A3A] hover:text-white px-3 py-1.5 rounded-xl transition-all cursor-pointer uppercase tracking-wider flex items-center gap-1"
                              >
                                Manage <ArrowRight size={9} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ─── INVENTORY ─── */}
            {activeTab === "inventory" && (
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6">
                <InventoryManagement onEditProduct={handleTriggerEditProduct} />
              </div>
            )}

            {/* ─── ORDERS ─── */}
            {activeTab === "orders" && (
              <div className="space-y-4 sm:space-y-5">
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div>
                      <h3 className="font-black text-xs sm:text-sm text-[#1A1A3A] uppercase tracking-wide">Order Management</h3>
                      <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">Update fulfillment & tracking</p>
                    </div>
                    <button
                      onClick={handleExportOrdersToCSV}
                      className="w-full sm:w-auto bg-gradient-to-r from-[#1A1A3A] to-[#2E3192] hover:from-[#2E3192] hover:to-[#1A1A3A] text-white text-[10px] font-black uppercase tracking-widest py-2.5 sm:py-3 px-4 sm:px-5 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#1A1A3A]/20 hover:shadow-xl hover:-translate-y-0.5"
                    >
                      <Download size={13} />
                      Export CSV
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-xl sm:rounded-2xl border border-gray-100">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gradient-to-r from-slate-50 to-gray-50">
                          <th className="text-left p-3 sm:p-4 text-gray-400 font-black uppercase text-[9px] tracking-widest border-b border-gray-100">Order ID</th>
                          <th className="text-left p-3 sm:p-4 text-gray-400 font-black uppercase text-[9px] tracking-widest border-b border-gray-100">Customer</th>
                          <th className="text-left p-3 sm:p-4 text-gray-400 font-black uppercase text-[9px] tracking-widest border-b border-gray-100 hidden lg:table-cell">Items</th>
                          <th className="text-left p-3 sm:p-4 text-gray-400 font-black uppercase text-[9px] tracking-widest border-b border-gray-100">Total</th>
                          <th className="text-left p-3 sm:p-4 text-gray-400 font-black uppercase text-[9px] tracking-widest border-b border-gray-100 hidden md:table-cell">Tracking</th>
                          <th className="text-left p-3 sm:p-4 text-gray-400 font-black uppercase text-[9px] tracking-widest border-b border-gray-100">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((o, idx) => (
                          <tr key={o.id} className={`hover:bg-slate-50/60 transition-colors ${idx !== orders.length - 1 ? 'border-b border-gray-50' : ''}`}>
                            <td className="p-3 sm:p-4 font-black text-[#1A1A3A] font-mono text-[10px] sm:text-[11px]">{o.id}</td>
                            <td className="p-3 sm:p-4">
                              <p className="font-bold text-[#1A1A3A] text-[10px] sm:text-xs">{o.shippingAddress?.fullName || 'Unknown'}</p>
                              <p className="text-[9px] text-gray-400">{o.shippingAddress?.city || 'Unknown'}</p>
                            </td>
                            <td className="p-3 sm:p-4 text-[#333333] text-[10px] max-w-[140px] truncate hidden lg:table-cell">
                              {o.items?.map(item => `${item.name} (${item.quantity})`).join(', ') || 'No items'}
                            </td>
                            <td className="p-3 sm:p-4 font-black text-[#1A1A3A] font-mono text-[10px] sm:text-xs">₹{(o.total || 0).toLocaleString()}</td>
                            <td className="p-3 sm:p-4 hidden md:table-cell">
                              <input
                                type="text"
                                placeholder="Tracking ID..."
                                className="bg-slate-50 border border-transparent hover:border-gray-200 focus:border-[#007A8A] rounded-xl py-2 px-3 text-[10px] focus:outline-none focus:bg-white text-[#1A1A3A] font-mono font-semibold placeholder-gray-300 transition-all w-32 sm:w-40"
                                value={o.trackingId || ""}
                                onChange={(e) => assignTrackingId(o.id, e.target.value)}
                              />
                            </td>
                            <td className="p-3 sm:p-4">
                              <select
                                value={o.status || 'Ordered'}
                                onChange={(e) => {
                                  updateOrderStatus(o.id, e.target.value);
                                  toast.success(`Order #${o.id} → ${e.target.value}`);
                                }}
                                className={`border rounded-xl py-1.5 sm:py-2 px-2 sm:px-3 text-[9px] font-black uppercase tracking-wider focus:outline-none cursor-pointer transition-all ${o.status === "Delivered" ? 'bg-[#007A8A]/10 text-[#007A8A] border-[#007A8A]/20' :
                                    o.status === "Shipped" ? 'bg-blue-50 text-blue-800 border-blue-200' :
                                      'bg-amber-50 text-amber-800 border-amber-200'
                                  }`}
                              >
                                {["Ordered", "Confirmed", "Shipped", "Out for Delivery", "Delivered"].map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ─── USERS ─── */}
            {activeTab === "users" && (
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-50">
                  <h3 className="font-black text-xs sm:text-sm text-[#1A1A3A] uppercase tracking-wide">User Management</h3>
                  <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">Manage access & permissions</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50/80">
                        <th className="text-left p-3 sm:p-4 text-gray-400 font-black uppercase text-[9px] tracking-widest">User Profile</th>
                        <th className="text-left p-3 sm:p-4 text-gray-400 font-black uppercase text-[9px] tracking-widest hidden sm:table-cell">Role</th>
                        <th className="text-left p-3 sm:p-4 text-gray-400 font-black uppercase text-[9px] tracking-widest">Status</th>
                        <th className="text-center p-3 sm:p-4 text-gray-400 font-black uppercase text-[9px] tracking-widest">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u, idx) => (
                        <tr key={u.id} className={`hover:bg-slate-50/60 transition-colors ${idx !== users.length - 1 ? 'border-b border-gray-50' : ''}`}>
                          <td className="p-3 sm:p-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="relative">
                                <img src={u.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop'} alt={u.name} className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl object-cover border border-slate-100" />
                                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-white ${u.status === 'Active' ? 'bg-[#007A8A]' : 'bg-rose-400'}`}></span>
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <p className="font-black text-[#1A1A3A] text-[10px] sm:text-xs">{u.name}</p>
                                  {/* ✅ DYNAMIC HOLIDAY STATUS INDICATOR FOR ADMINS TO TRACK SELLERS */}
                                  {u.role?.toLowerCase() === 'seller' && u.isHolidayMode && (
                                    <span className="text-[8px] bg-rose-50 text-rose-600 font-bold px-1.5 py-0.5 rounded border border-rose-100 leading-none">
                                      🌴 On Leave
                                    </span>
                                  )}
                                </div>
                                <p className="text-[9px] sm:text-[10px] text-gray-400 font-mono">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 sm:p-4 hidden sm:table-cell">
                            <select
                              value={u.role || 'Customer'}
                              onChange={(e) => {
                                changeUserRole(u.id, e.target.value);
                                toast.success(`${u.name} → ${e.target.value}`);
                              }}
                              className="bg-slate-50 hover:bg-white border border-slate-100 hover:border-gray-300 rounded-xl py-2 px-3 text-[10px] font-black uppercase tracking-wider text-[#333333] focus:outline-none cursor-pointer transition-all"
                            >
                              {["Customer", "Admin", "Vendor", "Staff"].map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                          </td>
                          <td className="p-3 sm:p-4">
                            <span className={`inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider ${u.status === 'Blocked' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-[#007A8A]/10 text-[#007A8A] border border-[#007A8A]/20'
                              }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Blocked' ? 'bg-rose-500' : 'bg-[#007A8A]'}`}></span>
                              {u.status || 'Active'}
                            </span>
                          </td>
                          <td className="p-3 sm:p-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleToggleBlockUser(u.id)}
                                className={`p-2 rounded-xl border transition-all cursor-pointer ${u.status === 'Blocked'
                                    ? 'bg-[#007A8A]/10 hover:bg-[#007A8A]/20 text-[#007A8A] border-[#007A8A]/20 hover:border-[#007A8A]/30'
                                    : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-100 hover:border-rose-200'
                                  }`}
                                title={u.status === 'Blocked' ? 'Unblock' : 'Block'}
                              >
                                {u.status === 'Blocked' ? <Unlock size={12} /> : <Lock size={12} />}
                              </button>
                              <button
                                onClick={() => { deleteUser(u.id); toast.error(`${u.name} deleted.`); }}
                                className="bg-slate-50 hover:bg-red-50 text-gray-400 hover:text-rose-500 border border-slate-100 hover:border-rose-100 p-2 rounded-xl transition-all cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ─── CONTENTS ─── */}
            {activeTab === "contents" && (
              <div className="space-y-4 sm:space-y-5">
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6">
                  <h3 className="font-black text-xs sm:text-sm text-[#1A1A3A] uppercase tracking-wide">Content Management</h3>
                  <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">Edit banners, categories & featured products</p>

                  {/* Sub Nav */}
                  <div className="flex gap-2 mt-4 sm:mt-5 flex-wrap">
                    {[
                      { id: "hero-banners", label: "Hero", icon: <ImageIcon size={11} /> },
                      { id: "categories", label: "Categories", icon: <Layers size={11} /> },
                      { id: "banners", label: "Banners", icon: <Sliders size={11} /> },
                      { id: "navbar-menus", label: "Navigation", icon: <Menu size={11} /> },
                      { id: "reels", label: "Reels", icon: <Flame size={11} /> },
                      { id: "featured", label: "Featured", icon: <Star size={11} /> },
                      { id: "products", label: "Products", icon: <Package size={11} /> }
                    ].map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => setContentsSubTab(sub.id)}
                        className={`py-2 px-3 sm:py-2.5 sm:px-4 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border ${contentsSubTab === sub.id
                            ? 'bg-gradient-to-r from-[#1A1A3A] to-[#2E3192] text-white border-[#1A1A3A] shadow-lg shadow-[#1A1A3A]/20'
                            : 'bg-slate-50 text-[#333333] border-transparent hover:bg-slate-100 hover:border-slate-200'
                          }`}
                      >
                        {sub.icon}
                        <span className="hidden sm:inline">{sub.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Hero Banners ── */}
                {contentsSubTab === "hero-banners" && (
                  <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-4 sm:space-y-5">
                    <div>
                      <h4 className="font-black text-xs text-[#1A1A3A] uppercase tracking-wider">Homepage Hero Slider</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">Configure main landing page slides</p>
                    </div>

                    <div className="grid gap-4">
                      {/* Slide 1 */}
                      <div className="border border-gray-100 rounded-xl sm:rounded-2xl overflow-hidden">
                        <div className="bg-gradient-to-r from-[#1A1A3A] to-[#2E3192] px-4 sm:px-5 py-2.5 sm:py-3 flex items-center gap-2">
                          <span className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse"></span>
                          <span className="text-[10px] text-white font-black uppercase tracking-widest">Primary Slide • Active</span>
                        </div>
                        <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
                          <div className="space-y-1.5">
                            <label className="font-black text-gray-500 uppercase tracking-widest text-[9px]">Subtitle Tag</label>
                            <input
                              type="text"
                              className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-[#007A8A] py-2 sm:py-2.5 px-3 sm:px-3.5 rounded-xl focus:outline-none text-[11px] transition-all focus:bg-white"
                              value={siteSettings.heroSubtitle || ''}
                              onChange={(e) => setSiteSettings({ ...siteSettings, heroSubtitle: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="font-black text-gray-500 uppercase tracking-widest text-[9px]">Main Heading</label>
                            <input
                              type="text"
                              className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-[#007A8A] py-2 sm:py-2.5 px-3 sm:px-3.5 rounded-xl focus:outline-none text-[11px] font-bold transition-all focus:bg-white"
                              value={siteSettings.heroTitle || ''}
                              onChange={(e) => setSiteSettings({ ...siteSettings, heroTitle: e.target.value })}
                            />
                          </div>
                          <div className="sm:col-span-2 space-y-1.5">
                            <label className="font-black text-gray-500 uppercase tracking-widest text-[9px]">Description</label>
                            <textarea rows={2} className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-[#007A8A] py-2 sm:py-2.5 px-3 sm:px-3.5 rounded-xl focus:outline-none text-[11px] transition-all focus:bg-white resize-none"
                              value={siteSettings.heroDescription || ''}
                              onChange={(e) => setSiteSettings({ ...siteSettings, heroDescription: e.target.value })}
                            />
                          </div>
                          <div className="sm:col-span-2 space-y-1.5">
                            <label className="font-black text-gray-500 uppercase tracking-widest text-[9px]">Image URL</label>
                            <input
                              type="text"
                              className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-[#007A8A] py-2 sm:py-2.5 px-3 sm:px-3.5 rounded-xl focus:outline-none text-[11px] font-mono transition-all focus:bg-white"
                              value={siteSettings.heroImage || ''}
                              onChange={(e) => setSiteSettings({ ...siteSettings, heroImage: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Slide 2 */}
                      <div className="border border-gray-100 rounded-xl sm:rounded-2xl overflow-hidden">
                        <div className="bg-slate-100 px-4 sm:px-5 py-2.5 sm:py-3 flex items-center gap-2">
                          <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                          <span className="text-[10px] text-[#333333] font-black uppercase tracking-widest">Slide 2</span>
                        </div>
                        <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
                          <div className="space-y-1.5">
                            <label className="font-black text-gray-500 uppercase tracking-widest text-[9px]">Subtitle</label>
                            <input type="text" className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-[#007A8A] py-2 sm:py-2.5 px-3 sm:px-3.5 rounded-xl focus:outline-none text-[11px] transition-all focus:bg-white"
                              value={siteSettings.slide2Subtitle || ''}
                              onChange={(e) => setSiteSettings({ ...siteSettings, slide2Subtitle: e.target.value })} />
                          </div>
                          <div className="space-y-1.5">
                            <label className="font-black text-gray-500 uppercase tracking-widest text-[9px]">Heading</label>
                            <input type="text" className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-[#007A8A] py-2 sm:py-3 px-3 sm:px-4 rounded-xl focus:outline-none text-[11px] font-bold transition-all focus:bg-white"
                              value={siteSettings.slide2Title || ''}
                              onChange={(e) => setSiteSettings({ ...siteSettings, slide2Title: e.target.value })} />
                          </div>
                          <div className="sm:col-span-2 space-y-1.5">
                            <label className="font-black text-gray-500 uppercase tracking-widest text-[9px]">Description</label>
                            <textarea rows={2} className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-[#007A8A] py-2 sm:py-3 px-3 sm:px-4 rounded-xl focus:outline-none text-[11px] transition-all focus:bg-white resize-none"
                              value={siteSettings.slide2Description || ''}
                              onChange={(e) => setSiteSettings({ ...siteSettings, slide2Description: e.target.value })} />
                          </div>
                          <div className="sm:col-span-2 space-y-1.5">
                            <label className="font-black text-gray-500 uppercase tracking-widest text-[9px]">Image URL</label>
                            <input type="text" className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-[#007A8A] py-2 sm:py-3 px-3 sm:px-4 rounded-xl focus:outline-none text-[11px] font-mono transition-all focus:bg-white"
                              value={siteSettings.slide2Image || ''}
                              onChange={(e) => setSiteSettings({ ...siteSettings, slide2Image: e.target.value })} />
                          </div>
                          <div className="space-y-1.5">
                            <label className="font-black text-gray-500 uppercase tracking-widest text-[9px]">Link Category</label>
                            <select className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-[#007A8A] py-2 sm:py-3 px-3 sm:px-4 rounded-xl focus:outline-none text-[11px] transition-all focus:bg-white cursor-pointer"
                              value={siteSettings.slide2Category || 'Men'}
                              onChange={(e) => setSiteSettings({ ...siteSettings, slide2Category: e.target.value })}>
                              <option value="Men">Men</option>
                              <option value="Women">Women</option>
                              <option value="Kids">Kids</option>
                              <option value="Accessories">Accessories</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Slide 3 */}
                      <div className="border border-gray-100 rounded-xl sm:rounded-2xl overflow-hidden">
                        <div className="bg-slate-100 px-4 sm:px-5 py-2.5 sm:py-3 flex items-center gap-2">
                          <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                          <span className="text-[10px] text-[#333333] font-black uppercase tracking-widest">Slide 3</span>
                        </div>
                        <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
                          <div className="space-y-1.5">
                            <label className="font-black text-gray-500 uppercase tracking-widest text-[9px]">Subtitle</label>
                            <input type="text" className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-[#007A8A] py-2 sm:py-3 px-3 sm:px-4 rounded-xl focus:outline-none text-[11px] transition-all focus:bg-white"
                              value={siteSettings.slide3Subtitle || ''}
                              onChange={(e) => setSiteSettings({ ...siteSettings, slide3Subtitle: e.target.value })} />
                          </div>
                          <div className="space-y-1.5">
                            <label className="font-black text-gray-500 uppercase tracking-widest text-[9px]">Heading</label>
                            <input type="text" className="w-full bg-slate-50 border border-transparent hover:border-[#007A8A] py-2 sm:py-3 px-3 sm:px-4 rounded-xl focus:outline-none text-[11px] font-mono transition-all focus:bg-white"
                              value={siteSettings.slide3Image || ''}
                              onChange={(e) => setSiteSettings({ ...siteSettings, slide3Image: e.target.value })} />
                          </div>
                          <div className="space-y-1.5">
                            <label className="font-black text-gray-500 uppercase tracking-widest text-[9px]">Link Category</label>
                            <select className="w-full bg-slate-50 border border-transparent hover:border-[#007A8A] py-2 sm:py-3 px-3 sm:px-4 rounded-xl focus:outline-none text-[11px] transition-all focus:bg-white cursor-pointer"
                              value={siteSettings.slide3Category || 'Women'}
                              onChange={(e) => setSiteSettings({ ...siteSettings, slide3Category: e.target.value })}>
                              <option value="Men">Men</option>
                              <option value="Women">Women</option>
                              <option value="Kids">Kids</option>
                              <option value="Accessories">Accessories</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveHeroSlides}
                        className="w-full sm:w-auto bg-gradient-to-r from-[#1A1A3A] to-[#2E3192] hover:from-[#2E3192] hover:to-[#1A1A3A] text-white text-[10px] font-black uppercase tracking-widest py-2.5 sm:py-3 px-5 sm:px-6 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#1A1A3A]/20 hover:-translate-y-0.5"
                      >
                        <Save size={12} /> Save Slider
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Categories ── */}
                {contentsSubTab === "categories" && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">
                    <div className="md:col-span-7 bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="p-4 sm:p-5 border-b border-gray-50">
                        <h4 className="font-black text-xs text-[#1A1A3A] uppercase tracking-wider">Collection Categories</h4>
                      </div>
                      <div className="divide-y divide-gray-50">
                        {categories.map(cat => (
                          <div key={cat.id} className="flex items-center justify-between p-3 sm:p-4 hover:bg-slate-50/60 transition-colors group">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <img src={cat.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=60'} alt={cat.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl object-cover border border-slate-100" />
                              <div>
                                <p className="font-black text-[#1A1A3A] text-xs sm:text-sm">{cat.name}</p>
                                <p className="text-[9px] sm:text-[10px] text-gray-400 font-mono">/{cat.slug}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="opacity-0 group-hover:opacity-100 text-rose-500 hover:bg-rose-50 p-2 rounded-xl border border-transparent hover:border-rose-100 cursor-pointer transition-all"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    
<form onSubmit={handleAddNewCategory} className="md:col-span-5 bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-5 space-y-3 sm:space-y-4">
  <h4 className="font-black text-xs text-[#1A1A3A] uppercase tracking-wider">Add Category</h4>
  
  <div className="space-y-1.5">
    <label className="font-black text-gray-500 uppercase tracking-widest text-[9px]">Category Name *</label>
    <input
      type="text"
      required
      placeholder="e.g. Footwear"
      className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-[#007A8A] py-2 sm:py-2.5 px-3 sm:px-3.5 rounded-xl focus:outline-none text-[11px] transition-all focus:bg-white"
      value={newCatName}
      onChange={(e) => setNewCatName(e.target.value)}
    />
  </div>

  <div className="space-y-1.5">
    <label className="font-black text-gray-500 uppercase tracking-widest text-[9px]">Slug Key *</label>
    <input
      type="text"
      required
      placeholder="e.g. footwear"
      className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-[#007A8A] py-2 sm:py-2.5 px-3 sm:px-3.5 rounded-xl focus:outline-none text-[11px] transition-all focus:bg-white font-mono"
      value={newCatSlug}
      onChange={(e) => setNewCatSlug(e.target.value)}
    />
  </div>

  {/* 📂 DYNAMIC IMAGE FILE UPLOADER WITH PREVIEW */}
  <div className="space-y-1.5">
    <label className="font-black text-gray-500 uppercase tracking-widest text-[9px]">Cover Image</label>
    <div className="flex items-center gap-3">
      {newCatImg && (
        <img 
          src={newCatImg} 
          alt="Preview" 
          className="w-12 h-12 rounded-xl object-cover border border-gray-100 flex-shrink-0"
        />
      )}
      <div className="relative flex-1">
        <input
          type="file"
          accept="image/*"
          id="cat-img-file"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setIsUploadingImg(true);
            try {
              const res = await uploadCategoryImage(file);
              if (res?.success) {
                setNewCatImg(res.imageUrl);
                toast.success("Cover image uploaded dynamically!");
              }
            } catch {
              toast.error("Image upload failed");
            } finally {
              setIsUploadingImg(false);
            }
          }}
        />
        <label
          htmlFor="cat-img-file"
          className="w-full border border-dashed border-gray-300 hover:border-[#007A8A] bg-slate-50 hover:bg-slate-100 rounded-xl py-2 px-3 text-[10px] font-bold text-gray-600 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          {isUploadingImg ? "Uploading..." : newCatImg ? "Change Cover Image" : "Upload Custom Cover Image"}
        </label>
      </div>
    </div>
  </div>

  <div className="space-y-1.5">
    <label className="font-black text-gray-500 uppercase tracking-widest text-[9px]">Description</label>
    <textarea rows={2} placeholder="Describe this collection..." className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-[#007A8A] py-2 sm:py-2.5 px-3 sm:px-3.5 rounded-xl focus:outline-none text-[11px] transition-all focus:bg-white resize-none"
      value={newCatDesc} onChange={(e) => setNewCatDesc(e.target.value)} />
  </div>

  <button type="submit" className="w-full bg-gradient-to-r from-[#1A1A3A] to-[#2E3192] hover:from-[#2E3192] hover:to-[#1A1A3A] text-white text-[10px] font-black uppercase tracking-widest py-3 sm:py-3.5 rounded-xl sm:rounded-2xl cursor-pointer transition-all shadow-lg shadow-[#1A1A3A]/20 hover:-translate-y-0.5 flex items-center justify-center gap-2">
    <Plus size={13} /> Create Category
  </button>
</form>
                  </div>
                )}

                {/* ── Banners ── */}
                {contentsSubTab === "banners" && (
                  <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-4 sm:space-y-5">
                    <div>
                      <h4 className="font-black text-xs text-[#1A1A3A] uppercase tracking-wider">Promotional Banners</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">Homepage promo layouts</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                      {[
                        {
                          label: "Left Block",
                          badge: banner1Badge, setBadge: setBanner1Badge,
                          title: banner1Title, setTitle: setBanner1Title,
                          desc: banner1Desc, setDesc: setBanner1Desc,
                          img: banner1Img, setImg: setBanner1Img
                        },
                        {
                          label: "Right Block",
                          badge: banner2Badge, setBadge: setBanner2Badge,
                          title: banner2Title, setTitle: setBanner2Title,
                          desc: banner2Desc, setDesc: setBanner2Desc,
                          img: banner2Img, setImg: setBanner2Img
                        }
                      ].map((b, i) => (
                        <div key={i} className="border border-gray-100 rounded-xl sm:rounded-2xl overflow-hidden">
                          <div className="bg-gradient-to-r from-[#1A1A3A] to-[#2E3192] px-4 sm:px-5 py-2.5 sm:py-3">
                            <span className="text-[10px] text-white font-black uppercase tracking-widest">{b.label}</span>
                          </div>
                          <div className="p-4 sm:p-5 space-y-3">
                            {[
                              { label: "Badge", val: b.badge, set: b.setBadge },
                              { label: "Heading", val: b.title, set: b.setTitle },
                              { label: "Image URL", val: b.img, set: b.setImg }
                            ].map((field, j) => (
                              <div key={j} className="space-y-1.5">
                                <label className="font-black text-gray-500 uppercase tracking-widest text-[9px]">{field.label}</label>
                                <input type="text" className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-[#007A8A] py-2 sm:py-2.5 px-3 sm:px-3.5 rounded-xl focus:outline-none text-[11px] transition-all focus:bg-white"
                                  value={field.val} onChange={(e) => field.set(e.target.value)} />
                              </div>
                            ))}
                            <div className="space-y-1.5">
                              <label className="font-black text-gray-500 uppercase tracking-widest text-[9px]">Description</label>
                              <textarea rows={2} className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-[#007A8A] py-2 sm:py-2.5 px-3 sm:px-3.5 rounded-xl focus:outline-none text-[11px] transition-all focus:bg-white resize-none"
                                value={b.desc} onChange={(e) => b.setDesc(e.target.value)} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end border-t border-gray-50 pt-4">
                      <button onClick={handleSavePromoBanners} className="w-full sm:w-auto bg-gradient-to-r from-[#1A1A3A] to-[#2E3192] hover:from-[#2E3192] hover:to-[#1A1A3A] text-white text-[10px] font-black uppercase tracking-widest py-2.5 sm:py-3 px-5 sm:px-6 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#1A1A3A]/20 hover:-translate-y-0.5">
                        <Save size={12} /> Save Banners
                      </button>
                    </div>
                  </div>
                )}

                {/* ── NAVBAR MENUS ─── */}
                {contentsSubTab === "navbar-menus" && (
                  <div className="space-y-4 sm:space-y-5">
                    <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6">
                      <h4 className="font-black text-xs text-[#1A1A3A] uppercase tracking-wider">Navigation Menu Configuration</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">Configure main navigation menus for better user experience</p>

                      {/* Men's Menu */}
                      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                        <div className="border border-blue-100 rounded-xl sm:rounded-2xl overflow-hidden">
                          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
                            <h5 className="text-white font-black text-xs uppercase tracking-wider">👨 Men's Collection</h5>
                          </div>
                          <div className="p-4 space-y-3">
                            {[
                              { label: "T-Shirts & Polos", key: "menTshirts", desc: "Casual & formal tees" },
                              { label: "Jeans & Trousers", key: "menJeans", desc: "Denim & formal pants" },
                              { label: "Shirts & Blazers", key: "menShirts", desc: "Formal & casual wear" },
                              { label: "Sportswear", key: "menSports", desc: "Active & gym wear" },
                              { label: "Footwear", key: "menFootwear", desc: "Shoes & sneakers" },
                              { label: "Accessories", key: "menAccessories", desc: "Watches, belts, wallets" }
                            ].map((item) => (
                              <div key={item.key} className="flex items-center justify-between p-2 hover:bg-blue-50 rounded-lg transition-colors">
                                <div>
                                  <p className="text-xs font-bold text-gray-800">{item.label}</p>
                                  <p className="text-[9px] text-gray-500">{item.desc}</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={navMenuSettings[item.key] !== false}
                                    onChange={(e) => setNavMenuSettings({
                                      ...navMenuSettings,
                                      [item.key]: e.target.checked
                                    })}
                                  />
                                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Women's Menu */}
                        <div className="border border-pink-100 rounded-xl sm:rounded-2xl overflow-hidden">
                          <div className="bg-gradient-to-r from-pink-600 to-rose-600 px-4 py-3">
                            <h5 className="text-white font-black text-xs uppercase tracking-wider">👩 Women's Collection</h5>
                          </div>
                          <div className="p-4 space-y-3">
                            {[
                              { label: "Dresses & Gowns", key: "womenDresses", desc: "Party & casual dresses" },
                              { label: "Tops & Blouses", key: "womenTops", desc: "Shirts & crop tops" },
                              { label: "Ethnic Wear", key: "womenEthnic", desc: "Sarees, suits, lehenga" },
                              { label: "Western Wear", key: "womenWestern", desc: "Jeans, skirts, shorts" },
                              { label: "Lingerie", key: "womenLingerie", desc: "Innerwear & sleepwear" },
                              { label: "Footwear", key: "womenFootwear", desc: "Heels, flats, boots" },
                              { label: "Bags & Jewelry", key: "womenAccessories", desc: "Handbags & accessories" }
                            ].map((item) => (
                              <div key={item.key} className="flex items-center justify-between p-2 hover:bg-pink-50 rounded-lg transition-colors">
                                <div>
                                  <p className="text-xs font-bold text-gray-800">{item.label}</p>
                                  <p className="text-[9px] text-gray-500">{item.desc}</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={navMenuSettings[item.key] !== false}
                                    onChange={(e) => setNavMenuSettings({
                                      ...navMenuSettings,
                                      [item.key]: e.target.checked
                                    })}
                                  />
                                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-600"></div>
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Kids Menu */}
                        <div className="border border-green-100 rounded-xl sm:rounded-2xl overflow-hidden">
                          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3">
                            <h5 className="text-white font-black text-xs uppercase tracking-wider">👶 Kids Collection</h5>
                          </div>
                          <div className="p-4 space-y-3">
                            {[
                              { label: "Boys Clothing", key: "kidsBoys", desc: "Shirts, pants, shorts" },
                              { label: "Girls Clothing", key: "kidsGirls", desc: "Dresses, tops, skirts" },
                              { label: "Baby Wear", key: "kidsBaby", desc: "0-2 years clothing" },
                              { label: "School Uniforms", key: "kidsUniforms", desc: "School essentials" },
                              { label: "Kids Footwear", key: "kidsFootwear", desc: "Shoes & sandals" },
                              { label: "Toys & Games", key: "kidsToys", desc: "Educational toys" }
                            ].map((item) => (
                              <div key={item.key} className="flex items-center justify-between p-2 hover:bg-green-50 rounded-lg transition-colors">
                                <div>
                                  <p className="text-xs font-bold text-gray-800">{item.label}</p>
                                  <p className="text-[9px] text-gray-500">{item.desc}</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={navMenuSettings[item.key] !== false}
                                    onChange={(e) => setNavMenuSettings({
                                      ...navMenuSettings,
                                      [item.key]: e.target.checked
                                    })}
                                  />
                                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end mt-6 border-t border-gray-50 pt-4">
                        <button
                          onClick={() => {
                            localStorage.setItem('kabiraaz_nav_settings', JSON.stringify(navMenuSettings));
                            toast.success("Navigation menu updated successfully!");
                          }}
                          className="bg-gradient-to-r from-[#1A1A3A] to-[#2E3192] hover:from-[#2E3192] hover:to-[#1A1A3A] text-white text-[10px] font-black uppercase tracking-widest py-3 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-[#1A1A3A]/20 hover:-translate-y-0.5"
                        >
                          <Save size={12} /> Save Navigation Settings
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Instagram Reels ── */}
                {contentsSubTab === "reels" && (
                  <AdminReelManager />
                )}

                {/* ── Featured Matrix ── */}
                {contentsSubTab === "featured" && (
                  <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-4 sm:p-5 border-b border-gray-50">
                      <h4 className="font-black text-xs text-[#1A1A3A] uppercase tracking-wider">Featured Tag Matrix</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">Toggle homepage placement</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-slate-50/80">
                            <th className="text-left p-3 sm:p-4 text-gray-400 font-black uppercase text-[9px] tracking-widest">Product</th>
                            <th className="text-left p-3 sm:p-4 text-gray-400 font-black uppercase text-[9px] tracking-widest hidden sm:table-cell">Category</th>
                            <th className="text-center p-3 sm:p-4 text-amber-500 font-black uppercase text-[9px] tracking-widest">★</th>
                            <th className="text-center p-3 sm:p-4 text-orange-500 font-black uppercase text-[9px] tracking-widest">🔥</th>
                            <th className="text-center p-3 sm:p-4 text-rose-500 font-black uppercase text-[9px] tracking-widest hidden sm:table-cell">%</th>
                            <th className="text-center p-3 sm:p-4 text-[#007A8A] font-black uppercase text-[9px] tracking-widest hidden sm:table-cell">♛</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((p, idx) => (
                            <tr key={p.id} className={`hover:bg-slate-50/60 transition-colors ${idx !== products.length - 1 ? 'border-b border-gray-50' : ''}`}>
                              <td className="p-3 sm:p-4">
                                <div className="flex items-center gap-2">
                                  <img src={p.image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=40'} alt={p.name} className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl object-cover border border-slate-100" />
                                  <span className="font-bold text-[#1A1A3A] truncate max-w-[100px] sm:max-w-[140px] text-[10px] sm:text-xs">{p.name}</span>
                                </div>
                              </td>
                              <td className="p-3 sm:p-4 text-gray-400 font-medium text-[10px] hidden sm:table-cell">{p.category}</td>
                              {[
                                { tag: 'featured', icon: <Star size={13} />, activeClass: 'bg-amber-50 text-amber-500 border-amber-200 shadow-amber-100' },
                                { tag: 'trending', icon: <Flame size={13} />, activeClass: 'bg-orange-50 text-orange-500 border-orange-200 shadow-orange-100' },
                                { tag: 'deal', icon: <Percent size={13} />, activeClass: 'bg-rose-50 text-rose-500 border-rose-200 shadow-rose-100', hidden: 'hidden sm:table-cell' },
                                { tag: 'best-seller', icon: <Heart size={13} />, activeClass: 'bg-[#007A8A]/10 text-[#007A8A] border-[#007A8A]/20 shadow-[#007A8A]/10', hidden: 'hidden sm:table-cell' }
                              ].map(({ tag, icon, activeClass, hidden }) => (
                                <td key={tag} className={`p-3 sm:p-4 text-center ${hidden || ''}`}>
                                  <button
                                    onClick={() => handleToggleProductTag(p.id, tag)}
                                    className={`p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer inline-flex items-center justify-center shadow-sm ${(p.tags || []).includes(tag)
                                        ? `${activeClass} shadow-md`
                                        : 'bg-white text-gray-200 border-gray-100 hover:border-gray-300 hover:text-gray-400'
                                      }`}
                                  >
                                    {icon}
                                  </button>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ── Active Products ── */}
                {contentsSubTab === "products" && (
                  <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-4 sm:p-5 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <h4 className="font-black text-xs text-[#1A1A3A] uppercase tracking-wider">Active Catalog ({filteredCatalog.length})</h4>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-none">
                          <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400" size={11} />
                          <input
                            type="text"
                            placeholder="Search..."
                            className="bg-slate-50 border border-transparent hover:border-gray-200 focus:border-[#007A8A] py-2 pl-7 sm:pl-8 pr-3 rounded-xl focus:outline-none text-[11px] text-[#1A1A3A] w-full sm:w-48 transition-all"
                            value={catalogSearch}
                            onChange={(e) => setCatalogSearch(e.target.value)}
                          />
                        </div>
                        <select
                          className="bg-slate-50 border border-transparent hover:border-gray-200 py-2 px-2 sm:px-3 rounded-xl text-[10px] sm:text-[11px] font-bold text-[#333333] focus:outline-none cursor-pointer transition-all"
                          value={catalogCategoryFilter}
                          onChange={(e) => setCatalogCategoryFilter(e.target.value)}
                        >
                          {["all", "women", "men", "kids", "accessories", "footwear"].map(c => (
                            <option key={c} value={c}>{c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-slate-50/80">
                            <th className="text-left p-3 sm:p-4 text-gray-400 font-black uppercase text-[9px] tracking-widest">SKU</th>
                            <th className="text-left p-3 sm:p-4 text-gray-400 font-black uppercase text-[9px] tracking-widest hidden sm:table-cell">Category</th>
                            <th className="text-right p-3 sm:p-4 text-gray-400 font-black uppercase text-[9px] tracking-widest">Price</th>
                            <th className="text-center p-3 sm:p-4 text-gray-400 font-black uppercase text-[9px] tracking-widest">Stock</th>
                            <th className="text-center p-3 sm:p-4 text-gray-400 font-black uppercase text-[9px] tracking-widest">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCatalog.map((p, idx) => (
                            <tr key={p.id} className={`hover:bg-slate-50/60 transition-colors ${idx !== filteredCatalog.length - 1 ? 'border-b border-gray-50' : ''}`}>
                              <td className="p-3 sm:p-4">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <img src={p.image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=44'} alt={p.name} className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl object-cover bg-slate-50 border border-slate-100" />
                                  <div>
                                    <p className="font-black text-[#1A1A3A] text-[10px] sm:text-xs">{p.name}</p>
                                    <p className="text-[9px] text-gray-400 font-mono">#{p.id}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 sm:p-4 hidden sm:table-cell">
                                <span className="bg-slate-100 text-[#333333] px-2 sm:px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider">{p.category}</span>
                              </td>
                              <td className="p-3 sm:p-4 text-right font-black text-[#1A1A3A] font-mono text-[10px] sm:text-xs">₹{(p.price || 0).toLocaleString()}</td>
                              <td className="p-3 sm:p-4 text-center">
                                <span className={`font-black font-mono text-xs sm:text-sm ${p.stock === 0 ? 'text-rose-500' : (p.stock || 0) <= 5 ? 'text-amber-500' : 'text-[#333333]'}`}>
                                  {p.stock || 0}
                                </span>
                              </td>
                              <td className="p-3 sm:p-4">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleTriggerEditProduct(p)}
                                    className="p-1.5 sm:p-2 rounded-xl bg-slate-50 hover:bg-[#1A1A3A] hover:text-white text-gray-500 border border-transparent hover:border-[#1A1A3A] transition-all cursor-pointer"
                                  >
                                    <Edit3 size={11} />
                                  </button>
                                  <button
                                    onClick={() => { deleteProduct(p.id); toast.error("Product deleted."); }}
                                    className="p-1.5 sm:p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-gray-500 hover:text-rose-500 border border-transparent hover:border-rose-100 transition-all cursor-pointer"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─── SETTINGS ─── */}
            {activeTab === "settings" && (
              <div className="space-y-4 sm:space-y-5">
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6">
                  <h3 className="font-black text-xs sm:text-sm text-[#1A1A3A] uppercase tracking-wide">Platform Settings</h3>
                  <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">Site metadata & policies</p>

                  <div className="flex gap-2 mt-4 sm:mt-5 flex-wrap">
                    {[
                      { id: "site-info", label: "Site Info", icon: <Globe size={11} /> },
                      { id: "contact-social", label: "Contact", icon: <PhoneCall size={11} /> },
                      { id: "policies", label: "Policies", icon: <ShieldAlert size={11} /> }
                    ].map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => setSettingsSubTab(sub.id)}
                        className={`py-2 px-3 sm:py-2.5 sm:px-4 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border ${settingsSubTab === sub.id
                            ? 'bg-gradient-to-r from-[#1A1A3A] to-[#2E3192] text-white border-[#1A1A3A] shadow-lg shadow-[#1A1A3A]/20'
                            : 'bg-slate-50 text-[#333333] border-transparent hover:bg-slate-100'
                          }`}
                      >
                        {sub.icon} <span className="hidden sm:inline">{sub.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Site Info ── */}
                {settingsSubTab === "site-info" && (
                  <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-4 sm:space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-1.5">
                        <label className="font-black text-gray-500 uppercase tracking-widest text-[9px]">Platform Title</label>
                        <input
                          type="text"
                          className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-[#007A8A] py-2 sm:py-3 px-3 sm:px-4 rounded-xl focus:outline-none text-[11px] transition-all focus:bg-white"
                          value={siteSettings.heroTitle || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, heroTitle: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-black text-gray-500 uppercase tracking-widest text-[9px]">Hero Subtitle</label>
                        <input
                          type="text"
                          className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-[#007A8A] py-2 sm:py-3 px-3 sm:px-4 rounded-xl focus:outline-none text-[11px] transition-all focus:bg-white"
                          value={siteSettings.heroSubtitle || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, heroSubtitle: e.target.value })}
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="font-black text-gray-500 uppercase tracking-widest text-[9px]">Hero Description</label>
                        <textarea
                          rows={2}
                          className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-[#007A8A] py-2 sm:py-3 px-3 sm:px-4 rounded-xl focus:outline-none text-[11px] transition-all focus:bg-white resize-none"
                          value={siteSettings.heroDescription || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, heroDescription: e.target.value })}
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="font-black text-gray-500 uppercase tracking-widest text-[9px]">Hero Image URL</label>
                        <input
                          type="text"
                          className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-[#007A8A] py-2 sm:py-3 px-3 sm:px-4 rounded-xl focus:outline-none text-[11px] font-mono transition-all focus:bg-white"
                          value={siteSettings.heroImage || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, heroImage: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-black text-gray-500 uppercase tracking-widest text-[9px]">Currency</label>
                        <input
                          type="text"
                          className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-[#007A8A] py-2 sm:py-3 px-3 sm:px-4 rounded-xl focus:outline-none text-[11px] font-mono transition-all focus:bg-white"
                          value={siteSettings.currency || 'INR (₹)'}
                          onChange={(e) => setSiteSettings({ ...siteSettings, currency: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-black text-gray-500 uppercase tracking-widest text-[9px]">Free Delivery (₹)</label>
                        <input
                          type="text"
                          className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-[#007A8A] py-2 sm:py-3 px-3 sm:px-4 rounded-xl focus:outline-none text-[11px] font-mono transition-all focus:bg-white"
                          value={siteSettings.freeDeliveryThreshold || '999'}
                          onChange={(e) => setSiteSettings({ ...siteSettings, freeDeliveryThreshold: e.target.value })}
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="font-black text-gray-500 uppercase tracking-widest text-[9px]">Copyright Line</label>
                        <input
                          type="text"
                          className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-[#007A8A] py-2 sm:py-3 px-3 sm:px-4 rounded-xl focus:outline-none text-[11px] transition-all focus:bg-white"
                          value={siteSettings.copyright || 'Kabiraaz Fashion Ltd. All Rights Reserved.'}
                          onChange={(e) => setSiteSettings({ ...siteSettings, copyright: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end border-t border-gray-50 pt-4">
                      <button
                        onClick={() => {
                          localStorage.setItem('luxe_site_settings', JSON.stringify(siteSettings));
                          toast.success("Site info saved!");
                        }}
                        className="w-full sm:w-auto bg-gradient-to-r from-[#1A1A3A] to-[#2E3192] hover:from-[#2E3192] hover:to-[#1A1A3A] text-white text-[10px] font-black uppercase tracking-widest py-2.5 sm:py-3 px-5 sm:px-6 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#1A1A3A]/20 hover:-translate-y-0.5"
                      >
                        <Save size={12} /> Save Info
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Contact & Social ── */}
                {settingsSubTab === "contact-social" && (
                  <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-4 sm:space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-1.5">
                        <label className="font-black text-gray-500 uppercase tracking-widest text-[9px]">Support Phone</label>
                        <input
                          type="tel"
                          className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-[#007A8A] py-2 sm:py-3 px-3 sm:px-4 rounded-xl focus:outline-none text-[11px] font-mono transition-all focus:bg-white"
                          value={siteSettings.contactPhone || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, contactPhone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-black text-gray-500 uppercase tracking-widest text-[9px]">Support Email</label>
                        <input
                          type="email"
                          className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-[#007A8A] py-2 sm:py-3 px-3 sm:px-4 rounded-xl focus:outline-none text-[11px] font-mono transition-all focus:bg-white"
                          value={siteSettings.contactEmail || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, contactEmail: e.target.value })}
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="font-black text-gray-500 uppercase tracking-widest text-[9px]">Address</label>
                        <input
                          type="text"
                          className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-[#007A8A] py-2 sm:py-3 px-3 sm:px-4 rounded-xl focus:outline-none text-[11px] transition-all focus:bg-white"
                          value={siteSettings.address || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, address: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-black text-gray-500 uppercase tracking-widest text-[9px]">Instagram</label>
                        <input
                          type="text"
                          className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-[#007A8A] py-2 sm:py-3 px-3 sm:px-4 rounded-xl focus:outline-none text-[11px] font-mono transition-all focus:bg-white"
                          value={siteSettings.instagram || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, instagram: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-black text-gray-500 uppercase tracking-widest text-[9px]">WhatsApp</label>
                        <input
                          type="text"
                          className="w-full bg-slate-50 border border-transparent hover:border-[#007A8A] py-2 sm:py-3 px-3 sm:px-4 rounded-xl focus:outline-none text-[11px] font-mono transition-all focus:bg-white"
                          value={siteSettings.whatsapp || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, whatsapp: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end border-t border-gray-50 pt-4">
                      <button
                        onClick={() => {
                          localStorage.setItem('luxe_site_settings', JSON.stringify(siteSettings));
                          toast.success("Contact info saved!");
                        }}
                        className="w-full sm:w-auto bg-gradient-to-r from-[#1A1A3A] to-[#2E3192] hover:from-[#2E3192] hover:to-[#1A1A3A] text-white text-[10px] font-black uppercase tracking-widest py-2.5 sm:py-3 px-5 sm:px-6 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#1A1A3A]/20 hover:-translate-y-0.5"
                      >
                        <Save size={12} /> Save Contacts
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Policies ── */}
                {settingsSubTab === "policies" && (
                  <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-4 sm:space-y-5">
                    <div className="space-y-1.5">
                      <label className="font-black text-gray-500 uppercase tracking-widest text-[9px]">Terms & Conditions</label>
                      <textarea
                        rows={6}
                        placeholder="Enter terms..."
                        className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-[#007A8A] py-2 sm:py-3 px-3 sm:px-4 rounded-xl sm:rounded-2xl focus:outline-none text-[11px] leading-relaxed transition-all focus:bg-white resize-none"
                        value={siteSettings.terms || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, terms: e.target.value })}
                      />
                      <p className="text-[9px] text-gray-400 text-right">{(siteSettings.terms || '').length} characters</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-black text-gray-500 uppercase tracking-widest text-[9px]">Privacy Policy</label>
                      <textarea
                        rows={6}
                        placeholder="Enter privacy policy..."
                        className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-[#007A8A] py-2 sm:py-3 px-3 sm:px-4 rounded-xl sm:rounded-2xl focus:outline-none text-[11px] leading-relaxed transition-all focus:bg-white resize-none"
                        value={siteSettings.privacy || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, privacy: e.target.value })}
                      />
                      <p className="text-[9px] text-gray-400 text-right">{(siteSettings.privacy || '').length} characters</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-black text-gray-500 uppercase tracking-widest text-[9px]">Return & Refund Policy</label>
                      <textarea
                        rows={4}
                        placeholder="Enter return policy..."
                        className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-[#007A8A] py-2 sm:py-3 px-3 sm:px-4 rounded-xl sm:rounded-2xl focus:outline-none text-[11px] leading-relaxed transition-all focus:bg-white resize-none"
                        value={siteSettings.returnPolicy || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, returnPolicy: e.target.value })}
                      />
                    </div>

                    <div className="flex justify-end border-t border-gray-50 pt-4">
                      <button
                        onClick={() => {
                          localStorage.setItem('luxe_site_settings', JSON.stringify(siteSettings));
                          toast.success("Policies saved!");
                        }}
                        className="w-full sm:w-auto bg-gradient-to-r from-[#1A1A3A] to-[#2E3192] hover:from-[#2E3192] hover:to-[#1A1A3A] text-white text-[10px] font-black uppercase tracking-widest py-2.5 sm:py-3 px-5 sm:px-6 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#1A1A3A]/20 hover:-translate-y-0.5"
                      >
                        <Save size={12} /> Save Policies
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ═══════════════ EDIT PRODUCT MODAL ═══════════════ */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-[#1A1A3A] to-[#2E3192] p-4 sm:p-5 flex justify-between items-center flex-shrink-0">
              <div>
                <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">Edit Product</h4>
                <p className="text-[10px] text-white/50 mt-0.5 font-mono">SKU #{editingProduct.id}</p>
              </div>
              <button onClick={() => setEditingProduct(null)} className="text-white/60 hover:text-white p-2 rounded-xl hover:bg-white/10 cursor-pointer transition-all">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProductEdit} className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto">
              <div className="space-y-1.5">
                <label className="font-black text-gray-500 uppercase tracking-widest text-[9px]">Product Name</label>
                <input type="text" required
                  className="w-full bg-slate-50 border border-transparent hover:border-[#007A8A] py-2 sm:py-3 px-3 sm:px-4 rounded-xl focus:outline-none text-[11px] transition-all focus:bg-white"
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <label className="font-black text-gray-500 uppercase tracking-widest text-[9px]">Price (₹)</label>
                  <input type="number" required
                    className="w-full bg-slate-50 border border-transparent hover:border-[#007A8A] py-2 sm:py-3 px-3 sm:px-4 rounded-xl focus:outline-none text-[11px] font-mono transition-all focus:bg-white"
                    value={editingProduct.price || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-black text-gray-500 uppercase tracking-widest text-[9px]">Old Price</label>
                  <input type="number"
                    className="w-full bg-slate-50 border border-transparent hover:border-orange-500 py-2 sm:py-3 px-3 sm:px-4 rounded-xl focus:outline-none text-[11px] font-mono transition-all focus:bg-white"
                    value={editingProduct.oldPrice || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, oldPrice: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-black text-gray-500 uppercase tracking-widest text-[9px]">Stock</label>
                  <input type="number" required
                    className="w-full bg-slate-50 border border-transparent hover:border-orange-500 py-2 sm:py-3 px-3 sm:px-4 rounded-xl focus:outline-none text-[11px] transition-all focus:bg-white"
                    value={editingProduct.stock || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-black text-gray-500 uppercase tracking-widest text-[9px]">Category</label>
                  <select
                    className="w-full bg-slate-50 border border-transparent hover:border-[#007A8A] py-2 sm:py-3 px-3 sm:px-4 rounded-xl focus:outline-none text-[11px] transition-all focus:bg-white cursor-pointer"
                    value={editingProduct.category || 'Women'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  >
                    {["Women", "Men", "Kids", "Accessories", "Footwear"].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="font-black text-gray-500 uppercase tracking-widest text-[9px]">Image URL</label>
                <input type="url"
                  className="w-full bg-slate-50 border border-transparent hover:border-orange-500 py-2 sm:py-3 px-3 sm:px-4 rounded-xl focus:outline-none text-[11px] font-mono transition-all focus:bg-white"
                  value={editingProduct.image || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-black text-gray-500 uppercase tracking-widest text-[9px]">Description</label>
                <textarea rows={3}
                  className="w-full bg-slate-50 border border-transparent hover:border-orange-500 py-2 sm:py-3 px-3 sm:px-4 rounded-xl focus:outline-none text-[11px] leading-relaxed transition-all focus:bg-white resize-none"
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingProduct(null)}
                  className="flex-1 border border-gray-200 hover:bg-slate-50 text-[#333333] text-[10px] font-black uppercase tracking-widest py-2.5 sm:py-3 rounded-xl sm:rounded-2xl cursor-pointer transition-all">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-white text-[10px] font-black uppercase tracking-widest py-2.5 sm:py-3 rounded-xl sm:rounded-2xl cursor-pointer transition-all shadow-lg shadow-orange-500/20 hover:-translate-y-0.5 flex items-center justify-center gap-2">
                  <Check size={13} /> Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}