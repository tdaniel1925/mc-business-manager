import { Header } from "@/components/layout/header";
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui";
import { ArrowLeft, Building2, Mail, Phone, MapPin, DollarSign, TrendingUp, FileText } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";

export default async function BrokerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const broker = await prisma.broker.findUnique({
    where: { id },
    include: {
      deals: {
        include: {
          merchant: { select: { legalName: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      commissions: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!broker) {
    notFound();
  }

  const totalCommissionEarned = broker.commissions
    .filter((c) => c.status === "PAID")
    .reduce((sum, c) => sum + Number(c.amount), 0);

  const pendingCommissions = broker.commissions
    .filter((c) => c.status === "PENDING" || c.status === "APPROVED")
    .reduce((sum, c) => sum + Number(c.amount), 0);

  return (
    <div className="flex flex-col h-full">
      <Header
        title={broker.companyName}
        subtitle="Broker details and performance"
        action={
          <Link href="/brokers">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Brokers
            </Button>
          </Link>
        }
      />

      <div className="flex-1 p-6 overflow-auto space-y-6">
        {/* Broker Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Broker Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Company Name</p>
                  <p className="font-medium flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    {broker.companyName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact Name</p>
                  <p className="font-medium">{broker.contactName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {broker.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {broker.phone || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tier</p>
                  <Badge variant={broker.tier === "PREMIUM" ? "success" : broker.tier === "PREFERRED" ? "primary" : "default"}>
                    {broker.tier}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Commission Rate</p>
                  <p className="font-medium">{Number(broker.commissionRate) * 100}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge variant={broker.status === "ACTIVE" ? "success" : broker.status === "SUSPENDED" ? "warning" : "danger"}>
                    {broker.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium">{formatDate(broker.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{formatCurrency(totalCommissionEarned)}</p>
                    <p className="text-sm text-gray-500">Total Earned</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <TrendingUp className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{formatCurrency(pendingCommissions)}</p>
                    <p className="text-sm text-gray-500">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{broker.deals.length}</p>
                    <p className="text-sm text-gray-500">Total Deals</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Deals */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Deals</CardTitle>
          </CardHeader>
          <CardContent>
            {broker.deals.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No deals yet</p>
            ) : (
              <div className="space-y-3">
                {broker.deals.map((deal) => (
                  <Link
                    key={deal.id}
                    href={`/deals/${deal.id}`}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium">{deal.merchant.legalName}</p>
                      <p className="text-sm text-gray-500">{formatDate(deal.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(Number(deal.requestedAmount))}</p>
                      <Badge variant="default">{deal.stage.replace(/_/g, " ")}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
