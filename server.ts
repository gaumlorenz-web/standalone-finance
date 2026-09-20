import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
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
