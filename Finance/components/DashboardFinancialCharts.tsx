import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Layers,
  BarChart3,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Sparkles
} from "lucide-react";
import PesoSign from "./PesoSign";

type TimeHorizon = "daily" | "weekly" | "monthly" | "annual";

interface FinancialDataPoint {
  period: string;
  label: string;
  income: number;
  expenses: number;
  netProfit: number;
  hotelRevenue: number;
  restaurantRevenue: number;
  corporateAR: number;
  payrollExpense: number;
  supplierExpense: number;
  utilitiesExpense: number;
}

interface DashboardFinancialChartsProps {
  maskCurrency: (val: number) => string;
  isDataMasked?: boolean;
}

export default function DashboardFinancialCharts({
  maskCurrency,
  isDataMasked = false
}: DashboardFinancialChartsProps) {
  const [horizon, setHorizon] = useState<TimeHorizon>("monthly");
  const [chartType, setChartType] = useState<"bar" | "area" | "line">("bar");

  // Dynamic Multi-Horizon Datasets (Daily, Weekly, Monthly, Annual)
  const dailyData: FinancialDataPoint[] = useMemo(
    () => [
      { period: "Mon (Sep 08)", label: "Mon", income: 142000, expenses: 88500, netProfit: 53500, hotelRevenue: 85000, restaurantRevenue: 42000, corporateAR: 15000, payrollExpense: 35000, supplierExpense: 41500, utilitiesExpense: 12000 },
      { period: "Tue (Sep 09)", label: "Tue", income: 168500, expenses: 94200, netProfit: 74300, hotelRevenue: 98000, restaurantRevenue: 51500, corporateAR: 19000, payrollExpense: 35000, supplierExpense: 46200, utilitiesExpense: 13000 },
      { period: "Wed (Sep 10)", label: "Wed", income: 155000, expenses: 89000, netProfit: 66000, hotelRevenue: 91000, restaurantRevenue: 48000, corporateAR: 16000, payrollExpense: 35000, supplierExpense: 42000, utilitiesExpense: 12000 },
      { period: "Thu (Sep 11)", label: "Thu", income: 189000, expenses: 102000, netProfit: 87000, hotelRevenue: 112000, restaurantRevenue: 58000, corporateAR: 19000, payrollExpense: 36000, supplierExpense: 52000, utilitiesExpense: 14000 },
      { period: "Fri (Sep 12)", label: "Fri", income: 245000, expenses: 128000, netProfit: 117000, hotelRevenue: 148000, restaurantRevenue: 75000, corporateAR: 22000, payrollExpense: 42000, supplierExpense: 68000, utilitiesExpense: 18000 },
      { period: "Sat (Sep 13)", label: "Sat", income: 298000, expenses: 145000, netProfit: 153000, hotelRevenue: 182000, restaurantRevenue: 92000, corporateAR: 24000, payrollExpense: 45000, supplierExpense: 79000, utilitiesExpense: 21000 },
      { period: "Sun (Sep 14)", label: "Sun", income: 262000, expenses: 121000, netProfit: 141000, hotelRevenue: 156000, restaurantRevenue: 86000, corporateAR: 20000, payrollExpense: 41000, supplierExpense: 62000, utilitiesExpense: 18000 }
    ],
    []
  );

  const weeklyData: FinancialDataPoint[] = useMemo(
    () => [
      { period: "Week 33 (Aug 11-17)", label: "W33", income: 1180000, expenses: 742000, netProfit: 438000, hotelRevenue: 720000, restaurantRevenue: 340000, corporateAR: 120000, payrollExpense: 280000, supplierExpense: 362000, utilitiesExpense: 100000 },
      { period: "Week 34 (Aug 18-24)", label: "W34", income: 1320000, expenses: 810000, netProfit: 510000, hotelRevenue: 810000, restaurantRevenue: 380000, corporateAR: 130000, payrollExpense: 295000, supplierExpense: 405000, utilitiesExpense: 110000 },
      { period: "Week 35 (Aug 25-31)", label: "W35", income: 1459500, expenses: 767700, netProfit: 691800, hotelRevenue: 890000, restaurantRevenue: 419500, corporateAR: 150000, payrollExpense: 285000, supplierExpense: 372700, utilitiesExpense: 110000 },
      { period: "Week 36 (Sep 01-07)", label: "W36", income: 1390000, expenses: 795000, netProfit: 595000, hotelRevenue: 845000, restaurantRevenue: 395000, corporateAR: 150000, payrollExpense: 290000, supplierExpense: 395000, utilitiesExpense: 110000 },
      { period: "Week 37 (Sep 08-14)", label: "W37", income: 1460500, expenses: 818700, netProfit: 641800, hotelRevenue: 892000, restaurantRevenue: 418500, corporateAR: 150000, payrollExpense: 300000, supplierExpense: 403700, utilitiesExpense: 115000 },
      { period: "Week 38 (Current)", label: "W38 (Est)", income: 1520000, expenses: 840000, netProfit: 680000, hotelRevenue: 930000, restaurantRevenue: 430000, corporateAR: 160000, payrollExpense: 305000, supplierExpense: 415000, utilitiesExpense: 120000 }
    ],
    []
  );

  const monthlyData: FinancialDataPoint[] = useMemo(
    () => [
      { period: "Jan 2026", label: "Jan", income: 4850000, expenses: 3120000, netProfit: 1730000, hotelRevenue: 2950000, restaurantRevenue: 1420000, corporateAR: 480000, payrollExpense: 1200000, supplierExpense: 1480000, utilitiesExpense: 440000 },
      { period: "Feb 2026", label: "Feb", income: 5120000, expenses: 3250000, netProfit: 1870000, hotelRevenue: 3100000, restaurantRevenue: 1520000, corporateAR: 500000, payrollExpense: 1220000, supplierExpense: 1560000, utilitiesExpense: 470000 },
      { period: "Mar 2026", label: "Mar", income: 5480000, expenses: 3410000, netProfit: 2070000, hotelRevenue: 3340000, restaurantRevenue: 1610000, corporateAR: 530000, payrollExpense: 1250000, supplierExpense: 1670000, utilitiesExpense: 490000 },
      { period: "Apr 2026", label: "Apr", income: 6150000, expenses: 3720000, netProfit: 2430000, hotelRevenue: 3820000, restaurantRevenue: 1780000, corporateAR: 550000, payrollExpense: 1300000, supplierExpense: 1880000, utilitiesExpense: 540000 },
      { period: "May 2026", label: "May", income: 5890000, expenses: 3600000, netProfit: 2290000, hotelRevenue: 3610000, restaurantRevenue: 1710000, corporateAR: 570000, payrollExpense: 1280000, supplierExpense: 1790000, utilitiesExpense: 530000 },
      { period: "Jun 2026", label: "Jun", income: 5320000, expenses: 3340000, netProfit: 1980000, hotelRevenue: 3240000, restaurantRevenue: 1560000, corporateAR: 520000, payrollExpense: 1240000, supplierExpense: 1620000, utilitiesExpense: 480000 },
      { period: "Jul 2026", label: "Jul", income: 5640000, expenses: 3480000, netProfit: 2160000, hotelRevenue: 3450000, restaurantRevenue: 1640000, corporateAR: 550000, payrollExpense: 1260000, supplierExpense: 1710000, utilitiesExpense: 510000 },
      { period: "Aug 2026", label: "Aug", income: 6280000, expenses: 3820000, netProfit: 2460000, hotelRevenue: 3900000, restaurantRevenue: 1810000, corporateAR: 570000, payrollExpense: 1320000, supplierExpense: 1930000, utilitiesExpense: 570000 },
      { period: "Sep 2026 (Est)", label: "Sep", income: 6450000, expenses: 3910000, netProfit: 2540000, hotelRevenue: 4010000, restaurantRevenue: 1850000, corporateAR: 590000, payrollExpense: 1350000, supplierExpense: 1970000, utilitiesExpense: 590000 },
      { period: "Oct 2026 (Proj)", label: "Oct", income: 6720000, expenses: 4050000, netProfit: 2670000, hotelRevenue: 4200000, restaurantRevenue: 1910000, corporateAR: 610000, payrollExpense: 1380000, supplierExpense: 2050000, utilitiesExpense: 620000 },
      { period: "Nov 2026 (Proj)", label: "Nov", income: 7100000, expenses: 4280000, netProfit: 2820000, hotelRevenue: 4450000, restaurantRevenue: 2010000, corporateAR: 640000, payrollExpense: 1420000, supplierExpense: 2190000, utilitiesExpense: 670000 },
      { period: "Dec 2026 (Proj)", label: "Dec", income: 8450000, expenses: 4980000, netProfit: 3470000, hotelRevenue: 5350000, restaurantRevenue: 2380000, corporateAR: 720000, payrollExpense: 1650000, supplierExpense: 2550000, utilitiesExpense: 780000 }
    ],
    []
  );

  const annualData: FinancialDataPoint[] = useMemo(
    () => [
      { period: "FY 2023 Actual", label: "2023", income: 52400000, expenses: 36800000, netProfit: 15600000, hotelRevenue: 32800000, restaurantRevenue: 15200000, corporateAR: 4400000, payrollExpense: 13500000, supplierExpense: 18100000, utilitiesExpense: 5200000 },
      { period: "FY 2024 Actual", label: "2024", income: 61800000, expenses: 41200000, netProfit: 20600000, hotelRevenue: 38900000, restaurantRevenue: 17600000, corporateAR: 5300000, payrollExpense: 14800000, supplierExpense: 20600000, utilitiesExpense: 5800000 },
      { period: "FY 2025 Actual", label: "2025", income: 69500000, expenses: 44800000, netProfit: 24700000, hotelRevenue: 43800000, restaurantRevenue: 19800000, corporateAR: 5900000, payrollExpense: 15900000, supplierExpense: 22700000, utilitiesExpense: 6200000 },
      { period: "FY 2026 Target", label: "2026 (Current)", income: 78470000, expenses: 48960000, netProfit: 29510000, hotelRevenue: 49490000, restaurantRevenue: 22240000, corporateAR: 6740000, payrollExpense: 17200000, supplierExpense: 24900000, utilitiesExpense: 6860000 },
      { period: "FY 2027 Proj", label: "2027 (Proj)", income: 87500000, expenses: 53800000, netProfit: 33700000, hotelRevenue: 55100000, restaurantRevenue: 24900000, corporateAR: 7500000, payrollExpense: 18800000, supplierExpense: 27400000, utilitiesExpense: 7600000 }
    ],
    []
  );

  const activeDataset = useMemo(() => {
    switch (horizon) {
      case "daily":
        return dailyData;
      case "weekly":
        return weeklyData;
      case "monthly":
        return monthlyData;
      case "annual":
        return annualData;
    }
  }, [horizon, dailyData, weeklyData, monthlyData, annualData]);

  const summary = useMemo(() => {
    const totalIncome = activeDataset.reduce((sum, d) => sum + d.income, 0);
    const totalExpenses = activeDataset.reduce((sum, d) => sum + d.expenses, 0);
    const totalNetProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (totalNetProfit / totalIncome) * 100 : 0;
    const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

    return {
      totalIncome,
      totalExpenses,
      totalNetProfit,
      profitMargin,
      expenseRatio
    };
  }, [activeDataset]);

  return (
    <div className="bg-white border border-[#DFE1DB] p-5 rounded-xl space-y-5 shadow-xs">
      {/* Header with Time Horizon and Chart Type Selectors */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#DFE1DB] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold font-['IBM_Plex_Mono'] uppercase text-[#5C636F]">
              FINANCIAL PERFORMANCE CORE
            </span>
            <span className="bg-[#157A4D]/10 text-[#157A4D] px-2 py-0.5 rounded text-[10px] font-['IBM_Plex_Mono'] font-bold border border-[#157A4D]/20">
              AUDITED CASH FLOW
            </span>
          </div>
          <h3 className="text-lg font-bold font-['Archivo'] text-[#1A1D21] mt-1 flex items-center gap-2">
            <span>Income &amp; Expense Analytical Charts</span>
            <span className="text-xs font-normal text-[#5C636F] font-['IBM_Plex_Mono']">
              ({horizon.toUpperCase()})
            </span>
          </h3>
          <p className="text-xs text-[#5C636F]">
            Track revenue streams against operational disbursements across Daily, Weekly, Monthly, and Annual intervals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Time Horizon Pills */}
          <div className="flex bg-[#F1F1ED] p-1 rounded-lg border border-[#DFE1DB] text-xs font-['IBM_Plex_Mono']">
            {(["daily", "weekly", "monthly", "annual"] as TimeHorizon[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setHorizon(tab)}
                className={`px-3 py-1.5 rounded-md font-bold uppercase text-[11px] transition-all cursor-pointer ${
                  horizon === tab
                    ? "bg-[#1A1D21] text-white shadow-xs"
                    : "text-[#5C636F] hover:text-[#1A1D21]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Chart Style Toggle */}
          <div className="flex bg-[#F1F1ED] p-1 rounded-lg border border-[#DFE1DB] text-xs font-['IBM_Plex_Mono']">
            <button
              type="button"
              onClick={() => setChartType("bar")}
              className={`px-2.5 py-1.5 rounded-md font-bold text-[11px] cursor-pointer transition-all ${
                chartType === "bar"
                  ? "bg-white text-[#1A1D21] shadow-xs border border-[#DFE1DB]"
                  : "text-[#5C636F] hover:text-[#1A1D21]"
              }`}
              title="Comparison Bars"
            >
              Bars
            </button>
            <button
              type="button"
              onClick={() => setChartType("area")}
              className={`px-2.5 py-1.5 rounded-md font-bold text-[11px] cursor-pointer transition-all ${
                chartType === "area"
                  ? "bg-white text-[#1A1D21] shadow-xs border border-[#DFE1DB]"
                  : "text-[#5C636F] hover:text-[#1A1D21]"
              }`}
              title="Area Flow"
            >
              Area
            </button>
            <button
              type="button"
              onClick={() => setChartType("line")}
              className={`px-2.5 py-1.5 rounded-md font-bold text-[11px] cursor-pointer transition-all ${
                chartType === "line"
                  ? "bg-white text-[#1A1D21] shadow-xs border border-[#DFE1DB]"
                  : "text-[#5C636F] hover:text-[#1A1D21]"
              }`}
              title="Trend Lines"
            >
              Lines
            </button>
          </div>
        </div>
      </div>

      {/* Metric Callouts for Current Horizon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-[#F8F9F6] rounded-xl border border-[#DFE1DB]">
          <div className="flex items-center justify-between text-[#5C636F] text-[11px] font-['IBM_Plex_Mono']">
            <span>PERIOD INCOME</span>
            <TrendingUp className="h-3.5 w-3.5 text-[#157A4D]" />
          </div>
          <p className="text-lg font-bold font-['IBM_Plex_Mono'] text-[#157A4D] mt-1">
            {maskCurrency(summary.totalIncome)}
          </p>
          <span className="text-[10px] text-[#5C636F] block mt-0.5">
            Hotels, Restaurants &amp; AR Inflows
          </span>
        </div>

        <div className="p-3 bg-[#F8F9F6] rounded-xl border border-[#DFE1DB]">
          <div className="flex items-center justify-between text-[#5C636F] text-[11px] font-['IBM_Plex_Mono']">
            <span>PERIOD EXPENSES</span>
            <TrendingDown className="h-3.5 w-3.5 text-[#B5281A]" />
          </div>
          <p className="text-lg font-bold font-['IBM_Plex_Mono'] text-[#B5281A] mt-1">
            {maskCurrency(summary.totalExpenses)}
          </p>
          <span className="text-[10px] text-[#5C636F] block mt-0.5">
            Trade AP, Payroll &amp; Utilities
          </span>
        </div>

        <div className="p-3 bg-[#F8F9F6] rounded-xl border border-[#DFE1DB]">
          <div className="flex items-center justify-between text-[#5C636F] text-[11px] font-['IBM_Plex_Mono']">
            <span>NET OPERATING PROFIT</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-[#157A4D]" />
          </div>
          <p className="text-lg font-bold font-['IBM_Plex_Mono'] text-[#1A1D21] mt-1">
            {maskCurrency(summary.totalNetProfit)}
          </p>
          <span className="text-[10px] text-[#157A4D] font-bold block mt-0.5">
            Net Margin: {summary.profitMargin.toFixed(1)}%
          </span>
        </div>

        <div className="p-3 bg-[#F8F9F6] rounded-xl border border-[#DFE1DB]">
          <div className="flex items-center justify-between text-[#5C636F] text-[11px] font-['IBM_Plex_Mono']">
            <span>EXPENSE EFFICIENCY</span>
            <Percent className="h-3.5 w-3.5 text-[#FF6A3D]" />
          </div>
          <p className="text-lg font-bold font-['IBM_Plex_Mono'] text-[#FF6A3D] mt-1">
            {summary.expenseRatio.toFixed(1)}%
          </p>
          <span className="text-[10px] text-[#5C636F] block mt-0.5">
            {summary.expenseRatio < 65 ? "Optimal Operating Leverage" : "Active Cost Containment"}
          </span>
        </div>
      </div>

      {/* Main Chart Graphic */}
      <div className="w-full h-80 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "bar" ? (
            <BarChart data={activeDataset} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="label" stroke="#5C636F" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#5C636F"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => (v >= 1000000 ? `₱${(v / 1000000).toFixed(1)}M` : `₱${(v / 1000).toFixed(0)}k`)}
              />
              <Tooltip
                formatter={(val: any, name: any) => [
                  isDataMasked ? "₱ ••••••••" : `₱${Number(val).toLocaleString()}`,
                  name === "income" ? "Total Income" : name === "expenses" ? "Total Expenses" : "Net Operating Profit"
                ]}
                labelFormatter={(label, items) => {
                  const item = items?.[0]?.payload;
                  return item ? item.period : label;
                }}
                contentStyle={{
                  backgroundColor: "#1A1D21",
                  border: "1px solid #2A2E34",
                  borderRadius: "8px",
                  color: "#FFFFFF",
                  fontSize: "12px",
                  fontFamily: "IBM Plex Mono"
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ fontSize: "11px", paddingBottom: "10px", fontFamily: "IBM Plex Mono" }}
              />
              <Bar dataKey="income" name="Income" fill="#157A4D" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="expenses" name="Expenses" fill="#B5281A" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="netProfit" name="Net Profit" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          ) : chartType === "area" ? (
            <AreaChart data={activeDataset} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <defs>
                <linearGradient id="incomeAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#157A4D" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#157A4D" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="expenseAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#B5281A" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#B5281A" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="profitAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="label" stroke="#5C636F" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#5C636F"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => (v >= 1000000 ? `₱${(v / 1000000).toFixed(1)}M` : `₱${(v / 1000).toFixed(0)}k`)}
              />
              <Tooltip
                formatter={(val: any, name: any) => [
                  isDataMasked ? "₱ ••••••••" : `₱${Number(val).toLocaleString()}`,
                  name === "income" ? "Total Income" : name === "expenses" ? "Total Expenses" : "Net Operating Profit"
                ]}
                labelFormatter={(label, items) => {
                  const item = items?.[0]?.payload;
                  return item ? item.period : label;
                }}
                contentStyle={{
                  backgroundColor: "#1A1D21",
                  border: "1px solid #2A2E34",
                  borderRadius: "8px",
                  color: "#FFFFFF",
                  fontSize: "12px",
                  fontFamily: "IBM Plex Mono"
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ fontSize: "11px", paddingBottom: "10px", fontFamily: "IBM Plex Mono" }}
              />
              <Area
                type="monotone"
                dataKey="income"
                name="Income"
                stroke="#157A4D"
                strokeWidth={2.5}
                fill="url(#incomeAreaGrad)"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke="#B5281A"
                strokeWidth={2.5}
                fill="url(#expenseAreaGrad)"
              />
              <Area
                type="monotone"
                dataKey="netProfit"
                name="Net Profit"
                stroke="#2563EB"
                strokeWidth={2}
                fill="url(#profitAreaGrad)"
              />
            </AreaChart>
          ) : (
            <LineChart data={activeDataset} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="label" stroke="#5C636F" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#5C636F"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => (v >= 1000000 ? `₱${(v / 1000000).toFixed(1)}M` : `₱${(v / 1000).toFixed(0)}k`)}
              />
              <Tooltip
                formatter={(val: any, name: any) => [
                  isDataMasked ? "₱ ••••••••" : `₱${Number(val).toLocaleString()}`,
                  name === "income" ? "Total Income" : name === "expenses" ? "Total Expenses" : "Net Operating Profit"
                ]}
                labelFormatter={(label, items) => {
                  const item = items?.[0]?.payload;
                  return item ? item.period : label;
                }}
                contentStyle={{
                  backgroundColor: "#1A1D21",
                  border: "1px solid #2A2E34",
                  borderRadius: "8px",
                  color: "#FFFFFF",
                  fontSize: "12px",
                  fontFamily: "IBM Plex Mono"
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ fontSize: "11px", paddingBottom: "10px", fontFamily: "IBM Plex Mono" }}
              />
              <Line
                type="monotone"
                dataKey="income"
                name="Income"
                stroke="#157A4D"
                strokeWidth={3}
                dot={{ r: 4, fill: "#157A4D" }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke="#B5281A"
                strokeWidth={3}
                dot={{ r: 4, fill: "#B5281A" }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="netProfit"
                name="Net Profit"
                stroke="#2563EB"
                strokeWidth={2.5}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: "#2563EB" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Scannable Data Summary Table for the Active Horizon */}
      <div className="overflow-x-auto border-t border-[#DFE1DB] pt-3">
        <table className="w-full text-left text-xs font-['IBM_Plex_Sans']">
          <thead className="bg-[#F1F1ED] font-['IBM_Plex_Mono'] text-[#5C636F] text-[11px]">
            <tr>
              <th className="p-2.5">Time Interval</th>
              <th className="p-2.5 text-right text-[#157A4D]">Total Income</th>
              <th className="p-2.5 text-right text-[#B5281A]">Total Expenses</th>
              <th className="p-2.5 text-right text-[#1A1D21]">Net Profit</th>
              <th className="p-2.5 text-right">Profit Margin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DFE1DB] text-[11px] font-['IBM_Plex_Mono']">
            {activeDataset.map((row, idx) => {
              const margin = row.income > 0 ? (row.netProfit / row.income) * 100 : 0;
              return (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-2.5 font-bold text-[#1A1D21]">{row.period}</td>
                  <td className="p-2.5 text-right font-bold text-[#157A4D]">
                    {maskCurrency(row.income)}
                  </td>
                  <td className="p-2.5 text-right font-bold text-[#B5281A]">
                    {maskCurrency(row.expenses)}
                  </td>
                  <td className="p-2.5 text-right font-bold text-[#1A1D21]">
                    {maskCurrency(row.netProfit)}
                  </td>
                  <td className="p-2.5 text-right">
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        margin >= 30
                          ? "bg-[#157A4D]/10 text-[#157A4D]"
                          : margin >= 15
                          ? "bg-blue-50 text-blue-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {margin.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
