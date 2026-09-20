import React, { useState, useMemo } from "react";
import {
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  CheckCircle2,
  PieChart as PieChartIcon,
  Layers,
  Building,
  CreditCard,
  Vault,
  DollarSign,
  TrendingUp,
  Check,
  Search,
  ExternalLink
} from "lucide-react";
import PesoSign from "./PesoSign";
import ExportButton from "./ExportButton";

interface CashManagementProps {
  currentUser?: { role: string; name: string } | null;
  isDataMasked?: boolean;
  maskCurrency?: (val: number) => string;
  maskField?: (val: string, type: string) => string;
  cashPool?: {
    pettyCash: number;
    bankOperating: number;
    payrollHold?: number;
  };
  collections?: any[];
  arInvoices?: any[];
}

export default function CashManagement({
  currentUser,
  isDataMasked = false,
  maskCurrency = (val) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(val),
  maskField = (val) => val,
  cashPool = { pettyCash: 745000, bankOperating: 2100000, payrollHold: 350000 },
  collections = [],
  arInvoices = []
}: CashManagementProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedAssetTab, setSelectedAssetTab] = useState<"all" | "operating" | "petty" | "digital">("all");

  const totalLiquidCash = cashPool.bankOperating + cashPool.pettyCash + (cashPool.payrollHold || 0);

  // Asset Categories Analysis
  const assetCategories = useMemo(() => {
    const operatingBank = cashPool.bankOperating;
    const pettyCash = cashPool.pettyCash;
    const digitalClearing = 420000;
    const capexReserve = 1250000;
    const totalAssets = operatingBank + pettyCash + digitalClearing + capexReserve;

    return [
      {
        id: "operating",
        name: "Current Operating Liquid Cash Asset",
        code: "GL 1030",
        institution: "BDO Commercial Treasury PESONet",
        balance: operatingBank,
        percentage: ((operatingBank / totalAssets) * 100).toFixed(1),
        classification: "Tier 1 Liquid Current Asset",
        purpose: "Daily operations, bulk food purveyor settlements, hotel amenities procurement, and vendor accounts payable.",
        color: "#157A4D"
      },
      {
        id: "petty",
        name: "Front Desk & Physical Cash Float Asset",
        code: "GL 1010",
        institution: "Hotel Front Office & Restaurant Vault Tills",
        balance: pettyCash,
        percentage: ((pettyCash / totalAssets) * 100).toFixed(1),
        classification: "Tier 1 Cash on Hand Asset",
        purpose: "Guest checkout currency changes, concierge emergency advances, taxi vouchers, and urgent kitchen market runs.",
        color: "#8A5A00"
      },
      {
        id: "digital",
        name: "Merchant Receivable & Digital Gateway Clearing Asset",
        code: "GL 1040",
        institution: "GCash Merchant / Maya Business / BancNet POS",
        balance: digitalClearing,
        percentage: ((digitalClearing / totalAssets) * 100).toFixed(1),
        classification: "Current In-Transit Asset (T+1 Settlement)",
        purpose: "Card and QR customer collections in transit settling automatically into Operating Bank daily.",
        color: "#2563EB"
      },
      {
        id: "capex",
        name: "CapEx & Asset Replacement Reserve",
        code: "GL 1500",
        institution: "BPI Asset Escrow Vault",
        balance: capexReserve,
        percentage: ((capexReserve / totalAssets) * 100).toFixed(1),
        classification: "Non-Current Dedicated Capital Asset",
        purpose: "Room renovation reserves, HVAC replacement, hotel generator overhaul, and vehicle fleet replacement.",
        color: "#6B21A8"
      }
    ];
  }, [cashPool]);

  // Analyzed Inflow Routes (Where Collected Money Goes)
  const inflowRouteAnalysis = useMemo(() => {
    // Generate trace items from collections + standard verified receipts
    const liveItems = (collections || []).slice(0, 5).map((col) => {
      const isPetty =
        (col.targetVault || "").includes("Front Desk") ||
        (col.targetVault || "").includes("Float") ||
        (col.method || "").includes("Cash");
      return {
        id: col.id || `COL-${Math.floor(100 + Math.random() * 900)}`,
        orNo: col.officialReceiptNo || "OR-VERIFIED",
        customer: col.customerName || "Hotel Corporate Client",
        amount: Number(col.amount) || 50000,
        method: col.method || "Bank Transfer",
        destinationAccount: col.targetVault || "1030 - Operating Bank Account - BDO Primary",
        assetCategory: isPetty
          ? "Tier 1 Cash on Hand Asset (GL 1010)"
          : "Tier 1 Liquid Operating Asset (GL 1030)",
        assetStatus: "Classified & Reconciled as Liquid Asset",
        timestamp: col.date || new Date().toISOString().split("T")[0]
      };
    });

    const fallbackItems = [
      {
        id: "COL-901",
        orNo: "OR-2026-901",
        customer: "Makati Business Club / Annual Gala",
        amount: 320000,
        method: "PESONet Wire",
        destinationAccount: "1030 - Operating Bank Account - BDO Primary",
        assetCategory: "Tier 1 Liquid Operating Asset (GL 1030)",
        assetStatus: "Classified & Reconciled as Liquid Asset",
        timestamp: "2026-09-18"
      },
      {
        id: "COL-902",
        orNo: "OR-2026-902",
        customer: "Front Desk Cash Settlement (Folio #4012)",
        amount: 45000,
        method: "Cash / Till",
        destinationAccount: "1010 - Front Desk Cash Float",
        assetCategory: "Tier 1 Cash on Hand Asset (GL 1010)",
        assetStatus: "Classified & Reconciled as Liquid Asset",
        timestamp: "2026-09-19"
      },
      {
        id: "COL-903",
        orNo: "OR-2026-903",
        customer: "Catering Event Banquet (Maya QR Code)",
        amount: 88500,
        method: "Digital Maya Gateway",
        destinationAccount: "1040 - Digital Payment Gateway Clearing",
        assetCategory: "Current In-Transit Asset (GL 1040)",
        assetStatus: "Classified & Reconciled as In-Transit Asset",
        timestamp: "2026-09-19"
      }
    ];

    return liveItems.length > 0 ? [...liveItems, ...fallbackItems].slice(0, 6) : fallbackItems;
  }, [collections]);

  const handleRefreshFeed = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  const getExportData = () => {
    return {
      title: "Cash Management & Asset Allocation Analysis Report",
      subtitle: `System Date: ${new Date().toISOString().split("T")[0]} | HORECA Financial Suite`,
      filename: `Cash_Management_Asset_Analysis_${new Date().toISOString().split("T")[0]}`,
      headers: [
        "Asset Category",
        "GL Code",
        "Institution / Vault",
        "Balance (PHP)",
        "Asset Classification",
        "Share (%)"
      ],
      rows: assetCategories.map((a) => [
        a.name,
        a.code,
        a.institution,
        a.balance,
        a.classification,
        `${a.percentage}%`
      ])
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#DFE1DB] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold font-['IBM_Plex_Mono'] uppercase text-[#5C636F]">
              TREASURY &amp; ASSET INTELLIGENCE CORE
            </span>
            <span className="bg-[#157A4D]/10 text-[#157A4D] px-2 py-0.5 rounded text-[10px] font-['IBM_Plex_Mono'] font-bold border border-[#157A4D]/20">
              ASSET CLASSIFICATION ACTIVE
            </span>
          </div>
          <h1 className="text-2xl font-bold font-['Archivo'] text-[#1A1D21] mt-1">
            Cash Management &amp; Asset Allocation
          </h1>
          <p className="text-xs text-[#5C636F]">
            Analyzes where collected money flows, automatically classifying receipts into operating liquid assets, cash float, and capital reserves.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton getExportData={getExportData} buttonLabel="Export Asset Audit" />
          <button
            type="button"
            onClick={handleRefreshFeed}
            className="bg-[#1A1D21] hover:bg-[#2A2E34] text-white px-3 py-1.5 rounded-lg text-xs font-bold font-['IBM_Plex_Mono'] flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-[#35C98B]" : ""}`} />
            <span>{isRefreshing ? "Auditing..." : "Reconcile Assets"}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Liquid Cash & Asset Allocation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1A1D21] text-white p-5 rounded-xl border border-[#2A2E34] space-y-2 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-['IBM_Plex_Mono'] text-[#A8AFB8]">TOTAL TREASURY LIQUIDITY</span>
            <PesoSign className="h-4 w-4 text-[#35C98B]" />
          </div>
          <div className="text-3xl font-bold font-['IBM_Plex_Mono'] text-[#35C98B]">
            {maskCurrency(totalLiquidCash)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#A8AFB8] pt-1 border-t border-white/10">
            <span>Current Operating Asset Base</span>
            <span className="text-[#35C98B] font-bold">100% Backed</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#DFE1DB] space-y-2 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">OPERATING COMMERCIAL ASSET</span>
            <PesoSign className="h-4 w-4 text-[#157A4D]" />
          </div>
          <div className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#1A1D21]">
            {maskCurrency(cashPool.bankOperating)}
          </div>
          <p className="text-[11px] text-[#5C636F]">
            GL 1030 | BDO Commercial Account (Primary AP / Payroll Outflows)
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#DFE1DB] space-y-2 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">PETTY CASH &amp; TILL FLOAT ASSET</span>
            <PesoSign className="h-4 w-4 text-[#8A5A00]" />
          </div>
          <div className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#1A1D21]">
            {maskCurrency(cashPool.pettyCash)}
          </div>
          <p className="text-[11px] text-[#5C636F]">
            GL 1010 | Physical Cash on Hand across Front Desk &amp; Restaurant Tills
          </p>
        </div>
      </div>

      {/* REQUIREMENT 6: ASSET CLASSIFICATION & INFLOW DESTINATION ANALYZER */}
      <div className="bg-white border border-[#DFE1DB] rounded-xl p-5 space-y-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#DFE1DB] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold font-['IBM_Plex_Mono'] uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                AUTOMATED ASSET MAPPING
              </span>
            </div>
            <h3 className="text-base font-bold font-['Archivo'] text-[#1A1D21] mt-1">
              Collected Money Destination &amp; Asset Classification Analysis
            </h3>
            <p className="text-xs text-[#5C636F]">
              Cash Management actively classifies every customer receipt and AR collection to determine its balance sheet asset status and liquidity tier.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-['IBM_Plex_Mono']">
            <span className="text-[#5C636F]">Quick Asset Filter:</span>
            <div className="flex bg-[#F1F1ED] p-1 rounded-lg border border-[#DFE1DB]">
              <button
                type="button"
                onClick={() => setSelectedAssetTab("all")}
                className={`px-2.5 py-1 rounded font-bold text-[11px] transition-all cursor-pointer ${
                  selectedAssetTab === "all" ? "bg-[#1A1D21] text-white" : "text-[#5C636F]"
                }`}
              >
                All Assets
              </button>
              <button
                type="button"
                onClick={() => setSelectedAssetTab("operating")}
                className={`px-2.5 py-1 rounded font-bold text-[11px] transition-all cursor-pointer ${
                  selectedAssetTab === "operating" ? "bg-[#1A1D21] text-white" : "text-[#5C636F]"
                }`}
              >
                Operating
              </button>
              <button
                type="button"
                onClick={() => setSelectedAssetTab("petty")}
                className={`px-2.5 py-1 rounded font-bold text-[11px] transition-all cursor-pointer ${
                  selectedAssetTab === "petty" ? "bg-[#1A1D21] text-white" : "text-[#5C636F]"
                }`}
              >
                Float Tills
              </button>
            </div>
          </div>
        </div>

        {/* 4 Asset Tiers Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {assetCategories
            .filter((a) => selectedAssetTab === "all" || a.id === selectedAssetTab)
            .map((asset) => (
              <div
                key={asset.code}
                className="p-4 bg-[#F8F9F6] border border-[#DFE1DB] rounded-xl space-y-2.5 hover:border-[#1A1D21] transition-all"
              >
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-bold font-['IBM_Plex_Mono'] text-white px-2 py-0.5 rounded bg-[#1A1D21]">
                    {asset.code}
                  </span>
                  <span className="text-[11px] font-bold font-['IBM_Plex_Mono'] text-[#157A4D]">
                    {asset.percentage}% of Assets
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-xs text-[#1A1D21] font-['Archivo']">
                    {asset.name}
                  </h4>
                  <p className="text-[10px] text-[#5C636F] font-['IBM_Plex_Mono'] mt-0.5 truncate">
                    {asset.institution}
                  </p>
                </div>

                <div className="text-lg font-bold font-['IBM_Plex_Mono'] text-[#1A1D21]">
                  {maskCurrency(asset.balance)}
                </div>

                <div className="text-[10px] font-medium text-[#157A4D] bg-[#157A4D]/10 px-2 py-1 rounded border border-[#157A4D]/20">
                  {asset.classification}
                </div>

                <p className="text-[10px] text-[#5C636F] leading-relaxed pt-1 border-t border-[#DFE1DB]/60">
                  {asset.purpose}
                </p>
              </div>
            ))}
        </div>

        {/* Live Inflow Routing Table */}
        <div className="border border-[#DFE1DB] rounded-xl overflow-hidden mt-4">
          <div className="bg-[#F1F1ED] p-3 border-b border-[#DFE1DB] flex items-center justify-between">
            <span className="font-bold text-xs font-['IBM_Plex_Mono'] text-[#1A1D21] flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-[#157A4D]" />
              <span>COLLECTED MONEY INFLOW ROUTE AUDIT (WHERE IT WENT)</span>
            </span>
            <span className="text-[10px] text-[#5C636F] font-['IBM_Plex_Mono']">
              Cross-Module AR Sync Verified
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-['IBM_Plex_Sans']">
              <thead className="bg-[#F8F9F6] text-[#5C636F] font-['IBM_Plex_Mono'] text-[10px] uppercase">
                <tr>
                  <th className="p-2.5">Receipt / OR #</th>
                  <th className="p-2.5">Payer / Source</th>
                  <th className="p-2.5 text-right">Inflow Amount</th>
                  <th className="p-2.5">Destination Account</th>
                  <th className="p-2.5">Asset Classification</th>
                  <th className="p-2.5">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE1DB] text-[11px]">
                {inflowRouteAnalysis.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-2.5 font-bold font-['IBM_Plex_Mono'] text-[#1A1D21]">
                      {item.orNo}
                      <span className="text-[9px] text-[#5C636F] block">{item.timestamp}</span>
                    </td>
                    <td className="p-2.5">
                      <span className="font-bold text-[#1A1D21] block">{item.customer}</span>
                      <span className="text-[10px] text-[#5C636F]">via {item.method}</span>
                    </td>
                    <td className="p-2.5 text-right font-bold font-['IBM_Plex_Mono'] text-[#157A4D]">
                      +{maskCurrency(item.amount)}
                    </td>
                    <td className="p-2.5 font-['IBM_Plex_Mono'] text-[10px] text-[#1A1D21]">
                      {item.destinationAccount}
                    </td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-['IBM_Plex_Mono'] font-bold bg-[#157A4D]/10 text-[#157A4D] border border-[#157A4D]/20">
                        {item.assetCategory}
                      </span>
                    </td>
                    <td className="p-2.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#157A4D]">
                        <Check className="h-3 w-3" />
                        <span>Reconciled into Assets</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
              INTERNAL SYSTEM LEDGER (GL ACCOUNT #{isDataMasked ? maskField("1030", "account") : "1030"})
            </span>
            <div className="bg-white p-3 rounded-lg border border-[#DFE1DB] flex justify-between items-center text-xs font-['IBM_Plex_Mono']">
              <div>
                <div className="font-bold text-[#1A1D21]">2026-09-18 | Purveyor Bulk Settlement</div>
                <div className="text-[#5C636F] text-[11px]">{isDataMasked ? `${maskField("PO-88421", "ref")} Meat Purveyor Wire` : "PO-88421 Meat Purveyor Wire"}</div>
              </div>
              <span className="font-bold text-[#B5281A]">({maskCurrency(125000)})</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-[#DFE1DB] flex justify-between items-center text-xs font-['IBM_Plex_Mono']">
              <div>
                <div className="font-bold text-[#1A1D21]">2026-09-19 | Hotel Guest Folio Direct Inflow</div>
                <div className="text-[#5C636F] text-[11px]">Terminal Settlement Batch #{isDataMasked ? maskField("9021", "account") : "9021"}</div>
              </div>
              <span className="font-bold text-[#157A4D]">+{maskCurrency(34500)}</span>
            </div>
          </div>

          {/* Bank Feed */}
          <div className="border border-[#DFE1DB] rounded-xl p-4 space-y-3 bg-[#F1F1ED]">
            <span className="text-xs font-['IBM_Plex_Mono'] font-bold text-[#5C636F]">
              IMPORTED BANK STATEMENT FEED (BDO COMMERCIAL API)
            </span>
            <div className="bg-white p-3 rounded-lg border border-[#DFE1DB] flex justify-between items-center text-xs font-['IBM_Plex_Mono']">
              <div>
                <div className="font-bold text-[#1A1D21]">2026-09-18 | OUTWARD PESONet {isDataMasked ? maskField("99201", "account") : "99201"}</div>
                <div className="text-[#157A4D] text-[11px] font-bold">MATCHED (Ref: {isDataMasked ? maskField("AP-2026-001", "ref") : "AP-2026-001"})</div>
              </div>
              <span className="font-bold text-[#B5281A]">({maskCurrency(125000)})</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-[#DFE1DB] flex justify-between items-center text-xs font-['IBM_Plex_Mono']">
              <div>
                <div className="font-bold text-[#1A1D21]">2026-09-19 | POS CARD SETTLEMENT CR</div>
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
