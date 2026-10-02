import React, { useState, useEffect } from "react";
import {
  FileText,
  DollarSign,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Utensils,
  Users,
  Truck,
  Car,
  Plus,
  Trash2,
  ExternalLink,
  Eye,
  Download,
  Copy,
  Check,
  Sparkles,
  Wallet,
  Landmark,
  ShieldAlert
} from "lucide-react";
import {
  fmsBridge,
  DisbursementReceipt,
  DepartmentBudgetCap,
  AllocationLineItem
} from "../services/fmsBridge";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface SubsystemDisbursementSectionProps {
  sourceModule: "HR-Payroll" | "Hotel-MNGT" | "Resto-MNGT" | "Supply-Chain" | "FleetOps";
  departmentName: string;
  defaultCostCenter: string;
  defaultCategory: string;
  defaultGlDebitAccount: string;
  requesterName: string;
  presets?: {
    payee: string;
    purpose: string;
    amount: number;
    allocationItems: { item: string; category: string; amount: number; percentage: number }[];
  }[];
  onNavigateToFms?: (tab?: string) => void;
}

export default function SubsystemDisbursementSection({
  sourceModule,
  departmentName,
  defaultCostCenter,
  defaultCategory,
  defaultGlDebitAccount,
  requesterName,
  presets = [],
  onNavigateToFms
}: SubsystemDisbursementSectionProps) {
  // Department Budget Cap
  const [deptBudget, setDeptBudget] = useState<DepartmentBudgetCap | null>(null);
  const [receipts, setReceipts] = useState<DisbursementReceipt[]>([]);

  // Form State
  const [payee, setPayee] = useState("");
  const [purpose, setPurpose] = useState("");
  const [requestedAmount, setRequestedAmount] = useState<number>(50000);
  const [costCenter, setCostCenter] = useState(defaultCostCenter);
  const [category, setCategory] = useState(defaultCategory);
  const [deductedFromAccount, setDeductedFromAccount] = useState("1030 - Operating Bank Account - BDO Primary");
  const [allocationItems, setAllocationItems] = useState<AllocationLineItem[]>([
    { id: "1", item: "Core Operational Expenditure", category: defaultCategory, amount: 35000, percentage: 70 },
    { id: "2", item: "Logistics, Delivery & Incidentals", category: "Freight & Handling", amount: 15000, percentage: 30 }
  ]);

  // Modal / Receipt Viewer State
  const [activeReceipt, setActiveReceipt] = useState<DisbursementReceipt | null>(null);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync Department Budget and Receipts
  const refreshData = () => {
    const caps = fmsBridge.getDepartmentBudgets();
    const current = caps.find(
      (c) =>
        c.department.toLowerCase().includes(departmentName.toLowerCase().split(" ")[0]) ||
        departmentName.toLowerCase().includes(c.department.toLowerCase().split(" ")[0])
    ) || caps[0];
    setDeptBudget(current);

    const allReceipts = fmsBridge.getDisbursementReceipts(current?.department);
    setReceipts(allReceipts);
  };

  useEffect(() => {
    refreshData();
    const handleSync = () => refreshData();
    window.addEventListener("fms-sync-event", handleSync);
    return () => window.removeEventListener("fms-sync-event", handleSync);
  }, [departmentName]);

  // Handle Preset Selection
  const applyPreset = (preset: {
    payee: string;
    purpose: string;
    amount: number;
    allocationItems: { item: string; category: string; amount: number; percentage: number }[];
  }) => {
    setPayee(preset.payee);
    setPurpose(preset.purpose);
    setRequestedAmount(preset.amount);
    setAllocationItems(
      preset.allocationItems.map((item, idx) => ({
        id: String(idx + 1),
        ...item
      }))
    );
  };

  // Add / Remove Allocation Line Items
  const handleAddLineItem = () => {
    const newItem: AllocationLineItem = {
      id: String(Date.now()),
      item: "Additional Service / Provision Item",
      category: category,
      amount: 10000,
      percentage: 20
    };
    const updated = [...allocationItems, newItem];
    rebalancePercentages(updated);
  };

  const handleRemoveLineItem = (id: string) => {
    if (allocationItems.length <= 1) return;
    const updated = allocationItems.filter((item) => item.id !== id);
    rebalancePercentages(updated);
  };

  const handleUpdateLineItem = (id: string, field: "item" | "category" | "amount", value: any) => {
    const updated = allocationItems.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    if (field === "amount") {
      rebalancePercentages(updated);
    } else {
      setAllocationItems(updated);
    }
  };

  const rebalancePercentages = (items: AllocationLineItem[]) => {
    const total = items.reduce((s, i) => s + (Number(i.amount) || 0), 0);
    const rebalanced = items.map((i) => ({
      ...i,
      percentage: total > 0 ? Number(((Number(i.amount) / total) * 100).toFixed(1)) : 0
    }));
    setAllocationItems(rebalanced);
  };

  // Budget Cap Calculations
  const budgetCap = deptBudget?.budgetCap || 2000000;
  const utilizedBefore = deptBudget?.utilized || 0;
  const remainingCap = Math.max(0, budgetCap - utilizedBefore);
  const isOverCap = requestedAmount > remainingCap;
  const cappedAmount = isOverCap ? remainingCap : requestedAmount;
  const capUtilizationPct = Number((((utilizedBefore + cappedAmount) / budgetCap) * 100).toFixed(1));

  // Submit Invoice & Generate Receipt
  const handleSubmitInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payee.trim() || !purpose.trim() || requestedAmount <= 0) {
      alert("Please provide valid payee, purpose, and requested amount.");
      return;
    }

    setIsSubmitting(true);

    const result = fmsBridge.submitDisbursementInvoiceWithReceipt({
      sourceModule,
      departmentName: deptBudget?.department || departmentName,
      payee: payee.trim(),
      purpose: purpose.trim(),
      requestedAmount,
      allocatedCostCenter: costCenter,
      allocationCategory: category,
      glDebitAccount: defaultGlDebitAccount,
      allocationItems,
      deductedFromAccount,
      deductionMethod: deductedFromAccount.includes("1010")
        ? "Petty Cash Voucher Disbursement"
        : "PESONet Automated Electronic Clearing",
      requestedBy: requesterName,
      enforceHardCap: true
    });

    setIsSubmitting(false);

    if (result.success && result.receipt) {
      setActiveReceipt(result.receipt);
      setIsSubmitSuccess(true);
      setStatusMessage(result.message);
      refreshData();
    } else {
      alert(result.error || "Failed to invoice disbursement.");
    }
  };

  // Download PDF Voucher
  const downloadReceiptPdf = (receipt: DisbursementReceipt) => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    // Header Dark Banner
    doc.setFillColor(26, 29, 33);
    doc.rect(0, 0, 210, 30, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("HORECA HOSPITALITY & RESORT ASSET ENTERPRISE", 14, 12);

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(200, 205, 215);
    doc.text("OFFICIAL 3-STAGE DISBURSEMENT RECEIPT & BUDGET CAP VOUCHER", 14, 18);
    doc.text(`VOUCHER REF: ${receipt.receiptNo} | ISSUED: ${receipt.timestamp}`, 14, 24);

    // Summary Box
    doc.setDrawColor(220, 225, 230);
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(14, 35, 182, 30, 2, 2, "FD");

    doc.setTextColor(26, 29, 33);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`Department: ${receipt.department.toUpperCase()}`, 18, 42);
    doc.text(`Payee: ${receipt.payee}`, 18, 48);
    doc.text(`Purpose: ${receipt.purpose}`, 18, 54);
    doc.text(`Disbursed Amount: PHP ${receipt.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 18, 60);

    // STAGE 1: ALLOCATION
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("STAGE 1: BUDGET ALLOCATION & EXPENSE CODING (WHERE ALLOCATED)", 14, 73);

    autoTable(doc, {
      startY: 77,
      head: [["Item Description / Service", "Category", "Amount (PHP)", "Share (%)"]],
      body: receipt.allocationItems.map((item) => [
        item.item,
        item.category,
        `PHP ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        `${item.percentage}%`
      ]),
      theme: "striped",
      headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 8 }
    });

    // STAGE 2: TREASURY DEDUCTION
    const currentY2 = (doc as any).lastAutoTable.finalY + 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("STAGE 2: TREASURY CASH LIQUIDITY IMPACT (WHERE DEDUCTED)", 14, currentY2);

    autoTable(doc, {
      startY: currentY2 + 4,
      head: [["Treasury Parameter", "Execution Details"]],
      body: [
        ["Deduction Source Account", receipt.deductedFromAccount],
        ["Treasury Clearing Method", receipt.deductionMethod],
        ["Prior Treasury Liquid Balance", `PHP ${receipt.priorTreasuryBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`],
        ["Disbursement Deducted", `PHP ${receipt.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`],
        ["Post-Disbursement Treasury Balance", `PHP ${receipt.postTreasuryBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`]
      ],
      theme: "striped",
      headStyles: { fillColor: [180, 83, 9], textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 8 }
    });

    // STAGE 3: BUDGET CAP RECONCILIATION
    const currentY3 = (doc as any).lastAutoTable.finalY + 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("STAGE 3: DEPARTMENT BUDGET CAP & CEILING RECONCILIATION", 14, currentY3);

    autoTable(doc, {
      startY: currentY3 + 4,
      head: [["Budget Cap Parameter", "Reconciliation Figures"]],
      body: [
        ["Approved Department Budget Cap", `PHP ${receipt.budgetCapBefore.toLocaleString(undefined, { minimumFractionDigits: 2 })}`],
        ["Utilized Prior to Request", `PHP ${receipt.utilizedBefore.toLocaleString(undefined, { minimumFractionDigits: 2 })}`],
        ["This Disbursement Deducted Against Cap", `PHP ${receipt.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`],
        ["New Cumulative Department Utilized", `PHP ${receipt.utilizedAfter.toLocaleString(undefined, { minimumFractionDigits: 2 })}`],
        ["Remaining Budget Cap Capacity", `PHP ${receipt.budgetCapRemaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}`],
        ["Cap Utilization Ratio", `${receipt.capUtilizationPct}% (Compliance: ${receipt.budgetCapStatus})`]
      ],
      theme: "striped",
      headStyles: { fillColor: [21, 122, 77], textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 8 }
    });

    // Signatures
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(14, finalY, 196, finalY);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Requested By: ${receipt.requestedBy}`, 14, finalY + 5);
    doc.text("Authorized By: Super Administrator (FMS Core)", 110, finalY + 5);
    doc.text(`Timestamp: ${receipt.timestamp}`, 14, finalY + 9);
    doc.text(`Security Token: ${receipt.referenceToken}`, 110, finalY + 9);

    doc.save(`Disbursement_Receipt_${receipt.receiptNo}.pdf`);
  };

  const getDeptIcon = () => {
    switch (sourceModule) {
      case "Hotel-MNGT":
        return <Building2 className="h-5 w-5 text-indigo-600" />;
      case "Resto-MNGT":
        return <Utensils className="h-5 w-5 text-rose-600" />;
      case "HR-Payroll":
        return <Users className="h-5 w-5 text-blue-600" />;
      case "Supply-Chain":
        return <Truck className="h-5 w-5 text-amber-600" />;
      case "FleetOps":
        return <Car className="h-5 w-5 text-emerald-600" />;
      default:
        return <Wallet className="h-5 w-5 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER CARD: Budget Cap & Financial Source Architecture */}
      <div className="bg-white border border-[#DFE1DB] p-5 rounded-xl shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DFE1DB] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-100 rounded-xl border border-slate-200">
              {getDeptIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold font-['IBM_Plex_Mono'] uppercase tracking-wider text-[#5C636F]">
                  {sourceModule} DISBURSEMENT MANAGEMENT
                </span>
                <span className="bg-[#157A4D]/10 text-[#157A4D] px-2 py-0.5 rounded text-[10px] font-['IBM_Plex_Mono'] font-bold border border-[#157A4D]/20 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  <span>BUDGET CAP ENFORCED</span>
                </span>
              </div>
              <h2 className="text-xl font-bold font-['Archivo'] text-[#1A1D21] mt-0.5">
                Invoice Disbursement &amp; Allocation Receipt Generator
              </h2>
              <p className="text-xs text-[#5C636F]">
                Invoice operational disbursements with mandatory 3-stage receipts: (1) Line-item allocation, (2) Treasury cash deduction source, and (3) Automatic department budget capping in FMS.
              </p>
            </div>
          </div>

          {onNavigateToFms && (
            <button
              type="button"
              onClick={() => onNavigateToFms("disbursement")}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-[#1A1D21] rounded-lg text-xs font-['IBM_Plex_Mono'] font-bold transition-all flex items-center gap-1.5 shrink-0 border border-slate-300 cursor-pointer"
            >
              <span>View in FMS Disbursement Core</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* 3 Clear Architecture Clarification Cards: Where Budget Comes From, Where Deducted, Budget Cap */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Card 1: Where Budget Comes From */}
          <div className="bg-blue-50/70 border border-blue-200 p-3.5 rounded-xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 font-['Archivo']">
              <Layers className="h-4 w-4 text-blue-600" />
              <span>1. Where Budget Comes From</span>
            </div>
            <p className="text-[11px] text-blue-800 leading-relaxed font-['IBM_Plex_Sans']">
              Originates from <strong>{deptBudget?.department || departmentName}&apos;s Approved Budget Pool</strong> (GL {deptBudget?.glAccountCode || "50XX"}).
            </p>
            <div className="pt-1 text-[10px] font-['IBM_Plex_Mono'] text-blue-900">
              Total Department Cap: <strong>₱{budgetCap.toLocaleString()}</strong>
            </div>
          </div>

          {/* Card 2: Where Money is Deducted From */}
          <div className="bg-amber-50/70 border border-amber-200 p-3.5 rounded-xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 font-['Archivo']">
              <Landmark className="h-4 w-4 text-amber-600" />
              <span>2. Where Cash is Deducted From</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed font-['IBM_Plex_Sans']">
              Deducted from <strong>Treasury Liquidity</strong>: Primary Operating Account (BDO Unibank 1030) or Front Desk / Petty Cash Float (1010).
            </p>
            <div className="pt-1 text-[10px] font-['IBM_Plex_Mono'] text-amber-900">
              Auto-cleared via PESONet or Cash Voucher
            </div>
          </div>

          {/* Card 3: Budget Cap Enforcement */}
          <div className={`p-3.5 rounded-xl space-y-1.5 border ${
            isOverCap ? "bg-red-50/80 border-red-200 text-red-900" : "bg-emerald-50/70 border-emerald-200 text-emerald-900"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold font-['Archivo']">
                <ShieldCheck className="h-4 w-4" />
                <span>3. Budget Cap Remaining</span>
              </div>
              <span className="text-[10px] font-['IBM_Plex_Mono'] font-bold px-1.5 py-0.5 rounded bg-white/80 border">
                {((utilizedBefore / budgetCap) * 100).toFixed(0)}% Utilized
              </span>
            </div>
            <div className="text-base font-bold font-['IBM_Plex_Mono']">
              ₱{remainingCap.toLocaleString()}
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  (utilizedBefore / budgetCap) >= 0.85 ? "bg-red-500" : "bg-emerald-600"
                }`}
                style={{ width: `${Math.min(100, (utilizedBefore / budgetCap) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] leading-tight opacity-90">
              When entering FMS, requested disbursement is capped to remaining ceiling.
            </p>
          </div>
        </div>
      </div>

      {/* QUICK PRESETS BANNER */}
      {presets.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-['IBM_Plex_Mono'] text-slate-700 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span>Standard Operational Presets for {departmentName}</span>
            </span>
            <span className="text-[10px] text-slate-500 font-['IBM_Plex_Mono']">Click to auto-populate form &amp; receipt line items</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(preset)}
                className="p-2.5 bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-400 rounded-lg text-left transition-all cursor-pointer shadow-2xs group"
              >
                <div className="font-bold text-xs text-slate-900 group-hover:text-blue-700 truncate">
                  {preset.payee}
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                  {preset.purpose}
                </div>
                <div className="mt-1.5 text-xs font-bold font-['IBM_Plex_Mono'] text-[#157A4D]">
                  ₱{preset.amount.toLocaleString()}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* INVOICE DISBURSEMENT FORM */}
      <div className="bg-white border border-[#DFE1DB] p-6 rounded-xl shadow-xs space-y-6">
        <div className="border-b border-[#DFE1DB] pb-3 flex items-center justify-between">
          <h3 className="font-bold text-base font-['Archivo'] text-[#1A1D21] flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#157A4D]" />
            <span>Create Disbursement Invoice &amp; Allocation Receipt</span>
          </h3>
          <span className="text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
            Requester: <strong>{requesterName}</strong>
          </span>
        </div>

        <form onSubmit={handleSubmitInvoice} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold font-['IBM_Plex_Mono'] text-[#1A1D21] mb-1">
                Payee / Beneficiary Name *
              </label>
              <input
                type="text"
                required
                value={payee}
                onChange={(e) => setPayee(e.target.value)}
                placeholder="e.g., Manila Luxury Linens / Wagyu Prime Purveyor / Staff Compensation"
                className="w-full text-xs p-2.5 bg-[#F8F9F6] border border-[#DFE1DB] rounded-lg focus:outline-none focus:border-[#1A1D21] font-['IBM_Plex_Sans']"
              />
            </div>

            <div>
              <label className="block text-xs font-bold font-['IBM_Plex_Mono'] text-[#1A1D21] mb-1">
                Disbursement Purpose / Business Justification *
              </label>
              <input
                type="text"
                required
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g., Guest Suite Linen Replacement / Cold Chain Delivery / Statutory Payroll"
                className="w-full text-xs p-2.5 bg-[#F8F9F6] border border-[#DFE1DB] rounded-lg focus:outline-none focus:border-[#1A1D21] font-['IBM_Plex_Sans']"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Requested Amount with Cap Check */}
            <div>
              <label className="block text-xs font-bold font-['IBM_Plex_Mono'] text-[#1A1D21] mb-1">
                Requested Amount (PHP) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#5C636F]">₱</span>
                <input
                  type="number"
                  min="1"
                  required
                  value={requestedAmount}
                  onChange={(e) => {
                    const amt = Math.max(0, Number(e.target.value));
                    setRequestedAmount(amt);
                    rebalancePercentages(
                      allocationItems.map((i) => ({ ...i, amount: Math.round(amt * (i.percentage / 100)) }))
                    );
                  }}
                  className={`w-full text-xs pl-7 pr-3 py-2.5 bg-[#F8F9F6] border rounded-lg focus:outline-none font-['IBM_Plex_Mono'] font-bold ${
                    isOverCap ? "border-amber-400 text-amber-900 bg-amber-50/50" : "border-[#DFE1DB] text-[#1A1D21]"
                  }`}
                />
              </div>

              {/* Dynamic Cap Warning / Note */}
              <div className="mt-1.5 text-[11px] font-['IBM_Plex_Mono']">
                {isOverCap ? (
                  <span className="text-amber-700 flex items-center gap-1 font-bold">
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                    <span>Exceeds remaining cap! Will be capped to ₱{remainingCap.toLocaleString()}.</span>
                  </span>
                ) : (
                  <span className="text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 shrink-0" />
                    <span>Within cap (₱{remainingCap.toLocaleString()} capacity remaining).</span>
                  </span>
                )}
              </div>
            </div>

            {/* Treasury Deduction Source */}
            <div>
              <label className="block text-xs font-bold font-['IBM_Plex_Mono'] text-[#1A1D21] mb-1">
                Where Deducted (Treasury Liquidity) *
              </label>
              <select
                value={deductedFromAccount}
                onChange={(e) => setDeductedFromAccount(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#F8F9F6] border border-[#DFE1DB] rounded-lg focus:outline-none focus:border-[#1A1D21] font-['IBM_Plex_Sans']"
              >
                <option value="1030 - Operating Bank Account - BDO Primary">
                  1030 - BDO Operating Account (PESONet Electronic)
                </option>
                <option value="1010 - Front Desk / Resto Cash Float">
                  1010 - Front Desk / Petty Cash Float (Cash on Hand)
                </option>
              </select>
              <span className="text-[10px] text-[#5C636F] font-['IBM_Plex_Mono'] block mt-1">
                Treasury cash deducted upon invoice approval.
              </span>
            </div>

            {/* Cost Center Allocation */}
            <div>
              <label className="block text-xs font-bold font-['IBM_Plex_Mono'] text-[#1A1D21] mb-1">
                Allocated Cost Center *
              </label>
              <input
                type="text"
                required
                value={costCenter}
                onChange={(e) => setCostCenter(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#F8F9F6] border border-[#DFE1DB] rounded-lg focus:outline-none focus:border-[#1A1D21] font-['IBM_Plex_Sans']"
              />
              <span className="text-[10px] text-[#5C636F] font-['IBM_Plex_Mono'] block mt-1">
                GL: {defaultGlDebitAccount}
              </span>
            </div>
          </div>

          {/* ALLOCATION RECEIPT BREAKDOWN TABLE (WHERE ALLOCATED) */}
          <div className="bg-[#F8F9F6] border border-[#DFE1DB] p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs font-['Archivo'] text-[#1A1D21] flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-blue-700" />
                  <span>Stage 1: Line-Item Receipt Allocation (Where Requested Budget is Spent)</span>
                </h4>
                <p className="text-[11px] text-[#5C636F]">
                  Itemize specifically how the requested budget will be allocated across provisions, services, or materials.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddLineItem}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-[#1A1D21] rounded text-[11px] font-['IBM_Plex_Mono'] font-bold border border-[#DFE1DB] transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3 w-3" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-['IBM_Plex_Sans']">
                <thead className="bg-[#EFEFEA] font-['IBM_Plex_Mono'] text-[#5C636F] text-[10px]">
                  <tr>
                    <th className="p-2">Item Description</th>
                    <th className="p-2">Category</th>
                    <th className="p-2 text-right">Amount (PHP)</th>
                    <th className="p-2 text-right">Share (%)</th>
                    <th className="p-2 text-center w-10">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFE1DB] bg-white">
                  {allocationItems.map((item) => (
                    <tr key={item.id}>
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.item}
                          onChange={(e) => handleUpdateLineItem(item.id, "item", e.target.value)}
                          className="w-full text-xs p-1.5 bg-[#F8F9F6] border border-[#DFE1DB] rounded focus:outline-none"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.category}
                          onChange={(e) => handleUpdateLineItem(item.id, "category", e.target.value)}
                          className="w-full text-xs p-1.5 bg-[#F8F9F6] border border-[#DFE1DB] rounded focus:outline-none"
                        />
                      </td>
                      <td className="p-2 text-right">
                        <input
                          type="number"
                          value={item.amount}
                          onChange={(e) => handleUpdateLineItem(item.id, "amount", Number(e.target.value))}
                          className="w-28 text-xs p-1.5 bg-[#F8F9F6] border border-[#DFE1DB] rounded text-right font-['IBM_Plex_Mono'] font-bold focus:outline-none"
                        />
                      </td>
                      <td className="p-2 text-right font-['IBM_Plex_Mono'] font-semibold text-[#5C636F]">
                        {item.percentage}%
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveLineItem(item.id)}
                          disabled={allocationItems.length <= 1}
                          className="text-slate-400 hover:text-red-600 disabled:opacity-30 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="text-xs text-[#5C636F] font-['IBM_Plex_Mono']">
              Effective Disbursement: <strong className="text-[#1A1D21]">₱{cappedAmount.toLocaleString()}</strong> &bull; Department Cap Remaining After: <strong className="text-[#157A4D]">₱{Math.max(0, remainingCap - cappedAmount).toLocaleString()}</strong>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#157A4D] hover:bg-[#11623E] text-white rounded-lg text-xs font-bold font-['IBM_Plex_Mono'] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <FileText className="h-4 w-4" />
              <span>{isSubmitting ? "Processing..." : "Invoice Disbursement & Generate Receipt"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>
      </div>

      {/* RECENT DISBURSEMENT RECEIPTS LOG */}
      <div className="bg-white border border-[#DFE1DB] rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#DFE1DB] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#1A1D21] font-['Archivo'] flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#157A4D]" />
              <span>Official Disbursement Receipts Log ({deptBudget?.department || departmentName})</span>
            </h3>
            <p className="text-xs text-[#5C636F]">
              Official vouchers with 3-stage reconciliation (allocation, treasury deduction, budget cap).
            </p>
          </div>
          <span className="text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
            {receipts.length} Vouchers Issued
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-['IBM_Plex_Sans']">
            <thead className="bg-[#F1F1ED] font-['IBM_Plex_Mono'] text-[#5C636F] text-[11px]">
              <tr>
                <th className="p-3">Receipt / Voucher #</th>
                <th className="p-3">Payee &amp; Purpose</th>
                <th className="p-3 text-right">Amount (PHP)</th>
                <th className="p-3">Deducted From</th>
                <th className="p-3">Budget Cap Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFE1DB] text-[11px]">
              {receipts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-[#5C636F] font-['IBM_Plex_Mono']">
                    No disbursement receipts logged for this department yet. Use the form above to invoice disbursement.
                  </td>
                </tr>
              ) : (
                receipts.map((r) => (
                  <tr key={r.receiptNo} className="hover:bg-[#F8F9F6] transition-colors">
                    <td className="p-3 font-['IBM_Plex_Mono'] font-bold text-[#1A1D21]">
                      {r.receiptNo}
                      <span className="block text-[10px] text-[#5C636F] font-normal">{r.timestamp}</span>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-[#1A1D21]">{r.payee}</div>
                      <div className="text-[10px] text-[#5C636F]">{r.purpose}</div>
                    </td>
                    <td className="p-3 text-right font-['IBM_Plex_Mono'] font-bold text-[#157A4D]">
                      ₱{r.amount.toLocaleString()}
                    </td>
                    <td className="p-3 font-['IBM_Plex_Mono'] text-[10px] text-[#5C636F]">
                      {r.deductedFromAccount.includes("1010") ? "1010 - Petty Cash Float" : "1030 - BDO Operating Bank"}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-['IBM_Plex_Mono'] font-bold ${
                        r.budgetCapStatus === "OVER_CAP"
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}>
                        {r.budgetCapStatus === "OVER_CAP" ? "CAPPED AT CEILING" : "WITHIN CAP"} ({r.capUtilizationPct}%)
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveReceipt(r);
                            setIsSubmitSuccess(false);
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-[#1A1D21] rounded text-[10px] font-['IBM_Plex_Mono'] font-bold flex items-center gap-1 border border-slate-300 cursor-pointer"
                        >
                          <Eye className="h-3 w-3" />
                          <span>View</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadReceiptPdf(r)}
                          className="p-1 bg-slate-100 hover:bg-slate-200 text-[#1A1D21] rounded text-[10px] border border-slate-300 cursor-pointer"
                          title="Download PDF Voucher"
                        >
                          <Download className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3-STAGE OFFICIAL RECEIPT VOUCHER MODAL */}
      {activeReceipt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#DFE1DB] shadow-2xl overflow-hidden my-8">
            {/* Header */}
            <div className="bg-[#1A1D21] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base font-['Archivo']">
                    Official 3-Stage Disbursement Receipt Voucher
                  </h3>
                  <p className="text-[11px] text-slate-300 font-['IBM_Plex_Mono']">
                    {activeReceipt.receiptNo} &bull; {activeReceipt.department}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveReceipt(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Success Banner if just invoiced */}
            {isSubmitSuccess && statusMessage && (
              <div className="bg-emerald-50 border-b border-emerald-200 p-3.5 flex items-center gap-2 text-xs font-['IBM_Plex_Mono'] text-emerald-900">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            {/* Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto font-['IBM_Plex_Sans'] text-xs text-[#1A1D21]">
              {/* Voucher Meta Overview */}
              <div className="bg-[#F8F9F6] border border-[#DFE1DB] p-4 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] font-['IBM_Plex_Mono']">
                <div>
                  <span className="text-[#5C636F] block text-[10px]">Payee:</span>
                  <span className="font-bold">{activeReceipt.payee}</span>
                </div>
                <div>
                  <span className="text-[#5C636F] block text-[10px]">Disbursed Amount:</span>
                  <span className="font-bold text-[#157A4D] text-sm">₱{activeReceipt.amount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[#5C636F] block text-[10px]">Cost Center:</span>
                  <span className="font-medium truncate block">{activeReceipt.allocatedCostCenter}</span>
                </div>
                <div>
                  <span className="text-[#5C636F] block text-[10px]">Issued Date:</span>
                  <span className="font-medium">{activeReceipt.timestamp}</span>
                </div>
              </div>

              {/* STAGE 1: ALLOCATION BREAKDOWN (WHERE ALLOCATED) */}
              <div className="border border-[#DFE1DB] rounded-xl overflow-hidden">
                <div className="bg-blue-50/80 px-4 py-2 border-b border-blue-100 flex items-center justify-between">
                  <span className="font-bold font-['Archivo'] text-blue-900 text-xs flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-blue-600" />
                    <span>STAGE 1: Line-Item Budget Allocation (Where Allocated)</span>
                  </span>
                  <span className="text-[10px] font-['IBM_Plex_Mono'] text-blue-700">
                    GL: {activeReceipt.glDebitAccount}
                  </span>
                </div>
                <div className="p-3">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F1F1ED] font-['IBM_Plex_Mono'] text-[#5C636F] text-[10px]">
                      <tr>
                        <th className="p-2">Item Description</th>
                        <th className="p-2">Category</th>
                        <th className="p-2 text-right">Amount (PHP)</th>
                        <th className="p-2 text-right">Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DFE1DB]">
                      {activeReceipt.allocationItems.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2 font-medium">{item.item}</td>
                          <td className="p-2 text-[#5C636F]">{item.category}</td>
                          <td className="p-2 text-right font-['IBM_Plex_Mono'] font-bold">
                            ₱{item.amount.toLocaleString()}
                          </td>
                          <td className="p-2 text-right font-['IBM_Plex_Mono'] text-[#5C636F]">
                            {item.percentage}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* STAGE 2: TREASURY DEDUCTION (WHERE DEDUCTED) */}
              <div className="border border-[#DFE1DB] rounded-xl overflow-hidden">
                <div className="bg-amber-50/80 px-4 py-2 border-b border-amber-100 flex items-center justify-between">
                  <span className="font-bold font-['Archivo'] text-amber-900 text-xs flex items-center gap-1.5">
                    <Landmark className="h-3.5 w-3.5 text-amber-600" />
                    <span>STAGE 2: Treasury Liquidity Impact (Where Deducted)</span>
                  </span>
                  <span className="text-[10px] font-['IBM_Plex_Mono'] text-amber-700">
                    {activeReceipt.deductionMethod}
                  </span>
                </div>
                <div className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] font-['IBM_Plex_Mono']">
                  <div className="p-2.5 bg-[#F8F9F6] rounded-lg border border-[#DFE1DB]">
                    <span className="text-[10px] text-[#5C636F] block">Deduction Account:</span>
                    <span className="font-bold truncate block">{activeReceipt.deductedFromAccount}</span>
                  </div>
                  <div className="p-2.5 bg-[#F8F9F6] rounded-lg border border-[#DFE1DB]">
                    <span className="text-[10px] text-[#5C636F] block">Prior Treasury Balance:</span>
                    <span className="font-bold">₱{activeReceipt.priorTreasuryBalance.toLocaleString()}</span>
                  </div>
                  <div className="p-2.5 bg-[#F8F9F6] rounded-lg border border-[#DFE1DB]">
                    <span className="text-[10px] text-[#5C636F] block">Post-Deduction Balance:</span>
                    <span className="font-bold text-[#157A4D]">₱{activeReceipt.postTreasuryBalance.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* STAGE 3: BUDGET CAP RECONCILIATION */}
              <div className="border border-[#DFE1DB] rounded-xl overflow-hidden">
                <div className="bg-emerald-50/80 px-4 py-2 border-b border-emerald-100 flex items-center justify-between">
                  <span className="font-bold font-['Archivo'] text-emerald-900 text-xs flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>STAGE 3: Department Budget Cap Reconciliation</span>
                  </span>
                  <span className="text-[10px] font-['IBM_Plex_Mono'] font-bold text-emerald-700">
                    Compliance: {activeReceipt.budgetCapStatus}
                  </span>
                </div>
                <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px] font-['IBM_Plex_Mono']">
                  <div className="p-2 bg-[#F8F9F6] rounded border border-[#DFE1DB]">
                    <span className="text-[9px] text-[#5C636F] block">Approved Cap:</span>
                    <span className="font-bold">₱{activeReceipt.budgetCapBefore.toLocaleString()}</span>
                  </div>
                  <div className="p-2 bg-[#F8F9F6] rounded border border-[#DFE1DB]">
                    <span className="text-[9px] text-[#5C636F] block">Utilized Prior:</span>
                    <span className="font-bold">₱{activeReceipt.utilizedBefore.toLocaleString()}</span>
                  </div>
                  <div className="p-2 bg-[#F8F9F6] rounded border border-[#DFE1DB]">
                    <span className="text-[9px] text-[#5C636F] block">Utilized After:</span>
                    <span className="font-bold text-indigo-700">₱{activeReceipt.utilizedAfter.toLocaleString()}</span>
                  </div>
                  <div className="p-2 bg-[#F8F9F6] rounded border border-[#DFE1DB]">
                    <span className="text-[9px] text-[#5C636F] block">Remaining Cap:</span>
                    <span className="font-bold text-[#157A4D]">₱{activeReceipt.budgetCapRemaining.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Security Hash & Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#DFE1DB]">
                <div className="flex items-center gap-1 text-[10px] font-['IBM_Plex_Mono'] text-[#5C636F]">
                  <span>Hash:</span>
                  <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">{activeReceipt.referenceToken}</code>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(activeReceipt.referenceToken);
                      setCopiedToken(true);
                      setTimeout(() => setCopiedToken(false), 2000);
                    }}
                    className="p-1 hover:bg-slate-100 rounded text-slate-500 cursor-pointer"
                    title="Copy Token"
                  >
                    {copiedToken ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => downloadReceiptPdf(activeReceipt)}
                    className="px-3 py-1.5 bg-[#1A1D21] hover:bg-black text-white rounded-lg text-xs font-['IBM_Plex_Mono'] font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveReceipt(null)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-['IBM_Plex_Mono'] font-bold cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
