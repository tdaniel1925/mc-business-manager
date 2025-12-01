"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Pipeline", href: "/pipeline", icon: Briefcase },
  { name: "Deals", href: "/deals", icon: FileText },
  { name: "Merchants", href: "/merchants", icon: Building2 },
  { name: "Underwriting", href: "/underwriting", icon: ClipboardCheck },
  { name: "Collections", href: "/collections", icon: DollarSign },
  { name: "Brokers", href: "/brokers", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-gray-900 text-white transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="font-semibold">MCA System</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
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
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-gray-800 p-4">
        <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
            <UserCircle className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {session?.user?.name || "User"}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {session?.user?.role || "Guest"}
              </p>
            </div>
          )}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 mt-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors",
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
