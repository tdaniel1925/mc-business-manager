import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { PaperGrade, DealStage } from "@prisma/client";

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
      decision, // "APPROVE" | "DECLINE" | "COUNTER"
      paperGrade,
      riskScore,
      approvedAmount,
      factorRate,
      termDays,
      dailyPayment,
      weeklyPayment,
      paybackAmount,
      declineReasons,
      notes,
    } = body;

    if (!dealId || !decision) {
      return NextResponse.json(
        { error: "Deal ID and decision are required" },
        { status: 400 }
      );
    }

    // Verify the deal exists
    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: {
        merchant: true,
      },
    });

    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    // Get the user's database ID
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    });

    // Determine new stage based on decision
    let newStage: DealStage;
    switch (decision) {
      case "APPROVE":
        newStage = "APPROVED";
        break;
      case "DECLINE":
        newStage = "DECLINED";
        break;
      case "COUNTER":
        newStage = "APPROVED"; // Counter offer is still an approval
        break;
      default:
        return NextResponse.json(
          { error: "Invalid decision type" },
          { status: 400 }
        );
    }

    // Update the deal
    const updateData: Record<string, unknown> = {
      stage: newStage,
      stageChangedAt: new Date(),
      decisionDate: new Date(),
      decisionNotes: notes || null,
      underwriterId: dbUser?.id || deal.underwriterId,
    };

    // Add approval details if approved
    if (decision === "APPROVE" || decision === "COUNTER") {
      if (paperGrade) updateData.paperGrade = paperGrade as PaperGrade;
      if (riskScore !== undefined) updateData.riskScore = riskScore;
      if (approvedAmount) updateData.approvedAmount = approvedAmount;
      if (factorRate) updateData.factorRate = factorRate;
      if (termDays) updateData.termDays = termDays;
      if (dailyPayment) updateData.dailyPayment = dailyPayment;
      if (weeklyPayment) updateData.weeklyPayment = weeklyPayment;
      if (paybackAmount) updateData.paybackAmount = paybackAmount;
    }

    // Add decline reasons if declined
    if (decision === "DECLINE" && declineReasons) {
      updateData.declineReasons = declineReasons;
    }

    // Update the deal
    const updatedDeal = await prisma.deal.update({
      where: { id: dealId },
      data: updateData,
    });

    // Create stage history entry
    await prisma.dealStageHistory.create({
      data: {
        dealId,
        fromStage: deal.stage,
        toStage: newStage,
        changedBy: dbUser?.id || user.id,
        notes: `${decision}: ${notes || "No notes provided"}`,
      },
    });

    // Create a comment for the decision
    if (dbUser) {
      await prisma.comment.create({
        data: {
          dealId,
          userId: dbUser.id,
          content: generateDecisionComment(decision, {
            paperGrade,
            riskScore,
            approvedAmount,
            factorRate,
            termDays,
            declineReasons,
            notes,
          }),
          isInternal: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      deal: updatedDeal,
      decision,
      message: `Deal ${decision.toLowerCase()}ed successfully`,
    });
  } catch (error) {
    console.error("Error processing decision:", error);
    return NextResponse.json(
      { error: "Failed to process decision" },
      { status: 500 }
    );
  }
}

function generateDecisionComment(
  decision: string,
  details: {
    paperGrade?: string;
    riskScore?: number;
    approvedAmount?: number;
    factorRate?: number;
    termDays?: number;
    declineReasons?: string[];
    notes?: string;
  }
): string {
  if (decision === "APPROVE" || decision === "COUNTER") {
    return `**Underwriting Decision: ${decision === "COUNTER" ? "COUNTER OFFER" : "APPROVED"}**

Paper Grade: ${details.paperGrade || "N/A"}
Risk Score: ${details.riskScore || "N/A"}
Approved Amount: ${details.approvedAmount ? `$${details.approvedAmount.toLocaleString()}` : "N/A"}
Factor Rate: ${details.factorRate || "N/A"}
Term: ${details.termDays ? `${details.termDays} days` : "N/A"}

${details.notes ? `Notes: ${details.notes}` : ""}`;
  }

  return `**Underwriting Decision: DECLINED**

Reasons:
${details.declineReasons?.map((r) => `- ${r}`).join("\n") || "No reasons provided"}

${details.notes ? `Notes: ${details.notes}` : ""}`;
}
