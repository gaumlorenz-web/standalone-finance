import React, { useState, useEffect } from "react";
import {
  Users,
  DollarSign,
  FileCheck,
  Send,
  Building,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Layers,
  Percent,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Calculator,
  ShieldCheck,
  UserCheck,
  FileText
} from "lucide-react";
import { fmsBridge, FmsPacket } from "../../src/services/fmsBridge";
import SubsystemDisbursementSection from "../../src/components/SubsystemDisbursementSection";

interface EmployeePayroll {
  id: string;
  name: string;
  department: string;
  position: string;
  grossPay: number;
  sssDeduction: number;
  philHealthDeduction: number;
  pagIbigDeduction: number;
  withholdingTax: number;
  loanDeduction: number;
  netPay: number;
}

const INITIAL_STAFF: EmployeePayroll[] = [
  {
    id: "EMP-101",
    name: "Maria Santos",
    department: "Kitchen & F&B",
    position: "Head Sous Chef",
    grossPay: 42000,
    sssDeduction: 1890,
    philHealthDeduction: 1050,
    pagIbigDeduction: 200,
    withholdingTax: 3200,
    loanDeduction: 2500,
    netPay: 33160,
  },
  {
    id: "EMP-102",
    name: "Juan Dela Cruz",
    department: "Front Office",
    position: "Duty Front Desk Manager",
    grossPay: 36000,
    sssDeduction: 1620,
    philHealthDeduction: 900,
    pagIbigDeduction: 200,
    withholdingTax: 2450,
    loanDeduction: 1500,
    netPay: 29330,
  },
  {
    id: "EMP-103",
    name: "Elena Bautista",
    department: "Housekeeping",
    position: "Executive Floor Supervisor",
    grossPay: 28000,
    sssDeduction: 1260,
    philHealthDeduction: 700,
    pagIbigDeduction: 200,
    withholdingTax: 1680,
    loanDeduction: 0,
    netPay: 24160,
  },
  {
    id: "EMP-104",
    name: "Carlo Mendoza",
    department: "Kitchen & F&B",
    position: "Senior Line Cook",
    grossPay: 25000,
    sssDeduction: 1125,
    philHealthDeduction: 625,
    pagIbigDeduction: 200,
    withholdingTax: 1350,
    loanDeduction: 1000,
    netPay: 20700,
  },
  {
    id: "EMP-105",
    name: "Rochelle Gomez",
    department: "Fleet Operations",
    position: "Logistics & Shuttle Lead",
    grossPay: 27000,
    sssDeduction: 1215,
    philHealthDeduction: 675,
    pagIbigDeduction: 200,
    withholdingTax: 1550,
    loanDeduction: 0,
    netPay: 23360,
  },
];

interface EmployeeLoan {
  id: string;
  employeeName: string;
  loanType: "Emergency Vale" | "Salary Advance" | "Hospitalization Aid";
  originalAmount: number;
  currentBalance: number;
  monthlyDeduction: number;
  approvedDate: string;
  status: "Active" | "Liquidated";
}

const INITIAL_LOANS: EmployeeLoan[] = [
  {
    id: "LN-2026-081",
    employeeName: "Maria Santos",
    loanType: "Emergency Vale",
    originalAmount: 15000,
    currentBalance: 7500,
    monthlyDeduction: 2500,
    approvedDate: "2026-07-01",
    status: "Active",
  },
  {
    id: "LN-2026-088",
    employeeName: "Juan Dela Cruz",
    loanType: "Salary Advance",
    originalAmount: 6000,
    currentBalance: 3000,
    monthlyDeduction: 1500,
    approvedDate: "2026-07-15",
    status: "Active",
  },
  {
    id: "LN-2026-092",
    employeeName: "Carlo Mendoza",
    loanType: "Salary Advance",
    originalAmount: 4000,
    currentBalance: 2000,
    monthlyDeduction: 1000,
    approvedDate: "2026-08-01",
    status: "Active",
  },
];

interface SimpleDashboardProps {
  onNavigateToFms?: (tab?: string) => void;
}

export default function SimpleDashboard({ onNavigateToFms }: SimpleDashboardProps) {
  const [staff] = useState<EmployeePayroll[]>(INITIAL_STAFF);
  const [loans, setLoans] = useState<EmployeeLoan[]>(INITIAL_LOANS);
  const [activeTab, setActiveTab] = useState<"payroll" | "service_charge" | "loans" | "disbursements">("payroll");

  // Service Charge (85%) Pool state
  const [posGrossServiceCharge, setPosGrossServiceCharge] = useState<number>(180000);
  const [serviceChargeRate, setServiceChargeRate] = useState<number>(85); // RA 11360 statutory 85%
  const [eligibleStaffCount, setEligibleStaffCount] = useState<number>(28);

  // Status & Notification
  const [fmsStatus, setFmsStatus] = useState<any>(fmsBridge.getCurrentFmsMetrics());
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [transmissionLogs, setTransmissionLogs] = useState<FmsPacket[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTransmissionLogs(fmsBridge.getTransmissionLogs("HR-Payroll"));
    const handleSync = () => {
      setTransmissionLogs(fmsBridge.getTransmissionLogs("HR-Payroll"));
      setFmsStatus(fmsBridge.getCurrentFmsMetrics());
    };
    window.addEventListener("fms-sync-event", handleSync);
    return () => window.removeEventListener("fms-sync-event", handleSync);
  }, []);

  // Totals for payroll batch
  const totalGross = staff.reduce((s, e) => s + e.grossPay, 0);
  const totalSSS = staff.reduce((s, e) => s + e.sssDeduction, 0);
  const totalPhilHealth = staff.reduce((s, e) => s + e.philHealthDeduction, 0);
  const totalPagIbig = staff.reduce((s, e) => s + e.pagIbigDeduction, 0);
  const totalWht = staff.reduce((s, e) => s + e.withholdingTax, 0);
  const totalLoans = staff.reduce((s, e) => s + e.loanDeduction, 0);
  const totalStatutory = totalSSS + totalPhilHealth + totalPagIbig + totalWht;
  const totalNetPayout = totalGross - totalStatutory - totalLoans;

  // Service charge pool calculations
  const serviceChargePool = Math.round(posGrossServiceCharge * (serviceChargeRate / 100));
  const perStaffShare = eligibleStaffCount > 0 ? Math.round((serviceChargePool / eligibleStaffCount) * 100) / 100 : 0;

  // Total active loans balance
  const totalActiveLoansBalance = loans.filter((l) => l.status === "Active").reduce((s, l) => s + l.currentBalance, 0);

  // ACTION 1: Push Payroll Disbursement Request to Executive Approval
  const handlePushPayrollDisbursement = () => {
    setIsSubmitting(true);
    const batchId = `PAY-2026-Q3-${Math.floor(100 + Math.random() * 900)}`;

    // 1. Submit to Approval Queue
    const approvalResult = fmsBridge.submitApprovalRequest({
      sourceModule: "HR-Payroll",
      actionType: "APPROVE_PAYROLL_DISBURSEMENT_BATCH",
      title: `Semi-Monthly Payroll Payout Batch [${batchId}]`,
      amount: totalNetPayout,
      requestedBy: "HR & Payroll Director",
      impactSummary: `Executive Approval for Gross ₱${totalGross.toLocaleString()} less Statutory Deductions (SSS/PhilHealth/HDMF/WHT ₱${totalStatutory.toLocaleString()}) and Loan Deductions (₱${totalLoans.toLocaleString()}). Net Payout of ₱${totalNetPayout.toLocaleString()} to be disbursed from Operating Treasury.`,
      payload: {
        batchId,
        staffCount: staff.length,
        totalGross,
        totalStatutory,
        statutoryBreakdown: { sss: totalSSS, philHealth: totalPhilHealth, pagIbig: totalPagIbig, withholdingTax: totalWht },
        totalLoansDeducted: totalLoans,
        netPayout: totalNetPayout,
        records: staff,
      },
    });

    // 2. Post Accrual to Master General Ledger
    fmsBridge.postJournalEntry({
      sourceModule: "HR-Payroll",
      ref: batchId,
      memo: `Payroll Accrual & Statutory Liabilities: Batch ${batchId}`,
      lines: [
        {
          accountCode: "5110",
          accountName: "5110 - Executive, Front Desk & Kitchen Salaries Expense",
          debit: totalGross,
          credit: 0,
        },
        {
          accountCode: "2030",
          accountName: "2030 - SSS, PhilHealth & Pag-IBIG Premiums Payable",
          debit: 0,
          credit: totalSSS + totalPhilHealth + totalPagIbig,
          memo: "Statutory Deductions Accrual",
        },
        {
          accountCode: "2140",
          accountName: "2140 - Withholding Taxes Payable (BIR Form 1601-C)",
          debit: 0,
          credit: totalWht,
          memo: "Employee Tax Withheld",
        },
        {
          accountCode: "1220",
          accountName: "1220 - Advances to Officers & Employees (Receivables)",
          debit: 0,
          credit: totalLoans,
          memo: "Salary Advance Liquidation Recovery",
        },
        {
          accountCode: "2020",
          accountName: "2020 - Net Salaries Payable (Pending Executive Approval)",
          debit: 0,
          credit: totalNetPayout,
          memo: "Net Payout Liability Batch",
        },
      ],
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setActionSuccessMessage(
        `Payroll Batch [${batchId}] (₱${totalNetPayout.toLocaleString()}) dispatched to Admin (Stage 1)! Once verified, Admin forwards to Super Admin for executive disbursement.`
      );
      setFmsStatus(fmsBridge.getCurrentFmsMetrics());
    }, 400);
  };

  // ACTION 2: Queue Statutory 85% Service Charge Distribution
  const handleQueueServiceCharge = () => {
    setIsSubmitting(true);
    const ref = `SC-DIST-2026-${Math.floor(100 + Math.random() * 900)}`;

    // Post to General Ledger
    fmsBridge.postJournalEntry({
      sourceModule: "HR-Payroll",
      ref,
      memo: `Statutory 85% Service Charge Pool Allocation (RA 11360) for ${eligibleStaffCount} Staff`,
      lines: [
        {
          accountCode: "2150",
          accountName: "2150 - Accrued Service Charge Liability (Collected at POS)",
          debit: serviceChargePool,
          credit: 0,
          memo: `85% Pool from ₱${posGrossServiceCharge.toLocaleString()} Gross Collection`,
        },
        {
          accountCode: "2020",
          accountName: "2020 - Salaries & Service Charge Payable to Staff",
          debit: 0,
          credit: serviceChargePool,
          memo: `₱${perStaffShare.toLocaleString()} per employee across ${eligibleStaffCount} team members`,
        },
      ],
    });

    // Also notify Approval Queue
    fmsBridge.submitApprovalRequest({
      sourceModule: "HR-Payroll",
      actionType: "RELEASE_SERVICE_CHARGE_PAYOUT",
      title: `Service Charge 85% Pool Distribution (₱${serviceChargePool.toLocaleString()})`,
      amount: serviceChargePool,
      requestedBy: "HR Payroll Supervisor",
      impactSummary: `Distributes statutory 85% service charge pool of ₱${serviceChargePool.toLocaleString()} equally (₱${perStaffShare.toLocaleString()} each) to ${eligibleStaffCount} rank-and-file & supervisory staff pursuant to RA 11360.`,
      payload: {
        ref,
        posGross: posGrossServiceCharge,
        ratePercent: serviceChargeRate,
        distributedPool: serviceChargePool,
        eligibleStaffCount,
        perStaffShare,
      },
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setActionSuccessMessage(
        `Service Charge Pool (₱${serviceChargePool.toLocaleString()}) dispatched to Admin (Stage 1)! Once verified, Admin forwards to Super Admin for release.`
      );
      setFmsStatus(fmsBridge.getCurrentFmsMetrics());
    }, 400);
  };

  // ACTION 3: Deduct Loans & Update General Ledger Receivables
  const handleLiquidateLoans = () => {
    setIsSubmitting(true);
    const ref = `LN-DED-${Date.now().toString().slice(-4)}`;

    // Update local loan balances
    const updatedLoans = loans.map((loan) => {
      const deduction = loan.monthlyDeduction;
      const nextBal = Math.max(0, loan.currentBalance - deduction);
      return {
        ...loan,
        currentBalance: nextBal,
        status: nextBal === 0 ? ("Liquidated" as const) : ("Active" as const),
      };
    });
    setLoans(updatedLoans);

    // Post GL entry
    fmsBridge.postJournalEntry({
      sourceModule: "HR-Payroll",
      ref,
      memo: `Employee Vale / Salary Advance Payroll Recovery Deduction`,
      lines: [
        {
          accountCode: "2020",
          accountName: "2020 - Net Salaries Payable (Offset against advances)",
          debit: totalLoans,
          credit: 0,
          memo: "Salary Offset against outstanding loans",
        },
        {
          accountCode: "1220",
          accountName: "1220 - Advances to Officers & Employees (Receivables)",
          debit: 0,
          credit: totalLoans,
          memo: "Credit Receivables balance reduction",
        },
      ],
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setActionSuccessMessage(
        `Loan Deductions of ₱${totalLoans.toLocaleString()} applied to GL Account 1220 (Advances to Employees)! Receivables balance updated in FMS.`
      );
      setFmsStatus(fmsBridge.getCurrentFmsMetrics());
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1D21] p-6 font-sans">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="bg-indigo-600 text-white p-3 rounded-xl shadow-md">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  Subsystem 01 / Operational Module
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  FMS Live Connected
                </span>
              </div>
              <h1 className="text-2xl font-black font-['Archivo'] tracking-tight text-slate-900 mt-1">
                HR &amp; Payroll Management Dashboard
              </h1>
              <p className="text-xs text-slate-500 font-['IBM_Plex_Mono']">
                Automated Statutory Deductions, Service Charge Pool &amp; Direct FMS Ledger Transmission
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onNavigateToFms && (
              <button
                onClick={() => onNavigateToFms("disbursement")}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold font-['IBM_Plex_Mono'] rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <span>Open in FMS Core</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Two-Tier Governance Pipeline Banner */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-['IBM_Plex_Mono']">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-indigo-600 shrink-0" />
            <span className="font-bold text-slate-800">FMS Interoperability Governance:</span>
            <span className="text-slate-500 font-['IBM_Plex_Sans'] text-xs">
              Subsystem Request &rarr; Admin Review (Stage 1) &rarr; Super Admin Authorization (Stage 2) &rarr; FMS Master Commit
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] bg-amber-50 text-amber-900 border border-amber-300 px-2 py-0.5 rounded font-bold">
              Stage 1: Admin Review
            </span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-[10px] bg-indigo-50 text-indigo-900 border border-indigo-300 px-2 py-0.5 rounded font-bold">
              Stage 2: Super Admin
            </span>
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
              <span>Gross Payroll Batch</span>
              <DollarSign className="h-4 w-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-black font-['IBM_Plex_Mono'] text-slate-900 mt-2">
              ₱{totalGross.toLocaleString()}
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-['IBM_Plex_Mono']">
              <span>Staff Headcount: {staff.length}</span>
              <span className="text-emerald-600 font-bold">Semi-Monthly</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
              <span>Statutory Liabilities</span>
              <Building className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black font-['IBM_Plex_Mono'] text-slate-900 mt-2">
              ₱{totalStatutory.toLocaleString()}
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-['IBM_Plex_Mono']">
              <span>SSS, PhilHealth, Pag-IBIG, WHT</span>
              <span className="text-amber-700 font-bold">BIR / Gov</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
              <span>Service Charge Pool (85%)</span>
              <Percent className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black font-['IBM_Plex_Mono'] text-emerald-700 mt-2">
              ₱{serviceChargePool.toLocaleString()}
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-['IBM_Plex_Mono']">
              <span>₱{perStaffShare.toLocaleString()} / staff</span>
              <span className="text-emerald-700 font-bold">RA 11360</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
              <span>Receivable Advances</span>
              <TrendingDown className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black font-['IBM_Plex_Mono'] text-slate-900 mt-2">
              ₱{totalActiveLoansBalance.toLocaleString()}
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-['IBM_Plex_Mono']">
              <span>GL Account 1220</span>
              <span className="text-blue-700 font-bold">3 Active Vales</span>
            </div>
          </div>
        </div>

        {/* Action Tabs Header */}
        <div className="flex border-b border-slate-200 gap-2">
          <button
            onClick={() => setActiveTab("payroll")}
            className={`px-4 py-2.5 text-xs font-bold font-['IBM_Plex_Mono'] rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "payroll"
                ? "bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Send className="h-3.5 w-3.5" />
            <span>1. Payroll Disbursement Requests</span>
          </button>

          <button
            onClick={() => setActiveTab("service_charge")}
            className={`px-4 py-2.5 text-xs font-bold font-['IBM_Plex_Mono'] rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "service_charge"
                ? "bg-white text-emerald-700 border-t-2 border-emerald-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Percent className="h-3.5 w-3.5" />
            <span>2. Service Charge (85%) Distribution</span>
          </button>

          <button
            onClick={() => setActiveTab("loans")}
            className={`px-4 py-2.5 text-xs font-bold font-['IBM_Plex_Mono'] rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "loans"
                ? "bg-white text-blue-700 border-t-2 border-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>3. Employee Loan &amp; Advance Deductions</span>
          </button>

          <button
            onClick={() => setActiveTab("disbursements")}
            className={`px-4 py-2.5 text-xs font-bold font-['IBM_Plex_Mono'] rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "disbursements"
                ? "bg-white text-emerald-700 border-t-2 border-emerald-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>4. Invoiced Disbursements &amp; Receipts</span>
          </button>
        </div>

        {/* TAB 1: PAYROLL DISBURSEMENT REQUESTS */}
        {activeTab === "payroll" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-200 gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 font-['Archivo']">
                    Semi-Monthly Payout Batch Summary &amp; Statutory Breakdown
                  </h2>
                  <p className="text-xs text-slate-500 font-['IBM_Plex_Mono'] mt-0.5">
                    Calculates statutory withholdings (SSS, PhilHealth, Pag-IBIG, BIR TRAIN Law) and queues executive payout to FMS.
                  </p>
                </div>
                <button
                  onClick={handlePushPayrollDisbursement}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold font-['IBM_Plex_Mono'] rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>Push Batch to FMS Disbursements / AP</span>
                </button>
              </div>

              {/* Roster Table */}
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-xs font-['IBM_Plex_Mono']">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                      <th className="py-2.5 px-3">Employee</th>
                      <th className="py-2.5 px-3">Department</th>
                      <th className="py-2.5 px-3 text-right">Gross Pay</th>
                      <th className="py-2.5 px-3 text-right">SSS (4.5%)</th>
                      <th className="py-2.5 px-3 text-right">PhilHealth (2.5%)</th>
                      <th className="py-2.5 px-3 text-right">Pag-IBIG</th>
                      <th className="py-2.5 px-3 text-right">Withholding Tax</th>
                      <th className="py-2.5 px-3 text-right">Loan Deduct</th>
                      <th className="py-2.5 px-3 text-right font-bold text-indigo-700">Net Take-Home</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {staff.map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-slate-900 block">{emp.name}</span>
                          <span className="text-[10px] text-slate-400">{emp.id} • {emp.position}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{emp.department}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">₱{emp.grossPay.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right text-red-600">-₱{emp.sssDeduction.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right text-red-600">-₱{emp.philHealthDeduction.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right text-red-600">-₱{emp.pagIbigDeduction.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right text-red-600">-₱{emp.withholdingTax.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right text-amber-700">
                          {emp.loanDeduction > 0 ? `-₱${emp.loanDeduction.toLocaleString()}` : "—"}
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-indigo-700 bg-indigo-50/40">
                          ₱{emp.netPay.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                      <td colSpan={2} className="py-3 px-3 uppercase">Total Payroll Batch</td>
                      <td className="py-3 px-3 text-right text-slate-900">₱{totalGross.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right text-red-700">-₱{totalSSS.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right text-red-700">-₱{totalPhilHealth.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right text-red-700">-₱{totalPagIbig.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right text-red-700">-₱{totalWht.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right text-amber-800">-₱{totalLoans.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right text-indigo-700 text-sm font-black">
                        ₱{totalNetPayout.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* FMS Accounting Impact Breakdown */}
              <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-600 font-['IBM_Plex_Mono']">
                  <ShieldCheck className="h-4 w-4 text-indigo-600" />
                  <span>General Ledger Posting Specification (FMS Real-Time Multi-Leg Entry)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 text-xs font-['IBM_Plex_Mono'] text-slate-600">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="font-bold text-emerald-700 block">DEBIT (Expense):</span>
                    <span>Account 5110 - Executive, Front Desk &amp; Kitchen Salaries: ₱{totalGross.toLocaleString()}</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="font-bold text-red-700 block">CREDIT (Liabilities &amp; Net Payable):</span>
                    <span>Acc. 2030 (SSS/PHIC/HDMF ₱{(totalSSS + totalPhilHealth + totalPagIbig).toLocaleString()}) + Acc. 2140 (WHT ₱{totalWht.toLocaleString()}) + Acc. 1220 (Vales ₱{totalLoans.toLocaleString()}) + Acc. 2020 (Net Payable ₱{totalNetPayout.toLocaleString()})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SERVICE CHARGE (85%) DISTRIBUTION */}
        {activeTab === "service_charge" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-200 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 font-['Archivo']">
                    Statutory Service Charge Distribution Pool
                  </h2>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded">
                    Philippine Republic Act 11360 Compliant
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-['IBM_Plex_Mono'] mt-0.5">
                  Calculates 85% F&amp;B service charge pool collected from POS revenue and queues it as a payroll liability distribution to all eligible staff.
                </p>
              </div>
              <button
                onClick={handleQueueServiceCharge}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-['IBM_Plex_Mono'] rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <Calculator className="h-4 w-4" />
                <span>Queue Distribution to Staff Liability</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="text-xs font-bold font-['IBM_Plex_Mono'] text-slate-600 uppercase block">
                  POS Gross Service Charge Collection (₱)
                </label>
                <input
                  type="number"
                  value={posGrossServiceCharge}
                  onChange={(e) => setPosGrossServiceCharge(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold font-['IBM_Plex_Mono'] text-slate-900 focus:outline-indigo-500"
                />
                <span className="text-[10px] text-slate-400 font-['IBM_Plex_Mono'] block">
                  Total collected from Restaurant &amp; Room Service POS
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="text-xs font-bold font-['IBM_Plex_Mono'] text-slate-600 uppercase block">
                  Statutory Distribution Rate (%)
                </label>
                <input
                  type="number"
                  value={serviceChargeRate}
                  onChange={(e) => setServiceChargeRate(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold font-['IBM_Plex_Mono'] text-slate-900 focus:outline-indigo-500"
                />
                <span className="text-[10px] text-slate-400 font-['IBM_Plex_Mono'] block">
                  Mandated 85% pool for rank-and-file &amp; supervisors
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="text-xs font-bold font-['IBM_Plex_Mono'] text-slate-600 uppercase block">
                  Eligible Staff Headcount
                </label>
                <input
                  type="number"
                  value={eligibleStaffCount}
                  onChange={(e) => setEligibleStaffCount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold font-['IBM_Plex_Mono'] text-slate-900 focus:outline-indigo-500"
                />
                <span className="text-[10px] text-slate-400 font-['IBM_Plex_Mono'] block">
                  Active staff excluding executive tier
                </span>
              </div>
            </div>

            {/* Distribution Results Box */}
            <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase font-['IBM_Plex_Mono'] block">
                  Calculated Distribution Pool (85% Allocation)
                </span>
                <p className="text-3xl font-black font-['IBM_Plex_Mono'] text-emerald-950 mt-1">
                  ₱{serviceChargePool.toLocaleString()}
                </p>
                <p className="text-xs text-emerald-700 font-['IBM_Plex_Mono'] mt-1">
                  Equal share per eligible employee:{" "}
                  <span className="font-bold text-slate-900">₱{perStaffShare.toLocaleString()}</span> (divided across {eligibleStaffCount} employees)
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-emerald-200 text-xs font-['IBM_Plex_Mono'] space-y-1 text-slate-700">
                <div className="font-bold text-slate-900">FMS Double-Entry Booking:</div>
                <div>Debit: 2150 - Accrued Service Charge Liability (₱{serviceChargePool.toLocaleString()})</div>
                <div>Credit: 2020 - Salaries &amp; Service Charge Payable (₱{serviceChargePool.toLocaleString()})</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EMPLOYEE LOANS & ADVANCE DEDUCTIONS */}
        {activeTab === "loans" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-200 gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-['Archivo']">
                  Employee Salary Advance &amp; Emergency Vale Tracking
                </h2>
                <p className="text-xs text-slate-500 font-['IBM_Plex_Mono'] mt-0.5">
                  Tracks ongoing salary advances, updates payroll liabilities, and credits General Ledger Account 1220 (Employee Receivables).
                </p>
              </div>
              <button
                onClick={handleLiquidateLoans}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold font-['IBM_Plex_Mono'] rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <UserCheck className="h-4 w-4" />
                <span>Apply Deduction &amp; Credit GL Account 1220</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-['IBM_Plex_Mono']">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <th className="py-2.5 px-3">Loan Ref ID</th>
                    <th className="py-2.5 px-3">Employee Name</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Approved Date</th>
                    <th className="py-2.5 px-3 text-right">Original Advance</th>
                    <th className="py-2.5 px-3 text-right">Current Balance</th>
                    <th className="py-2.5 px-3 text-right font-bold text-blue-700">Cycle Deduction</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-slate-800">{loan.id}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{loan.employeeName}</td>
                      <td className="py-2.5 px-3 text-slate-600">{loan.loanType}</td>
                      <td className="py-2.5 px-3 text-slate-500">{loan.approvedDate}</td>
                      <td className="py-2.5 px-3 text-right text-slate-700">₱{loan.originalAmount.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">₱{loan.currentBalance.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-blue-700 bg-blue-50/40">
                        ₱{loan.monthlyDeduction.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            loan.status === "Active"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          {loan.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: INVOICED DISBURSEMENTS & ALLOCATION RECEIPTS (BUDGET CAPPED) */}
        {activeTab === "disbursements" && (
          <SubsystemDisbursementSection
            sourceModule="HR-Payroll"
            departmentName="HRMS Payroll"
            defaultCostCenter="HR Operations & Statutory Staff Compensation"
            defaultCategory="Staff Compensation & Benefits"
            defaultGlDebitAccount="5110 - Executive, Service & Banquet Payroll"
            requesterName="Janine Hular (HR & Payroll Director)"
            onNavigateToFms={onNavigateToFms}
            presets={[
              {
                payee: "BDO Automated Payroll Direct-Credit Facility",
                purpose: "Bi-Monthly Staff Salaries & Wages Disbursement Run (28 Staff)",
                amount: 165000,
                allocationItems: [
                  { item: "Front Desk & Hotel Rooms Basic Compensation", category: "Operations Wages", amount: 65000, percentage: 39 },
                  { item: "Culinary & Kitchen Service Crew Basic Wages", category: "F&B Kitchen Wages", amount: 62000, percentage: 38 },
                  { item: "Logistics, Shuttles & Maintenance Salaries", category: "Fleet Wages", amount: 38000, percentage: 23 }
                ]
              },
              {
                payee: "Statutory SSS, PhilHealth & Pag-IBIG Remittance Portal",
                purpose: "Monthly Employer & Employee Government Statutory Contributions",
                amount: 54000,
                allocationItems: [
                  { item: "Social Security System (SSS) Employer & Employee Pool", category: "Statutory SSS", amount: 28000, percentage: 52 },
                  { item: "Philippine Health Insurance Corp (PhilHealth) Share", category: "Statutory PhilHealth", amount: 16000, percentage: 30 },
                  { item: "Home Development Mutual Fund (Pag-IBIG Fund)", category: "Statutory Pag-IBIG", amount: 10000, percentage: 18 }
                ]
              },
              {
                payee: "Weekend Banquet & Holiday Overtime Compensation Pool",
                purpose: "Holiday Differential & High-Occupancy Overtime Wage Payouts",
                amount: 38000,
                allocationItems: [
                  { item: "Executive Sous Chef & Line Cook Holiday Differential", category: "Culinary Overtime", amount: 20000, percentage: 53 },
                  { item: "Front Desk Night Shift & Weekend Bellman Differential", category: "Front Office Overtime", amount: 18000, percentage: 47 }
                ]
              }
            ]}
          />
        )}

        {/* FMS Real-Time Transmission Bus & Audit Status */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider font-['IBM_Plex_Mono'] text-slate-700">
                FMS Interoperability Outbox &amp; Synchronized Packets
              </h3>
            </div>
            <span className="text-[11px] font-bold font-['IBM_Plex_Mono'] text-slate-500">
              Active GL Records: {fmsStatus?.glEntriesCount || 0} | Pending Approvals: {fmsStatus?.pendingApprovalsCount || 0}
            </span>
          </div>

          <div className="mt-3 space-y-2">
            {transmissionLogs.length === 0 ? (
              <p className="text-xs text-slate-400 font-['IBM_Plex_Mono'] py-3 text-center">
                No outbound packets logged yet. Perform an action above to trigger live FMS communication.
              </p>
            ) : (
              transmissionLogs.slice(0, 5).map((pkt) => (
                <div
                  key={pkt.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-['IBM_Plex_Mono'] gap-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold text-[10px]">
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
