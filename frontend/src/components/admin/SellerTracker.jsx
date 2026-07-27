import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search, ShieldAlert, AlertTriangle, CheckCircle2, X, Eye, 
  Trash2, Globe, CreditCard, FileText, Sliders, Calendar, Package, ShoppingCart
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SellerTracker() {
  const {
    users = [],
    products = [],
    orders = [],
    notifications = [],
    changeUserStatus,
    deleteUser
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [portfolioTab, setPortfolioTab] = useState('profile'); // profile, bank, tax, inventory, audits

  // Filter users to only include B2B Sellers
  const sellersList = useMemo(() => {
    return users.filter(u => String(u.role).toLowerCase() === 'seller');
  }, [users]);

  // Filter sellers by search term (Store Name or Owner Name)
  const filteredSellers = useMemo(() => {
    return sellersList.filter(s => {
      const q = searchTerm.toLowerCase().trim();
      return q === '' || 
        s.name?.toLowerCase().includes(q) || 
        s.storeName?.toLowerCase().includes(q) ||
        s.businessName?.toLowerCase().includes(q);
    });
  }, [sellersList, searchTerm]);

  // Calculate individual metrics for the selected seller in the portfolio modal
  const sellerStats = useMemo(() => {
    if (!selectedSeller) return null;
    const sId = selectedSeller.id || selectedSeller._id;

    // 1. Get all products owned by this seller
    const sellerProds = products.filter(p => String(p.seller) === String(sId) || p.seller?._id === sId);
    
    // 2. Get all orders containing this seller's products
    const sellerOrders = orders.filter(o => 
      o.items && o.items.some(item => 
        sellerProds.some(sp => String(sp.id || sp._id) === String(item.product?._id || item.product))
      )
    );

    // 3. Get total revenue generated specifically by this seller's products
    let accumulatedRevenue = 0;
    sellerOrders.forEach(o => {
      o.items.forEach(item => {
        const itemPid = item.product?._id || item.product;
        if (sellerProds.some(sp => String(sp.id || sp._id) === String(itemPid))) {
          accumulatedRevenue += (Number(item.price) || 0) * (Number(item.quantity) || 1);
        }
      });
    });

    // 4. Get active seller audit notifications
    const sellerAudits = notifications.filter(n => String(n.seller) === String(sId) || n.seller?._id === sId);

    return {
      listedProductsCount: sellerProds.length,
      ordersCount: sellerOrders.length,
      revenue: accumulatedRevenue,
      audits: sellerAudits,
      activeProducts: sellerProds
    };
  }, [selectedSeller, products, orders, notifications]);

  const handleToggleBlockSeller = (sellerId) => {
    const sellerObj = sellersList.find(s => s.id === sellerId || s._id === sellerId);
    if (!sellerObj) return;
    const newStatus = sellerObj.status === "Blocked" ? "Active" : "Blocked";
    changeUserStatus(sellerId, newStatus);
    toast.success(`${sellerObj.name} status updated to ${newStatus}`);
    
    // If the blocked seller is currently open in modal, sync state
    if (selectedSeller && (selectedSeller.id === sellerId || selectedSeller._id === sellerId)) {
      setSelectedSeller({ ...selectedSeller, status: newStatus });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="font-black text-sm text-[#1A1A3A] uppercase tracking-wide">B2B Merchants & Sellers</h3>
          <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">Monitor legal addresses, payout ledgers, and audit logs of all active sellers.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
          <input
            type="text"
            placeholder="Search merchants..."
            className="w-full bg-slate-50 border border-transparent hover:border-gray-200 focus:border-orange-500 focus:bg-white py-2 pl-9 pr-3 rounded-xl focus:outline-none text-[11px] text-[#1A1A3A] transition-all font-semibold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid of Sellers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSellers.map((seller) => {
          // Calculate quick stats inline
          const sId = seller.id || seller._id;
          const listedCount = products.filter(p => String(p.seller) === String(sId)).length;
          
          return (
            <div key={sId} className="bg-white rounded-3xl border border-gray-150 p-5 shadow-sm space-y-4 hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 font-black text-sm">
                    {seller.storeName?.charAt(0) || 'M'}
                  </div>
                  <div>
                    <h4 className="font-black text-[#1A1A3A] text-xs sm:text-sm">{seller.storeName || 'Merchant Store'}</h4>
                    <p className="text-gray-400 text-[10px] font-semibold">{seller.businessName || 'Business Owner'}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                  seller.isHolidayMode 
                    ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                }`}>
                  {seller.isHolidayMode ? '🌴 On Leave' : 'Active'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-gray-400 text-[8px] font-black uppercase">Listed Products</p>
                  <p className="text-base font-black text-[#1A1A3A] mt-1">{listedCount}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-[8px] font-black uppercase">Fulfillment</p>
                  <p className="text-xs font-bold text-[#1A1A3A] mt-1.5 capitalize truncate">
                    {seller.shippingMethod ? seller.shippingMethod.replace('_', ' ') : 'Self Ship'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => { setSelectedSeller(seller); setPortfolioTab('profile'); }}
                  className="flex-1 bg-slate-50 hover:bg-slate-100 text-[#1A1A3A] border border-gray-100 text-[10px] font-black uppercase tracking-widest py-2 rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all"
                >
                  <Eye size={12} /> View Portfolio
                </button>
                <button
                  onClick={() => handleToggleBlockSeller(sId)}
                  className={`p-2 border rounded-xl cursor-pointer transition-all ${
                    seller.status === 'Blocked' 
                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-100' 
                      : 'bg-rose-50 hover:bg-rose-100 text-rose-50 border-rose-100'
                  }`}
                  title={seller.status === 'Blocked' ? 'Unblock Merchant' : 'Block Merchant'}
                >
                  {seller.status === 'Blocked' ? <Unlock size={12} /> : <Lock size={12} />}
                </button>
              </div>
            </div>
          );
        })}
        {filteredSellers.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400 text-sm">
            No active B2B Merchants found matching your criteria.
          </div>
        )}
      </div>

      {/* ═══════════════ DETAILED B2B MERCHANT PORTFOLIO MODAL ═══════════════ */}
      {selectedSeller && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#111827] to-[#1F2937] p-5 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-black text-sm">
                  {selectedSeller.storeName?.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">{selectedSeller.storeName}</h4>
                  <p className="text-[10px] text-orange-400 mt-0.5 font-mono">B2B Profile Logs • Status: {selectedSeller.status || 'Active'}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedSeller(null)} 
                className="text-white/60 hover:text-white p-2 rounded-xl hover:bg-white/10 cursor-pointer transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Sub-tab Navigation */}
            <div className="flex border-b border-gray-100 px-6 py-3 bg-slate-50 gap-2 flex-wrap">
              {[
                { id: 'profile', label: 'Merchant Profile', icon: <Globe size={11} /> },
                { id: 'tax', label: 'Tax Profile', icon: <FileText size={11} /> },
                { id: 'bank', label: 'Linked Bank Ledger', icon: <CreditCard size={11} /> },
                { id: 'inventory', label: 'Active Inventory', icon: <Package size={11} /> },
                { id: 'audits', label: 'Seller Audit Trails', icon: <Sliders size={11} /> }
              ].map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setPortfolioTab(sub.id)}
                  className={`py-1.5 px-3 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border ${
                    portfolioTab === sub.id
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-gray-500 border-gray-150 hover:bg-slate-50'
                  }`}
                >
                  {sub.icon} {sub.label}
                </button>
              ))}
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">

              {/* Sub-tab 1: Profile */}
              {portfolioTab === 'profile' && (
                <div className="space-y-6 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Merchant Owner</span>
                      <span className="font-bold text-slate-800 text-sm mt-1 block">{selectedSeller.name}</span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Owner Email</span>
                      <span className="font-bold text-slate-800 text-sm mt-1 block font-mono">{selectedSeller.email}</span>
                    </div>
                  </div>

                  <div className="border border-gray-100 rounded-2xl p-4 space-y-3">
                    <h5 className="font-black text-[#1A1A3A] uppercase tracking-wider text-[10px]">Merchant Physical Address</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] text-gray-400">Address Line 1</p>
                        <p className="font-semibold text-slate-800 mt-0.5">{selectedSeller.addressLine1 || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400">Address Line 2</p>
                        <p className="font-semibold text-slate-800 mt-0.5">{selectedSeller.addressLine2 || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400">City / State</p>
                        <p className="font-semibold text-slate-800 mt-0.5">{selectedSeller.city || 'N/A'}, {selectedSeller.state || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400">Country / Pincode</p>
                        <p className="font-semibold text-slate-800 mt-0.5">{selectedSeller.country || 'India'} - {selectedSeller.pincode || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-tab 2: Tax Details */}
              {portfolioTab === 'tax' && (
                <div className="space-y-4 text-xs">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">GST Category Type</span>
                      <span className="font-bold text-slate-800 text-sm mt-1 block">
                        {selectedSeller.exemptCategory ? 'GST Exempt Seller (e.g. Books)' : 'Regular GSTIN Merchant'}
                      </span>
                    </div>
                  </div>

                  {!selectedSeller.exemptCategory && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border border-gray-100 rounded-2xl p-4">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Registered GSTIN</span>
                        <span className="font-black text-slate-800 text-sm mt-1 block font-mono tracking-wider">{selectedSeller.gstNumber || 'N/A'}</span>
                      </div>
                      <div className="border border-gray-100 rounded-2xl p-4">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Business PAN Card</span>
                        <span className="font-black text-slate-800 text-sm mt-1 block font-mono tracking-wider">{selectedSeller.panNumber || 'N/A'}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-tab 3: Bank Details */}
              {portfolioTab === 'bank' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-gray-100 rounded-2xl p-4">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Account Holder</span>
                      <span className="font-bold text-slate-800 text-sm mt-1 block">{selectedSeller.accountHolder || 'N/A'}</span>
                    </div>
                    <div className="border border-gray-100 rounded-2xl p-4">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Bank Name</span>
                      <span className="font-bold text-slate-800 text-sm mt-1 block">{selectedSeller.bankName || 'N/A'}</span>
                    </div>
                    <div className="border border-gray-100 rounded-2xl p-4">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Account Number</span>
                      <span className="font-black text-slate-800 text-sm mt-1 block font-mono tracking-widest">••••••••{selectedSeller.accountNumber?.slice(-4) || 'N/A'}</span>
                    </div>
                    <div className="border border-gray-100 rounded-2xl p-4">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Bank IFSC Code</span>
                      <span className="font-black text-slate-800 text-sm mt-1 block font-mono tracking-widest">{selectedSeller.ifscCode || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-tab 4: Active Inventory */}
              {portfolioTab === 'inventory' && (
                <div className="space-y-4 text-xs">
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-gray-100">
                    <span className="font-semibold text-slate-700">Products currently listed on storefront:</span>
                    <span className="bg-orange-500 text-white font-black px-2 py-0.5 rounded text-[10px]">{sellerStats?.activeProducts.length} Items</span>
                  </div>

                  <div className="divide-y divide-gray-50 border border-gray-150 rounded-2xl overflow-hidden bg-white">
                    {sellerStats?.activeProducts.length === 0 ? (
                      <p className="text-center py-6 text-gray-400">No active products listed yet.</p>
                    ) : (
                      sellerStats?.activeProducts.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-3.5 hover:bg-slate-50/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover border border-gray-100" />
                            <div>
                              <p className="font-black text-slate-800">{p.name}</p>
                              <p className="text-[9px] text-gray-400 font-mono">#{p.id}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-[#1A1A3A]">₹{p.price}</p>
                            <p className="text-[10px] text-gray-500 font-mono mt-0.5">Stock: {p.stock}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Sub-tab 5: Audit Logs */}
              {portfolioTab === 'audits' && (
                <div className="space-y-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center">
                    <span className="font-semibold text-slate-700">Chronological history of merchant modifications:</span>
                    <span className="font-bold text-gray-400">{sellerStats?.audits.length} Records</span>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {sellerStats?.audits.length === 0 ? (
                      <p className="text-center py-10 text-gray-400">No recorded audit logs for this seller.</p>
                    ) : (
                      sellerStats?.audits.map((log) => (
                        <div key={log.id || log._id} className="p-3 border border-gray-100 bg-white rounded-xl shadow-sm space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                              log.type === 'PRODUCT_CREATED' ? 'bg-green-100 text-green-700' :
                              log.type === 'PRICE_CHANGED' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {log.type?.replace('_', ' ')}
                            </span>
                            <span className="text-[9px] text-gray-400 font-mono">
                              {new Date(log.createdAt || Date.now()).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-slate-700">{log.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}