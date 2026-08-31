import React, { useState, useMemo, useEffect } from "react";
import {
  BookOpen,
  CreditCard,
  Receipt,
  Send,
  PiggyBank,
  TrendingUp,
  Landmark,
  BarChart3,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
  X,
  FileText,
  DollarSign,
  LayoutDashboard,
  LogOut,
  Lock,
  Mail,
  ArrowRight,
  TrendingDown,
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  RefreshCw,
  Sparkles,
  Layers,
  Database,
  Building2,
  CheckCircle2,
  History,
  Download,
  PanelLeftClose,
  PanelLeftOpen,
  Shield,
  Users,
  Clock,
  KeyRound,
  Smartphone,
  Copy,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import PesoSign from "./components/PesoSign";
import AccountsPayable, {
  SupplierInvoice,
  INITIAL_AP_INVOICES,
  SettlementDetails
} from "./components/AccountsPayable";
import AccountsReceivable, {
  CustomerInvoice,
  INITIAL_AR_INVOICES,
  CollectionPaymentDetails
} from "./components/AccountsReceivable";
import TaxManagement from "./components/TaxManagement";
import Collection, { CollectionItem, INITIAL_COLLECTIONS } from "./components/Collection";
import CashManagement from "./components/CashManagement";
import FinancialReporting from "./components/FinancialReporting";
import LinearRegressionDiagram from "./components/LinearRegressionDiagram";
import GeneralLedger from "./components/GeneralLedger";
import AuditTrail, { AuditLogEntry } from "./components/AuditTrail";
import BudgetRegressionForecast from "./components/BudgetRegressionForecast";
import ExportButton from "./components/ExportButton";
import UserManagement, { SystemUser } from "./components/UserManagement";
import { INITIAL_LEDGER_POSTS } from "./data/hospitalityData";
import loginHeroImage from "../src/assets/images/login_hero_image_1787844999408.jpg";

export default function IntegratedFinancialSystem() {
  // ==========================================
  // AUTHORIZED ACCOUNTS & USER CREDENTIALS
  // ==========================================
  const INITIAL_ACCOUNTS: SystemUser[] = [
    {
      id: "USR-001",
      name: "Lorenz (Super Admin)",
      email: "Lorenz@horeca.com",
      googleAccount: "gaumlorenz@gmail.com",
      password: "230117482",
      role: "superadmin",
      status: "active",
      createdAt: "2026-08-19",
      otpVerified: true
    },
    {
      id: "USR-002",
      name: "Renz (Standard Admin)",
      email: "Renz@horeca.com",
      googleAccount: "grave3116@gmail.com",
      password: "#Ga2004",
      role: "admin",
      status: "active",
      createdAt: "2026-08-19",
      otpVerified: true
    }
  ];

  const [systemUsers, setSystemUsers] = useState<SystemUser[]>(INITIAL_ACCOUNTS);
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [sessionExpiryNotice, setSessionExpiryNotice] = useState("");

  // OTP 2-Factor Authentication State
  const [otpState, setOtpState] = useState<{
    step: "credentials" | "otp";
    targetUser: SystemUser | null;
    generatedOtp: string;
    inputOtp: string;
    error: string;
    otpNotificationToast: string | null;
    resendCountdown: number;
  }>({
    step: "credentials",
    targetUser: null,
    generatedOtp: "",
    inputOtp: "",
    error: "",
    otpNotificationToast: null,
    resendCountdown: 30
  });

  // Session Inactivity Countdown (15 minutes = 900 seconds)
  const [sessionSecondsLeft, setSessionSecondsLeft] = useState<number>(900);

  // Super Admin Configured Unmask Data Password (Default: #S230117482)
  const [unmaskPassword, setUnmaskPassword] = useState<string>("#S230117482");

  // Sidebar Layout State (Supports Full Width or Icon-Only Collapsed Mode)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "info" | "warning" } | null>(null);

  const showToast = (text: string, type: "success" | "info" | "warning" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // ==========================================
  // SESSION TIMEOUT LISTENER & COUNTDOWN (15 MINS)
  // ==========================================
  useEffect(() => {
    if (!currentUser) return;

    const timer = setInterval(() => {
      setSessionSecondsLeft((prev) => {
        if (prev <= 1) {
          handleSessionTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const resetInactivity = () => {
      setSessionSecondsLeft(900); // Reset to 15 minutes upon user interaction
    };

    window.addEventListener("mousemove", resetInactivity);
    window.addEventListener("keydown", resetInactivity);
    window.addEventListener("click", resetInactivity);
    window.addEventListener("scroll", resetInactivity);

    return () => {
      clearInterval(timer);
      window.removeEventListener("mousemove", resetInactivity);
      window.removeEventListener("keydown", resetInactivity);
      window.removeEventListener("click", resetInactivity);
      window.removeEventListener("scroll", resetInactivity);
    };
  }, [currentUser]);

  // Resend Countdown Timer for OTP Screen
  useEffect(() => {
    if (otpState.step !== "otp" || otpState.resendCountdown <= 0) return;
    const interval = setInterval(() => {
      setOtpState((prev) => ({
        ...prev,
        resendCountdown: Math.max(0, prev.resendCountdown - 1)
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [otpState.step, otpState.resendCountdown]);

  const handleSessionTimeout = () => {
    if (currentUser) {
      logAuditEvent({
        action: "SESSION_TIMEOUT_AUTO_LOGOUT",
        module: "Authentication & Security",
        description: `Session expired after 15 minutes of inactivity for ${currentUser.email}. Re-authentication and fresh Google OTP required.`,
        status: "SECURITY_ALERT",
        previousState: { user: currentUser.email, session: "ACTIVE" },
        newState: { session: "EXPIRED_15MIN" }
      });
    }
    setCurrentUser(null);
    setSessionExpiryNotice(
      "Your session expired after 15 minutes of inactivity. For security, please sign in again and verify your fresh Google Gmail OTP."
    );
    setOtpState({
      step: "credentials",
      targetUser: null,
      generatedOtp: "",
      inputOtp: "",
      error: "",
      otpNotificationToast: null,
      resendCountdown: 30
    });
    setIsDataMasked(true);
  };

  // ==========================================
  // AUDIT TRAIL LOGGING CORE
  // ==========================================
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: "AUD-2026-001",
      userId: "superAdmin@gmail.com",
      userName: "Super Administrator",
      userRole: "superadmin",
      action: "SYSTEM_INITIALIZATION",
      module: "General Ledger",
      timestamp: "2026-08-19 08:00:15",
      ipAddress: "192.168.1.100 (Docker Core)",
      status: "SUCCESS",
      description: "Hospitality Chart of Accounts & 4 Subsystems Transaction Core Initialized",
      previousState: null,
      newState: { coaAccountsCount: 22, initialLedgerEntriesCount: 7, database: "PostgreSQL 16" }
    },
    {
      id: "AUD-2026-002",
      userId: "admin@gmail.com",
      userName: "Standard Administrator",
      userRole: "admin",
      action: "QUEUE_AP_INVOICE",
      module: "AP / AR Module",
      timestamp: "2026-08-19 09:12:44",
      ipAddress: "192.168.1.104 (Chrome / macOS)",
      status: "PENDING_APPROVAL",
      description: "Submitted AP invoice for Meralco Commercial Power Grid (₱65,000)",
      previousState: null,
      newState: { id: "INV-9903", entityName: "Meralco Commercial Power Grid", amount: 65000, type: "AP" }
    },
    {
      id: "AUD-2026-003",
      userId: "superAdmin@gmail.com",
      userName: "Super Administrator",
      userRole: "superadmin",
      action: "POST_GL_JOURNAL",
      module: "General Ledger",
      timestamp: "2026-08-19 09:30:00",
      ipAddress: "192.168.1.100 (TLS 1.3)",
      status: "SUCCESS",
      description: "Posted multi-leg Hotel PMS Night Audit balancing journal (₱199,840)",
      previousState: { totalDebits: 290000, totalCredits: 290000 },
      newState: { totalDebits: 489840, totalCredits: 489840, ref: "JV-2026-PMS-01" }
    }
  ]);

  const logAuditEvent = (params: {
    action: string;
    module: string;
    description: string;
    previousState?: any;
    newState?: any;
    status?: "SUCCESS" | "REJECTED" | "PENDING_APPROVAL" | "SECURITY_ALERT";
    userOverride?: { email: string; name: string; role: "admin" | "superadmin" | "system" };
  }) => {
    const user =
      params.userOverride ||
      currentUser || { email: "system@horeca.local", name: "System Core", role: "system" as const };

    const newLog: AuditLogEntry = {
      id: `AUD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: user.email,
      userName: user.name,
      userRole: user.role,
      action: params.action,
      module: params.module,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      ipAddress: "192.168.1.104 (TLS 1.3)",
      status: params.status || "SUCCESS",
      description: params.description,
      previousState: params.previousState !== undefined ? params.previousState : null,
      newState: params.newState !== undefined ? params.newState : null,
    };

    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setSessionExpiryNotice("");

    const foundUser = systemUsers.find(
      (acc) =>
        acc.email.toLowerCase() === loginEmail.trim().toLowerCase() &&
        acc.password === loginPassword
    );

    if (!foundUser) {
      setLoginError("Invalid credentials. Please check your system email and password.");
      logAuditEvent({
        action: "LOGIN_FAILED",
        module: "Authentication",
        description: `Failed login attempt for email: ${loginEmail}`,
        status: "SECURITY_ALERT",
        previousState: null,
        newState: { attemptedEmail: loginEmail, failureReason: "Invalid Password / User Not Found" },
        userOverride: { email: loginEmail || "anonymous", name: "Unknown Client", role: "admin" }
      });
      return;
    }

    if (foundUser.status === "suspended") {
      setLoginError("This administrative account is suspended. Please contact the Super Administrator.");
      return;
    }

    // Generate 6-digit random Google OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    setOtpState({
      step: "otp",
      targetUser: foundUser,
      generatedOtp: otpCode,
      inputOtp: "",
      error: "",
      otpNotificationToast: `Google 2FA Security: Your one-time verification code is ${otpCode}`,
      resendCountdown: 30
    });

    showToast(`Verification code sent to ${foundUser.googleAccount}`, "info");

    logAuditEvent({
      action: "OTP_DISPATCHED",
      module: "Authentication",
      description: `6-digit Google OTP generated and dispatched to linked Gmail: ${foundUser.googleAccount}`,
      previousState: null,
      newState: { user: foundUser.email, googleAccount: foundUser.googleAccount, timestamp: new Date().toISOString() },
      userOverride: foundUser
    });
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpState.targetUser) return;

    if (otpState.inputOtp.trim() !== otpState.generatedOtp) {
      setOtpState((prev) => ({
        ...prev,
        error: "Invalid 6-digit OTP code. Please check your Gmail or request a new code."
      }));

      logAuditEvent({
        action: "OTP_VERIFY_FAILED",
        module: "Authentication",
        description: `Incorrect OTP entered for user ${otpState.targetUser.email}`,
        status: "SECURITY_ALERT",
        previousState: null,
        newState: { enteredOtp: otpState.inputOtp, user: otpState.targetUser.email },
        userOverride: otpState.targetUser
      });
      return;
    }

    const user = otpState.targetUser;
    // Update user lastLogin timestamp
    setSystemUsers((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? {
              ...u,
              lastLogin: new Date().toISOString().replace("T", " ").substring(0, 19),
              otpVerified: true
            }
          : u
      )
    );

    setCurrentUser(user);
    setIsDataMasked(true); // Mandatory: data is always masked after each login
    setSessionSecondsLeft(900); // 15 mins
    setActiveTab("overview");
    setOtpState({
      step: "credentials",
      targetUser: null,
      generatedOtp: "",
      inputOtp: "",
      error: "",
      otpNotificationToast: null,
      resendCountdown: 30
    });
    setLoginEmail("");
    setLoginPassword("");

    showToast(`Welcome back, ${user.name}! 2FA Authenticated via Google.`, "success");

    logAuditEvent({
      action: "LOGIN_SUCCESS_GOOGLE_OTP",
      module: "Authentication",
      description: `User authenticated successfully with role ${user.role.toUpperCase()} via Google 2FA (Data Masking Enforced, 15m Session Active)`,
      previousState: null,
      newState: {
        email: user.email,
        googleAccount: user.googleAccount,
        role: user.role,
        name: user.name,
        sessionStatus: "ACTIVE",
        sessionTimeoutMinutes: 15,
        isDataMasked: true,
        loginTime: new Date().toISOString()
      },
      userOverride: user
    });
  };

  const handleResendOtp = () => {
    if (!otpState.targetUser) return;
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setOtpState((prev) => ({
      ...prev,
      generatedOtp: newCode,
      inputOtp: "",
      error: "",
      otpNotificationToast: `Google 2FA Security: Your fresh verification code is ${newCode}`,
      resendCountdown: 30
    }));
    showToast(`Fresh OTP dispatched to ${otpState.targetUser.googleAccount}`, "info");
  };

  const handleLogout = () => {
    if (currentUser) {
      logAuditEvent({
        action: "LOGOUT",
        module: "Authentication",
        description: `User ${currentUser.name} signed out and terminated active session`,
        previousState: { user: currentUser.email, role: currentUser.role, session: "ACTIVE" },
        newState: { session: "TERMINATED" }
      });
    }
    setCurrentUser(null);
    setLoginEmail("");
    setLoginPassword("");
    setShowLoginPassword(false);
    setIsDataMasked(true);
    setOtpState({
      step: "credentials",
      targetUser: null,
      generatedOtp: "",
      inputOtp: "",
      error: "",
      otpNotificationToast: null,
      resendCountdown: 30
    });
  };

  // Super Admin User Management Operations
  const handleAddUser = (newUser: Omit<SystemUser, "id" | "createdAt" | "otpVerified">) => {
    const id = `USR-${Math.floor(100 + Math.random() * 900)}`;
    const created: SystemUser = {
      ...newUser,
      id,
      createdAt: new Date().toISOString().split("T")[0],
      otpVerified: false
    };
    setSystemUsers((prev) => [...prev, created]);
    showToast(`Admin ${created.name} registered to ${created.googleAccount}!`, "success");

    logAuditEvent({
      action: "CREATE_ADMIN_USER",
      module: "Security & User Management",
      description: `Super Admin created and registered standard admin ${created.name} (${created.email}) linked to Google account ${created.googleAccount}`,
      previousState: null,
      newState: {
        id: created.id,
        name: created.name,
        email: created.email,
        googleAccount: created.googleAccount,
        role: created.role
      }
    });
  };

  const handleToggleUserStatus = (userId: string) => {
    setSystemUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId && u.role !== "superadmin") {
          const newStatus = u.status === "active" ? "suspended" : "active";
          showToast(`User ${u.name} status updated to ${newStatus.toUpperCase()}`, "info");
          logAuditEvent({
            action: "TOGGLE_USER_STATUS",
            module: "Security & User Management",
            description: `Super Admin changed user ${u.email} status to ${newStatus.toUpperCase()}`,
            previousState: { userId: u.id, status: u.status },
            newState: { userId: u.id, status: newStatus }
          });
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  const handleResetUserOtp = (userId: string) => {
    const target = systemUsers.find((u) => u.id === userId);
    if (target) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      showToast(`OTP dispatch reset for ${target.googleAccount} (Code: ${code})`, "info");
      logAuditEvent({
        action: "RESET_USER_OTP",
        module: "Security & User Management",
        description: `Super Admin triggered manual OTP reset for ${target.email} linked to ${target.googleAccount}`,
        previousState: null,
        newState: { userId: target.id, targetEmail: target.email, dispatchedCode: code }
      });
    }
  };

  const handleDeleteUser = (userId: string) => {
    const target = systemUsers.find((u) => u.id === userId);
    if (target && target.role !== "superadmin") {
      setSystemUsers((prev) => prev.filter((u) => u.id !== userId));
      showToast(`User account ${target.name} removed`, "warning");
      logAuditEvent({
        action: "DELETE_USER_ACCOUNT",
        module: "Security & User Management",
        description: `Super Admin removed user account ${target.email}`,
        previousState: target,
        newState: null
      });
    }
  };

  const handleUpdateUnmaskPassword = (newPass: string) => {
    setUnmaskPassword(newPass);
    showToast("Unmask Authorization Password updated!", "success");
    logAuditEvent({
      action: "UPDATE_UNMASK_PASSWORD",
      module: "Security & User Management",
      description: "Super Admin updated the system Unmask Authorization Password",
      status: "SECURITY_ALERT",
      previousState: { unmaskPasswordUpdated: true },
      newState: { updatedBy: currentUser?.email, timestamp: new Date().toISOString() }
    });
  };

  // ==========================================
  // SYSTEM MODULES & CONNECTED STATE
  // ==========================================
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isDataMasked, setIsDataMasked] = useState<boolean>(true);
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>("");
  const [isPassModalOpen, setIsPassModalOpen] = useState<boolean>(false);

  // Field-Level Contextual Masking Engine
  const maskField = (value: any, type: string) => {
    if (!isDataMasked || !value) return value;
    switch (type) {
      case 'accountNumber':
      case 'account':
      case 'bank':
      case 'card':
        return String(value).replace(/\d(?=\d{3})/g, '*');
      case 'tin':
        return String(value).replace(/^\d{3}-\d{3}-\d{3}-(\d{3})$/, '***-***-***-$1');
      case 'name':
        return String(value).split(' ').map((part, index) => index === 0 ? part : part[0] + '***').join(' ');
      case 'phone':
        return String(value).replace(/\d(?=\d{4})/g, '*');
      case 'email':
        return String(value).replace(/^(.)(.*)(@.*)$/, (_, a, b, c) => a + '*'.repeat(b.length) + c);
      case 'swift':
        return '****' + String(value).slice(-3);
      case 'token':
        return 'AUTH-****-**';
      case 'ref':
        return String(value).slice(0, 3) + '-****';
      default:
        return '••••••••';
    }
  };

  const maskCurrency = (val: number) => {
    if (!isDataMasked) {
      return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(val || 0);
    }
    return "₱ ••••••••";
  };

  // 1. General Ledger Master Entries (Synchronized with All Subsystems)
  const [journalEntries, setJournalEntries] = useState<any[]>(INITIAL_LEDGER_POSTS);

  // 2. AP & AR Invoices State
  const [apInvoices, setApInvoices] = useState<SupplierInvoice[]>(INITIAL_AP_INVOICES);
  const [arInvoices, setArInvoices] = useState<CustomerInvoice[]>(INITIAL_AR_INVOICES);
  const [collections, setCollections] = useState<CollectionItem[]>(INITIAL_COLLECTIONS);
  const [apArInvoices, setApArInvoices] = useState([
    { id: 'INV-8821', entityName: 'HighSeas Meat & Seafood Corp', tin: '123-456-789-000', type: 'AP', bankDetails: '9876-5432-1098', amount: 109760.00, status: 'Approved', category: 'F&B Provisions' },
    { id: 'INV-9902', entityName: 'Global Luxury Tours & Corporate Travel', tin: '987-654-321-000', type: 'AR', bankDetails: '4567-8901-2345', amount: 85000.00, status: 'Approved', category: 'Corporate City Ledger' },
    { id: 'INV-9903', entityName: 'Meralco Commercial Power Grid', tin: '111-222-333-000', type: 'AP', bankDetails: '1122-3344-5566', amount: 65000.00, status: 'Pending', category: 'Utilities' },
  ]);
  const [aparForm, setAparForm] = useState({ entityName: "", tin: "", bankDetails: "", type: "AP", amount: "", category: "General Operations" });

  // ==========================================
  // EXPORT GENERATORS FOR EXCEL (.XLSX) & PDF (.PDF)
  // ==========================================
  const getApArExportData = () => {
    const headers = [
      "Invoice ID",
      "Entity / Purveyor Name",
      "Tax ID (TIN)",
      "Type",
      "Payment Terms",
      "3-Way Match",
      "Category",
      "Bank Account Ref",
      "Amount (PHP)",
      "Status"
    ];

    const rows = apArInvoices.map((inv: any) => [
      inv.id || "",
      isDataMasked ? maskField(inv.entityName, "name") : inv.entityName,
      isDataMasked ? maskField(inv.tin, "tin") : inv.tin,
      inv.type || "",
      inv.terms || "Net 30 Days",
      inv.matchStatus || "Verified (PO+DR+Inv)",
      inv.category || "General",
      isDataMasked ? maskField(inv.bankDetails, "accountNumber") : inv.bankDetails,
      Number(inv.amount) || 0,
      inv.status || "Approved"
    ]);

    const totalAP = apArInvoices.filter((i) => i.type === "AP").reduce((s, i) => s + (Number(i.amount) || 0), 0);
    const totalAR = apArInvoices.filter((i) => i.type === "AR").reduce((s, i) => s + (Number(i.amount) || 0), 0);

    return {
      title: "Accounts Payable & Accounts Receivable Master Schedule",
      subtitle: `Fiscal Year 2026 | Active Trade Records: ${apArInvoices.length}`,
      filename: `HORECA_AP_AR_Invoices_Report_${new Date().toISOString().split("T")[0]}`,
      sheetName: "AP_AR_Register",
      headers,
      rows,
      summary: [
        { label: "Total Accounts Payable (Vendor Liabilities)", value: totalAP },
        { label: "Total Accounts Receivable (Trade Inflows)", value: totalAR },
        { label: "Net Trade Position (AR - AP)", value: totalAR - totalAP },
        { label: "3-Way Match Compliance", value: "100% Audited" }
      ],
      companyName: "HORECA HOSPITALITY & ASSET ENTERPRISE",
      generatedBy: currentUser?.name || "Administrator"
    };
  };

  const getCollectionExportData = () => {
    const headers = ["Receipt ID", "Payer Name", "Target Vault", "Payment Method", "Card / Check Ref", "Amount (PHP)"];
    const rows = collectionData.map((c) => [
      c.id,
      isDataMasked ? maskField(c.payerName, "name") : c.payerName,
      c.targetAccount,
      c.targetAccount.includes("Bank") ? "Credit Card Merchant / EFT" : "Cash Drawer Drop",
      isDataMasked ? maskField(c.cardNo, "accountNumber") : c.cardNo,
      Number(c.amount) || 0
    ]);
    const totalCollections = collectionData.reduce((s, c) => s + (Number(c.amount) || 0), 0);

    return {
      title: "Hospitality Daily Collections & Multi-Tender Register",
      subtitle: `Front Desk, Restaurant POS & Banquet Receipts | Date: ${new Date().toISOString().split("T")[0]}`,
      filename: `Collections_Register_${new Date().toISOString().split("T")[0]}`,
      sheetName: "Collections",
      headers,
      rows,
      summary: [
        { label: "Total Inflows Collected", value: totalCollections },
        { label: "Operating Bank Deposits", value: collectionData.filter((c) => c.targetAccount.includes("Bank")).reduce((s, c) => s + c.amount, 0) },
        { label: "Petty Float Cash Drops", value: collectionData.filter((c) => !c.targetAccount.includes("Bank")).reduce((s, c) => s + c.amount, 0) }
      ],
      companyName: "HORECA HOSPITALITY & ASSET ENTERPRISE",
      generatedBy: currentUser?.name || "Administrator"
    };
  };

  const getDisbursementExportData = () => {
    const headers = ["Disbursement ID", "Beneficiary / Payee", "Department", "SWIFT / Bank Code", "National ID / Tax TIN", "Withholding Tax (PHP)", "Net Payout (PHP)"];
    const rows = disbursementData.map((d: any) => [
      d.id,
      isDataMasked ? maskField(d.payee, "name") : d.payee,
      d.department,
      d.swift,
      isDataMasked ? maskField(d.nationalId, "tin") : d.nationalId,
      Number(d.netPay * 0.02) || 0,
      Number(d.netPay) || 0
    ]);
    const totalDisbursed = disbursementData.reduce((s, d) => s + (Number(d.netPay) || 0), 0);

    return {
      title: "Corporate Disbursements & Electronic Payout Schedule",
      subtitle: `Vendor Settlements, Payroll Direct Deposits & Operating Outflows`,
      filename: `Disbursements_Schedule_${new Date().toISOString().split("T")[0]}`,
      sheetName: "Disbursements",
      headers,
      rows,
      summary: [
        { label: "Total Outflows Disbursed", value: totalDisbursed },
        { label: "Creditable Withholding Tax (EWT 2%)", value: totalDisbursed * 0.02 },
        { label: "Net Cash Outflow Executed", value: totalDisbursed }
      ],
      companyName: "HORECA HOSPITALITY & ASSET ENTERPRISE",
      generatedBy: currentUser?.name || "Administrator"
    };
  };

  const getBudgetExportData = () => {
    const headers = ["Budget Code", "Department Title", "Classification", "Allocated Limit (PHP)", "Actual Spend (PHP)", "Available Balance (PHP)", "% Utilization", "Status"];
    const rows = budgets.map((b) => {
      const avail = b.allocated - b.spent;
      const pct = Math.round((b.spent / b.allocated) * 100);
      return [
        b.id,
        b.department,
        b.id.includes("01") || b.id.includes("02") ? "Operational Expense (OpEx)" : "Capital / Overhead (CapEx)",
        Number(b.allocated),
        Number(b.spent),
        avail,
        `${pct}%`,
        pct > 90 ? "CRITICAL RISK" : pct > 75 ? "ELEVATED" : "OPTIMAL"
      ];
    });

    const totalAlloc = budgets.reduce((s, b) => s + b.allocated, 0);
    const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);

    return {
      title: "Departmental Budget Allocations & Variance Summary",
      subtitle: `Fiscal Year 2026 FP&A Allocation Framework`,
      filename: `Budget_Allocations_${new Date().toISOString().split("T")[0]}`,
      sheetName: "Budgets",
      headers,
      rows,
      summary: [
        { label: "Total Allocated Budget", value: totalAlloc },
        { label: "Total Spent to Date", value: totalSpent },
        { label: "Remaining Budget Capacity", value: totalAlloc - totalSpent },
        { label: "Overall Spending Rate", value: `${Math.round((totalSpent / totalAlloc) * 100)}%` }
      ],
      companyName: "HORECA HOSPITALITY & ASSET ENTERPRISE",
      generatedBy: currentUser?.name || "Administrator"
    };
  };

  const getCashExportData = () => {
    const headers = ["Liquidity Vault / Account", "Account Type", "Currency", "Current Balance (PHP)", "Reconciliation Status", "Reserve Health"];
    const rows = [
      ["Operating Commercial Account (BDO / BPI)", "Bank Primary Treasury", "PHP", cashPool.bankOperating, "Reconciled with GL", "Optimal (> ₱1.5M Reserve)"],
      ["Front Desk & Till Cash Float", "Physical Petty Vault", "PHP", cashPool.pettyCash, "Audited (Shift A/B)", "Sufficient"]
    ];

    return {
      title: "Treasury Liquidity & Bank Account Balances",
      subtitle: `Real-time Cash Position as of ${new Date().toISOString().replace("T", " ").substring(0, 16)}`,
      filename: `Cash_Management_Balances_${new Date().toISOString().split("T")[0]}`,
      sheetName: "Cash Liquidity",
      headers,
      rows,
      summary: [
        { label: "Total Combined Liquidity", value: cashPool.bankOperating + cashPool.pettyCash },
        { label: "Bank Operating Liquidity", value: cashPool.bankOperating },
        { label: "Petty Float Reserve", value: cashPool.pettyCash }
      ],
      companyName: "HORECA HOSPITALITY & ASSET ENTERPRISE",
      generatedBy: currentUser?.name || "Administrator"
    };
  };

  const getTaxExportData = () => {
    const headers = ["Filing ID", "Statutory BIR Schedule", "Applicable Rate", "Taxable Base (PHP)", "Computed Tax Liability (PHP)", "Status", "Compliance Due Date"];
    const rows = taxRecords.map((t) => [
      t.id,
      t.type,
      t.type.includes("VAT") ? "12%" : t.type.includes("2%") ? "2%" : "15%",
      Number(t.taxableAmount),
      Number(t.taxDue),
      t.status,
      "20th of the Following Month"
    ]);

    const totalBase = taxRecords.reduce((s, t) => s + t.taxableAmount, 0);
    const totalDue = taxRecords.reduce((s, t) => s + t.taxDue, 0);

    return {
      title: "Statutory Tax Liabilities & BIR Filing Schedule",
      subtitle: "Philippine Tax Compliance (VAT, EWT & Compensation WHT)",
      filename: `Tax_Compliance_Report_${new Date().toISOString().split("T")[0]}`,
      sheetName: "Tax Schedule",
      headers,
      rows,
      summary: [
        { label: "Total Taxable Base Revenue", value: totalBase },
        { label: "Total Net Tax Due", value: totalDue },
        { label: "Output VAT Due", value: taxRecords.filter((t) => t.type.includes("VAT")).reduce((s, t) => s + t.taxDue, 0) },
        { label: "Expanded Withholding Tax (EWT)", value: taxRecords.filter((t) => !t.type.includes("VAT")).reduce((s, t) => s + t.taxDue, 0) }
      ],
      companyName: "HORECA HOSPITALITY & ASSET ENTERPRISE",
      generatedBy: currentUser?.name || "Administrator"
    };
  };

  const getReportsExportData = () => {
    const totalAP = apArInvoices.filter((i) => i.type === "AP").reduce((s, i) => s + i.amount, 0);
    const totalAR = apArInvoices.filter((i) => i.type === "AR").reduce((s, i) => s + i.amount, 0);
    const totalCash = cashPool.bankOperating + cashPool.pettyCash;

    const headers = ["Financial Statement Item", "Classification", "Debit / Asset (PHP)", "Credit / Liability (PHP)", "Net Book Value (PHP)"];
    const rows = [
      ["Operating Cash & Petty Float", "Current Asset", totalCash, 0, totalCash],
      ["Accounts Receivable (City Ledger)", "Current Asset", totalAR, 0, totalAR],
      ["Accounts Payable (Purveyors)", "Current Liability", 0, totalAP, -totalAP],
      ["Output VAT & Tax Liabilities", "Current Liability", 0, 174000, -174000],
      ["Service Charge Staff Pool (85%)", "Current Liability", 0, 10200, -10200],
      ["Total General Ledger Postings", "Balance Sheet Base", totalDebits, totalCredits, totalDebits - totalCredits]
    ];

    return {
      title: "Consolidated Financial Statements & Executive FP&A Matrix",
      subtitle: `Balance Sheet, Income Statement & Working Capital Highlights`,
      filename: `Financial_Statements_${new Date().toISOString().split("T")[0]}`,
      sheetName: "Financial Highlights",
      headers,
      rows,
      summary: [
        { label: "Total GL Debit Volume", value: totalDebits },
        { label: "Total GL Credit Volume", value: totalCredits },
        { label: "Total Liquid Cash Position", value: totalCash },
        { label: "Net Working Capital (Assets - Liabilities)", value: totalCash + totalAR - totalAP - 174000 }
      ],
      companyName: "HORECA HOSPITALITY & ASSET ENTERPRISE",
      generatedBy: currentUser?.name || "Administrator"
    };
  };

  // 3. Collection State
  const [collectionData, setCollectionData] = useState([
    { id: 'COL-101', payerName: 'Robert Smith (Room 402 Checkout)', phone: '+639170192834', email: 'robert.smith@example.com', cardNo: '4532-8819-2011-8821', checkNo: 'CHK-90211', amount: 35000.00, targetAccount: 'Front Desk Cash Float' },
    { id: 'COL-102', payerName: 'Sarah Jenkins (Banquet Hall Deposit)', phone: '+639170148821', email: 's.jenkins@example.com', cardNo: '5412-9902-1100-1102', checkNo: 'EFT-88392', amount: 85000.00, targetAccount: 'Operating Bank Account' },
  ]);
  const [collectionForm, setCollectionForm] = useState({ payerName: "", phone: "", email: "", cardNo: "", checkNo: "", amount: "", targetAccount: "Operating Bank Account" });

  // 4. Disbursement State
  const [disbursementData, setDisbursementData] = useState([
    { id: 'DISB-501', payee: 'Michael Brown (Executive Salary)', swift: 'BOFAPHMMXXX', nationalId: '112-482-990-110', netPay: 154000.00, token: 'AUTH-99201-X8', department: 'Executive Management' },
    { id: 'DISB-502', payee: 'Pacific Linens & Laundry Logistics', swift: 'CHASPHM2XXX', nationalId: '441-209-912-000', netPay: 34100.00, token: 'AUTH-10293-Z2', department: 'Housekeeping' },
  ]);
  const [disbursementForm, setDisbursementForm] = useState({ payee: "", swift: "", nationalId: "", netPay: "", department: "General Operations" });

  // 5. Budget Management State
  const [budgets, setBudgets] = useState([
    { id: "BGT-01", department: "Kitchen & F&B Operations", allocated: 650000, spent: 395000 },
    { id: "BGT-02", department: "Front Office & Hotel Operations", allocated: 450000, spent: 220000 },
    { id: "BGT-03", department: "Housekeeping & Facility Maintenance", allocated: 300000, spent: 175000 },
    { id: "BGT-04", department: "Executive & Administrative Core", allocated: 500000, spent: 340000 },
  ]);
  const [budgetForm, setBudgetForm] = useState({ department: "", allocated: "" });

  // 6. Cash Management & Liquidity Pool
  const [cashPool, setCashPool] = useState({ bankOperating: 2450000, pettyCash: 185000 });

  // 7. Tax Management State
  const [taxRecords, setTaxRecords] = useState([
    { id: "TAX-2026-Q2", type: "Value Added Tax (VAT 12%)", taxableAmount: 1450000, taxDue: 174000, status: "Pending" },
    { id: "TAX-2026-WHT", type: "Expanded Withholding Tax (2% Goods)", taxableAmount: 580000, taxDue: 11600, status: "Remitted" },
    { id: "TAX-2026-COMP", type: "Compensation Withholding Tax (15-20%)", taxableAmount: 225000, taxDue: 33750, status: "Remitted" },
  ]);
  const [taxForm, setTaxForm] = useState({ type: "Value Added Tax (VAT 12%)", rate: 0.12, taxableAmount: "" });

  // 8. Pending Approvals Queue
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([
    {
      id: "REQ-201",
      actionType: "CREATE_AP_AR",
      requestedBy: "Standard Administrator",
      timestamp: "2026-08-19 14:15",
      module: "AP / AR Module",
      payload: {
        id: "INV-9903",
        entityName: "Meralco Commercial Power Grid",
        tin: "111-222-333-000",
        type: "AP",
        bankDetails: "1122-3344-5566",
        amount: 65000,
        status: "Pending",
        category: "Utilities & Electricity"
      },
      impactSummary: "Increases Outstanding AP by ₱65,000 and posts balanced GL debit to 5220 - Electricity Utilities."
    },
    {
      id: "REQ-202",
      actionType: "ADD_BUDGET",
      requestedBy: "Standard Administrator",
      timestamp: "2026-08-19 15:40",
      module: "Budget Management",
      payload: {
        id: "BGT-05",
        department: "Spa & Wellness Recreation",
        allocated: 200000,
        spent: 0
      },
      impactSummary: "Establishes a new ₱200,000 departmental spending budget."
    }
  ]);

  // Handle Masking Toggle
  const handleToggleMasking = () => {
    if (!isDataMasked) {
      setIsDataMasked(true);
      logAuditEvent({
        action: "MASK_SENSITIVE_DATA",
        module: "Security",
        description: "User re-enabled sensitive data masking",
        previousState: { isDataMasked: false },
        newState: { isDataMasked: true }
      });
    } else {
      setIsPassModalOpen(true);
    }
  };

  const verifyAdminPassword = () => {
    if (adminPasswordInput === unmaskPassword) {
      setIsDataMasked(false);
      setIsPassModalOpen(false);
      setAdminPasswordInput("");
      showToast("Sensitive financial data unmasked successfully", "info");

      logAuditEvent({
        action: "UNMASK_SENSITIVE_DATA",
        module: "Security",
        description: `User authenticated with Super Admin Unmask Password and unmasked sensitive financial numbers & PII`,
        status: "SECURITY_ALERT",
        previousState: { isDataMasked: true },
        newState: { isDataMasked: false, unmaskedBy: currentUser?.email }
      });
    } else {
      alert("Invalid Unmask Authorization Password! Please enter the password configured by the Super Administrator.");
      logAuditEvent({
        action: "UNMASK_FAILED",
        module: "Security",
        description: "Failed password attempt to unmask sensitive financial data",
        status: "SECURITY_ALERT",
        previousState: { isDataMasked: true },
        newState: { attemptFailed: true }
      });
    }
  };

  // ==========================================
  // CROSS-MODULE SYNCHRONIZATION ENGINE
  // ==========================================
  const executeApprovedAction = (req: any) => {
    const { actionType, payload } = req;

    if (actionType === "CREATE_AP_AR") {
      const prevInvoices = [...apArInvoices];
      // 1. Update AP/AR Table
      setApArInvoices((prev) => [{ ...payload, status: "Approved" }, ...prev]);

      // 2. Automatically generate and post balanced double-entry in General Ledger
      const ref = payload.id;
      const amount = Number(payload.amount);
      const isAP = payload.type === "AP";

      const glLines = isAP
        ? [
            {
              id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
              date: new Date().toISOString().split("T")[0],
              ref: ref,
              sourceModule: "Supply Chain",
              accountCode: "5010",
              accountName: "5010 - Cost of Goods Sold - Fresh Produce & Meats",
              memo: `Supplier Bill: ${payload.entityName}`,
              debit: amount,
              credit: 0,
              status: "COMMITTED",
              postedBy: req.requestedBy,
              approvedBy: "Super Administrator"
            },
            {
              id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
              date: new Date().toISOString().split("T")[0],
              ref: ref,
              sourceModule: "Supply Chain",
              accountCode: "2010",
              accountName: "2010 - Trade Accounts Payable",
              memo: `Trade AP Accrual: ${payload.entityName}`,
              debit: 0,
              credit: amount,
              status: "COMMITTED",
              postedBy: req.requestedBy,
              approvedBy: "Super Administrator"
            }
          ]
        : [
            {
              id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
              date: new Date().toISOString().split("T")[0],
              ref: ref,
              sourceModule: "Hotel PMS",
              accountCode: "1210",
              accountName: "1210 - City Ledger & Corporate Accounts Receivable",
              memo: `Client Invoice: ${payload.entityName}`,
              debit: amount,
              credit: 0,
              status: "COMMITTED",
              postedBy: req.requestedBy,
              approvedBy: "Super Administrator"
            },
            {
              id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
              date: new Date().toISOString().split("T")[0],
              ref: ref,
              sourceModule: "Hotel PMS",
              accountCode: "4010",
              accountName: "4010 - Hotel Room Revenue - Deluxe & Suites",
              memo: `Corporate Booking Revenue: ${payload.entityName}`,
              debit: 0,
              credit: amount,
              status: "COMMITTED",
              postedBy: req.requestedBy,
              approvedBy: "Super Administrator"
            }
          ];

      setJournalEntries((prev) => [...glLines, ...prev]);
      showToast(`Cross-Module Sync: ${isAP ? "AP Invoice" : "AR Invoice"} committed & balanced in General Ledger!`, "success");

      // Log State Mutation in Audit Trail
      logAuditEvent({
        action: isAP ? "CREATE_AP_INVOICE" : "CREATE_AR_INVOICE",
        module: "AP / AR Module",
        description: `${isAP ? "AP Invoice" : "AR Invoice"} for ${payload.entityName} committed & balanced in GL (₱${amount.toLocaleString()})`,
        previousState: { totalInvoices: prevInvoices.length },
        newState: {
          invoice: { ...payload, status: "Approved" },
          balancedGLLines: glLines,
          totalInvoices: prevInvoices.length + 1
        }
      });
    }

    if (actionType === "ADD_COLLECTION") {
      const prevCash = { ...cashPool };
      const prevCollections = [...collectionData];

      // 1. Update Collections List
      setCollectionData((prev) => [payload, ...prev]);

      // 2. Increment Cash Management Liquidity
      const amount = Number(payload.amount);
      const newCash = payload.targetAccount === "Front Desk Cash Float"
        ? { ...prevCash, pettyCash: prevCash.pettyCash + amount }
        : { ...prevCash, bankOperating: prevCash.bankOperating + amount };

      setCashPool(newCash);

      // 3. Post Balanced GL Entry: Debit Cash, Credit 1200 Guest Ledger / AR
      const glLines = [
        {
          id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toISOString().split("T")[0],
          ref: payload.id,
          sourceModule: "Hotel PMS",
          accountCode: payload.targetAccount === "Front Desk Cash Float" ? "1010" : "1030",
          accountName: payload.targetAccount === "Front Desk Cash Float" ? "1010 - Front Desk Cash Float" : "1030 - Operating Bank Account - Primary",
          memo: `Cash Inflow: ${payload.payerName}`,
          debit: amount,
          credit: 0,
          status: "COMMITTED",
          postedBy: req.requestedBy,
          approvedBy: "Super Administrator"
        },
        {
          id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toISOString().split("T")[0],
          ref: payload.id,
          sourceModule: "Hotel PMS",
          accountCode: "1200",
          accountName: "1200 - Guest Ledger (In-House Residents)",
          memo: `Folio Settlement: ${payload.payerName}`,
          debit: 0,
          credit: amount,
          status: "COMMITTED",
          postedBy: req.requestedBy,
          approvedBy: "Super Administrator"
        }
      ];

      setJournalEntries((prev) => [...glLines, ...prev]);
      showToast(`Cross-Module Sync: Collection added, Cash Pool incremented (+₱${amount.toLocaleString()}), and GL reconciled!`, "success");

      // Log State Mutation in Audit Trail
      logAuditEvent({
        action: "ADD_COLLECTION",
        module: "Collections",
        description: `Collection receipt logged for ${payload.payerName} (₱${amount.toLocaleString()})`,
        previousState: { cashPool: prevCash, totalCollections: prevCollections.length },
        newState: {
          collectionRecord: payload,
          cashPool: newCash,
          balancedGLLines: glLines,
          totalCollections: prevCollections.length + 1
        }
      });
    }

    if (actionType === "ADD_DISBURSEMENT") {
      const prevCash = { ...cashPool };
      const prevDisbursements = [...disbursementData];

      // 1. Update Disbursement Records
      setDisbursementData((prev) => [payload, ...prev]);

      // 2. Decrement Cash Management Operating Bank Balance
      const amount = Number(payload.netPay);
      const newCash = { ...prevCash, bankOperating: prevCash.bankOperating - amount };
      setCashPool(newCash);

      // 3. Post Balanced GL Entry: Debit 5110 Expense, Credit 1030 Operating Bank
      const glLines = [
        {
          id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toISOString().split("T")[0],
          ref: payload.id,
          sourceModule: "HRMS Payroll",
          accountCode: "5110",
          accountName: "5110 - Executive & Management Salaries",
          memo: `Disbursement Outflow: ${payload.payee}`,
          debit: amount,
          credit: 0,
          status: "COMMITTED",
          postedBy: req.requestedBy,
          approvedBy: "Super Administrator"
        },
        {
          id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toISOString().split("T")[0],
          ref: payload.id,
          sourceModule: "Treasury",
          accountCode: "1030",
          accountName: "1030 - Operating Bank Account - Primary",
          memo: `Bank Direct EFT Payout: ${payload.payee}`,
          debit: 0,
          credit: amount,
          status: "COMMITTED",
          postedBy: req.requestedBy,
          approvedBy: "Super Administrator"
        }
      ];

      setJournalEntries((prev) => [...glLines, ...prev]);
      showToast(`Cross-Module Sync: Disbursement processed, Operating Bank decremented (-₱${amount.toLocaleString()}), and GL balanced!`, "success");

      // Log State Mutation in Audit Trail
      logAuditEvent({
        action: "ADD_DISBURSEMENT",
        module: "Disbursements",
        description: `Disbursement executed for ${payload.payee} (₱${amount.toLocaleString()})`,
        previousState: { cashPool: prevCash, totalDisbursements: prevDisbursements.length },
        newState: {
          disbursementRecord: payload,
          cashPool: newCash,
          balancedGLLines: glLines,
          totalDisbursements: prevDisbursements.length + 1
        }
      });
    }

    if (actionType === "ADD_BUDGET") {
      const prevBudgets = [...budgets];
      setBudgets((prev) => [payload, ...prev]);
      showToast(`Cross-Module Sync: New Budget allocation for ${payload.department} active in FP&A reporting!`, "success");

      logAuditEvent({
        action: "ADD_BUDGET",
        module: "Budget Management",
        description: `New budget allocation instantiated for ${payload.department} (₱${Number(payload.allocated).toLocaleString()})`,
        previousState: { totalBudgets: prevBudgets.length },
        newState: { newBudget: payload, totalBudgets: prevBudgets.length + 1 }
      });
    }

    if (actionType === "ADD_TAX") {
      const prevTax = [...taxRecords];
      setTaxRecords((prev) => [payload, ...prev]);
      // Post Tax Provision in GL
      const glLines = [
        {
          id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toISOString().split("T")[0],
          ref: payload.id,
          sourceModule: "General",
          accountCode: "5220",
          accountName: "5220 - Electricity, Power & Statutory Taxes",
          memo: `Tax Provisioning: ${payload.type}`,
          debit: Number(payload.taxDue),
          credit: 0,
          status: "COMMITTED",
          postedBy: req.requestedBy,
          approvedBy: "Super Administrator"
        },
        {
          id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toISOString().split("T")[0],
          ref: payload.id,
          sourceModule: "General",
          accountCode: "2130",
          accountName: "2130 - Output Value Added Tax (VAT 12%)",
          memo: `Tax Accrual Payable: ${payload.type}`,
          debit: 0,
          credit: Number(payload.taxDue),
          status: "COMMITTED",
          postedBy: req.requestedBy,
          approvedBy: "Super Administrator"
        }
      ];
      setJournalEntries((prev) => [...glLines, ...prev]);
      showToast(`Cross-Module Sync: Tax schedule queued and statutory provision posted to General Ledger!`, "success");

      logAuditEvent({
        action: "ADD_TAX_FILING",
        module: "Tax Management",
        description: `Statutory tax filing logged: ${payload.type} (Due: ₱${Number(payload.taxDue).toLocaleString()})`,
        previousState: { totalTaxRecords: prevTax.length },
        newState: { taxRecord: payload, glProvisions: glLines, totalTaxRecords: prevTax.length + 1 }
      });
    }

    if (actionType === "POST_GL_ENTRY") {
      const prevCount = journalEntries.length;
      setJournalEntries((prev) => [...payload.lines, ...prev]);
      showToast(`Cross-Module Sync: Multi-leg Journal Entry ${payload.ref} committed directly to Master Ledger!`, "success");

      logAuditEvent({
        action: "POST_GL_JOURNAL",
        module: "General Ledger",
        description: `Balanced multi-leg journal entry ${payload.ref} posted to Master Ledger`,
        previousState: { totalLedgerLines: prevCount },
        newState: { journalRef: payload.ref, linesAdded: payload.lines, totalLedgerLines: prevCount + payload.lines.length }
      });
    }

    if (actionType === "CREATE_AP_INVOICE") {
      setApInvoices((prev) => [{ ...payload, status: "Unpaid" as const }, ...prev]);
      setApArInvoices((prev) => [
        {
          id: payload.id,
          entityName: payload.vendor,
          tin: payload.tin,
          type: "AP",
          bankDetails: payload.bankDetails,
          amount: payload.amount,
          status: "Approved",
          category: payload.category
        },
        ...prev
      ]);

      const glLines = [
        {
          id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
          date: payload.invoiceDate || new Date().toISOString().split("T")[0],
          ref: payload.id,
          sourceModule: "Supply Chain",
          accountCode: "5010",
          accountName: "5010 - Cost of Goods Sold - Fresh Produce & Meats",
          memo: `Supplier Bill: ${payload.vendor} (${payload.category})`,
          debit: Number(payload.amount),
          credit: 0,
          status: "COMMITTED",
          postedBy: req.requestedBy,
          approvedBy: "Super Administrator"
        },
        {
          id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
          date: payload.invoiceDate || new Date().toISOString().split("T")[0],
          ref: payload.id,
          sourceModule: "Supply Chain",
          accountCode: "2010",
          accountName: "2010 - Trade Accounts Payable",
          memo: `Trade AP Accrual: ${payload.vendor}`,
          debit: 0,
          credit: Number(payload.amount),
          status: "COMMITTED",
          postedBy: req.requestedBy,
          approvedBy: "Super Administrator"
        }
      ];

      setJournalEntries((prev) => [...glLines, ...prev]);
      showToast(`Cross-Module Sync: AP Supplier Invoice ${payload.id} approved and balanced in General Ledger!`, "success");

      logAuditEvent({
        action: "CREATE_AP_INVOICE",
        module: "Accounts Payable",
        description: `Approved supplier invoice ${payload.id} for ${payload.vendor} (₱${Number(payload.amount).toLocaleString()})`,
        newState: { invoice: payload, glLines }
      });
    }
  };

  // ==========================================
  // AP SETTLEMENT COMPLETE LIFECYCLE HANDLER
  // ==========================================
  const handleExecuteApSettlement = (payload: SettlementDetails) => {
    // 1. Update apInvoices state: update status to "Paid / Settled" and halt daily penalty compounding
    setApInvoices((prev) =>
      prev.map((inv) =>
        inv.id === payload.invoiceId
          ? {
              ...inv,
              status: "Paid / Settled" as const,
              dailyPenaltyRatePercent: 0 // Halts future compounding
            }
          : inv
      )
    );

    // Also update any matching item in apArInvoices to "Paid / Settled"
    setApArInvoices((prev) =>
      prev.map((inv) =>
        inv.id === payload.invoiceId || (inv.type === "AP" && inv.entityName.toLowerCase().includes(payload.vendor.toLowerCase().slice(0, 8)))
          ? { ...inv, status: "Paid / Settled" }
          : inv
      )
    );

    // 2. State & Metric Updates: Deduct settled total from Treasury Liquidity Pool
    const totalAmount = Number(payload.totalPayable);
    const isPetty =
      payload.disbursementAccount.includes("1010") ||
      payload.disbursementAccount.includes("1050") ||
      payload.disbursementAccount.includes("Petty") ||
      payload.disbursementAccount.includes("Cash Float") ||
      payload.paymentMethod === "Cash";

    const prevCash = { ...cashPool };
    const newCash = isPetty
      ? { ...prevCash, pettyCash: Math.max(0, prevCash.pettyCash - totalAmount) }
      : { ...prevCash, bankOperating: Math.max(0, prevCash.bankOperating - totalAmount) };

    setCashPool(newCash);

    // 3. Double-Entry Accounting Journal Entry:
    // Debit 2010 Trade Accounts Payable (Principal)
    // Debit 5440 Vendor Late Surcharges & Penalty Expense (if late increment > 0)
    // Credit Cash / Bank Account 1030 or 1010/1050 (Total Payable)
    const creditAccountCode = isPetty ? (payload.disbursementAccount.includes("1050") ? "1050" : "1010") : "1030";
    const creditAccountName = isPetty
      ? (payload.disbursementAccount.includes("1050") ? "1050 - Petty Cash Vault" : "1010 - Front Desk Cash Float")
      : "1030 - Operating Bank Account - Primary";

    const glDate = payload.paymentDate || new Date().toISOString().split("T")[0];
    const journalRef = payload.referenceNumber || `SETTLE-${payload.invoiceId}`;

    const glLines: any[] = [
      {
        id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
        date: glDate,
        ref: journalRef,
        sourceModule: "Supply Chain",
        accountCode: "2010",
        accountName: "2010 - Trade Accounts Payable",
        memo: `AP Settlement Principal: ${payload.vendor} (Invoice #${payload.invoiceId})`,
        debit: Number(payload.principal),
        credit: 0,
        status: "COMMITTED",
        postedBy: currentUser?.name || "Administrator",
        approvedBy: currentUser?.role === "superadmin" ? "Super Administrator" : "Finance Controller"
      }
    ];

    if (Number(payload.lateIncrement) > 0) {
      glLines.push({
        id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
        date: glDate,
        ref: journalRef,
        sourceModule: "Supply Chain",
        accountCode: "5440",
        accountName: "5440 - Vendor Late Surcharges & Penalty Expense",
        memo: `Overdue Penalty Surcharge (${payload.daysOverdue} days late): ${payload.vendor} (Invoice #${payload.invoiceId})`,
        debit: Number(payload.lateIncrement),
        credit: 0,
        status: "COMMITTED",
        postedBy: currentUser?.name || "Administrator",
        approvedBy: currentUser?.role === "superadmin" ? "Super Administrator" : "Finance Controller"
      });
    }

    glLines.push({
      id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
      date: glDate,
      ref: journalRef,
      sourceModule: "Treasury",
      accountCode: creditAccountCode,
      accountName: creditAccountName,
      memo: `Disbursement Outflow via ${payload.paymentMethod} (Ref: ${payload.referenceNumber}) for ${payload.vendor}`,
      debit: 0,
      credit: totalAmount,
      status: "COMMITTED",
      postedBy: currentUser?.name || "Administrator",
      approvedBy: currentUser?.role === "superadmin" ? "Super Administrator" : "Finance Controller"
    });

    setJournalEntries((prev) => [...glLines, ...prev]);

    // 4. Transaction History & Ledger Logging in Audit Trail
    logAuditEvent({
      action: "AP_SETTLEMENT",
      module: "Accounts Payable",
      description: `Settled AP invoice ${payload.invoiceId} for ${payload.vendor} (Principal: ₱${Number(payload.principal).toLocaleString()}, Surcharge: ₱${Number(payload.lateIncrement).toLocaleString()}, Total: ₱${totalAmount.toLocaleString()}) via ${payload.paymentMethod} [Ref: ${payload.referenceNumber}]`,
      previousState: {
        invoiceId: payload.invoiceId,
        vendor: payload.vendor,
        status: "Overdue/Unpaid",
        principal: payload.principal,
        lateIncrement: payload.lateIncrement,
        totalObligation: totalAmount
      },
      newState: {
        invoiceId: payload.invoiceId,
        vendor: payload.vendor,
        status: "Paid / Settled",
        amountPaid: totalAmount,
        principalPaid: payload.principal,
        latePenaltyPaid: payload.lateIncrement,
        disbursementAccount: payload.disbursementAccount,
        paymentMethod: payload.paymentMethod,
        referenceNumber: payload.referenceNumber,
        paymentDate: payload.paymentDate,
        penaltiesHalted: true,
        glPostingLines: glLines
      }
    });

    // 5. Append to Disbursement Records
    const newDisbursementRecord = {
      id: `DISB-${Math.floor(600 + Math.random() * 300)}`,
      payee: `${payload.vendor} (Inv #${payload.invoiceId})`,
      swift: payload.paymentMethod === "Bank Transfer" ? "BDO-PESONET" : "CORPORATE-CHECK",
      nationalId: payload.tin || "204-889-102-000",
      netPay: totalAmount,
      token: `SETTLE-${payload.invoiceId}-${payload.referenceNumber.slice(-4)}`,
      department: payload.category || "Supply Chain & F&B Logistics"
    };
    setDisbursementData((prev) => [newDisbursementRecord, ...prev]);

    showToast(`AP Settlement Complete: Invoice #${payload.invoiceId} settled for ₱${totalAmount.toLocaleString()} via ${payload.paymentMethod}. GL and Audit Trail updated!`, "success");
  };

  const handleAddApInvoice = (newInv: SupplierInvoice) => {
    if (currentUser?.role === "superadmin") {
      setApInvoices((prev) => [newInv, ...prev]);
      const glLines = [
        {
          id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
          date: newInv.invoiceDate,
          ref: newInv.id,
          sourceModule: "Supply Chain",
          accountCode: "5010",
          accountName: "5010 - Cost of Goods Sold - Fresh Produce & Meats",
          memo: `Supplier Bill: ${newInv.vendor} (${newInv.category})`,
          debit: newInv.amount,
          credit: 0,
          status: "COMMITTED",
          postedBy: currentUser.name,
          approvedBy: "Super Administrator"
        },
        {
          id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
          date: newInv.invoiceDate,
          ref: newInv.id,
          sourceModule: "Supply Chain",
          accountCode: "2010",
          accountName: "2010 - Trade Accounts Payable",
          memo: `Trade AP Accrual: ${newInv.vendor}`,
          debit: 0,
          credit: newInv.amount,
          status: "COMMITTED",
          postedBy: currentUser.name,
          approvedBy: "Super Administrator"
        }
      ];
      setJournalEntries((prev) => [...glLines, ...prev]);
      logAuditEvent({
        action: "CREATE_AP_INVOICE",
        module: "Accounts Payable",
        description: `Direct AP Invoice ${newInv.id} created for ${newInv.vendor} (₱${newInv.amount.toLocaleString()})`,
        newState: { invoice: newInv, glLines }
      });
      showToast(`Supplier Invoice ${newInv.id} committed directly and posted to GL!`, "success");
    } else {
      submitForApproval("CREATE_AP_INVOICE", "Accounts Payable", newInv);
    }
  };

  const handleSettleApInvoice = (id: string) => {
    setApInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: "Paid / Settled" as const, dailyPenaltyRatePercent: 0 } : inv))
    );
  };

  // ==========================================
  // AR COLLECTION COMPLETE LIFECYCLE HANDLER
  // ==========================================
  const handleExecuteArCollection = (payload: CollectionPaymentDetails) => {
    const enteredAmount = Number(payload.collectionAmount);
    if (enteredAmount <= 0) return;

    // 1. State Updates in AR Invoices:
    // Update invoice status from Overdue/Unpaid to "Collected / Settled" (or "Partially Paid")
    // If full settlement, freeze daily late interest calculations (dailyPenaltyRatePercent: 0)
    setArInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === payload.invoiceId) {
          const newPaid = (inv.paidAmount || 0) + enteredAmount;
          const isFull = newPaid >= (payload.totalDue - 0.01) || payload.isFullSettlement;
          return {
            ...inv,
            paidAmount: newPaid,
            status: isFull ? ("Collected / Settled" as const) : ("Partially Paid" as const),
            dailyPenaltyRatePercent: isFull ? 0 : inv.dailyPenaltyRatePercent
          };
        }
        return inv;
      })
    );

    // Also update any matching item in apArInvoices
    setApArInvoices((prev) =>
      prev.map((inv) =>
        inv.id === payload.invoiceId || (inv.type === "AR" && inv.entityName.toLowerCase().includes(payload.customer.toLowerCase().slice(0, 8)))
          ? { ...inv, status: payload.isFullSettlement ? "Collected / Settled" : "Partially Collected" }
          : inv
      )
    );

    // 2. Cross-Module Sync: Treasury (Cash Management) Liquidity
    const isPetty =
      payload.targetAccount.includes("1010") ||
      payload.targetAccount.includes("Front Desk") ||
      payload.targetAccount.includes("Petty Cash") ||
      payload.paymentMethod === "Cash / Petty";

    const prevCash = { ...cashPool };
    const newCash = isPetty
      ? { ...prevCash, pettyCash: prevCash.pettyCash + enteredAmount }
      : { ...prevCash, bankOperating: prevCash.bankOperating + enteredAmount };

    setCashPool(newCash);

    // 3. Post Balanced Double-Entry in General Ledger:
    // DR Target Treasury Account (1030 Bank or 1010 Petty) for full collection amount
    // CR 1210 City Ledger / 1200 Accounts Receivable for principal portion
    // CR 4200 Surcharge & Penalty Interest Income (if late penalty is recovered)
    const debitAccountCode = isPetty ? "1010" : "1030";
    const debitAccountName = isPetty
      ? "1010 - Front Desk Cash Float (Petty Cash)"
      : (payload.targetAccount.includes("BPI") ? "1030 - Commercial Treasury Account - BPI" : "1030 - Operating Bank Account - BDO Primary");

    const glDate = payload.paymentDate || new Date().toISOString().split("T")[0];
    const journalRef = payload.referenceNumber || `COL-${payload.invoiceId}`;

    const lateIncrementPortion = Math.min(enteredAmount, Number(payload.lateIncrement) || 0);
    const principalPortion = Math.max(0, enteredAmount - lateIncrementPortion);

    const glLines: any[] = [
      {
        id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
        date: glDate,
        ref: journalRef,
        sourceModule: "Treasury",
        accountCode: debitAccountCode,
        accountName: debitAccountName,
        memo: `Collection Deposit via ${payload.paymentMethod} from ${payload.customer} (Inv #${payload.invoiceId})`,
        debit: enteredAmount,
        credit: 0,
        status: "COMMITTED",
        postedBy: currentUser?.name || "Administrator",
        approvedBy: currentUser?.role === "superadmin" ? "Super Administrator" : "Finance Controller"
      },
      {
        id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
        date: glDate,
        ref: journalRef,
        sourceModule: "Hotel PMS",
        accountCode: "1210",
        accountName: "1210 - City Ledger & Corporate Accounts Receivable",
        memo: `AR Settlement: ${payload.customer} (Folio / Inv #${payload.invoiceId})`,
        debit: 0,
        credit: principalPortion,
        status: "COMMITTED",
        postedBy: currentUser?.name || "Administrator",
        approvedBy: currentUser?.role === "superadmin" ? "Super Administrator" : "Finance Controller"
      }
    ];

    if (lateIncrementPortion > 0) {
      glLines.push({
        id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
        date: glDate,
        ref: journalRef,
        sourceModule: "Hotel PMS",
        accountCode: "4200",
        accountName: "4200 - Penalty & Overdue Interest Income",
        memo: `Late Surcharge Recovery (${payload.daysOverdue} days late): ${payload.customer}`,
        debit: 0,
        credit: lateIncrementPortion,
        status: "COMMITTED",
        postedBy: currentUser?.name || "Administrator",
        approvedBy: currentUser?.role === "superadmin" ? "Super Administrator" : "Finance Controller"
      });
    }

    setJournalEntries((prev) => [...glLines, ...prev]);

    // 4. Append to Collections Data Register (Collection Module sync)
    const newCollectionEntry = {
      id: `COL-${Math.floor(200 + Math.random() * 800)}`,
      payerName: `${payload.customer} (Inv #${payload.invoiceId})`,
      phone: "+639170192834",
      email: "finance@client.corporate.ph",
      cardNo: payload.referenceNumber,
      checkNo: payload.referenceNumber,
      amount: enteredAmount,
      targetAccount: isPetty ? "Front Desk Cash Float" : "Operating Bank Account"
    };
    setCollectionData((prev) => [newCollectionEntry, ...prev]);

    // 5. Transaction History & Ledger Logging in Audit Trail
    logAuditEvent({
      action: "AR_COLLECTION_DEPOSIT",
      module: "Accounts Receivable",
      description: `Collected ₱${enteredAmount.toLocaleString()} for customer invoice ${payload.invoiceId} (${payload.customer}) deposited into ${payload.targetAccount} via ${payload.paymentMethod} [Ref: ${payload.referenceNumber}]`,
      previousState: {
        invoiceId: payload.invoiceId,
        customer: payload.customer,
        status: "Overdue/Unpaid",
        principal: payload.principal,
        priorPaid: payload.paidAmountPrior,
        lateIncrement: payload.lateIncrement,
        totalDue: payload.totalDue
      },
      newState: {
        invoiceId: payload.invoiceId,
        customer: payload.customer,
        status: payload.isFullSettlement ? "Collected / Settled" : "Partially Paid",
        collectionAmount: enteredAmount,
        destinationAccount: payload.targetAccount,
        paymentMethod: payload.paymentMethod,
        referenceNumber: payload.referenceNumber,
        depositDate: payload.paymentDate,
        penaltiesHalted: payload.isFullSettlement,
        glPostingLines: glLines
      }
    });

    showToast(
      `AR Collection Complete: ₱${enteredAmount.toLocaleString()} deposited to ${isPetty ? "Petty Cash Float" : "Operating Treasury"} for ${payload.customer}. GL & Treasury updated!`,
      "success"
    );
  };

  const handleAddArInvoice = (newInv: CustomerInvoice) => {
    if (currentUser?.role === "superadmin") {
      setArInvoices((prev) => [newInv, ...prev]);
      const glLines = [
        {
          id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
          date: newInv.invoiceDate,
          ref: newInv.id,
          sourceModule: "Hotel PMS",
          accountCode: "1210",
          accountName: "1210 - City Ledger & Corporate Accounts Receivable",
          memo: `Client Invoice: ${newInv.customer} (${newInv.category})`,
          debit: newInv.amount,
          credit: 0,
          status: "COMMITTED",
          postedBy: currentUser.name,
          approvedBy: "Super Administrator"
        },
        {
          id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
          date: newInv.invoiceDate,
          ref: newInv.id,
          sourceModule: "Hotel PMS",
          accountCode: "4010",
          accountName: "4010 - Hotel Room Revenue - Deluxe & Suites",
          memo: `Service Revenue: ${newInv.customer}`,
          debit: 0,
          credit: newInv.amount,
          status: "COMMITTED",
          postedBy: currentUser.name,
          approvedBy: "Super Administrator"
        }
      ];
      setJournalEntries((prev) => [...glLines, ...prev]);
      logAuditEvent({
        action: "CREATE_AR_INVOICE",
        module: "Accounts Receivable",
        description: `Direct AR Invoice ${newInv.id} issued for ${newInv.customer} (₱${newInv.amount.toLocaleString()})`,
        newState: { invoice: newInv, glLines }
      });
      showToast(`Customer Invoice ${newInv.id} committed directly and posted to GL!`, "success");
    } else {
      submitForApproval("CREATE_AR_INVOICE", "Accounts Receivable", newInv);
    }
  };

  // ==========================================
  // COLLECTION MODULE CROSS-SYNC HANDLERS
  // ==========================================
  const handleMatchToAr = (collection: CollectionItem, targetInvoice: CustomerInvoice | null) => {
    // 1. Update Collections State
    setCollections((prev) =>
      prev.map((c) =>
        c.id === collection.id
          ? {
              ...c,
              arMatchStatus: "Matched to AR" as const,
              invoiceId: targetInvoice ? targetInvoice.id : c.invoiceId,
              customerName: targetInvoice ? targetInvoice.customer : c.customerName
            }
          : c
      )
    );

    // 2. Update Target AR Invoice State & Freeze Penalties if settled
    if (targetInvoice) {
      setArInvoices((prev) =>
        prev.map((inv) => {
          if (inv.id === targetInvoice.id) {
            const newPaid = (inv.paidAmount || 0) + collection.amount;
            const isFull = newPaid >= (inv.amount - 0.01);
            return {
              ...inv,
              paidAmount: newPaid,
              status: isFull ? ("Collected / Settled" as const) : ("Partially Paid" as const),
              dailyPenaltyRatePercent: isFull ? 0 : inv.dailyPenaltyRatePercent
            };
          }
          return inv;
        })
      );

      // Also update matching records in apArInvoices
      setApArInvoices((prev) =>
        prev.map((inv) =>
          inv.id === targetInvoice.id || (inv.type === "AR" && inv.entityName.toLowerCase().includes(targetInvoice.customer.toLowerCase().slice(0, 8)))
            ? { ...inv, status: "Collected / Settled" }
            : inv
        )
      );
    }

    // 3. Post Balanced Double-Entry to General Ledger
    const isPetty =
      collection.targetVault.includes("Front Desk") ||
      collection.targetVault.includes("Float") ||
      collection.method.includes("Cash");

    const debitAccountCode = isPetty ? "1010" : "1030";
    const debitAccountName = isPetty
      ? "1010 - Front Desk Cash Float"
      : collection.targetVault.includes("BPI")
      ? "1030 - Commercial Treasury Account - BPI"
      : "1030 - Operating Bank Account - BDO Primary";

    const glDate = collection.date || new Date().toISOString().split("T")[0];
    const journalRef = collection.officialReceiptNo || `RECON-${collection.id}`;

    const glLines: any[] = [
      {
        id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
        date: glDate,
        ref: journalRef,
        sourceModule: "Treasury",
        accountCode: debitAccountCode,
        accountName: debitAccountName,
        memo: `Receipt Clearance & Allocation: ${collection.customerName} via ${collection.method}`,
        debit: collection.amount,
        credit: 0,
        status: "COMMITTED",
        postedBy: currentUser?.name || "Administrator",
        approvedBy: currentUser?.role === "superadmin" ? "Super Administrator" : "Finance Controller"
      },
      {
        id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
        date: glDate,
        ref: journalRef,
        sourceModule: "Hotel PMS",
        accountCode: "1210",
        accountName: "1210 - City Ledger & Corporate Accounts Receivable",
        memo: `AR Reconciliation: Matched ${collection.id} (${collection.officialReceiptNo || "OR"}) to Inv #${targetInvoice?.id || collection.invoiceId}`,
        debit: 0,
        credit: collection.amount,
        status: "COMMITTED",
        postedBy: currentUser?.name || "Administrator",
        approvedBy: currentUser?.role === "superadmin" ? "Super Administrator" : "Finance Controller"
      }
    ];

    setJournalEntries((prev) => [...glLines, ...prev]);

    // 4. Cross-Module Sync: Treasury Cash Management
    const prevCash = { ...cashPool };
    const newCash = isPetty
      ? { ...prevCash, pettyCash: prevCash.pettyCash + collection.amount }
      : { ...prevCash, bankOperating: prevCash.bankOperating + collection.amount };
    setCashPool(newCash);

    // 5. Audit Trail Logging
    logAuditEvent({
      action: "MATCH_COLLECTION_TO_AR",
      module: "Collection Management",
      description: `Matched unallocated inflow ${collection.id} (${collection.officialReceiptNo}) of ₱${collection.amount.toLocaleString()} to AR Invoice ${targetInvoice?.id || collection.invoiceId} (${targetInvoice?.customer || collection.customerName})`,
      previousState: {
        collectionId: collection.id,
        arMatchStatus: "Pending Allocation",
        amount: collection.amount
      },
      newState: {
        collectionId: collection.id,
        arMatchStatus: "Matched to AR",
        officialReceiptNo: collection.officialReceiptNo,
        matchedInvoiceId: targetInvoice?.id || collection.invoiceId,
        glPostingLines: glLines
      }
    });

    showToast(
      `AR Match Complete: Record ${collection.id} matched to ${targetInvoice?.id || collection.invoiceId}. Receipt clearance posted to GL!`,
      "success"
    );
  };

  const handleRecordDirectCollection = (newCollection: CollectionItem) => {
    // 1. Append to Collections State
    setCollections((prev) => [newCollection, ...prev]);

    // 2. If an invoice matches, update AR state
    const matchedAr = arInvoices.find((inv) => inv.id === newCollection.invoiceId);
    if (matchedAr) {
      setArInvoices((prev) =>
        prev.map((inv) => {
          if (inv.id === matchedAr.id) {
            const newPaid = (inv.paidAmount || 0) + newCollection.amount;
            const isFull = newPaid >= (inv.amount - 0.01);
            return {
              ...inv,
              paidAmount: newPaid,
              status: isFull ? ("Collected / Settled" as const) : ("Partially Paid" as const),
              dailyPenaltyRatePercent: isFull ? 0 : inv.dailyPenaltyRatePercent
            };
          }
          return inv;
        })
      );
    }

    // 3. Treasury Liquidity Sync
    const isPetty =
      newCollection.targetVault.includes("Front Desk") ||
      newCollection.targetVault.includes("Float") ||
      newCollection.method.includes("Cash");

    const prevCash = { ...cashPool };
    const newCash = isPetty
      ? { ...prevCash, pettyCash: prevCash.pettyCash + newCollection.amount }
      : { ...prevCash, bankOperating: prevCash.bankOperating + newCollection.amount };
    setCashPool(newCash);

    // 4. Post Balanced Double-Entry to GL
    const debitAccountCode = isPetty ? "1010" : "1030";
    const debitAccountName = isPetty
      ? "1010 - Front Desk Cash Float"
      : newCollection.targetVault.includes("BPI")
      ? "1030 - Commercial Treasury Account - BPI"
      : "1030 - Operating Bank Account - BDO Primary";

    const glDate = newCollection.date || new Date().toISOString().split("T")[0];
    const journalRef = newCollection.officialReceiptNo || `DIR-COL-${newCollection.id}`;

    const glLines: any[] = [
      {
        id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
        date: glDate,
        ref: journalRef,
        sourceModule: "Treasury",
        accountCode: debitAccountCode,
        accountName: debitAccountName,
        memo: `Direct Collection Inflow: ${newCollection.customerName} via ${newCollection.method}`,
        debit: newCollection.amount,
        credit: 0,
        status: "COMMITTED",
        postedBy: currentUser?.name || "Administrator",
        approvedBy: currentUser?.role === "superadmin" ? "Super Administrator" : "Finance Controller"
      },
      {
        id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
        date: glDate,
        ref: journalRef,
        sourceModule: "Hotel PMS",
        accountCode: matchedAr ? "1210" : "4010",
        accountName: matchedAr
          ? "1210 - City Ledger & Corporate Accounts Receivable"
          : "4010 - Hotel Room & Direct Operational Revenue",
        memo: `Collection Allocation (${newCollection.officialReceiptNo}): ${newCollection.customerName} [${newCollection.sourceChannel}]`,
        debit: 0,
        credit: newCollection.amount,
        status: "COMMITTED",
        postedBy: currentUser?.name || "Administrator",
        approvedBy: currentUser?.role === "superadmin" ? "Super Administrator" : "Finance Controller"
      }
    ];

    setJournalEntries((prev) => [...glLines, ...prev]);

    // 5. Audit Trail Logging
    logAuditEvent({
      action: "RECORD_DIRECT_COLLECTION",
      module: "Collection Management",
      description: `Recorded collection of ₱${newCollection.amount.toLocaleString()} (OR# ${newCollection.officialReceiptNo}) from ${newCollection.customerName} via ${newCollection.method} to ${newCollection.targetVault}`,
      newState: {
        collection: newCollection,
        glPostingLines: glLines
      }
    });

    showToast(
      `Direct Collection Logged: ₱${newCollection.amount.toLocaleString()} (OR# ${newCollection.officialReceiptNo}) deposited to ${newCollection.targetVault}!`,
      "success"
    );
  };

  // Submit Action with Role Dispatch
  const submitForApproval = (actionType: string, module: string, payload: any) => {
    const isSuperAdmin = currentUser?.role === "superadmin";

    const req = {
      id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
      actionType,
      requestedBy: currentUser?.name || "Standard Administrator",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      module,
      payload,
      impactSummary: `Impacts ${module} and reflects real-time synchronized entries in General Ledger, Cash Liquidity, and Reporting.`
    };

    if (isSuperAdmin) {
      // Super Admin: Direct commit with immediate cross-module synchronization
      executeApprovedAction(req);
      logAuditEvent({
        action: "DIRECT_COMMIT_ACTION",
        module: "Governance & Approvals",
        description: `Super Admin directly committed ${actionType} on ${module}`,
        previousState: null,
        newState: req
      });
    } else {
      // Admin: Queued for Super Admin Governance Review
      setPendingApprovals((prev) => [req, ...prev]);
      showToast(`Action queued for Super Admin Approval (${req.id})`, "info");

      logAuditEvent({
        action: "QUEUE_APPROVAL_REQUEST",
        module: "Governance & Approvals",
        description: `Admin submitted ${actionType} for Super Admin review (${req.id})`,
        status: "PENDING_APPROVAL",
        previousState: null,
        newState: req
      });
    }
  };

  const handleApproveRequest = (req: any) => {
    executeApprovedAction(req);
    setPendingApprovals((prev) => prev.filter((r) => r.id !== req.id));

    logAuditEvent({
      action: "APPROVE_GOVERNANCE_REQUEST",
      module: "Governance & Approvals",
      description: `Super Administrator authorized and executed request ${req.id} (${req.actionType})`,
      previousState: { requestId: req.id, status: "PENDING_APPROVAL", payload: req.payload },
      newState: { requestId: req.id, status: "COMMITTED_AND_SYNCED", approvedAt: new Date().toISOString() }
    });
  };

  const handleRejectRequest = (reqId: string) => {
    const target = pendingApprovals.find((r) => r.id === reqId);
    setPendingApprovals((prev) => prev.filter((r) => r.id !== reqId));
    showToast(`Request ${reqId} was rejected by Super Administrator`, "warning");

    logAuditEvent({
      action: "REJECT_GOVERNANCE_REQUEST",
      module: "Governance & Approvals",
      description: `Super Administrator rejected request ${reqId}`,
      status: "REJECTED",
      previousState: target || { requestId: reqId, status: "PENDING_APPROVAL" },
      newState: { requestId: reqId, status: "REJECTED", rejectedAt: new Date().toISOString() }
    });
  };

  // General Ledger Computations
  const totalDebits = useMemo(
    () => journalEntries.reduce((s, i) => s + (Number(i.debit) || 0), 0),
    [journalEntries]
  );
  const totalCredits = useMemo(
    () => journalEntries.reduce((s, i) => s + (Number(i.credit) || 0), 0),
    [journalEntries]
  );
  const isGlBalanced = totalDebits > 0 && Math.abs(totalDebits - totalCredits) === 0;

  // ==========================================
  // VIEW: AUTHENTICATION LOGIN
  // ==========================================
  if (!currentUser) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4 lg:p-8 font-sans text-[#1A1D21] bg-[#0c1015] overflow-y-auto">
        {/* Atmospheric Backing with Hero Image */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src={loginHeroImage}
            alt="HORECA Hospitality & Financial Analytics Platform"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/login-bg.jpg";
            }}
            className="w-full h-full object-cover object-center scale-105 opacity-35 filter blur-[2px]"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0b0f14]/95 via-[#0e141c]/90 to-[#121820]/80" />
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0d_1px,transparent_1px)] [background-size:28px_28px]" />
        </div>

        {/* Floating Dual-Column Presentation Card */}
        <div className="relative z-10 max-w-4xl w-full bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden grid grid-cols-1 md:grid-cols-12 my-auto">
          {/* Left Column: Visual Showcase & 5 Subsystems Highlights */}
          <div className="md:col-span-5 relative bg-[#12171E] text-white p-6 sm:p-8 flex flex-col justify-between overflow-hidden">
            {/* Visual Hero Image Container */}
            <div className="absolute inset-0 z-0 opacity-40">
              <img
                src={loginHeroImage}
                alt="Hospitality and Fleet Operations Core"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/login-bg.jpg";
                }}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#12171E] via-[#12171E]/80 to-transparent" />
            </div>

            {/* Top Brand Header */}
            <div className="relative z-10 space-y-3">
              <div className="inline-flex bg-[#B53A1E] p-3 rounded-xl text-white shadow-lg">
                <Landmark className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold font-['Archivo'] tracking-tight">HORECA Financial ERP</h1>
                <p className="text-xs text-slate-300 font-['IBM_Plex_Mono'] mt-0.5">
                  5-Subsystem Interconnected Core
                </p>
              </div>
            </div>

            {/* Middle: 5 Connected Subsystems Badge Strip */}
            <div className="relative z-10 my-6 space-y-2 font-['IBM_Plex_Mono'] text-[11px]">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Live Interconnected Systems
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/10">
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    <span>1. Hotel PMS</span>
                  </span>
                  <span className="text-[10px] text-blue-300">Folios &amp; Rooms</span>
                </div>
                <div className="flex items-center justify-between bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/10">
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    <span>2. Restaurant POS</span>
                  </span>
                  <span className="text-[10px] text-amber-300">Dining &amp; SC Pool</span>
                </div>
                <div className="flex items-center justify-between bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/10">
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                    <span>3. HRMS Payroll</span>
                  </span>
                  <span className="text-[10px] text-purple-300">Wages &amp; WHT</span>
                </div>
                <div className="flex items-center justify-between bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/10">
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>4. Supply Chain</span>
                  </span>
                  <span className="text-[10px] text-emerald-300">Procure &amp; AP</span>
                </div>
                <div className="flex items-center justify-between bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/10">
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    <span>5. FleetOps</span>
                  </span>
                  <span className="text-[10px] text-cyan-300">Fuel, Shuttles &amp; Maint</span>
                </div>
              </div>
            </div>

            {/* Bottom Security Info */}
            <div className="relative z-10 text-[11px] font-['IBM_Plex_Mono'] text-slate-400 border-t border-white/10 pt-3">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                <span>Enterprise 2FA OTP &amp; 15-Min Inactivity Guard</span>
              </div>
            </div>
          </div>

          {/* Right Column: Authentication Form */}
          <div className="md:col-span-7 p-6 sm:p-8 space-y-6 flex flex-col justify-center bg-white">
            {/* STEP 1: CREDENTIALS SUBMISSION */}
            {otpState.step === "credentials" ? (
              <>
                <div>
                  <h2 className="text-xl font-bold font-['Archivo'] text-[#1A1D21]">System Authentication</h2>
                  <p className="text-xs text-[#5C636F] font-['IBM_Plex_Mono'] mt-1">
                    Enter authorized credentials to dispatch Google 2FA OTP
                  </p>
                </div>

                {sessionExpiryNotice && (
                  <div className="bg-amber-50 border border-amber-300 text-amber-900 p-3 rounded-lg text-xs font-['IBM_Plex_Mono'] flex items-start space-x-2">
                    <Clock className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
                    <span>{sessionExpiryNotice}</span>
                  </div>
                )}

                {loginError && (
                  <div className="bg-[#B5281A]/10 border border-[#B5281A]/30 text-[#B5281A] p-3 rounded-lg text-xs flex items-center space-x-2 font-['IBM_Plex_Mono']">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold font-['IBM_Plex_Mono'] uppercase text-[#5C636F]">
                      System Email Address
                    </label>
                    <div className="relative">
                      <Mail className="h-4 w-4 absolute left-3 top-3 text-[#A8AFB8]" />
                      <input
                        type="email"
                        required
                        placeholder="e.g. Name@horeca.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full border border-[#DFE1DB] rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-[#1A1D21] font-['IBM_Plex_Sans']"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold font-['IBM_Plex_Mono'] uppercase text-[#5C636F]">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="h-4 w-4 absolute left-3 top-3 text-[#A8AFB8]" />
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full border border-[#DFE1DB] rounded-lg pl-9 pr-10 py-2 text-sm focus:outline-none focus:border-[#1A1D21] font-['IBM_Plex_Sans']"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-2.5 text-[#5C636F] hover:text-[#1A1D21] transition-colors cursor-pointer p-0.5 rounded"
                        title={showLoginPassword ? "Hide password" : "Show password"}
                        aria-label={showLoginPassword ? "Hide password" : "Show password"}
                      >
                        {showLoginPassword ? (
                          <EyeOff className="h-4 w-4 text-[#FF6A3D]" />
                        ) : (
                          <Eye className="h-4 w-4 text-[#5C636F]" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#1A1D21] hover:bg-[#2A2E34] text-white py-2.5 rounded-lg text-sm font-bold font-['IBM_Plex_Mono'] flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-sm"
                  >
                    <span>Sign In &amp; Dispatch Google OTP</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>

                <div className="border-t border-[#DFE1DB] pt-3 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#5C636F] font-['IBM_Plex_Mono']">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>Philippine Hospitality &amp; FleetOps Compliance</span>
                  </div>
                </div>
              </>
            ) : (
              /* STEP 2: GOOGLE OTP VERIFICATION */
              <>
                <div className="text-center space-y-1.5">
                  <div className="inline-flex bg-emerald-700 p-3 rounded-xl text-white mb-1 shadow-md">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h2 className="text-xl font-bold font-['Archivo'] tracking-tight">Google 2-Factor OTP</h2>
                  <p className="text-xs text-[#5C636F] font-['IBM_Plex_Mono']">
                    Verification code dispatched to linked Google account:
                  </p>
                  <div className="inline-block bg-[#F1F1ED] border border-[#DFE1DB] px-3 py-1 rounded-lg text-xs font-bold font-['IBM_Plex_Mono'] text-[#1A1D21]">
                    {otpState.targetUser?.googleAccount}
                  </div>
                </div>

                {/* Simulated Gmail Push Notification Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs font-['IBM_Plex_Mono'] shadow-xs">
                  <div className="flex items-center justify-between text-[11px] text-[#5C636F]">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <Mail className="h-3.5 w-3.5 text-[#B53A1E]" />
                      <span>Google Mail Push Alert</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-bold">
                      Dispatched
                    </span>
                  </div>
                  <div className="p-2 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#5C636F] block">Your 6-Digit Code:</span>
                      <span className="text-base font-bold text-[#1A1D21] tracking-widest font-mono">
                        {otpState.generatedOtp}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setOtpState((prev) => ({
                          ...prev,
                          inputOtp: prev.generatedOtp,
                          error: ""
                        }))
                      }
                      className="px-2.5 py-1 bg-[#1A1D21] hover:bg-[#2A2E34] text-white rounded text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      Auto-Fill Code
                    </button>
                  </div>
                </div>

                {otpState.error && (
                  <div className="bg-[#B5281A]/10 border border-[#B5281A]/30 text-[#B5281A] p-3 rounded-lg text-xs flex items-center space-x-2 font-['IBM_Plex_Mono']">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{otpState.error}</span>
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold font-['IBM_Plex_Mono'] uppercase text-[#5C636F]">
                      Enter 6-Digit OTP Code
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="000000"
                      value={otpState.inputOtp}
                      onChange={(e) =>
                        setOtpState((prev) => ({
                          ...prev,
                          inputOtp: e.target.value.replace(/\D/g, ""),
                          error: ""
                        }))
                      }
                      className="w-full border-2 border-[#1A1D21] rounded-lg text-center tracking-[0.4em] font-['IBM_Plex_Mono'] font-bold text-xl py-2.5 focus:outline-none focus:ring-2 focus:ring-[#B53A1E]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#157A4D] hover:bg-[#12633e] text-white py-2.5 rounded-lg text-sm font-bold font-['IBM_Plex_Mono'] flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-sm"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Authorize &amp; Enter System</span>
                  </button>

                  <div className="flex items-center justify-between text-xs font-['IBM_Plex_Mono'] pt-2">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={otpState.resendCountdown > 0}
                      className={`font-bold transition-colors ${
                        otpState.resendCountdown > 0
                          ? "text-[#5C636F] cursor-not-allowed"
                          : "text-[#B53A1E] hover:underline cursor-pointer"
                      }`}
                    >
                      {otpState.resendCountdown > 0
                        ? `Resend Code (${otpState.resendCountdown}s)`
                        : "Resend Code to Gmail"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setOtpState({
                          step: "credentials",
                          targetUser: null,
                          generatedOtp: "",
                          inputOtp: "",
                          error: "",
                          otpNotificationToast: null,
                          resendCountdown: 30
                        })
                      }
                      className="text-[#5C636F] hover:text-[#1A1D21] hover:underline cursor-pointer"
                    >
                      Back to Sign In
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: MAIN ENTERPRISE INTERFACE
  // ==========================================
  return (
    <div className="h-screen flex flex-col bg-[#F1F1ED] text-[#1A1D21] font-sans antialiased overflow-hidden">
      {/* Toast Notification Float */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 p-4 rounded-xl shadow-2xl border text-xs font-['IBM_Plex_Mono'] flex items-center space-x-3 transition-all animate-bounce ${
            toastMessage.type === "success"
              ? "bg-[#157A4D] text-white border-[#12633e]"
              : toastMessage.type === "warning"
              ? "bg-[#B5281A] text-white border-[#932014]"
              : "bg-[#1A1D21] text-white border-[#2A2E34]"
          }`}
        >
          <Bell className="h-4 w-4 shrink-0 animate-pulse" />
          <span className="font-bold">{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="shrink-0 bg-[#1A1D21] text-white px-6 py-4 border-b border-[#2A2E34] flex items-center justify-between h-[65px] z-40">
        <div className="flex items-center space-x-3">
          <div className="bg-[#B53A1E] p-2 rounded-md">
            <Landmark className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-['Archivo'] tracking-wide">
              FINANCIAL MANAGEMENT SYSTEM
            </h1>
            <p className="text-xs text-[#A8AFB8] font-['IBM_Plex_Mono']">
              HORECA TRANSACTION CORE &amp; PREDICTIVE ANALYTICS
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Active 15-Minute Session Inactivity Tracker */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#2A2E34] text-xs font-['IBM_Plex_Mono'] rounded-lg text-emerald-400 border border-[#3A404A]"
            title="Session auto-locks after 15 minutes of inactivity"
          >
            <Clock className="h-3.5 w-3.5 text-[#FF6A3D]" />
            <span>
              Session: {Math.floor(sessionSecondsLeft / 60)}:
              {String(sessionSecondsLeft % 60).padStart(2, "0")}
            </span>
          </div>

          <button
            onClick={handleToggleMasking}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold font-['IBM_Plex_Mono'] flex items-center space-x-2 border transition-colors cursor-pointer ${
              isDataMasked
                ? "bg-[#8A5A00]/20 text-[#FFC107] border-[#8A5A00]"
                : "bg-[#157A4D]/20 text-[#35C98B] border-[#157A4D]"
            }`}
          >
            {isDataMasked ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{isDataMasked ? "Data Masked (Unmask)" : "Data Unmasked"}</span>
          </button>

          <div className="flex items-center space-x-3 pl-3 border-l border-[#2A2E34]">
            <div className="text-right">
              <span className="block text-xs font-bold">{currentUser.name}</span>
              <span className="block text-[10px] text-[#FF6A3D] font-['IBM_Plex_Mono'] uppercase">
                {currentUser.role === "superadmin" ? "Super Admin" : "Standard Admin"}
              </span>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 bg-[#2A2E34] hover:bg-[#B5281A] text-white rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Workspace with Separated Scrollbars */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar (Collapsible Icon-Only Mode with Independent Scrollbar) */}
        <aside
          className={`bg-[#FFFFFF] border-r border-[#DFE1DB] h-full overflow-y-auto custom-scrollbar p-3 flex flex-col justify-between shrink-0 transition-all duration-300 ${
            isSidebarCollapsed ? "w-20" : "w-64"
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2 pt-1">
              {!isSidebarCollapsed && (
                <p className="text-[11px] font-bold font-['IBM_Plex_Mono'] uppercase text-[#5C636F]">
                  Modules
                </p>
              )}
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className={`p-1.5 rounded-lg text-[#5C636F] hover:text-[#1A1D21] hover:bg-[#F1F1ED] transition-colors cursor-pointer ${
                  isSidebarCollapsed ? "mx-auto" : ""
                }`}
                title={isSidebarCollapsed ? "Expand sidebar" : "Collapse to icons only"}
              >
                {isSidebarCollapsed ? (
                  <PanelLeftOpen className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </button>
            </div>

            <nav className="space-y-1">
              {[
                { id: "overview", label: "Overview Dashboard", icon: LayoutDashboard },
                { id: "gl", label: "General Ledger Core", icon: BookOpen },
                { id: "ap", label: "Accounts Payable (AP)", icon: CreditCard },
                { id: "ar", label: "Accounts Receivable (AR)", icon: Receipt },
                { id: "collection", label: "Collection Management", icon: ArrowDownLeft },
                { id: "disbursement", label: "Disbursements", icon: ArrowUpRight },
                { id: "cash", label: "Cash Management", icon: Landmark },
                { id: "tax", label: "Tax Management", icon: FileText },
                { id: "budget", label: "Budget Management", icon: PiggyBank },
                { id: "reports", label: "Financial Reporting", icon: TrendingUp },
                {
                  id: "approvals",
                  label: `Approval Queue (${pendingApprovals.length})`,
                  icon: ShieldCheck,
                  badge: pendingApprovals.length,
                },
                {
                  id: "audit",
                  label: "Audit Trail",
                  icon: History,
                  badge: auditLogs.length,
                },
                ...(currentUser.role === "superadmin"
                  ? [
                      {
                        id: "users",
                        label: "Security & Users",
                        icon: Users,
                        badge: undefined
                      }
                    ]
                  : [])
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    title={isSidebarCollapsed ? tab.label : undefined}
                    className={`w-full flex items-center ${
                      isSidebarCollapsed ? "justify-center px-0 py-2.5" : "justify-between px-3 py-2.5"
                    } rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      isActive
                        ? "bg-[#1A1D21] text-white"
                        : "text-[#5C636F] hover:bg-[#F1F1ED] hover:text-[#1A1D21]"
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#FF6A3D]" : ""}`} />
                      {!isSidebarCollapsed && <span className="truncate">{tab.label}</span>}
                    </div>
                    {!isSidebarCollapsed && tab.badge !== undefined && tab.badge > 0 && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          tab.id === "audit"
                            ? "bg-[#1A1D21] text-white"
                            : "bg-[#B53A1E] text-white"
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                    {isSidebarCollapsed && tab.badge !== undefined && tab.badge > 0 && (
                      <span className="w-2 h-2 rounded-full bg-[#B53A1E]"></span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer Info */}
          {!isSidebarCollapsed && (
            <div className="border-t border-[#DFE1DB] pt-3 text-[10px] font-['IBM_Plex_Mono'] text-[#5C636F]">
              <div className="flex items-center justify-between">
                <span>Google 2FA:</span>
                <span className="text-emerald-700 font-bold">Active</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span>Role Level:</span>
                <span className="font-bold text-[#1A1D21] uppercase">{currentUser.role}</span>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content Workspace (Independent Scrollbar) */}
        <main className="flex-1 h-full p-6 space-y-6 overflow-y-auto custom-scrollbar bg-[#F8F9F6]">
          {/* ==============================================================================
              MODULE: OVERVIEW DASHBOARD (DYNAMIC DESIGN + LINEAR REGRESSION DIAGRAM)
             ============================================================================== */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Header Title */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div>
                  <h2 className="text-2xl font-bold font-['Archivo']">Overview Dashboard</h2>
                  <p className="text-xs text-[#5C636F]">
                    Hospitality financial metrics, linear regression diagrams &amp; multi-module live status
                  </p>
                </div>
                <div className="flex items-center space-x-2 font-['IBM_Plex_Mono'] text-xs">
                  <span className="bg-[#157A4D]/10 text-[#157A4D] px-2.5 py-1 rounded font-bold border border-[#157A4D]/30 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#157A4D] animate-ping" />
                    <span>Real-Time Sync Active</span>
                  </span>
                </div>
              </div>

              {/* Top 4 KPI Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-[#DFE1DB] p-4 rounded-xl space-y-2 shadow-xs">
                  <div className="flex justify-between items-center text-[#5C636F]">
                    <span className="text-xs font-['IBM_Plex_Mono'] font-bold">TOTAL CASH POSITION</span>
                    <PesoSign className="h-4 w-4 text-[#157A4D]" />
                  </div>
                  <p className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#157A4D]">
                    {maskCurrency(cashPool.bankOperating + cashPool.pettyCash)}
                  </p>
                  <p className="text-[11px] text-[#5C636F]">
                    Operating Bank ({isDataMasked ? "••••" : `₱${(cashPool.bankOperating / 1000).toFixed(0)}k`}) + Petty Cash ({isDataMasked ? "••••" : `₱${(cashPool.pettyCash / 1000).toFixed(0)}k`})
                  </p>
                </div>

                <div className="bg-white border border-[#DFE1DB] p-4 rounded-xl space-y-2 shadow-xs">
                  <div className="flex justify-between items-center text-[#5C636F]">
                    <span className="text-xs font-['IBM_Plex_Mono'] font-bold">OUTSTANDING AP</span>
                    <TrendingDown className="h-4 w-4 text-[#B5281A]" />
                  </div>
                  <p className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#B5281A]">
                    {maskCurrency(apInvoices.filter(i => i.status !== 'Paid / Settled').reduce((s, i) => s + i.amount, 0))}
                  </p>
                  <p className="text-[11px] text-[#5C636F]">Trade Purveyors &amp; Supply Obligations</p>
                </div>

                <div className="bg-white border border-[#DFE1DB] p-4 rounded-xl space-y-2 shadow-xs">
                  <div className="flex justify-between items-center text-[#5C636F]">
                    <span className="text-xs font-['IBM_Plex_Mono'] font-bold">RECEIVABLES DUE (AR)</span>
                    <TrendingUp className="h-4 w-4 text-[#157A4D]" />
                  </div>
                  <p className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#157A4D]">
                    {maskCurrency(apArInvoices.filter(i => i.type === 'AR').reduce((s, i) => s + i.amount, 0))}
                  </p>
                  <p className="text-[11px] text-[#5C636F]">Corporate City Ledger &amp; OTA Receivables</p>
                </div>

                <div className="bg-white border border-[#DFE1DB] p-4 rounded-xl space-y-2 shadow-xs">
                  <div className="flex justify-between items-center text-[#5C636F]">
                    <span className="text-xs font-['IBM_Plex_Mono'] font-bold">PENDING APPROVALS</span>
                    <ShieldCheck className="h-4 w-4 text-[#FF6A3D]" />
                  </div>
                  <p className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#FF6A3D]">
                    {pendingApprovals.length}
                  </p>
                  <p className="text-[11px] text-[#5C636F]">Queued for Super Admin Review</p>
                </div>
              </div>

              {/* LINEAR REGRESSION DIAGRAM (VISIBLE FOR ADMIN & SUPER ADMIN) */}
              <LinearRegressionDiagram
                isDataMasked={isDataMasked}
                maskCurrency={maskCurrency}
                role={currentUser.role}
              />

              {/* Operations & 5 Interconnected Subsystems Operational Matrix */}
              <div className="bg-white border border-[#DFE1DB] p-5 rounded-xl space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#DFE1DB] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-[#B53A1E]" />
                      <h3 className="font-bold text-sm font-['Archivo']">5 Interconnected Subsystems Operational Matrix &amp; Live Sync</h3>
                    </div>
                    <p className="text-xs text-[#5C636F] mt-0.5">
                      Real-time cross-synchronization with the General Ledger double-entry transaction core
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      showToast("All 5 Subsystems (PMS, POS, HRMS, SCM, FleetOps) synchronized with General Ledger", "success");
                    }}
                    className="px-3 py-1.5 bg-[#1A1D21] hover:bg-[#2A2E34] text-white text-xs font-['IBM_Plex_Mono'] font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Sync All 5 Subsystems</span>
                  </button>
                </div>

                {/* 5 Subsystem Interconnected Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {/* Subsystem 1: Hotel PMS */}
                  <div className="p-3.5 bg-[#F8F9F6] rounded-xl border border-[#DFE1DB] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-['IBM_Plex_Mono'] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded">
                        Subsystem 1
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Active
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1A1D21] font-['Archivo']">Hotel PMS</h4>
                      <p className="text-[11px] text-[#5C636F] leading-tight mt-0.5">Front Desk Folios, Night Audit &amp; Room Revenue</p>
                    </div>
                    <div className="text-[10px] font-['IBM_Plex_Mono'] text-[#5C636F] space-y-0.5 pt-1 border-t border-[#DFE1DB]">
                      <div>Linked COA: <span className="font-bold text-[#1A1D21]">{isDataMasked ? maskField("1010, 4010, 2020", "account") : "1010, 4010, 2020"}</span></div>
                      <div>GL Volume: <span className="font-bold text-[#157A4D]">{maskCurrency(167840)}</span></div>
                    </div>
                    <button
                      onClick={() => setActiveTab("gl")}
                      className="w-full text-center py-1 text-[10px] font-bold font-['IBM_Plex_Mono'] text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors cursor-pointer"
                    >
                      Inspect in GL →
                    </button>
                  </div>

                  {/* Subsystem 2: Restaurant POS */}
                  <div className="p-3.5 bg-[#F8F9F6] rounded-xl border border-[#DFE1DB] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-['IBM_Plex_Mono'] font-bold px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded">
                        Subsystem 2
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Active
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1A1D21] font-['Archivo']">Restaurant POS</h4>
                      <p className="text-[11px] text-[#5C636F] leading-tight mt-0.5">Dining Checks, Bar Revenue &amp; 85% SC Pool</p>
                    </div>
                    <div className="text-[10px] font-['IBM_Plex_Mono'] text-[#5C636F] space-y-0.5 pt-1 border-t border-[#DFE1DB]">
                      <div>Linked COA: <span className="font-bold text-[#1A1D21]">{isDataMasked ? maskField("1020, 4020, 2200", "account") : "1020, 4020, 2200"}</span></div>
                      <div>GL Volume: <span className="font-bold text-[#157A4D]">{maskCurrency(86240)}</span></div>
                    </div>
                    <button
                      onClick={() => setActiveTab("gl")}
                      className="w-full text-center py-1 text-[10px] font-bold font-['IBM_Plex_Mono'] text-amber-800 bg-amber-50 hover:bg-amber-100 rounded transition-colors cursor-pointer"
                    >
                      Inspect in GL →
                    </button>
                  </div>

                  {/* Subsystem 3: HRMS Payroll */}
                  <div className="p-3.5 bg-[#F8F9F6] rounded-xl border border-[#DFE1DB] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-['IBM_Plex_Mono'] font-bold px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded">
                        Subsystem 3
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Active
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1A1D21] font-['Archivo']">HRMS Payroll</h4>
                      <p className="text-[11px] text-[#5C636F] leading-tight mt-0.5">Salaries, BIR WHT, SSS &amp; Bank Direct EFT</p>
                    </div>
                    <div className="text-[10px] font-['IBM_Plex_Mono'] text-[#5C636F] space-y-0.5 pt-1 border-t border-[#DFE1DB]">
                      <div>Linked COA: <span className="font-bold text-[#1A1D21]">{isDataMasked ? maskField("5110, 2110, 2120", "account") : "5110, 2110, 2120"}</span></div>
                      <div>GL Volume: <span className="font-bold text-[#157A4D]">{maskCurrency(185000)}</span></div>
                    </div>
                    <button
                      onClick={() => setActiveTab("gl")}
                      className="w-full text-center py-1 text-[10px] font-bold font-['IBM_Plex_Mono'] text-purple-700 bg-purple-50 hover:bg-purple-100 rounded transition-colors cursor-pointer"
                    >
                      Inspect in GL →
                    </button>
                  </div>

                  {/* Subsystem 4: Supply Chain */}
                  <div className="p-3.5 bg-[#F8F9F6] rounded-xl border border-[#DFE1DB] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-['IBM_Plex_Mono'] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                        Subsystem 4
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Active
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1A1D21] font-['Archivo']">Supply Chain</h4>
                      <p className="text-[11px] text-[#5C636F] leading-tight mt-0.5">PO Matching, Raw Meats, F&amp;B &amp; Trade AP</p>
                    </div>
                    <div className="text-[10px] font-['IBM_Plex_Mono'] text-[#5C636F] space-y-0.5 pt-1 border-t border-[#DFE1DB]">
                      <div>Linked COA: <span className="font-bold text-[#1A1D21]">{isDataMasked ? maskField("1310, 1320, 2010", "account") : "1310, 1320, 2010"}</span></div>
                      <div>GL Volume: <span className="font-bold text-[#157A4D]">{maskCurrency(112000)}</span></div>
                    </div>
                    <button
                      onClick={() => setActiveTab("gl")}
                      className="w-full text-center py-1 text-[10px] font-bold font-['IBM_Plex_Mono'] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors cursor-pointer"
                    >
                      Inspect in GL →
                    </button>
                  </div>

                  {/* Subsystem 5: FleetOps */}
                  <div className="p-3.5 bg-[#F8F9F6] rounded-xl border border-[#DFE1DB] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-['IBM_Plex_Mono'] font-bold px-2 py-0.5 bg-cyan-50 text-cyan-800 border border-cyan-300 rounded">
                        Subsystem 5
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Active
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1A1D21] font-['Archivo']">FleetOps</h4>
                      <p className="text-[11px] text-[#5C636F] leading-tight mt-0.5">Vehicles, Fuel Cards, Maintenance &amp; Shuttles</p>
                    </div>
                    <div className="text-[10px] font-['IBM_Plex_Mono'] text-[#5C636F] space-y-0.5 pt-1 border-t border-[#DFE1DB]">
                      <div>Linked COA: <span className="font-bold text-[#1A1D21]">{isDataMasked ? maskField("1530, 2030, 4300, 5410", "account") : "1530, 2030, 4300, 5410"}</span></div>
                      <div>GL Volume: <span className="font-bold text-[#157A4D]">{maskCurrency(87700)}</span></div>
                    </div>
                    <button
                      onClick={() => setActiveTab("gl")}
                      className="w-full text-center py-1 text-[10px] font-bold font-['IBM_Plex_Mono'] text-cyan-800 bg-cyan-50 hover:bg-cyan-100 rounded transition-colors cursor-pointer"
                    >
                      Inspect in GL →
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white border border-[#DFE1DB] p-5 rounded-xl space-y-4 shadow-xs">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-sm font-['Archivo']">Subsystem Cross-Synchronization Feed</h3>
                    <span className="text-[10px] font-['IBM_Plex_Mono'] text-[#5C636F]">
                      Active GL Turnover: <strong>{maskCurrency(totalDebits)}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-['IBM_Plex_Sans']">
                    <div className="p-3.5 bg-[#F1F1ED] rounded-lg space-y-1.5 border border-[#DFE1DB]">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#1A1D21]">General Ledger Balance</span>
                        <CheckCircle2 className="h-4 w-4 text-[#157A4D]" />
                      </div>
                      <p className="text-[#5C636F]">
                        {isGlBalanced
                          ? "Ledger is balanced across all 5 subsystems (Debits = Credits). Double-entry rules strictly satisfied."
                          : "Warning: Unbalanced debit/credit detected."}
                      </p>
                      <span className="text-[11px] font-['IBM_Plex_Mono'] font-bold text-[#157A4D] block">
                        Balanced Volume: {maskCurrency(totalDebits)}
                      </span>
                    </div>

                    <div className="p-3.5 bg-[#F1F1ED] rounded-lg space-y-1.5 border border-[#DFE1DB]">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#1A1D21]">Department Budgets</span>
                        <Sparkles className="h-4 w-4 text-[#FF6A3D]" />
                      </div>
                      <p className="text-[#5C636F]">
                        {budgets.length} Department pools monitored across F&amp;B, Rooms, Logistics &amp; Facilities.
                      </p>
                      <span className="text-[11px] font-['IBM_Plex_Mono'] font-bold text-[#B53A1E] block">
                        Total Allocated: {maskCurrency(budgets.reduce((s, b) => s + b.allocated, 0))}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-[#DFE1DB] p-5 rounded-xl space-y-3 shadow-xs">
                  <h3 className="font-bold text-sm font-['Archivo']">Governance Summary</h3>
                  <div className="text-xs space-y-2 font-['IBM_Plex_Sans']">
                    <div className="p-2.5 border rounded-lg bg-[#F8F9F6] border-[#DFE1DB]">
                      <span className="font-bold text-[#1A1D21] block">Standard Admin Privileges</span>
                      <p className="text-[11px] text-[#5C636F]">
                        Can create invoices, record receipts, draft budgets &amp; post entries into review queue.
                      </p>
                    </div>
                    <div className="p-2.5 border rounded-lg bg-[#F8F9F6] border-[#DFE1DB]">
                      <span className="font-bold text-[#B53A1E] block">Super Admin Privileges</span>
                      <p className="text-[11px] text-[#5C636F]">
                        Direct commit rights, multi-module approval authorization &amp; master ledger governance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==============================================================================
              MODULE: GENERAL LEDGER (5 TABS: REPORT, BUILDER, COA, SQL SEED, DATA DICTIONARY)
             ============================================================================== */}
          {activeTab === "gl" && (
            <GeneralLedger
              journalEntries={journalEntries}
              setJournalEntries={setJournalEntries}
              submitForApproval={submitForApproval}
              currentUser={currentUser}
              isDataMasked={isDataMasked}
              maskCurrency={maskCurrency}
              maskField={maskField}
            />
          )}

          {/* ==============================================================================
              MODULE: ACCOUNTS PAYABLE (AP)
             ============================================================================== */}
          {activeTab === "ap" && (
            <AccountsPayable
              invoices={apInvoices}
              onAddInvoice={handleAddApInvoice}
              onExecuteSettlement={handleExecuteApSettlement}
              onSettleInvoice={handleSettleApInvoice}
              currentUser={currentUser}
              isDataMasked={isDataMasked}
              maskCurrency={maskCurrency}
              maskField={maskField}
            />
          )}

          {/* ==============================================================================
              MODULE: ACCOUNTS RECEIVABLE (AR)
             ============================================================================== */}
          {activeTab === "ar" && (
            <AccountsReceivable
              invoices={arInvoices}
              onAddInvoice={handleAddArInvoice}
              onExecuteCollection={handleExecuteArCollection}
              currentUser={currentUser}
              isDataMasked={isDataMasked}
              maskCurrency={maskCurrency}
              maskField={maskField}
            />
          )}

          {/* ==============================================================================
              MODULE: COLLECTION MANAGEMENT (INVOICE ID TRACKING)
             ============================================================================== */}
          {activeTab === "collection" && (
            <Collection
              collections={collections}
              arInvoices={arInvoices}
              onMatchToAr={handleMatchToAr}
              onRecordDirectCollection={handleRecordDirectCollection}
              currentUser={currentUser}
              isDataMasked={isDataMasked}
              maskCurrency={maskCurrency}
              maskField={maskField}
            />
          )}

          {/* ==============================================================================
              MODULE: DISBURSEMENTS
             ============================================================================== */}
          {activeTab === "disbursement" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#DFE1DB] pb-4">
                <div>
                  <h2 className="text-2xl font-bold font-['Archivo']">Disbursement Management &amp; Payout Control</h2>
                  <p className="text-xs text-[#5C636F]">Vendor checks, payroll direct deposit EFT, withholding tax (EWT) &amp; bank cash pool decrement</p>
                </div>
                <div className="flex items-center space-x-2">
                  <ExportButton
                    getExportData={getDisbursementExportData}
                    buttonLabel="Export Disbursements"
                  />
                </div>
              </div>

              {/* 4-Stage Approval & Verification Lifecycle */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white border border-[#DFE1DB] p-3.5 rounded-xl shadow-xs">
                  <span className="text-[10px] font-['IBM_Plex_Mono'] font-bold text-[#5C636F] uppercase block">TOTAL DISBURSED (MTD)</span>
                  <p className="text-lg font-bold font-['IBM_Plex_Mono'] text-[#B5281A] mt-1">
                    {maskCurrency(disbursementData.reduce((s, d) => s + d.netPay, 0))}
                  </p>
                  <span className="text-[10px] text-[#5C636F]">Electronic payouts cleared</span>
                </div>
                <div className="bg-white border border-[#DFE1DB] p-3.5 rounded-xl shadow-xs">
                  <span className="text-[10px] font-['IBM_Plex_Mono'] font-bold text-[#5C636F] uppercase block">2-TIER VERIFICATION</span>
                  <p className="text-lg font-bold font-['IBM_Plex_Mono'] text-[#157A4D] mt-1">Authorized</p>
                  <span className="text-[10px] text-[#5C636F]">Finance Reviewer + GM Sign-off</span>
                </div>
                <div className="bg-white border border-[#DFE1DB] p-3.5 rounded-xl shadow-xs">
                  <span className="text-[10px] font-['IBM_Plex_Mono'] font-bold text-[#5C636F] uppercase block">WITHHOLDING TAX (EWT 2%)</span>
                  <p className="text-lg font-bold font-['IBM_Plex_Mono'] text-[#FF6A3D] mt-1">
                    {maskCurrency(disbursementData.reduce((s, d) => s + d.netPay * 0.02, 0))}
                  </p>
                  <span className="text-[10px] text-[#5C636F]">BIR Form 2307 Creditable</span>
                </div>
                <div className="bg-white border border-[#DFE1DB] p-3.5 rounded-xl shadow-xs">
                  <span className="text-[10px] font-['IBM_Plex_Mono'] font-bold text-[#5C636F] uppercase block">PAYOUT PROTOCOL</span>
                  <p className="text-lg font-bold font-['IBM_Plex_Mono'] text-[#1A1D21] mt-1">PESONet / SWIFT</p>
                  <span className="text-[10px] text-[#5C636F]">Direct commercial bank sweep</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white border border-[#DFE1DB] p-4 rounded-xl shadow-xs space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-sm font-['Archivo']">Disbursement Authorizations</h3>
                    <span className="text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">{disbursementData.length} Outflows</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm font-['IBM_Plex_Sans']">
                      <thead className="bg-[#F1F1ED] text-xs font-['IBM_Plex_Mono']">
                        <tr>
                          <th className="p-2.5">Disbursement ID</th>
                          <th className="p-2.5">Payee Name</th>
                          <th className="p-2.5">Department</th>
                          <th className="p-2.5">SWIFT / Bank</th>
                          <th className="p-2.5 text-right">Net Outflow</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F1F1ED]">
                        {disbursementData.map((row) => (
                          <tr key={row.id} className="hover:bg-slate-50">
                            <td className="p-2.5 font-['IBM_Plex_Mono'] text-[#B53A1E] font-bold">{row.id}</td>
                            <td className="p-2.5 font-medium">{maskField(row.payee, 'name')}</td>
                            <td className="p-2.5 text-xs text-[#5C636F]">{row.department}</td>
                            <td className="p-2.5 font-['IBM_Plex_Mono'] text-xs">{maskField(row.swift, 'swift')}</td>
                            <td className="p-2.5 text-right font-bold text-[#B5281A] font-['IBM_Plex_Mono']">{maskCurrency(row.netPay)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white border border-[#DFE1DB] p-4 rounded-xl space-y-3 text-xs shadow-xs">
                  <h3 className="font-bold text-sm font-['Archivo']">Create Payment Disbursement</h3>
                  <input
                    type="text"
                    placeholder="Beneficiary Payee Name (e.g., Executive Payroll)"
                    value={disbursementForm.payee}
                    onChange={(e) => setDisbursementForm({ ...disbursementForm, payee: e.target.value })}
                    className="w-full border p-2 rounded"
                  />
                  <select
                    value={disbursementForm.department}
                    onChange={(e) => setDisbursementForm({ ...disbursementForm, department: e.target.value })}
                    className="w-full border p-2 rounded font-bold"
                  >
                    <option value="Executive Management">Executive Management</option>
                    <option value="Kitchen & F&B Operations">Kitchen &amp; F&B Operations</option>
                    <option value="Housekeeping & Facility">Housekeeping &amp; Facility</option>
                  </select>
                  <input
                    type="text"
                    placeholder="SWIFT / BIC Code"
                    value={disbursementForm.swift}
                    onChange={(e) => setDisbursementForm({ ...disbursementForm, swift: e.target.value })}
                    className="w-full border p-2 rounded"
                  />
                  <input
                    type="number"
                    placeholder="Net Pay Outflow (PHP)"
                    value={disbursementForm.netPay}
                    onChange={(e) => setDisbursementForm({ ...disbursementForm, netPay: e.target.value })}
                    className="w-full border p-2 rounded font-['IBM_Plex_Mono']"
                  />
                  <button
                    onClick={() => {
                      if (!disbursementForm.payee || !disbursementForm.netPay) return;
                      submitForApproval("ADD_DISBURSEMENT", "Disbursements", {
                        id: `DISB-${Math.floor(500 + Math.random() * 400)}`,
                        payee: disbursementForm.payee,
                        swift: disbursementForm.swift || "BOFAPHMMXXX",
                        nationalId: "112-482-990-110",
                        token: `AUTH-${Math.floor(10000 + Math.random() * 90000)}-Z9`,
                        department: disbursementForm.department,
                        netPay: Number(disbursementForm.netPay),
                      });
                      setDisbursementForm({ payee: "", swift: "", nationalId: "", netPay: "", department: "General Operations" });
                    }}
                    className="w-full bg-[#1A1D21] hover:bg-[#2A2E34] text-white p-2.5 rounded font-bold font-['IBM_Plex_Mono'] transition-colors cursor-pointer"
                  >
                    {currentUser.role === "superadmin" ? "Commit Disbursement Directly" : "Request Disbursement"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==============================================================================
              MODULE: BUDGET MANAGEMENT & LINEAR REGRESSION FORECASTING
             ============================================================================== */}
          {activeTab === "budget" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#DFE1DB] pb-4">
                <div>
                  <h2 className="text-2xl font-bold font-['Archivo']">Budget Management &amp; Department Allocation</h2>
                  <p className="text-xs text-[#5C636F]">Departmental spending limits, linear regression forecasting &amp; FP&A variance tracking</p>
                </div>
                <div className="flex items-center space-x-2">
                  <ExportButton
                    getExportData={getBudgetExportData}
                    buttonLabel="Export Budgets"
                  />
                </div>
              </div>

              {/* Linear Regression Forecasting Engine for Budgets */}
              <BudgetRegressionForecast
                departmentBudgets={budgets}
                maskCurrency={maskCurrency}
                isDataMasked={isDataMasked}
              />

              {/* Departmental CapEx vs OpEx Allocation Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {budgets.map((b) => {
                    const pct = Math.round((b.spent / b.allocated) * 100);
                    return (
                      <div key={b.id} className="bg-white border border-[#DFE1DB] p-4 rounded-xl space-y-3 shadow-xs">
                        <div className="flex justify-between items-center">
                          <h3 className="font-bold text-sm">{b.department}</h3>
                          <span className="text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">{b.id}</span>
                        </div>
                        <div className="w-full bg-[#F1F1ED] h-2.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              pct > 90 ? "bg-[#B5281A]" : pct > 70 ? "bg-[#FF6A3D]" : "bg-[#157A4D]"
                            }`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs font-['IBM_Plex_Mono']">
                          <span>Spent: {maskCurrency(b.spent)}</span>
                          <span>Allocated: {maskCurrency(b.allocated)} ({pct}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-white border border-[#DFE1DB] p-4 rounded-xl space-y-3 text-xs shadow-xs">
                  <h3 className="font-bold text-sm font-['Archivo']">Allocate Department Budget</h3>
                  <input
                    type="text"
                    placeholder="Department Title"
                    value={budgetForm.department}
                    onChange={(e) => setBudgetForm({ ...budgetForm, department: e.target.value })}
                    className="w-full border p-2 rounded"
                  />
                  <input
                    type="number"
                    placeholder="Total Allocated Budget (PHP)"
                    value={budgetForm.allocated}
                    onChange={(e) => setBudgetForm({ ...budgetForm, allocated: e.target.value })}
                    className="w-full border p-2 rounded font-['IBM_Plex_Mono']"
                  />
                  <button
                    onClick={() => {
                      if (!budgetForm.department || !budgetForm.allocated) return;
                      submitForApproval("ADD_BUDGET", "Budget Management", {
                        id: `BGT-${Math.floor(10 + Math.random() * 90)}`,
                        department: budgetForm.department,
                        allocated: Number(budgetForm.allocated),
                        spent: 0,
                      });
                      setBudgetForm({ department: "", allocated: "" });
                    }}
                    className="w-full bg-[#1A1D21] hover:bg-[#2A2E34] text-white p-2.5 rounded font-bold font-['IBM_Plex_Mono'] transition-colors cursor-pointer"
                  >
                    {currentUser.role === "superadmin" ? "Commit Allocation Directly" : "Submit Allocation Request"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==============================================================================
              MODULE: CASH MANAGEMENT & TREASURY
             ============================================================================== */}
          {activeTab === "cash" && (
            <CashManagement
              currentUser={currentUser}
              isDataMasked={isDataMasked}
              maskCurrency={maskCurrency}
              maskField={maskField}
            />
          )}

          {/* ==============================================================================
              MODULE: FINANCIAL REPORTING & FP&A SUITE (MERGED)
             ============================================================================== */}
          {activeTab === "reports" && (
            <FinancialReporting
              currentUser={currentUser}
              isDataMasked={isDataMasked}
              maskCurrency={maskCurrency}
              maskField={maskField}
            />
          )}

          {/* ==============================================================================
              MODULE: TAX MANAGEMENT (BIR STATUTORY COMPLIANCE & PHILIPPINES TAX)
             ============================================================================== */}
          {activeTab === "tax" && (
            <TaxManagement
              currentUser={currentUser}
              isDataMasked={isDataMasked}
              maskCurrency={maskCurrency}
              maskField={maskField}
            />
          )}

          {/* ==============================================================================
              MODULE: APPROVALS QUEUE (TWO-TIER ADMIN -> SUPER ADMIN REVIEW)
             ============================================================================== */}
          {activeTab === "approvals" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-[#DFE1DB] pb-4">
                <div>
                  <h2 className="text-2xl font-bold font-['Archivo']">Governance &amp; Approval Requests Queue</h2>
                  <p className="text-xs text-[#5C636F]">
                    {currentUser.role === "superadmin"
                      ? "Review, inspect payload diffs, and approve actions across all connected modules"
                      : "Track your pending submissions awaiting Super Admin authorization"}
                  </p>
                </div>
              </div>

              {pendingApprovals.length === 0 ? (
                <div className="bg-white border border-[#DFE1DB] rounded-xl p-8 text-center text-sm font-['IBM_Plex_Mono'] text-[#5C636F] shadow-xs">
                  No pending CRUD requests requiring Super Admin approval. All subsystems synchronized.
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingApprovals.map((req) => (
                    <div
                      key={req.id}
                      className="bg-white border border-[#DFE1DB] p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center space-x-2">
                          <span className="bg-[#FF6A3D]/10 text-[#FF6A3D] font-['IBM_Plex_Mono'] font-bold text-xs px-2 py-0.5 rounded border border-[#FF6A3D]/30">
                            {req.id}
                          </span>
                          <span className="font-bold text-sm text-[#1A1D21]">{req.actionType}</span>
                          <span className="text-xs text-[#5C636F]">({req.module})</span>
                        </div>
                        <p className="text-xs text-[#1A1D21] font-['IBM_Plex_Sans']">
                          <strong>Cross-Module Impact:</strong> {req.impactSummary}
                        </p>
                        <p className="text-[11px] font-['IBM_Plex_Mono'] text-[#5C636F]">
                          Submitted by {req.requestedBy} at {req.timestamp}
                        </p>
                      </div>

                      {currentUser.role === "superadmin" ? (
                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            onClick={() => handleApproveRequest(req)}
                            className="bg-[#157A4D] hover:bg-[#12633e] text-white px-3.5 py-2 rounded-lg text-xs font-bold font-['IBM_Plex_Mono'] flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Approve &amp; Commit All Modules</span>
                          </button>
                          <button
                            onClick={() => handleRejectRequest(req.id)}
                            className="bg-[#B5281A] hover:bg-[#932014] text-white px-3.5 py-2 rounded-lg text-xs font-bold font-['IBM_Plex_Mono'] flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-['IBM_Plex_Mono'] text-[#8A5A00] font-bold bg-[#8A5A00]/10 px-3 py-1.5 rounded-lg border border-[#8A5A00]/30 shrink-0">
                          Awaiting Super Admin Review
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==============================================================================
              MODULE: AUDIT TRAIL (IMMUTABLE LOGGING & PREVIOUS/NEW STATE INSPECTION)
             ============================================================================== */}
          {activeTab === "audit" && (
            <AuditTrail
              auditLogs={auditLogs}
              currentUser={currentUser}
              isDataMasked={isDataMasked}
              maskField={maskField}
            />
          )}

          {/* ==============================================================================
              MODULE: USER MANAGEMENT & SECURITY GOVERNANCE (SUPER ADMIN EXCLUSIVE)
             ============================================================================== */}
          {activeTab === "users" && currentUser.role === "superadmin" && (
            <UserManagement
              users={systemUsers}
              currentUser={currentUser}
              onAddUser={handleAddUser}
              onToggleUserStatus={handleToggleUserStatus}
              onResetUserOtp={handleResetUserOtp}
              onDeleteUser={handleDeleteUser}
              unmaskPassword={unmaskPassword}
              onUpdateUnmaskPassword={handleUpdateUnmaskPassword}
              isDataMasked={isDataMasked}
              maskField={maskField}
            />
          )}
        </main>
      </div>

      {/* UNMASK DATA PASSWORD MODAL */}
      {isPassModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 space-y-4 max-w-sm w-full border border-[#DFE1DB] shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#DFE1DB] pb-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-[#B53A1E]" />
                <h3 className="font-bold text-base font-['Archivo']">Unmask Authorization</h3>
              </div>
              <button
                onClick={() => setIsPassModalOpen(false)}
                className="text-[#5C636F] hover:text-[#1A1D21] cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-[#5C636F]">
              Enter the Super Admin configured <strong>Unmask Authorization Password</strong> to reveal sensitive financial numbers, bank accounts, and PII:
            </p>
            <input
              type="password"
              placeholder="Enter unmask password"
              value={adminPasswordInput}
              onChange={(e) => setAdminPasswordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") verifyAdminPassword();
              }}
              className="w-full border rounded p-2 text-sm font-['IBM_Plex_Mono'] focus:outline-none focus:border-[#1A1D21]"
            />
            <div className="flex justify-end space-x-2 text-xs font-['IBM_Plex_Mono']">
              <button
                onClick={() => setIsPassModalOpen(false)}
                className="px-3 py-1.5 border rounded hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={verifyAdminPassword}
                className="px-3 py-1.5 bg-[#1A1D21] text-white rounded font-bold hover:bg-[#2A2E34] cursor-pointer"
              >
                Unmask Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
