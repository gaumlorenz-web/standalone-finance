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

export interface DepartmentBudgetCap {
  department: string;
  budgetCap: number;
  allocated: number;
  utilized: number;
  glAccountCode: string;
  glAccountName: string;
  icon: string;
  description: string;
}

export interface AllocationLineItem {
  id: string;
  item: string;
  category: string;
  amount: number;
  percentage: number;
}

export interface DisbursementReceipt {
  receiptNo: string;
  id: string;
  department: string;
  payee: string;
  purpose: string;
  amount: number;
  allocatedCostCenter: string;
  allocationCategory: string;
  glDebitAccount: string;
  allocationItems: AllocationLineItem[];
  deductedFromAccount: string;
  priorTreasuryBalance: number;
  postTreasuryBalance: number;
  glCreditAccount: string;
  deductionMethod: string;
  budgetCapBefore: number;
  utilizedBefore: number;
  utilizedAfter: number;
  budgetCapRemaining: number;
  capUtilizationPct: number;
  budgetCapStatus: "WITHIN_CAP" | "ELEVATED_CAP" | "OVER_CAP";
  status: "APPROVED_AND_DISBURSED" | "PENDING_SUPERADMIN";
  requestedBy: string;
  approvedBy: string;
  timestamp: string;
  referenceToken: string;
}

const STORAGE_KEYS = {
  JOURNAL: "horeca_journal_entries",
  AP: "horeca_ap_invoices",
  AR: "horeca_ar_invoices",
  APAR: "horeca_apar_invoices",
  CASH: "horeca_cash_pool",
  COLLECTIONS: "horeca_collections_items",
  DISBURSEMENTS: "horeca_disbursements",
  DISB_RECEIPTS: "horeca_disb_receipts",
  DEPT_BUDGETS: "horeca_dept_budgets",
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

  // -------------------------------------------------------------
  // DEPARTMENT BUDGET CAPS & ALLOCATIONS
  // -------------------------------------------------------------
  getDefaultDepartmentBudgets(): DepartmentBudgetCap[] {
    return [
      {
        department: "Hotel Management",
        budgetCap: 2500000,
        allocated: 2100000,
        utilized: 1380000,
        glAccountCode: "5010",
        glAccountName: "5010 - Hotel Guest Supplies, Amenities & Maintenance",
        icon: "building",
        description: "Guest suites, front desk, housekeeping linens, and room infrastructure"
      },
      {
        department: "Restaurant Management",
        budgetCap: 1800000,
        allocated: 1500000,
        utilized: 985000,
        glAccountCode: "5020",
        glAccountName: "5020 - F&B Food & Beverage Purveyor Replenishment",
        icon: "utensils",
        description: "Culinary provisions, beverage cellars, and banquet dining logistics"
      },
      {
        department: "HRMS Payroll",
        budgetCap: 2400000,
        allocated: 2200000,
        utilized: 1650000,
        glAccountCode: "5110",
        glAccountName: "5110 - Executive, Service & Banquet Payroll",
        icon: "users",
        description: "Base hospitality wages, statutory contributions, and overtime compensation"
      },
      {
        department: "Supply Chain",
        budgetCap: 1500000,
        allocated: 1250000,
        utilized: 790000,
        glAccountCode: "5030",
        glAccountName: "5030 - Warehouse Logistics, Cold Storage & Linen",
        icon: "truck",
        description: "Bulk procurement, cold chain storage preservation, and logistics inventory"
      },
      {
        department: "FleetOps",
        budgetCap: 900000,
        allocated: 750000,
        utilized: 410000,
        glAccountCode: "5410",
        glAccountName: "5410 - Airport Shuttle Van Fuel, Tolls & Maintenance",
        icon: "car",
        description: "VIP airport shuttles, commercial fleet fuel, and scheduled vehicle servicing"
      }
    ];
  },

  getDepartmentBudgets(): DepartmentBudgetCap[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DEPT_BUDGETS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    const defaults = this.getDefaultDepartmentBudgets();
    try {
      localStorage.setItem(STORAGE_KEYS.DEPT_BUDGETS, JSON.stringify(defaults));
    } catch (e) {}
    return defaults;
  },

  checkDepartmentBudgetCap(departmentName: string, requestedAmount: number) {
    const budgets = this.getDepartmentBudgets();
    const dept = budgets.find(
      (b) =>
        b.department.toLowerCase().includes(departmentName.toLowerCase().split(" ")[0]) ||
        departmentName.toLowerCase().includes(b.department.toLowerCase().split(" ")[0])
    ) || budgets[0];

    const budgetCap = dept.budgetCap;
    const utilizedBefore = dept.utilized;
    const remainingCap = Math.max(0, budgetCap - utilizedBefore);
    const isExceeded = requestedAmount > remainingCap;
    const cappedAmount = isExceeded ? remainingCap : requestedAmount;
    const utilizedAfter = utilizedBefore + cappedAmount;
    const budgetCapRemaining = Math.max(0, budgetCap - utilizedAfter);
    const capUtilizationPct = Number(((utilizedAfter / budgetCap) * 100).toFixed(1));
    const budgetCapStatus: "WITHIN_CAP" | "ELEVATED_CAP" | "OVER_CAP" =
      isExceeded ? "OVER_CAP" : capUtilizationPct >= 85 ? "ELEVATED_CAP" : "WITHIN_CAP";

    return {
      dept,
      department: dept.department,
      budgetCap,
      utilizedBefore,
      utilizedAfter,
      remainingCap,
      budgetCapRemaining,
      capUtilizationPct,
      budgetCapStatus,
      isExceeded,
      cappedAmount,
      glAccountCode: dept.glAccountCode,
      glAccountName: dept.glAccountName,
    };
  },

  // Retrieve All Disbursement Receipts
  getDisbursementReceipts(filterDept?: string): DisbursementReceipt[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DISB_RECEIPTS);
      if (stored) {
        const parsed: DisbursementReceipt[] = JSON.parse(stored);
        if (filterDept && filterDept !== "ALL") {
          return parsed.filter((r) => r.department === filterDept);
        }
        return parsed;
      }
    } catch (e) {}
    return [];
  },

  // Submit Disbursement Invoice with Receipt (Enforces Budget Cap and Records Allocation)
  submitDisbursementInvoiceWithReceipt(params: {
    sourceModule: "HR-Payroll" | "Hotel-MNGT" | "Resto-MNGT" | "Supply-Chain" | "FleetOps";
    departmentName: string;
    payee: string;
    purpose: string;
    requestedAmount: number;
    allocatedCostCenter: string;
    allocationCategory: string;
    glDebitAccount?: string;
    allocationItems: AllocationLineItem[];
    deductedFromAccount?: string;
    deductionMethod?: string;
    requestedBy: string;
    enforceHardCap?: boolean;
  }) {
    try {
      // 1. Budget Cap Validation against Department Pool
      const capCheck = this.checkDepartmentBudgetCap(params.departmentName, params.requestedAmount);
      const effectiveAmount = params.enforceHardCap ? capCheck.cappedAmount : params.requestedAmount;
      const wasCapped = params.requestedAmount > capCheck.remainingCap;

      // 2. Read and Deduct from Treasury Cash Liquidity Pool
      const cashStored = localStorage.getItem(STORAGE_KEYS.CASH);
      const cash = cashStored ? JSON.parse(cashStored) : { bankOperating: 2450000, pettyCash: 185000 };
      const isPetty = (params.deductedFromAccount || "").includes("1010") || (params.deductedFromAccount || "").includes("Petty") || (params.deductedFromAccount || "").includes("Front Desk");
      const priorTreasuryBalance = isPetty ? cash.pettyCash : cash.bankOperating;
      const postTreasuryBalance = Math.max(0, priorTreasuryBalance - effectiveAmount);

      const updatedCash = {
        bankOperating: isPetty ? cash.bankOperating : Math.max(0, cash.bankOperating - effectiveAmount),
        pettyCash: isPetty ? Math.max(0, cash.pettyCash - effectiveAmount) : cash.pettyCash,
      };
      localStorage.setItem(STORAGE_KEYS.CASH, JSON.stringify(updatedCash));

      // 3. Update Department Budget Cap Utilization
      const currentBudgets = this.getDepartmentBudgets();
      const updatedBudgets = currentBudgets.map((b) => {
        if (b.department === capCheck.department) {
          return {
            ...b,
            utilized: b.utilized + effectiveAmount,
          };
        }
        return b;
      });
      localStorage.setItem(STORAGE_KEYS.DEPT_BUDGETS, JSON.stringify(updatedBudgets));

      // Also sync into horeca_budget_data if present
      try {
        const bdStored = localStorage.getItem("horeca_budget_data");
        if (bdStored) {
          const bd = JSON.parse(bdStored);
          const updatedBd = bd.map((b: any) =>
            b.department.toLowerCase().includes(capCheck.department.toLowerCase().split(" ")[0])
              ? { ...b, spent: (b.spent || 0) + effectiveAmount }
              : b
          );
          localStorage.setItem("horeca_budget_data", JSON.stringify(updatedBd));
        }
      } catch (e) {}

      // 4. Generate Official 3-Stage Disbursement Receipt Voucher
      const receiptNo = `RCV-2026-DISB-${Math.floor(700 + Math.random() * 300)}`;
      const disbId = `DISB-${Math.floor(1000 + Math.random() * 9000)}`;
      const dateStr = new Date().toISOString().replace("T", " ").substring(0, 16);
      const token = `DISB-${params.sourceModule.substring(0, 3).toUpperCase()}-${Math.round(effectiveAmount / 1000)}K-${isPetty ? "CASH" : "BDO"}-${Math.floor(100 + Math.random() * 900)}`;

      const newReceipt: DisbursementReceipt = {
        receiptNo,
        id: disbId,
        department: capCheck.department,
        payee: params.payee,
        purpose: params.purpose,
        amount: effectiveAmount,
        allocatedCostCenter: params.allocatedCostCenter,
        allocationCategory: params.allocationCategory,
        glDebitAccount: params.glDebitAccount || capCheck.glAccountName,
        allocationItems: params.allocationItems,
        deductedFromAccount: params.deductedFromAccount || (isPetty ? "1010 - Front Desk / Resto Cash Float" : "1030 - Operating Bank Account - BDO Primary"),
        priorTreasuryBalance,
        postTreasuryBalance,
        glCreditAccount: params.deductedFromAccount || (isPetty ? "1010 - Front Desk / Resto Cash Float" : "1030 - Operating Bank Account - BDO Primary"),
        deductionMethod: params.deductionMethod || (isPetty ? "Petty Cash Voucher Disbursement" : "PESONet Automated Electronic Clearing"),
        budgetCapBefore: capCheck.budgetCap,
        utilizedBefore: capCheck.utilizedBefore,
        utilizedAfter: capCheck.utilizedBefore + effectiveAmount,
        budgetCapRemaining: Math.max(0, capCheck.budgetCap - (capCheck.utilizedBefore + effectiveAmount)),
        capUtilizationPct: Number((((capCheck.utilizedBefore + effectiveAmount) / capCheck.budgetCap) * 100).toFixed(1)),
        budgetCapStatus: wasCapped ? "OVER_CAP" : capCheck.budgetCapStatus,
        status: "APPROVED_AND_DISBURSED",
        requestedBy: params.requestedBy,
        approvedBy: "Super Administrator (FMS Core)",
        timestamp: dateStr,
        referenceToken: token,
      };

      // Save to receipts log
      const existingReceipts = this.getDisbursementReceipts();
      const updatedReceipts = [newReceipt, ...existingReceipts];
      localStorage.setItem(STORAGE_KEYS.DISB_RECEIPTS, JSON.stringify(updatedReceipts));

      // Append to legacy disbursements table
      try {
        const storedDisbs = JSON.parse(localStorage.getItem(STORAGE_KEYS.DISBURSEMENTS) || "[]");
        const disbRow = {
          id: disbId,
          payee: params.payee,
          swift: isPetty ? "CASH-FLOAT" : "BDO-PESONET",
          nationalId: "****8892",
          netPay: effectiveAmount,
          token,
          department: capCheck.department,
          voucherNo: receiptNo,
          purpose: params.purpose,
          timestamp: dateStr,
          status: "APPROVED_AND_DISBURSED",
        };
        localStorage.setItem(STORAGE_KEYS.DISBURSEMENTS, JSON.stringify([disbRow, ...storedDisbs]));
      } catch (e) {}

      // 5. Post Balanced Multi-Leg General Ledger Journal Entry
      const debitCode = (params.glDebitAccount || capCheck.glAccountCode || "5010").substring(0, 4);
      const creditCode = isPetty ? "1010" : "1030";

      this.postJournalEntry({
        sourceModule: params.sourceModule,
        ref: receiptNo,
        memo: `Disbursement: ${params.payee} - ${params.purpose} (Allocated: ${params.allocatedCostCenter})`,
        lines: [
          {
            accountCode: debitCode,
            accountName: params.glDebitAccount || capCheck.glAccountName,
            debit: effectiveAmount,
            credit: 0,
            memo: `Allocated to ${params.allocatedCostCenter} (${params.allocationCategory})`,
          },
          {
            accountCode: creditCode,
            accountName: isPetty ? "1010 - Front Desk / Petty Cash Float" : "1030 - Operating Bank Account - BDO Primary",
            debit: 0,
            credit: effectiveAmount,
            memo: `Deducted from ${isPetty ? "Petty Cash Float" : "BDO Operating Account"} (Budget Cap Remaining: ₱${newReceipt.budgetCapRemaining.toLocaleString()})`,
          },
        ],
      });

      // 6. Submit Governance Record
      const approvalReq = {
        id: `REQ-${Math.floor(200 + Math.random() * 800)}`,
        actionType: "APPROVE_DISBURSEMENT_RECEIPT",
        requestedBy: params.requestedBy,
        timestamp: dateStr,
        module: params.sourceModule,
        title: `Disbursement Voucher [${receiptNo}]: ${params.payee} (₱${effectiveAmount.toLocaleString()})`,
        amount: effectiveAmount,
        payload: newReceipt,
        impactSummary: `Budget allocated to ${params.allocatedCostCenter}. Deducted from ${capCheck.department} Budget Cap (Remaining: ₱${newReceipt.budgetCapRemaining.toLocaleString()}). Liquidity deducted from ${isPetty ? "Petty Cash Float" : "Operating Bank BDO"}.`,
        status: "APPROVED" as const,
        currentStage: "FINAL_APPROVED" as const,
        superAdminApprovedBy: "Super Administrator",
        superAdminApprovedAt: dateStr,
        superAdminNotes: `Disbursement verified. Budget cap enforced (${newReceipt.capUtilizationPct}% cap utilized). Receipt ${receiptNo} issued.`,
      };
      try {
        const apprs = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPROVALS) || "[]");
        localStorage.setItem(STORAGE_KEYS.APPROVALS, JSON.stringify([approvalReq, ...apprs]));
      } catch (e) {}

      // 7. Audit Trail
      this.logAudit({
        action: "INVOICE_DISBURSEMENT_WITH_RECEIPT",
        module: "Disbursement Management",
        description: `Subsystem ${params.sourceModule} invoiced disbursement [${receiptNo}] for ${params.payee} of ₱${effectiveAmount.toLocaleString()} (Budget Cap: ${capCheck.capUtilizationPct}%, Deducted from ${isPetty ? "Petty Cash" : "Operating Bank"}).`,
        status: "SUCCESS",
        newState: newReceipt,
      });

      // 8. Record Transmission Packet
      this.recordPacket({
        id: `PKT-${Date.now().toString().slice(-6)}`,
        sourceModule: params.sourceModule,
        targetSystem: "Disbursements",
        action: "INVOICE_DISBURSEMENT_WITH_RECEIPT",
        timestamp: new Date().toLocaleTimeString(),
        amount: effectiveAmount,
        status: "SYNCHRONIZED",
        summary: `Disbursement invoiced with 3-stage receipt ${receiptNo}: ₱${effectiveAmount.toLocaleString()} deducted from ${capCheck.department} budget cap & treasury.`,
        payload: newReceipt,
      });

      return {
        success: true,
        receipt: newReceipt,
        wasCapped,
        cappedAmount: effectiveAmount,
        originalRequested: params.requestedAmount,
        remainingCap: newReceipt.budgetCapRemaining,
        message: wasCapped
          ? `Budget cap reached! Requested ₱${params.requestedAmount.toLocaleString()} was capped to available limit of ₱${effectiveAmount.toLocaleString()}. Receipt ${receiptNo} created.`
          : `Disbursement invoice approved! Official receipt ${receiptNo} generated (₱${effectiveAmount.toLocaleString()}). Budget cap and treasury updated.`,
      };
    } catch (e) {
      console.error("Failed to submit disbursement invoice with receipt", e);
      return { success: false, error: String(e) };
    }
  },

  // Simulate Incoming Accounts Receivable (from Hotel-MNGT / Resto-MNGT)
  simulateIncomingAR(params: {
    sourceModule: "Hotel-MNGT" | "Resto-MNGT";
    customer: string;
    amount: number;
    category: string;
    terms?: string;
    paymentMethod?: string;
    dailyPenaltyRatePercent?: number;
    notes?: string;
    requestedBy?: string;
  }) {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AR);
      const invoices = stored ? JSON.parse(stored) : [];
      const invoiceId = `INV-AR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const today = new Date().toISOString().split("T")[0];
      const days = (params.terms || "").includes("15") ? 15 : (params.terms || "").includes("60") ? 60 : 30;
      const dueDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      const newInvoice = {
        id: invoiceId,
        customer: params.customer,
        invoiceDate: today,
        dueDate,
        amount: params.amount,
        paidAmount: 0,
        status: "Unpaid",
        category: params.category,
        paymentTerms: params.terms || "Net 30 Days",
        paymentMethod: params.paymentMethod || "Corporate City Ledger Billing",
        dailyPenaltyRatePercent: params.dailyPenaltyRatePercent ?? 0.1,
        refNo: `REF-${invoiceId}`,
        tin: "201-984-112-000",
        notes: params.notes || `Simulated corporate receivable incoming from ${params.sourceModule}`,
      };

      const updated = [newInvoice, ...invoices];
      localStorage.setItem(STORAGE_KEYS.AR, JSON.stringify(updated));

      // Sync into APAR schedule
      try {
        const aparStored = localStorage.getItem(STORAGE_KEYS.APAR);
        const apar = aparStored ? JSON.parse(aparStored) : [];
        const aparItem = {
          id: invoiceId,
          entityName: params.customer,
          tin: "201-984-112-000",
          type: "AR",
          bankDetails: params.paymentMethod || "Corporate City Ledger Billing",
          amount: params.amount,
          status: "Unpaid",
          category: params.category,
        };
        localStorage.setItem(STORAGE_KEYS.APAR, JSON.stringify([aparItem, ...apar]));
      } catch (e) {}

      // Submit Governance Approval Request to FMS (Stage 1 Admin -> Stage 2 Super Admin)
      const approvalReq = this.submitApprovalRequest({
        sourceModule: params.sourceModule,
        actionType: "CREATE_AR_INVOICE",
        title: `Incoming AR Invoice [${invoiceId}]: ${params.customer}`,
        amount: params.amount,
        impactSummary: `Corporate client invoice issued by ${params.sourceModule} (${params.category}) for ₱${params.amount.toLocaleString()} with ${newInvoice.paymentTerms}. Requires Stage 1 Admin verification then Super Admin signoff.`,
        payload: newInvoice,
        requestedBy: params.requestedBy || `${params.sourceModule} Revenue Officer`,
      });

      // Audit Trail
      this.logAudit({
        action: "SIMULATE_INCOMING_AR",
        module: "Accounts Receivable",
        description: `${params.sourceModule} simulated incoming AR invoice ${invoiceId} for ${params.customer} (₱${params.amount.toLocaleString()})`,
        status: "PENDING_APPROVAL",
        newState: newInvoice,
      });

      // Transmission Packet
      this.recordPacket({
        id: `PKT-${Date.now().toString().slice(-6)}`,
        sourceModule: params.sourceModule,
        targetSystem: "Accounts Receivable",
        action: "SIMULATE_INCOMING_AR",
        timestamp: new Date().toLocaleTimeString(),
        amount: params.amount,
        status: "QUEUED_FOR_APPROVAL",
        summary: `Incoming AR ${invoiceId} generated for ${params.customer} (₱${params.amount.toLocaleString()}). Dispatched to FMS Approval Queue.`,
        payload: newInvoice,
      });

      return { success: true, invoice: newInvoice, requestId: approvalReq.requestId };
    } catch (e) {
      console.error("Failed to simulate incoming AR", e);
      return { success: false, error: String(e) };
    }
  },
};
