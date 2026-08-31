import React, { useState, useMemo } from "react";
import {
  History,
  ShieldCheck,
  Search,
  Filter,
  Eye,
  Download,
  Copy,
  Check,
  User,
  Clock,
  Layers,
  ArrowRight,
  FileCode,
  AlertCircle,
  FileText,
  Lock,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Database,
  Calendar
} from "lucide-react";
import ExportButton from "./ExportButton";

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: "admin" | "superadmin" | "system";
  action: string;
  module: string;
  timestamp: string;
  ipAddress?: string;
  status: "SUCCESS" | "REJECTED" | "PENDING_APPROVAL" | "SECURITY_ALERT";
  description: string;
  previousState: any | null;
  newState: any | null;
}

interface AuditTrailProps {
  auditLogs: AuditLogEntry[];
  currentUser: { email: string; role: string; name: string } | null;
  isDataMasked: boolean;
  maskField: (val: any, type: string) => string;
}

export default function AuditTrail({
  auditLogs,
  currentUser,
  isDataMasked,
  maskField,
}: AuditTrailProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesSearch =
        log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.module.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesModule = moduleFilter === "All" || log.module === moduleFilter;
      const matchesRole = roleFilter === "All" || log.userRole === roleFilter;
      const matchesStatus = statusFilter === "All" || log.status === statusFilter;

      return matchesSearch && matchesModule && matchesRole && matchesStatus;
    });
  }, [auditLogs, searchQuery, moduleFilter, roleFilter, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = auditLogs.length;
    const mutations = auditLogs.filter((l) => l.previousState !== null || l.newState !== null).length;
    const approvals = auditLogs.filter((l) => l.action.includes("APPROVE") || l.action.includes("QUEUE")).length;
    const securityEvents = auditLogs.filter((l) => l.action.includes("AUTH") || l.action.includes("UNMASK") || l.status === "SECURITY_ALERT").length;

    return { total, mutations, approvals, securityEvents };
  }, [auditLogs]);

  // Copy JSON Diff to Clipboard
  const handleCopyDiff = (log: AuditLogEntry) => {
    const diffData = {
      auditId: log.id,
      timestamp: log.timestamp,
      actor: { id: log.userId, name: log.userName, role: log.userRole },
      action: log.action,
      module: log.module,
      previousState: log.previousState,
      newState: log.newState,
    };
    navigator.clipboard.writeText(JSON.stringify(diffData, null, 2));
    setCopiedId(log.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export all filtered logs to Excel (.xlsx) or PDF (.pdf)
  const getAuditExportData = () => {
    const headers = [
      "Log ID",
      "Timestamp",
      "User / Actor",
      "Role",
      "Action",
      "Module",
      "Status",
      "Description",
      "Has State Mutation"
    ];

    const rows = filteredLogs.map((log) => [
      log.id,
      log.timestamp,
      isDataMasked ? maskField(log.userName, "name") : log.userName,
      log.userRole.toUpperCase(),
      log.action,
      log.module,
      log.status,
      log.description,
      log.previousState || log.newState ? "YES" : "NO"
    ]);

    return {
      title: "HORECA ERP System Audit Trail & Forensic Activity Log",
      subtitle: `Module: ${moduleFilter} | Role: ${roleFilter} | Total Events: ${filteredLogs.length}`,
      filename: `Audit_Trail_Report_${new Date().toISOString().split("T")[0]}`,
      sheetName: "Audit Logs",
      headers,
      rows,
      summary: [
        { label: "Total Recorded Events", value: stats.total },
        { label: "State Mutations / Diffs", value: stats.mutations },
        { label: "Super Admin Approvals", value: stats.approvals },
        { label: "Security & Auth Events", value: stats.securityEvents }
      ],
      generatedBy: currentUser?.name || "Super Administrator"
    };
  };

  // Export all filtered logs to JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `audit_trail_export_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Module Title Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-[#DFE1DB] pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-[#1A1D21] text-white p-1.5 rounded-lg">
              <History className="h-5 w-5" />
            </span>
            <h2 className="text-2xl font-bold font-['Archivo'] text-[#1A1D21]">
              Audit Trail &amp; Immutable Governance Log
            </h2>
          </div>
          <p className="text-xs text-[#5C636F] font-['IBM_Plex_Sans'] mt-1">
            Tracking all user actions, authentication events, state mutations, and previous/new state diffs.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <ExportButton
            getExportData={getAuditExportData}
            buttonLabel="Export Audit Log"
          />
          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 bg-white border border-[#DFE1DB] hover:bg-[#F1F1ED] text-[#1A1D21] rounded-lg text-xs font-['IBM_Plex_Mono'] font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Audit Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#DFE1DB] p-4 rounded-xl space-y-1 shadow-xs">
          <div className="flex justify-between items-center text-[#5C636F]">
            <span className="text-[10px] font-['IBM_Plex_Mono'] font-bold uppercase">TOTAL EVENTS</span>
            <History className="h-4 w-4 text-[#1A1D21]" />
          </div>
          <p className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#1A1D21]">{stats.total}</p>
          <span className="text-[10px] text-[#5C636F]">Recorded in session</span>
        </div>

        <div className="bg-white border border-[#DFE1DB] p-4 rounded-xl space-y-1 shadow-xs">
          <div className="flex justify-between items-center text-[#5C636F]">
            <span className="text-[10px] font-['IBM_Plex_Mono'] font-bold uppercase">STATE MUTATIONS</span>
            <Database className="h-4 w-4 text-[#157A4D]" />
          </div>
          <p className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#157A4D]">{stats.mutations}</p>
          <span className="text-[10px] text-[#5C636F]">With previous/new diff</span>
        </div>

        <div className="bg-white border border-[#DFE1DB] p-4 rounded-xl space-y-1 shadow-xs">
          <div className="flex justify-between items-center text-[#5C636F]">
            <span className="text-[10px] font-['IBM_Plex_Mono'] font-bold uppercase">GOVERNANCE &amp; APPROVALS</span>
            <ShieldCheck className="h-4 w-4 text-[#FF6A3D]" />
          </div>
          <p className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#FF6A3D]">{stats.approvals}</p>
          <span className="text-[10px] text-[#5C636F]">Admin &amp; Super Admin actions</span>
        </div>

        <div className="bg-white border border-[#DFE1DB] p-4 rounded-xl space-y-1 shadow-xs">
          <div className="flex justify-between items-center text-[#5C636F]">
            <span className="text-[10px] font-['IBM_Plex_Mono'] font-bold uppercase">SECURITY EVENTS</span>
            <Lock className="h-4 w-4 text-[#B53A1E]" />
          </div>
          <p className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#B53A1E]">{stats.securityEvents}</p>
          <span className="text-[10px] text-[#5C636F]">Auth &amp; data unmasking</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 border border-[#DFE1DB] rounded-xl shadow-xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#9AA0AA]" />
            <input
              type="text"
              placeholder="Search user, action, ID, memo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border border-[#DFE1DB] rounded-lg pl-9 pr-3 py-1.5 text-xs font-['IBM_Plex_Sans'] focus:outline-none focus:border-[#1A1D21]"
            />
          </div>

          {/* Module Filter */}
          <div className="flex items-center space-x-1.5 bg-[#F1F1ED] border border-[#DFE1DB] px-3 py-1.5 rounded-lg text-xs font-medium">
            <Layers className="h-3.5 w-3.5 text-[#5C636F]" />
            <span className="text-[#5C636F]">Module:</span>
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="bg-transparent font-bold focus:outline-none cursor-pointer text-[#1A1D21]"
            >
              <option value="All">All Modules</option>
              <option value="Authentication">Authentication</option>
              <option value="General Ledger">General Ledger</option>
              <option value="AP / AR Module">AP / AR Module</option>
              <option value="Collections">Collections</option>
              <option value="Disbursements">Disbursements</option>
              <option value="Budget Management">Budget Management</option>
              <option value="Tax Management">Tax Management</option>
              <option value="Governance & Approvals">Governance &amp; Approvals</option>
              <option value="Security">Security</option>
            </select>
          </div>

          {/* Role Filter */}
          <div className="flex items-center space-x-1.5 bg-[#F1F1ED] border border-[#DFE1DB] px-3 py-1.5 rounded-lg text-xs font-medium">
            <User className="h-3.5 w-3.5 text-[#5C636F]" />
            <span className="text-[#5C636F]">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent font-bold focus:outline-none cursor-pointer text-[#1A1D21]"
            >
              <option value="All">All Roles</option>
              <option value="superadmin">Super Admin</option>
              <option value="admin">Standard Admin</option>
              <option value="system">System Core</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1.5 bg-[#F1F1ED] border border-[#DFE1DB] px-3 py-1.5 rounded-lg text-xs font-medium">
            <Filter className="h-3.5 w-3.5 text-[#5C636F]" />
            <span className="text-[#5C636F]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-bold focus:outline-none cursor-pointer text-[#1A1D21]"
            >
              <option value="All">All Statuses</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
              <option value="REJECTED">REJECTED</option>
              <option value="SECURITY_ALERT">SECURITY_ALERT</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-[#5C636F] font-['IBM_Plex_Mono']">
          Showing <strong>{filteredLogs.length}</strong> of {auditLogs.length} Records
        </div>
      </div>

      {/* Audit Log Data Table */}
      <div className="bg-white border border-[#DFE1DB] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-['IBM_Plex_Sans']">
            <thead className="bg-[#F1F1ED] text-[11px] font-['IBM_Plex_Mono'] uppercase text-[#5C636F] border-b border-[#DFE1DB]">
              <tr>
                <th className="p-3">Audit ID &amp; Time</th>
                <th className="p-3">User &amp; Role</th>
                <th className="p-3">Module</th>
                <th className="p-3">Action Verb</th>
                <th className="p-3">Action Description &amp; Memo</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">State Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFE1DB]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#5C636F] font-['IBM_Plex_Mono']">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const hasStateDiff = log.previousState !== null || log.newState !== null;
                  return (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      {/* ID & Timestamp */}
                      <td className="p-3 space-y-0.5">
                        <div className="font-['IBM_Plex_Mono'] font-bold text-[#B53A1E]">{log.id}</div>
                        <div className="text-[10px] text-[#5C636F] flex items-center space-x-1 font-['IBM_Plex_Mono']">
                          <Clock className="h-3 w-3" />
                          <span>{log.timestamp}</span>
                        </div>
                      </td>

                      {/* User & Role */}
                      <td className="p-3 space-y-0.5">
                        <div className="font-bold text-[#1A1D21] flex items-center space-x-1">
                          <span>{log.userName}</span>
                        </div>
                        <div className="text-[10px] font-['IBM_Plex_Mono'] text-[#5C636F]">
                          {maskField(log.userId, "email")}
                        </div>
                        <span
                          className={`inline-block text-[9px] font-['IBM_Plex_Mono'] font-bold px-1.5 py-0.2 rounded uppercase ${
                            log.userRole === "superadmin"
                              ? "bg-red-100 text-red-800 border border-red-200"
                              : log.userRole === "admin"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-gray-100 text-gray-800 border border-gray-200"
                          }`}
                        >
                          {log.userRole}
                        </span>
                      </td>

                      {/* Module */}
                      <td className="p-3">
                        <span className="text-[10px] font-['IBM_Plex_Mono'] font-bold bg-[#F1F1ED] text-[#1A1D21] px-2 py-1 rounded border border-[#DFE1DB]">
                          {log.module}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="p-3">
                        <span className="font-['IBM_Plex_Mono'] font-bold text-xs text-[#1A1D21]">
                          {log.action}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="p-3 text-[#1A1D21] max-w-sm">
                        <p className="line-clamp-2">{log.description}</p>
                        {log.ipAddress && (
                          <span className="text-[9px] text-[#9AA0AA] font-['IBM_Plex_Mono'] block mt-0.5">
                            IP: {log.ipAddress}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-['IBM_Plex_Mono'] font-bold px-2 py-0.5 rounded border ${
                            log.status === "SUCCESS"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : log.status === "PENDING_APPROVAL"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : log.status === "REJECTED"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-purple-50 text-purple-700 border-purple-200"
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>

                      {/* State Diff Inspector Button */}
                      <td className="p-3 text-center">
                        {hasStateDiff ? (
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="px-2.5 py-1 bg-[#1A1D21] hover:bg-[#2A2E34] text-white rounded text-[10px] font-['IBM_Plex_Mono'] font-bold flex items-center space-x-1 mx-auto transition-colors cursor-pointer shadow-xs"
                          >
                            <Eye className="h-3 w-3" />
                            <span>Inspect Diff</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-[#9AA0AA] font-['IBM_Plex_Mono']">
                            No Mutation
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==============================================================================
          STATE DIFF & MUTATION INSPECTOR MODAL
         ============================================================================== */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-[#DFE1DB] shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#1A1D21] text-white p-4 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="bg-[#B53A1E] p-1.5 rounded-lg">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-['IBM_Plex_Mono'] font-bold text-sm text-[#FF6A3D]">
                      {selectedLog.id}
                    </span>
                    <span className="text-xs text-[#DFE1DB]">| {selectedLog.action}</span>
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded font-['IBM_Plex_Mono']">
                      {selectedLog.module}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A8AFB8] font-['IBM_Plex_Sans'] mt-0.5">
                    Triggered by <strong>{selectedLog.userName}</strong> ({selectedLog.userId}) at {selectedLog.timestamp}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCopyDiff(selectedLog)}
                  className="px-2.5 py-1.5 bg-[#2A2E34] hover:bg-[#3A3F47] text-white rounded-lg text-xs font-['IBM_Plex_Mono'] flex items-center space-x-1 transition-colors cursor-pointer"
                >
                  {copiedId === selectedLog.id ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-[#35C98B]" />
                      <span className="text-[#35C98B]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Diff</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-white hover:text-[#FF6A3D] p-1.5 rounded-lg transition-colors cursor-pointer text-lg font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body: State Comparison */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              <div className="p-3 bg-[#F1F1ED] rounded-lg border border-[#DFE1DB] text-xs font-['IBM_Plex_Sans']">
                <span className="font-bold font-['IBM_Plex_Mono'] uppercase text-[#5C636F] text-[10px] block">
                  ACTION DESCRIPTION
                </span>
                <p className="text-[#1A1D21] mt-1 font-medium">{selectedLog.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* PREVIOUS STATE */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-[#DFE1DB]">
                    <span className="text-xs font-bold font-['IBM_Plex_Mono'] text-[#B5281A] flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#B5281A]" />
                      <span>PREVIOUS STATE (BEFORE ACTION)</span>
                    </span>
                    <span className="text-[10px] text-[#5C636F] font-['IBM_Plex_Mono']">
                      {selectedLog.previousState ? "Existing Entity" : "Initial Creation"}
                    </span>
                  </div>

                  <div className="bg-[#1A1D21] text-[#E5E7EB] p-4 rounded-xl border border-[#2A2E34] text-xs font-['IBM_Plex_Mono'] overflow-x-auto max-h-72">
                    {selectedLog.previousState ? (
                      <pre className="text-rose-300 leading-relaxed whitespace-pre-wrap">
                        {JSON.stringify(selectedLog.previousState, null, 2)}
                      </pre>
                    ) : (
                      <span className="text-[#6B7280] italic">
                        [null] — No prior state. New record instantiated into database core.
                      </span>
                    )}
                  </div>
                </div>

                {/* NEW STATE */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-[#DFE1DB]">
                    <span className="text-xs font-bold font-['IBM_Plex_Mono'] text-[#157A4D] flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#157A4D]" />
                      <span>NEW STATE (AFTER MUTATION)</span>
                    </span>
                    <span className="text-[10px] text-[#5C636F] font-['IBM_Plex_Mono']">
                      {selectedLog.newState ? "Active Snapshot" : "Record Purged"}
                    </span>
                  </div>

                  <div className="bg-[#1A1D21] text-[#E5E7EB] p-4 rounded-xl border border-[#2A2E34] text-xs font-['IBM_Plex_Mono'] overflow-x-auto max-h-72">
                    {selectedLog.newState ? (
                      <pre className="text-emerald-300 leading-relaxed whitespace-pre-wrap">
                        {JSON.stringify(selectedLog.newState, null, 2)}
                      </pre>
                    ) : (
                      <span className="text-[#6B7280] italic">
                        [null] — Record state terminated or rejected.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-[#F1F1ED] p-3 px-6 border-t border-[#DFE1DB] flex justify-between items-center text-xs font-['IBM_Plex_Mono']">
              <span className="text-[#5C636F]">
                Hash Checksum Verified • Immutable Cryptographic Audit Node
              </span>
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 bg-[#1A1D21] hover:bg-[#2A2E34] text-white rounded-lg font-bold transition-colors cursor-pointer"
              >
                Close Diff Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
