"use client";

import { useEffect, useState } from "react";
import { Plus, Shield, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/primitives";
import { RoleCard } from "@/components/roles/role-card";
import { RoleFormDialog } from "@/components/roles/role-form-dialog";
import { RoleCardSkeleton } from "@/components/ui/skeleton";
import { useRolesStore, useUsersStore, usePermissionsStore } from "@/store";
import type { Role } from "@/types";

export default function RolesPage() {
  const { roles, fetchRoles, loading } = useRolesStore();
  const { users, fetchUsers } = useUsersStore();
  const { fetchPermissions } = usePermissionsStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchRoles();
    fetchUsers();
    fetchPermissions();
  }, [fetchRoles, fetchUsers, fetchPermissions]);

  const getUserCount = (roleId: string) =>
    users.filter((u) => u.roleIds.includes(roleId)).length;

  const filteredRoles = roles.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase())
  );

  const systemRoles = filteredRoles.filter((r) => r.isSystem);
  const customRoles  = filteredRoles.filter((r) => !r.isSystem);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground/60 mb-1">
            Access control
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Roles</h1>
          <p className="text-muted-foreground text-sm mt-1.5 max-w-lg">
            Build custom roles by combining permissions. System roles are built-in and protected.
          </p>
        </div>
        <Button onClick={() => { setEditingRole(null); setDialogOpen(true); }} className="shrink-0 mt-1">
          <Plus className="h-4 w-4" />
          New role
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search roles…"
          className="pl-9"
        />
      </div>

      {/* Loading skeletons */}
      {loading && roles.length === 0 ? (
        <div className="space-y-8">
          {[0, 1].map((s) => (
            <section key={s} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[0, 1, 2].map((i) => <RoleCardSkeleton key={i} />)}
              </div>
            </section>
          ))}
        </div>
      ) : filteredRoles.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl">
          <Shield className="h-10 w-10 text-muted-foreground/25 mx-auto mb-3" />
          <p className="font-semibold text-muted-foreground">
            {search ? "No roles match your search" : "No roles yet"}
          </p>
          {search ? (
            <button className="text-sm text-primary hover:underline mt-2" onClick={() => setSearch("")}>
              Clear search
            </button>
          ) : (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => { setEditingRole(null); setDialogOpen(true); }}
            >
              <Plus className="h-4 w-4" />
              Create your first role
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {systemRoles.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground/60 whitespace-nowrap">
                  System roles
                </h2>
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">{systemRoles.length}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {systemRoles.map((role) => (
                  <RoleCard key={role.id} role={role} userCount={getUserCount(role.id)} onEdit={(r) => { setEditingRole(r); setDialogOpen(true); }} />
                ))}
              </div>
            </section>
          )}

          {customRoles.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground/60 whitespace-nowrap">
                  Custom roles
                </h2>
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">{customRoles.length}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {customRoles.map((role) => (
                  <RoleCard key={role.id} role={role} userCount={getUserCount(role.id)} onEdit={(r) => { setEditingRole(r); setDialogOpen(true); }} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <RoleFormDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditingRole(null); }}
        editingRole={editingRole}
      />
    </div>
  );
}
