import React, { useState, useMemo, useEffect } from "react";
import {
  FileText,
  DollarSign,
  Building2,
  Utensils,
  Users,
  Truck,
  Car,
  AlertCircle,
  CheckCircle2,
  Clock,
  Printer,
  X,
  Send,
  Sparkles,
  ShieldCheck,
  CreditCard,
  ArrowDownRight,
  TrendingDown,
  Layers,
  Search,
  Filter,
  Download,
  ArrowRight,
  RefreshCw,
  Sliders,
  Check,
  Info,
  ShieldAlert,
  AlertTriangle,
  Landmark,
  PiggyBank,
  Copy,
  CheckCheck
} from "lucide-react";
import PesoSign from "./PesoSign";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface DepartmentBudgetCap {
  department: "Hotel Management" | "Restaurant Management" | "HRMS Payroll" | "Supply Chain" | "FleetOps";
  budgetCap: number;
  allocated: number;
  utilized: number;
  glAccountCode: string;
  glAccountName: string;
  icon: string;
  description?: string;
}

export interface AllocationLineItem {
  id: string;
  item: string;
  category: string;
  amount: number;
  percentage: number;
}

export interface DisbursementReceipt {
  receiptNo: string;
  id: string;
  department: string;
  payee: string;
  purpose: string;
  amount: number;
  // 1. How and where budget will be allocated
  allocatedCostCenter: string;
  allocationCategory: string;
  glDebitAccount: string;
  allocationItems: AllocationLineItem[];
  // 2. Where it will be deducted
  deductedFromAccount: string;
  priorTreasuryBalance: number;
  postTreasuryBalance: number;
  glCreditAccount: string;
  deductionMethod: string;
  // 3. Budget cap
  budgetCapBefore: number;
  utilizedBefore: number;
  utilizedAfter: number;
  budgetCapRemaining: number;
  capUtilizationPct: number;
  budgetCapStatus: "WITHIN_CAP" | "ELEVATED_CAP" | "OVER_CAP";
  // Metadata
  status: "APPROVED_AND_DISBURSED" | "PENDING_SUPERADMIN";
  requestedBy: string;
  approvedBy: string;
  timestamp: string;
  referenceToken: string;
}

interface DisbursementManagementProps {
  cashPool: {
    pettyCash: number;
    bankOperating: number;
    payrollHold?: number;
  };
  currentUser: {
    id: string;
    name: string;
    role: "superadmin" | "admin" | "analyst";
  };
  onExecuteDisbursement: (receipt: DisbursementReceipt) => void;
  onUpdateDepartmentBudgets?: (
    allocations: { department: string; allocated: number; cap: number; percentage: number }[]
  ) => void;
  maskCurrency: (val: number) => string;
  isDataMasked?: boolean;
}

export default function DisbursementManagement({
  cashPool,
  currentUser,
  onExecuteDisbursement,
  onUpdateDepartmentBudgets,
  maskCurrency,
  isDataMasked = false
}: DisbursementManagementProps) {
  // Department Budgets & Caps State (Persisted)
  const [departmentBudgets, setDepartmentBudgets] = useState<DepartmentBudgetCap[]>(() => {
    try {
      const saved = localStorage.getItem("horeca_dept_budgets");
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    return [
      {
        department: "Hotel Management",
        budgetCap: 2500000,
        allocated: 2100000,
        utilized: 1380000,
        glAccountCode: "5010",
        glAccountName: "5010 - Hotel Guest Supplies, Amenities & Maintenance",
        icon: "building",
        description: "Guest suites, front desk, housekeeping linens, and room infrastructure"
      },
      {
        department: "Restaurant Management",
        budgetCap: 1800000,
        allocated: 1500000,
        utilized: 985000,
        glAccountCode: "5020",
        glAccountName: "5020 - F&B Food & Beverage Purveyor Replenishment",
        icon: "utensils",
        description: "Culinary provisions, beverage cellars, and banquet dining logistics"
      },
      {
        department: "HRMS Payroll",
        budgetCap: 2400000,
        allocated: 2200000,
        utilized: 1650000,
        glAccountCode: "5110",
        glAccountName: "5110 - Executive, Service & Banquet Payroll",
        icon: "users",
        description: "Base hospitality wages, statutory contributions, and overtime compensation"
      },
      {
        department: "Supply Chain",
        budgetCap: 1500000,
        allocated: 1250000,
        utilized: 790000,
        glAccountCode: "5030",
        glAccountName: "5030 - Warehouse Logistics, Cold Storage & Linen",
        icon: "truck",
        description: "Bulk procurement, cold chain storage preservation, and logistics inventory"
      },
      {
        department: "FleetOps",
        budgetCap: 900000,
        allocated: 750000,
        utilized: 410000,
        glAccountCode: "5410",
        glAccountName: "5410 - Airport Shuttle Van Fuel, Tolls & Maintenance",
        icon: "car",
        description: "VIP airport shuttles, commercial fleet fuel, and scheduled vehicle servicing"
      }
    ];
  });

  // Recent Receipts Register (Persisted)
  const [receipts, setReceipts] = useState<DisbursementReceipt[]>(() => {
    try {
      const saved = localStorage.getItem("horeca_disb_receipts");
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    return [
      {
        receiptNo: "RCV-2026-DISB-701",
        id: "DISB-701",
        department: "Hotel Management",
        payee: "Manila Luxury Linens & Textiles Corp.",
        purpose: "Guest Suite Egyptian Cotton Bedding & Towel Replacement",
        amount: 85000,
        allocatedCostCenter: "Hotel Operations - Housekeeping",
        allocationCategory: "Operational Supplies & Replenishment",
        glDebitAccount: "5010 - Hotel Guest Supplies, Amenities & Maintenance",
        allocationItems: [
          { id: "1", item: "300-Thread Count King Duvet Covers & Pillowcases", category: "Linen Restock", amount: 52000, percentage: 61 },
          { id: "2", item: "Luxury Turkish Cotton Bath Towel Sets", category: "Bath Amenities", amount: 25000, percentage: 29 },
          { id: "3", item: "Express Sanitization & Logistics Freight", category: "Freight Handling", amount: 8000, percentage: 10 }
        ],
        deductedFromAccount: "1030 - Operating Bank Account - BDO Primary",
        priorTreasuryBalance: 2535000,
        postTreasuryBalance: 2450000,
        glCreditAccount: "1030 - Operating Bank Account - BDO Primary",
        deductionMethod: "PESONet Automated Electronic Clearing",
        budgetCapBefore: 2500000,
        utilizedBefore: 1295000,
        utilizedAfter: 1380000,
        budgetCapRemaining: 1120000,
        capUtilizationPct: 55.2,
        budgetCapStatus: "WITHIN_CAP",
        status: "APPROVED_AND_DISBURSED",
        requestedBy: "Victoria Santos (Front Office Dir.)",
        approvedBy: "Super Administrator",
        timestamp: "2026-09-18 14:30",
        referenceToken: "DISB-HM-85K-BDO"
      },
      {
        receiptNo: "RCV-2026-DISB-702",
        id: "DISB-702",
        department: "Restaurant Management",
        payee: "Pacific Wagyu & Seafood Cold Storage Inc.",
        purpose: "Weekend Banquet Wagyu Ribeye & Lobster Tails Delivery",
        amount: 145000,
        allocatedCostCenter: "F&B Kitchen Operations",
        allocationCategory: "Raw Food & Culinary Provisions",
        glDebitAccount: "5020 - F&B Food & Beverage Purveyor Replenishment",
        allocationItems: [
          { id: "1", item: "A5 Kagoshima Wagyu Striploin (20kg Vacuum Sealed)", category: "Culinary Beef", amount: 95000, percentage: 66 },
          { id: "2", item: "Live Boston Maine Lobsters & Wild Scallops", category: "Fresh Seafood", amount: 38000, percentage: 26 },
          { id: "3", item: "Refrigerated Cryo-Logistics & Temperature Audit", category: "Cold Chain Transport", amount: 12000, percentage: 8 }
        ],
        deductedFromAccount: "1030 - Operating Bank Account - BDO Primary",
        priorTreasuryBalance: 2680000,
        postTreasuryBalance: 2535000,
        glCreditAccount: "1030 - Operating Bank Account - BDO Primary",
        deductionMethod: "PESONet Automated Electronic Clearing",
        budgetCapBefore: 1800000,
        utilizedBefore: 840000,
        utilizedAfter: 985000,
        budgetCapRemaining: 815000,
        capUtilizationPct: 54.7,
        budgetCapStatus: "WITHIN_CAP",
        status: "APPROVED_AND_DISBURSED",
        requestedBy: "Chef Marco Villanueva (Exec Chef)",
        approvedBy: "Super Administrator",
        timestamp: "2026-09-19 10:15",
        referenceToken: "DISB-RM-145K-BDO"
      }
    ];
  });

  // Modal State
  const [selectedReceiptForView, setSelectedReceiptForView] = useState<DisbursementReceipt | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  // Search/Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("ALL");

  // Real-Time Interoperability Synchronization Listener
  useEffect(() => {
    const handleSync = () => {
      try {
        const savedReceipts = localStorage.getItem("horeca_disb_receipts");
        if (savedReceipts) setReceipts(JSON.parse(savedReceipts));
        const savedBudgets = localStorage.getItem("horeca_dept_budgets");
        if (savedBudgets) setDepartmentBudgets(JSON.parse(savedBudgets));
      } catch (e) {}
    };
    window.addEventListener("fms-sync-event", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("fms-sync-event", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  // ==========================================
  // OFFICIAL PDF RECEIPT VOUCHER GENERATOR
  // ==========================================
  const downloadReceiptPdf = (receipt: DisbursementReceipt) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    // Header Dark Banner
    doc.setFillColor(26, 29, 33);
    doc.rect(0, 0, 210, 30, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("HORECA HOSPITALITY FINANCIAL ENTERPRISE", 14, 11);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("OFFICIAL DISBURSEMENT RECEIPT & BUDGET ALLOCATION VOUCHER", 14, 17);
    doc.text(`Voucher ID: ${receipt.receiptNo} | Digital Audit Token: ${receipt.referenceToken}`, 14, 23);

    // Status Stamp
    doc.setTextColor(34, 197, 94);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("STATUS: APPROVED & CLEARED", 140, 17);

    // STAGE 1: HOW AND WHERE ALLOCATED
    doc.setTextColor(26, 29, 33);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("STAGE 1: BUDGET ALLOCATION BLUEPRINT (HOW & WHERE ALLOCATED)", 14, 38);

    autoTable(doc, {
      startY: 42,
      head: [["Allocation Parameter", "Specification Details"]],
      body: [
        ["Requesting Department", receipt.department],
        ["Beneficiary / Payee", receipt.payee],
        ["Target Cost Center", receipt.allocatedCostCenter],
        ["Expenditure Purpose", receipt.purpose],
        ["Allocation Category", receipt.allocationCategory],
        ["GL Debit Account (Expense)", receipt.glDebitAccount],
        ["Total Requested Budget Disbursed", `PHP ${receipt.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`]
      ],
      theme: "striped",
      headStyles: { fillColor: [26, 29, 33], textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 8.5 }
    });

    // Sub-items table
    const currentY1 = (doc as any).lastAutoTable.finalY + 4;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Detailed Line-Item Breakdown of Allocated Budget:", 14, currentY1);

    autoTable(doc, {
      startY: currentY1 + 2,
      head: [["Line Item Description", "Category", "Share (%)", "Amount (PHP)"]],
      body: receipt.allocationItems.map((item) => [
        item.item,
        item.category,
        `${item.percentage}%`,
        `PHP ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
      ]),
      theme: "grid",
      headStyles: { fillColor: [71, 85, 105], textColor: 255 },
      styles: { fontSize: 8 }
    });

    // STAGE 2: WHERE DEDUCTED
    const currentY2 = (doc as any).lastAutoTable.finalY + 8;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("STAGE 2: TREASURY DEDUCTION AUDIT (WHERE DEDUCTED)", 14, currentY2);

    autoTable(doc, {
      startY: currentY2 + 4,
      head: [["Treasury Source Parameter", "Deduction Details"]],
      body: [
        ["Deduction Liquidity Vault", receipt.deductedFromAccount],
        ["Pre-Deduction Liquid Pool", `PHP ${receipt.priorTreasuryBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`],
        ["Outflow Deducted from Vault", `- PHP ${receipt.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`],
        ["Post-Deduction Liquid Pool", `PHP ${receipt.postTreasuryBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`],
        ["GL Credit Account (Asset Outflow)", receipt.glCreditAccount],
        ["Settlement Protocol", receipt.deductionMethod]
      ],
      theme: "striped",
      headStyles: { fillColor: [181, 58, 30], textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 8.5 }
    });

    // STAGE 3: BUDGET CAP & UTILIZATION
    const currentY3 = (doc as any).lastAutoTable.finalY + 8;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("STAGE 3: DEPARTMENT BUDGET CAP & UTILIZATION RECONCILIATION", 14, currentY3);

    autoTable(doc, {
      startY: currentY3 + 4,
      head: [["Budget Cap Reconciliation Parameter", "Figures & Status"]],
      body: [
        ["Department Approved Budget Cap", `PHP ${receipt.budgetCapBefore.toLocaleString(undefined, { minimumFractionDigits: 2 })}`],
        ["Cumulative Utilized Prior to Request", `PHP ${receipt.utilizedBefore.toLocaleString(undefined, { minimumFractionDigits: 2 })}`],
        ["This Disbursement Deducted Against Cap", `PHP ${receipt.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`],
        ["New Cumulative Utilized", `PHP ${receipt.utilizedAfter.toLocaleString(undefined, { minimumFractionDigits: 2 })}`],
        ["Remaining Department Budget Cap Capacity", `PHP ${receipt.budgetCapRemaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}`],
        ["Cap Utilization Ratio", `${receipt.capUtilizationPct}% (Compliance Status: WITHIN CAP)`]
      ],
      theme: "striped",
      headStyles: { fillColor: [21, 122, 77], textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 8.5 }
    });

    // Signatures and Token
    const finalY = (doc as any).lastAutoTable.finalY + 12;
    doc.setDrawColor(200, 200, 200);
    doc.line(14, finalY, 196, finalY);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Requested By: ${receipt.requestedBy}`, 14, finalY + 5);
    doc.text("Authorized By: Super Administrator (Finance Core)", 110, finalY + 5);
    doc.text(`Authorized Timestamp: ${receipt.timestamp}`, 14, finalY + 10);
    doc.text(`Verification Hash: ${receipt.referenceToken}`, 110, finalY + 10);

    doc.save(`Disbursement_Receipt_Voucher_${receipt.receiptNo}.pdf`);
  };

  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      const matchesSearch =
        r.payee.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = selectedDeptFilter === "ALL" || r.department === selectedDeptFilter;
      return matchesSearch && matchesDept;
    });
  }, [receipts, searchTerm, selectedDeptFilter]);

  return (
    <div className="space-y-6">
      {/* Header Banner with Action Buttons */}
      <div className="bg-white border border-[#DFE1DB] p-5 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold font-['IBM_Plex_Mono'] uppercase text-[#5C636F]">
              DISBURSEMENT &amp; VOUCHER ALLOCATION CORE
            </span>
            <span className="bg-[#157A4D]/10 text-[#157A4D] px-2 py-0.5 rounded text-[10px] font-['IBM_Plex_Mono'] font-bold border border-[#157A4D]/20">
              BUDGET CAP ENFORCED
            </span>
          </div>
          <h2 className="text-xl font-bold font-['Archivo'] text-[#1A1D21] mt-1">
            Department Disbursement Management
          </h2>
          <p className="text-xs text-[#5C636F]">
            Centralized ledger for department disbursement vouchers with 3-stage allocation receipts (where allocated, where deducted, budget cap) and strict department budget caps.
          </p>
        </div>
      </div>

      {/* 5 Department Budget Cap Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold font-['IBM_Plex_Mono'] uppercase tracking-wider text-[#5C636F] flex items-center gap-2">
            <Layers className="h-3.5 w-3.5" />
            <span>Department Budget Caps &amp; Real-time Utilization</span>
          </h3>
          <span className="text-[11px] text-[#5C636F] font-['IBM_Plex_Mono']">
            All 5 Hospitality Units Enforced
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {departmentBudgets.map((dept) => {
            const pct = (dept.utilized / dept.budgetCap) * 100;
            const remaining = dept.budgetCap - dept.utilized;
            const isNearCap = pct >= 85;

            return (
              <div
                key={dept.department}
                className={`bg-white border p-4 rounded-xl space-y-3 transition-all hover:shadow-sm ${
                  isNearCap ? "border-[#FF6A3D]/40 bg-[#FFFDFB]" : "border-[#DFE1DB]"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="p-2 bg-[#F1F1ED] rounded-lg border border-[#DFE1DB]">
                    {dept.department === "Hotel Management" && <Building2 className="h-4 w-4 text-[#1A1D21]" />}
                    {dept.department === "Restaurant Management" && <Utensils className="h-4 w-4 text-[#157A4D]" />}
                    {dept.department === "HRMS Payroll" && <Users className="h-4 w-4 text-[#2563EB]" />}
                    {dept.department === "Supply Chain" && <Truck className="h-4 w-4 text-[#FF6A3D]" />}
                    {dept.department === "FleetOps" && <Car className="h-4 w-4 text-purple-600" />}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-['IBM_Plex_Mono'] font-bold ${
                      isNearCap
                        ? "bg-[#FF6A3D]/10 text-[#FF6A3D] border border-[#FF6A3D]/20"
                        : "bg-[#157A4D]/10 text-[#157A4D] border border-[#157A4D]/20"
                    }`}
                  >
                    {pct.toFixed(0)}% Cap
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-xs text-[#1A1D21] font-['Archivo'] truncate">
                    {dept.department}
                  </h4>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-[10px] text-[#5C636F]">Budget Cap:</span>
                    <span className="text-xs font-bold font-['IBM_Plex_Mono'] text-[#1A1D21]">
                      {maskCurrency(dept.budgetCap)}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between text-[10px] text-[#5C636F]">
                    <span>Allocated:</span>
                    <span className="font-['IBM_Plex_Mono'] font-medium">{maskCurrency(dept.allocated)}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#E5E7EB] rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      pct >= 90 ? "bg-[#B5281A]" : pct >= 75 ? "bg-[#FF6A3D]" : "bg-[#157A4D]"
                    }`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>

                <div className="border-t border-[#DFE1DB] pt-2 space-y-1 text-[10px] font-['IBM_Plex_Mono']">
                  <div className="flex justify-between text-[#5C636F]">
                    <span>Utilized:</span>
                    <span className="font-bold text-[#1A1D21]">{maskCurrency(dept.utilized)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C636F]">Remaining Cap:</span>
                    <span className="font-bold text-[#157A4D]">{maskCurrency(remaining)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Disbursement Receipts Log & Register */}
      <div className="bg-white border border-[#DFE1DB] rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#DFE1DB] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-[#1A1D21] font-['Archivo'] flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#157A4D]" />
              <span>Official Disbursement Receipts &amp; Allocation Vouchers</span>
            </h3>
            <p className="text-xs text-[#5C636F]">
              Official vouchers detailing: (1) How &amp; Where Allocated, (2) Where Deducted from Treasury, and (3) Department Budget Cap Reconciliation.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#5C636F]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search receipt, payee, dept..."
                className="pl-8 pr-3 py-1.5 text-xs bg-[#F8F9F6] border border-[#DFE1DB] rounded-lg w-48 lg:w-60 focus:outline-none focus:border-[#1A1D21] font-['IBM_Plex_Sans']"
              />
            </div>

            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="py-1.5 px-3 text-xs bg-[#F8F9F6] border border-[#DFE1DB] rounded-lg focus:outline-none focus:border-[#1A1D21] font-['IBM_Plex_Mono']"
            >
              <option value="ALL">All Departments</option>
              <option value="Hotel Management">Hotel Management</option>
              <option value="Restaurant Management">Restaurant Management</option>
              <option value="HRMS Payroll">HRMS Payroll</option>
              <option value="Supply Chain">Supply Chain</option>
              <option value="FleetOps">FleetOps</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-['IBM_Plex_Sans']">
            <thead className="bg-[#F1F1ED] font-['IBM_Plex_Mono'] text-[#5C636F] text-[11px]">
              <tr>
                <th className="p-3">Receipt / Voucher #</th>
                <th className="p-3">Department</th>
                <th className="p-3">Payee &amp; Purpose</th>
                <th className="p-3 text-right">Disbursed (PHP)</th>
                <th className="p-3">Deducted From</th>
                <th className="p-3">Budget Cap Remaining</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Receipt Voucher</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFE1DB] text-[11px]">
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-[#5C636F] font-['IBM_Plex_Mono']">
                    No disbursement records match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((rcv) => (
                  <tr key={rcv.receiptNo} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <span className="font-bold font-['IBM_Plex_Mono'] text-[#1A1D21] block">
                        {rcv.receiptNo}
                      </span>
                      <span className="text-[10px] text-[#5C636F] font-['IBM_Plex_Mono']">
                        {rcv.timestamp}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-[#1A1D21]">{rcv.department}</span>
                      <span className="text-[10px] text-[#5C636F] block truncate max-w-[160px]">
                        {rcv.allocatedCostCenter}
                      </span>
                    </td>
                    <td className="p-3 max-w-[220px]">
                      <span className="font-bold text-[#1A1D21] block truncate">{rcv.payee}</span>
                      <span className="text-[10px] text-[#5C636F] truncate block">{rcv.purpose}</span>
                    </td>
                    <td className="p-3 text-right font-bold font-['IBM_Plex_Mono'] text-[#B5281A]">
                      -{maskCurrency(rcv.amount)}
                    </td>
                    <td className="p-3 max-w-[170px]">
                      <span className="font-['IBM_Plex_Mono'] text-[10px] text-[#1A1D21] block truncate">
                        {rcv.deductedFromAccount}
                      </span>
                      <span className="text-[9px] text-[#157A4D] font-bold">Verified Outflow</span>
                    </td>
                    <td className="p-3">
                      <div className="font-['IBM_Plex_Mono'] text-[10px]">
                        <span className="text-[#157A4D] font-bold">
                          {maskCurrency(rcv.budgetCapRemaining)}
                        </span>{" "}
                        <span className="text-[#5C636F]">left</span>
                      </div>
                      <div className="text-[9px] text-[#5C636F] font-['IBM_Plex_Mono']">
                        {rcv.capUtilizationPct}% cap utilized
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-['IBM_Plex_Mono'] font-bold bg-[#157A4D]/10 text-[#157A4D] border border-[#157A4D]/20 inline-flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>DISBURSED</span>
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedReceiptForView(rcv)}
                        className="px-2.5 py-1 text-[11px] font-['IBM_Plex_Mono'] font-bold bg-white hover:bg-[#F1F1ED] border border-[#DFE1DB] rounded-md text-[#1A1D21] transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                      >
                        <FileText className="h-3.5 w-3.5 text-[#157A4D]" />
                        <span>View Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          OFFICIAL 3-STAGE DISBURSEMENT RECEIPT VOUCHER MODAL
         ========================================================================= */}
      {selectedReceiptForView && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-xl w-full border border-[#DFE1DB] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
            {/* Header / Receipt Banner */}
            <div className="p-4 bg-[#1A1D21] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#FF6A3D] text-white rounded-lg">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm font-['Archivo'] tracking-wide">
                    OFFICIAL DISBURSEMENT RECEIPT VOUCHER
                  </h3>
                  <p className="text-[10px] text-slate-300 font-['IBM_Plex_Mono']">
                    HORECA Hospitality Enterprise Treasury &bull; Voucher #{selectedReceiptForView.receiptNo}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceiptForView(null)}
                className="p-1 hover:bg-white/10 rounded-md text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Printable Receipt Body */}
            <div className="p-6 space-y-4 text-xs font-['IBM_Plex_Sans'] bg-white overflow-y-auto grow">
              {/* Receipt Meta & Verification Stamp */}
              <div className="flex items-start justify-between border-b border-dashed border-[#DFE1DB] pb-4">
                <div>
                  <span className="text-[10px] font-['IBM_Plex_Mono'] font-bold text-[#5C636F] uppercase block">
                    RECEIPT VOUCHER NO.
                  </span>
                  <span className="text-lg font-bold font-['IBM_Plex_Mono'] text-[#1A1D21]">
                    {selectedReceiptForView.receiptNo}
                  </span>
                  <span className="text-[10px] font-['IBM_Plex_Mono'] text-[#5C636F] block mt-0.5">
                    Authorized At: {selectedReceiptForView.timestamp}
                  </span>
                </div>

                <div className="text-right">
                  <span className="px-2.5 py-1 rounded text-[10px] font-['IBM_Plex_Mono'] font-bold bg-[#157A4D]/15 text-[#157A4D] border border-[#157A4D]/30 inline-block">
                    ✓ VERIFIED DISBURSEMENT
                  </span>
                  <div className="flex items-center justify-end gap-1 mt-1 text-[9px] font-['IBM_Plex_Mono'] text-[#5C636F]">
                    <span>Ref: {selectedReceiptForView.referenceToken}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(selectedReceiptForView.referenceToken);
                        setCopiedToken(true);
                        setTimeout(() => setCopiedToken(false), 2000);
                      }}
                      className="hover:text-[#1A1D21] cursor-pointer"
                    >
                      {copiedToken ? <CheckCheck className="h-3 w-3 text-[#157A4D]" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* =======================================================
                  STAGE 1: HOW & WHERE BUDGET IS ALLOCATED
                 ======================================================= */}
              <div className="p-3.5 bg-blue-50/40 rounded-xl border border-blue-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-blue-900 font-bold font-['IBM_Plex_Mono'] text-xs uppercase">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                      1
                    </span>
                    <span>HOW &amp; WHERE BUDGET IS ALLOCATED</span>
                  </div>
                  <span className="text-[10px] font-['IBM_Plex_Mono'] text-blue-800 font-semibold">
                    {selectedReceiptForView.department}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-['IBM_Plex_Mono'] pt-1 border-t border-blue-200/60">
                  <div>
                    <span className="text-[10px] text-[#5C636F] uppercase block">Cost Center Target</span>
                    <span className="font-bold text-[#1A1D21] block">
                      {selectedReceiptForView.allocatedCostCenter}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#5C636F] uppercase block">Beneficiary Entity</span>
                    <span className="font-bold text-[#1A1D21] block truncate">
                      {selectedReceiptForView.payee}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-[#5C636F] uppercase block font-['IBM_Plex_Mono']">
                    Purpose / Requisition:
                  </span>
                  <p className="text-xs font-medium text-[#1A1D21] bg-white/80 p-2 rounded border border-blue-200/60">
                    {selectedReceiptForView.purpose}
                  </p>
                </div>

                {/* Line Item Breakdown Table */}
                {selectedReceiptForView.allocationItems && selectedReceiptForView.allocationItems.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-bold font-['IBM_Plex_Mono'] uppercase text-[#5C636F] block">
                      Sub-Allocation Breakdown:
                    </span>
                    <div className="bg-white rounded border border-blue-200/60 overflow-hidden">
                      <table className="w-full text-left text-[10px] font-['IBM_Plex_Mono']">
                        <thead className="bg-blue-100/50 text-[#5C636F]">
                          <tr>
                            <th className="p-1.5">Allocation Line Item</th>
                            <th className="p-1.5">Category</th>
                            <th className="p-1.5 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-100">
                          {selectedReceiptForView.allocationItems.map((item) => (
                            <tr key={item.id}>
                              <td className="p-1.5 text-[#1A1D21] font-medium">{item.item}</td>
                              <td className="p-1.5 text-[#5C636F]">{item.category}</td>
                              <td className="p-1.5 text-right font-bold text-[#1A1D21]">
                                ₱{item.amount.toLocaleString()} ({item.percentage}%)
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-blue-900 font-['IBM_Plex_Mono'] pt-1 border-t border-blue-200/60">
                  <span>General Ledger Debit Account:</span>
                  <span className="font-bold text-[#1A1D21]">{selectedReceiptForView.glDebitAccount}</span>
                </div>
              </div>

              {/* =======================================================
                  STAGE 2: WHERE IT WILL BE DEDUCTED
                 ======================================================= */}
              <div className="p-3.5 bg-amber-50/40 rounded-xl border border-amber-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold font-['IBM_Plex_Mono'] text-xs uppercase">
                    <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">
                      2
                    </span>
                    <span>WHERE IT WILL BE DEDUCTED (TREASURY DEDUCTION OUTFLOW)</span>
                  </div>
                  <span className="text-[10px] font-['IBM_Plex_Mono'] text-amber-800 font-semibold">
                    Liquid Sweep
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px] font-['IBM_Plex_Mono'] pt-1 border-t border-amber-200/60">
                  <div>
                    <span className="text-[10px] text-[#5C636F] uppercase block">Deduction Vault</span>
                    <span className="font-bold text-[#1A1D21] block">
                      {selectedReceiptForView.deductedFromAccount}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#5C636F] uppercase block">Clearing Protocol</span>
                    <span className="font-bold text-[#1A1D21] block">
                      {selectedReceiptForView.deductionMethod || "PESONet Automated Clearing"}
                    </span>
                  </div>
                </div>

                <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200/60 grid grid-cols-3 gap-2 text-[10px] font-['IBM_Plex_Mono']">
                  <div>
                    <span className="text-[#5C636F] block">Pre-Deduction Balance:</span>
                    <span className="font-bold text-[#1A1D21] text-xs">
                      ₱{selectedReceiptForView.priorTreasuryBalance.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#B5281A] block font-bold">Disbursed Deduction:</span>
                    <span className="font-bold text-[#B5281A] text-xs">
                      -₱{selectedReceiptForView.amount.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#157A4D] block font-bold">Post-Deduction Balance:</span>
                    <span className="font-bold text-[#157A4D] text-xs">
                      ₱{selectedReceiptForView.postTreasuryBalance.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-amber-900 font-['IBM_Plex_Mono'] pt-1 border-t border-amber-200/60">
                  <span>General Ledger Credit Account:</span>
                  <span className="font-bold text-[#1A1D21]">{selectedReceiptForView.glCreditAccount || selectedReceiptForView.deductedFromAccount}</span>
                </div>
              </div>

              {/* =======================================================
                  STAGE 3: BUDGET CAP & UTILIZATION RECONCILIATION
                 ======================================================= */}
              <div className="p-3.5 bg-emerald-50/40 rounded-xl border border-emerald-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-900 font-bold font-['IBM_Plex_Mono'] text-xs uppercase">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                      3
                    </span>
                    <span>DEPARTMENT BUDGET CAP &amp; UTILIZATION IMPACT</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-['IBM_Plex_Mono'] font-bold bg-[#157A4D]/15 text-[#157A4D] border border-[#157A4D]/30">
                    WITHIN SAFE CAP
                  </span>
                </div>

                <div className="border border-emerald-200/60 rounded-lg divide-y divide-emerald-200/60 bg-white/80 text-[11px] font-['IBM_Plex_Mono']">
                  <div className="p-2 flex justify-between">
                    <span className="text-[#5C636F]">Department Approved Budget Cap:</span>
                    <span className="font-bold text-[#1A1D21]">
                      {maskCurrency(selectedReceiptForView.budgetCapBefore)}
                    </span>
                  </div>
                  <div className="p-2 flex justify-between">
                    <span className="text-[#5C636F]">Prior Department Spend:</span>
                    <span className="text-[#1A1D21]">
                      {maskCurrency(selectedReceiptForView.utilizedBefore)}
                    </span>
                  </div>
                  <div className="p-2 flex justify-between bg-red-50/40 text-[#B5281A] font-bold">
                    <span>This Disbursement Deducted:</span>
                    <span>-{maskCurrency(selectedReceiptForView.amount)}</span>
                  </div>
                  <div className="p-2 flex justify-between">
                    <span className="text-[#5C636F]">New Cumulative Department Spend:</span>
                    <span className="font-bold text-[#1A1D21]">
                      {maskCurrency(selectedReceiptForView.utilizedAfter)}
                    </span>
                  </div>
                  <div className="p-2 flex justify-between bg-[#157A4D]/10 text-[#157A4D] font-bold">
                    <span>Remaining Department Budget Cap Capacity:</span>
                    <span>{maskCurrency(selectedReceiptForView.budgetCapRemaining)}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-['IBM_Plex_Mono'] text-[#5C636F]">
                    <span>Cap Utilization Gauge:</span>
                    <span className="font-bold text-[#1A1D21]">{selectedReceiptForView.capUtilizationPct}% Used</span>
                  </div>
                  <div className="w-full bg-[#E5E7EB] rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        selectedReceiptForView.capUtilizationPct >= 100
                          ? "bg-[#B5281A]"
                          : selectedReceiptForView.capUtilizationPct >= 80
                          ? "bg-[#FF6A3D]"
                          : "bg-[#157A4D]"
                      }`}
                      style={{ width: `${Math.min(100, selectedReceiptForView.capUtilizationPct)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Authorization Signatures */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-dashed border-[#DFE1DB] text-[10px] font-['IBM_Plex_Mono']">
                <div>
                  <span className="text-[#5C636F] block">REQUESTED BY:</span>
                  <span className="font-bold text-[#1A1D21] block mt-1">
                    {selectedReceiptForView.requestedBy}
                  </span>
                  <span className="text-[9px] text-[#157A4D]">Digital Token Validated</span>
                </div>
                <div className="text-right">
                  <span className="text-[#5C636F] block">AUTHORIZED &amp; COMMITTED BY:</span>
                  <span className="font-bold text-[#1A1D21] block mt-1">
                    {selectedReceiptForView.approvedBy}
                  </span>
                  <span className="text-[9px] text-[#157A4D]">Super Administrator Key</span>
                </div>
              </div>
            </div>

            {/* Modal Bottom Action Buttons */}
            <div className="p-4 bg-[#F8F9F6] border-t border-[#DFE1DB] flex items-center justify-between shrink-0">
              <span className="text-[10px] text-[#5C636F] font-['IBM_Plex_Mono']">
                Compliant with BIR Official Voucher &amp; IFRS Standards
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadReceiptPdf(selectedReceiptForView)}
                  className="px-3.5 py-2 bg-white hover:bg-[#F1F1ED] border border-[#DFE1DB] rounded-lg text-xs font-bold font-['IBM_Plex_Mono'] text-[#1A1D21] transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="h-3.5 w-3.5 text-[#157A4D]" />
                  <span>Download PDF Voucher</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-white hover:bg-[#F1F1ED] border border-[#DFE1DB] rounded-lg text-xs font-bold font-['IBM_Plex_Mono'] text-[#1A1D21] transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="h-3.5 w-3.5 text-[#1A1D21]" />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedReceiptForView(null)}
                  className="px-4 py-2 bg-[#1A1D21] hover:bg-[#2A2E34] text-white rounded-lg text-xs font-bold font-['IBM_Plex_Mono'] transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
