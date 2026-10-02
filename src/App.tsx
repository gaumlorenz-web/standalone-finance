import React, { useState, useEffect } from "react";
import FinancialManagementSystem from "../Finance/page";
import HrPayrollDashboard from "../HR-Payroll/components/SimpleDashboard";
import HotelMngtDashboard from "../Hotel-MNGT/components/SimpleDashboard";
import RestoMngtDashboard from "../Resto-MNGT/components/SimpleDashboard";
import SupplyChainDashboard from "../Supply-Chain/components/SimpleDashboard";
import FleetOpsDashboard from "../FleetOps/components/SimpleDashboard";
import SubsystemLoginPage from "./components/SubsystemLoginPage";
import { SUBSYSTEM_ACCOUNTS, SubsystemSession } from "./services/subsystemAuth";
import {
  Landmark,
  Activity,
  LogOut,
} from "lucide-react";

type SubsystemType = "finance" | "hr_payroll" | "hotel_mngt" | "resto_mngt" | "supply_chain" | "fleet_ops";

export default function App() {
  const [activeSubsystem, setActiveSubsystem] = useState<SubsystemType>(() => {
    try {
      // Clear legacy shared localStorage so tabs are completely independent
      localStorage.removeItem("horeca_active_subsystem");
      ["hr_payroll", "hotel_mngt", "resto_mngt", "supply_chain", "fleet_ops"].forEach((id) => {
        localStorage.removeItem(`horeca_subsystem_session_${id}`);
      });

      const saved = sessionStorage.getItem("horeca_active_subsystem");
      if (saved && ["finance", "hr_payroll", "hotel_mngt", "resto_mngt", "supply_chain", "fleet_ops"].includes(saved)) {
        return saved as SubsystemType;
      }
    } catch (e) {}
    return "finance";
  });

  const [fmsTargetTab, setFmsTargetTab] = useState<string | undefined>(undefined);

  // Subsystem sessions: Map of subsystemId -> SubsystemSession | null (isolated per browser tab)
  const [subsystemSessions, setSubsystemSessions] = useState<Record<string, SubsystemSession | null>>(() => {
    const loaded: Record<string, SubsystemSession | null> = {
      hr_payroll: null,
      hotel_mngt: null,
      resto_mngt: null,
      supply_chain: null,
      fleet_ops: null,
    };
    ["hr_payroll", "hotel_mngt", "resto_mngt", "supply_chain", "fleet_ops"].forEach((id) => {
      try {
        const item = sessionStorage.getItem(`horeca_subsystem_session_${id}`);
        if (item) {
          loaded[id] = JSON.parse(item);
        }
      } catch (e) {}
    });
    return loaded;
  });

  useEffect(() => {
    try {
      sessionStorage.setItem("horeca_active_subsystem", activeSubsystem);
    } catch (e) {}
  }, [activeSubsystem]);

  const handleNavigateToFms = (tab?: string) => {
    if (tab) {
      setFmsTargetTab(tab);
    }
    setActiveSubsystem("finance");
  };

  const handleSubsystemLoginSuccess = (session: SubsystemSession) => {
    try {
      sessionStorage.setItem(`horeca_subsystem_session_${session.subsystemId}`, JSON.stringify(session));
    } catch (e) {}
    setSubsystemSessions((prev) => ({
      ...prev,
      [session.subsystemId]: session
    }));
  };

  const [subsystemLogoutConfirm, setSubsystemLogoutConfirm] = useState<string | null>(null);

  const handleSubsystemLogout = (subsystemId: string) => {
    try {
      sessionStorage.removeItem(`horeca_subsystem_session_${subsystemId}`);
    } catch (e) {}
    setSubsystemSessions((prev) => ({
      ...prev,
      [subsystemId]: null
    }));
    setSubsystemLogoutConfirm(null);
  };

  const currentOperationalSession = activeSubsystem !== "finance" ? subsystemSessions[activeSubsystem] : null;
  const currentOperationalAccount = activeSubsystem !== "finance" ? SUBSYSTEM_ACCOUNTS[activeSubsystem] : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#1A1D21]">
      {/* Enterprise Multi-Subsystem Top Navigation Bar */}
      <div className="bg-[#111317] border-b border-[#24272F] px-4 py-2 shrink-0 z-50 flex items-center justify-between gap-2 shadow-sm text-xs font-['IBM_Plex_Mono']">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveSubsystem("finance")}
            className="flex items-center space-x-2 text-left cursor-pointer group"
            title="Return to Financial Management (FMS Core)"
          >
            <span className="font-bold text-slate-100 group-hover:text-amber-400 tracking-wider font-['Archivo'] text-sm uppercase transition-colors">
              HORECA ENTERPRISE ECOSYSTEM
            </span>
          </button>
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
            <Activity className="h-3 w-3 animate-pulse" />
            <span>Real-Time Interoperability Bus</span>
          </span>
        </div>

        {/* Current Active Subsystem Session Status & Controls */}
        <div className="flex items-center gap-2">
          {activeSubsystem !== "finance" && (
            <button
              onClick={() => handleNavigateToFms()}
              className="px-2.5 py-1 bg-[#1E222A] hover:bg-[#2A2E34] text-slate-300 hover:text-white rounded text-xs font-['IBM_Plex_Mono'] border border-white/10 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Landmark className="h-3.5 w-3.5 text-amber-500" />
              <span>Return to FMS Core</span>
            </button>
          )}

          {activeSubsystem !== "finance" && currentOperationalSession && currentOperationalAccount && (
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-[11px] font-bold text-slate-200">
                  {currentOperationalSession.officerName}
                </span>
                <span className="text-[9px] text-slate-400">
                  {currentOperationalSession.email}
                </span>
              </div>
              <button
                onClick={() => setSubsystemLogoutConfirm(activeSubsystem)}
                title="Sign out of this subsystem"
                className="px-2 py-1 bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 rounded text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <LogOut className="h-3 w-3" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Render Active Subsystem Workspace */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeSubsystem === "finance" && (
          <FinancialManagementSystem
            onSwitchSubsystem={(sub) => setActiveSubsystem(sub as SubsystemType)}
            targetTab={fmsTargetTab}
          />
        )}

        {/* HR-Payroll Subsystem */}
        {activeSubsystem === "hr_payroll" && (
          subsystemSessions.hr_payroll ? (
            <HrPayrollDashboard onNavigateToFms={handleNavigateToFms} />
          ) : (
            <SubsystemLoginPage
              subsystemId="hr_payroll"
              onLoginSuccess={handleSubsystemLoginSuccess}
              onNavigateToFms={() => handleNavigateToFms()}
            />
          )
        )}

        {/* Hotel-MNGT Subsystem */}
        {activeSubsystem === "hotel_mngt" && (
          subsystemSessions.hotel_mngt ? (
            <HotelMngtDashboard onNavigateToFms={handleNavigateToFms} />
          ) : (
            <SubsystemLoginPage
              subsystemId="hotel_mngt"
              onLoginSuccess={handleSubsystemLoginSuccess}
              onNavigateToFms={() => handleNavigateToFms()}
            />
          )
        )}

        {/* Resto-MNGT Subsystem */}
        {activeSubsystem === "resto_mngt" && (
          subsystemSessions.resto_mngt ? (
            <RestoMngtDashboard onNavigateToFms={handleNavigateToFms} />
          ) : (
            <SubsystemLoginPage
              subsystemId="resto_mngt"
              onLoginSuccess={handleSubsystemLoginSuccess}
              onNavigateToFms={() => handleNavigateToFms()}
            />
          )
        )}

        {/* Supply-Chain Subsystem */}
        {activeSubsystem === "supply_chain" && (
          subsystemSessions.supply_chain ? (
            <SupplyChainDashboard onNavigateToFms={handleNavigateToFms} />
          ) : (
            <SubsystemLoginPage
              subsystemId="supply_chain"
              onLoginSuccess={handleSubsystemLoginSuccess}
              onNavigateToFms={() => handleNavigateToFms()}
            />
          )
        )}

        {/* FleetOps Subsystem */}
        {activeSubsystem === "fleet_ops" && (
          subsystemSessions.fleet_ops ? (
            <FleetOpsDashboard onNavigateToFms={handleNavigateToFms} />
          ) : (
            <SubsystemLoginPage
              subsystemId="fleet_ops"
              onLoginSuccess={handleSubsystemLoginSuccess}
              onNavigateToFms={() => handleNavigateToFms()}
            />
          )
        )}
      </div>

      {/* Subsystem Logout Confirmation Modal */}
      {subsystemLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#DFE1DB] shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 text-red-700 rounded-xl">
                <LogOut className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-base font-['Archivo'] text-[#1A1D21]">
                  Sign Out of Subsystem
                </h3>
                <p className="text-xs text-[#5C636F] font-['IBM_Plex_Mono']">
                  {SUBSYSTEM_ACCOUNTS[subsystemLogoutConfirm]?.subsystemName || "Operational Subsystem"}
                </p>
              </div>
            </div>

            <p className="text-xs text-[#5C636F] leading-relaxed font-['IBM_Plex_Sans']">
              Are you sure you want to sign out of this operational subsystem? Your session credentials will be cleared and you will need to log back in.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 font-['IBM_Plex_Mono']">
              <button
                type="button"
                onClick={() => setSubsystemLogoutConfirm(null)}
                className="px-4 py-2 border border-[#DFE1DB] hover:bg-[#F1F1ED] text-[#1A1D21] rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSubsystemLogout(subsystemLogoutConfirm)}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Confirm Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

