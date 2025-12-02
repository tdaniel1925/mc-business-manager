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
    const direction = searchParams.get("direction");
    const status = searchParams.get("status");
    const contactId = searchParams.get("contactId");

    const where: Record<string, unknown> = {};

    if (direction) {
      where.direction = direction;
    }

    if (status) {
      where.status = status;
    }

    if (contactId) {
      where.contactId = contactId;
    }

    const emails = await prisma.emailMessage.findMany({
      where,
      orderBy: { sentAt: "desc" },
      take: 100,
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(emails);
  } catch (error) {
    console.error("Error fetching emails:", error);
    return NextResponse.json(
      { error: "Failed to fetch emails" },
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
      subject,
      body: emailBody,
      toEmail,
      fromEmail,
      direction,
      contactId,
      dealId,
    } = body;

    if (!subject) {
      return NextResponse.json(
        { error: "Subject is required" },
        { status: 400 }
      );
    }

    const email = await prisma.emailMessage.create({
      data: {
        subject,
        body: emailBody || null,
        toEmail: toEmail || null,
        fromEmail: fromEmail || null,
        direction: direction || "OUTBOUND",
        status: "SENT",
        contactId: contactId || null,
        dealId: dealId || null,
        sentAt: new Date(),
      },
      include: {
        contact: true,
        deal: true,
      },
    });

    return NextResponse.json(email, { status: 201 });
  } catch (error) {
    console.error("Error creating email:", error);
    return NextResponse.json(
      { error: "Failed to create email" },
      { status: 500 }
    );
  }
}
