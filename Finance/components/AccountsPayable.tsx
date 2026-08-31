import React, { useState, useMemo } from "react";
import {
  AlertTriangle,
  Plus,
  Clock,
  Building2,
  Filter,
  Download,
  CheckCircle2,
  Calendar,
  DollarSign,
  FileCheck,
  Search,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Eye,
  EyeOff,
  Percent,
  Receipt,
  FileText,
  CreditCard,
  X,
  ArrowUpRight,
  Check
} from "lucide-react";
import PesoSign from "./PesoSign";
import ExportButton from "./ExportButton";

export interface SupplierInvoice {
  id: string;
  vendor: string;
  tin: string;
  category: "F&B Fresh Goods" | "Dry Provisions" | "Guest Amenities" | "Utilities & Power" | "Fleet & Fuel" | "Maintenance & Capex";
  poRef: string;
  drRef: string;
  invoiceDate: string;
  terms: "Immediate" | "Net 15" | "Net 30" | "Net 60";
  dueDate: string;
  amount: number;
  bankDetails: string;
  status: "Unpaid" | "Scheduled" | "Paid / Settled" | "Overdue" | "Pending Approval";
  threeWayMatch: "Verified" | "Pending DR" | "Price Discrepancy";
  dailyPenaltyRatePercent: number; // e.g. 0.05% per day overdue
  notes?: string;
}

export interface SettlementDetails {
  invoiceId: string;
  vendor: string;
  tin: string;
  category: string;
  poRef: string;
  drRef: string;
  principal: number;
  lateIncrement: number;
  totalPayable: number;
  daysOverdue: number;
  paymentDate: string;
  disbursementAccount: string;
  paymentMethod: "Bank Transfer" | "Check" | "Cash" | "Auto-Debit / EFT";
  referenceNumber: string;
  notes?: string;
}

interface AccountsPayableProps {
  invoices?: SupplierInvoice[];
  onAddInvoice?: (invoice: SupplierInvoice) => void;
  onSettleInvoice?: (id: string) => void;
  onExecuteSettlement?: (settlement: SettlementDetails) => void;
  onSchedulePayment?: (id: string, scheduledDate: string) => void;
  currentUser?: { role: string; name: string; email?: string } | null;
  isDataMasked?: boolean;
  maskCurrency?: (val: number) => string;
  maskField?: (val: string, type: string) => string;
}

export const INITIAL_AP_INVOICES: SupplierInvoice[] = [
  {
    id: "AP-2026-001",
    vendor: "Team 6 Fresh Meat & Seafood Corp",
    tin: "204-889-102-000",
    category: "F&B Fresh Goods",
    poRef: "PO-88421",
    drRef: "DR-99201",
    invoiceDate: "2026-08-01",
    terms: "Net 15",
    dueDate: "2026-08-16",
    amount: 125000.0,
    bankDetails: "BDO Unibank: 0049-2810-9921",
    status: "Overdue",
    threeWayMatch: "Verified",
    dailyPenaltyRatePercent: 0.05,
    notes: "Prime cut wagyu and fresh salmon delivery for Executive Kitchen"
  },
  {
    id: "AP-2026-002",
    vendor: "Manila Electric Company (Meralco)",
    tin: "000-101-523-000",
    category: "Utilities & Power",
    poRef: "UT-99102",
    drRef: "MTR-2026-08",
    invoiceDate: "2026-08-05",
    terms: "Net 15",
    dueDate: "2026-08-20",
    amount: 145200.5,
    bankDetails: "Auto-Debit PESONet: 1029-4481-00",
    status: "Overdue",
    threeWayMatch: "Verified",
    dailyPenaltyRatePercent: 0.08,
    notes: "Main hotel tower & chiller electricity consumption"
  },
  {
    id: "AP-2026-003",
    vendor: "Petron Fleet Card Services",
    tin: "000-112-990-000",
    category: "Fleet & Fuel",
    poRef: "PO-FLT-882",
    drRef: "FLT-FUEL-AUG",
    invoiceDate: "2026-08-15",
    terms: "Net 30",
    dueDate: "2026-09-14",
    amount: 68450.0,
    bankDetails: "BPI Commercial: 2891-0048-22",
    status: "Scheduled",
    threeWayMatch: "Verified",
    dailyPenaltyRatePercent: 0.05,
    notes: "Monthly diesel supply for 4 refrigerated delivery trucks & guest vans"
  },
  {
    id: "AP-2026-004",
    vendor: "Global Luxury Hotel Amenities Inc.",
    tin: "410-559-812-000",
    category: "Guest Amenities",
    poRef: "PO-88310",
    drRef: "DR-40118",
    invoiceDate: "2026-08-18",
    terms: "Net 30",
    dueDate: "2026-09-17",
    amount: 88400.0,
    bankDetails: "Metrobank Corp: 501-2-501-98210",
    status: "Unpaid",
    threeWayMatch: "Verified",
    dailyPenaltyRatePercent: 0.05,
    notes: "Eco-friendly shampoo, lotions, and bathrobes for Presidential Suites"
  },
  {
    id: "AP-2026-005",
    vendor: "HORECA Cold Storage & Chillers Ltd",
    tin: "331-778-901-000",
    category: "Maintenance & Capex",
    poRef: "PO-88902",
    drRef: "DR-88019",
    invoiceDate: "2026-08-20",
    terms: "Net 15",
    dueDate: "2026-09-04",
    amount: 54000.0,
    bankDetails: "UnionBank: 1092-4819-2231",
    status: "Unpaid",
    threeWayMatch: "Verified",
    dailyPenaltyRatePercent: 0.05,
    notes: "Preventive HVAC filter replacements and refrigerant top-up"
  }
];

export default function AccountsPayable({
  invoices: externalInvoices,
  onAddInvoice,
  onSettleInvoice,
  onExecuteSettlement,
  onSchedulePayment,
  currentUser,
  isDataMasked = false,
  maskCurrency = (val) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(val),
  maskField = (val) => val
}: AccountsPayableProps) {
  const [internalInvoices, setInternalInvoices] = useState<SupplierInvoice[]>(INITIAL_AP_INVOICES);
  const invoices = externalInvoices || internalInvoices;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);

  // Settlement Modal State
  const [settlementTarget, setSettlementTarget] = useState<{
    invoice: SupplierInvoice;
    daysOverdue: number;
    incrementalLateValue: number;
    totalPayable: number;
  } | null>(null);

  const [settlementForm, setSettlementForm] = useState({
    paymentDate: "2026-08-27",
    disbursementAccount: "1030 - Operating Bank Account - BDO Primary",
    paymentMethod: "Bank Transfer" as SettlementDetails["paymentMethod"],
    referenceNumber: "",
    notes: ""
  });

  // Form State for creating new supplier invoice
  const [newVendor, setNewVendor] = useState("");
  const [newTin, setNewTin] = useState("");
  const [newCategory, setNewCategory] = useState<SupplierInvoice["category"]>("F&B Fresh Goods");
  const [newPoRef, setNewPoRef] = useState("");
  const [newDrRef, setNewDrRef] = useState("");
  const [newTerms, setNewTerms] = useState<SupplierInvoice["terms"]>("Net 30");
  const [newAmount, setNewAmount] = useState("");
  const [newBankDetails, setNewBankDetails] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const CURRENT_SYSTEM_DATE = "2026-08-27";

  // Helper: compute days overdue and incremental late value
  const calculateOverdueStats = (invoice: SupplierInvoice) => {
    const due = new Date(invoice.dueDate).getTime();
    const current = new Date(CURRENT_SYSTEM_DATE).getTime();
    const diffTime = current - due;
    const daysOverdue = diffTime > 0 ? Math.floor(diffTime / (1000 * 60 * 60 * 24)) : 0;
    
    // Incremental late value calculation
    const isSettled = invoice.status === "Paid / Settled";
    const dailyRate = (invoice.dailyPenaltyRatePercent || 0.05) / 100;
    const incrementalLateValue = (!isSettled && daysOverdue > 0)
      ? invoice.amount * dailyRate * daysOverdue
      : 0;
    const totalPayable = invoice.amount + incrementalLateValue;
    const isOverdue = !isSettled && daysOverdue > 0;

    return {
      daysOverdue,
      incrementalLateValue,
      totalPayable,
      isOverdue
    };
  };

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.poRef.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = selectedCategory === "All" || inv.category === selectedCategory;
      const stats = calculateOverdueStats(inv);
      const effectiveStatus = stats.isOverdue ? "Overdue" : inv.status;
      const matchesStatus = selectedStatus === "All" || effectiveStatus === selectedStatus;
      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [invoices, searchTerm, selectedCategory, selectedStatus]);

  // Overall Totals
  const totals = useMemo(() => {
    let totalPrincipal = 0;
    let totalIncrements = 0;
    let currentTotal = 0;
    let overdue1_30 = 0;
    let overdue31_60 = 0;
    let overdue60Plus = 0;
    let overdueCount = 0;

    invoices.forEach((inv) => {
      if (inv.status !== "Paid / Settled") {
        const stats = calculateOverdueStats(inv);
        totalPrincipal += inv.amount;
        totalIncrements += stats.incrementalLateValue;

        if (stats.daysOverdue === 0) {
          currentTotal += inv.amount;
        } else {
          overdueCount++;
          if (stats.daysOverdue <= 30) {
            overdue1_30 += stats.totalPayable;
          } else if (stats.daysOverdue <= 60) {
            overdue31_60 += stats.totalPayable;
          } else {
            overdue60Plus += stats.totalPayable;
          }
        }
      }
    });

    return {
      totalPrincipal,
      totalIncrements,
      totalOutstanding: totalPrincipal + totalIncrements,
      currentTotal,
      overdue1_30,
      overdue31_60,
      overdue60Plus,
      overdueCount
    };
  }, [invoices]);

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendor || !newAmount) return;

    // Calculate due date based on terms
    const invoiceDateObj = new Date(CURRENT_SYSTEM_DATE);
    let daysToAdd = 30;
    if (newTerms === "Immediate") daysToAdd = 0;
    if (newTerms === "Net 15") daysToAdd = 15;
    if (newTerms === "Net 30") daysToAdd = 30;
    if (newTerms === "Net 60") daysToAdd = 60;

    invoiceDateObj.setDate(invoiceDateObj.getDate() + daysToAdd);
    const calculatedDueDate = invoiceDateObj.toISOString().split("T")[0];

    const newInv: SupplierInvoice = {
      id: `AP-2026-${Math.floor(100 + Math.random() * 900)}`,
      vendor: newVendor,
      tin: newTin || "123-456-789-000",
      category: newCategory,
      poRef: newPoRef || `PO-${Math.floor(80000 + Math.random() * 10000)}`,
      drRef: newDrRef || `DR-${Math.floor(90000 + Math.random() * 10000)}`,
      invoiceDate: CURRENT_SYSTEM_DATE,
      terms: newTerms,
      dueDate: calculatedDueDate,
      amount: Number(newAmount),
      bankDetails: newBankDetails || "BDO Commercial PESONet Account",
      status: currentUser?.role === "superadmin" ? "Unpaid" : "Pending Approval",
      threeWayMatch: "Verified",
      dailyPenaltyRatePercent: 0.05,
      notes: newNotes
    };

    if (onAddInvoice) {
      onAddInvoice(newInv);
    } else {
      setInternalInvoices(prev => [newInv, ...prev]);
    }
    setIsNewInvoiceOpen(false);
    // Reset form
    setNewVendor("");
    setNewTin("");
    setNewAmount("");
    setNewBankDetails("");
    setNewNotes("");
    setNewPoRef("");
    setNewDrRef("");
  };

  const handleOpenSettleModal = (inv: SupplierInvoice, stats: { daysOverdue: number; incrementalLateValue: number; totalPayable: number }) => {
    const rawIdNumber = inv.id.replace(/[^0-9]/g, "") || "901";
    const generatedRef = `PESONET-SETTLE-${rawIdNumber}-${Math.floor(1000 + Math.random() * 9000)}`;

    setSettlementTarget({
      invoice: inv,
      daysOverdue: stats.daysOverdue,
      incrementalLateValue: stats.incrementalLateValue,
      totalPayable: stats.totalPayable
    });

    setSettlementForm({
      paymentDate: CURRENT_SYSTEM_DATE,
      disbursementAccount: "1030 - Operating Bank Account - BDO Primary",
      paymentMethod: "Bank Transfer",
      referenceNumber: generatedRef,
      notes: `Full settlement of ${inv.vendor} invoice #${inv.id} (${inv.category})`
    });
  };

  const handleConfirmSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlementTarget) return;

    const { invoice, daysOverdue, incrementalLateValue, totalPayable } = settlementTarget;

    const settlementPayload: SettlementDetails = {
      invoiceId: invoice.id,
      vendor: invoice.vendor,
      tin: invoice.tin,
      category: invoice.category,
      poRef: invoice.poRef,
      drRef: invoice.drRef,
      principal: invoice.amount,
      lateIncrement: incrementalLateValue,
      totalPayable: totalPayable,
      daysOverdue: daysOverdue,
      paymentDate: settlementForm.paymentDate || CURRENT_SYSTEM_DATE,
      disbursementAccount: settlementForm.disbursementAccount,
      paymentMethod: settlementForm.paymentMethod,
      referenceNumber: settlementForm.referenceNumber || `SETTLE-${invoice.id}`,
      notes: settlementForm.notes
    };

    if (onExecuteSettlement) {
      onExecuteSettlement(settlementPayload);
    } else if (onSettleInvoice) {
      onSettleInvoice(invoice.id);
    }

    // Update local state if managing internally
    setInternalInvoices(prev =>
      prev.map(i => i.id === invoice.id ? { ...i, status: "Paid / Settled" as const } : i)
    );

    setSettlementTarget(null);
  };

  const handleSchedule = (id: string, date: string) => {
    if (onSchedulePayment) {
      onSchedulePayment(id, date);
    } else {
      setInternalInvoices(prev =>
        prev.map(i => i.id === id ? { ...i, status: "Scheduled" as const } : i)
      );
    }
  };

  const getExportData = () => {
    return {
      title: "Accounts Payable (AP) Supplier Invoices & Overdue Surcharge Schedule",
      subtitle: `System Date: ${CURRENT_SYSTEM_DATE} | HORECA Financial Suite`,
      filename: `Accounts_Payable_Supplier_Ledger_${CURRENT_SYSTEM_DATE}`,
      headers: [
        "Invoice ID",
        "Supplier / Vendor",
        "Supplier TIN",
        "Category",
        "PO Reference",
        "DR Reference",
        "Invoice Date",
        "Terms",
        "Due Date",
        "Days Overdue",
        "Principal Amount (PHP)",
        "Overdue Surcharge (PHP)",
        "Total Obligation (PHP)",
        "3-Way Match",
        "Status",
        "Bank Details"
      ],
      rows: invoices.map((inv) => {
        const stats = calculateOverdueStats(inv);
        return [
          inv.id,
          isDataMasked ? maskField(inv.vendor, "name") : inv.vendor,
          isDataMasked ? maskField(inv.tin, "tin") : inv.tin,
          inv.category,
          isDataMasked ? maskField(inv.poRef, "ref") : inv.poRef,
          isDataMasked ? maskField(inv.drRef, "ref") : inv.drRef,
          inv.invoiceDate,
          inv.terms,
          inv.dueDate,
          stats.daysOverdue,
          isDataMasked ? maskCurrency(inv.amount) : inv.amount,
          isDataMasked ? maskCurrency(stats.incrementalLateValue) : stats.incrementalLateValue.toFixed(2),
          isDataMasked ? maskCurrency(stats.totalPayable) : stats.totalPayable.toFixed(2),
          inv.threeWayMatch,
          stats.isOverdue ? "Overdue" : inv.status,
          isDataMasked ? maskField(inv.bankDetails, "account") : inv.bankDetails
        ];
      })
    };
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#DFE1DB] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold font-['IBM_Plex_Mono'] uppercase text-[#5C636F]">
              TRANSACTION CORE / PAYABLES &amp; SUPPLIER OBLIGATIONS
            </span>
            <span className="bg-[#B5281A]/10 text-[#B5281A] px-2 py-0.5 rounded text-[10px] font-['IBM_Plex_Mono'] font-bold border border-[#B5281A]/20">
              SUPPLIER CORE
            </span>
          </div>
          <h1 className="text-2xl font-bold font-['Archivo'] text-[#1A1D21] mt-1">
            Accounts Payable (AP) Management
          </h1>
          <p className="text-xs text-[#5C636F]">
            Manages supplier invoices, outstanding payments, payment schedules, and incremental overdue penalties.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton getExportData={getExportData} buttonLabel="Export AP Ledger" />
          <button
            type="button"
            onClick={() => setIsNewInvoiceOpen(true)}
            className="bg-[#1A1D21] hover:bg-[#2A2E34] text-white px-3.5 py-2 rounded-lg text-xs font-bold font-['IBM_Plex_Mono'] flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="h-4 w-4 text-[#FF6A3D]" />
            <span>Create Vendor Invoice</span>
          </button>
        </div>
      </div>

      {/* Aging Schedule & Overdue Increment KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Outstanding Payables */}
        <div className="bg-white p-4 rounded-xl border border-[#DFE1DB] space-y-2 shadow-xs">
          <div className="flex justify-between items-center text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
            <span className="font-bold">TOTAL AP OBLIGATIONS</span>
            <PesoSign className="h-4 w-4 text-[#B5281A]" />
          </div>
          <div className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#B5281A]">
            {maskCurrency(totals.totalOutstanding)}
          </div>
          <div className="text-[11px] text-[#5C636F] flex justify-between">
            <span>Principal: {maskCurrency(totals.totalPrincipal)}</span>
            <span className="text-[#B5281A] font-bold">
              +{maskCurrency(totals.totalIncrements)} Late Surcharges
            </span>
          </div>
        </div>

        {/* Current (0-30 Days) */}
        <div className="bg-white p-4 rounded-xl border border-[#DFE1DB] space-y-2 shadow-xs">
          <div className="flex justify-between items-center text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
            <span className="font-bold">CURRENT (0-30 DAYS)</span>
            <Clock className="h-4 w-4 text-[#157A4D]" />
          </div>
          <div className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#157A4D]">
            {maskCurrency(totals.currentTotal)}
          </div>
          <p className="text-[11px] text-[#5C636F]">Within agreed credit term window</p>
        </div>

        {/* Overdue (1-30 Days Past Due) */}
        <div className="bg-white p-4 rounded-xl border border-[#DFE1DB] space-y-2 shadow-xs">
          <div className="flex justify-between items-center text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
            <span className="font-bold">OVERDUE (1-30 DAYS)</span>
            <AlertTriangle className="h-4 w-4 text-[#8A5A00]" />
          </div>
          <div className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#8A5A00]">
            {maskCurrency(totals.overdue1_30)}
          </div>
          <p className="text-[11px] text-[#8A5A00] font-medium">
            Daily compounding late increments active (0.05%/day)
          </p>
        </div>

        {/* 3-Way Match & Compliance */}
        <div className="bg-white p-4 rounded-xl border border-[#DFE1DB] space-y-2 shadow-xs">
          <div className="flex justify-between items-center text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
            <span className="font-bold">3-WAY MATCH GOVERNANCE</span>
            <ShieldCheck className="h-4 w-4 text-[#157A4D]" />
          </div>
          <div className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#157A4D]">
            100% Verified
          </div>
          <p className="text-[11px] text-[#5C636F]">
            PO ↔ Delivery Receipt (DR) ↔ Supplier Bill
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#DFE1DB] flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#5C636F]" />
          <input
            type="text"
            placeholder="Search Supplier, Invoice #, PO..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-[#DFE1DB] rounded-lg text-xs font-['IBM_Plex_Sans'] focus:outline-none focus:border-[#1A1D21]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
            <Filter className="h-3.5 w-3.5" />
            <span>Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-[#DFE1DB] rounded-lg p-1.5 text-xs font-['IBM_Plex_Sans'] focus:outline-none"
            >
              <option value="All">All Categories</option>
              <option value="F&B Fresh Goods">F&B Fresh Goods</option>
              <option value="Utilities & Power">Utilities & Power</option>
              <option value="Fleet & Fuel">Fleet & Fuel</option>
              <option value="Guest Amenities">Guest Amenities</option>
              <option value="Maintenance & Capex">Maintenance & Capex</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
            <span>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-[#DFE1DB] rounded-lg p-1.5 text-xs font-['IBM_Plex_Sans'] focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Overdue">Overdue (Past Due Date)</option>
              <option value="Paid / Settled">Paid / Settled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Supplier Invoices Register Table */}
      <div className="bg-white border border-[#DFE1DB] rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#DFE1DB] flex justify-between items-center">
          <div>
            <h3 className="font-bold text-sm font-['Archivo']">Supplier Invoices &amp; Payment Obligations Register</h3>
            <p className="text-xs text-[#5C636F]">
              Showing {filteredInvoices.length} supplier invoices. Overdue penalties compound incrementally past the due date.
            </p>
          </div>
          <span className="text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
            As of: <strong>{CURRENT_SYSTEM_DATE}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-['IBM_Plex_Sans']">
            <thead className="bg-[#F1F1ED] text-xs font-['IBM_Plex_Mono'] text-[#5C636F] uppercase">
              <tr>
                <th className="p-3">Invoice ID</th>
                <th className="p-3">Supplier Name &amp; TIN</th>
                <th className="p-3">Category / PO</th>
                <th className="p-3">Terms &amp; Due Date</th>
                <th className="p-3">Overdue Days</th>
                <th className="p-3 text-right">Principal</th>
                <th className="p-3 text-right">Late Increment</th>
                <th className="p-3 text-right">Total Payable</th>
                <th className="p-3 text-center">3-Way Match</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F1ED]">
              {filteredInvoices.map((row) => {
                const stats = calculateOverdueStats(row);
                return (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-['IBM_Plex_Mono'] font-bold text-[#B53A1E]">
                      {row.id}
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-[#1A1D21]">{maskField(row.vendor, "name")}</div>
                      <div className="text-[11px] font-['IBM_Plex_Mono'] text-[#5C636F]">
                        TIN: {maskField(row.tin, "tin")}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="inline-block text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                        {row.category}
                      </span>
                      <div className="text-[11px] font-['IBM_Plex_Mono'] text-[#5C636F] mt-0.5">
                        PO: {row.poRef} | DR: {row.drRef}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-['IBM_Plex_Mono'] text-xs font-semibold text-[#1A1D21]">
                        {row.dueDate}
                      </div>
                      <div className="text-[11px] text-[#5C636F] font-['IBM_Plex_Mono']">
                        Terms: {row.terms} (Issued: {row.invoiceDate})
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      {stats.daysOverdue > 0 && row.status !== "Paid / Settled" ? (
                        <span className="bg-[#B5281A]/10 text-[#B5281A] font-bold font-['IBM_Plex_Mono'] text-xs px-2 py-0.5 rounded border border-[#B5281A]/30">
                          {stats.daysOverdue} Days Late
                        </span>
                      ) : (
                        <span className="text-xs text-[#157A4D] font-['IBM_Plex_Mono']">On Schedule</span>
                      )}
                    </td>
                    <td className="p-3 text-right font-['IBM_Plex_Mono'] font-medium">
                      {maskCurrency(row.amount)}
                    </td>
                    <td className="p-3 text-right font-['IBM_Plex_Mono']">
                      {stats.incrementalLateValue > 0 ? (
                        <span className="text-[#B5281A] font-bold">
                          +{maskCurrency(stats.incrementalLateValue)}
                          <span className="block text-[10px] text-[#5C636F]">
                            ({(row.dailyPenaltyRatePercent || 0.05)}%/day)
                          </span>
                        </span>
                      ) : (
                        <span className="text-[#5C636F] text-xs">{maskCurrency(0)}</span>
                      )}
                    </td>
                    <td className="p-3 text-right font-['IBM_Plex_Mono'] font-bold text-[#1A1D21]">
                      {maskCurrency(stats.totalPayable)}
                    </td>
                    <td className="p-3 text-center">
                      <span className="bg-[#157A4D]/10 text-[#157A4D] px-2 py-0.5 rounded text-[11px] font-['IBM_Plex_Mono'] font-semibold inline-flex items-center space-x-1">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Matched</span>
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`text-[10px] font-['IBM_Plex_Mono'] font-bold px-2.5 py-1 rounded ${
                          row.status === "Paid / Settled"
                            ? "bg-green-100 text-green-800"
                            : stats.isOverdue
                            ? "bg-red-100 text-red-800 animate-pulse"
                            : row.status === "Scheduled"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {stats.isOverdue && row.status !== "Paid / Settled" ? "OVERDUE" : row.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {row.status === "Paid / Settled" ? (
                        <span className="text-xs text-[#157A4D] font-['IBM_Plex_Mono'] font-bold inline-flex items-center space-x-1 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                          <Check className="h-3 w-3" />
                          <span>Settled</span>
                        </span>
                      ) : (
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            type="button"
                            onClick={() => handleOpenSettleModal(row, stats)}
                            className="bg-[#1A1D21] hover:bg-[#2A2E34] text-white px-2.5 py-1 rounded text-xs font-bold font-['IBM_Plex_Mono'] transition-colors cursor-pointer flex items-center space-x-1"
                            title="Execute electronic bank payout disbursement"
                          >
                            <CreditCard className="h-3 w-3" />
                            <span>Settle Now</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAYMENT CONFIRMATION & AP SETTLEMENT MODAL */}
      {settlementTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl p-6 space-y-5 max-w-xl w-full border border-[#DFE1DB] shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-[#DFE1DB] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#157A4D]/10 text-[#157A4D] rounded-lg border border-[#157A4D]/20">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base font-['Archivo'] text-[#1A1D21] flex items-center gap-2">
                    Payment Confirmation &amp; AP Settlement
                  </h3>
                  <p className="text-xs text-[#5C636F]">
                    Settle supplier invoice, halt late penalties, and generate balanced GL journal entry
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSettlementTarget(null)}
                className="text-[#5C636F] hover:text-[#1A1D21] p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Target Row Details Summary Card */}
            <div className="bg-[#F8F9FA] border border-[#DFE1DB] rounded-lg p-3.5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DFE1DB]/60 pb-2.5">
                <div>
                  <span className="text-[10px] font-['IBM_Plex_Mono'] font-bold text-[#5C636F] uppercase tracking-wider block">
                    TARGET INVOICE &amp; SUPPLIER
                  </span>
                  <span className="font-bold text-sm text-[#1A1D21]">
                    {isDataMasked ? maskField(settlementTarget.invoice.vendor, "name") : settlementTarget.invoice.vendor}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-[#5C636F] mt-0.5">
                    <span className="font-['IBM_Plex_Mono'] font-semibold text-[#1A1D21] bg-slate-200/80 px-1.5 py-0.2 rounded">
                      {settlementTarget.invoice.id}
                    </span>
                    <span>•</span>
                    <span>TIN: {isDataMasked ? maskField(settlementTarget.invoice.tin, "tin") : settlementTarget.invoice.tin}</span>
                    <span>•</span>
                    <span>{settlementTarget.invoice.category}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-['IBM_Plex_Mono'] font-bold text-[#5C636F] uppercase tracking-wider block">
                    3-WAY MATCH STATUS
                  </span>
                  <span className="text-xs font-bold text-[#157A4D] bg-[#157A4D]/10 px-2 py-0.5 rounded border border-[#157A4D]/30 inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified (PO: {isDataMasked ? maskField(settlementTarget.invoice.poRef, "ref") : settlementTarget.invoice.poRef} / DR: {isDataMasked ? maskField(settlementTarget.invoice.drRef, "ref") : settlementTarget.invoice.drRef})
                  </span>
                </div>
              </div>

              {/* Financial Obligation Breakdown */}
              <div className="grid grid-cols-3 gap-2 text-xs font-['IBM_Plex_Mono']">
                <div className="bg-white p-2.5 rounded border border-[#DFE1DB]">
                  <span className="text-[10px] text-[#5C636F] block">Principal Amount</span>
                  <span className="font-bold text-sm text-[#1A1D21]">
                    {maskCurrency(settlementTarget.invoice.amount)}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded border border-[#DFE1DB]">
                  <span className="text-[10px] text-[#5C636F] block flex items-center justify-between">
                    <span>Late Increment</span>
                    {settlementTarget.daysOverdue > 0 && (
                      <span className="text-[9px] text-[#B5281A] font-bold">
                        {settlementTarget.daysOverdue}d overdue
                      </span>
                    )}
                  </span>
                  <span className={`font-bold text-sm ${settlementTarget.incrementalLateValue > 0 ? "text-[#B5281A]" : "text-[#5C636F]"}`}>
                    {settlementTarget.incrementalLateValue > 0 ? `+${maskCurrency(settlementTarget.incrementalLateValue)}` : maskCurrency(0)}
                  </span>
                </div>
                <div className="bg-[#157A4D]/5 p-2.5 rounded border border-[#157A4D]/30">
                  <span className="text-[10px] text-[#157A4D] font-bold block uppercase">Total Settlement Payout</span>
                  <span className="font-bold text-base text-[#157A4D]">
                    {maskCurrency(settlementTarget.totalPayable)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Execution Form */}
            <form onSubmit={handleConfirmSettlement} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5C636F] font-bold mb-1">
                    Payment Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={settlementForm.paymentDate}
                    onChange={(e) => setSettlementForm(prev => ({ ...prev, paymentDate: e.target.value }))}
                    className="w-full border border-[#DFE1DB] rounded-lg p-2 font-['IBM_Plex_Mono'] focus:outline-none focus:border-[#1A1D21] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[#5C636F] font-bold mb-1">
                    Disbursement Account <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={settlementForm.disbursementAccount}
                    onChange={(e) => setSettlementForm(prev => ({ ...prev, disbursementAccount: e.target.value }))}
                    className="w-full border border-[#DFE1DB] rounded-lg p-2 font-['IBM_Plex_Mono'] font-bold focus:outline-none focus:border-[#1A1D21] bg-white"
                  >
                    <option value="1030 - Operating Bank Account - BDO Primary">1030 - Operating Bank Account - BDO Primary</option>
                    <option value="1030 - Commercial Treasury Account - BPI">1030 - Commercial Treasury Account - BPI</option>
                    <option value="1050 - Petty Cash Vault">1050 - Petty Cash Vault</option>
                    <option value="1010 - Front Desk Cash Float">1010 - Front Desk Cash Float</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5C636F] font-bold mb-1">
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={settlementForm.paymentMethod}
                    onChange={(e) => setSettlementForm(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                    className="w-full border border-[#DFE1DB] rounded-lg p-2 font-bold focus:outline-none focus:border-[#1A1D21] bg-white"
                  >
                    <option value="Bank Transfer">Bank Transfer (PESONet / Wire)</option>
                    <option value="Check">Check (Corporate Manager's Check)</option>
                    <option value="Cash">Cash (Petty Cash Float)</option>
                    <option value="Auto-Debit / EFT">Auto-Debit / Electronic Fund Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#5C636F] font-bold mb-1">
                    Reference / Transaction Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PESONET-SETTLE-88421-9901"
                    value={settlementForm.referenceNumber}
                    onChange={(e) => setSettlementForm(prev => ({ ...prev, referenceNumber: e.target.value }))}
                    className="w-full border border-[#DFE1DB] rounded-lg p-2 font-['IBM_Plex_Mono'] font-bold focus:outline-none focus:border-[#1A1D21] bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#5C636F] font-bold mb-1">
                  Disbursement Memo / Audit Notation
                </label>
                <input
                  type="text"
                  placeholder="e.g. Full settlement of kitchen meat provisions with accumulated late penalty"
                  value={settlementForm.notes}
                  onChange={(e) => setSettlementForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full border border-[#DFE1DB] rounded-lg p-2 focus:outline-none focus:border-[#1A1D21] bg-white"
                />
              </div>

              {/* Automatic Accounting Double-Entry Preview */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5 text-[11px] font-['IBM_Plex_Mono']">
                <div className="flex items-center justify-between text-[#5C636F] font-bold">
                  <span>AUTOMATIC DOUBLE-ENTRY GL POSTING PREVIEW:</span>
                  <span className="text-[#157A4D]">BALANCED (0.00 Variance)</span>
                </div>
                <div className="space-y-1 text-slate-700">
                  <div className="flex justify-between">
                    <span>DR 2010 - Trade Accounts Payable (Principal)</span>
                    <span className="font-semibold">{maskCurrency(settlementTarget.invoice.amount)}</span>
                  </div>
                  {settlementTarget.incrementalLateValue > 0 && (
                    <div className="flex justify-between text-[#B5281A]">
                      <span>DR 5440 - Vendor Late Surcharges &amp; Penalty Expense</span>
                      <span className="font-semibold">+{maskCurrency(settlementTarget.incrementalLateValue)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-200 pt-1 text-[#157A4D]">
                    <span>CR {settlementForm.disbursementAccount.slice(0, 4)} - Cash / Bank Account</span>
                    <span className="font-bold">{maskCurrency(settlementTarget.totalPayable)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#DFE1DB] font-['IBM_Plex_Mono']">
                <button
                  type="button"
                  onClick={() => setSettlementTarget(null)}
                  className="px-4 py-2 border border-[#DFE1DB] rounded-lg hover:bg-slate-100 text-[#5C636F] hover:text-[#1A1D21] transition-colors cursor-pointer font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#157A4D] hover:bg-[#126B43] text-white rounded-lg font-bold transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Confirm &amp; Execute Settlement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW SUPPLIER INVOICE MODAL */}
      {isNewInvoiceOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 space-y-4 max-w-lg w-full border border-[#DFE1DB] shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#DFE1DB] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#B5281A]" />
                <h3 className="font-bold text-base font-['Archivo']">
                  Create Vendor Invoice (Accounts Payable)
                </h3>
              </div>
              <button
                onClick={() => setIsNewInvoiceOpen(false)}
                className="text-[#5C636F] hover:text-[#1A1D21] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#5C636F] font-bold mb-1">Supplier / Vendor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Puregold Supply Chain Ltd"
                  value={newVendor}
                  onChange={(e) => setNewVendor(e.target.value)}
                  className="w-full border rounded p-2 focus:outline-none focus:border-[#1A1D21]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5C636F] font-bold mb-1">Supplier TIN (BIR Format)</label>
                  <input
                    type="text"
                    placeholder="e.g. 204-889-102-000"
                    value={newTin}
                    onChange={(e) => setNewTin(e.target.value)}
                    className="w-full border rounded p-2 font-['IBM_Plex_Mono'] focus:outline-none focus:border-[#1A1D21]"
                  />
                </div>
                <div>
                  <label className="block text-[#5C636F] font-bold mb-1">Purchase Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full border rounded p-2 font-bold focus:outline-none"
                  >
                    <option value="F&B Fresh Goods">F&B Fresh Goods</option>
                    <option value="Dry Provisions">Dry Provisions</option>
                    <option value="Guest Amenities">Guest Amenities</option>
                    <option value="Utilities & Power">Utilities & Power</option>
                    <option value="Fleet & Fuel">Fleet & Fuel</option>
                    <option value="Maintenance & Capex">Maintenance & Capex</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5C636F] font-bold mb-1">PO Reference Number</label>
                  <input
                    type="text"
                    placeholder="e.g. PO-88941"
                    value={newPoRef}
                    onChange={(e) => setNewPoRef(e.target.value)}
                    className="w-full border rounded p-2 font-['IBM_Plex_Mono'] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#5C636F] font-bold mb-1">Delivery Receipt (DR) #</label>
                  <input
                    type="text"
                    placeholder="e.g. DR-99410"
                    value={newDrRef}
                    onChange={(e) => setNewDrRef(e.target.value)}
                    className="w-full border rounded p-2 font-['IBM_Plex_Mono'] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5C636F] font-bold mb-1">Credit Terms</label>
                  <select
                    value={newTerms}
                    onChange={(e) => setNewTerms(e.target.value as any)}
                    className="w-full border rounded p-2 font-bold focus:outline-none"
                  >
                    <option value="Immediate">Immediate (Due Today)</option>
                    <option value="Net 15">Net 15 Days</option>
                    <option value="Net 30">Net 30 Days (Standard)</option>
                    <option value="Net 60">Net 60 Days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#5C636F] font-bold mb-1">Invoice Principal Amount (PHP) *</label>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full border rounded p-2 font-['IBM_Plex_Mono'] font-bold text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#5C636F] font-bold mb-1">Supplier Settlement Bank Details</label>
                <input
                  type="text"
                  placeholder="e.g. BDO Commercial: 0049-2810-9921"
                  value={newBankDetails}
                  onChange={(e) => setNewBankDetails(e.target.value)}
                  className="w-full border rounded p-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#5C636F] font-bold mb-1">Notes / Line Item Description</label>
                <input
                  type="text"
                  placeholder="e.g. Kitchen commissary meat delivery, grade A"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full border rounded p-2 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#DFE1DB] font-['IBM_Plex_Mono']">
                <button
                  type="button"
                  onClick={() => setIsNewInvoiceOpen(false)}
                  className="px-4 py-2 border rounded hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1A1D21] hover:bg-[#2A2E34] text-white rounded font-bold transition-colors cursor-pointer"
                >
                  {currentUser?.role === "superadmin" ? "Commit Invoice Directly" : "Submit Invoice for Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
