import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import {
  calculateOffer,
  generateOfferTiers,
  FACTOR_RATES,
  TERM_DAYS,
  MAX_MULTIPLES,
} from "@/lib/underwriting";
import { PaperGrade } from "@prisma/client";

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
    const {
      dealId,
      grade,
      customAmount,
      customFactorRate,
      customTermDays,
    } = body;

    if (!dealId) {
      return NextResponse.json(
        { error: "Deal ID is required" },
        { status: 400 }
      );
    }

    // Fetch the deal
    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: {
        merchant: true,
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

    const monthlyRevenue = deal.merchant.monthlyRevenue
      ? Number(deal.merchant.monthlyRevenue)
      : 0;

    if (!monthlyRevenue) {
      return NextResponse.json(
        { error: "Monthly revenue is required for offer calculation" },
        { status: 400 }
      );
    }

    const paperGrade = (grade || deal.paperGrade || "C") as PaperGrade;
    const requestedAmount = customAmount || Number(deal.requestedAmount);
    const existingDailyLoad = deal.bankAnalysis?.estimatedDailyLoad
      ? Number(deal.bankAnalysis.estimatedDailyLoad)
      : 0;
    const brokerRate = deal.broker?.commissionRate
      ? Number(deal.broker.commissionRate)
      : 0.10;

    // Calculate standard offer
    const standardOffer = calculateOffer(
      paperGrade,
      requestedAmount,
      monthlyRevenue,
      deal.existingPositions,
      existingDailyLoad,
      brokerRate
    );

    // Generate offer tiers
    const offerTiers = generateOfferTiers(
      paperGrade,
      requestedAmount,
      monthlyRevenue
    );

    // Calculate custom offer if parameters provided
    let customOffer = null;
    if (customFactorRate || customTermDays || customAmount) {
      const factorRate = customFactorRate || FACTOR_RATES[paperGrade].default;
      const termDays = customTermDays || TERM_DAYS[paperGrade].default;
      const amount = customAmount || standardOffer.approvedAmount;

      const paybackAmount = amount * factorRate;
      const dailyPayment = paybackAmount / termDays;
      const weeklyPayment = dailyPayment * 5;
      const dailyRevenue = monthlyRevenue / 22;
      const holdbackPercentage =
        ((dailyPayment + existingDailyLoad) / dailyRevenue) * 100;

      customOffer = {
        approvedAmount: Math.round(amount * 100) / 100,
        factorRate,
        paybackAmount: Math.round(paybackAmount * 100) / 100,
        termDays,
        dailyPayment: Math.round(dailyPayment * 100) / 100,
        weeklyPayment: Math.round(weeklyPayment * 100) / 100,
        holdbackPercentage: Math.round(holdbackPercentage * 10) / 10,
        position: deal.existingPositions + 1,
        commission: Math.round(amount * brokerRate * 100) / 100,
        commissionRate: brokerRate,
      };
    }

    // Calculate key metrics
    const maxAmount = monthlyRevenue * MAX_MULTIPLES[paperGrade];
    const dailyRevenue = monthlyRevenue / 22;
    const maxDailyPaymentCapacity = dailyRevenue * 0.25 - existingDailyLoad; // 25% max holdback

    return NextResponse.json({
      dealId: deal.id,
      merchantName: deal.merchant.legalName,
      paperGrade,
      monthlyRevenue,
      requestedAmount: Number(deal.requestedAmount),
      existingPositions: deal.existingPositions,
      existingDailyLoad,
      standardOffer,
      offerTiers,
      customOffer,
      constraints: {
        maxAmount: Math.round(maxAmount * 100) / 100,
        maxMultiple: MAX_MULTIPLES[paperGrade],
        factorRateRange: FACTOR_RATES[paperGrade],
        termDaysRange: TERM_DAYS[paperGrade],
        maxDailyPaymentCapacity: Math.round(maxDailyPaymentCapacity * 100) / 100,
        dailyRevenue: Math.round(dailyRevenue * 100) / 100,
      },
    });
  } catch (error) {
    console.error("Error calculating offer:", error);
    return NextResponse.json(
      { error: "Failed to calculate offer" },
      { status: 500 }
    );
  }
}
