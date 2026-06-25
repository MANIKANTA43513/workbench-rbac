"use client";

import { useEffect, useState } from "react";
import { Users, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/primitives";
import { UserCard } from "@/components/users/user-card";
import { UserCardSkeleton } from "@/components/ui/skeleton";
import { useUsersStore, useRolesStore, usePermissionsStore } from "@/store";
import { cn } from "@/lib/utils";

export default function UsersPage() {
  const { users, fetchUsers, loading } = useUsersStore();
  const { roles, fetchRoles } = useRolesStore();
  const { fetchPermissions } = usePermissionsStore();

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchPermissions();
  }, [fetchUsers, fetchRoles, fetchPermissions]);

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole =
      filterRole === "all"   ? true :
      filterRole === "none"  ? u.roleIds.length === 0 :
      u.roleIds.includes(filterRole);
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground/60 mb-1">
          Team access
        </p>
        <h1 className="text-2xl font-bold tracking-tight">Team members</h1>
        <p className="text-muted-foreground text-sm mt-1.5">
          Assign roles to team members. Expand any member to see their combined effective permissions.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="pl-9 w-60"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          {[
            { id: "all",  name: "All members" },
            { id: "none", name: "No role" },
            ...roles,
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setFilterRole(r.id)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium border transition-colors whitespace-nowrap",
                filterRole === r.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 bg-background"
              )}
            >
              {r.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading && users.length === 0 ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => <UserCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl">
          <Users className="h-10 w-10 text-muted-foreground/25 mx-auto mb-3" />
          <p className="font-semibold text-muted-foreground">
            {search || filterRole !== "all" ? "No members match your filters" : "No team members"}
          </p>
          {(search || filterRole !== "all") && (
            <button
              className="text-sm text-primary hover:underline mt-2"
              onClick={() => { setSearch(""); setFilterRole("all"); }}
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            {filtered.length === users.length
              ? `${users.length} member${users.length !== 1 ? "s" : ""}`
              : `Showing ${filtered.length} of ${users.length} members`
            }
          </p>
          {filtered.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}
