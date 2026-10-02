import React, { useState, useEffect } from "react";
import {
  Boxes,
  FileText,
  DollarSign,
  Receipt,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  ArrowRight,
  TrendingDown,
  Building,
  Send,
  Printer,
  Sparkles,
  ClipboardList,
  ShieldCheck,
  PackageCheck
} from "lucide-react";
import { fmsBridge, FmsPacket } from "../../src/services/fmsBridge";
import SubsystemDisbursementSection from "../../src/components/SubsystemDisbursementSection";

interface PurveyorInvoiceItem {
  id: string;
  vendor: string;
  tin: string;
  poNumber: string;
  amount: number;
  category: string;
  paymentTerms: string;
  matchStatus: string;
  ewtRate: number;
  ewtAmount: number;
  netPayable: number;
  dueDate: string;
}

const INITIAL_PURVEYOR_INVOICES: PurveyorInvoiceItem[] = [
  {
    id: "INV-SC-8821",
    vendor: "HighSeas Meat & Seafood Corp",
    tin: "123-456-789-000",
    poNumber: "PO-2026-441",
    amount: 120000,
    category: "F&B Provisions - Frozen Meat & Seafood",
    paymentTerms: "Net 30 Days",
    matchStatus: "3-Way Match Verified (PO+DR+Inv)",
    ewtRate: 0.01,
    ewtAmount: 1200,
    netPayable: 118800,
    dueDate: "2026-09-30",
  },
  {
    id: "INV-SC-8822",
    vendor: "Global Prime Dairy & Cold Storage",
    tin: "987-654-321-000",
    poNumber: "PO-2026-442",
    amount: 65000,
    category: "Dairy, Cheeses & Cold Cuts",
    paymentTerms: "Net 30 Days",
    matchStatus: "3-Way Match Verified (PO+DR+Inv)",
    ewtRate: 0.01,
    ewtAmount: 650,
    netPayable: 64350,
    dueDate: "2026-10-05",
  },
  {
    id: "INV-SC-8823",
    vendor: "EcoSan Industrial Chemicals & Linens",
    tin: "441-209-912-000",
    poNumber: "PO-2026-445",
    amount: 45000,
    category: "Housekeeping & Kitchen Sanitization",
    paymentTerms: "Net 30 Days",
    matchStatus: "3-Way Match Verified (PO+DR+Inv)",
    ewtRate: 0.01,
    ewtAmount: 450,
    netPayable: 44550,
    dueDate: "2026-10-12",
  },
];

interface SimpleDashboardProps {
  onNavigateToFms?: (tab?: string) => void;
}

export default function SimpleDashboard({ onNavigateToFms }: SimpleDashboardProps) {
  const [activeTab, setActiveTab] = useState<"purveyor_ap" | "bir_2307" | "inventory_adjustment" | "disbursements">("purveyor_ap");
  const [invoices, setInvoices] = useState<PurveyorInvoiceItem[]>(INITIAL_PURVEYOR_INVOICES);

  // TAB 1: New Purveyor Invoice Form State
  const [newVendor, setNewVendor] = useState("HighSeas Meat & Seafood Corp");
  const [newTin, setNewTin] = useState("123-456-789-000");
  const [newAmount, setNewAmount] = useState<number>(120000);
  const [newCategory, setNewCategory] = useState("F&B Provisions - Frozen Meat & Seafood");
  const [newEwtRate, setNewEwtRate] = useState<number>(0.01); // 1% goods
  const calculatedEwt = Math.round(newAmount * newEwtRate);
  const calculatedNetPayable = newAmount - calculatedEwt;

  // TAB 2: BIR Form 2307 State
  const [birSelectedVendor, setBirSelectedVendor] = useState(INITIAL_PURVEYOR_INVOICES[0]);
  const [birAtcCode, setBirAtcCode] = useState("WC158 (1% Goods & Provisions)");
  const [birQuarter, setBirQuarter] = useState("Q3 - Fiscal Year 2026");
  const [generated2307List, setGenerated2307List] = useState<any[]>([
    {
      id: "2307-2026-001",
      payee: "HighSeas Meat & Seafood Corp",
      tin: "123-456-789-000",
      atc: "WC158",
      taxBase: 120000,
      withheld: 1200,
      quarter: "Q3 2026",
      status: "Remitted / Generated",
    },
  ]);

  // TAB 3: Inventory Asset Adjustment State
  const [adjustmentType, setAdjustmentType] = useState<"RECEIPT" | "SPOILAGE_WRITE_OFF">("SPOILAGE_WRITE_OFF");
  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(6800);
  const [adjustmentReason, setAdjustmentReason] = useState<string>("Spoilage write-off: Kitchen chiller compressor failure");
  const [inventoryGlBalance, setInventoryGlBalance] = useState<number>(820000); // Account 1300

  // FMS Interop State
  const [fmsStatus, setFmsStatus] = useState<any>(fmsBridge.getCurrentFmsMetrics());
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [transmissionLogs, setTransmissionLogs] = useState<FmsPacket[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTransmissionLogs(fmsBridge.getTransmissionLogs("Supply-Chain"));
    const handleSync = () => {
      setTransmissionLogs(fmsBridge.getTransmissionLogs("Supply-Chain"));
      setFmsStatus(fmsBridge.getCurrentFmsMetrics());
    };
    window.addEventListener("fms-sync-event", handleSync);
    return () => window.removeEventListener("fms-sync-event", handleSync);
  }, []);

  // Totals for Purveyor AP
  const totalApGross = invoices.reduce((s, i) => s + i.amount, 0);
  const totalEwtAccrued = invoices.reduce((s, i) => s + i.ewtAmount, 0);
  const totalNetApPayable = invoices.reduce((s, i) => s + i.netPayable, 0);

  // ACTION 1: 30-Day Purveyor Invoice Logging
  const handleLogPurveyorInvoice = () => {
    setIsSubmitting(true);
    const invoiceId = `INV-SC-${Math.floor(1000 + Math.random() * 9000)}`;

    const newInv: PurveyorInvoiceItem = {
      id: invoiceId,
      vendor: newVendor,
      tin: newTin,
      poNumber: `PO-2026-${Math.floor(100 + Math.random() * 900)}`,
      amount: newAmount,
      category: newCategory,
      paymentTerms: "Net 30 Days",
      matchStatus: "3-Way Match Verified (PO+DR+Inv)",
      ewtRate: newEwtRate,
      ewtAmount: calculatedEwt,
      netPayable: calculatedNetPayable,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    };

    setInvoices([newInv, ...invoices]);

    // 1. Push to FMS Accounts Payable
    fmsBridge.pushApInvoice({
      sourceModule: "Supply-Chain",
      vendor: newInv.vendor,
      tin: newInv.tin,
      amount: newInv.netPayable,
      category: newInv.category,
      paymentTerms: newInv.paymentTerms,
      dueDate: newInv.dueDate,
      ewtRate: newInv.ewtRate,
      ewtAmount: newInv.ewtAmount,
      poNumber: newInv.poNumber,
    });

    // 2. Post Balanced GL Entry: Debit 1300 Inventory Asset, Credit 2010 AP, Credit 2140 Withholding Tax
    fmsBridge.postJournalEntry({
      sourceModule: "Supply-Chain",
      ref: invoiceId,
      memo: `Purveyor Invoice ${invoiceId}: ${newInv.vendor} (30-Day AP with 1% EWT)`,
      lines: [
        {
          accountCode: "1300",
          accountName: "1300 - Inventory Asset (Food & Beverage Stock)",
          debit: newInv.amount,
          credit: 0,
          memo: `Inventory stock receipt from ${newInv.vendor}`,
        },
        {
          accountCode: "2010",
          accountName: "2010 - Trade Accounts Payable (Net Purveyor Liability)",
          debit: 0,
          credit: newInv.netPayable,
          memo: `Net payable to vendor under Net 30 Terms`,
        },
        {
          accountCode: "2140",
          accountName: "2140 - Expanded Withholding Tax Payable (BIR Form 1601-EQ)",
          debit: 0,
          credit: newInv.ewtAmount,
          memo: `1% Creditable Withholding Tax (ATC WC158)`,
        },
      ],
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setActionSuccessMessage(
        `Purveyor Invoice [${invoiceId}] logged! Net AP of ₱${newInv.netPayable.toLocaleString()} and 1% EWT (₱${newInv.ewtAmount.toLocaleString()}) booked to FMS Accounts Payable & GL.`
      );
      setFmsStatus(fmsBridge.getCurrentFmsMetrics());
    }, 400);
  };

  // ACTION 2: BIR Form 2307 Generation
  const handleGenerateBir2307 = () => {
    setIsSubmitting(true);
    const formId = `2307-${Date.now().toString().slice(-4)}`;

    const newRecord = {
      id: formId,
      payee: birSelectedVendor.vendor,
      tin: birSelectedVendor.tin,
      atc: birAtcCode.split(" ")[0],
      taxBase: birSelectedVendor.amount,
      withheld: birSelectedVendor.ewtAmount,
      quarter: birQuarter,
      status: "Generated / Remitted",
    };

    setGenerated2307List([newRecord, ...generated2307List]);

    // Send to FMS Tax Management Module
    fmsBridge.addBirTaxRecord({
      formType: "BIR Form 2307",
      payeeName: birSelectedVendor.vendor,
      payeeTin: birSelectedVendor.tin,
      atcCode: birAtcCode,
      taxBase: birSelectedVendor.amount,
      taxWithheld: birSelectedVendor.ewtAmount,
      quarter: birQuarter,
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setActionSuccessMessage(
        `BIR Form 2307 Certificate [${formId}] generated for ${birSelectedVendor.vendor}! Synced with FMS Tax Management.`
      );
      setFmsStatus(fmsBridge.getCurrentFmsMetrics());
    }, 400);
  };

  // ACTION 3: Inventory Asset Adjustment in General Ledger
  const handleCommitInventoryAdjustment = () => {
    setIsSubmitting(true);
    const adjRef = `ADJ-INV-${Date.now().toString().slice(-4)}`;

    const isSpoilage = adjustmentType === "SPOILAGE_WRITE_OFF";
    const delta = isSpoilage ? -adjustmentAmount : adjustmentAmount;
    setInventoryGlBalance((prev) => prev + delta);

    if (isSpoilage) {
      // Debit Spoilage Expense 5020, Credit Inventory Asset 1300
      fmsBridge.postJournalEntry({
        sourceModule: "Supply-Chain",
        ref: adjRef,
        memo: `Kitchen Waste & Spoilage Write-Off: ${adjustmentReason}`,
        lines: [
          {
            accountCode: "5020",
            accountName: "5020 - Kitchen Waste, Spoilage & Damaged Goods Expense",
            debit: adjustmentAmount,
            credit: 0,
            memo: `Spoilage loss write-off`,
          },
          {
            accountCode: "1300",
            accountName: "1300 - Inventory Asset (Food & Beverage Stock)",
            debit: 0,
            credit: adjustmentAmount,
            memo: `Credit inventory asset write-down`,
          },
        ],
      });
    } else {
      // Goods Receipt: Debit Inventory Asset 1300, Credit Accounts Payable 2010
      fmsBridge.postJournalEntry({
        sourceModule: "Supply-Chain",
        ref: adjRef,
        memo: `Goods Receipt Stock Inflow Adjustment: ${adjustmentReason}`,
        lines: [
          {
            accountCode: "1300",
            accountName: "1300 - Inventory Asset (Food & Beverage Stock)",
            debit: adjustmentAmount,
            credit: 0,
            memo: `Stock receipt valuation increment`,
          },
          {
            accountCode: "2010",
            accountName: "2010 - Trade Accounts Payable (Goods Invoiced)",
            debit: 0,
            credit: adjustmentAmount,
            memo: `Liability accrual for received inventory`,
          },
        ],
      });
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setActionSuccessMessage(
        `Inventory Adjustment [${adjRef}] committed to FMS GL! Asset Account 1300 balance updated to ₱${(inventoryGlBalance + delta).toLocaleString()}.`
      );
      setFmsStatus(fmsBridge.getCurrentFmsMetrics());
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1D21] p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="bg-amber-600 text-white p-3 rounded-xl shadow-md">
              <Boxes className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Subsystem 04 / Operational Module
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  FMS Live Connected
                </span>
              </div>
              <h1 className="text-2xl font-black font-['Archivo'] tracking-tight text-slate-900 mt-1">
                Supply Chain &amp; Purveyor Procurement
              </h1>
              <p className="text-xs text-slate-500 font-['IBM_Plex_Mono']">
                30-Day Purveyor Invoicing, BIR Form 2307 EWT Automation &amp; Real-Time Inventory Asset Adjustments
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onNavigateToFms && (
              <button
                onClick={() => onNavigateToFms("ap")}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold font-['IBM_Plex_Mono'] rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <span>View FMS Accounts Payable</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Success Alert Banner */}
        {actionSuccessMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-xl text-xs font-['IBM_Plex_Mono'] flex items-start justify-between shadow-xs animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold">FMS Interoperability Sync Confirmed:</span> {actionSuccessMessage}
              </div>
            </div>
            <button
              onClick={() => setActionSuccessMessage(null)}
              className="text-emerald-700 hover:text-emerald-950 font-bold ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
              <span>Gross Purveyor Invoices</span>
              <DollarSign className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black font-['IBM_Plex_Mono'] text-slate-900 mt-2">
              ₱{totalApGross.toLocaleString()}
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-['IBM_Plex_Mono']">
              <span>Net 30 Payment Terms</span>
              <span className="text-amber-700 font-bold">{invoices.length} Purveyor POs</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
              <span>Calculated EWT (1% Goods)</span>
              <FileText className="h-4 w-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-black font-['IBM_Plex_Mono'] text-indigo-700 mt-2">
              ₱{totalEwtAccrued.toLocaleString()}
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-['IBM_Plex_Mono']">
              <span>BIR Form 2307 / 1601-EQ</span>
              <span className="text-indigo-700 font-bold">ATC WC158</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
              <span>Net Trade AP Payable</span>
              <Receipt className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black font-['IBM_Plex_Mono'] text-emerald-700 mt-2">
              ₱{totalNetApPayable.toLocaleString()}
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-['IBM_Plex_Mono']">
              <span>After 1% EWT Withheld</span>
              <span className="text-emerald-700 font-bold">Account 2010</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
              <span>Inventory Asset Balance</span>
              <PackageCheck className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black font-['IBM_Plex_Mono'] text-slate-900 mt-2">
              ₱{inventoryGlBalance.toLocaleString()}
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-['IBM_Plex_Mono']">
              <span>GL Account 1300</span>
              <span className="text-blue-700 font-bold">Live Asset Ledger</span>
            </div>
          </div>
        </div>

        {/* Action Tabs Header */}
        <div className="flex border-b border-slate-200 gap-2">
          <button
            onClick={() => setActiveTab("purveyor_ap")}
            className={`px-4 py-2.5 text-xs font-bold font-['IBM_Plex_Mono'] rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "purveyor_ap"
                ? "bg-white text-amber-700 border-t-2 border-amber-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Receipt className="h-3.5 w-3.5" />
            <span>1. 30-Day Purveyor Invoice Logging</span>
          </button>

          <button
            onClick={() => setActiveTab("bir_2307")}
            className={`px-4 py-2.5 text-xs font-bold font-['IBM_Plex_Mono'] rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "bir_2307"
                ? "bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>2. BIR Form 2307 Generation</span>
          </button>

          <button
            onClick={() => setActiveTab("inventory_adjustment")}
            className={`px-4 py-2.5 text-xs font-bold font-['IBM_Plex_Mono'] rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "inventory_adjustment"
                ? "bg-white text-emerald-700 border-t-2 border-emerald-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Boxes className="h-3.5 w-3.5" />
            <span>3. Inventory Asset Adjustment</span>
          </button>

          <button
            onClick={() => setActiveTab("disbursements")}
            className={`px-4 py-2.5 text-xs font-bold font-['IBM_Plex_Mono'] rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "disbursements"
                ? "bg-white text-amber-700 border-t-2 border-amber-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>4. Invoiced Disbursements &amp; Receipts</span>
          </button>
        </div>

        {/* TAB 1: 30-DAY PURVEYOR INVOICE LOGGING */}
        {activeTab === "purveyor_ap" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-200 gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-['Archivo']">
                  30-Day Purveyor Invoice Logging &amp; 1% EWT Accrual
                </h2>
                <p className="text-xs text-slate-500 font-['IBM_Plex_Mono'] mt-0.5">
                  Receives vendor invoices matched against POs and Delivery Receipts, automatically calculating Expanded Withholding Tax (EWT) and posting to FMS Accounts Payable.
                </p>
              </div>
              <button
                onClick={handleLogPurveyorInvoice}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold font-['IBM_Plex_Mono'] rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span>Log AP Invoice &amp; Post to FMS</span>
              </button>
            </div>

            {/* Quick Logging Form */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500 font-['IBM_Plex_Mono'] block mb-1">
                  Purveyor / Vendor
                </label>
                <input
                  type="text"
                  value={newVendor}
                  onChange={(e) => setNewVendor(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold font-['IBM_Plex_Mono']"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500 font-['IBM_Plex_Mono'] block mb-1">
                  Vendor Tax TIN
                </label>
                <input
                  type="text"
                  value={newTin}
                  onChange={(e) => setNewTin(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-['IBM_Plex_Mono']"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500 font-['IBM_Plex_Mono'] block mb-1">
                  Gross Invoice Amount (₱)
                </label>
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold font-['IBM_Plex_Mono']"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500 font-['IBM_Plex_Mono'] block mb-1">
                  Calculated 1% EWT &amp; Net
                </label>
                <div className="text-xs font-['IBM_Plex_Mono'] font-bold text-slate-900 pt-1.5">
                  EWT: <span className="text-indigo-600">₱{calculatedEwt.toLocaleString()}</span> | Net: <span className="text-emerald-700">₱{calculatedNetPayable.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Invoices Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-['IBM_Plex_Mono']">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <th className="py-2.5 px-3">Invoice / PO</th>
                    <th className="py-2.5 px-3">Purveyor Name &amp; TIN</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Terms &amp; 3-Way Match</th>
                    <th className="py-2.5 px-3 text-right">Gross (₱)</th>
                    <th className="py-2.5 px-3 text-right text-indigo-700">1% EWT</th>
                    <th className="py-2.5 px-3 text-right font-bold text-emerald-800">Net AP Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-slate-800">
                        {inv.id}
                        <span className="text-[10px] text-slate-400 block font-normal">{inv.poNumber}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-slate-900 block">{inv.vendor}</span>
                        <span className="text-[10px] text-slate-400">TIN: {inv.tin}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{inv.category}</td>
                      <td className="py-2.5 px-3">
                        <span className="text-slate-800 font-bold block">{inv.paymentTerms}</span>
                        <span className="text-[10px] text-emerald-700">{inv.matchStatus}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">₱{inv.amount.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right text-indigo-700">-₱{inv.ewtAmount.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-black text-emerald-800 bg-emerald-50/40">
                        ₱{inv.netPayable.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: BIR FORM 2307 GENERATION */}
        {activeTab === "bir_2307" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-200 gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-['Archivo']">
                  BIR Form 2307 (Certificate of Creditable Tax Withheld)
                </h2>
                <p className="text-xs text-slate-500 font-['IBM_Plex_Mono'] mt-0.5">
                  Generates statutory withholding certificates for suppliers upon invoice settlement and syncs them into the FMS Tax Management register.
                </p>
              </div>
              <button
                onClick={handleGenerateBir2307}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold font-['IBM_Plex_Mono'] rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <Printer className="h-4 w-4" />
                <span>Auto-Generate BIR Form 2307 Certificate</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <label className="text-xs font-bold font-['IBM_Plex_Mono'] text-slate-600 uppercase block mb-1">
                  Select Purveyor Payee
                </label>
                <select
                  value={birSelectedVendor.id}
                  onChange={(e) => {
                    const match = invoices.find((i) => i.id === e.target.value);
                    if (match) setBirSelectedVendor(match);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold font-['IBM_Plex_Mono']"
                >
                  {invoices.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.vendor} (₱{i.amount.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <label className="text-xs font-bold font-['IBM_Plex_Mono'] text-slate-600 uppercase block mb-1">
                  Alphanumeric Tax Code (ATC)
                </label>
                <input
                  type="text"
                  value={birAtcCode}
                  onChange={(e) => setBirAtcCode(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold font-['IBM_Plex_Mono']"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <label className="text-xs font-bold font-['IBM_Plex_Mono'] text-slate-600 uppercase block mb-1">
                  Filing Period / Quarter
                </label>
                <input
                  type="text"
                  value={birQuarter}
                  onChange={(e) => setBirQuarter(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold font-['IBM_Plex_Mono']"
                />
              </div>
            </div>

            {/* Visual 2307 Certificate Preview */}
            <div className="p-5 bg-indigo-50/50 border border-indigo-200 rounded-xl space-y-3 font-['IBM_Plex_Mono'] text-xs">
              <div className="flex items-center justify-between border-b border-indigo-200 pb-2">
                <div className="font-bold text-indigo-900 uppercase">
                  Republic of the Philippines • Bureau of Internal Revenue (BIR) Form No. 2307
                </div>
                <span className="px-2 py-0.5 rounded bg-indigo-200 text-indigo-900 font-bold text-[10px]">
                  E-Cert Ready
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-slate-700">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Payor / Withholding Agent</span>
                  <span className="font-bold text-slate-900">HORECA Hospitality Enterprise Corp</span>
                  <span className="text-[10px] text-slate-500 block">TIN: 009-882-110-000</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Payee / Purveyor</span>
                  <span className="font-bold text-slate-900">{birSelectedVendor.vendor}</span>
                  <span className="text-[10px] text-slate-500 block">TIN: {birSelectedVendor.tin}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Tax Base Amount</span>
                  <span className="font-bold text-slate-900">₱{birSelectedVendor.amount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Tax Withheld at Source (1%)</span>
                  <span className="font-black text-indigo-700">₱{birSelectedVendor.ewtAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: INVENTORY ASSET ADJUSTMENT */}
        {activeTab === "inventory_adjustment" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-200 gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-['Archivo']">
                  General Ledger Inventory Asset Adjustment
                </h2>
                <p className="text-xs text-slate-500 font-['IBM_Plex_Mono'] mt-0.5">
                  Updates inventory asset accounts (Account 1300) in General Ledger upon receiving goods shipments or logging kitchen spoilage and waste.
                </p>
              </div>
              <button
                onClick={handleCommitInventoryAdjustment}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-['IBM_Plex_Mono'] rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Commit Adjustment to General Ledger</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <label className="text-xs font-bold font-['IBM_Plex_Mono'] text-slate-600 uppercase block mb-1">
                  Adjustment Type
                </label>
                <select
                  value={adjustmentType}
                  onChange={(e) => setAdjustmentType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold font-['IBM_Plex_Mono']"
                >
                  <option value="SPOILAGE_WRITE_OFF">Kitchen Waste &amp; Spoilage Write-Off</option>
                  <option value="RECEIPT">Goods Receipt Stock Inflow</option>
                </select>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <label className="text-xs font-bold font-['IBM_Plex_Mono'] text-slate-600 uppercase block mb-1">
                  Adjustment Value (₱)
                </label>
                <input
                  type="number"
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold font-['IBM_Plex_Mono']"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <label className="text-xs font-bold font-['IBM_Plex_Mono'] text-slate-600 uppercase block mb-1">
                  Audit Reason / Specification
                </label>
                <input
                  type="text"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-['IBM_Plex_Mono']"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs font-['IBM_Plex_Mono']">
              <span className="font-bold text-slate-800 uppercase block mb-2">
                FMS Ledger Posting Preview:
              </span>
              {adjustmentType === "SPOILAGE_WRITE_OFF" ? (
                <div className="space-y-1 text-slate-600">
                  <div>DEBIT: 5020 - Kitchen Waste, Spoilage &amp; Damaged Goods Expense (₱{adjustmentAmount.toLocaleString()})</div>
                  <div>CREDIT: 1300 - Inventory Asset (Food &amp; Beverage Stock) (₱{adjustmentAmount.toLocaleString()})</div>
                </div>
              ) : (
                <div className="space-y-1 text-slate-600">
                  <div>DEBIT: 1300 - Inventory Asset (Food &amp; Beverage Stock) (₱{adjustmentAmount.toLocaleString()})</div>
                  <div>CREDIT: 2010 - Trade Accounts Payable (Purveyor Goods Inflow) (₱{adjustmentAmount.toLocaleString()})</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: INVOICED DISBURSEMENTS & ALLOCATION RECEIPTS (BUDGET CAPPED) */}
        {activeTab === "disbursements" && (
          <SubsystemDisbursementSection
            sourceModule="Supply-Chain"
            departmentName="Supply Chain"
            defaultCostCenter="Supply Chain & Central Warehousing"
            defaultCategory="Purveyor Supplies & Packaging"
            defaultGlDebitAccount="5030 - Warehouse Logistics, Cold Storage & Linen"
            requesterName="Jordan Tiu (Procurement & Purveyor Controller)"
            onNavigateToFms={onNavigateToFms}
            presets={[
              {
                payee: "HighSeas Meat & Seafood Cold Freight Settlement",
                purpose: "Net Supplier Settlement after 1% Statutory EWT Deduction",
                amount: 118800,
                allocationItems: [
                  { item: "Frozen Meat Cuts & Ribeye Whole Primals", category: "Raw Meats", amount: 78800, percentage: 66 },
                  { item: "Cold Storage Temperature Log Certification", category: "Inspection", amount: 20000, percentage: 17 },
                  { item: "Cryo Freight Logistics & Insulated Transport", category: "Freight Handling", amount: 20000, percentage: 17 }
                ]
              },
              {
                payee: "Global Prime Dairy & Cheeses Delivery",
                purpose: "Imported Butter, European Cheeses & Dairy Cold Cuts Supply",
                amount: 64350,
                allocationItems: [
                  { item: "Unsalted Butter & Heavy Whipping Creams (100L)", category: "Dairy Goods", amount: 38350, percentage: 60 },
                  { item: "Gouda, Emmental & Parmigiano Reggiano Wheels", category: "Aged Cheeses", amount: 26000, percentage: 40 }
                ]
              },
              {
                payee: "EcoSan Industrial Chemicals & Warehousing Supplies",
                purpose: "Housekeeping & Dishwashing Industrial Chemicals and Vacuum Packaging",
                amount: 35000,
                allocationItems: [
                  { item: "Sanitizing Chlorinated Rinse Solutions & Detergents", category: "Cleaning Chemicals", amount: 20000, percentage: 57 },
                  { item: "Heavy Duty Multi-Ply Vacuum Seal Bags (5000 units)", category: "Packaging Materials", amount: 15000, percentage: 43 }
                ]
              }
            ]}
          />
        )}

        {/* FMS Transmission Logs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-amber-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider font-['IBM_Plex_Mono'] text-slate-700">
                FMS Outbox Transmission Log (Supply-Chain Subsystem)
              </h3>
            </div>
            <span className="text-[11px] font-bold font-['IBM_Plex_Mono'] text-slate-500">
              Total FMS AP Invoices: {fmsStatus?.apInvoicesCount || 0}
            </span>
          </div>

          <div className="mt-3 space-y-2">
            {transmissionLogs.length === 0 ? (
              <p className="text-xs text-slate-400 font-['IBM_Plex_Mono'] py-3 text-center">
                No outbound supply-chain packets logged yet. Log purveyor invoice or commit inventory adjustment above.
              </p>
            ) : (
              transmissionLogs.slice(0, 5).map((pkt) => (
                <div
                  key={pkt.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-['IBM_Plex_Mono'] gap-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                      {pkt.targetSystem}
                    </span>
                    <span className="font-bold text-slate-800">{pkt.action}</span>
                    <span className="text-slate-500">— {pkt.summary}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-[11px] shrink-0">
                    {pkt.amount !== undefined && (
                      <span className="font-bold text-slate-900">₱{pkt.amount.toLocaleString()}</span>
                    )}
                    <span>{pkt.timestamp}</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      {pkt.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
