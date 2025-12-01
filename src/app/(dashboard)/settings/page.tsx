import { Header } from "@/components/layout/header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { Users, Settings as SettingsIcon, Shield, Building2 } from "lucide-react";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import Link from "next/link";

const roleVariants: Record<UserRole, "default" | "primary" | "success" | "warning" | "danger" | "info" | "purple"> = {
  ADMIN: "danger",
  UNDERWRITER: "purple",
  SALES: "primary",
  COLLECTIONS: "warning",
  COMPLIANCE: "info",
  EXECUTIVE: "success",
  BROKER: "default",
};

async function getSettingsData() {
  const session = await auth();

  const [users, userCount, dealCount, merchantCount] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count(),
    prisma.deal.count(),
    prisma.merchant.count(),
  ]);

  return { users, userCount, dealCount, merchantCount, currentUser: session?.user };
}

export default async function SettingsPage() {
  const { users, userCount, dealCount, merchantCount, currentUser } =
    await getSettingsData();

  return (
    <div className="flex flex-col h-full">
      <Header title="Settings" subtitle="Manage your system settings" />

      <div className="flex-1 p-6 overflow-auto space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{userCount}</p>
                  <p className="text-sm text-gray-500">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Building2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{merchantCount}</p>
                  <p className="text-sm text-gray-500">Total Merchants</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <SettingsIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{dealCount}</p>
                  <p className="text-sm text-gray-500">Total Deals</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Shield className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{currentUser?.role || "N/A"}</p>
                  <p className="text-sm text-gray-500">Your Role</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Manage users and their permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.name || "Unnamed User"}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={roleVariants[user.role]}>{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "success" : "danger"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Settings Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>
                Configure system-wide settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Default Factor Rate</p>
                    <p className="text-sm text-gray-500">
                      Default rate for new deals
                    </p>
                  </div>
                  <span className="font-mono">1.35</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Default Term</p>
                    <p className="text-sm text-gray-500">
                      Default term length in days
                    </p>
                  </div>
                  <span className="font-mono">120 days</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Minimum FICO</p>
                    <p className="text-sm text-gray-500">
                      Minimum credit score for approval
                    </p>
                  </div>
                  <span className="font-mono">500</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Integration Status</CardTitle>
              <CardDescription>
                Connected services and APIs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Supabase</p>
                    <p className="text-sm text-gray-500">Database & Storage</p>
                  </div>
                  <Badge variant="success">Connected</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Resend</p>
                    <p className="text-sm text-gray-500">Email Service</p>
                  </div>
                  <Badge variant="success">Connected</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">DocuSign</p>
                    <p className="text-sm text-gray-500">E-Signature</p>
                  </div>
                  <Badge variant="warning">Not Configured</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Plaid</p>
                    <p className="text-sm text-gray-500">Bank Verification</p>
                  </div>
                  <Badge variant="warning">Not Configured</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
