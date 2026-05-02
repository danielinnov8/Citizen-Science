import * as React from "react";
import { Topbar } from "./Topbar";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col selection:bg-blue-100 selection:text-blue-900">
      <Topbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
