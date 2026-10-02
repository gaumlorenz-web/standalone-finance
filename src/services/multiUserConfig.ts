/**
 * Enterprise Multi-User Configuration & Access Control
 * Allows multiple users across departments, subsystems, and administrative tiers
 * to log in, manage credentials, and switch between operations seamlessly.
 */

export interface SystemUserAccount {
  id: string;
  name: string;
  email: string;
  googleAccount: string;
  password: string; // Authorized authentication password
  role: "superadmin" | "admin" | "manager" | "auditor" | "operator";
  status: "active" | "suspended";
  department: string;
  subsystemsAllowed: ("finance" | "hr_payroll" | "hotel_mngt" | "resto_mngt" | "supply_chain" | "fleet_ops")[];
  title: string;
  createdAt: string;
  lastLogin?: string;
  avatarBg?: string;
  isMainSuperAdmin?: boolean;
}

export const ENTERPRISE_MULTI_USERS: SystemUserAccount[] = [
  // 1. Main Super Administrator (Full Master Control & Authority Over All Accounts)
  {
    id: "USR-001",
    name: "Lorenz Gaum",
    email: "Lorenz@horeca.com",
    googleAccount: "gaumlorenz@gmail.com",
    password: "230117482",
    role: "superadmin",
    status: "active",
    department: "Executive Treasury & Governance",
    title: "Main Super Admin & Chief Financial Officer",
    subsystemsAllowed: ["finance", "hr_payroll", "hotel_mngt", "resto_mngt", "supply_chain", "fleet_ops"],
    createdAt: "2026-08-19",
    avatarBg: "from-amber-600 to-amber-800",
    isMainSuperAdmin: true
  },

  // 2. Standard Administrator (Finance Controller)
  {
    id: "USR-002",
    name: "Renz (Standard Admin)",
    email: "Renz@horeca.com",
    googleAccount: "grave3116@gmail.com",
    password: "#Ga2004",
    role: "admin",
    status: "active",
    department: "Finance & Accounts Payable/Receivable",
    title: "Senior Finance Controller",
    subsystemsAllowed: ["finance", "hotel_mngt", "resto_mngt", "supply_chain"],
    createdAt: "2026-08-19",
    avatarBg: "from-blue-600 to-blue-800"
  },

  // 3. HR & Payroll Director
  {
    id: "USR-003",
    name: "Janine Hular",
    email: "Janine@horeca.net",
    googleAccount: "janine.hular@horeca.net",
    password: "#Hular2026",
    role: "manager",
    status: "active",
    department: "Human Resources & Statutory Payroll",
    title: "HR & Payroll Director",
    subsystemsAllowed: ["hr_payroll", "finance"],
    createdAt: "2026-08-20",
    avatarBg: "from-indigo-600 to-indigo-800"
  },

  // 4. Hotel Operations & PMS Director
  {
    id: "USR-004",
    name: "Sheila Suede",
    email: "Sheila@horeca.net",
    googleAccount: "sheila.suede@horeca.net",
    password: "#Suede2026",
    role: "manager",
    status: "active",
    department: "Hotel Front Office & Room Operations",
    title: "Hotel General Operations Director",
    subsystemsAllowed: ["hotel_mngt", "finance"],
    createdAt: "2026-08-20",
    avatarBg: "from-sky-600 to-sky-800"
  },

  // 5. Restaurant F&B Operations General Manager
  {
    id: "USR-005",
    name: "Charles Tiu",
    email: "Charles@horeca.net",
    googleAccount: "charles.tiu@horeca.net",
    password: "#Tiu2026",
    role: "manager",
    status: "active",
    department: "Food & Beverage Operations",
    title: "F&B Operations General Manager",
    subsystemsAllowed: ["resto_mngt", "finance"],
    createdAt: "2026-08-21",
    avatarBg: "from-rose-600 to-rose-800"
  },

  // 6. Procurement & Supply Chain Controller
  {
    id: "USR-006",
    name: "Jordan Tiu",
    email: "Jordan@horeca.net",
    googleAccount: "jordan.tiu@horeca.net",
    password: "#Tiu2027",
    role: "manager",
    status: "active",
    department: "Supply Chain & Purveyor Procurement",
    title: "Procurement & Purveyor Controller",
    subsystemsAllowed: ["supply_chain", "finance"],
    createdAt: "2026-08-21",
    avatarBg: "from-amber-600 to-amber-800"
  },

  // 7. Fleet Logistics & Transport Operations Manager
  {
    id: "USR-007",
    name: "Lourence Piedad",
    email: "Lourence@horeca.net",
    googleAccount: "lourence.piedad@horeca.net",
    password: "#Piedad2026",
    role: "manager",
    status: "active",
    department: "Fleet Logistics & Transport Operations",
    title: "Fleet Operations Manager",
    subsystemsAllowed: ["fleet_ops", "finance"],
    createdAt: "2026-08-22",
    avatarBg: "from-emerald-600 to-emerald-800"
  },

  // 8. Lead Night Auditor & Guest Folio Officer
  {
    id: "USR-008",
    name: "Aira Alcantara",
    email: "Aira@horeca.net",
    googleAccount: "aira.alcantara@horeca.net",
    password: "#Audit2026",
    role: "auditor",
    status: "active",
    department: "Hotel Internal Audit & Reconciliation",
    title: "Senior Night Auditor",
    subsystemsAllowed: ["hotel_mngt", "finance"],
    createdAt: "2026-08-23",
    avatarBg: "from-violet-600 to-violet-800"
  },

  // 9. Kitchen Executive Chef & Palengke Petty Cash Custodian
  {
    id: "USR-009",
    name: "Rolando Perez",
    email: "ChefRolando@horeca.net",
    googleAccount: "rolando.perez@horeca.net",
    password: "#Chef2026",
    role: "operator",
    status: "active",
    department: "Culinary & Kitchen Management",
    title: "Executive Chef & Cash Advance Custodian",
    subsystemsAllowed: ["resto_mngt"],
    createdAt: "2026-08-24",
    avatarBg: "from-orange-600 to-orange-800"
  },

  // 10. Fleet Transport & Shuttle Coordinator
  {
    id: "USR-010",
    name: "Danilo Ramos",
    email: "Danilo@horeca.net",
    googleAccount: "danilo.ramos@horeca.net",
    password: "#Driver2026",
    role: "operator",
    status: "active",
    department: "Transport Dispatch & Shuttles",
    title: "Lead Transport Dispatcher",
    subsystemsAllowed: ["fleet_ops"],
    createdAt: "2026-08-24",
    avatarBg: "from-teal-600 to-teal-800"
  }
];

const MULTI_USERS_STORAGE_KEY = "horeca_system_users";

export const multiUserManager = {
  // Get all registered users from localStorage or initial seed
  getAllUsers(): SystemUserAccount[] {
    try {
      const stored = localStorage.getItem(MULTI_USERS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error reading multi-users from storage", e);
    }
    // Seed initial list
    this.saveUsers(ENTERPRISE_MULTI_USERS);
    return ENTERPRISE_MULTI_USERS;
  },

  // Save users to localStorage
  saveUsers(users: SystemUserAccount[]): void {
    try {
      localStorage.setItem(MULTI_USERS_STORAGE_KEY, JSON.stringify(users));
      window.dispatchEvent(new CustomEvent("horeca-users-updated", { detail: users }));
    } catch (e) {
      console.error("Error saving multi-users", e);
    }
  },

  // Authenticate user against registered accounts
  authenticate(email: string, passwordInput: string): { user: SystemUserAccount | null; error?: string } {
    const users = this.getAllUsers();
    const trimmedEmail = email.trim().toLowerCase();

    const found = users.find(
      (u) => u.email.toLowerCase() === trimmedEmail || u.googleAccount?.toLowerCase() === trimmedEmail
    );

    if (!found) {
      return { user: null, error: "Account not found. Please verify your registered system email address." };
    }

    if (found.status === "suspended") {
      return { user: null, error: "This user account is suspended. Contact the Super Administrator for reactivation." };
    }

    if (found.password !== passwordInput) {
      return { user: null, error: "Incorrect password. Passwords are case-sensitive." };
    }

    // Update lastLogin
    const updated = users.map((u) =>
      u.id === found.id
        ? { ...u, lastLogin: new Date().toISOString().replace("T", " ").substring(0, 19) }
        : u
    );
    this.saveUsers(updated);

    return { user: found };
  },

  // Add a new user account
  addUser(newUser: Omit<SystemUserAccount, "id" | "createdAt">): SystemUserAccount {
    const users = this.getAllUsers();
    const id = `USR-${Math.floor(100 + Math.random() * 900)}`;
    const created: SystemUserAccount = {
      ...newUser,
      id,
      createdAt: new Date().toISOString().split("T")[0]
    };

    const next = [...users, created];
    this.saveUsers(next);
    return created;
  },

  // Update existing user account
  updateUser(id: string, updates: Partial<SystemUserAccount>): void {
    const users = this.getAllUsers();
    const next = users.map((u) => (u.id === id ? { ...u, ...updates } : u));
    this.saveUsers(next);
  },

  // Delete user account
  deleteUser(id: string): void {
    const users = this.getAllUsers();
    const next = users.filter((u) => u.id !== id);
    this.saveUsers(next);
  },

  // Get users for a specific subsystem
  getUsersForSubsystem(subsystemId: "finance" | "hr_payroll" | "hotel_mngt" | "resto_mngt" | "supply_chain" | "fleet_ops"): SystemUserAccount[] {
    const users = this.getAllUsers();
    return users.filter((u) => u.subsystemsAllowed?.includes(subsystemId) || u.role === "superadmin");
  }
};
