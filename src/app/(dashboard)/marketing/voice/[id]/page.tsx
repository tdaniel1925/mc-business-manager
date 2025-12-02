import { Header } from "@/components/layout/header";
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui";
import { ArrowLeft, Phone, Calendar, Users, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";

export default async function VoiceCampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const campaign = await prisma.voiceCampaign.findUnique({
    where: { id },
    include: {
      calls: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      _count: {
        select: { calls: true },
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

  const getCallOutcomeVariant = (outcome: string) => {
    switch (outcome) {
      case "CONNECTED":
      case "INTERESTED":
        return "success";
      case "NO_ANSWER":
      case "VOICEMAIL":
        return "warning";
      case "BUSY":
      case "DECLINED":
        return "danger";
      default:
        return "default";
    }
  };

  // Calculate metrics
  const totalCalls = campaign.calls.length;
  const connectedCalls = campaign.calls.filter((c) => c.outcome === "CONNECTED").length;
  const interestedCalls = campaign.calls.filter((c) => c.outcome === "INTERESTED").length;
  const connectionRate = totalCalls > 0 ? ((connectedCalls / totalCalls) * 100).toFixed(1) : "0.0";

  return (
    <div className="flex flex-col h-full">
      <Header
        title={campaign.name}
        subtitle="Voice campaign details and performance"
        action={
          <Link href="/marketing/voice">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Voice Campaigns
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

              <div>
                <p className="text-sm text-gray-500 mb-1">Call Script</p>
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <p className="text-sm whitespace-pre-wrap">{campaign.script}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <Badge variant={getStatusVariant(campaign.status)}>
                    {campaign.status}
                  </Badge>
                </div>

                {campaign.targetList && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Target List</p>
                    <p className="font-medium">{campaign.targetList}</p>
                  </div>
                )}

                {campaign.scheduledFor && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Scheduled For</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{formatDate(campaign.scheduledFor)}</span>
                    </div>
                  </div>
                )}

                {campaign.maxCallsPerDay && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Max Calls/Day</p>
                    <p className="font-medium">{campaign.maxCallsPerDay}</p>
                  </div>
                )}
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
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{campaign._count.calls}</p>
                    <p className="text-sm text-gray-500">Total Calls</p>
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
                    <p className="text-2xl font-bold">{connectionRate}%</p>
                    <p className="text-sm text-gray-500">Connection Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{interestedCalls}</p>
                    <p className="text-sm text-gray-500">Interested</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Calls */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Calls</CardTitle>
              <Link href="/marketing/voice/calls">
                <Button variant="outline" size="sm">
                  View All Calls
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {campaign.calls.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No calls made yet</p>
            ) : (
              <div className="space-y-3">
                {campaign.calls.map((call) => (
                  <div
                    key={call.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium">{call.contactName || "Unknown Contact"}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <p className="text-sm text-gray-500">{call.phoneNumber}</p>
                      </div>
                      {call.duration && (
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <p className="text-sm text-gray-500">{call.duration}s</p>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge variant={getCallOutcomeVariant(call.outcome)}>
                        {call.outcome.replace(/_/g, " ")}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(call.createdAt)}
                      </p>
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
