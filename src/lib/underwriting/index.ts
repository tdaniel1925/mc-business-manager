// MCA Underwriting Engine
// Comprehensive risk assessment, paper grading, and offer calculation

import { PaperGrade, IndustryRiskTier, RevenueTrend } from "@prisma/client";

// ============================================
// TYPES & INTERFACES
// ============================================

export interface MerchantData {
  timeInBusiness: number | null; // months
  monthlyRevenue: number | null;
  industryRiskTier: IndustryRiskTier;
}

export interface OwnerData {
  ficoScore: number | null;
  ownership: number;
  isPrimary: boolean;
}

export interface BankAnalysisData {
  avgDailyBalance: number;
  minBalance: number;
  maxBalance: number;
  totalDeposits: number;
  depositCount: number;
  avgDeposit: number;
  depositDaysCount: number;
  nsfCount: number;
  overdraftCount: number;
  monthsAnalyzed: number;
  revenueTrend: RevenueTrend;
  estimatedDailyLoad: number | null;
  detectedMCAPayments: MCAPayment[] | null;
}

export interface MCAPayment {
  name: string;
  amount: number;
  frequency: "DAILY" | "WEEKLY";
  estimatedBalance: number;
}

export interface DealData {
  requestedAmount: number;
  existingPositions: number;
  stackingDetected: boolean;
}

export interface RiskScoreResult {
  totalScore: number;
  grade: PaperGrade;
  components: RiskComponent[];
  autoApprove: boolean;
  autoDecline: boolean;
  declineReasons: string[];
  warnings: string[];
}

export interface RiskComponent {
  name: string;
  weight: number;
  score: number;
  weightedScore: number;
  details: string;
}

export interface OfferCalculation {
  approvedAmount: number;
  factorRate: number;
  paybackAmount: number;
  termDays: number;
  dailyPayment: number;
  weeklyPayment: number;
  holdbackPercentage: number;
  position: number;
  commission: number;
  commissionRate: number;
}

export interface OfferTier {
  name: string;
  factorRate: number;
  termDays: number;
  maxMultiple: number;
  dailyPayment: number;
  weeklyPayment: number;
  paybackAmount: number;
}

// ============================================
// CONSTANTS & CONFIGURATION
// ============================================

// Risk Score Weights (must sum to 100)
export const RISK_WEIGHTS = {
  FICO: 20,
  AVG_DAILY_BALANCE: 15,
  DEPOSIT_CONSISTENCY: 15,
  NSF_FREQUENCY: 15,
  TIME_IN_BUSINESS: 10,
  INDUSTRY_RISK: 10,
  EXISTING_MCA_LOAD: 10,
  REVENUE_STABILITY: 5,
} as const;

// Paper Grade Thresholds
export const PAPER_GRADE_THRESHOLDS = {
  A: { minFico: 650, minScore: 75 },
  B: { minFico: 575, minScore: 60 },
  C: { minFico: 500, minScore: 45 },
  D: { minFico: 0, minScore: 0 },
} as const;

// Factor Rates by Grade
export const FACTOR_RATES = {
  A: { min: 1.15, max: 1.25, default: 1.20 },
  B: { min: 1.26, max: 1.35, default: 1.30 },
  C: { min: 1.36, max: 1.45, default: 1.40 },
  D: { min: 1.46, max: 1.55, default: 1.50 },
} as const;

// Term Days by Grade
export const TERM_DAYS = {
  A: { min: 90, max: 180, default: 120 },
  B: { min: 90, max: 150, default: 120 },
  C: { min: 60, max: 120, default: 90 },
  D: { min: 60, max: 90, default: 60 },
} as const;

// Max Advance Multiple of Monthly Revenue
export const MAX_MULTIPLES = {
  A: 1.5,
  B: 1.25,
  C: 1.0,
  D: 0.75,
} as const;

// Industry Risk Classifications
export const HIGH_RISK_INDUSTRIES = [
  "gambling",
  "adult",
  "firearms",
  "marijuana",
  "cryptocurrency",
  "debt collection",
  "telemarketing",
  "travel",
  "timeshare",
];

export const MODERATE_RISK_INDUSTRIES = [
  "restaurant",
  "retail",
  "construction",
  "trucking",
  "auto repair",
  "beauty salon",
];

// Auto Decision Criteria
export const AUTO_APPROVE_CRITERIA = {
  minFico: 650,
  minTimeInBusiness: 12, // months
  minAvgDailyBalance: 5000,
  maxNsfCount: 2,
  maxPositions: 0, // first position only
  maxRequestMultiple: 1.0, // of monthly revenue
};

export const AUTO_DECLINE_CRITERIA = {
  maxFico: 500,
  minTimeInBusiness: 6, // months
  minMonthlyRevenue: 10000,
  maxNsfCount: 10,
  maxPositions: 3,
  bankruptcyYears: 7,
};

// ============================================
// RISK SCORING ENGINE
// ============================================

export function calculateRiskScore(
  merchant: MerchantData,
  owners: OwnerData[],
  bankAnalysis: BankAnalysisData | null,
  deal: DealData
): RiskScoreResult {
  const components: RiskComponent[] = [];
  const warnings: string[] = [];
  const declineReasons: string[] = [];

  // Get primary owner FICO
  const primaryOwner = owners.find((o) => o.isPrimary) || owners[0];
  const fico = primaryOwner?.ficoScore || 0;

  // 1. FICO Score Component (20%)
  const ficoScore = calculateFicoScore(fico);
  components.push({
    name: "FICO Score",
    weight: RISK_WEIGHTS.FICO,
    score: ficoScore,
    weightedScore: (ficoScore * RISK_WEIGHTS.FICO) / 100,
    details: getFicoDetails(fico),
  });

  // 2. Average Daily Balance Component (15%)
  const adbScore = bankAnalysis
    ? calculateADBScore(bankAnalysis.avgDailyBalance, deal.requestedAmount)
    : 0;
  components.push({
    name: "Average Daily Balance",
    weight: RISK_WEIGHTS.AVG_DAILY_BALANCE,
    score: adbScore,
    weightedScore: (adbScore * RISK_WEIGHTS.AVG_DAILY_BALANCE) / 100,
    details: bankAnalysis
      ? getADBDetails(bankAnalysis.avgDailyBalance)
      : "No bank analysis available",
  });

  // 3. Deposit Consistency Component (15%)
  const depositScore = bankAnalysis
    ? calculateDepositConsistencyScore(bankAnalysis)
    : 0;
  components.push({
    name: "Deposit Consistency",
    weight: RISK_WEIGHTS.DEPOSIT_CONSISTENCY,
    score: depositScore,
    weightedScore: (depositScore * RISK_WEIGHTS.DEPOSIT_CONSISTENCY) / 100,
    details: bankAnalysis
      ? getDepositDetails(bankAnalysis)
      : "No bank analysis available",
  });

  // 4. NSF Frequency Component (15%)
  const nsfScore = bankAnalysis ? calculateNSFScore(bankAnalysis.nsfCount) : 50;
  components.push({
    name: "NSF Frequency",
    weight: RISK_WEIGHTS.NSF_FREQUENCY,
    score: nsfScore,
    weightedScore: (nsfScore * RISK_WEIGHTS.NSF_FREQUENCY) / 100,
    details: bankAnalysis
      ? getNSFDetails(bankAnalysis.nsfCount)
      : "No bank analysis available",
  });

  // 5. Time in Business Component (10%)
  const tibScore = calculateTimeInBusinessScore(merchant.timeInBusiness);
  components.push({
    name: "Time in Business",
    weight: RISK_WEIGHTS.TIME_IN_BUSINESS,
    score: tibScore,
    weightedScore: (tibScore * RISK_WEIGHTS.TIME_IN_BUSINESS) / 100,
    details: getTIBDetails(merchant.timeInBusiness),
  });

  // 6. Industry Risk Component (10%)
  const industryScore = calculateIndustryRiskScore(merchant.industryRiskTier);
  components.push({
    name: "Industry Risk",
    weight: RISK_WEIGHTS.INDUSTRY_RISK,
    score: industryScore,
    weightedScore: (industryScore * RISK_WEIGHTS.INDUSTRY_RISK) / 100,
    details: getIndustryDetails(merchant.industryRiskTier),
  });

  // 7. Existing MCA Load Component (10%)
  const mcaLoadScore = calculateMCALoadScore(
    deal.existingPositions,
    bankAnalysis?.estimatedDailyLoad || 0,
    merchant.monthlyRevenue || 0
  );
  components.push({
    name: "Existing MCA Load",
    weight: RISK_WEIGHTS.EXISTING_MCA_LOAD,
    score: mcaLoadScore,
    weightedScore: (mcaLoadScore * RISK_WEIGHTS.EXISTING_MCA_LOAD) / 100,
    details: getMCALoadDetails(deal.existingPositions, bankAnalysis?.estimatedDailyLoad),
  });

  // 8. Revenue Stability Component (5%)
  const revenueScore = bankAnalysis
    ? calculateRevenueStabilityScore(bankAnalysis.revenueTrend)
    : 50;
  components.push({
    name: "Revenue Stability",
    weight: RISK_WEIGHTS.REVENUE_STABILITY,
    score: revenueScore,
    weightedScore: (revenueScore * RISK_WEIGHTS.REVENUE_STABILITY) / 100,
    details: bankAnalysis
      ? getRevenueDetails(bankAnalysis.revenueTrend)
      : "No bank analysis available",
  });

  // Calculate total score
  const totalScore = Math.round(
    components.reduce((sum, c) => sum + c.weightedScore, 0)
  );

  // Determine paper grade
  const grade = determinePaperGrade(fico, totalScore);

  // Check for warnings
  if (fico > 0 && fico < 550) {
    warnings.push("FICO score below 550 - high risk");
  }
  if (bankAnalysis && bankAnalysis.nsfCount > 5) {
    warnings.push(`High NSF count: ${bankAnalysis.nsfCount} in analyzed period`);
  }
  if (deal.existingPositions > 0) {
    warnings.push(`${deal.existingPositions} existing MCA position(s) detected`);
  }
  if (deal.stackingDetected) {
    warnings.push("Stacking detected - merchant has multiple active MCAs");
  }
  if (merchant.timeInBusiness && merchant.timeInBusiness < 12) {
    warnings.push("Business less than 12 months old");
  }

  // Check auto-approve criteria
  const autoApprove = checkAutoApprove(
    fico,
    merchant,
    bankAnalysis,
    deal,
    totalScore
  );

  // Check auto-decline criteria
  const { shouldDecline, reasons } = checkAutoDecline(
    fico,
    merchant,
    bankAnalysis,
    deal
  );
  declineReasons.push(...reasons);

  return {
    totalScore,
    grade,
    components,
    autoApprove: autoApprove && !shouldDecline,
    autoDecline: shouldDecline,
    declineReasons,
    warnings,
  };
}

// ============================================
// SCORE CALCULATION HELPERS
// ============================================

function calculateFicoScore(fico: number): number {
  if (!fico || fico === 0) return 0;
  if (fico >= 750) return 100;
  if (fico >= 700) return 90;
  if (fico >= 650) return 80;
  if (fico >= 600) return 65;
  if (fico >= 550) return 50;
  if (fico >= 500) return 35;
  return 20;
}

function getFicoDetails(fico: number): string {
  if (!fico || fico === 0) return "No FICO score available";
  if (fico >= 750) return `Excellent (${fico})`;
  if (fico >= 700) return `Good (${fico})`;
  if (fico >= 650) return `Fair (${fico})`;
  if (fico >= 600) return `Below Average (${fico})`;
  if (fico >= 550) return `Poor (${fico})`;
  return `Very Poor (${fico})`;
}

function calculateADBScore(adb: number, requestedAmount: number): number {
  const ratio = adb / (requestedAmount || 1);
  if (ratio >= 0.5) return 100;
  if (ratio >= 0.3) return 85;
  if (ratio >= 0.2) return 70;
  if (ratio >= 0.1) return 50;
  if (ratio >= 0.05) return 30;
  return 15;
}

function getADBDetails(adb: number): string {
  if (adb >= 25000) return `Strong ($${adb.toLocaleString()})`;
  if (adb >= 10000) return `Good ($${adb.toLocaleString()})`;
  if (adb >= 5000) return `Fair ($${adb.toLocaleString()})`;
  return `Low ($${adb.toLocaleString()})`;
}

function calculateDepositConsistencyScore(bankAnalysis: BankAnalysisData): number {
  const daysWithDeposits = bankAnalysis.depositDaysCount;
  const totalDays = bankAnalysis.monthsAnalyzed * 30;
  const consistency = (daysWithDeposits / totalDays) * 100;

  if (consistency >= 80) return 100;
  if (consistency >= 60) return 80;
  if (consistency >= 40) return 60;
  if (consistency >= 20) return 40;
  return 20;
}

function getDepositDetails(bankAnalysis: BankAnalysisData): string {
  const daysWithDeposits = bankAnalysis.depositDaysCount;
  const totalDays = bankAnalysis.monthsAnalyzed * 30;
  const percentage = Math.round((daysWithDeposits / totalDays) * 100);
  return `${daysWithDeposits} deposit days out of ${totalDays} (${percentage}% consistency)`;
}

function calculateNSFScore(nsfCount: number): number {
  if (nsfCount === 0) return 100;
  if (nsfCount <= 2) return 85;
  if (nsfCount <= 4) return 65;
  if (nsfCount <= 6) return 45;
  if (nsfCount <= 10) return 25;
  return 10;
}

function getNSFDetails(nsfCount: number): string {
  if (nsfCount === 0) return "No NSF/overdraft activity - excellent";
  if (nsfCount <= 2) return `${nsfCount} NSF items - acceptable`;
  if (nsfCount <= 5) return `${nsfCount} NSF items - concerning`;
  return `${nsfCount} NSF items - high risk`;
}

function calculateTimeInBusinessScore(months: number | null): number {
  if (!months) return 0;
  if (months >= 60) return 100; // 5+ years
  if (months >= 36) return 90; // 3+ years
  if (months >= 24) return 80; // 2+ years
  if (months >= 12) return 65; // 1+ year
  if (months >= 6) return 40; // 6+ months
  return 20;
}

function getTIBDetails(months: number | null): string {
  if (!months) return "Time in business unknown";
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (years >= 1) {
    return `${years} year${years > 1 ? "s" : ""}${remainingMonths > 0 ? ` ${remainingMonths} months` : ""}`;
  }
  return `${months} months`;
}

function calculateIndustryRiskScore(tier: IndustryRiskTier): number {
  switch (tier) {
    case "A":
      return 100;
    case "B":
      return 75;
    case "C":
      return 50;
    case "D":
      return 20;
    default:
      return 50;
  }
}

function getIndustryDetails(tier: IndustryRiskTier): string {
  switch (tier) {
    case "A":
      return "Low risk industry";
    case "B":
      return "Moderate risk industry";
    case "C":
      return "Higher risk industry";
    case "D":
      return "High risk/restricted industry";
    default:
      return "Industry risk unknown";
  }
}

function calculateMCALoadScore(
  positions: number,
  dailyLoad: number,
  monthlyRevenue: number
): number {
  if (positions === 0 && dailyLoad === 0) return 100;

  // Calculate load as percentage of daily revenue
  const dailyRevenue = monthlyRevenue / 22; // 22 business days
  const loadPercentage = dailyLoad / (dailyRevenue || 1);

  if (positions === 0) return 100;
  if (positions === 1 && loadPercentage < 0.15) return 70;
  if (positions === 1) return 55;
  if (positions === 2 && loadPercentage < 0.25) return 40;
  if (positions === 2) return 30;
  return 15;
}

function getMCALoadDetails(positions: number, dailyLoad: number | null | undefined): string {
  if (positions === 0) return "First position - no existing MCAs";
  if (positions === 1) {
    return `1 existing position${dailyLoad ? `, ~$${dailyLoad.toLocaleString()}/day load` : ""}`;
  }
  return `${positions} existing positions${dailyLoad ? `, ~$${dailyLoad.toLocaleString()}/day total load` : ""} - STACKED`;
}

function calculateRevenueStabilityScore(trend: RevenueTrend): number {
  switch (trend) {
    case "GROWING":
      return 100;
    case "STABLE":
      return 80;
    case "DECLINING":
      return 40;
    default:
      return 50;
  }
}

function getRevenueDetails(trend: RevenueTrend): string {
  switch (trend) {
    case "GROWING":
      return "Revenue trending upward";
    case "STABLE":
      return "Revenue stable";
    case "DECLINING":
      return "Revenue declining - risk factor";
    default:
      return "Revenue trend unknown";
  }
}

// ============================================
// PAPER GRADE DETERMINATION
// ============================================

function determinePaperGrade(fico: number, totalScore: number): PaperGrade {
  // Grade A: FICO >= 650 AND score >= 75
  if (fico >= PAPER_GRADE_THRESHOLDS.A.minFico && totalScore >= PAPER_GRADE_THRESHOLDS.A.minScore) {
    return "A";
  }
  // Grade B: FICO >= 575 AND score >= 60
  if (fico >= PAPER_GRADE_THRESHOLDS.B.minFico && totalScore >= PAPER_GRADE_THRESHOLDS.B.minScore) {
    return "B";
  }
  // Grade C: FICO >= 500 AND score >= 45
  if (fico >= PAPER_GRADE_THRESHOLDS.C.minFico && totalScore >= PAPER_GRADE_THRESHOLDS.C.minScore) {
    return "C";
  }
  // Grade D: Everything else
  return "D";
}

// ============================================
// AUTO DECISION LOGIC
// ============================================

function checkAutoApprove(
  fico: number,
  merchant: MerchantData,
  bankAnalysis: BankAnalysisData | null,
  deal: DealData,
  totalScore: number
): boolean {
  if (!bankAnalysis) return false;
  if (fico < AUTO_APPROVE_CRITERIA.minFico) return false;
  if (!merchant.timeInBusiness || merchant.timeInBusiness < AUTO_APPROVE_CRITERIA.minTimeInBusiness)
    return false;
  if (bankAnalysis.avgDailyBalance < AUTO_APPROVE_CRITERIA.minAvgDailyBalance)
    return false;
  if (bankAnalysis.nsfCount > AUTO_APPROVE_CRITERIA.maxNsfCount) return false;
  if (deal.existingPositions > AUTO_APPROVE_CRITERIA.maxPositions) return false;

  // Check request multiple
  const monthlyRevenue = merchant.monthlyRevenue || 0;
  const requestMultiple = deal.requestedAmount / (monthlyRevenue || 1);
  if (requestMultiple > AUTO_APPROVE_CRITERIA.maxRequestMultiple) return false;

  // Must have a good score
  if (totalScore < 70) return false;

  return true;
}

function checkAutoDecline(
  fico: number,
  merchant: MerchantData,
  bankAnalysis: BankAnalysisData | null,
  deal: DealData
): { shouldDecline: boolean; reasons: string[] } {
  const reasons: string[] = [];

  // FICO too low
  if (fico > 0 && fico < AUTO_DECLINE_CRITERIA.maxFico) {
    reasons.push(`FICO score ${fico} below minimum threshold of ${AUTO_DECLINE_CRITERIA.maxFico}`);
  }

  // Time in business too short
  if (
    merchant.timeInBusiness &&
    merchant.timeInBusiness < AUTO_DECLINE_CRITERIA.minTimeInBusiness
  ) {
    reasons.push(
      `Time in business (${merchant.timeInBusiness} months) below minimum of ${AUTO_DECLINE_CRITERIA.minTimeInBusiness} months`
    );
  }

  // Revenue too low
  if (
    merchant.monthlyRevenue &&
    merchant.monthlyRevenue < AUTO_DECLINE_CRITERIA.minMonthlyRevenue
  ) {
    reasons.push(
      `Monthly revenue ($${merchant.monthlyRevenue.toLocaleString()}) below minimum of $${AUTO_DECLINE_CRITERIA.minMonthlyRevenue.toLocaleString()}`
    );
  }

  // Too many NSFs
  if (bankAnalysis && bankAnalysis.nsfCount > AUTO_DECLINE_CRITERIA.maxNsfCount) {
    reasons.push(
      `NSF count (${bankAnalysis.nsfCount}) exceeds maximum of ${AUTO_DECLINE_CRITERIA.maxNsfCount}`
    );
  }

  // Too many existing positions
  if (deal.existingPositions >= AUTO_DECLINE_CRITERIA.maxPositions) {
    reasons.push(
      `${deal.existingPositions} existing MCA positions - maximum ${AUTO_DECLINE_CRITERIA.maxPositions - 1} allowed`
    );
  }

  // Prohibited industry
  if (merchant.industryRiskTier === "D") {
    reasons.push("Industry classified as prohibited/high-risk");
  }

  return {
    shouldDecline: reasons.length > 0,
    reasons,
  };
}

// ============================================
// OFFER CALCULATION
// ============================================

export function calculateOffer(
  grade: PaperGrade,
  requestedAmount: number,
  monthlyRevenue: number,
  existingPositions: number,
  existingDailyLoad: number = 0,
  brokerCommissionRate: number = 0.10
): OfferCalculation {
  // Determine max amount based on grade multiple
  const maxMultiple = MAX_MULTIPLES[grade];
  const maxAmount = monthlyRevenue * maxMultiple;

  // Approved amount is lesser of requested or max
  const approvedAmount = Math.min(requestedAmount, maxAmount);

  // Get factor rate for grade
  const factorRate = FACTOR_RATES[grade].default;

  // Calculate payback
  const paybackAmount = approvedAmount * factorRate;

  // Get term days
  const termDays = TERM_DAYS[grade].default;

  // Calculate daily payment
  const dailyPayment = paybackAmount / termDays;

  // Weekly payment (5 business days)
  const weeklyPayment = dailyPayment * 5;

  // Calculate holdback percentage (daily payment as % of daily revenue)
  const dailyRevenue = monthlyRevenue / 22;
  const totalDailyPayment = dailyPayment + existingDailyLoad;
  const holdbackPercentage = (totalDailyPayment / dailyRevenue) * 100;

  // Position
  const position = existingPositions + 1;

  // Commission calculation
  const commission = approvedAmount * brokerCommissionRate;

  return {
    approvedAmount: Math.round(approvedAmount * 100) / 100,
    factorRate,
    paybackAmount: Math.round(paybackAmount * 100) / 100,
    termDays,
    dailyPayment: Math.round(dailyPayment * 100) / 100,
    weeklyPayment: Math.round(weeklyPayment * 100) / 100,
    holdbackPercentage: Math.round(holdbackPercentage * 10) / 10,
    position,
    commission: Math.round(commission * 100) / 100,
    commissionRate: brokerCommissionRate,
  };
}

export function generateOfferTiers(
  grade: PaperGrade,
  requestedAmount: number,
  monthlyRevenue: number
): OfferTier[] {
  const tiers: OfferTier[] = [];
  const rates = FACTOR_RATES[grade];
  const terms = TERM_DAYS[grade];
  const maxMultiple = MAX_MULTIPLES[grade];
  const maxAmount = monthlyRevenue * maxMultiple;
  const approvedAmount = Math.min(requestedAmount, maxAmount);

  // Conservative tier
  tiers.push({
    name: "Conservative",
    factorRate: rates.min,
    termDays: terms.max,
    maxMultiple: maxMultiple * 0.75,
    dailyPayment: (approvedAmount * 0.75 * rates.min) / terms.max,
    weeklyPayment: ((approvedAmount * 0.75 * rates.min) / terms.max) * 5,
    paybackAmount: approvedAmount * 0.75 * rates.min,
  });

  // Standard tier
  tiers.push({
    name: "Standard",
    factorRate: rates.default,
    termDays: terms.default,
    maxMultiple,
    dailyPayment: (approvedAmount * rates.default) / terms.default,
    weeklyPayment: ((approvedAmount * rates.default) / terms.default) * 5,
    paybackAmount: approvedAmount * rates.default,
  });

  // Aggressive tier
  tiers.push({
    name: "Aggressive",
    factorRate: rates.max,
    termDays: terms.min,
    maxMultiple: maxMultiple * 1.1,
    dailyPayment: (approvedAmount * rates.max) / terms.min,
    weeklyPayment: ((approvedAmount * rates.max) / terms.min) * 5,
    paybackAmount: approvedAmount * rates.max,
  });

  return tiers;
}

// ============================================
// STACKING DETECTION
// ============================================

export interface StackingResult {
  isStacked: boolean;
  totalPositions: number;
  detectedPayments: MCAPayment[];
  totalDailyLoad: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  recommendations: string[];
}

const MCA_PAYMENT_PATTERNS = [
  // Common MCA company name patterns
  /\b(mca|merchant\s*cash|advance|funding|capital)\b/i,
  /\b(clearbanc|square\s*capital|paypal\s*loan|kabbage|ondeck)\b/i,
  /\b(bluevine|fundbox|lendio|can\s*capital|rapid\s*advance)\b/i,
  /\b(daily\s*ach|daily\s*payment|daily\s*debit)\b/i,
];

export function detectStacking(
  bankAnalysis: BankAnalysisData | null,
  uccFilings: { filingNumber: string | null; status: string }[] = []
): StackingResult {
  const detectedPayments: MCAPayment[] = [];
  let totalDailyLoad = 0;

  // Check bank analysis for MCA payments
  if (bankAnalysis?.detectedMCAPayments) {
    detectedPayments.push(...bankAnalysis.detectedMCAPayments);
    totalDailyLoad = bankAnalysis.estimatedDailyLoad || 0;
  }

  // Count UCC filings as positions
  const activeUCCs = uccFilings.filter(
    (u) => u.status === "FILED" || u.status === "ACCEPTED"
  ).length;

  const totalPositions = Math.max(detectedPayments.length, activeUCCs);

  // Determine risk level
  let riskLevel: StackingResult["riskLevel"] = "LOW";
  const recommendations: string[] = [];

  if (totalPositions === 0) {
    riskLevel = "LOW";
    recommendations.push("First position - proceed with standard underwriting");
  } else if (totalPositions === 1) {
    riskLevel = "MEDIUM";
    recommendations.push("Second position - verify payoff or calculate combined load");
    recommendations.push("Consider reduced advance amount");
  } else if (totalPositions === 2) {
    riskLevel = "HIGH";
    recommendations.push("Third position - high stacking risk");
    recommendations.push("Recommend declining or requiring payoff of existing positions");
  } else {
    riskLevel = "CRITICAL";
    recommendations.push("Multiple existing positions - auto-decline recommended");
    recommendations.push("Merchant appears over-leveraged");
  }

  return {
    isStacked: totalPositions > 0,
    totalPositions,
    detectedPayments,
    totalDailyLoad,
    riskLevel,
    recommendations,
  };
}

// ============================================
// BANK STATEMENT ANALYSIS HELPERS
// ============================================

export function analyzeBankMetrics(bankAnalysis: BankAnalysisData): {
  healthScore: number;
  metrics: {
    name: string;
    value: string;
    status: "good" | "warning" | "danger";
    description: string;
  }[];
} {
  const metrics = [];

  // Average Daily Balance
  const adbStatus =
    bankAnalysis.avgDailyBalance >= 10000
      ? "good"
      : bankAnalysis.avgDailyBalance >= 5000
      ? "warning"
      : "danger";
  metrics.push({
    name: "Average Daily Balance",
    value: `$${bankAnalysis.avgDailyBalance.toLocaleString()}`,
    status: adbStatus as "good" | "warning" | "danger",
    description:
      adbStatus === "good"
        ? "Strong balance indicates healthy cash flow"
        : adbStatus === "warning"
        ? "Moderate balance - monitor closely"
        : "Low balance - cash flow concerns",
  });

  // Minimum Balance
  const minBalStatus =
    bankAnalysis.minBalance >= 1000
      ? "good"
      : bankAnalysis.minBalance >= 0
      ? "warning"
      : "danger";
  metrics.push({
    name: "Minimum Balance",
    value: `$${bankAnalysis.minBalance.toLocaleString()}`,
    status: minBalStatus as "good" | "warning" | "danger",
    description:
      bankAnalysis.minBalance < 0
        ? "Negative balance indicates overdraft issues"
        : bankAnalysis.minBalance < 1000
        ? "Low minimum balance - tight cash flow"
        : "Healthy minimum balance maintained",
  });

  // Deposit Activity
  const depositDaysRatio =
    bankAnalysis.depositDaysCount / (bankAnalysis.monthsAnalyzed * 22);
  const depositStatus =
    depositDaysRatio >= 0.7 ? "good" : depositDaysRatio >= 0.4 ? "warning" : "danger";
  metrics.push({
    name: "Deposit Consistency",
    value: `${bankAnalysis.depositDaysCount} days`,
    status: depositStatus as "good" | "warning" | "danger",
    description: `${Math.round(depositDaysRatio * 100)}% of business days had deposits`,
  });

  // NSF/Overdraft
  const nsfStatus =
    bankAnalysis.nsfCount === 0
      ? "good"
      : bankAnalysis.nsfCount <= 3
      ? "warning"
      : "danger";
  metrics.push({
    name: "NSF/Overdraft Count",
    value: bankAnalysis.nsfCount.toString(),
    status: nsfStatus as "good" | "warning" | "danger",
    description:
      bankAnalysis.nsfCount === 0
        ? "No NSF activity - excellent"
        : bankAnalysis.nsfCount <= 3
        ? "Some NSF activity - acceptable"
        : "High NSF count - significant risk",
  });

  // Revenue Trend
  const trendStatus =
    bankAnalysis.revenueTrend === "GROWING"
      ? "good"
      : bankAnalysis.revenueTrend === "STABLE"
      ? "good"
      : "danger";
  metrics.push({
    name: "Revenue Trend",
    value: bankAnalysis.revenueTrend,
    status: trendStatus as "good" | "warning" | "danger",
    description:
      bankAnalysis.revenueTrend === "GROWING"
        ? "Revenue is growing - positive indicator"
        : bankAnalysis.revenueTrend === "STABLE"
        ? "Revenue is stable"
        : "Revenue declining - risk factor",
  });

  // Calculate overall health score
  const statusScores = { good: 100, warning: 50, danger: 20 };
  const healthScore = Math.round(
    metrics.reduce((sum, m) => sum + statusScores[m.status], 0) / metrics.length
  );

  return { healthScore, metrics };
}
