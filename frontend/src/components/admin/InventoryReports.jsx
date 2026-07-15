import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Download, AlertTriangle, Package, Check, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InventoryReports() {
  const { products, categories } = useApp();
  const [activeReportTab, setActiveReportTab] = useState("stock");

  // Helper function to safely get numeric values
  const safeNumber = (value, fallback = 0) => {
    const num = Number(value);
    return isNaN(num) ? fallback : num;
  };

  // Helper function to safely get string values
  const safeString = (value, fallback = '') => {
    return value && typeof value === 'string' ? value : fallback;
  };

  // 1. Stock Ledger Value Calculation
  const reportsStats = useMemo(() => {
    if (!products || products.length === 0) {
      return { totalDesigns: 0, totalAssetsVal: 0, lowStockItemsCount: 0, lowStockVal: 0, avgMargin: 30 };
    }

    const totalDesigns = products.length;
    const totalAssetsVal = products.reduce((sum, p) => {
      const price = safeNumber(p?.price, 0);
      const stock = safeNumber(p?.stock, 0);
      return sum + (price * stock);
    }, 0);
    
    const lowStockItems = products.filter(p => safeNumber(p?.stock, 0) <= 5);
    const lowStockVal = lowStockItems.reduce((sum, p) => {
      const price = safeNumber(p?.price, 0);
      const stock = safeNumber(p?.stock, 0);
      return sum + (price * stock);
    }, 0);
    
    const avgMargin = 30; // Static mock margin percentage

    return { totalDesigns, totalAssetsVal, lowStockItemsCount: lowStockItems.length, lowStockVal, avgMargin };
  }, [products]);

  // Recharts: Items with lowest stock count
  const lowStockChartData = useMemo(() => {
    if (!products || products.length === 0) return [];
    
    return products
      .filter(p => p && safeNumber(p.stock, 0) <= 8)
      .map(p => ({
        name: safeString(p.name).length > 15 ? safeString(p.name).substring(0, 15) + '...' : safeString(p.name) || 'Unknown Product',
        Stock: safeNumber(p.stock, 0)
      }))
      .slice(0, 6);
  }, [products]);

  // Recharts: Stock value per Category
  const categoryValueChartData = useMemo(() => {
    if (!products || products.length === 0) return [];
    
    const data = {};
    products.forEach(p => {
      if (!p) return;
      
      const category = safeString(p.category, 'General');
      const price = safeNumber(p.price, 0);
      const stock = safeNumber(p.stock, 0);
      
      data[category] = (data[category] || 0) + (price * stock);
    });
    
    return Object.keys(data).map(cat => ({
      category: cat,
      Capital: safeNumber(data[cat], 0)
    }));
  }, [products]);

  // --- ACTIONS FOR DOWNLOAD CSV REPORTS ---
  const triggerCSVDownload = (csvString, filename) => {
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csvString);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${filename} downloaded!`);
  };

  const handleExportStockReport = () => {
    let csv = "SKU ID,Product Name,Category,Price,Stock,Alert Level\n";
    products.forEach(p => {
      if (!p) return;
      
      const stock = safeNumber(p.stock, 0);
      const alert = stock === 0 ? "OUT OF STOCK" : stock <= 5 ? "LOW STOCK" : "STABLE";
      const price = safeNumber(p.price, 0);
      
      csv += `"${p.id || 'N/A'}","${safeString(p.name, 'Unknown')}","${safeString(p.category, 'General')}",₹${price},${stock},"${alert}"\n`;
    });
    triggerCSVDownload(csv, "inventory_stock_report.csv");
  };

  const handleExportSalesReport = () => {
    let csv = "Product Name,Category,Price,Units Sold,Revenue Generated\n";
    products.forEach(p => {
      if (!p) return;
      
      const mockSalesCount = Math.floor((safeNumber(p.id, 1) * 7) % 30) + 1;
      const price = safeNumber(p.price, 0);
      
      csv += `"${safeString(p.name, 'Unknown')}","${safeString(p.category, 'General')}",₹${price},${mockSalesCount},₹${mockSalesCount * price}\n`;
    });
    triggerCSVDownload(csv, "inventory_sales_report.csv");
  };

  const handleExportPerformanceReport = () => {
    let csv = "Product Name,Category,Rating,Views,Add to Cart,Conversion Rate\n";
    products.forEach(p => {
      if (!p) return;
      
      const mockViews = Math.floor((safeNumber(p.id, 1) * 143) % 800) + 120;
      const mockCarts = Math.floor(mockViews * 0.15);
      const conversion = ((mockCarts / mockViews) * 100).toFixed(2);
      
      csv += `"${safeString(p.name, 'Unknown')}","${safeString(p.category, 'General')}",${safeNumber(p.rating, 5.0)},${mockViews},${mockCarts},${conversion}%\n`;
    });
    triggerCSVDownload(csv, "inventory_performance_report.csv");
  };

  const handleExportCategoryReport = () => {
    let csv = "Category,Total SKUs,Total Stock,Average Price\n";
    const catGroups = {};
    
    products.forEach(p => {
      if (!p) return;
      
      const category = safeString(p.category, 'General');
      const price = safeNumber(p.price, 0);
      const stock = safeNumber(p.stock, 0);
      
      if (!catGroups[category]) {
        catGroups[category] = { count: 0, stock: 0, priceSum: 0 };
      }
      catGroups[category].count += 1;
      catGroups[category].stock += stock;
      catGroups[category].priceSum += price;
    });

    Object.keys(catGroups).forEach(cat => {
      const group = catGroups[cat];
      const avgPrice = group.count > 0 ? Math.round(group.priceSum / group.count) : 0;
      csv += `"${cat}","${group.count}","${group.stock}",₹${avgPrice}\n`;
    });
    triggerCSVDownload(csv, "inventory_category_report.csv");
  };

  // Show loading state if no products
  if (!products || products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <Package size={48} className="mx-auto text-gray-300" />
          <p className="text-sm text-gray-500">No products available for reporting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* Sub-tabs selections */}
      <div className="flex border-b border-gray-100 pb-2 gap-3 flex-wrap">
        {[
          { id: "stock", label: "A. Stock Shortages" },
          { id: "sales", label: "B. Sales Index" },
          { id: "performance", label: "C. Performance Audit" },
          { id: "category", label: "D. Collection Capital" }
        ].map((rep) => (
          <button
            key={rep.id}
            onClick={() => setActiveReportTab(rep.id)}
            className={`py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              activeReportTab === rep.id
                ? 'bg-black text-white'
                : 'text-gray-400 hover:text-gray-600 bg-slate-50 border border-slate-100'
            }`}
          >
            {rep.label}
          </button>
        ))}
      </div>

      {/* A. STOCK REPORT DETAIL */}
      {activeReportTab === "stock" && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Dynamic SKU Stock Ledger</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">Real-time tracking of active stock levels. Low stock warnings require reordering.</p>
            </div>
            <button
              onClick={handleExportStockReport}
              className="border border-gray-200 hover:border-black text-gray-800 bg-white text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors shadow-3xs"
            >
              <Download size={12} />
              <span>Export Stock Report</span>
            </button>
          </div>

          {/* Shortages Recharts analysis */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-7 bg-slate-50 p-4 rounded-2xl border border-gray-100">
              <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block mb-3">Critical Shortage Risk (Stock Count)</span>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={lowStockChartData} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 8, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 9, fill: '#64748b' }} />
                    <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '12px' }} />
                    <Bar dataKey="Stock" fill="#e11d48" radius={[4, 4, 0, 0]} barSize={25} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="md:col-span-5 space-y-3">
              <div className="border border-gray-100 p-4 rounded-2xl bg-white space-y-1.5">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest block">STOCK CAPITAL RISK</span>
                <p className="text-lg font-bold font-mono text-rose-600">₹{reportsStats.lowStockVal.toLocaleString()}</p>
                <p className="text-[9px] text-gray-400 leading-relaxed">Capital tied up in critically low stock or depleted items, slowing potential customer orders.</p>
              </div>
              <div className="border border-gray-100 p-4 rounded-2xl bg-white space-y-1.5">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest block">REORDER RECOMMENDATION</span>
                <p className="text-xs font-bold text-black flex items-center space-x-1">
                  <AlertTriangle size={12} className="text-amber-500" />
                  <span>{reportsStats.lowStockItemsCount} designs require restock</span>
                </p>
                <p className="text-[9px] text-gray-400 leading-relaxed">Generate spreadsheet and execute reorders for items below stable count of 5.</p>
              </div>
            </div>
          </div>

          {/* Table list */}
          <div className="overflow-x-auto border border-gray-100 rounded-2xl bg-white shadow-3xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-gray-500 font-extrabold uppercase border-b border-gray-100">
                  <th className="p-3">SKU</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">Price</th>
                  <th className="p-3 text-center">In-Stock</th>
                  <th className="p-3">Alert Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-mono text-gray-600">
                {products.map(p => {
                  if (!p) return null;
                  
                  const stock = safeNumber(p.stock, 0);
                  const price = safeNumber(p.price, 0);
                  
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/20">
                      <td className="p-3 text-center font-bold text-gray-400">#{p.id || 'N/A'}</td>
                      <td className="p-3 font-sans font-semibold text-black">{safeString(p.name, 'Unknown Product')}</td>
                      <td className="p-3 font-sans">{safeString(p.category, 'General')}</td>
                      <td className="p-3 text-right text-black font-bold">₹{price.toLocaleString()}</td>
                      <td className="p-3 text-center font-bold">{stock}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-[8px] font-extrabold uppercase tracking-widest border ${
                          stock === 0
                            ? 'bg-rose-50 text-rose-700 border-rose-100'
                            : stock <= 5
                            ? 'bg-amber-50 text-amber-700 border-amber-100'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        }`}>
                          {stock === 0 ? "Empty" : stock <= 5 ? "Low Stock" : "Stable"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* B. SALES REPORT DETAIL */}
      {activeReportTab === "sales" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Dynamic Sales Volume Index</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">Calculated metric representing unit demand, item velocity, and total cashflow contributions.</p>
            </div>
            <button
              onClick={handleExportSalesReport}
              className="border border-gray-200 hover:border-black text-gray-800 bg-white text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors shadow-3xs"
            >
              <Download size={12} />
              <span>Export Sales Index</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-gray-100 rounded-2xl bg-white shadow-3xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-gray-500 font-extrabold uppercase border-b border-gray-100">
                  <th className="p-3">Item Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">Unit List Price</th>
                  <th className="p-3 text-center">Units Sold (Calculated)</th>
                  <th className="p-3 text-right">Gross Sales Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-mono text-gray-600">
                {products.map(p => {
                  if (!p) return null;
                  
                  const price = safeNumber(p.price, 0);
                  const units = Math.floor((safeNumber(p.id, 1) * 7) % 30) + 1;
                  
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/20">
                      <td className="p-3 font-sans font-semibold text-black">{safeString(p.name, 'Unknown Product')}</td>
                      <td className="p-3 font-sans">{safeString(p.category, 'General')}</td>
                      <td className="p-3 text-right">₹{price.toLocaleString()}</td>
                      <td className="p-3 text-center font-bold">{units}</td>
                      <td className="p-3 text-right text-black font-extrabold">₹{(units * price).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* C. PERFORMANCE REPORT DETAIL */}
      {activeReportTab === "performance" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Dynamic Boutique Performance Audit</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">Telemetry showing item pageviews, conversion rates, and client adding-to-cart clicks.</p>
            </div>
            <button
              onClick={handleExportPerformanceReport}
              className="border border-gray-200 hover:border-black text-gray-800 bg-white text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors shadow-3xs"
            >
              <Download size={12} />
              <span>Export Performance Ledger</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-gray-100 rounded-2xl bg-white shadow-3xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-gray-500 font-extrabold uppercase border-b border-gray-100">
                  <th className="p-3">SKU Candidate</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-center">Boutique Rating</th>
                  <th className="p-3 text-center">Pageviews</th>
                  <th className="p-3 text-center">Add to Cart</th>
                  <th className="p-3 text-right">Conversion Index</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-mono text-gray-600">
                {products.map(p => {
                  if (!p) return null;
                  
                  const views = Math.floor((safeNumber(p.id, 1) * 143) % 800) + 120;
                  const carts = Math.floor(views * 0.15);
                  const rating = safeNumber(p.rating, 5.0);
                  
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/20">
                      <td className="p-3 font-sans font-semibold text-black">{safeString(p.name, 'Unknown Product')}</td>
                      <td className="p-3 font-sans">{safeString(p.category, 'General')}</td>
                      <td className="p-3 text-center text-amber-500 font-bold">★ {rating}</td>
                      <td className="p-3 text-center">{views}</td>
                      <td className="p-3 text-center">{carts}</td>
                      <td className="p-3 text-right text-emerald-600 font-bold">{((carts / views) * 100).toFixed(2)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* D. CATEGORY REPORT DETAIL */}
      {activeReportTab === "category" && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Category Performance Metrics</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">Summed totals, counting unique design models and active stock volumes across core categories.</p>
            </div>
            <button
              onClick={handleExportCategoryReport}
              className="border border-gray-200 hover:border-black text-gray-800 bg-white text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl flex items-center space-x-1.5 cursor-pointer transition-colors shadow-3xs"
            >
              <Download size={12} />
              <span>Export Category Audit</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Category Value Recharts representation */}
            <div className="md:col-span-8 bg-slate-50 p-4 rounded-2xl border border-gray-100">
              <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block mb-3">Capital Distribution per Category (INR Value)</span>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={categoryValueChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCapital" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="category" tick={{ fontSize: 9, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 9, fill: '#64748b' }} />
                    <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="Capital" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCapital)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="md:col-span-4 bg-emerald-50/40 border border-emerald-100 p-5 rounded-2xl space-y-4">
              <div className="space-y-1">
                <Package size={24} className="text-emerald-700" />
                <h5 className="text-[10px] text-emerald-800 font-extrabold uppercase tracking-widest">Atelier Stock Valuation</h5>
                <p className="text-xl font-bold font-mono text-emerald-950">₹{reportsStats.totalAssetsVal.toLocaleString()}</p>
                <p className="text-[9px] text-emerald-700 leading-relaxed font-medium">Total capital currently invested in ready-to-sell stock across all segments.</p>
              </div>
              <div className="flex items-center space-x-1 text-[9px] text-emerald-800 font-bold bg-emerald-100/50 py-1 px-2.5 rounded-lg w-fit">
                <TrendingUp size={10} />
                <span>Standard markup margins: {reportsStats.avgMargin}%</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto border border-gray-100 rounded-2xl bg-white shadow-3xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-gray-500 font-extrabold uppercase border-b border-gray-100">
                  <th className="p-3">Category</th>
                  <th className="p-3 text-center">Unique Designs (SKUs)</th>
                  <th className="p-3 text-center">Cumulative Stock Units</th>
                  <th className="p-3 text-right">Average Price Index</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-mono text-gray-600">
                {categories && categories.map(cat => {
                  if (!cat) return null;
                  
                  // Safe category matching
                  const categoryName = safeString(cat.name, '').toLowerCase();
                  const categorySlug = safeString(cat.slug, '').toLowerCase();
                  
                  const matchingProds = products.filter(p => {
                    if (!p) return false;
                    const prodCategory = safeString(p.category, '').toLowerCase();
                    return prodCategory === categoryName || prodCategory === categorySlug;
                  });
                  
                  const skuCount = matchingProds.length;
                  const stockCount = matchingProds.reduce((sum, p) => sum + safeNumber(p?.stock, 0), 0);
                  const avgPrice = skuCount > 0 ? Math.round(matchingProds.reduce((sum, p) => sum + safeNumber(p?.price, 0), 0) / skuCount) : 0;
                  
                  return (
                    <tr key={cat.id} className="hover:bg-slate-50/20">
                      <td className="p-3 font-sans font-semibold text-black">{safeString(cat.name, 'Unknown Category')}</td>
                      <td className="p-3 text-center font-bold">{skuCount}</td>
                      <td className="p-3 text-center font-bold">{stockCount}</td>
                      <td className="p-3 text-right text-black font-extrabold">₹{avgPrice.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}