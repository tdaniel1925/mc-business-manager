import { NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/admin-auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    await requirePlatformAdmin();

    // Get counts
    const [
      totalCompanies,
      activeCompanies,
      trialCompanies,
      totalUsers,
      totalMerchants,
      totalDeals,
      recentCompanies,
      recentUsers,
    ] = await Promise.all([
      prisma.company.count(),
      prisma.company.count({ where: { status: "ACTIVE" } }),
      prisma.company.count({ where: { status: "TRIAL" } }),
      prisma.user.count(),
      prisma.merchant.count(),
      prisma.deal.count(),
      prisma.company.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { users: true } },
          subscription: { include: { plan: true } },
        },
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { company: true },
      }),
    ]);

    // Monthly revenue (mock data for now)
    const monthlyRevenue = 45000;
    const mrr = 38500;

    return NextResponse.json({
      stats: {
        totalCompanies,
        activeCompanies,
        trialCompanies,
        suspendedCompanies: totalCompanies - activeCompanies - trialCompanies,
        totalUsers,
        totalMerchants,
        totalDeals,
        monthlyRevenue,
        mrr,
      },
      recentCompanies,
      recentUsers,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin stats" },
      { status: 500 }
    );
  }
}
