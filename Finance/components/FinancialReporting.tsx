import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Layers,
  Sliders,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Database,
  FileSpreadsheet,
  Download,
  DollarSign,
  Activity,
  CheckCircle2,
  RefreshCw,
  GitBranch,
  Search,
  Eye,
  PieChart,
  BarChart2,
  FileText,
  Building,
  ShieldCheck,
  Percent,
  Calendar,
  CreditCard,
  Landmark
} from "lucide-react";
import PesoSign from "./PesoSign";
import ExportButton from "./ExportButton";

export interface DepartmentBudgetActual {
  department: string;
  category: "Revenue" | "Opex" | "Capex";
  approvedBudget: number;
  actualExpense: number;
  priorYear: number;
  leadAnalyst: string;
  driver: string;
  varianceNote: string;
}

interface FinancialReportingProps {
  currentUser?: { role: string; name: string } | null;
  isDataMasked?: boolean;
  maskCurrency?: (val: number) => string;
  maskField?: (val: string, type: string) => string;
}

export const INITIAL_FPNA_DATA: DepartmentBudgetActual[] = [
  {
    department: "Food & Beverage (F&B / Kitchens)",
    category: "Revenue",
    approvedBudget: 1200000,
    actualExpense: 1345000,
    priorYear: 1050000,
    leadAnalyst: "Lorenz (FP&A Lead)",
    driver: "Cover Count & Average Spend / Table",
    varianceNote: "Higher banquet catering demand (+12.1% favorable variance)"
  },
  {
    department: "Rooms & Hotel Lodging (Team 9)",
    category: "Revenue",
    approvedBudget: 2100000,
    actualExpense: 2280000,
    priorYear: 1850000,
    leadAnalyst: "Renz (Financial Analyst)",
    driver: "RevPAR (Occupancy 88% x ADR ₱6,200)",
    varianceNote: "Corporate conference guest room block over-performance"
  },
  {
    department: "Fleet Operations & Logistics",
    category: "Opex",
    approvedBudget: 320000,
    actualExpense: 348500,
    priorYear: 295000,
    leadAnalyst: "Lorenz (FP&A Lead)",
    driver: "Diesel Cost / Liter & Trip Volume",
    varianceNote: "Fuel cost inflation offset by Skyway route optimizations"
  },
  {
    department: "Facilities & Energy Utilities",
    category: "Opex",
    approvedBudget: 450000,
    actualExpense: 422000,
    priorYear: 440000,
    leadAnalyst: "Renz (Financial Analyst)",
    driver: "Chiller kWh & Off-Peak Power Tariffs",
    varianceNote: "HVAC smart scheduling reduced energy consumption by 6.2%"
  },
  {
    department: "Sales, Marketing & Brand Growth",
    category: "Opex",
    approvedBudget: 180000,
    actualExpense: 172000,
    priorYear: 160000,
    leadAnalyst: "Lorenz (FP&A Lead)",
    driver: "Digital Ads CAC & OTAs Commission",
    varianceNote: "Direct booking website promo decreased OTA distribution fees"
  },
  {
    department: "General Admin & Corporate HR",
    category: "Opex",
    approvedBudget: 290000,
    actualExpense: 288000,
    priorYear: 275000,
    leadAnalyst: "Renz (Financial Analyst)",
    driver: "Payroll & Benefits Headcount",
    varianceNote: "Headcount on target with standard TRAIN withholding"
  }
];

export default function FinancialReporting({
  currentUser,
  isDataMasked = false,
  maskCurrency = (val) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(val),
  maskField = (val) => val
}: FinancialReportingProps) {
  const [activeTab, setActiveTab] = useState<"statements" | "variance" | "scenarios" | "lineage">("statements");
  const [fpaData, setFpaData] = useState<DepartmentBudgetActual[]>(INITIAL_FPNA_DATA);
  const [selectedScenario, setSelectedScenario] = useState<"base" | "optimistic" | "recession" | "custom">("base");

  // Driver Sliders for Custom Scenario Planning
  const [adrDriver, setAdrDriver] = useState(6200); // Average daily room rate (PHP)
  const [occDriver, setOccDriver] = useState(85); // Occupancy %
  const [fuelDriver, setFuelDriver] = useState(58.5); // Diesel price / L (PHP)
  const [fbGrowthDriver, setFbGrowthDriver] = useState(10); // F&B Growth %

  const formatPHP = (val: number) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP"
    }).format(val);

  // Scenario Multipliers
  const scenarioStats = useMemo(() => {
    let revMult = 1.0;
    let costMult = 1.0;

    if (selectedScenario === "optimistic") {
      revMult = 1.18;
      costMult = 1.05;
    } else if (selectedScenario === "recession") {
      revMult = 0.82;
      costMult = 1.10;
    } else if (selectedScenario === "custom") {
      revMult = (occDriver / 80) * (adrDriver / 6000) * (1 + fbGrowthDriver / 100);
      costMult = fuelDriver / 55.0;
    }

    const projectedRevenue = 3625000 * revMult;
    const projectedOpex = 1230500 * costMult;
    const projectedEBITDA = projectedRevenue - projectedOpex;
    const projectedMargin = (projectedEBITDA / projectedRevenue) * 100;

    return {
      projectedRevenue,
      projectedOpex,
      projectedEBITDA,
      projectedMargin: Math.round(projectedMargin * 10) / 10
    };
  }, [selectedScenario, adrDriver, occDriver, fuelDriver, fbGrowthDriver]);

  // Executive Financial Statement Metrics
  const statementsData = useMemo(() => {
    const grossRevenue = 3625000;
    const directCost = 1380000;
    const grossProfit = grossRevenue - directCost;
    const opex = 985000;
    const ebitda = grossProfit - opex;
    const depreciation = 145000;
    const interest = 35000;
    const ebt = ebitda - depreciation - interest;
    const corporateIncomeTax = ebt * 0.25; // CREATE Act 25%
    const netIncome = ebt - corporateIncomeTax;

    return {
      grossRevenue,
      directCost,
      grossProfit,
      opex,
      ebitda,
      depreciation,
      interest,
      ebt,
      corporateIncomeTax,
      netIncome,
      // Balance sheet assets
      cashEquivalents: 4280000,
      accountsReceivable: 760000,
      inventoryValuation: 580000,
      totalCurrentAssets: 5620000,
      propertyPlantEquipment: 24500000,
      totalAssets: 30120000,
      // Liabilities & Equity
      accountsPayable: 1150000,
      accruedTaxLiabilities: 380000,
      totalCurrentLiabilities: 1530000,
      longTermDebt: 6500000,
      totalLiabilities: 8030000,
      shareholderEquity: 22090000,
      totalLiabAndEquity: 30120000
    };
  }, []);

  const getExportData = () => {
    if (activeTab === "statements") {
      return {
        title: "HORECA Consolidated Financial Statements (P&L, Balance Sheet, Cash Flow)",
        subtitle: `System Date: 2026-08-27 | Datarails FP&A Engine`,
        filename: `Executive_Financial_Statements_2026`,
        headers: ["Financial Line Item", "Category", "Amount (PHP)", "Margin / % of Revenue"],
        rows: [
          ["Gross Operating Revenue", "P&L Statement", statementsData.grossRevenue, "100.0%"],
          ["Direct Cost of Goods & Purveyors", "P&L Statement", statementsData.directCost, "38.1%"],
          ["Gross Profit", "P&L Statement", statementsData.grossProfit, "61.9%"],
          ["Operating Expenses (Opex)", "P&L Statement", statementsData.opex, "27.2%"],
          ["Operating EBITDA", "P&L Statement", statementsData.ebitda, "34.7%"],
          ["Corporate Income Tax (25% CREATE)", "P&L Statement", statementsData.corporateIncomeTax, "6.1%"],
          ["Consolidated Net Profit", "P&L Statement", statementsData.netIncome, "18.4%"],
          ["Total Current Assets", "Balance Sheet", statementsData.totalCurrentAssets, "N/A"],
          ["Property, Plant & Equipment", "Balance Sheet", statementsData.propertyPlantEquipment, "N/A"],
          ["Total Assets", "Balance Sheet", statementsData.totalAssets, "N/A"],
          ["Total Current Liabilities", "Balance Sheet", statementsData.totalCurrentLiabilities, "N/A"],
          ["Shareholder Equity", "Balance Sheet", statementsData.shareholderEquity, "N/A"]
        ]
      };
    }

    return {
      title: "Datarails FP&A Financial Planning & Consolidation Variance Model",
      subtitle: `Scenario: ${selectedScenario.toUpperCase()} | System Date: 2026-08-27 | HORECA Data Lake`,
      filename: `Datarails_FPA_Consolidated_Financial_Model_2026`,
      headers: [
        "Department / Cost Center",
        "Category",
        "Approved Budget (PHP)",
        "Actual Expense (PHP)",
        "Variance (PHP)",
        "Variance (%)",
        "Prior Year (PHP)",
        "Driver Metric",
        "Variance Commentary"
      ],
      rows: fpaData.map((d) => {
        const varianceVal = d.actualExpense - d.approvedBudget;
        const variancePct = ((varianceVal / d.approvedBudget) * 100).toFixed(1);
        return [
          d.department,
          d.category,
          d.approvedBudget,
          d.actualExpense,
          varianceVal,
          `${variancePct}%`,
          d.priorYear,
          d.driver,
          d.varianceNote
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
              EXECUTIVE CONSOLIDATION / DATARAILS FP&amp;A SUITE
            </span>
            <span className="bg-[#157A4D]/10 text-[#157A4D] px-2 py-0.5 rounded text-[10px] font-['IBM_Plex_Mono'] font-bold border border-[#157A4D]/20">
              DATARAILS AI ENGINE ACTIVE
            </span>
          </div>
          <h1 className="text-2xl font-bold font-['Archivo'] text-[#1A1D21] mt-1">
            Financial Reporting &amp; FP&amp;A Suite
          </h1>
          <p className="text-xs text-[#5C636F]">
            Consolidates general ledger statements, departmental budget-to-actual variance heatmaps, and driver-based scenario models.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton getExportData={getExportData} buttonLabel="Export Reporting Package" />
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex border-b border-[#DFE1DB] space-x-2 text-xs font-['IBM_Plex_Mono'] font-semibold overflow-x-auto pb-px">
        <button
          type="button"
          onClick={() => setActiveTab("statements")}
          className={`px-4 py-2 rounded-t-lg transition-colors flex items-center space-x-1.5 cursor-pointer shrink-0 ${
            activeTab === "statements"
              ? "bg-[#1A1D21] text-white"
              : "bg-white text-[#5C636F] hover:text-[#1A1D21] border border-b-0 border-[#DFE1DB]"
          }`}
        >
          <FileText className="h-4 w-4 text-[#FF6A3D]" />
          <span>Executive Financial Statements</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("variance")}
          className={`px-4 py-2 rounded-t-lg transition-colors flex items-center space-x-1.5 cursor-pointer shrink-0 ${
            activeTab === "variance"
              ? "bg-[#1A1D21] text-white"
              : "bg-white text-[#5C636F] hover:text-[#1A1D21] border border-b-0 border-[#DFE1DB]"
          }`}
        >
          <Layers className="h-4 w-4 text-[#FF6A3D]" />
          <span>Datarails FP&amp;A Variance Heatmap</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("scenarios")}
          className={`px-4 py-2 rounded-t-lg transition-colors flex items-center space-x-1.5 cursor-pointer shrink-0 ${
            activeTab === "scenarios"
              ? "bg-[#1A1D21] text-white"
              : "bg-white text-[#5C636F] hover:text-[#1A1D21] border border-b-0 border-[#DFE1DB]"
          }`}
        >
          <Sliders className="h-4 w-4 text-[#FF6A3D]" />
          <span>Driver-Based Scenario Models</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("lineage")}
          className={`px-4 py-2 rounded-t-lg transition-colors flex items-center space-x-1.5 cursor-pointer shrink-0 ${
            activeTab === "lineage"
              ? "bg-[#1A1D21] text-white"
              : "bg-white text-[#5C636F] hover:text-[#1A1D21] border border-b-0 border-[#DFE1DB]"
          }`}
        >
          <Database className="h-4 w-4 text-[#FF6A3D]" />
          <span>Multi-Subsystem Audit Lineage</span>
        </button>
      </div>

      {/* TAB 1: EXECUTIVE FINANCIAL STATEMENTS */}
      {activeTab === "statements" && (
        <div className="space-y-6">
          {/* Executive Overview KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-[#DFE1DB] space-y-2 shadow-xs">
              <div className="flex justify-between items-center text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
                <span className="font-bold">GROSS REVENUE (MONTHLY)</span>
                <TrendingUp className="h-4 w-4 text-[#157A4D]" />
              </div>
              <div className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#157A4D]">
                {maskCurrency(statementsData.grossRevenue)}
              </div>
              <p className="text-[11px] text-[#157A4D] font-medium">+14.2% vs Prior Year</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#DFE1DB] space-y-2 shadow-xs">
              <div className="flex justify-between items-center text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
                <span className="font-bold">EBITDA MARGIN</span>
                <Percent className="h-4 w-4 text-[#1A1D21]" />
              </div>
              <div className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#1A1D21]">
                {isDataMasked ? "••• %" : "34.7%"}
              </div>
              <div className="text-[11px] text-[#5C636F]">
                EBITDA: {maskCurrency(statementsData.ebitda)}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#DFE1DB] space-y-2 shadow-xs">
              <div className="flex justify-between items-center text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
                <span className="font-bold">NET OPERATING PROFIT</span>
                <PesoSign className="h-4 w-4 text-[#157A4D]" />
              </div>
              <div className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#157A4D]">
                {maskCurrency(statementsData.netIncome)}
              </div>
              <p className="text-[11px] text-[#5C636F]">After 25% Corporate Income Tax (CREATE)</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#DFE1DB] space-y-2 shadow-xs">
              <div className="flex justify-between items-center text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
                <span className="font-bold">TOTAL ASSET BASE</span>
                <Landmark className="h-4 w-4 text-[#1A1D21]" />
              </div>
              <div className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#1A1D21]">
                {maskCurrency(statementsData.totalAssets)}
              </div>
              <p className="text-[11px] text-[#5C636F]">Equity: {maskCurrency(statementsData.shareholderEquity)}</p>
            </div>
          </div>

          {/* Side by Side: Income Statement & Balance Sheet */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Income Statement (P&L) */}
            <div className="bg-white border border-[#DFE1DB] rounded-xl overflow-hidden shadow-xs">
              <div className="p-4 border-b border-[#DFE1DB] bg-[#F8F9F6] flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-sm font-['Archivo'] text-[#1A1D21]">
                    Consolidated Income Statement (P&amp;L)
                  </h3>
                  <p className="text-xs text-[#5C636F]">Period: Month Ended August 2026</p>
                </div>
                <span className="text-[10px] font-['IBM_Plex_Mono'] font-bold bg-[#157A4D]/10 text-[#157A4D] px-2 py-0.5 rounded">
                  PFRS Compliant
                </span>
              </div>

              <div className="p-4 space-y-3 font-['IBM_Plex_Mono'] text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#F1F1ED]">
                  <span className="font-bold font-['IBM_Plex_Sans'] text-sm">Operating Gross Revenue</span>
                  <span className="font-bold text-sm text-[#157A4D]">{maskCurrency(statementsData.grossRevenue)}</span>
                </div>
                <div className="flex justify-between py-1 text-[#5C636F] pl-4">
                  <span>Less: Direct Cost of Goods Sold (F&amp;B Purveyors)</span>
                  <span>({maskCurrency(statementsData.directCost)})</span>
                </div>
                <div className="flex justify-between py-1.5 font-bold border-b border-[#DFE1DB]">
                  <span className="font-['IBM_Plex_Sans']">Gross Operating Profit</span>
                  <span className="text-[#1A1D21]">{maskCurrency(statementsData.grossProfit)}</span>
                </div>
                <div className="flex justify-between py-1 text-[#5C636F] pl-4">
                  <span>Less: Operating Expenses (Opex &amp; Admin)</span>
                  <span>({maskCurrency(statementsData.opex)})</span>
                </div>
                <div className="flex justify-between py-1.5 font-bold border-b border-[#DFE1DB] bg-[#F8F9F6] px-2 rounded">
                  <span className="font-['IBM_Plex_Sans']">Operating EBITDA</span>
                  <span className="text-[#157A4D]">{maskCurrency(statementsData.ebitda)}</span>
                </div>
                <div className="flex justify-between py-1 text-[#5C636F] pl-4">
                  <span>Less: Depreciation &amp; Amortization</span>
                  <span>({maskCurrency(statementsData.depreciation)})</span>
                </div>
                <div className="flex justify-between py-1 text-[#5C636F] pl-4">
                  <span>Less: Finance &amp; Interest Expense</span>
                  <span>({maskCurrency(statementsData.interest)})</span>
                </div>
                <div className="flex justify-between py-1.5 font-bold border-b border-[#DFE1DB]">
                  <span className="font-['IBM_Plex_Sans']">Earnings Before Tax (EBT)</span>
                  <span className="text-[#1A1D21]">{maskCurrency(statementsData.ebt)}</span>
                </div>
                <div className="flex justify-between py-1 text-[#B5281A] pl-4">
                  <span>Less: Provision for Corporate Income Tax (25% CREATE)</span>
                  <span>({maskCurrency(statementsData.corporateIncomeTax)})</span>
                </div>
                <div className="flex justify-between py-2 text-sm font-bold bg-[#1A1D21] text-white px-3 rounded-lg">
                  <span className="font-['Archivo']">Net Consolidated Profit</span>
                  <span className="text-[#35C98B]">{maskCurrency(statementsData.netIncome)}</span>
                </div>
              </div>
            </div>

            {/* Balance Sheet */}
            <div className="bg-white border border-[#DFE1DB] rounded-xl overflow-hidden shadow-xs">
              <div className="p-4 border-b border-[#DFE1DB] bg-[#F8F9F6] flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-sm font-['Archivo'] text-[#1A1D21]">
                    Consolidated Balance Sheet
                  </h3>
                  <p className="text-xs text-[#5C636F]">As of August 27, 2026</p>
                </div>
                <span className="text-[10px] font-['IBM_Plex_Mono'] font-bold bg-[#1A1D21]/10 text-[#1A1D21] px-2 py-0.5 rounded">
                  Audited Ledger
                </span>
              </div>

              <div className="p-4 space-y-3 font-['IBM_Plex_Mono'] text-xs">
                {/* Assets */}
                <div className="text-[11px] font-bold text-[#5C636F] font-['IBM_Plex_Mono'] uppercase">
                  ASSETS
                </div>
                <div className="flex justify-between py-1 text-[#5C636F] pl-4">
                  <span>Cash &amp; Treasury Vault Equivalents</span>
                  <span>{maskCurrency(statementsData.cashEquivalents)}</span>
                </div>
                <div className="flex justify-between py-1 text-[#5C636F] pl-4">
                  <span>Accounts Receivable (AR Ledger)</span>
                  <span>{maskCurrency(statementsData.accountsReceivable)}</span>
                </div>
                <div className="flex justify-between py-1 text-[#5C636F] pl-4">
                  <span>F&amp;B &amp; Logistics Inventory Valuation</span>
                  <span>{maskCurrency(statementsData.inventoryValuation)}</span>
                </div>
                <div className="flex justify-between py-1 font-semibold pl-2 border-b border-[#F1F1ED]">
                  <span>Total Current Assets</span>
                  <span>{maskCurrency(statementsData.totalCurrentAssets)}</span>
                </div>
                <div className="flex justify-between py-1 text-[#5C636F] pl-4">
                  <span>Property, Plant &amp; Hospitality Equipment</span>
                  <span>{maskCurrency(statementsData.propertyPlantEquipment)}</span>
                </div>
                <div className="flex justify-between py-1.5 font-bold border-b border-[#DFE1DB] bg-[#F8F9F6] px-2 rounded">
                  <span className="font-['IBM_Plex_Sans']">TOTAL ASSETS</span>
                  <span className="text-[#1A1D21]">{maskCurrency(statementsData.totalAssets)}</span>
                </div>

                {/* Liabilities & Equity */}
                <div className="text-[11px] font-bold text-[#5C636F] font-['IBM_Plex_Mono'] uppercase pt-2">
                  LIABILITIES &amp; SHAREHOLDER EQUITY
                </div>
                <div className="flex justify-between py-1 text-[#5C636F] pl-4">
                  <span>Accounts Payable (AP Invoices)</span>
                  <span>{maskCurrency(statementsData.accountsPayable)}</span>
                </div>
                <div className="flex justify-between py-1 text-[#5C636F] pl-4">
                  <span>Accrued Tax Liabilities (BIR VAT/EWT/CIT)</span>
                  <span>{maskCurrency(statementsData.accruedTaxLiabilities)}</span>
                </div>
                <div className="flex justify-between py-1 text-[#5C636F] pl-4">
                  <span>Long-Term Facilities Financing</span>
                  <span>{maskCurrency(statementsData.longTermDebt)}</span>
                </div>
                <div className="flex justify-between py-1 font-semibold pl-2 border-b border-[#F1F1ED]">
                  <span>Total Liabilities</span>
                  <span>{maskCurrency(statementsData.totalLiabilities)}</span>
                </div>
                <div className="flex justify-between py-1 text-[#157A4D] font-bold pl-4">
                  <span>Shareholder Equity &amp; Retained Earnings</span>
                  <span>{maskCurrency(statementsData.shareholderEquity)}</span>
                </div>
                <div className="flex justify-between py-2 text-sm font-bold bg-[#1A1D21] text-white px-3 rounded-lg">
                  <span className="font-['Archivo']">TOTAL LIABILITIES &amp; EQUITY</span>
                  <span>{maskCurrency(statementsData.totalLiabAndEquity)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DATARAILS FP&A VARIANCE HEATMAP */}
      {activeTab === "variance" && (
        <div className="space-y-6">
          <div className="bg-white border border-[#DFE1DB] rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#DFE1DB] flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm font-['Archivo']">
                  Datarails Departmental Budget vs. Actual Variance Matrix
                </h3>
                <p className="text-xs text-[#5C636F]">
                  Real-time synchronization with GL posting ledgers and operational sub-modules.
                </p>
              </div>
              <span className="text-xs font-['IBM_Plex_Mono'] font-bold text-[#157A4D] bg-[#157A4D]/10 px-2.5 py-1 rounded">
                Datarails FP&amp;A AI Core Sync
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm font-['IBM_Plex_Sans']">
                <thead className="bg-[#F1F1ED] text-xs font-['IBM_Plex_Mono'] text-[#5C636F] uppercase">
                  <tr>
                    <th className="p-3">Department / Cost Center</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-right">Approved Budget</th>
                    <th className="p-3 text-right">Actual Expense</th>
                    <th className="p-3 text-right">Variance (PHP)</th>
                    <th className="p-3 text-center">Variance (%)</th>
                    <th className="p-3">Primary Operational Driver</th>
                    <th className="p-3">Variance Commentary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F1ED] font-['IBM_Plex_Mono'] text-xs">
                  {fpaData.map((row, idx) => {
                    const varianceVal = row.actualExpense - row.approvedBudget;
                    const variancePct = ((varianceVal / row.approvedBudget) * 100).toFixed(1);
                    const isFavorable = row.category === "Revenue" ? varianceVal >= 0 : varianceVal <= 0;

                    return (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-bold font-['IBM_Plex_Sans'] text-[#1A1D21]">
                          {row.department}
                          <span className="block text-[10px] text-[#5C636F] font-['IBM_Plex_Mono'] font-normal">
                            Analyst: {row.leadAnalyst}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              row.category === "Revenue"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-800"
                            }`}
                          >
                            {row.category}
                          </span>
                        </td>
                        <td className="p-3 text-right text-[#5C636F] font-medium">
                          {maskCurrency(row.approvedBudget)}
                        </td>
                        <td className="p-3 text-right font-bold text-[#1A1D21]">
                          {maskCurrency(row.actualExpense)}
                        </td>
                        <td
                          className={`p-3 text-right font-bold ${
                            isFavorable ? "text-[#157A4D]" : "text-[#B5281A]"
                          }`}
                        >
                          {varianceVal >= 0 ? `+${maskCurrency(varianceVal)}` : maskCurrency(varianceVal)}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center space-x-1 ${
                              isFavorable
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {isFavorable ? (
                              <ArrowUpRight className="h-3 w-3" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3" />
                            )}
                            <span>{Math.abs(Number(variancePct))}%</span>
                          </span>
                        </td>
                        <td className="p-3 font-['IBM_Plex_Sans'] text-xs text-[#5C636F]">
                          {row.driver}
                        </td>
                        <td className="p-3 font-['IBM_Plex_Sans'] text-xs text-[#1A1D21]">
                          {row.varianceNote}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DRIVER-BASED SCENARIOS */}
      {activeTab === "scenarios" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Scenario Selector Cards */}
            <div
              onClick={() => setSelectedScenario("base")}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedScenario === "base"
                  ? "bg-[#1A1D21] text-white border-[#1A1D21] shadow-md"
                  : "bg-white text-[#1A1D21] border-[#DFE1DB] hover:border-slate-400"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-xs font-['IBM_Plex_Mono']">BASE CASE</span>
                {selectedScenario === "base" && <CheckCircle2 className="h-4 w-4 text-[#FF6A3D]" />}
              </div>
              <p className="text-xs opacity-80">Budgeted operations at 85% occupancy, steady ADR.</p>
            </div>

            <div
              onClick={() => setSelectedScenario("optimistic")}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedScenario === "optimistic"
                  ? "bg-[#1A1D21] text-white border-[#1A1D21] shadow-md"
                  : "bg-white text-[#1A1D21] border-[#DFE1DB] hover:border-slate-400"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-xs font-['IBM_Plex_Mono']">EXPANSION (+18%)</span>
                {selectedScenario === "optimistic" && <CheckCircle2 className="h-4 w-4 text-[#FF6A3D]" />}
              </div>
              <p className="text-xs opacity-80">High convention season, banquet surge +18% revenue.</p>
            </div>

            <div
              onClick={() => setSelectedScenario("recession")}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedScenario === "recession"
                  ? "bg-[#1A1D21] text-white border-[#1A1D21] shadow-md"
                  : "bg-white text-[#1A1D21] border-[#DFE1DB] hover:border-slate-400"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-xs font-['IBM_Plex_Mono']">RECESSION STRESS (-18%)</span>
                {selectedScenario === "recession" && <CheckCircle2 className="h-4 w-4 text-[#FF6A3D]" />}
              </div>
              <p className="text-xs opacity-80">Off-peak contraction with fuel cost inflation +10%.</p>
            </div>

            <div
              onClick={() => setSelectedScenario("custom")}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedScenario === "custom"
                  ? "bg-[#1A1D21] text-white border-[#1A1D21] shadow-md"
                  : "bg-white text-[#1A1D21] border-[#DFE1DB] hover:border-slate-400"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-xs font-['IBM_Plex_Mono']">CUSTOM SLIDER MODEL</span>
                {selectedScenario === "custom" && <CheckCircle2 className="h-4 w-4 text-[#FF6A3D]" />}
              </div>
              <p className="text-xs opacity-80">Interactive driver tuning for room rates &amp; occupancy.</p>
            </div>
          </div>

          {/* Interactive Driver Sliders (when custom is active) */}
          {selectedScenario === "custom" && (
            <div className="p-5 bg-white rounded-xl border border-[#DFE1DB] shadow-xs space-y-4">
              <h3 className="font-bold text-sm font-['Archivo'] flex items-center gap-2">
                <Sliders className="h-4 w-4 text-[#FF6A3D]" />
                <span>Custom Driver Sensitivity Controls</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-['IBM_Plex_Sans']">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-bold text-[#5C636F]">Average Daily Room Rate (ADR)</span>
                    <span className="font-bold font-['IBM_Plex_Mono'] text-[#1A1D21]">{maskCurrency(adrDriver)}</span>
                  </div>
                  <input
                    type="range"
                    min="3500"
                    max="10000"
                    step="100"
                    value={adrDriver}
                    onChange={(e) => setAdrDriver(Number(e.target.value))}
                    className="w-full accent-[#FF6A3D]"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-bold text-[#5C636F]">Hotel Occupancy %</span>
                    <span className="font-bold font-['IBM_Plex_Mono'] text-[#1A1D21]">{occDriver}%</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    step="1"
                    value={occDriver}
                    onChange={(e) => setOccDriver(Number(e.target.value))}
                    className="w-full accent-[#FF6A3D]"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-bold text-[#5C636F]">Fleet Diesel / Liter (PHP)</span>
                    <span className="font-bold font-['IBM_Plex_Mono'] text-[#1A1D21]">₱{fuelDriver.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="45"
                    max="85"
                    step="0.5"
                    value={fuelDriver}
                    onChange={(e) => setFuelDriver(Number(e.target.value))}
                    className="w-full accent-[#FF6A3D]"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-bold text-[#5C636F]">F&amp;B Volume Growth %</span>
                    <span className="font-bold font-['IBM_Plex_Mono'] text-[#1A1D21]">+{fbGrowthDriver}%</span>
                  </div>
                  <input
                    type="range"
                    min="-30"
                    max="50"
                    step="2"
                    value={fbGrowthDriver}
                    onChange={(e) => setFbGrowthDriver(Number(e.target.value))}
                    className="w-full accent-[#FF6A3D]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Scenario Results Projection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-[#DFE1DB] space-y-2 shadow-xs">
              <span className="text-xs font-bold font-['IBM_Plex_Mono'] text-[#5C636F]">
                PROJECTED REVENUE
              </span>
              <div className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#157A4D]">
                {maskCurrency(scenarioStats.projectedRevenue)}
              </div>
              <p className="text-[11px] text-[#5C636F]">Scenario Model Output</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#DFE1DB] space-y-2 shadow-xs">
              <span className="text-xs font-bold font-['IBM_Plex_Mono'] text-[#5C636F]">
                PROJECTED OPEX
              </span>
              <div className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#B5281A]">
                {maskCurrency(scenarioStats.projectedOpex)}
              </div>
              <p className="text-[11px] text-[#5C636F]">Direct &amp; Indirect Cost Base</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#DFE1DB] space-y-2 shadow-xs">
              <span className="text-xs font-bold font-['IBM_Plex_Mono'] text-[#5C636F]">
                PROJECTED EBITDA
              </span>
              <div className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#1A1D21]">
                {maskCurrency(scenarioStats.projectedEBITDA)}
              </div>
              <p className="text-[11px] text-[#5C636F]">Operating Cash Margin</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#DFE1DB] space-y-2 shadow-xs">
              <span className="text-xs font-bold font-['IBM_Plex_Mono'] text-[#5C636F]">
                PROJECTED EBITDA MARGIN
              </span>
              <div className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#157A4D]">
                {isDataMasked ? "••• %" : `${scenarioStats.projectedMargin}%`}
              </div>
              <p className="text-[11px] text-[#5C636F]">Consolidated Return Ratio</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MULTI-SUBSYSTEM AUDIT LINEAGE */}
      {activeTab === "lineage" && (
        <div className="space-y-6">
          <div className="bg-white border border-[#DFE1DB] rounded-xl overflow-hidden shadow-xs p-5 space-y-4">
            <h3 className="font-bold text-base font-['Archivo'] text-[#1A1D21]">
              Multi-Subsystem Financial Data Lake &amp; Audit Trail
            </h3>
            <p className="text-xs text-[#5C636F]">
              Direct bidirectional sync between the 5 operational subsystems and the executive General Ledger.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-['IBM_Plex_Sans'] text-xs">
              <div className="p-3 bg-[#F8F9F6] rounded-lg border border-[#DFE1DB] space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Hotel PMS &amp; Folios (Team 9)</span>
                  <span className="text-[#157A4D]">Connected (Synced)</span>
                </div>
                <p className="text-[#5C636F]">Automated daily night-audit room revenues posted to GL #4010.</p>
              </div>

              <div className="p-3 bg-[#F8F9F6] rounded-lg border border-[#DFE1DB] space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Restaurant POS (Team 10)</span>
                  <span className="text-[#157A4D]">Connected (Synced)</span>
                </div>
                <p className="text-[#5C636F]">Real-time dining shift cash/credit drops reconciled to Treasury.</p>
              </div>

              <div className="p-3 bg-[#F8F9F6] rounded-lg border border-[#DFE1DB] space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Fleet Hauling &amp; Logistics</span>
                  <span className="text-[#157A4D]">Connected (Synced)</span>
                </div>
                <p className="text-[#5C636F]">Diesel fuel receipts &amp; hauling AR freight invoices mapped to GL #5020.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
