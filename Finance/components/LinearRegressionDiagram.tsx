import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  Activity,
  Sliders,
  Sparkles,
  Calendar,
  Layers,
  ArrowUpRight,
  Info,
  Maximize2,
  RefreshCw,
  Zap
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Area
} from "recharts";

// Historical 14-day recorded daily actuals for Hotel PMS & Restaurant POS combined
const BASE_HISTORICAL_DAYS = [
  { day: 1, date: "Aug 05", roomRev: 88000, fbRev: 41000, otherRev: 6200, actualTotal: 135200 },
  { day: 2, date: "Aug 06", roomRev: 92400, fbRev: 43500, otherRev: 6800, actualTotal: 142700 },
  { day: 3, date: "Aug 07", roomRev: 96000, fbRev: 48200, otherRev: 7100, actualTotal: 151300 },
  { day: 4, date: "Aug 08", roomRev: 104000, fbRev: 54000, otherRev: 8500, actualTotal: 166500 },
  { day: 5, date: "Aug 09", roomRev: 118000, fbRev: 68500, otherRev: 9800, actualTotal: 196300 },
  { day: 6, date: "Aug 10", roomRev: 125000, fbRev: 74200, otherRev: 11000, actualTotal: 210200 },
  { day: 7, date: "Aug 11", roomRev: 102000, fbRev: 52000, otherRev: 7500, actualTotal: 161500 },
  { day: 8, date: "Aug 12", roomRev: 98500, fbRev: 46800, otherRev: 7200, actualTotal: 152500 },
  { day: 9, date: "Aug 13", roomRev: 105000, fbRev: 51200, otherRev: 8100, actualTotal: 164300 },
  { day: 10, date: "Aug 14", roomRev: 112000, fbRev: 58900, otherRev: 8900, actualTotal: 179800 },
  { day: 11, date: "Aug 15", roomRev: 121000, fbRev: 69400, otherRev: 10200, actualTotal: 200600 },
  { day: 12, date: "Aug 16", roomRev: 134000, fbRev: 78500, otherRev: 11800, actualTotal: 224300 },
  { day: 13, date: "Aug 17", roomRev: 129000, fbRev: 72000, otherRev: 10500, actualTotal: 211500 },
  { day: 14, date: "Aug 18", roomRev: 120000, fbRev: 70000, otherRev: 9840, actualTotal: 199840 },
];

interface LinearRegressionDiagramProps {
  isDataMasked: boolean;
  maskCurrency: (val: number) => string;
  role: string;
}

export default function LinearRegressionDiagram({
  isDataMasked,
  maskCurrency,
  role,
}: LinearRegressionDiagramProps) {
  // Scenario Simulation Parameters
  const [occupancyGrowth, setOccupancyGrowth] = useState<number>(5); // -20% to +30%
  const [adrAdjustment, setAdrAdjustment] = useState<number>(0); // -15% to +25%
  const [fbDiningLift, setFbDiningLift] = useState<number>(4); // -10% to +20%
  const [forecastHorizon, setForecastHorizon] = useState<number>(7); // 7 or 14 days
  const [showConfidenceBands, setShowConfidenceBands] = useState<boolean>(true);

  // Compute Ordinary Least Squares (OLS) Regression and Projections
  const {
    chartData,
    slope,
    intercept,
    rSquared,
    standardError,
    meanActual,
    projectedEndRevenue,
    growthRatePercent
  } = useMemo(() => {
    // 1. Calculate OLS parameters on base actuals
    const n = BASE_HISTORICAL_DAYS.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;
    let sumY2 = 0;

    BASE_HISTORICAL_DAYS.forEach((pt) => {
      const x = pt.day;
      const y = pt.actualTotal;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
      sumY2 += y * y;
    });

    const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const b = (sumY - m * sumX) / n;
    const yMean = sumY / n;
    const xMean = sumX / n;

    // Residuals & R^2
    let ssRes = 0;
    let ssTot = 0;
    let sumXMinusMeanSq = 0;

    BASE_HISTORICAL_DAYS.forEach((pt) => {
      const yHat = m * pt.day + b;
      ssRes += Math.pow(pt.actualTotal - yHat, 2);
      ssTot += Math.pow(pt.actualTotal - yMean, 2);
      sumXMinusMeanSq += Math.pow(pt.day - xMean, 2);
    });

    const r2 = 1 - ssRes / ssTot;
    const se = Math.sqrt(ssRes / (n - 2));

    // Simulation Multiplier: combines ADR, Occupancy, F&B
    const simMultiplier = 1 + (occupancyGrowth * 0.5 + adrAdjustment * 0.3 + fbDiningLift * 0.2) / 100;

    // Construct unified chart array (Days 1 to 14 actuals + trend, Days 15 to 14+horizon forecast)
    const combinedData = [];

    // Historical Points
    for (let i = 0; i < n; i++) {
      const pt = BASE_HISTORICAL_DAYS[i];
      const trend = Math.round(m * pt.day + b);
      const confMargin = Math.round(1.96 * se * Math.sqrt(1 / n + Math.pow(pt.day - xMean, 2) / sumXMinusMeanSq));

      combinedData.push({
        day: pt.day,
        label: pt.date,
        isForecast: false,
        actualRevenue: pt.actualTotal,
        roomRevenue: pt.roomRev,
        fbRevenue: pt.fbRev,
        trendline: trend,
        upperBound: trend + confMargin,
        lowerBound: Math.max(0, trend - confMargin),
        confidenceRange: [Math.max(0, trend - confMargin), trend + confMargin],
      });
    }

    // Forecast Points
    for (let f = 1; f <= forecastHorizon; f++) {
      const dayNum = n + f;
      // Adjusted trendline incorporating simulated parameters
      const baseTrend = m * dayNum + b;
      const simulatedTrend = Math.round(baseTrend * simMultiplier);
      const confMargin = Math.round(
        1.96 * se * Math.sqrt(1 + 1 / n + Math.pow(dayNum - xMean, 2) / sumXMinusMeanSq) * simMultiplier
      );

      const forecastDate = `Aug ${18 + f}`;

      combinedData.push({
        day: dayNum,
        label: forecastDate,
        isForecast: true,
        actualRevenue: null,
        roomRevenue: null,
        fbRevenue: null,
        trendline: simulatedTrend,
        projectedRevenue: simulatedTrend,
        upperBound: simulatedTrend + confMargin,
        lowerBound: Math.max(0, simulatedTrend - confMargin),
        confidenceRange: [Math.max(0, simulatedTrend - confMargin), simulatedTrend + confMargin],
      });
    }

    const firstTrend = m * 1 + b;
    const finalTrend = (m * (n + forecastHorizon) + b) * simMultiplier;
    const overallGrowth = ((finalTrend - firstTrend) / firstTrend) * 100;

    return {
      chartData: combinedData,
      slope: m,
      intercept: b,
      rSquared: r2,
      standardError: se,
      meanActual: yMean,
      projectedEndRevenue: finalTrend,
      growthRatePercent: overallGrowth,
    };
  }, [occupancyGrowth, adrAdjustment, fbDiningLift, forecastHorizon]);

  return (
    <div className="bg-white border border-[#DFE1DB] rounded-xl p-5 shadow-xs space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#DFE1DB] pb-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="bg-[#B53A1E] text-white p-1.5 rounded-lg">
              <TrendingUp className="h-4 w-4" />
            </span>
            <h3 className="font-bold text-base font-['Archivo'] text-[#1A1D21]">
              Predictive Linear Regression &amp; Revenue Forecasting Engine
            </h3>
            <span className="bg-[#157A4D]/10 text-[#157A4D] font-['IBM_Plex_Mono'] font-bold text-[10px] px-2 py-0.5 rounded border border-[#157A4D]/30">
              OLS Algorithmic Model
            </span>
          </div>
          <p className="text-xs text-[#5C636F] font-['IBM_Plex_Sans']">
            Ordinary Least Squares mathematical regression analyzing multi-stream Hotel PMS &amp; Restaurant POS daily trends.
          </p>
        </div>

        {/* Action Badges / Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowConfidenceBands(!showConfidenceBands)}
            className={`px-3 py-1.5 rounded-lg text-xs font-['IBM_Plex_Mono'] font-bold border transition-colors cursor-pointer flex items-center space-x-1.5 ${
              showConfidenceBands
                ? "bg-[#1A1D21] text-white border-[#1A1D21]"
                : "bg-white text-[#5C636F] border-[#DFE1DB] hover:bg-[#F1F1ED]"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>{showConfidenceBands ? "95% Conf. Bands (ON)" : "Conf. Bands (OFF)"}</span>
          </button>

          <select
            value={forecastHorizon}
            onChange={(e) => setForecastHorizon(Number(e.target.value))}
            className="bg-[#F1F1ED] border border-[#DFE1DB] px-3 py-1.5 rounded-lg text-xs font-['IBM_Plex_Mono'] font-bold text-[#1A1D21] focus:outline-none cursor-pointer"
          >
            <option value={7}>+7-Day Forecast</option>
            <option value={14}>+14-Day Extended Forecast</option>
          </select>
        </div>
      </div>

      {/* Regression Statistical Mathematical KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#F1F1ED] border border-[#DFE1DB] p-3 rounded-lg space-y-1">
          <span className="text-[10px] font-['IBM_Plex_Mono'] font-bold uppercase text-[#5C636F] block">
            REGRESSION EQUATION
          </span>
          <p className="font-['IBM_Plex_Mono'] font-bold text-xs text-[#1A1D21] truncate">
            y = {Math.round(slope).toLocaleString()}x + {Math.round(intercept).toLocaleString()}
          </p>
          <span className="text-[10px] text-[#157A4D] font-bold block">
            +₱{Math.round(slope).toLocaleString()} / Day Velocity
          </span>
        </div>

        <div className="bg-[#F1F1ED] border border-[#DFE1DB] p-3 rounded-lg space-y-1">
          <span className="text-[10px] font-['IBM_Plex_Mono'] font-bold uppercase text-[#5C636F] block">
            FIT COEFFICIENT (R²)
          </span>
          <p className="font-['IBM_Plex_Mono'] font-bold text-base text-[#157A4D]">
            {(rSquared * 100).toFixed(1)}%
          </p>
          <span className="text-[10px] text-[#5C636F] block">
            Strong Predictive Correlation
          </span>
        </div>

        <div className="bg-[#F1F1ED] border border-[#DFE1DB] p-3 rounded-lg space-y-1">
          <span className="text-[10px] font-['IBM_Plex_Mono'] font-bold uppercase text-[#5C636F] block">
            STANDARD ERROR (SE)
          </span>
          <p className="font-['IBM_Plex_Mono'] font-bold text-xs text-[#1A1D21]">
            ± {maskCurrency(standardError)}
          </p>
          <span className="text-[10px] text-[#5C636F] block">
            Residual Dispersion
          </span>
        </div>

        <div className="bg-[#F1F1ED] border border-[#DFE1DB] p-3 rounded-lg space-y-1">
          <span className="text-[10px] font-['IBM_Plex_Mono'] font-bold uppercase text-[#5C636F] block">
            PROJECTED HORIZON TARGET
          </span>
          <p className="font-['IBM_Plex_Mono'] font-bold text-base text-[#B53A1E]">
            {maskCurrency(projectedEndRevenue)}
          </p>
          <span className="text-[10px] text-[#157A4D] font-bold flex items-center">
            <ArrowUpRight className="h-3 w-3 mr-0.5" />
            +{growthRatePercent.toFixed(1)}% Projected Growth
          </span>
        </div>
      </div>

      {/* Main Diagram Area */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#5C636F", fontFamily: "IBM Plex Mono" }}
              tickLine={false}
              axisLine={{ stroke: "#DFE1DB" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#5C636F", fontFamily: "IBM Plex Mono" }}
              tickFormatter={(v) => (isDataMasked ? "₱••k" : `₱${(v / 1000).toFixed(0)}k`)}
              tickLine={false}
              axisLine={{ stroke: "#DFE1DB" }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-[#1A1D21] text-white p-3 rounded-lg shadow-xl text-xs font-['IBM_Plex_Mono'] space-y-1.5 border border-[#2A2E34]">
                      <div className="font-bold flex items-center justify-between border-b border-[#2A2E34] pb-1">
                        <span>Day {data.day} - {data.label}</span>
                        {data.isForecast && (
                          <span className="bg-[#FF6A3D] text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                            FORECAST
                          </span>
                        )}
                      </div>
                      {data.actualRevenue !== null && (
                        <div className="text-[#35C98B] flex justify-between gap-4">
                          <span>Actual Revenue:</span>
                          <span className="font-bold">{maskCurrency(data.actualRevenue)}</span>
                        </div>
                      )}
                      <div className="text-[#FFC107] flex justify-between gap-4">
                        <span>Trend / Projection:</span>
                        <span className="font-bold">{maskCurrency(data.trendline)}</span>
                      </div>
                      {showConfidenceBands && (
                        <div className="text-[#A8AFB8] text-[10px] pt-1 border-t border-[#2A2E34]">
                          95% Range: {maskCurrency(data.lowerBound)} – {maskCurrency(data.upperBound)}
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, fontFamily: "IBM Plex Mono", paddingTop: 10 }}
              iconType="circle"
            />

            {/* 95% Confidence Interval Area Band */}
            {showConfidenceBands && (
              <Area
                type="monotone"
                dataKey="upperBound"
                stroke="none"
                fill="#FF6A3D"
                fillOpacity={0.12}
                name="95% Confidence Band"
              />
            )}

            {/* Historical Actual Scatter Points */}
            <Scatter
              dataKey="actualRevenue"
              fill="#157A4D"
              name="Recorded Daily Actuals"
              shape="circle"
            />

            {/* Regression Best-Fit Line */}
            <Line
              type="monotone"
              dataKey="trendline"
              stroke="#B53A1E"
              strokeWidth={2.5}
              dot={false}
              name="Linear Regression Model (y = mx + b)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Scenario Simulation Interactive Sliders (Admin & Super Admin) */}
      <div className="bg-[#F8F9F6] border border-[#DFE1DB] p-4 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sliders className="h-4 w-4 text-[#B53A1E]" />
            <span className="font-bold text-xs font-['Archivo'] text-[#1A1D21]">
              Live Hospitality Scenario Simulation Controls
            </span>
          </div>
          <button
            onClick={() => {
              setOccupancyGrowth(0);
              setAdrAdjustment(0);
              setFbDiningLift(0);
            }}
            className="text-[10px] font-['IBM_Plex_Mono'] font-bold text-[#5C636F] hover:text-[#1A1D21] flex items-center space-x-1 cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Reset Simulation</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-['IBM_Plex_Sans']">
          {/* Slider 1: Hotel Occupancy */}
          <div className="space-y-1.5 bg-white p-3 rounded-lg border border-[#DFE1DB]">
            <div className="flex justify-between font-['IBM_Plex_Mono'] text-[11px]">
              <span className="text-[#5C636F]">Room Occupancy Factor</span>
              <span className="font-bold text-[#1A1D21]">{occupancyGrowth > 0 ? `+${occupancyGrowth}%` : `${occupancyGrowth}%`}</span>
            </div>
            <input
              type="range"
              min={-20}
              max={30}
              step={1}
              value={occupancyGrowth}
              onChange={(e) => setOccupancyGrowth(Number(e.target.value))}
              className="w-full accent-[#B53A1E] cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-[#A8AFB8] font-['IBM_Plex_Mono']">
              <span>-20% Low Season</span>
              <span>Baseline</span>
              <span>+30% Peak</span>
            </div>
          </div>

          {/* Slider 2: Average Daily Rate (ADR) */}
          <div className="space-y-1.5 bg-white p-3 rounded-lg border border-[#DFE1DB]">
            <div className="flex justify-between font-['IBM_Plex_Mono'] text-[11px]">
              <span className="text-[#5C636F]">ADR Yield Adjustment</span>
              <span className="font-bold text-[#1A1D21]">{adrAdjustment > 0 ? `+${adrAdjustment}%` : `${adrAdjustment}%`}</span>
            </div>
            <input
              type="range"
              min={-15}
              max={25}
              step={1}
              value={adrAdjustment}
              onChange={(e) => setAdrAdjustment(Number(e.target.value))}
              className="w-full accent-[#B53A1E] cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-[#A8AFB8] font-['IBM_Plex_Mono']">
              <span>-15% Discount</span>
              <span>Standard ADR</span>
              <span>+25% Surge</span>
            </div>
          </div>

          {/* Slider 3: F&B Dining Cover Growth */}
          <div className="space-y-1.5 bg-white p-3 rounded-lg border border-[#DFE1DB]">
            <div className="flex justify-between font-['IBM_Plex_Mono'] text-[11px]">
              <span className="text-[#5C636F]">Restaurant Dining Covers</span>
              <span className="font-bold text-[#1A1D21]">{fbDiningLift > 0 ? `+${fbDiningLift}%` : `${fbDiningLift}%`}</span>
            </div>
            <input
              type="range"
              min={-10}
              max={20}
              step={1}
              value={fbDiningLift}
              onChange={(e) => setFbDiningLift(Number(e.target.value))}
              className="w-full accent-[#B53A1E] cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-[#A8AFB8] font-['IBM_Plex_Mono']">
              <span>-10% Lull</span>
              <span>Average</span>
              <span>+20% High Covers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
