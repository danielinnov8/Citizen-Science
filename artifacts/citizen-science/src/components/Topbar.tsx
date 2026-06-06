import * as React from "react";
import { Link } from "wouter";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/Logo";

export function Topbar() {
  const { isAuthenticated, user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E2E8F0] bg-white/80 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-5">
        <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center">
          <Logo variant="full" />
        </Link>

        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            <Link href="/profile">
              <Avatar className="h-8 w-8 cursor-pointer border border-[#E2E8F0] transition-transform hover:scale-105">
                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-bold">
                  {user?.initials || "U"}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        ) : (
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#64748B]">
            <Link href="/categories" className="transition-colors hover:text-[#0F172A]">Categories</Link>
            <Link href="/login" className="transition-colors hover:text-[#0F172A]">Sign in</Link>
          </nav>
        )}
      </div>
    </header>
  );
}
