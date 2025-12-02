"use client";

import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Mail,
  Plus,
  Search,
  Send,
  Inbox,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  Star,
  Paperclip,
  User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface EmailData {
  id: string;
  subject: string;
  body: string | null;
  direction: string;
  status: string;
  sentAt: string | null;
  openedAt: string | null;
  clickedAt: string | null;
  contact: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  QUEUED: "bg-warning/20 text-warning",
  SENT: "bg-info/20 text-info",
  DELIVERED: "bg-success/20 text-success",
  OPENED: "bg-primary/20 text-primary",
  CLICKED: "bg-purple-500/20 text-purple-500",
  BOUNCED: "bg-destructive/20 text-destructive",
  FAILED: "bg-destructive/20 text-destructive",
};

export default function EmailsPage() {
  const [emails, setEmails] = useState<EmailData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [directionFilter, setDirectionFilter] = useState<string>("all");

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      const response = await fetch("/api/crm/emails");
      if (response.ok) {
        const data = await response.json();
        setEmails(data);
      }
    } catch (error) {
      console.error("Failed to fetch emails:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmails = emails.filter((email) => {
    const matchesSearch =
      search === "" ||
      email.subject?.toLowerCase().includes(search.toLowerCase()) ||
      email.body?.toLowerCase().includes(search.toLowerCase()) ||
      `${email.contact?.firstName} ${email.contact?.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesDirection =
      directionFilter === "all" || email.direction === directionFilter;

    return matchesSearch && matchesDirection;
  });

  const sentCount = emails.filter((e) => e.direction === "OUTBOUND").length;
  const receivedCount = emails.filter((e) => e.direction === "INBOUND").length;
  const openedCount = emails.filter((e) => e.openedAt).length;

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Email Tracking"
        subtitle="Track and manage email communications"
        action={
          <Link href="/crm/emails/compose">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Compose Email
            </Button>
          </Link>
        }
      />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Email Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Total",
              count: emails.length,
              icon: Mail,
              color: "text-foreground",
            },
            {
              label: "Sent",
              count: sentCount,
              icon: Send,
              color: "text-info",
            },
            {
              label: "Received",
              count: receivedCount,
              icon: Inbox,
              color: "text-success",
            },
            {
              label: "Opened",
              count: openedCount,
              icon: Mail,
              color: "text-primary",
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

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search emails..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={directionFilter}
                  onChange={(e) => setDirectionFilter(e.target.value)}
                  className="h-10 px-3 rounded-md border bg-background text-sm"
                >
                  <option value="all">All Emails</option>
                  <option value="INBOUND">Received</option>
                  <option value="OUTBOUND">Sent</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Emails ({filteredEmails.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading emails...
              </div>
            ) : filteredEmails.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Mail className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                {emails.length === 0 ? (
                  <>
                    <p>No emails tracked yet</p>
                    <p className="text-sm mt-1">
                      Emails will appear here when you send or receive them
                    </p>
                  </>
                ) : (
                  <p>No emails match your search</p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredEmails.map((email) => (
                  <div
                    key={email.id}
                    className="flex items-start gap-4 p-4 bg-accent/50 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                  >
                    <div
                      className={`p-2 rounded-full ${
                        email.direction === "INBOUND"
                          ? "bg-success/20 text-success"
                          : "bg-info/20 text-info"
                      }`}
                    >
                      {email.direction === "INBOUND" ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{email.subject}</p>
                          {email.body && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {email.body}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              statusColors[email.status]
                            }`}
                          >
                            {email.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        {email.contact && (
                          <Link
                            href={`/crm/contacts/${email.contact.id}`}
                            className="flex items-center gap-1 hover:text-primary"
                          >
                            <User className="w-3 h-3" />
                            {email.contact.firstName} {email.contact.lastName}
                          </Link>
                        )}
                        {email.sentAt && (
                          <span>
                            {new Date(email.sentAt).toLocaleDateString()} at{" "}
                            {new Date(email.sentAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                        {email.openedAt && (
                          <span className="flex items-center gap-1 text-primary">
                            <Mail className="w-3 h-3" />
                            Opened
                          </span>
                        )}
                        {email.clickedAt && (
                          <span className="flex items-center gap-1 text-purple-500">
                            <Star className="w-3 h-3" />
                            Clicked
                          </span>
                        )}
                      </div>
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
