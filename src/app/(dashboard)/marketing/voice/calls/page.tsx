import { Header } from "@/components/layout/header";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui";
import { Phone, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface VoiceCall {
  id: string;
  contactName?: string;
  phoneNumber: string;
  campaign?: { id: string; name: string };
  outcome: string;
  duration?: number;
  createdAt: Date;
  notes?: string;
}

export default async function VoiceCallsPage() {
  // Voice calls would be fetched from external voice AI service
  const calls: VoiceCall[] = [];

  const getOutcomeVariant = (outcome: string) => {
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

  // Calculate stats
  const totalCalls = calls.length;
  const connectedCalls = calls.filter((c) => c.outcome === "CONNECTED").length;
  const interestedCalls = calls.filter((c) => c.outcome === "INTERESTED").length;
  const totalDuration = calls.reduce((sum, call) => sum + (call.duration || 0), 0);

  return (
    <div className="flex flex-col h-full">
      <Header title="Voice Calls" subtitle="All outbound calling activity" />

      <div className="flex-1 p-6 overflow-auto space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  <Phone className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{connectedCalls}</p>
                  <p className="text-sm text-gray-500">Connected</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Phone className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{interestedCalls}</p>
                  <p className="text-sm text-gray-500">Interested</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-full">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{Math.round(totalDuration / 60)}m</p>
                  <p className="text-sm text-gray-500">Total Duration</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calls Table */}
        <Card>
          <CardHeader>
            <CardTitle>Call History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {calls.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Phone className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-medium">No calls yet</p>
                <p className="text-sm">Calls will appear here once campaigns start</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contact</TableHead>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Outcome</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {calls.map((call) => (
                      <TableRow key={call.id}>
                        <TableCell className="font-medium">
                          {call.contactName || "Unknown"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span>{call.phoneNumber}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {call.campaign ? (
                            <Link
                              href={`/marketing/voice/${call.campaign.id}`}
                              className="text-blue-600 hover:underline"
                            >
                              {call.campaign.name}
                            </Link>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getOutcomeVariant(call.outcome)}>
                            {call.outcome.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {call.duration ? (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span>{call.duration}s</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(call.createdAt)}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {call.notes || <span className="text-gray-400">-</span>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
