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
  Phone,
  PhoneCall,
  PhoneOff,
  PhoneMissed,
  Clock,
  Users,
  TrendingUp,
  Calendar,
  Play,
  Pause,
  Volume2,
  Settings,
  Download,
  Filter,
  Mic,
  MicOff,
  PhoneIncoming,
  PhoneOutgoing,
  MessageSquare,
  Zap,
} from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

async function getDialerData() {
  // Get call logs with related data
  const callLogs = await prisma.callLog.findMany({
    include: {
      lead: {
        select: { id: true, contactName: true, businessName: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Calculate metrics
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const callsToday = callLogs.filter(
    (call) => new Date(call.createdAt) >= today
  ).length;

  const connectedCalls = callLogs.filter(
    (call) => call.status === "COMPLETED" || call.status === "IN_PROGRESS"
  ).length;

  const totalDuration = callLogs.reduce(
    (sum, call) => sum + (call.duration || 0),
    0
  );

  const avgDuration =
    connectedCalls > 0 ? Math.round(totalDuration / connectedCalls) : 0;

  const connectRate =
    callLogs.length > 0 ? (connectedCalls / callLogs.length) * 100 : 0;

  return {
    callLogs,
    callsToday,
    totalCalls: callLogs.length,
    connectedCalls,
    avgDuration,
    connectRate,
  };
}

export default async function DialerPage() {
  const data = await getDialerData();

  return (
    <div className="flex flex-col h-full">
      <Header
        title="AI-Powered Dialer System"
        subtitle="Integrated calling with Twilio, Vapi, and automated call tracking"
        action={
          <div className="flex gap-2">
            <Link href="/dialer/settings">
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Dialer Settings
              </Button>
            </Link>
            <Button className="bg-green-600 hover:bg-green-700">
              <Phone className="w-4 h-4 mr-2" />
              Start Calling
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-6 overflow-auto space-y-6">
        {/* Dialer Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <Badge variant="info" className="bg-blue-50 text-blue-700">
                  Today
                </Badge>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {data.callsToday}
              </p>
              <p className="text-sm text-gray-600 mt-1">Calls Made Today</p>
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-gray-500">
                  {data.totalCalls} total calls
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <PhoneCall className="w-6 h-6 text-green-600" />
                </div>
                <Badge variant="success" className="bg-green-50 text-green-700">
                  {data.connectRate.toFixed(1)}%
                </Badge>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {data.connectedCalls}
              </p>
              <p className="text-sm text-gray-600 mt-1">Connected Calls</p>
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-gray-500">Connect rate</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <Badge variant="primary" className="bg-purple-50 text-purple-700">
                  Avg
                </Badge>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {Math.floor(data.avgDuration / 60)}:{(data.avgDuration % 60).toString().padStart(2, '0')}
              </p>
              <p className="text-sm text-gray-600 mt-1">Avg Call Duration</p>
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-gray-500">Minutes:Seconds</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <Badge variant="warning" className="bg-orange-50 text-orange-700">
                  Active
                </Badge>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {data.connectedCalls > 0 ? Math.round((data.connectedCalls / data.totalCalls) * 100) : 0}%
              </p>
              <p className="text-sm text-gray-600 mt-1">Success Rate</p>
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-gray-500">Connected / Total</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Dialer Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Power Dialer</h3>
                  <p className="text-xs text-gray-600">Auto-dial campaigns</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Automatically dial through your lead list with intelligent skip logic and voicemail detection
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Mic className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">AI Voice Assistant</h3>
                  <p className="text-xs text-gray-600">Vapi integration</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                AI-powered conversations that qualify leads, book appointments, and handle objections automatically
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Volume2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Call Recording</h3>
                  <p className="text-xs text-gray-600">Compliance & training</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Automatic call recording with transcription, sentiment analysis, and compliance monitoring
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Active Calling Interface Mock */}
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-cyan-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-green-600 animate-pulse" />
              Active Call Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Call Controls */}
              <div className="md:col-span-1 space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">Current Contact</p>
                  <p className="text-lg font-bold text-gray-900">John Smith</p>
                  <p className="text-sm text-gray-600">ABC Manufacturing</p>
                  <p className="text-sm text-gray-500">(555) 123-4567</p>
                </div>

                <div className="flex justify-center gap-3">
                  <Button size="lg" className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700">
                    <PhoneOff className="w-6 h-6" />
                  </Button>
                  <Button size="lg" variant="outline" className="w-16 h-16 rounded-full">
                    <Pause className="w-6 h-6" />
                  </Button>
                  <Button size="lg" variant="outline" className="w-16 h-16 rounded-full">
                    <MicOff className="w-6 h-6" />
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-3xl font-mono font-bold text-gray-900">
                    02:34
                  </p>
                  <p className="text-sm text-gray-500">Call Duration</p>
                </div>
              </div>

              {/* Contact Info & Notes */}
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-lg border">
                    <p className="text-sm text-gray-500 mb-1">Lead Source</p>
                    <p className="font-semibold">Website Form</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border">
                    <p className="text-sm text-gray-500 mb-1">Last Contact</p>
                    <p className="font-semibold">3 days ago</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border">
                    <p className="text-sm text-gray-500 mb-1">Deal Stage</p>
                    <Badge variant="info">Qualification</Badge>
                  </div>
                  <div className="p-4 bg-white rounded-lg border">
                    <p className="text-sm text-gray-500 mb-1">Priority</p>
                    <Badge variant="warning">High</Badge>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-lg border">
                  <p className="text-sm text-gray-500 mb-2">Call Notes</p>
                  <textarea
                    className="w-full h-24 p-2 border rounded-md text-sm"
                    placeholder="Enter call notes and next steps..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send SMS
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Follow-up
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Call Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-600" />
                Recent Call Activity
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {data.callLogs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Phone className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No call logs yet</p>
                <p className="text-sm mt-1">
                  Start making calls to see your activity here
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contact</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Outcome</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Recording</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.callLogs.map((call) => {
                    const lead = call.lead;
                    const contactName = lead?.contactName || "Unknown";
                    const company = lead?.businessName || "";

                    return (
                      <TableRow key={call.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{contactName}</p>
                            {company && (
                              <p className="text-sm text-gray-500">{company}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {call.toNumber}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {call.callType === "INBOUND" ? (
                              <PhoneIncoming className="w-4 h-4 text-green-600" />
                            ) : (
                              <PhoneOutgoing className="w-4 h-4 text-blue-600" />
                            )}
                            <span className="text-sm capitalize">
                              {call.callType.toLowerCase()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {call.duration
                            ? `${Math.floor(call.duration / 60)}:${(call.duration % 60).toString().padStart(2, '0')}`
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              call.outcome === "QUALIFIED" || call.outcome === "INTERESTED"
                                ? "success"
                                : call.outcome === "CALLBACK_REQUESTED" || call.outcome === "VOICEMAIL_LEFT"
                                ? "warning"
                                : call.outcome === "NOT_INTERESTED" || call.outcome === "DISQUALIFIED"
                                ? "danger"
                                : "default"
                            }
                          >
                            {call.outcome ? call.outcome.replace(/_/g, " ") : "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(call.createdAt)}
                        </TableCell>
                        <TableCell>
                          {call.recordingUrl ? (
                            <Button variant="ghost" size="sm">
                              <Play className="w-4 h-4 mr-1" />
                              Play
                            </Button>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Dialer Integration Info */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Enterprise Dialer Integration
                </h3>
                <p className="text-sm text-gray-700 mb-4">
                  Powered by Twilio and Vapi AI. Make calls directly from the platform with automatic call logging, recording, transcription, and CRM sync. Supports power dialing, predictive dialing, and AI voice assistants for automated lead qualification.
                </p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">Click-to-call from CRM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700">Automatic call recording</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-purple-600" />
                    <span className="text-gray-700">AI transcription & analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-600" />
                    <span className="text-gray-700">Power dialer campaigns</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">Vapi AI voice assistant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-orange-600" />
                    <span className="text-gray-700">Real-time analytics</span>
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
