"use client";

import { useEffect } from "react";
import { ShieldCheck, Loader2, ShieldOff } from "lucide-react";
import { useUsersStore, usePermissionsStore } from "@/store";
import { groupPermissionsByResource } from "@/lib/utils";
import type { User } from "@/types";

const RESOURCE_STYLE: Record<string, { card: string; badge: string; label: string }> = {
  projects: {
    card:  "bg-violet-50  border-violet-100",
    badge: "bg-violet-100  text-violet-700  border-violet-200",
    label: "text-violet-600",
  },
  tasks: {
    card:  "bg-blue-50    border-blue-100",
    badge: "bg-blue-100    text-blue-700    border-blue-200",
    label: "text-blue-600",
  },
  members: {
    card:  "bg-emerald-50  border-emerald-100",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    label: "text-emerald-600",
  },
  billing: {
    card:  "bg-amber-50   border-amber-100",
    badge: "bg-amber-100   text-amber-700   border-amber-200",
    label: "text-amber-600",
  },
  settings: {
    card:  "bg-rose-50    border-rose-100",
    badge: "bg-rose-100    text-rose-700    border-rose-200",
    label: "text-rose-600",
  },
};

interface EffectivePermissionsCardProps {
  user: User;
}

export function EffectivePermissionsCard({ user }: EffectivePermissionsCardProps) {
  const { effectivePermissions, fetchEffectivePermissions } = useUsersStore();
  const { resourceGroups } = usePermissionsStore();
  const ep = effectivePermissions[user.id];

  // Re-fetch whenever roleIds change
  useEffect(() => {
    fetchEffectivePermissions(user.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id, user.roleIds.join(",")]);

  if (!ep) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-4">
        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
        <span className="text-sm">Computing permissions…</span>
      </div>
    );
  }

  const grouped = groupPermissionsByResource(ep.permissionIds, resourceGroups);

  if (grouped.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
        <ShieldOff className="h-8 w-8 text-muted-foreground/30" />
        <p className="text-sm font-medium text-muted-foreground">No permissions</p>
        <p className="text-xs text-muted-foreground/70">
          Assign at least one role to grant access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Summary line */}
      <div className="flex items-center gap-2 text-sm">
        <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
        <span className="text-muted-foreground">
          <span className="font-semibold text-foreground">{ep.permissionIds.length}</span> permissions
          {" "}via{" "}
          <span className="font-semibold text-foreground">{ep.roleIds.length}</span>{" "}
          {ep.roleIds.length === 1 ? "role" : "roles"}
          {ep.roleIds.length > 1 && (
            <span className="text-muted-foreground/70"> (union)</span>
          )}
        </span>
      </div>

      {/* Per-resource groups */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
        {grouped.map((group) => {
          const style = RESOURCE_STYLE[group.resource] ?? {
            card:  "bg-muted/30  border-border",
            badge: "bg-secondary text-secondary-foreground border-transparent",
            label: "text-muted-foreground",
          };
          return (
            <div
              key={group.resource}
              className={`rounded-lg border p-3 ${style.card}`}
            >
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${style.label}`}>
                {group.label}
              </p>
              <div className="flex flex-wrap gap-1">
                {group.permissions.map((perm) => (
                  <span
                    key={perm.id}
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${style.badge}`}
                  >
                    {perm.label}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
