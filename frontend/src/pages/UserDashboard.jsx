import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  FiUser, FiShoppingBag, FiMapPin, FiStar, FiSettings, FiBell,
  FiCheckCircle, FiTrendingUp, FiPackage, FiHeart,
  FiGift, FiTruck, FiEdit2, FiTrash2, FiPlus, FiChevronRight,
  FiMessageCircle, FiLogOut, FiX, FiCheck, FiLock
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
  const fileInputRef = useRef(null);

  // ✅ ADDRESS MANAGEMENT STATE
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

  // ✅ PASSWORD CHANGE STATE
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // ✅ SYNC LOCAL ADDRESSES WITH CURRENT USER
  useEffect(() => {
    if (currentUser?.address) {
      console.log('🔄 Syncing addresses from currentUser:', currentUser.address);
      setLocalAddresses(currentUser.address);
    }
  }, [currentUser?.address]);

  // ✅ SYNC PROFILE FIELDS
  useEffect(() => {
    setProfileName(currentUser?.name || "");
    setProfilePhone(currentUser?.phone || "");
  }, [currentUser?.name, currentUser?.phone]);

  // Use local state for rendering
  const userAddresses = localAddresses;

    // ✅ TRACKING STEPS CONFIG
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

  // ✅ PROFILE HANDLERS
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
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
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

  // ✅ UTILITY HANDLERS
  const handleTrackOrder = (order) => {
    setSelectedOrderTracking(order);
    setActiveTab("orders");
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await logoutUser();
    }
  };

  // ✅ ADDRESS HANDLERS
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">

        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl lg:rounded-3xl p-6 lg:p-8 mb-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl"></div>

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150"}
                    alt="Avatar"
                    className="w-16 h-16 lg:w-20 lg:h-20 rounded-full border-4 border-white/30 shadow-lg object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 border-4 border-blue-700 rounded-full"></div>
                </div>
                <div className="text-white">
                  <h1 className="text-xl lg:text-2xl font-bold mb-1">
                    Hello, {currentUser?.name ? currentUser.name.split(' ')[0] : 'User'}! 👋
                  </h1>
                  <p className="text-blue-100 text-sm mb-2">{currentUser?.email || 'No email set'}</p>
                  <div className="flex items-center gap-2">
                    <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <FiStar className="fill-current" size={12} />
                      Prime Member
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 lg:gap-6 w-full lg:w-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl lg:rounded-2xl p-3 lg:p-4 text-center border border-white/20">
                  <div className="text-white text-2xl lg:text-3xl font-bold mb-1">{safeOrders.length}</div>
                  <div className="text-blue-100 text-xs lg:text-sm">Total Orders</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl lg:rounded-2xl p-3 lg:p-4 text-center border border-white/20">
                  <div className="text-white text-2xl lg:text-3xl font-bold mb-1">₹{(totalSpent / 1000).toFixed(1)}k</div>
                  <div className="text-blue-100 text-xs lg:text-sm">Total Spent</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl lg:rounded-2xl p-3 lg:p-4 text-center border border-white/20">
                  <div className="text-white text-2xl lg:text-3xl font-bold mb-1">{unreadNotifications}</div>
                  <div className="text-blue-100 text-xs lg:text-sm">Notifications</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
              <div className="p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                  <FiUser size={16} />
                  My Account
                </h2>
              </div>

              <nav className="p-2">
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
                    className={`w-full text-left py-3 px-4 rounded-xl text-sm font-medium flex items-center justify-between transition-all mb-1 ${activeTab === item.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'hover:bg-gray-50 text-gray-700 hover:text-blue-600'
                      }`}
                  >
                    <span className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </span>
                    {item.badge > 0 && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${activeTab === item.id ? 'bg-white/20' : 'bg-red-500 text-white'
                        }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}

                <button
                  onClick={handleLogout}
                  className="w-full text-left py-3 px-4 rounded-xl text-sm font-medium flex items-center gap-3 transition-all mb-1 hover:bg-red-50 text-red-600 hover:text-red-700 mt-4 border-t border-gray-100 pt-4"
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
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { icon: <FiShoppingBag />, label: "Track Orders", color: "blue", action: () => setActiveTab("orders") },
                    { icon: <FiMapPin />, label: "Manage Addresses", color: "green", action: () => setActiveTab("addresses") },
                    { icon: <FiHeart />, label: "My Wishlist", color: "red", action: () => toast.success("Wishlist coming soon!") },
                    { icon: <FiGift />, label: "Rewards", color: "purple", action: () => toast.success("Rewards coming soon!") }
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={item.action}
                      className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-${item.color}-200 transition-all group cursor-pointer`}
                    >
                      <div className={`w-12 h-12 bg-${item.color}-100 text-${item.color}-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                        {React.cloneElement(item.icon, { size: 24 })}
                      </div>
                      <p className="text-sm font-semibold text-gray-700">{item.label}</p>
                    </button>
                  ))}
                </div>

                {/* Recent Orders Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                      <FiPackage className="text-blue-600" />
                      Recent Orders
                    </h3>
                    <button
                      onClick={() => setActiveTab("orders")}
                      className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1"
                    >
                      View All <FiChevronRight size={16} />
                    </button>
                  </div>

                  <div className="p-6 space-y-4">
                    {safeOrders.length > 0 ? (
                      safeOrders.slice(0, 3).map((order) => (
                        <div key={order.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FiShoppingBag className="text-blue-600" size={24} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-800 text-sm">{order.id}</h4>
                              <span className={`text-xs font-bold px-2 py-1 rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                {order.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mb-1">{order.items?.length || 0} items • ₹{(order.total || 0).toLocaleString()}</p>
                            <p className="text-xs text-gray-400">{order.date}</p>
                          </div>
                          <button
                            onClick={() => handleTrackOrder(order)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                          >
                            Track
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <FiPackage className="text-gray-300 mx-auto mb-3" size={48} />
                        <p className="text-gray-500 text-sm">No orders placed yet</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 rounded-2xl p-6 lg:p-8 text-white shadow-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                      <FiGift size={32} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">Exclusive Member Benefits!</h3>
                      <p className="text-white/90 text-sm mb-3">Free shipping, early access to sales, and special discounts on your next purchase.</p>
                      <button className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors">
                        Explore Benefits
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ✅ ORDERS WITH TRACKING TIMELINE */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="p-6 border-b border-gray-100"><h3 className="font-bold text-gray-800 text-xl flex items-center gap-2"><FiShoppingBag className="text-blue-600" />My Orders</h3></div>
                  <div className="p-6 space-y-6">
                    {safeOrders.length > 0 ? safeOrders.map((order) => {
                      const currentStepIdx = getStepIndex(order.status);
                      const isTrackingOpen = selectedOrderTracking?.id === order.id;

                      return (
                        <div key={order.id} className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                          {/* Order Header */}
                          <div className="bg-gray-50 px-6 py-4 flex flex-wrap justify-between items-center gap-4 border-b border-gray-200">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm flex-1">
                              <div><p className="text-gray-500 text-xs">PLACED</p><p className="font-semibold">{order.date}</p></div>
                              <div><p className="text-gray-500 text-xs">TOTAL</p><p className="font-semibold">₹{(order.total || 0).toLocaleString()}</p></div>
                              <div><p className="text-gray-500 text-xs">SHIP TO</p><p className="font-semibold truncate">{order.shippingAddress?.fullName || currentUser?.name || 'N/A'}</p></div>
                              <div><p className="text-gray-500 text-xs">ORDER ID</p><p className="font-semibold text-blue-600">{order.id}</p></div>
                            </div>
                          </div>

                          {/* Order Body */}
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center"><FiPackage className="text-gray-400" size={28} /></div>
                                <div>
                                  <h4 className="font-semibold text-gray-800">{order.items?.length || 0} Items</h4>
                                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' : order.status === 'Out for Delivery' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status}</span>
                                </div>
                              </div>
                              <button onClick={() => setSelectedOrderTracking(isTrackingOpen ? null : order)} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${isTrackingOpen ? 'bg-gray-200 text-gray-700' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                                <FiTruck size={16} />{isTrackingOpen ? 'Hide' : 'Track'}
                              </button>
                            </div>

                            {/* ✅ VISUAL TRACKING TIMELINE SLIDER */}
                            {isTrackingOpen && (
                              <div className="mt-6 p-6 bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-2xl border border-blue-100">
                                {/* Progress Bar */}
                                <div className="relative mb-8">
                                  {/* Background Line */}
                                  <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full"></div>
                                  {/* Active Line */}
                                  <div className="absolute top-5 left-0 h-1 bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-700" style={{ width: `${(currentStepIdx / (TRACKING_STEPS.length - 1)) * 100}%` }}></div>

                                  {/* Steps */}
                                  <div className="relative flex justify-between">
                                    {TRACKING_STEPS.map((step, idx) => {
                                      const isCompleted = idx < currentStepIdx;
                                      const isCurrent = idx === currentStepIdx;
                                      const isPending = idx > currentStepIdx;

                                      return (
                                        <div key={step.key} className="flex flex-col items-center" style={{ width: `${100 / TRACKING_STEPS.length}%` }}>
                                          {/* Circle */}
                                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10 ${
                                            isCompleted ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-200' :
                                            isCurrent ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 scale-110 animate-pulse' :
                                            'bg-white border-gray-300 text-gray-400'
                                          }`}>
                                            {isCompleted ? <FiCheck size={16} /> : isCurrent ? step.icon : <span className="text-xs font-bold">{idx + 1}</span>}
                                          </div>
                                          {/* Label */}
                                          <span className={`mt-2 text-[10px] font-bold text-center leading-tight ${
                                            isCompleted ? 'text-green-700' : isCurrent ? 'text-blue-700' : 'text-gray-400'
                                          }`}>{step.label}</span>
                                          {/* Time */}
                                          {isCurrent && <span className="text-[9px] text-blue-500 mt-0.5 font-medium">Current</span>}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Status Details Card */}
                                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                                  <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                      order.status === 'Delivered' ? 'bg-green-100 text-green-600' :
                                      order.status === 'Out for Delivery' ? 'bg-orange-100 text-orange-600' :
                                      order.status === 'Shipped' ? 'bg-blue-100 text-blue-600' :
                                      'bg-yellow-100 text-yellow-600'
                                    }`}>
                                      {TRACKING_STEPS[currentStepIdx]?.icon}
                                    </div>
                                    <div>
                                      <p className="font-bold text-gray-800 text-sm">{TRACKING_STEPS[currentStepIdx]?.label}</p>
                                      <p className="text-xs text-gray-500">
                                        {order.status === 'Delivered' ? 'Your package has been delivered successfully!' :
                                         order.status === 'Out for Delivery' ? 'Your package is on its way! Expected today.' :
                                         order.status === 'Shipped' ? 'Package dispatched. Expected in 2-3 days.' :
                                         order.status === 'Confirmed' ? 'Order confirmed. Preparing for shipment.' :
                                         'Order received. Awaiting confirmation.'}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Tracking ID */}
                                  {order.trackingId && (
                                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                      <FiTruck size={14} className="text-blue-600" />
                                      <span className="text-xs text-gray-600">Tracking ID:</span>
                                      <span className="text-xs font-mono font-bold text-blue-700">{order.trackingId}</span>
                                    </div>
                                  )}

                                  {/* Delivery Address */}
                                  {order.shippingAddress && (
                                    <div className="mt-3 flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                                      <FiMapPin size={14} className="text-gray-400 mt-0.5" />
                                      <p className="text-xs text-gray-600">
                                        {order.shippingAddress.fullName}, {order.shippingAddress.street || ''}, {order.shippingAddress.city || ''} - {order.shippingAddress.zipCode || ''}
                                      </p>
                                    </div>
                                  )}

                                  {/* Payment Info */}
                                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                                    <span>Payment: <strong className="text-gray-700">{order.paymentMethod || 'UPI'}</strong></span>
                                    <span>Total: <strong className="text-gray-900">₹{(order.total || 0).toLocaleString()}</strong></span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="text-center py-16"><FiShoppingBag className="text-gray-300 mx-auto mb-4" size={48} /><h4 className="font-semibold text-gray-800 mb-2">No Orders Yet</h4><p className="text-gray-500 text-sm">Your order history will appear here</p></div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ADDRESSES */}
            {activeTab === "addresses" && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-gray-800 text-xl flex items-center gap-2">
                        <FiMapPin className="text-blue-600" />
                        My Addresses
                      </h3>
                      <p className="text-gray-500 text-sm mt-1">Manage your delivery addresses</p>
                    </div>
                    <button
                      onClick={() => setShowAddAddressModal(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                    >
                      <FiPlus size={16} />
                      Add Address
                    </button>
                  </div>

                  <div className="p-6">
                    {userAddresses.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {userAddresses.map((addr, idx) => (
                          <div
                            key={addr._id || idx}
                            className={`border-2 rounded-2xl p-6 hover:shadow-lg transition-all relative group ${addr.isDefault
                              ? 'border-blue-500 bg-blue-50/30 shadow-lg shadow-blue-500/20'
                              : 'border-gray-200 hover:border-blue-400'
                              }`}
                          >
                            {addr.isDefault && (
                              <div className="absolute top-4 right-4 flex items-center gap-1">
                                <FiCheckCircle className="text-blue-600" size={16} />
                                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                                  DEFAULT
                                </span>
                              </div>
                            )}

                            <div className="mb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${addr.isDefault ? 'bg-blue-100' : 'bg-gray-100'
                                  }`}>
                                  <FiMapPin className={addr.isDefault ? 'text-blue-600' : 'text-gray-600'} size={20} />
                                </div>
                                <h4 className={`font-bold uppercase text-sm ${addr.isDefault ? 'text-blue-700' : 'text-gray-800'
                                  }`}>
                                  {addr.label}
                                </h4>
                              </div>
                              <p className="font-semibold text-gray-700 mb-2">{addr.fullName}</p>
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                              </p>
                              <p className="text-sm text-gray-600 mt-2">Phone: {addr.phone}</p>
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-gray-100">
                              {addr.isDefault ? (
                                <button
                                  disabled
                                  className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 text-sm font-semibold rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                  <FiCheckCircle size={14} />
                                  Default Address
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleSetDefault(idx)}
                                  disabled={addressLoading}
                                  className="flex-1 px-3 py-2 bg-green-50 hover:bg-green-100 disabled:bg-gray-100 text-green-600 disabled:text-gray-400 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                  <FiCheck size={14} />
                                  {addressLoading ? 'Setting...' : 'Set as Default'}
                                </button>
                              )}

                              <button
                                onClick={() => handleEditAddress(addr, idx)}
                                className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                              >
                                <FiEdit2 size={14} />
                                Edit
                              </button>

                              <button
                                onClick={() => handleDeleteAddress(idx)}
                                className="flex-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                              >
                                <FiTrash2 size={14} />
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}

                        <div
                          onClick={() => setShowAddAddressModal(true)}
                          className="border-2 border-dashed border-gray-300 rounded-2xl p-6 hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[250px] group"
                        >
                          <div className="w-16 h-16 bg-gray-100 group-hover:bg-blue-100 rounded-full flex items-center justify-center mb-4 transition-colors">
                            <FiPlus className="text-gray-400 group-hover:text-blue-600" size={32} />
                          </div>
                          <p className="font-semibold text-gray-600 group-hover:text-blue-600">Add New Address</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FiMapPin className="text-gray-400" size={36} />
                        </div>
                        <h4 className="font-semibold text-gray-800 mb-2">No Addresses Added Yet</h4>
                        <p className="text-gray-500 text-sm mb-6">Add your first delivery address to get started</p>
                        <button
                          onClick={() => setShowAddAddressModal(true)}
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 mx-auto"
                        >
                          <FiPlus size={20} />
                          Add Your First Address
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Add/Edit Address Modal */}
                {(showAddAddressModal || showEditAddressModal) && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
                      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 text-xl">
                          {showEditAddressModal ? 'Edit Address' : 'Add New Address'}
                        </h3>
                        <button
                          onClick={closeAddressModal}
                          className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                        >
                          <FiX className="text-gray-600" size={20} />
                        </button>
                      </div>

                      <form onSubmit={handleAddressSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Address Label</label>
                          <select
                            value={addressForm.label}
                            onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          >
                            <option value="">Select label</option>
                            <option value="home">Home</option>
                            <option value="work">Work</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                          <input
                            type="text"
                            value={addressForm.fullName}
                            onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter full name"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                          <input
                            type="tel"
                            value={addressForm.phone}
                            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter phone number"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Street Address</label>
                          <textarea
                            value={addressForm.street}
                            onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="House/Flat no., Street name, Area"
                            rows="3"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                            <input
                              type="text"
                              value={addressForm.city}
                              onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="City"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                            <input
                              type="text"
                              value={addressForm.state}
                              onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="State"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">PIN Code</label>
                          <input
                            type="text"
                            value={addressForm.pincode}
                            onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="PIN Code"
                            maxLength={6}
                            required
                          />
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="isDefault"
                            checked={addressForm.isDefault}
                            onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <label htmlFor="isDefault" className="text-sm font-semibold text-gray-700">
                            Set as default address
                          </label>
                        </div>

                        <div className="flex gap-3 pt-4">
                          <button
                            type="button"
                            onClick={closeAddressModal}
                            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={addressLoading}
                            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors"
                          >
                            {addressLoading
                              ? 'Saving...'
                              : showEditAddressModal ? 'Update Address' : 'Add Address'}
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
                      <div className="p-6 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FiTrash2 className="text-red-600" size={24} />
                        </div>
                        <h3 className="font-bold text-gray-800 text-lg mb-2">Delete Address</h3>
                        <p className="text-gray-600 mb-6">
                          Are you sure you want to delete this address? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setShowDeleteConfirmation(false)}
                            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={confirmDeleteAddress}
                            disabled={addressLoading}
                            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-lg transition-colors"
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
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800 text-xl flex items-center gap-2">
                      <FiStar className="text-yellow-500" />
                      My Reviews & Ratings
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">Share your shopping experience</p>
                  </div>

                  <div className="p-6">
                    {safeReviews.length > 0 ? (
                      <div className="space-y-4">
                        {safeReviews.map((rev) => (
                          <div key={rev.id} className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <FiStar
                                    key={i}
                                    size={18}
                                    className={i < rev.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">{rev.date}</span>
                            </div>
                            <p className="text-gray-700 leading-relaxed mb-4">"{rev.comment}"</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FiMessageCircle className="text-gray-400" size={36} />
                        </div>
                        <h4 className="font-semibold text-gray-800 mb-2">No Reviews Yet</h4>
                        <p className="text-gray-500 text-sm mb-6">You haven't reviewed any products yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: NOTIFICATIONS */}
            {activeTab === "notifications" && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-gray-800 text-xl flex items-center gap-2">
                        <FiBell className="text-blue-600" />
                        Notifications
                      </h3>
                      <p className="text-gray-500 text-sm mt-1">Stay updated with your orders and offers</p>
                    </div>
                    <button
                      onClick={() => { clearAllNotifications(); toast.success("All notifications marked as read!"); }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
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
                          className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${!notif.read ? 'bg-blue-50/50' : ''
                            }`}
                        >
                          <div className="flex gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${!notif.read ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                              }`}>
                              <FiBell size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4 mb-1">
                                <h4 className="font-semibold text-gray-800">{notif.title}</h4>
                                {!notif.read && (
                                  <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{notif.message}</p>
                              <span className="text-xs text-gray-400">{notif.time}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-16">
                        <FiBell className="text-gray-300 mx-auto mb-4" size={48} />
                        <h4 className="font-semibold text-gray-800 mb-2">No Notifications</h4>
                        <p className="text-gray-500 text-sm">You're all caught up!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SIMPLIFIED SETTINGS */}
            {activeTab === "settings" && (
              <div className="space-y-6 animate-fade-in">
                {/* Profile Information Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800 text-xl flex items-center gap-2">
                      <FiSettings className="text-blue-600" />
                      Account Settings
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">Manage your account information and preferences</p>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="p-6 space-y-6">
                    {/* Profile Picture Section */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Profile Picture</label>
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <img
                            src={currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150"}
                            alt="Avatar"
                            className="w-20 h-20 rounded-full border-4 border-gray-200 object-cover"
                          />
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 border-4 border-white rounded-full flex items-center justify-center">
                            <FiEdit2 className="text-white" size={12} />
                          </div>
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current.click()}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors mb-2 flex items-center gap-2"
                          >
                            <FiUser size={16} />
                            Change Photo
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                          />
                          <p className="text-xs text-gray-500">JPG, PNG or GIF. Max size 2MB</p>
                        </div>
                      </div>
                    </div>

                    {/* Personal Information */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FiUser className="text-blue-600" size={18} />
                        Personal Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                          <input
                            type="text"
                            required
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Enter your name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                          <div className="relative">
                            <input
                              type="email"
                              value={currentUser?.email || ''}
                              disabled
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                            <FiCheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" size={18} />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Email address is verified and cannot be changed</p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                          <input
                            type="tel"
                            value={profilePhone}
                            onChange={(e) => setProfilePhone(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Enter phone number"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Member Since</label>
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
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                            <FiStar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-500" size={18} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-6 border-t border-gray-100">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-blue-600/30 flex items-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <FiCheck size={16} />
                            Save Changes
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>

                {/* Security Settings - Change Password Only */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="p-6 border-b border-gray-100">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                      <FiLock className="text-blue-600" size={18} />
                      Security
                    </h4>
                    <p className="text-gray-500 text-sm mt-1">Keep your account secure</p>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                          <FiLock className="text-white" size={24} />
                        </div>
                        <div>
                          <h5 className="font-bold text-gray-800 text-lg">Change Password</h5>
                          <p className="text-sm text-gray-600 mt-1">Update your account password for better security</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowPasswordChangeModal(true)}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
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
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 text-xl flex items-center gap-2">
                  <FiLock className="text-blue-600" />
                  Change Password
                </h3>
                <button
                  onClick={() => setShowPasswordChangeModal(false)}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                >
                  <FiX className="text-gray-600" size={20} />
                </button>
              </div>

              <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter current password"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter new password (min 6 characters)"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm new password"
                    required
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <p className="text-xs text-blue-800 font-medium">
                    💡 Password must be at least 6 characters long
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPasswordChangeModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Changing...
                      </>
                    ) : (
                      <>
                        <FiCheck size={16} />
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