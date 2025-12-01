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
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  Play,
  Pause,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

async function getVoiceData() {
  const [voiceCampaigns, recentCalls, callStats] = await Promise.all([
    prisma.voiceCampaign.findMany({
      include: {
        campaign: true,
        _count: {
          select: { callLogs: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.callLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        lead: true,
        voiceCampaign: {
          include: { campaign: true },
        },
      },
    }),
    prisma.callLog.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  return { voiceCampaigns, recentCalls, callStats };
}

const callStatusColors: Record<string, string> = {
  INITIATED: "bg-muted text-muted-foreground",
  RINGING: "bg-warning/20 text-warning",
  IN_PROGRESS: "bg-info/20 text-info",
  COMPLETED: "bg-success/20 text-success",
  NO_ANSWER: "bg-muted text-muted-foreground",
  BUSY: "bg-warning/20 text-warning",
  VOICEMAIL: "bg-info/20 text-info",
  FAILED: "bg-destructive/20 text-destructive",
  TRANSFERRED: "bg-primary/20 text-primary",
};

const outcomeColors: Record<string, string> = {
  INTERESTED: "bg-success/20 text-success",
  NOT_INTERESTED: "bg-muted text-muted-foreground",
  CALLBACK_REQUESTED: "bg-info/20 text-info",
  QUALIFIED: "bg-success/20 text-success",
  DISQUALIFIED: "bg-destructive/20 text-destructive",
  WRONG_NUMBER: "bg-warning/20 text-warning",
  DO_NOT_CALL: "bg-destructive/20 text-destructive",
  VOICEMAIL_LEFT: "bg-muted text-muted-foreground",
  TRANSFERRED_TO_HUMAN: "bg-primary/20 text-primary",
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default async function VoiceAgentsPage() {
  const { voiceCampaigns, recentCalls, callStats } = await getVoiceData();

  const totalCalls = callStats.reduce((sum, stat) => sum + stat._count, 0);
  const completedCalls =
    callStats.find((s) => s.status === "COMPLETED")?._count || 0;
  const answerRate = totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : 0;

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Voice Agents"
        subtitle="Manage AI voice campaigns and call history"
        action={
          <Link href="/marketing/voice/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Voice Campaign
            </Button>
          </Link>
        }
      />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Calls</p>
                  <p className="text-3xl font-bold text-foreground">{totalCalls}</p>
                </div>
                <Phone className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Answer Rate</p>
                  <p className="text-3xl font-bold text-foreground">{answerRate}%</p>
                </div>
                <BarChart3 className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Campaigns</p>
                  <p className="text-3xl font-bold text-foreground">
                    {voiceCampaigns.filter((v) => v.campaign.status === "ACTIVE").length}
                  </p>
                </div>
                <Play className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Duration</p>
                  <p className="text-3xl font-bold text-foreground">2:34</p>
                </div>
                <PhoneOutgoing className="w-8 h-8 text-info" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Voice Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Voice Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {voiceCampaigns.length === 0 ? (
              <div className="text-center py-12">
                <Phone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No voice campaigns yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Create a voice campaign to start AI-powered outreach
                </p>
                <Link href="/marketing/voice/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Voice Campaign
                  </Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Calls</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {voiceCampaigns.map((vc) => (
                    <TableRow key={vc.id}>
                      <TableCell>
                        <p className="font-medium text-foreground">{vc.campaign.name}</p>
                      </TableCell>
                      <TableCell>{vc.agentName}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1 text-sm">
                          {vc.callType.includes("OUTBOUND") ? (
                            <PhoneOutgoing className="w-4 h-4" />
                          ) : (
                            <PhoneIncoming className="w-4 h-4" />
                          )}
                          {vc.callType.replace(/_/g, " ")}
                        </span>
                      </TableCell>
                      <TableCell>{vc._count.callLogs}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            vc.campaign.status === "ACTIVE" ? "success" : "default"
                          }
                        >
                          {vc.campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {vc.campaign.status === "ACTIVE" ? (
                            <Button variant="outline" size="sm">
                              <Pause className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm">
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                          <Link href={`/marketing/voice/${vc.id}`}>
                            <Button variant="ghost" size="sm">
                              View
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

        {/* Recent Calls */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <PhoneOutgoing className="w-5 h-5" />
                Recent Calls
              </CardTitle>
              <Link href="/marketing/voice/calls">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentCalls.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No calls yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contact</TableHead>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Outcome</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentCalls.map((call) => (
                    <TableRow key={call.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">
                            {call.lead?.contactName || call.toNumber}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {call.toNumber}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {call.voiceCampaign?.campaign.name || "-"}
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">
                          {call.callType === "OUTBOUND" ? (
                            <PhoneOutgoing className="w-4 h-4 text-primary" />
                          ) : (
                            <PhoneIncoming className="w-4 h-4 text-success" />
                          )}
                          {call.callType}
                        </span>
                      </TableCell>
                      <TableCell>{formatDuration(call.duration)}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            callStatusColors[call.status]
                          }`}
                        >
                          {call.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {call.outcome ? (
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              outcomeColors[call.outcome]
                            }`}
                          >
                            {call.outcome.replace(/_/g, " ")}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(call.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
