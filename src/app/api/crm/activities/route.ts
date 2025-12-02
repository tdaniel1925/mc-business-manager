import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    const contactId = searchParams.get("contactId");
    const dealId = searchParams.get("dealId");

    const where: Record<string, unknown> = {};

    if (type) {
      where.type = type;
    }

    if (contactId) {
      where.contactId = contactId;
    }

    if (dealId) {
      where.dealId = dealId;
    }

    const activities = await prisma.activity.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}

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
      type,
      subject,
      description,
      outcome,
      duration,
      contactId,
      companyId,
      followUpDate,
    } = body;

    if (!type || !subject) {
      return NextResponse.json(
        { error: "Activity type and subject are required" },
        { status: 400 }
      );
    }

    // For now, use a default company ID - in production, this should come from the user's company
    const tenantCompanyId = companyId || "default-company";

    const activity = await prisma.activity.create({
      data: {
        companyId: tenantCompanyId,
        type,
        subject,
        description: description || null,
        outcome: outcome || null,
        duration: duration ? parseInt(duration) : null,
        contactId: contactId || null,
        userId: user.id,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
      },
      include: {
        contact: true,
        user: true,
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error("Error creating activity:", error);
    return NextResponse.json(
      { error: "Failed to create activity" },
      { status: 500 }
    );
  }
}
