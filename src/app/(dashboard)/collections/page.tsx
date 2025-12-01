import { Header } from "@/components/layout/header";
import {
  Card,
  CardHeader,
  CardTitle,
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
import {
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Calendar,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AdvanceStatus } from "@prisma/client";

const statusVariants: Record<AdvanceStatus, "default" | "success" | "warning" | "danger" | "info"> = {
  PENDING_FUNDING: "info",
  ACTIVE: "success",
  CURRENT: "success",
  DELINQUENT: "warning",
  DEFAULT: "danger",
  PAID_OFF: "default",
  SETTLED: "default",
  CHARGED_OFF: "danger",
};

async function getCollectionsData() {
  const advances = await prisma.advance.findMany({
    where: {
      status: { in: ["ACTIVE", "CURRENT", "DELINQUENT", "DEFAULT"] },
    },
    include: {
      merchant: {
        select: { id: true, legalName: true, dbaName: true },
      },
      payments: {
        where: {
          scheduledDate: {
            lte: new Date(),
          },
        },
        orderBy: { scheduledDate: "desc" },
        take: 5,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Upcoming payments
  const upcomingPayments = await prisma.payment.findMany({
    where: {
      scheduledDate: {
        gte: new Date(),
        lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
      },
      status: "SCHEDULED",
    },
    include: {
      advance: {
        include: {
          merchant: {
            select: { id: true, legalName: true },
          },
        },
      },
    },
    orderBy: { scheduledDate: "asc" },
  });

  // Failed payments
  const failedPayments = await prisma.payment.findMany({
    where: {
      status: { in: ["RETURNED", "NSF", "FAILED"] },
    },
    include: {
      advance: {
        include: {
          merchant: {
            select: { id: true, legalName: true },
          },
        },
      },
    },
    orderBy: { processedDate: "desc" },
    take: 20,
  });

  // Summary stats
  const totalOutstanding = advances.reduce(
    (sum, adv) => sum + Number(adv.remainingBalance),
    0
  );

  const delinquentCount = advances.filter(
    (a) => a.status === "DELINQUENT" || a.status === "DEFAULT"
  ).length;

  return {
    advances,
    upcomingPayments,
    failedPayments,
    totalOutstanding,
    delinquentCount,
    activeCount: advances.length,
  };
}

export default async function CollectionsPage() {
  const data = await getCollectionsData();

  return (
    <div className="flex flex-col h-full">
      <Header title="Collections" subtitle="Monitor payments and manage collections" />

      <div className="flex-1 p-6 overflow-auto space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {formatCurrency(data.totalOutstanding)}
                  </p>
                  <p className="text-sm text-gray-500">Outstanding Balance</p>
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
                  <p className="text-2xl font-bold">{data.activeCount}</p>
                  <p className="text-sm text-gray-500">Active Advances</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Calendar className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {data.upcomingPayments.length}
                  </p>
                  <p className="text-sm text-gray-500">Upcoming (7 days)</p>
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
                  <p className="text-2xl font-bold">{data.delinquentCount}</p>
                  <p className="text-sm text-gray-500">Delinquent</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Advances */}
        <Card>
          <CardHeader>
            <CardTitle>Active Advances</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {data.advances.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No active advances
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Merchant</TableHead>
                    <TableHead>Funded Amount</TableHead>
                    <TableHead>Payback</TableHead>
                    <TableHead>Collected</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead>Daily Payment</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.advances.map((advance) => (
                    <TableRow key={advance.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {advance.merchant.legalName}
                          </p>
                          {advance.merchant.dbaName && (
                            <p className="text-sm text-gray-500">
                              {advance.merchant.dbaName}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(Number(advance.fundedAmount))}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(Number(advance.paybackAmount))}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(Number(advance.totalCollected))}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(Number(advance.remainingBalance))}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(Number(advance.paymentAmount))}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariants[advance.status]}>
                          {advance.status.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Failed Payments */}
        {data.failedPayments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Failed Payments
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Merchant</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Scheduled Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Return Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.failedPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.advance.merchant.legalName}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(Number(payment.amount))}
                      </TableCell>
                      <TableCell>
                        {formatDate(payment.scheduledDate)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="danger">{payment.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {payment.returnReason || payment.returnCode || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Payments */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Payments (Next 7 Days)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {data.upcomingPayments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No upcoming payments
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Merchant</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Scheduled Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.upcomingPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.advance.merchant.legalName}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(Number(payment.amount))}
                      </TableCell>
                      <TableCell>
                        {formatDate(payment.scheduledDate)}
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
