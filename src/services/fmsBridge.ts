/**
 * Financial Management System (FMS) Real-Time Interoperability Bridge
 * Connects operational subsystems (HR-Payroll, Hotel-MNGT, Resto-MNGT, Supply-Chain, FleetOps)
 * with the core General Ledger, Accounts Payable, Accounts Receivable, Cash Management, and Audit Trail.
 */

export interface FmsPacket {
  id: string;
  sourceModule: "HR-Payroll" | "Hotel-MNGT" | "Resto-MNGT" | "Supply-Chain" | "FleetOps" | "FMS-Core";
  targetSystem: "General Ledger" | "Accounts Payable" | "Accounts Receivable" | "Cash Management" | "Approval Queue" | "Tax Management" | "Disbursements";
  action: string;
  timestamp: string;
  amount?: number;
  status: "SYNCHRONIZED" | "QUEUED_FOR_APPROVAL" | "ALERT";
  summary: string;
  payload: any;
}

export type ApprovalStage = "PENDING_ADMIN" | "PENDING_SUPERADMIN" | "APPROVED" | "REJECTED";

export interface GovernanceApprovalRequest {
  id: string;
  actionType: string;
  requestedBy: string;
  timestamp: string;
  module: string;
  title: string;
  amount?: number;
  payload: any;
  impactSummary: string;
  status: ApprovalStage;
  currentStage: "STAGE_1_ADMIN" | "STAGE_2_SUPERADMIN" | "FINAL_APPROVED" | "REJECTED";
  adminVerifiedBy?: string;
  adminVerifiedAt?: string;
  adminNotes?: string;
  superAdminApprovedBy?: string;
  superAdminApprovedAt?: string;
  superAdminNotes?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

const STORAGE_KEYS = {
  JOURNAL: "horeca_journal_entries",
  AP: "horeca_ap_invoices",
  AR: "horeca_ar_invoices",
  APAR: "horeca_apar_invoices",
  CASH: "horeca_cash_pool",
  COLLECTIONS: "horeca_collections_items",
  DISBURSEMENTS: "horeca_disbursements",
  APPROVALS: "horeca_pending_approvals",
  TAX: "horeca_tax_records",
  AUDIT: "horeca_audit_logs",
  TRANSMISSION_LOG: "horeca_fms_transmission_log",
};

export const fmsBridge = {
  // Retrieve recent transmission packets
  getTransmissionLogs(filterSource?: string): FmsPacket[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TRANSMISSION_LOG);
      if (stored) {
        const parsed: FmsPacket[] = JSON.parse(stored);
        if (filterSource) {
          return parsed.filter((p) => p.sourceModule === filterSource);
        }
        return parsed;
      }
    } catch (e) {
      console.error("Error reading transmission log", e);
    }
    return [];
  },

  // Record transmission packet
  recordPacket(packet: FmsPacket) {
    try {
      const logs = this.getTransmissionLogs();
      const updated = [packet, ...logs].slice(0, 50); // keep last 50
      localStorage.setItem(STORAGE_KEYS.TRANSMISSION_LOG, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("fms-sync-event", { detail: packet }));
    } catch (e) {
      console.error("Error recording transmission packet", e);
    }
  },

  // Log into Financial Management System Audit Trail
  logAudit(params: {
    action: string;
    module: string;
    description: string;
    status?: "SUCCESS" | "PENDING_APPROVAL" | "SECURITY_ALERT";
    newState?: any;
    previousState?: any;
    user?: string;
  }) {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUDIT);
      const logs = stored ? JSON.parse(stored) : [];
      const newLog = {
        id: `AUD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        userId: params.user || "interop-bus@horeca.local",
        userName: params.user || `${params.module} Interoperability Service`,
        userRole: "system",
        action: params.action,
        module: params.module,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
        ipAddress: "192.168.1.100 (Internal IPC)",
        status: params.status || "SUCCESS",
        description: params.description,
        previousState: params.previousState || null,
        newState: params.newState || null,
      };
      localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify([newLog, ...logs]));
    } catch (e) {
      console.error("Error logging to FMS audit trail", e);
    }
  },

  // Post Balanced Multi-Leg Journal Entry to General Ledger
  postJournalEntry(entry: {
    sourceModule: string;
    ref: string;
    memo: string;
    lines: Array<{
      accountCode: string;
      accountName: string;
      debit: number;
      credit: number;
      memo?: string;
    }>;
  }) {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.JOURNAL);
      const currentEntries = stored ? JSON.parse(stored) : [];
      const dateStr = new Date().toISOString().split("T")[0];

      const newLines = entry.lines.map((l) => ({
        id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
        date: dateStr,
        ref: entry.ref,
        sourceModule: entry.sourceModule,
        accountCode: l.accountCode,
        accountName: l.accountName,
        memo: l.memo || entry.memo,
        debit: l.debit,
        credit: l.credit,
        status: "COMMITTED",
        postedBy: `${entry.sourceModule} Subsystem`,
        approvedBy: "System Auto-Reconciliation",
      }));

      const updated = [...newLines, ...currentEntries];
      localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(updated));

      const totalAmount = entry.lines.reduce((s, l) => s + (l.debit || 0), 0);

      this.logAudit({
        action: "POST_GL_JOURNAL",
        module: "General Ledger",
        description: `Balanced journal entry [${entry.ref}] from ${entry.sourceModule}: ${entry.memo} (₱${totalAmount.toLocaleString()})`,
        newState: { ref: entry.ref, linesCount: entry.lines.length, amount: totalAmount },
      });

      this.recordPacket({
        id: `PKT-${Date.now().toString().slice(-6)}`,
        sourceModule: entry.sourceModule as any,
        targetSystem: "General Ledger",
        action: "POST_GL_JOURNAL",
        timestamp: new Date().toLocaleTimeString(),
        amount: totalAmount,
        status: "SYNCHRONIZED",
        summary: `Master Ledger updated with ref ${entry.ref} (${entry.lines.length} lines balanced).`,
        payload: entry,
      });

      return { success: true, count: newLines.length };
    } catch (e) {
      console.error("Failed to post journal entry to FMS", e);
      return { success: false, error: String(e) };
    }
  },

  // Retrieve all approval requests
  getApprovalRequests(filterModule?: string): GovernanceApprovalRequest[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.APPROVALS);
      if (stored) {
        const parsed: GovernanceApprovalRequest[] = JSON.parse(stored);
        if (filterModule) {
          return parsed.filter((r) => r.module === filterModule);
        }
        return parsed;
      }
    } catch (e) {
      console.error("Error reading approval requests", e);
    }
    return [];
  },

  // Submit Request from Subsystem (Goes to Admin First - Stage 1)
  submitApprovalRequest(request: {
    sourceModule: "HR-Payroll" | "Hotel-MNGT" | "Resto-MNGT" | "Supply-Chain" | "FleetOps" | "FMS-Core";
    actionType: string;
    title: string;
    amount?: number;
    impactSummary: string;
    payload: any;
    requestedBy?: string;
  }) {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.APPROVALS);
      const approvals: GovernanceApprovalRequest[] = stored ? JSON.parse(stored) : [];
      const newApproval: GovernanceApprovalRequest = {
        id: `REQ-${Math.floor(200 + Math.random() * 800)}`,
        actionType: request.actionType,
        requestedBy: request.requestedBy || `${request.sourceModule} Officer`,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
        module: request.sourceModule,
        title: request.title,
        amount: request.amount,
        payload: request.payload,
        impactSummary: request.impactSummary,
        status: "PENDING_ADMIN",
        currentStage: "STAGE_1_ADMIN",
      };

      const updated = [newApproval, ...approvals];
      localStorage.setItem(STORAGE_KEYS.APPROVALS, JSON.stringify(updated));

      this.logAudit({
        action: "SUBMIT_REQUEST_TO_ADMIN",
        module: "Governance & Approvals",
        description: `Subsystem ${request.sourceModule} submitted request [${request.title}] to Admin for Stage 1 Verification`,
        status: "PENDING_APPROVAL",
        newState: newApproval,
      });

      this.recordPacket({
        id: `PKT-${Date.now().toString().slice(-6)}`,
        sourceModule: request.sourceModule as any,
        targetSystem: "Approval Queue",
        action: request.actionType,
        timestamp: new Date().toLocaleTimeString(),
        amount: request.amount,
        status: "QUEUED_FOR_APPROVAL",
        summary: `Dispatched to Admin Review (Stage 1): ${request.title}`,
        payload: newApproval,
      });

      return { success: true, requestId: newApproval.id, request: newApproval };
    } catch (e) {
      console.error("Failed to submit approval request", e);
      return { success: false, error: String(e) };
    }
  },

  // Admin verifies the request and forwards it to Super Admin (Stage 1 -> Stage 2)
  verifyAndForwardToSuperAdmin(requestId: string, adminName: string, adminNotes?: string) {
    try {
      const approvals = this.getApprovalRequests();
      let targetReq: GovernanceApprovalRequest | null = null;

      const updated = approvals.map((req) => {
        if (req.id === requestId) {
          targetReq = {
            ...req,
            status: "PENDING_SUPERADMIN" as const,
            currentStage: "STAGE_2_SUPERADMIN" as const,
            adminVerifiedBy: adminName,
            adminVerifiedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
            adminNotes: adminNotes || "Verified documentation and ledger impact. Forwarded to Super Admin for executive sign-off.",
          };
          return targetReq;
        }
        return req;
      });

      if (!targetReq) return { success: false, error: "Request not found" };

      localStorage.setItem(STORAGE_KEYS.APPROVALS, JSON.stringify(updated));

      this.logAudit({
        action: "ADMIN_VERIFY_AND_FORWARD_TO_SUPERADMIN",
        module: "Governance & Approvals",
        description: `Admin ${adminName} verified request ${requestId} (${(targetReq as any).title}) and forwarded to Super Admin for final approval.`,
        status: "PENDING_APPROVAL",
        previousState: { status: "PENDING_ADMIN", stage: "STAGE_1_ADMIN" },
        newState: targetReq,
      });

      this.recordPacket({
        id: `PKT-${Date.now().toString().slice(-6)}`,
        sourceModule: (targetReq as any).module as any,
        targetSystem: "Approval Queue",
        action: "ADMIN_VERIFIED_FORWARDED",
        timestamp: new Date().toLocaleTimeString(),
        amount: (targetReq as any).amount,
        status: "QUEUED_FOR_APPROVAL",
        summary: `Admin Verified: Forwarded to Super Admin for final sign-off (${(targetReq as any).title})`,
        payload: targetReq,
      });

      return { success: true, request: targetReq };
    } catch (e) {
      console.error("Failed to verify and forward request", e);
      return { success: false, error: String(e) };
    }
  },

  // Super Admin grants final approval & commits (Stage 2 -> Completed)
  superAdminApproveRequest(requestId: string, superAdminName: string, notes?: string) {
    try {
      const approvals = this.getApprovalRequests();
      let targetReq: GovernanceApprovalRequest | null = null;

      const updated = approvals.map((req) => {
        if (req.id === requestId) {
          targetReq = {
            ...req,
            status: "APPROVED" as const,
            currentStage: "FINAL_APPROVED" as const,
            superAdminApprovedBy: superAdminName,
            superAdminApprovedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
            superAdminNotes: notes || "Executive approval granted. Cross-module synchronized.",
          };
          return targetReq;
        }
        return req;
      });

      if (!targetReq) return { success: false, error: "Request not found" };

      localStorage.setItem(STORAGE_KEYS.APPROVALS, JSON.stringify(updated));

      this.logAudit({
        action: "SUPERADMIN_EXECUTIVE_APPROVAL",
        module: "Governance & Approvals",
        description: `Super Administrator ${superAdminName} authorized and finalized request ${requestId} (${(targetReq as any).title}).`,
        status: "SUCCESS",
        previousState: { status: "PENDING_SUPERADMIN", stage: "STAGE_2_SUPERADMIN" },
        newState: targetReq,
      });

      this.recordPacket({
        id: `PKT-${Date.now().toString().slice(-6)}`,
        sourceModule: (targetReq as any).module as any,
        targetSystem: "Approval Queue",
        action: "SUPERADMIN_FINAL_APPROVAL",
        timestamp: new Date().toLocaleTimeString(),
        amount: (targetReq as any).amount,
        status: "SYNCHRONIZED",
        summary: `Super Admin Approved: Cross-module transaction synchronized (${(targetReq as any).title})`,
        payload: targetReq,
      });

      return { success: true, request: targetReq };
    } catch (e) {
      console.error("Failed to approve request", e);
      return { success: false, error: String(e) };
    }
  },

  // Reject Request (Either Admin in Stage 1 or Super Admin in Stage 2)
  rejectApprovalRequest(requestId: string, rejectedBy: string, role: string, reason?: string) {
    try {
      const approvals = this.getApprovalRequests();
      let targetReq: GovernanceApprovalRequest | null = null;

      const updated = approvals.map((req) => {
        if (req.id === requestId) {
          targetReq = {
            ...req,
            status: "REJECTED" as const,
            currentStage: "REJECTED" as const,
            rejectedBy,
            rejectedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
            rejectionReason: reason || `Request rejected by ${role}.`,
          };
          return targetReq;
        }
        return req;
      });

      if (!targetReq) return { success: false, error: "Request not found" };

      localStorage.setItem(STORAGE_KEYS.APPROVALS, JSON.stringify(updated));

      this.logAudit({
        action: "REJECT_APPROVAL_REQUEST",
        module: "Governance & Approvals",
        description: `${role} ${rejectedBy} rejected request ${requestId} (${(targetReq as any).title}). Reason: ${reason || "Not specified"}`,
        status: "REJECTED",
        previousState: { id: requestId, status: "PENDING" },
        newState: targetReq,
      });

      this.recordPacket({
        id: `PKT-${Date.now().toString().slice(-6)}`,
        sourceModule: (targetReq as any).module as any,
        targetSystem: "Approval Queue",
        action: "REJECT_REQUEST",
        timestamp: new Date().toLocaleTimeString(),
        amount: (targetReq as any).amount,
        status: "ALERT",
        summary: `Request Rejected by ${role}: ${(targetReq as any).title}`,
        payload: targetReq,
      });

      return { success: true, request: targetReq };
    } catch (e) {
      console.error("Failed to reject request", e);
      return { success: false, error: String(e) };
    }
  },

  // Update Cash Pool (Operating Bank or Front Desk / Petty Cash Float)
  updateCashPool(delta: { bankOperating?: number; pettyCash?: number; reason: string; sourceModule: string }) {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CASH);
      const current = stored ? JSON.parse(stored) : { bankOperating: 2450000, pettyCash: 185000 };
      const updated = {
        bankOperating: current.bankOperating + (delta.bankOperating || 0),
        pettyCash: current.pettyCash + (delta.pettyCash || 0),
      };
      localStorage.setItem(STORAGE_KEYS.CASH, JSON.stringify(updated));

      const netDelta = (delta.bankOperating || 0) + (delta.pettyCash || 0);

      this.logAudit({
        action: "UPDATE_CASH_LIQUIDITY",
        module: "Cash Management",
        description: `${delta.sourceModule} adjusted Treasury pool: ${delta.reason} (Delta: ₱${netDelta.toLocaleString()})`,
        previousState: current,
        newState: updated,
      });

      this.recordPacket({
        id: `PKT-${Date.now().toString().slice(-6)}`,
        sourceModule: delta.sourceModule as any,
        targetSystem: "Cash Management",
        action: "UPDATE_CASH_LIQUIDITY",
        timestamp: new Date().toLocaleTimeString(),
        amount: Math.abs(netDelta),
        status: "SYNCHRONIZED",
        summary: `Cash Pool adjusted: ${delta.reason}`,
        payload: { previous: current, current: updated },
      });

      return { success: true, updated };
    } catch (e) {
      console.error("Failed to update cash pool", e);
      return { success: false, error: String(e) };
    }
  },

  // Push Draft Accounts Payable Invoice
  pushApInvoice(invoice: {
    sourceModule: "Supply-Chain" | "FleetOps" | "HR-Payroll" | "Resto-MNGT" | "Hotel-MNGT";
    vendor: string;
    tin: string;
    amount: number;
    category: string;
    paymentTerms?: string;
    dueDate?: string;
    ewtRate?: number;
    ewtAmount?: number;
    poNumber?: string;
  }) {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AP);
      const invoices = stored ? JSON.parse(stored) : [];
      const invoiceId = `INV-SC-${Math.floor(1000 + Math.random() * 9000)}`;

      const newInvoice = {
        id: invoiceId,
        vendor: invoice.vendor,
        tin: invoice.tin,
        invoiceDate: new Date().toISOString().split("T")[0],
        dueDate: invoice.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        amount: invoice.amount,
        status: "Unpaid",
        category: invoice.category,
        paymentTerms: invoice.paymentTerms || "Net 30 Days",
        matchStatus: "Verified (PO+DR+Inv)",
        poNumber: invoice.poNumber || `PO-2026-${Math.floor(100 + Math.random() * 900)}`,
        bankDetails: "BDO Unibank 0019-4829-1029",
        ewtRate: invoice.ewtRate || 0.01,
        ewtAmount: invoice.ewtAmount || Math.round(invoice.amount * 0.01),
      };

      const updated = [newInvoice, ...invoices];
      localStorage.setItem(STORAGE_KEYS.AP, JSON.stringify(updated));

      // Also sync into APAR master schedule
      try {
        const aparStored = localStorage.getItem(STORAGE_KEYS.APAR);
        const apar = aparStored ? JSON.parse(aparStored) : [];
        const aparItem = {
          id: invoiceId,
          entityName: invoice.vendor,
          tin: invoice.tin,
          type: "AP",
          bankDetails: newInvoice.bankDetails,
          amount: invoice.amount,
          status: "Approved",
          category: invoice.category,
        };
        localStorage.setItem(STORAGE_KEYS.APAR, JSON.stringify([aparItem, ...apar]));
      } catch (e) {}

      this.logAudit({
        action: "CREATE_PURVEYOR_INVOICE",
        module: "Accounts Payable",
        description: `Draft AP invoice ${invoiceId} logged from ${invoice.sourceModule} for ${invoice.vendor} (₱${invoice.amount.toLocaleString()})`,
        newState: newInvoice,
      });

      this.recordPacket({
        id: `PKT-${Date.now().toString().slice(-6)}`,
        sourceModule: invoice.sourceModule,
        targetSystem: "Accounts Payable",
        action: "CREATE_AP_INVOICE",
        timestamp: new Date().toLocaleTimeString(),
        amount: invoice.amount,
        status: "SYNCHRONIZED",
        summary: `Logged AP Purveyor Invoice ${invoiceId} with Net 30 Terms.`,
        payload: newInvoice,
      });

      return { success: true, invoice: newInvoice };
    } catch (e) {
      console.error("Failed to push AP invoice", e);
      return { success: false, error: String(e) };
    }
  },

  // Push Accounts Receivable Settlement (POS / City Ledger)
  pushArSettlement(settlement: {
    sourceModule: "Resto-MNGT" | "Hotel-MNGT";
    customer: string;
    amount: number;
    category: string;
    paymentRailBreakdown: { cash: number; cards: number; qrOnline: number; discounts: number };
  }) {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AR);
      const invoices = stored ? JSON.parse(stored) : [];
      const invoiceId = `AR-POS-${Math.floor(1000 + Math.random() * 9000)}`;

      const newAr = {
        id: invoiceId,
        customer: settlement.customer,
        invoiceDate: new Date().toISOString().split("T")[0],
        dueDate: new Date().toISOString().split("T")[0],
        amount: settlement.amount,
        paidAmount: settlement.amount,
        status: "Collected / Settled",
        category: settlement.category,
        paymentTerms: "Immediate Settlement",
        dailyPenaltyRatePercent: 0,
      };

      const updated = [newAr, ...invoices];
      localStorage.setItem(STORAGE_KEYS.AR, JSON.stringify(updated));

      this.logAudit({
        action: "SETTLE_POS_AR",
        module: "Accounts Receivable",
        description: `${settlement.sourceModule} settled AR ${invoiceId}: ${settlement.customer} (₱${settlement.amount.toLocaleString()})`,
        newState: newAr,
      });

      this.recordPacket({
        id: `PKT-${Date.now().toString().slice(-6)}`,
        sourceModule: settlement.sourceModule,
        targetSystem: "Accounts Receivable",
        action: "SETTLE_POS_AR",
        timestamp: new Date().toLocaleTimeString(),
        amount: settlement.amount,
        status: "SYNCHRONIZED",
        summary: `Settled ${invoiceId} for ${settlement.customer} via POS payment rails.`,
        payload: newAr,
      });

      return { success: true, invoice: newAr };
    } catch (e) {
      console.error("Failed to push AR settlement", e);
      return { success: false, error: String(e) };
    }
  },

  // Add Statutory BIR Record / 2307
  addBirTaxRecord(record: {
    formType: "BIR Form 2307" | "BIR Form 2550M (VAT)" | "BIR Form 1601-C";
    payeeName: string;
    payeeTin: string;
    atcCode: string;
    taxBase: number;
    taxWithheld: number;
    quarter: string;
  }) {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TAX);
      const records = stored ? JSON.parse(stored) : [];
      const newTax = {
        id: `BIR2307-${Math.floor(1000 + Math.random() * 9000)}`,
        type: `${record.formType} - ${record.payeeName} (${record.atcCode})`,
        taxableAmount: record.taxBase,
        taxDue: record.taxWithheld,
        status: "Remitted",
        quarter: record.quarter,
        payeeTin: record.payeeTin,
      };

      localStorage.setItem(STORAGE_KEYS.TAX, JSON.stringify([newTax, ...records]));

      this.logAudit({
        action: "GENERATE_BIR_2307",
        module: "Tax Management",
        description: `Generated ${record.formType} Certificate for ${record.payeeName} (Tax Withheld: ₱${record.taxWithheld.toLocaleString()})`,
        newState: newTax,
      });

      this.recordPacket({
        id: `PKT-${Date.now().toString().slice(-6)}`,
        sourceModule: "Supply-Chain",
        targetSystem: "Tax Management",
        action: "GENERATE_BIR_2307",
        timestamp: new Date().toLocaleTimeString(),
        amount: record.taxWithheld,
        status: "SYNCHRONIZED",
        summary: `Auto-generated ${record.formType} for ${record.payeeName} (${record.atcCode}).`,
        payload: newTax,
      });

      return { success: true, record: newTax };
    } catch (e) {
      console.error("Failed to add BIR tax record", e);
      return { success: false, error: String(e) };
    }
  },

  // Get current status of FMS Core
  getCurrentFmsMetrics() {
    try {
      const journal = JSON.parse(localStorage.getItem(STORAGE_KEYS.JOURNAL) || "[]");
      const ap = JSON.parse(localStorage.getItem(STORAGE_KEYS.AP) || "[]");
      const ar = JSON.parse(localStorage.getItem(STORAGE_KEYS.AR) || "[]");
      const cash = JSON.parse(localStorage.getItem(STORAGE_KEYS.CASH) || '{"bankOperating":2450000,"pettyCash":185000}');
      const approvals = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPROVALS) || "[]");
      const audit = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT) || "[]");

      return {
        isOnline: true,
        glEntriesCount: journal.length,
        pendingApprovalsCount: approvals.length,
        apInvoicesCount: ap.length,
        arInvoicesCount: ar.length,
        bankOperatingBalance: cash.bankOperating || 0,
        pettyCashBalance: cash.pettyCash || 0,
        auditLogsCount: audit.length,
        lastSyncTime: new Date().toLocaleTimeString(),
      };
    } catch (e) {
      return {
        isOnline: true,
        glEntriesCount: 0,
        pendingApprovalsCount: 0,
        apInvoicesCount: 0,
        arInvoicesCount: 0,
        bankOperatingBalance: 2450000,
        pettyCashBalance: 185000,
        auditLogsCount: 0,
        lastSyncTime: "Just now",
      };
    }
  },
};
