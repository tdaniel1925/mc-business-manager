import { Header } from "@/components/layout/header";
import {
  Button,
  Card,
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
import { Plus, Users, Shield } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

async function getUsers() {
  return prisma.user.findMany({
    include: {
      company: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

const platformRoleLabels: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  PLATFORM_ADMIN: "Platform Admin",
  PLATFORM_SUPPORT: "Support",
};

const companyRoleLabels: Record<string, string> = {
  COMPANY_OWNER: "Owner",
  COMPANY_ADMIN: "Admin",
  MANAGER: "Manager",
  UNDERWRITER: "Underwriter",
  SALES: "Sales",
  COLLECTIONS: "Collections",
  COMPLIANCE: "Compliance",
  VIEWER: "Viewer",
};

export default async function UsersPage() {
  const users = await getUsers();

  const platformAdmins = users.filter((u) => u.platformRole !== null);
  const companyUsers = users.filter((u) => u.platformRole === null);

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Users"
        subtitle="Manage platform admins and company users"
        action={
          <Link href="/admin/users/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </Link>
        }
      />

      <div className="flex-1 p-6 overflow-auto space-y-6">
        {/* Platform Admins */}
        <Card>
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold">Platform Administrators</h3>
              <Badge variant="primary">{platformAdmins.length}</Badge>
            </div>
            <Link href="/admin/users/new?type=platform">
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Add Admin
              </Button>
            </Link>
          </div>
          <CardContent className="p-0">
            {platformAdmins.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No platform administrators
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {platformAdmins.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.name || "-"}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="purple">
                          {user.platformRole
                            ? platformRoleLabels[user.platformRole]
                            : "-"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "success" : "default"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.lastLoginAt
                          ? formatDate(user.lastLoginAt)
                          : "Never"}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Company Users */}
        <Card>
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold">Company Users</h3>
              <Badge variant="default">{companyUsers.length}</Badge>
            </div>
            <Link href="/admin/users/new?type=company">
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Add User
              </Button>
            </Link>
          </div>
          <CardContent className="p-0">
            {companyUsers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No company users yet
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companyUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.name || "-"}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.company ? (
                          <Link
                            href={`/admin/companies/${user.company.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            {user.company.name}
                          </Link>
                        ) : (
                          <span className="text-gray-400">No company</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">
                          {user.companyRole
                            ? companyRoleLabels[user.companyRole]
                            : "-"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "success" : "default"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
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
