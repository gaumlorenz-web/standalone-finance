import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import fs from "fs";
import path from "path";

// Ensure public directory exists
const publicDir = path.join(process.cwd(), "public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const doc = new jsPDF({
  orientation: "portrait",
  unit: "mm",
  format: "a4"
});

const PRIMARY_COLOR: [number, number, number] = [26, 29, 33]; // #1A1D21
const ACCENT_COLOR: [number, number, number] = [255, 106, 61]; // #FF6A3D
const SECONDARY_COLOR: [number, number, number] = [92, 99, 111]; // #5C636F
const GREEN_COLOR: [number, number, number] = [21, 122, 77]; // #157A4D
const BG_LIGHT: [number, number, number] = [241, 241, 237]; // #F1F1ED

let pageNumber = 1;

function addHeader(title: string, subtitle?: string) {
  doc.setFillColor(...PRIMARY_COLOR);
  doc.rect(0, 0, 210, 22, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("HORECA HOSPITALITY & ASSET ENTERPRISE", 14, 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(255, 106, 61);
  doc.text("FINANCIAL MANAGEMENT SYSTEM (ERP) — USER MANUAL & SYSTEM GUIDE", 14, 16);

  doc.setTextColor(...PRIMARY_COLOR);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(title, 14, 32);

  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...SECONDARY_COLOR);
    doc.text(subtitle, 14, 38);
  }

  doc.setDrawColor(223, 225, 219);
  doc.setLineWidth(0.5);
  doc.line(14, 42, 196, 42);
}

function addFooter() {
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(223, 225, 219);
    doc.setLineWidth(0.5);
    doc.line(14, 282, 196, 282);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...SECONDARY_COLOR);
    doc.text("HORECA Financial ERP System | Confidential & Proprietary Manual", 14, 288);
    doc.text(`Page ${i} of ${pageCount}`, 196, 288, { align: "right" });
  }
}

// ==========================================
// PAGE 1: TITLE & EXECUTIVE OVERVIEW
// ==========================================
addHeader("1. System Overview & Architecture", "Enterprise Financial Transaction Core for Hotel, Restaurant & Asset Operations");

doc.setFont("helvetica", "bold");
doc.setFontSize(11);
doc.setTextColor(...PRIMARY_COLOR);
doc.text("1.1 About the HORECA Financial ERP", 14, 49);

doc.setFont("helvetica", "normal");
doc.setFontSize(9);
doc.setTextColor(50, 50, 50);
const introText = 
  "The HORECA Financial Management System is a specialized enterprise resource planning (ERP) platform designed specifically for hospitality operations (Hotels, Restaurants, Catering, and Asset Management). It centralizes financial transactions from four core operational modules into an immutable, double-entry General Ledger (GL) powered by PostgreSQL standards.";
doc.text(doc.splitTextToSize(introText, 182), 14, 55);

// Architecture Table
autoTable(doc, {
  startY: 68,
  head: [["Connected Subsystem", "Data Stream Generated", "General Ledger Integration Rule"]],
  body: [
    ["Hotel PMS", "Guest folios, lodging revenue, mini-bar, VAT 12%, service charge pool (85%)", "Debits Cash Float (1010) / City Ledger (1210); Credits Lodging Revenue (4010) & Tax"],
    ["Restaurant POS", "Dining room food orders, bar beverage sales, till cash drops, credit swipes", "Debits Till Float (1020) / Card Settlement (1040); Credits Food Sales (4020) & Bar (4030)"],
    ["HRMS Payroll", "Bi-monthly staff wages, GM salaries, SSS/PhilHealth/HDMF, withholding tax", "Debits Salaries Expense (5110/5120); Credits Accrued Payroll (2030) & Withholding (2110)"],
    ["Supply Chain", "Purveyor meat/produce deliveries, dry goods POs, vendor 3-way match bills", "Debits COGS Inventory (5010/5020); Credits Trade Accounts Payable (2010)"]
  ],
  theme: "grid",
  headStyles: { fillColor: PRIMARY_COLOR, fontSize: 8, fontStyle: "bold" },
  bodyStyles: { fontSize: 8, textColor: [40, 40, 40] },
  margin: { left: 14, right: 14 }
});

let currentY = (doc as any).lastAutoTable.finalY + 8;

doc.setFont("helvetica", "bold");
doc.setFontSize(11);
doc.setTextColor(...PRIMARY_COLOR);
doc.text("1.2 Key Security & Compliance Tenets", 14, currentY);

currentY += 6;
doc.setFont("helvetica", "normal");
doc.setFontSize(8.5);
const tenets = [
  "• Default Data Masking: Sensitive fields (tax IDs, card numbers, bank routing, executive compensation) are masked upon login by default.",
  "• Two-Tier Maker-Checker Governance: Standard Admins queue proposals; only Super Admins can authorize cross-module commits.",
  "• 2-Factor Google OTP Verification: Every login triggers a dynamic 6-digit OTP sent to the user's registered Google account (Gmail).",
  "• 15-Minute Session Inactivity Timeout: Automatic session termination after 15 minutes of inactivity to protect workstations.",
  "• Immutable Audit Trail: Every state transition captures user ID, client IP, timestamp, and full before/after JSON diffs."
];
tenets.forEach(t => {
  doc.text(t, 14, currentY);
  currentY += 5;
});

// ==========================================
// PAGE 2: AUTHENTICATION, OTP & ROLES
// ==========================================
doc.addPage();
addHeader("2. Authentication, Google OTP & User Roles", "Security Protocols, Credential Management & Two-Tier Approvals");

doc.setFont("helvetica", "bold");
doc.setFontSize(10.5);
doc.setTextColor(...PRIMARY_COLOR);
doc.text("2.1 Default System Accounts & Credentials", 14, 49);

autoTable(doc, {
  startY: 53,
  head: [["User Role", "System Login Email", "Linked Google Account (Gmail)", "Password", "Permissions"]],
  body: [
    [
      "Super Administrator",
      "Lorenz@horeca.com",
      "gaumlorenz@gmail.com",
      "230117492",
      "Full System Master Access: Approve all queues, unmask data password control, create/manage admin users, post GL journals directly."
    ],
    [
      "Standard Administrator",
      "Renz@horeca.com",
      "grave3116@gmail.com",
      "#Ga2004",
      "Operational Access: Draft invoices, submit collection receipts, request disbursements, propose budget allocations (Requires Super Admin Approval)."
    ]
  ],
  theme: "grid",
  headStyles: { fillColor: PRIMARY_COLOR, fontSize: 8, fontStyle: "bold" },
  bodyStyles: { fontSize: 7.5, textColor: [40, 40, 40] },
  margin: { left: 14, right: 14 }
});

currentY = (doc as any).lastAutoTable.finalY + 8;

doc.setFont("helvetica", "bold");
doc.setFontSize(10.5);
doc.setTextColor(...PRIMARY_COLOR);
doc.text("2.2 Google Account OTP Verification Flow", 14, currentY);

currentY += 6;
doc.setFont("helvetica", "normal");
doc.setFontSize(8.5);
doc.text(doc.splitTextToSize("When logging into the system, the user enters their System Email and Password. Upon successful initial authentication, the system dispatches a secure 6-digit One-Time Password (OTP) to their linked Google account (Gmail). The user must enter the OTP within 5 minutes to complete authentication. Each session timeout re-triggers this OTP requirement.", 182), 14, currentY);

currentY += 18;

doc.setFont("helvetica", "bold");
doc.setFontSize(10.5);
doc.setTextColor(...PRIMARY_COLOR);
doc.text("2.3 Super Admin User Management Settings", 14, currentY);

currentY += 6;
doc.setFont("helvetica", "normal");
doc.setFontSize(8.5);
const userMgmtText = [
  "1. Super Admin navigates to the 'User Management' setting in the sidebar.",
  "2. To add a new Standard Admin, fill in: Full Name, System Email (@horeca.com), and the staff member's official Google Account (Gmail).",
  "3. Upon saving, the user is registered in the Authorized Users table and can log in using their credentials + Gmail OTP.",
  "4. Super Admin can instantly suspend, activate, or reset OTP tokens for any user from the centralized table."
];
userMgmtText.forEach(step => {
  doc.text(step, 14, currentY);
  currentY += 5;
});

currentY += 4;
doc.setFont("helvetica", "bold");
doc.setFontSize(10.5);
doc.setTextColor(...PRIMARY_COLOR);
doc.text("2.4 Two-Tier Approval Governance (Maker-Checker)", 14, currentY);

currentY += 6;
doc.setFont("helvetica", "normal");
doc.setFontSize(8.5);
const approvalText = 
  "Whenever a Standard Admin performs an action (such as creating an AP vendor bill, logging cash receipts, requesting salary disbursements, or adjusting budget limits), the transaction is placed into the 'Governance & Approval Requests Queue' with status 'Pending'. The Super Admin inspects the payload diff and cross-module impact. Upon Super Admin approval, the transaction is atomically committed across all modules and reflected immediately in the Standard Admin's view.";
doc.text(doc.splitTextToSize(approvalText, 182), 14, currentY);

// ==========================================
// PAGE 3: GENERAL LEDGER & TRANSACTION HISTORY
// ==========================================
doc.addPage();
addHeader("3. General Ledger Transaction Core", "Master Chart of Accounts, Double-Entry Balancing & Transaction History");

doc.setFont("helvetica", "bold");
doc.setFontSize(10.5);
doc.setTextColor(...PRIMARY_COLOR);
doc.text("3.1 General Ledger Capabilities", 14, 49);

doc.setFont("helvetica", "normal");
doc.setFontSize(8.5);
doc.text(doc.splitTextToSize("The General Ledger is the central financial hub of the ERP. It provides real-time verification that Total Debits strictly equal Total Credits (Zero Variance). It contains the full Hospitality Chart of Accounts (COA) spanning Assets (1000s), Liabilities (2000s), Equity (3000s), Revenue (4000s), and Expenses (5000s).", 182), 14, 55);

autoTable(doc, {
  startY: 68,
  head: [["GL View Tab", "Purpose & Operational Instructions"]],
  body: [
    ["Master GL Register", "Chronological audit table of all posted debit and credit lines across Hotel PMS, POS, Payroll, and Supply Chain. Filterable by module and account."],
    ["Transaction History", "Grouped batch vouchers (e.g., JV-2026-PMS-01, INV-8821, COL-101) showing timestamp, source module, balancing verification, posted by, and approval status with expandable line items."],
    ["Journal Entry Builder", "Interactive double-entry builder with preset hospitality templates (Night Audit, Dinner Service, Payroll, Purveyor Invoice). Enforces mathematical debit=credit balance before submission."],
    ["Hospitality Chart of Accounts", "Complete 22+ standard account dictionary with classification, normal balance (Debit/Credit), and financial statement mapping."],
    ["PostgreSQL DDL & Schema", "Complete SQL migration scripts, table schemas (coa, journal_entries, subsystems), constraints, and Docker deployment seeds."],
    ["Data Dictionary", "Technical field specifications, PostgreSQL data types, foreign keys, and audit definitions."]
  ],
  theme: "grid",
  headStyles: { fillColor: PRIMARY_COLOR, fontSize: 8, fontStyle: "bold" },
  bodyStyles: { fontSize: 7.5, textColor: [40, 40, 40] },
  margin: { left: 14, right: 14 }
});

currentY = (doc as any).lastAutoTable.finalY + 8;

doc.setFont("helvetica", "bold");
doc.setFontSize(10.5);
doc.setTextColor(...PRIMARY_COLOR);
doc.text("3.2 Using the Transaction History View", 14, currentY);

currentY += 6;
doc.setFont("helvetica", "normal");
doc.setFontSize(8.5);
const historySteps = [
  "1. Navigate to 'General Ledger' in the sidebar and select the 'Transaction History' sub-tab.",
  "2. Review summarized transaction batches grouped by voucher reference (JV/INV/COL/DISB).",
  "3. Inspect balancing status: Green indicates 100% Balanced (Zero Variance); Red indicates an out-of-balance transaction.",
  "4. Click 'View Journal Breakdown' on any transaction row to expand full debit and credit line details.",
  "5. Use 'Export to Excel' or 'Export to PDF' to download complete historical audit records."
];
historySteps.forEach(s => {
  doc.text(s, 14, currentY);
  currentY += 5;
});

// ==========================================
// PAGE 4: AP/AR, COLLECTIONS, DISBURSEMENTS & BUDGET
// ==========================================
doc.addPage();
addHeader("4. Core Operational Financial Modules", "AP/AR Invoices, Collections, Disbursements & Budget Linear Regression");

autoTable(doc, {
  startY: 48,
  head: [["Module", "Core Features & Hospitality Procedures"]],
  body: [
    [
      "Accounts Payable & Accounts Receivable (AP/AR)",
      "• 4-Bucket Aging Schedule: Categorizes trade liabilities and guest receivables into 0-30, 31-60, 61-90, and 90+ days.\n• 3-Way Match Verification: Validates Purchase Order (PO) ↔ Delivery Receipt (DR) ↔ Purveyor Invoice.\n• Trade Settlement: Direct settlement adjusts cash vaults, clears invoices, and posts balancing GL journals."
    ],
    [
      "Collection Management",
      "• Multi-Tender Tracking: Records cash drawer drops, credit card merchant settlements, and GCash/Maya e-wallets.\n• Shift-End Drawer Reconciliation: Compares expected register intake against physical cash counts to detect variances.\n• Target Vault Routing: Routes funds directly to Operating Bank Account or Front Desk Petty Cash."
    ],
    [
      "Disbursement Control",
      "• 4-Stage Approval Protocol: Draft → Verified → GM Approved → Bank Disbursed.\n• 2-Tier Signature Verification: Requires Finance Officer review and General Manager authorization.\n• Creditable Withholding Tax (EWT): Computes 2% expanded withholding for BIR Form 2307 compliance."
    ],
    [
      "Budget Management & Linear Regression",
      "• Ordinary Least Squares (OLS) Regression: Forecasts future departmental expenses using mathematical trend lines (y = mx + b).\n• Dynamic Scenario Modeling: Simulates expense projections based on inflation rates (1%-15%) and hotel occupancy (30%-100%).\n• CapEx vs OpEx Allocation: Real-time spend vs limit monitoring with risk threshold alerts (>90% Critical Risk)."
    ]
  ],
  theme: "grid",
  headStyles: { fillColor: PRIMARY_COLOR, fontSize: 8, fontStyle: "bold" },
  bodyStyles: { fontSize: 7.5, textColor: [40, 40, 40] },
  margin: { left: 14, right: 14 }
});

currentY = (doc as any).lastAutoTable.finalY + 8;

doc.setFont("helvetica", "bold");
doc.setFontSize(10.5);
doc.setTextColor(...PRIMARY_COLOR);
doc.text("4.2 How to Run Budget Linear Regression Forecasting", 14, currentY);

currentY += 6;
doc.setFont("helvetica", "normal");
doc.setFontSize(8.5);
const budgetSteps = [
  "1. Navigate to 'Budget Management' in the sidebar.",
  "2. The 'Linear Regression Expense Forecasting Engine' automatically computes historical slope (m) and intercept (b).",
  "3. Adjust the 'Projected Inflation Rate' slider to test economic cost fluctuations.",
  "4. Adjust the 'Projected Hotel Occupancy Rate' slider to evaluate variable guest service overheads.",
  "5. Review the Recharts visual projection diagram and forecasted monthly department targets.",
  "6. Click 'Export Budget Report' to generate formal Excel or PDF forecasts for executive board review."
];
budgetSteps.forEach(s => {
  doc.text(s, 14, currentY);
  currentY += 5;
});

// ==========================================
// PAGE 5: CASH, TAX, AUDIT, MASKING & FAQ
// ==========================================
doc.addPage();
addHeader("5. Cash Treasury, Tax, Audit & Security Settings", "Liquidity Vaults, BIR Tax Compliance, Masking Password & Session Controls");

autoTable(doc, {
  startY: 48,
  head: [["Module / Function", "Standard Operating Procedure & Security Rules"]],
  body: [
    [
      "Cash & Treasury Management",
      "• Dual Liquidity Vaults: Monitors Primary Operating Bank Account (BDO/BPI) and Physical Petty Cash Float.\n• Bank Statement Reconciliation: Side-by-side comparison of internal GL cash lines against imported commercial bank statements.\n• Liquidity Reserve Alert: Warns management if available bank balance drops below the ₱1,500,000 safety threshold."
    ],
    [
      "Tax Management & BIR Filings",
      "• Value Added Tax (VAT 12%): Monthly tax base calculation and return schedule for BIR Form 2550M.\n• Expanded Withholding Tax (EWT 2% / 10%): Vendor tax deductions and BIR Form 2307 certificate generation.\n• Compensation Withholding Tax: Payroll tax deduction tracking for monthly BIR Form 1601-C filing."
    ],
    [
      "Super Admin Unmask Password Control",
      "• Default Unmask Password: #S230117482\n• Super Admin Configuration: Super Admin can change the unmask password anytime in the Security Settings tab.\n• Unmasking Data: Clicking 'Unmask Sensitive Data' requires entering this authorized password."
    ],
    [
      "15-Minute Session Inactivity Timeout",
      "• Active Countdown: The system displays a live session timer in the sidebar.\n• Inactivity Reset: Every mouse movement or keystroke refreshes the active session.\n• Auto-Lock: After 15 minutes of continuous inactivity, the session automatically terminates and requires re-login with Gmail OTP."
    ],
    [
      "Collapsible Icon-Only Sidebar",
      "• Toggle Button: Click the collapse icon on the top-left sidebar header to minimize the navigation rail to icon-only mode (w-20).\n• Tooltips: Hovering over icons displays clean module tooltips."
    ]
  ],
  theme: "grid",
  headStyles: { fillColor: PRIMARY_COLOR, fontSize: 8, fontStyle: "bold" },
  bodyStyles: { fontSize: 7.5, textColor: [40, 40, 40] },
  margin: { left: 14, right: 14 }
});

currentY = (doc as any).lastAutoTable.finalY + 8;

doc.setFont("helvetica", "bold");
doc.setFontSize(10.5);
doc.setTextColor(...PRIMARY_COLOR);
doc.text("5.2 Quick Reference Checklist for Daily Financial Operations", 14, currentY);

currentY += 6;
doc.setFont("helvetica", "normal");
doc.setFontSize(8.5);
const checklist = [
  "✓ Morning: Verify Operating Bank & Petty Float balances under 'Cash Management'.",
  "✓ Mid-Day: Process trade purveyor bills in 'AP/AR' with 3-Way Match validation.",
  "✓ Shift-End: Perform drawer drop count reconciliation under 'Collections'.",
  "✓ Night Audit: Post balanced hotel lodging & restaurant dinner journals in 'General Ledger'.",
  "✓ Executive Review: Inspect 'Transaction History' and 'FP&A Financial Reporting' statements.",
  "✓ Month-End: Execute 'Budget Linear Regression Forecast' and file BIR statutory tax schedules."
];
checklist.forEach(item => {
  doc.text(item, 14, currentY);
  currentY += 5;
});

// Add footers across all pages
addFooter();

// Save PDF to public folder
const pdfBuffer = doc.output("arraybuffer");
const outputPath = path.join(publicDir, "HORECA_Financial_ERP_User_Manual.pdf");
fs.writeFileSync(outputPath, Buffer.from(pdfBuffer));
console.log("PDF User Manual successfully generated at: " + outputPath);
