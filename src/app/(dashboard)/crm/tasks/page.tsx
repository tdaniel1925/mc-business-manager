"use client";

import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ListTodo,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface TaskData {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  category: string;
  dueDate: string | null;
  createdAt: string;
  contact: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  deal: {
    id: string;
    merchant: {
      legalName: string;
    } | null;
  } | null;
  assignedTo: {
    email: string;
  } | null;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-warning/20 text-warning",
  IN_PROGRESS: "bg-info/20 text-info",
  COMPLETED: "bg-success/20 text-success",
  CANCELLED: "bg-muted text-muted-foreground",
};

const priorityColors: Record<string, string> = {
  LOW: "bg-gray-500/20 text-gray-500",
  MEDIUM: "bg-yellow-500/20 text-yellow-500",
  HIGH: "bg-orange-500/20 text-orange-500",
  URGENT: "bg-red-500/20 text-red-500",
};

const categoryColors: Record<string, string> = {
  FOLLOW_UP_CALL: "border-l-blue-500",
  DOCUMENT_REQUEST: "border-l-orange-500",
  DOCUMENT_REVIEW: "border-l-yellow-500",
  CREDIT_REVIEW: "border-l-purple-500",
  UNDERWRITING: "border-l-indigo-500",
  APPROVAL_REVIEW: "border-l-green-500",
  CONTRACT_PREPARATION: "border-l-teal-500",
  CONTRACT_FOLLOW_UP: "border-l-cyan-500",
  FUNDING: "border-l-emerald-500",
  COLLECTION: "border-l-red-500",
  RENEWAL: "border-l-pink-500",
  GENERAL: "border-l-gray-500",
};

export default function TasksPage() {
  const searchParams = useSearchParams();
  const filterParam = searchParams.get("filter");

  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(
    filterParam === "overdue" ? "overdue" : filterParam === "today" ? "today" : "all"
  );

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/crm/tasks");
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const response = await fetch(`/api/crm/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      search === "" ||
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description?.toLowerCase().includes(search.toLowerCase()) ||
      `${task.contact?.firstName} ${task.contact?.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase());

    if (statusFilter === "all") return matchesSearch;
    if (statusFilter === "overdue") {
      const dueDate = task.dueDate ? new Date(task.dueDate) : null;
      return (
        matchesSearch &&
        dueDate &&
        dueDate < today &&
        task.status !== "COMPLETED" &&
        task.status !== "CANCELLED"
      );
    }
    if (statusFilter === "today") {
      const dueDate = task.dueDate ? new Date(task.dueDate) : null;
      if (!dueDate) return false;
      dueDate.setHours(0, 0, 0, 0);
      return matchesSearch && dueDate.getTime() === today.getTime();
    }
    return matchesSearch && task.status === statusFilter;
  });

  const overdueCount = tasks.filter((task) => {
    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
    return (
      dueDate &&
      dueDate < today &&
      task.status !== "COMPLETED" &&
      task.status !== "CANCELLED"
    );
  }).length;

  const todayCount = tasks.filter((task) => {
    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
    if (!dueDate) return false;
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime();
  }).length;

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Tasks"
        subtitle="Manage CRM tasks and follow-ups"
        actions={
          <Link href="/crm/tasks/new">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Task
            </Button>
          </Link>
        }
      />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Task Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            {
              label: "Total",
              count: tasks.length,
              icon: ListTodo,
              color: "text-foreground",
              filter: "all",
            },
            {
              label: "Pending",
              count: tasks.filter((t) => t.status === "PENDING").length,
              icon: Clock,
              color: "text-warning",
              filter: "PENDING",
            },
            {
              label: "In Progress",
              count: tasks.filter((t) => t.status === "IN_PROGRESS").length,
              icon: ListTodo,
              color: "text-info",
              filter: "IN_PROGRESS",
            },
            {
              label: "Overdue",
              count: overdueCount,
              icon: AlertCircle,
              color: "text-destructive",
              filter: "overdue",
            },
            {
              label: "Completed",
              count: tasks.filter((t) => t.status === "COMPLETED").length,
              icon: CheckCircle,
              color: "text-success",
              filter: "COMPLETED",
            },
          ].map((stat) => (
            <Card
              key={stat.label}
              className={`cursor-pointer transition-colors ${
                statusFilter === stat.filter ? "border-primary" : ""
              }`}
              onClick={() => setStatusFilter(stat.filter)}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
                  </div>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10 px-3 rounded-md border bg-background text-sm"
                >
                  <option value="all">All Tasks</option>
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="overdue">Overdue</option>
                  <option value="today">Due Today</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListTodo className="w-5 h-5" />
              Tasks ({filteredTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading tasks...
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ListTodo className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                {tasks.length === 0 ? (
                  <>
                    <p>No tasks yet</p>
                    <Link
                      href="/crm/tasks/new"
                      className="text-primary hover:text-primary/80 text-sm mt-2 inline-block"
                    >
                      Create your first task
                    </Link>
                  </>
                ) : (
                  <p>No tasks match your filters</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => {
                  const isOverdue =
                    task.dueDate &&
                    new Date(task.dueDate) < today &&
                    task.status !== "COMPLETED" &&
                    task.status !== "CANCELLED";

                  return (
                    <div
                      key={task.id}
                      className={`flex items-start gap-4 p-4 bg-accent/50 rounded-lg border-l-4 ${
                        categoryColors[task.category] || "border-l-gray-500"
                      } ${isOverdue ? "bg-destructive/5" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={task.status === "COMPLETED"}
                        onChange={() =>
                          updateTaskStatus(
                            task.id,
                            task.status === "COMPLETED" ? "PENDING" : "COMPLETED"
                          )
                        }
                        className="w-5 h-5 mt-1 rounded border-muted cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <Link
                              href={`/crm/tasks/${task.id}`}
                              className={`font-medium hover:text-primary ${
                                task.status === "COMPLETED"
                                  ? "line-through text-muted-foreground"
                                  : ""
                              }`}
                            >
                              {task.title}
                            </Link>
                            {task.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${
                                priorityColors[task.priority]
                              }`}
                            >
                              {task.priority}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${
                                statusColors[task.status]
                              }`}
                            >
                              {task.status.replace(/_/g, " ")}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                          {task.contact && (
                            <Link
                              href={`/crm/contacts/${task.contact.id}`}
                              className="flex items-center gap-1 hover:text-primary"
                            >
                              <User className="w-3 h-3" />
                              {task.contact.firstName} {task.contact.lastName}
                            </Link>
                          )}
                          {task.dueDate && (
                            <span
                              className={`flex items-center gap-1 ${
                                isOverdue ? "text-destructive" : ""
                              }`}
                            >
                              <Calendar className="w-3 h-3" />
                              {new Date(task.dueDate).toLocaleDateString()}
                              {isOverdue && " (Overdue)"}
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded bg-muted text-xs">
                            {task.category.replace(/_/g, " ")}
                          </span>
                          {task.assignedTo && (
                            <span>Assigned to {task.assignedTo.email?.split("@")[0]}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
