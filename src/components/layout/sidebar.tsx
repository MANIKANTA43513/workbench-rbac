"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Shield, Users, ChevronRight } from "lucide-react";
import { useRolesStore, useUsersStore } from "@/store";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Overview",      href: "/dashboard", icon: LayoutDashboard, countKey: null },
  { label: "Roles",         href: "/roles",     icon: Shield,           countKey: "roles" as const },
  { label: "Team members",  href: "/users",     icon: Users,            countKey: "users" as const },
];

export function Sidebar() {
  const pathname = usePathname();
  const { roles } = useRolesStore();
  const { users } = useUsersStore();

  const counts: Record<string, number> = {
    roles: roles.length,
    users: users.length,
  };

  return (
    <aside className="w-56 shrink-0 border-r border-border bg-card flex flex-col h-screen sticky top-0 z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center shadow-sm shadow-primary/30">
            <Shield className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight text-foreground leading-tight">Workbench</p>
            <p className="text-[10px] text-muted-foreground leading-tight font-medium">RBAC Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-2 mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/60">
          Management
        </p>
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const count = item.countKey ? counts[item.countKey] : null;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors group relative",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span className="flex-1 leading-none">{item.label}</span>

              {/* Count badge */}
              {count !== null && count > 0 && (
                <span className={cn(
                  "text-[10px] font-semibold rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none",
                  active
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground group-hover:bg-accent-foreground/10"
                )}>
                  {count}
                </span>
              )}

              {active && (
                <ChevronRight className="h-3 w-3 text-primary/60 shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-border space-y-0.5">
        <p className="text-[11px] font-medium text-muted-foreground">SDE Intern Assignment</p>
        <p className="text-[10px] text-muted-foreground/60">Workbench RBAC v1.0</p>
      </div>
    </aside>
  );
}
