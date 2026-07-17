import React, { useState } from 'react';
import { Layers, Plus, Upload, FileText } from 'lucide-react';
import StockLedger from './StockLedger';
import AddProductForm from './AddProductForm';
import BulkUploadCSV from './BulkUploadCSV';
import InventoryReports from './InventoryReports';

export default function InventoryManagement({ onEditProduct }) {
  const [subTab, setSubTab] = useState("manage"); // manage, add-single, bulk-upload, reports

  return (
    <div className="animate-fade-in space-y-5 bg-[#F8F8F8] sm:space-y-6">
      
      {/* Tab Header Subtitles */}
      <div className="flex flex-col gap-2 border-b border-[#E0E0E0] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h3 className="font-display text-sm font-extrabold uppercase tracking-wider text-[#1A1A3A] sm:text-base">
            Inventory & Catalog System
          </h3>

          <p className="mt-1 max-w-3xl text-[10px] leading-relaxed text-[#666666] sm:text-[11px]">
            Oversee active stock, increment or restock SKUs, batch import spreadsheets, and view shortage forecasts.
          </p>
        </div>
      </div>

      {/* Dynamic Navigation Sub-pills */}
      <div className="-mx-1 overflow-x-auto pb-1">
        <div className="flex min-w-max gap-2 border-b border-[#E0E0E0] px-1 pb-3">
          {[
            { id: "manage", label: "1. Stock Ledger", icon: <Layers size={13} /> },
            { id: "add-single", label: "2. Add Product (Single)", icon: <Plus size={13} /> },
            { id: "bulk-upload", label: "3. Bulk Upload (Excel)", icon: <Upload size={13} /> },
            { id: "reports", label: "4. Inventory Reports", icon: <FileText size={13} /> }
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setSubTab(pill.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-[9px] font-extrabold uppercase tracking-widest transition-all duration-200 sm:px-4 sm:text-[10px] ${
                subTab === pill.id
                  ? 'border-[#1A1A3A] bg-[#1A1A3A] text-white shadow-md'
                  : 'border-[#E0E0E0] bg-white text-[#666666] hover:border-[#007A8A] hover:bg-[#007A8A]/5 hover:text-[#007A8A]'
              }`}
            >
              <span className={subTab === pill.id ? 'text-[#D4AF37]' : 'text-[#007A8A]'}>
                {pill.icon}
              </span>
              <span>{pill.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Render selected sub-tab component */}
      <div className="rounded-2xl border border-[#E0E0E0] bg-white p-3 shadow-sm sm:rounded-3xl sm:p-5">
        {subTab === "manage" && <StockLedger onEdit={onEditProduct} />}
        {subTab === "add-single" && <AddProductForm />}
        {subTab === "bulk-upload" && <BulkUploadCSV />}
        {subTab === "reports" && <InventoryReports />}
      </div>

    </div>
  );
}