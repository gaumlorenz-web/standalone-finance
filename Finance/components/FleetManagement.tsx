import React, { useState, useMemo } from "react";
import {
  Truck,
  Car,
  Navigation,
  Fuel,
  Users,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  MapPin,
  Route,
  Smartphone,
  Calendar,
  DollarSign,
  Activity,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  BarChart3,
  Gauge
} from "lucide-react";
import PesoSign from "./PesoSign";
import ExportButton from "./ExportButton";

export interface FleetVehicle {
  id: string;
  plateNumber: string;
  model: string;
  type: "Refrigerated Commissary Van" | "Heavy Logistics Truck" | "VIP Guest Airport Shuttle" | "Executive Sedan";
  assignedDriver: string;
  odometerKm: number;
  fuelType: "Diesel" | "Unleaded";
  fuelEfficiencyKmL: number;
  status: "Active / On Route" | "Idle / Available" | "Maintenance" | "Dispatched";
  acquisitionCost: number;
  monthlyDepreciation: number;
  lastServiceDate: string;
}

export interface DispatchTrip {
  id: string;
  vehicleId: string;
  plateNumber: string;
  driverName: string;
  route: string;
  departureTime: string;
  estimatedArrival: string;
  cargoDescription: string;
  cargoWeightKg: number;
  distanceKm: number;
  tollFeePHP: number;
  fuelEstimatedLiters: number;
  status: "Dispatched" | "In Transit" | "Delivered / Completed" | "Scheduled";
  billableArAmount: number;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  plateNumber: string;
  driverName: string;
  station: string;
  liters: number;
  pricePerLiter: number;
  totalCostPHP: number;
  odometerKm: number;
  date: string;
  paymentMethod: "Fleet Card (Petron)" | "Corporate Card (Shell)" | "Petty Cash";
}

interface FleetManagementProps {
  currentUser: { role: string; name: string } | null;
  isDataMasked: boolean;
  maskCurrency: (val: number) => string;
  maskField: (val: string, type: string) => string;
  onPostFuelExpenseToAP?: (fuelLog: FuelLog) => void;
  onDispatchTripToAR?: (trip: DispatchTrip) => void;
}

export const INITIAL_FLEET_VEHICLES: FleetVehicle[] = [
  {
    id: "VEH-01",
    plateNumber: "NDK-4821",
    model: "Isuzu NPR Cold Chain 4.5T",
    type: "Refrigerated Commissary Van",
    assignedDriver: "Eduardo Santos (DL: N02-99-10294)",
    odometerKm: 42850,
    fuelType: "Diesel",
    fuelEfficiencyKmL: 7.8,
    status: "Active / On Route",
    acquisitionCost: 2850000,
    monthlyDepreciation: 47500,
    lastServiceDate: "2026-08-05"
  },
  {
    id: "VEH-02",
    plateNumber: "NBQ-7719",
    model: "Hino 300 Series Heavy Duty",
    type: "Heavy Logistics Truck",
    assignedDriver: "Rodrigo Morales (DL: N01-88-44912)",
    odometerKm: 68120,
    fuelType: "Diesel",
    fuelEfficiencyKmL: 6.2,
    status: "Dispatched",
    acquisitionCost: 3600000,
    monthlyDepreciation: 60000,
    lastServiceDate: "2026-08-12"
  },
  {
    id: "VEH-03",
    plateNumber: "NCT-1092",
    model: "Toyota HiAce Super Grandia Luxury",
    type: "VIP Guest Airport Shuttle",
    assignedDriver: "Danilo Reyes (DL: N03-12-88291)",
    odometerKm: 21300,
    fuelType: "Diesel",
    fuelEfficiencyKmL: 10.5,
    status: "Idle / Available",
    acquisitionCost: 2950000,
    monthlyDepreciation: 49166,
    lastServiceDate: "2026-08-20"
  },
  {
    id: "VEH-04",
    plateNumber: "CAS-9941",
    model: "Toyota Camry Executive Hybrid",
    type: "Executive Sedan",
    assignedDriver: "Antonio Cruz (DL: N04-91-22910)",
    odometerKm: 14500,
    fuelType: "Unleaded",
    fuelEfficiencyKmL: 14.8,
    status: "Active / On Route",
    acquisitionCost: 2450000,
    monthlyDepreciation: 40833,
    lastServiceDate: "2026-08-18"
  }
];

export const INITIAL_DISPATCH_TRIPS: DispatchTrip[] = [
  {
    id: "TRIP-2026-801",
    vehicleId: "VEH-01",
    plateNumber: "NDK-4821",
    driverName: "Eduardo Santos",
    route: "Manila Port Pier 15 ➔ Central Commissary Kitchen (Team 6)",
    departureTime: "06:30 AM",
    estimatedArrival: "09:45 AM",
    cargoDescription: "Fresh Salmon, US Wagyu Beef Prime Cuts, Fresh Cheeses",
    cargoWeightKg: 1850,
    distanceKm: 48,
    tollFeePHP: 450,
    fuelEstimatedLiters: 6.2,
    status: "In Transit",
    billableArAmount: 18500
  },
  {
    id: "TRIP-2026-802",
    vehicleId: "VEH-02",
    plateNumber: "NBQ-7719",
    driverName: "Rodrigo Morales",
    route: "Central Warehouse ➔ Resort Branch Batangas",
    departureTime: "08:00 AM",
    estimatedArrival: "11:30 AM",
    cargoDescription: "Dry Groceries, Beverage Bar Kegs, Linens & Guest Amenities",
    cargoWeightKg: 3400,
    distanceKm: 112,
    tollFeePHP: 980,
    fuelEstimatedLiters: 18.0,
    status: "Dispatched",
    billableArAmount: 42000
  },
  {
    id: "TRIP-2026-803",
    vehicleId: "VEH-03",
    plateNumber: "NCT-1092",
    driverName: "Danilo Reyes",
    route: "NAIA Terminal 3 ➔ Hotel Main Lobby (VIP Delegation)",
    departureTime: "01:15 PM",
    estimatedArrival: "02:10 PM",
    cargoDescription: "VIP Executive Airport Transfer (6 pax + luggage)",
    cargoWeightKg: 450,
    distanceKm: 22,
    tollFeePHP: 215,
    fuelEstimatedLiters: 2.1,
    status: "Scheduled",
    billableArAmount: 8500
  }
];

export const INITIAL_FUEL_LOGS: FuelLog[] = [
  {
    id: "FUEL-AUG-01",
    vehicleId: "VEH-01",
    plateNumber: "NDK-4821",
    driverName: "Eduardo Santos",
    station: "Petron SLEX Northbound Station",
    liters: 55.4,
    pricePerLiter: 58.5,
    totalCostPHP: 3240.9,
    odometerKm: 42810,
    date: "2026-08-25",
    paymentMethod: "Fleet Card (Petron)"
  },
  {
    id: "FUEL-AUG-02",
    vehicleId: "VEH-02",
    plateNumber: "NBQ-7719",
    driverName: "Rodrigo Morales",
    station: "Shell South Luzon Expressway",
    liters: 85.0,
    pricePerLiter: 58.8,
    totalCostPHP: 4998.0,
    odometerKm: 68050,
    date: "2026-08-26",
    paymentMethod: "Corporate Card (Shell)"
  }
];

export default function FleetManagement({
  currentUser,
  isDataMasked,
  maskCurrency,
  maskField,
  onPostFuelExpenseToAP,
  onDispatchTripToAR
}: FleetManagementProps) {
  const [activeSubModule, setActiveSubModule] = useState<
    "fvm" | "vrds" | "driver" | "fuel" | "tcao" | "route" | "mobile"
  >("fvm");

  const [vehicles, setVehicles] = useState<FleetVehicle[]>(INITIAL_FLEET_VEHICLES);
  const [trips, setTrips] = useState<DispatchTrip[]>(INITIAL_DISPATCH_TRIPS);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>(INITIAL_FUEL_LOGS);

  // New Dispatch Modal
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [dispatchVehicleId, setDispatchVehicleId] = useState(vehicles[0]?.id || "");
  const [dispatchRoute, setDispatchRoute] = useState("");
  const [dispatchCargo, setDispatchCargo] = useState("");
  const [dispatchWeight, setDispatchWeight] = useState("");
  const [dispatchDistance, setDispatchDistance] = useState("45");
  const [dispatchToll, setDispatchToll] = useState("350");
  const [dispatchBillable, setDispatchBillable] = useState("12000");

  // New Fuel Modal
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [fuelVehicleId, setFuelVehicleId] = useState(vehicles[0]?.id || "");
  const [fuelStation, setFuelStation] = useState("Petron Commercial Depot");
  const [fuelLiters, setFuelLiters] = useState("");
  const [fuelPricePerL, setFuelPricePerL] = useState("58.50");
  const [fuelOdo, setFuelOdo] = useState("43000");

  // Route Planning Sandbox State
  const [simOrigin, setSimOrigin] = useState("Commissary Hub (Quezon City)");
  const [simDestination, setSimDestination] = useState("Grand Ballroom Hotel (Makati)");
  const [simUseSkyway, setSimUseSkyway] = useState(true);

  // Metrics
  const fleetTotals = useMemo(() => {
    const totalAssetVal = vehicles.reduce((acc, v) => acc + v.acquisitionCost, 0);
    const totalMonthlyDeprec = vehicles.reduce((acc, v) => acc + v.monthlyDepreciation, 0);
    const totalFuelSpent = fuelLogs.reduce((acc, f) => acc + f.totalCostPHP, 0);
    const activeVehicles = vehicles.filter((v) => v.status === "Active / On Route" || v.status === "Dispatched").length;
    const totalTripsCompleted = trips.filter((t) => t.status === "Delivered / Completed").length;

    // Transport Cost Per KM Analysis
    const totalKmTraveled = trips.reduce((acc, t) => acc + t.distanceKm, 0) || 1;
    const avgCostPerKm = (totalFuelSpent + totalMonthlyDeprec / 30) / (totalKmTraveled > 0 ? totalKmTraveled : 1);

    return {
      totalAssetVal,
      totalMonthlyDeprec,
      totalFuelSpent,
      activeVehicles,
      totalTripsCompleted,
      avgCostPerKm: Math.round(avgCostPerKm * 100) / 100
    };
  }, [vehicles, fuelLogs, trips]);

  const handleCreateDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    const veh = vehicles.find((v) => v.id === dispatchVehicleId);
    if (!veh) return;

    const newTrip: DispatchTrip = {
      id: `TRIP-2026-${Math.floor(800 + Math.random() * 100)}`,
      vehicleId: veh.id,
      plateNumber: veh.plateNumber,
      driverName: veh.assignedDriver.split(" (")[0],
      route: dispatchRoute || "Manila Distribution Center ➔ Regional Kitchen",
      departureTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      estimatedArrival: "In 2.5 Hours",
      cargoDescription: dispatchCargo || "F&B Cold Goods & Food Supplies",
      cargoWeightKg: Number(dispatchWeight) || 1200,
      distanceKm: Number(dispatchDistance) || 45,
      tollFeePHP: Number(dispatchToll) || 350,
      fuelEstimatedLiters: Math.round((Number(dispatchDistance) / veh.fuelEfficiencyKmL) * 10) / 10,
      status: "In Transit",
      billableArAmount: Number(dispatchBillable) || 12000
    };

    setTrips([newTrip, ...trips]);
    // update vehicle status
    setVehicles(
      vehicles.map((v) => (v.id === veh.id ? { ...v, status: "Active / On Route" } : v))
    );

    if (onDispatchTripToAR) {
      onDispatchTripToAR(newTrip);
    }
    setIsDispatchModalOpen(false);
  };

  const handleCreateFuelLog = (e: React.FormEvent) => {
    e.preventDefault();
    const veh = vehicles.find((v) => v.id === fuelVehicleId);
    if (!veh || !fuelLiters) return;

    const litersNum = Number(fuelLiters);
    const priceNum = Number(fuelPricePerL);
    const totalPHP = litersNum * priceNum;

    const newLog: FuelLog = {
      id: `FUEL-AUG-${Math.floor(10 + Math.random() * 90)}`,
      vehicleId: veh.id,
      plateNumber: veh.plateNumber,
      driverName: veh.assignedDriver.split(" (")[0],
      station: fuelStation,
      liters: litersNum,
      pricePerLiter: priceNum,
      totalCostPHP: totalPHP,
      odometerKm: Number(fuelOdo) || veh.odometerKm + 150,
      date: "2026-08-27",
      paymentMethod: "Fleet Card (Petron)"
    };

    setFuelLogs([newLog, ...fuelLogs]);
    if (onPostFuelExpenseToAP) {
      onPostFuelExpenseToAP(newLog);
    }
    setIsFuelModalOpen(false);
  };

  const getExportData = () => {
    return {
      title: "Fleet Operations & Logistics Telematics Integration Report",
      subtitle: "System Date: 2026-08-27 | HORECA Logistics & Transport",
      filename: `Fleet_Operations_Logistics_Matrix_2026-08-27`,
      headers: [
        "Vehicle ID",
        "Plate Number",
        "Model",
        "Type",
        "Assigned Driver",
        "Odometer (km)",
        "Fuel Type",
        "Fuel Efficiency (km/L)",
        "Status",
        "Acquisition Cost (PHP)",
        "Monthly Depreciation (PHP)"
      ],
      rows: vehicles.map((v) => [
        v.id,
        v.plateNumber,
        v.model,
        v.type,
        v.assignedDriver,
        v.odometerKm,
        v.fuelType,
        v.fuelEfficiencyKmL,
        v.status,
        v.acquisitionCost,
        v.monthlyDepreciation
      ])
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#DFE1DB] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold font-['IBM_Plex_Mono'] uppercase text-[#5C636F]">
              LOGISTICS &amp; TRANSPORT CORE / FLEET ARCHITECTURE
            </span>
            <span className="bg-[#1A1D21] text-[#FF6A3D] px-2 py-0.5 rounded text-[10px] font-['IBM_Plex_Mono'] font-bold border border-[#2A2E34]">
              7-SUBSYSTEM INTEGRATED
            </span>
          </div>
          <h1 className="text-2xl font-bold font-['Archivo'] text-[#1A1D21] mt-1">
            Fleet Operation &amp; Logistics Management
          </h1>
          <p className="text-xs text-[#5C636F]">
            Direct financial integration with Accounts Payable (Fuel/Maintenance bills), Accounts Receivable (Freight/Folio billing), and GL Asset Valuation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton getExportData={getExportData} buttonLabel="Export Fleet Audit" />
          <button
            type="button"
            onClick={() => setIsDispatchModalOpen(true)}
            className="bg-[#1A1D21] hover:bg-[#2A2E34] text-white px-3.5 py-2 rounded-lg text-xs font-bold font-['IBM_Plex_Mono'] flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Route className="h-4 w-4 text-[#FF6A3D]" />
            <span>Dispatch New Trip</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#DFE1DB] space-y-1 shadow-xs">
          <div className="flex justify-between items-center text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
            <span className="font-bold">ACTIVE FLEET ASSETS</span>
            <Truck className="h-4 w-4 text-[#157A4D]" />
          </div>
          <div className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#1A1D21]">
            {fleetTotals.activeVehicles} / {vehicles.length} Active
          </div>
          <p className="text-[11px] text-[#5C636F]">Asset Base: {maskCurrency(fleetTotals.totalAssetVal)}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#DFE1DB] space-y-1 shadow-xs">
          <div className="flex justify-between items-center text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
            <span className="font-bold">MONTHLY FLEET DEPRECIATION</span>
            <TrendingDown className="h-4 w-4 text-[#B53A1E]" />
          </div>
          <div className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#B53A1E]">
            {maskCurrency(fleetTotals.totalMonthlyDeprec)}
          </div>
          <p className="text-[11px] text-[#5C636F]">Posted to GL Account #5020</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#DFE1DB] space-y-1 shadow-xs">
          <div className="flex justify-between items-center text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
            <span className="font-bold">TOTAL FUEL EXPENSE (MTD)</span>
            <Fuel className="h-4 w-4 text-[#8A5A00]" />
          </div>
          <div className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#8A5A00]">
            {maskCurrency(fleetTotals.totalFuelSpent)}
          </div>
          <p className="text-[11px] text-[#5C636F]">Direct AP Fleet Card Settlement</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#DFE1DB] space-y-1 shadow-xs">
          <div className="flex justify-between items-center text-xs font-['IBM_Plex_Mono'] text-[#5C636F]">
            <span className="font-bold">AVG TRANSPORT COST / KM</span>
            <Gauge className="h-4 w-4 text-[#157A4D]" />
          </div>
          <div className="text-2xl font-bold font-['IBM_Plex_Mono'] text-[#157A4D]">
            ₱{fleetTotals.avgCostPerKm} / km
          </div>
          <p className="text-[11px] text-[#5C636F]">Optimized via Skyway &amp; Fuel controls</p>
        </div>
      </div>

      {/* Sub-System Navigation Tabs (Direct from User's Architectural Diagram) */}
      <div className="flex flex-wrap gap-1.5 p-1.5 bg-[#F1F1ED] rounded-xl border border-[#DFE1DB]">
        {[
          { id: "fvm", label: "1. Fleet & Vehicle Mgmt (FVM)", icon: Truck },
          { id: "vrds", label: "2. Reservation & Dispatch (VRDS)", icon: Route },
          { id: "driver", label: "3. Driver Performance", icon: Users },
          { id: "fuel", label: "4. Fuel Management System", icon: Fuel },
          { id: "tcao", label: "5. Transport Cost Analysis (TCAO)", icon: BarChart3 },
          { id: "route", label: "6. Route Planning & Optimization", icon: Navigation },
          { id: "mobile", label: "7. Mobile Command Simulator", icon: Smartphone }
        ].map((sub) => {
          const Icon = sub.icon;
          const isActive = activeSubModule === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => setActiveSubModule(sub.id as any)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-['IBM_Plex_Mono'] font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-[#1A1D21] text-white shadow-xs"
                  : "text-[#5C636F] hover:text-[#1A1D21] hover:bg-white/60"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? "text-[#FF6A3D]" : ""}`} />
              <span>{sub.label}</span>
            </button>
          );
        })}
      </div>

      {/* ==============================================================================
          1. FLEET & VEHICLE MANAGEMENT (FVM)
         ============================================================================== */}
      {activeSubModule === "fvm" && (
        <div className="bg-white border border-[#DFE1DB] rounded-xl overflow-hidden shadow-xs space-y-4">
          <div className="p-4 border-b border-[#DFE1DB] flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm font-['Archivo']">Fleet Vehicle Master Registry &amp; Fixed Asset Ledger</h3>
              <p className="text-xs text-[#5C636F]">
                Maintains heavy cold chain haulers, guest shuttles, and logistics vans with real-time depreciation tracking.
              </p>
            </div>
            <span className="text-xs font-['IBM_Plex_Mono'] text-[#157A4D] font-bold">
              4 Certified Roadworthy Assets
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-['IBM_Plex_Sans']">
              <thead className="bg-[#F1F1ED] text-xs font-['IBM_Plex_Mono'] text-[#5C636F] uppercase">
                <tr>
                  <th className="p-3">Asset ID / Plate</th>
                  <th className="p-3">Model &amp; Category</th>
                  <th className="p-3">Assigned Driver</th>
                  <th className="p-3">Odometer</th>
                  <th className="p-3">Fuel / Efficiency</th>
                  <th className="p-3 text-right">Acquisition Cost</th>
                  <th className="p-3 text-right">Monthly Deprec.</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F1ED]">
                {vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <div className="font-bold font-['IBM_Plex_Mono'] text-[#1A1D21]">{v.plateNumber}</div>
                      <div className="text-[11px] font-['IBM_Plex_Mono'] text-[#5C636F]">{v.id}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-[#1A1D21]">{v.model}</div>
                      <span className="inline-block text-[11px] font-['IBM_Plex_Mono'] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {v.type}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-[#1A1D21]">
                      {maskField(v.assignedDriver, "name")}
                    </td>
                    <td className="p-3 font-['IBM_Plex_Mono'] text-xs">
                      {v.odometerKm.toLocaleString()} km
                      <span className="block text-[10px] text-[#5C636F]">Last svc: {v.lastServiceDate}</span>
                    </td>
                    <td className="p-3 font-['IBM_Plex_Mono'] text-xs">
                      <span className="font-bold">{v.fuelEfficiencyKmL} km/L</span>
                      <span className="block text-[10px] text-[#5C636F]">{v.fuelType}</span>
                    </td>
                    <td className="p-3 text-right font-['IBM_Plex_Mono'] font-medium">
                      {maskCurrency(v.acquisitionCost)}
                    </td>
                    <td className="p-3 text-right font-['IBM_Plex_Mono'] text-[#B53A1E] font-medium">
                      {maskCurrency(v.monthlyDepreciation)}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`text-[10px] font-['IBM_Plex_Mono'] font-bold px-2.5 py-1 rounded ${
                          v.status === "Active / On Route"
                            ? "bg-green-100 text-green-800"
                            : v.status === "Dispatched"
                            ? "bg-blue-100 text-blue-800"
                            : v.status === "Maintenance"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==============================================================================
          2. VEHICLE RESERVATION & DISPATCH SYSTEM (VRDS)
         ============================================================================== */}
      {activeSubModule === "vrds" && (
        <div className="bg-white border border-[#DFE1DB] rounded-xl overflow-hidden shadow-xs space-y-4">
          <div className="p-4 border-b border-[#DFE1DB] flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm font-['Archivo']">Active Trip Dispatch &amp; Freight Schedule</h3>
              <p className="text-xs text-[#5C636F]">
                Real-time manifest scheduling. Automatically generates freight billings in Accounts Receivable.
              </p>
            </div>
            <button
              onClick={() => setIsDispatchModalOpen(true)}
              className="bg-[#157A4D] hover:bg-[#12633e] text-white px-3 py-1.5 rounded-lg text-xs font-bold font-['IBM_Plex_Mono'] flex items-center space-x-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Book Trip</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-['IBM_Plex_Sans']">
              <thead className="bg-[#F1F1ED] text-xs font-['IBM_Plex_Mono'] text-[#5C636F] uppercase">
                <tr>
                  <th className="p-3">Trip ID</th>
                  <th className="p-3">Vehicle &amp; Driver</th>
                  <th className="p-3">Route Origin ➔ Destination</th>
                  <th className="p-3">Cargo Manifest / Pax</th>
                  <th className="p-3">Distance &amp; Toll</th>
                  <th className="p-3 text-right">Billable AR</th>
                  <th className="p-3 text-center">Dispatch Status</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F1ED]">
                {trips.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-['IBM_Plex_Mono'] font-bold text-[#1A1D21]">
                      {t.id}
                      <span className="block text-[10px] text-[#5C636F]">{t.departureTime}</span>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-[#1A1D21]">{t.plateNumber}</div>
                      <div className="text-[11px] text-[#5C636F]">{maskField(t.driverName, "name")}</div>
                    </td>
                    <td className="p-3 font-medium text-xs text-[#1A1D21]">
                      {t.route}
                      <span className="block text-[10px] text-[#5C636F]">ETA: {t.estimatedArrival}</span>
                    </td>
                    <td className="p-3 text-xs">
                      <div>{t.cargoDescription}</div>
                      <div className="text-[10px] font-['IBM_Plex_Mono'] text-[#5C636F]">
                        Weight: {t.cargoWeightKg.toLocaleString()} kg | Est Fuel: {t.fuelEstimatedLiters}L
                      </div>
                    </td>
                    <td className="p-3 font-['IBM_Plex_Mono'] text-xs">
                      <div>{t.distanceKm} km</div>
                      <div className="text-[10px] text-[#5C636F]">Toll: ₱{t.tollFeePHP}</div>
                    </td>
                    <td className="p-3 text-right font-['IBM_Plex_Mono'] font-bold text-[#157A4D]">
                      {maskCurrency(t.billableArAmount)}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`text-[10px] font-['IBM_Plex_Mono'] font-bold px-2.5 py-1 rounded ${
                          t.status === "In Transit"
                            ? "bg-blue-100 text-blue-800 animate-pulse"
                            : t.status === "Delivered / Completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {t.status !== "Delivered / Completed" ? (
                        <button
                          onClick={() =>
                            setTrips(
                              trips.map((tr) =>
                                tr.id === t.id ? { ...tr, status: "Delivered / Completed" } : tr
                              )
                            )
                          }
                          className="bg-[#1A1D21] text-white px-2.5 py-1 rounded text-xs font-['IBM_Plex_Mono'] font-bold hover:bg-[#2A2E34]"
                        >
                          Complete Trip
                        </button>
                      ) : (
                        <span className="text-xs text-[#157A4D] font-['IBM_Plex_Mono']">Verified</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==============================================================================
          3. DRIVER AND TRIP PERFORMANCE MONITORING
         ============================================================================== */}
      {activeSubModule === "driver" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-[#DFE1DB] space-y-4 shadow-xs">
            <h3 className="font-bold text-base font-['Archivo'] flex items-center gap-2">
              <Users className="h-5 w-5 text-[#157A4D]" />
              <span>Certified Fleet Operators &amp; Safety Ratings</span>
            </h3>
            <div className="space-y-3">
              {[
                { name: "Eduardo Santos", license: "N02-99-10294 (Prof)", score: 98.5, trips: 142, onTime: "99.2%", status: "On Route" },
                { name: "Rodrigo Morales", license: "N01-88-44912 (Prof)", score: 96.0, trips: 118, onTime: "97.4%", status: "On Route" },
                { name: "Danilo Reyes", license: "N03-12-88291 (Prof)", score: 99.1, trips: 89, onTime: "100%", status: "Standby" },
                { name: "Antonio Cruz", license: "N04-91-22910 (Prof)", score: 97.8, trips: 76, onTime: "98.5%", status: "On Route" }
              ].map((dr, idx) => (
                <div key={idx} className="p-3 bg-[#F1F1ED] rounded-lg border border-[#DFE1DB] flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold text-[#1A1D21] font-['IBM_Plex_Sans']">{maskField(dr.name, "name")}</div>
                    <div className="text-[11px] font-['IBM_Plex_Mono'] text-[#5C636F]">DL: {dr.license}</div>
                    <div className="text-[11px] text-[#157A4D] font-semibold mt-0.5">
                      On-Time Delivery: {dr.onTime} | Trips: {dr.trips}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold font-['IBM_Plex_Mono'] text-[#157A4D]">{dr.score} / 100</div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold font-['IBM_Plex_Mono']">
                      Grade A+
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#DFE1DB] space-y-4 shadow-xs">
            <h3 className="font-bold text-base font-['Archivo'] flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#FF6A3D]" />
              <span>Safety &amp; Telematics Compliance Audit</span>
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border rounded-lg space-y-1">
                <div className="font-bold text-[#1A1D21]">Speed Governance (Max 80 km/h on Expressways)</div>
                <div className="text-[#5C636F]">0 Speed Violations logged across SLEX &amp; Skyway 3 in August 2026.</div>
              </div>
              <div className="p-3 bg-slate-50 border rounded-lg space-y-1">
                <div className="font-bold text-[#1A1D21]">Cold Chain Temperature Monitoring</div>
                <div className="text-[#5C636F]">Refrigerated Van NDK-4821 maintained strict -18°C setpoint during seafood haul.</div>
              </div>
              <div className="p-3 bg-slate-50 border rounded-lg space-y-1">
                <div className="font-bold text-[#1A1D21]">Preventive Maintenance Schedule</div>
                <div className="text-[#157A4D] font-semibold">All 4 vehicles cleared 10,000-km preventive change-oil inspections.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================================
          4. FUEL MANAGEMENT SYSTEM
         ============================================================================== */}
      {activeSubModule === "fuel" && (
        <div className="bg-white border border-[#DFE1DB] rounded-xl overflow-hidden shadow-xs space-y-4">
          <div className="p-4 border-b border-[#DFE1DB] flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm font-['Archivo']">Fuel Management &amp; Fleet Card Electronic Settlement</h3>
              <p className="text-xs text-[#5C636F]">
                Monitors diesel/gasoline consumption, pricing per liter, and posts automatically to Accounts Payable.
              </p>
            </div>
            <button
              onClick={() => setIsFuelModalOpen(true)}
              className="bg-[#1A1D21] hover:bg-[#2A2E34] text-white px-3 py-1.5 rounded-lg text-xs font-bold font-['IBM_Plex_Mono'] flex items-center space-x-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Record Fuel Transaction</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-['IBM_Plex_Sans']">
              <thead className="bg-[#F1F1ED] text-xs font-['IBM_Plex_Mono'] text-[#5C636F] uppercase">
                <tr>
                  <th className="p-3">Ref ID</th>
                  <th className="p-3">Plate &amp; Vehicle</th>
                  <th className="p-3">Station &amp; Date</th>
                  <th className="p-3">Liters Pumped</th>
                  <th className="p-3">Price / Liter</th>
                  <th className="p-3 text-right">Total Expense</th>
                  <th className="p-3">Payment Method</th>
                  <th className="p-3 text-center">AP Sync Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F1ED]">
                {fuelLogs.map((fl) => (
                  <tr key={fl.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-['IBM_Plex_Mono'] font-bold text-[#1A1D21]">{fl.id}</td>
                    <td className="p-3">
                      <div className="font-bold text-[#1A1D21]">{fl.plateNumber}</div>
                      <div className="text-[11px] text-[#5C636F]">{maskField(fl.driverName, "name")}</div>
                    </td>
                    <td className="p-3 text-xs">
                      <div>{fl.station}</div>
                      <div className="text-[11px] font-['IBM_Plex_Mono'] text-[#5C636F]">{fl.date}</div>
                    </td>
                    <td className="p-3 font-['IBM_Plex_Mono'] text-xs font-bold">{fl.liters} L</td>
                    <td className="p-3 font-['IBM_Plex_Mono'] text-xs">₱{fl.pricePerLiter.toFixed(2)}</td>
                    <td className="p-3 text-right font-['IBM_Plex_Mono'] font-bold text-[#B5281A]">
                      {maskCurrency(fl.totalCostPHP)}
                    </td>
                    <td className="p-3 text-xs font-['IBM_Plex_Mono'] text-slate-700">{fl.paymentMethod}</td>
                    <td className="p-3 text-center">
                      <span className="bg-[#157A4D]/10 text-[#157A4D] px-2 py-0.5 rounded text-[10px] font-bold font-['IBM_Plex_Mono']">
                        Posted to AP / Petron
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==============================================================================
          5. TRANSPORT COST ANALYSIS & OPTIMIZATION (TCAO)
         ============================================================================== */}
      {activeSubModule === "tcao" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl border border-[#DFE1DB] space-y-4 shadow-xs col-span-1">
            <h3 className="font-bold text-base font-['Archivo']">Cost Breakdown Structure</h3>
            <div className="space-y-3 text-xs font-['IBM_Plex_Mono']">
              <div className="flex justify-between border-b pb-2">
                <span className="text-[#5C636F]">Fuel &amp; Lubricants (45%):</span>
                <span className="font-bold text-[#1A1D21]">{maskCurrency(fleetTotals.totalFuelSpent)}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-[#5C636F]">Asset Depreciation (32%):</span>
                <span className="font-bold text-[#1A1D21]">{maskCurrency(fleetTotals.totalMonthlyDeprec)}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-[#5C636F]">Tollway Fees (Skyway/SLEX) (15%):</span>
                <span className="font-bold text-[#1A1D21]">{maskCurrency(14500)}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-[#5C636F]">Preventive Maintenance (8%):</span>
                <span className="font-bold text-[#1A1D21]">{maskCurrency(9800)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#DFE1DB] space-y-4 shadow-xs col-span-2">
            <h3 className="font-bold text-base font-['Archivo']">AI Optimization Recommendations</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#157A4D] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#157A4D]">Consolidated Pier Hauls (Est Savings: ₱24,000/mo)</div>
                  <div className="text-slate-700 mt-0.5">
                    Merging dry provisions and seafood deliveries on Tuesdays and Thursdays cuts deadhead trips by 38%.
                  </div>
                </div>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                <Zap className="h-5 w-5 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-blue-800">Petron Fleet Card Rebate Program (1.5% CashBack)</div>
                  <div className="text-slate-700 mt-0.5">
                    Direct corporate linkage automatically accrues volume diesel rebates against monthly AP invoice.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================================
          6. ROUTE PLANNING & OPTIMIZATION
         ============================================================================== */}
      {activeSubModule === "route" && (
        <div className="bg-white p-6 rounded-xl border border-[#DFE1DB] space-y-6 shadow-xs">
          <div>
            <h3 className="font-bold text-lg font-['Archivo']">Interactive Route Planning &amp; Toll Optimizer</h3>
            <p className="text-xs text-[#5C636F]">
              Calculates fuel burn vs toll costs across Metro Manila and Southern Luzon routes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#5C636F] mb-1">Origin Point</label>
              <select
                value={simOrigin}
                onChange={(e) => setSimOrigin(e.target.value)}
                className="w-full border rounded-lg p-2 text-xs font-bold focus:outline-none"
              >
                <option value="Commissary Hub (Quezon City)">Commissary Hub (Quezon City)</option>
                <option value="Manila Port Pier 15">Manila Port Pier 15 (Seafood Terminal)</option>
                <option value="NAIA Airport Terminal 3">NAIA Airport Terminal 3</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#5C636F] mb-1">Destination</label>
              <select
                value={simDestination}
                onChange={(e) => setSimDestination(e.target.value)}
                className="w-full border rounded-lg p-2 text-xs font-bold focus:outline-none"
              >
                <option value="Grand Ballroom Hotel (Makati)">Grand Ballroom Hotel (Makati)</option>
                <option value="Resort Beach Club Batangas">Resort Beach Club Batangas</option>
                <option value="BGC Executive Suites">BGC Executive Suites</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#5C636F] mb-1">Routing Strategy</label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="skywayCheck"
                  checked={simUseSkyway}
                  onChange={(e) => setSimUseSkyway(e.target.checked)}
                  className="rounded h-4 w-4 text-[#1A1D21]"
                />
                <label htmlFor="skywayCheck" className="text-xs font-medium text-[#1A1D21]">
                  Use Skyway Stage 3 / SLEX (Express)
                </label>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#F1F1ED] rounded-xl border border-[#DFE1DB] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-['IBM_Plex_Mono']">
            <div>
              <span className="text-[#5C636F] block">ESTIMATED TRANSIT TIME:</span>
              <span className="text-base font-bold text-[#1A1D21]">{simUseSkyway ? "38 Minutes" : "1 Hour 45 Mins"}</span>
            </div>
            <div>
              <span className="text-[#5C636F] block">TOLLWAY COST:</span>
              <span className="text-base font-bold text-[#1A1D21]">{simUseSkyway ? "₱360.00 (Skyway 3)" : "₱0.00 (Service Road)"}</span>
            </div>
            <div>
              <span className="text-[#5C636F] block">PROJECTED FUEL USAGE:</span>
              <span className="text-base font-bold text-[#157A4D]">{simUseSkyway ? "4.2 Liters (₱245.70)" : "7.8 Liters (₱456.30)"}</span>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================================
          7. MOBILE FLEET COMMAND APP SIMULATOR
         ============================================================================== */}
      {activeSubModule === "mobile" && (
        <div className="flex flex-col items-center justify-center p-6 bg-slate-900 rounded-xl text-white space-y-4">
          <div className="flex items-center gap-2 text-[#FF6A3D]">
            <Smartphone className="h-6 w-6" />
            <h3 className="text-lg font-bold font-['Archivo']">Mobile Driver &amp; Dispatch Field Simulator</h3>
          </div>
          <p className="text-xs text-slate-300 max-w-md text-center">
            Drivers receive dispatch assignments, upload delivery photo proof, and log digital receiver signatures from their mobile device.
          </p>

          <div className="w-80 bg-slate-950 border border-slate-700 rounded-3xl p-5 shadow-2xl space-y-4 font-['IBM_Plex_Sans']">
            <div className="flex justify-between items-center text-xs text-slate-400 border-b border-slate-800 pb-2">
              <span>09:41 AM</span>
              <span>5G LTE • 100%</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-['IBM_Plex_Mono'] uppercase text-[#35C98B]">Active Job #TRIP-801</span>
              <h4 className="font-bold text-sm text-white">Central Commissary Delivery</h4>
              <p className="text-xs text-slate-400">Destination: Hotel Loading Dock B</p>
            </div>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs font-['IBM_Plex_Mono'] space-y-1">
              <div>Cargo: <strong>1,850 kg Cold Chain</strong></div>
              <div>Temp: <strong className="text-[#35C98B]">-18.4°C (Normal)</strong></div>
            </div>
            <button className="w-full bg-[#157A4D] hover:bg-[#12633e] text-white py-2.5 rounded-xl font-bold text-xs font-['IBM_Plex_Mono'] transition-colors">
              Capture Delivery Signature (E-POD)
            </button>
          </div>
        </div>
      )}

      {/* DISPATCH TRIP MODAL */}
      {isDispatchModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 space-y-4 max-w-md w-full border border-[#DFE1DB] shadow-2xl text-xs">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base font-['Archivo'] text-[#1A1D21]">Dispatch New Fleet Trip</h3>
              <button onClick={() => setIsDispatchModalOpen(false)} className="text-[#5C636F]">✕</button>
            </div>
            <form onSubmit={handleCreateDispatch} className="space-y-3">
              <div>
                <label className="block font-bold text-[#5C636F] mb-1">Select Vehicle &amp; Driver</label>
                <select
                  value={dispatchVehicleId}
                  onChange={(e) => setDispatchVehicleId(e.target.value)}
                  className="w-full border rounded p-2 font-bold"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plateNumber} - {v.model} ({v.assignedDriver.split(" (")[0]})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-[#5C636F] mb-1">Route (Origin ➔ Destination)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pier 15 ➔ Central Kitchen"
                  value={dispatchRoute}
                  onChange={(e) => setDispatchRoute(e.target.value)}
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block font-bold text-[#5C636F] mb-1">Cargo Description</label>
                <input
                  type="text"
                  placeholder="e.g. Fresh salmon and dry provisions"
                  value={dispatchCargo}
                  onChange={(e) => setDispatchCargo(e.target.value)}
                  className="w-full border rounded p-2"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-[#5C636F] mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={dispatchWeight}
                    onChange={(e) => setDispatchWeight(e.target.value)}
                    className="w-full border rounded p-2 font-['IBM_Plex_Mono']"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#5C636F] mb-1">Distance (km)</label>
                  <input
                    type="number"
                    value={dispatchDistance}
                    onChange={(e) => setDispatchDistance(e.target.value)}
                    className="w-full border rounded p-2 font-['IBM_Plex_Mono']"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#5C636F] mb-1">Billable AR (PHP)</label>
                  <input
                    type="number"
                    value={dispatchBillable}
                    onChange={(e) => setDispatchBillable(e.target.value)}
                    className="w-full border rounded p-2 font-['IBM_Plex_Mono'] font-bold"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t font-['IBM_Plex_Mono']">
                <button
                  type="button"
                  onClick={() => setIsDispatchModalOpen(false)}
                  className="px-3 py-1.5 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#1A1D21] text-white rounded font-bold hover:bg-[#2A2E34]"
                >
                  Authorize Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD FUEL MODAL */}
      {isFuelModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 space-y-4 max-w-md w-full border border-[#DFE1DB] shadow-2xl text-xs">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base font-['Archivo'] text-[#1A1D21]">Record Fuel Pump Transaction</h3>
              <button onClick={() => setIsFuelModalOpen(false)} className="text-[#5C636F]">✕</button>
            </div>
            <form onSubmit={handleCreateFuelLog} className="space-y-3">
              <div>
                <label className="block font-bold text-[#5C636F] mb-1">Vehicle</label>
                <select
                  value={fuelVehicleId}
                  onChange={(e) => setFuelVehicleId(e.target.value)}
                  className="w-full border rounded p-2 font-bold"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plateNumber} ({v.model})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-[#5C636F] mb-1">Fuel Station</label>
                <input
                  type="text"
                  value={fuelStation}
                  onChange={(e) => setFuelStation(e.target.value)}
                  className="w-full border rounded p-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#5C636F] mb-1">Liters Pumped</label>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    value={fuelLiters}
                    onChange={(e) => setFuelLiters(e.target.value)}
                    className="w-full border rounded p-2 font-['IBM_Plex_Mono'] font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#5C636F] mb-1">Price per Liter (PHP)</label>
                  <input
                    type="number"
                    value={fuelPricePerL}
                    onChange={(e) => setFuelPricePerL(e.target.value)}
                    className="w-full border rounded p-2 font-['IBM_Plex_Mono']"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t font-['IBM_Plex_Mono']">
                <button
                  type="button"
                  onClick={() => setIsFuelModalOpen(false)}
                  className="px-3 py-1.5 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#157A4D] text-white rounded font-bold hover:bg-[#12633e]"
                >
                  Post to Accounts Payable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
