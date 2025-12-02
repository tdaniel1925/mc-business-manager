"use client";

import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Activity,
  Plus,
  Search,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  FileText,
  Filter,
  User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface ActivityData {
  id: string;
  type: string;
  subject: string | null;
  description: string | null;
  outcome: string | null;
  duration: number | null;
  createdAt: string;
  contact: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  deal: {
    id: string;
    merchant: {
      legalName: string;
    } | null;
  } | null;
  user: {
    email: string;
  } | null;
}

const activityTypeIcons: Record<string, React.ReactNode> = {
  PHONE_CALL: <Phone className="w-4 h-4" />,
  PHONE_CALL_INBOUND: <Phone className="w-4 h-4" />,
  PHONE_CALL_OUTBOUND: <Phone className="w-4 h-4" />,
  EMAIL_SENT: <Mail className="w-4 h-4" />,
  EMAIL_RECEIVED: <Mail className="w-4 h-4" />,
  MEETING: <Calendar className="w-4 h-4" />,
  MEETING_SCHEDULED: <Calendar className="w-4 h-4" />,
  MEETING_COMPLETED: <Calendar className="w-4 h-4" />,
  SMS_SENT: <MessageSquare className="w-4 h-4" />,
  SMS_RECEIVED: <MessageSquare className="w-4 h-4" />,
  NOTE: <FileText className="w-4 h-4" />,
  DEFAULT: <Activity className="w-4 h-4" />,
};

const activityTypeColors: Record<string, string> = {
  PHONE_CALL: "bg-green-500/20 text-green-500",
  PHONE_CALL_INBOUND: "bg-green-500/20 text-green-500",
  PHONE_CALL_OUTBOUND: "bg-emerald-500/20 text-emerald-500",
  EMAIL_SENT: "bg-blue-500/20 text-blue-500",
  EMAIL_RECEIVED: "bg-indigo-500/20 text-indigo-500",
  MEETING: "bg-purple-500/20 text-purple-500",
  MEETING_SCHEDULED: "bg-violet-500/20 text-violet-500",
  MEETING_COMPLETED: "bg-fuchsia-500/20 text-fuchsia-500",
  SMS_SENT: "bg-orange-500/20 text-orange-500",
  SMS_RECEIVED: "bg-amber-500/20 text-amber-500",
  NOTE: "bg-gray-500/20 text-gray-500",
};

const activityTypes = [
  "all",
  "PHONE_CALL",
  "PHONE_CALL_INBOUND",
  "PHONE_CALL_OUTBOUND",
  "EMAIL_SENT",
  "EMAIL_RECEIVED",
  "MEETING",
  "MEETING_SCHEDULED",
  "MEETING_COMPLETED",
  "SMS_SENT",
  "SMS_RECEIVED",
  "NOTE",
  "SITE_VISIT",
  "APPLICATION_RECEIVED",
  "APPLICATION_SUBMITTED",
  "DOCUMENT_REQUESTED",
  "DOCUMENT_RECEIVED",
  "DOCUMENT_REVIEWED",
  "CREDIT_PULLED",
  "CREDIT_REVIEWED",
  "BANK_STATEMENTS_ANALYZED",
  "OFFER_GENERATED",
  "OFFER_SENT",
  "OFFER_ACCEPTED",
  "OFFER_DECLINED",
  "CONTRACT_SENT",
  "CONTRACT_SIGNED",
  "FUNDING_REQUESTED",
  "FUNDING_COMPLETED",
  "PAYMENT_RECEIVED",
  "PAYMENT_MISSED",
  "COLLECTION_CALL",
  "STATUS_CHANGE",
];

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await fetch("/api/crm/activities");
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      search === "" ||
      activity.subject?.toLowerCase().includes(search.toLowerCase()) ||
      activity.description?.toLowerCase().includes(search.toLowerCase()) ||
      `${activity.contact?.firstName} ${activity.contact?.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesType = typeFilter === "all" || activity.type === typeFilter;

    return matchesSearch && matchesType;
  });

  // Group activities by date
  const groupedActivities = filteredActivities.reduce(
    (groups, activity) => {
      const date = new Date(activity.createdAt).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
      return groups;
    },
    {} as Record<string, ActivityData[]>
  );

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Activities"
        subtitle="Track all CRM activities and interactions"
        action={
          <Link href="/crm/activities/new">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Log Activity
            </Button>
          </Link>
        }
      />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search activities..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="h-10 px-3 rounded-md border bg-background text-sm"
                >
                  {activityTypes.map((type) => (
                    <option key={type} value={type}>
                      {type === "all" ? "All Types" : type.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Total",
              count: activities.length,
              icon: Activity,
              color: "text-foreground",
            },
            {
              label: "Calls",
              count: activities.filter((a) => a.type.includes("CALL")).length,
              icon: Phone,
              color: "text-green-500",
            },
            {
              label: "Emails",
              count: activities.filter((a) => a.type.includes("EMAIL")).length,
              icon: Mail,
              color: "text-blue-500",
            },
            {
              label: "Meetings",
              count: activities.filter((a) => a.type.includes("MEETING")).length,
              icon: Calendar,
              color: "text-purple-500",
            },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
                  </div>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Activities Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Activity Timeline ({filteredActivities.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading activities...
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                {activities.length === 0 ? (
                  <>
                    <p>No activities yet</p>
                    <Link
                      href="/crm/activities/new"
                      className="text-primary hover:text-primary/80 text-sm mt-2 inline-block"
                    >
                      Log your first activity
                    </Link>
                  </>
                ) : (
                  <p>No activities match your search</p>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedActivities).map(([date, dayActivities]) => (
                  <div key={date}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-sm font-medium text-muted-foreground">
                        {date}
                      </span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    <div className="space-y-4">
                      {dayActivities.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex gap-4 p-4 bg-accent/50 rounded-lg hover:bg-accent transition-colors"
                        >
                          <div
                            className={`p-3 rounded-full h-fit ${
                              activityTypeColors[activity.type] ||
                              "bg-gray-500/20 text-gray-500"
                            }`}
                          >
                            {activityTypeIcons[activity.type] ||
                              activityTypeIcons.DEFAULT}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="font-medium">
                                  {activity.type.replace(/_/g, " ")}
                                </p>
                                {activity.subject && (
                                  <p className="text-foreground mt-1">
                                    {activity.subject}
                                  </p>
                                )}
                                {activity.description && (
                                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                    {activity.description}
                                  </p>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {new Date(activity.createdAt).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" }
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 mt-3 text-sm">
                              {activity.contact && (
                                <Link
                                  href={`/crm/contacts/${activity.contact.id}`}
                                  className="flex items-center gap-1 text-primary hover:text-primary/80"
                                >
                                  <User className="w-3 h-3" />
                                  {activity.contact.firstName}{" "}
                                  {activity.contact.lastName}
                                </Link>
                              )}
                              {activity.deal && (
                                <Link
                                  href={`/deals/${activity.deal.id}`}
                                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                                >
                                  <FileText className="w-3 h-3" />
                                  {activity.deal.merchant?.legalName || "Deal"}
                                </Link>
                              )}
                              {activity.duration && (
                                <span className="text-muted-foreground">
                                  {activity.duration} min
                                </span>
                              )}
                              {activity.user && (
                                <span className="text-muted-foreground">
                                  by {activity.user.email?.split("@")[0]}
                                </span>
                              )}
                            </div>
                            {activity.outcome && (
                              <p className="text-sm text-muted-foreground mt-2 italic">
                                Outcome: {activity.outcome}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
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
