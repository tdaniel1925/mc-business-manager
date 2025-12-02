"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Label,
} from "@/components/ui";
import {
  ArrowLeft,
  Building2,
  User,
  FileText,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Calculator,
  Shield,
  AlertCircle,
  Loader2,
  RefreshCw,
  CreditCard,
  Percent,
  Calendar,
} from "lucide-react";
import Link from "next/link";

interface RiskComponent {
  name: string;
  weight: number;
  score: number;
  weightedScore: number;
  details: string;
}

interface RiskAnalysis {
  totalScore: number;
  grade: string;
  components: RiskComponent[];
  autoApprove: boolean;
  autoDecline: boolean;
  declineReasons: string[];
  warnings: string[];
}

interface StackingAnalysis {
  isStacked: boolean;
  totalPositions: number;
  detectedPayments: Array<{
    name: string;
    amount: number;
    frequency: string;
  }>;
  totalDailyLoad: number;
  riskLevel: string;
  recommendations: string[];
}

interface Offer {
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

interface BankMetrics {
  healthScore: number;
  metrics: Array<{
    name: string;
    value: string;
    status: "good" | "warning" | "danger";
    description: string;
  }>;
}

interface AnalysisData {
  dealId: string;
  merchantName: string;
  riskAnalysis: RiskAnalysis;
  stackingAnalysis: StackingAnalysis;
  offer: Offer | null;
  bankMetrics: BankMetrics | null;
}

export default function UnderwritingAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const dealId = params.id as string;

  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [decisionNotes, setDecisionNotes] = useState("");

  // Custom offer fields
  const [customAmount, setCustomAmount] = useState("");
  const [customFactorRate, setCustomFactorRate] = useState("");
  const [customTermDays, setCustomTermDays] = useState("");

  const runAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const response = await fetch("/api/underwriting/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealId }),
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Analysis failed");
      }
    } catch {
      setError("Failed to run analysis. Please try again.");
    } finally {
      setIsAnalyzing(false);
      setIsLoading(false);
    }
  }, [dealId]);

  useEffect(() => {
    runAnalysis();
  }, [runAnalysis]);

  const handleDecision = async (decision: "APPROVE" | "DECLINE" | "COUNTER") => {
    if (!analysis) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {
        dealId,
        decision,
        paperGrade: analysis.riskAnalysis.grade,
        riskScore: analysis.riskAnalysis.totalScore,
        notes: decisionNotes,
      };

      if ((decision === "APPROVE" || decision === "COUNTER") && analysis.offer) {
        payload.approvedAmount = analysis.offer.approvedAmount;
        payload.factorRate = analysis.offer.factorRate;
        payload.termDays = analysis.offer.termDays;
        payload.dailyPayment = analysis.offer.dailyPayment;
        payload.weeklyPayment = analysis.offer.weeklyPayment;
        payload.paybackAmount = analysis.offer.paybackAmount;
      }

      if (decision === "DECLINE") {
        payload.declineReasons = analysis.riskAnalysis.declineReasons;
      }

      const response = await fetch("/api/underwriting/decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push("/underwriting");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to submit decision");
      }
    } catch {
      setError("Failed to submit decision. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const recalculateOffer = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/underwriting/offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealId,
          customAmount: customAmount ? parseFloat(customAmount) : undefined,
          customFactorRate: customFactorRate ? parseFloat(customFactorRate) : undefined,
          customTermDays: customTermDays ? parseInt(customTermDays) : undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (analysis && data.customOffer) {
          setAnalysis({ ...analysis, offer: data.customOffer });
        }
      }
    } catch {
      // Silently fail for recalculation
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Underwriting Analysis" subtitle="Loading..." />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Running risk analysis...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !analysis) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Underwriting Analysis" subtitle="Error" />
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Analysis Failed</p>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={runAnalysis}>Retry</Button>
                <Link href="/underwriting">
                  <Button variant="outline">Back to Queue</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { riskAnalysis, stackingAnalysis, offer, bankMetrics } = analysis || {};

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 45) return "text-orange-500";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 75) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    if (score >= 45) return "bg-orange-500";
    return "bg-red-500";
  };

  const getGradeVariant = (grade: string) => {
    switch (grade) {
      case "A": return "success";
      case "B": return "info";
      case "C": return "warning";
      case "D": return "danger";
      default: return "default";
    }
  };

  const getRiskLevelVariant = (level: string) => {
    switch (level) {
      case "LOW": return "success";
      case "MEDIUM": return "warning";
      case "HIGH": return "danger";
      case "CRITICAL": return "danger";
      default: return "default";
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title={analysis?.merchantName || "Underwriting Analysis"}
        subtitle={`Risk Score: ${riskAnalysis?.totalScore || "N/A"} | Grade: ${riskAnalysis?.grade || "N/A"}`}
        action={
          <div className="flex gap-2">
            <Link href="/underwriting">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <Button variant="outline" onClick={runAnalysis} disabled={isAnalyzing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isAnalyzing ? "animate-spin" : ""}`} />
              Re-analyze
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-6 overflow-auto">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Risk Score Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Risk Assessment
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    <Badge variant={getGradeVariant(riskAnalysis?.grade || "D")}>
                      Grade {riskAnalysis?.grade}
                    </Badge>
                    <span className={`text-3xl font-bold ${getScoreColor(riskAnalysis?.totalScore || 0)}`}>
                      {riskAnalysis?.totalScore}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Auto Decision Alerts */}
                {riskAnalysis?.autoApprove && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-medium text-green-700">Auto-Approve Eligible</p>
                      <p className="text-sm text-green-600">All auto-approve criteria met</p>
                    </div>
                  </div>
                )}

                {riskAnalysis?.autoDecline && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <XCircle className="w-6 h-6 text-red-600" />
                      <p className="font-medium text-red-700">Auto-Decline Triggered</p>
                    </div>
                    <ul className="list-disc list-inside text-sm text-red-600 ml-9">
                      {riskAnalysis.declineReasons.map((reason, i) => (
                        <li key={i}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Warnings */}
                {riskAnalysis?.warnings && riskAnalysis.warnings.length > 0 && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <AlertTriangle className="w-6 h-6 text-yellow-600" />
                      <p className="font-medium text-yellow-700">Warnings</p>
                    </div>
                    <ul className="list-disc list-inside text-sm text-yellow-700 ml-9">
                      {riskAnalysis.warnings.map((warning, i) => (
                        <li key={i}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Risk Components */}
                <div className="space-y-3 mt-4">
                  <h4 className="font-medium text-gray-700">Score Breakdown</h4>
                  {riskAnalysis?.components.map((component, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{component.name}</span>
                          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                            {component.weight}%
                          </span>
                        </div>
                        <span className={`font-bold ${getScoreColor(component.score)}`}>
                          {component.score}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className={`h-2 rounded-full ${getScoreBgColor(component.score)}`}
                          style={{ width: `${component.score}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-600">{component.details}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stacking Analysis */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Stacking Analysis
                  </CardTitle>
                  <Badge variant={getRiskLevelVariant(stackingAnalysis?.riskLevel || "LOW")}>
                    {stackingAnalysis?.riskLevel} Risk
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-3xl font-bold">{stackingAnalysis?.totalPositions || 0}</p>
                    <p className="text-sm text-gray-500">Existing Positions</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-3xl font-bold">
                      ${stackingAnalysis?.totalDailyLoad?.toLocaleString() || 0}
                    </p>
                    <p className="text-sm text-gray-500">Daily Load</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-3xl font-bold">
                      {offer?.position || 1}
                      {getOrdinalSuffix(offer?.position || 1)}
                    </p>
                    <p className="text-sm text-gray-500">Position</p>
                  </div>
                </div>

                {stackingAnalysis?.detectedPayments && stackingAnalysis.detectedPayments.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Detected MCA Payments</h4>
                    <div className="space-y-2">
                      {stackingAnalysis.detectedPayments.map((payment, i) => (
                        <div key={i} className="flex justify-between p-2 bg-gray-50 rounded">
                          <span>{payment.name}</span>
                          <span className="font-medium">
                            ${payment.amount.toLocaleString()}/{payment.frequency.toLowerCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-2">Recommendations</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {stackingAnalysis?.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Bank Statement Analysis */}
            {bankMetrics && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      Bank Statement Analysis
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Health Score:</span>
                      <span className={`text-2xl font-bold ${getScoreColor(bankMetrics.healthScore)}`}>
                        {bankMetrics.healthScore}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bankMetrics.metrics.map((metric, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${
                          metric.status === "good"
                            ? "bg-green-50 border-green-200"
                            : metric.status === "warning"
                            ? "bg-yellow-50 border-yellow-200"
                            : "bg-red-50 border-red-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-700">{metric.name}</span>
                          {metric.status === "good" ? (
                            <TrendingUp className="w-5 h-5 text-green-600" />
                          ) : metric.status === "warning" ? (
                            <Minus className="w-5 h-5 text-yellow-600" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <p className="text-2xl font-bold mb-1">{metric.value}</p>
                        <p className="text-sm text-gray-600">{metric.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-6">
            {/* Calculated Offer */}
            {offer && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Calculated Offer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg text-center">
                    <p className="text-sm text-blue-600 mb-1">Approved Amount</p>
                    <p className="text-3xl font-bold text-blue-700">
                      ${offer.approvedAmount.toLocaleString()}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <Percent className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Factor Rate</p>
                        <p className="font-semibold">{offer.factorRate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Term</p>
                        <p className="font-semibold">{offer.termDays} days</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Payback</p>
                        <p className="font-semibold">${offer.paybackAmount.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Daily</p>
                        <p className="font-semibold">${offer.dailyPayment.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Weekly Payment</span>
                      <span className="font-medium">${offer.weeklyPayment.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Holdback %</span>
                      <span className={`font-medium ${offer.holdbackPercentage > 20 ? "text-red-600" : ""}`}>
                        {offer.holdbackPercentage}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Commission</span>
                      <span className="font-medium">
                        ${offer.commission.toLocaleString()} ({(offer.commissionRate * 100).toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Customize Offer */}
            <Card>
              <CardHeader>
                <CardTitle>Customize Offer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder={offer?.approvedAmount.toString() || "Enter amount"}
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="factorRate">Factor Rate</Label>
                  <Input
                    id="factorRate"
                    type="number"
                    step="0.01"
                    placeholder={offer?.factorRate.toString() || "1.30"}
                    value={customFactorRate}
                    onChange={(e) => setCustomFactorRate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="termDays">Term (days)</Label>
                  <Input
                    id="termDays"
                    type="number"
                    placeholder={offer?.termDays.toString() || "120"}
                    value={customTermDays}
                    onChange={(e) => setCustomTermDays(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={recalculateOffer}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Calculator className="w-4 h-4 mr-2" />
                  )}
                  Recalculate
                </Button>
              </CardContent>
            </Card>

            {/* Decision Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Make Decision</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="notes">Decision Notes</Label>
                  <textarea
                    id="notes"
                    className="w-full min-h-[100px] p-3 border rounded-md text-sm resize-none"
                    placeholder="Add notes about this decision..."
                    value={decisionNotes}
                    onChange={(e) => setDecisionNotes(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => handleDecision("APPROVE")}
                    disabled={isSubmitting || riskAnalysis?.autoDecline}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Approve
                  </Button>

                  <Button
                    className="w-full bg-yellow-600 hover:bg-yellow-700"
                    onClick={() => handleDecision("COUNTER")}
                    disabled={isSubmitting || riskAnalysis?.autoDecline}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Counter Offer
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full border-red-300 text-red-600 hover:bg-red-50"
                    onClick={() => handleDecision("DECLINE")}
                    disabled={isSubmitting}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Decline
                  </Button>
                </div>

                {riskAnalysis?.autoDecline && (
                  <p className="text-xs text-center text-red-600">
                    Approve/Counter disabled due to auto-decline triggers
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardContent className="pt-6 space-y-2">
                <Link href={`/deals/${dealId}`} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    View Full Deal
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function getOrdinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
