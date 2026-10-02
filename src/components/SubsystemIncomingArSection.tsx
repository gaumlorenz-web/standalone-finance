import React, { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  DollarSign,
  Send,
  CheckCircle2,
  Calendar,
  Building,
  ExternalLink,
  Sparkles,
  Layers,
  ShieldCheck,
  Clock,
  AlertCircle
} from "lucide-react";
import { fmsBridge } from "../services/fmsBridge";

interface SubsystemIncomingArSectionProps {
  sourceModule: "Hotel-MNGT" | "Resto-MNGT";
  requesterName: string;
  defaultCategory: string;
  presets: {
    customer: string;
    category: string;
    amount: number;
    terms: string;
    paymentMethod: string;
    notes: string;
  }[];
  onNavigateToFms?: (tab?: string) => void;
}

export default function SubsystemIncomingArSection({
  sourceModule,
  requesterName,
  defaultCategory,
  presets,
  onNavigateToFms
}: SubsystemIncomingArSectionProps) {
  // Form State
  const [customer, setCustomer] = useState("");
  const [category, setCategory] = useState(defaultCategory);
  const [amount, setAmount] = useState<number>(85000);
  const [terms, setTerms] = useState("Net 30 Days");
  const [paymentMethod, setPaymentMethod] = useState("Corporate City Ledger Billing");
  const [dailyPenaltyRatePercent, setDailyPenaltyRatePercent] = useState<number>(0.1);
  const [notes, setNotes] = useState("");

  // Subsystem AR Invoices State
  const [invoices, setInvoices] = useState<any[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [lastCreatedInvoice, setLastCreatedInvoice] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync invoices from localStorage
  const refreshInvoices = () => {
    try {
      const stored = localStorage.getItem("horeca_ar_invoices");
      if (stored) {
        const parsed = JSON.parse(stored);
        setInvoices(parsed.slice(0, 10));
      }
    } catch (e) {}
  };

  useEffect(() => {
    refreshInvoices();
    const handleSync = () => refreshInvoices();
    window.addEventListener("fms-sync-event", handleSync);
    return () => window.removeEventListener("fms-sync-event", handleSync);
  }, []);

  const applyPreset = (preset: typeof presets[0]) => {
    setCustomer(preset.customer);
    setCategory(preset.category);
    setAmount(preset.amount);
    setTerms(preset.terms);
    setPaymentMethod(preset.paymentMethod);
    setNotes(preset.notes);
  };

  const handleSimulateAR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.trim() || amount <= 0) {
      alert("Please provide valid customer name and invoice amount.");
      return;
    }

    setIsSubmitting(true);

    const result = fmsBridge.simulateIncomingAR({
      sourceModule,
      customer: customer.trim(),
      amount,
      category,
      terms,
      paymentMethod,
      dailyPenaltyRatePercent,
      notes: notes.trim() || `Simulated AR issued by ${requesterName} (${sourceModule})`,
      requestedBy: requesterName
    });

    setIsSubmitting(false);

    if (result.success && result.invoice) {
      setLastCreatedInvoice(result.invoice);
      setStatusMessage(
        `Incoming AR Invoice ${result.invoice.id} created for ${result.invoice.customer} (₱${result.invoice.amount.toLocaleString()})! Synced to FMS Accounts Receivable and Governance Queue.`
      );
      refreshInvoices();
    } else {
      alert(result.error || "Failed to simulate incoming AR invoice.");
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER CARD */}
      <div className="bg-white border border-[#DFE1DB] p-5 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold font-['IBM_Plex_Mono'] uppercase tracking-wider text-[#5C636F]">
              {sourceModule} REVENUE &amp; BILLING DESK
            </span>
            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-['IBM_Plex_Mono'] font-bold border border-blue-200 flex items-center gap-1">
              <FileSpreadsheet className="h-3 w-3" />
              <span>AR INVOICING</span>
            </span>
          </div>
          <h2 className="text-xl font-bold font-['Archivo'] text-[#1A1D21] mt-0.5">
            Simulate Incoming Accounts Receivable (AR Invoicing)
          </h2>
          <p className="text-xs text-[#5C636F]">
            Issue incoming client invoices for corporate hotel events, city ledger guest folios, and restaurant catering. Synchronizes to FMS Accounts Receivable ledger.
          </p>
        </div>

        {onNavigateToFms && (
          <button
            type="button"
            onClick={() => onNavigateToFms("ar")}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-[#1A1D21] rounded-lg text-xs font-['IBM_Plex_Mono'] font-bold transition-all flex items-center gap-1.5 shrink-0 border border-slate-300 cursor-pointer"
          >
            <span>View FMS AR Ledger</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* SUCCESS BANNER */}
      {statusMessage && lastCreatedInvoice && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-['IBM_Plex_Mono'] text-emerald-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <div className="font-bold">{statusMessage}</div>
              <div className="text-[11px] text-emerald-700 mt-0.5">
                Invoice No: <strong>{lastCreatedInvoice.id}</strong> &bull; Due Date: <strong>{lastCreatedInvoice.dueDate}</strong> ({lastCreatedInvoice.paymentTerms})
              </div>
            </div>
          </div>
          {onNavigateToFms && (
            <button
              type="button"
              onClick={() => onNavigateToFms("ar")}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold transition-colors cursor-pointer shrink-0"
            >
              Open in FMS AR Ledger &rarr;
            </button>
          )}
        </div>
      )}

      {/* QUICK PRESETS BANNER */}
      {presets.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-['IBM_Plex_Mono'] text-slate-700 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span>Standard Operational AR Presets for {sourceModule}</span>
            </span>
            <span className="text-[10px] text-slate-500 font-['IBM_Plex_Mono']">Click preset to populate form</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(preset)}
                className="p-2.5 bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-400 rounded-lg text-left transition-all cursor-pointer shadow-2xs group"
              >
                <div className="font-bold text-xs text-slate-900 group-hover:text-blue-700 truncate">
                  {preset.customer}
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                  {preset.category} &bull; {preset.terms}
                </div>
                <div className="mt-1.5 text-xs font-bold font-['IBM_Plex_Mono'] text-blue-700">
                  ₱{preset.amount.toLocaleString()}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* AR INVOICING FORM */}
      <div className="bg-white border border-[#DFE1DB] p-6 rounded-xl shadow-xs space-y-5">
        <div className="border-b border-[#DFE1DB] pb-3 flex items-center justify-between">
          <h3 className="font-bold text-base font-['Archivo'] text-[#1A1D21] flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-blue-700" />
            <span>Generate Incoming Corporate AR Invoice</span>
          </h3>
          <span className="text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
            Officer: <strong>{requesterName}</strong>
          </span>
        </div>

        <form onSubmit={handleSimulateAR} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold font-['IBM_Plex_Mono'] text-[#1A1D21] mb-1">
                Client / Corporate Customer Name *
              </label>
              <input
                type="text"
                required
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                placeholder="e.g., San Miguel Corporation / Ayala Land Mktg / Wedding Nuptials"
                className="w-full text-xs p-2.5 bg-[#F8F9F6] border border-[#DFE1DB] rounded-lg focus:outline-none focus:border-[#1A1D21] font-['IBM_Plex_Sans']"
              />
            </div>

            <div>
              <label className="block text-xs font-bold font-['IBM_Plex_Mono'] text-[#1A1D21] mb-1">
                Invoice Billing Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#F8F9F6] border border-[#DFE1DB] rounded-lg focus:outline-none focus:border-[#1A1D21] font-['IBM_Plex_Sans']"
              >
                <option value="Hotel Room Folio / City Ledger">Hotel Room Folio / City Ledger</option>
                <option value="Corporate Banquet & Event">Corporate Banquet &amp; Event</option>
                <option value="F&B Catering Receivable">F&amp;B Catering Receivable</option>
                <option value="Travel Agency OTA Billing">Travel Agency OTA Billing (Agoda/Booking)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold font-['IBM_Plex_Mono'] text-[#1A1D21] mb-1">
                Invoice Amount (PHP) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#5C636F]">₱</span>
                <input
                  type="number"
                  min="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full text-xs pl-7 pr-3 py-2.5 bg-[#F8F9F6] border border-[#DFE1DB] rounded-lg focus:outline-none font-['IBM_Plex_Mono'] font-bold text-[#1A1D21]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold font-['IBM_Plex_Mono'] text-[#1A1D21] mb-1">
                Payment Credit Terms *
              </label>
              <select
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#F8F9F6] border border-[#DFE1DB] rounded-lg focus:outline-none focus:border-[#1A1D21] font-['IBM_Plex_Sans']"
              >
                <option value="Net 30 Days">Net 30 Days</option>
                <option value="Net 15 Days">Net 15 Days</option>
                <option value="Net 60 Days">Net 60 Days</option>
                <option value="Immediate Settlement">Immediate Settlement</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold font-['IBM_Plex_Mono'] text-[#1A1D21] mb-1">
                Billing / Collection Rail *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#F8F9F6] border border-[#DFE1DB] rounded-lg focus:outline-none focus:border-[#1A1D21] font-['IBM_Plex_Sans']"
              >
                <option value="Corporate City Ledger Billing">Corporate City Ledger Billing</option>
                <option value="Bank Transfer (BDO Unibank)">Bank Transfer (BDO Unibank)</option>
                <option value="Credit Card Authorization on File">Credit Card Authorization on File</option>
                <option value="Post-Dated Check (PDC)">Post-Dated Check (PDC)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold font-['IBM_Plex_Mono'] text-[#1A1D21] mb-1">
                Daily Overdue Penalty Rate (%/day)
              </label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="5"
                value={dailyPenaltyRatePercent}
                onChange={(e) => setDailyPenaltyRatePercent(Number(e.target.value))}
                className="w-full text-xs p-2.5 bg-[#F8F9F6] border border-[#DFE1DB] rounded-lg focus:outline-none font-['IBM_Plex_Mono']"
              />
              <span className="text-[10px] text-[#5C636F] font-['IBM_Plex_Mono'] block mt-1">
                Standard: 0.10% daily accrual upon past due
              </span>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold font-['IBM_Plex_Mono'] text-[#1A1D21] mb-1">
                Event / Billing Reference Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Grand Ballroom Catering for 180 pax / Suite 401 Executive Stay"
                className="w-full text-xs p-2.5 bg-[#F8F9F6] border border-[#DFE1DB] rounded-lg focus:outline-none font-['IBM_Plex_Sans']"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#DFE1DB]">
            <div className="text-xs text-[#5C636F] font-['IBM_Plex_Mono'] flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-blue-700" />
              <span>Will auto-post to FMS AR Ledger and General Ledger upon approval.</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold font-['IBM_Plex_Mono'] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              <span>{isSubmitting ? "Generating..." : "Simulate & Post Incoming AR Invoice"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* RECENT ACCOUNTS RECEIVABLE LEDGER PREVIEW */}
      <div className="bg-white border border-[#DFE1DB] rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#DFE1DB] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#1A1D21] font-['Archivo'] flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-blue-700" />
              <span>Recently Dispatched Accounts Receivable Invoices</span>
            </h3>
            <p className="text-xs text-[#5C636F]">
              Live synchronized AR entries in the Central Finance Ledger.
            </p>
          </div>
          <span className="text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
            {invoices.length} Registered
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-['IBM_Plex_Sans']">
            <thead className="bg-[#F1F1ED] font-['IBM_Plex_Mono'] text-[#5C636F] text-[11px]">
              <tr>
                <th className="p-3">Invoice #</th>
                <th className="p-3">Customer Entity</th>
                <th className="p-3">Category</th>
                <th className="p-3 text-right">Amount (PHP)</th>
                <th className="p-3">Terms &amp; Due Date</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFE1DB] text-[11px]">
              {invoices.slice(0, 5).map((inv) => (
                <tr key={inv.id} className="hover:bg-[#F8F9F6] transition-colors">
                  <td className="p-3 font-['IBM_Plex_Mono'] font-bold text-[#1A1D21]">
                    {inv.id}
                  </td>
                  <td className="p-3 font-semibold text-[#1A1D21]">{inv.customer}</td>
                  <td className="p-3 text-[#5C636F]">{inv.category}</td>
                  <td className="p-3 text-right font-['IBM_Plex_Mono'] font-bold text-blue-700">
                    ₱{Number(inv.amount).toLocaleString()}
                  </td>
                  <td className="p-3 font-['IBM_Plex_Mono'] text-[10px] text-[#5C636F]">
                    {inv.paymentTerms || "Net 30"} &bull; Due: {inv.dueDate}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-['IBM_Plex_Mono'] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      {inv.status || "Unpaid"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
