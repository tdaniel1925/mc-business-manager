import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { DealStage } from "@prisma/client";

const updateDealSchema = z.object({
  requestedAmount: z.number().positive().optional(),
  approvedAmount: z.number().positive().optional(),
  factorRate: z.number().positive().optional(),
  termDays: z.number().int().positive().optional(),
  dailyPayment: z.number().positive().optional(),
  weeklyPayment: z.number().positive().optional(),
  stage: z.nativeEnum(DealStage).optional(),
  paperGrade: z.enum(["A", "B", "C", "D"]).optional(),
  riskScore: z.number().int().min(0).max(100).optional(),
  underwriterId: z.string().optional(),
  decisionNotes: z.string().optional(),
  declineReasons: z.array(z.string()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const deal = await prisma.deal.findUnique({
      where: { id },
      include: {
        merchant: {
          include: {
            owners: true,
            uccFilings: {
              select: {
                id: true,
                filingNumber: true,
                filingType: true,
                filingState: true,
                status: true,
                filedAt: true,
              },
            },
          },
        },
        underwriter: {
          select: { id: true, name: true, email: true },
        },
        broker: {
          select: { id: true, companyName: true, contactName: true },
        },
        createdBy: {
          select: { id: true, name: true },
        },
        documents: true,
        bankAnalysis: true,
        disclosures: true,
        contracts: {
          include: { signatures: true },
        },
        comments: {
          include: {
            user: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        stageHistory: {
          orderBy: { changedAt: "desc" },
        },
      },
    });

    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    return NextResponse.json(deal);
  } catch (error) {
    console.error("Error fetching deal:", error);
    return NextResponse.json(
      { error: "Failed to fetch deal" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const data = updateDealSchema.parse(body);

    // Get current deal for stage history
    const currentDeal = await prisma.deal.findUnique({
      where: { id },
      select: { stage: true },
    });

    if (!currentDeal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    // Calculate payback amount if factor rate and approved amount are provided
    let paybackAmount = undefined;
    if (data.approvedAmount && data.factorRate) {
      paybackAmount = data.approvedAmount * data.factorRate;
    }

    const deal = await prisma.deal.update({
      where: { id },
      data: {
        ...data,
        ...(paybackAmount && { paybackAmount }),
        ...(data.stage && { stageChangedAt: new Date() }),
        ...(data.stage === "FUNDED" && { fundedAt: new Date() }),
        ...(["APPROVED", "DECLINED"].includes(data.stage || "") && {
          decisionDate: new Date(),
        }),
      },
      include: {
        merchant: true,
      },
    });

    // Create stage history if stage changed
    if (data.stage && data.stage !== currentDeal.stage) {
      await prisma.dealStageHistory.create({
        data: {
          dealId: id,
          fromStage: currentDeal.stage,
          toStage: data.stage,
          changedBy: session.user.id,
        },
      });
    }

    return NextResponse.json(deal);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error updating deal:", error);
    return NextResponse.json(
      { error: "Failed to update deal" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.deal.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting deal:", error);
    return NextResponse.json(
      { error: "Failed to delete deal" },
      { status: 500 }
    );
  }
}
