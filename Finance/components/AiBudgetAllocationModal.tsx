import React, { useState } from "react";
import {
  Sparkles,
  X,
  RefreshCw,
  CheckCircle2,
  Building2,
  Utensils,
  Users,
  Truck,
  Car,
  Layers,
  Sliders,
  AlertTriangle,
  Info
} from "lucide-react";

export interface DepartmentAllocationItem {
  department: string;
  allocated: number;
  cap: number;
  percentage: number;
  rationale: string;
  riskFactor: "Low" | "Moderate" | "High";
}

export interface AiBudgetAllocationResult {
  totalAllocated: number;
  executiveSummary: string;
  allocations: DepartmentAllocationItem[];
  source?: string;
  model?: string;
}

interface AiBudgetAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  departments: Array<{ id?: string; department: string; allocated: number; spent?: number }>;
  onApplyAllocations: (allocations: DepartmentAllocationItem[]) => void;
  maskCurrency: (val: number) => string;
  isDataMasked?: boolean;
}

export default function AiBudgetAllocationModal({
  isOpen,
  onClose,
  departments,
  onApplyAllocations,
  maskCurrency,
  isDataMasked = false,
}: AiBudgetAllocationModalProps) {
  const [aiTotalPool, setAiTotalPool] = useState<number>(8500000);
  const [aiStrategy, setAiStrategy] = useState<string>("Balanced Operational Efficiency");
  const [aiCapHeadroom, setAiCapHeadroom] = useState<number>(1.12);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiLoadingPhase, setAiLoadingPhase] = useState<string>("");
  const [aiResult, setAiResult] = useState<AiBudgetAllocationResult | null>(null);

  if (!isOpen) return null;

  const handleRunAiAllocation = async () => {
    setIsAiLoading(true);
    setAiLoadingPhase("Analyzing historical departmental spend burn rates...");

    const phaseTimers = [
      setTimeout(() => setAiLoadingPhase("Evaluating hospitality macro demand & occupancy indices..."), 700),
      setTimeout(() => setAiLoadingPhase("Formulating optimal departmental budget caps & statutory buffers..."), 1400),
      setTimeout(() => setAiLoadingPhase("Synthesizing FP&A executive rationale via Gemini AI..."), 2100),
    ];

    try {
      const payload = {
        totalPool: aiTotalPool,
        strategy: aiStrategy,
        departments: departments.map((d) => ({
          name: d.department,
          historicalSpend: d.spent || Math.round(d.allocated * 0.65),
          currentCap: d.allocated
        }))
      };

      const res = await fetch("/api/ai/budget-allocation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      phaseTimers.forEach((t) => clearTimeout(t));

      if (data && data.allocations) {
        setAiResult(data);
      } else {
        throw new Error("Invalid response format from AI service");
      }
    } catch (err) {
      console.info("AI endpoint fallback to local FP&A intelligence model", err);
      phaseTimers.forEach((t) => clearTimeout(t));

      // Algorithmic fallback aligned with HORECA core departments
      const weights: Record<string, { share: number; buffer: number; rationale: string; risk: "Low" | "Moderate" | "High" }> = {
        "Kitchen & F&B Operations": {
          share: 0.26,
          buffer: aiCapHeadroom,
          rationale: "Buffers against food inflation, daily purveyor deliveries, banquet provisions, and 85% service charge pooling.",
          risk: "Moderate"
        },
        "Front Office & Hotel Operations": {
          share: 0.28,
          buffer: aiCapHeadroom,
          rationale: "Accommodates high tourist season room turnover, guest room amenities, and front-desk operational consumables.",
          risk: "Moderate"
        },
        "Housekeeping & Facility Maintenance": {
          share: 0.18,
          buffer: 1.10,
          rationale: "Funds commercial linen turnover, eco-friendly sanitation chemistry, and preventive HVAC maintenance reserves.",
          risk: "Low"
        },
        "Executive & Administrative Core": {
          share: 0.28,
          buffer: 1.05,
          rationale: "Covers base salaries, statutory contributions (SSS, PhilHealth, Pag-IBIG), audit compliance, and IT cloud licenses.",
          risk: "Low"
        },
        "Hotel Management": {
          share: 0.28,
          buffer: aiCapHeadroom,
          rationale: "Accommodates room maintenance reserves, guest service supplies, and front-office hospitality consumables.",
          risk: "Moderate"
        },
        "Restaurant Management": {
          share: 0.24,
          buffer: aiCapHeadroom,
          rationale: "Protects culinary procurement, beverage cellar replenishment, and dining service operations.",
          risk: "Moderate"
        },
        "HRMS Payroll": {
          share: 0.30,
          buffer: 1.05,
          rationale: "Safeguards base payroll disbursements, statutory benefits, and holiday overtime compensation.",
          risk: "Low"
        },
        "Supply Chain": {
          share: 0.11,
          buffer: aiCapHeadroom,
          rationale: "Funds bulk purveyor procurement runs, cold chain preservation, and warehouse replenishment.",
          risk: "Moderate"
        },
        "FleetOps": {
          share: 0.07,
          buffer: aiCapHeadroom,
          rationale: "Sustains airport shuttle operations, commercial fuel card allowances, and preventive automotive maintenance.",
          risk: "Low"
        }
      };

      const allocations = departments.map((d) => {
        const conf = weights[d.department] || {
          share: 1 / departments.length,
          buffer: aiCapHeadroom,
          rationale: "Standard operational run-rate budget allocation.",
          risk: "Moderate" as const
        };
        const allocated = Math.round(aiTotalPool * conf.share);
        const cap = Math.round(allocated * conf.buffer);
        const percentage = Number((conf.share * 100).toFixed(1));

        return {
          department: d.department,
          allocated,
          cap,
          percentage,
          rationale: conf.rationale,
          riskFactor: conf.risk
        };
      });

      setAiResult({
        totalAllocated: allocations.reduce((s, a) => s + a.allocated, 0),
        executiveSummary: `Automated FP&A Department Allocation established for PHP ${aiTotalPool.toLocaleString()} utilizing the "${aiStrategy}" strategy. Weighted allocations prioritize high-demand operational units while enforcing strict departmental caps with a ${(aiCapHeadroom * 100 - 100).toFixed(0)}% safety ceiling.`,
        allocations,
        source: "algorithmic-fp&a",
        model: "Enterprise FP&A Algorithmic Engine"
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleTweakAllocation = (deptName: string, newAllocated: number) => {
    if (!aiResult) return;
    const updated = aiResult.allocations.map((a) => {
      if (a.department === deptName) {
        const cap = Math.round(newAllocated * aiCapHeadroom);
        const percentage = Number(((newAllocated / aiTotalPool) * 100).toFixed(1));
        return { ...a, allocated: newAllocated, cap, percentage };
      }
      return a;
    });

    setAiResult({
      ...aiResult,
      allocations: updated,
      totalAllocated: updated.reduce((s, a) => s + a.allocated, 0)
    });
  };

  const handleApply = () => {
    if (!aiResult || !aiResult.allocations) return;
    onApplyAllocations(aiResult.allocations);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-[#DFE1DB] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-[#12171E] via-[#1A1D21] to-[#1E1B2E] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-purple-600 to-indigo-500 text-white rounded-xl shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base font-['Archivo'] tracking-wide">
                  AI Department Budget Allocation Engine
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-['IBM_Plex_Mono'] font-bold bg-purple-500/20 text-purple-200 border border-purple-400/30">
                  FP&amp;A CORE
                </span>
              </div>
              <p className="text-xs text-slate-300 font-['IBM_Plex_Mono']">
                Automated strategic FP&amp;A budget allocation and enforced cap ceilings across departments.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg text-white cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto grow font-['IBM_Plex_Sans'] custom-scrollbar">
          {/* Strategy & Total Pool Controls */}
          <div className="p-4 bg-[#F8F9F6] border border-[#DFE1DB] rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="text-[11px] font-bold font-['IBM_Plex_Mono'] uppercase text-[#5C636F] block mb-1">
                  Fiscal Allocation Strategy
                </label>
                <select
                  value={aiStrategy}
                  onChange={(e) => setAiStrategy(e.target.value)}
                  className="text-xs p-2.5 bg-white border border-[#DFE1DB] rounded-lg font-['IBM_Plex_Mono'] font-medium focus:outline-none focus:border-[#1A1D21] w-full sm:w-72"
                >
                  <option value="Balanced Operational Efficiency">Balanced Operational Efficiency</option>
                  <option value="High Tourist Season Occupancy Surge">High Tourist Season Occupancy Surge</option>
                  <option value="Cost Containment & Austerity Protocol">Cost Containment &amp; Austerity Protocol</option>
                  <option value="Culinary & F&B Modernization">Culinary &amp; F&B Modernization</option>
                  <option value="Fleet Logistics & Modernization">Fleet Logistics &amp; Modernization</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold font-['IBM_Plex_Mono'] uppercase text-[#5C636F] block mb-1">
                  Total Enterprise Budget Pool (PHP)
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#5C636F]">
                      ₱
                    </span>
                    <input
                      type="number"
                      value={aiTotalPool}
                      onChange={(e) => setAiTotalPool(Number(e.target.value))}
                      step="500000"
                      className="pl-7 pr-3 py-2 text-xs bg-white border border-[#DFE1DB] rounded-lg font-['IBM_Plex_Mono'] font-bold w-44 focus:outline-none focus:border-[#1A1D21]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRunAiAllocation}
                    disabled={isAiLoading}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-xs font-bold font-['IBM_Plex_Mono'] flex items-center gap-1.5 shadow-xs cursor-pointer transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isAiLoading ? "animate-spin" : ""}`} />
                    <span>{isAiLoading ? "Computing..." : "Run AI Engine"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Pool Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[10px] text-[#5C636F] font-['IBM_Plex_Mono']">Quick Pool Presets:</span>
              {[2500000, 5000000, 7500000, 8500000, 10000000, 15000000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAiTotalPool(preset)}
                  className={`px-2.5 py-1 rounded text-[10px] font-['IBM_Plex_Mono'] font-bold border transition-all cursor-pointer ${
                    aiTotalPool === preset
                      ? "bg-[#1A1D21] text-white border-[#1A1D21]"
                      : "bg-white text-[#5C636F] border-[#DFE1DB] hover:bg-[#F1F1ED]"
                  }`}
                >
                  ₱{(preset / 1000000).toFixed(1)}M
                </button>
              ))}
            </div>
          </div>

          {/* AI Loading State */}
          {isAiLoading && (
            <div className="p-8 bg-[#F8F9F6] border border-purple-200 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
              <div className="p-3 bg-purple-100 text-purple-700 rounded-full animate-bounce">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#1A1D21] font-['Archivo']">
                  Gemini FP&amp;A AI Computing Optimal Allocation...
                </h4>
                <p className="text-xs text-purple-700 font-['IBM_Plex_Mono'] mt-1 animate-pulse">
                  {aiLoadingPhase || "Balancing operational constraints across departments..."}
                </p>
              </div>
              <div className="w-48 bg-purple-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-full w-2/3 animate-pulse rounded-full" />
              </div>
            </div>
          )}

          {/* Not Run Yet Hint */}
          {!isAiLoading && !aiResult && (
            <div className="p-8 border border-dashed border-[#DFE1DB] rounded-2xl text-center space-y-2 bg-[#FAFAF8]">
              <Sparkles className="h-8 w-8 text-purple-600 mx-auto" />
              <h4 className="font-bold text-sm text-[#1A1D21]">Ready to Allocate Enterprise Budget</h4>
              <p className="text-xs text-[#5C636F] max-w-md mx-auto">
                Click <strong>"Run AI Engine"</strong> above to calculate optimized departmental budget ceilings, risk indicators, and statutory reserve buffers.
              </p>
            </div>
          )}

          {/* AI Results Presentation */}
          {!isAiLoading && aiResult && (
            <div className="space-y-4">
              {/* Executive Strategy Summary Card */}
              <div className="p-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border border-purple-200/80 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold font-['IBM_Plex_Mono'] text-purple-900 uppercase flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-purple-700" />
                    <span>AI FP&amp;A EXECUTIVE RATIONALE</span>
                  </span>
                  <span className="text-[10px] font-['IBM_Plex_Mono'] font-bold text-purple-700">
                    Total: {maskCurrency(aiResult.totalAllocated)}
                  </span>
                </div>
                <p className="text-xs text-[#1A1D21] leading-relaxed">
                  {aiResult.executiveSummary}
                </p>
              </div>

              {/* Department Allocations with Sliders */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-['IBM_Plex_Mono'] uppercase text-[#5C636F]">
                    Department Allocation Breakdown &amp; Enforced Spend Caps
                  </span>
                  <span className="text-[10px] text-[#5C636F] font-['IBM_Plex_Mono']">
                    Sliders allow manual executive fine-tuning
                  </span>
                </div>

                <div className="space-y-2.5">
                  {aiResult.allocations.map((alloc) => {
                    const currentDept = departments.find((d) => d.department === alloc.department);
                    const currentAllocated = currentDept ? currentDept.allocated : 0;

                    return (
                      <div
                        key={alloc.department}
                        className="p-3.5 bg-white border border-[#DFE1DB] rounded-xl hover:border-purple-300 transition-all space-y-2"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-[#F1F1ED] rounded-lg">
                              {alloc.department.toLowerCase().includes("hotel") && <Building2 className="h-4 w-4 text-[#1A1D21]" />}
                              {alloc.department.toLowerCase().includes("food") || alloc.department.toLowerCase().includes("f&b") || alloc.department.toLowerCase().includes("kitchen") ? (
                                <Utensils className="h-4 w-4 text-[#157A4D]" />
                              ) : null}
                              {alloc.department.toLowerCase().includes("housekeeping") && <Layers className="h-4 w-4 text-[#FF6A3D]" />}
                              {alloc.department.toLowerCase().includes("admin") || alloc.department.toLowerCase().includes("executive") ? (
                                <Users className="h-4 w-4 text-[#2563EB]" />
                              ) : null}
                              {alloc.department.toLowerCase().includes("supply") && <Truck className="h-4 w-4 text-[#FF6A3D]" />}
                              {alloc.department.toLowerCase().includes("fleet") && <Car className="h-4 w-4 text-purple-600" />}
                            </div>
                            <div>
                              <h5 className="font-bold text-xs text-[#1A1D21] font-['Archivo']">
                                {alloc.department}
                              </h5>
                              <span className="text-[10px] text-[#5C636F] font-['IBM_Plex_Mono']">
                                Current: {maskCurrency(currentAllocated)} &bull; Share: {alloc.percentage}%
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="text-[10px] text-[#5C636F] font-['IBM_Plex_Mono'] block">
                                AI Proposed:
                              </span>
                              <span className="text-xs font-bold font-['IBM_Plex_Mono'] text-[#1A1D21]">
                                {maskCurrency(alloc.allocated)}
                              </span>
                            </div>

                            <div className="text-right">
                              <span className="text-[10px] text-[#157A4D] font-['IBM_Plex_Mono'] font-bold block">
                                Enforced Cap:
                              </span>
                              <span className="text-xs font-bold font-['IBM_Plex_Mono'] text-[#157A4D]">
                                {maskCurrency(alloc.cap)}
                              </span>
                            </div>

                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-['IBM_Plex_Mono'] font-bold ${
                                alloc.riskFactor === "Low"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : alloc.riskFactor === "Moderate"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {alloc.riskFactor} Risk
                            </span>
                          </div>
                        </div>

                        {/* Rationale text */}
                        <p className="text-[11px] text-[#5C636F] bg-[#F8F9F6] p-2 rounded border border-[#DFE1DB]/60">
                          <strong className="text-[#1A1D21]">AI Rationale:</strong> {alloc.rationale}
                        </p>

                        {/* Interactive Slider */}
                        <div className="flex items-center gap-3 pt-1">
                          <span className="text-[9px] text-[#5C636F] font-['IBM_Plex_Mono']">Fine-tune:</span>
                          <input
                            type="range"
                            min={Math.round(aiTotalPool * 0.05)}
                            max={Math.round(aiTotalPool * 0.50)}
                            step="25000"
                            value={alloc.allocated}
                            onChange={(e) => handleTweakAllocation(alloc.department, Number(e.target.value))}
                            className="w-full accent-purple-600 h-1.5 cursor-pointer bg-slate-200 rounded-lg"
                          />
                          <span className="text-[10px] font-['IBM_Plex_Mono'] font-bold text-[#1A1D21] w-20 text-right">
                            ₱{(alloc.allocated / 1000).toFixed(0)}k
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#F8F9F6] border-t border-[#DFE1DB] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-[#5C636F] font-['IBM_Plex_Mono']">
            {aiResult
              ? `Model: ${aiResult.model || "Gemini AI"} | Total: ₱${aiResult.totalAllocated.toLocaleString()}`
              : "Click 'Run AI Engine' to generate recommended budget limits"}
          </span>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#DFE1DB] rounded-lg text-xs font-bold text-[#5C636F] hover:bg-[#F1F1ED] transition-all cursor-pointer font-['IBM_Plex_Mono']"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={!aiResult || isAiLoading}
              className="px-5 py-2 bg-[#157A4D] hover:bg-[#11633E] text-white rounded-lg text-xs font-bold font-['IBM_Plex_Mono'] transition-all flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Apply AI Budget Caps to Departments</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
