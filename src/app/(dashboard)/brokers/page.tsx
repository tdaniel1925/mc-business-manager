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
import { Plus, Users, Eye } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatPercentage } from "@/lib/utils";
import { BrokerStatus, BrokerTier } from "@prisma/client";

const tierVariants: Record<BrokerTier, "default" | "primary" | "success"> = {
  STANDARD: "default",
  PREFERRED: "primary",
  PREMIUM: "success",
};

const statusVariants: Record<BrokerStatus, "success" | "warning" | "danger"> = {
  ACTIVE: "success",
  SUSPENDED: "warning",
  TERMINATED: "danger",
};

async function getBrokers() {
  return prisma.broker.findMany({
    include: {
      _count: {
        select: { deals: true, commissions: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function BrokersPage() {
  const brokers = await getBrokers();

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Brokers / ISOs"
        subtitle={`${brokers.length} total brokers`}
        action={
          <Link href="/brokers/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Broker
            </Button>
          </Link>
        }
      />

      <div className="flex-1 p-6 overflow-auto">
        <Card>
          <CardContent className="p-0">
            {brokers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No brokers yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Add your first broker/ISO partner
                </p>
                <Link href="/brokers/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Broker
                  </Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Commission Rate</TableHead>
                    <TableHead>Deals</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brokers.map((broker) => (
                    <TableRow key={broker.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{broker.companyName}</p>
                          <p className="text-sm text-gray-500">{broker.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{broker.contactName}</p>
                          <p className="text-sm text-gray-500">{broker.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={tierVariants[broker.tier]}>
                          {broker.tier}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatPercentage(Number(broker.commissionRate))}
                      </TableCell>
                      <TableCell>{broker._count.deals}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariants[broker.status]}>
                          {broker.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/brokers/${broker.id}`}>
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
