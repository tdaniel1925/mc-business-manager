import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import {
  DollarSign,
  FileText,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { DealStage } from "@prisma/client";
import Link from "next/link";

async function getDashboardStats() {
  const [
    totalDeals,
    pendingDeals,
    approvedDeals,
    fundedDeals,
    declinedDeals,
    totalMerchants,
    recentDeals,
  ] = await Promise.all([
    prisma.deal.count(),
    prisma.deal.count({
      where: { stage: { in: [DealStage.NEW_LEAD, DealStage.DOCS_REQUESTED, DealStage.DOCS_RECEIVED, DealStage.IN_UNDERWRITING] } },
    }),
    prisma.deal.count({ where: { stage: DealStage.APPROVED } }),
    prisma.deal.count({ where: { stage: DealStage.FUNDED } }),
    prisma.deal.count({ where: { stage: DealStage.DECLINED } }),
    prisma.merchant.count(),
    prisma.deal.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { merchant: true },
    }),
  ]);

  const fundedAmount = await prisma.deal.aggregate({
    where: { stage: DealStage.FUNDED },
    _sum: { approvedAmount: true },
  });

  return {
    totalDeals,
    pendingDeals,
    approvedDeals,
    fundedDeals,
    declinedDeals,
    totalMerchants,
    fundedAmount: fundedAmount._sum.approvedAmount || 0,
    recentDeals,
  };
}

const stageColors: Record<DealStage, string> = {
  NEW_LEAD: "bg-gray-100 text-gray-800",
  DOCS_REQUESTED: "bg-yellow-100 text-yellow-800",
  DOCS_RECEIVED: "bg-blue-100 text-blue-800",
  IN_UNDERWRITING: "bg-purple-100 text-purple-800",
  APPROVED: "bg-green-100 text-green-800",
  CONTRACT_SENT: "bg-cyan-100 text-cyan-800",
  CONTRACT_SIGNED: "bg-indigo-100 text-indigo-800",
  FUNDED: "bg-emerald-100 text-emerald-800",
  DECLINED: "bg-red-100 text-red-800",
  DEAD: "bg-gray-100 text-gray-800",
};

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const metrics = [
    {
      title: "Total Deals",
      value: stats.totalDeals,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Funded Amount",
      value: formatCurrency(Number(stats.fundedAmount)),
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Pending Review",
      value: stats.pendingDeals,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Total Merchants",
      value: stats.totalMerchants,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  const pipelineStats = [
    { label: "Approved", value: stats.approvedDeals, icon: CheckCircle, color: "text-green-600" },
    { label: "Funded", value: stats.fundedDeals, icon: TrendingUp, color: "text-emerald-600" },
    { label: "Declined", value: stats.declinedDeals, icon: XCircle, color: "text-red-600" },
    { label: "In Review", value: stats.pendingDeals, icon: AlertCircle, color: "text-yellow-600" },
  ];

  return (
    <div className="flex flex-col h-full">
      <Header title="Dashboard" subtitle="Overview of your MCA operations" />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric) => (
            <Card key={metric.title}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {metric.title}
                    </p>
                    <p className="text-2xl font-bold mt-1">{metric.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${metric.bgColor}`}>
                    <metric.icon className={`w-6 h-6 ${metric.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pipeline Overview */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Pipeline Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pipelineStats.map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      <span className="text-sm text-gray-600">{stat.label}</span>
                    </div>
                    <span className="text-lg font-semibold">{stat.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Deals */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Deals</CardTitle>
              <Link
                href="/deals"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View all
              </Link>
            </CardHeader>
            <CardContent>
              {stats.recentDeals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No deals yet</p>
                  <Link
                    href="/deals/new"
                    className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block"
                  >
                    Create your first deal
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentDeals.map((deal) => (
                    <Link
                      key={deal.id}
                      href={`/deals/${deal.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {deal.merchant.legalName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatCurrency(Number(deal.requestedAmount))} requested
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          stageColors[deal.stage]
                        }`}
                      >
                        {deal.stage.replace(/_/g, " ")}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
