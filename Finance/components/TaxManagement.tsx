import React, { useState, useMemo } from "react";
import {
  FileText,
  Percent,
  Download,
  Building,
  ShieldCheck,
  HelpCircle,
  Calculator,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Plus,
  ArrowRight,
  ExternalLink,
  Printer,
  Sparkles,
  Info,
  Clock,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2
} from "lucide-react";
import PesoSign from "./PesoSign";
import ExportButton from "./ExportButton";

export interface TaxTransaction {
  id: string;
  date: string;
  birForm: "BIR Form 2550Q (VAT)" | "BIR Form 1601-EQ (EWT)" | "BIR Form 1601-C (Compensation)" | "BIR Form 1702-Q (CIT)" | "BIR Form 2307";
  taxType: "Output VAT (Sales)" | "Input VAT (Purchases)" | "EWT 1% (Goods Purveyor)" | "EWT 2% (Logistics / Services)" | "EWT 5% (Real Property Rent)" | "EWT 10% (Professional Fees)" | "Compensation Withholding" | "Corporate Income Tax (CREATE)";
  taxableBase: number;
  ratePercent: number;
  computedTax: number;
  vendorOrCustomer: string;
  tin: string;
  filingPeriod: string;
  status: "Accrued" | "Filed & Remitted" | "Claimable Credit";
  efpsConfirmation?: string;
  remittanceDate?: string;
  atcCode?: string; // BIR Alphanumeric Tax Code (e.g. WI100, WB080)
}

interface TaxManagementProps {
  currentUser?: { role: string; name: string } | null;
  isDataMasked?: boolean;
  maskCurrency?: (val: number) => string;
  maskField?: (val: string, type: string) => string;
}

export const INITIAL_TAX_TRANSACTIONS: TaxTransaction[] = [
  {
    id: "TAX-2026-01",
    date: "2026-08-16",
    birForm: "BIR Form 2550Q (VAT)",
    taxType: "Output VAT (Sales)",
    taxableBase: 1250000.0,
    ratePercent: 12.0,
    computedTax: 150000.0,
    vendorOrCustomer: "HORECA Combined Dining & Room Revenues",
    tin: "009-881-229-000",
    filingPeriod: "Q3 2026 (August)",
    status: "Accrued",
    atcCode: "WB080"
  },
  {
    id: "TAX-2026-02",
    date: "2026-08-18",
    birForm: "BIR Form 2550Q (VAT)",
    taxType: "Input VAT (Purchases)",
    taxableBase: 780000.0,
    ratePercent: 12.0,
    computedTax: 93600.0,
    vendorOrCustomer: "Team 6 Fresh Meat & Seafood Corp & Utilities",
    tin: "204-889-102-000",
    filingPeriod: "Q3 2026 (August)",
    status: "Claimable Credit",
    atcCode: "WB080"
  },
  {
    id: "TAX-2026-03",
    date: "2026-08-20",
    birForm: "BIR Form 1601-EQ (EWT)",
    taxType: "EWT 1% (Goods Purveyor)",
    taxableBase: 350000.0,
    ratePercent: 1.0,
    computedTax: 3500.0,
    vendorOrCustomer: "Puregold Supply Chain Ltd (F&B)",
    tin: "000-449-112-000",
    filingPeriod: "Monthly 0619-E (August)",
    status: "Accrued",
    atcCode: "WI100"
  },
  {
    id: "TAX-2026-04",
    date: "2026-08-22",
    birForm: "BIR Form 1601-EQ (EWT)",
    taxType: "EWT 2% (Logistics / Services)",
    taxableBase: 180000.0,
    ratePercent: 2.0,
    computedTax: 3600.0,
    vendorOrCustomer: "San Miguel Fleet & Logistics Haulers",
    tin: "000-291-550-000",
    filingPeriod: "Monthly 0619-E (August)",
    status: "Accrued",
    atcCode: "WI158"
  },
  {
    id: "TAX-2026-05",
    date: "2026-08-25",
    birForm: "BIR Form 1601-C (Compensation)",
    taxType: "Compensation Withholding",
    taxableBase: 420000.0,
    ratePercent: 15.0,
    computedTax: 63000.0,
    vendorOrCustomer: "Hospitality Staff Payroll (TRAIN Law Tax Table)",
    tin: "009-881-229-000",
    filingPeriod: "Monthly 1601-C (August)",
    status: "Accrued",
    atcCode: "WW010"
  },
  {
    id: "TAX-2026-06",
    date: "2026-08-26",
    birForm: "BIR Form 1702-Q (CIT)",
    taxType: "Corporate Income Tax (CREATE)",
    taxableBase: 850000.0,
    ratePercent: 25.0,
    computedTax: 212500.0,
    vendorOrCustomer: "HORECA Holdings Net Taxable Operating Income",
    tin: "009-881-229-000",
    filingPeriod: "Q3 2026 (August)",
    status: "Accrued",
    atcCode: "MC010"
  }
];

export default function TaxManagement({
  currentUser,
  isDataMasked = false,
  maskCurrency = (val) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(val),
  maskField = (val) => val
}: TaxManagementProps) {
  const [transactions, setTransactions] = useState<TaxTransaction[]>(INITIAL_TAX_TRANSACTIONS);
  const [selectedForm, setSelectedForm] = useState<string>("All");
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isComplianceReportOpen, setIsComplianceReportOpen] = useState(false);
  const [complianceZoom, setComplianceZoom] = useState<number>(85);
  const [isReportMaximized, setIsReportMaximized] = useState<boolean>(false);
  const [selectedCertificate, setSelectedCertificate] = useState<TaxTransaction | null>(null);

  // New Tax Filing Form State
  const [newBirForm, setNewBirForm] = useState<TaxTransaction["birForm"]>("BIR Form 2550Q (VAT)");
  const [newTaxType, setNewTaxType] = useState<TaxTransaction["taxType"]>("Output VAT (Sales)");
  const [newEntity, setNewEntity] = useState("");
  const [newTin, setNewTin] = useState("");
  const [newTaxableBase, setNewTaxableBase] = useState("");
  const [newRatePercent, setNewRatePercent] = useState("12");
  const [newFilingPeriod, setNewFilingPeriod] = useState("Q3 2026 (August)");
  const [newAtcCode, setNewAtcCode] = useState("WB080");

  // Live Philippine Tax Calculator State
  const [calcBase, setCalcBase] = useState("100000");
  const [calcType, setCalcType] = useState<string>("vat_12");
  const [calcWithEwt, setCalcWithEwt] = useState(true);
  const [calcEwtRate, setCalcEwtRate] = useState("1"); // 1% goods, 2% services, 5% rent, 10% prof fees

  // Totals & Philippine Compliance Metrics
  const summary = useMemo(() => {
    let outputVat = 0;
    let inputVat = 0;
    let totalEwt = 0;
    let totalCompensationWithholding = 0;
    let totalCIT = 0;

    transactions.forEach((tx) => {
      if (tx.taxType === "Output VAT (Sales)") outputVat += tx.computedTax;
      if (tx.taxType === "Input VAT (Purchases)") inputVat += tx.computedTax;
      if (tx.taxType.startsWith("EWT")) totalEwt += tx.computedTax;
      if (tx.taxType === "Compensation Withholding") totalCompensationWithholding += tx.computedTax;
      if (tx.taxType === "Corporate Income Tax (CREATE)") totalCIT += tx.computedTax;
    });

    const netVatPayable = Math.max(0, outputVat - inputVat);
    const totalStatutoryPayable = netVatPayable + totalEwt + totalCompensationWithholding + totalCIT;

    return {
      outputVat,
      inputVat,
      netVatPayable,
      totalEwt,
      totalCompensationWithholding,
      totalCIT,
      totalStatutoryPayable
    };
  }, [transactions]);

  // Live Calculator computations
  const calculatedOutput = useMemo(() => {
    const base = Number(calcBase) || 0;
    let vat = 0;
    let ewt = 0;

    if (calcType === "vat_12") {
      vat = base * 0.12;
    }

    if (calcWithEwt) {
      ewt = base * (Number(calcEwtRate) / 100);
    }

    const grossInvoice = base + vat;
    const netPayoutSupplier = grossInvoice - ewt;

    return {
      base,
      vat,
      grossInvoice,
      ewt,
      netPayoutSupplier
    };
  }, [calcBase, calcType, calcWithEwt, calcEwtRate]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (selectedForm === "All") return true;
      return tx.birForm === selectedForm;
    });
  }, [transactions, selectedForm]);

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntity || !newTaxableBase) return;

    const base = Number(newTaxableBase);
    const rate = Number(newRatePercent);
    const computed = base * (rate / 100);

    const isCredit = newTaxType === "Input VAT (Purchases)";

    const newTx: TaxTransaction = {
      id: `TAX-2026-0${transactions.length + 1}`,
      date: new Date().toISOString().split("T")[0],
      birForm: newBirForm,
      taxType: newTaxType,
      taxableBase: base,
      ratePercent: rate,
      computedTax: computed,
      vendorOrCustomer: newEntity,
      tin: newTin || "000-111-222-000",
      filingPeriod: newFilingPeriod,
      status: isCredit ? "Claimable Credit" : "Accrued",
      atcCode: newAtcCode || "WI100"
    };

    setTransactions([newTx, ...transactions]);
    setIsAddModalOpen(false);
    setNewEntity("");
    setNewTin("");
    setNewTaxableBase("");
  };

  const handleRemitTax = (id: string) => {
    const efpsNum = `eFPS-${Math.floor(10000000 + Math.random() * 90000000)}`;
    setTransactions(prev =>
      prev.map(tx =>
        tx.id === id
          ? {
              ...tx,
              status: "Filed & Remitted" as const,
              efpsConfirmation: efpsNum,
              remittanceDate: new Date().toISOString().split("T")[0]
            }
          : tx
      )
    );
  };

  const getExportData = () => {
    return {
      title: "Philippine Bureau of Internal Revenue (BIR) Statutory Tax Filings",
      subtitle: "System Date: 2026-08-27 | NIRC Compliance | HORECA Financial Suite",
      filename: `BIR_Philippine_Tax_Compliance_Report_2026`,
      headers: [
        "Record ID",
        "Date",
        "BIR Form Category",
        "Tax Classification",
        "ATC Code",
        "Vendor / Customer / Entity",
        "TIN",
        "Taxable Base (PHP)",
        "Statutory Rate (%)",
        "Computed Tax (PHP)",
        "Filing Period",
        "Status",
        "eFPS Ref"
      ],
      rows: transactions.map((t) => [
        t.id,
        t.date,
        t.birForm,
        t.taxType,
        t.atcCode || "N/A",
        isDataMasked ? maskField(t.vendorOrCustomer, "name") : t.vendorOrCustomer,
        isDataMasked ? maskField(t.tin, "tin") : t.tin,
        isDataMasked ? maskCurrency(t.taxableBase) : t.taxableBase,
        `${t.ratePercent}%`,
        isDataMasked ? maskCurrency(t.computedTax) : t.computedTax,
        t.filingPeriod,
        t.status,
        isDataMasked && t.efpsConfirmation ? maskField(t.efpsConfirmation, "account") : (t.efpsConfirmation || "Pending eFPS Filing")
      ])
    };
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#DFE1DB] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold font-['IBM_Plex_Mono'] uppercase text-[#5C636F]">
              BUREAU OF INTERNAL REVENUE (BIR) / PHILIPPINE TAX MATRIX
            </span>
            
          </div>
          <h1 className="text-2xl font-bold font-['Archivo'] text-[#1A1D21] mt-1">
            Tax Management
          </h1>
          <p className="text-xs text-[#5C636F]">
            Covers 12% Value Added Tax (VAT 2550Q), Expanded Withholding Tax (EWT/Form 2307 &amp; 1601-EQ), Payroll Withholding (1601-C), and Corporate Income Tax (1702-Q).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsComplianceReportOpen(true)}
            className="bg-[#1A1D21] hover:bg-[#2A2E34] text-white px-3.5 py-2 rounded-lg text-xs font-bold font-['IBM_Plex_Mono'] flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs border border-slate-700"
            title="Generate official BIR and Tax Compliance Summary Report"
          >
            <FileText className="h-4 w-4 text-[#35C98B]" />
            <span>Generate BIR/Tax Compliance Report</span>
          </button>
          <ExportButton getExportData={getExportData} buttonLabel="Export BIR Tax Ledger" />
          <button
            type="button"
            onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
            className="bg-white hover:bg-[#F8F9F6] text-[#1A1D21] border border-[#DFE1DB] px-3.5 py-2 rounded-lg text-xs font-bold font-['IBM_Plex_Mono'] flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Calculator className="h-4 w-4 text-[#B5281A]" />
            <span>{isCalculatorOpen ? "Hide BIR Calculator" : "BIR Tax Calculator"}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#157A4D] hover:bg-[#12633e] text-white px-3.5 py-2 rounded-lg text-xs font-bold font-['IBM_Plex_Mono'] flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Record Tax Return Entry</span>
          </button>
        </div>
      </div>

      {/* BIR Statutory Filing Deadlines & Guidance Banner */}
      <div className="bg-[#1A1D21] text-white p-4 rounded-xl border border-[#2A2E34] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#FF6A3D]" />
            <span className="font-bold text-xs font-['IBM_Plex_Mono'] text-[#FF6A3D] uppercase">
              Philippine BIR Statutory Compliance Calendar (NIRC Regulations)
            </span>
          </div>
          <p className="text-xs text-slate-300 font-['IBM_Plex_Sans']">
            • <strong>10th of Month:</strong> 1601-C (Payroll Withholding) &amp; 0619-E (Monthly EWT) via eFPS.
            • <strong>25th of Month after Quarter:</strong> 2550Q (12% VAT Declaration).
            • <strong>60 Days after Quarter:</strong> 1702-Q (Corporate Income Tax at 25% CREATE Rate).
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded text-xs font-bold font-['IBM_Plex_Mono']">
            BIR eFPS Mode: READY
          </span>
        </div>
      </div>

      {/* BIR Compliance KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net VAT Payable (12%) */}
        <div className="bg-white p-4 rounded-xl border border-[#DFE1DB] space-y-2 shadow-xs">
          <div className="flex justify-between items-center text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
            <span className="font-bold">NET VAT REMITTANCE (12%)</span>
            <PesoSign className="h-4 w-4 text-[#B5281A]" />
          </div>
          <div className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#B5281A]">
            {maskCurrency(summary.netVatPayable)}
          </div>
          <div className="text-[11px] text-[#5C636F] flex justify-between">
            <span>Output: {maskCurrency(summary.outputVat)}</span>
            <span className="text-[#157A4D]">Input Cred: {maskCurrency(summary.inputVat)}</span>
          </div>
        </div>

        {/* Expanded Withholding Tax (EWT) */}
        <div className="bg-white p-4 rounded-xl border border-[#DFE1DB] space-y-2 shadow-xs">
          <div className="flex justify-between items-center text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
            <span className="font-bold">EXPANDED WITHHOLDING (EWT)</span>
            <Percent className="h-4 w-4 text-[#8A5A00]" />
          </div>
          <div className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#8A5A00]">
            {maskCurrency(summary.totalEwt)}
          </div>
          <p className="text-[11px] text-[#5C636F]">BIR Form 0619-E / 1601-EQ (1% Goods, 2% Svcs)</p>
        </div>

        {/* Compensation Withholding (1601-C) */}
        <div className="bg-white p-4 rounded-xl border border-[#DFE1DB] space-y-2 shadow-xs">
          <div className="flex justify-between items-center text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
            <span className="font-bold">PAYROLL TAX (1601-C)</span>
            <FileText className="h-4 w-4 text-[#1A1D21]" />
          </div>
          <div className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#1A1D21]">
            {maskCurrency(summary.totalCompensationWithholding)}
          </div>
          <p className="text-[11px] text-[#5C636F]">Graduated TRAIN Law Bracket Schedule</p>
        </div>

        {/* Corporate Income Tax (CIT) */}
        <div className="bg-white p-4 rounded-xl border border-[#DFE1DB] space-y-2 shadow-xs">
          <div className="flex justify-between items-center text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
            <span className="font-bold">TOTAL STATUTORY DUE</span>
            <ShieldCheck className="h-4 w-4 text-[#157A4D]" />
          </div>
          <div className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#157A4D]">
            {maskCurrency(summary.totalStatutoryPayable)}
          </div>
          <p className="text-[11px] text-[#5C636F]">Accrued for Monthly BIR eFPS Remittance</p>
        </div>
      </div>

      {/* INTERACTIVE PHILIPPINE TAX CALCULATOR (BIR FORM 2307 & 2550 BUILDER) */}
      {isCalculatorOpen && (
        <div className="p-5 bg-[#1A1D21] text-white rounded-xl border border-[#2A2E34] space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-[#2A2E34] pb-3">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-[#FF6A3D]" />
              <h3 className="font-bold text-base font-['Archivo']">
                Interactive Philippine VAT (12%) &amp; EWT (Form 2307) Payout Calculator
              </h3>
            </div>
            <span className="text-xs font-['IBM_Plex_Mono'] text-[#35C98B]">
              NIRC Statutory Regulations Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-['IBM_Plex_Sans']">
            <div>
              <label className="block text-[#A8AFB8] mb-1 font-['IBM_Plex_Mono'] font-bold">
                Taxable Net Base Amount (PHP)
              </label>
              <input
                type="number"
                value={calcBase}
                onChange={(e) => setCalcBase(e.target.value)}
                className="w-full bg-[#2A2E34] text-white font-['IBM_Plex_Mono'] p-2 rounded border border-slate-600 focus:outline-none focus:border-[#FF6A3D]"
              />
            </div>

            <div>
              <label className="block text-[#A8AFB8] mb-1 font-['IBM_Plex_Mono'] font-bold">
                VAT Classification
              </label>
              <select
                value={calcType}
                onChange={(e) => setCalcType(e.target.value)}
                className="w-full bg-[#2A2E34] text-white p-2 rounded border border-slate-600 focus:outline-none"
              >
                <option value="vat_12">12% Standard Vatable Supply</option>
                <option value="vat_exempt">0% VAT Exempt (Senior/PWD/Export)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#A8AFB8] mb-1 font-['IBM_Plex_Mono'] font-bold">
                Creditable Withholding (EWT)
              </label>
              <select
                value={calcEwtRate}
                onChange={(e) => setCalcEwtRate(e.target.value)}
                className="w-full bg-[#2A2E34] text-white p-2 rounded border border-slate-600 focus:outline-none"
              >
                <option value="1">1% Purchase of Goods (F&B / Purveyors - WI100)</option>
                <option value="2">2% Contracting &amp; Logistics Services (WI158)</option>
                <option value="5">5% Real Property &amp; Commercial Lease (WI130)</option>
                <option value="10">10% Professional Fees - Individual (WI010)</option>
                <option value="15">15% Professional Fees - Corporate/Legal (WI020)</option>
              </select>
            </div>

            <div className="flex items-end">
              <div className="bg-[#2A2E34] p-2.5 rounded-lg w-full text-xs font-['IBM_Plex_Mono'] space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Gross Invoice:</span>
                  <span className="font-bold text-white">{maskCurrency(calculatedOutput.grossInvoice)}</span>
                </div>
                <div className="flex justify-between text-[#FF6A3D]">
                  <span>Less EWT 2307:</span>
                  <span className="font-bold">({maskCurrency(calculatedOutput.ewt)})</span>
                </div>
                <div className="flex justify-between text-[#35C98B] border-t border-slate-600 pt-1 font-bold">
                  <span>Net Check / Bank Wire:</span>
                  <span>{maskCurrency(calculatedOutput.netPayoutSupplier)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BIR Forms Filter */}
      <div className="bg-white p-4 rounded-xl border border-[#DFE1DB] flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
          <span>Filter by BIR Return Form:</span>
          <select
            value={selectedForm}
            onChange={(e) => setSelectedForm(e.target.value)}
            className="border border-[#DFE1DB] rounded-lg p-1.5 text-xs font-['IBM_Plex_Sans'] focus:outline-none font-medium"
          >
            <option value="All">All BIR Tax Returns</option>
            <option value="BIR Form 2550Q (VAT)">BIR Form 2550Q (Quarterly VAT Declaration)</option>
            <option value="BIR Form 1601-EQ (EWT)">BIR Form 1601-EQ (Expanded Withholding Tax)</option>
            <option value="BIR Form 1601-C (Compensation)">BIR Form 1601-C (Payroll Withholding)</option>
            <option value="BIR Form 1702-Q (CIT)">BIR Form 1702-Q (Corporate Income Tax)</option>
          </select>
        </div>
        <span className="text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
          Showing {filteredTransactions.length} Philippine statutory tax entries
        </span>
      </div>

      {/* Tax Table */}
      <div className="bg-white border border-[#DFE1DB] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-['IBM_Plex_Sans']">
            <thead className="bg-[#F1F1ED] text-xs font-['IBM_Plex_Mono'] text-[#5C636F] uppercase">
              <tr>
                <th className="p-3">Record ID</th>
                <th className="p-3">BIR Form &amp; Tax Type</th>
                <th className="p-3">ATC</th>
                <th className="p-3">Entity / Purveyor Name</th>
                <th className="p-3">Filing Period</th>
                <th className="p-3 text-right">Taxable Base</th>
                <th className="p-3 text-right">Rate</th>
                <th className="p-3 text-right">Computed Tax</th>
                <th className="p-3 text-center">Filing Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F1ED] font-['IBM_Plex_Mono']">
              {filteredTransactions.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-bold text-[#1A1D21]">
                    {row.id}
                    {row.efpsConfirmation && (
                      <span className="block text-[10px] text-[#157A4D] font-normal">
                        {row.efpsConfirmation}
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-xs text-[#1A1D21]">{row.taxType}</div>
                    <span className="text-[11px] text-[#5C636F]">{row.birForm}</span>
                  </td>
                  <td className="p-3 text-xs font-bold text-[#5C636F]">
                    {row.atcCode || "WB080"}
                  </td>
                  <td className="p-3 font-['IBM_Plex_Sans'] text-xs">
                    <div className="font-medium text-[#1A1D21]">{maskField(row.vendorOrCustomer, "name")}</div>
                    <div className="text-[11px] font-['IBM_Plex_Mono'] text-[#5C636F]">TIN: {maskField(row.tin, "tin")}</div>
                  </td>
                  <td className="p-3 text-xs text-[#5C636F]">{row.filingPeriod}</td>
                  <td className="p-3 text-right font-medium">{maskCurrency(row.taxableBase)}</td>
                  <td className="p-3 text-right font-bold text-slate-800">{row.ratePercent}%</td>
                  <td
                    className={`p-3 text-right font-bold ${
                      row.status === "Claimable Credit" ? "text-[#157A4D]" : "text-[#B5281A]"
                    }`}
                  >
                    {row.status === "Claimable Credit" ? `(${maskCurrency(row.computedTax)})` : maskCurrency(row.computedTax)}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded ${
                        row.status === "Claimable Credit"
                          ? "bg-green-100 text-green-800"
                          : row.status === "Filed & Remitted"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      {row.taxType.startsWith("EWT") && (
                        <button
                          type="button"
                          onClick={() => setSelectedCertificate(row)}
                          className="bg-slate-100 hover:bg-slate-200 text-[#1A1D21] px-2 py-1 rounded text-xs font-medium font-['IBM_Plex_Mono'] transition-colors cursor-pointer"
                          title="Generate official BIR Form 2307 Creditable Withholding Certificate"
                        >
                          BIR 2307
                        </button>
                      )}
                      {row.status === "Accrued" ? (
                        <button
                          type="button"
                          onClick={() => handleRemitTax(row.id)}
                          className="bg-[#1A1D21] hover:bg-[#2A2E34] text-white px-2 py-1 rounded text-xs font-bold font-['IBM_Plex_Mono'] transition-colors cursor-pointer"
                          title="Transmit and remit via BIR eFPS"
                        >
                          Remit via eFPS
                        </button>
                      ) : row.status === "Filed & Remitted" ? (
                        <span className="text-xs text-[#157A4D] font-bold">Remitted</span>
                      ) : (
                        <span className="text-xs text-[#5C636F]">Accrued</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD NEW TAX FILING MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 space-y-4 max-w-lg w-full border border-[#DFE1DB] shadow-2xl text-xs">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#B5281A]" />
                <h3 className="font-bold text-base font-['Archivo'] text-[#1A1D21]">
                  Record Statutory Tax Return Entry
                </h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[#5C636F] hover:text-[#1A1D21] cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#5C636F] mb-1">BIR Return Form</label>
                  <select
                    value={newBirForm}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setNewBirForm(val);
                      if (val.includes("2550")) {
                        setNewTaxType("Output VAT (Sales)");
                        setNewRatePercent("12");
                        setNewAtcCode("WB080");
                      } else if (val.includes("1601-EQ")) {
                        setNewTaxType("EWT 1% (Goods Purveyor)");
                        setNewRatePercent("1");
                        setNewAtcCode("WI100");
                      } else if (val.includes("1601-C")) {
                        setNewTaxType("Compensation Withholding");
                        setNewRatePercent("15");
                        setNewAtcCode("WW010");
                      } else if (val.includes("1702")) {
                        setNewTaxType("Corporate Income Tax (CREATE)");
                        setNewRatePercent("25");
                        setNewAtcCode("MC010");
                      }
                    }}
                    className="w-full border rounded p-2 font-medium"
                  >
                    <option value="BIR Form 2550Q (VAT)">BIR Form 2550Q (12% VAT)</option>
                    <option value="BIR Form 1601-EQ (EWT)">BIR Form 1601-EQ (EWT 1%-15%)</option>
                    <option value="BIR Form 1601-C (Compensation)">BIR Form 1601-C (Compensation)</option>
                    <option value="BIR Form 1702-Q (CIT)">BIR Form 1702-Q (25% Corporate Income)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#5C636F] mb-1">Tax Classification</label>
                  <select
                    value={newTaxType}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setNewTaxType(val);
                      if (val === "Output VAT (Sales)" || val === "Input VAT (Purchases)") setNewRatePercent("12");
                      if (val === "EWT 1% (Goods Purveyor)") { setNewRatePercent("1"); setNewAtcCode("WI100"); }
                      if (val === "EWT 2% (Logistics / Services)") { setNewRatePercent("2"); setNewAtcCode("WI158"); }
                      if (val === "EWT 5% (Real Property Rent)") { setNewRatePercent("5"); setNewAtcCode("WI130"); }
                      if (val === "EWT 10% (Professional Fees)") { setNewRatePercent("10"); setNewAtcCode("WI010"); }
                      if (val === "Compensation Withholding") { setNewRatePercent("15"); setNewAtcCode("WW010"); }
                      if (val === "Corporate Income Tax (CREATE)") { setNewRatePercent("25"); setNewAtcCode("MC010"); }
                    }}
                    className="w-full border rounded p-2 font-medium"
                  >
                    <option value="Output VAT (Sales)">Output VAT (Sales 12%)</option>
                    <option value="Input VAT (Purchases)">Input VAT (Purchases 12% Credit)</option>
                    <option value="EWT 1% (Goods Purveyor)">EWT 1% (F&B / Goods - WI100)</option>
                    <option value="EWT 2% (Logistics / Services)">EWT 2% (Logistics / Services - WI158)</option>
                    <option value="EWT 5% (Real Property Rent)">EWT 5% (Rent - WI130)</option>
                    <option value="EWT 10% (Professional Fees)">EWT 10% (Professional - WI010)</option>
                    <option value="Compensation Withholding">Compensation Withholding (TRAIN)</option>
                    <option value="Corporate Income Tax (CREATE)">Corporate Income Tax (25%)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#5C636F] mb-1">Entity / Vendor / Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Puregold Supply Chain / Executive F&B Revenue"
                  value={newEntity}
                  onChange={(e) => setNewEntity(e.target.value)}
                  className="w-full border rounded p-2 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#5C636F] mb-1">TIN (Taxpayer Identification No.)</label>
                  <input
                    type="text"
                    placeholder="e.g. 000-112-445-000"
                    value={newTin}
                    onChange={(e) => setNewTin(e.target.value)}
                    className="w-full border rounded p-2 font-['IBM_Plex_Mono']"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#5C636F] mb-1">ATC Code</label>
                  <input
                    type="text"
                    placeholder="e.g. WI100"
                    value={newAtcCode}
                    onChange={(e) => setNewAtcCode(e.target.value)}
                    className="w-full border rounded p-2 font-['IBM_Plex_Mono']"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#5C636F] mb-1">Taxable Base Amount (PHP) *</label>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    value={newTaxableBase}
                    onChange={(e) => setNewTaxableBase(e.target.value)}
                    className="w-full border rounded p-2 font-['IBM_Plex_Mono'] font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#5C636F] mb-1">Statutory Rate (%)</label>
                  <input
                    type="number"
                    value={newRatePercent}
                    onChange={(e) => setNewRatePercent(e.target.value)}
                    className="w-full border rounded p-2 font-['IBM_Plex_Mono'] font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#5C636F] mb-1">Filing Period</label>
                <input
                  type="text"
                  placeholder="e.g. Q3 2026 (August)"
                  value={newFilingPeriod}
                  onChange={(e) => setNewFilingPeriod(e.target.value)}
                  className="w-full border rounded p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t font-['IBM_Plex_Mono']">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 border rounded hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#157A4D] text-white rounded font-bold hover:bg-[#12633e] cursor-pointer"
                >
                  Commit Tax Return Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BIR FORM 2307 CERTIFICATE PREVIEW MODAL */}
      {selectedCertificate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 space-y-4 max-w-2xl w-full border border-[#DFE1DB] shadow-2xl text-xs font-['IBM_Plex_Sans']">
            <div className="border-b border-[#DFE1DB] pb-3 text-center">
              <span className="text-[10px] font-['IBM_Plex_Mono'] text-[#5C636F] uppercase block">
                REPUBLIC OF THE PHILIPPINES — DEPARTMENT OF FINANCE — BUREAU OF INTERNAL REVENUE
              </span>
              <h3 className="font-bold text-lg font-['Archivo'] text-[#1A1D21]">
                BIR Form No. 2307
              </h3>
              <p className="text-xs text-[#5C636F] font-bold">
                Certificate of Creditable Tax Withheld at Source
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-[#F8F9F6] p-3 rounded-lg border border-[#DFE1DB]">
              <div>
                <span className="text-[10px] font-bold text-[#5C636F] block font-['IBM_Plex_Mono'] uppercase">
                  PART I - PAYOR INFORMATION (WITHHOLDING AGENT)
                </span>
                <p className="font-bold text-xs mt-1">HORECA HOSPITALITY &amp; ASSETS CORP</p>
                <p className="font-['IBM_Plex_Mono'] text-[11px] text-[#5C636F]">
                  TIN: {maskField("009-881-229-000", "tin")}
                </p>
                <p className="text-[11px] text-[#5C636F]">RDO 044 - Taguig / Bonifacio Global City</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#5C636F] block font-['IBM_Plex_Mono'] uppercase">
                  PART II - PAYEE INFORMATION (PURVEYOR / CONTRACTOR)
                </span>
                <p className="font-bold text-xs mt-1">
                  {maskField(selectedCertificate.vendorOrCustomer, "name")}
                </p>
                <p className="font-['IBM_Plex_Mono'] text-[11px] text-[#5C636F]">
                  TIN: {maskField(selectedCertificate.tin, "tin")}
                </p>
                <p className="text-[11px] text-[#5C636F]">Registered Trade Purveyor</p>
              </div>
            </div>

            <div className="border border-[#DFE1DB] rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs font-['IBM_Plex_Mono']">
                <thead className="bg-[#F1F1ED] text-[10px] uppercase text-[#5C636F]">
                  <tr>
                    <th className="p-2.5">Nature of Income Payment</th>
                    <th className="p-2.5">ATC</th>
                    <th className="p-2.5 text-right">Taxable Gross Amount</th>
                    <th className="p-2.5 text-right">Tax Rate</th>
                    <th className="p-2.5 text-right">Tax Withheld (PHP)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F1ED]">
                  <tr>
                    <td className="p-2.5 font-['IBM_Plex_Sans'] font-medium">
                      {selectedCertificate.taxType}
                    </td>
                    <td className="p-2.5 font-bold">{selectedCertificate.atcCode || "WI100"}</td>
                    <td className="p-2.5 text-right">{maskCurrency(selectedCertificate.taxableBase)}</td>
                    <td className="p-2.5 text-right font-bold">{selectedCertificate.ratePercent}%</td>
                    <td className="p-2.5 text-right font-bold text-[#B5281A]">
                      {maskCurrency(selectedCertificate.computedTax)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2 text-[11px] text-[#5C636F]">
              <span>Period Covered: {selectedCertificate.filingPeriod}</span>
              <span className="font-bold text-[#157A4D]">BIR eFPS Certified Digital Stamping Active</span>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setSelectedCertificate(null)}
                className="px-4 py-1.5 bg-[#1A1D21] text-white rounded font-bold font-['IBM_Plex_Mono'] hover:bg-[#2A2E34] cursor-pointer"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BIR / TAX COMPLIANCE REPORT MODAL */}
      {isComplianceReportOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto backdrop-blur-xs">
          <div className={`bg-white rounded-2xl border border-[#DFE1DB] shadow-2xl text-xs font-['IBM_Plex_Sans'] my-auto transition-all duration-200 flex flex-col overflow-hidden ${
            isReportMaximized ? "w-[98vw] max-w-[98vw] h-[96vh]" : "max-w-6xl w-full max-h-[94vh]"
          }`}>
            {/* Header / Seal & Zoom Controls */}
            <div className="p-5 sm:p-6 border-b border-[#DFE1DB] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold font-['IBM_Plex_Mono'] uppercase tracking-widest text-[#5C636F] bg-slate-100 px-2 py-0.5 rounded">
                    BUREAU OF INTERNAL REVENUE • REPUBLIC OF THE PHILIPPINES
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold font-['IBM_Plex_Mono'] px-2 py-0.5 rounded border border-emerald-300">
                    eFPS COMPLIANT
                  </span>
                </div>
                <h2 className="text-xl font-bold font-['Archivo'] text-[#1A1D21] mt-1">
                  BIR &amp; Philippine Statutory Tax Compliance Report
                </h2>
                <p className="text-xs text-[#5C636F]">
                  National Internal Revenue Code (NIRC) • Consolidated Quarterly &amp; Monthly Accrual Matrix
                </p>
              </div>

              {/* View & Zoom Controls */}
              <div className="flex flex-wrap items-center gap-2 font-['IBM_Plex_Mono']">
                {/* Zoom Out / In Controls */}
                <div className="flex items-center bg-[#F1F1ED] p-1 rounded-lg border border-[#DFE1DB] text-[11px]">
                  <button
                    type="button"
                    onClick={() => setComplianceZoom((prev) => Math.max(65, prev - 10))}
                    title="Zoom Out"
                    className="p-1.5 hover:bg-white text-[#5C636F] hover:text-[#1A1D21] rounded cursor-pointer transition-colors"
                  >
                    <ZoomOut className="h-3.5 w-3.5" />
                  </button>

                  {/* Preset Zoom Pills */}
                  {[75, 85, 100].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setComplianceZoom(level)}
                      className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-all ${
                        complianceZoom === level
                          ? "bg-white text-[#1A1D21] shadow-xs"
                          : "text-[#5C636F] hover:text-[#1A1D21]"
                      }`}
                    >
                      {level}%
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setComplianceZoom((prev) => Math.min(125, prev + 10))}
                    title="Zoom In"
                    className="p-1.5 hover:bg-white text-[#5C636F] hover:text-[#1A1D21] rounded cursor-pointer transition-colors"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Maximize / Restore Toggle */}
                <button
                  type="button"
                  onClick={() => setIsReportMaximized((prev) => !prev)}
                  title={isReportMaximized ? "Restore Default Width" : "Expand to Fullscreen Width"}
                  className="p-2 border border-[#DFE1DB] bg-white hover:bg-slate-50 text-[#5C636F] hover:text-[#1A1D21] rounded-lg cursor-pointer transition-colors"
                >
                  {isReportMaximized ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => setIsComplianceReportOpen(false)}
                  className="p-2 text-[#5C636F] hover:text-[#1A1D21] hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Document Body with Scalable Zoom */}
            <div
              className="p-6 sm:p-8 space-y-6 overflow-y-auto grow custom-scrollbar bg-[#FFFFFF]"
              style={{ zoom: `${complianceZoom}%` }}
            >
              {/* Corporate Taxpayer Registration Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#F8F9F6] p-4 rounded-xl border border-[#DFE1DB]">
                <div>
                  <span className="text-[10px] font-bold text-[#5C636F] block font-['IBM_Plex_Mono'] uppercase">
                    Registered Corporate Taxpayer
                  </span>
                  <p className="font-bold text-xs text-[#1A1D21] mt-0.5">HORECA HOSPITALITY &amp; ASSETS CORP</p>
                  <p className="text-[11px] text-[#5C636F]">Large Taxpayers Service / Hospitality Sector</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#5C636F] block font-['IBM_Plex_Mono'] uppercase">
                    Taxpayer Identification &amp; RDO
                  </span>
                  <p className="font-bold font-['IBM_Plex_Mono'] text-xs text-[#1A1D21] mt-0.5">
                    TIN: {maskField("009-881-229-000", "tin")}
                  </p>
                  <p className="text-[11px] text-[#5C636F]">Revenue District Office: RDO 044 (BGC)</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#5C636F] block font-['IBM_Plex_Mono'] uppercase">
                    Compliance Assessment Period
                  </span>
                  <p className="font-bold font-['IBM_Plex_Mono'] text-xs text-[#157A4D] mt-0.5">
                    FY 2026 • Quarter 3 Cycle
                  </p>
                  <p className="text-[11px] text-[#5C636F]">Report Date: 2026-08-27</p>
                </div>
              </div>

              {/* Executive Tax Remittance Summary Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-white border border-[#DFE1DB] rounded-xl space-y-1 shadow-xs">
                  <span className="text-[10px] font-bold font-['IBM_Plex_Mono'] text-[#5C636F] uppercase block">
                    Net VAT (12%)
                  </span>
                  <div className="text-base font-bold font-['IBM_Plex_Mono'] text-[#B5281A]">
                    {maskCurrency(summary.netVatPayable)}
                  </div>
                  <div className="text-[10px] text-[#5C636F]">
                    Output: {maskCurrency(summary.outputVat)} • Input: {maskCurrency(summary.inputVat)}
                  </div>
                </div>

                <div className="p-3.5 bg-white border border-[#DFE1DB] rounded-xl space-y-1 shadow-xs">
                  <span className="text-[10px] font-bold font-['IBM_Plex_Mono'] text-[#5C636F] uppercase block">
                    Expanded EWT
                  </span>
                  <div className="text-base font-bold font-['IBM_Plex_Mono'] text-[#8A5A00]">
                    {maskCurrency(summary.totalEwt)}
                  </div>
                  <div className="text-[10px] text-[#5C636F]">Form 1601-EQ / Form 2307</div>
                </div>

                <div className="p-3.5 bg-white border border-[#DFE1DB] rounded-xl space-y-1 shadow-xs">
                  <span className="text-[10px] font-bold font-['IBM_Plex_Mono'] text-[#5C636F] uppercase block">
                    Payroll Tax (1601-C)
                  </span>
                  <div className="text-base font-bold font-['IBM_Plex_Mono'] text-[#1A1D21]">
                    {maskCurrency(summary.totalCompensationWithholding)}
                  </div>
                  <div className="text-[10px] text-[#5C636F]">TRAIN Law Graduated Table</div>
                </div>

                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 shadow-xs">
                  <span className="text-[10px] font-bold font-['IBM_Plex_Mono'] text-emerald-800 uppercase block">
                    Total Statutory Due
                  </span>
                  <div className="text-base font-bold font-['IBM_Plex_Mono'] text-emerald-700">
                    {maskCurrency(summary.totalStatutoryPayable)}
                  </div>
                  <div className="text-[10px] text-emerald-800 font-semibold">Ready for eFPS Payment</div>
                </div>
              </div>

              {/* Statutory Return Forms Schedule */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-xs font-['Archivo'] text-[#1A1D21] uppercase tracking-wide">
                    BIR Statutory Forms Filing Schedule &amp; eFPS Transmission Status
                  </h4>
                  <span className="text-[11px] font-['IBM_Plex_Mono'] text-[#5C636F]">
                    4 Active Tax Schedules
                  </span>
                </div>
                <div className="border border-[#DFE1DB] rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs font-['IBM_Plex_Mono']">
                    <thead className="bg-[#F1F1ED] text-[10px] uppercase text-[#5C636F]">
                      <tr>
                        <th className="p-2.5">BIR Return Form</th>
                        <th className="p-2.5">Tax Type Description</th>
                        <th className="p-2.5">Statutory Due Date</th>
                        <th className="p-2.5 text-right">Computed Due (PHP)</th>
                        <th className="p-2.5 text-center">Filing Status</th>
                        <th className="p-2.5 text-center">eFPS Confirmation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F1ED] text-xs">
                      <tr>
                        <td className="p-2.5 font-bold text-[#1A1D21]">BIR Form 2550Q</td>
                        <td className="p-2.5 font-['IBM_Plex_Sans']">Quarterly Value-Added Tax (12% VAT)</td>
                        <td className="p-2.5 text-[#5C636F]">25th of month following quarter</td>
                        <td className="p-2.5 text-right font-bold text-[#B5281A]">{maskCurrency(summary.netVatPayable)}</td>
                        <td className="p-2.5 text-center">
                          <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold">
                            Accrued
                          </span>
                        </td>
                        <td className="p-2.5 text-center text-[#5C636F]">Pending Batch Transmit</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-[#1A1D21]">BIR Form 1601-EQ / 0619-E</td>
                        <td className="p-2.5 font-['IBM_Plex_Sans']">Expanded Withholding Tax (Creditable)</td>
                        <td className="p-2.5 text-[#5C636F]">10th / Last day of month after Q</td>
                        <td className="p-2.5 text-right font-bold text-[#8A5A00]">{maskCurrency(summary.totalEwt)}</td>
                        <td className="p-2.5 text-center">
                          <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold">
                            Accrued
                          </span>
                        </td>
                        <td className="p-2.5 text-center text-[#5C636F]">Certificates Issued (2307)</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-[#1A1D21]">BIR Form 1601-C</td>
                        <td className="p-2.5 font-['IBM_Plex_Sans']">Monthly Compensation Withholding (Payroll)</td>
                        <td className="p-2.5 text-[#5C636F]">10th of following month</td>
                        <td className="p-2.5 text-right font-bold text-[#1A1D21]">{maskCurrency(summary.totalCompensationWithholding)}</td>
                        <td className="p-2.5 text-center">
                          <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold">
                            Accrued
                          </span>
                        </td>
                        <td className="p-2.5 text-center text-[#5C636F]">Payroll Linked</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-[#1A1D21]">BIR Form 1702-Q</td>
                        <td className="p-2.5 font-['IBM_Plex_Sans']">Quarterly Corporate Income Tax (25% CREATE)</td>
                        <td className="p-2.5 text-[#5C636F]">60 days following quarter</td>
                        <td className="p-2.5 text-right font-bold text-[#157A4D]">{maskCurrency(summary.totalCIT)}</td>
                        <td className="p-2.5 text-center">
                          <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-[10px] font-bold">
                            {summary.totalCIT > 0 ? "Accrued" : "Estimated"}
                          </span>
                        </td>
                        <td className="p-2.5 text-center text-[#5C636F]">Tax Model Verified</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Detailed Philippine Tax Entries Ledger */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-xs font-['Archivo'] text-[#1A1D21] uppercase tracking-wide">
                    Itemized Statutory Transactions &amp; Withholding Details
                  </h4>
                  <span className="text-[11px] font-['IBM_Plex_Mono'] text-[#5C636F]">
                    Showing {transactions.length} verified tax records
                  </span>
                </div>
                <div className="border border-[#DFE1DB] rounded-xl overflow-hidden max-h-80 overflow-y-auto shadow-xs">
                  <table className="w-full text-left text-xs font-['IBM_Plex_Mono']">
                    <thead className="bg-[#F1F1ED] text-[10px] uppercase text-[#5C636F] sticky top-0">
                      <tr>
                        <th className="p-2.5">Record ID</th>
                        <th className="p-2.5">Tax Type &amp; ATC</th>
                        <th className="p-2.5">Purveyor / Entity Name</th>
                        <th className="p-2.5">TIN</th>
                        <th className="p-2.5 text-right">Taxable Base</th>
                        <th className="p-2.5 text-right">Rate</th>
                        <th className="p-2.5 text-right">Tax Due</th>
                        <th className="p-2.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F1ED]">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-[#1A1D21]">{tx.id}</td>
                          <td className="p-2.5">
                            <span className="font-bold">{tx.taxType}</span>
                            <span className="text-[10px] text-[#5C636F] block">ATC: {tx.atcCode || "WI100"}</span>
                          </td>
                          <td className="p-2.5 font-['IBM_Plex_Sans']">{maskField(tx.vendorOrCustomer, "name")}</td>
                          <td className="p-2.5 text-[#5C636F]">{maskField(tx.tin, "tin")}</td>
                          <td className="p-2.5 text-right">{maskCurrency(tx.taxableBase)}</td>
                          <td className="p-2.5 text-right font-bold">{tx.ratePercent}%</td>
                          <td className="p-2.5 text-right font-bold text-[#B5281A]">{maskCurrency(tx.computedTax)}</td>
                          <td className="p-2.5 text-center">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                              tx.status === "Claimable Credit" ? "bg-green-100 text-green-800" :
                              tx.status === "Filed & Remitted" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Compliance Certification Statement */}
              <div className="bg-[#F8F9F6] border border-[#DFE1DB] rounded-xl p-4 space-y-2 text-[11px] text-[#5C636F]">
                <div className="flex items-center gap-2 font-bold text-[#1A1D21]">
                  <ShieldCheck className="h-4 w-4 text-[#157A4D]" />
                  <span>Statutory Compliance &amp; Truthfulness Declaration</span>
                </div>
                <p>
                  I declare, under the penalties of perjury, that this Philippine Bureau of Internal Revenue (BIR) statutory compliance report has been made in good faith, verified by the Finance Department, and is to the best of our knowledge and belief, true and correct pursuant to the provisions of the National Internal Revenue Code (NIRC), as amended, and the regulations issued under authority thereof.
                </p>
                <div className="flex justify-between items-center pt-2 border-t border-[#DFE1DB] text-[10px] font-['IBM_Plex_Mono']">
                  <span>Certified By: <strong>Finance Controller / Certified Tax Accountant</strong></span>
                  <span className="text-[#157A4D] font-bold">DIGITALLY ACCREDITED • eFPS AUTHORIZED</span>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 sm:p-5 border-t border-[#DFE1DB] flex flex-wrap justify-between items-center gap-2 bg-[#F8F9F6] font-['IBM_Plex_Mono'] shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 border border-[#DFE1DB] bg-white hover:bg-slate-50 text-[#1A1D21] rounded-lg font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Printer className="h-3.5 w-3.5 text-[#5C636F]" />
                  <span>Print Report</span>
                </button>
                <ExportButton getExportData={getExportData} buttonLabel="Download CSV / Excel" />
                <span className="text-[10px] text-[#5C636F] hidden md:inline ml-2">
                  Display Scale: {complianceZoom}%
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsComplianceReportOpen(false)}
                className="px-5 py-2 bg-[#1A1D21] text-white hover:bg-[#2A2E34] rounded-lg font-bold transition-colors cursor-pointer shadow-xs"
              >
                Close Compliance Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
