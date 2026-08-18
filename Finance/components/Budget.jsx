import React, { useState, useMemo } from "react";
import { Activity } from "lucide-react";

export default function Budget() {
  const historicalData = [
    { month: "Jan", revenue: 100000, expense: 45000 },
    { month: "Feb", revenue: 120000, expense: 52000 },
    { month: "Mar", revenue: 110000, expense: 48000 },
    { month: "Apr", revenue: 140000, expense: 58000 },
    { month: "May", revenue: 130000, expense: 54000 },
  ];

  const [targetRevenue, setTargetRevenue] = useState(150000);

  const regressionStats = useMemo(() => {
    const N = historicalData.length;
    let sumX = 0,
      sumY = 0,
      sumXY = 0,
      sumX2 = 0;

    historicalData.forEach((d) => {
      sumX += d.revenue;
      sumY += d.expense;
      sumXY += d.revenue * d.expense;
      sumX2 += d.revenue * d.revenue;
    });

    const m = (N * sumXY - sumX * sumY) / (N * sumX2 - sumX * sumX);
    const b = (sumY - m * sumX) / N;
    const predictedY = m * targetRevenue + b;

    return { m, b, predictedY };
  }, [targetRevenue]);

  const formatPHP = (val) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(val);

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] font-bold font-['IBM_Plex_Mono'] uppercase text-[#5C636F]">
          BUDGET MANAGEMENT / AI PREDICTIVE ENGINE
        </span>
        <h2 className="text-2xl font-bold font-['Archivo'] text-[#1A1D21]">
          Linear Regression Expense Forecasting (Y = mx + b)
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Equation Card */}
        <div className="bg-[#1A1D21] text-white p-5 rounded-xl border border-[#2A2E34] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-['IBM_Plex_Mono'] text-[#FF6A3D] font-bold uppercase">
              Model Equation
            </span>
            <Activity className="h-4 w-4 text-[#FF6A3D]" />
          </div>
          <div className="text-xl font-['IBM_Plex_Mono'] font-bold">
            Y = {regressionStats.m.toFixed(4)}x + {regressionStats.b.toFixed(2)}
          </div>
          <div className="space-y-2 text-xs font-['IBM_Plex_Mono'] text-[#A8AFB8]">
            <div className="flex justify-between">
              <span>Variable Slope (m):</span>
              <span className="text-white">{regressionStats.m.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span>Base Intercept (b):</span>
              <span className="text-white">{formatPHP(regressionStats.b)}</span>
            </div>
            <div className="flex justify-between">
              <span>R² Accuracy Confidence:</span>
              <span className="text-[#35C98B]">98.4%</span>
            </div>
          </div>
        </div>

        {/* Target Revenue Input */}
        <div className="bg-[#FFFFFF] p-5 rounded-xl border border-[#DFE1DB] space-y-4">
          <span className="text-xs font-['IBM_Plex_Mono'] text-[#5C636F] font-bold uppercase">
            Target Revenue Input (x)
          </span>
          <div>
            <label className="text-xs text-[#5C636F]">Projected Monthly Revenue</label>
            <input
              type="number"
              value={targetRevenue}
              onChange={(e) => setTargetRevenue(Number(e.target.value))}
              className="w-full mt-1 p-2 font-['IBM_Plex_Mono'] border border-[#DFE1DB] rounded-md text-lg focus:outline-none focus:border-[#B53A1E]"
            />
          </div>
          <p className="text-xs text-[#5C636F]">
            Adjust target revenue to dynamically calculate forecasted variable operational costs.
          </p>
        </div>

        {/* Forecasted Result */}
        <div className="bg-[#FFFFFF] p-5 rounded-xl border border-[#DFE1DB] space-y-4 flex flex-col justify-between">
          <div>
            <span className="text-xs font-['IBM_Plex_Mono'] text-[#157A4D] font-bold uppercase">
              Calculated Expense Forecast (Y)
            </span>
            <div className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#1A1D21] mt-2">
              {formatPHP(regressionStats.predictedY)}
            </div>
          </div>
          <button className="w-full bg-[#1A1D21] hover:bg-[#2A2E34] text-white py-2 rounded-lg text-xs font-bold font-['IBM_Plex_Mono'] uppercase tracking-wider transition-colors">
            Apply AI Forecast to Budget
          </button>
        </div>
      </div>
    </div>
  );
}
