"use client";

import { useState } from "react";
import { ChevronDown, Plus, X, ShieldCheck, Loader2, Shield } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { EffectivePermissionsCard } from "@/components/permissions/effective-permissions-card";
import { useUsersStore, useRolesStore, useToastStore } from "@/store";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

interface UserCardProps {
  user: User;
}

export function UserCard({ user }: UserCardProps) {
  const { roles } = useRolesStore();
  const { assignRole, unassignRole } = useUsersStore();
  const { addToast } = useToastStore();

  const [expanded, setExpanded] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  const assignedRoles = roles.filter((r) => user.roleIds.includes(r.id));
  const availableRoles = roles.filter((r) => !user.roleIds.includes(r.id));

  const handleAssign = async (roleId: string, roleName: string) => {
    setLoadingRole(roleId);
    try {
      await assignRole(user.id, roleId);
      addToast(`"${roleName}" assigned to ${user.name}`);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to assign role", "error");
    } finally {
      setLoadingRole(null);
      setAssignOpen(false);
    }
  };

  const handleUnassign = async (roleId: string, roleName: string) => {
    setLoadingRole(roleId);
    try {
      await unassignRole(user.id, roleId);
      addToast(`"${roleName}" removed from ${user.name}`);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to unassign role", "error");
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className={cn(
      "rounded-xl border bg-card overflow-hidden transition-all duration-200",
      expanded ? "border-primary/30 shadow-md shadow-primary/5" : "border-border hover:shadow-sm hover:border-border/60"
    )}>
      {/* Main row */}
      <div className="flex items-center gap-4 p-4">
        <Avatar name={user.name} size="md" />

        {/* Name + email */}
        <div className="flex-shrink-0 w-44 hidden sm:block">
          <p className="text-sm font-semibold leading-tight text-foreground">{user.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{user.email}</p>
        </div>

        {/* Mobile: name above roles */}
        <div className="sm:hidden flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight">{user.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>

        {/* Roles chips + assign button */}
        <div className="flex-1 hidden sm:flex items-center gap-1.5 flex-wrap min-w-0">
          {assignedRoles.length === 0 && (
            <span className="text-xs text-muted-foreground italic">No roles assigned</span>
          )}
          {assignedRoles.map((role) => (
            <span
              key={role.id}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 text-primary px-2.5 py-1 text-xs font-medium group/chip"
            >
              {role.name}
              <button
                onClick={() => handleUnassign(role.id, role.name)}
                disabled={loadingRole === role.id}
                className="rounded-full p-0.5 hover:bg-primary/20 transition-colors disabled:opacity-40"
                aria-label={`Remove ${role.name}`}
              >
                {loadingRole === role.id
                  ? <Loader2 className="h-2.5 w-2.5 animate-spin" />
                  : <X className="h-2.5 w-2.5" />
                }
              </button>
            </span>
          ))}

          {/* Assign role dropdown */}
          <div className="relative">
            <button
              onClick={() => setAssignOpen(!assignOpen)}
              onBlur={() => setTimeout(() => setAssignOpen(false), 160)}
              disabled={availableRoles.length === 0}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-border text-muted-foreground px-2.5 py-1 text-xs hover:border-primary hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="h-3 w-3" />
              Add role
            </button>

            {assignOpen && availableRoles.length > 0 && (
              <div className="absolute top-8 left-0 z-30 w-48 rounded-lg border border-border bg-popover shadow-xl py-1.5 animate-fade-in">
                <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Available roles
                </p>
                {availableRoles.map((role) => (
                  <button
                    key={role.id}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent transition-colors"
                    onClick={() => handleAssign(role.id, role.name)}
                    disabled={loadingRole === role.id}
                  >
                    <Shield className="h-3.5 w-3.5 text-primary" />
                    <span className="flex-1 text-left">{role.name}</span>
                    {loadingRole === role.id && <Loader2 className="h-3 w-3 animate-spin" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: permission count + expand toggle */}
        <div className="flex items-center gap-3 ml-auto shrink-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors",
              expanded
                ? "bg-primary/10 border-primary/20 text-primary"
                : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
            )}
            aria-label={expanded ? "Hide permissions" : "View permissions"}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Permissions</span>
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", expanded && "rotate-180")} />
          </button>
        </div>
      </div>

      {/* Mobile roles row */}
      <div className="sm:hidden px-4 pb-3 flex items-center gap-1.5 flex-wrap">
        {assignedRoles.length === 0 && (
          <span className="text-xs text-muted-foreground italic">No roles assigned</span>
        )}
        {assignedRoles.map((role) => (
          <span
            key={role.id}
            className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 text-primary px-2.5 py-1 text-xs font-medium"
          >
            {role.name}
            <button
              onClick={() => handleUnassign(role.id, role.name)}
              disabled={loadingRole === role.id}
              className="rounded-full p-0.5 hover:bg-primary/20 transition-colors"
              aria-label={`Remove ${role.name}`}
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </span>
        ))}
        <div className="relative">
          <button
            onClick={() => setAssignOpen(!assignOpen)}
            onBlur={() => setTimeout(() => setAssignOpen(false), 160)}
            disabled={availableRoles.length === 0}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-border text-muted-foreground px-2.5 py-1 text-xs hover:border-primary hover:text-primary transition-colors disabled:opacity-40"
          >
            <Plus className="h-3 w-3" />
            Add role
          </button>
          {assignOpen && availableRoles.length > 0 && (
            <div className="absolute top-8 left-0 z-30 w-48 rounded-lg border border-border bg-popover shadow-xl py-1.5 animate-fade-in">
              {availableRoles.map((role) => (
                <button
                  key={role.id}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent transition-colors"
                  onClick={() => handleAssign(role.id, role.name)}
                >
                  <Shield className="h-3.5 w-3.5 text-primary" />
                  {role.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Effective permissions expansion panel */}
      {expanded && (
        <div className="border-t border-border/60 bg-muted/20 px-5 py-4 animate-fade-in">
          <EffectivePermissionsCard user={user} />
        </div>
      )}
    </div>
  );
}
