import { Header } from "@/components/layout/header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
} from "@/components/ui";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui";
import {
  Users,
  TrendingUp,
  DollarSign,
  Phone,
  Mail,
  Target,
  BarChart3,
  Calendar,
  Activity,
  Award,
  Zap,
} from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";

async function getSalesData() {
  // Get all brokers with their deal and commission data
  const brokers = await prisma.broker.findMany({
    where: { status: "ACTIVE" },
    include: {
      deals: {
        select: {
          id: true,
          createdAt: true,
          stage: true,
          requestedAmount: true,
          merchant: { select: { legalName: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      commissions: {
        where: { status: { in: ["PAID", "APPROVED", "PENDING"] } },
      },
      _count: {
        select: { deals: true, commissions: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate metrics for each broker
  const brokersWithMetrics = brokers.map((broker) => {
    const totalCommissionEarned = broker.commissions
      .filter((c) => c.status === "PAID")
      .reduce((sum, c) => sum + Number(c.amount), 0);

    const pendingCommissions = broker.commissions
      .filter((c) => c.status === "PENDING" || c.status === "APPROVED")
      .reduce((sum, c) => sum + Number(c.amount), 0);

    const totalFundedVolume = broker.deals
      .filter((d) => d.stage === "FUNDED")
      .reduce((sum, d) => sum + Number(d.requestedAmount), 0);

    const dealsThisMonth = broker.deals.filter(
      (d) =>
        new Date(d.createdAt).getMonth() === new Date().getMonth() &&
        new Date(d.createdAt).getFullYear() === new Date().getFullYear()
    ).length;

    const dealsLastMonth = broker.deals.filter((d) => {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      return (
        new Date(d.createdAt).getMonth() === lastMonth.getMonth() &&
        new Date(d.createdAt).getFullYear() === lastMonth.getFullYear()
      );
    }).length;

    const growthRate =
      dealsLastMonth > 0
        ? ((dealsThisMonth - dealsLastMonth) / dealsLastMonth) * 100
        : dealsThisMonth > 0
        ? 100
        : 0;

    return {
      ...broker,
      totalCommissionEarned,
      pendingCommissions,
      totalFundedVolume,
      dealsThisMonth,
      growthRate,
    };
  });

  // Overall company metrics
  const totalActiveDeals = brokersWithMetrics.reduce(
    (sum, b) => sum + b.deals.filter((d) => d.stage !== "DECLINED" && d.stage !== "DEAD").length,
    0
  );
  const totalFundedVolume = brokersWithMetrics.reduce(
    (sum, b) => sum + b.totalFundedVolume,
    0
  );
  const totalCommissionsPaid = brokersWithMetrics.reduce(
    (sum, b) => sum + b.totalCommissionEarned,
    0
  );
  const totalPendingCommissions = brokersWithMetrics.reduce(
    (sum, b) => sum + b.pendingCommissions,
    0
  );

  // Sort by performance
  const topPerformers = [...brokersWithMetrics]
    .sort((a, b) => b.dealsThisMonth - a.dealsThisMonth)
    .slice(0, 5);

  return {
    brokers: brokersWithMetrics,
    topPerformers,
    totalActiveDeals,
    totalFundedVolume,
    totalCommissionsPaid,
    totalPendingCommissions,
  };
}

export default async function SalesTeamPage() {
  const data = await getSalesData();

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Sales Team & Broker Management"
        subtitle="Track deals, commissions, and performance across your sales team"
        action={
          <div className="flex gap-2">
            <Link href="/brokers/new">
              <Button className="bg-green-600 hover:bg-green-700">
                <Users className="w-4 h-4 mr-2" />
                Add Broker/Sales Rep
              </Button>
            </Link>
            <Link href="/dialer">
              <Button variant="outline">
                <Phone className="w-4 h-4 mr-2" />
                Open Dialer
              </Button>
            </Link>
          </div>
        }
      />

      <div className="flex-1 p-6 overflow-auto space-y-6">
        {/* Key Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <Badge variant="info" className="bg-blue-50 text-blue-700">
                  Active
                </Badge>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {data.totalActiveDeals}
              </p>
              <p className="text-sm text-gray-600 mt-1">Active Deals</p>
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-gray-500">
                  Across {data.brokers.length} sales reps
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <Badge variant="success" className="bg-green-50 text-green-700">
                  Funded
                </Badge>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(data.totalFundedVolume)}
              </p>
              <p className="text-sm text-gray-600 mt-1">Total Volume Funded</p>
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-gray-500">All-time performance</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <Badge variant="success" className="bg-purple-50 text-purple-700">
                  Paid
                </Badge>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(data.totalCommissionsPaid)}
              </p>
              <p className="text-sm text-gray-600 mt-1">Commissions Paid</p>
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-gray-500">Total compensation</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-orange-600" />
                </div>
                <Badge variant="warning" className="bg-orange-50 text-orange-700">
                  Pending
                </Badge>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(data.totalPendingCommissions)}
              </p>
              <p className="text-sm text-gray-600 mt-1">Pending Commissions</p>
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-gray-500">Awaiting payment</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performers This Month */}
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              Top Performers This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {data.topPerformers.map((broker, index) => (
                <Link
                  key={broker.id}
                  href={`/brokers/${broker.id}`}
                  className="block p-4 bg-white rounded-lg border hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                      #{index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {broker.companyName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {broker.contactName}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Deals</span>
                      <span className="font-bold text-gray-900">
                        {broker.dealsThisMonth}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Growth</span>
                      <Badge
                        variant={
                          broker.growthRate >= 0 ? "success" : "danger"
                        }
                        className="text-xs"
                      >
                        {broker.growthRate >= 0 ? "+" : ""}
                        {broker.growthRate.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sales Team Performance Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Sales Team Performance
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  This Month
                </Button>
                <Button variant="outline" size="sm">
                  Export Report
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {data.brokers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No active sales reps or brokers</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Broker / Sales Rep</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Total Deals</TableHead>
                    <TableHead>This Month</TableHead>
                    <TableHead>Funded Volume</TableHead>
                    <TableHead>Commissions Earned</TableHead>
                    <TableHead>Pending</TableHead>
                    <TableHead>Growth</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.brokers.map((broker) => (
                    <TableRow key={broker.id}>
                      <TableCell>
                        <div>
                          <Link
                            href={`/brokers/${broker.id}`}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {broker.companyName}
                          </Link>
                          <p className="text-sm text-gray-500">
                            {broker.contactName}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {broker.email && (
                              <a
                                href={`mailto:${broker.email}`}
                                className="text-xs text-gray-400 hover:text-blue-600"
                              >
                                <Mail className="w-3 h-3 inline mr-1" />
                              </a>
                            )}
                            {broker.phone && (
                              <a
                                href={`tel:${broker.phone}`}
                                className="text-xs text-gray-400 hover:text-blue-600"
                              >
                                <Phone className="w-3 h-3 inline mr-1" />
                              </a>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            broker.tier === "PREMIUM"
                              ? "success"
                              : broker.tier === "PREFERRED"
                              ? "primary"
                              : "default"
                          }
                        >
                          {broker.tier}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {broker._count.deals}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {broker.dealsThisMonth}
                          </span>
                          {broker.dealsThisMonth > 0 && (
                            <Zap className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {formatCurrency(broker.totalFundedVolume)}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(broker.totalCommissionEarned)}
                      </TableCell>
                      <TableCell className="text-orange-600">
                        {formatCurrency(broker.pendingCommissions)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            broker.growthRate >= 10
                              ? "success"
                              : broker.growthRate >= 0
                              ? "info"
                              : "danger"
                          }
                        >
                          {broker.growthRate >= 0 ? "+" : ""}
                          {broker.growthRate.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Link href={`/brokers/${broker.id}`}>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>
                          <Link href={`/dialer?broker=${broker.id}`}>
                            <Button variant="ghost" size="sm">
                              <Phone className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Sales Team Features Info */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Comprehensive Sales & Broker Management
                </h3>
                <p className="text-sm text-gray-700 mb-4">
                  Track commission splits, deal pipelines, activity metrics, and performance KPIs for your entire sales team. Automated commission calculations, split payments for syndicate deals, and real-time performance dashboards.
                </p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">Automated commission tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700">Deal pipeline visibility</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-600" />
                    <span className="text-gray-700">Activity tracking & metrics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">Performance analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-orange-600" />
                    <span className="text-gray-700">ISO/Broker portal access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700">Integrated dialer system</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
