import * as React from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Compass, Beaker, BookA, TrendingUp, User, Users, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { storage } from "@/lib/storage";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", public: false },
  { icon: Compass, label: "Categories", href: "/categories", public: false },
  { icon: Beaker, label: "Experiments", href: "/experiments", public: false },
  { icon: Users, label: "Directory", href: "/directory", public: true },
  { icon: BookA, label: "Notebook", href: "/notebook", public: false },
  { icon: TrendingUp, label: "Progress", href: "/progress", public: false },
  { icon: User, label: "Profile", href: "/profile", public: true },
];

export function Sidebar() {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();
  const [collapsed, setCollapsed] = React.useState(() => storage.getSidebarCollapsed());

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      storage.setSidebarCollapsed(next);
      return next;
    });
  };

  const navItems = isAuthenticated
    ? NAV_ITEMS
    : NAV_ITEMS.filter((item) => item.public);

  return (
    <TooltipProvider delayDuration={100}>
      <aside className={cn(
        "hidden lg:flex flex-col border-r border-[#E2E8F0] bg-white p-4 h-[calc(100vh-3.5rem)] sticky top-14 transition-[width] duration-200",
        collapsed ? "w-[72px]" : "w-64"
      )}>
        <div className="space-y-1 flex-1">
          {navItems.map((item) => {
            const isActive = location === item.href || (location.startsWith(item.href) && item.href !== "/");
            const link = (
              <Link key={item.href} href={item.href} className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                collapsed && "justify-center",
                isActive ? "bg-blue-50 text-blue-700" : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
              )}>
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && item.label}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            }
            return link;
          })}
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-colors",
                collapsed && "justify-center"
              )}
            >
              {collapsed ? (
                <PanelLeftOpen className="h-4 w-4 shrink-0" />
              ) : (
                <PanelLeftClose className="h-4 w-4 shrink-0" />
              )}
              {!collapsed && "Collapse"}
            </button>
          </TooltipTrigger>
          {collapsed && <TooltipContent side="right">Expand sidebar</TooltipContent>}
        </Tooltip>
      </aside>
    </TooltipProvider>
  );
}
