"use client";

import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Phone,
  Mail,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface TaskData {
  id: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  dueDate: string | null;
  contact: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

interface ActivityData {
  id: string;
  type: string;
  subject: string | null;
  scheduledAt: string | null;
  contact: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

const priorityColors: Record<string, string> = {
  LOW: "bg-gray-500",
  MEDIUM: "bg-yellow-500",
  HIGH: "bg-orange-500",
  URGENT: "bg-red-500",
};

const activityTypeIcons: Record<string, React.ReactNode> = {
  PHONE_CALL: <Phone className="w-3 h-3" />,
  MEETING: <Video className="w-3 h-3" />,
  EMAIL: <Mail className="w-3 h-3" />,
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"month" | "week">("month");

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const fetchData = async () => {
    try {
      const [tasksRes, activitiesRes] = await Promise.all([
        fetch("/api/crm/tasks"),
        fetch("/api/crm/activities"),
      ]);

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData);
      }

      if (activitiesRes.ok) {
        const activitiesData = await activitiesRes.json();
        setActivities(activitiesData);
      }
    } catch (error) {
      console.error("Failed to fetch calendar data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty slots for days before the first of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Add the days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];

    const dayTasks = tasks.filter((task) => {
      if (!task.dueDate) return false;
      return task.dueDate.split("T")[0] === dateStr;
    });

    const dayActivities = activities.filter((activity) => {
      if (!activity.scheduledAt) return false;
      return activity.scheduledAt.split("T")[0] === dateStr;
    });

    return { tasks: dayTasks, activities: dayActivities };
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Get upcoming events for the sidebar
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekFromNow = new Date(today);
  weekFromNow.setDate(weekFromNow.getDate() + 7);

  const upcomingTasks = tasks
    .filter((task) => {
      if (!task.dueDate || task.status === "COMPLETED") return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= today && dueDate <= weekFromNow;
    })
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  const upcomingActivities = activities
    .filter((activity) => {
      if (!activity.scheduledAt) return false;
      const scheduledAt = new Date(activity.scheduledAt);
      return scheduledAt >= today && scheduledAt <= weekFromNow;
    })
    .sort(
      (a, b) =>
        new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime()
    )
    .slice(0, 5);

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Calendar"
        subtitle="View tasks and scheduled activities"
        actions={
          <div className="flex items-center gap-2">
            <Link href="/crm/tasks/new">
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </Link>
            <Link href="/crm/activities/new">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Schedule Activity
              </Button>
            </Link>
          </div>
        }
      />

      <div className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {currentDate.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => navigateMonth(-1)}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentDate(new Date())}
                    >
                      Today
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => navigateMonth(1)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading calendar...
                  </div>
                ) : (
                  <div className="grid grid-cols-7 gap-1">
                    {/* Week day headers */}
                    {weekDays.map((day) => (
                      <div
                        key={day}
                        className="text-center text-sm font-medium text-muted-foreground py-2"
                      >
                        {day}
                      </div>
                    ))}

                    {/* Calendar days */}
                    {days.map((day, index) => {
                      if (!day) {
                        return <div key={`empty-${index}`} className="min-h-24" />;
                      }

                      const events = getEventsForDate(day);
                      const hasEvents =
                        events.tasks.length > 0 || events.activities.length > 0;

                      return (
                        <div
                          key={day.toISOString()}
                          className={`min-h-24 p-1 border rounded-lg ${
                            isToday(day)
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div
                            className={`text-sm font-medium mb-1 ${
                              isToday(day) ? "text-primary" : "text-foreground"
                            }`}
                          >
                            {day.getDate()}
                          </div>
                          <div className="space-y-1">
                            {events.tasks.slice(0, 2).map((task) => (
                              <Link
                                key={task.id}
                                href={`/crm/tasks/${task.id}`}
                                className={`block text-xs p-1 rounded truncate text-white ${
                                  priorityColors[task.priority] || "bg-gray-500"
                                }`}
                                title={task.title}
                              >
                                {task.title}
                              </Link>
                            ))}
                            {events.activities.slice(0, 2).map((activity) => (
                              <div
                                key={activity.id}
                                className="flex items-center gap-1 text-xs p-1 rounded bg-info/20 text-info truncate"
                                title={activity.subject || activity.type}
                              >
                                {activityTypeIcons[activity.type.split("_")[0]] || (
                                  <Clock className="w-3 h-3" />
                                )}
                                {activity.subject || activity.type.replace(/_/g, " ")}
                              </div>
                            ))}
                            {events.tasks.length + events.activities.length > 4 && (
                              <div className="text-xs text-muted-foreground">
                                +{events.tasks.length + events.activities.length - 4}{" "}
                                more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Events Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Upcoming Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingTasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No upcoming tasks
                  </p>
                ) : (
                  <div className="space-y-3">
                    {upcomingTasks.map((task) => (
                      <Link
                        key={task.id}
                        href={`/crm/tasks/${task.id}`}
                        className="flex items-start gap-2 p-2 rounded-lg hover:bg-accent transition-colors"
                      >
                        <div
                          className={`w-2 h-2 mt-2 rounded-full ${
                            priorityColors[task.priority] || "bg-gray-500"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>
                              {task.dueDate &&
                                new Date(task.dueDate).toLocaleDateString()}
                            </span>
                            {task.contact && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {task.contact.firstName}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Scheduled Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Scheduled Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingActivities.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No scheduled activities
                  </p>
                ) : (
                  <div className="space-y-3">
                    {upcomingActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-2 p-2 rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="p-1.5 rounded-full bg-info/20 text-info">
                          {activityTypeIcons[activity.type.split("_")[0]] || (
                            <Clock className="w-3 h-3" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {activity.subject ||
                              activity.type.replace(/_/g, " ")}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>
                              {activity.scheduledAt &&
                                new Date(activity.scheduledAt).toLocaleDateString()}
                            </span>
                            {activity.contact && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {activity.contact.firstName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
