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
  TrendingUp,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

async function getBillingStats() {
  const [
    activeSubscriptions,
    trialSubscriptions,
    pastDueSubscriptions,
    recentInvoices,
    companies,
  ] = await Promise.all([
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.subscription.count({ where: { status: "TRIALING" } }),
    prisma.subscription.count({ where: { status: "PAST_DUE" } }),
    prisma.invoice.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        company: { select: { id: true, name: true } },
      },
    }),
    prisma.company.findMany({
      where: { subscription: { isNot: null } },
      include: {
        subscription: { include: { plan: true } },
      },
    }),
  ]);

  // Calculate MRR (mock calculation)
  const mrr = companies.reduce((sum, company) => {
    if (company.subscription?.status === "ACTIVE") {
      return sum + Number(company.subscription.plan.monthlyPrice);
    }
    return sum;
  }, 0);

  return {
    activeSubscriptions,
    trialSubscriptions,
    pastDueSubscriptions,
    mrr,
    recentInvoices,
  };
}

const invoiceStatusVariants: Record<string, "success" | "warning" | "danger" | "default"> = {
  PAID: "success",
  OPEN: "warning",
  DRAFT: "default",
  VOID: "default",
  UNCOLLECTIBLE: "danger",
};

export default async function BillingPage() {
  const stats = await getBillingStats();

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Billing & Revenue"
        subtitle="Monitor subscriptions and revenue"
      />

      <div className="flex-1 p-6 overflow-auto space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Monthly Revenue</p>
                  <p className="text-3xl font-bold">
                    {formatCurrency(stats.mrr)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                +8.2% from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Subscriptions</p>
                  <p className="text-3xl font-bold">
                    {stats.activeSubscriptions}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                Paying customers
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Trial Subscriptions</p>
                  <p className="text-3xl font-bold">
                    {stats.trialSubscriptions}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                Potential converts
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Past Due</p>
                  <p className="text-3xl font-bold">
                    {stats.pastDueSubscriptions}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="mt-4 text-sm text-red-600">
                Requires attention
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>Revenue chart will be displayed here</p>
                <p className="text-sm">
                  Integrate with Stripe for real-time data
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Recent Invoices
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {stats.recentInvoices.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No invoices yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Paid</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono">
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/companies/${invoice.company.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {invoice.company.name}
                        </Link>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(Number(invoice.total))}
                      </TableCell>
                      <TableCell>
                        <Badge variant={invoiceStatusVariants[invoice.status]}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                      <TableCell>
                        {invoice.paidAt ? formatDate(invoice.paidAt) : "-"}
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
