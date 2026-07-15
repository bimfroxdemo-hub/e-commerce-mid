import React, { useState } from 'react';
import { Layers, Plus, Upload, FileText } from 'lucide-react';
import StockLedger from './StockLedger';
import AddProductForm from './AddProductForm';
import BulkUploadCSV from './BulkUploadCSV';
import InventoryReports from './InventoryReports';

export default function InventoryManagement({ onEditProduct }) {
  const [subTab, setSubTab] = useState("manage"); // manage, add-single, bulk-upload, reports

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Tab Header Subtitles */}
      <div className="pb-3 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-black">
            Inventory & Catalog System
          </h3>
          <p className="text-[11px] text-gray-400 font-sans mt-0.5">
            Oversee active stock, increment or restock SKUs, batch import spreadsheets, and view shortage forecasts.
          </p>
        </div>
      </div>

      {/* Dynamic Navigation Sub-pills */}
      <div className="flex border-b border-gray-100 pb-3 gap-2 flex-wrap">
        {[
          { id: "manage", label: "1. Stock Ledger", icon: <Layers size={13} /> },
          { id: "add-single", label: "2. Add Product (Single)", icon: <Plus size={13} /> },
          { id: "bulk-upload", label: "3. Bulk Upload (Excel)", icon: <Upload size={13} /> },
          { id: "reports", label: "4. Inventory Reports", icon: <FileText size={13} /> }
        ].map((pill) => (
          <button
            key={pill.id}
            onClick={() => setSubTab(pill.id)}
            className={`py-2 px-4 rounded-xl text-[10px] font-extrabold uppercase tracking-widest flex items-center space-x-1.5 transition-all cursor-pointer border ${
              subTab === pill.id
                ? 'bg-black text-white border-black shadow-xs'
                : 'bg-slate-50 text-gray-500 border-slate-100 hover:bg-slate-100 hover:text-black'
            }`}
          >
            {pill.icon}
            <span>{pill.label}</span>
          </button>
        ))}
      </div>

      {/* Render selected sub-tab component */}
      <div className="pt-2">
        {subTab === "manage" && <StockLedger onEdit={onEditProduct} />}
        {subTab === "add-single" && <AddProductForm />}
        {subTab === "bulk-upload" && <BulkUploadCSV />}
        {subTab === "reports" && <InventoryReports />}
      </div>

    </div>
  );
}
