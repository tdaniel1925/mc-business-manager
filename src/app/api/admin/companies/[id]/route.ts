import { NextRequest, NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/admin-auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const updateCompanySchema = z.object({
  name: z.string().min(1).optional(),
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
  logoUrl: z.string().optional(),
  primaryColor: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePlatformAdmin();

    const { id } = await params;

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        subscription: { include: { plan: true } },
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            companyRole: true,
            isActive: true,
            createdAt: true,
            lastLoginAt: true,
          },
        },
        invoices: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        paymentMethods: true,
        apiKeys: {
          select: {
            id: true,
            name: true,
            isActive: true,
            lastUsedAt: true,
            createdAt: true,
          },
        },
        _count: {
          select: { merchants: true, users: true },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error("Error fetching company:", error);
    return NextResponse.json(
      { error: "Failed to fetch company" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePlatformAdmin();

    const { id } = await params;
    const body = await request.json();
    const data = updateCompanySchema.parse(body);

    const company = await prisma.company.update({
      where: { id },
      data: {
        ...data,
        trialEndsAt: data.trialEndsAt ? new Date(data.trialEndsAt) : undefined,
        website: data.website || null,
      },
      include: {
        subscription: { include: { plan: true } },
        _count: { select: { users: true } },
      },
    });

    return NextResponse.json(company);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error updating company:", error);
    return NextResponse.json(
      { error: "Failed to update company" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePlatformAdmin();

    const { id } = await params;

    // Check if company has users
    const userCount = await prisma.user.count({
      where: { companyId: id },
    });

    if (userCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete company with existing users" },
        { status: 400 }
      );
    }

    await prisma.company.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting company:", error);
    return NextResponse.json(
      { error: "Failed to delete company" },
      { status: 500 }
    );
  }
}
