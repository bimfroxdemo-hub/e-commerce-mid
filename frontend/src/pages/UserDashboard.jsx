import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  FiUser, FiShoppingBag, FiMapPin, FiStar, FiSettings, FiBell,
  FiCheckCircle, FiTrendingUp, FiPackage, FiHeart,
  FiGift, FiTruck, FiEdit2, FiTrash2, FiPlus, FiChevronRight,
  FiMessageCircle, FiLogOut, FiX, FiCheck, FiLock, FiMenu
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function UserDashboard() {
  const {
    currentUser,
    orders,
    reviews,
    notifications,
    readNotification,
    clearAllNotifications,
    logoutUser,
    addAddress,
    updateAddress,
    deleteAddress,
    updateUserProfile,
    changeUserPassword,
    uploadUserAvatar,
    isLoading
  } = useApp();

  const [activeTab, setActiveTab] = useState("overview");
  const [selectedOrderTracking, setSelectedOrderTracking] = useState(null);
  const [profileName, setProfileName] = useState(currentUser?.name || "");
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || "");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fileInputRef = useRef(null);

  // ADDRESS MANAGEMENT STATE
  const [localAddresses, setLocalAddresses] = useState([]);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [showEditAddressModal, setShowEditAddressModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState(null);
  const [deletingAddressIndex, setDeletingAddressIndex] = useState(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressForm, setAddressForm] = useState({
    label: '',
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });

  // PASSWORD CHANGE STATE
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // SYNC LOCAL ADDRESSES
  useEffect(() => {
    if (currentUser?.address) {
      console.log('🔄 Syncing addresses from currentUser:', currentUser.address);
      setLocalAddresses(currentUser.address);
    }
  }, [currentUser?.address]);

  // SYNC PROFILE FIELDS
  useEffect(() => {
    setProfileName(currentUser?.name || "");
    setProfilePhone(currentUser?.phone || "");
  }, [currentUser?.name, currentUser?.phone]);

  const userAddresses = localAddresses;

  // TRACKING STEPS CONFIG
  const TRACKING_STEPS = [
    { key: 'Ordered', label: 'Order Placed', icon: <FiCheckCircle size={18} /> },
    { key: 'Confirmed', label: 'Confirmed', icon: <FiPackage size={18} /> },
    { key: 'Shipped', label: 'Shipped', icon: <FiTruck size={18} /> },
    { key: 'Out for Delivery', label: 'Out for Delivery', icon: <FiTruck size={18} /> },
    { key: 'Delivered', label: 'Delivered', icon: <FiCheckCircle size={18} /> }
  ];

  const getStepIndex = (status) => {
    const idx = TRACKING_STEPS.findIndex(s => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  // PROFILE HANDLERS
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      if (typeof updateUserProfile === 'function') {
        await updateUserProfile({ name: profileName, phone: profilePhone });
      } else {
        currentUser.name = profileName;
        currentUser.phone = profilePhone;
        toast.success("Profile updated successfully!");
      }
    } catch (err) {
      toast.error(err?.message || "Failed to update profile");
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be less than 2MB");
        return;
      }
      try {
        if (typeof uploadUserAvatar === 'function') {
          await uploadUserAvatar(file);
        } else {
          toast.success("Avatar uploaded successfully!");
        }
      } catch (err) {
        console.error('Avatar upload error:', err);
      }
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    try {
      if (typeof changeUserPassword === 'function') {
        await changeUserPassword({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        });
      } else {
        toast.success("Password changed successfully!");
      }
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordChangeModal(false);
    } catch (err) {
      toast.error(err?.message || "Failed to change password");
    }
  };

  // UTILITY HANDLERS
  const handleTrackOrder = (order) => {
    setSelectedOrderTracking(order);
    setActiveTab("orders");
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await logoutUser();
    }
  };

  // ADDRESS HANDLERS
  const resetAddressForm = () => {
    setAddressForm({
      label: '',
      fullName: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: false
    });
  };

  const closeAddressModal = () => {
    setShowAddAddressModal(false);
    setShowEditAddressModal(false);
    setEditingAddressIndex(null);
    resetAddressForm();
  };

  const handleEditAddress = (address, idx) => {
    setAddressForm({
      label: address.label || '',
      fullName: address.fullName || '',
      phone: address.phone || '',
      street: address.street || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode || '',
      isDefault: address.isDefault || false
    });
    setEditingAddressIndex(idx);
    setShowEditAddressModal(true);
  };

  const handleDeleteAddress = (idx) => {
    setDeletingAddressIndex(idx);
    setShowDeleteConfirmation(true);
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();

    if (!addressForm.label || !addressForm.fullName || !addressForm.phone ||
      !addressForm.street || !addressForm.city || !addressForm.state || !addressForm.pincode) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setAddressLoading(true);

      if (showEditAddressModal) {
        const addr = userAddresses[editingAddressIndex];
        console.log('✏️ Editing address:', addr._id);

        const result = await updateAddress(addr._id, addressForm);

        if (result?.success || result?.data) {
          toast.success("Address updated successfully!");
        }
      } else {
        console.log('➕ Adding new address');

        const result = await addAddress(addressForm);

        if (result?.success || result?.data) {
          toast.success("Address added successfully!");
        }
      }

      closeAddressModal();
    } catch (err) {
      console.error('Address submit error:', err);
      toast.error(err?.message || "Failed to save address");
    } finally {
      setAddressLoading(false);
    }
  };

  const confirmDeleteAddress = async () => {
    try {
      setAddressLoading(true);
      const addr = userAddresses[deletingAddressIndex];
      console.log('🗑️ Deleting address:', addr._id);

      const result = await deleteAddress(addr._id);

      if (result?.success || result?.data) {
        toast.success("Address removed successfully!");
      }

      setShowDeleteConfirmation(false);
      setDeletingAddressIndex(null);
    } catch (err) {
      console.error('Delete address error:', err);
      toast.error(err?.message || "Failed to delete address");
    } finally {
      setAddressLoading(false);
    }
  };

  const handleSetDefault = async (idx) => {
    try {
      setAddressLoading(true);
      const addr = userAddresses[idx];
      console.log('⭐ Setting default address:', addr._id);

      const result = await updateAddress(addr._id, {
        ...addr,
        isDefault: true
      });

      if (result?.success || result?.data) {
        toast.success("Default address updated!");
      }
    } catch (err) {
      console.error('Set default error:', err);
      toast.error(err?.message || "Failed to set default address");
    } finally {
      setAddressLoading(false);
    }
  };

  // Calculate stats
  const safeOrders = orders || [];
  const safeReviews = reviews || [];
  const safeNotifications = notifications || [];

  const totalSpent = safeOrders.reduce((acc, o) => acc + (o.total || 0), 0);
  const pendingOrders = safeOrders.filter(o => o.status !== 'Delivered').length;
  const unreadNotifications = safeNotifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F8F8] via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-10">

        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-[#1A1A3A] via-[#2E3192] to-[#007A8A] rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 sm:w-64 h-40 sm:h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-8 sm:-bottom-10 -left-8 sm:-left-10 w-32 sm:w-40 h-32 sm:h-40 bg-[#007A8A]/20 rounded-full blur-2xl"></div>

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-4 lg:gap-6">
              <div className="flex items-center gap-2.5 sm:gap-4 w-full lg:w-auto">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all"
                >
                  <FiMenu size={18} className="text-white" />
                </button>

                <div className="relative">
                  <img
                    src={currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop"}
                    alt="Avatar"
                    className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full border-4 border-white/30 shadow-lg object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-[#D4AF37] border-4 border-[#1A1A3A] rounded-full"></div>
                </div>

                <div className="text-white flex-1">
                  <h1 className="text-base sm:text-lg lg:text-2xl font-black mb-0.5 sm:mb-1 truncate">
                    Hello, {currentUser?.name ? currentUser.name.split(' ')[0] : 'User'}! 👋
                  </h1>
                  <p className="text-white/70 text-[10px] sm:text-xs lg:text-sm mb-1 sm:mb-2 truncate">{currentUser?.email || 'No email set'}</p>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#D4AF37] text-[#1A1A3A] text-[9px] sm:text-xs lg:text-xs font-black px-2 sm:px-3 py-0.5 sm:py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
                      <FiStar className="fill-current" size={10} />
                      <span className="hidden sm:inline">Prime</span> Member
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-6 w-full lg:w-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl p-2.5 sm:p-3 lg:p-4 text-center border border-white/20">
                  <div className="text-white text-base sm:text-xl lg:text-3xl font-black mb-0.5 sm:mb-1">{safeOrders.length}</div>
                  <div className="text-white/70 text-[9px] sm:text-xs lg:text-sm">Orders</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl p-2.5 sm:p-3 lg:p-4 text-center border border-white/20">
                  <div className="text-white text-base sm:text-xl lg:text-3xl font-black mb-0.5 sm:mb-1">₹{(totalSpent / 1000).toFixed(1)}k</div>
                  <div className="text-white/70 text-[9px] sm:text-xs lg:text-sm">Spent</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl p-2.5 sm:p-3 lg:p-4 text-center border border-white/20">
                  <div className="text-white text-base sm:text-xl lg:text-3xl font-black mb-0.5 sm:mb-1">{unreadNotifications}</div>
                  <div className="text-white/70 text-[9px] sm:text-xs lg:text-sm">Alerts</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">

          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setSidebarOpen(false)}
              ></div>
              
              <aside className="absolute left-0 top-0 bottom-0 w-64 sm:w-80 bg-white shadow-2xl overflow-y-auto animate-slide-in-left z-50">
                <div className="sticky top-0 z-10 bg-gradient-to-r from-[#1A1A3A] to-[#2E3192] p-4 flex justify-between items-center">
                  <h2 className="font-black text-white text-xs sm:text-sm uppercase tracking-wider">My Account</h2>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/20 transition-all"
                  >
                    <FiX size={18} className="text-white" />
                  </button>
                </div>

                <nav className="p-2.5 space-y-1">
                  {[
                    { id: "overview", label: "Dashboard", icon: <FiTrendingUp size={18} /> },
                    { id: "orders", label: "My Orders", icon: <FiShoppingBag size={18} />, badge: pendingOrders },
                    { id: "addresses", label: "Addresses", icon: <FiMapPin size={18} />, badge: userAddresses.length },
                    { id: "reviews", label: "My Reviews", icon: <FiStar size={18} /> },
                    { id: "notifications", label: "Notifications", icon: <FiBell size={18} />, badge: unreadNotifications },
                    { id: "settings", label: "Account Settings", icon: <FiSettings size={18} /> }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full text-left py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between transition-all ${
                        activeTab === item.id
                          ? 'bg-gradient-to-r from-[#007A8A] to-[#2E3192] text-white shadow-lg shadow-[#007A8A]/30'
                          : 'hover:bg-slate-50 text-[#333333] hover:text-[#007A8A]'
                      }`}
                    >
                      <span className="flex items-center gap-2 sm:gap-3">
                        {item.icon}
                        <span>{item.label}</span>
                      </span>
                      {item.badge > 0 && (
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                          activeTab === item.id ? 'bg-white/20' : 'bg-[#D4AF37] text-[#1A1A3A]'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ))}

                  <button
                    onClick={() => {
                      handleLogout();
                      setSidebarOpen(false);
                    }}
                    className="w-full text-left py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 sm:gap-3 transition-all hover:bg-red-50 text-rose-500 hover:text-rose-600 mt-4 border-t border-gray-100 pt-3 sm:pt-4"
                  >
                    <FiLogOut size={18} />
                    <span>Logout</span>
                  </button>
                </nav>
              </aside>
            </div>
          )}

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
              <div className="p-4 bg-gradient-to-r from-[#F8F8F8] to-white border-b border-gray-100">
                <h2 className="font-black text-[#1A1A3A] text-sm flex items-center gap-2 uppercase tracking-wider">
                  <FiUser size={16} />
                  My Account
                </h2>
              </div>

              <nav className="p-2.5 space-y-1">
                {[
                  { id: "overview", label: "Dashboard", icon: <FiTrendingUp size={18} /> },
                  { id: "orders", label: "My Orders", icon: <FiShoppingBag size={18} />, badge: pendingOrders },
                  { id: "addresses", label: "Addresses", icon: <FiMapPin size={18} />, badge: userAddresses.length },
                  { id: "reviews", label: "My Reviews", icon: <FiStar size={18} /> },
                  { id: "notifications", label: "Notifications", icon: <FiBell size={18} />, badge: unreadNotifications },
                  { id: "settings", label: "Account Settings", icon: <FiSettings size={18} /> }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full text-left py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-between transition-all ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-[#007A8A] to-[#2E3192] text-white shadow-lg shadow-[#007A8A]/30'
                        : 'hover:bg-slate-50 text-[#333333] hover:text-[#007A8A]'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </span>
                    {item.badge > 0 && (
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        activeTab === item.id ? 'bg-white/20' : 'bg-[#D4AF37] text-[#1A1A3A]'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}

                <button
                  onClick={handleLogout}
                  className="w-full text-left py-3 px-4 rounded-xl text-sm font-bold flex items-center gap-3 transition-all hover:bg-red-50 text-rose-500 hover:text-rose-600 mt-4 border-t border-gray-100 pt-4"
                >
                  <FiLogOut size={18} />
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-4">

            {/* TAB: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-4 sm:space-y-5 lg:space-y-6 animate-fade-in">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-4">
                  {[
                    { icon: <FiShoppingBag />, label: "Track Orders", bgColor: "bg-gradient-to-br from-[#007A8A]/10 to-[#2E3192]/10", iconColor: "text-[#007A8A]", action: () => setActiveTab("orders") },
                    { icon: <FiMapPin />, label: "Manage Addresses", bgColor: "bg-gradient-to-br from-[#2E3192]/10 to-[#D4AF37]/10", iconColor: "text-[#2E3192]", action: () => setActiveTab("addresses") },
                    { icon: <FiHeart />, label: "My Wishlist", bgColor: "bg-gradient-to-br from-rose-100 to-pink-100", iconColor: "text-rose-500", action: () => toast.success("Wishlist coming soon!") },
                    { icon: <FiGift />, label: "Rewards", bgColor: "bg-gradient-to-br from-purple-100 to-indigo-100", iconColor: "text-purple-600", action: () => toast.success("Rewards coming soon!") }
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={item.action}
                      className={`${item.bgColor} rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-[#007A8A]/30 transition-all group cursor-pointer`}
                    >
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 ${item.iconColor} rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform`}>
                        {React.cloneElement(item.icon, { size: 18 })}
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-[#333333] text-left">{item.label}</p>
                    </button>
                  ))}
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 sm:p-5 lg:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                    <h3 className="font-black text-[#1A1A3A] text-base sm:text-lg lg:text-xl flex items-center gap-2">
                      <FiPackage className="text-[#007A8A]" size={20} />
                      <span className="hidden sm:inline">Recent </span>Orders
                    </h3>
                    <button
                      onClick={() => setActiveTab("orders")}
                      className="text-[#007A8A] hover:text-[#2E3192] text-xs sm:text-sm font-bold flex items-center gap-1 transition-colors"
                    >
                      View All <FiChevronRight size={14} />
                    </button>
                  </div>

                  <div className="p-4 sm:p-5 lg:p-6 space-y-2.5 sm:space-y-3 lg:space-y-4">
                    {safeOrders.length > 0 ? (
                      safeOrders.slice(0, 3).map((order) => (
                        <div key={order.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-3 lg:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl hover:bg-gray-100 transition-colors">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-[#007A8A]/20 to-[#2E3192]/20 rounded-lg sm:rounded-lg flex items-center justify-center flex-shrink-0">
                            <FiShoppingBag className="text-[#007A8A]" size={20} />
                          </div>
                          <div className="flex-1 min-w-0 w-full sm:w-auto">
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                              <h4 className="font-bold text-[#1A1A3A] text-xs sm:text-sm truncate">{order.id}</h4>
                              <span className={`text-[9px] font-black px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap ${
                                order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                order.status === 'Shipped' ? 'bg-[#007A8A]/10 text-[#007A8A]' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            <p className="text-[9px] sm:text-xs text-[#333333]/70 mb-0.5">{order.items?.length || 0} items • ₹{(order.total || 0).toLocaleString()}</p>
                            <p className="text-[8px] sm:text-xs text-[#333333]/50">{order.date}</p>
                          </div>
                          <button
                            onClick={() => handleTrackOrder(order)}
                            className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#007A8A] to-[#2E3192] hover:from-[#2E3192] hover:to-[#007A8A] text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-[#007A8A]/30"
                          >
                            Track
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 sm:py-12">
                        <FiPackage className="text-gray-300 mx-auto mb-2 sm:mb-3" size={40} />
                        <p className="text-[#333333]/60 text-xs sm:text-sm">No orders placed yet</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Promo Banner */}
                <div className="bg-gradient-to-r from-[#D4AF37] via-[#007A8A] to-[#2E3192] rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-5 lg:p-8 text-white shadow-xl overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 sm:w-48 h-32 sm:h-48 bg-white/10 rounded-full blur-2xl"></div>
                  <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                        <FiGift size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg lg:text-xl font-black mb-1 sm:mb-2">Exclusive Member Benefits!</h3>
                        <p className="text-white/90 text-xs sm:text-sm mb-2 sm:mb-3">Free shipping, early access to sales, and special discounts.</p>
                        <button className="bg-white text-[#1A1A3A] px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm hover:bg-gray-100 transition-colors shadow-lg">
                          Explore Benefits
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ORDERS WITH TRACKING TIMELINE */}
            {activeTab === "orders" && (
              <div className="space-y-4 sm:space-y-5 lg:space-y-6">
                <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 sm:p-5 lg:p-6 border-b border-gray-100">
                    <h3 className="font-black text-[#1A1A3A] text-base sm:text-lg lg:text-xl flex items-center gap-2">
                      <FiShoppingBag className="text-[#007A8A]" size={20} />
                      My Orders
                    </h3>
                  </div>
                  <div className="p-4 sm:p-5 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6">
                    {safeOrders.length > 0 ? safeOrders.map((order) => {
                      const currentStepIdx = getStepIndex(order.status);
                      const isTrackingOpen = selectedOrderTracking?.id === order.id;

                      return (
                        <div key={order.id} className="border border-gray-200 rounded-xl sm:rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                          {/* Order Header */}
                          <div className="bg-gray-50 px-4 sm:px-5 lg:px-6 py-3 sm:py-4 flex flex-wrap justify-between items-center gap-2 sm:gap-3 lg:gap-4 border-b border-gray-200">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm flex-1 w-full">
                              <div><p className="text-[#333333]/60 text-[9px] font-bold">PLACED</p><p className="font-bold text-[#1A1A3A] text-xs">{order.date}</p></div>
                              <div><p className="text-[#333333]/60 text-[9px] font-bold">TOTAL</p><p className="font-bold text-[#1A1A3A] text-xs">₹{(order.total || 0).toLocaleString()}</p></div>
                              <div className="hidden lg:block"><p className="text-[#333333]/60 text-[9px] font-bold">SHIP TO</p><p className="font-bold text-[#1A1A3A] text-xs truncate">{order.shippingAddress?.fullName || currentUser?.name || 'N/A'}</p></div>
                              <div><p className="text-[#333333]/60 text-[9px] font-bold">ID</p><p className="font-bold text-[#007A8A] text-xs">{order.id}</p></div>
                            </div>
                          </div>

                          {/* Order Body */}
                          <div className="p-4 sm:p-5 lg:p-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gray-100 rounded-lg sm:rounded-lg flex items-center justify-center"><FiPackage className="text-gray-400" size={24} /></div>
                                <div>
                                  <h4 className="font-bold text-[#1A1A3A] text-xs sm:text-sm">{order.items?.length || 0} Items</h4>
                                  <span className={`text-[9px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full mt-1 inline-block ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : order.status === 'Shipped' ? 'bg-[#007A8A]/10 text-[#007A8A]' : order.status === 'Out for Delivery' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {order.status}
                                  </span>
                                </div>
                              </div>
                              <button onClick={() => setSelectedOrderTracking(isTrackingOpen ? null : order)} className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${isTrackingOpen ? 'bg-gray-200 text-gray-700' : 'bg-gradient-to-r from-[#007A8A] to-[#2E3192] hover:from-[#2E3192] hover:to-[#007A8A] text-white'}`}>
                                <FiTruck size={14} />{isTrackingOpen ? 'Hide' : 'Track'}
                              </button>
                            </div>

                            {/* VISUAL TRACKING TIMELINE */}
                            {isTrackingOpen && (
                              <div className="mt-4 sm:mt-6 p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-slate-50 to-[#007A8A]/5 rounded-xl sm:rounded-2xl border border-[#007A8A]/20">
                                {/* Progress Bar */}
                                <div className="relative mb-6 sm:mb-8">
                                  {/* Background Line */}
                                  <div className="absolute top-4 sm:top-5 left-0 right-0 h-1 bg-gray-200 rounded-full"></div>
                                  {/* Active Line */}
                                  <div className="absolute top-4 sm:top-5 left-0 h-1 bg-gradient-to-r from-[#007A8A] to-green-500 rounded-full transition-all duration-700" style={{ width: `${(currentStepIdx / (TRACKING_STEPS.length - 1)) * 100}%` }}></div>

                                  {/* Steps */}
                                  <div className="relative flex justify-between px-1">
                                    {TRACKING_STEPS.map((step, idx) => {
                                      const isCompleted = idx < currentStepIdx;
                                      const isCurrent = idx === currentStepIdx;

                                      return (
                                        <div key={step.key} className="flex flex-col items-center" style={{ width: `${100 / TRACKING_STEPS.length}%` }}>
                                          {/* Circle */}
                                          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10 ${
                                            isCompleted ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-200' :
                                            isCurrent ? 'bg-[#007A8A] border-[#007A8A] text-white shadow-lg shadow-[#007A8A]/30 scale-110 animate-pulse' :
                                            'bg-white border-gray-300 text-gray-400'
                                          }`}>
                                            {isCompleted ? <FiCheck size={14} /> : isCurrent ? step.icon : <span className="text-xs font-bold">{idx + 1}</span>}
                                          </div>
                                          {/* Label */}
                                          <span className={`mt-2 text-[9px] sm:text-[10px] font-bold text-center leading-tight ${
                                            isCompleted ? 'text-green-700' : isCurrent ? 'text-[#007A8A]' : 'text-gray-400'
                                          }`}>{step.label}</span>
                                          {isCurrent && <span className="text-[8px] text-[#007A8A] mt-0.5 font-bold">Current</span>}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Status Details Card */}
                                <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm space-y-2 sm:space-y-3">
                                  <div className="flex items-center gap-2 sm:gap-3">
                                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                      order.status === 'Delivered' ? 'bg-green-100 text-green-600' :
                                      order.status === 'Out for Delivery' ? 'bg-orange-100 text-orange-600' :
                                      order.status === 'Shipped' ? 'bg-[#007A8A]/10 text-[#007A8A]' :
                                      'bg-yellow-100 text-yellow-600'
                                    }`}>
                                      {TRACKING_STEPS[currentStepIdx]?.icon}
                                    </div>
                                    <div>
                                      <p className="font-bold text-[#1A1A3A] text-xs sm:text-sm">{TRACKING_STEPS[currentStepIdx]?.label}</p>
                                      <p className="text-[9px] sm:text-xs text-[#333333]/70">
                                        {order.status === 'Delivered' ? 'Package delivered successfully!' :
                                         order.status === 'Out for Delivery' ? 'Package on its way! Expected today.' :
                                         order.status === 'Shipped' ? 'Package dispatched. Expected in 2-3 days.' :
                                         order.status === 'Confirmed' ? 'Order confirmed. Preparing for shipment.' :
                                         'Order received. Awaiting confirmation.'}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Tracking ID */}
                                  {order.trackingId && (
                                    <div className="flex items-center gap-2 p-2.5 sm:p-3 bg-[#007A8A]/5 rounded-lg border border-[#007A8A]/20">
                                      <FiTruck size={12} className="text-[#007A8A] flex-shrink-0" />
                                      <span className="text-[9px] sm:text-xs text-[#333333]/70">Tracking:</span>
                                      <span className="text-[9px] sm:text-xs font-mono font-bold text-[#007A8A]">{order.trackingId}</span>
                                    </div>
                                  )}

                                  {/* Delivery Address */}
                                  {order.shippingAddress && (
                                    <div className="flex items-start gap-2 p-2.5 sm:p-3 bg-gray-50 rounded-lg border border-gray-100">
                                      <FiMapPin size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                      <p className="text-[9px] sm:text-xs text-[#333333]/70">
                                        {order.shippingAddress.fullName}, {order.shippingAddress.street || ''}, {order.shippingAddress.city || ''} - {order.shippingAddress.zipCode || ''}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="text-center py-12 sm:py-16">
                        <FiShoppingBag className="text-gray-300 mx-auto mb-3 sm:mb-4" size={48} />
                        <h4 className="font-bold text-[#1A1A3A] text-sm sm:text-base mb-1">No Orders Yet</h4>
                        <p className="text-[#333333]/60 text-xs sm:text-sm">Your order history will appear here</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ADDRESSES */}
            {activeTab === "addresses" && (
              <div className="space-y-4 sm:space-y-5 lg:space-y-6 animate-fade-in">
                <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 sm:p-5 lg:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
                    <div>
                      <h3 className="font-black text-[#1A1A3A] text-base sm:text-lg lg:text-xl flex items-center gap-2">
                        <FiMapPin className="text-[#007A8A]" size={20} />
                        My Addresses
                      </h3>
                      <p className="text-[#333333]/60 text-xs sm:text-sm mt-1">Manage your delivery addresses</p>
                    </div>
                    <button
                      onClick={() => setShowAddAddressModal(true)}
                      className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gradient-to-r from-[#007A8A] to-[#2E3192] hover:from-[#2E3192] hover:to-[#007A8A] text-white text-xs sm:text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <FiPlus size={16} />
                      <span className="hidden sm:inline">Add</span> Address
                    </button>
                  </div>

                  <div className="p-4 sm:p-5 lg:p-6">
                    {userAddresses.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        {userAddresses.map((addr, idx) => (
                          <div
                            key={addr._id || idx}
                            className={`border-2 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 hover:shadow-lg transition-all relative group ${addr.isDefault
                              ? 'border-[#007A8A] bg-[#007A8A]/5 shadow-lg shadow-[#007A8A]/20'
                              : 'border-gray-200 hover:border-[#007A8A]/40'
                              }`}
                          >
                            {addr.isDefault && (
                              <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex items-center gap-1.5">
                                <FiCheckCircle className="text-[#007A8A]" size={14} />
                                <span className="bg-[#007A8A]/10 text-[#007A8A] text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-full">
                                  DEFAULT
                                </span>
                              </div>
                            )}

                            <div className="mb-3 sm:mb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${addr.isDefault ? 'bg-[#007A8A]/20' : 'bg-gray-100'
                                  }`}>
                                  <FiMapPin className={addr.isDefault ? 'text-[#007A8A]' : 'text-gray-600'} size={18} />
                                </div>
                                <h4 className={`font-bold uppercase text-xs sm:text-sm ${addr.isDefault ? 'text-[#007A8A]' : 'text-[#1A1A3A]'
                                  }`}>
                                  {addr.label}
                                </h4>
                              </div>
                              <p className="font-bold text-[#1A1A3A] text-xs sm:text-sm mb-1.5">{addr.fullName}</p>
                              <p className="text-xs sm:text-sm text-[#333333]/70 leading-relaxed mb-2">
                                {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                              </p>
                              <p className="text-xs sm:text-sm text-[#333333]/70">Phone: {addr.phone}</p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2 pt-3 sm:pt-4 border-t border-gray-100">
                              {addr.isDefault ? (
                                <button
                                  disabled
                                  className="flex-1 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-[#007A8A]/10 text-[#007A8A] text-[9px] sm:text-xs font-bold rounded-lg cursor-not-allowed flex items-center justify-center gap-1.5"
                                >
                                  <FiCheckCircle size={12} />
                                  Default
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleSetDefault(idx)}
                                  disabled={addressLoading}
                                  className="flex-1 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-green-50 hover:bg-green-100 disabled:bg-gray-100 text-green-600 disabled:text-gray-400 text-[9px] sm:text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                                >
                                  <FiCheck size={12} />
                                  Set Default
                                </button>
                              )}

                              <button
                                onClick={() => handleEditAddress(addr, idx)}
                                className="flex-1 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-[#007A8A]/10 hover:bg-[#007A8A]/20 text-[#007A8A] text-[9px] sm:text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                              >
                                <FiEdit2 size={12} />
                                Edit
                              </button>

                              <button
                                onClick={() => handleDeleteAddress(idx)}
                                className="flex-1 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-red-50 hover:bg-red-100 text-rose-600 text-[9px] sm:text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                              >
                                <FiTrash2 size={12} />
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}

                        <div
                          onClick={() => setShowAddAddressModal(true)}
                          className="border-2 border-dashed border-gray-300 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 hover:border-[#007A8A] hover:bg-[#007A8A]/5 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[200px] sm:min-h-[250px] group"
                        >
                          <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gray-100 group-hover:bg-[#007A8A]/10 rounded-full flex items-center justify-center mb-2.5 sm:mb-4 transition-colors">
                            <FiPlus className="text-gray-400 group-hover:text-[#007A8A]" size={28} />
                          </div>
                          <p className="font-bold text-[#333333] group-hover:text-[#007A8A] text-sm text-center">Add New Address</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 sm:py-16">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                          <FiMapPin className="text-gray-400" size={32} />
                        </div>
                        <h4 className="font-bold text-[#1A1A3A] mb-1 text-sm">No Addresses Yet</h4>
                        <p className="text-[#333333]/60 text-xs sm:text-sm mb-4">Add your first delivery address</p>
                        <button
                          onClick={() => setShowAddAddressModal(true)}
                          className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#007A8A] to-[#2E3192] text-white font-bold text-xs sm:text-sm rounded-lg transition-colors flex items-center gap-2 mx-auto"
                        >
                          <FiPlus size={16} />
                          Add First Address
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Add/Edit Address Modal */}
                {(showAddAddressModal || showEditAddressModal) && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
                      <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10 bg-white">
                        <h3 className="font-bold text-[#1A1A3A] text-base sm:text-lg">
                          {showEditAddressModal ? 'Edit Address' : 'Add New Address'}
                        </h3>
                        <button
                          onClick={closeAddressModal}
                          className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                        >
                          <FiX className="text-gray-600" size={18} />
                        </button>
                      </div>

                      <form onSubmit={handleAddressSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto max-h-[calc(90vh-100px)]">
                        <div>
                          <label className="block text-xs sm:text-sm font-bold text-[#1A1A3A] mb-2 uppercase">Address Label</label>
                          <select
                            value={addressForm.label}
                            onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#007A8A] focus:border-transparent text-xs sm:text-sm"
                            required
                          >
                            <option value="">Select label</option>
                            <option value="home">Home</option>
                            <option value="work">Work</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-bold text-[#1A1A3A] mb-2 uppercase">Full Name</label>
                          <input
                            type="text"
                            value={addressForm.fullName}
                            onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#007A8A] focus:border-transparent text-xs sm:text-sm"
                            placeholder="Enter full name"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-bold text-[#1A1A3A] mb-2 uppercase">Phone Number</label>
                          <input
                            type="tel"
                            value={addressForm.phone}
                            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#007A8A] focus:border-transparent text-xs sm:text-sm"
                            placeholder="Enter phone number"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-bold text-[#1A1A3A] mb-2 uppercase">Street Address</label>
                          <textarea
                            value={addressForm.street}
                            onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#007A8A] focus:border-transparent resize-none text-xs sm:text-sm"
                            placeholder="House/Flat no., Street name, Area"
                            rows="2"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs sm:text-sm font-bold text-[#1A1A3A] mb-2 uppercase">City</label>
                            <input
                              type="text"
                              value={addressForm.city}
                              onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#007A8A] focus:border-transparent text-xs sm:text-sm"
                              placeholder="City"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-xs sm:text-sm font-bold text-[#1A1A3A] mb-2 uppercase">State</label>
                            <input
                              type="text"
                              value={addressForm.state}
                              onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#007A8A] focus:border-transparent text-xs sm:text-sm"
                              placeholder="State"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-bold text-[#1A1A3A] mb-2 uppercase">PIN Code</label>
                          <input
                            type="text"
                            value={addressForm.pincode}
                            onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#007A8A] focus:border-transparent text-xs sm:text-sm"
                            placeholder="PIN Code"
                            maxLength={6}
                            required
                          />
                        </div>

                        <div className="flex items-center gap-2.5 p-3 sm:p-4 bg-[#007A8A]/5 rounded-lg border border-[#007A8A]/20">
                          <input
                            type="checkbox"
                            id="isDefault"
                            checked={addressForm.isDefault}
                            onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                            className="w-4 h-4 text-[#007A8A] rounded focus:ring-[#007A8A] cursor-pointer"
                          />
                          <label htmlFor="isDefault" className="text-xs sm:text-sm font-bold text-[#1A1A3A] cursor-pointer flex-1">
                            Set as default address
                          </label>
                        </div>

                        <div className="flex gap-2.5 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-100">
                          <button
                            type="button"
                            onClick={closeAddressModal}
                            className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-[#333333] font-bold rounded-lg transition-colors text-xs sm:text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={addressLoading}
                            className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-[#007A8A] to-[#2E3192] hover:from-[#2E3192] hover:to-[#007A8A] disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-lg transition-colors text-xs sm:text-sm"
                          >
                            {addressLoading
                              ? 'Saving...'
                              : showEditAddressModal ? 'Update' : 'Add Address'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteConfirmation && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                      <div className="p-4 sm:p-6 text-center">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                          <FiTrash2 className="text-red-600" size={20} />
                        </div>
                        <h3 className="font-bold text-[#1A1A3A] text-base sm:text-lg mb-2">Delete Address</h3>
                        <p className="text-[#333333]/70 text-xs sm:text-sm mb-4 sm:mb-6">
                          Are you sure? This action cannot be undone.
                        </p>
                        <div className="flex gap-2.5 sm:gap-3">
                          <button
                            onClick={() => setShowDeleteConfirmation(false)}
                            className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-[#333333] font-bold rounded-lg transition-colors text-xs sm:text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={confirmDeleteAddress}
                            disabled={addressLoading}
                            className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold rounded-lg transition-colors text-xs sm:text-sm"
                          >
                            {addressLoading ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: REVIEWS */}
            {activeTab === "reviews" && (
              <div className="space-y-4 sm:space-y-5 lg:space-y-6 animate-fade-in">
                <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 sm:p-5 lg:p-6 border-b border-gray-100">
                    <h3 className="font-black text-[#1A1A3A] text-base sm:text-lg lg:text-xl flex items-center gap-2">
                      <FiStar className="text-[#D4AF37]" size={20} />
                      My Reviews
                    </h3>
                    <p className="text-[#333333]/60 text-xs sm:text-sm mt-1">Share your shopping experience</p>
                  </div>

                  <div className="p-4 sm:p-5 lg:p-6">
                    {safeReviews.length > 0 ? (
                      <div className="space-y-3 sm:space-y-4">
                        {safeReviews.map((rev) => (
                          <div key={rev.id} className="border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start gap-2 mb-3 sm:mb-4">
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <FiStar
                                    key={i}
                                    size={14}
                                    className={i < rev.rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-300'}
                                  />
                                ))}
                              </div>
                              <span className="text-xs sm:text-sm text-[#333333]/60 whitespace-nowrap">{rev.date}</span>
                            </div>
                            <p className="text-[#333333]/80 text-xs sm:text-sm leading-relaxed">"{rev.comment}"</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 sm:py-16">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                          <FiMessageCircle className="text-gray-400" size={32} />
                        </div>
                        <h4 className="font-bold text-[#1A1A3A] text-sm mb-1">No Reviews Yet</h4>
                        <p className="text-[#333333]/60 text-xs sm:text-sm">You haven't reviewed products yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: NOTIFICATIONS */}
            {activeTab === "notifications" && (
              <div className="space-y-4 sm:space-y-5 lg:space-y-6 animate-fade-in">
                <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 sm:p-5 lg:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
                    <div>
                      <h3 className="font-black text-[#1A1A3A] text-base sm:text-lg lg:text-xl flex items-center gap-2">
                        <FiBell className="text-[#007A8A]" size={20} />
                        Notifications
                      </h3>
                      <p className="text-[#333333]/60 text-xs sm:text-sm mt-1">Stay updated</p>
                    </div>
                    <button
                      onClick={() => { clearAllNotifications(); toast.success("All marked as read!"); }}
                      className="text-[#007A8A] hover:text-[#2E3192] text-xs sm:text-sm font-bold transition-colors whitespace-nowrap"
                    >
                      Mark all as read
                    </button>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {safeNotifications.length > 0 ? (
                      safeNotifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => readNotification(notif.id)}
                          className={`p-4 sm:p-5 lg:p-6 hover:bg-gray-50 transition-colors cursor-pointer ${!notif.read ? 'bg-[#007A8A]/5' : ''
                            }`}
                        >
                          <div className="flex gap-3 sm:gap-4">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${!notif.read ? 'bg-[#007A8A] text-white' : 'bg-gray-200 text-gray-500'
                              }`}>
                              <FiBell size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h4 className="font-bold text-[#1A1A3A] text-xs sm:text-sm">{notif.title}</h4>
                                {!notif.read && (
                                  <span className="w-2 h-2 bg-[#007A8A] rounded-full flex-shrink-0 mt-1.5"></span>
                                )}
                              </div>
                              <p className="text-xs sm:text-sm text-[#333333]/70 mb-1">{notif.message}</p>
                              <span className="text-xs text-[#333333]/50">{notif.time}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 sm:py-16">
                        <FiBell className="text-gray-300 mx-auto mb-3 sm:mb-4" size={48} />
                        <h4 className="font-bold text-[#1A1A3A] text-sm mb-1">No Notifications</h4>
                        <p className="text-[#333333]/60 text-xs sm:text-sm">You're all caught up!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SETTINGS */}
            {activeTab === "settings" && (
              <div className="space-y-4 sm:space-y-5 lg:space-y-6 animate-fade-in">
                {/* Profile Information Section */}
                <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 sm:p-5 lg:p-6 border-b border-gray-100">
                    <h3 className="font-black text-[#1A1A3A] text-base sm:text-lg lg:text-xl flex items-center gap-2">
                      <FiSettings className="text-[#007A8A]" size={20} />
                      Account Settings
                    </h3>
                    <p className="text-[#333333]/60 text-xs sm:text-sm mt-1">Manage your account information</p>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="p-4 sm:p-5 lg:p-6 space-y-5 sm:space-y-6">
                    {/* Profile Picture Section */}
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-[#1A1A3A] mb-3 uppercase">Profile Picture</label>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="relative">
                          <img
                            src={currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150"}
                            alt="Avatar"
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-4 border-gray-200 object-cover"
                          />
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-[#007A8A] border-4 border-white rounded-full flex items-center justify-center">
                            <FiEdit2 className="text-white" size={10} />
                          </div>
                        </div>
                        <div className="flex-1">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current.click()}
                            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-[#007A8A] to-[#2E3192] hover:from-[#2E3192] hover:to-[#007A8A] text-white text-xs sm:text-sm font-bold rounded-lg transition-colors mb-2 flex items-center justify-center gap-2"
                          >
                            <FiUser size={14} />
                            Change Photo
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                          />
                          <p className="text-[9px] sm:text-xs text-[#333333]/60">JPG, PNG or GIF. Max 2MB</p>
                        </div>
                      </div>
                    </div>

                    {/* Personal Information */}
                    <div>
                      <h4 className="font-bold text-[#1A1A3A] text-xs sm:text-sm mb-4 flex items-center gap-2 uppercase">
                        <FiUser className="text-[#007A8A]" size={16} />
                        Personal Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-bold text-[#1A1A3A] mb-2 uppercase">Full Name</label>
                          <input
                            type="text"
                            required
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007A8A] focus:border-transparent transition-all text-xs sm:text-sm"
                            placeholder="Enter your name"
                          />
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-bold text-[#1A1A3A] mb-2 uppercase">Email Address</label>
                          <div className="relative">
                            <input
                              type="email"
                              value={currentUser?.email || ''}
                              disabled
                              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed text-xs sm:text-sm"
                            />
                            <FiCheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" size={16} />
                          </div>
                          <p className="text-[9px] sm:text-xs text-[#333333]/60 mt-1">Verified and cannot be changed</p>
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-bold text-[#1A1A3A] mb-2 uppercase">Phone Number</label>
                          <input
                            type="tel"
                            value={profilePhone}
                            onChange={(e) => setProfilePhone(e.target.value)}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007A8A] focus:border-transparent transition-all text-xs sm:text-sm"
                            placeholder="Enter phone number"
                          />
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-bold text-[#1A1A3A] mb-2 uppercase">Member Since</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={
                                currentUser?.createdAt
                                  ? new Date(currentUser.createdAt).toLocaleDateString('en-IN', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })
                                  : "N/A"
                              }
                              disabled
                              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed text-xs sm:text-sm"
                            />
                            <FiStar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#D4AF37]" size={16} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-100">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#007A8A] to-[#2E3192] hover:from-[#2E3192] hover:to-[#007A8A] disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-lg transition-colors shadow-lg shadow-[#007A8A]/30 flex items-center justify-center gap-2 text-xs sm:text-sm"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span className="hidden sm:inline">Saving</span>...
                          </>
                        ) : (
                          <>
                            <FiCheck size={14} />
                            Save Changes
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-[#333333] font-bold rounded-lg transition-colors text-xs sm:text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>

                {/* Security Settings */}
                <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 sm:p-5 lg:p-6 border-b border-gray-100">
                    <h4 className="font-bold text-[#1A1A3A] text-base sm:text-lg flex items-center gap-2 uppercase">
                      <FiLock className="text-[#007A8A]" size={18} />
                      Security
                    </h4>
                    <p className="text-[#333333]/60 text-xs sm:text-sm mt-1">Keep your account secure</p>
                  </div>

                  <div className="p-4 sm:p-5 lg:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 lg:p-6 bg-gradient-to-r from-[#007A8A]/5 to-[#2E3192]/5 rounded-xl sm:rounded-2xl border border-[#007A8A]/20 hover:shadow-md transition-shadow">
                      <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#007A8A] to-[#2E3192] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                          <FiLock className="text-white" size={20} />
                        </div>
                        <div>
                          <h5 className="font-bold text-[#1A1A3A] text-sm sm:text-base">Change Password</h5>
                          <p className="text-[9px] sm:text-xs text-[#333333]/70 mt-1">Update password for security</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowPasswordChangeModal(true)}
                        className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#007A8A] to-[#2E3192] hover:from-[#2E3192] hover:to-[#007A8A] text-white font-bold rounded-lg transition-colors shadow-lg text-xs sm:text-sm"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>

        {/* Password Change Modal */}
        {showPasswordChangeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
              <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10 bg-white">
                <h3 className="font-bold text-[#1A1A3A] text-base sm:text-lg flex items-center gap-2">
                  <FiLock className="text-[#007A8A]" size={18} />
                  Change Password
                </h3>
                <button
                  onClick={() => setShowPasswordChangeModal(false)}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                >
                  <FiX className="text-gray-600" size={18} />
                </button>
              </div>

              <form onSubmit={handlePasswordChange} className="p-4 sm:p-6 space-y-3 sm:space-y-4 max-h-[calc(90vh-100px)] overflow-y-auto">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[#1A1A3A] mb-2 uppercase">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#007A8A] focus:border-transparent text-xs sm:text-sm"
                    placeholder="Enter current password"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[#1A1A3A] mb-2 uppercase">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#007A8A] focus:border-transparent text-xs sm:text-sm"
                    placeholder="Enter new password (min 6 characters)"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[#1A1A3A] mb-2 uppercase">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#007A8A] focus:border-transparent text-xs sm:text-sm"
                    placeholder="Confirm new password"
                    required
                  />
                </div>

                <div className="bg-[#007A8A]/5 border border-[#007A8A]/20 rounded-lg p-3 mt-4">
                  <p className="text-[9px] sm:text-xs text-[#007A8A] font-bold">
                    💡 Password must be at least 6 characters long
                  </p>
                </div>

                <div className="flex gap-2.5 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowPasswordChangeModal(false)}
                    className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-[#333333] font-bold rounded-lg transition-colors text-xs sm:text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-[#007A8A] to-[#2E3192] hover:from-[#2E3192] hover:to-[#007A8A] disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="hidden sm:inline">Changing</span>...
                      </>
                    ) : (
                      <>
                        <FiCheck size={14} />
                        Change Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}