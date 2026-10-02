import React, { useState, useEffect } from "react";
import {
  Hotel,
  Moon,
  Receipt,
  ShieldCheck,
  DollarSign,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  Sparkles,
  KeyRound,
  Lock,
  Send,
  Building2,
  RefreshCw,
  Wallet,
  FileSpreadsheet,
  FileText
} from "lucide-react";
import { fmsBridge, FmsPacket } from "../../src/services/fmsBridge";
import SubsystemDisbursementSection from "../../src/components/SubsystemDisbursementSection";
import SubsystemIncomingArSection from "../../src/components/SubsystemIncomingArSection";

interface NightAuditItem {
  folioId: string;
  roomNumber: string;
  guestName: string;
  roomType: string;
  roomCharge: number;
  roomServiceFnb: number;
  spaAndWellness: number;
  amenitiesTax: number;
  totalFolio: number;
}

const INITIAL_FOLIOS: NightAuditItem[] = [
  {
    folioId: "FOL-501",
    roomNumber: "Suite 401",
    guestName: "Alexander Hayes (Global Corp)",
    roomType: "Executive Presidential Suite",
    roomCharge: 38000,
    roomServiceFnb: 4200,
    spaAndWellness: 5500,
    amenitiesTax: 5724,
    totalFolio: 53424,
  },
  {
    folioId: "FOL-502",
    roomNumber: "Deluxe 305",
    guestName: "Maria Corazon",
    roomType: "Deluxe Ocean View",
    roomCharge: 18500,
    roomServiceFnb: 1800,
    spaAndWellness: 2800,
    amenitiesTax: 2772,
    totalFolio: 25872,
  },
  {
    folioId: "FOL-503",
    roomNumber: "Premier 210",
    guestName: "Kenji Sato",
    roomType: "Premier Garden Suite",
    roomCharge: 24000,
    roomServiceFnb: 2600,
    spaAndWellness: 4000,
    amenitiesTax: 3672,
    totalFolio: 34272,
  },
  {
    folioId: "FOL-504",
    roomNumber: "Deluxe 312",
    guestName: "Claire Vance",
    roomType: "Deluxe Twin",
    roomCharge: 14500,
    roomServiceFnb: 950,
    spaAndWellness: 0,
    amenitiesTax: 1854,
    totalFolio: 17304,
  },
  {
    folioId: "FOL-505",
    roomNumber: "Suite 508",
    guestName: "James Wong",
    roomType: "Penthouse Suite",
    roomCharge: 50000,
    roomServiceFnb: 6850,
    spaAndWellness: 8200,
    amenitiesTax: 7806,
    totalFolio: 72856,
  },
];

interface GuestRefundClaim {
  id: string;
  roomNumber: string;
  guestName: string;
  claimType: "Security Deposit Refund" | "Early Checkout Credit" | "Amenity Disruption Reimbursement";
  amount: number;
  originalFolio: string;
  paymentRail: "Cash at Front Desk" | "Credit Card Authorization Release" | "Bank EFT";
  status: "Draft (Pending Super Admin)" | "Approved" | "Disbursed";
  reason: string;
}

const INITIAL_REFUNDS: GuestRefundClaim[] = [
  {
    id: "REF-2026-091",
    roomNumber: "Suite 508",
    guestName: "James Wong",
    claimType: "Security Deposit Refund",
    amount: 10000,
    originalFolio: "FOL-505",
    paymentRail: "Cash at Front Desk",
    status: "Draft (Pending Super Admin)",
    reason: "Standard Room Inspection Cleared, Minibar Checked without Incident",
  },
  {
    id: "REF-2026-092",
    roomNumber: "Deluxe 312",
    guestName: "Claire Vance",
    claimType: "Early Checkout Credit",
    amount: 4500,
    originalFolio: "FOL-504",
    paymentRail: "Credit Card Authorization Release",
    status: "Draft (Pending Super Admin)",
    reason: "Flight rebooked 1 day earlier; waived late cancellation charge per GM approval",
  },
];

interface SimpleDashboardProps {
  onNavigateToFms?: (tab?: string) => void;
}

export default function SimpleDashboard({ onNavigateToFms }: SimpleDashboardProps) {
  const [folios] = useState<NightAuditItem[]>(INITIAL_FOLIOS);
  const [refundClaims, setRefundClaims] = useState<GuestRefundClaim[]>(INITIAL_REFUNDS);
  const [activeTab, setActiveTab] = useState<"night_audit" | "refunds" | "cash_float" | "disbursements" | "incoming_ar">("night_audit");

  // Front Desk Shift Cash Float State
  const [beginningFloat, setBeginningFloat] = useState<number>(20000);
  const [shiftCollections, setShiftCollections] = useState<number>(54500);
  const [shiftPaidOuts, setShiftPaidOuts] = useState<number>(2000);
  const [dropSafeAmount, setDropSafeAmount] = useState<number>(48000);
  const [witness1Name, setWitness1Name] = useState<string>("Mark Tan (Front Desk Cashier)");
  const [witness2Name, setWitness2Name] = useState<string>("Sofia Reyes (Duty Night Manager)");
  const [witnessPin, setWitnessPin] = useState<string>("8821");

  // FMS Interop State
  const [fmsStatus, setFmsStatus] = useState<any>(fmsBridge.getCurrentFmsMetrics());
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [transmissionLogs, setTransmissionLogs] = useState<FmsPacket[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTransmissionLogs(fmsBridge.getTransmissionLogs("Hotel-MNGT"));
    const handleSync = () => {
      setTransmissionLogs(fmsBridge.getTransmissionLogs("Hotel-MNGT"));
      setFmsStatus(fmsBridge.getCurrentFmsMetrics());
    };
    window.addEventListener("fms-sync-event", handleSync);
    return () => window.removeEventListener("fms-sync-event", handleSync);
  }, []);

  // Totals for Night Audit
  const totalRoomRevenue = folios.reduce((s, f) => s + f.roomCharge, 0);
  const totalRoomService = folios.reduce((s, f) => s + f.roomServiceFnb, 0);
  const totalSpa = folios.reduce((s, f) => s + f.spaAndWellness, 0);
  const totalTaxes = folios.reduce((s, f) => s + f.amenitiesTax, 0);
  const totalNightAuditPosting = folios.reduce((s, f) => s + f.totalFolio, 0);

  // Ending Cash Float in Cash Drawer
  const endingDrawerCash = beginningFloat + shiftCollections - shiftPaidOuts - dropSafeAmount;

  // ACTION 1: Night Audit & Daily Revenue Posting
  const handlePostNightAudit = () => {
    setIsSubmitting(true);
    const auditRef = `NA-PMS-${new Date().toISOString().split("T")[0].replace(/-/g, "")}`;

    // Post balanced multi-leg journal entry into FMS General Ledger
    fmsBridge.postJournalEntry({
      sourceModule: "Hotel-MNGT",
      ref: auditRef,
      memo: `Night Audit Daily Revenue & Guest Folio Posting for ${folios.length} In-House Folios`,
      lines: [
        {
          accountCode: "1200",
          accountName: "1200 - Guest Ledger (In-House Resident Folios)",
          debit: totalNightAuditPosting,
          credit: 0,
          memo: `Total Gross Folios Debited to Resident Ledger`,
        },
        {
          accountCode: "4010",
          accountName: "4010 - Hotel Room Revenue - Deluxe & Suites",
          debit: 0,
          credit: totalRoomRevenue,
          memo: `Daily Room Charges Posting`,
        },
        {
          accountCode: "4020",
          accountName: "4020 - F&B Room Service & In-Room Dining Revenue",
          debit: 0,
          credit: totalRoomService,
          memo: `Room Service Food & Beverage`,
        },
        {
          accountCode: "4040",
          accountName: "4040 - Spa, Wellness & Amenity Revenues",
          debit: 0,
          credit: totalSpa,
          memo: `Spa & Amenity Revenue Allocation`,
        },
        {
          accountCode: "2130",
          accountName: "2130 - Output Value Added Tax & Local Hospitality Taxes",
          debit: 0,
          credit: totalTaxes,
          memo: `Output VAT (12%) & Local Tourism Tax`,
        },
      ],
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setActionSuccessMessage(
        `Night Audit [${auditRef}] successfully posted to FMS Master General Ledger! ₱${totalNightAuditPosting.toLocaleString()} balanced across 5 ledger accounts.`
      );
      setFmsStatus(fmsBridge.getCurrentFmsMetrics());
    }, 400);
  };

  // ACTION 2: Guest Refund & Security Deposit Claims (Approval Queue Trigger)
  const handleTriggerRefundApproval = (claim: GuestRefundClaim) => {
    setIsSubmitting(true);

    fmsBridge.submitApprovalRequest({
      sourceModule: "Hotel-MNGT",
      actionType: "APPROVE_GUEST_REFUND_CLAIM",
      title: `Guest Refund Claim [${claim.id}]: ${claim.guestName} (${claim.roomNumber})`,
      amount: claim.amount,
      requestedBy: "Duty Front Desk Manager",
      impactSummary: `Requires Super Admin authorization before executing ₱${claim.amount.toLocaleString()} payout via ${claim.paymentRail}. Relates to Folio ${claim.originalFolio}: "${claim.reason}".`,
      payload: {
        claimId: claim.id,
        roomNumber: claim.roomNumber,
        guestName: claim.guestName,
        claimType: claim.claimType,
        amount: claim.amount,
        paymentRail: claim.paymentRail,
        reason: claim.reason,
        originalFolio: claim.originalFolio,
      },
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setActionSuccessMessage(
        `Draft Refund Voucher [${claim.id}] dispatched to FMS Super Admin Approval Queue! Cash payout locked until approved.`
      );
      setFmsStatus(fmsBridge.getCurrentFmsMetrics());
    }, 400);
  };

  // ACTION 3: Front Desk Cash Float Reconciliations
  const handleSubmitDropSafeReport = () => {
    if (!witnessPin) {
      alert("Please input the Duty Manager verification PIN.");
      return;
    }
    setIsSubmitting(true);
    const dropRef = `SAFE-DROP-${Date.now().toString().slice(-4)}`;

    // 1. Update FMS Treasury Cash Pool
    fmsBridge.updateCashPool({
      pettyCash: -dropSafeAmount,
      reason: `Front Desk Shift Cash Drop to Safe: ₱${dropSafeAmount.toLocaleString()} (Verified by ${witness1Name} & ${witness2Name})`,
      sourceModule: "Hotel-MNGT",
    });

    // 2. Post GL Entry: Transfer from Drawer Float to Drop Safe Float
    fmsBridge.postJournalEntry({
      sourceModule: "Hotel-MNGT",
      ref: dropRef,
      memo: `Front Desk Shift Cash Float Reconciliation & Drop Safe Transfer`,
      lines: [
        {
          accountCode: "1020",
          accountName: "1020 - Petty Cash & Drop Safe Holding Account",
          debit: dropSafeAmount,
          credit: 0,
          memo: `Dual-witness shift drop-safe transfer from drawer`,
        },
        {
          accountCode: "1010",
          accountName: "1010 - Front Desk Cash Float (Active Till)",
          debit: 0,
          credit: dropSafeAmount,
          memo: `Relieving drawer cash float to safe threshold`,
        },
      ],
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setActionSuccessMessage(
        `Dual-Witness Drop-Safe Report [${dropRef}] submitted to FMS Treasury! ₱${dropSafeAmount.toLocaleString()} credited to Safe Holding and drawer float reconciled.`
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
            <div className="bg-sky-600 text-white p-3 rounded-xl shadow-md">
              <Hotel className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                  Subsystem 02 / Operational Module
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  FMS Live Connected
                </span>
              </div>
              <h1 className="text-2xl font-black font-['Archivo'] tracking-tight text-slate-900 mt-1">
                Hotel Operations &amp; PMS Management
              </h1>
              <p className="text-xs text-slate-500 font-['IBM_Plex_Mono']">
                Night Audit Revenue Posting, Dual-Witness Cash Reconciliation &amp; Refund Approval Workflows
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onNavigateToFms && (
              <button
                onClick={() => onNavigateToFms("gl")}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold font-['IBM_Plex_Mono'] rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <span>View FMS General Ledger</span>
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
              <span>Daily Room Charges</span>
              <Building2 className="h-4 w-4 text-sky-600" />
            </div>
            <p className="text-2xl font-black font-['IBM_Plex_Mono'] text-slate-900 mt-2">
              ₱{totalRoomRevenue.toLocaleString()}
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-['IBM_Plex_Mono']">
              <span>Suites &amp; Deluxe</span>
              <span className="text-sky-700 font-bold">Occupancy 92%</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
              <span>Total Audit Gross Folios</span>
              <Moon className="h-4 w-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-black font-['IBM_Plex_Mono'] text-indigo-700 mt-2">
              ₱{totalNightAuditPosting.toLocaleString()}
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-['IBM_Plex_Mono']">
              <span>Rooms + F&amp;B + Spa + Tax</span>
              <span className="text-indigo-700 font-bold">{folios.length} Active Folios</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
              <span>Ending Drawer Cash Float</span>
              <Wallet className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black font-['IBM_Plex_Mono'] text-slate-900 mt-2">
              ₱{endingDrawerCash.toLocaleString()}
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-['IBM_Plex_Mono']">
              <span>Safe Drop: ₱{dropSafeAmount.toLocaleString()}</span>
              <span className="text-emerald-700 font-bold">Balanced</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
              <span>Pending Refund Claims</span>
              <ShieldCheck className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black font-['IBM_Plex_Mono'] text-amber-700 mt-2">
              ₱{refundClaims.reduce((s, r) => s + r.amount, 0).toLocaleString()}
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-['IBM_Plex_Mono']">
              <span>Super Admin Approval Required</span>
              <span className="text-amber-700 font-bold">{refundClaims.length} Claims</span>
            </div>
          </div>
        </div>

        {/* Action Tabs Header */}
        <div className="flex border-b border-slate-200 gap-2">
          <button
            onClick={() => setActiveTab("night_audit")}
            className={`px-4 py-2.5 text-xs font-bold font-['IBM_Plex_Mono'] rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "night_audit"
                ? "bg-white text-sky-700 border-t-2 border-sky-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Moon className="h-3.5 w-3.5" />
            <span>1. Night Audit &amp; Daily Revenue Posting</span>
          </button>

          <button
            onClick={() => setActiveTab("refunds")}
            className={`px-4 py-2.5 text-xs font-bold font-['IBM_Plex_Mono'] rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "refunds"
                ? "bg-white text-amber-700 border-t-2 border-amber-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Receipt className="h-3.5 w-3.5" />
            <span>2. Guest Refund &amp; Security Deposit Claims</span>
          </button>

          <button
            onClick={() => setActiveTab("cash_float")}
            className={`px-4 py-2.5 text-xs font-bold font-['IBM_Plex_Mono'] rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "cash_float"
                ? "bg-white text-emerald-700 border-t-2 border-emerald-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>3. Front Desk Cash Float Reconciliations</span>
          </button>

          <button
            onClick={() => setActiveTab("disbursements")}
            className={`px-4 py-2.5 text-xs font-bold font-['IBM_Plex_Mono'] rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "disbursements"
                ? "bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>4. Invoiced Disbursements &amp; Receipts</span>
          </button>

          <button
            onClick={() => setActiveTab("incoming_ar")}
            className={`px-4 py-2.5 text-xs font-bold font-['IBM_Plex_Mono'] rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "incoming_ar"
                ? "bg-white text-blue-700 border-t-2 border-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>5. Simulate Incoming AR</span>
          </button>
        </div>

        {/* TAB 1: NIGHT AUDIT & DAILY REVENUE POSTING */}
        {activeTab === "night_audit" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-200 gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-['Archivo']">
                  End-of-Day Night Audit &amp; Revenue Reconciliation
                </h2>
                <p className="text-xs text-slate-500 font-['IBM_Plex_Mono'] mt-0.5">
                  Closes the daily guest ledger, audits folio postings, and dispatches a multi-leg balanced journal entry to the FMS General Ledger.
                </p>
              </div>
              <button
                onClick={handlePostNightAudit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold font-['IBM_Plex_Mono'] rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <Moon className="h-4 w-4" />
                <span>Push Daily Revenue to FMS General Ledger</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-['IBM_Plex_Mono']">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <th className="py-2.5 px-3">Folio ID</th>
                    <th className="py-2.5 px-3">Room / Guest</th>
                    <th className="py-2.5 px-3">Room Type</th>
                    <th className="py-2.5 px-3 text-right">Room Charge</th>
                    <th className="py-2.5 px-3 text-right">In-Room F&amp;B</th>
                    <th className="py-2.5 px-3 text-right">Spa &amp; Amenities</th>
                    <th className="py-2.5 px-3 text-right">VAT &amp; Tourism Tax</th>
                    <th className="py-2.5 px-3 text-right font-bold text-sky-700">Total Folio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {folios.map((folio) => (
                    <tr key={folio.folioId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-slate-800">{folio.folioId}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-slate-900 block">{folio.guestName}</span>
                        <span className="text-[10px] text-slate-400">{folio.roomNumber}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{folio.roomType}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">₱{folio.roomCharge.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right text-slate-700">₱{folio.roomServiceFnb.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right text-slate-700">₱{folio.spaAndWellness.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">₱{folio.amenitiesTax.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-sky-700 bg-sky-50/40">
                        ₱{folio.totalFolio.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                    <td colSpan={3} className="py-3 px-3 uppercase">Total Audit Posting Batch</td>
                    <td className="py-3 px-3 text-right text-slate-900">₱{totalRoomRevenue.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right text-slate-900">₱{totalRoomService.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right text-slate-900">₱{totalSpa.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right text-slate-900">₱{totalTaxes.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right text-sky-700 text-sm font-black">
                      ₱{totalNightAuditPosting.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* FMS GL Preview Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-['IBM_Plex_Mono']">
              <span className="font-bold text-slate-700 block uppercase mb-2">
                FMS General Ledger Balanced Posting Scheme:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-600">
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="font-bold text-emerald-700 block">DEBIT:</span>
                  <span>1200 - Guest Ledger (In-House Resident Folios): ₱{totalNightAuditPosting.toLocaleString()}</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="font-bold text-red-700 block">CREDIT:</span>
                  <span>4010 Room Revenue (₱{totalRoomRevenue.toLocaleString()}) + 4020 F&amp;B (₱{totalRoomService.toLocaleString()}) + 4040 Spa (₱{totalSpa.toLocaleString()}) + 2130 Taxes (₱{totalTaxes.toLocaleString()})</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GUEST REFUND & SECURITY DEPOSIT CLAIMS */}
        {activeTab === "refunds" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-200 gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-['Archivo']">
                  Guest Refund &amp; Security Deposit Claims
                </h2>
                <p className="text-xs text-slate-500 font-['IBM_Plex_Mono'] mt-0.5">
                  Prevents unauthorized cash leakage by routing all guest refunds and security deposit claims through the FMS Super Admin Approval Queue.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {refundClaims.map((claim) => (
                <div
                  key={claim.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm font-['IBM_Plex_Mono']">{claim.id}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 font-['IBM_Plex_Mono']">
                        {claim.status}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 font-['IBM_Plex_Mono']">
                      {claim.guestName} ({claim.roomNumber}) — Folio Ref: {claim.originalFolio}
                    </p>
                    <p className="text-xs text-slate-500 font-['IBM_Plex_Mono']">
                      Claim Type: <span className="font-medium text-slate-700">{claim.claimType}</span> | Rail: {claim.paymentRail}
                    </p>
                    <p className="text-[11px] text-slate-500 italic font-['IBM_Plex_Mono']">
                      Reason: "{claim.reason}"
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-['IBM_Plex_Mono'] uppercase block">Claim Amount</span>
                      <span className="text-xl font-black font-['IBM_Plex_Mono'] text-slate-900">
                        ₱{claim.amount.toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => handleTriggerRefundApproval(claim)}
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold font-['IBM_Plex_Mono'] rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span>Submit for Super Admin Approval</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: FRONT DESK CASH FLOAT RECONCILIATIONS */}
        {activeTab === "cash_float" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-200 gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-['Archivo']">
                  Dual-Witness Cash Drawer &amp; Drop-Safe Reconciliation
                </h2>
                <p className="text-xs text-slate-500 font-['IBM_Plex_Mono'] mt-0.5">
                  Submits shift cash drawer collections and safe drop deposits to FMS Treasury with mandatory dual-witness verification.
                </p>
              </div>
              <button
                onClick={handleSubmitDropSafeReport}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-['IBM_Plex_Mono'] rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <Lock className="h-4 w-4" />
                <span>Submit Dual-Witness Drop-Safe to Treasury</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold uppercase text-slate-500 font-['IBM_Plex_Mono'] block">
                  Beginning Float (₱)
                </span>
                <input
                  type="number"
                  value={beginningFloat}
                  onChange={(e) => setBeginningFloat(Number(e.target.value))}
                  className="w-full mt-2 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-bold font-['IBM_Plex_Mono']"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold uppercase text-slate-500 font-['IBM_Plex_Mono'] block">
                  Shift Guest Collections (₱)
                </span>
                <input
                  type="number"
                  value={shiftCollections}
                  onChange={(e) => setShiftCollections(Number(e.target.value))}
                  className="w-full mt-2 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-bold font-['IBM_Plex_Mono'] text-emerald-700"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold uppercase text-slate-500 font-['IBM_Plex_Mono'] block">
                  Paid-Outs / Petty Cash (₱)
                </span>
                <input
                  type="number"
                  value={shiftPaidOuts}
                  onChange={(e) => setShiftPaidOuts(Number(e.target.value))}
                  className="w-full mt-2 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-bold font-['IBM_Plex_Mono'] text-red-600"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold uppercase text-slate-500 font-['IBM_Plex_Mono'] block">
                  Cash Drop to Safe (₱)
                </span>
                <input
                  type="number"
                  value={dropSafeAmount}
                  onChange={(e) => setDropSafeAmount(Number(e.target.value))}
                  className="w-full mt-2 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-bold font-['IBM_Plex_Mono'] text-sky-700"
                />
              </div>
            </div>

            {/* Dual Witness Authentication Section */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-700 font-['IBM_Plex_Mono']">
                <KeyRound className="h-4 w-4 text-emerald-600" />
                <span>Dual-Witness Sign-Off &amp; Treasury Verification</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-slate-500 font-['IBM_Plex_Mono'] block mb-1">
                    Primary Cashier Witness
                  </label>
                  <input
                    type="text"
                    value={witness1Name}
                    onChange={(e) => setWitness1Name(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-['IBM_Plex_Mono']"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500 font-['IBM_Plex_Mono'] block mb-1">
                    Duty Night Manager Witness
                  </label>
                  <input
                    type="text"
                    value={witness2Name}
                    onChange={(e) => setWitness2Name(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-['IBM_Plex_Mono']"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-500 font-['IBM_Plex_Mono'] block mb-1">
                    Manager Drop-Safe Security PIN
                  </label>
                  <input
                    type="password"
                    value={witnessPin}
                    onChange={(e) => setWitnessPin(e.target.value)}
                    placeholder="Enter PIN"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold font-['IBM_Plex_Mono'] tracking-widest"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: INVOICED DISBURSEMENTS & ALLOCATION RECEIPTS (BUDGET CAPPED) */}
        {activeTab === "disbursements" && (
          <SubsystemDisbursementSection
            sourceModule="Hotel-MNGT"
            departmentName="Hotel Management"
            defaultCostCenter="Hotel Operations - Housekeeping & Rooms"
            defaultCategory="Operational Supplies & Linens"
            defaultGlDebitAccount="5010 - Hotel Guest Supplies, Amenities & Maintenance"
            requesterName="Sheila Suede (Hotel Operations Director)"
            onNavigateToFms={onNavigateToFms}
            presets={[
              {
                payee: "Manila Luxury Linens & Textiles Corp.",
                purpose: "Guest Suite Egyptian Cotton Bedding & Towel Replacement",
                amount: 85000,
                allocationItems: [
                  { item: "300-Thread Count King Duvet Covers & Pillowcases", category: "Linen Restock", amount: 52000, percentage: 61 },
                  { item: "Luxury Turkish Cotton Bath Towel Sets", category: "Bath Amenities", amount: 25000, percentage: 29 },
                  { item: "Express Sanitization & Logistics Freight", category: "Freight Handling", amount: 8000, percentage: 10 }
                ]
              },
              {
                payee: "Otis Elevator & HVAC Preventive Maintenance",
                purpose: "Guest Lift Safety Overhaul & Chiller Chilled-Water Recalibration",
                amount: 42000,
                allocationItems: [
                  { item: "Elevator Traction Cable & Governor Safety Check", category: "Safety Maintenance", amount: 26000, percentage: 62 },
                  { item: "Central Chiller Freon & Compressor Diagnostics", category: "HVAC Engineering", amount: 16000, percentage: 38 }
                ]
              },
              {
                payee: "Eco-San Luxury Guest Amenities & Toiletries",
                purpose: "VIP Suite Biodegradable Toiletries & Vanity Kits Restock",
                amount: 28000,
                allocationItems: [
                  { item: "Organic Bamboo Toothbrushes & Shaving Kits", category: "Dry Amenities", amount: 15000, percentage: 54 },
                  { item: "Essential Oil Shampoos & Body Wash (500ml Dispenser)", category: "Wet Toiletries", amount: 13000, percentage: 46 }
                ]
              }
            ]}
          />
        )}

        {/* TAB 5: SIMULATE INCOMING AR (CORPORATE & OTA INVOICING) */}
        {activeTab === "incoming_ar" && (
          <SubsystemIncomingArSection
            sourceModule="Hotel-MNGT"
            requesterName="Sheila Suede (Hotel Front Office Director)"
            defaultCategory="Hotel Room Folio / City Ledger"
            onNavigateToFms={onNavigateToFms}
            presets={[
              {
                customer: "San Miguel Corporation Corporate Events",
                category: "Corporate Banquet & Event",
                amount: 185000,
                terms: "Net 30 Days",
                paymentMethod: "Corporate City Ledger Billing",
                notes: "Annual Board of Directors Conference & Grand Ballroom banquet booking"
              },
              {
                customer: "Ayala Land Executive Corporate Stay",
                category: "Hotel Room Folio / City Ledger",
                amount: 120000,
                terms: "Net 30 Days",
                paymentMethod: "Corporate City Ledger Billing",
                notes: "14-night corporate accommodation in Presidential Executive Suite 401"
              },
              {
                customer: "Agoda / Booking.com B2B Travel Operations",
                category: "Travel Agency OTA Billing",
                amount: 85000,
                terms: "Net 15 Days",
                paymentMethod: "Bank Transfer (BDO Unibank)",
                notes: "Monthly OTA verified corporate bookings & international guest reconciliations"
              }
            ]}
          />
        )}

        {/* FMS Transmission Logs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-sky-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider font-['IBM_Plex_Mono'] text-slate-700">
                FMS Outbox Transmission Log (Hotel Subsystem)
              </h3>
            </div>
            <span className="text-[11px] font-bold font-['IBM_Plex_Mono'] text-slate-500">
              Treasury Operating Balance: ₱{fmsStatus?.bankOperatingBalance?.toLocaleString() || 0}
            </span>
          </div>

          <div className="mt-3 space-y-2">
            {transmissionLogs.length === 0 ? (
              <p className="text-xs text-slate-400 font-['IBM_Plex_Mono'] py-3 text-center">
                No outbound hotel packets logged yet. Post Night Audit or submit Cash Float above.
              </p>
            ) : (
              transmissionLogs.slice(0, 5).map((pkt) => (
                <div
                  key={pkt.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-['IBM_Plex_Mono'] gap-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 font-bold text-[10px]">
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
