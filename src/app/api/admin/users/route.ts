import { NextRequest, NextResponse } from "next/server";
import { requirePlatformAdmin, createSupabaseServerClient } from "@/lib/admin-auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8),
  phone: z.string().optional(),
  companyId: z.string().optional(),
  companyRole: z.enum([
    "COMPANY_OWNER",
    "COMPANY_ADMIN",
    "MANAGER",
    "UNDERWRITER",
    "SALES",
    "COLLECTIONS",
    "COMPLIANCE",
    "VIEWER",
  ]).optional(),
  platformRole: z.enum([
    "SUPER_ADMIN",
    "PLATFORM_ADMIN",
    "PLATFORM_SUPPORT",
  ]).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    await requirePlatformAdmin();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const companyId = searchParams.get("companyId");
    const platformOnly = searchParams.get("platformOnly") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(companyId && { companyId }),
      ...(platformOnly && { platformRole: { not: null } }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          company: {
            select: { id: true, name: true, slug: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePlatformAdmin();

    const body = await request.json();
    const data = createUserSchema.parse(body);

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Create user in Supabase Auth
    const supabase = await createSupabaseServerClient();
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });

    if (authError) {
      console.error("Supabase auth error:", authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    // Create user in our database
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        phone: data.phone,
        companyId: data.companyId,
        companyRole: data.companyRole,
        platformRole: data.platformRole,
        isActive: data.isActive ?? true,
        supabaseId: authData.user.id,
      },
      include: {
        company: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
