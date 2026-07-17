import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Plus, Minus, Search, Edit3, Trash2, Check, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import SafeImage from '../../components/SafeImage'

export default function StockLedger({ onEdit }) {
  const { products, setProducts, isBackendConnected } = useApp();

  // Filter & Search states
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  // Calculated Aggregate Stats
  const stats = useMemo(() => {
    const totalSKUs = products.length;
    const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
    const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 5).length;
    const outOfStockCount = products.filter(p => p.stock === 0).length;
    const totalValue = products.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0);

    return { totalSKUs, totalStock, lowStockCount, outOfStockCount, totalValue };
  }, [products]);

  // ✅ Adjust stock count (+1 or -1) with toast and backend sync
  const adjustStock = async (productId, amount) => {
    try {
      setIsLoading(true);
      const product = products.find(p => p.id === productId);
      if (!product) {
        toast.error("Product not found");
        return;
      }
      const newQty = Math.max(0, (product.stock || 0) + amount);
      const updated = products.map(p => {
        if (p.id === productId) return { ...p, stock: newQty };
        return p;
      });
      setProducts(updated);

      if (amount > 0) toast.success(`✅ "${product.name}" stock increased to ${newQty}`, { style: { background: '#1A1A3A', color: '#fff' } });
      else toast.success(`✅ "${product.name}" stock decreased to ${newQty}`, { style: { background: '#1A1A3A', color: '#fff' } });

      if (isBackendConnected) {
        try {
          await adminAPI.product.update(productId, {
            stock: newQty,
            inventory: { quantity: newQty }
          });
          console.log(`✅ Synced stock update for SKU #${productId}`);
        } catch (err) {
          console.error("⚠️ Backend sync failed:", err);
        }
      }
    } catch (error) {
      console.error("❌ Stock adjustment error:", error);
      toast.error("Failed to adjust stock");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Restock an item instantly to 20 units with backend sync
  const quickRestock = async (productId) => {
    try {
      setIsLoading(true);
      const product = products.find(p => p.id === productId);
      if (!product) {
        toast.error("Product not found");
        return;
      }
      const updated = products.map(p => {
        if (p.id === productId) return { ...p, stock: 20 };
        return p;
      });
      setProducts(updated);
      toast.success(`⚡ "${product.name}" restocked to 20 units!`, { style: { background: '#D4AF37', color: '#1A1A3A' } });

      if (isBackendConnected) {
        try {
          await adminAPI.product.update(productId, {
            stock: 20,
            inventory: { quantity: 20 }
          });
        } catch (err) {
          console.error("⚠️ Backend sync failed:", err);
        }
      }
    } catch (error) {
      console.error("❌ Quick restock error:", error);
      toast.error("Failed to restock product");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Delete product with backend sync
  const handleDeleteSku = async (product) => {
    try {
      if (!window.confirm(`Delete "${product.name}"? This action cannot be undone.`)) return;
      setIsLoading(true);
      const updated = products.filter(p => p.id !== product.id);
      setProducts(updated);
      toast.error(`🗑️ "${product.name}" deleted from catalog`);
      if (isBackendConnected) {
        try { await adminAPI.product.delete(product.id); }
        catch (err) { console.error(err); }
      }
    } catch (error) {
      console.error("❌ Delete product error:", error);
      toast.error("Failed to delete product");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Filtered Products based on search and filters
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = (p.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.brand || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.sku || "").toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "all" || (p.category || "").toLowerCase() === categoryFilter.toLowerCase();
      let matchesStatus = true;
      if (statusFilter === "low") matchesStatus = p.stock > 0 && p.stock <= 5;
      else if (statusFilter === "out") matchesStatus = p.stock === 0;
      else if (statusFilter === "healthy") matchesStatus = p.stock > 5;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, categoryFilter, statusFilter]);

  // ✅ Get stock status badge styling (Using Kabiraaz Palette)
  const getStockStatusBadge = (stock) => {
    if (stock === 0) {
      return { bg: 'bg-[#1A1A3A]', text: 'text-white', border: 'border-[#1A1A3A]', label: 'Out of Stock' };
    } else if (stock <= 5) {
      return { bg: 'bg-[#D4AF37]', text: 'text-[#1A1A3A]', border: 'border-[#D4AF37]', label: 'Low Stock' };
    } else {
      return { bg: 'bg-emerald-600', text: 'text-white', border: 'border-emerald-600', label: 'Stable' };
    }
  };

  return (
    <div className="space-y-6">
      {/* ✅ Dynamic Summary Cards - Updated Colors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Stock Value */}
        <div className="bg-gradient-to-br from-[#F8F8F8] to-white border-l-4 border-[#D4AF37] p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <span className="text-[9px] text-[#333333] font-extrabold uppercase tracking-wider block mb-2">
            💰 Stock Valuation
          </span>
          <div>
            <p className="text-2xl font-bold font-mono text-[#1A1A3A]">
              ₹{(stats.totalValue / 1000).toFixed(1)}k
            </p>
            <p className="text-[12px] text-[#333333] opacity-70 mt-1">Total inventory value</p>
          </div>
        </div>

        {/* Total SKUs */}
        <div className="bg-gradient-to-br from-[#F8F8F8] to-white border-l-4 border-[#007A8A] p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <span className="text-[9px] text-[#333333] font-extrabold uppercase tracking-wider block mb-2">
            📦 Total SKUs
          </span>
          <div>
            <p className="text-2xl font-bold font-mono text-[#1A1A3A]">
              {stats.totalSKUs}
            </p>
            <p className="text-[12px] text-[#333333] opacity-70 mt-1">Active products</p>
          </div>
        </div>

        {/* Low Stock Count */}
        <div className="bg-gradient-to-br from-[#F8F8F8] to-white border-l-4 border-[#D4AF37] p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <span className="text-[9px] text-[#333333] font-extrabold uppercase tracking-wider block mb-2">
            ⚠️ Low Stock
          </span>
          <div>
            <p className="text-2xl font-bold font-mono text-[#1A1A3A]">
              {stats.lowStockCount}
            </p>
            <p className="text-[12px] text-[#333333] opacity-70 mt-1">Needs restocking</p>
          </div>
        </div>

        {/* Out of Stock Count */}
        <div className="bg-gradient-to-br from-[#F8F8F8] to-white border-l-4 border-gray-400 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <span className="text-[9px] text-[#333333] font-extrabold uppercase tracking-wider block mb-2">
            🔴 Out of Stock
          </span>
          <div>
            <p className="text-2xl font-bold font-mono text-[#1A1A3A]">
              {stats.outOfStockCount}
            </p>
            <p className="text-[12px] text-[#333333] opacity-70 mt-1">Unavailable items</p>
          </div>
        </div>
      </div>

      {/* ✅ Control Filters Bar - Responsive Updates */}
      <div className="bg-white border border-[#E0E0E0] rounded-2xl shadow-sm p-4 space-y-4 lg:space-y-0">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          
          {/* Search Input */}
          <div className="relative w-full lg:w-80 z-10">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#333333]" size={16} />
            <input
              type="text"
              placeholder="Search by SKU, name, or brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={isLoading}
              className="w-full bg-[#F8F8F8] border border-[#E0E0E0] py-2.5 pl-10 pr-4 rounded-xl 
                         focus:outline-none focus:bg-white focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/10
                         text-sm text-[#1A1A3A] placeholder-[#6B7280] disabled:opacity-50 transition-all font-medium"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              disabled={isLoading}
              className="w-full sm:w-48 bg-[#F8F8F8] border border-[#E0E0E0] py-2.5 px-4 rounded-xl 
                         text-sm font-semibold text-[#1A1A3A] focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/10
                         cursor-pointer disabled:opacity-50 transition-all appearance-none"
            >
              <option value="all">📂 All Categories</option>
              <option value="women">👗 Women</option>
              <option value="men">👔 Men</option>
              <option value="kids">👶 Kids</option>
              <option value="accessories">✨ Accessories</option>
              <option value="footwear">👟 Footwear</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              disabled={isLoading}
              className="w-full sm:w-48 bg-[#F8F8F8] border border-[#E0E0E0] py-2.5 px-4 rounded-xl 
                         text-sm font-semibold text-[#1A1A3A] focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/10
                         cursor-pointer disabled:opacity-50 transition-all appearance-none"
            >
              <option value="all">📊 All Stock Status</option>
              <option value="healthy">✅ Stable (&gt; 5)</option>
              <option value="low">⚠️ Low Stock (1-5)</option>
              <option value="out">🔴 Out of Stock (0)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ✅ Stock Ledger Table - Mobile Optimized */}
      <div className="bg-white border border-[#E0E0E0] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px)">
            <thead>
              <tr className="bg-[#1A1A3A] text-white border-b border-[#2E3192]">
                <th className="px-4 sm:px-6 py-4 text-center text-[10px] font-extrabold uppercase tracking-widest w-[80px] sm:w-auto">
                  SKU ID
                </th>
                <th className="px-4 sm:px-6 py-4 text-left text-[10px] font-extrabold uppercase tracking-widest hidden sm:table-cell">
                  Product Details
                </th>
                <th className="px-4 sm:px-6 py-4 text-left text-[10px] font-extrabold uppercase tracking-widest hidden md:table-cell">
                  Category
                </th>
                <th className="px-4 sm:px-6 py-4 text-right text-[10px] font-extrabold uppercase tracking-widest">
                  Price
                </th>
                <th className="px-4 sm:px-6 py-4 text-center text-[10px] font-extrabold uppercase tracking-widest w-[100px]">
                  Stock Level
                </th>
                <th className="px-4 sm:px-6 py-4 text-center text-[10px] font-extrabold uppercase tracking-widest w-[110px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0E0E0]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <AlertCircle className="text-[#E0E0E0] mb-3" size={32} />
                      <p className="text-[#6B7280] font-medium text-sm">No products found</p>
                      <p className="text-[#333333] text-xs mt-1">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  const stockStatus = getStockStatusBadge(p.stock || 0);

                  return (
                    <tr key={p.id} className="hover:bg-[#F8F8F8]/50 transition-colors group">
                      
                      {/* Product Details (Mobile Layout) */}
                      <td className="px-4 sm:px-6 py-4 col-span-full sm:col-span-1 md:col-span-1">
                        <div className="flex items-center gap-3 sm:block mb-2 sm:mb-0">
                           {/* Small Image Preview */}
                          <SafeImage
                            src={p.image || p.images?.[0]}
                            alt={p.name}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover bg-[#F8F8F8] border border-[#E0E0E0] shrink-0"
                            fallback="https://placehold.co/48x48/E5E7EB/6B7280?text=No+Img"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-[#1A1A3A] truncate text-xs sm:text-sm leading-tight">
                              {p.name || 'Unnamed Product'}
                            </p>
                            <p className="text-[10px] text-[#333333] font-medium mt-0.5 sm:hidden">
                              {p.category || 'General'}
                            </p>
                          </div>
                        </div>
                        {/* Hidden details column on small screens */}
                        <div className="hidden sm:block">
                           <p className="font-semibold text-[#1A1A3A] text-sm">{p.name || 'Unnamed Product'}</p>
                           <p className="text-[10px] text-[#333333] font-medium mt-1">
                              {p.category || 'General'}
                           </p>
                        </div>
                      </td>

                      {/* SKU ID (Hidden on very small screens if needed, keeping visible for reference) */}
                      <td className="px-4 sm:px-6 py-4 text-center hidden sm:table-cell">
                        <span className="font-mono font-bold text-[#333333] bg-[#F8F8F8] px-2.5 py-1 rounded-lg text-[10px]">
                          #{p.id}
                        </span>
                      </td>

                      {/* Category (Hidden on medium screens if needed, kept above in mobile view logic) */}
                      <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                        <span className="inline-block px-3 py-1.5 bg-[#F8F8F8] text-[#333333] text-[10px] font-semibold rounded-lg">
                          {p.category || 'Uncategorized'}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-4 sm:px-6 py-4 text-right">
                        <span className="font-mono font-bold text-[#1A1A3A] text-sm">
                          ₹{((p.price || 0).toLocaleString())}
                        </span>
                      </td>

                      {/* Stock Level with +/- buttons */}
                      <td className="px-4 sm:px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-2">
                          {/* Stock Counter */}
                          <div className="inline-flex items-center gap-1 bg-[#F8F8F8] border border-[#E0E0E0] rounded-lg p-1">
                            <button
                              onClick={() => adjustStock(p.id, -1)}
                              disabled={isLoading || (p.stock || 0) === 0}
                              className="hover:bg-white text-[#1A1A3A] hover:text-[#D4AF37] p-1.5 rounded border border-transparent hover:border-[#D4AF37] cursor-pointer transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Decrease Stock"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="font-mono font-extrabold text-[#1A1A3A] w-10 text-center text-sm">
                              {p.stock || 0}
                            </span>
                            <button
                              onClick={() => adjustStock(p.id, 1)}
                              disabled={isLoading}
                              className="hover:bg-white text-[#1A1A3A] hover:text-[#D4AF37] p-1.5 rounded border border-transparent hover:border-[#D4AF37] cursor-pointer transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Increase Stock"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          {/* Stock Status Badge */}
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border shadow-sm ${stockStatus.bg} ${stockStatus.text} ${stockStatus.border}`}>
                            {stockStatus.label}
                          </span>
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="px-4 sm:px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          {/* Edit Button */}
                          <button
                            onClick={() => onEdit(p)}
                            disabled={isLoading}
                            className="text-[#333333] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 p-2 rounded-lg 
                                       border border-transparent hover:border-[#D4AF37] cursor-pointer transition-all 
                                       disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Edit Product"
                          >
                            <Edit3 size={16} />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteSku(p)}
                            disabled={isLoading}
                            className="text-[#333333] hover:text-red-500 hover:bg-red-50 p-2 rounded-lg 
                                       border border-transparent hover:border-red-200 cursor-pointer transition-all 
                                       disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete Product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-2xl z-50">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-[#1A1A3A] border-t-[#D4AF37] rounded-full animate-spin"></div>
              <p className="text-sm font-semibold text-[#1A1A3A]">Processing...</p>
            </div>
          </div>
        )}
      </div>

      {/* Info Text */}
      <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-xl p-4">
        <p className="text-sm text-[#1A1A3A] font-medium flex items-center gap-2">
          <span className="bg-[#D4AF37] text-[#1A1A3A] p-1 rounded text-xs"><Check size={12}/></span>
          Tip: Click the <strong>Stock Up/Down</strong> controls to instantly update inventory. Items with ≤5 stock require immediate attention.
        </p>
      </div>
    </div>
  );
}

