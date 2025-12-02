import { Header } from "@/components/layout/header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
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
  Phone,
  Mail,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Send,
  TrendingDown,
  Users,
  Target,
  Activity,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
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
        select: { id: true, legalName: true, dbaName: true, phone: true, email: true },
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
            select: { id: true, legalName: true, phone: true, email: true },
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

  const totalCollected = advances.reduce(
    (sum, adv) => sum + Number(adv.totalCollected),
    0
  );

  const collectionRate = advances.length > 0
    ? (totalCollected / advances.reduce((sum, adv) => sum + Number(adv.paybackAmount), 0)) * 100
    : 0;

  return {
    advances,
    upcomingPayments,
    failedPayments,
    totalOutstanding,
    delinquentCount,
    activeCount: advances.length,
    totalCollected,
    collectionRate,
  };
}

export default async function CollectionsPage() {
  const data = await getCollectionsData();

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Collections Management"
        subtitle="Advanced payment tracking and automated collections workflows"
        action={
          <div className="flex gap-2">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Send className="w-4 h-4 mr-2" />
              Send Reminders
            </Button>
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync ACH
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-6 overflow-auto space-y-6">
        {/* Enhanced Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <Badge variant="info" className="bg-blue-50 text-blue-700 border-blue-200">
                  Outstanding
                </Badge>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(data.totalOutstanding)}
              </p>
              <p className="text-sm text-gray-600 mt-1">Total Remaining Balance</p>
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-gray-500">
                  Across {data.activeCount} active advances
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <Badge variant="success" className="bg-green-50 text-green-700 border-green-200">
                  {data.collectionRate.toFixed(1)}%
                </Badge>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(data.totalCollected)}
              </p>
              <p className="text-sm text-gray-600 mt-1">Total Collected</p>
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-gray-500">
                  Collection rate: {data.collectionRate.toFixed(1)}%
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <Badge variant="warning" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  Next 7 Days
                </Badge>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {data.upcomingPayments.length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Scheduled Payments</p>
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-gray-500">
                  {formatCurrency(data.upcomingPayments.reduce((sum, p) => sum + Number(p.amount), 0))} expected
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <Badge variant="danger">Action Required</Badge>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {data.delinquentCount}
              </p>
              <p className="text-sm text-gray-600 mt-1">Delinquent Accounts</p>
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-gray-500">
                  {data.failedPayments.length} failed payments
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Collection Workflow Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Send className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Automated Reminders</h3>
                  <p className="text-xs text-gray-600">Smart payment reminders</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">Send automatic payment reminders via SMS, email, and voice calls based on custom workflows</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">ACH Tracking</h3>
                  <p className="text-xs text-gray-600">Real-time monitoring</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">Track daily ACH remittances automatically with instant updates on payment status and failures</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Payment Plans</h3>
                  <p className="text-xs text-gray-600">Restructure terms</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">Create custom payment plans and restructure terms for merchants facing temporary difficulties</p>
            </CardContent>
          </Card>
        </div>

        {/* Delinquent Accounts - Priority Section */}
        {data.delinquentCount > 0 && (
          <Card className="border-2 border-red-200 bg-red-50/30">
            <CardHeader className="bg-red-50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Delinquent Accounts - Immediate Action Required
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100">
                    <Phone className="w-4 h-4 mr-2" />
                    Call All
                  </Button>
                  <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100">
                    <Mail className="w-4 h-4 mr-2" />
                    Email All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Merchant</TableHead>
                    <TableHead>Days Past Due</TableHead>
                    <TableHead>Amount Due</TableHead>
                    <TableHead>Total Remaining</TableHead>
                    <TableHead>Last Payment</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.advances
                    .filter((a) => a.status === "DELINQUENT" || a.status === "DEFAULT")
                    .map((advance) => {
                      const lastPayment = advance.payments[0];
                      const daysPastDue = lastPayment
                        ? Math.floor((Date.now() - new Date(lastPayment.scheduledDate).getTime()) / (1000 * 60 * 60 * 24))
                        : 0;

                      return (
                        <TableRow key={advance.id} className="bg-white">
                          <TableCell>
                            <div>
                              <Link
                                href={`/merchants/${advance.merchant.id}`}
                                className="font-medium text-blue-600 hover:underline"
                              >
                                {advance.merchant.legalName}
                              </Link>
                              {advance.merchant.dbaName && (
                                <p className="text-sm text-gray-500">
                                  {advance.merchant.dbaName}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="danger">{daysPastDue} days</Badge>
                          </TableCell>
                          <TableCell className="font-semibold text-red-600">
                            {formatCurrency(Number(advance.paymentAmount))}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(Number(advance.remainingBalance))}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {lastPayment ? formatDate(lastPayment.scheduledDate) : "Never"}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {advance.merchant.phone && (
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Phone className="w-4 h-4 text-blue-600" />
                                </Button>
                              )}
                              {advance.merchant.email && (
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Mail className="w-4 h-4 text-blue-600" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="outline" size="sm">
                                <FileText className="w-3 h-3 mr-1" />
                                Log Contact
                              </Button>
                              <Button variant="outline" size="sm">
                                <Target className="w-3 h-3 mr-1" />
                                Payment Plan
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Failed Payments */}
        {data.failedPayments.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-orange-600 flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  Failed Payments - Follow Up Required
                </CardTitle>
                <Badge variant="warning" className="bg-orange-50 text-orange-700 border-orange-200">
                  {data.failedPayments.length} Total
                </Badge>
              </div>
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
                    <TableHead>Contact</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.failedPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <Link
                          href={`/merchants/${payment.advance.merchant.id}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {payment.advance.merchant.legalName}
                        </Link>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(Number(payment.amount))}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(payment.scheduledDate)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="danger">{payment.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {payment.returnReason || payment.returnCode || "Unknown"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {payment.advance.merchant.phone && (
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Phone className="w-4 h-4 text-blue-600" />
                            </Button>
                          )}
                          {payment.advance.merchant.email && (
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Mail className="w-4 h-4 text-blue-600" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm">
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Retry
                          </Button>
                          <Button variant="outline" size="sm">
                            <FileText className="w-3 h-3 mr-1" />
                            Log
                          </Button>
                        </div>
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
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Upcoming Payments (Next 7 Days)
              </CardTitle>
              <Badge variant="info" className="bg-blue-50 text-blue-700 border-blue-200">
                {formatCurrency(data.upcomingPayments.reduce((sum, p) => sum + Number(p.amount), 0))} Expected
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {data.upcomingPayments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No upcoming payments in the next 7 days</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Merchant</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Scheduled Date</TableHead>
                    <TableHead>Days Until Due</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.upcomingPayments.map((payment) => {
                    const daysUntil = Math.ceil((new Date(payment.scheduledDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    return (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <Link
                            href={`/merchants/${payment.advance.merchant.id}`}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {payment.advance.merchant.legalName}
                          </Link>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(Number(payment.amount))}
                        </TableCell>
                        <TableCell>
                          {formatDate(payment.scheduledDate)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={daysUntil <= 1 ? "warning" : "default"}>
                            {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `${daysUntil} days`}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="info">{payment.status}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Active Advances */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                All Active Advances
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
                <Button variant="outline" size="sm">
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {data.advances.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No active advances</p>
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
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.advances.map((advance) => {
                    const progress = (Number(advance.totalCollected) / Number(advance.paybackAmount)) * 100;
                    return (
                      <TableRow key={advance.id}>
                        <TableCell>
                          <div>
                            <Link
                              href={`/merchants/${advance.merchant.id}`}
                              className="font-medium text-blue-600 hover:underline"
                            >
                              {advance.merchant.legalName}
                            </Link>
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
                        <TableCell className="font-semibold text-green-600">
                          {formatCurrency(Number(advance.totalCollected))}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(Number(advance.remainingBalance))}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(Number(advance.paymentAmount))}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full transition-all"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600">{progress.toFixed(0)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariants[advance.status]}>
                            {advance.status.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Collections Features Info */}
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Advanced Collections Management</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Our automated collections system reduces operational costs by 90% with AI-powered workflows, real-time ACH tracking, automated reminders, and intelligent payment plan management.
                </p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">Automated ACH tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">Smart payment reminders</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">Custom workflows</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">Real-time reporting</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">Payment plan management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">Communication history</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
