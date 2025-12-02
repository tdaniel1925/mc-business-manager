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
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};

    if (type) {
      where.contactType = type;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { businessName: { contains: search, mode: "insensitive" } },
      ];
    }

    const contacts = await prisma.contact.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            activities: true,
            tasks: true,
            deals: true,
          },
        },
      },
    });

    return NextResponse.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
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
      firstName,
      lastName,
      email,
      phone,
      mobile,
      type,
      company,
      title,
      address,
      city,
      state,
      zipCode,
      leadSource,
      notes,
      creditScore,
      ownershipPercent,
      dateOfBirth,
      ssn,
      companyId,
    } = body;

    if (!firstName || !lastName || !type) {
      return NextResponse.json(
        { error: "First name, last name, and type are required" },
        { status: 400 }
      );
    }

    // For now, use a default company ID - in production, this should come from the user's company
    const tenantCompanyId = companyId || "default-company";

    const contact = await prisma.contact.create({
      data: {
        companyId: tenantCompanyId,
        firstName,
        lastName,
        email: email || null,
        phone: phone || null,
        mobile: mobile || null,
        contactType: type,
        businessName: company || null,
        title: title || null,
        address: address || null,
        city: city || null,
        state: state || null,
        zipCode: zipCode || null,
        source: leadSource || null,
        notes: notes || null,
        creditScore: creditScore || null,
        ownershipPercent: ownershipPercent || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        ssn: ssn || null,
        createdById: user.id,
        status: "ACTIVE",
      },
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error("Error creating contact:", error);
    return NextResponse.json(
      { error: "Failed to create contact" },
      { status: 500 }
    );
  }
}
