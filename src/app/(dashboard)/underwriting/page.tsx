import { Header } from "@/components/layout/header";
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui";
import { Eye, ClipboardCheck, AlertTriangle, Clock } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { auth } from "@/lib/auth";

async function getUnderwritingQueue() {
  const session = await auth();

  // Deals that need underwriting
  const pendingDeals = await prisma.deal.findMany({
    where: {
      stage: {
        in: ["DOCS_RECEIVED", "IN_UNDERWRITING"],
      },
    },
    include: {
      merchant: {
        include: {
          owners: {
            where: { isPrimary: true },
            take: 1,
          },
        },
      },
      underwriter: {
        select: { id: true, name: true },
      },
      documents: {
        select: { id: true, documentType: true, verified: true },
      },
      bankAnalysis: true,
    },
    orderBy: { stageChangedAt: "asc" },
  });

  // My assigned deals
  const myDeals = session?.user?.id
    ? await prisma.deal.findMany({
        where: {
          underwriterId: session.user.id,
          stage: { in: ["DOCS_RECEIVED", "IN_UNDERWRITING"] },
        },
        include: {
          merchant: true,
        },
        orderBy: { stageChangedAt: "asc" },
      })
    : [];

  // Recent decisions
  const recentDecisions = await prisma.deal.findMany({
    where: {
      stage: { in: ["APPROVED", "DECLINED"] },
      decisionDate: { not: null },
    },
    include: {
      merchant: true,
      underwriter: {
        select: { id: true, name: true },
      },
    },
    orderBy: { decisionDate: "desc" },
    take: 10,
  });

  return { pendingDeals, myDeals, recentDecisions };
}

export default async function UnderwritingPage() {
  const { pendingDeals, myDeals, recentDecisions } = await getUnderwritingQueue();

  const requiredDocs = [
    "BANK_STATEMENT",
    "APPLICATION",
    "GOVERNMENT_ID",
    "VOIDED_CHECK",
  ];

  function getDocStatus(docs: { documentType: string; verified: boolean }[]) {
    const hasAll = requiredDocs.every((type) =>
      docs.some((d) => d.documentType === type)
    );
    const allVerified = docs
      .filter((d) => requiredDocs.includes(d.documentType))
      .every((d) => d.verified);

    if (allVerified) return { status: "complete", color: "success" as const };
    if (hasAll) return { status: "pending", color: "warning" as const };
    return { status: "incomplete", color: "danger" as const };
  }

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Underwriting"
        subtitle="Review and approve deals"
      />

      <div className="flex-1 p-6 overflow-auto space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingDeals.length}</p>
                  <p className="text-sm text-gray-500">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <ClipboardCheck className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{myDeals.length}</p>
                  <p className="text-sm text-gray-500">My Queue</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <ClipboardCheck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {recentDecisions.filter((d) => d.stage === "APPROVED").length}
                  </p>
                  <p className="text-sm text-gray-500">Approved (Recent)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {recentDecisions.filter((d) => d.stage === "DECLINED").length}
                  </p>
                  <p className="text-sm text-gray-500">Declined (Recent)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Deals Queue */}
        <Card>
          <CardHeader>
            <CardTitle>Underwriting Queue</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {pendingDeals.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ClipboardCheck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No deals pending underwriting</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Merchant</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>FICO</TableHead>
                    <TableHead>Monthly Revenue</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Bank Analysis</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingDeals.map((deal) => {
                    const docStatus = getDocStatus(deal.documents);
                    const primaryOwner = deal.merchant.owners[0];

                    return (
                      <TableRow key={deal.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {deal.merchant.legalName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {deal.merchant.dbaName}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatCurrency(Number(deal.requestedAmount))}
                        </TableCell>
                        <TableCell>
                          {primaryOwner?.ficoScore ? (
                            <span
                              className={
                                primaryOwner.ficoScore >= 650
                                  ? "text-green-600"
                                  : primaryOwner.ficoScore >= 550
                                  ? "text-yellow-600"
                                  : "text-red-600"
                              }
                            >
                              {primaryOwner.ficoScore}
                            </span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          {deal.merchant.monthlyRevenue
                            ? formatCurrency(Number(deal.merchant.monthlyRevenue))
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={docStatus.color}>
                            {deal.documents.length} docs ({docStatus.status})
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {deal.bankAnalysis ? (
                            <Badge variant="success">Complete</Badge>
                          ) : (
                            <Badge variant="warning">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              deal.stage === "IN_UNDERWRITING"
                                ? "purple"
                                : "info"
                            }
                          >
                            {deal.stage.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {deal.underwriter?.name || (
                            <span className="text-gray-400">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Link href={`/deals/${deal.id}`}>
                            <Button size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              Review
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Recent Decisions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Decisions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentDecisions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No recent decisions
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Merchant</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Decision</TableHead>
                    <TableHead>Underwriter</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentDecisions.map((deal) => (
                    <TableRow key={deal.id}>
                      <TableCell className="font-medium">
                        {deal.merchant.legalName}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(Number(deal.requestedAmount))}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            deal.stage === "APPROVED" ? "success" : "danger"
                          }
                        >
                          {deal.stage}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {deal.underwriter?.name || "-"}
                      </TableCell>
                      <TableCell>
                        {deal.decisionDate
                          ? formatDate(deal.decisionDate)
                          : "-"}
                      </TableCell>
                      <TableCell>
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
