import { NextRequest, NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/admin-auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const createCompanySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  legalName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  status: z.enum(["TRIAL", "ACTIVE", "SUSPENDED", "CANCELLED", "PAST_DUE"]).optional(),
  trialEndsAt: z.string().datetime().optional(),
});

export async function GET(request: NextRequest) {
  try {
    await requirePlatformAdmin();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { slug: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(status && { status: status as never }),
    };

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        include: {
          subscription: { include: { plan: true } },
          _count: { select: { users: true, merchants: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.company.count({ where }),
    ]);

    return NextResponse.json({
      companies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePlatformAdmin();

    const body = await request.json();
    const data = createCompanySchema.parse(body);

    // Check if slug is unique
    const existing = await prisma.company.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Company with this slug already exists" },
        { status: 400 }
      );
    }

    const company = await prisma.company.create({
      data: {
        ...data,
        trialEndsAt: data.trialEndsAt ? new Date(data.trialEndsAt) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
        website: data.website || null,
      },
      include: {
        subscription: { include: { plan: true } },
        _count: { select: { users: true } },
      },
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error creating company:", error);
    return NextResponse.json(
      { error: "Failed to create company" },
      { status: 500 }
    );
  }
}
