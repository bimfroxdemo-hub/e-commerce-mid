import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { profileAPI, adminAPI } from '../services/api';
import InventoryManagement from '../components/admin/InventoryManagement';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import {
  LayoutGrid, Package, ShoppingBag, Sliders, Settings as SettingsIcon,
  X, Check, AlertTriangle, FileText, Download, CheckCircle2,
  ChevronRight, ArrowRight, Bell, LogOut, Menu, Crown, TrendingUp,
  Globe, CreditCard, Calendar, DollarSign, ShoppingCart
} from 'lucide-react';
import toast from 'react-hot-toast';

// Reusable modular onboarding components
import BusinessDetails from '../components/seller/BusinessDetails';
import TaxDetails from '../components/seller/TaxDetails';
import BankDetails from '../components/seller/BankDetails';
import LaunchDetails from '../components/seller/LaunchDetails';

export default function SellerDashboard({ onNavigate }) {
  const {
    siteSettings = {},
    updateOrderStatus, assignTrackingId,
    logoutUser,
    currentUser,
    updateCurrentUser // Sync changes back to global context
  } = useApp();

  // Tab & UI control states
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [settingsTab, setSettingsTab] = useState("business");

  // Live database scoped state
  const [stats, setStats] = useState(null);
  const [sellerProducts, setSellerProducts] = useState([]);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [dashLoading, setDashLoading] = useState(true);

  // Form States initialized with loading states
  const [formData, setFormData] = useState({
    fullName: '', mobileNumber: '', email: '', password: '',
    licenseType: 'GSTIN', businessName: 'Loading...', agreedToTerms: false,
    storeName: 'Loading Store...', primaryCategory: '', pincode: '', 
    addressLine1: '', addressLine2: '', city: '', state: '', country: 'India',
    shippingMethod: 'self_ship',
    gstNumber: '', panNumber: '', exemptCategory: false,
    accountHolder: '', bankName: '', accountNumber: '', confirmAccountNumber: '', ifscCode: '',
    shippingFeeType: 'free', localFee: '40', regionalFee: '50', nationalFee: '60',
    productTaxCode: 'A_GEN_STANDARD',
    isHolidayMode: false,
    holidayStart: '',
    holidayEnd: '',
    holidayPolicy: 'deactivate',
    holidayMessage: 'We are temporarily away on vacation. Orders placed now will experience shipping delays.'
  });

  const [checkingStore, setCheckingStore] = useState(false);
  const [storeAvailable, setStoreAvailable] = useState(null);

  // ==========================================
  // ✅ NEW: SYNC FORM STATE DYNAMICALLY FROM DATABASE USER RECORD (currentUser)
  // ==========================================
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        fullName: currentUser.name || prev.fullName,
        email: currentUser.email || prev.email,
        storeName: currentUser.storeName || prev.storeName || '',
        businessName: currentUser.businessName || prev.businessName || '',
        licenseType: currentUser.licenseType || prev.licenseType || 'GSTIN',
        primaryCategory: currentUser.primaryCategory || prev.primaryCategory || '',
        pincode: currentUser.pincode || prev.pincode || '',
        addressLine1: currentUser.addressLine1 || prev.addressLine1 || '',
        addressLine2: currentUser.addressLine2 || prev.addressLine2 || '',
        city: currentUser.city || prev.city || '',
        state: currentUser.state || prev.state || '',
        country: currentUser.country || prev.country || 'India',
        shippingMethod: currentUser.shippingMethod || prev.shippingMethod || 'self_ship',
        shippingFeeType: currentUser.shippingFeeType || prev.shippingFeeType || 'free',
        localFee: currentUser.localFee !== undefined ? String(currentUser.localFee) : prev.localFee,
        regionalFee: currentUser.regionalFee !== undefined ? String(currentUser.regionalFee) : prev.regionalFee,
        nationalFee: currentUser.nationalFee !== undefined ? String(currentUser.nationalFee) : prev.nationalFee,
        productTaxCode: currentUser.productTaxCode || prev.productTaxCode || 'A_GEN_STANDARD',
        gstNumber: currentUser.gstNumber || prev.gstNumber || '',
        panNumber: currentUser.panNumber || prev.panNumber || '',
        exemptCategory: currentUser.exemptCategory !== undefined ? currentUser.exemptCategory : prev.exemptCategory,
        accountHolder: currentUser.accountHolder || prev.accountHolder || '',
        bankName: currentUser.bankName || prev.bankName || '',
        accountNumber: currentUser.accountNumber || prev.accountNumber || '',
        confirmAccountNumber: currentUser.accountNumber || prev.confirmAccountNumber || '',
        ifscCode: currentUser.ifscCode || prev.ifscCode || '',
        isHolidayMode: currentUser.isHolidayMode !== undefined ? currentUser.isHolidayMode : prev.isHolidayMode,
        holidayStart: currentUser.holidayStart ? new Date(currentUser.holidayStart).toISOString().split('T')[0] : prev.holidayStart,
        holidayEnd: currentUser.holidayEnd ? new Date(currentUser.holidayEnd).toISOString().split('T')[0] : prev.holidayEnd,
        holidayPolicy: currentUser.holidayPolicy || prev.holidayPolicy || 'deactivate',
        holidayMessage: currentUser.holidayMessage || prev.holidayMessage || 'We are temporarily away on vacation.'
      }));
    }
  }, [currentUser]);

  // Fetch only scoped database entries for the active seller
  const fetchSellerDashboardData = async () => {
    try {
      setDashLoading(true);
      
      const [statsRes, productsRes, ordersRes] = await Promise.all([
        adminAPI.dashboard.getStats(),
        adminAPI.products.getAll({ limit: 100 }), 
        adminAPI.orders.getAll({ limit: 100 })    
      ]);

      if (statsRes?.success) {
        setStats(statsRes.data);
      }
      if (productsRes?.success) {
        setSellerProducts(productsRes.data?.products || []);
      }
      if (ordersRes?.success) {
        setSellerOrders(ordersRes.data?.orders || ordersRes.data || []);
      }
    } catch (err) {
      console.error("Dashboard query failed:", err);
      toast.error("Failed to load real-time store database logs.");
    } finally {
      setDashLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerDashboardData();
  }, [activeTab]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveSettings = async (sectionLabel) => {
    try {
      localStorage.setItem('seller_onboarding_data', JSON.stringify(formData));
      const response = await profileAPI.updateSellerProfile(formData);
      
      if (response?.success) {
        const updatedUser = response.data?.user || response.user || response.data;
        if (updatedUser) {
          updateCurrentUser(updatedUser);
        }
        toast.success(`${sectionLabel} updated and synced successfully!`);
        fetchSellerDashboardData(); 
      } else {
        toast.success(`${sectionLabel} updated locally.`);
      }
    } catch {
      toast.error("Failed to update settings");
    }
  };

  const checkStoreAvailability = () => {
    if (!formData.storeName) return;
    setCheckingStore(true);
    setTimeout(() => {
      setCheckingStore(false);
      setStoreAvailable(true);
    }, 800);
  };

  const lowStockProductsList = useMemo(() => {
    return stats?.lowStockProducts || sellerProducts.filter(p => (p.inventory?.quantity ?? 0) <= 5);
  }, [stats, sellerProducts]);

  const categoryChartData = useMemo(() => {
    const counts = {};
    sellerProducts.forEach(p => {
      const categoryName = p.category?.name || p.category || 'General';
      counts[categoryName] = (counts[categoryName] || 0) + (p.inventory?.quantity || 0);
    });
    return Object.keys(counts).map(cat => ({ category: cat, Stock: counts[cat] }));
  }, [sellerProducts]);

  const chartData = useMemo(() => {
    if (!stats?.salesChartData || stats.salesChartData.length === 0) {
      return [
        { _id: 'No Data', sales: 0, orders: 0 }
      ];
    }
    return stats.salesChartData.map(item => ({
      month: item._id,
      Sales: item.sales || 0,
      Orders: item.orders || 0
    }));
  }, [stats]);

  const getAvailableStatuses = (shippingMethod, currentStatus) => {
    if (shippingMethod === 'kabira_fba') {
      return []; 
    }
    if (shippingMethod === 'easy_ship') {
      if (['Shipped', 'Out for Delivery', 'Delivered'].includes(currentStatus)) {
        return [currentStatus];
      }
      return ["Ordered", "Confirmed"]; 
    }
    return ["Ordered", "Confirmed", "Shipped", "Out for Delivery", "Delivered"];
  };

  const handleLogout = () => {
    if (logoutUser) logoutUser();
    localStorage.removeItem('isSellerOnboarded');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('seller_onboarding_data');
    if (onNavigate) onNavigate('home');
    toast.success("Successfully logged out from Seller Central");
  };

  const handleTriggerEditProduct = (prod) => {
    setEditingProduct({ ...prod });
  };

  const handleSaveProductEdit = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const response = await adminAPI.products.update(editingProduct.id || editingProduct._id, editingProduct);
      if (response?.success) {
        toast.success(`"${editingProduct.name}" updated successfully.`);
        setEditingProduct(null);
        fetchSellerDashboardData(); 
      } else {
        toast.error("Failed to update product details");
      }
    } catch (error) {
      console.error("Edit product error:", error);
      toast.error("Failed to update product");
    }
  };

  const handleExportStockReport = () => {
    let csv = "SKU ID,Product Name,Category,Price,Stock,Alert Level\n";
    sellerProducts.forEach(p => {
      const stock = p.inventory?.quantity || 0;
      const alert = stock === 0 ? "OUT OF STOCK" : stock <= 5 ? "LOW STOCK" : "STABLE";
      csv += `"${p.sku || p._id || p.id}","${p.name}","${p.category?.name || p.category}",₹${p.price},${stock},"${alert}"\n`;
    });
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", `${formData.storeName.replace(/\s+/g, '_')}_stock_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Stock report exported!");
  };

  const handleExportOrdersToCSV = () => {
    let csv = "Order ID,Customer Name,Email,City,TotalAmount,Status,Tracking ID\n";
    sellerOrders.forEach(o => {
      csv += `"${o.orderId || o._id || o.id}","${o.customerInfo?.name || 'N/A'}","${o.customerInfo?.email || ''}","${o.shippingAddress?.city || 'N/A'}",₹${o.totalAmount || 0},"${o.status || 'Pending'}","${o.trackingId || 'N/A'}"\n`;
    });
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", `${formData.storeName.replace(/\s+/g, '_')}_orders_database.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Orders database exported!");
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutGrid size={16} />, badge: null },
    { id: "inventory", label: "Inventory", icon: <Package size={16} />, badge: sellerProducts.length },
    { id: "orders", label: "My Orders", icon: <ShoppingBag size={16} />, badge: sellerOrders.length },
    { id: "settings", label: "Store Settings", icon: <SettingsIcon size={16} />, badge: null }
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
              className="lg:hidden w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg"
            >
              <Menu size={18} className="text-white" />
            </button>

            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#111827] to-[#1F2937] rounded-2xl flex items-center justify-center shadow-lg border border-orange-500/20">
              <Crown size={18} className="text-orange-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="font-black text-base sm:text-xl text-slate-800 tracking-tight">{formData.storeName}</h1>
                <span className="inline-block text-[9px] bg-orange-500 text-white font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                  Seller Panel
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
            <div className="hidden sm:flex items-center gap-2 bg-white border border-gray-100 rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 shadow-sm">
              <div className={`w-2 h-2 rounded-full ${formData.isHolidayMode ? 'bg-rose-500' : 'bg-emerald-500'} rounded-full animate-pulse`}></div>
              <span className="text-[10px] font-bold text-[#333333]">
                {formData.isHolidayMode ? 'On Leave' : 'Store Verified'}
              </span>
            </div>
            <button className="relative w-9 h-9 sm:w-10 sm:h-10 bg-white border border-gray-100 rounded-2xl flex items-center justify-center shadow-sm hover:bg-slate-50 transition-all">
              <Bell size={14} className="text-[#333333]" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                {lowStockProductsList.length}
              </span>
            </button>
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
            <div
              className={`fixed inset-0 bg-black/50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
              onClick={() => setSidebarOpen(false)}
            ></div>

            <div className="relative bg-white lg:bg-transparent h-full lg:h-auto overflow-y-auto lg:overflow-visible w-80 lg:w-full">
              <div className="space-y-2 p-4 lg:p-0">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center"
                >
                  <X size={16} />
                </button>

                {/* Nav Card */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-br from-[#111827] to-[#1F2937] p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-black text-sm">
                        {formData.storeName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white font-bold text-xs sm:text-sm">{formData.businessName}</p>
                        <p className="text-orange-400 text-[10px] font-semibold tracking-wider">B2B Partner</p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {[
                        { label: "My Products", val: sellerProducts.length },
                        { label: "My Orders", val: sellerOrders.length }
                      ].map((s, i) => (
                        <div key={i} className="bg-white/10 rounded-xl p-2 text-center backdrop-blur-sm">
                          <p className="text-white font-black text-sm sm:text-base">{s.val}</p>
                          <p className="text-white/50 text-[8px] font-bold uppercase">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 space-y-1">
                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest px-3 py-2">Operations Central</p>
                    {navItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setSidebarOpen(false);
                        }}
                        className={`w-full text-left py-2.5 sm:py-3 px-3 sm:px-4 rounded-2xl text-xs font-bold flex items-center justify-between transition-all duration-200 cursor-pointer group ${activeTab === item.id
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20'
                            : 'hover:bg-slate-50 text-[#333333] hover:text-[#111827]'
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
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${activeTab === item.id ? 'bg-[#111827] text-white' : 'bg-slate-100 text-gray-500'
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

                {/* Quick Stock Alerts */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-3xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={13} className="text-amber-600" />
                    <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider">My Stock Alerts</span>
                  </div>
                  {lowStockProductsList.length === 0 ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      <span className="text-[11px] text-emerald-600 font-semibold">Stock levels healthy</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {lowStockProductsList.slice(0, 3).map(p => (
                        <div key={p._id || p.id} className="flex items-center justify-between">
                          <span className="text-[10px] text-[#333333] font-semibold truncate max-w-[120px]">{p.name}</span>
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${p.inventory?.quantity === 0 ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                            }`}>
                            {p.inventory?.quantity === 0 ? 'OUT' : `${p.inventory?.quantity} left`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* ═══════════════ MAIN CONTENT ═══════════════ */}
          <main className="lg:col-span-9 min-h-[500px] sm:min-h-[700px]">

            {dashLoading ? (
              <div className="h-[400px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
              </div>
            ) : (
              <>
                {/* ─── DASHBOARD OVERVIEW ─── */}
                {activeTab === "dashboard" && (
                  <div className="space-y-4 sm:space-y-6">
                    
                    {formData.isHolidayMode && (
                      <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 p-4 rounded-3xl flex items-start gap-3 shadow-sm animate-pulse">
                        <AlertTriangle className="text-rose-600 mt-0.5 flex-shrink-0" size={18} />
                        <div>
                          <h4 className="font-black text-xs text-rose-950 uppercase tracking-wider">Vacation Mode Active</h4>
                          <p className="text-[11px] text-rose-800 mt-1 leading-relaxed">
                            Your listings are currently set to <strong>{formData.holidayPolicy === 'deactivate' ? 'Inactive (Unavailable for sale)' : 'Active with shipping delay warning'}</strong>.
                            {formData.holidayMessage && <span className="block mt-1 font-medium italic">"{formData.holidayMessage}"</span>}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      {[
                        {
                          title: "My Revenue",
                          val: `₹${(stats?.summary?.monthlyRevenue || 0).toLocaleString()}`,
                          change: "Direct Settlements",
                          positive: true,
                          icon: <DollarSign size={16} />,
                          color: "from-orange-500 to-amber-500",
                          bg: "from-orange-50/60 to-amber-50/40",
                          border: "border-orange-100"
                        },
                        {
                          title: "My Orders",
                          val: stats?.summary?.totalOrders || 0,
                          change: "Awaiting shipment",
                          positive: true,
                          icon: <ShoppingCart size={16} />,
                          color: "from-orange-500 to-amber-500",
                          bg: "from-orange-50/60 to-amber-50/40",
                          border: "border-orange-100"
                        },
                        {
                          title: "Fulfillment",
                          val: formData.shippingMethod ? formData.shippingMethod.replace('_', ' ').toUpperCase() : 'Self Ship',
                          change: "Configured setup",
                          positive: true,
                          icon: <Sliders size={16} />,
                          color: "from-orange-500 to-amber-500",
                          bg: "from-orange-50/60 to-amber-50/40",
                          border: "border-orange-100"
                        },
                        {
                          title: "Listings Status",
                          val: formData.isHolidayMode ? "Inactive (Holiday)" : "Active (Online)",
                          change: "Going on holidays?",
                          positive: !formData.isHolidayMode,
                          icon: <Calendar size={16} />,
                          color: "from-orange-500 to-amber-500",
                          bg: "from-orange-50/60 to-amber-50/40",
                          border: "border-orange-100",
                          action: () => { setActiveTab("settings"); setSettingsTab("holiday"); }
                        }
                      ].map((st, i) => (
                        <div 
                          key={i} 
                          onClick={st.action || null}
                          className={`bg-gradient-to-br ${st.bg} border ${st.border} rounded-2xl sm:rounded-3xl p-3 sm:p-5 relative overflow-hidden group hover:shadow-lg transition-all duration-300 ${st.action ? 'cursor-pointer' : ''}`}
                        >
                          <div className={`absolute -top-4 -right-4 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br ${st.color} rounded-full opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                          <div className={`w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br ${st.color} rounded-xl flex items-center justify-center text-white mb-3 sm:mb-4 shadow-lg`}>
                            {st.icon}
                          </div>
                          <p className="text-[8px] sm:text-[9px] text-gray-500 font-black uppercase tracking-widest">{st.title}</p>
                          <p className="text-sm sm:text-lg font-black text-slate-800 mt-1 truncate">{st.val}</p>
                          <div className="flex items-center gap-1 mt-2">
                            {st.positive ? <CheckCircle2 size={10} className="text-orange-500" /> : <AlertTriangle size={9} className="text-amber-600" />}
                            <span className={`text-[9px] font-bold ${st.positive ? 'text-orange-600' : 'text-amber-600'}`}>{st.change}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-5">
                      {/* Sales Trajectory */}
                      <div className="lg:col-span-3 bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-6 shadow-sm">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0 mb-4 sm:mb-6">
                          <div>
                            <h3 className="font-black text-xs sm:text-sm text-[#1A1A3A] uppercase tracking-wide">My Store Sales</h3>
                            <p className="text-[10px] text-gray-400 mt-0.5 font-medium">B2B revenue trajectory</p>
                          </div>
                          <div className="flex items-center gap-1.5 bg-orange-100/30 border border-orange-200/50 px-3 py-1.5 rounded-full">
                            <TrendingUp size={11} className="text-orange-600" />
                            <span className="text-[10px] text-orange-600 font-black">Live Stats</span>
                          </div>
                        </div>
                        <div className="h-44 sm:h-52">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                              <defs>
                                <linearGradient id="sellerSalesGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
                                  <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                              <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#94A3B8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                              <YAxis tick={{ fontSize: 9, fill: '#94A3B8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                              <Tooltip content={<CustomTooltip />} />
                              <Area type="monotone" dataKey="Sales" stroke="#f97316" strokeWidth={2.5} fillOpacity={1} fill="url(#sellerSalesGrad)" dot={{ fill: '#f97316', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Stock Distribution */}
                      <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-6 shadow-sm">
                        <div className="mb-4 sm:mb-6">
                          <h3 className="font-black text-xs sm:text-sm text-[#1A1A3A] uppercase tracking-wide">Stock Allocations</h3>
                          <p className="text-[10px] text-gray-400 mt-0.5 font-medium">My active product categories</p>
                        </div>
                        <div className="h-44 sm:h-52">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                              <defs>
                                <linearGradient id="sellerBarGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#f97316" />
                                  <stop offset="100%" stopColor="#ea580c" />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                              <XAxis dataKey="category" tick={{ fontSize: 8, fill: '#94A3B8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                              <YAxis tick={{ fontSize: 9, fill: '#94A3B8', fontWeight: 700 }} axisLine={false} tickLine={false} />
                              <Tooltip content={<CustomTooltip />} />
                              <Bar dataKey="Stock" fill="url(#sellerBarGrad)" radius={[8, 8, 0, 0]} barSize={20} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    {/* Scoped Order List */}
                    <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 sm:p-6 border-b border-gray-50">
                        <div>
                          <h3 className="font-black text-xs sm:text-sm text-[#1A1A3A] uppercase tracking-wide">My Recent Orders</h3>
                          <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Fulfillment tracking for my products</p>
                        </div>
                        <button
                          onClick={() => setActiveTab("orders")}
                          className="flex items-center gap-2 text-[10px] font-black text-[#1A1A3A] uppercase tracking-wider hover:gap-3 transition-all"
                        >
                          View All Orders <ArrowRight size={12} />
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
                            </tr>
                          </thead>
                          <tbody>
                            {(!stats?.recentOrders || stats.recentOrders.length === 0) ? (
                              <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-400">
                                  No orders received yet.
                                </td>
                              </tr>
                            ) : (
                              stats.recentOrders.map((o, idx) => (
                                <tr key={o._id || o.id} className={`border-b border-gray-50 hover:bg-slate-50/50 transition-colors ${idx === stats.recentOrders.length - 1 ? 'border-0' : ''}`}>
                                  <td className="p-3 sm:p-4 font-black text-[#1A1A3A] font-mono text-[10px] sm:text-[11px]">{o.orderId || o.id}</td>
                                  <td className="p-3 sm:p-4 font-bold text-[#1A1A3A] text-[10px] sm:text-[11px]">
                                    {o.customerInfo?.name || 'Unknown Customer'}
                                  </td>
                                  <td className="p-3 sm:p-4 font-black text-[#1A1A3A] font-mono text-[10px] sm:text-xs">
                                    ₹{(o.totalAmount || 0).toLocaleString()}
                                  </td>
                                  <td className="p-3 sm:p-4">
                                    <span className="px-2 py-1 rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-wider inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-100">
                                      {o.status || 'Pending'}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── MY INVENTORY ─── */}
                {activeTab === "inventory" && (
                  <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6">
                    <InventoryManagement onEditProduct={handleTriggerEditProduct} />
                  </div>
                )}

                {/* ─── MY ORDERS ─── */}
                {activeTab === "orders" && (
                  <div className="space-y-4 sm:space-y-5">
                    <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div>
                          <h3 className="font-black text-xs sm:text-sm text-[#1A1A3A] uppercase tracking-wide">Fulfillment Panel</h3>
                          <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">Manage tracking and dispatch logs</p>
                        </div>
                        <button
                          onClick={handleExportOrdersToCSV}
                          className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-white text-[10px] font-black uppercase tracking-widest py-2.5 sm:py-3 px-4 sm:px-5 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-orange-500/20"
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
                              <th className="text-left p-3 sm:p-4 text-gray-400 font-black uppercase text-[9px] tracking-widest border-b border-gray-100">Total</th>
                              <th className="text-left p-3 sm:p-4 text-gray-400 font-black uppercase text-[9px] tracking-widest border-b border-gray-100 hidden md:table-cell">Tracking ID</th>
                              <th className="text-left p-3 sm:p-4 text-gray-400 font-black uppercase text-[9px] tracking-widest border-b border-gray-100">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sellerOrders.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-400">
                                  No orders received yet.
                                </td>
                              </tr>
                            ) : (
                              sellerOrders.map((o, idx) => (
                                <tr key={o._id || o.id} className={`hover:bg-slate-50/60 transition-colors ${idx !== sellerOrders.length - 1 ? 'border-b border-gray-50' : ''}`}>
                                  <td className="p-3 sm:p-4 font-black text-[#1A1A3A] font-mono text-[10px] sm:text-[11px]">{o.orderId || o.id}</td>
                                  <td className="p-3 sm:p-4">
                                    <p className="font-bold text-[#1A1A3A] text-[10px] sm:text-xs">{o.customerInfo?.name || 'Unknown'}</p>
                                    <p className="text-[9px] text-gray-400">{o.shippingAddress?.city || 'Unknown'}</p>
                                  </td>
                                  <td className="p-3 sm:p-4 font-black text-[#1A1A3A] font-mono text-[10px] sm:text-xs">₹{(o.totalAmount || 0).toLocaleString()}</td>
                                  <td className="p-3 sm:p-4 hidden md:table-cell">
                                    <input
                                      type="text"
                                      placeholder="Tracking ID..."
                                      className="bg-slate-50 border border-transparent hover:border-orange-500 rounded-xl py-2 px-3 text-[10px] focus:outline-none focus:bg-white text-[#1A1A3A] font-mono font-semibold placeholder-gray-300 transition-all w-32 sm:w-40"
                                      value={o.trackingId || ""}
                                      onChange={(e) => assignTrackingId(o.id || o._id, e.target.value)}
                                    />
                                  </td>
                                  <td className="p-3 sm:p-4">
                                    {formData.shippingMethod === 'kabira_fba' ? (
                                      <span className="px-2.5 py-1 rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                                        FBK Managed
                                      </span>
                                    ) : (
                                      <select
                                        value={o.status || 'Ordered'}
                                        disabled={
                                          formData.shippingMethod === 'easy_ship' &&
                                          ['Shipped', 'Out for Delivery', 'Delivered'].includes(o.status)
                                        }
                                        onChange={(e) => {
                                          updateOrderStatus(o.id || o._id, e.target.value);
                                          toast.success(`Order #${o.orderId || o.id} → ${e.target.value}`);
                                        }}
                                        className={`border rounded-xl py-1.5 sm:py-2 px-2 sm:px-3 text-[9px] font-black uppercase tracking-wider focus:outline-none cursor-pointer transition-all ${
                                          o.status === "Delivered" ? 'bg-[#007A8A]/10 text-[#007A8A] border-[#007A8A]/20' :
                                          o.status === "Shipped" ? 'bg-blue-50 text-blue-800 border-blue-200' :
                                          'bg-amber-50 text-amber-800 border-amber-200'
                                        }`}
                                      >
                                        {getAvailableStatuses(formData.shippingMethod, o.status).map(s => (
                                          <option key={s} value={s}>{s}</option>
                                        ))}
                                      </select>
                                    )}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── STORE SETTINGS ─── */}
                {activeTab === "settings" && (
                  <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-6">
                    <div>
                      <h3 className="font-black text-sm text-[#1A1A3A] uppercase tracking-wide">Store Settings</h3>
                      <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">Manage your B2B store profile, bank payout details, and tax registrations.</p>
                    </div>

                    <div className="flex gap-2 flex-wrap border-b border-gray-100 pb-4">
                      {[
                        { id: "business", label: "Business Profile", icon: <Globe size={12} /> },
                        { id: "tax", label: "Tax Details", icon: <FileText size={12} /> },
                        { id: "bank", label: "Bank Account", icon: <CreditCard size={12} /> },
                        { id: "shipping", label: "Fulfillment & PTC", icon: <Sliders size={12} /> },
                        { id: "holiday", label: "Vacation / Holiday Mode", icon: <Calendar size={12} /> }
                      ].map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => setSettingsTab(sub.id)}
                          className={`py-2 px-3 sm:py-2.5 sm:px-4 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border ${settingsTab === sub.id
                              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-500 shadow-md shadow-orange-500/10'
                              : 'bg-slate-50 text-[#333333] border-transparent hover:bg-slate-100'
                            }`}
                        >
                          {sub.icon} {sub.label}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-6 max-w-2xl">
                      {settingsTab === "business" && (
                        <div className="space-y-4">
                          <BusinessDetails
                            step={3} 
                            formData={formData}
                            handleChange={handleChange}
                            handleNext={() => handleSaveSettings("Business Profile")}
                            handlePrev={() => setActiveTab("dashboard")}
                            checkingStore={checkingStore}
                            storeAvailable={storeAvailable}
                            checkStoreAvailability={checkStoreAvailability}
                          />
                        </div>
                      )}

                      {settingsTab === "tax" && (
                        <div className="space-y-4">
                          <TaxDetails
                            step={5} 
                            formData={formData}
                            handleChange={handleChange}
                            handleNext={() => handleSaveSettings("Tax Details")}
                            handlePrev={() => setActiveTab("dashboard")}
                            setFormData={setFormData}
                          />
                        </div>
                      )}

                      {settingsTab === "bank" && (
                        <div className="space-y-4">
                          <BankDetails
                            formData={formData}
                            handleChange={handleChange}
                            handleNext={() => handleSaveSettings("Bank Account details")}
                            handlePrev={() => setActiveTab("dashboard")}
                          />
                        </div>
                      )}

                      {settingsTab === "shipping" && (
                        <div className="space-y-6">
                          <LaunchDetails
                            formData={formData}
                            handleChange={handleChange}
                            handlePrev={() => setActiveTab("dashboard")}
                            handleLaunchBusiness={() => handleSaveSettings("Fulfillment & PTC Configurations")}
                          />
                        </div>
                      )}

                      {settingsTab === "holiday" && (
                        <div className="space-y-6">
                          <div className="border-b border-gray-100 pb-3">
                            <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Vacation & Listings Status Settings</h4>
                            <p className="text-xs text-gray-500 mt-1">Temporarily alter your store visibility during holidays to avoid delivery delays.</p>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-gray-100">
                              <div>
                                <span className="font-bold text-xs block text-slate-800">Going on holidays?</span>
                                <span className="text-[11px] text-slate-500 mt-0.5 block">Toggle to activate Vacation/Holiday mode.</span>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  name="isHolidayMode"
                                  checked={formData.isHolidayMode}
                                  onChange={handleChange}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                              </label>
                            </div>

                            {formData.isHolidayMode && (
                              <div className="space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-gray-200 animate-fadeIn">
                                <div className="space-y-1.5">
                                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Listing Impact Mode</label>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {[
                                      { key: 'deactivate', label: 'Deactivate Listings (Inactive)', desc: 'Products are hidden from store' },
                                      { key: 'delay_warning', label: 'Keep Active (Show Delay Warning)', desc: 'Show warning to buyer on checkout' }
                                    ].map((option) => (
                                      <label 
                                        key={option.key} 
                                        className={`flex items-start space-x-3 p-3 border rounded-xl cursor-pointer bg-white transition-all ${
                                          formData.holidayPolicy === option.key ? 'border-orange-500 ring-1 ring-orange-500/20' : 'border-gray-200'
                                        }`}
                                      >
                                        <input
                                          type="radio"
                                          name="holidayPolicy"
                                          value={option.key}
                                          checked={formData.holidayPolicy === option.key}
                                          onChange={handleChange}
                                          className="mt-1 text-orange-600 focus:ring-orange-500"
                                        />
                                        <div>
                                          <span className="text-xs font-bold block text-slate-800">{option.label}</span>
                                          <span className="text-[10px] text-slate-500 block mt-0.5">{option.desc}</span>
                                        </div>
                                      </label>
                                    ))}
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1.5">
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Leave Start Date</label>
                                    <input
                                      type="date"
                                      name="holidayStart"
                                      value={formData.holidayStart}
                                      onChange={handleChange}
                                      className="w-full bg-white border border-gray-300 focus:border-orange-500 py-2.5 px-3 rounded-xl focus:outline-none text-xs"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Leave End Date</label>
                                    <input
                                      type="date"
                                      name="holidayEnd"
                                      value={formData.holidayEnd}
                                      onChange={handleChange}
                                      className="w-full bg-white border border-gray-300 focus:border-orange-500 py-2.5 px-3 rounded-xl focus:outline-none text-xs"
                                    />
                                  </div>
                                </div>

                                <div className="space-y-1.5">
                                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Auto-Response Notification message</label>
                                  <textarea
                                    name="holidayMessage"
                                    rows={2}
                                    value={formData.holidayMessage}
                                    onChange={handleChange}
                                    placeholder="e.g. We are temporarily away on vacation. Orders placed now will experience shipping delays."
                                    className="w-full bg-white border border-gray-300 focus:border-orange-500 py-2.5 px-3 rounded-xl focus:outline-none text-xs resize-none"
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex space-x-4 pt-4 border-t border-gray-100">
                            <button type="button" onClick={() => setActiveTab("dashboard")} className="w-1/2 border border-gray-300 rounded-xl py-3 text-xs font-black uppercase tracking-widest text-[#333333] bg-white hover:bg-slate-50">Back</button>
                            <button 
                              type="button" 
                              onClick={() => handleSaveSettings("Vacation Mode settings")} 
                              className="w-1/2 bg-gradient-to-b from-amber-400 to-amber-500 border border-amber-500 rounded-xl py-3 text-xs font-black uppercase tracking-widest text-white shadow-md shadow-amber-500/10"
                            >
                              Save Changes
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

          </main>
        </div>
      </div>

      {/* ═══════════════ EDIT PRODUCT MODAL ═══════════════ */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 sm:p-5 flex justify-between items-center flex-shrink-0">
              <div>
                <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">Edit Product</h4>
                <p className="text-[10px] text-white/50 mt-0.5 font-mono">SKU #{editingProduct.sku || editingProduct.id}</p>
              </div>
              <button onClick={() => setEditingProduct(null)} className="text-white/60 hover:text-white p-2 rounded-xl hover:bg-white/10 cursor-pointer transition-all">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProductEdit} className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto">
              <div className="space-y-1.5">
                <label className="font-black text-gray-500 uppercase tracking-widest text-[9px]">Product Name</label>
                <input type="text" required
                  className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-orange-500 py-2 sm:py-3 px-3 sm:px-4 rounded-xl focus:outline-none text-[11px] transition-all focus:bg-white"
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <label className="font-black text-gray-500 uppercase tracking-widest text-[9px]">Price (₹)</label>
                  <input type="number" required
                    className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-orange-500 py-2 sm:py-3 px-3 sm:px-4 rounded-xl focus:outline-none text-[11px] font-mono transition-all focus:bg-white"
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
                    className="w-full bg-slate-50 border border-transparent hover:border-[#D4AF37] py-2 sm:py-3 px-3 sm:px-4 rounded-xl focus:outline-none text-[11px] transition-all focus:bg-white"
                    value={editingProduct.inventory?.quantity || editingProduct.stock || ''}
                    onChange={(e) => setEditingProduct({ 
                      ...editingProduct, 
                      inventory: { ...editingProduct.inventory, quantity: Number(e.target.value) },
                      stock: Number(e.target.value)
                    })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-black text-gray-500 uppercase tracking-widest text-[9px]">Category</label>
                  <select
                    className="w-full bg-slate-50 border border-transparent hover:border-[#D4AF37] py-2 sm:py-3 px-3 sm:px-4 rounded-xl focus:outline-none text-[11px] transition-all focus:bg-white cursor-pointer"
                    value={editingProduct.category?._id || editingProduct.category || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  >
                    {categories.map(c => <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="font-black text-gray-500 uppercase tracking-widest text-[9px]">Image URL</label>
                <input type="url"
                  className="w-full bg-slate-50 border border-transparent hover:border-[#D4AF37] py-2 sm:py-3 px-3 sm:px-4 rounded-xl focus:outline-none text-[11px] font-mono transition-all focus:bg-white"
                  value={editingProduct.image || editingProduct.images?.[0]?.url || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-black text-gray-500 uppercase tracking-widest text-[9px]">Description</label>
                <textarea rows={3}
                  className="w-full bg-slate-50 border border-transparent hover:border-[#D4AF37] py-2 sm:py-3 px-3 sm:px-4 rounded-xl focus:outline-none text-[11px] leading-relaxed transition-all focus:bg-white resize-none"
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