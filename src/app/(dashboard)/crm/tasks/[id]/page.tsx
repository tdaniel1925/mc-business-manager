import { Header } from "@/components/layout/header";
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui";
import { ArrowLeft, Calendar, User, CheckCircle, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = await prisma.crmTask.findUnique({
    where: { id },
    include: {
      assignedTo: {
        select: { id: true, name: true, email: true },
      },
      contact: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });

  if (!task) {
    notFound();
  }

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "danger";
      case "MEDIUM":
        return "warning";
      case "LOW":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "success";
      case "IN_PROGRESS":
        return "info";
      case "PENDING":
        return "warning";
      case "CANCELLED":
        return "danger";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "IN_PROGRESS":
        return <Clock className="w-5 h-5 text-blue-600" />;
      case "PENDING":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title={task.title}
        subtitle="Task details and information"
        action={
          <Link href="/crm/tasks">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tasks
            </Button>
          </Link>
        }
      />

      <div className="flex-1 p-6 overflow-auto space-y-6">
        {/* Task Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Task Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Title</p>
                <p className="text-lg font-semibold">{task.title}</p>
              </div>

              {task.description && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Description</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(task.status)}
                    <Badge variant={getStatusVariant(task.status)}>
                      {task.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Priority</p>
                  <Badge variant={getPriorityVariant(task.priority)}>
                    {task.priority}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Category</p>
                  <Badge variant="default">{task.category.replace(/_/g, " ")}</Badge>
                </div>

                {task.dueDate && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Due Date</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{formatDate(task.dueDate)}</span>
                    </div>
                  </div>
                )}
              </div>

              {task.assignedTo && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Assigned To</p>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{task.assignedTo.name}</span>
                    <span className="text-sm text-gray-500">({task.assignedTo.email})</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium">{formatDate(task.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Updated</p>
                  <p className="font-medium">{formatDate(task.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Info */}
          <div className="space-y-4">
            {task.contact && (
              <Card>
                <CardHeader>
                  <CardTitle>Related Contact</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`/crm/contacts/${task.contact.id}`}
                    className="block hover:bg-gray-50 p-3 rounded-lg border"
                  >
                    <p className="font-medium">
                      {task.contact.firstName} {task.contact.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{task.contact.email}</p>
                  </Link>
                </CardContent>
              </Card>
            )}

            {task.dealId && (
              <Card>
                <CardHeader>
                  <CardTitle>Related Deal</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`/deals/${task.dealId}`}
                    className="block hover:bg-gray-50 p-3 rounded-lg border"
                  >
                    <p className="font-medium">View Deal Details</p>
                    <p className="text-sm text-gray-500">Deal ID: {task.dealId.slice(0, 8)}...</p>
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
