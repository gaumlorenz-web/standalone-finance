import React from "react";
import { RefreshCw } from "lucide-react";

export default function CashManagement() {
  const formatPHP = (val) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(val);

  return (
    <div className="space-y-6">
      <span className="text-[11px] font-bold font-['IBM_Plex_Mono'] uppercase text-[#5C636F]">
            TREASURY CORE / LIQUIDITY
          </span>
          <h1 className="text-2xl font-bold font-['Archivo'] text-[#1A1D21]">
            Cash Management
          </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1A1D21] text-white p-5 rounded-xl border border-[#2A2E34] space-y-2">
          <span className="text-xs font-['IBM_Plex_Mono'] text-[#A8AFB8]">TOTAL CASH &amp; BANK LIQUIDITY</span>
          <div className="text-3xl font-bold font-['IBM_Plex_Mono'] text-[#35C98B]">{formatPHP(2845000)}</div>
        </div>
        <div className="bg-[#FFFFFF] p-5 rounded-xl border border-[#DFE1DB] space-y-2">
          <span className="text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">OPERATING BANK ACCOUNT</span>
          <div className="text-2xl font-bold font-['IBM_Plex_Mono']">{formatPHP(2100000)}</div>
        </div>
        <div className="bg-[#FFFFFF] p-5 rounded-xl border border-[#DFE1DB] space-y-2">
          <span className="text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">PETTY CASH ON HAND</span>
          <div className="text-2xl font-bold font-['IBM_Plex_Mono']">{formatPHP(745000)}</div>
        </div>
      </div>

      {/* Bank Reconciliation Workspace */}
      <div className="bg-[#FFFFFF] border border-[#DFE1DB] rounded-xl p-4 space-y-4">
        <div className="flex justify-between items-center border-b border-[#DFE1DB] pb-3">
          <h3 className="font-['Archivo'] font-bold text-base">Bank Statement Reconciliation Workspace</h3>
          <button className="bg-[#1A1D21] text-white px-3 py-1.5 rounded-lg text-xs font-bold font-['IBM_Plex_Mono'] flex items-center space-x-1">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Fetch Bank Statement Feed</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-[#DFE1DB] rounded-lg p-3 space-y-2 bg-[#F1F1ED]">
            <span className="text-xs font-['IBM_Plex_Mono'] font-bold text-[#5C636F]">INTERNAL SYSTEM LEDGER (GL CASH)</span>
            <div className="bg-white p-2.5 rounded border border-[#DFE1DB] flex justify-between items-center text-xs font-['IBM_Plex_Mono']">
              <span>2026-08-16 | Vendor Settlement</span>
              <span className="font-bold text-[#B5281A]">(PHP 125,000.00)</span>
            </div>
          </div>
          <div className="border border-[#DFE1DB] rounded-lg p-3 space-y-2 bg-[#F1F1ED]">
            <span className="text-xs font-['IBM_Plex_Mono'] font-bold text-[#5C636F]">IMPORTED BANK STATEMENT FEED</span>
            <div className="bg-white p-2.5 rounded border border-[#DFE1DB] flex justify-between items-center text-xs font-['IBM_Plex_Mono']">
              <span>2026-08-16 | CHK #4091 CLEARED</span>
              <span className="font-bold text-[#B5281A]">(PHP 125,000.00)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
