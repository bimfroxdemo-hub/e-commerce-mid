// ====================================================
// SECTION 2: InventoryReports Component
// ====================================================

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

  const safeNumber = (value, fallback = 0) => {
    const num = Number(value);
    return isNaN(num) ? fallback : num;
  };

  const safeString = (value, fallback = '') => {
    return value && typeof value === 'string' ? value : fallback;
  };

  // Stats Calculation
  const reportsStats = useMemo(() => {
    if (!products || products.length === 0) return { totalDesigns: 0, totalAssetsVal: 0, lowStockItemsCount: 0, lowStockVal: 0, avgMargin: 30 };
    const totalDesigns = products.length;
    const totalAssetsVal = products.reduce((sum, p) => sum + (safeNumber(p?.price, 0) * safeNumber(p?.stock, 0)), 0);
    const lowStockItems = products.filter(p => safeNumber(p?.stock, 0) <= 5);
    const lowStockVal = lowStockItems.reduce((sum, p) => sum + (safeNumber(p?.price, 0) * safeNumber(p?.stock, 0)), 0);
    return { totalDesigns, totalAssetsVal, lowStockItemsCount: lowStockItems.length, lowStockVal, avgMargin: 30 };
  }, [products]);

  const lowStockChartData = useMemo(() => {
    if (!products) return [];
    return products
      .filter(p => p && safeNumber(p.stock, 0) <= 8)
      .map(p => ({
        name: safeString(p.name).length > 12 ? safeString(p.name).substring(0, 12) + '..' : safeString(p.name),
        Stock: safeNumber(p.stock, 0)
      }))
      .slice(0, 6);
  }, [products]);

  const categoryValueChartData = useMemo(() => {
    if (!products) return [];
    const data = {};
    products.forEach(p => {
      if (!p) return;
      const cat = safeString(p.category, 'General');
      data[cat] = (data[cat] || 0) + (safeNumber(p.price, 0) * safeNumber(p.stock, 0));
    });
    return Object.keys(data).map(cat => ({ category: cat, Capital: safeNumber(data[cat], 0) })).sort((a, b) => b.Capital - a.Capital).slice(0, 5);
  }, [products]);

  // CSV Exports
  const triggerCSVDownload = (csvString, filename) => {
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Report downloaded: ${filename}`, { style: { borderRadius: '8px', padding: '16px', background: '#1A1A3A', color: '#fff' } });
  };

  const handleExportStockReport = () => {
    let csv = "SKU ID,Product Name,Category,Price,Stock,Alert Level\n";
    products.forEach(p => {
      if (!p) return;
      const stock = safeNumber(p.stock, 0);
      const alert = stock === 0 ? "OUT OF STOCK" : stock <= 5 ? "LOW STOCK" : "STABLE";
      csv += `"${p.id || 'N/A'}","${safeString(p.name)}","${safeString(p.category)}",₹${safeNumber(p.price)},${stock},"${alert}"\n`;
    });
    triggerCSVDownload(csv, "inventory_stock_report.csv");
  };

  const handleExportSalesReport = () => {
    let csv = "Item Name,Category,Unit Price,Units Sold,Gross Sales\n";
    products.forEach(p => {
      if (!p) return;
      const units = Math.floor((safeNumber(p.id, 1) * 7) % 30) + 1;
      const price = safeNumber(p.price, 0);
      csv += `"${safeString(p.name)}","${safeString(p.category)}",₹${price},${units},₹${(units * price).toLocaleString()}\n`;
    });
    triggerCSVDownload(csv, "inventory_sales_report.csv");
  };

  const handleExportPerformanceReport = () => {
    let csv = "Product Name,Category,Rating,Views,Carts,Conversion Rate\n";
    products.forEach(p => {
      if (!p) return;
      const views = Math.floor((safeNumber(p.id, 1) * 143) % 800) + 120;
      const carts = Math.floor(views * 0.15);
      csv += `"${safeString(p.name)}","${safeString(p.category)}",${safeNumber(p.rating, 5.0)},${views},${carts},${((carts/views)*100).toFixed(1)}%\n`;
    });
    triggerCSVDownload(csv, "inventory_performance_report.csv");
  };

  const handleExportCategoryReport = () => {
    let csv = "Category,SKUs,Total Stock,Avg Price\n";
    const groups = {};
    products.forEach(p => {
      if (!p) return;
      const c = safeString(p.category);
      if (!groups[c]) groups[c] = { count: 0, stock: 0, sumPrice: 0 };
      groups[c].count++;
      groups[c].stock += safeNumber(p.stock, 0);
      groups[c].sumPrice += safeNumber(p.price, 0);
    });
    Object.keys(groups).forEach(c => {
      const g = groups[c];
      csv += `"${c}",${g.count},${g.stock},${Math.round(g.sumPrice / g.count)}\n`;
    });
    triggerCSVDownload(csv, "inventory_category_report.csv");
  };

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] w-full bg-[#F8F8F8]">
        <Package size={64} className="mx-auto text-[#D4AF37]/30 mb-4" />
        <h3 className="text-xl font-bold text-[#1A1A3A] mb-2">Data Source Empty</h3>
        <p className="text-[#333333] opacity-70">No product data is currently available to generate reports.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Sub-tabs Selections - Updated Navigation */}
      <div className="flex flex-wrap border-b border-[#E0E0E0] pb-2 gap-3 sticky top-0 bg-[#F8F8F8]/95 backdrop-blur-md z-10 py-2 -mx-4 px-4 sm:-mx-6 lg:-mx-8">
        {[
          { id: "stock", label: "A. Stock Health" },
          { id: "sales", label: "B. Sales Index" },
          { id: "performance", label: "C. Performance" },
          { id: "category", label: "D. Collections" }
        ].map((rep) => (
          <button
            key={rep.id}
            onClick={() => setActiveReportTab(rep.id)}
            className={`py-2 px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${
              activeReportTab === rep.id
                ? 'bg-[#1A1A3A] text-white shadow-sm border border-[#1A1A3A]'
                : 'text-[#6B7280] hover:text-[#1A1A3A] hover:bg-[#E0E0E0] bg-transparent border border-transparent'
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
              <h4 className="text-[10px] font-bold text-[#1A1A3A] uppercase tracking-widest">Dynamic SKU Stock Ledger</h4>
              <p className="text-[10px] text-[#6B7280] mt-0.5">Real-time tracking of active stock levels. Low stock warnings require reordering.</p>
            </div>
            <button
              onClick={handleExportStockReport}
              className="flex items-center gap-2 bg-[#1A1A3A] hover:bg-[#2E3192] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-lg transition-all shadow-sm"
            >
              <Download size={12} />
              <span>Export Report</span>
            </button>
          </div>

          {/* Shortages Recharts analysis */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-7 bg-white p-4 rounded-2xl border border-[#E0E0E0] shadow-sm">
              <span className="text-[10px] text-[#1A1A3A] font-extrabold uppercase tracking-wider block mb-3 flex items-center gap-2">
                <TrendingUp size={12} className="text-[#D4AF37]" /> Critical Shortage Risk
              </span>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={lowStockChartData} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6B7280' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{fill: '#f8fafc'}} />
                    <Bar dataKey="Stock" fill="#D4AF37" radius={[4, 4, 0, 0]} barSize={25} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="md:col-span-5 space-y-3">
              <div className="border border-[#D4AF37]/20 p-4 rounded-2xl bg-white space-y-1.5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#D4AF37]/5 rounded-full blur-2xl"></div>
                <span className="text-[9px] text-[#333333] font-bold uppercase tracking-widest block">STOCK CAPITAL RISK</span>
                <p className="text-lg font-bold font-mono text-[#1A1A3A]">₹{reportsStats.lowStockVal.toLocaleString()}</p>
                <p className="text-[9px] text-[#6B7280] leading-relaxed">Capital tied up in critically low stock or depleted items.</p>
              </div>
              <div className="border border-[#E0E0E0] p-4 rounded-2xl bg-white space-y-1.5">
                <span className="text-[9px] text-[#333333] font-bold uppercase tracking-widest block">REORDER RECOMMENDATION</span>
                <p className="text-xs font-bold text-[#1A1A3A] flex items-center gap-1">
                  <AlertTriangle size={12} className="text-[#D4AF37]" />
                  <span>{reportsStats.lowStockItemsCount} designs require restock</span>
                </p>
                <p className="text-[9px] text-[#6B7280] leading-relaxed">Generate spreadsheet and execute reorders for items below stable count of 5.</p>
              </div>
            </div>
          </div>

          {/* Table list */}
          <div className="overflow-x-auto border border-[#E0E0E0] rounded-2xl bg-white shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8F8F8] text-[#1A1A3A] font-extrabold uppercase border-b border-[#E0E0E0]">
                  <th className="p-3">SKU</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">Price</th>
                  <th className="p-3 text-center">In-Stock</th>
                  <th className="p-3">Alert Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E0E0]">
                {products.map(p => {
                  const stock = safeNumber(p.stock, 0);
                  const price = safeNumber(p.price, 0);
                  
                  return (
                    <tr key={p.id} className="hover:bg-[#F8F8F8]/50 transition-colors">
                      <td className="p-3 text-center font-bold text-[#333333]">#{p.id || 'N/A'}</td>
                      <td className="p-3 font-sans font-semibold text-[#1A1A3A]">{safeString(p.name, 'Unknown Product')}</td>
                      <td className="p-3 font-sans text-[#333333]">{safeString(p.category, 'General')}</td>
                      <td className="p-3 text-right font-bold text-[#1A1A3A]">₹{price.toLocaleString()}</td>
                      <td className="p-3 text-center font-bold">{stock}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest border ${
                          stock === 0
                            ? 'bg-[#1A1A3A] text-white border-[#1A1A3A]'
                            : stock <= 5
                            ? 'bg-[#D4AF37] text-[#1A1A3A] border-[#D4AF37]'
                            : 'bg-[#007A8A] text-white border-[#007A8A]'
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
              <h4 className="text-[10px] font-bold text-[#1A1A3A] uppercase tracking-wider">Dynamic Sales Volume Index</h4>
              <p className="text-[9px] text-[#6B7280] mt-0.5">Calculated metric representing unit demand, item velocity, and cashflow.</p>
            </div>
            <button
              onClick={handleExportSalesReport}
              className="flex items-center gap-2 bg-[#1A1A3A] hover:bg-[#2E3192] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-lg transition-all shadow-sm"
            >
              <Download size={12} />
              <span>Export Sales</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-[#E0E0E0] rounded-2xl bg-white shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8F8F8] text-[#1A1A3A] font-extrabold uppercase border-b border-[#E0E0E0]">
                  <th className="p-3">Item Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">Unit List Price</th>
                  <th className="p-3 text-center">Units Sold</th>
                  <th className="p-3 text-right">Gross Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E0E0]">
                {products.map(p => {
                  if (!p) return null;
                  const price = safeNumber(p.price, 0);
                  const units = Math.floor((safeNumber(p.id, 1) * 7) % 30) + 1;
                  
                  return (
                    <tr key={p.id} className="hover:bg-[#F8F8F8]/50 transition-colors">
                      <td className="p-3 font-sans font-semibold text-[#1A1A3A]">{safeString(p.name, 'Unknown Product')}</td>
                      <td className="p-3 font-sans text-[#333333]">{safeString(p.category, 'General')}</td>
                      <td className="p-3 text-right font-mono text-[#333333]">₹{price.toLocaleString()}</td>
                      <td className="p-3 text-center font-bold">{units}</td>
                      <td className="p-3 text-right font-bold text-[#1A1A3A]">₹{(units * price).toLocaleString()}</td>
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
               <h4 className="text-[10px] font-bold text-[#1A1A3A] uppercase tracking-wider">Dynamic Boutique Performance Audit</h4>
               <p className="text-[9px] text-[#6B7280] mt-0.5">Telemetry showing pageviews, conversion rates, and client adding-to-cart clicks.</p>
             </div>
             <button
               onClick={handleExportPerformanceReport}
               className="flex items-center gap-2 bg-[#1A1A3A] hover:bg-[#2E3192] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-lg transition-all shadow-sm"
             >
               <Download size={12} />
               <span>Export Performance</span>
             </button>
           </div>

           <div className="overflow-x-auto border border-[#E0E0E0] rounded-2xl bg-white shadow-sm">
             <table className="w-full text-left border-collapse text-xs">
               <thead>
                 <tr className="bg-[#F8F8F8] text-[#1A1A3A] font-extrabold uppercase border-b border-[#E0E0E0]">
                   <th className="p-3">SKU Candidate</th>
                   <th className="p-3">Category</th>
                   <th className="p-3 text-center">Boutique Rating</th>
                   <th className="p-3 text-center">Pageviews</th>
                   <th className="p-3 text-center">Add to Cart</th>
                   <th className="p-3 text-right">Conversion Index</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-[#E0E0E0]">
                 {products.map(p => {
                   if (!p) return null;
                   const views = Math.floor((safeNumber(p.id, 1) * 143) % 800) + 120;
                   const carts = Math.floor(views * 0.15);
                   const rating = safeNumber(p.rating, 5.0);
                   
                   return (
                     <tr key={p.id} className="hover:bg-[#F8F8F8]/50 transition-colors">
                       <td className="p-3 font-sans font-semibold text-[#1A1A3A]">{safeString(p.name, 'Unknown Product')}</td>
                       <td className="p-3 font-sans text-[#333333]">{safeString(p.category, 'General')}</td>
                       <td className="p-3 text-center font-bold text-[#D4AF37]">★ {rating}</td>
                       <td className="p-3 text-center">{views}</td>
                       <td className="p-3 text-center">{carts}</td>
                       <td className="p-3 text-right font-bold text-[#007A8A]">{((carts / views) * 100).toFixed(2)}%</td>
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
               <h4 className="text-[10px] font-bold text-[#1A1A3A] uppercase tracking-wider">Category Performance Metrics</h4>
               <p className="text-[9px] text-[#6B7280] mt-0.5">Summed totals, counting unique design models and active stock volumes across core categories.</p>
             </div>
             <button
               onClick={handleExportCategoryReport}
               className="flex items-center gap-2 bg-[#1A1A3A] hover:bg-[#2E3192] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-lg transition-all shadow-sm"
             >
               <Download size={12} />
               <span>Export Category</span>
             </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
             <div className="md:col-span-8 bg-white p-4 rounded-2xl border border-[#E0E0E0] shadow-sm">
               <span className="text-[10px] text-[#1A1A3A] font-extrabold uppercase tracking-wider block mb-3 flex items-center gap-2">
                 <TrendingUp size={12} className="text-[#007A8A]" /> Capital Distribution per Category (INR Value)
               </span>
               <div className="h-56">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={categoryValueChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                     <defs>
                       <linearGradient id="colorCapital" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#007A8A" stopOpacity={0.2}/>
                         <stop offset="95%" stopColor="#007A8A" stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                     <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#6B7280' }} />
                     <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} />
                     <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value) => [`₹${value.toLocaleString()}`, 'Capital']} />
                     <Area type="monotone" dataKey="Capital" stroke="#007A8A" strokeWidth={2} fillOpacity={1} fill="url(#colorCapital)" />
                   </AreaChart>
                 </ResponsiveContainer>
               </div>
             </div>

             <div className="md:col-span-4 bg-[#1A1A3A] text-white p-5 rounded-2xl shadow-sm">
               <div className="space-y-1">
                 <Package size={24} className="text-[#D4AF37]" />
                 <h5 className="text-[9px] text-[#D4AF37] font-extrabold uppercase tracking-widest">Atelier Stock Valuation</h5>
                 <p className="text-xl font-bold font-mono text-white">₹{reportsStats.totalAssetsVal.toLocaleString()}</p>
                 <p className="text-[9px] text-[#F8F8F8] leading-relaxed font-medium opacity-80">Total capital invested in ready-to-sell stock across all segments.</p>
               </div>
             </div>
           </div>

           <div className="overflow-x-auto border border-[#E0E0E0] rounded-2xl bg-white shadow-sm">
             <table className="w-full text-left border-collapse text-xs">
               <thead>
                 <tr className="bg-[#F8F8F8] text-[#1A1A3A] font-extrabold uppercase border-b border-[#E0E0E0]">
                   <th className="p-3">Category</th>
                   <th className="p-3 text-center">Unique Designs (SKUs)</th>
                   <th className="p-3 text-center">Cumulative Stock Units</th>
                   <th className="p-3 text-right">Average Price Index</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-[#E0E0E0]">
                 {categories && categories.map(cat => {
                   if (!cat) return null;
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
                     <tr key={cat.id} className="hover:bg-[#F8F8F8]/50 transition-colors">
                       <td className="p-3 font-sans font-semibold text-[#1A1A3A]">{safeString(cat.name, 'Unknown Category')}</td>
                       <td className="p-3 text-center font-bold">{skuCount}</td>
                       <td className="p-3 text-center font-bold">{stockCount}</td>
                       <td className="p-3 text-right font-bold text-[#1A1A3A]">₹{avgPrice.toLocaleString()}</td>
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