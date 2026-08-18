import React from "react";
import {
  BookOpen,
  CreditCard,
  Receipt,
  Send,
  PiggyBank,
  TrendingUp,
  Landmark,
  BarChart3,
  FileSpreadsheet,
} from "lucide-react";

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="w-64 bg-[#FFFFFF] border-r border-[#DFE1DB] h-[calc(100vh-65px)] overflow-y-auto p-4 flex-shrink-0">
      <p className="text-[11px] font-bold font-['IBM_Plex_Mono'] uppercase text-[#5C636F] mb-3 px-2">
        Transaction Sub-Modules
      </p>
      <nav className="space-y-1">
        {[
          { id: "gl", label: "General Ledger", icon: BookOpen },
          { id: "ap", label: "Accounts Payable (AP)", icon: CreditCard },
          { id: "ar", label: "Accounts Receivable (AR)", icon: Receipt },
          { id: "disbursement", label: "Disbursement Management", icon: Send },
          { id: "collection", label: "Collection Management", icon: PiggyBank },
          { id: "budget", label: "Budget (AI Regression)", icon: TrendingUp },
          { id: "cash", label: "Cash Management", icon: Landmark },
          { id: "fpa", label: "Reporting & FP&A (Datarails)", icon: BarChart3 },
          { id: "tax", label: "Tax Management", icon: FileSpreadsheet },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#1A1D21] text-white"
                  : "text-[#5C636F] hover:bg-[#F1F1ED] hover:text-[#1A1D21]"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-[#FF6A3D]" : ""}`} />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
