import React, { useState } from "react";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  Building2,
  Users,
  UtensilsCrossed,
  Boxes,
  Truck,
  ArrowRight,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import { SUBSYSTEM_ACCOUNTS, SubsystemAccount, SubsystemSession } from "../services/subsystemAuth";
import { multiUserManager } from "../services/multiUserConfig";

interface SubsystemLoginPageProps {
  subsystemId: "hr_payroll" | "hotel_mngt" | "resto_mngt" | "supply_chain" | "fleet_ops";
  onLoginSuccess: (session: SubsystemSession) => void;
  onNavigateToFms?: () => void;
}

export default function SubsystemLoginPage({
  subsystemId,
  onLoginSuccess,
  onNavigateToFms
}: SubsystemLoginPageProps) {
  const accountConfig: SubsystemAccount = SUBSYSTEM_ACCOUNTS[subsystemId];

  const [emailInput, setEmailInput] = useState(accountConfig.email);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Subsystem-specific visual styling & icons
  const getSubsystemMeta = () => {
    switch (subsystemId) {
      case "hr_payroll":
        return {
          icon: Users,
          heroTitle: "HR & Payroll Subsystem",
          badge: "HR-Payroll Terminal",
          bgGradient: "from-[#0F1117] via-[#161B26] to-[#1E1B4B]",
          accentBtn: "bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500",
          iconBg: "bg-indigo-600",
          badgeColor: "bg-indigo-950/80 text-indigo-300 border-indigo-700/50",
        };
      case "hotel_mngt":
        return {
          icon: Building2,
          heroTitle: "Hotel PMS Operations",
          badge: "Hotel-MNGT Terminal",
          bgGradient: "from-[#0A1118] via-[#0C1929] to-[#082F49]",
          accentBtn: "bg-sky-600 hover:bg-sky-700 text-white focus:ring-sky-500",
          iconBg: "bg-sky-600",
          badgeColor: "bg-sky-950/80 text-sky-300 border-sky-700/50",
        };
      case "resto_mngt":
        return {
          icon: UtensilsCrossed,
          heroTitle: "Restaurant & F&B Operations",
          badge: "Resto-MNGT Terminal",
          bgGradient: "from-[#140C0E] via-[#200F15] to-[#4C0519]",
          accentBtn: "bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500",
          iconBg: "bg-rose-600",
          badgeColor: "bg-rose-950/80 text-rose-300 border-rose-700/50",
        };
      case "supply_chain":
        return {
          icon: Boxes,
          heroTitle: "Supply Chain & Procurement",
          badge: "Supply-Chain Terminal",
          bgGradient: "from-[#14100A] via-[#1E170A] to-[#451A03]",
          accentBtn: "bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500",
          iconBg: "bg-amber-600",
          badgeColor: "bg-amber-950/80 text-amber-300 border-amber-700/50",
        };
      case "fleet_ops":
        return {
          icon: Truck,
          heroTitle: "Fleet Logistics & Transport",
          badge: "FleetOps Terminal",
          bgGradient: "from-[#081410] via-[#092017] to-[#022C22]",
          accentBtn: "bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500",
          iconBg: "bg-emerald-600",
          badgeColor: "bg-emerald-950/80 text-emerald-300 border-emerald-700/50",
        };
    }
  };

  const meta = getSubsystemMeta();
  const SubsystemIcon = meta.icon;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      const trimmedEmail = emailInput.trim().toLowerCase();

      // Check standard designated officer account
      const isDesignatedOfficer =
        trimmedEmail === accountConfig.email.toLowerCase() &&
        passwordInput === accountConfig.passwordHash;

      // Also check against multi-user configuration registry
      const authResult = multiUserManager.authenticate(trimmedEmail, passwordInput);

      if (isDesignatedOfficer) {
        const session: SubsystemSession = {
          subsystemId,
          email: accountConfig.email,
          officerName: accountConfig.officerName,
          roleTitle: accountConfig.roleTitle,
          departmentCode: accountConfig.departmentCode,
          loginTimestamp: Date.now()
        };
        try {
          sessionStorage.setItem(`horeca_subsystem_session_${subsystemId}`, JSON.stringify(session));
        } catch (err) {}
        onLoginSuccess(session);
        return;
      }

      if (authResult.user) {
        const user = authResult.user;
        const isPermitted =
          user.subsystemsAllowed?.includes(subsystemId) ||
          user.role === "superadmin" ||
          user.role === "admin";

        if (!isPermitted) {
          setLoginError(`User ${user.name} does not have authorized clearance for ${accountConfig.subsystemShortName}.`);
          return;
        }

        const session: SubsystemSession = {
          subsystemId,
          email: user.email,
          officerName: user.name,
          roleTitle: user.title,
          departmentCode: accountConfig.departmentCode,
          loginTimestamp: Date.now()
        };
        try {
          sessionStorage.setItem(`horeca_subsystem_session_${subsystemId}`, JSON.stringify(session));
        } catch (err) {}
        onLoginSuccess(session);
        return;
      }

      setLoginError(authResult.error || "Invalid credentials. Please verify your registered email and password.");
    }, 400);
  };

  return (
    <div className={`min-h-full flex-1 flex items-center justify-center p-4 lg:p-8 font-sans bg-gradient-to-br ${meta.bgGradient} text-white`}>
      {/* Clean Single Focused Card */}
      <div className="w-full max-w-lg bg-white text-slate-900 rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
        {/* Top Header Banner */}
        <div className="bg-[#12161E] text-white p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${meta.iconBg} text-white shadow-md`}>
              <SubsystemIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center text-[10px] font-bold font-['IBM_Plex_Mono'] px-2 py-0.5 rounded-full border ${meta.badgeColor}`}>
                  {meta.badge}
                </span>
                <span className="text-[10px] text-slate-400 font-['IBM_Plex_Mono']">
                  {accountConfig.departmentCode}
                </span>
              </div>
              <h2 className="text-base font-bold font-['Archivo'] text-white mt-0.5">
                {accountConfig.subsystemName}
              </h2>
            </div>
          </div>

          {onNavigateToFms && (
            <button
              type="button"
              onClick={onNavigateToFms}
              className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-['IBM_Plex_Mono'] bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/10"
              title="Return to FMS Core"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>FMS Core</span>
            </button>
          )}
        </div>

        {/* Login Form Body */}
        <div className="p-6 sm:p-8 space-y-5">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-['IBM_Plex_Mono'] uppercase tracking-wider text-slate-500">
                Subsystem Terminal Access
              </span>
              <span className="text-[10px] font-['IBM_Plex_Mono'] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                Terminal Security
              </span>
            </div>
            <h3 className="text-xl font-bold font-['Archivo'] text-slate-900 mt-1">
              Authorized Personnel Sign-In
            </h3>
            <p className="text-xs text-slate-500 font-['IBM_Plex_Mono'] mt-0.5">
              Sign in with your registered operational or administrative user account.
            </p>
          </div>

          {loginError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-lg text-xs font-['IBM_Plex_Mono'] flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold font-['IBM_Plex_Mono'] uppercase text-slate-600">
                User Email Address
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder={accountConfig.email}
                  className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-slate-900 font-['IBM_Plex_Sans'] text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold font-['IBM_Plex_Mono'] uppercase text-slate-600">
                  Password
                </label>
                <span className="text-[10px] font-['IBM_Plex_Mono'] text-slate-400">
                  Case-sensitive
                </span>
              </div>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                {/* DO NOT PUT CURRENT PASSWORD IN THE INPUT FIELD */}
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter authorized password"
                  autoComplete="new-password"
                  className="w-full border border-slate-300 rounded-lg pl-9 pr-10 py-2 text-sm focus:outline-none focus:border-slate-900 font-['IBM_Plex_Sans'] text-slate-900 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-0.5 rounded"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-amber-600" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className={`w-full py-2.5 rounded-lg text-sm font-bold font-['IBM_Plex_Mono'] flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-sm ${meta.accentBtn} disabled:opacity-50`}
            >
              {isVerifying ? (
                <span>Authenticating User...</span>
              ) : (
                <>
                  <span>Sign In as {emailInput ? emailInput.split("@")[0] : "User"}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="border-t border-slate-200 pt-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-['IBM_Plex_Mono']">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Multi-User Role-Based Access Control Active &bull; Fully Audit Logged</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
