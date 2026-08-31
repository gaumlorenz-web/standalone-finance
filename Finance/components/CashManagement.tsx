import React, { useState } from "react";
import { RefreshCw, ArrowUpRight, ArrowDownLeft, ShieldCheck, CheckCircle2 } from "lucide-react";
import PesoSign from "./PesoSign";
import ExportButton from "./ExportButton";

interface CashManagementProps {
  currentUser?: { role: string; name: string } | null;
  isDataMasked?: boolean;
  maskCurrency?: (val: number) => string;
  maskField?: (val: string, type: string) => string;
}

export default function CashManagement({
  currentUser,
  isDataMasked = false,
  maskCurrency = (val) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(val),
  maskField = (val) => val
}: CashManagementProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const formatPHP = (val: number) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP"
    }).format(val);

  const handleRefreshFeed = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  const getExportData = () => {
    return {
      title: "Cash Management & Treasury Liquidity Reconciliation Report",
      subtitle: "System Date: 2026-08-27 | HORECA Financial Suite",
      filename: `Cash_Management_Treasury_Reconciliation_2026`,
      headers: [
        "Vault Account",
        "Institution / Type",
        "Balance (PHP)",
        "Reconciliation Status",
        "Last Sync"
      ],
      rows: [
        ["Operating Commercial Account", "BDO Unibank (PESONet)", 2100000, "100% Reconciled", "2026-08-27 09:30 AM"],
        ["Petty Cash & Front Desk Float", "Physical Vault Tills", 745000, "Reconciled Daily", "2026-08-27 08:00 AM"],
        ["Digital Payment Gateway Clearing", "GCash / Maya Merchant", 420000, "Auto-Settled", "2026-08-27 09:45 AM"]
      ]
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#DFE1DB] pb-4">
        <div>
          <span className="text-[11px] font-bold font-['IBM_Plex_Mono'] uppercase text-[#5C636F]">
            TREASURY CORE / LIQUIDITY &amp; RECONCILIATION
          </span>
          <h1 className="text-2xl font-bold font-['Archivo'] text-[#1A1D21] mt-1">
            Cash Management &amp; Treasury
          </h1>
          <p className="text-xs text-[#5C636F]">
            Real-time multi-bank ledger synchronization and automated bank statement reconciliation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton getExportData={getExportData} buttonLabel="Export Treasury Audit" />
          <button
            onClick={handleRefreshFeed}
            className="bg-[#1A1D21] hover:bg-[#2A2E34] text-white px-3 py-1.5 rounded-lg text-xs font-bold font-['IBM_Plex_Mono'] flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-[#35C98B]" : ""}`} />
            <span>{isRefreshing ? "Syncing..." : "Fetch Bank Feed"}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards with Philippine Peso Icons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1A1D21] text-white p-5 rounded-xl border border-[#2A2E34] space-y-2 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-['IBM_Plex_Mono'] text-[#A8AFB8]">TOTAL CASH &amp; BANK LIQUIDITY</span>
            <PesoSign className="h-4 w-4 text-[#35C98B]" />
          </div>
          <div className="text-3xl font-bold font-['IBM_Plex_Mono'] text-[#35C98B]">
            {maskCurrency(2845000)}
          </div>
          <p className="text-[11px] text-[#A8AFB8]">Consolidated Treasury Position</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#DFE1DB] space-y-2 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">OPERATING BANK ACCOUNT</span>
            <PesoSign className="h-4 w-4 text-[#157A4D]" />
          </div>
          <div className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#1A1D21]">
            {maskCurrency(2100000)}
          </div>
          <p className="text-[11px] text-[#5C636F]">BDO Commercial PESONet</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#DFE1DB] space-y-2 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">PETTY CASH &amp; FLOAT ON HAND</span>
            <PesoSign className="h-4 w-4 text-[#8A5A00]" />
          </div>
          <div className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#1A1D21]">
            {maskCurrency(745000)}
          </div>
          <p className="text-[11px] text-[#5C636F]">Front Desk &amp; Restaurant Tills</p>
        </div>
      </div>

      {/* Bank Reconciliation Workspace */}
      <div className="bg-white border border-[#DFE1DB] rounded-xl p-5 space-y-4 shadow-xs">
        <div className="flex justify-between items-center border-b border-[#DFE1DB] pb-3">
          <div>
            <h3 className="font-['Archivo'] font-bold text-base">Bank Statement Reconciliation Workspace</h3>
            <p className="text-xs text-[#5C636F]">
              Live 2-way matching between internal General Ledger Cash accounts and electronic bank statements.
            </p>
          </div>
          <span className="text-xs font-['IBM_Plex_Mono'] text-[#157A4D] font-bold inline-flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4" /> Balanced &amp; Reconciled
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* System Ledger */}
          <div className="border border-[#DFE1DB] rounded-xl p-4 space-y-3 bg-[#F1F1ED]">
            <span className="text-xs font-['IBM_Plex_Mono'] font-bold text-[#5C636F]">
              INTERNAL SYSTEM LEDGER (GL ACCOUNT #{isDataMasked ? maskField("1010", "account") : "1010"})
            </span>
            <div className="bg-white p-3 rounded-lg border border-[#DFE1DB] flex justify-between items-center text-xs font-['IBM_Plex_Mono']">
              <div>
                <div className="font-bold text-[#1A1D21]">2026-08-25 | Vendor Settlement Payout</div>
                <div className="text-[#5C636F] text-[11px]">{isDataMasked ? `${maskField("PO-88421", "ref")} Wagyu Purveyor Wire` : "PO-88421 Wagyu Purveyor Wire"}</div>
              </div>
              <span className="font-bold text-[#B5281A]">({maskCurrency(125000)})</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-[#DFE1DB] flex justify-between items-center text-xs font-['IBM_Plex_Mono']">
              <div>
                <div className="font-bold text-[#1A1D21]">2026-08-26 | Hotel Guest Folio Batch</div>
                <div className="text-[#5C636F] text-[11px]">Terminal Settlement Batch #{isDataMasked ? maskField("9021", "account") : "9021"}</div>
              </div>
              <span className="font-bold text-[#157A4D]">+{maskCurrency(34500)}</span>
            </div>
          </div>

          {/* Bank Feed */}
          <div className="border border-[#DFE1DB] rounded-xl p-4 space-y-3 bg-[#F1F1ED]">
            <span className="text-xs font-['IBM_Plex_Mono'] font-bold text-[#5C636F]">
              IMPORTED BANK STATEMENT FEED (BDO API)
            </span>
            <div className="bg-white p-3 rounded-lg border border-[#DFE1DB] flex justify-between items-center text-xs font-['IBM_Plex_Mono']">
              <div>
                <div className="font-bold text-[#1A1D21]">2026-08-25 | OUTWARD PESONet {isDataMasked ? maskField("99201", "account") : "99201"}</div>
                <div className="text-[#157A4D] text-[11px] font-bold">MATCHED (Ref: {isDataMasked ? maskField("AP-2026-001", "ref") : "AP-2026-001"})</div>
              </div>
              <span className="font-bold text-[#B5281A]">({maskCurrency(125000)})</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-[#DFE1DB] flex justify-between items-center text-xs font-['IBM_Plex_Mono']">
              <div>
                <div className="font-bold text-[#1A1D21]">2026-08-26 | POS CARD SETTLEMENT CR</div>
                <div className="text-[#157A4D] text-[11px] font-bold">MATCHED (Ref: {isDataMasked ? maskField("AR-2026-101", "ref") : "AR-2026-101"})</div>
              </div>
              <span className="font-bold text-[#157A4D]">+{maskCurrency(34500)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
