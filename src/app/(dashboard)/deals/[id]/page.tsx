import { notFound } from "next/navigation";
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
  ArrowLeft,
  Building2,
  User,
  FileText,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { DealStage } from "@prisma/client";
import { DealActions } from "./deal-actions";
import { DealComments } from "./deal-comments";

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

async function getDeal(id: string) {
  return prisma.deal.findUnique({
    where: { id },
    include: {
      merchant: {
        include: { owners: true },
      },
      underwriter: {
        select: { id: true, name: true, email: true },
      },
      broker: {
        select: { id: true, companyName: true, contactName: true, commissionRate: true },
      },
      createdBy: {
        select: { id: true, name: true },
      },
      documents: {
        orderBy: { createdAt: "desc" },
      },
      bankAnalysis: true,
      contracts: {
        include: { signatures: true },
        orderBy: { createdAt: "desc" },
      },
      comments: {
        include: {
          user: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      stageHistory: {
        orderBy: { changedAt: "desc" },
        take: 10,
      },
    },
  });
}

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const deal = await getDeal(id);

  if (!deal) {
    notFound();
  }

  const primaryOwner = deal.merchant.owners.find((o) => o.isPrimary);

  return (
    <div className="flex flex-col h-full">
      <Header
        title={deal.merchant.legalName}
        subtitle={`Deal ID: ${deal.id.slice(0, 8)}...`}
        action={
          <div className="flex gap-2">
            <Link href="/deals">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <DealActions deal={deal} />
          </div>
        }
      />

      <div className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Deal Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Deal Overview</CardTitle>
                  <Badge variant={stageVariants[deal.stage]} className="text-sm">
                    {deal.stage.replace(/_/g, " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Requested Amount</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(Number(deal.requestedAmount))}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Approved Amount</p>
                    <p className="text-lg font-semibold">
                      {deal.approvedAmount
                        ? formatCurrency(Number(deal.approvedAmount))
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Factor Rate</p>
                    <p className="text-lg font-semibold">
                      {deal.factorRate ? Number(deal.factorRate).toFixed(2) : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payback Amount</p>
                    <p className="text-lg font-semibold">
                      {deal.paybackAmount
                        ? formatCurrency(Number(deal.paybackAmount))
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Term</p>
                    <p className="text-lg font-semibold">
                      {deal.termDays ? `${deal.termDays} days` : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Daily Payment</p>
                    <p className="text-lg font-semibold">
                      {deal.dailyPayment
                        ? formatCurrency(Number(deal.dailyPayment))
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Paper Grade</p>
                    <p className="text-lg font-semibold">{deal.paperGrade || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Risk Score</p>
                    <p className="text-lg font-semibold">
                      {deal.riskScore !== null ? deal.riskScore : "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Merchant Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Merchant Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Legal Name</p>
                    <p className="font-medium">{deal.merchant.legalName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">DBA Name</p>
                    <p className="font-medium">{deal.merchant.dbaName || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">EIN</p>
                    <p className="font-medium">{deal.merchant.ein || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Business Type</p>
                    <p className="font-medium">
                      {deal.merchant.businessType.replace(/_/g, " ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Monthly Revenue</p>
                    <p className="font-medium">
                      {deal.merchant.monthlyRevenue
                        ? formatCurrency(Number(deal.merchant.monthlyRevenue))
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Time in Business</p>
                    <p className="font-medium">
                      {deal.merchant.timeInBusiness
                        ? `${deal.merchant.timeInBusiness} months`
                        : "-"}
                    </p>
                  </div>
                </div>
                {primaryOwner && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Primary Owner
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium">
                          {primaryOwner.firstName} {primaryOwner.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">FICO Score</p>
                        <p className="font-medium">
                          {primaryOwner.ficoScore || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Ownership</p>
                        <p className="font-medium">
                          {Number(primaryOwner.ownership)}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="mt-4">
                  <Link href={`/merchants/${deal.merchant.id}`}>
                    <Button variant="outline" size="sm">
                      View Full Merchant Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Documents ({deal.documents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {deal.documents.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No documents uploaded yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {deal.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium">{doc.fileName}</p>
                            <p className="text-sm text-gray-500">
                              {doc.documentType.replace(/_/g, " ")} •{" "}
                              {formatDate(doc.createdAt)}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={doc.verified ? "success" : "warning"}
                        >
                          {doc.verified ? "Verified" : doc.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Comments */}
            <DealComments dealId={deal.id} comments={deal.comments} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="font-medium">{formatDateTime(deal.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Stage Changed</p>
                    <p className="font-medium">
                      {formatDateTime(deal.stageChangedAt)}
                    </p>
                  </div>
                </div>
                {deal.fundedAt && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Funded</p>
                      <p className="font-medium">{formatDateTime(deal.fundedAt)}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Underwriter</p>
                    <p className="font-medium">
                      {deal.underwriter?.name || "Unassigned"}
                    </p>
                  </div>
                </div>
                {deal.broker && (
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Broker</p>
                      <p className="font-medium">{deal.broker.companyName}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stage History */}
            <Card>
              <CardHeader>
                <CardTitle>Stage History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {deal.stageHistory.map((history, index) => (
                    <div key={history.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        {index < deal.stageHistory.length - 1 && (
                          <div className="w-px h-full bg-gray-200 my-1" />
                        )}
                      </div>
                      <div className="pb-3">
                        <p className="font-medium text-sm">
                          {history.toStage.replace(/_/g, " ")}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDateTime(history.changedAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
