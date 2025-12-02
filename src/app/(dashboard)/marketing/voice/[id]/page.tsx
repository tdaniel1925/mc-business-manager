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
      campaign: {
        select: { id: true, name: true, status: true },
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

  // Voice campaign metrics would come from external voice AI service
  const totalCalls = 0;
  const connectedCalls = 0;
  const interestedCalls = 0;
  const connectionRate = "0.0";

  return (
    <div className="flex flex-col h-full">
      <Header
        title={campaign.agentName}
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
                <p className="text-sm text-gray-500 mb-1">Parent Campaign</p>
                <Link href={`/marketing/campaigns/${campaign.campaign.id}`} className="text-lg font-semibold text-blue-600 hover:underline">
                  {campaign.campaign.name}
                </Link>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Agent Name</p>
                <p className="text-lg font-semibold">{campaign.agentName}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Script Template</p>
                <div className="p-4 bg-gray-50 rounded-lg border max-h-64 overflow-auto">
                  <p className="text-sm whitespace-pre-wrap">{campaign.scriptTemplate}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">System Prompt</p>
                <div className="p-4 bg-gray-50 rounded-lg border max-h-64 overflow-auto">
                  <p className="text-sm whitespace-pre-wrap">{campaign.systemPrompt}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Campaign Status</p>
                  <Badge variant={getStatusVariant(campaign.campaign.status)}>
                    {campaign.campaign.status}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Voice Type</p>
                  <p className="font-medium">{campaign.voiceType}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Call Type</p>
                  <p className="font-medium">{campaign.callType}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Calls Per Day</p>
                  <p className="font-medium">{campaign.callsPerDay}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Max Concurrent</p>
                  <p className="font-medium">{campaign.maxConcurrentCalls}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Timezone</p>
                  <p className="font-medium">{campaign.timezone}</p>
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
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalCalls}</p>
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

        {/* Campaign Information */}
        <Card>
          <CardHeader>
            <CardTitle>Voice Campaign Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Agent ID</p>
                <p className="font-medium font-mono text-sm">{campaign.agentId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Voice Type</p>
                <p className="font-medium">{campaign.voiceType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Call Type</p>
                <p className="font-medium">{campaign.callType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Max Concurrent Calls</p>
                <p className="font-medium">{campaign.maxConcurrentCalls}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Calls Per Day</p>
                <p className="font-medium">{campaign.callsPerDay}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Call Window</p>
                <p className="font-medium">{campaign.callWindowStart} - {campaign.callWindowEnd}</p>
              </div>
            </div>
            <p className="text-center py-8 text-gray-500">Voice campaign call data would be fetched from external AI voice service</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
