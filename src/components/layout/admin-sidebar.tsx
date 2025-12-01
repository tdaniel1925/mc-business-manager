"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Settings,
  Package,
  FileText,
  Shield,
  LogOut,
  ChevronLeft,
  Menu,
  UserCircle,
  Briefcase,
} from "lucide-react";
import { useSession } from "@/components/providers/session-provider";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Companies", href: "/admin/companies", icon: Building2 },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Accounts", href: "/admin/accounts", icon: Briefcase },
  { name: "Plans", href: "/admin/plans", icon: Package },
  { name: "Billing", href: "/admin/billing", icon: CreditCard },
  { name: "Invoices", href: "/admin/invoices", icon: FileText },
  { name: "Security", href: "/admin/security", icon: Shield },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

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
            <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-secondary-foreground" />
            </div>
            <span className="font-semibold">Admin Panel</span>
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
      </nav>

      {/* Back to App */}
      <div className="px-2 py-2 border-t border-sidebar-border">
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-3 px-3 py-2 text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground rounded-lg transition-colors",
            collapsed && "justify-center"
          )}
        >
          <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Back to App</span>}
        </Link>
      </div>

      {/* User section */}
      <div className="border-t border-sidebar-border p-4">
        <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
          <div className="w-8 h-8 bg-sidebar-hover rounded-full flex items-center justify-center flex-shrink-0">
            <UserCircle className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.email?.split("@")[0] || "Admin"}
              </p>
              <p className="text-xs text-sidebar-muted truncate">
                Platform Admin
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
