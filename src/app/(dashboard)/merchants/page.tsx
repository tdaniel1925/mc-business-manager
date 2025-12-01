import { Header } from "@/components/layout/header";
import { Button, Badge, Card, CardContent } from "@/components/ui";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui";
import { Plus, Eye, Building2 } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { MerchantStatus } from "@prisma/client";

const statusVariants: Record<MerchantStatus, "default" | "success" | "warning" | "danger"> = {
  ACTIVE: "success",
  INACTIVE: "default",
  BLACKLISTED: "danger",
  PROSPECT: "warning",
};

async function getMerchants() {
  return prisma.merchant.findMany({
    include: {
      owners: {
        where: { isPrimary: true },
        take: 1,
      },
      _count: {
        select: { deals: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function MerchantsPage() {
  const merchants = await getMerchants();

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Merchants"
        subtitle={`${merchants.length} total merchants`}
        action={
          <Link href="/merchants/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Merchant
            </Button>
          </Link>
        }
      />

      <div className="flex-1 p-6 overflow-auto">
        <Card>
          <CardContent className="p-0">
            {merchants.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No merchants yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Add your first merchant to get started
                </p>
                <Link href="/merchants/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Merchant
                  </Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Primary Owner</TableHead>
                    <TableHead>Monthly Revenue</TableHead>
                    <TableHead>Deals</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {merchants.map((merchant) => (
                    <TableRow key={merchant.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{merchant.legalName}</p>
                          {merchant.dbaName && (
                            <p className="text-sm text-gray-500">
                              DBA: {merchant.dbaName}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {merchant.owners[0] ? (
                          <span>
                            {merchant.owners[0].firstName}{" "}
                            {merchant.owners[0].lastName}
                          </span>
                        ) : (
                          <span className="text-gray-400">No owner</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {merchant.monthlyRevenue
                          ? formatCurrency(Number(merchant.monthlyRevenue))
                          : "-"}
                      </TableCell>
                      <TableCell>{merchant._count.deals}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariants[merchant.status]}>
                          {merchant.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/merchants/${merchant.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
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
