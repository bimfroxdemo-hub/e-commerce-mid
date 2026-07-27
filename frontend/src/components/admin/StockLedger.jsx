import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Plus, Minus, Search, Edit3, Trash2, Check, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';
import SafeImage from '../../components/SafeImage';

export default function StockLedger({ onEdit }) {
  const { isBackendConnected, categories = [] } = useApp();

  // Local database scoped state to avoid global un-scoped fallback leaks
  const [sellerProducts, setSellerProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Search states
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchSellerCatalog = async () => {
    try {
      setIsLoading(true);
      const res = await adminAPI.products.getAll({ limit: 100 });
      if (res?.success) {
        setSellerProducts(res.data?.products || []);
      }
    } catch (err) {
      console.error("Failed to load seller catalog:", err);
      toast.error("Failed to fetch live product ledger");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerCatalog();
  }, []);

  // Calculated Aggregate Stats directly from database products list
  const stats = useMemo(() => {
    const totalSKUs = sellerProducts.length;
    const totalStock = sellerProducts.reduce((sum, p) => sum + (p.inventory?.quantity || 0), 0);
    const lowStockCount = sellerProducts.filter(p => (p.inventory?.quantity || 0) > 0 && (p.inventory?.quantity || 0) <= 5).length;
    const outOfStockCount = sellerProducts.filter(p => (p.inventory?.quantity || 0) === 0).length;
    const totalValue = sellerProducts.reduce((sum, p) => sum + ((p.price || 0) * (p.inventory?.quantity || 0)), 0);

    return { totalSKUs, totalStock, lowStockCount, outOfStockCount, totalValue };
  }, [sellerProducts]);

  // Adjust stock count (+1 or -1) with live backend sync
  const adjustStock = async (productId, amount) => {
    try {
      setIsLoading(true);
      const product = sellerProducts.find(p => p._id === productId || p.id === productId);
      if (!product) {
        toast.error("Product not found");
        return;
      }
      
      const currentQty = product.inventory?.quantity || 0;
      const newQty = Math.max(0, currentQty + amount);

      const response = await adminAPI.products.update(productId, {
        inventory: { 
          quantity: newQty,
          lowStockThreshold: product.inventory?.lowStockThreshold || 5
        }
      });

      if (response?.success) {
        toast.success(`Stock updated successfully to ${newQty}`);
        fetchSellerCatalog(); // Reload to sync with db
      } else {
        toast.error("Failed to sync stock level to database");
      }
    } catch (error) {
      console.error("Stock adjustment error:", error);
      toast.error("Failed to adjust stock");
    } finally {
      setIsLoading(false);
    }
  };

  // Restock an item instantly to 20 units
  const quickRestock = async (productId) => {
    try {
      setIsLoading(true);
      const product = sellerProducts.find(p => p._id === productId || p.id === productId);
      if (!product) {
        toast.error("Product not found");
        return;
      }

      const response = await adminAPI.products.update(productId, {
        inventory: { 
          quantity: 20,
          lowStockThreshold: product.inventory?.lowStockThreshold || 5
        }
      });

      if (response?.success) {
        toast.success(`⚡ "${product.name}" restocked to 20 units!`);
        fetchSellerCatalog();
      } else {
        toast.error("Failed to restock product");
      }
    } catch (error) {
      console.error("Quick restock error:", error);
      toast.error("Failed to restock product");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete product with backend sync
  const handleDeleteSku = async (product) => {
    try {
      const pid = product._id || product.id;
      if (!window.confirm(`Delete "${product.name}"? This action cannot be undone.`)) return;
      setIsLoading(true);
      
      const response = await adminAPI.products.delete(pid);
      if (response?.success) {
        toast.success(`"${product.name}" deleted from catalog`);
        fetchSellerCatalog();
      } else {
        toast.error("Failed to delete product from database");
      }
    } catch (error) {
      console.error("Delete product error:", error);
      toast.error("Failed to delete product");
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered Products based on search and filters
  const filteredProducts = useMemo(() => {
    return sellerProducts.filter(p => {
      const matchesSearch = (p.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.brand || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.sku || "").toLowerCase().includes(search.toLowerCase());
      
      const matchesCategory = categoryFilter === "all" || 
        (p.category?.name || p.category || "").toLowerCase() === categoryFilter.toLowerCase();
      
      const stockVal = p.inventory?.quantity || 0;
      let matchesStatus = true;
      if (statusFilter === "low") matchesStatus = stockVal > 0 && stockVal <= 5;
      else if (statusFilter === "out") matchesStatus = stockVal === 0;
      else if (statusFilter === "healthy") matchesStatus = stockVal > 5;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [sellerProducts, search, categoryFilter, statusFilter]);

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
      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#F8F8F8] to-white border-l-4 border-[#D4AF37] p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <span className="text-[9px] text-[#333333] font-extrabold uppercase tracking-wider block mb-2">
            💰 Stock Valuation
          </span>
          <div>
            <p className="text-2xl font-bold font-mono text-[#1A1A3A]">
              ₹{(stats.totalValue).toLocaleString()}
            </p>
            <p className="text-[12px] text-[#333333] opacity-70 mt-1">Total inventory value</p>
          </div>
        </div>

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

      {/* Control Filters Bar */}
      <div className="bg-white border border-[#E0E0E0] rounded-2xl shadow-sm p-4 space-y-4 lg:space-y-0">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="relative w-full lg:w-80 z-10">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#333333]" size={16} />
            <input
              type="text"
              placeholder="Search by SKU, name, or brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={isLoading}
              className="w-full bg-[#F8F8F8] border border-[#E0E0E0] py-2.5 pl-10 pr-4 rounded-xl focus:outline-none focus:bg-white focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/10 text-sm text-[#1A1A3A] placeholder-[#6B7280] disabled:opacity-50 transition-all font-medium"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              disabled={isLoading}
              className="w-full sm:w-48 bg-[#F8F8F8] border border-[#E0E0E0] py-2.5 px-4 rounded-xl text-sm font-semibold text-[#1A1A3A] focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/10 cursor-pointer disabled:opacity-50 transition-all appearance-none"
            >
              <option value="all">📂 All Categories</option>
              {categories.map(c => (
                <option key={c._id || c.id} value={c.name}>{c.name}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              disabled={isLoading}
              className="w-full sm:w-48 bg-[#F8F8F8] border border-[#E0E0E0] py-2.5 px-4 rounded-xl text-sm font-semibold text-[#1A1A3A] focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/10 cursor-pointer disabled:opacity-50 transition-all appearance-none"
            >
              <option value="all">📊 All Stock Status</option>
              <option value="healthy">✅ Stable (&gt; 5)</option>
              <option value="low">⚠️ Low Stock (1-5)</option>
              <option value="out">🔴 Out of Stock (0)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stock Ledger Table */}
      <div className="bg-white border border-[#E0E0E0] rounded-2xl shadow-sm overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-[#1A1A3A] text-white border-b border-[#2E3192]">
                <th className="px-4 sm:px-6 py-4 text-left text-[10px] font-extrabold uppercase tracking-widest">
                  Product Details
                </th>
                <th className="px-4 sm:px-6 py-4 text-center text-[10px] font-extrabold uppercase tracking-widest hidden sm:table-cell">
                  SKU ID
                </th>
                <th className="px-4 sm:px-6 py-4 text-left text-[10px] font-extrabold uppercase tracking-widest hidden md:table-cell">
                  Category
                </th>
                <th className="px-4 sm:px-6 py-4 text-right text-[10px] font-extrabold uppercase tracking-widest">
                  Price
                </th>
                <th className="px-4 sm:px-6 py-4 text-center text-[10px] font-extrabold uppercase tracking-widest w-[120px]">
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
                  const qtyVal = p.inventory?.quantity ?? p.stock ?? 0;
                  const stockStatus = getStockStatusBadge(qtyVal);

                  return (
                    <tr key={p._id || p.id} className="hover:bg-[#F8F8F8]/50 transition-colors group">
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <SafeImage
                            src={p.images?.[0]?.url || p.image}
                            alt={p.name}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover bg-[#F8F8F8] border border-[#E0E0E0] shrink-0"
                            fallback="https://placehold.co/48x48/E5E7EB/6B7280?text=No+Img"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-[#1A1A3A] truncate text-xs sm:text-sm leading-tight">
                              {p.name || 'Unnamed Product'}
                            </p>
                            <p className="text-[10px] text-[#333333] font-medium mt-0.5 sm:hidden">
                              {p.category?.name || p.category || 'General'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 sm:px-6 py-4 text-center hidden sm:table-cell">
                        <span className="font-mono font-bold text-[#333333] bg-[#F8F8F8] px-2.5 py-1 rounded-lg text-[10px]">
                          {p.sku || 'N/A'}
                        </span>
                      </td>

                      <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                        <span className="inline-block px-3 py-1.5 bg-[#F8F8F8] text-[#333333] text-[10px] font-semibold rounded-lg">
                          {p.category?.name || p.category || 'General'}
                        </span>
                      </td>

                      <td className="px-4 sm:px-6 py-4 text-right">
                        <span className="font-mono font-bold text-[#1A1A3A] text-sm">
                          ₹{(p.price || 0).toLocaleString()}
                        </span>
                      </td>

                      <td className="px-4 sm:px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="inline-flex items-center gap-1 bg-[#F8F8F8] border border-[#E0E0E0] rounded-lg p-1">
                            <button
                              onClick={() => adjustStock(p._id || p.id, -1)}
                              disabled={isLoading || qtyVal === 0}
                              className="hover:bg-white text-[#1A1A3A] hover:text-[#D4AF37] p-1.5 rounded border border-transparent hover:border-[#D4AF37] cursor-pointer transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Decrease Stock"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="font-mono font-extrabold text-[#1A1A3A] w-10 text-center text-sm">
                              {qtyVal}
                            </span>
                            <button
                              onClick={() => adjustStock(p._id || p.id, 1)}
                              disabled={isLoading}
                              className="hover:bg-white text-[#1A1A3A] hover:text-[#D4AF37] p-1.5 rounded border border-transparent hover:border-[#D4AF37] cursor-pointer transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Increase Stock"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border shadow-sm ${stockStatus.bg} ${stockStatus.text} ${stockStatus.border}`}>
                            {stockStatus.label}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 sm:px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => onEdit(p)}
                            disabled={isLoading}
                            className="text-[#333333] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 p-2 rounded-lg border border-transparent hover:border-[#D4AF37] cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Edit Product"
                          >
                            <Edit3 size={16} />
                          </button>

                          <button
                            onClick={() => handleDeleteSku(p)}
                            disabled={isLoading}
                            className="text-[#333333] hover:text-red-500 hover:bg-red-50 p-2 rounded-lg border border-transparent hover:border-red-200 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

      <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-xl p-4">
        <p className="text-sm text-[#1A1A3A] font-medium flex items-center gap-2">
          <span className="bg-[#D4AF37] text-[#1A1A3A] p-1 rounded text-xs"><Check size={12}/></span>
          Tip: Click the <strong>Stock Up/Down</strong> controls to instantly update inventory. Items with ≤5 stock require attention.
        </p>
      </div>
    </div>
  );
}