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
    const status = searchParams.get("status");
    const contactId = searchParams.get("contactId");
    const dealId = searchParams.get("dealId");
    const assignedToId = searchParams.get("assignedToId");
    const category = searchParams.get("category");

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (contactId) {
      where.contactId = contactId;
    }

    if (dealId) {
      where.dealId = dealId;
    }

    if (assignedToId) {
      where.assignedToId = assignedToId;
    }

    if (category) {
      where.category = category;
    }

    const tasks = await prisma.crmTask.findMany({
      where,
      orderBy: [{ dueDate: "asc" }, { priority: "desc" }],
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        assignedTo: {
          select: {
            email: true,
          },
        },
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
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
      title,
      description,
      category,
      priority,
      dueDate,
      contactId,
      dealId,
      assignedToId,
      companyId,
    } = body;

    if (!title || !category) {
      return NextResponse.json(
        { error: "Title and category are required" },
        { status: 400 }
      );
    }

    // For now, use a default company ID - in production, this should come from the user's company
    const tenantCompanyId = companyId || "default-company";

    const task = await prisma.crmTask.create({
      data: {
        companyId: tenantCompanyId,
        title,
        description: description || null,
        category,
        priority: priority || "MEDIUM",
        status: "PENDING",
        dueDate: dueDate ? new Date(dueDate) : null,
        contactId: contactId || null,
        dealId: dealId || null,
        assignedToId: assignedToId || user.id,
      },
      include: {
        contact: true,
        assignedTo: true,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
