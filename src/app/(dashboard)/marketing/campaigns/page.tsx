import { Header } from "@/components/layout/header";
import {
  Button,
  Card,
  CardContent,
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
import { Plus, Target, TrendingUp } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDate, formatCurrency } from "@/lib/utils";

async function getCampaigns() {
  return prisma.campaign.findMany({
    include: {
      _count: {
        select: {
          leads: true,
          contentPosts: true,
          adCampaigns: true,
        },
      },
      voiceCampaign: {
        select: {
          _count: {
            select: { callLogs: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

const statusVariants: Record<string, "success" | "warning" | "danger" | "default"> = {
  DRAFT: "default",
  SCHEDULED: "warning",
  ACTIVE: "success",
  PAUSED: "warning",
  COMPLETED: "default",
  CANCELLED: "danger",
};

const typeLabels: Record<string, string> = {
  VOICE_OUTBOUND: "Voice (Outbound)",
  VOICE_INBOUND: "Voice (Inbound)",
  EMAIL: "Email",
  SMS: "SMS",
  SOCIAL_ORGANIC: "Social (Organic)",
  SOCIAL_PAID: "Social (Paid)",
  CONTENT: "Content",
  MULTI_CHANNEL: "Multi-Channel",
};

export default async function CampaignsPage() {
  const campaigns = await getCampaigns();

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Campaigns"
        subtitle="Manage your marketing campaigns"
        action={
          <Link href="/marketing/campaigns/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </Link>
        }
      />

      <div className="flex-1 p-6 overflow-auto">
        <Card>
          <CardContent className="p-0">
            {campaigns.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No campaigns yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Create your first marketing campaign to start generating leads
                </p>
                <Link href="/marketing/campaigns/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Campaign
                  </Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Leads</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{campaign.name}</p>
                          {campaign.description && (
                            <p className="text-sm text-muted-foreground truncate max-w-xs">
                              {campaign.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {typeLabels[campaign.type] || campaign.type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariants[campaign.status]}>
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{campaign._count.leads}</TableCell>
                      <TableCell>
                        {campaign.budget
                          ? formatCurrency(Number(campaign.budget))
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingUp className="w-4 h-4 text-success" />
                          <span>{campaign.conversions} conv.</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(campaign.createdAt)}</TableCell>
                      <TableCell>
                        <Link href={`/marketing/campaigns/${campaign.id}`}>
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
