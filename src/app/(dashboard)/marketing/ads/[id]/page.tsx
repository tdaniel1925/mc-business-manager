import { Header } from "@/components/layout/header";
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui";
import { ArrowLeft, DollarSign, Eye, MousePointerClick, TrendingUp, Calendar } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDate, formatCurrency } from "@/lib/utils";
import { notFound } from "next/navigation";

export default async function AdCampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const campaign = await prisma.adCampaign.findUnique({
    where: { id },
  });

  if (!campaign) {
    notFound();
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "SCHEDULED":
        return "info";
      case "COMPLETED":
        return "default";
      case "PAUSED":
        return "warning";
      case "DRAFT":
        return "default";
      default:
        return "default";
    }
  };

  const getPlatformVariant = (platform: string) => {
    switch (platform) {
      case "GOOGLE_ADS":
        return "info";
      case "FACEBOOK":
        return "success";
      case "LINKEDIN":
        return "info";
      case "TWITTER":
        return "info";
      default:
        return "default";
    }
  };

  // Calculate metrics
  const ctr = campaign.clicks && campaign.impressions
    ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2)
    : "0.00";

  const cpc = campaign.clicks && campaign.spent
    ? (Number(campaign.spent) / campaign.clicks).toFixed(2)
    : "0.00";

  const conversionRate = campaign.conversions && campaign.clicks
    ? ((campaign.conversions / campaign.clicks) * 100).toFixed(2)
    : "0.00";

  return (
    <div className="flex flex-col h-full">
      <Header
        title={campaign.name}
        subtitle="Ad campaign details and performance"
        action={
          <Link href="/marketing/ads">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Ads
            </Button>
          </Link>
        }
      />

      <div className="flex-1 p-6 overflow-auto space-y-6">
        {/* Campaign Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Campaign Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Campaign Name</p>
                <p className="text-lg font-semibold">{campaign.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <Badge variant={getStatusVariant(campaign.status)}>
                    {campaign.status}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Platform</p>
                  <Badge variant={getPlatformVariant(campaign.platform)}>
                    {campaign.platform.replace(/_/g, " ")}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Ad Type</p>
                  <Badge variant="default">{campaign.type}</Badge>
                </div>

                {campaign.budget && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Budget</p>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{formatCurrency(Number(campaign.budget))}</span>
                    </div>
                  </div>
                )}

                {campaign.dailyBudget && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Daily Budget</p>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{formatCurrency(Number(campaign.dailyBudget))}</span>
                    </div>
                  </div>
                )}

                {campaign.spent && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Amount Spent</p>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold text-red-600">{formatCurrency(Number(campaign.spent))}</span>
                    </div>
                  </div>
                )}

                {campaign.startDate && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Start Date</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{formatDate(campaign.startDate)}</span>
                    </div>
                  </div>
                )}

                {campaign.endDate && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">End Date</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{formatDate(campaign.endDate)}</span>
                    </div>
                  </div>
                )}
              </div>

              {campaign.targetAudience && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-1">Target Audience</p>
                  <p className="text-gray-700">{campaign.targetAudience}</p>
                </div>
              )}

              {campaign.keywords && campaign.keywords.length > 0 && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-2">Keywords</p>
                  <div className="flex flex-wrap gap-2">
                    {campaign.keywords.map((keyword, index) => (
                      <Badge key={index} variant="default">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {campaign.adCopy && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-1">Ad Copy</p>
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <p className="text-sm whitespace-pre-wrap">{campaign.adCopy}</p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium">{formatDate(campaign.createdAt)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Performance Stats */}
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{campaign.impressions || 0}</p>
                    <p className="text-sm text-gray-500">Impressions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <MousePointerClick className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{campaign.clicks || 0}</p>
                    <p className="text-sm text-gray-500">Clicks</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{ctr}%</p>
                    <p className="text-sm text-gray-500">CTR</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 rounded-full">
                    <DollarSign className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">${cpc}</p>
                    <p className="text-sm text-gray-500">Cost Per Click</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{campaign.conversions || 0}</p>
                    <p className="text-sm text-gray-500">Conversions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div>
                  <p className="text-2xl font-bold">{conversionRate}%</p>
                  <p className="text-sm text-gray-500">Conversion Rate</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
