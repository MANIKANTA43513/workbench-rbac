"use client";

import { useEffect } from "react";
import { Shield, Users, ShieldCheck, Lock, ArrowRight, TrendingUp } from "lucide-react";
import { useRolesStore, useUsersStore, usePermissionsStore } from "@/store";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Link from "next/link";

const RESOURCE_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  projects: { bg: "bg-violet-50",  text: "text-violet-700", border: "border-violet-200", dot: "bg-violet-400" },
  tasks:    { bg: "bg-blue-50",    text: "text-blue-700",   border: "border-blue-200",   dot: "bg-blue-400"   },
  members:  { bg: "bg-emerald-50", text: "text-emerald-700",border: "border-emerald-200",dot: "bg-emerald-400"},
  billing:  { bg: "bg-amber-50",   text: "text-amber-700",  border: "border-amber-200",  dot: "bg-amber-400"  },
  settings: { bg: "bg-rose-50",    text: "text-rose-700",   border: "border-rose-200",   dot: "bg-rose-400"   },
};

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex items-start gap-4 hover:shadow-sm transition-shadow">
      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
        <Icon className={cn("h-5 w-5", iconColor)} />
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight tabular-nums">{value}</p>
        <p className="text-sm font-medium text-foreground/80">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  href,
  linkLabel = "Manage →",
}: {
  title: string;
  href: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <Link href={href} className="text-xs text-primary hover:underline font-medium flex items-center gap-1">
        {linkLabel}
      </Link>
    </div>
  );
}

export default function DashboardPage() {
  const { roles, fetchRoles, loading: rolesLoading } = useRolesStore();
  const { users, fetchUsers, loading: usersLoading } = useUsersStore();
  const { resourceGroups, fetchPermissions } = usePermissionsStore();

  useEffect(() => {
    fetchRoles();
    fetchUsers();
    fetchPermissions();
  }, [fetchRoles, fetchUsers, fetchPermissions]);

  const totalPermissions = resourceGroups.reduce((acc, g) => acc + g.permissions.length, 0);
  const systemRoles = roles.filter((r) => r.isSystem).length;
  const customRoles = roles.filter((r) => !r.isSystem).length;
  const multiRoleUsers = users.filter((u) => u.roleIds.length > 1).length;

  const loading = rolesLoading || usersLoading;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Page header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Overview</p>
        <h1 className="text-2xl font-bold tracking-tight">Workbench RBAC</h1>
        <p className="text-muted-foreground text-sm mt-1.5">
          Manage roles, permissions, and team access from one place.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total roles"
          value={loading ? "—" : roles.length}
          sub={loading ? undefined : `${systemRoles} system · ${customRoles} custom`}
          icon={Shield}
          iconBg="bg-primary/10"
          iconColor="text-primary"
        />
        <StatCard
          label="Team members"
          value={loading ? "—" : users.length}
          sub={loading ? undefined : `${multiRoleUsers} with multiple roles`}
          icon={Users}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
        />
        <StatCard
          label="Permissions"
          value={loading ? "—" : totalPermissions}
          sub="Across 5 resources"
          icon={ShieldCheck}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          label="System roles"
          value={loading ? "—" : systemRoles}
          sub="Protected · cannot be deleted"
          icon={Lock}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
        />
      </div>

      {/* Two-column main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Roles list */}
        <div className="rounded-xl border border-border bg-card p-5">
          <SectionHeader title="Roles" href="/roles" />
          <div className="space-y-1">
            {roles.slice(0, 6).map((role) => {
              const count = users.filter((u) => u.roleIds.includes(role.id)).length;
              return (
                <div
                  key={role.id}
                  className="flex items-center gap-3 py-2.5 border-b border-border/60 last:border-0 group"
                >
                  <div className={cn(
                    "h-7 w-7 rounded-md flex items-center justify-center shrink-0",
                    role.isSystem ? "bg-amber-100" : "bg-primary/10"
                  )}>
                    {role.isSystem
                      ? <Lock className="h-3.5 w-3.5 text-amber-600" />
                      : <Shield className="h-3.5 w-3.5 text-primary" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight">{role.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {role.permissions.length} permissions · {count} {count === 1 ? "user" : "users"}
                    </p>
                  </div>
                  {role.isSystem && (
                    <span className="text-[10px] border border-amber-200 bg-amber-50 text-amber-700 rounded-full px-2 py-0.5 shrink-0">
                      System
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Users list */}
        <div className="rounded-xl border border-border bg-card p-5">
          <SectionHeader title="Team members" href="/users" />
          <div className="space-y-1">
            {users.map((user) => {
              const userRoles = roles.filter((r) => user.roleIds.includes(r.id));
              return (
                <div
                  key={user.id}
                  className="flex items-center gap-3 py-2.5 border-b border-border/60 last:border-0"
                >
                  <Avatar name={user.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate leading-tight">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <div className="flex gap-1 flex-wrap justify-end max-w-[160px]">
                    {userRoles.length === 0 ? (
                      <span className="text-[10px] text-muted-foreground italic">No roles</span>
                    ) : (
                      userRoles.map((role) => (
                        <span
                          key={role.id}
                          className="text-[10px] bg-primary/10 text-primary border border-primary/20 rounded-full px-2 py-0.5 font-medium whitespace-nowrap"
                        >
                          {role.name}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Permission resources breakdown */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-5">
          <h2 className="text-sm font-semibold">Permission resources</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {totalPermissions} total permissions across {resourceGroups.length} resources
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {resourceGroups.map((group) => {
            const style = RESOURCE_COLORS[group.resource] ?? {
              bg: "bg-muted/30", text: "text-foreground", border: "border-border", dot: "bg-muted-foreground"
            };
            return (
              <div
                key={group.resource}
                className={cn("rounded-lg border p-3.5", style.bg, style.border)}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
                  <p className={cn("text-xs font-bold uppercase tracking-wide", style.text)}>
                    {group.label}
                  </p>
                </div>
                <p className="text-2xl font-bold tracking-tight text-foreground">{group.permissions.length}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {group.permissions.map((p) => (
                    <span
                      key={p.id}
                      className={cn("text-[10px] rounded-full px-1.5 py-0.5 border font-medium", `${style.bg} ${style.text} ${style.border}`)}
                    >
                      {p.label}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
