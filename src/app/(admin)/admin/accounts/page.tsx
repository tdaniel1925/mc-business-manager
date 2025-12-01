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
import { Building2, Users, FileText, Plus, Search } from "lucide-react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

async function getClientAccounts() {
  const merchants = await prisma.merchant.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: {
      company: { select: { id: true, name: true } },
      deals: {
        select: { id: true, stage: true },
        take: 5,
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: { deals: true },
      },
    },
  });

  const stats = await prisma.merchant.groupBy({
    by: ["status"],
    _count: true,
  });

  return { merchants, stats };
}

const merchantStatusVariants: Record<
  string,
  "success" | "warning" | "danger" | "default"
> = {
  ACTIVE: "success",
  INACTIVE: "default",
  PROSPECT: "warning",
  SUSPENDED: "danger",
  CLOSED: "danger",
};

export default async function AccountsPage() {
  const { merchants, stats } = await getClientAccounts();

  const totalAccounts = stats.reduce((sum, s) => sum + s._count, 0);
  const activeAccounts =
    stats.find((s) => s.status === "ACTIVE")?._count || 0;
  const prospectAccounts =
    stats.find((s) => s.status === "PROSPECT")?._count || 0;

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Client Accounts"
        subtitle="Manage merchant accounts across all companies"
        action={
          <Link
            href="/admin/accounts/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Account
          </Link>
        }
      />

      <div className="flex-1 p-6 overflow-auto space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Accounts</p>
                  <p className="text-3xl font-bold">{totalAccounts}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Accounts</p>
                  <p className="text-3xl font-bold">{activeAccounts}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Prospects</p>
                  <p className="text-3xl font-bold">{prospectAccounts}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <FileText className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Companies</p>
                  <p className="text-3xl font-bold">
                    {new Set(merchants.map((m) => m.companyId).filter(Boolean)).size}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Building2 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Accounts Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                All Client Accounts
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search accounts..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {merchants.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No client accounts yet
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Company (Client)</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Deals</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {merchants.map((merchant) => (
                    <TableRow key={merchant.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{merchant.legalName}</p>
                          <p className="text-sm text-gray-500">
                            {merchant.dbaName || merchant.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {merchant.company ? (
                          <Link
                            href={`/admin/companies/${merchant.company.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            {merchant.company.name}
                          </Link>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>{merchant.industryCode || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={merchantStatusVariants[merchant.status] || "default"}
                        >
                          {merchant.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{merchant._count.deals}</TableCell>
                      <TableCell>{formatDate(merchant.createdAt)}</TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/accounts/${merchant.id}`}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View
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
