import React from "react";
import { Atom } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Topbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-2 font-semibold text-lg tracking-tight">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white">
            <Atom className="h-5 w-5" />
          </div>
          <span>Citizen Science</span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <a href="#" className="text-foreground transition-colors hover:text-foreground">Dashboard</a>
          <a href="#" className="transition-colors hover:text-foreground">Categories</a>
          <a href="#" className="transition-colors hover:text-foreground">Notebook</a>
          <a href="#" className="transition-colors hover:text-foreground">Progress</a>
        </nav>

        <div className="flex items-center gap-4">
          <Avatar className="h-8 w-8 cursor-pointer border border-border/50 transition-transform hover:scale-105">
            <AvatarImage src="" alt="Daniel" />
            <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-medium">DA</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}