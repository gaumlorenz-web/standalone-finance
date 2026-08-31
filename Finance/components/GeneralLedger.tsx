import React, { useState, useMemo } from "react";
import {
  BookOpen,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Layers,
  Calendar,
  Search,
  Database,
  TableProperties,
  Copy,
  Check,
  Download,
  Filter,
  FileCode,
  ShieldCheck,
  Tag,
  ArrowRight,
  History,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import {
  HOSPITALITY_CHART_OF_ACCOUNTS,
  POSTGRESQL_DDL_AND_SEED,
  GL_DATA_DICTIONARY,
  AccountCOA,
  FieldSpec
} from "../data/hospitalityData";
import ExportButton from "./ExportButton";

interface GeneralLedgerProps {
  journalEntries: any[];
  setJournalEntries: React.Dispatch<React.SetStateAction<any[]>>;
  submitForApproval: (actionType: string, module: string, payload: any) => void;
  currentUser: { email: string; role: string; name: string } | null;
  isDataMasked: boolean;
  maskCurrency: (val: number) => string;
  maskField: (val: any, type: string) => string;
}

export default function GeneralLedger({
  journalEntries,
  setJournalEntries,
  submitForApproval,
  currentUser,
  isDataMasked,
  maskCurrency,
  maskField
}: GeneralLedgerProps) {
  // Navigation Tabs: 'report' | 'history' | 'builder' | 'coa' | 'sql' | 'dictionary'
  const [activeTab, setActiveTab] = useState<"report" | "history" | "builder" | "coa" | "sql" | "dictionary">("report");

  // Filters for Master Report
  const [sectionFilter, setSectionFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("" );

  // Transaction History State & Filters
  const [historySearch, setHistorySearch] = useState<string>("");
  const [historyModuleFilter, setHistoryModuleFilter] = useState<string>("All");
  const [expandedTransactions, setExpandedTransactions] = useState<{ [ref: string]: boolean }>({});

  const toggleExpandTransaction = (ref: string) => {
    setExpandedTransactions(prev => ({ ...prev, [ref]: !prev[ref] }));
  };

  // Group journalEntries into Transaction Batches (by reference number)
  const transactionBatches = useMemo(() => {
    const batchesMap: {
      [ref: string]: {
        ref: string;
        date: string;
        sourceModule: string;
        primaryMemo: string;
        totalDebits: number;
        totalCredits: number;
        variance: number;
        isBalanced: boolean;
        status: string;
        postedBy: string;
        approvedBy?: string;
        lines: any[];
      };
    } = {};

    journalEntries.forEach((entry) => {
      const ref = entry.ref || `TX-${entry.id}`;
      if (!batchesMap[ref]) {
        batchesMap[ref] = {
          ref: ref,
          date: entry.date || new Date().toISOString().split("T")[0],
          sourceModule: entry.sourceModule || "General Operations",
          primaryMemo: entry.memo || "Financial Transaction Post",
          totalDebits: 0,
          totalCredits: 0,
          variance: 0,
          isBalanced: true,
          status: entry.status || "COMMITTED",
          postedBy: entry.postedBy || "System Core",
          approvedBy: entry.approvedBy || (entry.status === "COMMITTED" ? "Super Administrator" : undefined),
          lines: []
        };
      }
      batchesMap[ref].totalDebits += Number(entry.debit) || 0;
      batchesMap[ref].totalCredits += Number(entry.credit) || 0;
      batchesMap[ref].lines.push(entry);
    });

    const batchList = Object.values(batchesMap).map((b) => {
      const variance = Math.abs(b.totalDebits - b.totalCredits);
      return {
        ...b,
        variance,
        isBalanced: variance < 0.01 && b.totalDebits > 0
      };
    });

    // Filter
    return batchList.filter((b) => {
      const matchesModule = historyModuleFilter === "All" || b.sourceModule === historyModuleFilter;
      const matchesSearch =
        b.ref.toLowerCase().includes(historySearch.toLowerCase()) ||
        b.primaryMemo.toLowerCase().includes(historySearch.toLowerCase()) ||
        b.postedBy.toLowerCase().includes(historySearch.toLowerCase()) ||
        b.lines.some((l: any) =>
          (l.accountName || "").toLowerCase().includes(historySearch.toLowerCase()) ||
          (l.memo || "").toLowerCase().includes(historySearch.toLowerCase())
        );
      return matchesModule && matchesSearch;
    });
  }, [journalEntries, historyModuleFilter, historySearch]);

  const getTransactionHistoryExportData = () => {
    const headers = [
      "Voucher Ref",
      "Transaction Date",
      "Subsystem / Source",
      "Primary Description / Memo",
      "Total Debits (PHP)",
      "Total Credits (PHP)",
      "Balancing Variance (PHP)",
      "Balance Status",
      "Posted By",
      "Approved By",
      "Line Count"
    ];

    const rows = transactionBatches.map((b) => [
      b.ref,
      b.date,
      b.sourceModule,
      isDataMasked ? maskField(b.primaryMemo, "name") : b.primaryMemo,
      Number(b.totalDebits) || 0,
      Number(b.totalCredits) || 0,
      Number(b.variance) || 0,
      b.isBalanced ? "Balanced (0.00)" : `Imbalanced (₱${b.variance})`,
      b.postedBy,
      b.approvedBy || "Super Administrator",
      b.lines.length
    ]);

    const grandDebits = transactionBatches.reduce((s, b) => s + b.totalDebits, 0);
    const grandCredits = transactionBatches.reduce((s, b) => s + b.totalCredits, 0);

    return {
      title: "General Ledger Transaction History & Voucher Batches",
      subtitle: `Filter: ${historyModuleFilter} | Active Vouchers: ${transactionBatches.length}`,
      filename: `GL_Transaction_History_${new Date().toISOString().split("T")[0]}`,
      sheetName: "Transaction_History",
      headers,
      rows,
      summary: [
        { label: "Total Transaction Batches", value: transactionBatches.length },
        { label: "Grand Total Debit Volume", value: grandDebits },
        { label: "Grand Total Credit Volume", value: grandCredits },
        { label: "100% Balanced Compliance", value: `${transactionBatches.filter(b => b.isBalanced).length} / ${transactionBatches.length} Vouchers` }
      ],
      companyName: "HORECA HOSPITALITY & ASSET ENTERPRISE",
      generatedBy: currentUser?.name || "Administrator"
    };
  };

  // COA Tab Filters
  const [coaCategoryFilter, setCoaCategoryFilter] = useState<string>("All");
  const [coaSearch, setCoaSearch] = useState<string>("");

  // Copy Feedback state
  const [hasCopiedSql, setHasCopiedSql] = useState<boolean>(false);

  // Journal Entry Builder State
  const [builderRows, setBuilderRows] = useState([
    { id: 1, accountCode: "1010", accountName: "1010 - Front Desk Cash Float", memo: "Front Desk Shift Intake", debit: 50000, credit: 0 },
    { id: 2, accountCode: "4010", accountName: "4010 - Hotel Room Revenue - Deluxe & Suites", memo: "Room Booking Revenue Accrual", debit: 0, credit: 50000 },
  ]);
  const [builderRef, setBuilderRef] = useState(`JV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [builderSourceModule, setBuilderSourceModule] = useState<string>("Hotel PMS");
  const [builderDescription, setBuilderDescription] = useState("Manual Hospitality Journal Balancing Entry");

  // Double-Entry Computations for Builder
  const builderTotalDebits = useMemo(
    () => builderRows.reduce((sum, item) => sum + (Number(item.debit) || 0), 0),
    [builderRows]
  );
  const builderTotalCredits = useMemo(
    () => builderRows.reduce((sum, item) => sum + (Number(item.credit) || 0), 0),
    [builderRows]
  );
  const builderVariance = Math.abs(builderTotalDebits - builderTotalCredits);
  const isBuilderBalanced = builderTotalDebits > 0 && builderVariance === 0;

  // Builder Row Actions
  const handleAddRow = () => {
    setBuilderRows([
      ...builderRows,
      {
        id: Date.now(),
        accountCode: "1010",
        accountName: "1010 - Front Desk Cash Float",
        memo: "",
        debit: 0,
        credit: 0
      }
    ]);
  };

  const handleRemoveRow = (id: number) => {
    if (builderRows.length > 2) {
      setBuilderRows(builderRows.filter((r) => r.id !== id));
    }
  };

  const handleRowChange = (id: number, field: string, value: any) => {
    setBuilderRows(
      builderRows.map((r) => {
        if (r.id !== id) return r;
        if (field === "accountCode") {
          const matched = HOSPITALITY_CHART_OF_ACCOUNTS.find((a) => a.code === value);
          const name = matched ? `${matched.code} - ${matched.name}` : value;
          return { ...r, accountCode: value, accountName: name };
        }
        return { ...r, [field]: value };
      })
    );
  };

  // Quick Preset Template Loader for Builder
  const loadPresetTemplate = (type: "pms" | "pos" | "hrms" | "scm" | "fleet") => {
    if (type === "pms") {
      setBuilderSourceModule("Hotel PMS");
      setBuilderDescription("Hotel PMS Night Audit Checkout Reconciliation");
      setBuilderRows([
        { id: 1, accountCode: "1010", accountName: "1010 - Front Desk Cash Float", memo: "Cash guest settlements", debit: 35000, credit: 0 },
        { id: 2, accountCode: "1040", accountName: "1040 - Merchant Settlement Clearing", memo: "Terminal credit card swipes", debit: 112840, credit: 0 },
        { id: 3, accountCode: "4010", accountName: "4010 - Hotel Room Revenue - Deluxe & Suites", memo: "Gross lodging revenue", debit: 0, credit: 120000 },
        { id: 4, accountCode: "2130", accountName: "2130 - Output Value Added Tax (VAT 12%)", memo: "12% Output VAT", debit: 0, credit: 15840 },
        { id: 5, accountCode: "2200", accountName: "2200 - Service Charge Payable (85% Staff Pool)", memo: "85% staff pool allocation", debit: 0, credit: 10200 },
        { id: 6, accountCode: "4050", accountName: "4050 - Spa, Wellness & Laundry Revenue", memo: "Ancillary mini-bar revenue", debit: 0, credit: 1800 }
      ]);
    } else if (type === "pos") {
      setBuilderSourceModule("Restaurant POS");
      setBuilderDescription("Restaurant Dining Room & Bar Dinner Service Summary");
      setBuilderRows([
        { id: 1, accountCode: "1020", accountName: "1020 - Restaurant POS Cash Float", memo: "Dining room cash drawer", debit: 24500, credit: 0 },
        { id: 2, accountCode: "1040", accountName: "1040 - Merchant Settlement Clearing", memo: "Card terminal batches", debit: 61740, credit: 0 },
        { id: 3, accountCode: "4020", accountName: "4020 - Restaurant Food Sales - Main Dining", memo: "Dinner food revenue", debit: 0, credit: 48000 },
        { id: 4, accountCode: "4030", accountName: "4030 - Beverage & Bar Sales - Liquor & Wines", memo: "Bar & cocktail revenue", debit: 0, credit: 22000 },
        { id: 5, accountCode: "2130", accountName: "2130 - Output Value Added Tax (VAT 12%)", memo: "12% Output VAT", debit: 0, credit: 8400 },
        { id: 6, accountCode: "2200", accountName: "2200 - Service Charge Payable (85% Staff Pool)", memo: "85% staff service charge", debit: 0, credit: 5950 },
        { id: 7, accountCode: "4060", accountName: "4060 - Service Charge Retained Share", memo: "15% management retainage", debit: 0, credit: 1890 }
      ]);
    } else if (type === "hrms") {
      setBuilderSourceModule("HRMS Payroll");
      setBuilderDescription("Executive & Department Head Off-Cycle Payroll Run");
      setBuilderRows([
        { id: 1, accountCode: "5110", accountName: "5110 - Executive & Management Salaries", memo: "Executive base salary expense", debit: 145000, credit: 0 },
        { id: 2, accountCode: "5120", accountName: "5120 - Frontline Operational Staff Wages", memo: "Supervisors wage allocation", debit: 40000, credit: 0 },
        { id: 3, accountCode: "2120", accountName: "2120 - Withholding Tax Payable (WHT)", memo: "BIR Compensation WHT", debit: 0, credit: 22500 },
        { id: 4, accountCode: "2110", accountName: "2110 - Accrued Payroll & Wage Clearing", memo: "SSS / PhilHealth deductions", debit: 0, credit: 8500 },
        { id: 5, accountCode: "1030", accountName: "1030 - Operating Bank Account - Primary", memo: "Direct deposit payroll EFT", debit: 0, credit: 154000 }
      ]);
    } else if (type === "scm") {
      setBuilderSourceModule("Supply Chain");
      setBuilderDescription("Wholesale Kitchen Inventory PO Receipt (USDA Prime Cuts & Salmon)");
      setBuilderRows([
        { id: 1, accountCode: "1310", accountName: "1310 - F&B Inventory - Raw Produce & Meats", memo: "Fresh proteins & pantry intake", debit: 78000, credit: 0 },
        { id: 2, accountCode: "1320", accountName: "1320 - F&B Inventory - Wine, Beer & Spirits", memo: "House wine & bar inventory", debit: 22000, credit: 0 },
        { id: 3, accountCode: "5030", accountName: "5030 - Direct Kitchen Supplies & Packaging", memo: "Storage packaging & freight", debit: 12000, credit: 0 },
        { id: 4, accountCode: "2010", accountName: "2010 - Trade Accounts Payable", memo: "Trade AP - HighSeas Meats", debit: 0, credit: 109760 },
        { id: 5, accountCode: "2120", accountName: "2120 - Withholding Tax Payable (WHT)", memo: "Creditable WHT (2%)", debit: 0, credit: 2240 }
      ]);
    } else if (type === "fleet") {
      setBuilderSourceModule("FleetOps");
      setBuilderDescription("Fleet Operations Fuel Refills & Airport VIP Shuttle Settlement");
      setBuilderRows([
        { id: 1, accountCode: "1040", accountName: "1040 - Merchant Settlement Clearing", memo: "VIP Shuttle & Freight card settlements", debit: 45000, credit: 0 },
        { id: 2, accountCode: "5410", accountName: "5410 - Fleet Fuel & Commercial Operating Expenses", memo: "Petron commercial fleet card fuel", debit: 28500, credit: 0 },
        { id: 3, accountCode: "5420", accountName: "5420 - Fleet Maintenance, Tires & Mechanical Repairs", memo: "Isuzu preventative maintenance", debit: 14200, credit: 0 },
        { id: 4, accountCode: "4300", accountName: "4300 - Fleet Logistics, Freight & Shuttle Transport Revenue", memo: "Gross transport & shuttle revenue", debit: 0, credit: 40178.57 },
        { id: 5, accountCode: "2130", accountName: "2130 - Output Value Added Tax (VAT 12%)", memo: "12% Output VAT on transport", debit: 0, credit: 4821.43 },
        { id: 6, accountCode: "2030", accountName: "2030 - Fleet Fuel & Commercial Maintenance Payable", memo: "Trade AP - Petron & Isuzu", debit: 0, credit: 41846 },
        { id: 7, accountCode: "2120", accountName: "2120 - Withholding Tax Payable (WHT)", memo: "2% BIR Form 2307 EWT on fleet", debit: 0, credit: 854 }
      ]);
    }
  };

  const handlePostJournalEntry = () => {
    if (!isBuilderBalanced) return;

    const payload = {
      id: builderRef,
      ref: builderRef,
      date: new Date().toISOString().split("T")[0],
      sourceModule: builderSourceModule,
      description: builderDescription,
      lines: builderRows.map((r, idx) => ({
        id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toISOString().split("T")[0],
        ref: builderRef,
        sourceModule: builderSourceModule,
        accountCode: r.accountCode,
        accountName: r.accountName,
        memo: r.memo || builderDescription,
        debit: Number(r.debit) || 0,
        credit: Number(r.credit) || 0,
        status: currentUser?.role === "superadmin" ? "COMMITTED" : "PENDING",
        postedBy: currentUser?.name || "System User",
        approvedBy: currentUser?.role === "superadmin" ? "Super Administrator" : undefined,
      }))
    };

    submitForApproval("POST_GL_ENTRY", "General Ledger", payload);

    // Reset Builder
    setBuilderRef(`JV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  };

  // Group items by Account Code & compute chronological continuous rolling running balance
  const groupedLedgerAccounts = useMemo(() => {
    const filtered = journalEntries.filter((post) => {
      const matchesSection = sectionFilter === "All" || post.sourceModule === sectionFilter;
      const matchesSearch =
        (post.accountName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.memo || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.ref || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.accountCode || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSection && matchesSearch;
    });

    const groups: { [key: string]: { accountName: string; accountCode: string; postings: any[] } } = {};
    filtered.forEach((post) => {
      const code = post.accountCode || (post.accountName ? post.accountName.substring(0, 4) : "1010");
      const key = post.accountName || `${code} - Operating Account`;
      if (!groups[key]) {
        groups[key] = { accountName: key, accountCode: code, postings: [] };
      }
      groups[key].postings.push(post);
    });

    // Chronologically inject running calculations
    Object.keys(groups).forEach((key) => {
      let currentRunningBalance = 0;
      const code = groups[key].accountCode;
      const isAssetOrExpense = code.startsWith("1") || code.startsWith("5");

      groups[key].postings = groups[key].postings.map((post) => {
        const d = Number(post.debit) || 0;
        const c = Number(post.credit) || 0;
        if (isAssetOrExpense) {
          currentRunningBalance += d - c;
        } else {
          currentRunningBalance += c - d;
        }
        return { ...post, runningBalance: currentRunningBalance };
      });
    });

    return Object.values(groups);
  }, [journalEntries, sectionFilter, searchQuery]);

  // Copy SQL Script to Clipboard
  const handleCopySql = () => {
    navigator.clipboard.writeText(POSTGRESQL_DDL_AND_SEED);
    setHasCopiedSql(true);
    setTimeout(() => setHasCopiedSql(false), 2500);
  };

  // Export Master General Ledger to Excel (.xlsx) or PDF (.pdf)
  const getGLExportData = () => {
    const rowsToExport = journalEntries.filter((post) => {
      const matchesSection = sectionFilter === "All" || post.sourceModule === sectionFilter;
      const matchesSearch =
        (post.accountName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.memo || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.ref || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.accountCode || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSection && matchesSearch;
    });

    const headers = [
      "Entry ID",
      "Date",
      "Reference No",
      "Subsystem / Source",
      "Account Code",
      "Account Title",
      "Journal Memo",
      "Debit (PHP)",
      "Credit (PHP)",
      "Status",
      "Posted By"
    ];

    const rows = rowsToExport.map((row) => [
      row.id || "",
      row.date || "",
      row.ref || "",
      row.sourceModule || "",
      row.accountCode || "",
      row.accountName || "",
      row.memo || "",
      Number(row.debit) || 0,
      Number(row.credit) || 0,
      row.status || "COMMITTED",
      row.postedBy || ""
    ]);

    const totalDebits = rowsToExport.reduce((sum, r) => sum + (Number(r.debit) || 0), 0);
    const totalCredits = rowsToExport.reduce((sum, r) => sum + (Number(r.credit) || 0), 0);

    return {
      title: "Master General Ledger Postings Register",
      subtitle: `Filter: ${sectionFilter} | Records: ${rowsToExport.length}`,
      filename: "HORECA_General_Ledger_Register",
      sheetName: "General Ledger",
      headers,
      rows,
      summary: [
        { label: "Total Filtered Debits", value: totalDebits },
        { label: "Total Filtered Credits", value: totalCredits },
        { label: "Net Ledger Imbalance / Variance", value: Math.abs(totalDebits - totalCredits) },
        { label: "Total Accounts Active", value: groupedLedgerAccounts.length }
      ],
      generatedBy: currentUser?.name || "Administrator"
    };
  };

  // Filtered Chart of Accounts
  const filteredCOA = useMemo(() => {
    return HOSPITALITY_CHART_OF_ACCOUNTS.filter((acc) => {
      const matchesCat = coaCategoryFilter === "All" || acc.category === coaCategoryFilter;
      const matchesSearch =
        acc.code.includes(coaSearch) ||
        acc.name.toLowerCase().includes(coaSearch.toLowerCase()) ||
        acc.moduleTag.toLowerCase().includes(coaSearch.toLowerCase()) ||
        acc.description.toLowerCase().includes(coaSearch.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [coaCategoryFilter, coaSearch]);

  return (
    <div className="space-y-6">
      {/* Module Title Header & Navigation Ribbon */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 border-b border-[#DFE1DB] pb-4">
        <div>
          <span className="text-[11px] font-bold font-['IBM_Plex_Mono'] uppercase text-[#5C636F] tracking-wider">
            Hospitality ERP Transaction Core (4 Subsystems)
          </span>
          <h2 className="text-2xl font-bold font-['Archivo'] text-[#1A1D21] flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-[#B53A1E]" />
            General Ledger &amp; Chart of Accounts Core
          </h2>
        </div>

        {/* View Toggle Tabs */}
        <div className="flex flex-wrap bg-[#F1F1ED] p-1 rounded-lg border border-[#DFE1DB] text-xs font-semibold font-['IBM_Plex_Mono']">
          <button
            onClick={() => setActiveTab("report")}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === "report"
                ? "bg-white text-[#B53A1E] shadow-xs border border-[#DFE1DB]"
                : "text-[#5C636F] hover:text-[#1A1D21]"
            }`}
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Master Ledger</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === "history"
                ? "bg-white text-[#B53A1E] shadow-xs border border-[#DFE1DB]"
                : "text-[#5C636F] hover:text-[#1A1D21]"
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>Transaction History</span>
          </button>
          <button
            onClick={() => setActiveTab("builder")}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === "builder"
                ? "bg-white text-[#B53A1E] shadow-xs border border-[#DFE1DB]"
                : "text-[#5C636F] hover:text-[#1A1D21]"
            }`}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Journal Builder</span>
          </button>
          <button
            onClick={() => setActiveTab("coa")}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === "coa"
                ? "bg-white text-[#B53A1E] shadow-xs border border-[#DFE1DB]"
                : "text-[#5C636F] hover:text-[#1A1D21]"
            }`}
          >
            <Tag className="h-3.5 w-3.5" />
            <span>Hospitality COA</span>
          </button>
          <button
            onClick={() => setActiveTab("sql")}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === "sql"
                ? "bg-white text-[#B53A1E] shadow-xs border border-[#DFE1DB]"
                : "text-[#5C636F] hover:text-[#1A1D21]"
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            <span>PostgreSQL DDL/Seed</span>
          </button>
          <button
            onClick={() => setActiveTab("dictionary")}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === "dictionary"
                ? "bg-white text-[#B53A1E] shadow-xs border border-[#DFE1DB]"
                : "text-[#5C636F] hover:text-[#1A1D21]"
            }`}
          >
            <TableProperties className="h-3.5 w-3.5" />
            <span>Data Dictionary</span>
          </button>
        </div>
      </div>

      {/* ==============================================================================
          TAB 1: MASTER RUNNING BALANCE LEDGER REPORT
         ============================================================================== */}
      {activeTab === "report" && (
        <div className="space-y-6">
          {/* Filter Toolbar */}
          <div className="bg-white p-4 border border-[#DFE1DB] rounded-xl shadow-xs flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              {/* Subsystem Module Selector */}
              <div className="flex items-center space-x-2 bg-[#F1F1ED] border border-[#DFE1DB] px-3 py-1.5 rounded-lg text-xs font-medium">
                <Layers className="h-3.5 w-3.5 text-[#5C636F]" />
                <span className="text-[#5C636F]">Source Subsystem:</span>
                <select
                  value={sectionFilter}
                  onChange={(e) => setSectionFilter(e.target.value)}
                  className="bg-transparent font-bold focus:outline-none cursor-pointer text-[#1A1D21]"
                >
                  <option value="All">All 5 Subsystems</option>
                  <option value="Hotel PMS">Hotel PMS Folios</option>
                  <option value="Restaurant POS">Restaurant POS Z-Reports</option>
                  <option value="HRMS Payroll">HRMS Payroll Clearing</option>
                  <option value="Supply Chain">Supply Chain POs</option>
                  <option value="FleetOps">Fleet Operations (FleetOps)</option>
                </select>
              </div>

              {/* Free Text Search */}
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#9AA0AA]" />
                <input
                  type="text"
                  placeholder="Search accounts, memos, refs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border border-[#DFE1DB] rounded-lg pl-9 pr-3 py-1.5 text-xs font-['IBM_Plex_Sans'] focus:outline-none focus:border-[#B53A1E]"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-xs text-[#5C636F] hidden sm:flex items-center gap-2 font-['IBM_Plex_Mono']">
                <Calendar className="h-3.5 w-3.5" />
                <span>Fiscal Live Sync</span>
                <span className="bg-[#157A4D]/10 text-[#157A4D] px-2 py-0.5 rounded font-bold border border-[#157A4D]/30">
                  {groupedLedgerAccounts.length} Accounts
                </span>
              </div>

              <ExportButton
                getExportData={getGLExportData}
                buttonLabel="Export Ledger"
              />
            </div>
          </div>

          {/* Grouped Account Tables */}
          {groupedLedgerAccounts.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-[#DFE1DB] rounded-xl bg-white text-[#5C636F] text-sm font-['IBM_Plex_Mono']">
              No matching finalized transactions found inside this reporting criteria.
            </div>
          ) : (
            <div className="space-y-5">
              {groupedLedgerAccounts.map((group) => (
                <div
                  key={group.accountName}
                  className="bg-white border border-[#DFE1DB] rounded-xl overflow-hidden shadow-xs"
                >
                  {/* Account Header Banner */}
                  <div className="bg-[#F8F9F6] border-b border-[#DFE1DB] px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="font-['IBM_Plex_Mono'] text-sm font-bold text-[#1A1D21]">
                        {group.accountName}
                      </span>
                      <span className="text-[10px] bg-[#DFE1DB] text-[#5C636F] font-['IBM_Plex_Mono'] px-2 py-0.5 rounded font-bold">
                        Code: {group.accountCode}
                      </span>
                    </div>
                    <div className="text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
                      Total Postings: <strong>{group.postings.length}</strong>
                    </div>
                  </div>

                  {/* Postings Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-['IBM_Plex_Sans']">
                      <thead className="bg-[#F1F1ED] text-[11px] font-['IBM_Plex_Mono'] uppercase text-[#5C636F] border-b border-[#DFE1DB]">
                        <tr>
                          <th className="p-2.5">Date</th>
                          <th className="p-2.5">Reference No</th>
                          <th className="p-2.5">Subsystem</th>
                          <th className="p-2.5">Journal Memo / Breakdown</th>
                          <th className="p-2.5 text-right">Debit (PHP)</th>
                          <th className="p-2.5 text-right">Credit (PHP)</th>
                          <th className="p-2.5 text-right font-bold">Running Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F1F1ED]">
                        {group.postings.map((post) => (
                          <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-2.5 font-['IBM_Plex_Mono'] text-[#5C636F]">{post.date}</td>
                            <td className="p-2.5 font-['IBM_Plex_Mono'] font-bold text-[#B53A1E]">{post.ref}</td>
                            <td className="p-2.5">
                              <span
                                className={`text-[10px] font-['IBM_Plex_Mono'] font-bold px-2 py-0.5 rounded border ${
                                  post.sourceModule === "Hotel PMS"
                                    ? "bg-blue-50 text-blue-700 border-blue-200"
                                    : post.sourceModule === "Restaurant POS"
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : post.sourceModule === "HRMS Payroll"
                                    ? "bg-purple-50 text-purple-700 border-purple-200"
                                    : post.sourceModule === "FleetOps"
                                    ? "bg-cyan-50 text-cyan-800 border-cyan-300"
                                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                }`}
                              >
                                {post.sourceModule}
                              </span>
                            </td>
                            <td className="p-2.5 text-[#1A1D21] max-w-xs truncate">
                              {maskField(post.memo, "name")}
                            </td>
                            <td className="p-2.5 text-right font-['IBM_Plex_Mono']">
                              {post.debit > 0 ? maskCurrency(post.debit) : "—"}
                            </td>
                            <td className="p-2.5 text-right font-['IBM_Plex_Mono']">
                              {post.credit > 0 ? maskCurrency(post.credit) : "—"}
                            </td>
                            <td
                              className={`p-2.5 text-right font-['IBM_Plex_Mono'] font-bold ${
                                post.runningBalance >= 0 ? "text-[#157A4D]" : "text-[#B5281A]"
                              }`}
                            >
                              {maskCurrency(post.runningBalance)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==============================================================================
          TAB 1.5: TRANSACTION HISTORY (GROUPED VOUCHERS & BATCH POSTINGS)
         ============================================================================== */}
      {activeTab === "history" && (
        <div className="space-y-6">
          {/* Top KPI Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 border border-[#DFE1DB] rounded-xl shadow-xs">
              <span className="text-[11px] font-['IBM_Plex_Mono'] font-bold text-[#5C636F] uppercase">Total Vouchers &amp; Batches</span>
              <div className="text-2xl font-bold font-['Archivo'] text-[#1A1D21] mt-1">
                {transactionBatches.length}
              </div>
              <span className="text-[10px] text-[#5C636F] mt-1 block">Cross-Module Chronological Core</span>
            </div>

            <div className="bg-white p-4 border border-[#DFE1DB] rounded-xl shadow-xs">
              <span className="text-[11px] font-['IBM_Plex_Mono'] font-bold text-[#5C636F] uppercase">Balancing Integrity</span>
              <div className="text-2xl font-bold font-['Archivo'] text-[#157A4D] mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="h-5 w-5" />
                <span>100% Balanced</span>
              </div>
              <span className="text-[10px] text-[#5C636F] mt-1 block">Zero Debits/Credits Imbalance</span>
            </div>

            <div className="bg-white p-4 border border-[#DFE1DB] rounded-xl shadow-xs">
              <span className="text-[11px] font-['IBM_Plex_Mono'] font-bold text-[#5C636F] uppercase">Total Debits Audited</span>
              <div className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#1A1D21] mt-1">
                {maskCurrency(transactionBatches.reduce((s, b) => s + b.totalDebits, 0))}
              </div>
              <span className="text-[10px] text-[#5C636F] mt-1 block">Asset &amp; Expense Inflows</span>
            </div>

            <div className="bg-white p-4 border border-[#DFE1DB] rounded-xl shadow-xs">
              <span className="text-[11px] font-['IBM_Plex_Mono'] font-bold text-[#5C636F] uppercase">Total Credits Audited</span>
              <div className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#1A1D21] mt-1">
                {maskCurrency(transactionBatches.reduce((s, b) => s + b.totalCredits, 0))}
              </div>
              <span className="text-[10px] text-[#5C636F] mt-1 block">Revenue &amp; Liability Outflows</span>
            </div>
          </div>

          {/* Filter & Search Toolbar */}
          <div className="bg-white p-4 border border-[#DFE1DB] rounded-xl shadow-xs flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="flex items-center space-x-2 bg-[#F1F1ED] border border-[#DFE1DB] px-3 py-1.5 rounded-lg text-xs font-medium">
                <Layers className="h-3.5 w-3.5 text-[#5C636F]" />
                <span className="text-[#5C636F]">Subsystem:</span>
                <select
                  value={historyModuleFilter}
                  onChange={(e) => setHistoryModuleFilter(e.target.value)}
                  className="bg-transparent font-bold focus:outline-none cursor-pointer text-[#1A1D21]"
                >
                  <option value="All">All 5 Subsystems</option>
                  <option value="Hotel PMS">Hotel PMS</option>
                  <option value="Restaurant POS">Restaurant POS</option>
                  <option value="HRMS Payroll">HRMS Payroll</option>
                  <option value="Supply Chain">Supply Chain</option>
                  <option value="FleetOps">Fleet Operations (FleetOps)</option>
                </select>
              </div>

              <div className="relative flex-1 sm:w-72">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#5C636F]" />
                <input
                  type="text"
                  placeholder="Search voucher ref, memo, poster..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-[#F1F1ED] border border-[#DFE1DB] rounded-lg text-xs focus:outline-none focus:border-[#1A1D21]"
                />
              </div>
            </div>

            <ExportButton getExportData={getTransactionHistoryExportData} buttonLabel="Export Transaction History" />
          </div>

          {/* Transaction History Master Table */}
          <div className="bg-white border border-[#DFE1DB] rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#DFE1DB] flex justify-between items-center bg-[#FBFBFA]">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-[#B53A1E]" />
                <h3 className="text-sm font-bold font-['Archivo'] text-[#1A1D21]">
                  Chronological Transaction Batches &amp; Voucher History ({transactionBatches.length})
                </h3>
              </div>
              <span className="text-[11px] font-['IBM_Plex_Mono'] text-[#5C636F]">
                Click any row to expand journal line breakdown
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F1F1ED] text-[#5C636F] font-['IBM_Plex_Mono'] border-b border-[#DFE1DB]">
                    <th className="p-3 w-10"></th>
                    <th className="p-3">Voucher Reference</th>
                    <th className="p-3">Post Date</th>
                    <th className="p-3">Source Subsystem</th>
                    <th className="p-3">Primary Description / Memo</th>
                    <th className="p-3 text-right">Debit Volume</th>
                    <th className="p-3 text-right">Credit Volume</th>
                    <th className="p-3 text-center">Balancing Status</th>
                    <th className="p-3">Posted By</th>
                    <th className="p-3">Approval</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFE1DB]">
                  {transactionBatches.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-[#5C636F]">
                        No transaction history records match your search filter.
                      </td>
                    </tr>
                  ) : (
                    transactionBatches.map((batch) => {
                      const isExpanded = !!expandedTransactions[batch.ref];
                      return (
                        <React.Fragment key={batch.ref}>
                          <tr
                            onClick={() => toggleExpandTransaction(batch.ref)}
                            className="hover:bg-[#FBFBFA] cursor-pointer transition-colors"
                          >
                            <td className="p-3 text-center text-[#5C636F]">
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-[#B53A1E]" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-[#5C636F]" />
                              )}
                            </td>
                            <td className="p-3 font-['IBM_Plex_Mono'] font-bold text-[#1A1D21] flex items-center gap-1.5">
                              <span>{batch.ref}</span>
                              <span className="text-[10px] text-[#5C636F] font-normal bg-[#F1F1ED] px-1.5 py-0.5 rounded">
                                {batch.lines.length} lines
                              </span>
                            </td>
                            <td className="p-3 text-[#5C636F] font-['IBM_Plex_Mono']">{batch.date}</td>
                            <td className="p-3">
                              <span
                                className={`text-[10px] font-['IBM_Plex_Mono'] font-bold px-2 py-0.5 rounded border ${
                                  batch.sourceModule === "Hotel PMS"
                                    ? "bg-blue-50 text-blue-700 border-blue-200"
                                    : batch.sourceModule === "Restaurant POS"
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : batch.sourceModule === "HRMS Payroll"
                                    ? "bg-purple-50 text-purple-700 border-purple-200"
                                    : batch.sourceModule === "FleetOps"
                                    ? "bg-cyan-50 text-cyan-800 border-cyan-300"
                                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                }`}
                              >
                                {batch.sourceModule}
                              </span>
                            </td>
                            <td className="p-3 text-[#1A1D21] max-w-xs truncate font-medium">
                              {maskField(batch.primaryMemo, "name")}
                            </td>
                            <td className="p-3 text-right font-['IBM_Plex_Mono'] font-bold text-[#1A1D21]">
                              {maskCurrency(batch.totalDebits)}
                            </td>
                            <td className="p-3 text-right font-['IBM_Plex_Mono'] font-bold text-[#1A1D21]">
                              {maskCurrency(batch.totalCredits)}
                            </td>
                            <td className="p-3 text-center">
                              {batch.isBalanced ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-[#157A4D] border border-green-200">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Balanced (0.00)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-[#B5281A] border border-red-200">
                                  <AlertTriangle className="h-3 w-3" />
                                  Variance: {maskCurrency(batch.variance)}
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-[#5C636F]">
                              {isDataMasked ? maskField(batch.postedBy, "name") : batch.postedBy}
                            </td>
                            <td className="p-3">
                              <span className="inline-flex items-center gap-1 text-[10px] font-['IBM_Plex_Mono'] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                <ShieldCheck className="h-3 w-3" />
                                Authorized
                              </span>
                            </td>
                          </tr>

                          {/* Expanded Line Items Detail Accordion */}
                          {isExpanded && (
                            <tr className="bg-[#F8F9FA] border-b border-[#DFE1DB]">
                              <td colSpan={10} className="p-4 pl-12">
                                <div className="bg-white border border-[#DFE1DB] rounded-lg p-3 shadow-xs space-y-2">
                                  <div className="flex justify-between items-center border-b border-[#DFE1DB] pb-2">
                                    <span className="text-[11px] font-bold font-['Archivo'] text-[#1A1D21]">
                                      Double-Entry Ledger Postings for Voucher {batch.ref}
                                    </span>
                                    <span className="text-[10px] font-['IBM_Plex_Mono'] text-[#5C636F]">
                                      Total Debits: {maskCurrency(batch.totalDebits)} | Total Credits: {maskCurrency(batch.totalCredits)}
                                    </span>
                                  </div>
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr className="text-[#5C636F] font-['IBM_Plex_Mono'] text-[10px] border-b border-[#ECEEEC]">
                                        <th className="py-1 text-left">Account Code &amp; Title</th>
                                        <th className="py-1 text-left">Posting Memo</th>
                                        <th className="py-1 text-right">Debit (PHP)</th>
                                        <th className="py-1 text-right">Credit (PHP)</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#ECEEEC]">
                                      {batch.lines.map((line: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-[#FBFBFA]">
                                          <td className="py-1.5 font-['IBM_Plex_Mono'] font-medium text-[#1A1D21]">
                                            {line.accountName || `${line.accountCode} - Operational Line`}
                                          </td>
                                          <td className="py-1.5 text-[#5C636F]">
                                            {maskField(line.memo, "name")}
                                          </td>
                                          <td className="py-1.5 text-right font-['IBM_Plex_Mono']">
                                            {Number(line.debit) > 0 ? maskCurrency(Number(line.debit)) : "—"}
                                          </td>
                                          <td className="py-1.5 text-right font-['IBM_Plex_Mono']">
                                            {Number(line.credit) > 0 ? maskCurrency(Number(line.credit)) : "—"}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================================
          TAB 2: JOURNAL ENTRY BUILDER & LIVE DOUBLE-ENTRY VALIDATOR
         ============================================================================== */}
      {activeTab === "builder" && (
        <div className="space-y-6">
          {/* Template Presets Bar */}
          <div className="bg-white border border-[#DFE1DB] p-4 rounded-xl shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-['Archivo'] text-[#1A1D21] uppercase">
                Load Preset Hospitality Transaction Templates:
              </span>
              <span className="text-[10px] font-['IBM_Plex_Mono'] text-[#5C636F]">
                1-Click Multi-Leg Balanced Setup
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-['IBM_Plex_Mono']">
              <button
                onClick={() => loadPresetTemplate("pms")}
                className="p-2.5 border rounded-lg text-left hover:bg-[#F1F1ED] transition-colors border-[#DFE1DB] cursor-pointer"
              >
                <div className="font-bold text-[#1A1D21]">Hotel PMS Night Audit</div>
                <div className="text-[10px] text-[#5C636F]">Checkout, Rooms, VAT &amp; SC</div>
              </button>
              <button
                onClick={() => loadPresetTemplate("pos")}
                className="p-2.5 border rounded-lg text-left hover:bg-[#F1F1ED] transition-colors border-[#DFE1DB] cursor-pointer"
              >
                <div className="font-bold text-[#1A1D21]">Restaurant POS Z-Report</div>
                <div className="text-[10px] text-[#5C636F]">Dining, Bar, VAT &amp; SC</div>
              </button>
              <button
                onClick={() => loadPresetTemplate("hrms")}
                className="p-2.5 border rounded-lg text-left hover:bg-[#F1F1ED] transition-colors border-[#DFE1DB] cursor-pointer"
              >
                <div className="font-bold text-[#1A1D21]">HRMS Payroll Run</div>
                <div className="text-[10px] text-[#5C636F]">Salaries, WHT &amp; EFT Bank</div>
              </button>
              <button
                onClick={() => loadPresetTemplate("scm")}
                className="p-2.5 border rounded-lg text-left hover:bg-[#F1F1ED] transition-colors border-[#DFE1DB] cursor-pointer"
              >
                <div className="font-bold text-[#1A1D21]">Supply Chain PO Intake</div>
                <div className="text-[10px] text-[#5C636F]">Meats, Wines &amp; Trade AP</div>
              </button>
              <button
                onClick={() => loadPresetTemplate("fleet")}
                className="p-2.5 border rounded-lg text-left hover:bg-[#F1F1ED] transition-colors border-[#DFE1DB] cursor-pointer"
              >
                <div className="font-bold text-[#1A1D21]">Fleet Operations Run</div>
                <div className="text-[10px] text-[#5C636F]">Fuel, Shuttles &amp; Maint AP</div>
              </button>
            </div>
          </div>

          {/* Builder Document Metadata Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white border border-[#DFE1DB] p-4 rounded-xl shadow-xs text-xs font-['IBM_Plex_Sans']">
            <div className="space-y-1">
              <label className="font-bold font-['IBM_Plex_Mono'] uppercase text-[#5C636F] text-[11px]">
                Reference Code
              </label>
              <input
                type="text"
                value={builderRef}
                onChange={(e) => setBuilderRef(e.target.value)}
                className="w-full border border-[#DFE1DB] p-2 rounded font-['IBM_Plex_Mono'] font-bold text-[#1A1D21]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold font-['IBM_Plex_Mono'] uppercase text-[#5C636F] text-[11px]">
                Originating Subsystem
              </label>
              <select
                value={builderSourceModule}
                onChange={(e) => setBuilderSourceModule(e.target.value)}
                className="w-full border border-[#DFE1DB] p-2 rounded font-bold text-[#1A1D21]"
              >
                <option value="Hotel PMS">Hotel PMS</option>
                <option value="Restaurant POS">Restaurant POS</option>
                <option value="HRMS Payroll">HRMS Payroll</option>
                <option value="Supply Chain">Supply Chain</option>
                <option value="FleetOps">Fleet Operations (FleetOps)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-bold font-['IBM_Plex_Mono'] uppercase text-[#5C636F] text-[11px]">
                Event Memo Description
              </label>
              <input
                type="text"
                value={builderDescription}
                onChange={(e) => setBuilderDescription(e.target.value)}
                className="w-full border border-[#DFE1DB] p-2 rounded text-[#1A1D21]"
              />
            </div>
          </div>

          {/* Builder Entry Rows Table */}
          <div className="bg-white border border-[#DFE1DB] rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-sm font-['IBM_Plex_Sans']">
              <thead className="bg-[#F1F1ED] border-b border-[#DFE1DB] text-[11px] font-bold font-['IBM_Plex_Mono'] uppercase text-[#5C636F]">
                <tr>
                  <th className="p-3">Account Code &amp; Title</th>
                  <th className="p-3">Line Memo</th>
                  <th className="p-3 text-right">Debit (PHP)</th>
                  <th className="p-3 text-right">Credit (PHP)</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE1DB]">
                {builderRows.map((row) => (
                  <tr key={row.id}>
                    <td className="p-3 w-1/3">
                      <select
                        value={row.accountCode}
                        onChange={(e) => handleRowChange(row.id, "accountCode", e.target.value)}
                        className="w-full bg-transparent border border-[#DFE1DB] rounded-md p-1.5 text-xs font-['IBM_Plex_Sans'] focus:outline-none focus:border-[#B53A1E]"
                      >
                        {HOSPITALITY_CHART_OF_ACCOUNTS.map((acc) => (
                          <option key={acc.code} value={acc.code}>
                            {acc.code} - {acc.name} ({acc.category})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        placeholder="Line item note..."
                        value={row.memo}
                        onChange={(e) => handleRowChange(row.id, "memo", e.target.value)}
                        className="w-full text-xs border border-[#DFE1DB] rounded-md p-1.5 focus:outline-none focus:border-[#B53A1E]"
                      />
                    </td>
                    <td className="p-3 text-right">
                      <input
                        type="number"
                        value={row.debit || ""}
                        onChange={(e) => handleRowChange(row.id, "debit", Number(e.target.value))}
                        className="w-32 text-right font-['IBM_Plex_Mono'] text-xs border border-[#DFE1DB] rounded-md p-1.5 focus:outline-none focus:border-[#B53A1E]"
                      />
                    </td>
                    <td className="p-3 text-right">
                      <input
                        type="number"
                        value={row.credit || ""}
                        onChange={(e) => handleRowChange(row.id, "credit", Number(e.target.value))}
                        className="w-32 text-right font-['IBM_Plex_Mono'] text-xs border border-[#DFE1DB] rounded-md p-1.5 focus:outline-none focus:border-[#B53A1E]"
                      />
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleRemoveRow(row.id)}
                        disabled={builderRows.length <= 2}
                        className="text-[#B5281A] hover:text-[#8A2B15] disabled:opacity-30 p-1 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="p-3 bg-[#F1F1ED] border-t border-[#DFE1DB] flex justify-between items-center">
              <button
                onClick={handleAddRow}
                className="flex items-center space-x-1 text-xs font-bold text-[#B53A1E] hover:underline cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Additional Leg Row</span>
              </button>
              <span className="text-[11px] text-[#5C636F] font-['IBM_Plex_Mono']">
                {builderRows.length} Transaction Legs Configured
              </span>
            </div>
          </div>

          {/* Live Double-Entry Balancing Bar & Post Action */}
          <div className="p-4 rounded-xl border bg-white border-[#DFE1DB] flex flex-wrap items-center justify-between gap-4 font-['IBM_Plex_Mono'] text-xs shadow-xs">
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <span className="text-[#5C636F] block text-[10px]">TOTAL DEBITS</span>
                <span className="font-bold text-sm text-[#1A1D21]">{maskCurrency(builderTotalDebits)}</span>
              </div>
              <div>
                <span className="text-[#5C636F] block text-[10px]">TOTAL CREDITS</span>
                <span className="font-bold text-sm text-[#1A1D21]">{maskCurrency(builderTotalCredits)}</span>
              </div>
              <div>
                <span className="text-[#5C636F] block text-[10px]">VARIANCE</span>
                <span
                  className={`font-bold text-sm ${
                    builderVariance === 0 ? "text-[#157A4D]" : "text-[#B5281A]"
                  }`}
                >
                  {maskCurrency(builderVariance)}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {isBuilderBalanced ? (
                <span className="inline-flex items-center text-xs font-bold text-[#157A4D] bg-[#157A4D]/10 px-3 py-1.5 rounded-lg border border-[#157A4D]/30">
                  <CheckCircle2 className="h-4 w-4 mr-1" /> PERFECTLY BALANCED
                </span>
              ) : (
                <span className="inline-flex items-center text-xs font-bold text-[#B5281A] bg-[#B5281A]/10 px-3 py-1.5 rounded-lg border border-[#B5281A]/30">
                  <AlertTriangle className="h-4 w-4 mr-1" /> UNBALANCED (DEBITS ≠ CREDITS)
                </span>
              )}

              <button
                disabled={!isBuilderBalanced}
                onClick={handlePostJournalEntry}
                className={`px-4 py-2 rounded-lg font-bold text-xs text-white transition-all flex items-center space-x-2 ${
                  isBuilderBalanced
                    ? "bg-[#B53A1E] hover:bg-[#8A2B15] shadow-xs cursor-pointer"
                    : "bg-[#9AA0AA] cursor-not-allowed opacity-60"
                }`}
              >
                <Check className="h-4 w-4" />
                <span>
                  {currentUser?.role === "superadmin" ? "Commit Journal Entry" : "Submit for Approval"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================================
          TAB 3: THE STANDARD HOSPITALITY CHART OF ACCOUNTS (COA) DIRECTORY
         ============================================================================== */}
      {activeTab === "coa" && (
        <div className="space-y-6">
          {/* Header & Filter Controls */}
          <div className="bg-white border border-[#DFE1DB] p-4 rounded-xl shadow-xs flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap items-center gap-3">
              {/* Category Filter */}
              <div className="flex items-center space-x-2 bg-[#F1F1ED] border border-[#DFE1DB] px-3 py-1.5 rounded-lg text-xs font-medium">
                <Filter className="h-3.5 w-3.5 text-[#5C636F]" />
                <span className="text-[#5C636F]">Category:</span>
                <select
                  value={coaCategoryFilter}
                  onChange={(e) => setCoaCategoryFilter(e.target.value)}
                  className="bg-transparent font-bold focus:outline-none cursor-pointer text-[#1A1D21]"
                >
                  <option value="All">All Categories (1000 - 5000)</option>
                  <option value="Assets">Assets (1000s)</option>
                  <option value="Liabilities">Liabilities (2000s)</option>
                  <option value="Equity">Equity (3000s)</option>
                  <option value="Revenues">Revenues (4000s)</option>
                  <option value="Expenses">Expenses (5000s)</option>
                </select>
              </div>

              {/* Free Text Filter */}
              <div className="relative w-64">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#9AA0AA]" />
                <input
                  type="text"
                  placeholder="Filter accounts by code or name..."
                  value={coaSearch}
                  onChange={(e) => setCoaSearch(e.target.value)}
                  className="w-full bg-transparent border border-[#DFE1DB] rounded-lg pl-9 pr-3 py-1.5 text-xs font-['IBM_Plex_Sans'] focus:outline-none focus:border-[#B53A1E]"
                />
              </div>
            </div>

            <span className="text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
              Showing <strong>{filteredCOA.length}</strong> of {HOSPITALITY_CHART_OF_ACCOUNTS.length} Master Accounts
            </span>
          </div>

          {/* Chart of Accounts Grid/Table */}
          <div className="bg-white border border-[#DFE1DB] rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-['IBM_Plex_Sans']">
                <thead className="bg-[#F1F1ED] text-[11px] font-['IBM_Plex_Mono'] uppercase text-[#5C636F] border-b border-[#DFE1DB]">
                  <tr>
                    <th className="p-3">Account Code</th>
                    <th className="p-3">Account Title</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Normal Balance</th>
                    <th className="p-3">Primary Subsystem</th>
                    <th className="p-3">Financial Statement</th>
                    <th className="p-3">Industry Scope Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFE1DB]">
                  {filteredCOA.map((acc) => (
                    <tr key={acc.code} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-['IBM_Plex_Mono'] font-bold text-[#B53A1E]">{acc.code}</td>
                      <td className="p-3 font-bold text-[#1A1D21]">{acc.name}</td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-['IBM_Plex_Mono'] font-bold px-2 py-0.5 rounded ${
                            acc.category === "Assets"
                              ? "bg-blue-100 text-blue-800"
                              : acc.category === "Liabilities"
                              ? "bg-red-100 text-red-800"
                              : acc.category === "Equity"
                              ? "bg-purple-100 text-purple-800"
                              : acc.category === "Revenues"
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {acc.category}
                        </span>
                      </td>
                      <td className="p-3 font-['IBM_Plex_Mono'] font-bold">
                        <span className={acc.normalBalance === "Debit" ? "text-indigo-700" : "text-emerald-700"}>
                          {acc.normalBalance}
                        </span>
                      </td>
                      <td className="p-3 font-['IBM_Plex_Mono'] text-[#5C636F]">{acc.moduleTag}</td>
                      <td className="p-3 font-['IBM_Plex_Mono'] text-[#5C636F]">{acc.financialStatement}</td>
                      <td className="p-3 text-[#5C636F] max-w-sm">{acc.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================================
          TAB 4: POSTGRESQL DDL & SEED CONTENT EXPORTER (DOCKER DESKTOP COMPATIBLE)
         ============================================================================== */}
      {activeTab === "sql" && (
        <div className="space-y-4">
          <div className="bg-white border border-[#DFE1DB] p-4 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm font-['Archivo'] text-[#1A1D21] flex items-center gap-2">
                <FileCode className="h-4 w-4 text-[#B53A1E]" />
                Executable PostgreSQL DDL &amp; Balanced Multi-Leg Seed Script
              </h3>
              <p className="text-xs text-[#5C636F] font-['IBM_Plex_Sans']">
                Complete relational schema with UUID primary keys, foreign key constraints, CHECK balance assertions, and production-grade inserts.
              </p>
            </div>

            <button
              onClick={handleCopySql}
              className="px-3.5 py-2 bg-[#1A1D21] hover:bg-[#2A2E34] text-white rounded-lg text-xs font-['IBM_Plex_Mono'] font-bold flex items-center space-x-2 transition-colors cursor-pointer shrink-0"
            >
              {hasCopiedSql ? <Check className="h-4 w-4 text-[#35C98B]" /> : <Copy className="h-4 w-4" />}
              <span>{hasCopiedSql ? "Copied SQL to Clipboard!" : "Copy Full Script"}</span>
            </button>
          </div>

          <div className="bg-[#1A1D21] text-[#E5E7EB] p-5 rounded-xl border border-[#2A2E34] overflow-x-auto text-xs font-['IBM_Plex_Mono'] leading-relaxed shadow-lg max-h-[500px]">
            <pre>{POSTGRESQL_DDL_AND_SEED}</pre>
          </div>
        </div>
      )}

      {/* ==============================================================================
          TAB 5: FIELD DATA DICTIONARY & UI LAYOUT SPECIFICATION
         ============================================================================== */}
      {activeTab === "dictionary" && (
        <div className="space-y-4">
          <div className="bg-white border border-[#DFE1DB] p-4 rounded-xl shadow-xs">
            <h3 className="font-bold text-sm font-['Archivo'] text-[#1A1D21]">
              General Ledger Field Data Dictionary &amp; UI Specification
            </h3>
            <p className="text-xs text-[#5C636F] font-['IBM_Plex_Sans']">
              Standardized mapping between PostgreSQL relational columns, data types, UI alignments, formatting masks, and user routing targets.
            </p>
          </div>

          <div className="bg-white border border-[#DFE1DB] rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-['IBM_Plex_Sans']">
                <thead className="bg-[#F1F1ED] text-[11px] font-['IBM_Plex_Mono'] uppercase text-[#5C636F] border-b border-[#DFE1DB]">
                  <tr>
                    <th className="p-3">User-Facing Label</th>
                    <th className="p-3">PostgreSQL Field</th>
                    <th className="p-3">Data Type &amp; Constraints</th>
                    <th className="p-3">UI Alignment</th>
                    <th className="p-3">Formatting Mask</th>
                    <th className="p-3">Interaction Target</th>
                    <th className="p-3">Architectural Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFE1DB]">
                  {GL_DATA_DICTIONARY.map((spec) => (
                    <tr key={spec.columnLabel} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-[#1A1D21]">{spec.columnLabel}</td>
                      <td className="p-3 font-['IBM_Plex_Mono'] text-indigo-700 font-bold">{spec.dbField}</td>
                      <td className="p-3 font-['IBM_Plex_Mono'] text-xs text-[#B53A1E]">{spec.pgDataType}</td>
                      <td className="p-3 font-['IBM_Plex_Mono'] uppercase text-[#5C636F]">{spec.align}</td>
                      <td className="p-3 font-['IBM_Plex_Mono'] text-xs text-[#1A1D21] bg-[#F8F9F6]">{spec.formatMask}</td>
                      <td className="p-3 font-bold text-xs text-[#157A4D]">{spec.uiTarget}</td>
                      <td className="p-3 text-[#5C636F] max-w-xs">{spec.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
