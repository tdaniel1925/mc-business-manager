"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  Briefcase,
  ClipboardCheck,
  DollarSign,
  Settings,
  Building2,
  UserCircle,
  LogOut,
  ChevronLeft,
  Menu,
  Megaphone,
  Phone,
  MessageSquare,
  Share2,
  Target,
  UserPlus,
  ChevronDown,
  ChevronRight,
  Contact,
  ListTodo,
  Activity,
  Mail,
  Calendar,
} from "lucide-react";
import { useSession } from "@/components/providers/session-provider";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Pipeline", href: "/pipeline", icon: Briefcase },
  { name: "Deals", href: "/deals", icon: FileText },
  { name: "Merchants", href: "/merchants", icon: Building2 },
  { name: "Underwriting", href: "/underwriting", icon: ClipboardCheck },
  { name: "Collections", href: "/collections", icon: DollarSign },
  { name: "Brokers", href: "/brokers", icon: Users },
];

const marketingNavigation = [
  { name: "Overview", href: "/marketing", icon: LayoutDashboard },
  { name: "Campaigns", href: "/marketing/campaigns", icon: Target },
  { name: "Voice Agents", href: "/marketing/voice", icon: Phone },
  { name: "Content", href: "/marketing/content", icon: MessageSquare },
  { name: "Social Media", href: "/marketing/social", icon: Share2 },
  { name: "Advertising", href: "/marketing/ads", icon: Megaphone },
  { name: "Leads", href: "/marketing/leads", icon: UserPlus },
];

const crmNavigation = [
  { name: "Overview", href: "/crm", icon: LayoutDashboard },
  { name: "Contacts", href: "/crm/contacts", icon: Contact },
  { name: "Activities", href: "/crm/activities", icon: Activity },
  { name: "Tasks", href: "/crm/tasks", icon: ListTodo },
  { name: "Emails", href: "/crm/emails", icon: Mail },
  { name: "Calendar", href: "/crm/calendar", icon: Calendar },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [marketingExpanded, setMarketingExpanded] = useState(
    pathname.startsWith("/marketing")
  );
  const [crmExpanded, setCrmExpanded] = useState(
    pathname.startsWith("/crm")
  );

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  const isMarketingActive = pathname.startsWith("/marketing");
  const isCrmActive = pathname.startsWith("/crm");

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-sidebar text-sidebar-foreground transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-semibold">MCA Manager</span>
              <p className="text-[10px] text-sidebar-muted -mt-0.5">by BotMakers</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 hover:bg-sidebar-hover rounded-lg transition-colors"
        >
          {collapsed ? (
            <Menu className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive
                  ? "bg-sidebar-active text-sidebar-active-foreground"
                  : "text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}

        {/* Marketing Section */}
        <div className="pt-2">
          <button
            onClick={() => !collapsed && setMarketingExpanded(!marketingExpanded)}
            className={cn(
              "flex items-center gap-3 px-3 py-2 w-full rounded-lg transition-colors",
              isMarketingActive
                ? "bg-sidebar-active/20 text-sidebar-foreground"
                : "text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground"
            )}
          >
            <Megaphone className="w-5 h-5 flex-shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">Marketing</span>
                {marketingExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </>
            )}
          </button>

          {!collapsed && marketingExpanded && (
            <div className="mt-1 ml-4 space-y-1">
              {marketingNavigation.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== "/marketing" && pathname.startsWith(`${item.href}/`));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm",
                      isActive
                        ? "bg-sidebar-active text-sidebar-active-foreground"
                        : "text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* CRM Section */}
        <div className="pt-2">
          <button
            onClick={() => !collapsed && setCrmExpanded(!crmExpanded)}
            className={cn(
              "flex items-center gap-3 px-3 py-2 w-full rounded-lg transition-colors",
              isCrmActive
                ? "bg-sidebar-active/20 text-sidebar-foreground"
                : "text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground"
            )}
          >
            <Contact className="w-5 h-5 flex-shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">CRM</span>
                {crmExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </>
            )}
          </button>

          {!collapsed && crmExpanded && (
            <div className="mt-1 ml-4 space-y-1">
              {crmNavigation.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== "/crm" && pathname.startsWith(`${item.href}/`));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm",
                      isActive
                        ? "bg-sidebar-active text-sidebar-active-foreground"
                        : "text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Settings at bottom */}
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
            pathname === "/settings" || pathname.startsWith("/settings/")
              ? "bg-sidebar-active text-sidebar-active-foreground"
              : "text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground"
          )}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>
      </nav>

      {/* User section */}
      <div className="border-t border-sidebar-border p-4">
        <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
          <div className="w-8 h-8 bg-sidebar-hover rounded-full flex items-center justify-center flex-shrink-0">
            <UserCircle className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.email?.split("@")[0] || "User"}
              </p>
              <p className="text-xs text-sidebar-muted truncate">
                {user?.email || "Guest"}
              </p>
            </div>
          )}
        </div>
        <button
          onClick={handleSignOut}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 mt-3 text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground rounded-lg transition-colors",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );
}
