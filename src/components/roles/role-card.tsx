"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, Lock, Users, ShieldCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRolesStore, useToastStore } from "@/store";
import { formatDate, cn } from "@/lib/utils";
import type { Role } from "@/types";

const RESOURCE_COLORS: Record<string, string> = {
  projects: "bg-violet-400",
  tasks:    "bg-blue-400",
  members:  "bg-emerald-400",
  billing:  "bg-amber-400",
  settings: "bg-rose-400",
};

function PermissionPips({ permissions }: { permissions: string[] }) {
  const byResource: Record<string, number> = {};
  for (const p of permissions) {
    const resource = p.split(":")[0];
    byResource[resource] = (byResource[resource] ?? 0) + 1;
  }
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {Object.entries(byResource).map(([resource, count]) => (
        <span
          key={resource}
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-white",
            RESOURCE_COLORS[resource] ?? "bg-muted-foreground"
          )}
        >
          {resource.charAt(0).toUpperCase() + resource.slice(1)} ·{count}
        </span>
      ))}
    </div>
  );
}

interface RoleCardProps {
  role: Role;
  userCount: number;
  onEdit: (role: Role) => void;
}

export function RoleCard({ role, userCount, onEdit }: RoleCardProps) {
  const { deleteRole } = useRolesStore();
  const { addToast } = useToastStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteRole(role.id);
      addToast(`Role "${role.name}" deleted`);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to delete role", "error");
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="group relative rounded-xl border border-border bg-card p-5 hover:shadow-md hover:border-border/60 transition-all duration-200 flex flex-col gap-3.5 overflow-hidden">
      {/* Subtle top accent bar */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity",
        role.isSystem ? "bg-gradient-to-r from-amber-400 to-orange-400" : "bg-gradient-to-r from-primary to-violet-400"
      )} />

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className={cn(
            "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
            role.isSystem ? "bg-amber-100" : "bg-primary/10"
          )}>
            {role.isSystem
              ? <Lock className="h-4 w-4 text-amber-600" />
              : <ShieldCheck className="h-4 w-4 text-primary" />
            }
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-sm text-foreground">{role.name}</h3>
              {role.isSystem && (
                <span className="text-[10px] border border-amber-200 bg-amber-50 text-amber-700 rounded-full px-2 py-0.5 font-medium">
                  System
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
              {role.description || <em className="opacity-60">No description</em>}
            </p>
          </div>
        </div>

        {/* Context menu */}
        <div className="relative shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setMenuOpen(!menuOpen)}
            onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
            aria-label="Role options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          {menuOpen && (
            <div className="absolute right-0 top-8 z-20 w-40 rounded-lg border border-border bg-popover shadow-xl py-1 animate-fade-in">
              <button
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent transition-colors"
                onClick={() => { setMenuOpen(false); onEdit(role); }}
              >
                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                {role.isSystem ? "View details" : "Edit role"}
              </button>
              {!role.isSystem && (
                <>
                  <div className="my-1 h-px bg-border mx-2" />
                  <button
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    onClick={() => { setMenuOpen(false); setConfirmDelete(true); }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete role
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Permission pills */}
      <div className="min-h-[28px]">
        {role.permissions.length > 0 ? (
          <PermissionPips permissions={role.permissions} />
        ) : (
          <span className="text-xs text-muted-foreground italic">No permissions</span>
        )}
      </div>

      {/* Footer stats */}
      <div className="flex items-center justify-between pt-1 border-t border-border/60 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            {role.permissions.length}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {userCount} {userCount === 1 ? "user" : "users"}
          </span>
        </div>
        <span className="text-[11px]">{formatDate(role.updatedAt)}</span>
      </div>

      {/* Inline delete confirmation overlay */}
      {confirmDelete && (
        <div className="absolute inset-0 rounded-xl bg-background/97 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 p-5 z-10 border border-destructive/20 animate-fade-in">
          <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold">Delete "{role.name}"?</p>
            <p className="text-xs text-muted-foreground mt-1">
              {userCount > 0
                ? `This role will be removed from ${userCount} ${userCount === 1 ? "user" : "users"}.`
                : "This action cannot be undone."}
            </p>
          </div>
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setConfirmDelete(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="flex-1"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
