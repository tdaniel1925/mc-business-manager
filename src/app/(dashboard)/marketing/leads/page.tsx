import { Header } from "@/components/layout/header";
import {
  Button,
  Card,
  CardContent,
  Badge,
  Input,
} from "@/components/ui";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui";
import { Plus, UserPlus, Search, Filter, Phone, Mail, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

async function getLeads() {
  return prisma.marketingLead.findMany({
    include: {
      campaign: true,
      _count: {
        select: {
          callLogs: true,
          interactions: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

const statusVariants: Record<string, "success" | "warning" | "danger" | "default"> = {
  NEW: "default",
  CONTACTED: "warning",
  QUALIFIED: "success",
  UNQUALIFIED: "danger",
  NURTURING: "default",
  CONVERTED: "success",
  LOST: "danger",
};

const sourceLabels: Record<string, string> = {
  AI_VOICE_OUTBOUND: "Voice (Outbound)",
  AI_VOICE_INBOUND: "Voice (Inbound)",
  SMS_CAMPAIGN: "SMS",
  EMAIL_CAMPAIGN: "Email",
  SOCIAL_FACEBOOK: "Facebook",
  SOCIAL_INSTAGRAM: "Instagram",
  SOCIAL_LINKEDIN: "LinkedIn",
  SOCIAL_TWITTER: "Twitter/X",
  GOOGLE_ADS: "Google Ads",
  FACEBOOK_ADS: "Facebook Ads",
  LANDING_PAGE: "Landing Page",
  REFERRAL: "Referral",
  ORGANIC_SEARCH: "Organic",
  DIRECT: "Direct",
};

export default async function LeadsPage() {
  const leads = await getLeads();

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Marketing Leads"
        subtitle="Manage and qualify marketing leads"
        action={
          <Link href="/marketing/leads/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Lead
            </Button>
          </Link>
        }
      />

      <div className="flex-1 p-6 overflow-auto">
        {/* Search and Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search leads..." className="pl-10" />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {leads.length === 0 ? (
              <div className="text-center py-12">
                <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No leads yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Start capturing leads through your marketing campaigns
                </p>
                <Link href="/marketing/leads/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Lead
                  </Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <button className="flex items-center gap-1">
                        Lead <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>
                      <button className="flex items-center gap-1">
                        Score <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Interactions</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">
                            {lead.businessName || "Unknown Business"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {lead.contactName || "No contact"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {lead.email && (
                            <a
                              href={`mailto:${lead.email}`}
                              className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
                            >
                              <Mail className="w-3 h-3" />
                              {lead.email}
                            </a>
                          )}
                          {lead.phone && (
                            <a
                              href={`tel:${lead.phone}`}
                              className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
                            >
                              <Phone className="w-3 h-3" />
                              {lead.phone}
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {sourceLabels[lead.source] || lead.source}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              lead.leadScore >= 70
                                ? "bg-success/20 text-success"
                                : lead.leadScore >= 40
                                ? "bg-warning/20 text-warning"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {lead.leadScore}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariants[lead.qualificationStatus]}>
                          {lead.qualificationStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {lead._count.callLogs + lead._count.interactions} total
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(lead.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Link href={`/marketing/leads/${lead.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
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
