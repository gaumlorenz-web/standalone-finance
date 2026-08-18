import React, { useState } from "react";
import {
  AlertTriangle,
  Plus,
  PiggyBank,
  Clock,
  UserCheck,
  Filter,
} from "lucide-react";

export default function AccountsReceivable() {
  // Sample AR Data (Customer/Guest Invoices)
  const arInvoices = [
    {
      id: "AR-2026-101",
      customer: "Grand Suite Folio #402 (Team 9)",
      refNo: "HTL-BK-9021",
      date: "2026-08-16",
      dueDate: "2026-08-16",
      amount: 34500.0,
      status: "Pending Collection",
      aging: "Current",
    },
    {
      id: "AR-2026-102",
      customer: "Corporate Event - Acme Corp",
      refNo: "EVT-2026-08",
      date: "2026-07-10",
      dueDate: "2026-08-10",
      amount: 150000.0,
      status: "Overdue",
      aging: "1-30 Days",
    },
    {
      id: "AR-2026-103",
      customer: "Restaurant POS Batch Drop (Team 10)",
      refNo: "POS-SHIFT-A",
      date: "2026-08-17",
      dueDate: "2026-08-17",
      amount: 62800.0,
      status: "Collected",
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
            TRANSACTION CORE / RECEIVABLES
          </span>
          <h1 className="text-2xl font-bold font-['Archivo'] text-[#1A1D21]">
            Accounts Receivable (AR) Management
          </h1>
        </div>
      </div>

      {/* Aging Schedule Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Current (0-30 Days)",
            amount: 97300.0,
            count: 2,
            type: "current",
          },
          {
            title: "Overdue (31-60 Days)",
            amount: 150000.0,
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
              Showing {arInvoices.length} entries
            </span>
          </div>

          {/* Primary Action Button */}
          <button className="bg-[#157A4D] hover:bg-[#105E3B] text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center space-x-2 shadow-sm">
            <Plus className="h-4 w-4" />
            <span>Issue Customer Invoice</span>
          </button>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F1F1ED] border-b border-[#DFE1DB] text-[11px] font-bold font-['IBM_Plex_Mono'] uppercase text-[#5C636F]">
              <tr>
                <th className="p-3">Invoice ID</th>
                <th className="p-3">Customer / Account</th>
                <th className="p-3">Ref Number</th>
                <th className="p-3">Issue Date</th>
                <th className="p-3">Due Date</th>
                <th className="p-3 text-right">Amount (PHP)</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Action Launcher</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFE1DB] font-['IBM_Plex_Sans']">
              {arInvoices.map((row) => (
                <tr key={row.id} className="hover:bg-[#F1F1ED]/50 transition-colors">
                  <td className="p-3 font-['IBM_Plex_Mono'] font-bold text-[#1A1D21]">
                    {row.id}
                  </td>
                  <td className="p-3 font-medium flex items-center space-x-2">
                    <UserCheck className="h-4 w-4 text-[#5C636F]" />
                    <span>{row.customer}</span>
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
                          : row.status === "Collected"
                          ? "bg-[#157A4D]/10 text-[#157A4D] border border-[#157A4D]/30"
                          : "bg-[#8A5A00]/10 text-[#8A5A00] border border-[#8A5A00]/30"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button className="bg-[#157A4D] hover:bg-[#105E3B] text-white px-3 py-1.5 rounded-md text-xs font-['IBM_Plex_Mono'] font-bold inline-flex items-center space-x-1 transition-colors">
                      <PiggyBank className="h-3 w-3 text-white" />
                      <span>Record Collection</span>
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
