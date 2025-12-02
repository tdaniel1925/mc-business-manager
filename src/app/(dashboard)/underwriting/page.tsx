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
import {
  Calculator,
  Eye,
  ClipboardCheck,
  AlertTriangle,
  Clock,
  TrendingUp,
  Shield,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { auth } from "@/lib/auth";

async function getUnderwritingData() {
  const session = await auth();

  // Get deals pending underwriting (DOCS_RECEIVED or IN_UNDERWRITING stage)
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
        select: { id: true, name: true, email: true },
      },
      documents: {
        select: { id: true, documentType: true, verified: true },
      },
      bankAnalysis: true,
    },
    orderBy: { stageChangedAt: "asc" },
  });

  // Get my assigned deals if logged in
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

  // Get recent decisions (approved or declined)
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

  // Calculate stats
  const totalPending = pendingDeals.length;
  const totalMyQueue = myDeals.length;
  const recentApproved = recentDecisions.filter((d) => d.stage === "APPROVED").length;
  const recentDeclined = recentDecisions.filter((d) => d.stage === "DECLINED").length;

  // Calculate average requested amount
  const avgRequestedAmount =
    pendingDeals.length > 0
      ? pendingDeals.reduce((sum, d) => sum + Number(d.requestedAmount), 0) /
        pendingDeals.length
      : 0;

  return {
    pendingDeals,
    myDeals,
    recentDecisions,
    stats: {
      totalPending,
      totalMyQueue,
      recentApproved,
      recentDeclined,
      avgRequestedAmount,
    },
  };
}

function getDocumentStatus(docs: { documentType: string; verified: boolean }[]) {
  const requiredDocs = ["BANK_STATEMENT", "APPLICATION", "GOVERNMENT_ID", "VOIDED_CHECK"];
  const hasAll = requiredDocs.every((type) =>
    docs.some((d) => d.documentType === type)
  );
  const allVerified = docs
    .filter((d) => requiredDocs.includes(d.documentType))
    .every((d) => d.verified);

  if (allVerified && hasAll) return { label: "Complete", variant: "success" as const };
  if (hasAll) return { label: "Pending Review", variant: "warning" as const };
  return { label: "Incomplete", variant: "danger" as const };
}

function getPaperGradeVariant(grade: string | null) {
  switch (grade) {
    case "A":
      return "success";
    case "B":
      return "info";
    case "C":
      return "warning";
    case "D":
      return "danger";
    default:
      return "default";
  }
}

function getFicoColor(fico: number | null) {
  if (!fico) return "text-gray-400";
  if (fico >= 700) return "text-green-600 font-semibold";
  if (fico >= 650) return "text-green-500";
  if (fico >= 600) return "text-yellow-600";
  if (fico >= 550) return "text-orange-500";
  return "text-red-600";
}

export default async function UnderwritingPage() {
  const { pendingDeals, recentDecisions, stats } = await getUnderwritingData();

  return (
    <div className="flex flex-col h-full">
      <Header title="Underwriting" subtitle="Risk assessment and deal approval" />

      <div className="flex-1 p-6 overflow-auto space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalPending}</p>
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
                  <p className="text-2xl font-bold">{stats.totalMyQueue}</p>
                  <p className="text-sm text-gray-500">My Queue</p>
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
                  <p className="text-2xl font-bold">{stats.recentApproved}</p>
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
                  <p className="text-2xl font-bold">{stats.recentDeclined}</p>
                  <p className="text-sm text-gray-500">Declined (Recent)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-full flex-shrink-0">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xl font-bold truncate">
                    {formatCurrency(stats.avgRequestedAmount)}
                  </p>
                  <p className="text-sm text-gray-500 whitespace-nowrap">Avg. Request</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Underwriting Queue */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Underwriting Queue
              </CardTitle>
              <Badge variant="info">{pendingDeals.length} deals</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {pendingDeals.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ClipboardCheck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-medium">No deals pending underwriting</p>
                <p className="text-sm">New deals will appear here when ready for review</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[180px]">Merchant</TableHead>
                      <TableHead className="min-w-[100px]">Requested</TableHead>
                      <TableHead className="min-w-[70px]">FICO</TableHead>
                      <TableHead className="min-w-[100px]">Revenue</TableHead>
                      <TableHead className="min-w-[80px]">Grade</TableHead>
                      <TableHead className="min-w-[90px]">Risk Score</TableHead>
                      <TableHead className="min-w-[110px]">Docs</TableHead>
                      <TableHead className="min-w-[120px]">Bank Analysis</TableHead>
                      <TableHead className="min-w-[120px]">Assigned To</TableHead>
                      <TableHead className="text-right min-w-[140px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingDeals.map((deal) => {
                      const docStatus = getDocumentStatus(deal.documents);
                      const primaryOwner = deal.merchant.owners[0];
                      const fico = primaryOwner?.ficoScore;

                      return (
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
                          <TableCell className="font-medium whitespace-nowrap">
                            {formatCurrency(Number(deal.requestedAmount))}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <span className={getFicoColor(fico)}>
                              {fico || "N/A"}
                            </span>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {deal.merchant.monthlyRevenue
                              ? formatCurrency(Number(deal.merchant.monthlyRevenue))
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            {deal.paperGrade ? (
                              <Badge variant={getPaperGradeVariant(deal.paperGrade)}>
                                Grade {deal.paperGrade}
                              </Badge>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {deal.riskScore !== null ? (
                              <span
                                className={
                                  deal.riskScore >= 70
                                    ? "text-green-600 font-semibold"
                                    : deal.riskScore >= 50
                                    ? "text-yellow-600 font-semibold"
                                    : "text-red-600 font-semibold"
                                }
                              >
                                {deal.riskScore}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={docStatus.variant}>
                              {docStatus.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {deal.bankAnalysis ? (
                              <Badge variant="success">Ready</Badge>
                            ) : (
                              <Badge variant="warning">Pending</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {deal.underwriter?.name || (
                              <span className="text-gray-400">Unassigned</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Link href={`/underwriting/${deal.id}`}>
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                  <Calculator className="w-4 h-4 mr-1" />
                                  Analyze
                                </Button>
                              </Link>
                              <Link href={`/deals/${deal.id}`}>
                                <Button size="sm" variant="outline">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
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
                <p>No recent decisions</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Merchant</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Approved</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Decision</TableHead>
                      <TableHead>Underwriter</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
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
                          {deal.approvedAmount
                            ? formatCurrency(Number(deal.approvedAmount))
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {deal.paperGrade ? (
                            <Badge variant={getPaperGradeVariant(deal.paperGrade)}>
                              {deal.paperGrade}
                            </Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={deal.stage === "APPROVED" ? "success" : "danger"}
                          >
                            {deal.stage}
                          </Badge>
                        </TableCell>
                        <TableCell>{deal.underwriter?.name || "-"}</TableCell>
                        <TableCell>
                          {deal.decisionDate ? formatDate(deal.decisionDate) : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end">
                            <Link href={`/deals/${deal.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
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
