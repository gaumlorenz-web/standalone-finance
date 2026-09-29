import React, { useState } from "react";
import {
  Users,
  UserPlus,
  Shield,
  KeyRound,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  ShieldCheck,
  Check,
  X,
  Sparkles,
  Clock
} from "lucide-react";
import ExportButton from "./ExportButton";

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  googleAccount: string;
  password: string;
  role: "superadmin" | "admin";
  status: "active" | "suspended";
  createdAt: string;
  lastLogin?: string;
  otpVerified: boolean;
}

interface UserManagementProps {
  users: SystemUser[];
  onAddUser: (newUser: Omit<SystemUser, "id" | "createdAt" | "otpVerified">) => void;
  onToggleUserStatus: (userId: string) => void;
  onResetUserOtp: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  unmaskPassword: string;
  onUpdateUnmaskPassword: (newPass: string) => void;
  currentUser: { email: string; role: string; name: string } | null;
  isDataMasked: boolean;
  maskField: (val: any, type: string) => string;
}

export default function UserManagement({
  users,
  onAddUser,
  onToggleUserStatus,
  onResetUserOtp,
  onDeleteUser,
  unmaskPassword,
  onUpdateUnmaskPassword,
  currentUser,
  isDataMasked,
  maskField
}: UserManagementProps) {
  // Form State for creating new standard admin
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formGoogleAccount, setFormGoogleAccount] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState<"admin" | "superadmin">("admin");
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Unmask Password Management State
  const [newUnmaskPass, setNewUnmaskPass] = useState("");
  const [showUnmaskPass, setShowUnmaskPass] = useState(false);
  const [showNewUnmaskPass, setShowNewUnmaskPass] = useState(false);
  const [unmaskSuccess, setUnmaskSuccess] = useState("");

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!formName || !formEmail || !formGoogleAccount || !formPassword) {
      setFormError("All fields are required to register an administrative user.");
      return;
    }

    if (!formGoogleAccount.includes("@gmail.com") && !formGoogleAccount.includes("@googlemail.com")) {
      setFormError("Linked Google account must be a valid Google email address (@gmail.com).");
      return;
    }

    // Check duplicate
    if (users.some((u) => u.email.toLowerCase() === formEmail.toLowerCase())) {
      setFormError("A user with this system email already exists.");
      return;
    }

    onAddUser({
      name: formName,
      email: formEmail,
      googleAccount: formGoogleAccount,
      password: formPassword,
      role: formRole,
      status: "active"
    });

    setFormSuccess(`Admin account created for ${formName} and linked to ${formGoogleAccount}! OTP verification dispatched.`);
    setFormName("");
    setFormEmail("");
    setFormGoogleAccount("");
    setFormPassword("");
    setTimeout(() => setFormSuccess(""), 5000);
  };

  const handleSaveUnmaskPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnmaskPass.trim()) return;
    onUpdateUnmaskPassword(newUnmaskPass.trim());
    setUnmaskSuccess("Unmask data password updated successfully!");
    setNewUnmaskPass("");
    setTimeout(() => setUnmaskSuccess(""), 4000);
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.googleAccount.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const getUserExportData = () => {
    const headers = [
      "User ID",
      "Full Name",
      "System Login Email",
      "Linked Google Account (Gmail)",
      "Role",
      "Status",
      "Registration Date",
      "Last Login",
      "OTP Verified"
    ];

    const rows = filteredUsers.map((u) => [
      u.id,
      isDataMasked ? maskField(u.name, "name") : u.name,
      isDataMasked ? maskField(u.email, "email") : u.email,
      isDataMasked ? maskField(u.googleAccount, "email") : u.googleAccount,
      u.role.toUpperCase(),
      u.status.toUpperCase(),
      u.createdAt,
      u.lastLogin || "Never",
      u.otpVerified ? "YES" : "PENDING"
    ]);

    return {
      title: "Authorized Financial System Users & Google Account Register",
      subtitle: `Security Governance | Active Users: ${filteredUsers.length}`,
      filename: `HORECA_Authorized_Users_${new Date().toISOString().split("T")[0]}`,
      sheetName: "System_Users",
      headers,
      rows,
      summary: [
        { label: "Total Registered Accounts", value: users.length },
        { label: "Super Administrators", value: users.filter((u) => u.role === "superadmin").length },
        { label: "Standard Administrators", value: users.filter((u) => u.role === "admin").length },
        { label: "Active Status Accounts", value: users.filter((u) => u.status === "active").length }
      ],
      companyName: "HORECA HOSPITALITY & ASSET ENTERPRISE",
      generatedBy: currentUser?.name || "Super Administrator"
    };
  };

  return (
    <div className="space-y-6">
      {/* Module Title Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 border-b border-[#DFE1DB] pb-4">
        <div>
          <span className="text-[11px] font-bold font-['IBM_Plex_Mono'] uppercase text-[#5C636F] tracking-wider">
            Super Administrator Governance &amp; Access Controls
          </span>
          <h2 className="text-2xl font-bold font-['Archivo'] text-[#1A1D21] flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-[#B53A1E]" />
            User Management &amp; Security Settings
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton getExportData={getUserExportData} buttonLabel="Export User Register" />
        </div>
      </div>

      {/* Top Security & Policy Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 border border-[#DFE1DB] rounded-xl shadow-xs">
          <span className="text-[11px] font-['IBM_Plex_Mono'] font-bold text-[#5C636F] uppercase">
            Total Authorized Users
          </span>
          <div className="text-2xl font-bold font-['Archivo'] text-[#1A1D21] mt-1">
            {users.length} Accounts
          </div>
          <span className="text-[10px] text-[#5C636F] mt-1 block">
            {users.filter((u) => u.status === "active").length} Active / {users.filter((u) => u.status === "suspended").length} Suspended
          </span>
        </div>

        <div className="bg-white p-4 border border-[#DFE1DB] rounded-xl shadow-xs">
          <span className="text-[11px] font-['IBM_Plex_Mono'] font-bold text-[#5C636F] uppercase">
            Google 2-Factor OTP
          </span>
          <div className="text-2xl font-bold font-['Archivo'] text-[#157A4D] mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="h-5 w-5" />
            <span>Enforced</span>
          </div>
          <span className="text-[10px] text-[#5C636F] mt-1 block">Gmail OTP on Every Login</span>
        </div>

        <div className="bg-white p-4 border border-[#DFE1DB] rounded-xl shadow-xs">
          <span className="text-[11px] font-['IBM_Plex_Mono'] font-bold text-[#5C636F] uppercase">
            Session Timeout Limit
          </span>
          <div className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#FF6A3D] mt-1 flex items-center gap-1.5">
            <Clock className="h-5 w-5" />
            <span>15 Minutes</span>
          </div>
          <span className="text-[10px] text-[#5C636F] mt-1 block">Auto-Lock &amp; OTP Re-challenge</span>
        </div>

        <div className="bg-white p-4 border border-[#DFE1DB] rounded-xl shadow-xs">
          <span className="text-[11px] font-['IBM_Plex_Mono'] font-bold text-[#5C636F] uppercase">
            Unmask Data Security
          </span>
          <div className="text-2xl font-bold font-['Archivo'] text-[#1A1D21] mt-1 flex items-center gap-1.5">
            <KeyRound className="h-5 w-5 text-[#8A5A00]" />
            <span>Super Admin Configured</span>
          </div>
          <span className="text-[10px] text-[#5C636F] mt-1 block">Protected Financial Numbers</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Create New Standard Admin & Register to Google Account */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-[#DFE1DB] rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#DFE1DB] pb-3">
              <UserPlus className="h-5 w-5 text-[#B53A1E]" />
              <div>
                <h3 className="text-sm font-bold font-['Archivo'] text-[#1A1D21]">
                  Register Standard Admin
                </h3>
                <p className="text-[11px] text-[#5C636F] font-['IBM_Plex_Mono']">
                  Link Account to Staff Google Gmail
                </p>
              </div>
            </div>

            {formError && (
              <div className="bg-[#B5281A]/10 border border-[#B5281A]/30 text-[#B5281A] p-3 rounded-lg text-xs font-['IBM_Plex_Mono'] flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="bg-[#157A4D]/10 border border-[#157A4D]/30 text-[#157A4D] p-3 rounded-lg text-xs font-['IBM_Plex_Mono'] flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold font-['IBM_Plex_Mono'] text-[#5C636F] uppercase text-[10px]">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maria Santos"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-[#F1F1ED] border border-[#DFE1DB] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1A1D21]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold font-['IBM_Plex_Mono'] text-[#5C636F] uppercase text-[10px]">
                  System Login Email
                </label>
                <div className="relative">
                  <Mail className="h-3.5 w-3.5 absolute left-3 top-2.5 text-[#5C636F]" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. maria@horeca.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-[#F1F1ED] border border-[#DFE1DB] rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#1A1D21]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold font-['IBM_Plex_Mono'] text-[#5C636F] uppercase text-[10px] flex items-center justify-between">
                  <span>Linked Google Account (Gmail)</span>
                  <span className="text-[#FF6A3D] text-[9px] font-normal">Receives OTP</span>
                </label>
                <div className="relative">
                  <Shield className="h-3.5 w-3.5 absolute left-3 top-2.5 text-[#FF6A3D]" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. maria.santos@gmail.com"
                    value={formGoogleAccount}
                    onChange={(e) => setFormGoogleAccount(e.target.value)}
                    className="w-full bg-[#F1F1ED] border border-[#DFE1DB] rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#1A1D21]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold font-['IBM_Plex_Mono'] text-[#5C636F] uppercase text-[10px]">
                  Initial Password
                </label>
                <div className="relative">
                  <Lock className="h-3.5 w-3.5 absolute left-3 top-2.5 text-[#5C636F]" />
                  <input
                    type={showFormPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full bg-[#F1F1ED] border border-[#DFE1DB] rounded-lg pl-9 pr-9 py-2 text-xs focus:outline-none focus:border-[#1A1D21]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowFormPassword(!showFormPassword)}
                    className="absolute right-3 top-2 text-[#5C636F] hover:text-[#1A1D21] cursor-pointer"
                  >
                    {showFormPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold font-['IBM_Plex_Mono'] text-[#5C636F] uppercase text-[10px]">
                  System Role
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as any)}
                  className="w-full bg-[#F1F1ED] border border-[#DFE1DB] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1A1D21]"
                >
                  <option value="admin">Standard Administrator (Maker / Queue Actions)</option>
                  <option value="superadmin">Super Administrator (Full Master / Approver)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-[#1A1D21] hover:bg-[#2A2E34] text-white py-2.5 rounded-lg font-['IBM_Plex_Mono'] font-bold text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-xs mt-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>Create &amp; Register Account</span>
              </button>
            </form>
          </div>

          {/* Super Admin Unmask Password Management Card */}
          <div className="bg-white border border-[#DFE1DB] rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#DFE1DB] pb-3">
              <KeyRound className="h-5 w-5 text-[#8A5A00]" />
              <div>
                <h3 className="text-sm font-bold font-['Archivo'] text-[#1A1D21]">
                  Unmask Data Password Control
                </h3>
                <p className="text-[11px] text-[#5C636F] font-['IBM_Plex_Mono']">
                  Super Admin Configurable Password
                </p>
              </div>
            </div>

            {unmaskSuccess && (
              <div className="bg-[#157A4D]/10 border border-[#157A4D]/30 text-[#157A4D] p-3 rounded-lg text-xs font-['IBM_Plex_Mono'] flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{unmaskSuccess}</span>
              </div>
            )}

            <div className="bg-[#FBFBFA] border border-[#DFE1DB] rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-['IBM_Plex_Mono'] font-bold text-[#5C636F] uppercase">
                  Current Authorization Status:
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-['IBM_Plex_Mono'] font-bold border border-emerald-200">
                  Configured &amp; Active
                </span>
              </div>
              <div className="flex items-center justify-between bg-white border border-[#DFE1DB] px-3 py-2 rounded-md font-['IBM_Plex_Mono'] text-xs font-bold text-[#1A1D21]">
                <span className="text-[#5C636F] font-normal">Current Password:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm tracking-wider">
                    {showUnmaskPass ? unmaskPassword : "••••••••••••"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowUnmaskPass(!showUnmaskPass)}
                    className="text-[#5C636F] hover:text-[#1A1D21] cursor-pointer p-0.5"
                    title={showUnmaskPass ? "Hide password" : "Show password"}
                  >
                    {showUnmaskPass ? <EyeOff className="h-3.5 w-3.5 text-[#FF6A3D]" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveUnmaskPassword} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold font-['IBM_Plex_Mono'] text-[#5C636F] uppercase text-[10px]">
                  Set New Unmask Password
                </label>
                <div className="relative">
                  <input
                    type={showNewUnmaskPass ? "text" : "password"}
                    required
                    placeholder="Enter new unmask password"
                    value={newUnmaskPass}
                    onChange={(e) => setNewUnmaskPass(e.target.value)}
                    className="w-full bg-[#F1F1ED] border border-[#DFE1DB] rounded-lg pl-3 pr-10 py-2 text-xs focus:outline-none focus:border-[#1A1D21] font-['IBM_Plex_Mono']"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewUnmaskPass(!showNewUnmaskPass)}
                    className="absolute right-3 top-2.5 text-[#5C636F] hover:text-[#1A1D21] cursor-pointer p-0.5 rounded"
                    title={showNewUnmaskPass ? "Hide password" : "Show password"}
                  >
                    {showNewUnmaskPass ? <EyeOff className="h-3.5 w-3.5 text-[#FF6A3D]" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#8A5A00] hover:bg-[#734B00] text-white py-2 rounded-lg font-['IBM_Plex_Mono'] font-bold text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-xs"
              >
                <KeyRound className="h-4 w-4" />
                <span>Save New Unmask Password</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Table of Users Who Can Access the Financial System */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-[#DFE1DB] rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#DFE1DB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FBFBFA]">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#B53A1E]" />
                <h3 className="text-sm font-bold font-['Archivo'] text-[#1A1D21]">
                  Authorized Financial System Users ({filteredUsers.length})
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-[#F1F1ED] border border-[#DFE1DB] rounded-lg px-2.5 py-1 text-xs font-['IBM_Plex_Mono'] focus:outline-none"
                >
                  <option value="all">All Roles</option>
                  <option value="superadmin">Super Admin</option>
                  <option value="admin">Standard Admin</option>
                </select>

                <input
                  type="text"
                  placeholder="Search user, email, gmail..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#F1F1ED] border border-[#DFE1DB] rounded-lg px-3 py-1 text-xs focus:outline-none w-44"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F1F1ED] text-[#5C636F] font-['IBM_Plex_Mono'] border-b border-[#DFE1DB]">
                    <th className="p-3">User &amp; Full Name</th>
                    <th className="p-3">System Login Email</th>
                    <th className="p-3">Linked Google Account</th>
                    <th className="p-3">Role &amp; Permissions</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">2FA OTP</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFE1DB]">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-[#5C636F]">
                        No authorized users found matching your search query.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-[#FBFBFA]">
                        <td className="p-3">
                          <div className="flex items-center space-x-2.5">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                                user.role === "superadmin" ? "bg-[#B53A1E]" : "bg-[#1A1D21]"
                              }`}
                            >
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-[#1A1D21]">
                                {isDataMasked ? maskField(user.name, "name") : user.name}
                              </div>
                              <div className="text-[10px] text-[#5C636F] font-['IBM_Plex_Mono']">
                                Added: {user.createdAt}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3 font-['IBM_Plex_Mono'] text-[#1A1D21]">
                          {isDataMasked ? maskField(user.email, "email") : user.email}
                        </td>

                        <td className="p-3">
                          <div className="flex items-center space-x-1.5">
                            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span className="font-['IBM_Plex_Mono'] text-xs font-semibold text-[#1A1D21]">
                              {isDataMasked ? maskField(user.googleAccount, "email") : user.googleAccount}
                            </span>
                          </div>
                          <span className="text-[9px] text-[#5C636F] font-['IBM_Plex_Mono'] block">
                            Dispatches 6-digit OTP
                          </span>
                        </td>

                        <td className="p-3">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-['IBM_Plex_Mono'] font-bold px-2 py-0.5 rounded border ${
                              user.role === "superadmin"
                                ? "bg-red-50 text-[#B53A1E] border-red-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            <Shield className="h-3 w-3" />
                            {user.role === "superadmin" ? "Super Admin" : "Standard Admin"}
                          </span>
                        </td>

                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => onToggleUserStatus(user.id)}
                            disabled={user.role === "superadmin"}
                            className={`inline-flex items-center gap-1 text-[10px] font-['IBM_Plex_Mono'] font-bold px-2 py-0.5 rounded-full border cursor-pointer ${
                              user.status === "active"
                                ? "bg-emerald-50 text-[#157A4D] border-emerald-200 hover:bg-emerald-100"
                                : "bg-red-50 text-[#B5281A] border-red-200 hover:bg-red-100"
                            }`}
                            title="Click to toggle active/suspended status"
                          >
                            {user.status === "active" ? (
                              <>
                                <CheckCircle2 className="h-3 w-3" />
                                <span>Active</span>
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="h-3 w-3" />
                                <span>Suspended</span>
                              </>
                            )}
                          </button>
                        </td>

                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 text-[10px] font-['IBM_Plex_Mono'] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <Check className="h-3 w-3" />
                            <span>Gmail Linked</span>
                          </span>
                        </td>

                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              type="button"
                              onClick={() => onResetUserOtp(user.id)}
                              title="Reset OTP & Dispatch Email Code"
                              className="p-1.5 bg-[#F1F1ED] hover:bg-[#DFE1DB] text-[#1A1D21] rounded-lg transition-colors cursor-pointer"
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                            </button>
                            {user.role !== "superadmin" && (
                              <button
                                type="button"
                                onClick={() => onDeleteUser(user.id)}
                                title="Remove User Account"
                                className="p-1.5 bg-[#B5281A]/10 hover:bg-[#B5281A] hover:text-white text-[#B5281A] rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
