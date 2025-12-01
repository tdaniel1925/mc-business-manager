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
  NEW_LEAD: "bg-muted text-muted-foreground",
  DOCS_REQUESTED: "bg-warning/20 text-warning dark:text-warning",
  DOCS_RECEIVED: "bg-info/20 text-info dark:text-info",
  IN_UNDERWRITING: "bg-secondary/50 text-secondary-foreground",
  APPROVED: "bg-success/20 text-success dark:text-success",
  CONTRACT_SENT: "bg-info/20 text-info dark:text-info",
  CONTRACT_SIGNED: "bg-primary/20 text-primary dark:text-primary",
  FUNDED: "bg-success/20 text-success dark:text-success",
  DECLINED: "bg-destructive/20 text-destructive dark:text-destructive",
  DEAD: "bg-muted text-muted-foreground",
};

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const metrics = [
    {
      title: "Total Deals",
      value: stats.totalDeals,
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Funded Amount",
      value: formatCurrency(Number(stats.fundedAmount)),
      icon: DollarSign,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Pending Review",
      value: stats.pendingDeals,
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Total Merchants",
      value: stats.totalMerchants,
      icon: Users,
      color: "text-secondary-foreground",
      bgColor: "bg-secondary",
    },
  ];

  const pipelineStats = [
    { label: "Approved", value: stats.approvedDeals, icon: CheckCircle, color: "text-success" },
    { label: "Funded", value: stats.fundedDeals, icon: TrendingUp, color: "text-success" },
    { label: "Declined", value: stats.declinedDeals, icon: XCircle, color: "text-destructive" },
    { label: "In Review", value: stats.pendingDeals, icon: AlertCircle, color: "text-warning" },
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
                    <p className="text-sm font-medium text-muted-foreground">
                      {metric.title}
                    </p>
                    <p className="text-2xl font-bold mt-1 text-foreground">{metric.value}</p>
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
                      <span className="text-sm text-muted-foreground">{stat.label}</span>
                    </div>
                    <span className="text-lg font-semibold text-foreground">{stat.value}</span>
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
                className="text-sm text-primary hover:text-primary/80"
              >
                View all
              </Link>
            </CardHeader>
            <CardContent>
              {stats.recentDeals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p>No deals yet</p>
                  <Link
                    href="/deals/new"
                    className="text-primary hover:text-primary/80 text-sm mt-2 inline-block"
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
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {deal.merchant.legalName}
                        </p>
                        <p className="text-sm text-muted-foreground">
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
