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
  BarChart2
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

interface DatarailsFPAProps {
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
    varianceNote: "Direct direct-booking website promo decreased OTA fees"
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

export default function DatarailsFPA({
  currentUser,
  isDataMasked = false,
  maskCurrency = (val) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(val),
  maskField = (val) => val
}: DatarailsFPAProps) {
  const [activeTab, setActiveTab] = useState<"variance" | "scenarios" | "statements" | "lineage">("variance");
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

  const getExportData = () => {
    return {
      title: "Datarails Enterprise FP&A Financial Planning & Consolidation Model",
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#DFE1DB] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold font-['IBM_Plex_Mono'] uppercase text-[#5C636F]">
              DATARAILS FP&amp;A SUITE / STRATEGIC FINANCIAL INTELLIGENCE
            </span>
            <span className="bg-[#1A1D21] text-[#35C98B] px-2 py-0.5 rounded text-[10px] font-['IBM_Plex_Mono'] font-bold border border-[#2A2E34]">
              EXCEL-NATIVE DATA LAKE
            </span>
          </div>
          <h1 className="text-2xl font-bold font-['Archivo'] text-[#1A1D21] mt-1">
            Datarails FP&amp;A Financial Planning &amp; Modeling
          </h1>
          <p className="text-xs text-[#5C636F]">
            Unified financial consolidation, driver-based forecasting, budget vs. actual variance analysis, and cell-level audit lineage.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton getExportData={getExportData} buttonLabel="Export Datarails Model" />
        </div>
      </div>

      {/* Datarails Executive KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1A1D21] text-white p-5 rounded-xl border border-[#2A2E34] space-y-1 shadow-xs">
          <div className="flex justify-between items-center text-xs font-['IBM_Plex_Mono'] text-[#A8AFB8]">
            <span>PROJECTED EBITDA</span>
            <Activity className="h-4 w-4 text-[#35C98B]" />
          </div>
          <div className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#35C98B]">
            {formatPHP(scenarioStats.projectedEBITDA)}
          </div>
          <p className="text-[11px] text-[#A8AFB8]">Operating Margin: {scenarioStats.projectedMargin}%</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#DFE1DB] space-y-1 shadow-xs">
          <div className="flex justify-between items-center text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
            <span>TOTAL CONSOLIDATED REVENUE</span>
            <TrendingUp className="h-4 w-4 text-[#157A4D]" />
          </div>
          <div className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#157A4D]">
            {formatPHP(scenarioStats.projectedRevenue)}
          </div>
          <p className="text-[11px] text-[#5C636F]">Rooms, F&amp;B &amp; Fleet Logistics</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#DFE1DB] space-y-1 shadow-xs">
          <div className="flex justify-between items-center text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
            <span>TOTAL OPERATIONAL EXPENSES</span>
            <TrendingDown className="h-4 w-4 text-[#B53A1E]" />
          </div>
          <div className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#B53A1E]">
            {formatPHP(scenarioStats.projectedOpex)}
          </div>
          <p className="text-[11px] text-[#5C636F]">Controlled within 3.4% budget variance</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#DFE1DB] space-y-1 shadow-xs">
          <div className="flex justify-between items-center text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
            <span>DATARAILS DATA SYNC</span>
            <Database className="h-4 w-4 text-[#1A1D21]" />
          </div>
          <div className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#1A1D21]">
            100% Live
          </div>
          <p className="text-[11px] text-[#157A4D] font-medium">6 Systems Unified (GL, AP, AR, Fleet)</p>
        </div>
      </div>

      {/* Datarails Sub-Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-[#F1F1ED] rounded-xl border border-[#DFE1DB]">
        {[
          { id: "variance", label: "Actual vs. Budget Variance Matrix", icon: BarChart2 },
          { id: "scenarios", label: "Driver-Based Scenario Modeling", icon: Sliders },
          { id: "statements", label: "Consolidated 3-Statement Model", icon: FileSpreadsheet },
          { id: "lineage", label: "Datarails Cell Audit Lineage", icon: GitBranch }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-['IBM_Plex_Mono'] font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-[#1A1D21] text-white shadow-xs"
                  : "text-[#5C636F] hover:text-[#1A1D21] hover:bg-white/60"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? "text-[#35C98B]" : ""}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ==============================================================================
          TAB 1: ACTUAL VS BUDGET VARIANCE MATRIX
         ============================================================================== */}
      {activeTab === "variance" && (
        <div className="bg-white border border-[#DFE1DB] rounded-xl overflow-hidden shadow-xs space-y-4">
          <div className="p-4 border-b border-[#DFE1DB] flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm font-['Archivo']">
                Departmental Actual vs. Budget Variance Heatmap (Datarails Auto-Rollup)
              </h3>
              <p className="text-xs text-[#5C636F]">
                Real-time automated variance detection with automated financial analyst commentary.
              </p>
            </div>
            <span className="text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
              Period: <strong>August 2026 MTD</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-['IBM_Plex_Sans']">
              <thead className="bg-[#F1F1ED] text-xs font-['IBM_Plex_Mono'] text-[#5C636F] uppercase">
                <tr>
                  <th className="p-3">Department &amp; Cost Center</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">Approved Budget</th>
                  <th className="p-3 text-right">Actual Realized</th>
                  <th className="p-3 text-right">Variance (PHP)</th>
                  <th className="p-3 text-right">Variance %</th>
                  <th className="p-3">Primary Value Driver</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F1ED] font-['IBM_Plex_Mono']">
                {fpaData.map((row, idx) => {
                  const varianceVal = row.actualExpense - row.approvedBudget;
                  const variancePct = ((varianceVal / row.approvedBudget) * 100).toFixed(1);
                  const isRevenue = row.category === "Revenue";
                  const isFavorable = isRevenue ? varianceVal >= 0 : varianceVal <= 0;

                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-['IBM_Plex_Sans'] font-semibold text-[#1A1D21]">
                        {row.department}
                        <span className="block text-[11px] font-['IBM_Plex_Mono'] text-[#5C636F]">
                          Lead: {row.leadAnalyst}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            row.category === "Revenue"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-800"
                          }`}
                        >
                          {row.category}
                        </span>
                      </td>
                      <td className="p-3 text-right">{formatPHP(row.approvedBudget)}</td>
                      <td className="p-3 text-right font-medium">{formatPHP(row.actualExpense)}</td>
                      <td
                        className={`p-3 text-right font-bold ${
                          isFavorable ? "text-[#157A4D]" : "text-[#B5281A]"
                        }`}
                      >
                        {isFavorable ? `+${formatPHP(Math.abs(varianceVal))}` : `-${formatPHP(Math.abs(varianceVal))}`}
                      </td>
                      <td
                        className={`p-3 text-right font-bold ${
                          isFavorable ? "text-[#157A4D]" : "text-[#B5281A]"
                        }`}
                      >
                        {variancePct}%
                      </td>
                      <td className="p-3 font-['IBM_Plex_Sans'] text-xs text-[#5C636F]">
                        {row.driver}
                        <span className="block text-[11px] text-slate-700 italic">
                          {row.varianceNote}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                            isFavorable
                              ? "bg-[#157A4D]/10 text-[#157A4D]"
                              : "bg-[#B5281A]/10 text-[#B5281A]"
                          }`}
                        >
                          {isFavorable ? (
                            <>
                              <ArrowDownRight className="h-3 w-3 mr-1" /> Favorable
                            </>
                          ) : (
                            <>
                              <ArrowUpRight className="h-3 w-3 mr-1" /> Unfavorable
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==============================================================================
          TAB 2: DRIVER-BASED SCENARIO MODELING
         ============================================================================== */}
      {activeTab === "scenarios" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scenario Selector & Sliders */}
          <div className="bg-white p-5 rounded-xl border border-[#DFE1DB] space-y-4 shadow-xs">
            <h3 className="font-bold text-base font-['Archivo'] flex items-center gap-2">
              <Sliders className="h-5 w-5 text-[#FF6A3D]" />
              <span>Datarails Scenario Matrix</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs font-['IBM_Plex_Mono']">
              {[
                { id: "base", label: "Base Case Budget" },
                { id: "optimistic", label: "High Occupancy (+18%)" },
                { id: "recession", label: "Downside Shock (-18%)" },
                { id: "custom", label: "Custom Driver Sandbox" }
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedScenario(s.id as any)}
                  className={`p-2.5 rounded-lg border font-bold text-left transition-all ${
                    selectedScenario === s.id
                      ? "bg-[#1A1D21] text-white border-[#1A1D21]"
                      : "bg-slate-50 text-slate-700 border-[#DFE1DB] hover:bg-slate-100"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {selectedScenario === "custom" && (
              <div className="space-y-4 pt-2 border-t text-xs">
                <div>
                  <div className="flex justify-between font-['IBM_Plex_Mono']">
                    <span>Average Daily Rate (ADR):</span>
                    <span className="font-bold">₱{adrDriver.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="4000"
                    max="9000"
                    step="100"
                    value={adrDriver}
                    onChange={(e) => setAdrDriver(Number(e.target.value))}
                    className="w-full mt-1"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-['IBM_Plex_Mono']">
                    <span>Hotel Occupancy Rate (%):</span>
                    <span className="font-bold">{occDriver}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="1"
                    value={occDriver}
                    onChange={(e) => setOccDriver(Number(e.target.value))}
                    className="w-full mt-1"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-['IBM_Plex_Mono']">
                    <span>Fleet Diesel Cost / Liter:</span>
                    <span className="font-bold">₱{fuelDriver.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="45"
                    max="75"
                    step="0.5"
                    value={fuelDriver}
                    onChange={(e) => setFuelDriver(Number(e.target.value))}
                    className="w-full mt-1"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Scenario Financial Outputs */}
          <div className="bg-white p-5 rounded-xl border border-[#DFE1DB] space-y-4 shadow-xs col-span-2">
            <h3 className="font-bold text-base font-['Archivo']">
              Forecasted Dynamic P&amp;L Rollup ({selectedScenario.toUpperCase()} SCENARIO)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-['IBM_Plex_Mono']">
              <div className="p-4 bg-[#F1F1ED] rounded-xl space-y-1">
                <span className="text-xs text-[#5C636F]">GROSS REVENUES</span>
                <div className="text-xl font-bold text-[#157A4D]">
                  {formatPHP(scenarioStats.projectedRevenue)}
                </div>
              </div>
              <div className="p-4 bg-[#F1F1ED] rounded-xl space-y-1">
                <span className="text-xs text-[#5C636F]">OPERATING EXPENSES</span>
                <div className="text-xl font-bold text-[#B5281A]">
                  {formatPHP(scenarioStats.projectedOpex)}
                </div>
              </div>
              <div className="p-4 bg-[#1A1D21] text-white rounded-xl space-y-1">
                <span className="text-xs text-[#35C98B]">EBITDA CASH FLOW</span>
                <div className="text-xl font-bold text-[#35C98B]">
                  {formatPHP(scenarioStats.projectedEBITDA)}
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-[#157A4D] shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-bold text-[#157A4D]">Datarails AI Financial Narrative</div>
                <p className="text-slate-700 mt-0.5">
                  Under the active {selectedScenario} model, strong ADR pricing resilience supports high EBITDA margin retention ({scenarioStats.projectedMargin}%). Working capital velocity remains within safe limits.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================================
          TAB 3: CONSOLIDATED 3-STATEMENT MODEL
         ============================================================================== */}
      {activeTab === "statements" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-['IBM_Plex_Sans'] text-xs">
          {/* Income Statement */}
          <div className="bg-white p-5 rounded-xl border border-[#DFE1DB] space-y-3 shadow-xs">
            <h3 className="font-bold text-sm font-['Archivo'] border-b pb-2">1. Profit &amp; Loss (P&amp;L)</h3>
            <div className="space-y-2 font-['IBM_Plex_Mono']">
              <div className="flex justify-between">
                <span>Gross Revenues:</span>
                <span className="font-bold text-[#157A4D]">{formatPHP(3625000)}</span>
              </div>
              <div className="flex justify-between text-[#5C636F]">
                <span>Cost of Goods Sold (COGS):</span>
                <span>({formatPHP(680000)})</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-1">
                <span>Gross Margin:</span>
                <span>{formatPHP(2945000)} (81.2%)</span>
              </div>
              <div className="flex justify-between text-[#5C636F]">
                <span>Operating Expenses (Opex):</span>
                <span>({formatPHP(1230500)})</span>
              </div>
              <div className="flex justify-between font-bold text-[#157A4D] border-t pt-1">
                <span>EBITDA:</span>
                <span>{formatPHP(1714500)}</span>
              </div>
            </div>
          </div>

          {/* Balance Sheet */}
          <div className="bg-white p-5 rounded-xl border border-[#DFE1DB] space-y-3 shadow-xs">
            <h3 className="font-bold text-sm font-['Archivo'] border-b pb-2">2. Balance Sheet Summary</h3>
            <div className="space-y-2 font-['IBM_Plex_Mono']">
              <div className="flex justify-between">
                <span>Cash &amp; Bank Liquidity:</span>
                <span className="font-bold">{formatPHP(2845000)}</span>
              </div>
              <div className="flex justify-between">
                <span>Accounts Receivable (AR):</span>
                <span>{formatPHP(521900)}</span>
              </div>
              <div className="flex justify-between">
                <span>Fleet &amp; Property PPE:</span>
                <span>{formatPHP(11850000)}</span>
              </div>
              <div className="flex justify-between text-[#B5281A] border-t pt-1">
                <span>Accounts Payable (AP):</span>
                <span>({formatPHP(481050)})</span>
              </div>
              <div className="flex justify-between font-bold text-[#1A1D21] border-t pt-1">
                <span>Net Total Equity:</span>
                <span>{formatPHP(14735850)}</span>
              </div>
            </div>
          </div>

          {/* Cash Flow */}
          <div className="bg-white p-5 rounded-xl border border-[#DFE1DB] space-y-3 shadow-xs">
            <h3 className="font-bold text-sm font-['Archivo'] border-b pb-2">3. Cash Flows Summary</h3>
            <div className="space-y-2 font-['IBM_Plex_Mono']">
              <div className="flex justify-between">
                <span>Operating Cash Inflows:</span>
                <span className="font-bold text-[#157A4D]">{formatPHP(1650000)}</span>
              </div>
              <div className="flex justify-between text-[#5C636F]">
                <span>Capex &amp; Fleet Reinvestment:</span>
                <span>({formatPHP(180000)})</span>
              </div>
              <div className="flex justify-between text-[#5C636F]">
                <span>Debt &amp; Statutory Remittances:</span>
                <span>({formatPHP(115000)})</span>
              </div>
              <div className="flex justify-between font-bold text-[#157A4D] border-t pt-1">
                <span>Net Liquidity Add:</span>
                <span>+{formatPHP(1355000)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================================
          TAB 4: CELL AUDIT LINEAGE
         ============================================================================== */}
      {activeTab === "lineage" && (
        <div className="bg-white p-6 rounded-xl border border-[#DFE1DB] space-y-4 shadow-xs">
          <div>
            <h3 className="font-bold text-base font-['Archivo']">
              Datarails Cell Lineage &amp; Underlying Sub-Ledger Traceability
            </h3>
            <p className="text-xs text-[#5C636F]">
              Click or inspect any consolidated metric to audit its exact origin down to journal voucher, PO, and bank wire.
            </p>
          </div>

          <div className="space-y-3 text-xs font-['IBM_Plex_Mono']">
            {[
              { cell: "F&B Actual Expense (₱1,345,000)", sources: ["PO-88421 (Meat Purveyor ₱125k)", "DR-99201 (Seafood ₱85k)", "Kitchen POS Batch Drops"] },
              { cell: "Fleet Operations Opex (₱348,500)", sources: ["Petron Fleet Card AP Invoice #FLT-882", "Driver Trailing Payroll", "Skyway Stage 3 RFID Auto-Replenish"] },
              { cell: "Net VAT Payable (₱56,400)", sources: ["BIR Form 2550Q Rollup", "12% Output Sales VAT", "Creditable Input Invoices"] }
            ].map((item, idx) => (
              <div key={idx} className="p-3 bg-[#F1F1ED] rounded-lg border border-[#DFE1DB] space-y-2">
                <div className="font-bold text-[#1A1D21] flex items-center justify-between">
                  <span>{item.cell}</span>
                  <span className="text-[10px] text-[#157A4D] bg-emerald-100 px-2 py-0.5 rounded">
                    Audit Verified
                  </span>
                </div>
                <div className="pl-4 border-l-2 border-slate-400 space-y-1 text-[#5C636F]">
                  {item.sources.map((src, sIdx) => (
                    <div key={sIdx}>➔ {src}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
