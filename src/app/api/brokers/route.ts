import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const createBrokerSchema = z.object({
  companyName: z.string().min(1),
  contactName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  tier: z.enum(["STANDARD", "PREFERRED", "PREMIUM"]).optional(),
  commissionRate: z.number().min(0).max(1).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const brokers = await prisma.broker.findMany({
      where: {
        ...(status && { status: status as never }),
      },
      include: {
        _count: {
          select: { deals: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(brokers);
  } catch (error) {
    console.error("Error fetching brokers:", error);
    return NextResponse.json(
      { error: "Failed to fetch brokers" },
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
    const data = createBrokerSchema.parse(body);

    const broker = await prisma.broker.create({
      data: {
        companyName: data.companyName,
        contactName: data.contactName,
        email: data.email,
        phone: data.phone,
        tier: data.tier || "STANDARD",
        commissionRate: data.commissionRate || 0.1,
      },
    });

    return NextResponse.json(broker, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error creating broker:", error);
    return NextResponse.json(
      { error: "Failed to create broker" },
      { status: 500 }
    );
  }
}
