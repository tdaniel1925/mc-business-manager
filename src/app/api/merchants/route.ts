import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const createMerchantSchema = z.object({
  legalName: z.string().min(1),
  dbaName: z.string().optional(),
  ein: z.string().optional(),
  businessType: z.enum([
    "SOLE_PROPRIETORSHIP",
    "LLC",
    "CORPORATION",
    "PARTNERSHIP",
    "NONPROFIT",
    "OTHER",
  ]),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  monthlyRevenue: z.number().optional(),
  timeInBusiness: z.number().optional(),
  industryCode: z.string().optional(),
  // Owner info
  ownerFirstName: z.string().optional(),
  ownerLastName: z.string().optional(),
  ownerEmail: z.string().email().optional(),
  ownerPhone: z.string().optional(),
  ownerOwnership: z.number().min(0).max(100).optional(),
  ownerFicoScore: z.number().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");

    const merchants = await prisma.merchant.findMany({
      where: {
        ...(search && {
          OR: [
            { legalName: { contains: search, mode: "insensitive" } },
            { dbaName: { contains: search, mode: "insensitive" } },
            { ein: { contains: search } },
          ],
        }),
        ...(status && { status: status as never }),
      },
      include: {
        owners: {
          where: { isPrimary: true },
          take: 1,
        },
        _count: {
          select: { deals: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(merchants);
  } catch (error) {
    console.error("Error fetching merchants:", error);
    return NextResponse.json(
      { error: "Failed to fetch merchants" },
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
    const data = createMerchantSchema.parse(body);

    const merchant = await prisma.merchant.create({
      data: {
        legalName: data.legalName,
        dbaName: data.dbaName,
        ein: data.ein,
        businessType: data.businessType,
        phone: data.phone,
        email: data.email,
        website: data.website || null,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        monthlyRevenue: data.monthlyRevenue,
        timeInBusiness: data.timeInBusiness,
        industryCode: data.industryCode,
        salesRepId: session.user.id,
        owners: data.ownerFirstName
          ? {
              create: {
                firstName: data.ownerFirstName,
                lastName: data.ownerLastName || "",
                email: data.ownerEmail,
                phone: data.ownerPhone,
                ownership: data.ownerOwnership || 100,
                ficoScore: data.ownerFicoScore,
                isPrimary: true,
              },
            }
          : undefined,
      },
      include: {
        owners: true,
      },
    });

    return NextResponse.json(merchant, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error creating merchant:", error);
    return NextResponse.json(
      { error: "Failed to create merchant" },
      { status: 500 }
    );
  }
}
