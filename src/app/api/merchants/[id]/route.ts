import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const updateMerchantSchema = z.object({
  legalName: z.string().min(1).optional(),
  dbaName: z.string().optional(),
  ein: z.string().optional(),
  businessType: z
    .enum([
      "SOLE_PROPRIETORSHIP",
      "LLC",
      "CORPORATION",
      "PARTNERSHIP",
      "NONPROFIT",
      "OTHER",
    ])
    .optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  monthlyRevenue: z.number().optional(),
  annualRevenue: z.number().optional(),
  timeInBusiness: z.number().optional(),
  industryCode: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "BLACKLISTED", "PROSPECT"]).optional(),
  bankName: z.string().optional(),
  routingNumber: z.string().optional(),
  accountNumber: z.string().optional(),
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

    const merchant = await prisma.merchant.findUnique({
      where: { id },
      include: {
        owners: true,
        deals: {
          include: {
            underwriter: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        advances: {
          orderBy: { createdAt: "desc" },
        },
        documents: {
          orderBy: { createdAt: "desc" },
        },
        uccFilings: {
          orderBy: { createdAt: "desc" },
        },
        assignedSalesRep: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!merchant) {
      return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
    }

    return NextResponse.json(merchant);
  } catch (error) {
    console.error("Error fetching merchant:", error);
    return NextResponse.json(
      { error: "Failed to fetch merchant" },
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
    const data = updateMerchantSchema.parse(body);

    const merchant = await prisma.merchant.update({
      where: { id },
      data: {
        ...data,
        website: data.website || null,
      },
      include: {
        owners: true,
      },
    });

    return NextResponse.json(merchant);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error updating merchant:", error);
    return NextResponse.json(
      { error: "Failed to update merchant" },
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

    // Check if merchant has any deals
    const deals = await prisma.deal.count({
      where: { merchantId: id },
    });

    if (deals > 0) {
      return NextResponse.json(
        { error: "Cannot delete merchant with existing deals" },
        { status: 400 }
      );
    }

    await prisma.merchant.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting merchant:", error);
    return NextResponse.json(
      { error: "Failed to delete merchant" },
      { status: 500 }
    );
  }
}
