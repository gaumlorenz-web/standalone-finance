import React, { useState, useMemo } from "react";
import {
  Plus,
  CheckCircle2,
  Search,
  Filter,
  ArrowDownLeft,
  DollarSign,
  Landmark,
  FileCheck,
  CreditCard,
  QrCode,
  Banknote,
  Receipt,
  Link2,
  X,
  AlertTriangle,
  ArrowRight,
  Building2,
  FileText,
  Clock,
  ShieldCheck,
  Check
} from "lucide-react";
import PesoSign from "./PesoSign";
import ExportButton from "./ExportButton";
import { CustomerInvoice } from "./AccountsReceivable";

export interface CollectionItem {
  id: string;
  invoiceId: string;
  sourceChannel: string;
  customerName: string;
  externalRef: string;
  method: "Credit Card Terminal (BDO POS)" | "Direct Bank Wire (PESONet)" | "Cash Drop to Vault" | "GCash / Maya QR" | "Corporate Bank Transfer (BPI)";
  targetVault: "BDO Operating Account" | "BPI Treasury Sweep" | "Front Desk Cash Float" | "Digital E-Wallet Clearing";
  amount: number;
  date: string;
  arMatchStatus: "Matched to AR" | "Pending Allocation" | "Direct Counter Settlement";
  officialReceiptNo?: string;
  notes?: string;
}

export interface CollectionProps {
  collections?: CollectionItem[];
  arInvoices?: CustomerInvoice[];
  currentUser?: { role: string; name: string; email?: string } | null;
  isDataMasked?: boolean;
  maskCurrency?: (val: number) => string;
  maskField?: (val: string, type: string) => string;
  onMatchToAr?: (collection: CollectionItem, targetInvoice: CustomerInvoice | null) => void;
  onRecordDirectCollection?: (collection: CollectionItem) => void;
  onRecordCollectionCallback?: (collection: CollectionItem) => void;
}

export const INITIAL_COLLECTIONS: CollectionItem[] = [
  {
    id: "COL-2026-001",
    invoiceId: "AR-2026-101",
    sourceChannel: "Hotel Front Desk",
    customerName: "Grand Suite Folio #402",
    externalRef: "HTL-BK-9021",
    method: "Credit Card Terminal (BDO POS)",
    targetVault: "BDO Operating Account",
    amount: 34500,
    date: "2026-08-26",
    arMatchStatus: "Matched to AR",
    officialReceiptNo: "OR-2026-8801",
    notes: "5 nights executive room stay + room service"
  },
  {
    id: "COL-2026-002",
    invoiceId: "AR-2026-102",
    sourceChannel: "Acme Tech Corporate City Ledger",
    customerName: "Acme Technology Philippines",
    externalRef: "EVT-2026-08",
    method: "Direct Bank Wire (PESONet)",
    targetVault: "BPI Treasury Sweep",
    amount: 35000,
    date: "2026-08-25",
    arMatchStatus: "Matched to AR",
    officialReceiptNo: "OR-2026-8802",
    notes: "Partial payment for Grand Ballroom summit catering"
  },
  {
    id: "COL-2026-003",
    invoiceId: "AR-2026-103",
    sourceChannel: "Restaurant POS Drop",
    customerName: "Main Dining POS Batch Drop",
    externalRef: "POS-SHIFT-A",
    method: "Cash Drop to Vault",
    targetVault: "Front Desk Cash Float",
    amount: 62800,
    date: "2026-08-25",
    arMatchStatus: "Matched to AR",
    officialReceiptNo: "OR-2026-8803",
    notes: "Dinner shift cash and receipt batch drop"
  },
  {
    id: "COL-2026-004",
    invoiceId: "AR-2026-104",
    sourceChannel: "Fleet Logistics Hauling Freight",
    customerName: "San Miguel Logistics Supply Fleet Freight",
    externalRef: "FLT-FRT-992",
    method: "Corporate Bank Transfer (BPI)",
    targetVault: "BPI Treasury Sweep",
    amount: 98000,
    date: "2026-08-27",
    arMatchStatus: "Pending Allocation",
    officialReceiptNo: "OR-2026-8804",
    notes: "Refrigerated transport freight hauling fee"
  },
  {
    id: "COL-2026-005",
    invoiceId: "AR-2026-105",
    sourceChannel: "Corporate Banquet Downpayment",
    customerName: "Philippine Airlines Crew Accommodation Folio",
    externalRef: "PAL-DEP-991",
    method: "GCash / Maya QR",
    targetVault: "Digital E-Wallet Clearing",
    amount: 50000,
    date: "2026-08-27",
    arMatchStatus: "Direct Counter Settlement",
    officialReceiptNo: "OR-2026-8805",
    notes: "Airline crew deposit top-up via terminal QR"
  }
];

export default function Collection({
  collections: externalCollections,
  arInvoices = [],
  currentUser,
  isDataMasked = false,
  maskCurrency = (val) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(val),
  maskField = (val) => val,
  onMatchToAr,
  onRecordDirectCollection,
  onRecordCollectionCallback
}: CollectionProps) {
  const [internalCollections, setInternalCollections] = useState<CollectionItem[]>(INITIAL_COLLECTIONS);
  const collections = externalCollections || internalCollections;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<CollectionItem | null>(null);

  // Match to AR Modal State
  const [reconcileTarget, setReconcileTarget] = useState<CollectionItem | null>(null);
  const [selectedTargetInvoiceId, setSelectedTargetInvoiceId] = useState<string>("");
  const [reconcileNotes, setReconcileNotes] = useState<string>("");

  // New Direct Collection Form
  const [newInvoiceId, setNewInvoiceId] = useState("");
  const [newCustomer, setNewCustomer] = useState("");
  const [newSource, setNewSource] = useState("Hotel Front Desk");
  const [newExternalRef, setNewExternalRef] = useState("");
  const [newMethod, setNewMethod] = useState<CollectionItem["method"]>("Credit Card Terminal (BDO POS)");
  const [newVault, setNewVault] = useState<CollectionItem["targetVault"]>("BDO Operating Account");
  const [newAmount, setNewAmount] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Filtered Collections
  const filteredCollections = useMemo(() => {
    return collections.filter((c) => {
      const matchesSearch =
        c.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.sourceChannel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.externalRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.officialReceiptNo && c.officialReceiptNo.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesMethod = selectedMethod === "All" || c.method === selectedMethod;
      const matchesStatus = selectedStatus === "All" || c.arMatchStatus === selectedStatus;
      return matchesSearch && matchesMethod && matchesStatus;
    });
  }, [collections, searchTerm, selectedMethod, selectedStatus]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalCollected = collections.reduce((acc, c) => acc + c.amount, 0);
    const posDrop = collections.filter((c) => c.sourceChannel.includes("Restaurant POS")).reduce((s, c) => s + c.amount, 0);
    const hotelDesk = collections.filter((c) => c.sourceChannel.includes("Hotel Front Desk") || c.sourceChannel.includes("Banquet")).reduce((s, c) => s + c.amount, 0);
    const bankWires = collections.filter((c) => c.method.includes("Bank") || c.method.includes("PESONet")).reduce((s, c) => s + c.amount, 0);
    const pendingMatch = collections.filter((c) => c.arMatchStatus === "Pending Allocation").length;

    return {
      totalCollected,
      posDrop,
      hotelDesk,
      bankWires,
      pendingMatch
    };
  }, [collections]);

  // Open 'Match to AR' Modal for an unallocated record
  const handleOpenMatchModal = (item: CollectionItem) => {
    setReconcileTarget(item);
    // Find matching candidate by invoiceId or name
    const exactMatch = arInvoices.find(
      (inv) =>
        inv.id.toLowerCase() === item.invoiceId.toLowerCase() ||
        inv.refNo.toLowerCase() === item.externalRef.toLowerCase() ||
        inv.customer.toLowerCase().includes(item.customerName.toLowerCase().slice(0, 10))
    );
    setSelectedTargetInvoiceId(exactMatch ? exactMatch.id : (arInvoices[0]?.id || item.invoiceId));
    setReconcileNotes(`Reconciliation match of inflow ${item.id} against customer AR ledger for ${item.customerName}`);
  };

  // Confirm Match to AR
  const handleConfirmMatch = () => {
    if (!reconcileTarget) return;

    const targetInvoice = arInvoices.find((i) => i.id === selectedTargetInvoiceId) || null;

    // Trigger parent callback for full cross-module synchronization
    if (onMatchToAr) {
      onMatchToAr(reconcileTarget, targetInvoice);
    }

    // Local fallback update
    setInternalCollections((prev) =>
      prev.map((c) =>
        c.id === reconcileTarget.id
          ? { ...c, arMatchStatus: "Matched to AR" as const, notes: reconcileNotes || c.notes }
          : c
      )
    );

    setReconcileTarget(null);
  };

  // Open Direct Collection Modal
  const handleOpenDirectModal = () => {
    const genId = `AR-2026-${Math.floor(106 + Math.random() * 50)}`;
    const genRef = `SLIP-${Math.floor(9000 + Math.random() * 1000)}`;
    setNewInvoiceId(genId);
    setNewCustomer("");
    setNewSource("Hotel Front Desk");
    setNewExternalRef(genRef);
    setNewMethod("Credit Card Terminal (BDO POS)");
    setNewVault("BDO Operating Account");
    setNewAmount("");
    setNewNotes("");
    setFormError(null);
    setIsModalOpen(true);
  };

  // Handle Save Collection & Issue OR
  const handleAddCollection = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const amt = parseFloat(newAmount);
    if (!newInvoiceId.trim()) {
      setFormError("Invoice ID is required.");
      return;
    }
    if (!newCustomer.trim()) {
      setFormError("Customer / Folio Name is required.");
      return;
    }
    if (isNaN(amt) || amt <= 0) {
      setFormError("Please enter a valid collection amount greater than ₱0.00.");
      return;
    }

    const orNumber = `OR-2026-${Math.floor(8806 + Math.random() * 900)}`;
    const newItem: CollectionItem = {
      id: `COL-2026-${Math.floor(100 + Math.random() * 900)}`,
      invoiceId: newInvoiceId.trim(),
      customerName: newCustomer.trim(),
      sourceChannel: newSource,
      externalRef: newExternalRef.trim() || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      method: newMethod,
      targetVault: newVault,
      amount: amt,
      date: "2026-08-27",
      arMatchStatus: "Matched to AR",
      officialReceiptNo: orNumber,
      notes: newNotes.trim() || `Direct collection deposited into ${newVault}`
    };

    if (onRecordDirectCollection) {
      onRecordDirectCollection(newItem);
    } else if (onRecordCollectionCallback) {
      onRecordCollectionCallback(newItem);
    }

    // Local fallback
    setInternalCollections((prev) => [newItem, ...prev]);

    setIsModalOpen(false);
    setNewInvoiceId("");
    setNewCustomer("");
    setNewExternalRef("");
    setNewAmount("");
    setNewNotes("");
  };

  const getExportData = () => {
    return {
      title: "Collection Management & Tender Inflow Register",
      subtitle: "System Date: 2026-08-27 | Official Receipts & Inflows | HORECA Financial Suite",
      filename: `Collection_Inflows_Ledger_2026`,
      headers: [
        "Record ID",
        "Invoice ID",
        "Official Receipt (OR)",
        "Customer / Account",
        "Source Channel",
        "External Ref",
        "Payment Tender Method",
        "Target Treasury Vault",
        "Amount (PHP)",
        "Date",
        "AR Match Status"
      ],
      rows: collections.map((c) => [
        c.id,
        c.invoiceId,
        c.officialReceiptNo || "N/A",
        isDataMasked ? maskField(c.customerName, "name") : c.customerName,
        c.sourceChannel,
        isDataMasked ? maskField(c.externalRef, "ref") : c.externalRef,
        c.method,
        c.targetVault,
        isDataMasked ? maskCurrency(c.amount) : c.amount,
        c.date,
        c.arMatchStatus
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
              TRANSACTION CORE / RECEIVABLES &amp; INFLOW RECONCILIATION
            </span>
            <span className="bg-[#157A4D]/10 text-[#157A4D] px-2 py-0.5 rounded text-[10px] font-['IBM_Plex_Mono'] font-bold border border-[#157A4D]/20">
              TREASURY INFLOWS ACTIVE
            </span>
          </div>
          <h1 className="text-2xl font-bold font-['Archivo'] text-[#1A1D21] mt-1">
            Collection Management
          </h1>
          <p className="text-xs text-[#5C636F]">
            Monitors real-time payment gateway drops, POS terminal batches, and matches them to outstanding Invoice IDs &amp; official receipts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton getExportData={getExportData} buttonLabel="Export Collections" />
          <button
            type="button"
            onClick={handleOpenDirectModal}
            className="bg-[#157A4D] hover:bg-[#12633e] text-white px-3.5 py-2 rounded-lg text-xs font-bold font-['IBM_Plex_Mono'] flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Record Direct Collection</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#DFE1DB] space-y-2 shadow-xs">
          <div className="flex justify-between items-center text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
            <span className="font-bold">TOTAL TODAY'S COLLECTIONS</span>
            <PesoSign className="h-4 w-4 text-[#157A4D]" />
          </div>
          <div className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#157A4D]">
            {maskCurrency(metrics.totalCollected)}
          </div>
          <p className="text-[11px] text-[#5C636F]">Reconciled to Treasury Cash Pools</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#DFE1DB] space-y-2 shadow-xs">
          <div className="flex justify-between items-center text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
            <span className="font-bold">POS RESTAURANT DROPS</span>
            <Receipt className="h-4 w-4 text-[#1A1D21]" />
          </div>
          <div className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#1A1D21]">
            {maskCurrency(metrics.posDrop)}
          </div>
          <p className="text-[11px] text-[#5C636F]">Dining Cash &amp; Cards</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#DFE1DB] space-y-2 shadow-xs">
          <div className="flex justify-between items-center text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
            <span className="font-bold">HOTEL FOLIO RECEIPTS</span>
            <CreditCard className="h-4 w-4 text-[#8A5A00]" />
          </div>
          <div className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#8A5A00]">
            {maskCurrency(metrics.hotelDesk)}
          </div>
          <p className="text-[11px] text-[#5C636F]">Front Desk &amp; Banquets</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#DFE1DB] space-y-2 shadow-xs">
          <div className="flex justify-between items-center text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
            <span className="font-bold">BANK WIRES &amp; FREIGHT</span>
            <Landmark className="h-4 w-4 text-[#157A4D]" />
          </div>
          <div className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#157A4D]">
            {maskCurrency(metrics.bankWires)}
          </div>
          <p className="text-[11px] text-[#5C636F]">PESONet &amp; Direct Corporate Wires</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-[#DFE1DB] flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-[#5C636F]" />
            <input
              type="text"
              placeholder="Search Invoice ID, OR #, or Client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-[#DFE1DB] rounded-lg text-xs font-['IBM_Plex_Sans'] focus:outline-none focus:border-[#1A1D21]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-3.5 w-3.5 text-[#5C636F]" />
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="border border-[#DFE1DB] rounded-lg p-1.5 text-xs font-['IBM_Plex_Sans'] focus:outline-none font-medium"
            >
              <option value="All">All Tender Channels</option>
              <option value="Credit Card Terminal (BDO POS)">Credit Card POS</option>
              <option value="Direct Bank Wire (PESONet)">PESONet Bank Wire</option>
              <option value="Cash Drop to Vault">Cash Vault Drop</option>
              <option value="GCash / Maya QR">GCash / Maya QR</option>
              <option value="Corporate Bank Transfer (BPI)">BPI Corporate Transfer</option>
            </select>
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-[#DFE1DB] rounded-lg p-1.5 text-xs font-['IBM_Plex_Sans'] focus:outline-none font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="Matched to AR">Matched to AR</option>
            <option value="Pending Allocation">Pending Allocation</option>
            <option value="Direct Counter Settlement">Direct Settlement</option>
          </select>
        </div>

        <span className="text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
          Showing {filteredCollections.length} Collection Inflow Records
        </span>
      </div>

      {/* Inflow Stream & Payment Gateway Logs Table */}
      <div className="bg-white border border-[#DFE1DB] rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#DFE1DB] flex justify-between items-center">
          <div>
            <h3 className="font-bold text-sm font-['Archivo']">Inflow Stream &amp; Payment Gateway Logs</h3>
            <p className="text-xs text-[#5C636F]">
              All collections are indexed strictly by their primary <strong>Invoice ID</strong>. Unallocated items can be reconciled directly to open AR folios.
            </p>
          </div>
          {metrics.pendingMatch > 0 && (
            <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1 rounded-lg text-xs font-['IBM_Plex_Mono'] font-bold">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              <span>{metrics.pendingMatch} Pending Allocation</span>
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-['IBM_Plex_Sans']">
            <thead className="bg-[#F1F1ED] text-xs font-['IBM_Plex_Mono'] text-[#5C636F] uppercase">
              <tr>
                <th className="p-3">Invoice ID</th>
                <th className="p-3">Customer / Folio</th>
                <th className="p-3">Source Channel</th>
                <th className="p-3">Payment Tender</th>
                <th className="p-3">Target Vault</th>
                <th className="p-3 text-right">Amount (PHP)</th>
                <th className="p-3 text-center">AR Match Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F1ED]">
              {filteredCollections.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-['IBM_Plex_Mono'] font-bold text-[#157A4D]">
                    {row.invoiceId}
                    {row.officialReceiptNo && (
                      <span className="block text-[11px] font-normal text-[#5C636F]">
                        {row.officialReceiptNo}
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="font-medium text-[#1A1D21]">
                      {maskField(row.customerName, "name")}
                    </div>
                    <div className="text-[11px] font-['IBM_Plex_Mono'] text-[#5C636F]">
                      Ref: {isDataMasked ? maskField(row.externalRef, "ref") : row.externalRef}
                    </div>
                  </td>
                  <td className="p-3 text-xs text-[#5C636F]">{row.sourceChannel}</td>
                  <td className="p-3 font-['IBM_Plex_Mono'] text-xs">{row.method}</td>
                  <td className="p-3 text-xs text-[#1A1D21] font-medium">{row.targetVault}</td>
                  <td className="p-3 text-right font-['IBM_Plex_Mono'] font-bold text-[#157A4D]">
                    {maskCurrency(row.amount)}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`text-[10px] font-['IBM_Plex_Mono'] font-bold px-2.5 py-1 rounded inline-flex items-center space-x-1 ${
                        row.arMatchStatus === "Matched to AR"
                          ? "bg-green-100 text-green-800"
                          : row.arMatchStatus === "Direct Counter Settlement"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      <span>{row.arMatchStatus}</span>
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center space-x-1.5">
                      {row.arMatchStatus === "Pending Allocation" ? (
                        <button
                          type="button"
                          onClick={() => handleOpenMatchModal(row)}
                          className="bg-[#157A4D] hover:bg-[#12633e] text-white px-3 py-1.5 rounded-lg text-xs font-bold font-['IBM_Plex_Mono'] transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                          title="Reconcile and match to customer AR"
                        >
                          <Link2 className="h-3.5 w-3.5" />
                          <span>Match to AR</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedReceipt(row)}
                          className="bg-slate-100 hover:bg-slate-200 text-[#1A1D21] px-3 py-1.5 rounded-lg text-xs font-bold font-['IBM_Plex_Mono'] transition-colors cursor-pointer border border-[#DFE1DB] flex items-center gap-1.5"
                        >
                          <Receipt className="h-3.5 w-3.5 text-[#5C636F]" />
                          <span>View Receipt</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          1. DATA LOOKUP & MATCHING MODAL (RECONCILIATION MODAL)
         ========================================================================= */}
      {reconcileTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 space-y-5 max-w-2xl w-full border border-[#DFE1DB] shadow-2xl my-8">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-[#DFE1DB] pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-[#157A4D]/10 flex items-center justify-center border border-[#157A4D]/20">
                  <Link2 className="h-5 w-5 text-[#157A4D]" />
                </div>
                <div>
                  <h3 className="font-bold text-base font-['Archivo'] text-[#1A1D21]">
                    Match Inflow to Accounts Receivable (AR)
                  </h3>
                  <p className="text-xs text-[#5C636F]">
                    Reconcile unallocated payment gateway drop against customer invoice &amp; post clearing journal
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReconcileTarget(null)}
                className="text-[#5C636F] hover:text-[#1A1D21] p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Extracted Record Details Card */}
            <div className="p-4 bg-[#F8F9F7] rounded-xl border border-[#DFE1DB] space-y-3 font-['IBM_Plex_Sans']">
              <div className="flex items-center justify-between border-b border-[#DFE1DB]/70 pb-2.5">
                <span className="text-[11px] font-bold font-['IBM_Plex_Mono'] uppercase text-[#5C636F]">
                  EXTRACTED INFLOW STREAM DETAILS
                </span>
                <span className="text-xs font-bold font-['IBM_Plex_Mono'] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                  Pending Allocation
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-['IBM_Plex_Mono']">
                <div>
                  <div className="text-[10px] text-[#5C636F]">Invoice / Stream ID</div>
                  <div className="font-bold text-[#157A4D]">{reconcileTarget.invoiceId}</div>
                  <div className="text-[10px] text-[#5C636F] mt-0.5">({reconcileTarget.id})</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#5C636F]">Customer / Folio</div>
                  <div className="font-bold text-[#1A1D21] truncate" title={reconcileTarget.customerName}>
                    {maskField(reconcileTarget.customerName, "name")}
                  </div>
                  <div className="text-[10px] text-[#5C636F] mt-0.5">
                    Ref: {isDataMasked ? maskField(reconcileTarget.externalRef, "ref") : reconcileTarget.externalRef}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#5C636F]">Official Receipt (OR#)</div>
                  <div className="font-bold text-[#1A1D21]">{reconcileTarget.officialReceiptNo || "OR-PENDING"}</div>
                  <div className="text-[10px] text-[#5C636F] mt-0.5">{reconcileTarget.date}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#5C636F]">Inflow Amount</div>
                  <div className="font-bold text-base text-[#157A4D]">
                    {maskCurrency(reconcileTarget.amount)}
                  </div>
                  <div className="text-[10px] text-[#5C636F] mt-0.5">{reconcileTarget.targetVault}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#DFE1DB]/70 flex flex-wrap items-center justify-between text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
                <div>Source Channel: <strong className="text-[#1A1D21]">{reconcileTarget.sourceChannel}</strong></div>
                <div>Payment Tender: <strong className="text-[#1A1D21]">{reconcileTarget.method}</strong></div>
              </div>
            </div>

            {/* Candidate Open Customer Invoices / Folios Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold font-['IBM_Plex_Mono'] text-[#5C636F]">
                SELECT TARGET CUSTOMER INVOICE IN ACCOUNTS RECEIVABLE *
              </label>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {arInvoices.length === 0 ? (
                  <div className="p-3 border border-dashed rounded-lg text-center text-xs text-[#5C636F]">
                    No open AR customer invoices found.
                  </div>
                ) : (
                  arInvoices.map((inv) => {
                    const isExactMatch =
                      inv.id.toLowerCase() === reconcileTarget.invoiceId.toLowerCase() ||
                      inv.customer.toLowerCase().includes(reconcileTarget.customerName.toLowerCase().slice(0, 8));
                    const isSelected = selectedTargetInvoiceId === inv.id;
                    const remainingDue = Math.max(0, inv.amount - (inv.paidAmount || 0));

                    return (
                      <div
                        key={inv.id}
                        onClick={() => setSelectedTargetInvoiceId(inv.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 ${
                          isSelected
                            ? "border-[#157A4D] bg-[#157A4D]/5 ring-1 ring-[#157A4D]"
                            : "border-[#DFE1DB] bg-white hover:border-slate-400"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="targetInvoice"
                            checked={isSelected}
                            onChange={() => setSelectedTargetInvoiceId(inv.id)}
                            className="h-4 w-4 text-[#157A4D] focus:ring-[#157A4D]"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold font-['IBM_Plex_Mono'] text-xs text-[#157A4D]">
                                {inv.id}
                              </span>
                              {isExactMatch && (
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                                  Exact Match
                                </span>
                              )}
                              <span className="text-[11px] text-[#5C636F]">
                                Ref: {isDataMasked ? maskField(inv.refNo, "ref") : inv.refNo}
                              </span>
                            </div>
                            <div className="font-medium text-xs text-[#1A1D21] mt-0.5">
                              {maskField(inv.customer, "name")}
                            </div>
                            <div className="text-[10px] text-[#5C636F] font-['IBM_Plex_Mono']">
                              Category: {inv.category} • Terms: {inv.terms || "Net 30"}
                            </div>
                          </div>
                        </div>

                        <div className="text-left sm:text-right pl-7 sm:pl-0">
                          <div className="text-[10px] text-[#5C636F] font-['IBM_Plex_Mono'] uppercase">
                            Outstanding Balance
                          </div>
                          <div className="font-bold font-['IBM_Plex_Mono'] text-xs text-[#B5281A]">
                            {maskCurrency(remainingDue)}
                          </div>
                          <span
                            className={`text-[9px] font-['IBM_Plex_Mono'] font-bold px-1.5 py-0.5 rounded ${
                              inv.status === "Collected / Settled"
                                ? "bg-green-100 text-green-800"
                                : inv.status === "Overdue"
                                ? "bg-red-100 text-red-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {inv.status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Reconciliation Audit Note */}
            <div>
              <label className="block text-xs font-bold font-['IBM_Plex_Mono'] text-[#5C636F] mb-1">
                Reconciliation Memo &amp; Clearance Note
              </label>
              <input
                type="text"
                value={reconcileNotes}
                onChange={(e) => setReconcileNotes(e.target.value)}
                placeholder="e.g. Cleared via BPI Treasury Sweep; settled against freight hauling city ledger"
                className="w-full border border-[#DFE1DB] rounded-lg p-2 text-xs font-['IBM_Plex_Sans'] focus:outline-none focus:border-[#157A4D]"
              />
            </div>

            {/* General Ledger Clearing Journal Preview */}
            <div className="p-3 bg-[#F1F1ED] rounded-xl border border-[#DFE1DB] space-y-1.5 font-['IBM_Plex_Mono']">
              <div className="flex justify-between items-center text-[10px] font-bold text-[#5C636F] uppercase">
                <span>General Ledger Clearing Entry (Automated Double-Entry)</span>
                <span className="text-[#157A4D] flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  BALANCED (0.00 Variance)
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2 rounded border border-[#DFE1DB]">
                  <div className="text-[10px] text-[#157A4D] font-bold">DEBIT (+) ASSET / CLEARING</div>
                  <div className="truncate text-[#1A1D21]">
                    {reconcileTarget.targetVault === "BPI Treasury Sweep"
                      ? "1030 - Commercial Treasury Account - BPI"
                      : reconcileTarget.targetVault === "Front Desk Cash Float"
                      ? "1010 - Front Desk Cash Float"
                      : "1030 - Operating Bank Account - BDO"}
                  </div>
                  <div className="font-bold text-[#157A4D] mt-0.5">
                    {maskCurrency(reconcileTarget.amount)}
                  </div>
                </div>
                <div className="bg-white p-2 rounded border border-[#DFE1DB]">
                  <div className="text-[10px] text-[#5C636F] font-bold">CREDIT (-) ACCOUNTS RECEIVABLE</div>
                  <div className="truncate text-[#1A1D21]">1210 - City Ledger &amp; Corporate AR</div>
                  <div className="font-bold text-[#5C636F] mt-0.5">
                    {maskCurrency(reconcileTarget.amount)}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end items-center gap-2.5 pt-3 border-t border-[#DFE1DB] font-['IBM_Plex_Mono']">
              <button
                type="button"
                onClick={() => setReconcileTarget(null)}
                className="px-4 py-2 border border-[#DFE1DB] rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmMatch}
                className="px-4 py-2 bg-[#157A4D] hover:bg-[#12633e] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Check className="h-4 w-4" />
                <span>Confirm Reconciliation &amp; Match to AR</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          2. RECORD DIRECT COLLECTION MODAL
         ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 space-y-4 max-w-xl w-full border border-[#DFE1DB] shadow-2xl my-8 text-xs font-['IBM_Plex_Sans']">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-[#DFE1DB] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-[#157A4D]/10 flex items-center justify-center border border-[#157A4D]/20">
                  <ArrowDownLeft className="h-5 w-5 text-[#157A4D]" />
                </div>
                <div>
                  <h3 className="font-bold text-base font-['Archivo'] text-[#1A1D21]">
                    Record Direct Collection
                  </h3>
                  <p className="text-xs text-[#5C636F]">
                    Issue Official Receipt (OR), deposit tender into Treasury &amp; reconcile to AR
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#5C636F] hover:text-[#1A1D21] p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Error banner */}
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs font-medium">
                <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddCollection} className="space-y-3.5">
              {/* Row 1: Invoice ID & Customer Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#5C636F] mb-1 font-['IBM_Plex_Mono']">
                    Invoice ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AR-2026-106"
                    value={newInvoiceId}
                    onChange={(e) => {
                      setNewInvoiceId(e.target.value);
                      setFormError(null);
                    }}
                    className="w-full border border-[#DFE1DB] rounded-lg p-2.5 font-['IBM_Plex_Mono'] font-bold text-xs focus:outline-none focus:border-[#157A4D] bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#5C636F] mb-1 font-['IBM_Plex_Mono']">
                    Customer / Folio Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VIP Corporate Guest / Banquet Client"
                    value={newCustomer}
                    onChange={(e) => {
                      setNewCustomer(e.target.value);
                      setFormError(null);
                    }}
                    className="w-full border border-[#DFE1DB] rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#157A4D] bg-white"
                  />
                </div>
              </div>

              {/* Row 2: Source Channel & Target Treasury Vault */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#5C636F] mb-1 font-['IBM_Plex_Mono']">
                    Source Channel *
                  </label>
                  <select
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    className="w-full border border-[#DFE1DB] rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:border-[#157A4D] bg-white"
                  >
                    <option value="Hotel Front Desk">Hotel Front Desk</option>
                    <option value="Restaurant POS Drop">Restaurant POS Drop</option>
                    <option value="Fleet Logistics Hauling Freight">Fleet Logistics Hauling Freight</option>
                    <option value="Corporate Banquet Downpayment">Corporate Banquet Downpayment</option>
                    <option value="Corporate City Ledger">Corporate City Ledger</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#5C636F] mb-1 font-['IBM_Plex_Mono']">
                    Target Treasury Vault *
                  </label>
                  <select
                    value={newVault}
                    onChange={(e) => setNewVault(e.target.value as any)}
                    className="w-full border border-[#DFE1DB] rounded-lg p-2.5 text-xs font-bold focus:outline-none focus:border-[#157A4D] bg-white"
                  >
                    <option value="BDO Operating Account">BDO Operating Account</option>
                    <option value="BPI Treasury Sweep">BPI Treasury Sweep</option>
                    <option value="Front Desk Cash Float">Front Desk Cash Float</option>
                    <option value="Digital E-Wallet Clearing">Digital E-Wallet Clearing</option>
                  </select>
                </div>
              </div>

              {/* Row 3: External Ref / Slip # & Payment Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#5C636F] mb-1 font-['IBM_Plex_Mono']">
                    External Ref / Slip #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SLIP-9901"
                    value={newExternalRef}
                    onChange={(e) => setNewExternalRef(e.target.value)}
                    className="w-full border border-[#DFE1DB] rounded-lg p-2.5 font-['IBM_Plex_Mono'] text-xs focus:outline-none focus:border-[#157A4D] bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#5C636F] mb-1 font-['IBM_Plex_Mono']">
                    Payment Method / Tender *
                  </label>
                  <select
                    value={newMethod}
                    onChange={(e) => setNewMethod(e.target.value as any)}
                    className="w-full border border-[#DFE1DB] rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:border-[#157A4D] bg-white"
                  >
                    <option value="Credit Card Terminal (BDO POS)">Credit Card Terminal (BDO POS)</option>
                    <option value="Direct Bank Wire (PESONet)">Direct Bank Wire (PESONet)</option>
                    <option value="GCash / Maya QR">GCash / Maya QR</option>
                    <option value="Cash Drop to Vault">Cash Drop to Vault</option>
                    <option value="Corporate Bank Transfer (BPI)">Corporate Bank Transfer (BPI)</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Collection Amount */}
              <div>
                <label className="block font-bold text-[#5C636F] mb-1 font-['IBM_Plex_Mono']">
                  Collection Amount (PHP) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold font-['IBM_Plex_Mono'] text-[#157A4D]">
                    ₱
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    value={newAmount}
                    onChange={(e) => {
                      setNewAmount(e.target.value);
                      setFormError(null);
                    }}
                    className="w-full pl-8 pr-3 py-2.5 border border-[#DFE1DB] rounded-lg font-['IBM_Plex_Mono'] font-bold text-lg focus:outline-none focus:border-[#157A4D] bg-white"
                  />
                </div>
              </div>

              {/* Row 5: Notes / Description */}
              <div>
                <label className="block font-bold text-[#5C636F] mb-1 font-['IBM_Plex_Mono']">
                  Notes / Description
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Direct guest checkout payment settled via POS electronic terminal"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full border border-[#DFE1DB] rounded-lg p-2 text-xs focus:outline-none focus:border-[#157A4D] bg-white resize-none"
                />
              </div>

              {/* Double Entry Posting Preview */}
              <div className="p-3 bg-[#F1F1ED] rounded-xl border border-[#DFE1DB] space-y-1 font-['IBM_Plex_Mono'] text-[11px]">
                <div className="flex justify-between items-center font-bold text-[#5C636F]">
                  <span>AUTOMATED GL POSTING PREVIEW</span>
                  <span className="text-[#157A4D] flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    DEBIT = CREDIT
                  </span>
                </div>
                <div className="text-slate-700">
                  • <strong>DEBIT:</strong> {newVault} (₱{parseFloat(newAmount) || 0})
                </div>
                <div className="text-slate-700">
                  • <strong>CREDIT:</strong> 1210 Accounts Receivable / Revenue (₱{parseFloat(newAmount) || 0})
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#DFE1DB] font-['IBM_Plex_Mono']">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#DFE1DB] rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#157A4D] hover:bg-[#12633e] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Receipt className="h-3.5 w-3.5" />
                  <span>Save Collection &amp; Issue OR</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          3. OFFICIAL RECEIPT VIEW MODAL
         ========================================================================= */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 space-y-4 max-w-md w-full border border-[#DFE1DB] shadow-2xl text-xs">
            <div className="border-b border-[#DFE1DB] pb-3 text-center">
              <span className="text-[10px] font-['IBM_Plex_Mono'] text-[#5C636F] uppercase block tracking-wider">
                OFFICIAL COLLECTION RECEIPT
              </span>
              <h3 className="font-bold text-lg font-['Archivo'] text-[#1A1D21] mt-0.5">
                HORECA Hospitality &amp; Assets
              </h3>
              <p className="text-[11px] font-['IBM_Plex_Mono'] text-[#157A4D] font-bold mt-1 bg-emerald-50 py-1 px-3 rounded-full inline-block border border-emerald-200">
                {selectedReceipt.officialReceiptNo || "OR-REGISTERED"}
              </p>
            </div>

            <div className="space-y-2 font-['IBM_Plex_Mono'] text-xs">
              <div className="flex justify-between py-1 border-b border-[#F1F1ED]">
                <span className="text-[#5C636F]">Invoice ID:</span>
                <span className="font-bold text-[#157A4D]">{selectedReceipt.invoiceId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F1F1ED]">
                <span className="text-[#5C636F]">Received From:</span>
                <span className="font-medium text-[#1A1D21]">{maskField(selectedReceipt.customerName, "name")}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F1F1ED]">
                <span className="text-[#5C636F]">Source Channel:</span>
                <span>{selectedReceipt.sourceChannel}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F1F1ED]">
                <span className="text-[#5C636F]">External Ref / Slip:</span>
                <span>{isDataMasked ? maskField(selectedReceipt.externalRef, "ref") : selectedReceipt.externalRef}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F1F1ED]">
                <span className="text-[#5C636F]">Tender Method:</span>
                <span className="font-medium">{selectedReceipt.method}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F1F1ED]">
                <span className="text-[#5C636F]">Target Treasury:</span>
                <span className="font-medium">{selectedReceipt.targetVault}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F1F1ED]">
                <span className="text-[#5C636F]">Date Cleared:</span>
                <span>{selectedReceipt.date}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F1F1ED]">
                <span className="text-[#5C636F]">AR Reconciliation:</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {selectedReceipt.arMatchStatus}
                </span>
              </div>
              {selectedReceipt.notes && (
                <div className="py-1 text-[11px] text-[#5C636F] italic bg-[#F8F9F6] p-2 rounded">
                  Note: {selectedReceipt.notes}
                </div>
              )}
              <div className="flex justify-between py-2.5 text-base font-bold bg-[#F8F9F6] px-3 rounded-xl border border-[#DFE1DB] mt-2">
                <span>Amount Tendered:</span>
                <span className="text-[#157A4D]">{maskCurrency(selectedReceipt.amount)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#DFE1DB]">
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 bg-[#1A1D21] hover:bg-[#2A2E34] text-white rounded-lg text-xs font-bold font-['IBM_Plex_Mono'] transition-colors cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

