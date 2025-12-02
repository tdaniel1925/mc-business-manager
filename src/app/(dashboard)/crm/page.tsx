import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import {
  Contact,
  Activity,
  ListTodo,
  Mail,
  Calendar,
  Phone,
  UserPlus,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";
import prisma from "@/lib/prisma";
import Link from "next/link";

async function getCrmStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const weekFromNow = new Date(today);
  weekFromNow.setDate(weekFromNow.getDate() + 7);

  const [
    totalContacts,
    businessOwners,
    brokerContacts,
    totalActivities,
    recentActivities,
    totalTasks,
    pendingTasks,
    overdueTasks,
    todayTasks,
    upcomingTasks,
    totalEmails,
    recentContacts,
  ] = await Promise.all([
    prisma.contact.count(),
    prisma.contact.count({ where: { contactType: "BUSINESS_OWNER" } }),
    prisma.contact.count({ where: { contactType: "BROKER" } }),
    prisma.activity.count(),
    prisma.activity.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { contact: true, user: true },
    }),
    prisma.crmTask.count(),
    prisma.crmTask.count({ where: { status: "PENDING" } }),
    prisma.crmTask.count({
      where: {
        status: { in: ["PENDING", "IN_PROGRESS"] },
        dueDate: { lt: today },
      },
    }),
    prisma.crmTask.count({
      where: {
        dueDate: { gte: today, lt: tomorrow },
        status: { in: ["PENDING", "IN_PROGRESS"] },
      },
    }),
    prisma.crmTask.findMany({
      where: {
        dueDate: { gte: today, lt: weekFromNow },
        status: { in: ["PENDING", "IN_PROGRESS"] },
      },
      take: 5,
      orderBy: { dueDate: "asc" },
      include: { contact: true, assignedTo: true },
    }),
    prisma.emailMessage.count(),
    prisma.contact.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    totalContacts,
    businessOwners,
    brokerContacts,
    totalActivities,
    recentActivities,
    totalTasks,
    pendingTasks,
    overdueTasks,
    todayTasks,
    upcomingTasks,
    totalEmails,
    recentContacts,
  };
}

const activityTypeIcons: Record<string, React.ReactNode> = {
  PHONE_CALL: <Phone className="w-4 h-4" />,
  EMAIL: <Mail className="w-4 h-4" />,
  MEETING: <Calendar className="w-4 h-4" />,
  NOTE: <Activity className="w-4 h-4" />,
};

const taskCategoryColors: Record<string, string> = {
  FOLLOW_UP_CALL: "bg-blue-500",
  DOCUMENT_REQUEST: "bg-orange-500",
  DOCUMENT_REVIEW: "bg-yellow-500",
  CREDIT_REVIEW: "bg-purple-500",
  UNDERWRITING: "bg-indigo-500",
  APPROVAL_REVIEW: "bg-green-500",
  CONTRACT_PREPARATION: "bg-teal-500",
  CONTRACT_FOLLOW_UP: "bg-cyan-500",
  FUNDING: "bg-emerald-500",
  COLLECTION: "bg-red-500",
  RENEWAL: "bg-pink-500",
  GENERAL: "bg-gray-500",
};

export default async function CrmDashboardPage() {
  const stats = await getCrmStats();

  const metrics = [
    {
      title: "Total Contacts",
      value: stats.totalContacts,
      subtitle: `${stats.businessOwners} owners, ${stats.brokerContacts} brokers`,
      icon: Contact,
      color: "text-primary",
      bgColor: "bg-primary/10",
      href: "/crm/contacts",
    },
    {
      title: "Activities",
      value: stats.totalActivities,
      subtitle: "All time",
      icon: Activity,
      color: "text-info",
      bgColor: "bg-info/10",
      href: "/crm/activities",
    },
    {
      title: "Open Tasks",
      value: stats.pendingTasks,
      subtitle: `${stats.overdueTasks} overdue`,
      icon: ListTodo,
      color: stats.overdueTasks > 0 ? "text-destructive" : "text-warning",
      bgColor: stats.overdueTasks > 0 ? "bg-destructive/10" : "bg-warning/10",
      href: "/crm/tasks",
    },
    {
      title: "Emails Tracked",
      value: stats.totalEmails,
      subtitle: "All time",
      icon: Mail,
      color: "text-success",
      bgColor: "bg-success/10",
      href: "/crm/emails",
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <Header
        title="CRM"
        subtitle="Manage contacts, activities, tasks, and communication"
      />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric) => (
            <Link key={metric.title} href={metric.href}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {metric.title}
                      </p>
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {metric.value}
                      </p>
                      {metric.subtitle && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {metric.subtitle}
                        </p>
                      )}
                    </div>
                    <div className={`p-3 rounded-full ${metric.bgColor}`}>
                      <metric.icon className={`w-6 h-6 ${metric.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Today's Tasks & Overdue */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className={stats.overdueTasks > 0 ? "border-destructive/50" : ""}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overdue Tasks</p>
                  <p className="text-3xl font-bold text-foreground">{stats.overdueTasks}</p>
                </div>
                <AlertCircle className={`w-8 h-8 ${stats.overdueTasks > 0 ? "text-destructive" : "text-muted-foreground"}`} />
              </div>
              {stats.overdueTasks > 0 && (
                <Link
                  href="/crm/tasks?filter=overdue"
                  className="text-sm text-destructive hover:text-destructive/80 mt-4 inline-flex items-center"
                >
                  View overdue tasks
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </Link>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Due Today</p>
                  <p className="text-3xl font-bold text-foreground">{stats.todayTasks}</p>
                </div>
                <Clock className="w-8 h-8 text-warning" />
              </div>
              <Link
                href="/crm/tasks?filter=today"
                className="text-sm text-primary hover:text-primary/80 mt-4 inline-flex items-center"
              >
                View today&apos;s tasks
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Completed</p>
                  <p className="text-3xl font-bold text-foreground">
                    {stats.totalTasks - stats.pendingTasks}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                {stats.totalTasks > 0
                  ? `${Math.round(((stats.totalTasks - stats.pendingTasks) / stats.totalTasks) * 100)}% completion rate`
                  : "No tasks yet"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Upcoming Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
                <Link
                  href="/crm/activities"
                  className="text-sm text-primary hover:text-primary/80"
                >
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentActivities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p>No activities yet</p>
                    <p className="text-sm mt-1">Activities will appear here when logged</p>
                  </div>
                ) : (
                  stats.recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 bg-accent/50 rounded-lg"
                    >
                      <div className="p-2 bg-background rounded-full">
                        {activityTypeIcons[activity.type] || <Activity className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm">
                          {activity.type.replace(/_/g, " ")}
                        </p>
                        {activity.contact && (
                          <Link
                            href={`/crm/contacts/${activity.contact.id}`}
                            className="text-sm text-primary hover:text-primary/80"
                          >
                            {activity.contact.firstName} {activity.contact.lastName}
                          </Link>
                        )}
                        {activity.subject && (
                          <p className="text-sm text-muted-foreground truncate">
                            {activity.subject}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ListTodo className="w-5 h-5" />
                  Upcoming Tasks
                </CardTitle>
                <Link
                  href="/crm/tasks"
                  className="text-sm text-primary hover:text-primary/80"
                >
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.upcomingTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ListTodo className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p>No upcoming tasks</p>
                    <Link
                      href="/crm/tasks/new"
                      className="text-primary hover:text-primary/80 text-sm mt-2 inline-block"
                    >
                      Create your first task
                    </Link>
                  </div>
                ) : (
                  stats.upcomingTasks.map((task) => (
                    <Link
                      key={task.id}
                      href={`/crm/tasks/${task.id}`}
                      className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg hover:bg-accent transition-colors"
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          taskCategoryColors[task.category] || "bg-gray-500"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">
                          {task.title}
                        </p>
                        {task.contact && (
                          <p className="text-sm text-muted-foreground">
                            {task.contact.firstName} {task.contact.lastName}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {task.dueDate && new Date(task.dueDate).toLocaleDateString()}
                        </p>
                        <span className="text-xs px-2 py-0.5 rounded bg-muted">
                          {task.priority}
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Contacts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Recent Contacts
              </CardTitle>
              <Link
                href="/crm/contacts"
                className="text-sm text-primary hover:text-primary/80"
              >
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats.recentContacts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Contact className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <p>No contacts yet</p>
                <Link
                  href="/crm/contacts/new"
                  className="text-primary hover:text-primary/80 text-sm mt-2 inline-block"
                >
                  Add your first contact
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {stats.recentContacts.map((contact) => (
                  <Link
                    key={contact.id}
                    href={`/crm/contacts/${contact.id}`}
                    className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-primary">
                        {contact.firstName?.[0] || ""}
                        {contact.lastName?.[0] || ""}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">
                        {contact.firstName} {contact.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {contact.contactType.replace(/_/g, " ")}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/crm/contacts/new"
                className="flex flex-col items-center p-4 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
              >
                <UserPlus className="w-8 h-8 text-primary mb-2" />
                <span className="text-sm font-medium text-foreground">New Contact</span>
              </Link>
              <Link
                href="/crm/activities/new"
                className="flex flex-col items-center p-4 bg-info/10 rounded-lg hover:bg-info/20 transition-colors"
              >
                <Activity className="w-8 h-8 text-info mb-2" />
                <span className="text-sm font-medium text-foreground">Log Activity</span>
              </Link>
              <Link
                href="/crm/tasks/new"
                className="flex flex-col items-center p-4 bg-warning/10 rounded-lg hover:bg-warning/20 transition-colors"
              >
                <ListTodo className="w-8 h-8 text-warning mb-2" />
                <span className="text-sm font-medium text-foreground">Create Task</span>
              </Link>
              <Link
                href="/crm/emails/compose"
                className="flex flex-col items-center p-4 bg-success/10 rounded-lg hover:bg-success/20 transition-colors"
              >
                <Mail className="w-8 h-8 text-success mb-2" />
                <span className="text-sm font-medium text-foreground">Send Email</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
