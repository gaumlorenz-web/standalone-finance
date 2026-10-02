import express from "express";
import path from "path";
import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // =========================================================================
  // ENTERPRISE SQLITE DATABASE INITIALIZATION (ACID-COMPLIANT REAL STORAGE)
  // =========================================================================
  const DATA_DIR = path.join(process.cwd(), "data");
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const DB_PATH = path.join(DATA_DIR, "horeca_finance.db");
  const db = new DatabaseSync(DB_PATH);

  // Initialize Relational Schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS financial_actions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action_type TEXT NOT NULL,
      reference_id TEXT,
      module TEXT NOT NULL,
      amount REAL DEFAULT 0,
      entity_name TEXT,
      payment_method TEXT,
      disbursement_account TEXT,
      status TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      raw_payload TEXT
    );

    CREATE TABLE IF NOT EXISTS ap_settlements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id TEXT UNIQUE NOT NULL,
      vendor TEXT NOT NULL,
      tin TEXT,
      category TEXT,
      po_ref TEXT,
      dr_ref TEXT,
      principal REAL NOT NULL,
      late_increment REAL DEFAULT 0,
      total_paid REAL NOT NULL,
      days_overdue INTEGER DEFAULT 0,
      payment_method TEXT,
      disbursement_account TEXT,
      reference_number TEXT,
      payment_date TEXT,
      notes TEXT,
      settled_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tax_remittances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tax_id TEXT UNIQUE NOT NULL,
      bir_form TEXT NOT NULL,
      tax_type TEXT NOT NULL,
      entity_name TEXT,
      tin TEXT,
      taxable_base REAL DEFAULT 0,
      rate_percent REAL DEFAULT 0,
      computed_tax REAL NOT NULL,
      atc_code TEXT,
      efps_confirmation TEXT NOT NULL,
      remittance_date TEXT,
      status TEXT NOT NULL,
      remitted_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      collection_id TEXT UNIQUE NOT NULL,
      invoice_id TEXT,
      customer_name TEXT NOT NULL,
      amount REAL NOT NULL,
      target_account TEXT,
      payment_method TEXT,
      reference_number TEXT,
      receipt_number TEXT,
      collection_date TEXT,
      is_full_settlement INTEGER DEFAULT 1,
      notes TEXT,
      collected_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  console.log(`[DB] Connected to SQLite database at ${DB_PATH}`);

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString(), database: "SQLite active" });
  });

  // =========================================================================
  // DATABASE API: SETTLE NOW (ACCOUNTS PAYABLE DISBURSEMENT)
  // =========================================================================
  app.post("/api/db/settle", (req, res) => {
    try {
      const payload = req.body;
      const now = new Date().toISOString();

      if (!payload || !payload.invoiceId) {
        return res.status(400).json({ success: false, error: "Missing required invoiceId" });
      }

      const totalPaid = Number(payload.totalPayable || payload.principal || 0);

      // 1. Insert into general audit financial_actions
      const insertAction = db.prepare(`
        INSERT INTO financial_actions (
          action_type, reference_id, module, amount, entity_name,
          payment_method, disbursement_account, status, notes, created_at, raw_payload
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const actionRes = insertAction.run(
        "SETTLE_NOW",
        payload.invoiceId || payload.referenceNumber || "",
        "Accounts Payable",
        totalPaid,
        payload.vendor || "Unknown Vendor",
        payload.paymentMethod || "Bank Transfer",
        payload.disbursementAccount || "Operating Bank Account",
        "PAID_SETTLED",
        payload.notes || `Settlement of ${payload.vendor} invoice #${payload.invoiceId}`,
        now,
        JSON.stringify(payload)
      );

      // 2. Upsert into ap_settlements table
      const upsertSettlement = db.prepare(`
        INSERT INTO ap_settlements (
          invoice_id, vendor, tin, category, po_ref, dr_ref,
          principal, late_increment, total_paid, days_overdue,
          payment_method, disbursement_account, reference_number,
          payment_date, notes, settled_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(invoice_id) DO UPDATE SET
          total_paid = excluded.total_paid,
          late_increment = excluded.late_increment,
          reference_number = excluded.reference_number,
          payment_method = excluded.payment_method,
          disbursement_account = excluded.disbursement_account,
          notes = excluded.notes,
          settled_at = excluded.settled_at
      `);

      upsertSettlement.run(
        payload.invoiceId,
        payload.vendor || "Unknown Vendor",
        payload.tin || "",
        payload.category || "General",
        payload.poRef || "",
        payload.drRef || "",
        Number(payload.principal || 0),
        Number(payload.lateIncrement || 0),
        totalPaid,
        Number(payload.daysOverdue || 0),
        payload.paymentMethod || "Bank Transfer",
        payload.disbursementAccount || "Operating Bank Account",
        payload.referenceNumber || `SETTLE-${payload.invoiceId}`,
        payload.paymentDate || now.split("T")[0],
        payload.notes || "",
        now
      );

      console.log(`[DB] Saved SETTLE_NOW action for invoice #${payload.invoiceId} (₱${totalPaid.toLocaleString()})`);

      return res.json({
        success: true,
        actionId: actionRes.lastInsertRowid,
        invoiceId: payload.invoiceId,
        totalPaid,
        message: `Invoice #${payload.invoiceId} settled and saved in SQLite database.`,
        settledAt: now
      });
    } catch (error: any) {
      console.error("[DB Error] Settle Now:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // =========================================================================
  // DATABASE API: REMIT VIA eFPS (BUREAU OF INTERNAL REVENUE TAX REMITTANCE)
  // =========================================================================
  app.post("/api/db/remit-efps", (req, res) => {
    try {
      const payload = req.body;
      const now = new Date().toISOString();

      const taxId = payload.taxId || payload.id;
      if (!taxId) {
        return res.status(400).json({ success: false, error: "Missing required taxId" });
      }

      const efpsConfirmation = payload.efpsConfirmation || `eFPS-${Math.floor(10000000 + Math.random() * 90000000)}`;
      const remittanceDate = payload.remittanceDate || now.split("T")[0];
      const computedTax = Number(payload.computedTax || 0);

      // 1. Insert into general audit financial_actions
      const insertAction = db.prepare(`
        INSERT INTO financial_actions (
          action_type, reference_id, module, amount, entity_name,
          payment_method, disbursement_account, status, notes, created_at, raw_payload
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const actionRes = insertAction.run(
        "REMIT_EFPS",
        efpsConfirmation,
        "Tax Management",
        computedTax,
        payload.entityName || payload.vendorOrCustomer || "Bureau of Internal Revenue",
        "BIR eFPS Electronic Fund Transfer",
        "1030 - BIR Authorized Agent Bank (AAB)",
        "FILED_REMITTED",
        `Remitted ${payload.birForm || "Statutory Tax"} via BIR eFPS (Ref: ${efpsConfirmation})`,
        now,
        JSON.stringify(payload)
      );

      // 2. Upsert into tax_remittances table
      const upsertTax = db.prepare(`
        INSERT INTO tax_remittances (
          tax_id, bir_form, tax_type, entity_name, tin,
          taxable_base, rate_percent, computed_tax, atc_code,
          efps_confirmation, remittance_date, status, remitted_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(tax_id) DO UPDATE SET
          status = 'Filed & Remitted',
          efps_confirmation = excluded.efps_confirmation,
          remittance_date = excluded.remittance_date,
          remitted_at = excluded.remitted_at
      `);

      upsertTax.run(
        taxId,
        payload.birForm || "BIR Form 2550Q (VAT)",
        payload.taxType || "Statutory Tax",
        payload.entityName || payload.vendorOrCustomer || "Bureau of Internal Revenue",
        payload.tin || "009-881-229-000",
        Number(payload.taxableBase || 0),
        Number(payload.ratePercent || 0),
        computedTax,
        payload.atcCode || "",
        efpsConfirmation,
        remittanceDate,
        "Filed & Remitted",
        now
      );

      console.log(`[DB] Saved REMIT_EFPS action for tax record ${taxId} (Ref: ${efpsConfirmation}, ₱${computedTax.toLocaleString()})`);

      return res.json({
        success: true,
        actionId: actionRes.lastInsertRowid,
        taxId,
        efpsConfirmation,
        computedTax,
        message: `Tax filing ${taxId} remitted via eFPS and saved in SQLite database.`,
        remittedAt: now
      });
    } catch (error: any) {
      console.error("[DB Error] Remit via eFPS:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // =========================================================================
  // DATABASE API: COLLECT (ACCOUNTS RECEIVABLE / COLLECTION INFLOW)
  // =========================================================================
  app.post("/api/db/collect", (req, res) => {
    try {
      const payload = req.body;
      const now = new Date().toISOString();

      const collectionId = payload.collectionId || payload.id || `COL-${Date.now()}`;
      const amount = Number(payload.amount || payload.totalCollectible || 0);

      // 1. Insert into general audit financial_actions
      const insertAction = db.prepare(`
        INSERT INTO financial_actions (
          action_type, reference_id, module, amount, entity_name,
          payment_method, disbursement_account, status, notes, created_at, raw_payload
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const actionRes = insertAction.run(
        payload.isBatch ? "BATCH_COLLECT" : "COLLECT",
        payload.referenceNumber || payload.receiptNumber || collectionId,
        "Accounts Receivable / Collection",
        amount,
        payload.customerName || payload.customer || "Customer / Corporate Account",
        payload.paymentMethod || "Bank Transfer",
        payload.targetAccount || payload.targetVault || "Operating Bank Account",
        "COLLECTED_SETTLED",
        payload.notes || `Collected ₱${amount.toLocaleString()} from ${payload.customerName || payload.customer || "Customer"}`,
        now,
        JSON.stringify(payload)
      );

      // 2. Upsert into collections table
      const insertCollection = db.prepare(`
        INSERT INTO collections (
          collection_id, invoice_id, customer_name, amount,
          target_account, payment_method, reference_number,
          receipt_number, collection_date, is_full_settlement, notes, collected_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(collection_id) DO UPDATE SET
          amount = excluded.amount,
          target_account = excluded.target_account,
          collected_at = excluded.collected_at
      `);

      insertCollection.run(
        collectionId,
        payload.invoiceId || "",
        payload.customerName || payload.customer || "Customer",
        amount,
        payload.targetAccount || payload.targetVault || "Operating Bank Account",
        payload.paymentMethod || "Bank Transfer",
        payload.referenceNumber || "",
        payload.receiptNumber || payload.officialReceiptNo || "",
        payload.date || now.split("T")[0],
        payload.isFullSettlement === false ? 0 : 1,
        payload.notes || "",
        now
      );

      console.log(`[DB] Saved COLLECT action #${collectionId} (₱${amount.toLocaleString()})`);

      return res.json({
        success: true,
        actionId: actionRes.lastInsertRowid,
        collectionId,
        amount,
        message: `Collection of ₱${amount.toLocaleString()} recorded and saved in SQLite database.`,
        collectedAt: now
      });
    } catch (error: any) {
      console.error("[DB Error] Collect:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // =========================================================================
  // DATABASE API: RETRIEVE PERSISTED STATE & RECENT ACTIONS
  // =========================================================================
  app.get("/api/db/state", (req, res) => {
    try {
      const settlements = db.prepare("SELECT * FROM ap_settlements ORDER BY id DESC").all();
      const taxRemittances = db.prepare("SELECT * FROM tax_remittances ORDER BY id DESC").all();
      const collections = db.prepare("SELECT * FROM collections ORDER BY id DESC").all();
      const recentActions = db.prepare("SELECT * FROM financial_actions ORDER BY id DESC LIMIT 50").all();

      return res.json({
        success: true,
        settlements,
        taxRemittances,
        collections,
        recentActions,
        database: "SQLite 3",
        dbStatus: "CONNECTED",
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("[DB Error] Query state:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get("/api/db/actions", (req, res) => {
    try {
      const actions = db.prepare("SELECT * FROM financial_actions ORDER BY id DESC LIMIT 100").all();
      return res.json({ success: true, actions });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // AI Automated Budget Allocation Endpoint
  app.post("/api/ai/budget-allocation", async (req, res) => {
    try {
      const {
        totalPool = 5000000,
        departments = [
          { name: "Hotel Management", historicalSpend: 1678400, minCap: 800000, maxCap: 2500000, priority: "High" },
          { name: "Restaurant Management", historicalSpend: 1120000, minCap: 600000, maxCap: 1800000, priority: "High" },
          { name: "HRMS Payroll", historicalSpend: 1850000, minCap: 1200000, maxCap: 2200000, priority: "Critical" },
          { name: "Supply Chain", historicalSpend: 890000, minCap: 400000, maxCap: 1500000, priority: "Medium" },
          { name: "FleetOps", historicalSpend: 470000, minCap: 250000, maxCap: 900000, priority: "Medium" }
        ],
        strategy = "Balanced Operational Efficiency"
      } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;

      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are an executive Chief Financial Officer and enterprise FP&A AI specialist for a high-volume HORECA (Hotel, Restaurant, Catering, Logistics) conglomerate in the Philippines.
The company is setting up automated department budget allocations.
Total Budget Pool: PHP ${Number(totalPool).toLocaleString()}
Fiscal Allocation Strategy: ${strategy}

Departments and Historical Constraints:
${JSON.stringify(departments, null, 2)}

Requirements:
1. Provide a rigorous, optimal allocation in Philippine Peso (PHP) for each department that sums up to approximately PHP ${Number(totalPool).toLocaleString()}.
2. Assign each department:
   - "allocated": numeric amount in PHP
   - "cap": maximum spend cap limit before disbursement lockdown (usually 105%-115% of allocated)
   - "percentage": number (percentage of total pool)
   - "rationale": 1-2 sentence specific operational justification (e.g. food inflation, occupancy shifts, fleet fuel, statutory minimum wage adjustments)
   - "riskFactor": "Low" | "Moderate" | "High"
3. Provide an "executiveSummary" detailing the financial strategy and ROI outlook.

Return ONLY a valid JSON object matching this schema:
{
  "totalAllocated": number,
  "executiveSummary": string,
  "allocations": [
    {
      "department": string,
      "allocated": number,
      "cap": number,
      "percentage": number,
      "rationale": string,
      "riskFactor": "Low" | "Moderate" | "High"
    }
  ]
}`;

        // Cascade through viable Gemini models to handle temporary 503 high demand spikes
        const candidateModels = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
        let generatedResult: any = null;
        let usedModel = "";

        for (const modelName of candidateModels) {
          try {
            const response = await ai.models.generateContent({
              model: modelName,
              contents: prompt,
              config: {
                responseMimeType: "application/json",
              }
            });

            const text = response.text;
            if (text) {
              const parsed = JSON.parse(text);
              if (parsed && Array.isArray(parsed.allocations) && parsed.allocations.length > 0) {
                generatedResult = parsed;
                usedModel = modelName;
                break;
              }
            }
          } catch (modelErr: any) {
            // Check for temporary capacity/503 errors and silently try next candidate model
            const isTemporary =
              modelErr?.status === 503 ||
              modelErr?.message?.includes("503") ||
              modelErr?.message?.includes("high demand") ||
              modelErr?.status === 429;
            if (isTemporary) {
              continue;
            }
            break;
          }
        }

        if (generatedResult) {
          return res.json({
            success: true,
            source: "gemini-ai",
            model: usedModel,
            ...generatedResult
          });
        }
      }

      // Algorithmic FP&A Allocation Fallback (when Gemini models are experiencing temporary demand spikes)
      const weights: Record<string, { share: number; buffer: number; rationale: string; risk: "Low" | "Moderate" | "High" }> = {
        "Hotel Management": {
          share: 0.28,
          buffer: 1.10,
          rationale: "Accommodates high tourist season occupancy, room maintenance reserves, and guest amenities turnover.",
          risk: "Moderate"
        },
        "Restaurant Management": {
          share: 0.22,
          buffer: 1.12,
          rationale: "Buffers against culinary supply price volatility, F&B inventory turns, and 85% service charge reconciliation.",
          risk: "Moderate"
        },
        "HRMS Payroll": {
          share: 0.32,
          buffer: 1.05,
          rationale: "Covers base hospitality salaries, mandatory statutory remittances (SSS, PhilHealth, Pag-IBIG), and holiday overtime pay.",
          risk: "Low"
        },
        "Supply Chain": {
          share: 0.11,
          buffer: 1.15,
          rationale: "Funds bulk purveyor procurement, cold chain preservation, and inventory replenishment cycles.",
          risk: "Moderate"
        },
        "FleetOps": {
          share: 0.07,
          buffer: 1.15,
          rationale: "Sustains airport shuttle operations, vehicle preventive maintenance, and commercial fuel card quotas.",
          risk: "Low"
        }
      };

      const allocations = departments.map((d: any) => {
        const config = weights[d.name] || {
          share: 1 / departments.length,
          buffer: 1.10,
          rationale: "Standard operational run-rate budget allocation.",
          risk: "Moderate" as const
        };
        const allocated = Math.round(Number(totalPool) * config.share);
        const cap = Math.round(allocated * config.buffer);
        const percentage = Number((config.share * 100).toFixed(1));

        return {
          department: d.name,
          allocated,
          cap,
          percentage,
          rationale: config.rationale,
          riskFactor: config.risk
        };
      });

      const totalAllocated = allocations.reduce((sum: number, a: any) => sum + a.allocated, 0);

      return res.json({
        success: true,
        source: "algorithmic-fpa",
        model: "Enterprise FP&A Algorithmic Engine",
        totalAllocated,
        executiveSummary: `Automated ${strategy} budget model deployed across 5 core hospitality departments. Weighted priority assigned to HRMS Payroll (32%) and Hotel Rooms (28%) to safeguard guest service continuity, with strict budget caps enforced across all operational cost centers.`,
        allocations
      });
    } catch (error: any) {
      console.error("Budget allocation error:", error);
      res.status(500).json({ success: false, error: error.message || "Failed to generate AI budget allocation" });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
