import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function FinancialReporting() {
  const formatPHP = (val) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(val);

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[11px] font-bold font-['IBM_Plex_Mono'] uppercase text-[#5C636F]">
          FINANCIAL REPORTING &amp; ANALYTICS / DATARAILS LAYER
        </span>
        <h2 className="text-2xl font-bold font-['Archivo'] text-[#1A1D21]">
          FP&amp;A Actual vs. Budget Variance Matrix
        </h2>
      </div>

      {/* FP&A Heatmap Table */}
      <div className="bg-[#FFFFFF] border border-[#DFE1DB] rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F1F1ED] border-b border-[#DFE1DB] text-[11px] font-bold font-['IBM_Plex_Mono'] uppercase text-[#5C636F]">
            <tr>
              <th className="p-3">Department</th>
              <th className="p-3 text-right">Approved Budget</th>
              <th className="p-3 text-right">Actual Expense</th>
              <th className="p-3 text-right">Variance (PHP)</th>
              <th className="p-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DFE1DB] font-['IBM_Plex_Mono']">
            {[
              { dept: "IT & Infrastructure", budget: 150000, actual: 142000 },
              { dept: "Operations & Logistics", budget: 300000, actual: 325000 },
              { dept: "Marketing & Growth", budget: 80000, actual: 78000 },
              { dept: "Administrative & HR", budget: 120000, actual: 119000 },
            ].map((row, idx) => {
              const varianceVal = row.actual - row.budget;
              const isFavorable = varianceVal <= 0;
              return (
                <tr key={idx} className="hover:bg-[#F1F1ED]/50 transition-colors">
                  <td className="p-3 font-['IBM_Plex_Sans'] font-medium">{row.dept}</td>
                  <td className="p-3 text-right">{formatPHP(row.budget)}</td>
                  <td className="p-3 text-right">{formatPHP(row.actual)}</td>
                  <td className={`p-3 text-right font-bold ${isFavorable ? "text-[#157A4D]" : "text-[#B5281A]"}`}>
                    {formatPHP(varianceVal)}
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
  );
}
