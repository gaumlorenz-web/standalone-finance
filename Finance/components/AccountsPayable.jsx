import React, { useState } from "react";
import {
  AlertTriangle,
  Plus,
  Send,
  Clock,
  Building2,
  Filter,
} from "lucide-react";

export default function AccountsPayable() {
  // Sample AP Data (Vendor Invoices)
  const apInvoices = [
    {
      id: "AP-2026-001",
      vendor: "Team 6 Supply Chain Corp",
      refNo: "PO-88421",
      date: "2026-08-10",
      dueDate: "2026-08-25",
      amount: 125000.0,
      status: "Unpaid",
      aging: "Current",
    },
    {
      id: "AP-2026-002",
      vendor: "Manila Power & Utilities",
      refNo: "UT-99102",
      date: "2026-07-15",
      dueDate: "2026-08-01",
      amount: 45200.5,
      status: "Overdue",
      aging: "1-30 Days",
    },
    {
      id: "AP-2026-003",
      vendor: "Global Hotel Amenities Inc.",
      refNo: "PO-88310",
      date: "2026-08-01",
      dueDate: "2026-08-30",
      amount: 88400.0,
      status: "Scheduled",
      aging: "Current",
    },
  ];

  // Helper function to format PHP currency
  const formatPHP = (val) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(val);

  return (
    <div className="min-h-screen bg-[#F1F1ED] text-[#1A1D21] font-sans space-y-6">
      {/* Top Header */}
      <div className="border-b border-[#DFE1DB] pb-4">
        <div>
          <span className="text-[11px] font-bold font-['IBM_Plex_Mono'] uppercase text-[#5C636F]">
            TRANSACTION CORE / PAYABLES
          </span>
          <h1 className="text-2xl font-bold font-['Archivo'] text-[#1A1D21]">
            Accounts Payable (AP) Management
          </h1>
        </div>
      </div>

      {/* Aging Schedule Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Current (0-30 Days)",
            amount: 213400.0,
            count: 2,
            type: "current",
          },
          {
            title: "Overdue (31-60 Days)",
            amount: 45200.5,
            count: 1,
            type: "warning",
          },
          {
            title: "Overdue (61-90 Days)",
            amount: 0.0,
            count: 0,
            type: "normal",
          },
          {
            title: "Critical (90+ Days)",
            amount: 0.0,
            count: 0,
            type: "danger",
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-[#FFFFFF] p-4 rounded-xl border border-[#DFE1DB] space-y-2 shadow-sm"
          >
            <div className="flex justify-between items-center text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
              <span>{item.title}</span>
              <Clock className="h-3.5 w-3.5" />
            </div>
            <div className="text-xl font-bold font-['IBM_Plex_Mono'] text-[#1A1D21]">
              {formatPHP(item.amount)}
            </div>
            <div className="text-xs text-[#5C636F] flex items-center justify-between">
              <span>{item.count} Invoices</span>
              {item.amount > 0 && item.type === "warning" && (
                <span className="text-[#B5281A] font-bold flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" /> Attention
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Main Data Table Section */}
      <div className="bg-[#FFFFFF] border border-[#DFE1DB] rounded-xl overflow-hidden shadow-sm space-y-4 p-4">
        {/* Action Controls & Filters */}
        <div className="flex flex-wrap justify-between items-center gap-4 border-b border-[#DFE1DB] pb-3">
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-1 text-xs font-['IBM_Plex_Mono'] font-bold bg-[#F1F1ED] px-3 py-2 rounded-lg border border-[#DFE1DB] text-[#5C636F] hover:text-[#1A1D21]">
              <Filter className="h-3.5 w-3.5" />
              <span>Filter Status</span>
            </button>
            <span className="text-xs text-[#5C636F] font-['IBM_Plex_Mono']">
              Showing {apInvoices.length} entries
            </span>
          </div>

          {/* Primary Action Button */}
          <button className="bg-[#B53A1E] hover:bg-[#8A2B15] text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center space-x-2 shadow-sm">
            <Plus className="h-4 w-4" />
            <span>Create Vendor Invoice</span>
          </button>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F1F1ED] border-b border-[#DFE1DB] text-[11px] font-bold font-['IBM_Plex_Mono'] uppercase text-[#5C636F]">
              <tr>
                <th className="p-3">Invoice ID</th>
                <th className="p-3">Vendor Name</th>
                <th className="p-3">Ref Number</th>
                <th className="p-3">Issue Date</th>
                <th className="p-3">Due Date</th>
                <th className="p-3 text-right">Amount (PHP)</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Action Launcher</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFE1DB] font-['IBM_Plex_Sans']">
              {apInvoices.map((row) => (
                <tr key={row.id} className="hover:bg-[#F1F1ED]/50 transition-colors">
                  <td className="p-3 font-['IBM_Plex_Mono'] font-bold text-[#1A1D21]">
                    {row.id}
                  </td>
                  <td className="p-3 font-medium flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-[#5C636F]" />
                    <span>{row.vendor}</span>
                  </td>
                  <td className="p-3 font-['IBM_Plex_Mono'] text-xs text-[#5C636F]">
                    {row.refNo}
                  </td>
                  <td className="p-3 font-['IBM_Plex_Mono'] text-xs">{row.date}</td>
                  <td className="p-3 font-['IBM_Plex_Mono'] text-xs">{row.dueDate}</td>
                  <td className="p-3 text-right font-['IBM_Plex_Mono'] font-bold text-[#1A1D21]">
                    {formatPHP(row.amount)}
                  </td>
                  <td className="p-3 text-center font-['IBM_Plex_Mono']">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        row.status === "Overdue"
                          ? "bg-[#B5281A]/10 text-[#B5281A] border border-[#B5281A]/30"
                          : row.status === "Scheduled"
                          ? "bg-[#8A5A00]/10 text-[#8A5A00] border border-[#8A5A00]/30"
                          : "bg-[#5C636F]/10 text-[#5C636F] border border-[#5C636F]/30"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button className="bg-[#1A1D21] hover:bg-[#2A2E34] text-white px-3 py-1.5 rounded-md text-xs font-['IBM_Plex_Mono'] font-bold inline-flex items-center space-x-1 transition-colors">
                      <Send className="h-3 w-3 text-[#FF6A3D]" />
                      <span>Request Payout</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
