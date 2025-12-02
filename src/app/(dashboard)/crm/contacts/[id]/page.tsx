import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Phone,
  Mail,
  Building2,
  MapPin,
  Calendar,
  Activity,
  ListTodo,
  FileText,
  DollarSign,
  User,
  Clock,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getContact(id: string) {
  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      activities: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { user: true },
      },
      tasks: {
        orderBy: { dueDate: "asc" },
        take: 10,
        include: { assignedTo: true },
      },
      deals: {
        include: {
          deal: {
            include: { merchant: true },
          },
        },
      },
      emails: {
        orderBy: { sentAt: "desc" },
        take: 5,
      },
    },
  });

  return contact;
}

const contactTypeColors: Record<string, string> = {
  BUSINESS_OWNER: "bg-primary/20 text-primary",
  GUARANTOR: "bg-purple-500/20 text-purple-500",
  ACCOUNTANT: "bg-blue-500/20 text-blue-500",
  ATTORNEY: "bg-indigo-500/20 text-indigo-500",
  BROKER: "bg-orange-500/20 text-orange-500",
  REFERRAL_SOURCE: "bg-green-500/20 text-green-500",
  VENDOR: "bg-yellow-500/20 text-yellow-500",
  EMPLOYEE: "bg-cyan-500/20 text-cyan-500",
  OTHER: "bg-gray-500/20 text-gray-500",
};

const activityTypeIcons: Record<string, React.ReactNode> = {
  PHONE_CALL: <Phone className="w-4 h-4" />,
  EMAIL: <Mail className="w-4 h-4" />,
  MEETING: <Calendar className="w-4 h-4" />,
  NOTE: <Activity className="w-4 h-4" />,
};

const taskStatusColors: Record<string, string> = {
  PENDING: "bg-warning/20 text-warning",
  IN_PROGRESS: "bg-info/20 text-info",
  COMPLETED: "bg-success/20 text-success",
  CANCELLED: "bg-muted text-muted-foreground",
};

export default async function ContactDetailPage({ params }: PageProps) {
  const { id } = await params;
  const contact = await getContact(id);

  if (!contact) {
    notFound();
  }

  const fullAddress = [contact.address, contact.city, contact.state, contact.zipCode]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="flex flex-col h-full">
      <Header
        title={`${contact.firstName} ${contact.lastName}`}
        subtitle={contact.businessName || contact.contactType.replace(/_/g, " ")}
        action={
          <div className="flex items-center gap-2">
            <Link href="/crm/contacts">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <Link href={`/crm/contacts/${contact.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button variant="destructive" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Contact Info */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">
                      {contact.firstName?.[0] || ""}
                      {contact.lastName?.[0] || ""}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">
                      {contact.firstName} {contact.lastName}
                    </h2>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        contactTypeColors[contact.contactType] || "bg-gray-500/20 text-gray-500"
                      }`}
                    >
                      {contact.contactType.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      <span>{contact.email}</span>
                    </a>
                  )}
                  {contact.phone && (
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      <span>{contact.phone}</span>
                    </a>
                  )}
                  {contact.mobile && (
                    <a
                      href={`tel:${contact.mobile}`}
                      className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      <span>{contact.mobile} (mobile)</span>
                    </a>
                  )}
                  {contact.businessName && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Building2 className="w-4 h-4" />
                      <div>
                        <span>{contact.businessName}</span>
                        {contact.title && (
                          <span className="text-sm"> - {contact.title}</span>
                        )}
                      </div>
                    </div>
                  )}
                  {fullAddress && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{fullAddress}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* MCA Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  MCA Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Credit Score</span>
                  <span className="font-medium">
                    {contact.creditScore || "Not available"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ownership</span>
                  <span className="font-medium">
                    {contact.ownershipPercent
                      ? `${contact.ownershipPercent}%`
                      : "Not specified"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lead Score</span>
                  <span className="font-medium">
                    {contact.leadScore || "Not scored"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lead Source</span>
                  <span className="font-medium">
                    {contact.source?.replace(/_/g, " ") || "Unknown"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                <Link href={`/crm/activities/new?contactId=${contact.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    <Activity className="w-4 h-4 mr-2" />
                    Log Activity
                  </Button>
                </Link>
                <Link href={`/crm/tasks/new?contactId=${contact.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    <ListTodo className="w-4 h-4 mr-2" />
                    Add Task
                  </Button>
                </Link>
                <a href={`mailto:${contact.email}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                </a>
                <a href={`tel:${contact.phone}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Activity & Tasks */}
          <div className="lg:col-span-2 space-y-6">
            {/* Associated Deals */}
            {contact.deals.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Associated Deals ({contact.deals.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {contact.deals.map((dc) => (
                      <Link
                        key={dc.id}
                        href={`/deals/${dc.deal.id}`}
                        className="flex items-center justify-between p-3 bg-accent/50 rounded-lg hover:bg-accent transition-colors"
                      >
                        <div>
                          <p className="font-medium">
                            {dc.deal.merchant?.legalName || "Unknown Merchant"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Role: {dc.role.replace(/_/g, " ")} | Status:{" "}
                            {dc.deal.status}
                          </p>
                        </div>
                        <span className="text-sm font-medium">
                          ${dc.deal.requestedAmount?.toLocaleString() || 0}
                        </span>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activity Timeline */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                  <Link href={`/crm/activities/new?contactId=${contact.id}`}>
                    <Button size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Log Activity
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {contact.activities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p>No activities yet</p>
                    <Link
                      href={`/crm/activities/new?contactId=${contact.id}`}
                      className="text-primary hover:text-primary/80 text-sm mt-2 inline-block"
                    >
                      Log your first activity
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {contact.activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex gap-4 p-3 bg-accent/50 rounded-lg"
                      >
                        <div className="p-2 bg-background rounded-full h-fit">
                          {activityTypeIcons[activity.type] || (
                            <Activity className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">
                              {activity.type.replace(/_/g, " ")}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {new Date(activity.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {activity.subject && (
                            <p className="text-sm text-foreground mt-1">
                              {activity.subject}
                            </p>
                          )}
                          {activity.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {activity.description}
                            </p>
                          )}
                          {activity.user && (
                            <p className="text-xs text-muted-foreground mt-2">
                              by {activity.user.email?.split("@")[0]}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tasks */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ListTodo className="w-5 h-5" />
                    Tasks
                  </CardTitle>
                  <Link href={`/crm/tasks/new?contactId=${contact.id}`}>
                    <Button size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Task
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {contact.tasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ListTodo className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p>No tasks yet</p>
                    <Link
                      href={`/crm/tasks/new?contactId=${contact.id}`}
                      className="text-primary hover:text-primary/80 text-sm mt-2 inline-block"
                    >
                      Create your first task
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {contact.tasks.map((task) => (
                      <Link
                        key={task.id}
                        href={`/crm/tasks/${task.id}`}
                        className="flex items-center justify-between p-3 bg-accent/50 rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={task.status === "COMPLETED"}
                            readOnly
                            className="w-4 h-4 rounded border-muted"
                          />
                          <div>
                            <p
                              className={`font-medium text-sm ${
                                task.status === "COMPLETED"
                                  ? "line-through text-muted-foreground"
                                  : ""
                              }`}
                            >
                              {task.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  taskStatusColors[task.status]
                                }`}
                              >
                                {task.status}
                              </span>
                              {task.dueDate && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded bg-muted">
                          {task.priority}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            {contact.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {contact.notes}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Meta Info */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>
                      Created by System
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(contact.createdAt).toLocaleDateString()} at{" "}
                      {new Date(contact.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
