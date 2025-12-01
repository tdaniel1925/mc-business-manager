import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const leads = await prisma.marketingLead.findMany({
      include: {
        campaign: true,
        _count: {
          select: {
            callLogs: true,
            interactions: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(leads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      businessName,
      contactName,
      email,
      phone,
      website,
      industry,
      annualRevenue,
      monthlyRevenue,
      timeInBusiness,
      city,
      state,
      zipCode,
      source,
      sourceDetail,
      utmSource,
      utmMedium,
      utmCampaign,
      campaignId,
      notes,
    } = body;

    if (!source) {
      return NextResponse.json(
        { error: "Source is required" },
        { status: 400 }
      );
    }

    // Get company
    const company = await prisma.company.findFirst();
    if (!company) {
      return NextResponse.json(
        { error: "No company found. Please create a company first." },
        { status: 400 }
      );
    }

    const lead = await prisma.marketingLead.create({
      data: {
        companyId: company.id,
        businessName,
        contactName,
        email,
        phone,
        website,
        industry,
        annualRevenue,
        monthlyRevenue,
        timeInBusiness,
        city,
        state,
        zipCode,
        source,
        sourceDetail,
        utmSource,
        utmMedium,
        utmCampaign,
        campaignId,
        notes,
        qualificationStatus: "NEW",
        leadScore: 0,
      },
    });

    return NextResponse.json(lead);
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 }
    );
  }
}
