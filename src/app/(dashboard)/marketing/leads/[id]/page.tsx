import { Header } from "@/components/layout/header";
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui";
import { ArrowLeft, Mail, Phone, Building2, DollarSign, Calendar, User } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDate, formatCurrency } from "@/lib/utils";
import { notFound } from "next/navigation";

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
    include: {
      assignedTo: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!lead) {
    notFound();
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "NEW":
        return "info";
      case "CONTACTED":
        return "warning";
      case "QUALIFIED":
        return "success";
      case "CONVERTED":
        return "success";
      case "UNQUALIFIED":
        return "danger";
      default:
        return "default";
    }
  };

  const getSourceVariant = (source: string) => {
    switch (source) {
      case "WEBSITE":
        return "info";
      case "REFERRAL":
        return "success";
      case "COLD_CALL":
        return "warning";
      case "EMAIL":
        return "info";
      case "SOCIAL_MEDIA":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title={`${lead.firstName} ${lead.lastName}`}
        subtitle="Lead details and information"
        action={
          <Link href="/marketing/leads">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Leads
            </Button>
          </Link>
        }
      />

      <div className="flex-1 p-6 overflow-auto space-y-6">
        {/* Lead Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Lead Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Name</p>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <p className="font-medium">
                      {lead.firstName} {lead.lastName}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <Badge variant={getStatusVariant(lead.status)}>
                    {lead.status}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {lead.email}
                    </a>
                  </div>
                </div>

                {lead.phone && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Phone</p>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a
                        href={`tel:${lead.phone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {lead.phone}
                      </a>
                    </div>
                  </div>
                )}

                {lead.company && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Company</p>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <p className="font-medium">{lead.company}</p>
                    </div>
                  </div>
                )}

                {lead.title && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Job Title</p>
                    <p className="font-medium">{lead.title}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500 mb-1">Lead Source</p>
                  <Badge variant={getSourceVariant(lead.source)}>
                    {lead.source.replace(/_/g, " ")}
                  </Badge>
                </div>

                {lead.estimatedValue && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Estimated Value</p>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <p className="font-semibold text-green-600">
                        {formatCurrency(Number(lead.estimatedValue))}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {lead.notes && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{lead.notes}</p>
                </div>
              )}

              {lead.assignedTo && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-1">Assigned To</p>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{lead.assignedTo.name}</span>
                    <span className="text-sm text-gray-500">({lead.assignedTo.email})</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <p className="font-medium">{formatDate(lead.createdAt)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <p className="font-medium">{formatDate(lead.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/crm/emails/compose?to=${lead.email}`} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                </Link>
                {lead.phone && (
                  <a href={`tel:${lead.phone}`} className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>

            {lead.status === "QUALIFIED" && (
              <Card>
                <CardHeader>
                  <CardTitle>Convert to Deal</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">
                    This lead is qualified and ready to be converted to a deal.
                  </p>
                  <Link href={`/deals/new?leadId=${lead.id}`}>
                    <Button className="w-full">
                      Convert to Deal
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
