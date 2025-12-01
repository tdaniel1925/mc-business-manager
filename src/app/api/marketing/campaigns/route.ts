import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: {
        _count: {
          select: {
            leads: true,
            contentPosts: true,
            adCampaigns: true,
          },
        },
        voiceCampaign: {
          select: {
            _count: {
              select: { callLogs: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, description, type, channel, budget, startDate, endDate } = body;

    if (!name || !type || !channel) {
      return NextResponse.json(
        { error: "Name, type, and channel are required" },
        { status: 400 }
      );
    }

    // For now, we'll use a placeholder companyId
    // In production, this would come from the authenticated user's session
    const company = await prisma.company.findFirst();
    if (!company) {
      return NextResponse.json(
        { error: "No company found. Please create a company first." },
        { status: 400 }
      );
    }

    const campaign = await prisma.campaign.create({
      data: {
        companyId: company.id,
        name,
        description,
        type,
        channel,
        budget: budget ? budget : null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        status: "DRAFT",
      },
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    );
  }
}
