import { Header } from "@/components/layout/header";
import {
  Button,
  Card,
  CardContent,
  Badge,
  Input,
} from "@/components/ui";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui";
import { Plus, Search, Building2 } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

async function getCompanies() {
  return prisma.company.findMany({
    include: {
      subscription: { include: { plan: true } },
      _count: { select: { users: true, merchants: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

const statusVariants: Record<string, "success" | "warning" | "danger" | "default"> = {
  ACTIVE: "success",
  TRIAL: "warning",
  SUSPENDED: "danger",
  CANCELLED: "default",
  PAST_DUE: "danger",
};

export default async function CompaniesPage() {
  const companies = await getCompanies();

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Companies"
        subtitle="Manage client companies and their subscriptions"
        action={
          <Link href="/admin/companies/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Company
            </Button>
          </Link>
        }
      />

      <div className="flex-1 p-6 overflow-auto">
        <Card>
          <CardContent className="p-0">
            {companies.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No companies yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Get started by adding your first client company
                </p>
                <Link href="/admin/companies/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Company
                  </Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Merchants</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{company.name}</p>
                          <p className="text-sm text-muted-foreground">{company.email || company.slug}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariants[company.status]}>
                          {company.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {company.subscription?.plan?.name || (
                          <span className="text-muted-foreground">No plan</span>
                        )}
                      </TableCell>
                      <TableCell>{company._count.users}</TableCell>
                      <TableCell>{company._count.merchants}</TableCell>
                      <TableCell>{formatDate(company.createdAt)}</TableCell>
                      <TableCell>
                        <Link href={`/admin/companies/${company.id}`}>
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
    </div>
  );
}
