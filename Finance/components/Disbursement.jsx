import React from "react";
import { Plus, Send } from "lucide-react";

export default function Disbursement() {
  const formatPHP = (val) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(val);

  return (
    
    <div className="space-y-6">
      {/* Phase Rail Header */}
      <span className="text-[11px] font-bold font-['IBM_Plex_Mono'] uppercase text-[#5C636F]">
            TRANSACTION CORE / PAYABLES
          </span>
          <h1 className="text-2xl font-bold font-['Archivo'] text-[#1A1D21]">
            Disbursement Management
          </h1>
      <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#DFE1DB] space-y-3">
        
        <span className="text-xs font-['IBM_Plex_Mono'] text-[#5C636F] font-bold uppercase">
          Disbursement Approval Lifecycle
        </span>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 font-['IBM_Plex_Mono'] text-xs">
          <div className="bg-[#F1F1ED] p-2.5 rounded-lg border-l-4 border-[#1A1D21]">
            <div className="text-[#5C636F]">1. Invoice Ingested</div>
            <div className="font-bold text-[#1A1D21] mt-0.5">3 Pending</div>
          </div>
          <div className="bg-[#F1F1ED] p-2.5 rounded-lg border-l-4 border-[#8A5A00]">
            <div className="text-[#5C636F]">2. Manager Approval</div>
            <div className="font-bold text-[#8A5A00] mt-0.5">2 In Review</div>
          </div>
          <div className="bg-[#F1F1ED] p-2.5 rounded-lg border-l-4 border-[#2A6CB0]">
            <div className="text-[#5C636F]">3. Treasury Check</div>
            <div className="font-bold text-[#2A6CB0] mt-0.5">1 Ready</div>
          </div>
          <div className="bg-[#F1F1ED] p-2.5 rounded-lg border-l-4 border-[#157A4D]">
            <div className="text-[#5C636F]">4. Funds Released</div>
            <div className="font-bold text-[#157A4D] mt-0.5">14 Cleared</div>
          </div>
        </div>
      </div>

      {/* Disbursements Queue */}
      <div className="bg-[#FFFFFF] border border-[#DFE1DB] rounded-xl overflow-hidden p-4 space-y-4">
        <div className="flex justify-between items-center border-b border-[#DFE1DB] pb-3">
          <h3 className="font-['Archivo'] font-bold text-base">Outflow Settlement Requests</h3>
          <button className="bg-[#B53A1E] text-white px-3 py-1.5 rounded-lg text-xs font-bold font-['IBM_Plex_Mono'] flex items-center space-x-1">
            <Plus className="h-3.5 w-3.5" />
            <span>New Payout Request</span>
          </button>
        </div>
        <table className="w-full text-left text-sm font-['IBM_Plex_Sans']">
          <thead className="bg-[#F1F1ED] text-[11px] font-bold font-['IBM_Plex_Mono'] text-[#5C636F] uppercase">
            <tr>
              <th className="p-3">Disbursement ID</th>
              <th className="p-3">Source &amp; Beneficiary</th>
              <th className="p-3">Payment Method</th>
              <th className="p-3 text-right">Amount (PHP)</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DFE1DB]">
            <tr>
              <td className="p-3 font-['IBM_Plex_Mono'] font-bold">DSB-2026-881</td>
              <td className="p-3">Team 4 Payroll System (Monthly Salary)</td>
              <td className="p-3 font-['IBM_Plex_Mono'] text-xs">Direct Bank Deposit</td>
              <td className="p-3 text-right font-['IBM_Plex_Mono'] font-bold">{formatPHP(480000)}</td>
              <td className="p-3 text-center">
                <span className="bg-[#157A4D]/10 text-[#157A4D] px-2 py-0.5 rounded text-xs font-bold">Released</span>
              </td>
              <td className="p-3 text-center">
                <button className="text-xs font-['IBM_Plex_Mono'] text-[#2A6CB0] underline">View Receipt</button>
              </td>
            </tr>
            <tr>
              <td className="p-3 font-['IBM_Plex_Mono'] font-bold">DSB-2026-882</td>
              <td className="p-3">Team 6 Supply Chain (PO-88421)</td>
              <td className="p-3 font-['IBM_Plex_Mono'] text-xs">Corporate Check #4091</td>
              <td className="p-3 text-right font-['IBM_Plex_Mono'] font-bold">{formatPHP(125000)}</td>
              <td className="p-3 text-center">
                <span className="bg-[#8A5A00]/10 text-[#8A5A00] px-2 py-0.5 rounded text-xs font-bold">Treasury Review</span>
              </td>
              <td className="p-3 text-center">
                <button className="bg-[#1A1D21] text-white px-2.5 py-1 rounded text-xs font-bold font-['IBM_Plex_Mono']">Approve</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
