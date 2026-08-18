import React, { useState, useMemo } from "react";
import {
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function GeneralLedger() {
  const [journalEntries, setJournalEntries] = useState([
    { id: 1, account: "1010 - Cash on Hand", debit: 50000, credit: 0 },
    { id: 2, account: "4010 - Sales Revenue", debit: 0, credit: 50000 },
  ]);

  const totalDebits = useMemo(
    () => journalEntries.reduce((sum, item) => sum + (Number(item.debit) || 0), 0),
    [journalEntries]
  );
  const totalCredits = useMemo(
    () => journalEntries.reduce((sum, item) => sum + (Number(item.credit) || 0), 0),
    [journalEntries]
  );
  const variance = Math.abs(totalDebits - totalCredits);
  const isBalanced = totalDebits > 0 && variance === 0;

  const handleAddJournalRow = () => {
    setJournalEntries([
      ...journalEntries,
      { id: Date.now(), account: "1010 - Cash on Hand", debit: 0, credit: 0 },
    ]);
  };

  const handleRemoveJournalRow = (id) => {
    if (journalEntries.length > 2) {
      setJournalEntries(journalEntries.filter((row) => row.id !== id));
    }
  };

  const handleJournalChange = (id, field, value) => {
    setJournalEntries(
      journalEntries.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };

  const formatPHP = (val) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(val);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[11px] font-bold font-['IBM_Plex_Mono'] uppercase text-[#5C636F]">
            GL / JOURNAL ENTRY BUILDER
          </span>
          <h2 className="text-2xl font-bold font-['Archivo'] text-[#1A1D21]">
            Post Manual Journal Entry
          </h2>
        </div>
        <button
          disabled={!isBalanced}
          className={`px-4 py-2 rounded-lg font-medium text-sm text-white transition-all flex items-center space-x-2 ${
            isBalanced
              ? "bg-[#B53A1E] hover:bg-[#8A2B15] shadow-sm cursor-pointer"
              : "bg-[#9AA0AA] cursor-not-allowed opacity-60"
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>Post Journal Entry</span>
        </button>
      </div>

      {/* Journal Table */}
      <div className="bg-[#FFFFFF] border border-[#DFE1DB] rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F1F1ED] border-b border-[#DFE1DB] text-[11px] font-bold font-['IBM_Plex_Mono'] uppercase text-[#5C636F]">
            <tr>
              <th className="p-3">Account Code & Title</th>
              <th className="p-3 text-right">Debit (PHP)</th>
              <th className="p-3 text-right">Credit (PHP)</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DFE1DB]">
            {journalEntries.map((row) => (
              <tr key={row.id}>
                <td className="p-3">
                  <select
                    value={row.account}
                    onChange={(e) =>
                      handleJournalChange(row.id, "account", e.target.value)
                    }
                    className="w-full bg-transparent border border-[#DFE1DB] rounded-md p-1.5 font-['IBM_Plex_Sans'] text-sm focus:outline-none focus:border-[#B53A1E]"
                  >
                    <option>1010 - Cash on Hand</option>
                    <option>1020 - Operating Bank Account</option>
                    <option>1200 - Accounts Receivable</option>
                    <option>2010 - Accounts Payable</option>
                    <option>4010 - Sales Revenue</option>
                    <option>5010 - Operational Cost</option>
                  </select>
                </td>
                <td className="p-3 text-right">
                  <input
                    type="number"
                    value={row.debit}
                    onChange={(e) =>
                      handleJournalChange(row.id, "debit", e.target.value)
                    }
                    className="w-36 text-right font-['IBM_Plex_Mono'] border border-[#DFE1DB] rounded-md p-1.5 focus:outline-none focus:border-[#B53A1E]"
                  />
                </td>
                <td className="p-3 text-right">
                  <input
                    type="number"
                    value={row.credit}
                    onChange={(e) =>
                      handleJournalChange(row.id, "credit", e.target.value)
                    }
                    className="w-36 text-right font-['IBM_Plex_Mono'] border border-[#DFE1DB] rounded-md p-1.5 focus:outline-none focus:border-[#B53A1E]"
                  />
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => handleRemoveJournalRow(row.id)}
                    className="text-[#B5281A] hover:text-[#8A2B15] p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-3 bg-[#F1F1ED] border-t border-[#DFE1DB]">
          <button
            onClick={handleAddJournalRow}
            className="flex items-center space-x-1 text-xs font-bold text-[#B53A1E] hover:underline"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add New Entry Line</span>
          </button>
        </div>
      </div>

      {/* Live Double-Entry Balancing Bar */}
      <div className="p-4 rounded-xl border bg-[#FFFFFF] border-[#DFE1DB] flex flex-wrap items-center justify-between gap-4 font-['IBM_Plex_Mono'] text-sm">
        <div className="flex space-x-6">
          <div>
            <span className="text-xs text-[#5C636F]">TOTAL DEBITS:</span>{" "}
            <span className="font-bold">{formatPHP(totalDebits)}</span>
          </div>
          <div>
            <span className="text-xs text-[#5C636F]">TOTAL CREDITS:</span>{" "}
            <span className="font-bold">{formatPHP(totalCredits)}</span>
          </div>
          <div>
            <span className="text-xs text-[#5C636F]">VARIANCE:</span>{" "}
            <span
              className={`font-bold ${
                variance === 0 ? "text-[#157A4D]" : "text-[#B5281A]"
              }`}
            >
              {formatPHP(variance)}
            </span>
          </div>
        </div>
        <div>
          {isBalanced ? (
            <span className="inline-flex items-center text-xs font-bold text-[#157A4D] bg-[#157A4D]/10 px-3 py-1 rounded-full border border-[#157A4D]/30">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> BALANCED &amp; READY
            </span>
          ) : (
            <span className="inline-flex items-center text-xs font-bold text-[#B5281A] bg-[#B5281A]/10 px-3 py-1 rounded-full border border-[#B5281A]/30">
              <AlertTriangle className="h-3.5 w-3.5 mr-1" /> UNBALANCED ENTRY
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
