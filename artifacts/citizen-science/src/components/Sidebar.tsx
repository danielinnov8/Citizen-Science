import * as React from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Compass, Beaker, BookA, TrendingUp, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Compass, label: "Categories", href: "/categories" },
  { icon: Beaker, label: "Experiments", href: "/experiments" },
  { icon: BookA, label: "Notebook", href: "/notebook" },
  { icon: TrendingUp, label: "Progress", href: "/progress" },
  { icon: User, label: "Profile", href: "/profile" },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-[#E2E8F0] bg-white p-4 h-[calc(100vh-3.5rem)] sticky top-14">
      <div className="space-y-1 flex-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href || (location.startsWith(item.href) && item.href !== "/");
          return (
            <Link key={item.href} href={item.href} className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive ? "bg-blue-50 text-blue-700" : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
            )}>
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
