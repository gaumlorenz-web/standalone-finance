import React, { useState, useMemo } from "react";
import {
  AlertTriangle,
  Plus,
  Clock,
  UserCheck,
  Filter,
  Download,
  CheckCircle2,
  Calendar,
  DollarSign,
  FileCheck,
  Search,
  ArrowDownLeft,
  ShieldCheck,
  TrendingUp,
  Percent,
  Receipt,
  Building2,
  FileText,
  CreditCard,
  X,
  Wallet,
  Check
} from "lucide-react";
import PesoSign from "./PesoSign";
import ExportButton from "./ExportButton";

export interface CustomerInvoice {
  id: string;
  customer: string;
  tin: string;
  category: "Hotel Guest Folio" | "Corporate City Ledger" | "Banquet & Catering" | "Restaurant POS Account" | "Fleet Logistics Service";
  refNo: string;
  invoiceDate: string;
  terms: "Immediate" | "Net 15" | "Net 30" | "Net 60";
  dueDate: string;
  amount: number;
  paidAmount: number;
  paymentMethod: "Credit Card" | "Bank Transfer" | "Cash / Petty" | "GCash / Maya";
  status: "Unpaid" | "Partially Paid" | "Partially Collected" | "Collected / Settled" | "Overdue";
  dailyPenaltyRatePercent: number; // e.g. 0.06% per day overdue late charge
  notes?: string;
}

export interface CollectionPaymentDetails {
  invoiceId: string;
  customer: string;
  tin: string;
  category: string;
  refNo: string;
  principal: number;
  paidAmountPrior: number;
  lateIncrement: number;
  totalDue: number;
  daysOverdue: number;
  collectionAmount: number;
  targetAccount: string;
  paymentMethod: CustomerInvoice["paymentMethod"];
  paymentDate: string;
  referenceNumber: string;
  notes?: string;
  isFullSettlement: boolean;
}

export interface AccountsReceivableProps {
  invoices?: CustomerInvoice[];
  onAddInvoice?: (invoice: CustomerInvoice) => void;
  onExecuteCollection?: (collection: CollectionPaymentDetails) => void;
  onBatchCollectAll?: (
    uncollectedInvoices: CustomerInvoice[],
    targetAccount: string,
    paymentMethod: string,
    referenceNo: string
  ) => void;
  onRecordCollection?: (id: string, collectedAmount: number, targetAccount: string) => void;
  currentUser?: { role: string; name: string; email?: string } | null;
  isDataMasked?: boolean;
  maskCurrency?: (val: number) => string;
  maskField?: (val: string, type: string) => string;
}

export const INITIAL_AR_INVOICES: CustomerInvoice[] = [
  {
    id: "AR-2026-101",
    customer: "Grand Suite Folio #402 (Team 9)",
    tin: "192-882-019-000",
    category: "Hotel Guest Folio",
    refNo: "HTL-BK-9021",
    invoiceDate: "2026-08-16",
    terms: "Immediate",
    dueDate: "2026-08-16",
    amount: 34500.0,
    paidAmount: 0.0,
    paymentMethod: "Credit Card",
    status: "Overdue",
    dailyPenaltyRatePercent: 0.05,
    notes: "5 nights executive room stay + room service charges"
  },
  {
    id: "AR-2026-102",
    customer: "Corporate Annual Summit - Acme Technology Philippines",
    tin: "009-441-289-000",
    category: "Banquet & Catering",
    refNo: "EVT-2026-08",
    invoiceDate: "2026-07-10",
    terms: "Net 30",
    dueDate: "2026-08-10",
    amount: 185000.0,
    paidAmount: 35000.0,
    paymentMethod: "Bank Transfer",
    status: "Overdue",
    dailyPenaltyRatePercent: 0.06,
    notes: "Grand ballroom banquet dinner for 250 pax + AV production"
  },
  {
    id: "AR-2026-103",
    customer: "Team 10 Main Dining POS Batch Drop",
    tin: "881-229-410-000",
    category: "Restaurant POS Account",
    refNo: "POS-SHIFT-A",
    invoiceDate: "2026-08-25",
    terms: "Immediate",
    dueDate: "2026-08-25",
    amount: 62800.0,
    paidAmount: 62800.0,
    paymentMethod: "Cash / Petty",
    status: "Collected / Settled",
    dailyPenaltyRatePercent: 0.05,
    notes: "Daily dinner shift collection drop reconciled against POS register"
  },
  {
    id: "AR-2026-104",
    customer: "San Miguel Logistics Supply Fleet Freight",
    tin: "000-291-550-000",
    category: "Fleet Logistics Service",
    refNo: "FLT-FRT-992",
    invoiceDate: "2026-08-12",
    terms: "Net 15",
    dueDate: "2026-08-27",
    amount: 98000.0,
    paidAmount: 0.0,
    paymentMethod: "Bank Transfer",
    status: "Unpaid",
    dailyPenaltyRatePercent: 0.05,
    notes: "Refrigerated transport shuttle from Manila port to central warehouse"
  },
  {
    id: "AR-2026-105",
    customer: "Philippine Airlines Crew Accommodation Folio",
    tin: "000-119-821-000",
    category: "Corporate City Ledger",
    refNo: "PAL-CREW-AUG",
    invoiceDate: "2026-08-01",
    terms: "Net 30",
    dueDate: "2026-08-31",
    amount: 142000.0,
    paidAmount: 0.0,
    paymentMethod: "Bank Transfer",
    status: "Unpaid",
    dailyPenaltyRatePercent: 0.05,
    notes: "Contracted airline crew room block (18 room-nights)"
  }
];

export default function AccountsReceivable({
  invoices: externalInvoices,
  onAddInvoice,
  onExecuteCollection,
  onBatchCollectAll,
  onRecordCollection,
  currentUser,
  isDataMasked = false,
  maskCurrency = (val) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(val),
  maskField = (val) => val
}: AccountsReceivableProps) {
  const [internalInvoices, setInternalInvoices] = useState<CustomerInvoice[]>(INITIAL_AR_INVOICES);
  const invoices = externalInvoices || internalInvoices;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [isCollectAllModalOpen, setIsCollectAllModalOpen] = useState(false);

  // Batch Collect All Form State
  const [batchTargetAccount, setBatchTargetAccount] = useState("1030 - Operating Bank Account - BDO Primary");
  const [batchPaymentMethod, setBatchPaymentMethod] = useState<CustomerInvoice["paymentMethod"]>("Bank Transfer");
  const [batchRefPrefix, setBatchRefPrefix] = useState(`BATCH-COL-${new Date().toISOString().slice(5, 10).replace("-", "")}`);

  // Enhanced Collection Modal State
  const [collectionTarget, setCollectionTarget] = useState<{
    invoice: CustomerInvoice;
    daysOverdue: number;
    remainingBalance: number;
    incrementalLateCharge: number;
    totalCollectible: number;
  } | null>(null);

  const [collectionForm, setCollectionForm] = useState({
    targetAccount: "1030 - Operating Bank Account - BDO Primary",
    collectionAmount: "",
    paymentDate: "2026-08-27",
    paymentMethod: "Bank Transfer" as CustomerInvoice["paymentMethod"],
    referenceNumber: "",
    notes: ""
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  // Form State for new Customer Invoice
  const [newCustomer, setNewCustomer] = useState("");
  const [newTin, setNewTin] = useState("");
  const [newCategory, setNewCategory] = useState<CustomerInvoice["category"]>("Hotel Guest Folio");
  const [newRefNo, setNewRefNo] = useState("");
  const [newTerms, setNewTerms] = useState<CustomerInvoice["terms"]>("Net 30");
  const [newAmount, setNewAmount] = useState("");
  const [newPaymentMethod, setNewPaymentMethod] = useState<CustomerInvoice["paymentMethod"]>("Credit Card");
  const [newNotes, setNewNotes] = useState("");

  const CURRENT_SYSTEM_DATE = "2026-08-27";

  // Helper: compute days overdue and late penalty increment
  const calculateOverdueStats = (invoice: CustomerInvoice) => {
    const due = new Date(invoice.dueDate).getTime();
    const current = new Date(CURRENT_SYSTEM_DATE).getTime();
    const diffTime = current - due;
    const daysOverdue = diffTime > 0 ? Math.floor(diffTime / (1000 * 60 * 60 * 24)) : 0;
    
    const remainingBalance = Math.max(0, invoice.amount - (invoice.paidAmount || 0));
    const isSettled = invoice.status === "Collected / Settled" || remainingBalance === 0;

    const dailyRate = (invoice.dailyPenaltyRatePercent || 0.05) / 100;
    const incrementalLateCharge = (!isSettled && daysOverdue > 0)
      ? remainingBalance * dailyRate * daysOverdue
      : 0;
    const totalCollectible = remainingBalance + incrementalLateCharge;
    const isOverdue = !isSettled && daysOverdue > 0;

    return {
      daysOverdue,
      remainingBalance,
      incrementalLateCharge,
      totalCollectible,
      isOverdue
    };
  };

  // Open the Record Collection Payment Modal
  const handleOpenCollectModal = (row: CustomerInvoice, stats: ReturnType<typeof calculateOverdueStats>) => {
    const rawId = row.id.replace(/[^0-9]/g, "") || "101";
    const genRef = `DEP-AR-${rawId}-${Math.floor(1000 + Math.random() * 9000)}`;

    setCollectionTarget({
      invoice: row,
      daysOverdue: stats.daysOverdue,
      remainingBalance: stats.remainingBalance,
      incrementalLateCharge: stats.incrementalLateCharge,
      totalCollectible: stats.totalCollectible
    });

    setCollectionForm({
      targetAccount: "1030 - Operating Bank Account - BDO Primary",
      collectionAmount: stats.totalCollectible.toFixed(2),
      paymentDate: CURRENT_SYSTEM_DATE,
      paymentMethod: row.paymentMethod || "Bank Transfer",
      referenceNumber: genRef,
      notes: `Customer collection deposit for ${row.customer} (${row.refNo})`
    });
    setValidationError(null);
  };

  // Close Collection Modal
  const handleCloseCollectModal = () => {
    setCollectionTarget(null);
    setValidationError(null);
  };

  // Execute Deposit Transaction
  const handleConfirmDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectionTarget) return;

    const enteredAmount = parseFloat(collectionForm.collectionAmount);
    if (isNaN(enteredAmount) || enteredAmount <= 0) {
      setValidationError("Collection amount must be a valid number greater than ₱0.00.");
      return;
    }

    if (enteredAmount > collectionTarget.totalCollectible + 0.01) {
      setValidationError(
        `Collection amount (₱${enteredAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}) cannot exceed Total Due of ₱${collectionTarget.totalCollectible.toLocaleString(undefined, { minimumFractionDigits: 2 })}.`
      );
      return;
    }

    const { invoice, daysOverdue, remainingBalance, incrementalLateCharge, totalCollectible } = collectionTarget;
    const isFull = enteredAmount >= (totalCollectible - 0.01);

    const payload: CollectionPaymentDetails = {
      invoiceId: invoice.id,
      customer: invoice.customer,
      tin: invoice.tin,
      category: invoice.category,
      refNo: invoice.refNo,
      principal: invoice.amount,
      paidAmountPrior: invoice.paidAmount || 0,
      lateIncrement: incrementalLateCharge,
      totalDue: totalCollectible,
      daysOverdue: daysOverdue,
      collectionAmount: enteredAmount,
      targetAccount: collectionForm.targetAccount,
      paymentMethod: collectionForm.paymentMethod,
      paymentDate: collectionForm.paymentDate || CURRENT_SYSTEM_DATE,
      referenceNumber: collectionForm.referenceNumber || `DEP-${invoice.id}`,
      notes: collectionForm.notes,
      isFullSettlement: isFull
    };

    if (onExecuteCollection) {
      onExecuteCollection(payload);
    } else if (onRecordCollection) {
      onRecordCollection(invoice.id, enteredAmount, collectionForm.targetAccount);
    }

    // Update internal invoices state
    setInternalInvoices((prev) =>
      prev.map((i) => {
        if (i.id === invoice.id) {
          const newPaid = (i.paidAmount || 0) + enteredAmount;
          const fullySettled = newPaid >= (i.amount + incrementalLateCharge - 0.01);
          return {
            ...i,
            paidAmount: newPaid,
            status: fullySettled ? ("Collected / Settled" as const) : ("Partially Paid" as const),
            dailyPenaltyRatePercent: fullySettled ? 0 : i.dailyPenaltyRatePercent
          };
        }
        return i;
      })
    );

    setCollectionTarget(null);
    setValidationError(null);
  };

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.refNo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = selectedCategory === "All" || inv.category === selectedCategory;
      const stats = calculateOverdueStats(inv);
      const effectiveStatus = stats.isOverdue && inv.status !== "Collected / Settled" ? "Overdue" : inv.status;
      const matchesStatus = selectedStatus === "All" || effectiveStatus === selectedStatus;
      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [invoices, searchTerm, selectedCategory, selectedStatus]);

  // Totals & KPI Metrics
  const totals = useMemo(() => {
    let totalPrincipal = 0;
    let totalCollected = 0;
    let totalLateIncrements = 0;
    let currentTotal = 0;
    let overdue1_30 = 0;
    let overdue31_60 = 0;
    let overdue60Plus = 0;

    invoices.forEach((inv) => {
      totalPrincipal += inv.amount;
      totalCollected += inv.paidAmount || 0;
      const stats = calculateOverdueStats(inv);

      if (stats.remainingBalance > 0 && inv.status !== "Collected / Settled") {
        totalLateIncrements += stats.incrementalLateCharge;
        if (stats.daysOverdue === 0) {
          currentTotal += stats.remainingBalance;
        } else if (stats.daysOverdue <= 30) {
          overdue1_30 += stats.totalCollectible;
        } else if (stats.daysOverdue <= 60) {
          overdue31_60 += stats.totalCollectible;
        } else {
          overdue60Plus += stats.totalCollectible;
        }
      }
    });

    const outstandingBalance = Math.max(0, (totalPrincipal - totalCollected) + totalLateIncrements);

    return {
      totalPrincipal,
      totalCollected,
      totalLateIncrements,
      outstandingBalance,
      currentTotal,
      overdue1_30,
      overdue31_60,
      overdue60Plus
    };
  }, [invoices]);

  // Uncollected invoices for Batch "Collect All"
  const uncollectedInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const remaining = Math.max(0, inv.amount - (inv.paidAmount || 0));
      return inv.status !== "Collected / Settled" && remaining > 0;
    });
  }, [invoices]);

  const totalBatchCollectible = useMemo(() => {
    return uncollectedInvoices.reduce((sum, inv) => {
      const stats = calculateOverdueStats(inv);
      return sum + stats.totalCollectible;
    }, 0);
  }, [uncollectedInvoices]);

  const handleConfirmBatchCollectAll = (e: React.FormEvent) => {
    e.preventDefault();
    if (uncollectedInvoices.length === 0) return;

    if (onBatchCollectAll) {
      onBatchCollectAll(
        uncollectedInvoices,
        batchTargetAccount,
        batchPaymentMethod,
        batchRefPrefix
      );
    } else {
      setInternalInvoices((prev) =>
        prev.map((i) => {
          const stats = calculateOverdueStats(i);
          return {
            ...i,
            paidAmount: i.amount + stats.incrementalLateCharge,
            status: "Collected / Settled" as const,
            dailyPenaltyRatePercent: 0
          };
        })
      );
    }

    setIsCollectAllModalOpen(false);
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer || !newAmount) return;

    const invoiceDateObj = new Date(CURRENT_SYSTEM_DATE);
    let daysToAdd = 30;
    if (newTerms === "Immediate") daysToAdd = 0;
    if (newTerms === "Net 15") daysToAdd = 15;
    if (newTerms === "Net 30") daysToAdd = 30;
    if (newTerms === "Net 60") daysToAdd = 60;

    invoiceDateObj.setDate(invoiceDateObj.getDate() + daysToAdd);
    const calculatedDueDate = invoiceDateObj.toISOString().split("T")[0];

    const newInv: CustomerInvoice = {
      id: `AR-2026-${Math.floor(100 + Math.random() * 900)}`,
      customer: newCustomer,
      tin: newTin || "123-456-789-000",
      category: newCategory,
      refNo: newRefNo || `REF-${Math.floor(10000 + Math.random() * 90000)}`,
      invoiceDate: CURRENT_SYSTEM_DATE,
      terms: newTerms,
      dueDate: calculatedDueDate,
      amount: Number(newAmount),
      paidAmount: 0,
      paymentMethod: newPaymentMethod,
      status: "Unpaid",
      dailyPenaltyRatePercent: 0.05,
      notes: newNotes
    };

    if (onAddInvoice) {
      onAddInvoice(newInv);
    } else {
      setInternalInvoices((prev) => [newInv, ...prev]);
    }
    setIsNewInvoiceOpen(false);
    // Reset form
    setNewCustomer("");
    setNewTin("");
    setNewAmount("");
    setNewRefNo("");
    setNewNotes("");
  };

  const getExportData = () => {
    return {
      title: "Accounts Receivable (AR) Customer Ledger & Overdue Collections",
      subtitle: `System Date: ${CURRENT_SYSTEM_DATE} | HORECA Financial Suite`,
      filename: `Accounts_Receivable_Customer_Ledger_${CURRENT_SYSTEM_DATE}`,
      headers: [
        "Invoice ID",
        "Customer / Folio Name",
        "Customer TIN",
        "Category",
        "Reference ID",
        "Invoice Date",
        "Terms",
        "Due Date",
        "Days Overdue",
        "Principal (PHP)",
        "Paid to Date (PHP)",
        "Late Penalty Increment (PHP)",
        "Total Collectible (PHP)",
        "Payment Method",
        "Status"
      ],
      rows: invoices.map((inv) => {
        const stats = calculateOverdueStats(inv);
        return [
          inv.id,
          isDataMasked ? maskField(inv.customer, "name") : inv.customer,
          isDataMasked ? maskField(inv.tin, "tin") : inv.tin,
          inv.category,
          isDataMasked ? maskField(inv.refNo, "ref") : inv.refNo,
          inv.invoiceDate,
          inv.terms,
          inv.dueDate,
          stats.daysOverdue,
          isDataMasked ? maskCurrency(inv.amount) : inv.amount,
          isDataMasked ? maskCurrency(inv.paidAmount) : inv.paidAmount,
          isDataMasked ? maskCurrency(stats.incrementalLateCharge) : stats.incrementalLateCharge.toFixed(2),
          isDataMasked ? maskCurrency(stats.totalCollectible) : stats.totalCollectible.toFixed(2),
          inv.paymentMethod,
          stats.isOverdue ? "Overdue" : inv.status
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
              TRANSACTION CORE / RECEIVABLES &amp; CASH INFLOWS
            </span>
            <span className="bg-[#157A4D]/10 text-[#157A4D] px-2 py-0.5 rounded text-[10px] font-['IBM_Plex_Mono'] font-bold border border-[#157A4D]/20">
              CUSTOMER CORE
            </span>
          </div>
          <h1 className="text-2xl font-bold font-['Archivo'] text-[#1A1D21] mt-1">
            Accounts Receivable (AR) Management
          </h1>
          <p className="text-xs text-[#5C636F]">
            Records customer invoices, monitors outstanding balances, tracks customer payments, and manages collections.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExportButton getExportData={getExportData} buttonLabel="Export AR Ledger" />

          <button
            type="button"
            onClick={() => setIsNewInvoiceOpen(true)}
            className="bg-[#1A1D21] hover:bg-[#2A2E34] text-white px-3.5 py-2 rounded-lg text-xs font-bold font-['IBM_Plex_Mono'] flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="h-4 w-4 text-[#FF6A3D]" />
            <span>Issue Customer Invoice</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Outstanding Receivables */}
        <div className="bg-white p-4 rounded-xl border border-[#DFE1DB] space-y-2 shadow-xs">
          <div className="flex justify-between items-center text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
            <span className="font-bold">TOTAL RECEIVABLES DUE</span>
            <PesoSign className="h-4 w-4 text-[#157A4D]" />
          </div>
          <div className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#157A4D]">
            {maskCurrency(totals.outstandingBalance)}
          </div>
          <div className="text-[11px] text-[#5C636F] flex justify-between">
            <span>Collected: {maskCurrency(totals.totalCollected)}</span>
            <span className="text-[#B5281A] font-bold">
              +{maskCurrency(totals.totalLateIncrements)} Overdue Interest
            </span>
          </div>
        </div>

        {/* Current (0-30 Days) */}
        <div className="bg-white p-4 rounded-xl border border-[#DFE1DB] space-y-2 shadow-xs">
          <div className="flex justify-between items-center text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
            <span className="font-bold">CURRENT RECEIVABLES</span>
            <Clock className="h-4 w-4 text-[#157A4D]" />
          </div>
          <div className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#157A4D]">
            {maskCurrency(totals.currentTotal)}
          </div>
          <p className="text-[11px] text-[#5C636F]">Within payment terms window</p>
        </div>

        {/* Overdue (1-30 Days Past Due) */}
        <div className="bg-white p-4 rounded-xl border border-[#DFE1DB] space-y-2 shadow-xs">
          <div className="flex justify-between items-center text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
            <span className="font-bold">OVERDUE AR (1-30 DAYS)</span>
            <AlertTriangle className="h-4 w-4 text-[#8A5A00]" />
          </div>
          <div className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#8A5A00]">
            {maskCurrency(totals.overdue1_30)}
          </div>
          <p className="text-[11px] text-[#8A5A00]">
            Daily late interest active (0.05% - 0.06%/day)
          </p>
        </div>

        {/* Collection Efficiency Rate */}
        <div className="bg-white p-4 rounded-xl border border-[#DFE1DB] space-y-2 shadow-xs">
          <div className="flex justify-between items-center text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
            <span className="font-bold">COLLECTION RATE (MTD)</span>
            <TrendingUp className="h-4 w-4 text-[#157A4D]" />
          </div>
          <div className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#157A4D]">
            {totals.totalPrincipal > 0
              ? `${Math.round((totals.totalCollected / totals.totalPrincipal) * 100)}%`
              : "100%"}
          </div>
          <p className="text-[11px] text-[#5C636F]">
            Settled inflows credited to Treasury Vaults
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#DFE1DB] flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#5C636F]" />
          <input
            type="text"
            placeholder="Search Customer, Folio #, Reference..."
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
              <option value="Hotel Guest Folio">Hotel Guest Folio</option>
              <option value="Corporate City Ledger">Corporate City Ledger</option>
              <option value="Banquet & Catering">Banquet & Catering</option>
              <option value="Restaurant POS Account">Restaurant POS Account</option>
              <option value="Fleet Logistics Service">Fleet Logistics Service</option>
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
              <option value="Partially Collected">Partially Collected</option>
              <option value="Overdue">Overdue (Past Due Date)</option>
              <option value="Collected / Settled">Collected / Settled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customer Invoices Register Table */}
      <div className="bg-white border border-[#DFE1DB] rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#DFE1DB] flex justify-between items-center">
          <div>
            <h3 className="font-bold text-sm font-['Archivo']">Customer Invoices &amp; Inflow Receivables Register</h3>
            <p className="text-xs text-[#5C636F]">
              Showing {filteredInvoices.length} customer folios and city ledger accounts.
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
                <th className="p-3">Customer / Folio Name</th>
                <th className="p-3">Category &amp; Ref</th>
                <th className="p-3">Terms &amp; Due Date</th>
                <th className="p-3">Overdue Days</th>
                <th className="p-3 text-right">Principal</th>
                <th className="p-3 text-right">Late Surcharge</th>
                <th className="p-3 text-right">Total Collectible</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F1ED]">
              {filteredInvoices.map((row) => {
                const stats = calculateOverdueStats(row);
                return (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-['IBM_Plex_Mono'] font-bold text-[#157A4D]">
                      {row.id}
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-[#1A1D21]">{maskField(row.customer, "name")}</div>
                      <div className="text-[11px] font-['IBM_Plex_Mono'] text-[#5C636F]">
                        TIN: {maskField(row.tin, "tin")}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="inline-block text-xs font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-800">
                        {row.category}
                      </span>
                      <div className="text-[11px] font-['IBM_Plex_Mono'] text-[#5C636F] mt-0.5">
                        Ref: {row.refNo} ({row.paymentMethod})
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
                      {stats.daysOverdue > 0 && row.status !== "Collected / Settled" ? (
                        <span className="bg-[#B5281A]/10 text-[#B5281A] font-bold font-['IBM_Plex_Mono'] text-xs px-2 py-0.5 rounded border border-[#B5281A]/30">
                          {stats.daysOverdue} Days Late
                        </span>
                      ) : (
                        <span className="text-xs text-[#157A4D] font-['IBM_Plex_Mono']">Current</span>
                      )}
                    </td>
                    <td className="p-3 text-right font-['IBM_Plex_Mono'] font-medium">
                      {maskCurrency(row.amount)}
                      {row.paidAmount > 0 && (
                        <div className="text-[10px] text-[#157A4D]">
                          Paid: {maskCurrency(row.paidAmount)}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-right font-['IBM_Plex_Mono']">
                      {stats.incrementalLateCharge > 0 ? (
                        <span className="text-[#B5281A] font-bold">
                          +{maskCurrency(stats.incrementalLateCharge)}
                          <span className="block text-[10px] text-[#5C636F]">
                            ({(row.dailyPenaltyRatePercent || 0.05)}%/day)
                          </span>
                        </span>
                      ) : (
                        <span className="text-[#5C636F] text-xs">{maskCurrency(0)}</span>
                      )}
                    </td>
                    <td className="p-3 text-right font-['IBM_Plex_Mono'] font-bold text-[#157A4D]">
                      {maskCurrency(stats.totalCollectible)}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`text-[10px] font-['IBM_Plex_Mono'] font-bold px-2.5 py-1 rounded ${
                          row.status === "Collected / Settled"
                            ? "bg-green-100 text-green-800"
                            : stats.isOverdue
                            ? "bg-red-100 text-red-800 animate-pulse"
                            : row.status === "Partially Collected"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {stats.isOverdue && row.status !== "Collected / Settled" ? "OVERDUE" : row.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {row.status === "Collected / Settled" ? (
                        <span className="inline-flex items-center gap-1 text-xs text-[#157A4D] font-['IBM_Plex_Mono'] font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <Check className="h-3 w-3" />
                          Collected
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenCollectModal(row, stats)}
                          className="bg-[#157A4D] hover:bg-[#12633e] text-white px-3 py-1.5 rounded-lg text-xs font-bold font-['IBM_Plex_Mono'] transition-colors cursor-pointer shadow-xs flex items-center gap-1.5 mx-auto"
                          title="Record customer payment collection into Treasury"
                        >
                          <ArrowDownLeft className="h-3.5 w-3.5" />
                          <span>Collect</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-[#F8F9F6] border-t-2 border-[#DFE1DB] text-xs font-['IBM_Plex_Mono'] font-bold text-[#1A1D21]">
              <tr>
                <td colSpan={5} className="p-3 text-right text-[#5C636F] uppercase">
                  Register Totals ({filteredInvoices.length} Invoices):
                </td>
                <td className="p-3 text-right">
                  {maskCurrency(filteredInvoices.reduce((s, i) => s + i.amount, 0))}
                </td>
                <td className="p-3 text-right text-[#B5281A]">
                  +{maskCurrency(filteredInvoices.reduce((s, i) => s + calculateOverdueStats(i).incrementalLateCharge, 0))}
                </td>
                <td className="p-3 text-right text-[#157A4D] font-bold">
                  {maskCurrency(filteredInvoices.reduce((s, i) => s + calculateOverdueStats(i).totalCollectible, 0))}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Bottom Table Toolbar: Collect All Action & Uncollected Summary */}
        <div className="p-4 border-t border-[#DFE1DB] bg-[#F8F9F6] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
            <div className="p-1.5 rounded-md bg-emerald-100 text-[#157A4D]">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[#1A1D21] font-bold">
                {uncollectedInvoices.length} Uncollected Receivables
              </span>
              <span className="text-[#5C636F] ml-1.5">
                (Total Collectible: <strong className="text-[#157A4D]">{maskCurrency(totalBatchCollectible)}</strong>)
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCollectAllModalOpen(true)}
            disabled={uncollectedInvoices.length === 0}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold font-['IBM_Plex_Mono'] flex items-center space-x-2 transition-all shadow-xs ${
              uncollectedInvoices.length > 0
                ? "bg-[#157A4D] hover:bg-[#12633e] text-white cursor-pointer ring-2 ring-emerald-400/30"
                : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
            }`}
            title="Collect all outstanding customer receivables into Treasury"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>
              {uncollectedInvoices.length > 0
                ? `Collect all (${uncollectedInvoices.length} • ${maskCurrency(totalBatchCollectible)})`
                : "All Invoices Collected"}
            </span>
          </button>
        </div>
      </div>

      {/* ISSUE NEW CUSTOMER INVOICE MODAL */}
      {isNewInvoiceOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 space-y-4 max-w-lg w-full border border-[#DFE1DB] shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#DFE1DB] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#157A4D]" />
                <h3 className="font-bold text-base font-['Archivo']">
                  Issue Customer / Guest Invoice (Accounts Receivable)
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
                <label className="block text-[#5C636F] font-bold mb-1">Customer / Guest / Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shangri-La Corporate City Ledger / Guest John Doe"
                  value={newCustomer}
                  onChange={(e) => setNewCustomer(e.target.value)}
                  className="w-full border rounded p-2 focus:outline-none focus:border-[#1A1D21]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5C636F] font-bold mb-1">Customer TIN (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 192-882-019-000"
                    value={newTin}
                    onChange={(e) => setNewTin(e.target.value)}
                    className="w-full border rounded p-2 font-['IBM_Plex_Mono'] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#5C636F] font-bold mb-1">Inflow Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full border rounded p-2 font-bold focus:outline-none"
                  >
                    <option value="Hotel Guest Folio">Hotel Guest Folio</option>
                    <option value="Corporate City Ledger">Corporate City Ledger</option>
                    <option value="Banquet & Catering">Banquet & Catering</option>
                    <option value="Restaurant POS Account">Restaurant POS Account</option>
                    <option value="Fleet Logistics Service">Fleet Logistics Service</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5C636F] font-bold mb-1">Folio / Booking Ref #</label>
                  <input
                    type="text"
                    placeholder="e.g. HTL-BK-9901"
                    value={newRefNo}
                    onChange={(e) => setNewRefNo(e.target.value)}
                    className="w-full border rounded p-2 font-['IBM_Plex_Mono'] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#5C636F] font-bold mb-1">Payment Method Expected</label>
                  <select
                    value={newPaymentMethod}
                    onChange={(e) => setNewPaymentMethod(e.target.value as any)}
                    className="w-full border rounded p-2 font-bold focus:outline-none"
                  >
                    <option value="Credit Card">Credit Card</option>
                    <option value="Bank Transfer">Bank Transfer (PESONet/InstaPay)</option>
                    <option value="GCash / Maya">GCash / Maya QR</option>
                    <option value="Cash / Petty">Cash / Front Desk Till</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5C636F] font-bold mb-1">Payment Terms</label>
                  <select
                    value={newTerms}
                    onChange={(e) => setNewTerms(e.target.value as any)}
                    className="w-full border rounded p-2 font-bold focus:outline-none"
                  >
                    <option value="Immediate">Immediate (Upon Checkout)</option>
                    <option value="Net 15">Net 15 Days</option>
                    <option value="Net 30">Net 30 Days (Corporate City Ledger)</option>
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
                <label className="block text-[#5C636F] font-bold mb-1">Description / Billable Items</label>
                <input
                  type="text"
                  placeholder="e.g. Deluxe Room stay, 3 nights, minibar consumption"
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
                  className="px-4 py-2 bg-[#157A4D] hover:bg-[#12633e] text-white rounded font-bold transition-colors cursor-pointer"
                >
                  {currentUser?.role === "superadmin" ? "Issue Invoice Directly" : "Submit Invoice for Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD CUSTOMER COLLECTION PAYMENT MODAL */}
      {collectionTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 space-y-5 max-w-xl w-full border border-[#DFE1DB] shadow-2xl my-8">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-[#DFE1DB] pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-[#157A4D]/10 flex items-center justify-center border border-[#157A4D]/20">
                  <ArrowDownLeft className="h-5 w-5 text-[#157A4D]" />
                </div>
                <div>
                  <h3 className="font-bold text-base font-['Archivo'] text-[#1A1D21]">
                    Record Customer Collection Payment
                  </h3>
                  <p className="text-xs text-[#5C636F]">
                    Deposit receivable inflow into Treasury &amp; reconcile customer ledger
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseCollectModal}
                className="text-[#5C636F] hover:text-[#1A1D21] p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Read-Only Summary Card */}
            <div className="p-4 bg-[#F8F9F7] rounded-xl border border-[#DFE1DB] space-y-3 font-['IBM_Plex_Sans']">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2.5 border-b border-[#DFE1DB]/70">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-['IBM_Plex_Mono'] text-[#157A4D] bg-[#157A4D]/10 px-2 py-0.5 rounded border border-[#157A4D]/20">
                      {collectionTarget.invoice.id}
                    </span>
                    <span className="text-xs text-[#5C636F] font-['IBM_Plex_Mono']">
                      Ref: <strong>{isDataMasked ? maskField(collectionTarget.invoice.refNo, "ref") : collectionTarget.invoice.refNo}</strong>
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-[#1A1D21] mt-1">
                    {maskField(collectionTarget.invoice.customer, "name")}
                  </h4>
                  <div className="text-[11px] text-[#5C636F] font-['IBM_Plex_Mono']">
                    TIN: {maskField(collectionTarget.invoice.tin, "tin")} • Category: {collectionTarget.invoice.category}
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-[11px] font-bold font-['IBM_Plex_Mono'] text-[#5C636F] uppercase">
                    Total Due
                  </div>
                  <div className="text-xl font-bold font-['IBM_Plex_Mono'] text-[#157A4D]">
                    {maskCurrency(collectionTarget.totalCollectible)}
                  </div>
                </div>
              </div>

              {/* Due Breakdown Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-['IBM_Plex_Mono']">
                <div className="bg-white p-2 rounded-lg border border-[#DFE1DB]">
                  <div className="text-[10px] text-[#5C636F]">Principal Amount</div>
                  <div className="font-bold text-[#1A1D21]">{maskCurrency(collectionTarget.invoice.amount)}</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-[#DFE1DB]">
                  <div className="text-[10px] text-[#5C636F]">Prior Paid</div>
                  <div className="font-bold text-[#157A4D]">{maskCurrency(collectionTarget.invoice.paidAmount || 0)}</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-[#DFE1DB]">
                  <div className="text-[10px] text-[#5C636F]">Days Overdue</div>
                  <div className="font-bold text-[#1A1D21]">
                    {collectionTarget.daysOverdue > 0 ? (
                      <span className="text-[#B5281A]">{collectionTarget.daysOverdue} Days Late</span>
                    ) : (
                      <span className="text-[#157A4D]">On Time</span>
                    )}
                  </div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-[#DFE1DB]">
                  <div className="text-[10px] text-[#5C636F]">Late Surcharge</div>
                  <div className="font-bold text-[#B5281A]">
                    {collectionTarget.incrementalLateCharge > 0
                      ? `+${maskCurrency(collectionTarget.incrementalLateCharge)}`
                      : maskCurrency(0)}
                  </div>
                </div>
              </div>
            </div>

            {/* Validation Error Banner */}
            {validationError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700 font-['IBM_Plex_Sans']">
                <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Interactive Collection Form */}
            <form onSubmit={handleConfirmDeposit} className="space-y-4 text-xs font-['IBM_Plex_Sans']">
              {/* Row 1: Target Treasury Account & Tender Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[#5C636F] font-bold mb-1 font-['IBM_Plex_Mono']">
                    Target Treasury Account *
                  </label>
                  <select
                    value={collectionForm.targetAccount}
                    onChange={(e) => setCollectionForm({ ...collectionForm, targetAccount: e.target.value })}
                    className="w-full border border-[#DFE1DB] rounded-lg p-2.5 font-bold text-xs bg-white focus:outline-none focus:border-[#157A4D]"
                  >
                    <option value="1030 - Operating Bank Account - BDO Primary">
                      1030 - Operating Bank Account - BDO Primary
                    </option>
                    <option value="1030 - Commercial Treasury Account - BPI">
                      1030 - Commercial Treasury Account - BPI
                    </option>
                    <option value="1010 - Front Desk Cash Float (Petty Cash)">
                      1010 - Front Desk Cash Float (Petty Cash)
                    </option>
                    <option value="1020 - GCash / Maya Digital Vault">
                      1020 - GCash / Maya Digital Vault
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#5C636F] font-bold mb-1 font-['IBM_Plex_Mono']">
                    Payment Method / Tender *
                  </label>
                  <select
                    value={collectionForm.paymentMethod}
                    onChange={(e) => setCollectionForm({ ...collectionForm, paymentMethod: e.target.value as any })}
                    className="w-full border border-[#DFE1DB] rounded-lg p-2.5 font-bold text-xs bg-white focus:outline-none focus:border-[#157A4D]"
                  >
                    <option value="Bank Transfer">Bank Transfer (PESONet / InstaPay)</option>
                    <option value="Credit Card">Credit Card Batch Terminal</option>
                    <option value="GCash / Maya">GCash / Maya QR Settlement</option>
                    <option value="Cash / Petty">Cash / Front Desk Drawer Float</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Collection Amount (PHP) + Quick Adjustment Buttons */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[#5C636F] font-bold font-['IBM_Plex_Mono']">
                    Collection Amount (PHP) *
                  </label>
                  <div className="flex items-center gap-1.5 text-[11px] font-['IBM_Plex_Mono']">
                    <button
                      type="button"
                      onClick={() =>
                        setCollectionForm({
                          ...collectionForm,
                          collectionAmount: collectionTarget.totalCollectible.toFixed(2)
                        })
                      }
                      className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
                    >
                      Full Settle (100%)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCollectionForm({
                          ...collectionForm,
                          collectionAmount: (collectionTarget.totalCollectible / 2).toFixed(2)
                        })
                      }
                      className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 cursor-pointer"
                    >
                      50% Partial
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCollectionForm({
                          ...collectionForm,
                          collectionAmount: collectionTarget.remainingBalance.toFixed(2)
                        })
                      }
                      className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 cursor-pointer"
                    >
                      Principal Only
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold font-['IBM_Plex_Mono'] text-[#157A4D]">
                    ₱
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={collectionTarget.totalCollectible}
                    required
                    value={collectionForm.collectionAmount}
                    onChange={(e) => {
                      setCollectionForm({ ...collectionForm, collectionAmount: e.target.value });
                      setValidationError(null);
                    }}
                    placeholder="0.00"
                    className="w-full pl-8 pr-3 py-2.5 border border-[#DFE1DB] rounded-lg font-['IBM_Plex_Mono'] font-bold text-lg focus:outline-none focus:border-[#157A4D] bg-white"
                  />
                </div>
                <div className="flex justify-between text-[11px] text-[#5C636F] font-['IBM_Plex_Mono']">
                  <span>Pre-filled with total collectible balance</span>
                  <span>
                    Status after collection:{" "}
                    <strong className="text-[#157A4D]">
                      {parseFloat(collectionForm.collectionAmount) >= collectionTarget.totalCollectible - 0.01
                        ? "Collected / Settled"
                        : "Partially Paid"}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Row 3: Payment Date & Reference Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[#5C636F] font-bold mb-1 font-['IBM_Plex_Mono']">
                    Deposit Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={collectionForm.paymentDate}
                    onChange={(e) => setCollectionForm({ ...collectionForm, paymentDate: e.target.value })}
                    className="w-full border border-[#DFE1DB] rounded-lg p-2.5 font-['IBM_Plex_Mono'] text-xs focus:outline-none focus:border-[#157A4D] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[#5C636F] font-bold mb-1 font-['IBM_Plex_Mono']">
                    Deposit Ref / Transaction Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={collectionForm.referenceNumber}
                    onChange={(e) => setCollectionForm({ ...collectionForm, referenceNumber: e.target.value })}
                    placeholder="e.g. DEP-AR-2026-101-9821"
                    className="w-full border border-[#DFE1DB] rounded-lg p-2.5 font-['IBM_Plex_Mono'] text-xs focus:outline-none focus:border-[#157A4D] bg-white"
                  />
                </div>
              </div>

              {/* Row 4: Notes / Collection Memo */}
              <div>
                <label className="block text-[#5C636F] font-bold mb-1 font-['IBM_Plex_Mono']">
                  Collection Memo / Audit Notes
                </label>
                <input
                  type="text"
                  value={collectionForm.notes}
                  onChange={(e) => setCollectionForm({ ...collectionForm, notes: e.target.value })}
                  placeholder="e.g. Complete folio checkout payment settled via POS electronic bank transfer"
                  className="w-full border border-[#DFE1DB] rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#157A4D] bg-white"
                />
              </div>

              {/* Real-time Double-Entry Posting Preview */}
              <div className="p-3 bg-[#F1F1ED] rounded-xl border border-[#DFE1DB] space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-['IBM_Plex_Mono'] font-bold text-[#5C636F] uppercase">
                  <span>General Ledger Posting Preview (Double-Entry Core)</span>
                  <span className="text-[#157A4D] flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    BALANCED (0.00 Variance)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-['IBM_Plex_Mono']">
                  <div className="bg-white p-2 rounded border border-[#DFE1DB]">
                    <div className="text-[10px] text-[#157A4D] font-bold">DEBIT (+) ASSET</div>
                    <div className="truncate text-[#1A1D21]">{collectionForm.targetAccount.split(" - ")[1] || "Treasury Account"}</div>
                    <div className="font-bold text-[#157A4D] mt-0.5">
                      {maskCurrency(parseFloat(collectionForm.collectionAmount) || 0)}
                    </div>
                  </div>
                  <div className="bg-white p-2 rounded border border-[#DFE1DB]">
                    <div className="text-[10px] text-[#5C636F] font-bold">CREDIT (-) RECEIVABLE</div>
                    <div className="truncate text-[#1A1D21]">1200 - Accounts Receivable</div>
                    <div className="font-bold text-[#5C636F] mt-0.5">
                      {maskCurrency(parseFloat(collectionForm.collectionAmount) || 0)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end items-center gap-2.5 pt-3 border-t border-[#DFE1DB] font-['IBM_Plex_Mono']">
                <button
                  type="button"
                  onClick={handleCloseCollectModal}
                  className="px-4 py-2 border border-[#DFE1DB] rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#157A4D] hover:bg-[#12633e] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <ArrowDownLeft className="h-4 w-4" />
                  <span>Confirm &amp; Deposit to Treasury</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BATCH COLLECT ALL MODAL (Requirement 2 & 3) */}
      {isCollectAllModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 space-y-5 max-w-2xl w-full border border-[#DFE1DB] shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-[#DFE1DB] pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-[#157A4D]/10 flex items-center justify-center border border-[#157A4D]/20">
                  <CheckCircle2 className="h-5 w-5 text-[#157A4D]" />
                </div>
                <div>
                  <h3 className="font-bold text-base font-['Archivo'] text-[#1A1D21]">
                    Batch Receivable Settlement (Collect All)
                  </h3>
                  <p className="text-xs text-[#5C636F]">
                    Execute full collection on all {uncollectedInvoices.length} outstanding AR accounts simultaneously
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCollectAllModalOpen(false)}
                className="text-[#5C636F] hover:text-[#1A1D21] p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Batch Overview Banner */}
            <div className="p-4 bg-[#F8F9F7] rounded-xl border border-[#DFE1DB] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span className="text-[10px] font-bold font-['IBM_Plex_Mono'] uppercase px-2 py-0.5 rounded bg-[#157A4D]/10 text-[#157A4D] border border-[#157A4D]/20">
                  TOTAL BATCH INFLOW
                </span>
                <div className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#157A4D] mt-1">
                  {maskCurrency(totalBatchCollectible)}
                </div>
                <div className="text-xs text-[#5C636F]">
                  Settling <strong>{uncollectedInvoices.length} Invoices</strong> across Hotel, Corporate &amp; Dining
                </div>
              </div>

              <div className="text-left sm:text-right text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
                <div>Cross-Module Reflection:</div>
                <div className="text-[#157A4D] font-bold">✓ General Ledger Cash Debit</div>
                <div className="text-[#157A4D] font-bold">✓ Cash Management Pool Inflow</div>
                <div className="text-[#157A4D] font-bold">✓ Collections Audit Registered</div>
              </div>
            </div>

            {/* List of Invoices to be Collected */}
            <div className="border border-[#DFE1DB] rounded-xl overflow-hidden max-h-48 overflow-y-auto">
              <table className="w-full text-left text-xs font-['IBM_Plex_Sans']">
                <thead className="bg-[#F1F1ED] text-[#5C636F] font-['IBM_Plex_Mono'] text-[10px] uppercase sticky top-0">
                  <tr>
                    <th className="p-2.5">Invoice ID</th>
                    <th className="p-2.5">Customer</th>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5 text-right">Balance Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFE1DB]">
                  {uncollectedInvoices.map((inv) => {
                    const stats = calculateOverdueStats(inv);
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold font-['IBM_Plex_Mono'] text-[#157A4D]">{inv.id}</td>
                        <td className="p-2.5 font-medium text-[#1A1D21]">{maskField(inv.customer, "name")}</td>
                        <td className="p-2.5 text-[#5C636F]">{inv.category}</td>
                        <td className="p-2.5 text-right font-bold font-['IBM_Plex_Mono'] text-[#157A4D]">
                          {maskCurrency(stats.totalCollectible)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <form onSubmit={handleConfirmBatchCollectAll} className="space-y-4 text-xs font-['IBM_Plex_Sans']">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[#5C636F] font-bold mb-1 font-['IBM_Plex_Mono']">
                    Deposit Destination Vault Account *
                  </label>
                  <select
                    value={batchTargetAccount}
                    onChange={(e) => setBatchTargetAccount(e.target.value)}
                    className="w-full border border-[#DFE1DB] rounded-lg p-2.5 text-xs font-['IBM_Plex_Mono'] font-bold focus:outline-none focus:border-[#157A4D] bg-white"
                  >
                    <option value="1030 - Operating Bank Account - BDO Primary">
                      1030 - Operating Bank Account - BDO Primary
                    </option>
                    <option value="1010 - Front Desk Cash Float">
                      1010 - Front Desk Cash Float (Physical Cash)
                    </option>
                    <option value="1040 - Digital Payment Gateway Clearing">
                      1040 - Digital Payment Gateway Clearing
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#5C636F] font-bold mb-1 font-['IBM_Plex_Mono']">
                    Settlement Method *
                  </label>
                  <select
                    value={batchPaymentMethod}
                    onChange={(e) => setBatchPaymentMethod(e.target.value as any)}
                    className="w-full border border-[#DFE1DB] rounded-lg p-2.5 text-xs font-bold focus:outline-none focus:border-[#157A4D] bg-white"
                  >
                    <option value="Bank Transfer">Bank Transfer (PESONet / InstaPay)</option>
                    <option value="Credit Card">Credit Card Terminal Batch</option>
                    <option value="GCash / Maya">GCash / Maya Merchant Batch</option>
                    <option value="Cash / Petty">Cash Vault Settlement</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#5C636F] font-bold mb-1 font-['IBM_Plex_Mono']">
                  Batch Transaction Reference Code
                </label>
                <input
                  type="text"
                  required
                  value={batchRefPrefix}
                  onChange={(e) => setBatchRefPrefix(e.target.value)}
                  className="w-full border border-[#DFE1DB] rounded-lg p-2.5 font-['IBM_Plex_Mono'] text-xs focus:outline-none focus:border-[#157A4D] bg-white"
                />
              </div>

              <div className="flex justify-end items-center gap-2.5 pt-3 border-t border-[#DFE1DB] font-['IBM_Plex_Mono']">
                <button
                  type="button"
                  onClick={() => setIsCollectAllModalOpen(false)}
                  className="px-4 py-2 border border-[#DFE1DB] rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#157A4D] hover:bg-[#12633e] text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Execute Collect All ({maskCurrency(totalBatchCollectible)})</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
