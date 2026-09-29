import React, { useState, useEffect } from "react";
import {
  Truck,
  Fuel,
  Wrench,
  DollarSign,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  ArrowRight,
  ShieldCheck,
  Send,
  Zap,
  Calendar,
  Building2,
  FileCheck
} from "lucide-react";
import { fmsBridge, FmsPacket } from "../../src/services/fmsBridge";

interface VehicleLogItem {
  id: string;
  plateNumber: string;
  vehicleName: string;
  driverName: string;
  costCenter: string;
  fuelExpense: number;
  tollExpense: number;
  fuelCardRef: string;
  totalTripExpense: number;
}

const INITIAL_FLEET_LOGS: VehicleLogItem[] = [
  {
    id: "FLT-01",
    plateNumber: "NAA-8821",
    vehicleName: "Refrigerated Meat & Seafood Van 01",
    driverName: "Danilo Ramos",
    costCenter: "CC-301: F&B / Restaurant Logistics",
    fuelExpense: 4500,
    tollExpense: 1200,
    fuelCardRef: "Petron FleetCard #88921",
    totalTripExpense: 5700,
  },
  {
    id: "FLT-02",
    plateNumber: "NBX-3012",
    vehicleName: "Hotel Airport VIP Shuttle Van",
    driverName: "Eduardo Cruz",
    costCenter: "CC-102: Hotel Guest Operations",
    fuelExpense: 3800,
    tollExpense: 950,
    fuelCardRef: "Shell FleetCard #10293",
    totalTripExpense: 4750,
  },
  {
    id: "FLT-03",
    plateNumber: "NCY-9944",
    vehicleName: "Palengke & Fresh Produce Utility Truck",
    driverName: "Ramon Villanueva",
    costCenter: "CC-301: F&B / Restaurant Logistics",
    fuelExpense: 5200,
    tollExpense: 650,
    fuelCardRef: "Petron FleetCard #88922",
    totalTripExpense: 5850,
  },
];

interface MaintenanceWorkOrder {
  id: string;
  vehiclePlate: string;
  serviceCenter: string;
  workDescription: string;
  estimatedCost: number;
  priority: "High" | "Routine";
  status: "Draft (Pending FMS Approval)" | "Approved" | "Work Completed";
  costCenter: string;
}

const INITIAL_WORK_ORDERS: MaintenanceWorkOrder[] = [
  {
    id: "WO-FLT-2026-08",
    vehiclePlate: "NAA-8821 (Refrigerated Van)",
    serviceCenter: "Toyota Pasay Commercial Hub",
    workDescription: "Brake pad replacement, Thermo King refrigeration compressor overhaul, and transmission fluid replacement",
    estimatedCost: 24000,
    priority: "High",
    status: "Draft (Pending FMS Approval)",
    costCenter: "F&B / Restaurant Logistics",
  },
  {
    id: "WO-FLT-2026-09",
    vehiclePlate: "NBX-3012 (Airport Shuttle)",
    serviceCenter: "Nissan Manila Bay Service",
    workDescription: "Scheduled 40,000 KM Periodic Maintenance Service, tire alignment & suspension tuning",
    estimatedCost: 12000,
    priority: "Routine",
    status: "Draft (Pending FMS Approval)",
    costCenter: "Hotel Guest Operations",
  },
];

interface SimpleDashboardProps {
  onNavigateToFms?: (tab?: string) => void;
}

export default function SimpleDashboard({ onNavigateToFms }: SimpleDashboardProps) {
  const [activeTab, setActiveTab] = useState<"fuel_toll" | "maintenance" | "depreciation">("fuel_toll");
  const [fleetLogs] = useState<VehicleLogItem[]>(INITIAL_FLEET_LOGS);
  const [workOrders, setWorkOrders] = useState<MaintenanceWorkOrder[]>(INITIAL_WORK_ORDERS);

  // TAB 3: Depreciation & Cost Center Chargeback State
  const [fleetAssetValuation] = useState<number>(4800000); // ₱4.8M original fleet value
  const [depreciationMonths] = useState<number>(60); // 5-year straight line
  const monthlyDepreciation = fleetAssetValuation / depreciationMonths; // ₱80,000 / month
  const [restoChargebackPct, setRestoChargebackPct] = useState<number>(68.75); // ₱55,000
  const restoChargebackAmount = Math.round(monthlyDepreciation * (restoChargebackPct / 100));
  const hotelChargebackAmount = monthlyDepreciation - restoChargebackAmount; // ₱25,000

  // FMS Interop State
  const [fmsStatus, setFmsStatus] = useState<any>(fmsBridge.getCurrentFmsMetrics());
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [transmissionLogs, setTransmissionLogs] = useState<FmsPacket[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTransmissionLogs(fmsBridge.getTransmissionLogs("FleetOps"));
    const handleSync = () => {
      setTransmissionLogs(fmsBridge.getTransmissionLogs("FleetOps"));
      setFmsStatus(fmsBridge.getCurrentFmsMetrics());
    };
    window.addEventListener("fms-sync-event", handleSync);
    return () => window.removeEventListener("fms-sync-event", handleSync);
  }, []);

  const totalFuel = fleetLogs.reduce((s, l) => s + l.fuelExpense, 0);
  const totalTolls = fleetLogs.reduce((s, l) => s + l.tollExpense, 0);
  const totalFuelAndTolls = totalFuel + totalTolls;
  const totalMaintenanceQueued = workOrders.reduce((s, w) => s + w.estimatedCost, 0);

  // ACTION 1: Fuel & Toll Expense Automation
  const handleAutoDraftFuelExpenses = () => {
    setIsSubmitting(true);
    const expRef = `EXP-FLT-${Date.now().toString().slice(-4)}`;

    // 1. Update FMS Cash Pool
    fmsBridge.updateCashPool({
      bankOperating: -totalFuelAndTolls,
      reason: `Fleet Fuel Card (Petron/Shell) & AutoSweep RFID Direct Debit: ₱${totalFuelAndTolls.toLocaleString()}`,
      sourceModule: "FleetOps",
    });

    // 2. Post Balanced Double-Entry in General Ledger
    fmsBridge.postJournalEntry({
      sourceModule: "FleetOps",
      ref: expRef,
      memo: `Automated Fleet Fuel & Tollway Ingestion for 3 Commercial Vehicles`,
      lines: [
        {
          accountCode: "5210",
          accountName: "5210 - Vehicle Fuel, Petroleum & Fleet Operating Expenses",
          debit: totalFuel,
          credit: 0,
          memo: `Fuel card charges (Petron/Shell)`,
        },
        {
          accountCode: "5215",
          accountName: "5215 - Tollway & Highway Electronic RFID Expenses",
          debit: totalTolls,
          credit: 0,
          memo: `AutoSweep & EasyTrip highway tolls`,
        },
        {
          accountCode: "1030",
          accountName: "1030 - Operating Bank Account - Primary (Fleet Direct Debit)",
          debit: 0,
          credit: totalFuelAndTolls,
          memo: `Fleet commercial card auto-debit payout`,
        },
      ],
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setActionSuccessMessage(
        `Fleet Expenses [${expRef}] posted! Fuel (₱${totalFuel.toLocaleString()}) & Tolls (₱${totalTolls.toLocaleString()}) debited to operational cost centers in FMS.`
      );
      setFmsStatus(fmsBridge.getCurrentFmsMetrics());
    }, 400);
  };

  // ACTION 2: Vehicle Maintenance Work Orders into Approval Queue
  const handleQueueMaintenanceWorkOrder = (order: MaintenanceWorkOrder) => {
    setIsSubmitting(true);

    fmsBridge.submitApprovalRequest({
      sourceModule: "FleetOps",
      actionType: "APPROVE_VEHICLE_MAINTENANCE_DISBURSEMENT",
      title: `Vehicle Service Work Order [${order.id}]: ${order.vehiclePlate}`,
      amount: order.estimatedCost,
      requestedBy: "Fleet Logistics Operations Lead",
      impactSummary: `Authorize Purchase Request & AP disbursement of ₱${order.estimatedCost.toLocaleString()} to ${order.serviceCenter} for: "${order.workDescription}". Allocated to Cost Center ${order.costCenter}.`,
      payload: {
        workOrderId: order.id,
        vehiclePlate: order.vehiclePlate,
        serviceCenter: order.serviceCenter,
        workDescription: order.workDescription,
        amount: order.estimatedCost,
        costCenter: order.costCenter,
      },
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setActionSuccessMessage(
        `Maintenance Work Order [${order.id}] converted to AP Disbursement and dispatched to FMS Super Admin Approval Queue!`
      );
      setFmsStatus(fmsBridge.getCurrentFmsMetrics());
    }, 400);
  };

  // ACTION 3: Asset Depreciation & Cost Center Chargebacks
  const handlePostDepreciationChargeback = () => {
    setIsSubmitting(true);
    const depRef = `DEP-FLT-${new Date().toISOString().split("T")[0].substring(0, 7)}`;

    // Post multi-leg entry charging back delivery costs directly to the Resto/F&B Cost Center
    fmsBridge.postJournalEntry({
      sourceModule: "FleetOps",
      ref: depRef,
      memo: `Commercial Vehicle Depreciation & Logistics Chargeback (Resto: ₱${restoChargebackAmount.toLocaleString()} | Hotel: ₱${hotelChargebackAmount.toLocaleString()})`,
      lines: [
        {
          accountCode: "5200",
          accountName: "5200 - F&B Delivery & Restaurant Logistics Cost Center Allocation",
          debit: restoChargebackAmount,
          credit: 0,
          memo: `Resto chargeback for fresh produce & food delivery logistics (${restoChargebackPct}%)`,
        },
        {
          accountCode: "5205",
          accountName: "5205 - Hotel Guest Shuttle & VIP Transport Cost Center Allocation",
          debit: hotelChargebackAmount,
          credit: 0,
          memo: `Hotel chargeback for airport shuttle operations (${(100 - restoChargebackPct).toFixed(2)}%)`,
        },
        {
          accountCode: "1510",
          accountName: "1510 - Accumulated Depreciation - Commercial Vehicles & Shuttles",
          debit: 0,
          credit: monthlyDepreciation,
          memo: `Monthly straight-line asset depreciation credit`,
        },
      ],
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setActionSuccessMessage(
        `Monthly Depreciation [${depRef}] auto-posted! ₱${restoChargebackAmount.toLocaleString()} charged back directly to F&B/Resto Cost Center in FMS GL.`
      );
      setFmsStatus(fmsBridge.getCurrentFmsMetrics());
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1D21] p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="bg-emerald-600 text-white p-3 rounded-xl shadow-md">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Subsystem 05 / Operational Module
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  FMS Live Connected
                </span>
              </div>
              <h1 className="text-2xl font-black font-['Archivo'] tracking-tight text-slate-900 mt-1">
                Fleet Operations &amp; Logistics Management
              </h1>
              <p className="text-xs text-slate-500 font-['IBM_Plex_Mono']">
                Automated Fuel/Toll Ingestion, Maintenance AP Disbursements &amp; Cost Center Chargebacks to Resto
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onNavigateToFms && (
              <button
                onClick={() => onNavigateToFms("gl")}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold font-['IBM_Plex_Mono'] rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <span>View FMS General Ledger</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Success Alert Banner */}
        {actionSuccessMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-xl text-xs font-['IBM_Plex_Mono'] flex items-start justify-between shadow-xs animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold">FMS Interoperability Sync Confirmed:</span> {actionSuccessMessage}
              </div>
            </div>
            <button
              onClick={() => setActionSuccessMessage(null)}
              className="text-emerald-700 hover:text-emerald-950 font-bold ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
              <span>Fuel &amp; Toll Ingestion</span>
              <Fuel className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black font-['IBM_Plex_Mono'] text-slate-900 mt-2">
              ₱{totalFuelAndTolls.toLocaleString()}
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-['IBM_Plex_Mono']">
              <span>Fuel: ₱{totalFuel.toLocaleString()}</span>
              <span className="text-emerald-700 font-bold">Tolls: ₱{totalTolls.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
              <span>Maintenance Work Orders</span>
              <Wrench className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black font-['IBM_Plex_Mono'] text-slate-900 mt-2">
              ₱{totalMaintenanceQueued.toLocaleString()}
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-['IBM_Plex_Mono']">
              <span>AP Approval Queue</span>
              <span className="text-amber-700 font-bold">{workOrders.length} Work Orders</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
              <span>Monthly Depreciation</span>
              <TrendingDown className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black font-['IBM_Plex_Mono'] text-blue-700 mt-2">
              ₱{monthlyDepreciation.toLocaleString()}
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-['IBM_Plex_Mono']">
              <span>5-Yr Straight Line</span>
              <span className="text-blue-700 font-bold">Account 1510</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
              <span>Resto F&amp;B Chargeback</span>
              <Building2 className="h-4 w-4 text-purple-600" />
            </div>
            <p className="text-2xl font-black font-['IBM_Plex_Mono'] text-purple-700 mt-2">
              ₱{restoChargebackAmount.toLocaleString()}
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-['IBM_Plex_Mono']">
              <span>Cost Center #CC-301</span>
              <span className="text-purple-700 font-bold">{restoChargebackPct}% Share</span>
            </div>
          </div>
        </div>

        {/* Action Tabs Header */}
        <div className="flex border-b border-slate-200 gap-2">
          <button
            onClick={() => setActiveTab("fuel_toll")}
            className={`px-4 py-2.5 text-xs font-bold font-['IBM_Plex_Mono'] rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "fuel_toll"
                ? "bg-white text-emerald-700 border-t-2 border-emerald-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Fuel className="h-3.5 w-3.5" />
            <span>1. Fuel &amp; Toll Expense Automation</span>
          </button>

          <button
            onClick={() => setActiveTab("maintenance")}
            className={`px-4 py-2.5 text-xs font-bold font-['IBM_Plex_Mono'] rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "maintenance"
                ? "bg-white text-amber-700 border-t-2 border-amber-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Wrench className="h-3.5 w-3.5" />
            <span>2. Vehicle Maintenance Work Orders</span>
          </button>

          <button
            onClick={() => setActiveTab("depreciation")}
            className={`px-4 py-2.5 text-xs font-bold font-['IBM_Plex_Mono'] rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "depreciation"
                ? "bg-white text-purple-700 border-t-2 border-purple-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>3. Asset Depreciation &amp; Resto Chargebacks</span>
          </button>
        </div>

        {/* TAB 1: FUEL & TOLL EXPENSE AUTOMATION */}
        {activeTab === "fuel_toll" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-200 gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-['Archivo']">
                  Automated Fuel &amp; Toll Expense Ingestion
                </h2>
                <p className="text-xs text-slate-500 font-['IBM_Plex_Mono'] mt-0.5">
                  Ingests Petron / Shell commercial fleet card charges and AutoSweep RFID tollways, auto-drafting balanced expenses to departmental cost centers.
                </p>
              </div>
              <button
                onClick={handleAutoDraftFuelExpenses}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-['IBM_Plex_Mono'] rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <Zap className="h-4 w-4" />
                <span>Auto-Draft Expenses to FMS GL &amp; Treasury</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-['IBM_Plex_Mono']">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <th className="py-2.5 px-3">Fleet Unit / Plate</th>
                    <th className="py-2.5 px-3">Assigned Driver</th>
                    <th className="py-2.5 px-3">Target Cost Center</th>
                    <th className="py-2.5 px-3">Fleet Card Reference</th>
                    <th className="py-2.5 px-3 text-right">Fuel Expense</th>
                    <th className="py-2.5 px-3 text-right">Tollway RFID</th>
                    <th className="py-2.5 px-3 text-right font-bold text-emerald-800">Total Run</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fleetLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-slate-900 block">{log.vehicleName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{log.plateNumber}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">{log.driverName}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                          {log.costCenter}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">{log.fuelCardRef}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">₱{log.fuelExpense.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right text-slate-700">₱{log.tollExpense.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-black text-emerald-800 bg-emerald-50/40">
                        ₱{log.totalTripExpense.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                    <td colSpan={4} className="py-3 px-3 uppercase">Total Operational Logistics Run</td>
                    <td className="py-3 px-3 text-right text-slate-900">₱{totalFuel.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right text-slate-900">₱{totalTolls.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right text-emerald-800 text-sm font-black">
                      ₱{totalFuelAndTolls.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: VEHICLE MAINTENANCE WORK ORDERS */}
        {activeTab === "maintenance" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-200 gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-['Archivo']">
                  Vehicle Maintenance &amp; Repair Work Orders
                </h2>
                <p className="text-xs text-slate-500 font-['IBM_Plex_Mono'] mt-0.5">
                  Converts service work orders into Purchase Requests and Accounts Payable disbursements routed to the FMS Super Admin Approval Queue.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {workOrders.map((wo) => (
                <div
                  key={wo.id}
                  className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 font-['IBM_Plex_Mono'] text-sm">{wo.id}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 font-['IBM_Plex_Mono']">
                        {wo.status}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 font-['IBM_Plex_Mono']">
                        Priority: {wo.priority}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-800 font-['IBM_Plex_Mono']">
                      Vehicle: {wo.vehiclePlate} • Vendor: {wo.serviceCenter}
                    </p>

                    <p className="text-xs text-slate-600 font-['IBM_Plex_Mono'] max-w-2xl">
                      Scope: {wo.workDescription}
                    </p>

                    <p className="text-[11px] text-slate-400 font-['IBM_Plex_Mono']">
                      Chargeback Target: <span className="font-bold text-slate-700">{wo.costCenter}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-['IBM_Plex_Mono'] uppercase block">Estimated Work Cost</span>
                      <span className="text-xl font-black font-['IBM_Plex_Mono'] text-slate-900">
                        ₱{wo.estimatedCost.toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => handleQueueMaintenanceWorkOrder(wo)}
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold font-['IBM_Plex_Mono'] rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span>Queue for Super Admin Approval</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ASSET DEPRECIATION & RESTO CHARGEBACKS */}
        {activeTab === "depreciation" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-200 gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-['Archivo']">
                  Vehicle Depreciation &amp; Restaurant Logistics Chargebacks
                </h2>
                <p className="text-xs text-slate-500 font-['IBM_Plex_Mono'] mt-0.5">
                  Calculates monthly commercial vehicle fleet depreciation and charges back logistics delivery costs directly to the Restaurant / F&amp;B Cost Center.
                </p>
              </div>
              <button
                onClick={handlePostDepreciationChargeback}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold font-['IBM_Plex_Mono'] rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <Building2 className="h-4 w-4" />
                <span>Auto-Post Depreciation &amp; Resto Chargeback</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold uppercase text-slate-500 font-['IBM_Plex_Mono'] block">
                  Fleet Fixed Asset Valuation (₱)
                </span>
                <p className="text-xl font-black font-['IBM_Plex_Mono'] text-slate-900 mt-2">
                  ₱{fleetAssetValuation.toLocaleString()}
                </p>
                <span className="text-[10px] text-slate-400 font-['IBM_Plex_Mono'] block mt-1">
                  4 Commercial Shuttles &amp; Reefer Trucks
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold uppercase text-slate-500 font-['IBM_Plex_Mono'] block">
                  Straight-Line Lifespan
                </span>
                <p className="text-xl font-black font-['IBM_Plex_Mono'] text-slate-900 mt-2">
                  5 Years (60 Months)
                </p>
                <span className="text-[10px] text-slate-400 font-['IBM_Plex_Mono'] block mt-1">
                  Monthly Rate: ₱{monthlyDepreciation.toLocaleString()}/mo
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold uppercase text-slate-500 font-['IBM_Plex_Mono'] block">
                  Resto / F&amp;B Usage Chargeback (%)
                </span>
                <input
                  type="number"
                  value={restoChargebackPct}
                  onChange={(e) => setRestoChargebackPct(Number(e.target.value))}
                  className="w-full mt-2 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-bold font-['IBM_Plex_Mono'] text-purple-700"
                />
              </div>
            </div>

            {/* Chargeback Split Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-purple-50/60 border border-purple-200 rounded-xl space-y-2">
                <span className="text-xs font-bold uppercase text-purple-900 font-['IBM_Plex_Mono'] block">
                  Restaurant / F&amp;B Cost Center Debit (CC-301)
                </span>
                <p className="text-3xl font-black font-['IBM_Plex_Mono'] text-purple-950">
                  ₱{restoChargebackAmount.toLocaleString()}
                </p>
                <p className="text-xs text-purple-700 font-['IBM_Plex_Mono']">
                  Debited to Account 5200 (F&amp;B Delivery &amp; Fresh Produce Sourcing Logistics).
                </p>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-xs font-bold uppercase text-slate-700 font-['IBM_Plex_Mono'] block">
                  Hotel Guest Operations Debit (CC-102)
                </span>
                <p className="text-3xl font-black font-['IBM_Plex_Mono'] text-slate-900">
                  ₱{hotelChargebackAmount.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 font-['IBM_Plex_Mono']">
                  Debited to Account 5205 (Airport Guest Shuttle &amp; VIP Transit).
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs font-['IBM_Plex_Mono']">
              <span className="font-bold text-slate-800 uppercase block mb-1">
                FMS Balanced GL Booking:
              </span>
              <div className="text-slate-600 space-y-0.5">
                <div>DEBIT: 5200 - F&amp;B Delivery Cost Center Allocation (₱{restoChargebackAmount.toLocaleString()})</div>
                <div>DEBIT: 5205 - Hotel Guest Shuttle Cost Center Allocation (₱{hotelChargebackAmount.toLocaleString()})</div>
                <div>CREDIT: 1510 - Accumulated Depreciation - Vehicles (₱{monthlyDepreciation.toLocaleString()})</div>
              </div>
            </div>
          </div>
        )}

        {/* FMS Transmission Logs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider font-['IBM_Plex_Mono'] text-slate-700">
                FMS Outbox Transmission Log (FleetOps Subsystem)
              </h3>
            </div>
            <span className="text-[11px] font-bold font-['IBM_Plex_Mono'] text-slate-500">
              Master GL Balanced Entries: {fmsStatus?.glEntriesCount || 0}
            </span>
          </div>

          <div className="mt-3 space-y-2">
            {transmissionLogs.length === 0 ? (
              <p className="text-xs text-slate-400 font-['IBM_Plex_Mono'] py-3 text-center">
                No outbound fleet packets logged yet. Ingest fuel expenses or post depreciation chargeback above.
              </p>
            ) : (
              transmissionLogs.slice(0, 5).map((pkt) => (
                <div
                  key={pkt.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-['IBM_Plex_Mono'] gap-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      {pkt.targetSystem}
                    </span>
                    <span className="font-bold text-slate-800">{pkt.action}</span>
                    <span className="text-slate-500">— {pkt.summary}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-[11px] shrink-0">
                    {pkt.amount !== undefined && (
                      <span className="font-bold text-slate-900">₱{pkt.amount.toLocaleString()}</span>
                    )}
                    <span>{pkt.timestamp}</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      {pkt.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
