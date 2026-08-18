import React from "react";

export default function TaxManagement() {
  const formatPHP = (val) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(val);

  return (
    <div className="space-y-6">
      <span className="text-[11px] font-bold font-['IBM_Plex_Mono'] uppercase text-[#5C636F]">
            COMPLIANCE CORE / TAXATION
          </span>
          <h1 className="text-2xl font-bold font-['Archivo'] text-[#1A1D21]">
            Tax Management
          </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#DFE1DB]">
          <span className="text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">NET OUTPUT VAT PAYABLE (12%)</span>
          <div className="text-2xl font-bold font-['IBM_Plex_Mono'] mt-1 text-[#B5281A]">{formatPHP(34200)}</div>
        </div>
        <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#DFE1DB]">
          <span className="text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">ACCUMULATED INPUT VAT CREDITS</span>
          <div className="text-2xl font-bold font-['IBM_Plex_Mono'] mt-1 text-[#157A4D]">{formatPHP(18400)}</div>
        </div>
        <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#DFE1DB]">
          <span className="text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">LODGING TAX LIABILITY (5%)</span>
          <div className="text-2xl font-bold font-['IBM_Plex_Mono'] mt-1 text-[#B5281A]">{formatPHP(12150)}</div>
        </div>
      </div>

      <div className="bg-[#FFFFFF] border border-[#DFE1DB] rounded-xl overflow-hidden p-4 space-y-4">
        <div className="flex justify-between items-center border-b border-[#DFE1DB] pb-3">
          <h3 className="font-['Archivo'] font-bold text-base">Taxable Transaction Computation Log</h3>
          <button className="bg-[#1A1D21] text-white px-3 py-1.5 rounded-lg text-xs font-bold font-['IBM_Plex_Mono']">
            Generate BIR/Tax Compliance Report
          </button>
        </div>
        <table className="w-full text-left text-sm font-['IBM_Plex_Sans']">
          <thead className="bg-[#F1F1ED] text-[11px] font-bold font-['IBM_Plex_Mono'] text-[#5C636F] uppercase">
            <tr>
              <th className="p-3">Record ID</th>
              <th className="p-3">Tax Type</th>
              <th className="p-3 text-right">Taxable Base (PHP)</th>
              <th className="p-3 text-right">Applied Rate</th>
              <th className="p-3 text-right">Computed Tax (PHP)</th>
              <th className="p-3 text-center">Filing Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DFE1DB] font-['IBM_Plex_Mono']">
            <tr>
              <td className="p-3 font-bold">TAX-2026-01</td>
              <td className="p-3 font-['IBM_Plex_Sans']">Output VAT (Sales)</td>
              <td className="p-3 text-right">{formatPHP(285000)}</td>
              <td className="p-3 text-right">12%</td>
              <td className="p-3 text-right font-bold text-[#B5281A]">{formatPHP(34200)}</td>
              <td className="p-3 text-center">
                <span className="bg-[#8A5A00]/10 text-[#8A5A00] px-2 py-0.5 rounded text-xs font-bold">Accrued</span>
              </td>
            </tr>
            <tr>
              <td className="p-3 font-bold">TAX-2026-02</td>
              <td className="p-3 font-['IBM_Plex_Sans']">Input VAT (Purchases)</td>
              <td className="p-3 text-right">{formatPHP(153333.33)}</td>
              <td className="p-3 text-right">12%</td>
              <td className="p-3 text-right font-bold text-[#157A4D]">{formatPHP(18400)}</td>
              <td className="p-3 text-center">
                <span className="bg-[#157A4D]/10 text-[#157A4D] px-2 py-0.5 rounded text-xs font-bold">Claimable Credit</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
