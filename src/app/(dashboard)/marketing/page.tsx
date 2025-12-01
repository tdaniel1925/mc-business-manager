import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import {
  Phone,
  MessageSquare,
  Share2,
  Target,
  UserPlus,
  TrendingUp,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

async function getMarketingStats() {
  const [
    totalCampaigns,
    activeCampaigns,
    totalLeads,
    qualifiedLeads,
    totalCalls,
    completedCalls,
    totalPosts,
    publishedPosts,
    recentCampaigns,
    recentLeads,
  ] = await Promise.all([
    prisma.campaign.count(),
    prisma.campaign.count({ where: { status: "ACTIVE" } }),
    prisma.marketingLead.count(),
    prisma.marketingLead.count({ where: { qualificationStatus: "QUALIFIED" } }),
    prisma.callLog.count(),
    prisma.callLog.count({ where: { status: "COMPLETED" } }),
    prisma.contentPost.count(),
    prisma.contentPost.count({ where: { status: "PUBLISHED" } }),
    prisma.campaign.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
    prisma.marketingLead.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    totalCampaigns,
    activeCampaigns,
    totalLeads,
    qualifiedLeads,
    totalCalls,
    completedCalls,
    totalPosts,
    publishedPosts,
    recentCampaigns,
    recentLeads,
    conversionRate: totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0,
    callAnswerRate: totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : 0,
  };
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  SCHEDULED: "bg-warning/20 text-warning",
  ACTIVE: "bg-success/20 text-success",
  PAUSED: "bg-secondary text-secondary-foreground",
  COMPLETED: "bg-info/20 text-info",
  CANCELLED: "bg-destructive/20 text-destructive",
};

const leadStatusColors: Record<string, string> = {
  NEW: "bg-info/20 text-info",
  CONTACTED: "bg-warning/20 text-warning",
  QUALIFIED: "bg-success/20 text-success",
  UNQUALIFIED: "bg-destructive/20 text-destructive",
  NURTURING: "bg-primary/20 text-primary",
  CONVERTED: "bg-success/20 text-success",
  LOST: "bg-muted text-muted-foreground",
};

export default async function MarketingDashboardPage() {
  const stats = await getMarketingStats();

  const metrics = [
    {
      title: "Active Campaigns",
      value: stats.activeCampaigns,
      total: stats.totalCampaigns,
      icon: Target,
      color: "text-primary",
      bgColor: "bg-primary/10",
      href: "/marketing/campaigns",
    },
    {
      title: "Marketing Leads",
      value: stats.totalLeads,
      subtitle: `${stats.qualifiedLeads} qualified`,
      icon: UserPlus,
      color: "text-success",
      bgColor: "bg-success/10",
      href: "/marketing/leads",
    },
    {
      title: "Voice Calls",
      value: stats.totalCalls,
      subtitle: `${stats.callAnswerRate}% answer rate`,
      icon: Phone,
      color: "text-warning",
      bgColor: "bg-warning/10",
      href: "/marketing/voice",
    },
    {
      title: "Content Posts",
      value: stats.publishedPosts,
      total: stats.totalPosts,
      icon: MessageSquare,
      color: "text-info",
      bgColor: "bg-info/10",
      href: "/marketing/content",
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Marketing"
        subtitle="Manage campaigns, voice agents, content, and leads"
      />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric) => (
            <Link key={metric.title} href={metric.href}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {metric.title}
                      </p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <p className="text-2xl font-bold text-foreground">
                          {metric.value}
                        </p>
                        {metric.total && (
                          <span className="text-sm text-muted-foreground">
                            / {metric.total}
                          </span>
                        )}
                      </div>
                      {metric.subtitle && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {metric.subtitle}
                        </p>
                      )}
                    </div>
                    <div className={`p-3 rounded-full ${metric.bgColor}`}>
                      <metric.icon className={`w-6 h-6 ${metric.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Performance Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Lead Conversion Rate</p>
                  <p className="text-3xl font-bold text-foreground">{stats.conversionRate}%</p>
                </div>
                <div className="flex items-center text-success">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  <span className="text-sm">+5.2%</span>
                </div>
              </div>
              <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-success rounded-full transition-all"
                  style={{ width: `${stats.conversionRate}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Call Answer Rate</p>
                  <p className="text-3xl font-bold text-foreground">{stats.callAnswerRate}%</p>
                </div>
                <div className="flex items-center text-success">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  <span className="text-sm">+2.1%</span>
                </div>
              </div>
              <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-warning rounded-full transition-all"
                  style={{ width: `${stats.callAnswerRate}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Est. Monthly Spend</p>
                  <p className="text-3xl font-bold text-foreground">{formatCurrency(0)}</p>
                </div>
                <Activity className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Across all active campaigns
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Campaigns */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Recent Campaigns
                </CardTitle>
                <Link
                  href="/marketing/campaigns"
                  className="text-sm text-primary hover:text-primary/80"
                >
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentCampaigns.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p>No campaigns yet</p>
                    <Link
                      href="/marketing/campaigns/new"
                      className="text-primary hover:text-primary/80 text-sm mt-2 inline-block"
                    >
                      Create your first campaign
                    </Link>
                  </div>
                ) : (
                  stats.recentCampaigns.map((campaign) => (
                    <Link
                      key={campaign.id}
                      href={`/marketing/campaigns/${campaign.id}`}
                      className="flex items-center justify-between p-3 bg-accent/50 rounded-lg hover:bg-accent transition-colors"
                    >
                      <div>
                        <p className="font-medium text-foreground">{campaign.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {campaign.type.replace(/_/g, " ")}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statusColors[campaign.status]
                        }`}
                      >
                        {campaign.status}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Leads */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Recent Leads
                </CardTitle>
                <Link
                  href="/marketing/leads"
                  className="text-sm text-primary hover:text-primary/80"
                >
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentLeads.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <UserPlus className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p>No leads yet</p>
                    <Link
                      href="/marketing/leads/new"
                      className="text-primary hover:text-primary/80 text-sm mt-2 inline-block"
                    >
                      Add your first lead
                    </Link>
                  </div>
                ) : (
                  stats.recentLeads.map((lead) => (
                    <Link
                      key={lead.id}
                      href={`/marketing/leads/${lead.id}`}
                      className="flex items-center justify-between p-3 bg-accent/50 rounded-lg hover:bg-accent transition-colors"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {lead.businessName || lead.contactName || "Unknown"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {lead.email || lead.phone || "No contact info"}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          leadStatusColors[lead.qualificationStatus]
                        }`}
                      >
                        {lead.qualificationStatus}
                      </span>
                    </Link>
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
                href="/marketing/campaigns/new"
                className="flex flex-col items-center p-4 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
              >
                <Target className="w-8 h-8 text-primary mb-2" />
                <span className="text-sm font-medium text-foreground">New Campaign</span>
              </Link>
              <Link
                href="/marketing/voice"
                className="flex flex-col items-center p-4 bg-warning/10 rounded-lg hover:bg-warning/20 transition-colors"
              >
                <Phone className="w-8 h-8 text-warning mb-2" />
                <span className="text-sm font-medium text-foreground">Voice Agents</span>
              </Link>
              <Link
                href="/marketing/content/create"
                className="flex flex-col items-center p-4 bg-info/10 rounded-lg hover:bg-info/20 transition-colors"
              >
                <MessageSquare className="w-8 h-8 text-info mb-2" />
                <span className="text-sm font-medium text-foreground">Create Content</span>
              </Link>
              <Link
                href="/marketing/leads/new"
                className="flex flex-col items-center p-4 bg-success/10 rounded-lg hover:bg-success/20 transition-colors"
              >
                <UserPlus className="w-8 h-8 text-success mb-2" />
                <span className="text-sm font-medium text-foreground">Add Lead</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
