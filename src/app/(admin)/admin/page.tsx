import { Header } from "@/components/layout/header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
} from "@/components/ui";
import {
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

async function getAdminStats() {
  const [
    totalCompanies,
    activeCompanies,
    trialCompanies,
    suspendedCompanies,
    totalUsers,
    platformAdmins,
    recentCompanies,
    recentUsers,
  ] = await Promise.all([
    prisma.company.count(),
    prisma.company.count({ where: { status: "ACTIVE" } }),
    prisma.company.count({ where: { status: "TRIAL" } }),
    prisma.company.count({ where: { status: "SUSPENDED" } }),
    prisma.user.count(),
    prisma.user.count({ where: { platformRole: { not: null } } }),
    prisma.company.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { users: true } },
      },
    }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { company: { select: { name: true } } },
    }),
  ]);

  return {
    totalCompanies,
    activeCompanies,
    trialCompanies,
    suspendedCompanies,
    totalUsers,
    platformAdmins,
    recentCompanies,
    recentUsers,
    mrr: 38500, // Mock data
    growth: 12.5, // Mock data
  };
}

const statusVariants: Record<string, "success" | "warning" | "danger" | "default"> = {
  ACTIVE: "success",
  TRIAL: "warning",
  SUSPENDED: "danger",
  CANCELLED: "default",
  PAST_DUE: "danger",
};

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Admin Dashboard"
        subtitle="Platform overview and management"
      />

      <div className="flex-1 p-6 overflow-auto space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Companies</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalCompanies}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="mt-4 flex gap-2 text-sm">
                <span className="text-success">{stats.activeCompanies} active</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-warning">{stats.trialCompanies} trial</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalUsers}</p>
                </div>
                <div className="p-3 bg-secondary rounded-full">
                  <Users className="w-6 h-6 text-secondary-foreground" />
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                {stats.platformAdmins} platform admins
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                  <p className="text-3xl font-bold text-foreground">{formatCurrency(stats.mrr)}</p>
                </div>
                <div className="p-3 bg-success/10 rounded-full">
                  <DollarSign className="w-6 h-6 text-success" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-success">
                <TrendingUp className="w-4 h-4 mr-1" />
                +{stats.growth}% from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Needs Attention</p>
                  <p className="text-3xl font-bold text-foreground">{stats.suspendedCompanies}</p>
                </div>
                <div className="p-3 bg-destructive/10 rounded-full">
                  <AlertCircle className="w-6 h-6 text-destructive" />
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Suspended or past due
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Companies */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Recent Companies
                </CardTitle>
                <Link
                  href="/admin/companies"
                  className="text-sm text-primary hover:text-primary/80"
                >
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentCompanies.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No companies yet</p>
                ) : (
                  stats.recentCompanies.map((company) => (
                    <Link
                      key={company.id}
                      href={`/admin/companies/${company.id}`}
                      className="flex items-center justify-between p-3 bg-accent/50 rounded-lg hover:bg-accent transition-colors"
                    >
                      <div>
                        <p className="font-medium text-foreground">{company.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {company._count.users} users
                        </p>
                      </div>
                      <Badge variant={statusVariants[company.status]}>
                        {company.status}
                      </Badge>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Users */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Recent Users
                </CardTitle>
                <Link
                  href="/admin/users"
                  className="text-sm text-primary hover:text-primary/80"
                >
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentUsers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No users yet</p>
                ) : (
                  stats.recentUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 bg-accent/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-foreground">{user.name || user.email}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.company?.name || "Platform Admin"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.isActive ? (
                          <CheckCircle className="w-4 h-4 text-success" />
                        ) : (
                          <Clock className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/admin/companies/new"
                className="flex flex-col items-center p-4 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
              >
                <Building2 className="w-8 h-8 text-primary mb-2" />
                <span className="text-sm font-medium text-foreground">Add Company</span>
              </Link>
              <Link
                href="/admin/users/new"
                className="flex flex-col items-center p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
              >
                <Users className="w-8 h-8 text-secondary-foreground mb-2" />
                <span className="text-sm font-medium text-foreground">Add User</span>
              </Link>
              <Link
                href="/admin/plans"
                className="flex flex-col items-center p-4 bg-success/10 rounded-lg hover:bg-success/20 transition-colors"
              >
                <DollarSign className="w-8 h-8 text-success mb-2" />
                <span className="text-sm font-medium text-foreground">Manage Plans</span>
              </Link>
              <Link
                href="/admin/billing"
                className="flex flex-col items-center p-4 bg-warning/10 rounded-lg hover:bg-warning/20 transition-colors"
              >
                <TrendingUp className="w-8 h-8 text-warning mb-2" />
                <span className="text-sm font-medium text-foreground">View Billing</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
