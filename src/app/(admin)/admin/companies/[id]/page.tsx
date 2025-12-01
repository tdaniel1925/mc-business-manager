import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import {
  Button,
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
  ArrowLeft,
  Building2,
  Users,
  CreditCard,
  Settings,
  Plus,
  Mail,
  Phone,
  Globe,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDate, formatCurrency } from "@/lib/utils";

async function getCompany(id: string) {
  return prisma.company.findUnique({
    where: { id },
    include: {
      subscription: { include: { plan: true } },
      users: {
        orderBy: { createdAt: "desc" },
      },
      invoices: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      paymentMethods: true,
      _count: { select: { merchants: true, users: true } },
    },
  });
}

const statusVariants: Record<string, "success" | "warning" | "danger" | "default"> = {
  ACTIVE: "success",
  TRIAL: "warning",
  SUSPENDED: "danger",
  CANCELLED: "default",
  PAST_DUE: "danger",
};

const roleLabels: Record<string, string> = {
  COMPANY_OWNER: "Owner",
  COMPANY_ADMIN: "Admin",
  MANAGER: "Manager",
  UNDERWRITER: "Underwriter",
  SALES: "Sales",
  COLLECTIONS: "Collections",
  COMPLIANCE: "Compliance",
  VIEWER: "Viewer",
};

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = await getCompany(id);

  if (!company) {
    notFound();
  }

  return (
    <div className="flex flex-col h-full">
      <Header
        title={company.name}
        subtitle={company.slug}
        action={
          <div className="flex gap-2">
            <Link href="/admin/companies">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <Link href={`/admin/users/new?companyId=${company.id}`}>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </Link>
          </div>
        }
      />

      <div className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Company Information
                  </CardTitle>
                  <Badge variant={statusVariants[company.status]}>
                    {company.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Company Name</p>
                    <p className="font-medium">{company.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Legal Name</p>
                    <p className="font-medium">{company.legalName || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">URL Slug</p>
                    <p className="font-medium">{company.slug}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="font-medium">{formatDate(company.createdAt)}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
                  {company.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{company.email}</span>
                    </div>
                  )}
                  {company.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{company.phone}</span>
                    </div>
                  )}
                  {company.website && (
                    <div className="flex items-center gap-2 col-span-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {company.website}
                      </a>
                    </div>
                  )}
                  {company.address && (
                    <div className="flex items-start gap-2 col-span-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span>
                        {company.address}, {company.city}, {company.state}{" "}
                        {company.zipCode}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Users */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Users ({company.users.length})
                  </CardTitle>
                  <Link href={`/admin/users/new?companyId=${company.id}`}>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Add User
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {company.users.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No users yet for this company
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {company.users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.name || "-"}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="default">
                              {user.companyRole
                                ? roleLabels[user.companyRole] || user.companyRole
                                : "-"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.isActive ? "success" : "default"}>
                              {user.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(user.createdAt)}</TableCell>
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
            {/* Subscription */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Subscription
                </CardTitle>
              </CardHeader>
              <CardContent>
                {company.subscription ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Plan</span>
                      <span className="font-medium">
                        {company.subscription.plan.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Price</span>
                      <span className="font-medium">
                        {formatCurrency(
                          Number(company.subscription.plan.monthlyPrice)
                        )}
                        /mo
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Status</span>
                      <Badge
                        variant={
                          company.subscription.status === "ACTIVE"
                            ? "success"
                            : "warning"
                        }
                      >
                        {company.subscription.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Next Billing</span>
                      <span className="font-medium">
                        {formatDate(company.subscription.currentPeriodEnd)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 mb-3">No subscription</p>
                    <Button size="sm" variant="outline">
                      Assign Plan
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Usage Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Users</span>
                  <span className="font-medium">{company._count.users}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Merchants</span>
                  <span className="font-medium">{company._count.merchants}</span>
                </div>
                {company.trialEndsAt && company.status === "TRIAL" && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Trial Ends</span>
                    <span className="font-medium text-yellow-600">
                      {formatDate(company.trialEndsAt)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                {company.paymentMethods.length === 0 ? (
                  <p className="text-gray-500 text-sm">No payment methods</p>
                ) : (
                  <div className="space-y-2">
                    {company.paymentMethods.map((pm) => (
                      <div
                        key={pm.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <span className="capitalize">{pm.brand}</span>
                          <span>•••• {pm.last4}</span>
                        </div>
                        {pm.isDefault && (
                          <Badge variant="primary">Default</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Edit Company
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Change Plan
                </Button>
                {company.status === "ACTIVE" && (
                  <Button
                    variant="outline"
                    className="w-full justify-start text-yellow-600 hover:text-yellow-700"
                  >
                    Suspend Company
                  </Button>
                )}
                {company.status === "SUSPENDED" && (
                  <Button
                    variant="outline"
                    className="w-full justify-start text-green-600 hover:text-green-700"
                  >
                    Reactivate Company
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
