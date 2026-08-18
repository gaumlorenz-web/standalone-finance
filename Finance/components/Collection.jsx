import React from "react";
import { Plus } from "lucide-react";

export default function Collection() {
  const formatPHP = (val) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(val);

  return (
    <div className="space-y-6">
      <span className="text-[11px] font-bold font-['IBM_Plex_Mono'] uppercase text-[#5C636F]">
            TRANSACTION CORE / RECEIVABLES
          </span>
          <h1 className="text-2xl font-bold font-['Archivo'] text-[#1A1D21]">
            Collection Management
          </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#DFE1DB]">
          <span className="text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">TODAY'S COLLECTIONS</span>
          <div className="text-2xl font-bold font-['IBM_Plex_Mono'] mt-1 text-[#157A4D]">{formatPHP(142300)}</div>
        </div>
        <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#DFE1DB]">
          <span className="text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">POS RESTAURANT DROPS (TEAM 10)</span>
          <div className="text-2xl font-bold font-['IBM_Plex_Mono'] mt-1">{formatPHP(62800)}</div>
        </div>
        <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#DFE1DB]">
          <span className="text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">HOTEL FOLIO RECEIPTS (TEAM 9)</span>
          <div className="text-2xl font-bold font-['IBM_Plex_Mono'] mt-1">{formatPHP(79500)}</div>
        </div>
      </div>

      <div className="bg-[#FFFFFF] border border-[#DFE1DB] rounded-xl overflow-hidden p-4 space-y-4">
        <div className="flex justify-between items-center border-b border-[#DFE1DB] pb-3">
          <h3 className="font-['Archivo'] font-bold text-base">Inflow Stream &amp; Payment Gateway Logs</h3>
          <button className="bg-[#157A4D] text-white px-3 py-1.5 rounded-lg text-xs font-bold font-['IBM_Plex_Mono'] flex items-center space-x-1">
            <Plus className="h-3.5 w-3.5" />
            <span>Record Direct Collection</span>
          </button>
        </div>
        <table className="w-full text-left text-sm font-['IBM_Plex_Sans']">
          <thead className="bg-[#F1F1ED] text-[11px] font-bold font-['IBM_Plex_Mono'] text-[#5C636F] uppercase">
            <tr>
              <th className="p-3">Collection ID</th>
              <th className="p-3">Source Channel</th>
              <th className="p-3">External Ref</th>
              <th className="p-3">Method</th>
              <th className="p-3 text-right">Amount (PHP)</th>
              <th className="p-3 text-center">AR Match Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DFE1DB]">
            <tr>
              <td className="p-3 font-['IBM_Plex_Mono'] font-bold">COL-2026-501</td>
              <td className="p-3">Team 10 Restaurant POS</td>
              <td className="p-3 font-['IBM_Plex_Mono'] text-xs">POS-SHIFT-A</td>
              <td className="p-3 font-['IBM_Plex_Mono'] text-xs">Cash Drop</td>
              <td className="p-3 text-right font-['IBM_Plex_Mono'] font-bold">{formatPHP(62800)}</td>
              <td className="p-3 text-center">
                <span className="bg-[#157A4D]/10 text-[#157A4D] px-2 py-0.5 rounded text-xs font-bold">Matched to AR</span>
              </td>
            </tr>
            <tr>
              <td className="p-3 font-['IBM_Plex_Mono'] font-bold">COL-2026-502</td>
              <td className="p-3">Team 9 Hotel Front Desk</td>
              <td className="p-3 font-['IBM_Plex_Mono'] text-xs">HTL-BK-9021</td>
              <td className="p-3 font-['IBM_Plex_Mono'] text-xs">Credit Card Terminal</td>
              <td className="p-3 text-right font-['IBM_Plex_Mono'] font-bold">{formatPHP(34500)}</td>
              <td className="p-3 text-center">
                <span className="bg-[#8A5A00]/10 text-[#8A5A00] px-2 py-0.5 rounded text-xs font-bold">Pending Allocation</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
