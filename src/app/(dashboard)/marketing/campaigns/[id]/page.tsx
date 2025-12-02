import { Header } from "@/components/layout/header";
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui";
import { ArrowLeft, Mail, Users, TrendingUp, Calendar, DollarSign } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDate, formatCurrency } from "@/lib/utils";
import { notFound } from "next/navigation";

export default async function CampaignDetailPage({ params }: { params: { id: string } }) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: params.id },
    include: {
      emails: {
        orderBy: { sentAt: "desc" },
        take: 10,
      },
      _count: {
        select: { emails: true },
      },
    },
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

  const getTypeVariant = (type: string) => {
    switch (type) {
      case "EMAIL":
        return "info";
      case "SMS":
        return "success";
      case "DIRECT_MAIL":
        return "warning";
      default:
        return "default";
    }
  };

  // Calculate engagement metrics
  const totalSent = campaign.emails.filter((e) => e.status === "SENT").length;
  const totalOpened = campaign.emails.filter((e) => e.opened).length;
  const totalClicked = campaign.emails.filter((e) => e.clicked).length;

  const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : "0.0";
  const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : "0.0";

  return (
    <div className="flex flex-col h-full">
      <Header
        title={campaign.name}
        subtitle="Campaign details and performance"
        action={
          <Link href="/marketing/campaigns">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Campaigns
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

              {campaign.description && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Description</p>
                  <p className="text-gray-700">{campaign.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <Badge variant={getStatusVariant(campaign.status)}>
                    {campaign.status}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Type</p>
                  <Badge variant={getTypeVariant(campaign.type)}>
                    {campaign.type.replace(/_/g, " ")}
                  </Badge>
                </div>

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

                {campaign.budget && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Budget</p>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{formatCurrency(Number(campaign.budget))}</span>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500 mb-1">Target Audience</p>
                  <span className="font-medium">{campaign.targetAudience || "All Contacts"}</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium">{formatDate(campaign.createdAt)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{campaign._count.emails}</p>
                    <p className="text-sm text-gray-500">Total Emails</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{openRate}%</p>
                    <p className="text-sm text-gray-500">Open Rate</p>
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
                    <p className="text-2xl font-bold">{clickRate}%</p>
                    <p className="text-sm text-gray-500">Click Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Emails */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Emails</CardTitle>
          </CardHeader>
          <CardContent>
            {campaign.emails.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No emails sent yet</p>
            ) : (
              <div className="space-y-3">
                {campaign.emails.map((email) => (
                  <div
                    key={email.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium">{email.subject}</p>
                      <p className="text-sm text-gray-500">
                        {email.sentAt ? formatDate(email.sentAt) : "Not sent"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {email.opened && (
                        <Badge variant="success">Opened</Badge>
                      )}
                      {email.clicked && (
                        <Badge variant="info">Clicked</Badge>
                      )}
                      <Badge variant={email.status === "SENT" ? "success" : "warning"}>
                        {email.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
