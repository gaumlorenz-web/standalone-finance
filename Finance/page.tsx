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
import DashboardFinancialCharts from "./components/DashboardFinancialCharts";
import DisbursementManagement, { DisbursementReceipt } from "./components/DisbursementManagement";
import { INITIAL_LEDGER_POSTS } from "./data/hospitalityData";
import loginHeroImage from "../src/assets/images/login_hero_image_1787844999408.jpg";

export interface IntegratedFinancialSystemProps {
  onSwitchSubsystem?: (subsystem: string) => void;
  targetTab?: string;
}

export default function IntegratedFinancialSystem({
  onSwitchSubsystem,
  targetTab,
}: IntegratedFinancialSystemProps = {}) {
  // ==========================================
  // AUTHORIZED ACCOUNTS & USER CREDENTIALS (ENTERPRISE MULTI-USER CONFIGURATION)
  // ==========================================
  const INITIAL_ACCOUNTS: SystemUser[] = [
    {
      id: "USR-001",
      name: "Lorenz Gaum",
      email: "Lorenz@horeca.com",
      googleAccount: "gaumlorenz@gmail.com",
      password: "230117482",
      role: "superadmin",
      status: "active",
      createdAt: "2026-08-19",
      otpVerified: true,
      isMainSuperAdmin: true
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
    },
    {
      id: "USR-003",
      name: "Janine Hular (HR Director)",
      email: "Janine@horeca.net",
      googleAccount: "janine.hular@horeca.net",
      password: "#Hular2026",
      role: "admin",
      status: "active",
      createdAt: "2026-08-20",
      otpVerified: true
    },
    {
      id: "USR-004",
      name: "Sheila Suede (Hotel Operations)",
      email: "Sheila@horeca.net",
      googleAccount: "sheila.suede@horeca.net",
      password: "#Suede2026",
      role: "admin",
      status: "active",
      createdAt: "2026-08-20",
      otpVerified: true
    },
    {
      id: "USR-005",
      name: "Charles Tiu (F&B Resto GM)",
      email: "Charles@horeca.net",
      googleAccount: "charles.tiu@horeca.net",
      password: "#Tiu2026",
      role: "admin",
      status: "active",
      createdAt: "2026-08-21",
      otpVerified: true
    },
    {
      id: "USR-006",
      name: "Jordan Tiu (Supply Chain Controller)",
      email: "Jordan@horeca.net",
      googleAccount: "jordan.tiu@horeca.net",
      password: "#Tiu2027",
      role: "admin",
      status: "active",
      createdAt: "2026-08-21",
      otpVerified: true
    },
    {
      id: "USR-007",
      name: "Lourence Piedad (FleetOps Logistics)",
      email: "Lourence@horeca.net",
      googleAccount: "lourence.piedad@horeca.net",
      password: "#Piedad2026",
      role: "admin",
      status: "active",
      createdAt: "2026-08-22",
      otpVerified: true
    },
    {
      id: "USR-008",
      name: "Aira Alcantara (Senior Night Auditor)",
      email: "Aira@horeca.net",
      googleAccount: "aira.alcantara@horeca.net",
      password: "#Audit2026",
      role: "admin",
      status: "active",
      createdAt: "2026-08-23",
      otpVerified: true
    }
  ];

  const [systemUsers, setSystemUsers] = useState<SystemUser[]>(() => {
    try {
      const stored = localStorage.getItem("horeca_system_users");
      if (stored) {
        let parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Guarantee Lorenz Gaum is configured as Main Super Admin
          parsed = parsed.map((u: any) => {
            if (u.email?.toLowerCase() === "lorenz@horeca.com") {
              return {
                ...u,
                name: "Lorenz Gaum",
                role: "superadmin",
                isMainSuperAdmin: true,
              };
            }
            return u;
          });

          // Merge initial accounts with stored accounts so new defaults are available
          const existingEmails = new Set(parsed.map((u: any) => u.email.toLowerCase()));
          const missing = INITIAL_ACCOUNTS.filter((acc) => !existingEmails.has(acc.email.toLowerCase()));
          const merged = missing.length > 0 ? [...parsed, ...missing] : parsed;
          localStorage.setItem("horeca_system_users", JSON.stringify(merged));
          return merged;
        }
      }
    } catch (e) {
      console.error("Failed to load users from localStorage", e);
    }
    return INITIAL_ACCOUNTS;
  });

  const [currentUser, setCurrentUser] = useState<SystemUser | null>(() => {
    try {
      // Purge legacy shared localStorage keys so different browser tabs are fully independent
      localStorage.removeItem("horeca_current_user");
      localStorage.removeItem("horeca_last_activity");

      const savedUser = sessionStorage.getItem("horeca_current_user");
      const lastActivity = sessionStorage.getItem("horeca_last_activity");
      if (savedUser) {
        // If lastActivity exists, check if expired (15 mins = 900,000 ms)
        if (lastActivity && Date.now() - Number(lastActivity) > 15 * 60 * 1000) {
          sessionStorage.removeItem("horeca_current_user");
          sessionStorage.removeItem("horeca_last_activity");
          return null;
        }
        const userObj = JSON.parse(savedUser);
        if (userObj.email?.toLowerCase() === "lorenz@horeca.com") {
          userObj.name = "Lorenz Gaum";
          userObj.role = "superadmin";
          userObj.isMainSuperAdmin = true;
          sessionStorage.setItem("horeca_current_user", JSON.stringify(userObj));
        }
        return userObj;
      }
    } catch (e) {
      console.error("Failed to restore session from sessionStorage", e);
    }
    return null;
  });

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
  const [sessionSecondsLeft, setSessionSecondsLeft] = useState<number>(() => {
    try {
      const lastActivity = sessionStorage.getItem("horeca_last_activity");
      if (lastActivity) {
        const elapsedSecs = Math.floor((Date.now() - Number(lastActivity)) / 1000);
        if (elapsedSecs < 900) {
          return 900 - elapsedSecs;
        }
      }
    } catch (e) {}
    return 900;
  });

  // Super Admin Configured Unmask Data Password (Default: #S230117482)
  const [unmaskPassword, setUnmaskPassword] = useState<string>("#S230117482");

  // Sidebar Layout State (Supports Full Width or Icon-Only Collapsed Mode)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("horeca_sidebar_collapsed") === "true";
    } catch (e) {
      return false;
    }
  });

  // Two-Tier Governance Approvals Filter & Verification Modal State
  const [approvalFilter, setApprovalFilter] = useState<"ALL" | "STAGE_1_ADMIN" | "STAGE_2_SUPERADMIN" | "COMPLETED">("ALL");
  const [adminVerifyModal, setAdminVerifyModal] = useState<{ isOpen: boolean; req: any | null; notes: string }>({
    isOpen: false,
    req: null,
    notes: ""
  });

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "info" | "warning" } | null>(null);

  const showToast = (text: string, type: "success" | "info" | "warning" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // LocalStorage / SessionStorage Persistence Hooks
  useEffect(() => {
    try {
      localStorage.setItem("horeca_system_users", JSON.stringify(systemUsers));
    } catch (e) {}
  }, [systemUsers]);

  // Tab-isolated session: Each browser tab retains its own active user and session timer
  useEffect(() => {
    try {
      if (currentUser) {
        sessionStorage.setItem("horeca_current_user", JSON.stringify(currentUser));
        sessionStorage.setItem("horeca_last_activity", Date.now().toString());
      } else {
        sessionStorage.removeItem("horeca_current_user");
        sessionStorage.removeItem("horeca_last_activity");
      }
    } catch (e) {}
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem("horeca_sidebar_collapsed", isSidebarCollapsed ? "true" : "false");
    } catch (e) {}
  }, [isSidebarCollapsed]);

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
      try {
        sessionStorage.setItem("horeca_last_activity", Date.now().toString());
      } catch (e) {}
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
  // AUDIT TRAIL LOGGING CORE (PERSISTED + UNSEEN BADGE)
  // ==========================================
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const stored = localStorage.getItem("horeca_audit_logs");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to load audit logs from localStorage", e);
    }
    return [
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
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem("horeca_audit_logs", JSON.stringify(auditLogs));
    } catch (e) {}
  }, [auditLogs]);

  // Requirement 4: Track viewed audit trails so number disappears on view and reappears on new action
  const [lastSeenAuditCount, setLastSeenAuditCount] = useState<number>(() => {
    try {
      const stored = localStorage.getItem("horeca_last_seen_audit_count");
      if (stored !== null) return Number(stored);
    } catch (e) {}
    return 3;
  });

  const unseenAuditCount = Math.max(0, auditLogs.length - lastSeenAuditCount);

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
    const savedTab = sessionStorage.getItem("horeca_active_tab");
    if (savedTab && (savedTab !== "users" || user.role === "superadmin")) {
      setActiveTab(savedTab);
    } else {
      setActiveTab("overview");
    }
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
    if (!target) return;

    const isCurrentMainSuperAdmin = currentUser?.email?.toLowerCase() === "lorenz@horeca.com";

    // Protection: Main Super Admin Lorenz Gaum account cannot be deleted
    if (target.email?.toLowerCase() === "lorenz@horeca.com") {
      showToast("The Main Super Admin (Lorenz Gaum) account cannot be deleted.", "warning");
      return;
    }

    // Only Main Super Admin Lorenz Gaum can delete other Super Administrator accounts
    if (target.role === "superadmin" && !isCurrentMainSuperAdmin) {
      showToast("Permission Denied: Only Main Super Admin Lorenz Gaum can delete Super Administrator accounts.", "warning");
      return;
    }

    setSystemUsers((prev) => prev.filter((u) => u.id !== userId));
    showToast(`User account ${target.name} (${target.role}) deleted successfully`, "warning");
    logAuditEvent({
      action: "DELETE_USER_ACCOUNT",
      module: "Security & User Management",
      description: `${isCurrentMainSuperAdmin ? "Main Super Admin Lorenz Gaum" : "Super Admin"} deleted user account ${target.email} (${target.role})`,
      previousState: target,
      newState: null
    });
  };

  const handleEditUser = (updatedUser: SystemUser) => {
    const isCurrentMainSuperAdmin = currentUser?.email?.toLowerCase() === "lorenz@horeca.com";
    const target = systemUsers.find((u) => u.id === updatedUser.id);
    if (!target) return;

    // Protection: Only Lorenz Gaum himself can edit his account
    if (target.email?.toLowerCase() === "lorenz@horeca.com" && !isCurrentMainSuperAdmin) {
      showToast("Permission Denied: Only Lorenz Gaum himself can edit the Main Super Admin account.", "warning");
      return;
    }

    // Protection: Non-main superadmins cannot edit other superadmins
    if (target.role === "superadmin" && !isCurrentMainSuperAdmin && target.id !== currentUser?.id) {
      showToast("Permission Denied: Only Main Super Admin Lorenz Gaum can edit other Super Administrator accounts.", "warning");
      return;
    }

    setSystemUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u))
    );
    showToast(`User account ${updatedUser.name} updated successfully!`, "success");
    logAuditEvent({
      action: "EDIT_USER_ACCOUNT",
      module: "Security & User Management",
      description: `${isCurrentMainSuperAdmin ? "Main Super Admin Lorenz Gaum" : "Super Admin"} updated credentials for ${updatedUser.email} (Role: ${updatedUser.role})`,
      previousState: target,
      newState: updatedUser
    });
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
  const [activeTab, setActiveTab] = useState<string>(() => {
    try {
      const savedTab = sessionStorage.getItem("horeca_active_tab");
      if (savedTab) return savedTab;
    } catch (e) {}
    return "overview";
  });

  useEffect(() => {
    try {
      if (activeTab) {
        sessionStorage.setItem("horeca_active_tab", activeTab);
      }
    } catch (e) {}
  }, [activeTab]);

  useEffect(() => {
    if (targetTab) {
      setActiveTab(targetTab);
    }
  }, [targetTab]);

  useEffect(() => {
    const handleFmsSync = (e: any) => {
      try {
        const gl = localStorage.getItem("horeca_journal_entries");
        if (gl) setJournalEntries(JSON.parse(gl));
        const ap = localStorage.getItem("horeca_ap_invoices");
        if (ap) setApInvoices(JSON.parse(ap));
        const ar = localStorage.getItem("horeca_ar_invoices");
        if (ar) setArInvoices(JSON.parse(ar));
        const cash = localStorage.getItem("horeca_cash_pool");
        if (cash) setCashPool(JSON.parse(cash));
        const apps = localStorage.getItem("horeca_pending_approvals");
        if (apps) setPendingApprovals(JSON.parse(apps));
        const tax = localStorage.getItem("horeca_tax_records");
        if (tax) setTaxRecords(JSON.parse(tax));
        const aud = localStorage.getItem("horeca_audit_logs");
        if (aud) setAuditLogs(JSON.parse(aud));

        const packet = e?.detail;
        if (packet) {
          showToast(`FMS Interop Sync: [${packet.action}] from ${packet.sourceModule}`, "info");
        }
      } catch (err) {
        console.error("Error refreshing FMS state on interop sync", err);
      }
    };

    window.addEventListener("fms-sync-event", handleFmsSync);
    return () => window.removeEventListener("fms-sync-event", handleFmsSync);
  }, []);
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
  const [journalEntries, setJournalEntries] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("horeca_journal_entries");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_LEDGER_POSTS;
  });

  // 2. AP & AR Invoices State
  const [apInvoices, setApInvoices] = useState<SupplierInvoice[]>(() => {
    try {
      const saved = localStorage.getItem("horeca_ap_invoices");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_AP_INVOICES;
  });

  const [arInvoices, setArInvoices] = useState<CustomerInvoice[]>(() => {
    try {
      const saved = localStorage.getItem("horeca_ar_invoices");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_AR_INVOICES;
  });

  const [collections, setCollections] = useState<CollectionItem[]>(() => {
    try {
      const saved = localStorage.getItem("horeca_collections_items");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_COLLECTIONS;
  });

  const [apArInvoices, setApArInvoices] = useState(() => {
    try {
      const saved = localStorage.getItem("horeca_apar_invoices");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 'INV-8821', entityName: 'HighSeas Meat & Seafood Corp', tin: '123-456-789-000', type: 'AP', bankDetails: '9876-5432-1098', amount: 109760.00, status: 'Approved', category: 'F&B Provisions' },
      { id: 'INV-9902', entityName: 'Global Luxury Tours & Corporate Travel', tin: '987-654-321-000', type: 'AR', bankDetails: '4567-8901-2345', amount: 85000.00, status: 'Approved', category: 'Corporate City Ledger' },
      { id: 'INV-9903', entityName: 'Meralco Commercial Power Grid', tin: '111-222-333-000', type: 'AP', bankDetails: '1122-3344-5566', amount: 65000.00, status: 'Pending', category: 'Utilities' },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem("horeca_journal_entries", JSON.stringify(journalEntries));
    } catch (e) {}
  }, [journalEntries]);

  useEffect(() => {
    try {
      localStorage.setItem("horeca_ap_invoices", JSON.stringify(apInvoices));
    } catch (e) {}
  }, [apInvoices]);

  useEffect(() => {
    try {
      localStorage.setItem("horeca_ar_invoices", JSON.stringify(arInvoices));
    } catch (e) {}
  }, [arInvoices]);

  useEffect(() => {
    try {
      localStorage.setItem("horeca_collections_items", JSON.stringify(collections));
    } catch (e) {}
  }, [collections]);

  useEffect(() => {
    try {
      localStorage.setItem("horeca_apar_invoices", JSON.stringify(apArInvoices));
    } catch (e) {}
  }, [apArInvoices]);

  // Track viewed audit trails so number disappears on view and reappears on new action
  useEffect(() => {
    if (activeTab === "audit") {
      setLastSeenAuditCount(auditLogs.length);
      try {
        localStorage.setItem("horeca_last_seen_audit_count", auditLogs.length.toString());
      } catch (e) {}
    }
  }, [activeTab, auditLogs.length]);
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
  const [collectionData, setCollectionData] = useState(() => {
    try {
      const saved = localStorage.getItem("horeca_collection_data");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 'COL-101', payerName: 'Robert Smith (Room 402 Checkout)', phone: '+639170192834', email: 'robert.smith@example.com', cardNo: '4532-8819-2011-8821', checkNo: 'CHK-90211', amount: 35000.00, targetAccount: 'Front Desk Cash Float' },
      { id: 'COL-102', payerName: 'Sarah Jenkins (Banquet Hall Deposit)', phone: '+639170148821', email: 's.jenkins@example.com', cardNo: '5412-9902-1100-1102', checkNo: 'EFT-88392', amount: 85000.00, targetAccount: 'Operating Bank Account' },
    ];
  });
  const [collectionForm, setCollectionForm] = useState({ payerName: "", phone: "", email: "", cardNo: "", checkNo: "", amount: "", targetAccount: "Operating Bank Account" });

  // 4. Disbursement State
  const [disbursementData, setDisbursementData] = useState(() => {
    try {
      const saved = localStorage.getItem("horeca_disbursements");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 'DISB-501', payee: 'Michael Brown (Executive Salary)', swift: 'BOFAPHMMXXX', nationalId: '112-482-990-110', netPay: 154000.00, token: 'AUTH-99201-X8', department: 'Executive Management' },
      { id: 'DISB-502', payee: 'Pacific Linens & Laundry Logistics', swift: 'CHASPHM2XXX', nationalId: '441-209-912-000', netPay: 34100.00, token: 'AUTH-10293-Z2', department: 'Housekeeping' },
    ];
  });
  const [disbursementForm, setDisbursementForm] = useState({ payee: "", swift: "", nationalId: "", netPay: "", department: "General Operations" });

  // 5. Budget Management State
  const [budgets, setBudgets] = useState(() => {
    try {
      const saved = localStorage.getItem("horeca_budgets");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: "BGT-01", department: "Kitchen & F&B Operations", allocated: 650000, spent: 395000 },
      { id: "BGT-02", department: "Front Office & Hotel Operations", allocated: 450000, spent: 220000 },
      { id: "BGT-03", department: "Housekeeping & Facility Maintenance", allocated: 300000, spent: 175000 },
      { id: "BGT-04", department: "Executive & Administrative Core", allocated: 500000, spent: 340000 },
    ];
  });
  const [budgetForm, setBudgetForm] = useState({ department: "", allocated: "" });

  // 6. Cash Management & Liquidity Pool
  const [cashPool, setCashPool] = useState(() => {
    try {
      const saved = localStorage.getItem("horeca_cash_pool");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { bankOperating: 2450000, pettyCash: 185000 };
  });

  // 7. Tax Management State
  const [taxRecords, setTaxRecords] = useState(() => {
    try {
      const saved = localStorage.getItem("horeca_tax_records");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: "TAX-2026-Q2", type: "Value Added Tax (VAT 12%)", taxableAmount: 1450000, taxDue: 174000, status: "Pending" },
      { id: "TAX-2026-WHT", type: "Expanded Withholding Tax (2% Goods)", taxableAmount: 580000, taxDue: 11600, status: "Remitted" },
      { id: "TAX-2026-COMP", type: "Compensation Withholding Tax (15-20%)", taxableAmount: 225000, taxDue: 33750, status: "Remitted" },
    ];
  });
  const [taxForm, setTaxForm] = useState({ type: "Value Added Tax (VAT 12%)", rate: 0.12, taxableAmount: "" });

  // 8. Pending Approvals Queue (Persisted 2-Tier Governance: Subsystem -> Admin -> Super Admin)
  const [pendingApprovals, setPendingApprovals] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("horeca_pending_approvals");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: "REQ-201",
        actionType: "APPROVE_PAYROLL_DISBURSEMENT_BATCH",
        requestedBy: "Janine Hular (HR-Payroll Director)",
        timestamp: "2026-09-29 08:30",
        module: "HR-Payroll",
        title: "Semi-Monthly Staff Payroll Batch [PAY-2026-Q3-01]",
        amount: 130480,
        status: "PENDING_ADMIN",
        currentStage: "STAGE_1_ADMIN",
        payload: {
          batchId: "PAY-2026-Q3-01",
          staffCount: 5,
          totalGross: 178000,
          totalStatutory: 47520,
          netPayout: 130480
        },
        impactSummary: "Gross ₱178,000 less Statutory Deductions (₱47,520). Net Payout ₱130,480 to be disbursed from Operating Treasury."
      },
      {
        id: "REQ-202",
        actionType: "APPROVE_PURVEYOR_INVOICE",
        requestedBy: "Jordan Tiu (Supply Chain Controller)",
        timestamp: "2026-09-29 08:15",
        module: "Supply-Chain",
        title: "Purveyor AP Invoice [INV-SC-8492]: San Miguel Foods Corp",
        amount: 148500,
        status: "PENDING_SUPERADMIN",
        currentStage: "STAGE_2_SUPERADMIN",
        adminVerifiedBy: "Renz (Standard Admin)",
        adminVerifiedAt: "2026-09-29 08:25",
        adminNotes: "PO, Delivery Receipt, and 1% EWT BIR computation verified. Net 30 days payable endorsed for executive sign-off.",
        payload: {
          id: "INV-SC-8492",
          vendor: "San Miguel Foods Corp",
          tin: "000-128-492-000",
          amount: 150000,
          ewtAmount: 1500,
          netPayable: 148500,
          category: "Fresh Meats & Poultry Inventory"
        },
        impactSummary: "Increases Trade AP by ₱148,500 and records 1% Creditable Withholding Tax (₱1,500) with inventory asset debit."
      },
      {
        id: "REQ-203",
        actionType: "APPROVE_GUEST_REFUND_CLAIM",
        requestedBy: "Sheila Suede (Hotel Front Office Director)",
        timestamp: "2026-09-29 08:45",
        module: "Hotel-MNGT",
        title: "Guest Security Deposit Refund [REF-2026-44]: Room 402",
        amount: 12500,
        status: "PENDING_ADMIN",
        currentStage: "STAGE_1_ADMIN",
        payload: {
          claimId: "REF-2026-44",
          roomNumber: "Suite 402",
          guestName: "Mr. Harrison Chen",
          amount: 12500,
          paymentRail: "Cash Float Payout",
          reason: "Security deposit release upon clean inspection check-out."
        },
        impactSummary: "Requires Admin verification before Super Admin authorizes ₱12,500 cash float release and guest ledger reconciliation."
      },
      {
        id: "REQ-204",
        actionType: "APPROVE_VEHICLE_MAINTENANCE_DISBURSEMENT",
        requestedBy: "Lourence Piedad (Fleet Logistics Lead)",
        timestamp: "2026-09-29 08:50",
        module: "FleetOps",
        title: "Coaster Shuttle Brake & Suspension Overhaul [WO-FLT-904]",
        amount: 38400,
        status: "PENDING_ADMIN",
        currentStage: "STAGE_1_ADMIN",
        payload: {
          workOrderId: "WO-FLT-904",
          vehiclePlate: "NAA-4920 (VIP Guest Coaster)",
          serviceCenter: "Toyota Commercial Truck Care Center",
          workDescription: "Complete brake pad replacement & front suspension overhaul",
          amount: 38400,
          costCenter: "5205 - Hotel Shuttle Transport"
        },
        impactSummary: "Maintenance work order estimate verified with CASA. Deducts Operating Bank ₱38,400 to Fleet Cost Center 5205."
      },
      {
        id: "REQ-205",
        actionType: "RESTRICT_PURCHASE_REQUISITIONS",
        requestedBy: "Charles Tiu (F&B Operations GM)",
        timestamp: "2026-09-29 08:55",
        module: "Resto-MNGT",
        title: "Food Cost Threshold Breach Variance Audit Lock (37.8% vs 32.0%)",
        amount: 86400,
        status: "PENDING_ADMIN",
        currentStage: "STAGE_1_ADMIN",
        payload: {
          currentFoodCostPct: 37.8,
          targetFoodCostPct: 32.0,
          actualCostOfIngredients: 86400,
          status: "LOCKED_FOR_VARIANCE_AUDIT"
        },
        impactSummary: "Resto food cost exceeded threshold (+5.8%). Requires Admin review and Super Admin lock on all fresh produce PO requisitions."
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem("horeca_collection_data", JSON.stringify(collectionData));
    } catch (e) {}
  }, [collectionData]);

  useEffect(() => {
    try {
      localStorage.setItem("horeca_disbursements", JSON.stringify(disbursementData));
    } catch (e) {}
  }, [disbursementData]);

  useEffect(() => {
    try {
      localStorage.setItem("horeca_budgets", JSON.stringify(budgets));
    } catch (e) {}
  }, [budgets]);

  useEffect(() => {
    try {
      localStorage.setItem("horeca_cash_pool", JSON.stringify(cashPool));
    } catch (e) {}
  }, [cashPool]);

  useEffect(() => {
    try {
      localStorage.setItem("horeca_tax_records", JSON.stringify(taxRecords));
    } catch (e) {}
  }, [taxRecords]);

  useEffect(() => {
    try {
      localStorage.setItem("horeca_pending_approvals", JSON.stringify(pendingApprovals));
    } catch (e) {}
  }, [pendingApprovals]);

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

    if (actionType === "CREATE_AR_INVOICE") {
      setArInvoices((prev) => [{ ...payload, status: "Unpaid" as const }, ...prev]);
      setApArInvoices((prev) => [
        {
          id: payload.id,
          entityName: payload.customer,
          tin: payload.tin || "123-456-789-000",
          type: "AR",
          bankDetails: payload.refNo || "Corporate City Ledger",
          amount: Number(payload.amount),
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
          sourceModule: "Hotel PMS",
          accountCode: "1210",
          accountName: "1210 - City Ledger & Corporate Accounts Receivable",
          memo: `Client Invoice: ${payload.customer} (${payload.category})`,
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
          sourceModule: "Hotel PMS",
          accountCode: "4010",
          accountName: "4010 - Hotel Room Revenue - Deluxe & Suites",
          memo: `Corporate Booking Revenue: ${payload.customer}`,
          debit: 0,
          credit: Number(payload.amount),
          status: "COMMITTED",
          postedBy: req.requestedBy,
          approvedBy: "Super Administrator"
        }
      ];

      setJournalEntries((prev) => [...glLines, ...prev]);
      showToast(`Cross-Module Sync: AR Customer Invoice ${payload.id} approved and balanced in General Ledger!`, "success");

      logAuditEvent({
        action: "CREATE_AR_INVOICE",
        module: "Accounts Receivable",
        description: `Approved customer invoice ${payload.id} for ${payload.customer} (₱${Number(payload.amount).toLocaleString()})`,
        newState: { invoice: payload, glLines }
      });
    }

    if (actionType === "APPROVE_PAYROLL_DISBURSEMENT_BATCH") {
      const netAmount = Number(payload.netPayout || req.amount || 0);
      const grossAmount = Number(payload.totalGross || netAmount);
      const batchRef = payload.batchId || req.id;

      // 1. Decrement Bank Operating Balance
      setCashPool((prev) => ({
        ...prev,
        bankOperating: Math.max(0, prev.bankOperating - netAmount)
      }));

      // 2. Add to Disbursements
      const newDisb: any = {
        id: `DISB-${batchRef}`,
        payee: "HORECA Consolidated Payroll Pool (5 Subsystems)",
        swift: "BDO-PESONET",
        nationalId: "****PAYROLL",
        netPay: netAmount,
        token: `TKN-${Date.now().toString().slice(-6)}`,
        department: "Human Resources & Payroll",
        voucherNo: `VCH-${batchRef}`,
        purpose: `Semi-Monthly Net Payroll Payout for ${payload.staffCount || 5} Employees`,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
        status: "APPROVED_AND_DISBURSED"
      };
      setDisbursementData((prev) => [newDisb, ...prev]);

      // 3. Post Balanced General Ledger Journal Entry
      const glLines = [
        {
          id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toISOString().split("T")[0],
          ref: batchRef,
          sourceModule: "HR-Payroll",
          accountCode: "5110",
          accountName: "5110 - Executive, Front Desk & Kitchen Salaries Expense",
          memo: `Payroll Gross Accrual: ${batchRef}`,
          debit: grossAmount,
          credit: 0,
          status: "COMMITTED",
          postedBy: req.requestedBy,
          approvedBy: "Super Administrator"
        },
        {
          id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toISOString().split("T")[0],
          ref: batchRef,
          sourceModule: "HR-Payroll",
          accountCode: "1030",
          accountName: "1030 - Operating Bank Account - Primary (BDO)",
          memo: `Net Payroll Bank EFT Outflow: ${batchRef}`,
          debit: 0,
          credit: netAmount,
          status: "COMMITTED",
          postedBy: req.requestedBy,
          approvedBy: "Super Administrator"
        }
      ];
      if (grossAmount > netAmount) {
        glLines.push({
          id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toISOString().split("T")[0],
          ref: batchRef,
          sourceModule: "HR-Payroll",
          accountCode: "2030",
          accountName: "2030 - Statutory Premiums & Withholding Taxes Payable",
          memo: `Statutory Deductions Withheld (SSS/PhilHealth/HDMF/WHT)`,
          debit: 0,
          credit: grossAmount - netAmount,
          status: "COMMITTED",
          postedBy: req.requestedBy,
          approvedBy: "Super Administrator"
        });
      }

      setJournalEntries((prev) => [...glLines, ...prev]);
      showToast(`Cross-Module Sync: Payroll Batch ${batchRef} (₱${netAmount.toLocaleString()}) disbursed from Treasury and balanced in GL!`, "success");

      logAuditEvent({
        action: "APPROVE_PAYROLL_BATCH",
        module: "HR-Payroll Interop",
        description: `Super Admin authorized and disbursed payroll batch ${batchRef} (Net: ₱${netAmount.toLocaleString()})`,
        newState: { batch: payload, glLines, netAmount }
      });
    }

    if (actionType === "RELEASE_SERVICE_CHARGE_PAYOUT") {
      const amount = Number(payload.distributedPool || req.amount || 0);
      setCashPool((prev) => ({ ...prev, bankOperating: Math.max(0, prev.bankOperating - amount) }));
      const glLines = [
        {
          id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toISOString().split("T")[0],
          ref: payload.ref || req.id,
          sourceModule: "HR-Payroll",
          accountCode: "2150",
          accountName: "2150 - Accrued Service Charge Liability (RA 11360)",
          memo: `Statutory 85% Service Charge Distribution Payout`,
          debit: amount,
          credit: 0,
          status: "COMMITTED",
          postedBy: req.requestedBy,
          approvedBy: "Super Administrator"
        },
        {
          id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toISOString().split("T")[0],
          ref: payload.ref || req.id,
          sourceModule: "Treasury",
          accountCode: "1030",
          accountName: "1030 - Operating Bank Account - Primary",
          memo: `Bank Direct EFT: 85% Service Charge Pool to Employees`,
          debit: 0,
          credit: amount,
          status: "COMMITTED",
          postedBy: req.requestedBy,
          approvedBy: "Super Administrator"
        }
      ];
      setJournalEntries((prev) => [...glLines, ...prev]);
      showToast(`Cross-Module Sync: 85% Service Charge Pool (₱${amount.toLocaleString()}) disbursed and liability cleared!`, "success");
    }

    if (actionType === "APPROVE_GUEST_REFUND_CLAIM") {
      const amount = Number(payload.amount || req.amount || 0);
      setCashPool((prev) => ({ ...prev, pettyCash: Math.max(0, prev.pettyCash - amount) }));
      const glLines = [
        {
          id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toISOString().split("T")[0],
          ref: payload.claimId || req.id,
          sourceModule: "Hotel-MNGT",
          accountCode: "4010",
          accountName: "4010 - Hotel Room Revenue (Refund Allowance)",
          memo: `Guest Refund Allowance: ${payload.guestName} (${payload.roomNumber})`,
          debit: amount,
          credit: 0,
          status: "COMMITTED",
          postedBy: req.requestedBy,
          approvedBy: "Super Administrator"
        },
        {
          id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toISOString().split("T")[0],
          ref: payload.claimId || req.id,
          sourceModule: "Hotel-MNGT",
          accountCode: "1010",
          accountName: "1010 - Front Desk Cash Float (Active Till)",
          memo: `Cash Float Refund Payout: ${payload.guestName}`,
          debit: 0,
          credit: amount,
          status: "COMMITTED",
          postedBy: req.requestedBy,
          approvedBy: "Super Administrator"
        }
      ];
      setJournalEntries((prev) => [...glLines, ...prev]);
      showToast(`Cross-Module Sync: Guest Refund for ${payload.guestName} (₱${amount.toLocaleString()}) authorized and float reconciled!`, "success");
    }

    if (actionType === "APPROVE_PURVEYOR_INVOICE") {
      const amount = Number(payload.amount || req.amount || 0);
      const ewt = Number(payload.ewtAmount || Math.round(amount * 0.01));
      const netPayable = amount - ewt;
      const invoiceId = payload.id || `INV-SC-${Math.floor(1000 + Math.random() * 9000)}`;

      const newInv: SupplierInvoice = {
        id: invoiceId,
        vendor: payload.vendor || payload.entityName || "Purveyor Vendor",
        tin: payload.tin || "123-456-789-000",
        invoiceDate: payload.invoiceDate || new Date().toISOString().split("T")[0],
        dueDate: payload.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        amount: netPayable,
        status: "Unpaid" as const,
        category: (payload.category as any) || "F&B Fresh Goods",
        terms: "Net 30",
        poRef: payload.poNumber || `PO-2026-${Math.floor(100 + Math.random() * 900)}`,
        drRef: `DR-2026-${Math.floor(100 + Math.random() * 900)}`,
        threeWayMatch: "Verified",
        dailyPenaltyRatePercent: 0.05,
        bankDetails: payload.bankDetails || "BDO Unibank 0019-4829-1029",
      };
      setApInvoices((prev) => [newInv, ...prev]);
      setApArInvoices((prev) => [
        {
          id: invoiceId,
          entityName: newInv.vendor,
          tin: newInv.tin,
          type: "AP",
          bankDetails: newInv.bankDetails,
          amount: newInv.amount,
          status: "Approved",
          category: newInv.category
        },
        ...prev
      ]);

      const glLines = [
        {
          id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toISOString().split("T")[0],
          ref: invoiceId,
          sourceModule: "Supply-Chain",
          accountCode: "1300",
          accountName: "1300 - Inventory Asset (Food & Beverage Stock)",
          memo: `Purveyor Stock Receipt: ${newInv.vendor}`,
          debit: amount,
          credit: 0,
          status: "COMMITTED",
          postedBy: req.requestedBy,
          approvedBy: "Super Administrator"
        },
        {
          id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toISOString().split("T")[0],
          ref: invoiceId,
          sourceModule: "Supply-Chain",
          accountCode: "2010",
          accountName: "2010 - Trade Accounts Payable (Net Purveyor Liability)",
          memo: `Trade AP Accrual: ${newInv.vendor}`,
          debit: 0,
          credit: netPayable,
          status: "COMMITTED",
          postedBy: req.requestedBy,
          approvedBy: "Super Administrator"
        },
        {
          id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toISOString().split("T")[0],
          ref: invoiceId,
          sourceModule: "Supply-Chain",
          accountCode: "2140",
          accountName: "2140 - Expanded Withholding Tax Payable (BIR Form 1601-EQ)",
          memo: `1% Creditable Withholding Tax (ATC WC158)`,
          debit: 0,
          credit: ewt,
          status: "COMMITTED",
          postedBy: req.requestedBy,
          approvedBy: "Super Administrator"
        }
      ];
      setJournalEntries((prev) => [...glLines, ...prev]);
      showToast(`Cross-Module Sync: Purveyor Invoice ${invoiceId} approved into AP Schedule & GL!`, "success");
    }

    if (actionType === "APPROVE_VEHICLE_MAINTENANCE_DISBURSEMENT") {
      const amount = Number(payload.amount || req.amount || 0);
      setCashPool((prev) => ({ ...prev, bankOperating: Math.max(0, prev.bankOperating - amount) }));
      const newDisb: any = {
        id: `WO-DISB-${payload.workOrderId || req.id}`,
        payee: payload.serviceCenter || "CASA Commercial Vehicle Service Center",
        swift: "BDO-PESONET",
        nationalId: "****FLEET",
        netPay: amount,
        token: `TKN-${Date.now().toString().slice(-6)}`,
        department: "Fleet Operations & Logistics",
        voucherNo: `VCH-${payload.workOrderId || req.id}`,
        purpose: `Vehicle Maintenance: ${payload.vehiclePlate} - ${payload.workDescription}`,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
        status: "APPROVED_AND_DISBURSED"
      };
      setDisbursementData((prev) => [newDisb, ...prev]);

      const glLines = [
        {
          id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toISOString().split("T")[0],
          ref: payload.workOrderId || req.id,
          sourceModule: "FleetOps",
          accountCode: "5205",
          accountName: "5205 - Commercial Vehicle Maintenance, Repairs & Spare Parts",
          memo: `Work Order: ${payload.vehiclePlate} (${payload.workDescription})`,
          debit: amount,
          credit: 0,
          status: "COMMITTED",
          postedBy: req.requestedBy,
          approvedBy: "Super Administrator"
        },
        {
          id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toISOString().split("T")[0],
          ref: payload.workOrderId || req.id,
          sourceModule: "Treasury",
          accountCode: "1030",
          accountName: "1030 - Operating Bank Account - Primary",
          memo: `EFT Service Center Payment: ${payload.serviceCenter}`,
          debit: 0,
          credit: amount,
          status: "COMMITTED",
          postedBy: req.requestedBy,
          approvedBy: "Super Administrator"
        }
      ];
      setJournalEntries((prev) => [...glLines, ...prev]);
      showToast(`Cross-Module Sync: Vehicle Work Order for ${payload.vehiclePlate} (₱${amount.toLocaleString()}) authorized & disbursed!`, "success");
    }

    if (actionType === "LIQUIDATE_PALENGKE_PETTY_CASH") {
      const amount = Number(payload.amount || req.amount || 0);
      const glLines = [
        {
          id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toISOString().split("T")[0],
          ref: payload.ref || req.id,
          sourceModule: "Resto-MNGT",
          accountCode: "5010",
          accountName: "5010 - Cost of Goods Sold - Fresh Produce & Meats",
          memo: `Palengke Wet Market Liquidation: ${payload.memo || "Fresh Produce"}`,
          debit: amount,
          credit: 0,
          status: "COMMITTED",
          postedBy: req.requestedBy,
          approvedBy: "Super Administrator"
        },
        {
          id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toISOString().split("T")[0],
          ref: payload.ref || req.id,
          sourceModule: "Resto-MNGT",
          accountCode: "1010",
          accountName: "1010 - Petty Cash & Kitchen Purchasing Float",
          memo: `Replenishment / Liquidation Relief`,
          debit: 0,
          credit: amount,
          status: "COMMITTED",
          postedBy: req.requestedBy,
          approvedBy: "Super Administrator"
        }
      ];
      setJournalEntries((prev) => [...glLines, ...prev]);
      showToast(`Cross-Module Sync: Palengke Liquidation (₱${amount.toLocaleString()}) approved and expensed to COGS!`, "success");
    }

    if (actionType === "RESTRICT_PURCHASE_REQUISITIONS") {
      try {
        localStorage.setItem("horeca_po_freeze_active", "true");
      } catch (e) {}
      showToast(`Governance Enforced: Food Cost purchase requisition freeze approved and locked across Supply Chain!`, "warning");
    }

    if (actionType === "COMMIT_INVENTORY_ADJUSTMENT") {
      const amount = Number(payload.amount || req.amount || 0);
      const glLines = [
        {
          id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toISOString().split("T")[0],
          ref: payload.ref || req.id,
          sourceModule: "Supply-Chain",
          accountCode: "5010",
          accountName: "5010 - Inventory Shrinkage, Spoilage & Count Variance",
          memo: `Inventory Audit Variance Adjustment: ${payload.reason || "Physical Count Reconciliation"}`,
          debit: amount,
          credit: 0,
          status: "COMMITTED",
          postedBy: req.requestedBy,
          approvedBy: "Super Administrator"
        },
        {
          id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toISOString().split("T")[0],
          ref: payload.ref || req.id,
          sourceModule: "Supply-Chain",
          accountCode: "1300",
          accountName: "1300 - Inventory Asset (Food & Beverage Stock)",
          memo: `Inventory Asset Write-Down to Physical Count`,
          debit: 0,
          credit: amount,
          status: "COMMITTED",
          postedBy: req.requestedBy,
          approvedBy: "Super Administrator"
        }
      ];
      setJournalEntries((prev) => [...glLines, ...prev]);
      showToast(`Cross-Module Sync: Inventory Adjustment (₱${amount.toLocaleString()}) committed to General Ledger!`, "success");
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
  // AR BATCH COLLECT ALL HANDLER (CROSS-MODULE SYNC)
  // ==========================================
  const handleBatchCollectAll = (
    param1: any,
    param2?: string,
    param3?: string,
    param4?: string
  ) => {
    let collectedInvoices: CustomerInvoice[] = [];
    let targetAccount = "1030 - Operating Bank Account - BDO Primary";
    let paymentMethod = "Bank Transfer";
    let referenceNumber = `BATCH-COL-${Date.now().toString().slice(-6)}`;
    let totalCollectible = 0;

    if (Array.isArray(param1)) {
      collectedInvoices = param1;
      targetAccount = param2 || targetAccount;
      paymentMethod = param3 || paymentMethod;
      referenceNumber = param4 ? `${param4}-${Date.now().toString().slice(-4)}` : referenceNumber;
      totalCollectible = collectedInvoices.reduce((sum, inv) => {
        const remaining = Math.max(0, inv.amount - (inv.paidAmount || 0));
        // Overdue calculation
        const due = new Date(inv.dueDate);
        const cur = new Date();
        const diffDays = Math.max(0, Math.floor((cur.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)));
        const dailyRate = (inv.dailyPenaltyRatePercent || 0.05) / 100;
        const latePenalty = diffDays > 0 ? Math.round(remaining * dailyRate * diffDays) : 0;
        return sum + remaining + latePenalty;
      }, 0);
    } else if (param1 && typeof param1 === "object") {
      collectedInvoices = param1.collectedInvoices || [];
      totalCollectible = param1.totalCollectible || 0;
      targetAccount = param1.targetAccount || targetAccount;
      paymentMethod = param1.paymentMethod || paymentMethod;
      referenceNumber = param1.referenceNumber || referenceNumber;
    }

    if (!collectedInvoices || collectedInvoices.length === 0 || totalCollectible <= 0) return;

    // 1. Update arInvoices: mark collected as "Collected / Settled" & freeze penalties
    const collectedIds = new Set(collectedInvoices.map((i) => i.id));
    setArInvoices((prev) =>
      prev.map((inv) => {
        if (collectedIds.has(inv.id)) {
          const match = collectedInvoices.find((i) => i.id === inv.id);
          const penalty = (match as any)?.latePenaltyAccumulated || 0;
          const totalSettled = match ? inv.amount + penalty : inv.amount;
          return {
            ...inv,
            paidAmount: totalSettled,
            status: "Collected / Settled" as const,
            dailyPenaltyRatePercent: 0
          };
        }
        return inv;
      })
    );

    // 2. Also update matching items in apArInvoices
    setApArInvoices((prev) =>
      prev.map((inv) =>
        collectedIds.has(inv.id) ? { ...inv, status: "Collected / Settled" } : inv
      )
    );

    // 3. Update Treasury Liquidity Pool (Cash Management)
    const isPetty =
      targetAccount.includes("1010") ||
      targetAccount.includes("Front Desk") ||
      targetAccount.includes("Petty") ||
      paymentMethod === "Cash / Petty";

    const prevCash = { ...cashPool };
    const newCash = isPetty
      ? { ...prevCash, pettyCash: prevCash.pettyCash + totalCollectible }
      : { ...prevCash, bankOperating: prevCash.bankOperating + totalCollectible };

    setCashPool(newCash);

    // 4. Double-Entry Posting to General Ledger
    const debitAccountCode = isPetty ? "1010" : "1030";
    const debitAccountName = isPetty
      ? "1010 - Front Desk Cash Float (Petty Cash)"
      : "1030 - Operating Bank Account - BDO Primary";

    const glDate = new Date().toISOString().split("T")[0];
    const journalRef = referenceNumber || `BATCH-COL-${Date.now().toString().slice(-6)}`;

    // Total principal vs total late interest surcharge recovered
    const totalPrincipal = collectedInvoices.reduce((s, i) => s + (i.amount - (i.paidAmount || 0)), 0);
    const totalLateIncrement = Math.max(0, totalCollectible - totalPrincipal);

    const glLines: any[] = [
      {
        id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
        date: glDate,
        ref: journalRef,
        sourceModule: "Treasury",
        accountCode: debitAccountCode,
        accountName: debitAccountName,
        memo: `Batch Settlement (${collectedInvoices.length} Invoices) via ${paymentMethod} to ${targetAccount}`,
        debit: totalCollectible,
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
        memo: `Batch AR Liquidation (${collectedInvoices.length} Accounts: ${collectedInvoices.map((i) => i.id).join(", ")})`,
        debit: 0,
        credit: totalPrincipal,
        status: "COMMITTED",
        postedBy: currentUser?.name || "Administrator",
        approvedBy: currentUser?.role === "superadmin" ? "Super Administrator" : "Finance Controller"
      }
    ];

    if (totalLateIncrement > 0) {
      glLines.push({
        id: `LP-${Math.floor(1000 + Math.random() * 9000)}`,
        date: glDate,
        ref: journalRef,
        sourceModule: "Hotel PMS",
        accountCode: "4200",
        accountName: "4200 - Penalty & Overdue Interest Income",
        memo: `Batch Late Surcharge Recovery (${collectedInvoices.length} accounts)`,
        debit: 0,
        credit: totalLateIncrement,
        status: "COMMITTED",
        postedBy: currentUser?.name || "Administrator",
        approvedBy: currentUser?.role === "superadmin" ? "Super Administrator" : "Finance Controller"
      });
    }

    setJournalEntries((prev) => [...glLines, ...prev]);

    // 5. Append to Collections data register
    const newCollectionBatch = {
      id: `COL-${Math.floor(700 + Math.random() * 200)}`,
      payerName: `Batch Settlement (${collectedInvoices.length} Clients)`,
      phone: "+639170192834",
      email: "treasury@horeca.com",
      cardNo: referenceNumber,
      checkNo: referenceNumber,
      amount: totalCollectible,
      targetAccount: isPetty ? "Front Desk Cash Float" : "Operating Bank Account"
    };
    setCollectionData((prev) => [newCollectionBatch, ...prev]);

    // 6. Immutably log in Audit Trail
    logAuditEvent({
      action: "BATCH_COLLECT_ALL_AR",
      module: "Accounts Receivable",
      description: `Executed 'Collect All' batch settlement for ${collectedInvoices.length} AR invoices totaling ₱${totalCollectible.toLocaleString()} deposited to ${targetAccount} via ${paymentMethod} (Ref: ${referenceNumber})`,
      previousState: {
        uncollectedCount: collectedInvoices.length,
        invoices: collectedInvoices.map((i) => ({ id: i.id, customer: i.customer, amount: i.amount })),
        totalCollectible
      },
      newState: {
        batchRef: referenceNumber,
        settledInvoiceCount: collectedInvoices.length,
        totalCollected: totalCollectible,
        depositAccount: targetAccount,
        paymentMethod,
        glEntriesPosted: glLines.length
      }
    });

    showToast(
      `Batch Collection Executed: ₱${totalCollectible.toLocaleString()} across ${collectedInvoices.length} invoices deposited to Treasury & synchronized with GL!`,
      "success"
    );
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

  // ==========================================
  // DISBURSEMENT HANDLERS (Cross-Module Sync)
  // ==========================================
  const handleExecuteDisbursement = (receipt: DisbursementReceipt) => {
    // 1. Decrement Bank Operating or Petty Cash
    const isPetty = receipt.deductedFromAccount.includes("1010") || receipt.deductedFromAccount.includes("Front Desk");
    if (isPetty) {
      setCashPool((prev) => ({
        ...prev,
        pettyCash: Math.max(0, prev.pettyCash - receipt.amount)
      }));
    } else {
      setCashPool((prev) => ({
        ...prev,
        bankOperating: Math.max(0, prev.bankOperating - receipt.amount)
      }));
    }

    // 2. Add to disbursementData list
    const newDisb = {
      id: receipt.id,
      payee: receipt.payee,
      swift: "BDO-PESONET",
      nationalId: "****8892",
      netPay: receipt.amount,
      token: receipt.referenceToken,
      department: receipt.department,
      voucherNo: receipt.receiptNo,
      purpose: receipt.purpose,
      timestamp: receipt.timestamp,
      status: "APPROVED_AND_DISBURSED"
    };
    setDisbursementData((prev) => [newDisb, ...prev]);

    // 3. Update department budget spent
    setBudgets((prev) =>
      prev.map((b) =>
        b.department.toLowerCase().includes(receipt.department.toLowerCase().split(" ")[0]) ||
        receipt.department.toLowerCase().includes(b.department.toLowerCase().split(" ")[0])
          ? { ...b, spent: b.spent + receipt.amount }
          : b
      )
    );

    // 4. Record General Ledger Journal Entry
    const glDebitAccount = receipt.glDebitAccount || "5010 - Hotel Guest Supplies, Amenities & Maintenance";
    const glCreditAccount = receipt.deductedFromAccount;
    const debitCode = glDebitAccount.substring(0, 4);
    const creditCode = glCreditAccount.substring(0, 4);

    const newJournalEntry = {
      id: `JE-DISB-${Math.floor(1000 + Math.random() * 9000)}`,
      date: receipt.timestamp.split(" ")[0] || new Date().toISOString().split("T")[0],
      reference: receipt.receiptNo,
      description: `Disbursement: ${receipt.payee} - ${receipt.purpose}`,
      status: "POSTED",
      lines: [
        {
          accountCode: debitCode,
          accountName: glDebitAccount,
          debit: receipt.amount,
          credit: 0
        },
        {
          accountCode: creditCode,
          accountName: glCreditAccount,
          debit: 0,
          credit: receipt.amount
        }
      ]
    };
    setJournalEntries((prev: any) => [newJournalEntry, ...prev]);

    // 5. Log in Audit Trail
    logAuditEvent({
      action: "EXECUTE_DISBURSEMENT_RECEIPT",
      module: "Disbursement Management",
      description: `Issued disbursement receipt ${receipt.receiptNo} of ₱${receipt.amount.toLocaleString()} to ${receipt.payee} for ${receipt.department}. Deducted from ${receipt.deductedFromAccount} with budget cap remaining ₱${receipt.budgetCapRemaining.toLocaleString()}.`,
      newState: receipt
    });

    showToast(
      `Disbursement Committed: ₱${receipt.amount.toLocaleString()} paid to ${receipt.payee} (Receipt: ${receipt.receiptNo})`,
      "success"
    );
  };

  const handleUpdateDepartmentBudgets = (
    allocations: { department: string; allocated: number; cap: number; percentage: number }[]
  ) => {
    // Update main budgets state in Finance/page.tsx
    setBudgets((prev) =>
      prev.map((b) => {
        const match = allocations.find(
          (a) =>
            a.department.toLowerCase().includes(b.department.toLowerCase().split(" ")[0]) ||
            b.department.toLowerCase().includes(a.department.toLowerCase().split(" ")[0])
        );
        if (match) {
          return {
            ...b,
            allocated: match.allocated
          };
        }
        return b;
      })
    );

    logAuditEvent({
      action: "AI_DEPARTMENT_BUDGET_ALLOCATION",
      module: "Disbursement Management",
      description: `Applied AI automated budget allocation across 5 departments. Enforced updated budget caps and allocation targets.`,
      newState: allocations
    });

    showToast("AI Department Budget Allocation Applied & Enforced Successfully!", "success");
  };

  // Submit Action with Role Dispatch
  // Submit Action with Two-Tier Role Dispatch (Subsystem/Admin -> Super Admin)
  const submitForApproval = (actionType: string, module: string, payload: any) => {
    const isSuperAdmin = currentUser?.role === "superadmin";

    const req = {
      id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
      actionType,
      requestedBy: currentUser?.name || "Operational User",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      module,
      payload,
      status: isSuperAdmin ? "PENDING_SUPERADMIN" : "PENDING_ADMIN",
      currentStage: isSuperAdmin ? "STAGE_2_SUPERADMIN" : "STAGE_1_ADMIN",
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
      // Subsystem / Standard User: Queued for Admin Verification (Stage 1)
      setPendingApprovals((prev) => [req, ...prev]);
      showToast(`Action queued for Admin Stage 1 Review (${req.id})`, "info");

      logAuditEvent({
        action: "QUEUE_APPROVAL_REQUEST",
        module: "Governance & Approvals",
        description: `Submitted ${actionType} for Admin verification (${req.id})`,
        status: "PENDING_APPROVAL",
        previousState: null,
        newState: req
      });
    }
  };

  // Stage 1: Admin reviews and forwards request to Super Admin
  const handleAdminVerifyAndForward = (reqId: string, notes?: string) => {
    const adminName = currentUser?.name || "Standard Administrator";
    const timestamp = new Date().toISOString().replace("T", " ").substring(0, 16);
    const verificationNotes = notes || "Verified compliance, supporting documents, and ledger allocation. Endorsed to Super Admin.";

    let updatedReq: any = null;
    setPendingApprovals((prev) =>
      prev.map((r) => {
        if (r.id === reqId) {
          updatedReq = {
            ...r,
            status: "PENDING_SUPERADMIN",
            currentStage: "STAGE_2_SUPERADMIN",
            adminVerifiedBy: adminName,
            adminVerifiedAt: timestamp,
            adminNotes: verificationNotes
          };
          return updatedReq;
        }
        return r;
      })
    );

    showToast(`Request ${reqId} verified and forwarded to Super Admin for executive authorization!`, "success");

    logAuditEvent({
      action: "ADMIN_VERIFY_AND_FORWARD",
      module: "Governance & Approvals",
      description: `Admin ${adminName} verified request ${reqId} and forwarded to Super Admin for final approval.`,
      status: "PENDING_APPROVAL",
      previousState: { requestId: reqId, status: "PENDING_ADMIN" },
      newState: updatedReq
    });

    try {
      window.dispatchEvent(new CustomEvent("fms-sync-event", { detail: { action: "ADMIN_VERIFY", reqId } }));
    } catch (e) {}
  };

  // Stage 2: Super Admin grants final executive approval and commits
  const handleApproveRequest = (req: any) => {
    if (currentUser?.role !== "superadmin") {
      showToast("Only the Super Administrator has final executive approval authority. Admins verify and forward to the Super Admin.", "warning");
      return;
    }

    executeApprovedAction(req);

    const superAdminName = currentUser?.name || "Super Administrator";
    const timestamp = new Date().toISOString().replace("T", " ").substring(0, 16);

    setPendingApprovals((prev) =>
      prev.map((r) =>
        r.id === req.id
          ? {
              ...r,
              status: "APPROVED",
              currentStage: "FINAL_APPROVED",
              superAdminApprovedBy: superAdminName,
              superAdminApprovedAt: timestamp
            }
          : r
      )
    );

    showToast(`Super Admin authorized and finalized ${req.id} (${req.actionType})! Cross-module synchronized.`, "success");

    logAuditEvent({
      action: "SUPERADMIN_EXECUTIVE_APPROVAL",
      module: "Governance & Approvals",
      description: `Super Administrator ${superAdminName} authorized and executed request ${req.id} (${req.actionType}). Committed to Master Ledger and Treasury.`,
      previousState: { requestId: req.id, status: req.status, payload: req.payload },
      newState: { requestId: req.id, status: "APPROVED", approvedAt: timestamp }
    });

    try {
      window.dispatchEvent(new CustomEvent("fms-sync-event", { detail: { action: "SUPERADMIN_APPROVE", reqId: req.id } }));
    } catch (e) {}
  };

  const handleRejectRequest = (reqId: string, reason?: string) => {
    const rejector = currentUser?.name || "Administrator";
    const timestamp = new Date().toISOString().replace("T", " ").substring(0, 16);
    const rejectionReason = reason || `Rejected by ${currentUser?.role === "superadmin" ? "Super Administrator" : "Administrator"}.`;

    let target: any = null;
    setPendingApprovals((prev) =>
      prev.map((r) => {
        if (r.id === reqId) {
          target = {
            ...r,
            status: "REJECTED",
            currentStage: "REJECTED",
            rejectedBy: rejector,
            rejectedAt: timestamp,
            rejectionReason
          };
          return target;
        }
        return r;
      })
    );

    showToast(`Request ${reqId} was rejected by ${rejector}`, "warning");

    logAuditEvent({
      action: "REJECT_GOVERNANCE_REQUEST",
      module: "Governance & Approvals",
      description: `${rejector} rejected request ${reqId}: ${rejectionReason}`,
      status: "REJECTED",
      previousState: { requestId: reqId, status: "PENDING" },
      newState: target
    });

    try {
      window.dispatchEvent(new CustomEvent("fms-sync-event", { detail: { action: "REJECT_REQUEST", reqId } }));
    } catch (e) {}
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

            {/* Middle: 5 Connected Subsystems Badge Strip (Clickable directly to each Subsystem) */}
            <div className="relative z-10 my-6 space-y-2 font-['IBM_Plex_Mono'] text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Live Interconnected Systems
                </span>
                <span className="text-[9px] text-slate-500 uppercase tracking-widest">
                  Click to Access
                </span>
              </div>
              <div className="space-y-1.5">
                {/* 1. Hotel PMS */}
                <button
                  type="button"
                  onClick={() => onSwitchSubsystem && onSwitchSubsystem("hotel_mngt")}
                  className="w-full flex items-center justify-between bg-white/10 hover:bg-white/20 active:scale-[0.99] px-2.5 py-1.5 rounded-lg border border-white/10 hover:border-blue-400/50 transition-all text-left group cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 group-hover:scale-125 transition-transform"></span>
                    <span className="group-hover:text-blue-200 transition-colors">1. Hotel PMS</span>
                  </span>
                  <span className="text-[10px] text-blue-300 flex items-center gap-1">
                    <span>Folios &amp; Rooms</span>
                    <ArrowRight className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                </button>

                {/* 2. Restaurant POS */}
                <button
                  type="button"
                  onClick={() => onSwitchSubsystem && onSwitchSubsystem("resto_mngt")}
                  className="w-full flex items-center justify-between bg-white/10 hover:bg-white/20 active:scale-[0.99] px-2.5 py-1.5 rounded-lg border border-white/10 hover:border-amber-400/50 transition-all text-left group cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 group-hover:scale-125 transition-transform"></span>
                    <span className="group-hover:text-amber-200 transition-colors">2. Restaurant POS</span>
                  </span>
                  <span className="text-[10px] text-amber-300 flex items-center gap-1">
                    <span>Dining &amp; SC Pool</span>
                    <ArrowRight className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                </button>

                {/* 3. HRMS Payroll */}
                <button
                  type="button"
                  onClick={() => onSwitchSubsystem && onSwitchSubsystem("hr_payroll")}
                  className="w-full flex items-center justify-between bg-white/10 hover:bg-white/20 active:scale-[0.99] px-2.5 py-1.5 rounded-lg border border-white/10 hover:border-purple-400/50 transition-all text-left group cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 group-hover:scale-125 transition-transform"></span>
                    <span className="group-hover:text-purple-200 transition-colors">3. HRMS Payroll</span>
                  </span>
                  <span className="text-[10px] text-purple-300 flex items-center gap-1">
                    <span>Wages &amp; WHT</span>
                    <ArrowRight className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                </button>

                {/* 4. Supply Chain */}
                <button
                  type="button"
                  onClick={() => onSwitchSubsystem && onSwitchSubsystem("supply_chain")}
                  className="w-full flex items-center justify-between bg-white/10 hover:bg-white/20 active:scale-[0.99] px-2.5 py-1.5 rounded-lg border border-white/10 hover:border-emerald-400/50 transition-all text-left group cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 group-hover:scale-125 transition-transform"></span>
                    <span className="group-hover:text-emerald-200 transition-colors">4. Supply Chain</span>
                  </span>
                  <span className="text-[10px] text-emerald-300 flex items-center gap-1">
                    <span>Procure &amp; AP</span>
                    <ArrowRight className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                </button>

                {/* 5. FleetOps */}
                <button
                  type="button"
                  onClick={() => onSwitchSubsystem && onSwitchSubsystem("fleet_ops")}
                  className="w-full flex items-center justify-between bg-white/10 hover:bg-white/20 active:scale-[0.99] px-2.5 py-1.5 rounded-lg border border-white/10 hover:border-cyan-400/50 transition-all text-left group cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 group-hover:scale-125 transition-transform"></span>
                    <span className="group-hover:text-cyan-200 transition-colors">5. FleetOps</span>
                  </span>
                  <span className="text-[10px] text-cyan-300 flex items-center gap-1">
                    <span>Fuel, Shuttles &amp; Maint</span>
                    <ArrowRight className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                </button>
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
                  badge: unseenAuditCount > 0 ? unseenAuditCount : undefined,
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

            {onSwitchSubsystem && (
              <div className="pt-3 border-t border-[#DFE1DB] space-y-1">
                {!isSidebarCollapsed && (
                  <p className="px-2 text-[10px] font-bold font-['IBM_Plex_Mono'] uppercase text-[#5C636F] flex items-center justify-between">
                    <span>Operational Subsystems</span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">Live</span>
                  </p>
                )}
                {[
                  { id: "hr_payroll", label: "HR & Payroll", icon: Users, color: "text-indigo-600" },
                  { id: "hotel_mngt", label: "Hotel Operations", icon: Building2, color: "text-sky-600" },
                  { id: "resto_mngt", label: "Restaurant & F&B", icon: DollarSign, color: "text-rose-600" },
                  { id: "supply_chain", label: "Supply Chain", icon: Database, color: "text-amber-600" },
                  { id: "fleet_ops", label: "Fleet Logistics", icon: RefreshCw, color: "text-emerald-600" },
                ].map((sub) => {
                  const SubIcon = sub.icon;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => onSwitchSubsystem(sub.id)}
                      title={isSidebarCollapsed ? sub.label : undefined}
                      className={`w-full flex items-center ${
                        isSidebarCollapsed ? "justify-center px-0 py-2" : "justify-start space-x-2 px-3 py-2"
                      } rounded-lg text-xs font-medium text-[#5C636F] hover:bg-[#F1F1ED] hover:text-[#1A1D21] transition-colors cursor-pointer`}
                    >
                      <SubIcon className={`h-4 w-4 shrink-0 ${sub.color}`} />
                      {!isSidebarCollapsed && <span className="truncate">{sub.label}</span>}
                    </button>
                  );
                })}
              </div>
            )}
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
                  <p className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#157A4D] text-left">
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

              {/* FINANCIAL CHARTS & GRAPHS: DAILY, WEEKLY, MONTHLY, ANNUAL (Requirement 1) */}
              <DashboardFinancialCharts
                maskCurrency={maskCurrency}
                isDataMasked={isDataMasked}
              />

              {/* LINEAR REGRESSION DIAGRAM (FP&A 6-MONTH FORECASTING) */}
              <LinearRegressionDiagram
                isDataMasked={isDataMasked}
                maskCurrency={maskCurrency}
                role={currentUser.role}
              />

              {/* Streamlined Subsystems Live Reconciliation Bar (Simplified, Anti-Overcrowded) */}
              <div className="bg-white border border-[#DFE1DB] p-4 rounded-xl shadow-xs">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#DFE1DB] pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-[#B53A1E]" />
                    <h3 className="font-bold text-sm font-['Archivo'] text-[#1A1D21]">
                      Subsystems Interconnection &amp; Live Double-Entry Reconciler
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-['IBM_Plex_Mono']">
                    <span className="flex items-center gap-1.5 text-[#157A4D] font-bold">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Ledger Balanced (Debits = Credits: {maskCurrency(totalDebits)})</span>
                    </span>
                    <button
                      onClick={() => showToast("Subsystems synchronized with General Ledger", "success")}
                      className="px-2.5 py-1 bg-[#F1F1ED] hover:bg-[#DFE1DB] text-[#1A1D21] text-[11px] font-bold rounded flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>Sync</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs font-['IBM_Plex_Mono']">
                  {[
                    { name: "Hotel PMS", coa: "1010, 4010, 2020", vol: 167840, tag: "PMS" },
                    { name: "Restaurant POS", coa: "1020, 4020, 2200", vol: 86240, tag: "POS" },
                    { name: "HRMS Payroll", coa: "5110, 2110, 2120", vol: 185000, tag: "HR" },
                    { name: "Supply Chain", coa: "1310, 1320, 2010", vol: 112000, tag: "SCM" },
                    { name: "FleetOps", coa: "1530, 2030, 4300", vol: 87700, tag: "FLEET" }
                  ].map((sub) => (
                    <div
                      key={sub.name}
                      onClick={() => setActiveTab("gl")}
                      className="p-2.5 bg-[#F8F9F6] hover:bg-[#F1F1ED] border border-[#DFE1DB] rounded-lg transition-colors cursor-pointer group"
                    >
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-[#1A1D21]">{sub.name}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      </div>
                      <div className="text-[10px] text-[#5C636F] mt-1">COA: {sub.coa}</div>
                      <div className="text-[11px] font-bold text-[#157A4D] mt-0.5">{maskCurrency(sub.vol)}</div>
                    </div>
                  ))}
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
              onBatchCollectAll={handleBatchCollectAll}
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
            <DisbursementManagement
              cashPool={cashPool}
              currentUser={currentUser}
              onExecuteDisbursement={handleExecuteDisbursement}
              onUpdateDepartmentBudgets={handleUpdateDepartmentBudgets}
              maskCurrency={maskCurrency}
              isDataMasked={isDataMasked}
            />
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
              cashPool={cashPool}
              collections={collections}
              arInvoices={arInvoices}
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
              MODULE: APPROVALS QUEUE (TWO-TIER: SUBSYSTEM -> ADMIN -> SUPER ADMIN)
             ============================================================================== */}
          {activeTab === "approvals" && (
            <div className="space-y-6">
              {/* Header Title & Protocol Overview */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DFE1DB] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold font-['Archivo'] text-[#1A1D21]">
                      Two-Tier Governance &amp; Executive Approval Queue
                    </h2>
                    <span className="text-[10px] font-['IBM_Plex_Mono'] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Submodule Interop Active
                    </span>
                  </div>
                  <p className="text-xs text-[#5C636F] font-['IBM_Plex_Sans'] mt-1">
                    When a subsystem makes a request, it goes to the <strong>Admin first (Stage 1)</strong>; once verified, the Admin sends it to the <strong>Super Admin (Stage 2)</strong> for final authorization.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-['IBM_Plex_Mono']">
                  <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg font-bold">
                    Stage 1 (Admin): {pendingApprovals.filter((r) => r.status === "PENDING_ADMIN" || !r.status).length}
                  </span>
                  <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-lg font-bold">
                    Stage 2 (Super Admin): {pendingApprovals.filter((r) => r.status === "PENDING_SUPERADMIN").length}
                  </span>
                </div>
              </div>

              {/* Visual Two-Tier Protocol Chain Banner */}
              <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm border border-slate-800">
                <div className="text-[11px] font-['IBM_Plex_Mono'] uppercase tracking-wider text-slate-400 font-bold mb-3 flex items-center justify-between">
                  <span>Authorized Two-Tier Approval Pipeline</span>
                  <span className="text-emerald-400 font-bold">Role-Guarded Workflow</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-['IBM_Plex_Mono']">
                  <div className="bg-slate-800/80 border border-slate-700 p-2.5 rounded-lg">
                    <span className="text-[10px] text-amber-400 font-bold block">STEP 1</span>
                    <span className="font-bold text-white">Submodule Action</span>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-['IBM_Plex_Sans']">
                      HR, Hotel, Resto, Supply Chain, or Fleet triggers financial request
                    </p>
                  </div>
                  <div className="bg-slate-800/80 border border-amber-500/40 p-2.5 rounded-lg">
                    <span className="text-[10px] text-amber-400 font-bold block">STEP 2 (STAGE 1)</span>
                    <span className="font-bold text-amber-300">Admin Verification</span>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-['IBM_Plex_Sans']">
                      Admin inspects docs, PO, and GL allocation; forwards to Super Admin
                    </p>
                  </div>
                  <div className="bg-slate-800/80 border border-indigo-500/40 p-2.5 rounded-lg">
                    <span className="text-[10px] text-indigo-400 font-bold block">STEP 3 (STAGE 2)</span>
                    <span className="font-bold text-indigo-300">Super Admin Authorization</span>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-['IBM_Plex_Sans']">
                      Executive final sign-off; authorizes release of funds and GL commit
                    </p>
                  </div>
                  <div className="bg-slate-800/80 border border-emerald-500/40 p-2.5 rounded-lg">
                    <span className="text-[10px] text-emerald-400 font-bold block">STEP 4</span>
                    <span className="font-bold text-emerald-300">FMS Master Sync</span>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-['IBM_Plex_Sans']">
                      Automatic double-entry balanced GL, Cash Pool, and Audit Trail update
                    </p>
                  </div>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2 border-b border-[#DFE1DB] pb-2 text-xs font-['IBM_Plex_Mono']">
                <button
                  onClick={() => setApprovalFilter("ALL")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    approvalFilter === "ALL"
                      ? "bg-[#1A1D21] text-white"
                      : "bg-white border border-[#DFE1DB] text-[#5C636F] hover:text-[#1A1D21]"
                  }`}
                >
                  All Submissions ({pendingApprovals.length})
                </button>
                <button
                  onClick={() => setApprovalFilter("STAGE_1_ADMIN")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    approvalFilter === "STAGE_1_ADMIN"
                      ? "bg-amber-700 text-white"
                      : "bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100"
                  }`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span>Stage 1: Pending Admin Review</span>
                  <span className="bg-white/80 text-amber-900 text-[10px] px-1.5 py-0.2 rounded font-black">
                    {pendingApprovals.filter((r) => r.status === "PENDING_ADMIN" || !r.status).length}
                  </span>
                </button>
                <button
                  onClick={() => setApprovalFilter("STAGE_2_SUPERADMIN")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    approvalFilter === "STAGE_2_SUPERADMIN"
                      ? "bg-indigo-700 text-white"
                      : "bg-indigo-50 border border-indigo-200 text-indigo-900 hover:bg-indigo-100"
                  }`}
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                  <span>Stage 2: Awaiting Super Admin</span>
                  <span className="bg-white/80 text-indigo-900 text-[10px] px-1.5 py-0.2 rounded font-black">
                    {pendingApprovals.filter((r) => r.status === "PENDING_SUPERADMIN").length}
                  </span>
                </button>
                <button
                  onClick={() => setApprovalFilter("COMPLETED")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    approvalFilter === "COMPLETED"
                      ? "bg-emerald-700 text-white"
                      : "bg-emerald-50 border border-emerald-200 text-emerald-900 hover:bg-emerald-100"
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Completed / Synchronized</span>
                  <span className="bg-white/80 text-emerald-900 text-[10px] px-1.5 py-0.2 rounded font-black">
                    {pendingApprovals.filter((r) => r.status === "APPROVED" || r.status === "REJECTED").length}
                  </span>
                </button>
              </div>

              {/* Requests List */}
              {(() => {
                const filtered = pendingApprovals.filter((req) => {
                  const st = req.status || "PENDING_ADMIN";
                  if (approvalFilter === "STAGE_1_ADMIN") return st === "PENDING_ADMIN";
                  if (approvalFilter === "STAGE_2_SUPERADMIN") return st === "PENDING_SUPERADMIN";
                  if (approvalFilter === "COMPLETED") return st === "APPROVED" || st === "REJECTED";
                  return true;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="bg-white border border-[#DFE1DB] rounded-xl p-10 text-center text-sm font-['IBM_Plex_Mono'] text-[#5C636F] shadow-xs">
                      No requests found matching this governance stage filter.
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {filtered.map((req) => {
                      const reqStatus = req.status || "PENDING_ADMIN";
                      const isStage1 = reqStatus === "PENDING_ADMIN";
                      const isStage2 = reqStatus === "PENDING_SUPERADMIN";
                      const isApproved = reqStatus === "APPROVED";
                      const isRejected = reqStatus === "REJECTED";

                      const getModuleBadgeColor = (mod: string) => {
                        switch (mod) {
                          case "HR-Payroll":
                            return "bg-indigo-50 text-indigo-700 border-indigo-200";
                          case "Hotel-MNGT":
                            return "bg-sky-50 text-sky-700 border-sky-200";
                          case "Resto-MNGT":
                            return "bg-rose-50 text-rose-700 border-rose-200";
                          case "Supply-Chain":
                            return "bg-amber-50 text-amber-700 border-amber-200";
                          case "FleetOps":
                            return "bg-emerald-50 text-emerald-700 border-emerald-200";
                          default:
                            return "bg-slate-100 text-slate-700 border-slate-300";
                        }
                      };

                      return (
                        <div
                          key={req.id}
                          className={`bg-white border p-5 rounded-xl shadow-xs transition-all ${
                            isStage1
                              ? "border-amber-300 ring-1 ring-amber-100"
                              : isStage2
                              ? "border-indigo-300 ring-1 ring-indigo-100"
                              : isApproved
                              ? "border-emerald-200 bg-emerald-50/20"
                              : "border-slate-200 opacity-80"
                          }`}
                        >
                          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                            <div className="space-y-2 flex-1">
                              {/* Badges Bar */}
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="bg-slate-900 text-white font-['IBM_Plex_Mono'] font-bold text-xs px-2.5 py-0.5 rounded">
                                  {req.id}
                                </span>

                                <span
                                  className={`text-xs font-bold font-['IBM_Plex_Mono'] px-2 py-0.5 rounded border ${getModuleBadgeColor(
                                    req.module
                                  )}`}
                                >
                                  {req.module}
                                </span>

                                {/* Stage Badge */}
                                {isStage1 && (
                                  <span className="text-[11px] font-['IBM_Plex_Mono'] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>Stage 1: Pending Admin Verification</span>
                                  </span>
                                )}

                                {isStage2 && (
                                  <span className="text-[11px] font-['IBM_Plex_Mono'] font-bold bg-indigo-100 text-indigo-900 border border-indigo-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                    <ArrowRight className="h-3 w-3 text-indigo-700" />
                                    <span>Stage 2: Admin Verified &bull; Awaiting Super Admin</span>
                                  </span>
                                )}

                                {isApproved && (
                                  <span className="text-[11px] font-['IBM_Plex_Mono'] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3 text-emerald-700" />
                                    <span>Super Admin Approved &amp; Committed to FMS</span>
                                  </span>
                                )}

                                {isRejected && (
                                  <span className="text-[11px] font-['IBM_Plex_Mono'] font-bold bg-rose-100 text-rose-900 border border-rose-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                    <X className="h-3 w-3 text-rose-700" />
                                    <span>Rejected</span>
                                  </span>
                                )}

                                {req.amount !== undefined && (
                                  <span className="text-xs font-['IBM_Plex_Mono'] font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                    ₱{Number(req.amount).toLocaleString()}
                                  </span>
                                )}
                              </div>

                              {/* Title & Description */}
                              <div>
                                <h3 className="text-base font-bold font-['Archivo'] text-[#1A1D21]">
                                  {req.title || req.actionType}
                                </h3>
                                <p className="text-xs text-[#1A1D21] font-['IBM_Plex_Sans'] mt-1">
                                  <strong>Cross-Module Impact:</strong> {req.impactSummary}
                                </p>
                              </div>

                              {/* Requester & Submission Time */}
                              <div className="text-[11px] font-['IBM_Plex_Mono'] text-[#5C636F] flex flex-wrap items-center gap-x-4 gap-y-1">
                                <span>Requested by: <strong>{req.requestedBy}</strong></span>
                                <span>Submitted: {req.timestamp}</span>
                              </div>

                              {/* Admin Verification Stamp (if Stage 2 or Approved) */}
                              {req.adminVerifiedBy && (
                                <div className="bg-indigo-50/80 border border-indigo-200 rounded-lg p-2.5 text-xs font-['IBM_Plex_Mono'] text-indigo-950 space-y-1">
                                  <div className="flex items-center gap-1.5 font-bold text-indigo-800">
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    <span>Tier 1 Admin Verification Stamp:</span>
                                    <span>{req.adminVerifiedBy}</span>
                                    <span className="text-[10px] text-indigo-600 font-normal">({req.adminVerifiedAt})</span>
                                  </div>
                                  {req.adminNotes && (
                                    <p className="text-[11px] text-indigo-900 font-['IBM_Plex_Sans'] italic pl-5">
                                      &ldquo;{req.adminNotes}&rdquo;
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* Super Admin Executive Stamp (if Approved) */}
                              {req.superAdminApprovedBy && (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-xs font-['IBM_Plex_Mono'] text-emerald-950 flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
                                  <span>
                                    <strong>Executive Authorization:</strong> Final sign-off by Super Admin <strong>{req.superAdminApprovedBy}</strong> on {req.superAdminApprovedAt}. Master GL and Cash liquidity reconciled.
                                  </span>
                                </div>
                              )}

                              {/* Rejection Stamp */}
                              {isRejected && req.rejectedBy && (
                                <div className="bg-rose-50 border border-rose-200 rounded-lg p-2.5 text-xs font-['IBM_Plex_Mono'] text-rose-950 flex items-center gap-2">
                                  <AlertCircle className="h-4 w-4 text-rose-700 shrink-0" />
                                  <span>
                                    <strong>Rejected by:</strong> {req.rejectedBy} on {req.rejectedAt}. Reason: {req.rejectionReason}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Action Controls Section */}
                            <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2 shrink-0">
                              {/* STAGE 1: ADMIN ACTIONS */}
                              {isStage1 && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setAdminVerifyModal({
                                        isOpen: true,
                                        req,
                                        notes: "Verified documentation, supplier credentials, and cost center budget allocation. Endorsed for executive authorization."
                                      })
                                    }
                                    className="bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold font-['IBM_Plex_Mono'] flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                                    title="Verify request details and forward to Super Admin"
                                  >
                                    <ArrowRight className="h-3.5 w-3.5" />
                                    <span>Verify &amp; Send to Super Admin</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleRejectRequest(req.id, "Rejected by Admin during Stage 1 Review.")}
                                    className="bg-white border border-[#DFE1DB] hover:bg-rose-50 hover:text-rose-700 text-[#5C636F] px-3 py-2 rounded-lg text-xs font-bold font-['IBM_Plex_Mono'] flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                    <span>Reject Request</span>
                                  </button>
                                </>
                              )}

                              {/* STAGE 2: SUPER ADMIN ACTIONS */}
                              {isStage2 && (
                                <>
                                  {currentUser.role === "superadmin" ? (
                                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                                      <button
                                        type="button"
                                        onClick={() => handleApproveRequest(req)}
                                        className="bg-[#157A4D] hover:bg-[#12633e] text-white px-4 py-2.5 rounded-lg text-xs font-bold font-['IBM_Plex_Mono'] flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                                      >
                                        <Check className="h-3.5 w-3.5" />
                                        <span>Authorize &amp; Commit to FMS</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleRejectRequest(req.id, "Rejected by Super Administrator.")}
                                        className="bg-[#B5281A] hover:bg-[#932014] text-white px-3 py-2 rounded-lg text-xs font-bold font-['IBM_Plex_Mono'] flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                                      >
                                        <X className="h-3.5 w-3.5" />
                                        <span>Reject</span>
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 px-3 py-2 rounded-lg text-xs font-['IBM_Plex_Mono'] font-bold text-center">
                                      <span>Forwarded to Super Admin</span>
                                      <span className="block text-[10px] text-indigo-600 font-normal">Awaiting Executive Sign-Off</span>
                                    </div>
                                  )}
                                </>
                              )}

                              {/* COMPLETED STATUS DISPLAY */}
                              {(isApproved || isRejected) && (
                                <span className="text-[11px] font-['IBM_Plex_Mono'] text-slate-400 italic">
                                  Workflow Closed
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* ADMIN VERIFICATION MODAL DIALOG */}
              {adminVerifyModal.isOpen && adminVerifyModal.req && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
                          <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-base font-['Archivo'] text-slate-900">
                            Admin Stage 1 Verification
                          </h3>
                          <p className="text-[11px] text-slate-500 font-['IBM_Plex_Mono']">
                            Request {adminVerifyModal.req.id} &bull; {adminVerifyModal.req.module}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setAdminVerifyModal({ isOpen: false, req: null, notes: "" })}
                        className="text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-3 text-xs font-['IBM_Plex_Sans'] text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <p>
                        <strong>Action Title:</strong> {adminVerifyModal.req.title}
                      </p>
                      <p>
                        <strong>Requester:</strong> {adminVerifyModal.req.requestedBy}
                      </p>
                      {adminVerifyModal.req.amount && (
                        <p>
                          <strong>Financial Amount:</strong> ₱{Number(adminVerifyModal.req.amount).toLocaleString()}
                        </p>
                      )}
                      <p>
                        <strong>Impact Summary:</strong> {adminVerifyModal.req.impactSummary}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold font-['IBM_Plex_Mono'] uppercase text-slate-600 block">
                        Admin Endorsement &amp; Verification Notes:
                      </label>
                      <textarea
                        rows={3}
                        value={adminVerifyModal.notes}
                        onChange={(e) => setAdminVerifyModal((prev) => ({ ...prev, notes: e.target.value }))}
                        placeholder="Add review notes, confirmation of supporting vouchers, or PO verification..."
                        className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-['IBM_Plex_Sans'] focus:outline-none focus:border-slate-800"
                      />
                      <p className="text-[10px] text-slate-400 italic">
                        * Once forwarded, this request immediately lands in the Super Admin's executive approval desk.
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setAdminVerifyModal({ isOpen: false, req: null, notes: "" })}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-['IBM_Plex_Mono'] font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleAdminVerifyAndForward(adminVerifyModal.req.id, adminVerifyModal.notes);
                          setAdminVerifyModal({ isOpen: false, req: null, notes: "" });
                        }}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-['IBM_Plex_Mono'] font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                        <span>Confirm &amp; Forward to Super Admin</span>
                      </button>
                    </div>
                  </div>
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
              onEditUser={handleEditUser}
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
