import { NextRequest, NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/admin-auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const createPlanSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  monthlyPrice: z.number().min(0),
  yearlyPrice: z.number().min(0),
  maxUsers: z.number().int().min(1),
  maxMerchants: z.number().int().min(1),
  maxDealsPerMonth: z.number().int().min(1),
  maxStorageGb: z.number().int().min(1),
  features: z.array(z.string()),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function GET() {
  try {
    await requirePlatformAdmin();

    const plans = await prisma.plan.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { subscriptions: true } },
      },
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePlatformAdmin();

    const body = await request.json();
    const data = createPlanSchema.parse(body);

    // Check if slug is unique
    const existing = await prisma.plan.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Plan with this slug already exists" },
        { status: 400 }
      );
    }

    const plan = await prisma.plan.create({
      data: {
        ...data,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error creating plan:", error);
    return NextResponse.json(
      { error: "Failed to create plan" },
      { status: 500 }
    );
  }
}
