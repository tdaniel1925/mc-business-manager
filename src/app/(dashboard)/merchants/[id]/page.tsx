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
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui";
import {
  ArrowLeft,
  Building2,
  User,
  FileText,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Globe,
  Plus,
} from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DealStage, MerchantStatus } from "@prisma/client";

const statusVariants: Record<MerchantStatus, "default" | "success" | "warning" | "danger"> = {
  ACTIVE: "success",
  INACTIVE: "default",
  BLACKLISTED: "danger",
  PROSPECT: "warning",
};

const dealStageVariants: Record<DealStage, "default" | "primary" | "success" | "warning" | "danger" | "info" | "purple"> = {
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

async function getMerchant(id: string) {
  return prisma.merchant.findUnique({
    where: { id },
    include: {
      owners: true,
      deals: {
        include: {
          underwriter: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      advances: {
        orderBy: { createdAt: "desc" },
      },
      documents: {
        orderBy: { createdAt: "desc" },
      },
      assignedSalesRep: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}

export default async function MerchantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const merchant = await getMerchant(id);

  if (!merchant) {
    notFound();
  }

  const totalFunded = merchant.advances.reduce(
    (sum, adv) => sum + Number(adv.fundedAmount),
    0
  );

  const primaryOwner = merchant.owners.find((o) => o.isPrimary);

  return (
    <div className="flex flex-col h-full">
      <Header
        title={merchant.legalName}
        subtitle={merchant.dbaName ? `DBA: ${merchant.dbaName}` : undefined}
        action={
          <div className="flex gap-2">
            <Link href="/merchants">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <Link href={`/deals/new?merchantId=${merchant.id}`}>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Deal
              </Button>
            </Link>
          </div>
        }
      />

      <div className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Business Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Business Information
                  </CardTitle>
                  <Badge variant={statusVariants[merchant.status]}>
                    {merchant.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Legal Name</p>
                    <p className="font-medium">{merchant.legalName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">DBA Name</p>
                    <p className="font-medium">{merchant.dbaName || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">EIN</p>
                    <p className="font-medium">{merchant.ein || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Business Type</p>
                    <p className="font-medium">
                      {merchant.businessType.replace(/_/g, " ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Industry Code</p>
                    <p className="font-medium">{merchant.industryCode || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Time in Business</p>
                    <p className="font-medium">
                      {merchant.timeInBusiness
                        ? `${merchant.timeInBusiness} months`
                        : "-"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{merchant.phone || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{merchant.email || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <Globe className="w-4 h-4 text-gray-400" />
                    {merchant.website ? (
                      <a
                        href={merchant.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {merchant.website}
                      </a>
                    ) : (
                      "-"
                    )}
                  </div>
                  <div className="flex items-start gap-2 col-span-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span>
                      {merchant.address
                        ? `${merchant.address}, ${merchant.city}, ${merchant.state} ${merchant.zipCode}`
                        : "-"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Owners */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Owners ({merchant.owners.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {merchant.owners.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No owners added</p>
                ) : (
                  <div className="space-y-4">
                    {merchant.owners.map((owner) => (
                      <div
                        key={owner.id}
                        className="p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">
                            {owner.firstName} {owner.lastName}
                          </p>
                          <div className="flex gap-2">
                            {owner.isPrimary && (
                              <Badge variant="primary">Primary</Badge>
                            )}
                            <Badge variant="default">{Number(owner.ownership)}%</Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Email:</span>{" "}
                            {owner.email || "-"}
                          </div>
                          <div>
                            <span className="text-gray-500">Phone:</span>{" "}
                            {owner.phone || "-"}
                          </div>
                          <div>
                            <span className="text-gray-500">FICO:</span>{" "}
                            {owner.ficoScore || "-"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Deals */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Deals ({merchant.deals.length})
                  </CardTitle>
                  <Link href={`/deals/new?merchantId=${merchant.id}`}>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      New Deal
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {merchant.deals.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No deals yet for this merchant
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Amount</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead>Underwriter</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {merchant.deals.map((deal) => (
                        <TableRow key={deal.id}>
                          <TableCell>
                            {formatCurrency(Number(deal.requestedAmount))}
                          </TableCell>
                          <TableCell>
                            <Badge variant={dealStageVariants[deal.stage]}>
                              {deal.stage.replace(/_/g, " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {deal.underwriter?.name || "Unassigned"}
                          </TableCell>
                          <TableCell>{formatDate(deal.createdAt)}</TableCell>
                          <TableCell>
                            <Link href={`/deals/${deal.id}`}>
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Monthly Revenue</span>
                  <span className="font-semibold">
                    {merchant.monthlyRevenue
                      ? formatCurrency(Number(merchant.monthlyRevenue))
                      : "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Total Deals</span>
                  <span className="font-semibold">{merchant.deals.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Total Funded</span>
                  <span className="font-semibold">
                    {formatCurrency(totalFunded)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Active Advances</span>
                  <span className="font-semibold">
                    {merchant.advances.filter((a) => a.status === "ACTIVE").length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Assigned Rep */}
            {merchant.assignedSalesRep && (
              <Card>
                <CardHeader>
                  <CardTitle>Assigned Sales Rep</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{merchant.assignedSalesRep.name}</p>
                  <p className="text-sm text-gray-500">
                    {merchant.assignedSalesRep.email}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Documents ({merchant.documents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {merchant.documents.length === 0 ? (
                  <p className="text-gray-500 text-sm">No documents uploaded</p>
                ) : (
                  <div className="space-y-2">
                    {merchant.documents.slice(0, 5).map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="truncate">{doc.fileName}</span>
                        <Badge variant={doc.verified ? "success" : "warning"}>
                          {doc.verified ? "Verified" : "Pending"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
