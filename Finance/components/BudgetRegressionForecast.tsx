import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  Activity,
  AlertTriangle,
  Sparkles,
  Sliders,
  Calendar,
  Layers,
  ArrowUpRight,
  Info,
  CheckCircle2,
  Zap,
  BarChart2,
  FileSpreadsheet
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
  Area
} from "recharts";
import ExportButton from "./ExportButton";

// Historical 6-Month Departmental & Total Actual Spend Data
const HISTORICAL_MONTHLY_SPEND = [
  { monthIndex: 1, monthName: "Jan 2026", rooms: 145000, fb: 110000, utilities: 48000, admin: 65000, marketing: 35000, actualTotal: 403000, budgetedCeiling: 450000 },
  { monthIndex: 2, monthName: "Feb 2026", rooms: 152000, fb: 118000, utilities: 51000, admin: 66000, marketing: 38000, actualTotal: 425000, budgetedCeiling: 450000 },
  { monthIndex: 3, monthName: "Mar 2026", rooms: 159000, fb: 125000, utilities: 53000, admin: 68000, marketing: 42000, actualTotal: 447000, budgetedCeiling: 450000 },
  { monthIndex: 4, monthName: "Apr 2026", rooms: 168000, fb: 134000, utilities: 57000, admin: 70000, marketing: 46000, actualTotal: 475000, budgetedCeiling: 500000 },
  { monthIndex: 5, monthName: "May 2026", rooms: 178000, fb: 142000, utilities: 61000, admin: 72000, marketing: 49000, actualTotal: 502000, budgetedCeiling: 500000 },
  { monthIndex: 6, monthName: "Jun 2026", rooms: 189000, fb: 151000, utilities: 64000, admin: 74000, marketing: 52000, actualTotal: 530000, budgetedCeiling: 500000 },
];

interface BudgetRegressionProps {
  isDataMasked?: boolean;
  maskCurrency: (val: number) => string;
  departmentBudgets: Array<{ id: string; department: string; allocated: number; spent: number }>;
}

export default function BudgetRegressionForecast({
  isDataMasked = false,
  maskCurrency,
  departmentBudgets
}: BudgetRegressionProps) {
  // Scenario Simulation Controls
  const [forecastMonths, setForecastMonths] = useState<number>(6); // 3, 6, or 12 months ahead
  const [inflationAdjustment, setInflationAdjustment] = useState<number>(3.5); // % annual inflation
  const [occupancyLift, setOccupancyLift] = useState<number>(5.0); // % forecasted guest volume
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>("Total Spend");

  // Format Philippine Peso
  const formatPHP = (val: number) => {
    return isDataMasked
      ? maskCurrency(val)
      : new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(val || 0);
  };

  // Perform Ordinary Least Squares (OLS) Linear Regression Analysis
  const regressionAnalysis = useMemo(() => {
    const dataPoints = HISTORICAL_MONTHLY_SPEND.map((d) => {
      let yVal = d.actualTotal;
      if (selectedDeptFilter === "Rooms Division") yVal = d.rooms;
      if (selectedDeptFilter === "Food & Beverage") yVal = d.fb;
      if (selectedDeptFilter === "Utilities & Maintenance") yVal = d.utilities;
      if (selectedDeptFilter === "Admin & General") yVal = d.admin;
      if (selectedDeptFilter === "Sales & Marketing") yVal = d.marketing;

      return { x: d.monthIndex, y: yVal, label: d.monthName, raw: d };
    });

    const N = dataPoints.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;
    let sumY2 = 0;

    dataPoints.forEach((pt) => {
      sumX += pt.x;
      sumY += pt.y;
      sumXY += pt.x * pt.y;
      sumX2 += pt.x * pt.x;
      sumY2 += pt.y * pt.y;
    });

    // Slope (m) and Intercept (b)
    const m = (N * sumXY - sumX * sumY) / (N * sumX2 - sumX * sumX);
    const b = (sumY - m * sumX) / N;

    // Calculate Coefficient of Determination (R²) and Standard Error
    const yMean = sumY / N;
    let ssTot = 0;
    let ssRes = 0;

    dataPoints.forEach((pt) => {
      const yFitted = m * pt.x + b;
      ssTot += Math.pow(pt.y - yMean, 2);
      ssRes += Math.pow(pt.y - yFitted, 2);
    });

    const rSquared = ssTot === 0 ? 1 : Math.max(0, 1 - ssRes / ssTot);
    const standardError = Math.sqrt(ssRes / (N - 2 || 1));

    // Generate Future Forecast Timeline
    const futureMonthsNames = [
      "Jul 2026", "Aug 2026", "Sep 2026", "Oct 2026", "Nov 2026", "Dec 2026",
      "Jan 2027", "Feb 2027", "Mar 2027", "Apr 2027", "May 2027", "Jun 2027"
    ];

    // Combined Chart Data Series
    const combinedSeries: any[] = [];

    // 1. Add historical fitted data
    dataPoints.forEach((pt) => {
      const fittedY = m * pt.x + b;
      combinedSeries.push({
        month: pt.label,
        type: "Historical",
        actualSpend: pt.y,
        regressionTrendline: Math.round(fittedY),
        budgetCeiling: pt.raw.budgetedCeiling,
        upperConfidence: Math.round(fittedY + 1.28 * standardError),
        lowerConfidence: Math.round(Math.max(0, fittedY - 1.28 * standardError)),
      });
    });

    // 2. Add projected future regression data with user scenario simulation factors
    const scenarioMultiplier = 1 + (inflationAdjustment / 100) * 0.5 + (occupancyLift / 100) * 0.4;
    const baseBudgetCap = 520000;

    for (let i = 1; i <= forecastMonths; i++) {
      const futureX = N + i;
      const baseProjected = m * futureX + b;
      const adjustedProjected = Math.round(baseProjected * scenarioMultiplier);
      const upperConf = Math.round(adjustedProjected + (1.28 + i * 0.08) * standardError);
      const lowerConf = Math.round(Math.max(0, adjustedProjected - (1.28 + i * 0.08) * standardError));

      combinedSeries.push({
        month: futureMonthsNames[i - 1] || `Month +${i}`,
        type: "Projected",
        actualSpend: null,
        projectedSpend: adjustedProjected,
        regressionTrendline: Math.round(baseProjected),
        budgetCeiling: baseBudgetCap,
        upperConfidence: upperConf,
        lowerConfidence: lowerConf,
        isOverrun: adjustedProjected > baseBudgetCap
      });
    }

    // Overrun Risk Assessment
    const totalProjectedFuture = combinedSeries
      .filter((s) => s.type === "Projected")
      .reduce((acc, s) => acc + (s.projectedSpend || 0), 0);

    const overrunCount = combinedSeries.filter((s) => s.type === "Projected" && s.isOverrun).length;
    const maxProjected = Math.max(...combinedSeries.filter((s) => s.type === "Projected").map((s) => s.projectedSpend || 0));

    return {
      slope: m,
      intercept: b,
      rSquared: rSquared,
      standardError: standardError,
      chartData: combinedSeries,
      totalProjectedFuture,
      overrunCount,
      maxProjected,
      isHighRisk: overrunCount > 0
    };
  }, [selectedDeptFilter, forecastMonths, inflationAdjustment, occupancyLift]);

  // Export Payload for Excel & PDF
  const getRegressionExportData = () => {
    const headers = [
      "Period",
      "Data Type",
      "Actual Spend (PHP)",
      "Fitted / Projected (PHP)",
      "Budget Ceiling (PHP)",
      "Upper Confidence (PHP)",
      "Variance vs Cap (PHP)",
      "Status"
    ];

    const rows = regressionAnalysis.chartData.map((item) => {
      const val = item.type === "Historical" ? item.actualSpend : item.projectedSpend;
      const variance = (val || 0) - item.budgetCeiling;
      return [
        item.month,
        item.type,
        item.actualSpend !== null ? Number(item.actualSpend) : "-",
        Number(item.type === "Historical" ? item.regressionTrendline : item.projectedSpend),
        Number(item.budgetCeiling),
        Number(item.upperConfidence),
        variance,
        item.isOverrun ? "OVERRUN RISK" : "WITHIN LIMIT"
      ];
    });

    return {
      title: `Budget Linear Regression & Expense Predictive Model`,
      subtitle: `Scope: ${selectedDeptFilter} | Horizon: ${forecastMonths} Months | R²: ${(regressionAnalysis.rSquared * 100).toFixed(1)}%`,
      filename: `Budget_Linear_Regression_${selectedDeptFilter.replace(/\s+/g, "_")}`,
      sheetName: "Regression Forecast",
      headers,
      rows,
      summary: [
        { label: "Regression Slope (m - Monthly Growth)", value: regressionAnalysis.slope },
        { label: "Base Overhead Intercept (b)", value: regressionAnalysis.intercept },
        { label: "Statistical Accuracy (R² Score)", value: `${(regressionAnalysis.rSquared * 100).toFixed(2)}%` },
        { label: "Total Projected Spend (Future Horizon)", value: regressionAnalysis.totalProjectedFuture },
        { label: "Forecasted Overrun Periods", value: `${regressionAnalysis.overrunCount} of ${forecastMonths} Months` }
      ],
      companyName: "HORECA HOSPITALITY & ASSET ENTERPRISE",
      generatedBy: "FP&A Budget Intelligence Core"
    };
  };

  return (
    <div className="space-y-6">
      {/* Module Sub-Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-[#DFE1DB] shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold font-['IBM_Plex_Mono'] uppercase bg-[#FF6A3D]/10 text-[#FF6A3D] px-2 py-0.5 rounded border border-[#FF6A3D]/20">
              OLS Model: Y = mx + b
            </span>
            <span className="text-xs text-[#5C636F] font-['IBM_Plex_Mono']">
              R² Fit: <strong className="text-[#157A4D]">{(regressionAnalysis.rSquared * 100).toFixed(1)}%</strong>
            </span>
          </div>
          <h3 className="text-lg font-bold font-['Archivo'] text-[#1A1D21] mt-1">
            Linear Regression Expense Forecast &amp; Overrun Intelligence
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Department Filter */}
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="border border-[#DFE1DB] rounded-lg px-3 py-1.5 text-xs font-bold font-['IBM_Plex_Mono'] bg-[#F8F9F6] text-[#1A1D21] focus:outline-none focus:border-[#1A1D21]"
          >
            <option value="Total Spend">All Departments (Consolidated Spend)</option>
            <option value="Rooms Division">Rooms Division</option>
            <option value="Food & Beverage">Food &amp; Beverage</option>
            <option value="Utilities & Maintenance">Utilities &amp; Maintenance</option>
            <option value="Admin & General">Admin &amp; General</option>
            <option value="Sales & Marketing">Sales &amp; Marketing</option>
          </select>

          {/* Export to Excel & PDF Button */}
          <ExportButton
            getExportData={getRegressionExportData}
            buttonLabel="Export Forecast"
          />
        </div>
      </div>

      {/* Regression KPI Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Model Formula */}
        <div className="bg-[#1A1D21] text-white p-4 rounded-xl border border-[#2A2E34] space-y-2 shadow-xs">
          <div className="flex justify-between items-center text-xs font-['IBM_Plex_Mono'] text-[#A8AFB8]">
            <span>REGRESSION FORMULA</span>
            <Activity className="h-4 w-4 text-[#FF6A3D]" />
          </div>
          <div className="text-base font-bold font-['IBM_Plex_Mono'] text-[#FF6A3D] truncate">
            Y = {regressionAnalysis.slope.toFixed(2)}x + {formatPHP(regressionAnalysis.intercept)}
          </div>
          <p className="text-[11px] text-[#A8AFB8]">
            Monthly Burn Slope: <strong className="text-white">+{formatPHP(regressionAnalysis.slope)}/mo</strong>
          </p>
        </div>

        {/* Goodness of Fit R² */}
        <div className="bg-white p-4 rounded-xl border border-[#DFE1DB] space-y-2 shadow-xs">
          <div className="flex justify-between items-center text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
            <span>MODEL ACCURACY (R²)</span>
            <Sparkles className="h-4 w-4 text-[#157A4D]" />
          </div>
          <div className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#157A4D]">
            {(regressionAnalysis.rSquared * 100).toFixed(2)}%
          </div>
          <p className="text-[11px] text-[#5C636F]">
            {regressionAnalysis.rSquared > 0.85 ? "High Predictive Correlation" : "Moderate Predictive Fit"}
          </p>
        </div>

        {/* Forecasted Horizon Spend */}
        <div className="bg-white p-4 rounded-xl border border-[#DFE1DB] space-y-2 shadow-xs">
          <div className="flex justify-between items-center text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
            <span>{forecastMonths}-MO PROJECTED TOTAL</span>
            <TrendingUp className="h-4 w-4 text-[#2A6CB0]" />
          </div>
          <div className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#2A6CB0]">
            {formatPHP(regressionAnalysis.totalProjectedFuture)}
          </div>
          <p className="text-[11px] text-[#5C636F]">
            Peak Period: <strong className="text-[#1A1D21]">{formatPHP(regressionAnalysis.maxProjected)}</strong>
          </p>
        </div>

        {/* Budget Overrun Risk Warning */}
        <div className={`p-4 rounded-xl border space-y-2 shadow-xs ${
          regressionAnalysis.isHighRisk
            ? "bg-[#FFF5F5] border-[#FED7D7] text-[#B5281A]"
            : "bg-[#F0FFF4] border-[#C6F6D5] text-[#157A4D]"
        }`}>
          <div className="flex justify-between items-center text-xs font-['IBM_Plex_Mono']">
            <span className="font-bold">OVERRUN RISK STATUS</span>
            {regressionAnalysis.isHighRisk ? (
              <AlertTriangle className="h-4 w-4 text-[#B5281A] animate-pulse" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-[#157A4D]" />
            )}
          </div>
          <div className="text-xl font-bold font-['IBM_Plex_Mono']">
            {regressionAnalysis.isHighRisk
              ? `${regressionAnalysis.overrunCount} Months Breached`
              : "Within Budget Limits"}
          </div>
          <p className="text-[11px]">
            {regressionAnalysis.isHighRisk
              ? "Trajectory exceeds allocated departmental threshold."
              : "All future periods projected under baseline cap."}
          </p>
        </div>
      </div>

      {/* Main Chart + Simulation Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Interactive Linear Regression Recharts Visualizer */}
        <div className="lg:col-span-3 bg-white p-5 rounded-xl border border-[#DFE1DB] shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-[#DFE1DB] pb-3">
            <div>
              <h4 className="font-bold text-sm font-['Archivo'] text-[#1A1D21]">
                Expenditure Trajectory &amp; Linear Fit vs. Budget Ceiling
              </h4>
              <p className="text-xs text-[#5C636F]">
                Historical 6-month actuals combined with OLS predictive projection line and 90% confidence bands
              </p>
            </div>
            <div className="flex items-center space-x-3 text-xs font-['IBM_Plex_Mono']">
              <span className="flex items-center space-x-1">
                <span className="h-2.5 w-2.5 rounded-full bg-[#1A1D21]" />
                <span className="text-[#5C636F]">Actuals</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="h-2.5 w-2.5 rounded bg-[#FF6A3D]" />
                <span className="text-[#5C636F]">OLS Fit (Y=mx+b)</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="h-2.5 w-2.5 rounded bg-[#B5281A]" />
                <span className="text-[#5C636F]">Budget Cap</span>
              </span>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={regressionAnalysis.chartData}
                margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#DFE1DB" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#5C636F"
                  fontSize={11}
                  fontFamily="IBM Plex Mono"
                  tickLine={false}
                />
                <YAxis
                  stroke="#5C636F"
                  fontSize={10}
                  fontFamily="IBM Plex Mono"
                  tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#1A1D21] text-white p-3 rounded-lg border border-[#2A2E34] text-xs font-['IBM_Plex_Mono'] shadow-2xl space-y-1.5">
                          <div className="font-bold border-b border-[#2A2E34] pb-1 text-[#FF6A3D]">
                            {label} ({data.type})
                          </div>
                          {data.actualSpend !== null && (
                            <div className="flex justify-between gap-4">
                              <span className="text-[#A8AFB8]">Actual Spend:</span>
                              <span className="font-bold text-white">{formatPHP(data.actualSpend)}</span>
                            </div>
                          )}
                          {data.projectedSpend && (
                            <div className="flex justify-between gap-4">
                              <span className="text-[#FF6A3D]">Projected OLS Spend:</span>
                              <span className="font-bold text-[#FF6A3D]">{formatPHP(data.projectedSpend)}</span>
                            </div>
                          )}
                          <div className="flex justify-between gap-4">
                            <span className="text-[#A8AFB8]">Trendline (Y=mx+b):</span>
                            <span className="text-[#35C98B]">{formatPHP(data.regressionTrendline)}</span>
                          </div>
                          <div className="flex justify-between gap-4 border-t border-[#2A2E34] pt-1">
                            <span className="text-[#A8AFB8]">Budget Ceiling:</span>
                            <span className="text-[#B5281A]">{formatPHP(data.budgetCeiling)}</span>
                          </div>
                          {data.isOverrun && (
                            <div className="text-[10px] text-[#FF4D4F] font-bold mt-1 bg-red-950/60 px-1.5 py-0.5 rounded">
                              ⚠ OVERRUN RISK: +{formatPHP(data.projectedSpend - data.budgetCeiling)}
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", fontFamily: "IBM Plex Mono", paddingTop: "8px" }}
                />

                {/* Confidence Interval Area */}
                <Area
                  type="monotone"
                  dataKey="upperConfidence"
                  stroke="none"
                  fill="#FF6A3D"
                  fillOpacity={0.12}
                  name="90% Confidence Interval"
                />

                {/* Budget Limit Reference Line */}
                <Line
                  type="stepAfter"
                  dataKey="budgetCeiling"
                  stroke="#B5281A"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Budget Ceiling Threshold"
                />

                {/* Actual Historical Spend Bars */}
                <Bar
                  dataKey="actualSpend"
                  fill="#1A1D21"
                  radius={[4, 4, 0, 0]}
                  name="Actual Historical Spend"
                  barSize={24}
                />

                {/* Projected Future Spend Bars */}
                <Bar
                  dataKey="projectedSpend"
                  fill="#FF6A3D"
                  radius={[4, 4, 0, 0]}
                  name="Projected Scenario Spend"
                  barSize={24}
                />

                {/* Linear Regression Trendline */}
                <Line
                  type="linear"
                  dataKey="regressionTrendline"
                  stroke="#35C98B"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#35C98B" }}
                  name="Linear Trendline (Fitted)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic Parameter Tuning & Sensitivity Panel */}
        <div className="bg-white p-5 rounded-xl border border-[#DFE1DB] shadow-xs space-y-4 text-xs font-['IBM_Plex_Sans']">
          <div className="flex items-center space-x-2 border-b border-[#DFE1DB] pb-3">
            <Sliders className="h-4 w-4 text-[#1A1D21]" />
            <h4 className="font-bold font-['Archivo'] text-sm text-[#1A1D21]">Scenario Tuner</h4>
          </div>

          {/* Forecast Horizon Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold font-['IBM_Plex_Mono'] text-[#5C636F] uppercase">
              Forecast Horizon
            </label>
            <div className="grid grid-cols-3 gap-1.5 font-['IBM_Plex_Mono']">
              {[3, 6, 12].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setForecastMonths(m)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                    forecastMonths === m
                      ? "bg-[#1A1D21] text-white border-[#1A1D21]"
                      : "bg-[#F8F9F6] text-[#5C636F] border-[#DFE1DB] hover:bg-[#F1F1ED]"
                  }`}
                >
                  {m} Mo
                </button>
              ))}
            </div>
          </div>

          {/* Inflation Rate Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-['IBM_Plex_Mono']">
              <span className="font-bold text-[#5C636F]">Inflation Factor:</span>
              <span className="font-bold text-[#B53A1E]">+{inflationAdjustment}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={inflationAdjustment}
              onChange={(e) => setInflationAdjustment(Number(e.target.value))}
              className="w-full accent-[#B53A1E] cursor-pointer"
            />
            <p className="text-[10px] text-[#5C636F]">Adjusts supplier cost escalation rate.</p>
          </div>

          {/* Occupancy Growth Factor */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-['IBM_Plex_Mono']">
              <span className="font-bold text-[#5C636F]">Occupancy Volume:</span>
              <span className="font-bold text-[#157A4D]">+{occupancyLift}%</span>
            </div>
            <input
              type="range"
              min="-10"
              max="25"
              step="1"
              value={occupancyLift}
              onChange={(e) => setOccupancyLift(Number(e.target.value))}
              className="w-full accent-[#157A4D] cursor-pointer"
            />
            <p className="text-[10px] text-[#5C636F]">Scales variable hotel guest &amp; dining load.</p>
          </div>

          {/* Quick Mathematical Summary */}
          <div className="bg-[#F8F9F6] border border-[#DFE1DB] p-3 rounded-lg space-y-1.5 text-[11px] font-['IBM_Plex_Mono']">
            <span className="font-bold text-[#1A1D21] block">Statistical Properties:</span>
            <div className="flex justify-between text-[#5C636F]">
              <span>Sample Points (N):</span>
              <span className="font-bold text-[#1A1D21]">6 Months</span>
            </div>
            <div className="flex justify-between text-[#5C636F]">
              <span>Standard Error (Se):</span>
              <span className="font-bold text-[#1A1D21]">{formatPHP(regressionAnalysis.standardError)}</span>
            </div>
            <div className="flex justify-between text-[#5C636F]">
              <span>Mean Historical Spend:</span>
              <span className="font-bold text-[#1A1D21]">{formatPHP(463667)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
