import { Header } from "@/components/layout/header";
import { Button, Badge, Card, CardContent } from "@/components/ui";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui";
import { Plus, Eye, FileText } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DealStage } from "@prisma/client";

const stageVariants: Record<DealStage, "default" | "primary" | "success" | "warning" | "danger" | "info" | "purple"> = {
  NEW_LEAD: "default",
  DOCS_REQUESTED: "warning",
  DOCS_RECEIVED: "info",
  IN_UNDERWRITING: "purple",
  APPROVED: "success",
  CONTRACT_SENT: "info",
  CONTRACT_SIGNED: "primary",
  FUNDED: "success",
  DECLINED: "danger",
  DEAD: "default",
};

async function getDeals() {
  return prisma.deal.findMany({
    include: {
      merchant: {
        select: {
          id: true,
          legalName: true,
          dbaName: true,
        },
      },
      underwriter: {
        select: {
          id: true,
          name: true,
        },
      },
      broker: {
        select: {
          id: true,
          companyName: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function DealsPage() {
  const deals = await getDeals();

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Deals"
        subtitle={`${deals.length} total deals`}
        action={
          <Link href="/deals/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Deal
            </Button>
          </Link>
        }
      />

      <div className="flex-1 p-6 overflow-auto">
        <Card>
          <CardContent className="p-0">
            {deals.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No deals yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Create your first deal to get started
                </p>
                <Link href="/deals/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Deal
                  </Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Merchant</TableHead>
                    <TableHead>Requested Amount</TableHead>
                    <TableHead>Approved Amount</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Underwriter</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deals.map((deal) => (
                    <TableRow key={deal.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{deal.merchant.legalName}</p>
                          {deal.merchant.dbaName && (
                            <p className="text-sm text-gray-500">
                              DBA: {deal.merchant.dbaName}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(Number(deal.requestedAmount))}
                      </TableCell>
                      <TableCell>
                        {deal.approvedAmount
                          ? formatCurrency(Number(deal.approvedAmount))
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={stageVariants[deal.stage]}>
                          {deal.stage.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {deal.broker ? (
                          <span className="text-sm">
                            {deal.broker.companyName}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">
                            {deal.source}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {deal.underwriter ? (
                          <span className="text-sm">{deal.underwriter.name}</span>
                        ) : (
                          <span className="text-sm text-gray-400">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(deal.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/deals/${deal.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
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
