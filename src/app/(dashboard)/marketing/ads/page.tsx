import { Header } from "@/components/layout/header";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
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
  Plus,
  Megaphone,
  TrendingUp,
  DollarSign,
  MousePointer,
  Target,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDate, formatCurrency } from "@/lib/utils";

async function getAdCampaigns() {
  return prisma.adCampaign.findMany({
    include: {
      campaign: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

const statusVariants: Record<string, "success" | "warning" | "danger" | "default"> = {
  DRAFT: "default",
  PENDING_REVIEW: "warning",
  ACTIVE: "success",
  PAUSED: "warning",
  COMPLETED: "default",
  REJECTED: "danger",
};

const platformInfo: Record<string, { name: string; color: string }> = {
  GOOGLE_ADS: { name: "Google Ads", color: "text-blue-600" },
  FACEBOOK_ADS: { name: "Facebook Ads", color: "text-blue-500" },
  INSTAGRAM_ADS: { name: "Instagram Ads", color: "text-pink-500" },
  LINKEDIN_ADS: { name: "LinkedIn Ads", color: "text-blue-700" },
  TWITTER_ADS: { name: "Twitter Ads", color: "text-gray-900" },
  TIKTOK_ADS: { name: "TikTok Ads", color: "text-gray-900" },
};

export default async function AdsPage() {
  const adCampaigns = await getAdCampaigns();

  const totalSpent = adCampaigns.reduce(
    (sum, ad) => sum + Number(ad.spentAmount),
    0
  );
  const totalClicks = adCampaigns.reduce((sum, ad) => sum + ad.clicks, 0);
  const totalConversions = adCampaigns.reduce(
    (sum, ad) => sum + ad.conversions,
    0
  );
  const totalImpressions = adCampaigns.reduce(
    (sum, ad) => sum + ad.impressions,
    0
  );
  const avgCtr =
    totalImpressions > 0
      ? ((totalClicks / totalImpressions) * 100).toFixed(2)
      : "0.00";

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Advertising"
        subtitle="Manage your paid advertising campaigns"
        action={
          <Link href="/marketing/ads/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Ad Campaign
            </Button>
          </Link>
        }
      />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(totalSpent)}
                  </p>
                </div>
                <DollarSign className="w-6 h-6 text-destructive" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Impressions</p>
                  <p className="text-2xl font-bold text-foreground">
                    {totalImpressions.toLocaleString()}
                  </p>
                </div>
                <BarChart3 className="w-6 h-6 text-info" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Clicks</p>
                  <p className="text-2xl font-bold text-foreground">
                    {totalClicks.toLocaleString()}
                  </p>
                </div>
                <MousePointer className="w-6 h-6 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">CTR</p>
                  <p className="text-2xl font-bold text-foreground">{avgCtr}%</p>
                </div>
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conversions</p>
                  <p className="text-2xl font-bold text-foreground">
                    {totalConversions}
                  </p>
                </div>
                <Target className="w-6 h-6 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ad Campaigns Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="w-5 h-5" />
              Ad Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {adCampaigns.length === 0 ? (
              <div className="text-center py-12">
                <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No ad campaigns yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Create your first paid advertising campaign
                </p>
                <Link href="/marketing/ads/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Ad Campaign
                  </Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Spent</TableHead>
                    <TableHead>Impressions</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>CTR</TableHead>
                    <TableHead>Conv.</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adCampaigns.map((ad) => {
                    const ctr =
                      ad.impressions > 0
                        ? ((ad.clicks / ad.impressions) * 100).toFixed(2)
                        : "0.00";
                    const platform = platformInfo[ad.platform];

                    return (
                      <TableRow key={ad.id}>
                        <TableCell>
                          <p className="font-medium text-foreground">
                            {ad.campaign.name}
                          </p>
                        </TableCell>
                        <TableCell>
                          <span className={platform?.color}>
                            {platform?.name || ad.platform}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariants[ad.status]}>
                            {ad.status.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {ad.totalBudget
                            ? formatCurrency(Number(ad.totalBudget))
                            : ad.dailyBudget
                            ? `${formatCurrency(Number(ad.dailyBudget))}/day`
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(Number(ad.spentAmount))}
                        </TableCell>
                        <TableCell>{ad.impressions.toLocaleString()}</TableCell>
                        <TableCell>{ad.clicks.toLocaleString()}</TableCell>
                        <TableCell>{ctr}%</TableCell>
                        <TableCell>{ad.conversions}</TableCell>
                        <TableCell>
                          <Link href={`/marketing/ads/${ad.id}`}>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Platform Connect Section */}
        <Card>
          <CardHeader>
            <CardTitle>Connect Ad Platforms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 rounded-lg border border-border hover:border-primary hover:bg-accent transition-colors text-left">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <span className="text-lg font-bold text-blue-600">G</span>
                  </div>
                  <h4 className="font-medium text-foreground">Google Ads</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Connect your Google Ads account to sync campaigns
                </p>
              </button>

              <button className="p-4 rounded-lg border border-border hover:border-primary hover:bg-accent transition-colors text-left">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <span className="text-lg font-bold text-blue-500">f</span>
                  </div>
                  <h4 className="font-medium text-foreground">Meta Ads</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Connect Facebook & Instagram ad accounts
                </p>
              </button>

              <button className="p-4 rounded-lg border border-border hover:border-primary hover:bg-accent transition-colors text-left">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <span className="text-lg font-bold text-blue-700">in</span>
                  </div>
                  <h4 className="font-medium text-foreground">LinkedIn Ads</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Connect LinkedIn Campaign Manager
                </p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
