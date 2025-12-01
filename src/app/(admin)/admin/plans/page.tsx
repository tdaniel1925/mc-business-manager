import { Header } from "@/components/layout/header";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
} from "@/components/ui";
import { Plus, Package, Check, Users, Building2, FileText, HardDrive } from "lucide-react";
import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

async function getPlans() {
  return prisma.plan.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { subscriptions: true } },
    },
  });
}

export default async function PlansPage() {
  const plans = await getPlans();

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Subscription Plans"
        subtitle="Manage pricing plans and features"
        action={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Plan
          </Button>
        }
      />

      <div className="flex-1 p-6 overflow-auto">
        {plans.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No plans configured
              </h3>
              <p className="text-gray-500 mb-4">
                Create subscription plans for your clients
              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create First Plan
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} className="relative">
                {!plan.isActive && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="default">Inactive</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.description && (
                    <p className="text-sm text-gray-500">{plan.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">
                        {formatCurrency(Number(plan.monthlyPrice))}
                      </span>
                      <span className="text-gray-500">/month</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      or {formatCurrency(Number(plan.yearlyPrice))}/year
                    </p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>Up to {plan.maxUsers} users</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span>Up to {plan.maxMerchants} merchants</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span>{plan.maxDealsPerMonth} deals/month</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <HardDrive className="w-4 h-4 text-gray-400" />
                      <span>{plan.maxStorageGb} GB storage</span>
                    </div>
                  </div>

                  {plan.features.length > 0 && (
                    <div className="border-t pt-4 space-y-2">
                      {plan.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Check className="w-4 h-4 text-green-500" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Active subscriptions</span>
                      <Badge variant="primary">
                        {plan._count.subscriptions}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={
                        plan.isActive ? "text-yellow-600" : "text-green-600"
                      }
                    >
                      {plan.isActive ? "Disable" : "Enable"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
