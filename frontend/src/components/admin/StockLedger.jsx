import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Plus, Minus, Search, Edit3, Trash2, Check
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

      // Find the current product
      const product = products.find(p => p.id === productId);
      if (!product) {
        toast.error("Product not found");
        return;
      }

      // Calculate new quantity
      const newQty = Math.max(0, (product.stock || 0) + amount);

      // Update local state
      const updated = products.map(p => {
        if (p.id === productId) {
          return { ...p, stock: newQty };
        }
        return p;
      });
      setProducts(updated);

      // Show toast notification
      if (amount > 0) {
        toast.success(`✅ "${product.name}" stock increased to ${newQty}`);
      } else {
        toast.success(`✅ "${product.name}" stock decreased to ${newQty}`);
      }

      // Sync with backend
      if (isBackendConnected) {
        try {
          await adminAPI.product.update(productId, {
            stock: newQty,
            inventory: { quantity: newQty }
          });
          console.log(`✅ Synced stock update for SKU #${productId} to backend`);
        } catch (err) {
          console.error("⚠️ Backend sync failed:", err);
          toast.error("Failed to sync with server");
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

      // Update local state
      const updated = products.map(p => {
        if (p.id === productId) {
          return { ...p, stock: 20 };
        }
        return p;
      });
      setProducts(updated);

      toast.success(`⚡ "${product.name}" restocked to 20 units!`);

      // Sync with backend
      if (isBackendConnected) {
        try {
          await adminAPI.product.update(productId, {
            stock: 20,
            inventory: { quantity: 20 }
          });
          console.log(`✅ Synced quick restock for SKU #${productId} to backend`);
        } catch (err) {
          console.error("⚠️ Backend sync failed:", err);
          toast.error("Failed to sync restock with server");
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
      if (!window.confirm(`Delete "${product.name}"? This action cannot be undone.`)) {
        return;
      }

      setIsLoading(true);

      // Update local state - remove product
      const updated = products.filter(p => p.id !== product.id);
      setProducts(updated);

      toast.error(`🗑️ "${product.name}" deleted from catalog`);

      // Sync with backend
      if (isBackendConnected) {
        try {
          await adminAPI.product.delete(product.id);
          console.log(`✅ Synced deletion of SKU #${product.id} to backend`);
        } catch (err) {
          console.error("⚠️ Backend sync failed:", err);
          toast.error("Product deleted locally but server sync failed");
        }
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
      // Search filter
      const matchesSearch =
        (p.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.brand || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.sku || "").toLowerCase().includes(search.toLowerCase());

      // Category filter
      const matchesCategory =
        categoryFilter === "all" ||
        (p.category || "").toLowerCase() === categoryFilter.toLowerCase();

      // Status filter
      let matchesStatus = true;
      if (statusFilter === "low") {
        matchesStatus = p.stock > 0 && p.stock <= 5;
      } else if (statusFilter === "out") {
        matchesStatus = p.stock === 0;
      } else if (statusFilter === "healthy") {
        matchesStatus = p.stock > 5;
      }

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, categoryFilter, statusFilter]);

  // ✅ Get stock status badge styling
  const getStockStatusBadge = (stock) => {
    if (stock === 0) {
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-100',
        label: 'Out of Stock'
      };
    } else if (stock <= 5) {
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-100',
        label: 'Low Stock'
      };
    } else {
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-100',
        label: 'Stable'
      };
    }
  };

  return (
    <div className="space-y-6">

      {/* ✅ Dynamic Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Stock Value */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <span className="text-[9px] text-gray-500 font-extrabold uppercase tracking-wider block mb-3">
            💰 Stock Valuation
          </span>
          <div>
            <p className="text-2xl font-bold font-mono text-black">
              ₹{(stats.totalValue / 1000).toFixed(1)}k
            </p>
            <p className="text-[12px] text-gray-500 mt-1">Total inventory value</p>
          </div>
        </div>

        {/* Total SKUs */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <span className="text-[9px] text-blue-600 font-extrabold uppercase tracking-wider block mb-3">
            📦 Total SKUs
          </span>
          <div>
            <p className="text-2xl font-bold font-mono text-blue-700">
              {stats.totalSKUs}
            </p>
            <p className="text-[12px] text-blue-600 mt-1">Active products</p>
          </div>
        </div>

        {/* Low Stock Count */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <span className="text-[9px] text-amber-600 font-extrabold uppercase tracking-wider block mb-3">
            ⚠️ Low Stock
          </span>
          <div>
            <p className="text-2xl font-bold font-mono text-amber-700">
              {stats.lowStockCount}
            </p>
            <p className="text-[12px] text-amber-600 mt-1">Needs restocking</p>
          </div>
        </div>

        {/* Out of Stock Count */}
        <div className="bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <span className="text-[9px] text-rose-600 font-extrabold uppercase tracking-wider block mb-3">
            🔴 Out of Stock
          </span>
          <div>
            <p className="text-2xl font-bold font-mono text-rose-700">
              {stats.outOfStockCount}
            </p>
            <p className="text-[12px] text-rose-600 mt-1">Unavailable items</p>
          </div>
        </div>
      </div>

      {/* ✅ Control Filters Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 space-y-4 lg:space-y-0">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">

          {/* Search Input */}
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by SKU, name, or brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={isLoading}
              className="w-full bg-gray-50 border border-gray-300 py-2.5 pl-10 pr-4 rounded-xl 
                         focus:outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-200
                         text-sm text-gray-900 placeholder-gray-500 disabled:opacity-50 transition-all"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              disabled={isLoading}
              className="w-full sm:w-48 bg-gray-50 border border-gray-300 py-2.5 px-4 rounded-xl 
                         text-sm font-semibold text-gray-700 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200
                         cursor-pointer disabled:opacity-50 transition-all"
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
              className="w-full sm:w-48 bg-gray-50 border border-gray-300 py-2.5 px-4 rounded-xl 
                         text-sm font-semibold text-gray-700 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200
                         cursor-pointer disabled:opacity-50 transition-all"
            >
              <option value="all">📊 All Stock Status</option>
              <option value="healthy">✅ Stable (&gt; 5)</option>
              <option value="low">⚠️ Low Stock (1-5)</option>
              <option value="out">🔴 Out of Stock (0)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ✅ Stock Ledger Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <th className="px-6 py-4 text-center text-xs font-extrabold text-gray-600 uppercase tracking-wider">
                  SKU ID
                </th>
                <th className="px-6 py-4 text-xs font-extrabold text-gray-600 uppercase tracking-wider">
                  Product Details
                </th>
                <th className="px-6 py-4 text-xs font-extrabold text-gray-600 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-right text-xs font-extrabold text-gray-600 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-4 text-center text-xs font-extrabold text-gray-600 uppercase tracking-wider">
                  Stock Level
                </th>
                <th className="px-6 py-4 text-center text-xs font-extrabold text-gray-600 uppercase tracking-wider">
                  Quick Restock
                </th>
                <th className="px-6 py-4 text-center text-xs font-extrabold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Search className="text-gray-300 mb-3" size={32} />
                      <p className="text-gray-500 font-medium">No products found</p>
                      <p className="text-gray-400 text-sm mt-1">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  const stockStatus = getStockStatusBadge(p.stock || 0);

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      {/* SKU ID */}
                      <td className="px-6 py-4 text-center">
                        <span className="font-mono font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg text-sm">
                          #{p.id}
                        </span>
                      </td>

                      {/* Product Details */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <SafeImage
                            src={p.image || p.images?.[0]}
                            alt={p.name}
                            className="w-12 h-12 rounded-lg object-cover bg-gray-100 border border-gray-200 shrink-0"
                            fallback="https://placehold.co/48x48/E5E7EB/6B7280?text=No+Img"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate text-sm">
                              {p.name || 'Unnamed Product'}
                            </p>
                            <p className="text-xs text-gray-500 font-mono mt-1">
                              {p.brand || 'No Brand'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg">
                          {p.category || 'Uncategorized'}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 text-right">
                        <span className="font-mono font-bold text-gray-900 text-sm">
                          ₹{((p.price || 0).toLocaleString())}
                        </span>
                      </td>

                      {/* Stock Level with +/- buttons */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-2">
                          {/* Stock Counter */}
                          <div className="inline-flex items-center gap-1 bg-gray-100 border border-gray-300 rounded-lg p-1">
                            <button
                              onClick={() => adjustStock(p.id, -1)}
                              disabled={isLoading || (p.stock || 0) === 0}
                              className="hover:bg-white text-gray-600 hover:text-gray-900 p-1.5 rounded 
                                         border border-transparent hover:border-gray-300 cursor-pointer 
                                         transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Decrease Stock"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="font-mono font-extrabold text-gray-900 w-10 text-center text-sm">
                              {p.stock || 0}
                            </span>
                            <button
                              onClick={() => adjustStock(p.id, 1)}
                              disabled={isLoading}
                              className="hover:bg-white text-gray-600 hover:text-gray-900 p-1.5 rounded 
                                         border border-transparent hover:border-gray-300 cursor-pointer 
                                         transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Increase Stock"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          {/* Stock Status Badge */}
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-extrabold 
                                          uppercase tracking-wide border ${stockStatus.bg} ${stockStatus.text} ${stockStatus.border}`}>
                            {stockStatus.label}
                          </span>
                        </div>
                      </td>

                      {/* Quick Restock Button */}
                      <td className="px-6 py-4 text-center">
                        {(p.stock || 0) <= 5 ? (
                          <button
                            onClick={() => quickRestock(p.id)}
                            disabled={isLoading}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white 
                                       text-xs font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-lg 
                                       inline-flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 
                                       disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                            title="Restock to 20 units"
                          >
                            <span>⚡</span>
                            <span>Restock</span>
                          </button>
                        ) : (
                          <div className="text-green-600 text-xs flex items-center justify-center gap-1.5 font-semibold">
                            <Check size={14} className="text-green-500" />
                            <span>Healthy</span>
                          </div>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          {/* Edit Button */}
                          <button
                            onClick={() => onEdit(p)}
                            disabled={isLoading}
                            className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg 
                                       border border-transparent hover:border-blue-200 cursor-pointer transition-all 
                                       disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Edit Product"
                          >
                            <Edit3 size={16} />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteSku(p)}
                            disabled={isLoading}
                            className="text-gray-600 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg 
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
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-sm font-semibold text-gray-700">Processing...</p>
            </div>
          </div>
        )}
      </div>

      {/* Info Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800 font-medium">
          💡 Tip: Click the <strong>Restock</strong> button for items with stock ≤ 5 to quickly replenish to 20 units
        </p>
      </div>
    </div>
  );
}