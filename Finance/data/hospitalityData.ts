// ==============================================================================
// HOSPITALITY FINANCIAL ERP CORE: CHART OF ACCOUNTS, SEED DATA & SPECIFICATIONS
// Covers 5 Interconnected Subsystems: Hotel PMS, Restaurant POS, HRMS Payroll, Supply Chain, FleetOps
// ==============================================================================

export interface AccountCOA {
  code: string;
  name: string;
  category: "Assets" | "Liabilities" | "Equity" | "Revenues" | "Expenses";
  normalBalance: "Debit" | "Credit";
  moduleTag: "Hotel PMS" | "Restaurant POS" | "HRMS Payroll" | "Supply Chain" | "FleetOps" | "Treasury" | "General";
  description: string;
  financialStatement: "Balance Sheet" | "Income Statement";
}

export const HOSPITALITY_CHART_OF_ACCOUNTS: AccountCOA[] = [
  // ================= ASSETS (1000 - 1999) =================
  {
    code: "1010",
    name: "Front Desk Cash Float",
    category: "Assets",
    normalBalance: "Debit",
    moduleTag: "Hotel PMS",
    description: "Physical cash drawer float at the front desk for guest checkouts and cash settlements.",
    financialStatement: "Balance Sheet"
  },
  {
    code: "1020",
    name: "Restaurant POS Cash Float",
    category: "Assets",
    normalBalance: "Debit",
    moduleTag: "Restaurant POS",
    description: "Point-of-Sale cash drawers for dining room, bar, and room-service settlements.",
    financialStatement: "Balance Sheet"
  },
  {
    code: "1030",
    name: "Operating Bank Account - Primary",
    category: "Assets",
    normalBalance: "Debit",
    moduleTag: "Treasury",
    description: "Main commercial operating account for vendor disbursements, payroll, and merchant settlement transfers.",
    financialStatement: "Balance Sheet"
  },
  {
    code: "1040",
    name: "Merchant Settlement Clearing",
    category: "Assets",
    normalBalance: "Debit",
    moduleTag: "Treasury",
    description: "Credit/debit card swipe settlements in transit from acquiring banks (Visa, Mastercard, GCash).",
    financialStatement: "Balance Sheet"
  },
  {
    code: "1050",
    name: "Petty Cash Vault",
    category: "Assets",
    normalBalance: "Debit",
    moduleTag: "Treasury",
    description: "Imprest petty cash vault reserved for urgent restaurant/hotel operations and localized receipts.",
    financialStatement: "Balance Sheet"
  },
  {
    code: "1200",
    name: "Guest Ledger (In-House Residents)",
    category: "Assets",
    normalBalance: "Debit",
    moduleTag: "Hotel PMS",
    description: "Active folios for registered hotel guests accruing room charges, F&B room service, and amenities.",
    financialStatement: "Balance Sheet"
  },
  {
    code: "1210",
    name: "City Ledger & Corporate Accounts Receivable",
    category: "Assets",
    normalBalance: "Debit",
    moduleTag: "Hotel PMS",
    description: "Direct billing receivables for travel agencies, corporate contract clients, and OTA net billing.",
    financialStatement: "Balance Sheet"
  },
  {
    code: "1310",
    name: "F&B Inventory - Raw Produce & Meats",
    category: "Assets",
    normalBalance: "Debit",
    moduleTag: "Supply Chain",
    description: "Perishable food items, proteins, produce, and culinary pantry supplies stored in walk-in refrigeration.",
    financialStatement: "Balance Sheet"
  },
  {
    code: "1320",
    name: "F&B Inventory - Wine, Beer & Spirits",
    category: "Assets",
    normalBalance: "Debit",
    moduleTag: "Supply Chain",
    description: "Bonded and bar inventory of wines, distilled liquors, craft beers, and bar mixers.",
    financialStatement: "Balance Sheet"
  },
  {
    code: "1330",
    name: "Operating Supplies & Housekeeping Linens",
    category: "Assets",
    normalBalance: "Debit",
    moduleTag: "Hotel PMS",
    description: "Bed linens, bath towels, guest vanity amenities, and cleaning sanitation supplies.",
    financialStatement: "Balance Sheet"
  },
  {
    code: "1510",
    name: "Commercial Kitchen & Hotel Equipment",
    category: "Assets",
    normalBalance: "Debit",
    moduleTag: "General",
    description: "Heavy culinary combi-ovens, espresso machinery, PMS terminals, and commercial HVAC equipment.",
    financialStatement: "Balance Sheet"
  },
  {
    code: "1520",
    name: "Accumulated Depreciation - Equipment",
    category: "Assets",
    normalBalance: "Credit",
    moduleTag: "General",
    description: "Contra-asset accumulating straight-line depreciation of kitchen and hotel machinery.",
    financialStatement: "Balance Sheet"
  },
  {
    code: "1530",
    name: "Transportation & Fleet Vehicles",
    category: "Assets",
    normalBalance: "Debit",
    moduleTag: "FleetOps",
    description: "Fleet shuttle vans, utility refrigerated trucks, and guest transport vehicles.",
    financialStatement: "Balance Sheet"
  },
  {
    code: "1540",
    name: "Accumulated Depreciation - Fleet Vehicles",
    category: "Assets",
    normalBalance: "Credit",
    moduleTag: "FleetOps",
    description: "Contra-asset tracking straight-line monthly depreciation on fleet vehicles.",
    financialStatement: "Balance Sheet"
  },

  // ================= LIABILITIES (2000 - 2999) =================
  {
    code: "2010",
    name: "Trade Accounts Payable",
    category: "Liabilities",
    normalBalance: "Credit",
    moduleTag: "Supply Chain",
    description: "Unpaid vendor purchase orders for food purveyors, meat wholesalers, beverage distributors, and utilities.",
    financialStatement: "Balance Sheet"
  },
  {
    code: "2020",
    name: "Guest Advance Booking Deposits",
    category: "Liabilities",
    normalBalance: "Credit",
    moduleTag: "Hotel PMS",
    description: "Unearned revenues and deposit guarantees held for future room bookings and banquet reservations.",
    financialStatement: "Balance Sheet"
  },
  {
    code: "2030",
    name: "Fleet Fuel & Commercial Maintenance Payable",
    category: "Liabilities",
    normalBalance: "Credit",
    moduleTag: "FleetOps",
    description: "Payable obligations to Petron/Shell fleet fuel cards and certified automotive service centers.",
    financialStatement: "Balance Sheet"
  },
  {
    code: "2110",
    name: "Accrued Payroll & Wage Clearing",
    category: "Liabilities",
    normalBalance: "Credit",
    moduleTag: "HRMS Payroll",
    description: "Earned staff salaries, service charge shares, and executive compensation awaiting disbursement.",
    financialStatement: "Balance Sheet"
  },
  {
    code: "2120",
    name: "Withholding Tax Payable (WHT)",
    category: "Liabilities",
    normalBalance: "Credit",
    moduleTag: "General",
    description: "Expanded withholding tax (2% on suppliers, 10% on professional fees) and compensation WHT withheld for BIR.",
    financialStatement: "Balance Sheet"
  },
  {
    code: "2130",
    name: "Output Value Added Tax (VAT 12%)",
    category: "Liabilities",
    normalBalance: "Credit",
    moduleTag: "General",
    description: "12% statutory value added tax collected from guest folios and restaurant POS guest checks.",
    financialStatement: "Balance Sheet"
  },
  {
    code: "2200",
    name: "Service Charge Payable (85% Staff Pool)",
    category: "Liabilities",
    normalBalance: "Credit",
    moduleTag: "HRMS Payroll",
    description: "Mandatory 85% share of 10% statutory hospitality service charge collected for rank-and-file distribution.",
    financialStatement: "Balance Sheet"
  },

  // ================= EQUITY (3000 - 3999) =================
  {
    code: "3010",
    name: "Contributed Hospitality Capital",
    category: "Equity",
    normalBalance: "Credit",
    moduleTag: "General",
    description: "Owner and shareholder equity capital invested in the property infrastructure.",
    financialStatement: "Balance Sheet"
  },
  {
    code: "3020",
    name: "Retained Earnings - Cumulative",
    category: "Equity",
    normalBalance: "Credit",
    moduleTag: "General",
    description: "Prior fiscal periods' cumulative undistributed operating earnings and net income.",
    financialStatement: "Balance Sheet"
  },

  // ================= REVENUES (4000 - 4999) =================
  {
    code: "4010",
    name: "Hotel Room Revenue - Deluxe & Suites",
    category: "Revenues",
    normalBalance: "Credit",
    moduleTag: "Hotel PMS",
    description: "Gross lodging accommodation charges generated across standard rooms, executive suites, and villas.",
    financialStatement: "Income Statement"
  },
  {
    code: "4020",
    name: "Restaurant Food Sales - Main Dining",
    category: "Revenues",
    normalBalance: "Credit",
    moduleTag: "Restaurant POS",
    description: "Revenue from breakfast buffet, lunch, dinner service, and in-room dining food tickets.",
    financialStatement: "Income Statement"
  },
  {
    code: "4030",
    name: "Beverage & Bar Sales - Liquor & Wines",
    category: "Revenues",
    normalBalance: "Credit",
    moduleTag: "Restaurant POS",
    description: "Bar revenue from artisan cocktails, draft beers, specialty coffees, and sommelier bottle selections.",
    financialStatement: "Income Statement"
  },
  {
    code: "4040",
    name: "Banquet, Conference & Event Revenue",
    category: "Revenues",
    normalBalance: "Credit",
    moduleTag: "Hotel PMS",
    description: "Catering and venue rental fees from weddings, corporate summits, and private event packages.",
    financialStatement: "Income Statement"
  },
  {
    code: "4050",
    name: "Spa, Wellness & Laundry Revenue",
    category: "Revenues",
    normalBalance: "Credit",
    moduleTag: "Hotel PMS",
    description: "Ancillary hospitality earnings from spa treatments, guest laundry service, and mini-bar consumption.",
    financialStatement: "Income Statement"
  },
  {
    code: "4300",
    name: "Fleet Logistics, Freight & Shuttle Transport Revenue",
    category: "Revenues",
    normalBalance: "Credit",
    moduleTag: "FleetOps",
    description: "Gross revenue generated from airport VIP shuttle charters, cross-island logistics, and corporate transport bookings.",
    financialStatement: "Income Statement"
  },

  // ================= EXPENSES (5000 - 5999) =================
  {
    code: "5010",
    name: "Cost of Goods Sold - Fresh Produce & Meats",
    category: "Expenses",
    normalBalance: "Debit",
    moduleTag: "Supply Chain",
    description: "Direct cost of consumed culinary ingredients, seafood, meats, and dairy for food preparation.",
    financialStatement: "Income Statement"
  },
  {
    code: "5020",
    name: "Cost of Goods Sold - Beverages & Spirits",
    category: "Expenses",
    normalBalance: "Debit",
    moduleTag: "Supply Chain",
    description: "Direct bottle cost of wines, liqueurs, and beverage syrups poured in service.",
    financialStatement: "Income Statement"
  },
  {
    code: "5110",
    name: "Executive & Management Salaries",
    category: "Expenses",
    normalBalance: "Debit",
    moduleTag: "HRMS Payroll",
    description: "Compensation for General Manager, Executive Chef, Financial Controller, and Department Heads.",
    financialStatement: "Income Statement"
  },
  {
    code: "5120",
    name: "Frontline Operational Staff Wages",
    category: "Expenses",
    normalBalance: "Debit",
    moduleTag: "HRMS Payroll",
    description: "Direct labor compensation for front desk agents, line cooks, servers, and housekeeping staff.",
    financialStatement: "Income Statement"
  },
  {
    code: "5210",
    name: "Room Amenities & Housekeeping Supplies",
    category: "Expenses",
    normalBalance: "Debit",
    moduleTag: "Hotel PMS",
    description: "Soaps, shampoos, bath robes, slippers, and commercial laundry sanitizers.",
    financialStatement: "Income Statement"
  },
  {
    code: "5220",
    name: "Electricity, Power & HVAC Utilities",
    category: "Expenses",
    normalBalance: "Debit",
    moduleTag: "General",
    description: "Monthly electrical utility grid consumption for chiller systems, lighting, and kitchen freezers.",
    financialStatement: "Income Statement"
  },
  {
    code: "5230",
    name: "Water & Municipal Sanitation Utilities",
    category: "Expenses",
    normalBalance: "Debit",
    moduleTag: "General",
    description: "Water district utility costs for guest suites, swimming pool filtration, and laundry operations.",
    financialStatement: "Income Statement"
  },
  {
    code: "5410",
    name: "Fleet Fuel & Commercial Operating Expenses",
    category: "Expenses",
    normalBalance: "Debit",
    moduleTag: "FleetOps",
    description: "Commercial diesel, gasoline, and fleet fuel card expenses incurred across all operational vehicles.",
    financialStatement: "Income Statement"
  },
  {
    code: "5420",
    name: "Fleet Maintenance, Tires & Mechanical Repairs",
    category: "Expenses",
    normalBalance: "Debit",
    moduleTag: "FleetOps",
    description: "Scheduled preventive maintenance, brake servicing, tire replacements, and body repair invoices.",
    financialStatement: "Income Statement"
  },
  {
    code: "5430",
    name: "Fleet Driver Allowances & Tollway Expenses",
    category: "Expenses",
    normalBalance: "Debit",
    moduleTag: "FleetOps",
    description: "Expressway RFID toll load, driver per diems, and cross-island logistics transit fees.",
    financialStatement: "Income Statement"
  },
  {
    code: "5440",
    name: "Vendor Late Surcharges & Penalty Expense",
    category: "Expenses",
    normalBalance: "Debit",
    moduleTag: "General",
    description: "Incremental late payment charges and surcharges levied on overdue supplier obligations.",
    financialStatement: "Income Statement"
  }
];

// ==============================================================================
// PRODUCTION-GRADE POSTGRESQL DDL & SEED CONTENT
// ==============================================================================

export const POSTGRESQL_DDL_AND_SEED = `-- ==============================================================================
-- POSTGRESQL PRODUCTION DDL & INITIALIZATION SCRIPT
-- Hospitality ERP General Ledger Core (Docker Desktop Compatible)
-- ==============================================================================

-- 1. EXTENSIONS & SCHEMA
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS journal_entry_lines CASCADE;
DROP TABLE IF EXISTS journal_entries CASCADE;
DROP TABLE IF EXISTS chart_of_accounts CASCADE;

-- 2. CHART OF ACCOUNTS TABLE
CREATE TABLE chart_of_accounts (
    account_code VARCHAR(10) PRIMARY KEY,
    account_name VARCHAR(120) NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('Assets', 'Liabilities', 'Equity', 'Revenues', 'Expenses')),
    normal_balance VARCHAR(10) NOT NULL CHECK (normal_balance IN ('Debit', 'Credit')),
    module_tag VARCHAR(30) NOT NULL,
    financial_statement VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. JOURNAL ENTRIES MASTER TABLE
CREATE TABLE journal_entries (
    entry_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    transaction_date DATE NOT NULL,
    source_module VARCHAR(30) NOT NULL,
    event_description TEXT NOT NULL,
    total_amount NUMERIC(15, 2) NOT NULL,
    is_balanced BOOLEAN NOT NULL DEFAULT TRUE,
    approval_status VARCHAR(20) NOT NULL DEFAULT 'COMMITTED',
    posted_by VARCHAR(80) NOT NULL,
    approved_by VARCHAR(80),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. JOURNAL ENTRY LINES TABLE (DOUBLE-ENTRY DETAIL)
CREATE TABLE journal_entry_lines (
    line_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID NOT NULL REFERENCES journal_entries(entry_id) ON DELETE CASCADE,
    account_code VARCHAR(10) NOT NULL REFERENCES chart_of_accounts(account_code),
    line_memo VARCHAR(255) NOT NULL,
    debit_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    credit_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    line_order INT NOT NULL,
    CONSTRAINT chk_positive_amounts CHECK (debit_amount >= 0 AND credit_amount >= 0),
    CONSTRAINT chk_debit_or_credit CHECK ((debit_amount > 0 AND credit_amount = 0) OR (credit_amount > 0 AND debit_amount = 0))
);

CREATE INDEX idx_lines_account ON journal_entry_lines(account_code);
CREATE INDEX idx_lines_entry ON journal_entry_lines(entry_id);
CREATE INDEX idx_entries_date ON journal_entries(transaction_date);

-- ==============================================================================
-- SEED DATA: POPULATE CHART OF ACCOUNTS
-- ==============================================================================

INSERT INTO chart_of_accounts (account_code, account_name, category, normal_balance, module_tag, financial_statement) VALUES
('1010', 'Front Desk Cash Float', 'Assets', 'Debit', 'Hotel PMS', 'Balance Sheet'),
('1020', 'Restaurant POS Cash Float', 'Assets', 'Debit', 'Restaurant POS', 'Balance Sheet'),
('1030', 'Operating Bank Account - Primary', 'Assets', 'Debit', 'Treasury', 'Balance Sheet'),
('1040', 'Merchant Settlement Clearing', 'Assets', 'Debit', 'Treasury', 'Balance Sheet'),
('1050', 'Petty Cash Vault', 'Assets', 'Debit', 'Treasury', 'Balance Sheet'),
('1200', 'Guest Ledger (In-House Residents)', 'Assets', 'Debit', 'Hotel PMS', 'Balance Sheet'),
('1210', 'City Ledger & Corporate AR', 'Assets', 'Debit', 'Hotel PMS', 'Balance Sheet'),
('1310', 'F&B Inventory - Raw Produce & Meats', 'Assets', 'Debit', 'Supply Chain', 'Balance Sheet'),
('1320', 'F&B Inventory - Wine, Beer & Spirits', 'Assets', 'Debit', 'Supply Chain', 'Balance Sheet'),
('1330', 'Operating Supplies & Housekeeping Linens', 'Assets', 'Debit', 'Hotel PMS', 'Balance Sheet'),
('1510', 'Commercial Kitchen & Hotel Equipment', 'Assets', 'Debit', 'General', 'Balance Sheet'),
('2010', 'Trade Accounts Payable', 'Liabilities', 'Credit', 'Supply Chain', 'Balance Sheet'),
('2020', 'Guest Advance Booking Deposits', 'Liabilities', 'Credit', 'Hotel PMS', 'Balance Sheet'),
('2110', 'Accrued Payroll & Wage Clearing', 'Liabilities', 'Credit', 'HRMS Payroll', 'Balance Sheet'),
('2120', 'Withholding Tax Payable (WHT)', 'Liabilities', 'Credit', 'General', 'Balance Sheet'),
('2130', 'Output Value Added Tax (VAT 12%)', 'Liabilities', 'Credit', 'General', 'Balance Sheet'),
('2200', 'Service Charge Payable (85% Staff Pool)', 'Liabilities', 'Credit', 'HRMS Payroll', 'Balance Sheet'),
('3010', 'Contributed Hospitality Capital', 'Equity', 'Credit', 'General', 'Balance Sheet'),
('3020', 'Retained Earnings - Cumulative', 'Equity', 'Credit', 'General', 'Balance Sheet'),
('4010', 'Hotel Room Revenue - Deluxe & Suites', 'Revenues', 'Credit', 'Hotel PMS', 'Income Statement'),
('4020', 'Restaurant Food Sales - Main Dining', 'Revenues', 'Credit', 'Restaurant POS', 'Income Statement'),
('4030', 'Beverage & Bar Sales - Liquor & Wines', 'Revenues', 'Credit', 'Restaurant POS', 'Income Statement'),
('4040', 'Banquet, Conference & Event Revenue', 'Revenues', 'Credit', 'Hotel PMS', 'Income Statement'),
('4050', 'Spa, Wellness & Laundry Revenue', 'Revenues', 'Credit', 'Hotel PMS', 'Income Statement'),
('5010', 'Cost of Goods Sold - Fresh Produce & Meats', 'Expenses', 'Debit', 'Supply Chain', 'Income Statement'),
('5020', 'Cost of Goods Sold - Beverages & Spirits', 'Expenses', 'Debit', 'Supply Chain', 'Income Statement'),
('5110', 'Executive & Management Salaries', 'Expenses', 'Debit', 'HRMS Payroll', 'Income Statement'),
('5120', 'Frontline Operational Staff Wages', 'Expenses', 'Debit', 'HRMS Payroll', 'Income Statement'),
('5210', 'Room Amenities & Housekeeping Supplies', 'Expenses', 'Debit', 'Hotel PMS', 'Income Statement'),
('5220', 'Electricity, Power & HVAC Utilities', 'Expenses', 'Debit', 'General', 'Income Statement'),
('5230', 'Water & Municipal Sanitation Utilities', 'Expenses', 'Debit', 'General', 'Income Statement'),
('5240', 'Airport Shuttle Fleet Fuel & Maintenance', 'Expenses', 'Debit', 'General', 'Income Statement');

-- ==============================================================================
-- BALANCED PRODUCTION-GRADE TRANSACTION EVENTS
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- EVENT 1: Hotel PMS Night Audit Checkout Batch
-- ------------------------------------------------------------------------------
WITH new_entry AS (
    INSERT INTO journal_entries (
        entry_id, reference_number, transaction_date, source_module,
        event_description, total_amount, is_balanced, approval_status, posted_by, approved_by
    ) VALUES (
        'a1010000-0000-0000-0000-000000000001',
        'PMS-NA-2026-0818',
        '2026-08-18',
        'Hotel PMS',
        'Night Audit Batch Checkout: 14 Guest Rooms (Cash, Credit Card, Room Charges, VAT & Service Charge)',
        147840.00,
        TRUE,
        'COMMITTED',
        'PMS Night Auditor Daemon',
        'Super Administrator'
    ) RETURNING entry_id
)
INSERT INTO journal_entry_lines (entry_id, account_code, line_memo, debit_amount, credit_amount, line_order) VALUES
('a1010000-0000-0000-0000-000000000001', '1010', 'Front Desk Cash Collections - Express Checkouts', 35000.00, 0.00, 1),
('a1010000-0000-0000-0000-000000000001', '1040', 'Electronic Card Settlements (Visa/MC) Terminal Batch', 112840.00, 0.00, 2),
('a1010000-0000-0000-0000-000000000001', '4010', 'Gross Room Lodging Revenue - 14 Folios', 0.00, 120000.00, 3),
('a1010000-0000-0000-0000-000000000001', '2130', 'Government Output Value Added Tax (12% VAT)', 0.00, 15840.00, 4),
('a1010000-0000-0000-0000-000000000001', '2200', 'Mandatory 10% Service Charge Distribution Pool (85%)', 0.00, 10200.00, 5),
('a1010000-0000-0000-0000-000000000001', '4050', 'Mini-Bar & Spa Guest Consumption Net Retention', 0.00, 1800.00, 6);
-- Proof of Balance: Debits = 35000 + 112840 = 147840.00 | Credits = 120000 + 15840 + 10200 + 1800 = 147840.00

-- ------------------------------------------------------------------------------
-- EVENT 2: Restaurant POS Dinner Service Daily Summary
-- ------------------------------------------------------------------------------
WITH new_entry AS (
    INSERT INTO journal_entries (
        entry_id, reference_number, transaction_date, source_module,
        event_description, total_amount, is_balanced, approval_status, posted_by, approved_by
    ) VALUES (
        'b2020000-0000-0000-0000-000000000002',
        'POS-DS-2026-0818',
        '2026-08-18',
        'Restaurant POS',
        'Main Dining Room & Bar Dinner Service Z-Report Closeout (94 Guest Covers)',
        86240.00,
        TRUE,
        'COMMITTED',
        'F&B Cashier Controller',
        'Super Administrator'
    ) RETURNING entry_id
)
INSERT INTO journal_entry_lines (entry_id, account_code, line_memo, debit_amount, credit_amount, line_order) VALUES
('b2020000-0000-0000-0000-000000000002', '1020', 'Dining Room POS Cash Drawer Intake', 24500.00, 0.00, 1),
('b2020000-0000-0000-0000-000000000002', '1040', 'Restaurant Terminal Card Swipes & E-Wallets', 61740.00, 0.00, 2),
('b2020000-0000-0000-0000-000000000002', '4020', 'Dinner Kitchen Food Sales Net Revenue', 0.00, 48000.00, 3),
('b2020000-0000-0000-0000-000000000002', '4030', 'Bar Cocktails, Wine & Craft Beer Sales', 0.00, 22000.00, 4),
('b2020000-0000-0000-0000-000000000002', '2130', 'Output VAT (12%) on Food & Beverage Sales', 0.00, 8400.00, 5),
('b2020000-0000-0000-0000-000000000002', '2200', '10% Restaurant Service Charge (85% Staff Pool)', 0.00, 5950.00, 6),
('b2020000-0000-0000-0000-000000000002', '4060', 'Management 15% Service Charge Retained Share', 0.00, 1890.00, 7);
-- Proof of Balance: Debits = 24500 + 61740 = 86240.00 | Credits = 48000 + 22000 + 8400 + 5950 + 1890 = 86240.00

-- ------------------------------------------------------------------------------
-- EVENT 3: HRMS Executive & Operational Off-Cycle Payroll Clearing
-- ------------------------------------------------------------------------------
WITH new_entry AS (
    INSERT INTO journal_entries (
        entry_id, reference_number, transaction_date, source_module,
        event_description, total_amount, is_balanced, approval_status, posted_by, approved_by
    ) VALUES (
        'c3030000-0000-0000-0000-000000000003',
        'HRMS-PAY-2026-0819',
        '2026-08-19',
        'HRMS Payroll',
        'Mid-Month Executive & Department Head Compensation Clearing Run',
        185000.00,
        TRUE,
        'COMMITTED',
        'HRMS Automated Clearing Engine',
        'Super Administrator'
    ) RETURNING entry_id
)
INSERT INTO journal_entry_lines (entry_id, account_code, line_memo, debit_amount, credit_amount, line_order) VALUES
('c3030000-0000-0000-0000-000000000003', '5110', 'Gross Executive & Leadership Salaries Expense', 145000.00, 0.00, 1),
('c3030000-0000-0000-0000-000000000003', '5120', 'Duty Supervisors & Key Staff Direct Wage Allocations', 40000.00, 0.00, 2),
('c3030000-0000-0000-0000-000000000003', '2120', 'BIR Expanded Compensation Withholding Tax Withheld', 0.00, 22500.00, 3),
('c3030000-0000-0000-0000-000000000003', '2110', 'Mandatory SSS/PhilHealth Employee Statutory Deductions', 0.00, 8500.00, 4),
('c3030000-0000-0000-0000-000000000003', '1030', 'Net Bank Electronic Fund Transfer (EFT Payroll Direct Deposit)', 0.00, 154000.00, 5);
-- Proof of Balance: Debits = 145000 + 40000 = 185000.00 | Credits = 22500 + 8500 + 154000 = 185000.00

-- ------------------------------------------------------------------------------
-- EVENT 4: Supply Chain Bulk Fresh Produce & Prime Meat PO Invoice
-- ------------------------------------------------------------------------------
WITH new_entry AS (
    INSERT INTO journal_entries (
        entry_id, reference_number, transaction_date, source_module,
        event_description, total_amount, is_balanced, approval_status, posted_by, approved_by
    ) VALUES (
        'd4040000-0000-0000-0000-000000000004',
        'SCM-PO-2026-904',
        '2026-08-19',
        'Supply Chain',
        'Central Kitchen Wholesale Inventory Receipt: USDA Prime Cuts, Fresh Atlantic Salmon & Dairy',
        112000.00,
        TRUE,
        'COMMITTED',
        'Procurement Logistics Lead',
        'Super Administrator'
    ) RETURNING entry_id
)
INSERT INTO journal_entry_lines (entry_id, account_code, line_memo, debit_amount, credit_amount, line_order) VALUES
('d4040000-0000-0000-0000-000000000004', '1310', 'Fresh Proteins, Meats & Kitchen Inventory Inflow', 78000.00, 0.00, 1),
('d4040000-0000-0000-0000-000000000004', '1320', 'Bar House Wines & Beverage Inventory Inflow', 22000.00, 0.00, 2),
('d4040000-0000-0000-0000-000000000004', '5030', 'Specialized Food Storage Packaging & Freight Surcharge', 12000.00, 0.00, 3),
('d4040000-0000-0000-0000-000000000004', '2010', 'Trade Accounts Payable - HighSeas Meat & Seafood Corp', 0.00, 109760.00, 4),
('d4040000-0000-0000-0000-000000000004', '2120', 'Creditable Withholding Tax (BIR Form 2307 2% on Goods)', 0.00, 2240.00, 5);
-- Proof of Balance: Debits = 78000 + 22000 + 12000 = 112000.00 | Credits = 109760 + 2240 = 112000.00
`;

// ==============================================================================
// FIELD DATA DICTIONARY & UI LAYOUT SPECIFICATION
// ==============================================================================

export interface FieldSpec {
  columnLabel: string;
  dbField: string;
  pgDataType: string;
  align: "left" | "center" | "right";
  formatMask: string;
  uiTarget: string;
  description: string;
}

export const GL_DATA_DICTIONARY: FieldSpec[] = [
  {
    columnLabel: "Posting Date",
    dbField: "transaction_date",
    pgDataType: "DATE NOT NULL",
    align: "center",
    formatMask: "YYYY-MM-DD (e.g., 2026-08-19)",
    uiTarget: "Fiscal Period Selector",
    description: "The fiscal accounting date when the transaction occurred and impact the ledger."
  },
  {
    columnLabel: "Reference Code",
    dbField: "reference_number",
    pgDataType: "VARCHAR(50) UNIQUE",
    align: "left",
    formatMask: "[MODULE]-[TYPE]-[YYYY]-[SEQ] (e.g., PMS-NA-2026-0818)",
    uiTarget: "Transaction Source Modal",
    description: "Unique document identifier generated by the originating subsystem for cross-reconciliation."
  },
  {
    columnLabel: "Source Module",
    dbField: "source_module",
    pgDataType: "VARCHAR(30)",
    align: "left",
    formatMask: "Badge Tag: Hotel PMS | Restaurant POS | HRMS Payroll | Supply Chain",
    uiTarget: "Subsystem Hub Router",
    description: "Identifies which operational subsystem generated the journal transaction."
  },
  {
    columnLabel: "Account Code",
    dbField: "account_code",
    pgDataType: "VARCHAR(10) REFERENCES COA",
    align: "left",
    formatMask: "4-Digit Code (e.g., 1010, 4010, 5110)",
    uiTarget: "COA Drilldown Modal",
    description: "Primary key in the Chart of Accounts determining normal balance and financial statement class."
  },
  {
    columnLabel: "Account Title",
    dbField: "account_name",
    pgDataType: "VARCHAR(120)",
    align: "left",
    formatMask: "Title Case String (e.g., Front Desk Cash Float)",
    uiTarget: "Account Ledger Report",
    description: "Human-readable official accounting description corresponding to the 4-digit code."
  },
  {
    columnLabel: "Journal Memo",
    dbField: "line_memo",
    pgDataType: "VARCHAR(255)",
    align: "left",
    formatMask: "Standard Text String (Maskable for PII/Sensitive details)",
    uiTarget: "Audit Trail Flyout",
    description: "Specific descriptive note indicating the operational purpose and breakdown of the line item."
  },
  {
    columnLabel: "Debit (PHP)",
    dbField: "debit_amount",
    pgDataType: "NUMERIC(15, 2) DEFAULT 0.00",
    align: "right",
    formatMask: "₱#,##0.00 (Monospace font, 0.00 if Credit)",
    uiTarget: "Balance Verification Engine",
    description: "Debit balance incrementing Assets/Expenses and decrementing Liabilities/Equity/Revenues."
  },
  {
    columnLabel: "Credit (PHP)",
    dbField: "credit_amount",
    pgDataType: "NUMERIC(15, 2) DEFAULT 0.00",
    align: "right",
    formatMask: "₱#,##0.00 (Monospace font, 0.00 if Debit)",
    uiTarget: "Balance Verification Engine",
    description: "Credit balance incrementing Liabilities/Equity/Revenues and decrementing Assets/Expenses."
  },
  {
    columnLabel: "Running Balance",
    dbField: "running_balance (Derived)",
    pgDataType: "NUMERIC(15, 2) COMPUTED",
    align: "right",
    formatMask: "₱#,##0.00 (Bold color-coded: Green = Asset/Surplus, Red = Deficit)",
    uiTarget: "Account Statement View",
    description: "Cumulative chronological mathematical summation of debits and credits per individual account."
  },
  {
    columnLabel: "Governance Status",
    dbField: "approval_status",
    pgDataType: "VARCHAR(20) DEFAULT 'COMMITTED'",
    align: "center",
    formatMask: "Pill Badge: PENDING | APPROVED | COMMITTED | REJECTED",
    uiTarget: "Governance Approval Queue",
    description: "State in the two-tier Admin -> Super Admin approval workflow."
  }
];

// Initial seed array for the in-app live state
export const INITIAL_LEDGER_POSTS = [
  {
    id: "LP-001",
    entryId: "a1010000-0000-0000-0000-000000000001",
    date: "2026-08-18",
    ref: "PMS-NA-2026-0818",
    sourceModule: "Hotel PMS",
    accountCode: "1010",
    accountName: "1010 - Front Desk Cash Float",
    memo: "Front Desk Cash Collections - Express Checkouts",
    debit: 35000.00,
    credit: 0.00,
    status: "COMMITTED",
    postedBy: "PMS Night Auditor Daemon",
    approvedBy: "Super Administrator"
  },
  {
    id: "LP-002",
    entryId: "a1010000-0000-0000-0000-000000000001",
    date: "2026-08-18",
    ref: "PMS-NA-2026-0818",
    sourceModule: "Hotel PMS",
    accountCode: "1040",
    accountName: "1040 - Merchant Settlement Clearing",
    memo: "Electronic Card Settlements (Visa/MC) Terminal Batch",
    debit: 112840.00,
    credit: 0.00,
    status: "COMMITTED",
    postedBy: "PMS Night Auditor Daemon",
    approvedBy: "Super Administrator"
  },
  {
    id: "LP-003",
    entryId: "a1010000-0000-0000-0000-000000000001",
    date: "2026-08-18",
    ref: "PMS-NA-2026-0818",
    sourceModule: "Hotel PMS",
    accountCode: "4010",
    accountName: "4010 - Hotel Room Revenue - Deluxe & Suites",
    memo: "Gross Room Lodging Revenue - 14 Folios",
    debit: 0.00,
    credit: 120000.00,
    status: "COMMITTED",
    postedBy: "PMS Night Auditor Daemon",
    approvedBy: "Super Administrator"
  },
  {
    id: "LP-004",
    entryId: "a1010000-0000-0000-0000-000000000001",
    date: "2026-08-18",
    ref: "PMS-NA-2026-0818",
    sourceModule: "Hotel PMS",
    accountCode: "2130",
    accountName: "2130 - Output Value Added Tax (VAT 12%)",
    memo: "Government Output Value Added Tax (12% VAT)",
    debit: 0.00,
    credit: 15840.00,
    status: "COMMITTED",
    postedBy: "PMS Night Auditor Daemon",
    approvedBy: "Super Administrator"
  },
  {
    id: "LP-005",
    entryId: "a1010000-0000-0000-0000-000000000001",
    date: "2026-08-18",
    ref: "PMS-NA-2026-0818",
    sourceModule: "Hotel PMS",
    accountCode: "2200",
    accountName: "2200 - Service Charge Payable (85% Staff Pool)",
    memo: "Mandatory 10% Service Charge Distribution Pool (85%)",
    debit: 0.00,
    credit: 10200.00,
    status: "COMMITTED",
    postedBy: "PMS Night Auditor Daemon",
    approvedBy: "Super Administrator"
  },
  {
    id: "LP-006",
    entryId: "a1010000-0000-0000-0000-000000000001",
    date: "2026-08-18",
    ref: "PMS-NA-2026-0818",
    sourceModule: "Hotel PMS",
    accountCode: "4050",
    accountName: "4050 - Spa, Wellness & Laundry Revenue",
    memo: "Mini-Bar & Spa Guest Consumption Net Retention",
    debit: 0.00,
    credit: 1800.00,
    status: "COMMITTED",
    postedBy: "PMS Night Auditor Daemon",
    approvedBy: "Super Administrator"
  },
  {
    id: "LP-007",
    entryId: "b2020000-0000-0000-0000-000000000002",
    date: "2026-08-18",
    ref: "POS-DS-2026-0818",
    sourceModule: "Restaurant POS",
    accountCode: "1020",
    accountName: "1020 - Restaurant POS Cash Float",
    memo: "Dining Room POS Cash Drawer Intake",
    debit: 24500.00,
    credit: 0.00,
    status: "COMMITTED",
    postedBy: "F&B Cashier Controller",
    approvedBy: "Super Administrator"
  },
  {
    id: "LP-008",
    entryId: "b2020000-0000-0000-0000-000000000002",
    date: "2026-08-18",
    ref: "POS-DS-2026-0818",
    sourceModule: "Restaurant POS",
    accountCode: "1040",
    accountName: "1040 - Merchant Settlement Clearing",
    memo: "Restaurant Terminal Card Swipes & E-Wallets",
    debit: 61740.00,
    credit: 0.00,
    status: "COMMITTED",
    postedBy: "F&B Cashier Controller",
    approvedBy: "Super Administrator"
  },
  {
    id: "LP-009",
    entryId: "b2020000-0000-0000-0000-000000000002",
    date: "2026-08-18",
    ref: "POS-DS-2026-0818",
    sourceModule: "Restaurant POS",
    accountCode: "4020",
    accountName: "4020 - Restaurant Food Sales - Main Dining",
    memo: "Dinner Kitchen Food Sales Net Revenue",
    debit: 0.00,
    credit: 48000.00,
    status: "COMMITTED",
    postedBy: "F&B Cashier Controller",
    approvedBy: "Super Administrator"
  },
  {
    id: "LP-010",
    entryId: "b2020000-0000-0000-0000-000000000002",
    date: "2026-08-18",
    ref: "POS-DS-2026-0818",
    sourceModule: "Restaurant POS",
    accountCode: "4030",
    accountName: "4030 - Beverage & Bar Sales - Liquor & Wines",
    memo: "Bar Cocktails, Wine & Craft Beer Sales",
    debit: 0.00,
    credit: 22000.00,
    status: "COMMITTED",
    postedBy: "F&B Cashier Controller",
    approvedBy: "Super Administrator"
  },
  {
    id: "LP-011",
    entryId: "b2020000-0000-0000-0000-000000000002",
    date: "2026-08-18",
    ref: "POS-DS-2026-0818",
    sourceModule: "Restaurant POS",
    accountCode: "2130",
    accountName: "2130 - Output Value Added Tax (VAT 12%)",
    memo: "Output VAT (12%) on Food & Beverage Sales",
    debit: 0.00,
    credit: 8400.00,
    status: "COMMITTED",
    postedBy: "F&B Cashier Controller",
    approvedBy: "Super Administrator"
  },
  {
    id: "LP-012",
    entryId: "b2020000-0000-0000-0000-000000000002",
    date: "2026-08-18",
    ref: "POS-DS-2026-0818",
    sourceModule: "Restaurant POS",
    accountCode: "2200",
    accountName: "2200 - Service Charge Payable (85% Staff Pool)",
    memo: "10% Restaurant Service Charge (85% Staff Pool)",
    debit: 0.00,
    credit: 5950.00,
    status: "COMMITTED",
    postedBy: "F&B Cashier Controller",
    approvedBy: "Super Administrator"
  },
  {
    id: "LP-013",
    entryId: "b2020000-0000-0000-0000-000000000002",
    date: "2026-08-18",
    ref: "POS-DS-2026-0818",
    sourceModule: "Restaurant POS",
    accountCode: "4060",
    accountName: "4060 - Service Charge Retained Share",
    memo: "Management 15% Service Charge Retained Share",
    debit: 0.00,
    credit: 1890.00,
    status: "COMMITTED",
    postedBy: "F&B Cashier Controller",
    approvedBy: "Super Administrator"
  },
  {
    id: "LP-014",
    entryId: "c3030000-0000-0000-0000-000000000003",
    date: "2026-08-19",
    ref: "HRMS-PAY-2026-0819",
    sourceModule: "HRMS Payroll",
    accountCode: "5110",
    accountName: "5110 - Executive & Management Salaries",
    memo: "Gross Executive & Leadership Salaries Expense",
    debit: 145000.00,
    credit: 0.00,
    status: "COMMITTED",
    postedBy: "HRMS Automated Clearing Engine",
    approvedBy: "Super Administrator"
  },
  {
    id: "LP-015",
    entryId: "c3030000-0000-0000-0000-000000000003",
    date: "2026-08-19",
    ref: "HRMS-PAY-2026-0819",
    sourceModule: "HRMS Payroll",
    accountCode: "5120",
    accountName: "5120 - Frontline Operational Staff Wages",
    memo: "Duty Supervisors & Key Staff Direct Wage Allocations",
    debit: 40000.00,
    credit: 0.00,
    status: "COMMITTED",
    postedBy: "HRMS Automated Clearing Engine",
    approvedBy: "Super Administrator"
  },
  {
    id: "LP-016",
    entryId: "c3030000-0000-0000-0000-000000000003",
    date: "2026-08-19",
    ref: "HRMS-PAY-2026-0819",
    sourceModule: "HRMS Payroll",
    accountCode: "2120",
    accountName: "2120 - Withholding Tax Payable (WHT)",
    memo: "BIR Expanded Compensation Withholding Tax Withheld",
    debit: 0.00,
    credit: 22500.00,
    status: "COMMITTED",
    postedBy: "HRMS Automated Clearing Engine",
    approvedBy: "Super Administrator"
  },
  {
    id: "LP-017",
    entryId: "c3030000-0000-0000-0000-000000000003",
    date: "2026-08-19",
    ref: "HRMS-PAY-2026-0819",
    sourceModule: "HRMS Payroll",
    accountCode: "2110",
    accountName: "2110 - Accrued Payroll & Wage Clearing",
    memo: "Mandatory SSS/PhilHealth Employee Statutory Deductions",
    debit: 0.00,
    credit: 8500.00,
    status: "COMMITTED",
    postedBy: "HRMS Automated Clearing Engine",
    approvedBy: "Super Administrator"
  },
  {
    id: "LP-018",
    entryId: "c3030000-0000-0000-0000-000000000003",
    date: "2026-08-19",
    ref: "HRMS-PAY-2026-0819",
    sourceModule: "HRMS Payroll",
    accountCode: "1030",
    accountName: "1030 - Operating Bank Account - Primary",
    memo: "Net Bank Electronic Fund Transfer (EFT Payroll Direct Deposit)",
    debit: 0.00,
    credit: 154000.00,
    status: "COMMITTED",
    postedBy: "HRMS Automated Clearing Engine",
    approvedBy: "Super Administrator"
  },
  {
    id: "LP-019",
    entryId: "d4040000-0000-0000-0000-000000000004",
    date: "2026-08-19",
    ref: "SCM-PO-2026-904",
    sourceModule: "Supply Chain",
    accountCode: "1310",
    accountName: "1310 - F&B Inventory - Raw Produce & Meats",
    memo: "Fresh Proteins, Meats & Kitchen Inventory Inflow",
    debit: 78000.00,
    credit: 0.00,
    status: "COMMITTED",
    postedBy: "Procurement Logistics Lead",
    approvedBy: "Super Administrator"
  },
  {
    id: "LP-020",
    entryId: "d4040000-0000-0000-0000-000000000004",
    date: "2026-08-19",
    ref: "SCM-PO-2026-904",
    sourceModule: "Supply Chain",
    accountCode: "1320",
    accountName: "1320 - F&B Inventory - Wine, Beer & Spirits",
    memo: "Bar House Wines & Beverage Inventory Inflow",
    debit: 22000.00,
    credit: 0.00,
    status: "COMMITTED",
    postedBy: "Procurement Logistics Lead",
    approvedBy: "Super Administrator"
  },
  {
    id: "LP-021",
    entryId: "d4040000-0000-0000-0000-000000000004",
    date: "2026-08-19",
    ref: "SCM-PO-2026-904",
    sourceModule: "Supply Chain",
    accountCode: "5030",
    accountName: "5030 - Direct Kitchen Supplies & Packaging",
    memo: "Specialized Food Storage Packaging & Freight Surcharge",
    debit: 12000.00,
    credit: 0.00,
    status: "COMMITTED",
    postedBy: "Procurement Logistics Lead",
    approvedBy: "Super Administrator"
  },
  {
    id: "LP-022",
    entryId: "d4040000-0000-0000-0000-000000000004",
    date: "2026-08-19",
    ref: "SCM-PO-2026-904",
    sourceModule: "Supply Chain",
    accountCode: "2010",
    accountName: "2010 - Trade Accounts Payable",
    memo: "Trade Accounts Payable - HighSeas Meat & Seafood Corp",
    debit: 0.00,
    credit: 109760.00,
    status: "COMMITTED",
    postedBy: "Procurement Logistics Lead",
    approvedBy: "Super Administrator"
  },
  {
    id: "LP-023",
    entryId: "d4040000-0000-0000-0000-000000000004",
    date: "2026-08-19",
    ref: "SCM-PO-2026-904",
    sourceModule: "Supply Chain",
    accountCode: "2120",
    accountName: "2120 - Withholding Tax Payable (WHT)",
    memo: "Creditable Withholding Tax (BIR Form 2307 2% on Goods)",
    debit: 0.00,
    credit: 2240.00,
    status: "COMMITTED",
    postedBy: "Procurement Logistics Lead",
    approvedBy: "Super Administrator"
  },
  {
    id: "LP-024",
    entryId: "e5050000-0000-0000-0000-000000000005",
    date: "2026-08-20",
    ref: "FLT-TR-2026-0820",
    sourceModule: "FleetOps",
    accountCode: "1040",
    accountName: "1040 - Merchant Settlement Clearing",
    memo: "Airport VIP Shuttle & Corporate Charter Settlements",
    debit: 45000.00,
    credit: 0.00,
    status: "COMMITTED",
    postedBy: "Fleet Logistics Dispatcher",
    approvedBy: "Super Administrator"
  },
  {
    id: "LP-025",
    entryId: "e5050000-0000-0000-0000-000000000005",
    date: "2026-08-20",
    ref: "FLT-TR-2026-0820",
    sourceModule: "FleetOps",
    accountCode: "4300",
    accountName: "4300 - Fleet Logistics, Freight & Shuttle Transport Revenue",
    memo: "Cross-Island Transport & VIP Charter Gross Revenue",
    debit: 0.00,
    credit: 40178.57,
    status: "COMMITTED",
    postedBy: "Fleet Logistics Dispatcher",
    approvedBy: "Super Administrator"
  },
  {
    id: "LP-026",
    entryId: "e5050000-0000-0000-0000-000000000005",
    date: "2026-08-20",
    ref: "FLT-TR-2026-0820",
    sourceModule: "FleetOps",
    accountCode: "2130",
    accountName: "2130 - Output Value Added Tax (VAT 12%)",
    memo: "12% Output VAT on Fleet Transport Operations",
    debit: 0.00,
    credit: 4821.43,
    status: "COMMITTED",
    postedBy: "Fleet Logistics Dispatcher",
    approvedBy: "Super Administrator"
  },
  {
    id: "LP-027",
    entryId: "f6060000-0000-0000-0000-000000000006",
    date: "2026-08-20",
    ref: "FLT-OPS-2026-0820",
    sourceModule: "FleetOps",
    accountCode: "5410",
    accountName: "5410 - Fleet Fuel & Commercial Operating Expenses",
    memo: "Commercial Fuel Card Diesel Refills (Petron Fleet)",
    debit: 28500.00,
    credit: 0.00,
    status: "COMMITTED",
    postedBy: "Fleet Telematics Supervisor",
    approvedBy: "Super Administrator"
  },
  {
    id: "LP-028",
    entryId: "f6060000-0000-0000-0000-000000000006",
    date: "2026-08-20",
    ref: "FLT-OPS-2026-0820",
    sourceModule: "FleetOps",
    accountCode: "5420",
    accountName: "5420 - Fleet Maintenance, Tires & Mechanical Repairs",
    memo: "Preventive Brake & Engine Servicing (Isuzu Auto Logistics)",
    debit: 14200.00,
    credit: 0.00,
    status: "COMMITTED",
    postedBy: "Fleet Telematics Supervisor",
    approvedBy: "Super Administrator"
  },
  {
    id: "LP-029",
    entryId: "f6060000-0000-0000-0000-000000000006",
    date: "2026-08-20",
    ref: "FLT-OPS-2026-0820",
    sourceModule: "FleetOps",
    accountCode: "2030",
    accountName: "2030 - Fleet Fuel & Commercial Maintenance Payable",
    memo: "Fleet Trade AP - Petron Commercial & Isuzu Caloocan",
    debit: 0.00,
    credit: 41846.00,
    status: "COMMITTED",
    postedBy: "Fleet Telematics Supervisor",
    approvedBy: "Super Administrator"
  },
  {
    id: "LP-030",
    entryId: "f6060000-0000-0000-0000-000000000006",
    date: "2026-08-20",
    ref: "FLT-OPS-2026-0820",
    sourceModule: "FleetOps",
    accountCode: "2120",
    accountName: "2120 - Withholding Tax Payable (WHT)",
    memo: "BIR Form 2307 Expanded Withholding Tax (2% on Fleet Services)",
    debit: 0.00,
    credit: 854.00,
    status: "COMMITTED",
    postedBy: "Fleet Telematics Supervisor",
    approvedBy: "Super Administrator"
  }
];
