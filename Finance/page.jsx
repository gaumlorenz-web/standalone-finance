'use client';

import { useState } from "react";
import { Landmark } from "lucide-react";
import Sidebar from "./components/Sidebar";
import GeneralLedger from "./components/GeneralLedger";
import AccountsPayable from "./components/AccountsPayable";
import AccountsReceivable from "./components/AccountsReceivable";
import Disbursement from "./components/Disbursement";
import Collection from "./components/Collection";
import Budget from "./components/Budget";
import CashManagement from "./components/CashManagement";
import FinancialReporting from "./components/FinancialReporting";
import TaxManagement from "./components/TaxManagement";

export default function FinancialManagementSystem() {
  const [activeTab, setActiveTab] = useState("gl");

  const renderModule = () => {
    switch (activeTab) {
      case "gl":
        return <GeneralLedger />;
      case "ap":
        return <AccountsPayable />;
      case "ar":
        return <AccountsReceivable />;
      case "disbursement":
        return <Disbursement />;
      case "collection":
        return <Collection />;
      case "budget":
        return <Budget />;
      case "cash":
        return <CashManagement />;
      case "fpa":
        return <FinancialReporting />;
      case "tax":
        return <TaxManagement />;
      default:
        return <GeneralLedger />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F1ED] text-[#1A1D21] font-sans antialiased">
      {/* Top Header */}
      <header className="bg-[#1A1D21] text-white px-6 py-4 border-b border-[#2A2E34] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-[#B53A1E] p-2 rounded-md">
            <Landmark className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-['Archivo'] tracking-wide">
              FINANCIAL MANAGEMENT SYSTEM
            </h1>
            <p className="text-xs text-[#A8AFB8] font-['IBM_Plex_Mono']">
              TRANSACTION CORE & AI PREDICTIVE ANALYTICS
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#157A4D]/20 text-[#35C98B] border border-[#157A4D]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#35C98B] mr-1.5 animate-pulse"></span>
            GL Core Engine Active
          </span>
        </div>
      </header>

      <div className="flex h-[calc(100vh-65px)]">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {renderModule()}
        </main>
      </div>
    </div>
  );
}