import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import {
  calculateRiskScore,
  calculateOffer,
  detectStacking,
  analyzeBankMetrics,
  MerchantData,
  OwnerData,
  BankAnalysisData,
  DealData,
  MCAPayment,
} from "@/lib/underwriting";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { dealId } = body;

    if (!dealId) {
      return NextResponse.json(
        { error: "Deal ID is required" },
        { status: 400 }
      );
    }

    // Fetch the deal with all related data
    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: {
        merchant: {
          include: {
            owners: true,
            uccFilings: {
              select: {
                filingNumber: true,
                status: true,
              },
            },
          },
        },
        bankAnalysis: true,
        broker: {
          select: {
            commissionRate: true,
          },
        },
      },
    });

    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    // Prepare data for risk scoring
    const merchantData: MerchantData = {
      timeInBusiness: deal.merchant.timeInBusiness,
      monthlyRevenue: deal.merchant.monthlyRevenue
        ? Number(deal.merchant.monthlyRevenue)
        : null,
      industryRiskTier: deal.merchant.industryRiskTier,
    };

    const ownerData: OwnerData[] = deal.merchant.owners.map((owner) => ({
      ficoScore: owner.ficoScore,
      ownership: Number(owner.ownership),
      isPrimary: owner.isPrimary,
    }));

    const bankAnalysisData: BankAnalysisData | null = deal.bankAnalysis
      ? {
          avgDailyBalance: Number(deal.bankAnalysis.avgDailyBalance),
          minBalance: Number(deal.bankAnalysis.minBalance),
          maxBalance: Number(deal.bankAnalysis.maxBalance),
          totalDeposits: Number(deal.bankAnalysis.totalDeposits),
          depositCount: deal.bankAnalysis.depositCount,
          avgDeposit: Number(deal.bankAnalysis.avgDeposit),
          depositDaysCount: deal.bankAnalysis.depositDaysCount,
          nsfCount: deal.bankAnalysis.nsfCount,
          overdraftCount: deal.bankAnalysis.overdraftCount,
          monthsAnalyzed: deal.bankAnalysis.monthsAnalyzed,
          revenueTrend: deal.bankAnalysis.revenueTrend,
          estimatedDailyLoad: deal.bankAnalysis.estimatedDailyLoad
            ? Number(deal.bankAnalysis.estimatedDailyLoad)
            : null,
          detectedMCAPayments: deal.bankAnalysis.detectedMCAPayments as MCAPayment[] | null,
        }
      : null;

    const dealData: DealData = {
      requestedAmount: Number(deal.requestedAmount),
      existingPositions: deal.existingPositions,
      stackingDetected: deal.stackingDetected,
    };

    // Calculate risk score
    const riskResult = calculateRiskScore(
      merchantData,
      ownerData,
      bankAnalysisData,
      dealData
    );

    // Detect stacking
    const stackingResult = detectStacking(
      bankAnalysisData,
      deal.merchant.uccFilings
    );

    // Calculate offer if we have enough data
    let offerResult = null;
    if (merchantData.monthlyRevenue) {
      offerResult = calculateOffer(
        riskResult.grade,
        Number(deal.requestedAmount),
        merchantData.monthlyRevenue,
        deal.existingPositions,
        bankAnalysisData?.estimatedDailyLoad || 0,
        deal.broker?.commissionRate ? Number(deal.broker.commissionRate) : 0.10
      );
    }

    // Analyze bank metrics if available
    let bankMetrics = null;
    if (bankAnalysisData) {
      bankMetrics = analyzeBankMetrics(bankAnalysisData);
    }

    return NextResponse.json({
      dealId: deal.id,
      merchantName: deal.merchant.legalName,
      riskAnalysis: riskResult,
      stackingAnalysis: stackingResult,
      offer: offerResult,
      bankMetrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error analyzing deal:", error);
    return NextResponse.json(
      { error: "Failed to analyze deal" },
      { status: 500 }
    );
  }
}
