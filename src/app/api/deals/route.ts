import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const createDealSchema = z.object({
  merchantId: z.string(),
  requestedAmount: z.number().positive(),
  source: z.enum(["DIRECT", "BROKER", "REFERRAL", "WEBSITE", "EMAIL", "IMPORT"]).optional(),
  brokerId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const stage = searchParams.get("stage");
    const merchantId = searchParams.get("merchantId");

    const deals = await prisma.deal.findMany({
      where: {
        ...(stage && { stage: stage as never }),
        ...(merchantId && { merchantId }),
      },
      include: {
        merchant: {
          select: {
            id: true,
            legalName: true,
            dbaName: true,
          },
        },
        underwriter: {
          select: {
            id: true,
            name: true,
          },
        },
        broker: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(deals);
  } catch (error) {
    console.error("Error fetching deals:", error);
    return NextResponse.json(
      { error: "Failed to fetch deals" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = createDealSchema.parse(body);

    const deal = await prisma.deal.create({
      data: {
        merchantId: data.merchantId,
        requestedAmount: data.requestedAmount,
        source: data.source || "DIRECT",
        brokerId: data.brokerId,
        createdById: session.user.id,
        stage: "NEW_LEAD",
      },
      include: {
        merchant: true,
      },
    });

    // Create stage history entry
    await prisma.dealStageHistory.create({
      data: {
        dealId: deal.id,
        toStage: "NEW_LEAD",
        changedBy: session.user.id,
      },
    });

    return NextResponse.json(deal, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error creating deal:", error);
    return NextResponse.json(
      { error: "Failed to create deal" },
      { status: 500 }
    );
  }
}
