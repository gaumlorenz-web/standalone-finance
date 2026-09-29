export interface SubsystemAccount {
  subsystemId: "hr_payroll" | "hotel_mngt" | "resto_mngt" | "supply_chain" | "fleet_ops";
  subsystemName: string;
  subsystemShortName: string;
  email: string;
  passwordHash: string; // The authorized password
  officerName: string;
  roleTitle: string;
  departmentCode: string;
  avatarBg: string;
  accentColor: string;
}

export const SUBSYSTEM_ACCOUNTS: Record<string, SubsystemAccount> = {
  hr_payroll: {
    subsystemId: "hr_payroll",
    subsystemName: "HR & Payroll Subsystem",
    subsystemShortName: "HR-Payroll",
    email: "Janine@horeca.net",
    passwordHash: "#Hular2026",
    officerName: "Janine Hular",
    roleTitle: "HR & Payroll Director",
    departmentCode: "DEP-HR-2026",
    avatarBg: "from-indigo-600 to-indigo-800",
    accentColor: "indigo"
  },
  hotel_mngt: {
    subsystemId: "hotel_mngt",
    subsystemName: "Hotel Operations & Property Management (PMS)",
    subsystemShortName: "Hotel-MNGT",
    email: "Sheila@horeca.net",
    passwordHash: "#Suede2026",
    officerName: "Sheila Suede",
    roleTitle: "Hotel Front Office & Operations Director",
    departmentCode: "DEP-PMS-2026",
    avatarBg: "from-sky-600 to-sky-800",
    accentColor: "sky"
  },
  resto_mngt: {
    subsystemId: "resto_mngt",
    subsystemName: "Restaurant F&B Management",
    subsystemShortName: "Resto-MNGT",
    email: "Charles@horeca.net",
    passwordHash: "#Tiu2026",
    officerName: "Charles Tiu",
    roleTitle: "F&B Operations General Manager",
    departmentCode: "DEP-FNB-2026",
    avatarBg: "from-rose-600 to-rose-800",
    accentColor: "rose"
  },
  supply_chain: {
    subsystemId: "supply_chain",
    subsystemName: "Supply Chain & Purveyor Procurement",
    subsystemShortName: "Supply-Chain",
    email: "Jordan@horeca.net",
    passwordHash: "#Tiu2027",
    officerName: "Jordan Tiu",
    roleTitle: "Procurement & Supply Chain Controller",
    departmentCode: "DEP-SC-2026",
    avatarBg: "from-amber-600 to-amber-800",
    accentColor: "amber"
  },
  fleet_ops: {
    subsystemId: "fleet_ops",
    subsystemName: "Fleet Logistics & Transport Operations",
    subsystemShortName: "FleetOps",
    email: "Lourence@horeca.net",
    passwordHash: "#Piedad2026",
    officerName: "Lourence Piedad",
    roleTitle: "Fleet Operations & Transport Logistics Manager",
    departmentCode: "DEP-FLT-2026",
    avatarBg: "from-emerald-600 to-emerald-800",
    accentColor: "emerald"
  }
};

export interface SubsystemSession {
  subsystemId: string;
  email: string;
  officerName: string;
  roleTitle: string;
  departmentCode: string;
  loginTimestamp: number;
}
