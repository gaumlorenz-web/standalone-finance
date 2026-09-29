import React, { useState, useEffect } from "react";
import {
  UtensilsCrossed,
  DollarSign,
  Receipt,
  AlertTriangle,
  ShoppingBag,
  Percent,
  CheckCircle2,
  Send,
  ExternalLink,
  Layers,
  TrendingUp,
  CreditCard,
  QrCode,
  Banknote,
  ShieldAlert,
  FileSpreadsheet
} from "lucide-react";
import { fmsBridge, FmsPacket } from "../../src/services/fmsBridge";

interface SimpleDashboardProps {
  onNavigateToFms?: (tab?: string) => void;
}

export default function SimpleDashboard({ onNavigateToFms }: SimpleDashboardProps) {
  const [activeTab, setActiveTab] = useState<"pos_settlement" | "palengke_liquidation" | "food_cost">("pos_settlement");

  // TAB 1: POS Settlement State
  const [grossSales, setGrossSales] = useState<number>(98500);
  const [scPwdDiscount, setScPwdDiscount] = useState<number>(9800); // 20% discount + 12% VAT exemption (RA 9994/10754)
  const [paymentRails, setPaymentRails] = useState({
    instaPayQr: 34200,
    creditCard: 38500,
    cashOnHand: 16000,
  });

  // Net Sales calculation
  const netCollectibleSales = grossSales - scPwdDiscount;
  const totalRailCollected = paymentRails.instaPayQr + paymentRails.creditCard + paymentRails.cashOnHand;
  const railDiscrepancy = netCollectibleSales - totalRailCollected;

  // TAB 2: Palengke (Wet Market) Petty Cash Liquidation State
  const [advanceVoucherId, setAdvanceVoucherId] = useState<string>("ADV-PLK-9012");
  const [chefBuyerName, setChefBuyerName] = useState<string>("Executive Chef Rolando Perez");
  const [cashAdvanceIssued, setCashAdvanceIssued] = useState<number>(12500);
  const [marketItems, setMarketItems] = useState([
    { id: 1, item: "Fresh Tanigue & Pompano (Balintawak)", amount: 4800, vendorNotes: "Stall #14 Farmer's Market (Handwritten Tally)" },
    { id: 2, item: "Native Herbs, Ginger & Chili Siling Labuyo", amount: 1650, vendorNotes: "Stall #28 Wet Produce" },
    { id: 3, item: "Upland Vegetables & Organic Kangkong", amount: 2350, vendorNotes: "Stall #05 Baguio Truck Direct" },
    { id: 4, item: "Market Porter & Unloading Fees", amount: 600, vendorNotes: "Logistics Cash Tip / Porter Receipt" },
  ]);

  const totalPalengkeSpent = marketItems.reduce((s, i) => s + i.amount, 0);
  const cashReturnToFloat = Math.max(0, cashAdvanceIssued - totalPalengkeSpent);

  // TAB 3: Food Cost Threshold State
  const [targetFoodCostPct, setTargetFoodCostPct] = useState<number>(32); // Standard benchmark
  const [actualCostOfIngredients, setActualCostOfIngredients] = useState<number>(37800);
  const currentFoodCostPct = netCollectibleSales > 0 ? Math.round((actualCostOfIngredients / netCollectibleSales) * 1000) / 10 : 0;
  const isThresholdExceeded = currentFoodCostPct > targetFoodCostPct;

  // FMS Interop State
  const [fmsStatus, setFmsStatus] = useState<any>(fmsBridge.getCurrentFmsMetrics());
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [transmissionLogs, setTransmissionLogs] = useState<FmsPacket[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTransmissionLogs(fmsBridge.getTransmissionLogs("Resto-MNGT"));
    const handleSync = () => {
      setTransmissionLogs(fmsBridge.getTransmissionLogs("Resto-MNGT"));
      setFmsStatus(fmsBridge.getCurrentFmsMetrics());
    };
    window.addEventListener("fms-sync-event", handleSync);
    return () => window.removeEventListener("fms-sync-event", handleSync);
  }, []);

  // ACTION 1: POS Settlement to Accounts Receivable & Cash Pool
  const handlePushPosSettlement = () => {
    setIsSubmitting(true);
    const posRef = `POS-SETTLE-${new Date().toISOString().split("T")[0].replace(/-/g, "")}`;

    // 1. Post to FMS Accounts Receivable
    fmsBridge.pushArSettlement({
      sourceModule: "Resto-MNGT",
      customer: "F&B Restaurant Daily Guest Register",
      amount: netCollectibleSales,
      category: "Restaurant Food & Beverage POS",
      paymentRailBreakdown: {
        cash: paymentRails.cashOnHand,
        cards: paymentRails.creditCard,
        qrOnline: paymentRails.instaPayQr,
        discounts: scPwdDiscount,
      },
    });

    // 2. Increment Cash Management Liquidity
    fmsBridge.updateCashPool({
      bankOperating: paymentRails.instaPayQr + paymentRails.creditCard,
      pettyCash: paymentRails.cashOnHand,
      reason: `Restaurant POS Settlement [${posRef}]: InstaPay/Maya (₱${paymentRails.instaPayQr.toLocaleString()}) + Cards (₱${paymentRails.creditCard.toLocaleString()}) + Cash (₱${paymentRails.cashOnHand.toLocaleString()})`,
      sourceModule: "Resto-MNGT",
    });

    // 3. Post Balanced Double-Entry in Master General Ledger
    fmsBridge.postJournalEntry({
      sourceModule: "Resto-MNGT",
      ref: posRef,
      memo: `Restaurant Daily POS Settlement (Senior/PWD Discounts & Multi-Rail Settlement)`,
      lines: [
        {
          accountCode: "1030",
          accountName: "1030 - Operating Bank (InstaPay & Card Settlements)",
          debit: paymentRails.instaPayQr + paymentRails.creditCard,
          credit: 0,
          memo: `Digital POS settlement collections`,
        },
        {
          accountCode: "1010",
          accountName: "1010 - Front Desk / Resto Cash Float",
          debit: paymentRails.cashOnHand,
          credit: 0,
          memo: `Cash register collection on hand`,
        },
        {
          accountCode: "5310",
          accountName: "5310 - Senior Citizen & PWD Statutory Discount Expense",
          debit: scPwdDiscount,
          credit: 0,
          memo: `RA 9994 / RA 10754 20% discount expense`,
        },
        {
          accountCode: "4030",
          accountName: "4030 - Restaurant Food & Beverage Sales Revenue",
          debit: 0,
          credit: grossSales,
          memo: `Gross POS food & beverage revenue`,
        },
      ],
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setActionSuccessMessage(
        `POS Settlement [${posRef}] committed to FMS! AR settled for ₱${netCollectibleSales.toLocaleString()}, Treasury incremented, and GL balanced.`
      );
      setFmsStatus(fmsBridge.getCurrentFmsMetrics());
    }, 400);
  };

  // ACTION 2: Wet Market (Palengke) Petty Cash Liquidation
  const handleLiquidatePalengke = () => {
    setIsSubmitting(true);
    const liqRef = `LIQ-PLK-${Date.now().toString().slice(-4)}`;

    // 1. Update FMS Cash Pool (reduce petty cash by the spent amount)
    fmsBridge.updateCashPool({
      pettyCash: -totalPalengkeSpent,
      reason: `Palengke Petty Cash Liquidation [${advanceVoucherId}]: Fresh produce & seafood by ${chefBuyerName}`,
      sourceModule: "Resto-MNGT",
    });

    // 2. Post GL Entry: Debit COGS Fresh Produce, Credit Petty Cash Float
    fmsBridge.postJournalEntry({
      sourceModule: "Resto-MNGT",
      ref: liqRef,
      memo: `Palengke Fresh Ingredient Liquidation: ${chefBuyerName}`,
      lines: [
        {
          accountCode: "5010",
          accountName: "5010 - Cost of Goods Sold - Fresh Produce, Seafood & Meats",
          debit: totalPalengkeSpent,
          credit: 0,
          memo: `Balintawak/Farmer's Market fresh ingredients liquidation`,
        },
        {
          accountCode: "1010",
          accountName: "1010 - Restaurant & Kitchen Petty Cash Float",
          debit: 0,
          credit: totalPalengkeSpent,
          memo: `Petty cash liquidation relief (Change returned: ₱${cashReturnToFloat.toLocaleString()})`,
        },
      ],
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setActionSuccessMessage(
        `Palengke Liquidation [${liqRef}] processed! ₱${totalPalengkeSpent.toLocaleString()} expensed to COGS (Account 5010) and Petty Cash Float reconciled.`
      );
      setFmsStatus(fmsBridge.getCurrentFmsMetrics());
    }, 400);
  };

  // ACTION 3: Food Cost Threshold Monitoring & PO Restriction
  const handleEnforceFoodCostRestriction = () => {
    setIsSubmitting(true);

    // Submit immediate alert & restriction to FMS Approval Queue
    fmsBridge.submitApprovalRequest({
      sourceModule: "Resto-MNGT",
      actionType: "RESTRICT_PURCHASE_REQUISITIONS",
      title: `Food Cost Threshold Breach (${currentFoodCostPct}% vs ${targetFoodCostPct}% Target)`,
      amount: actualCostOfIngredients,
      requestedBy: "F&B Cost Controller",
      impactSummary: `Daily food cost reached ${currentFoodCostPct}% (+${(currentFoodCostPct - targetFoodCostPct).toFixed(1)}% above benchmark). Management restriction enacted: All unapproved Supply-Chain purchase requisitions locked until variance audit clears.`,
      payload: {
        currentFoodCostPct,
        targetFoodCostPct,
        actualCostOfIngredients,
        netSales: netCollectibleSales,
        status: "LOCKED_FOR_VARIANCE_AUDIT",
      },
    });

    // Log high priority security alert in FMS Audit Trail
    fmsBridge.logAudit({
      action: "FOOD_COST_THRESHOLD_EXCEEDED",
      module: "Resto-MNGT",
      description: `CRITICAL ALERT: Restaurant food cost percentage hit ${currentFoodCostPct}%, exceeding standard ceiling of ${targetFoodCostPct}%. Supply-Chain purchase order freeze triggered.`,
      status: "SECURITY_ALERT",
      newState: { currentPct: currentFoodCostPct, targetPct: targetFoodCostPct, variance: currentFoodCostPct - targetFoodCostPct },
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setActionSuccessMessage(
        `Threshold Enforcement Triggered! Security Alert posted in FMS Audit Trail and purchase requisition lock dispatched to Approval Queue.`
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
            <div className="bg-rose-600 text-white p-3 rounded-xl shadow-md">
              <UtensilsCrossed className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                  Subsystem 03 / Operational Module
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  FMS Live Connected
                </span>
              </div>
              <h1 className="text-2xl font-black font-['Archivo'] tracking-tight text-slate-900 mt-1">
                Restaurant &amp; F&amp;B Operations Dashboard
              </h1>
              <p className="text-xs text-slate-500 font-['IBM_Plex_Mono']">
                POS Payment Rail Settlement, Palengke Petty Cash Liquidation &amp; Food Cost Variance Controls
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onNavigateToFms && (
              <button
                onClick={() => onNavigateToFms("ar")}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold font-['IBM_Plex_Mono'] rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <span>View FMS Accounts Receivable</span>
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
              <span>Gross POS Register</span>
              <DollarSign className="h-4 w-4 text-rose-600" />
            </div>
            <p className="text-2xl font-black font-['IBM_Plex_Mono'] text-slate-900 mt-2">
              ₱{grossSales.toLocaleString()}
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-['IBM_Plex_Mono']">
              <span>Discounts: -₱{scPwdDiscount.toLocaleString()}</span>
              <span className="text-rose-700 font-bold">Net: ₱{netCollectibleSales.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
              <span>Food Cost Percentage</span>
              <TrendingUp className="h-4 w-4 text-amber-600" />
            </div>
            <p
              className={`text-2xl font-black font-['IBM_Plex_Mono'] mt-2 ${
                isThresholdExceeded ? "text-red-600" : "text-emerald-600"
              }`}
            >
              {currentFoodCostPct}%
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-['IBM_Plex_Mono']">
              <span>Target: {targetFoodCostPct}%</span>
              <span
                className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                  isThresholdExceeded ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {isThresholdExceeded ? "OVER THRESHOLD" : "ON TARGET"}
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
              <span>Palengke Liquidation</span>
              <ShoppingBag className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black font-['IBM_Plex_Mono'] text-emerald-700 mt-2">
              ₱{totalPalengkeSpent.toLocaleString()}
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-['IBM_Plex_Mono']">
              <span>Change: ₱{cashReturnToFloat.toLocaleString()}</span>
              <span className="text-emerald-700 font-bold">{advanceVoucherId}</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
              <span>Digital Rails (InstaPay/Card)</span>
              <CreditCard className="h-4 w-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-black font-['IBM_Plex_Mono'] text-indigo-700 mt-2">
              ₱{(paymentRails.instaPayQr + paymentRails.creditCard).toLocaleString()}
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-['IBM_Plex_Mono']">
              <span>Cash: ₱{paymentRails.cashOnHand.toLocaleString()}</span>
              <span className="text-indigo-700 font-bold">81.9% Digital</span>
            </div>
          </div>
        </div>

        {/* Action Tabs Header */}
        <div className="flex border-b border-slate-200 gap-2">
          <button
            onClick={() => setActiveTab("pos_settlement")}
            className={`px-4 py-2.5 text-xs font-bold font-['IBM_Plex_Mono'] rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "pos_settlement"
                ? "bg-white text-rose-700 border-t-2 border-rose-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Receipt className="h-3.5 w-3.5" />
            <span>1. POS Cash &amp; Credit Card Settlement</span>
          </button>

          <button
            onClick={() => setActiveTab("palengke_liquidation")}
            className={`px-4 py-2.5 text-xs font-bold font-['IBM_Plex_Mono'] rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "palengke_liquidation"
                ? "bg-white text-emerald-700 border-t-2 border-emerald-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>2. Wet Market (Palengke) Petty Cash Liquidation</span>
          </button>

          <button
            onClick={() => setActiveTab("food_cost")}
            className={`px-4 py-2.5 text-xs font-bold font-['IBM_Plex_Mono'] rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "food_cost"
                ? "bg-white text-amber-700 border-t-2 border-amber-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>3. Food Cost Threshold Monitoring</span>
          </button>
        </div>

        {/* TAB 1: POS CASH & CREDIT CARD SETTLEMENT */}
        {activeTab === "pos_settlement" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-200 gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-['Archivo']">
                  Daily POS Cash &amp; Payment Rails Settlement
                </h2>
                <p className="text-xs text-slate-500 font-['IBM_Plex_Mono'] mt-0.5">
                  Applies Senior Citizen / PWD 20% + 12% VAT statutory exemption, splits multi-rail payments, and pushes AR settlement to FMS Treasury.
                </p>
              </div>
              <button
                onClick={handlePushPosSettlement}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold font-['IBM_Plex_Mono'] rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span>Push Settlement to FMS Accounts Receivable</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sales Calculation Card */}
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <span className="text-xs font-bold uppercase text-slate-700 font-['IBM_Plex_Mono'] block">
                  Gross Sales &amp; Statutory Discounts (RA 9994 / RA 10754)
                </span>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-500 font-['IBM_Plex_Mono'] block mb-1">
                      Gross Restaurant Sales (₱)
                    </label>
                    <input
                      type="number"
                      value={grossSales}
                      onChange={(e) => setGrossSales(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold font-['IBM_Plex_Mono']"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 font-['IBM_Plex_Mono'] block mb-1">
                      Senior Citizen &amp; PWD Discounts (20% + 12% VAT Exemption)
                    </label>
                    <input
                      type="number"
                      value={scPwdDiscount}
                      onChange={(e) => setScPwdDiscount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold font-['IBM_Plex_Mono'] text-red-600"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-['IBM_Plex_Mono']">
                    <span className="font-bold text-slate-700">Net Collectible Sales:</span>
                    <span className="text-base font-black text-slate-900">₱{netCollectibleSales.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Payment Rails Breakdown Card */}
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <span className="text-xs font-bold uppercase text-slate-700 font-['IBM_Plex_Mono'] block">
                  Payment Rails Breakdown
                </span>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs font-['IBM_Plex_Mono'] mb-1">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <QrCode className="h-3.5 w-3.5 text-emerald-600" />
                        <span>InstaPay / GCash / Maya QR</span>
                      </span>
                    </div>
                    <input
                      type="number"
                      value={paymentRails.instaPayQr}
                      onChange={(e) =>
                        setPaymentRails({ ...paymentRails, instaPayQr: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold font-['IBM_Plex_Mono']"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-['IBM_Plex_Mono'] mb-1">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <CreditCard className="h-3.5 w-3.5 text-blue-600" />
                        <span>Credit / Debit Card (BDO / Maya Terminal)</span>
                      </span>
                    </div>
                    <input
                      type="number"
                      value={paymentRails.creditCard}
                      onChange={(e) =>
                        setPaymentRails({ ...paymentRails, creditCard: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold font-['IBM_Plex_Mono']"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-['IBM_Plex_Mono'] mb-1">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <Banknote className="h-3.5 w-3.5 text-amber-600" />
                        <span>Cash on Hand (Till Collection)</span>
                      </span>
                    </div>
                    <input
                      type="number"
                      value={paymentRails.cashOnHand}
                      onChange={(e) =>
                        setPaymentRails({ ...paymentRails, cashOnHand: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold font-['IBM_Plex_Mono']"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PALENGKE PETTY CASH LIQUIDATION */}
        {activeTab === "palengke_liquidation" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-200 gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-['Archivo']">
                  Wet Market (Palengke) Petty Cash Liquidation
                </h2>
                <p className="text-xs text-slate-500 font-['IBM_Plex_Mono'] mt-0.5">
                  Logs daily cash advances for unreceipted and fresh ingredient purchases at local wet markets, posting expenses directly to GL COGS.
                </p>
              </div>
              <button
                onClick={handleLiquidatePalengke}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-['IBM_Plex_Mono'] rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Submit Liquidation &amp; Reconcile Float</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold uppercase text-slate-500 font-['IBM_Plex_Mono'] block">
                  Advance Voucher Ref
                </span>
                <input
                  type="text"
                  value={advanceVoucherId}
                  onChange={(e) => setAdvanceVoucherId(e.target.value)}
                  className="w-full mt-2 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold font-['IBM_Plex_Mono']"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold uppercase text-slate-500 font-['IBM_Plex_Mono'] block">
                  Chef / Buyer Name
                </span>
                <input
                  type="text"
                  value={chefBuyerName}
                  onChange={(e) => setChefBuyerName(e.target.value)}
                  className="w-full mt-2 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-['IBM_Plex_Mono']"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold uppercase text-slate-500 font-['IBM_Plex_Mono'] block">
                  Cash Advance Issued (₱)
                </span>
                <input
                  type="number"
                  value={cashAdvanceIssued}
                  onChange={(e) => setCashAdvanceIssued(Number(e.target.value))}
                  className="w-full mt-2 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold font-['IBM_Plex_Mono'] text-emerald-700"
                />
              </div>
            </div>

            {/* Liquidation Sheet Items */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-['IBM_Plex_Mono']">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <th className="py-2.5 px-3">Item / Produce Description</th>
                    <th className="py-2.5 px-3">Market Stall / Proof Note</th>
                    <th className="py-2.5 px-3 text-right">Amount (₱)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {marketItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{item.item}</td>
                      <td className="py-2.5 px-3 text-slate-500">{item.vendorNotes}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        ₱{item.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                    <td colSpan={2} className="py-3 px-3 uppercase">Total Palengke Purchases</td>
                    <td className="py-3 px-3 text-right text-emerald-800 text-sm font-black">
                      ₱{totalPalengkeSpent.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs font-['IBM_Plex_Mono']">
              <div>
                <span className="font-bold text-emerald-900 block">Unused Cash Return to Treasury Float:</span>
                <span className="text-emerald-700">Cash Advance ₱{cashAdvanceIssued.toLocaleString()} - Spent ₱{totalPalengkeSpent.toLocaleString()}</span>
              </div>
              <span className="text-lg font-black text-emerald-950">₱{cashReturnToFloat.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* TAB 3: FOOD COST THRESHOLD MONITORING */}
        {activeTab === "food_cost" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-200 gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-['Archivo']">
                  Food Cost Variance Monitoring &amp; Requisition Restrictions
                </h2>
                <p className="text-xs text-slate-500 font-['IBM_Plex_Mono'] mt-0.5">
                  Tracks real-time ingredient usage against net sales. If the food cost percentage exceeds standard thresholds, management alerts lock unapproved purchase requisitions.
                </p>
              </div>
              <button
                onClick={handleEnforceFoodCostRestriction}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold font-['IBM_Plex_Mono'] rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <ShieldAlert className="h-4 w-4" />
                <span>Enforce Threshold Alert &amp; Lock Requisitions</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <span className="text-xs font-bold uppercase text-slate-700 font-['IBM_Plex_Mono'] block">
                  Variance Calculation Inputs
                </span>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-500 font-['IBM_Plex_Mono'] block mb-1">
                      Cost of Ingredients Consumed (₱)
                    </label>
                    <input
                      type="number"
                      value={actualCostOfIngredients}
                      onChange={(e) => setActualCostOfIngredients(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold font-['IBM_Plex_Mono']"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 font-['IBM_Plex_Mono'] block mb-1">
                      Target Food Cost Benchmark (%)
                    </label>
                    <input
                      type="number"
                      value={targetFoodCostPct}
                      onChange={(e) => setTargetFoodCostPct(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold font-['IBM_Plex_Mono']"
                    />
                  </div>
                </div>
              </div>

              <div
                className={`p-5 rounded-xl border flex flex-col justify-between ${
                  isThresholdExceeded
                    ? "bg-red-50 border-red-200 text-red-900"
                    : "bg-emerald-50 border-emerald-200 text-emerald-900"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`h-5 w-5 ${isThresholdExceeded ? "text-red-600" : "text-emerald-600"}`} />
                    <span className="text-xs font-bold uppercase tracking-wider font-['IBM_Plex_Mono']">
                      Threshold Status: {isThresholdExceeded ? "EXCEEDED VIOLATION" : "NORMAL"}
                    </span>
                  </div>
                  <p className="text-4xl font-black font-['IBM_Plex_Mono'] mt-3">
                    {currentFoodCostPct}%
                  </p>
                  <p className="text-xs mt-1 font-['IBM_Plex_Mono']">
                    Target: {targetFoodCostPct}% | Variance:{" "}
                    <span className="font-bold">
                      {currentFoodCostPct > targetFoodCostPct ? `+${(currentFoodCostPct - targetFoodCostPct).toFixed(1)}%` : "Within Budget"}
                    </span>
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-red-200 text-xs font-['IBM_Plex_Mono']">
                  {isThresholdExceeded ? (
                    <span className="font-bold text-red-800">
                      Automatic Control Active: Triggers FMS Approval Queue hold on all Supply-Chain purchase requisitions.
                    </span>
                  ) : (
                    <span className="text-emerald-800">Kitchen efficiency within optimal variance tolerance.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FMS Transmission Logs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-rose-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider font-['IBM_Plex_Mono'] text-slate-700">
                FMS Outbox Transmission Log (Resto Subsystem)
              </h3>
            </div>
            <span className="text-[11px] font-bold font-['IBM_Plex_Mono'] text-slate-500">
              Total FMS AR Invoices: {fmsStatus?.arInvoicesCount || 0}
            </span>
          </div>

          <div className="mt-3 space-y-2">
            {transmissionLogs.length === 0 ? (
              <p className="text-xs text-slate-400 font-['IBM_Plex_Mono'] py-3 text-center">
                No outbound restaurant packets logged yet. Settle POS or submit Palengke liquidation above.
              </p>
            ) : (
              transmissionLogs.slice(0, 5).map((pkt) => (
                <div
                  key={pkt.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-['IBM_Plex_Mono'] gap-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px]">
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
