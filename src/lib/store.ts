import type { Role, User, Permission, ResourceGroup } from "@/types";

// ─── Full Permission Matrix ───────────────────────────────────────────────────

export const RESOURCE_GROUPS: ResourceGroup[] = [
  {
    resource: "projects",
    label: "Projects",
    permissions: [
      { id: "projects:view", resource: "projects", action: "view", label: "View" },
      { id: "projects:create", resource: "projects", action: "create", label: "Create" },
      { id: "projects:edit", resource: "projects", action: "edit", label: "Edit" },
      { id: "projects:delete", resource: "projects", action: "delete", label: "Delete" },
      { id: "projects:archive", resource: "projects", action: "archive", label: "Archive" },
    ],
  },
  {
    resource: "tasks",
    label: "Tasks",
    permissions: [
      { id: "tasks:view", resource: "tasks", action: "view", label: "View" },
      { id: "tasks:create", resource: "tasks", action: "create", label: "Create" },
      { id: "tasks:edit", resource: "tasks", action: "edit", label: "Edit" },
      { id: "tasks:delete", resource: "tasks", action: "delete", label: "Delete" },
      { id: "tasks:assign", resource: "tasks", action: "assign", label: "Assign" },
    ],
  },
  {
    resource: "members",
    label: "Members",
    permissions: [
      { id: "members:view", resource: "members", action: "view", label: "View" },
      { id: "members:invite", resource: "members", action: "invite", label: "Invite" },
      { id: "members:remove", resource: "members", action: "remove", label: "Remove" },
      { id: "members:update_role", resource: "members", action: "update_role", label: "Update Role" },
    ],
  },
  {
    resource: "billing",
    label: "Billing",
    permissions: [
      { id: "billing:view", resource: "billing", action: "view", label: "View" },
      { id: "billing:update", resource: "billing", action: "update", label: "Update" },
      { id: "billing:download_invoices", resource: "billing", action: "download_invoices", label: "Download Invoices" },
    ],
  },
  {
    resource: "settings",
    label: "Settings",
    permissions: [
      { id: "settings:view", resource: "settings", action: "view", label: "View" },
      { id: "settings:update", resource: "settings", action: "update", label: "Update" },
    ],
  },
];

export const ALL_PERMISSIONS: Permission[] = RESOURCE_GROUPS.flatMap(
  (g) => g.permissions
);

// ─── Seed Roles ───────────────────────────────────────────────────────────────

const now = new Date().toISOString();

export const seedRoles: Role[] = [
  {
    id: "role_owner",
    name: "Owner",
    description: "Full access to everything. Cannot be restricted.",
    permissions: ALL_PERMISSIONS.map((p) => p.id),
    isSystem: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "role_admin",
    name: "Admin",
    description: "Manage team members, projects, and settings. Cannot touch billing.",
    permissions: [
      "projects:view","projects:create","projects:edit","projects:delete","projects:archive",
      "tasks:view","tasks:create","tasks:edit","tasks:delete","tasks:assign",
      "members:view","members:invite","members:remove","members:update_role",
      "settings:view","settings:update",
    ],
    isSystem: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "role_member",
    name: "Member",
    description: "Create and edit projects and tasks. Cannot delete or manage members.",
    permissions: [
      "projects:view","projects:create","projects:edit",
      "tasks:view","tasks:create","tasks:edit","tasks:assign",
      "members:view",
    ],
    isSystem: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "role_viewer",
    name: "Viewer",
    description: "Read-only access to projects and tasks.",
    permissions: [
      "projects:view",
      "tasks:view",
      "members:view",
    ],
    isSystem: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "role_contractor",
    name: "Contractor",
    description: "External contractors who can view and work on tasks but cannot touch settings or members.",
    permissions: [
      "projects:view",
      "tasks:view","tasks:create","tasks:edit","tasks:assign",
    ],
    isSystem: false,
    createdAt: now,
    updatedAt: now,
  },
];

// ─── Seed Users ───────────────────────────────────────────────────────────────

export const seedUsers: User[] = [
  {
    id: "user_1",
    name: "Aria Patel",
    email: "aria@workbench.io",
    roleIds: ["role_owner"],
    createdAt: now,
  },
  {
    id: "user_2",
    name: "Marcus Chen",
    email: "marcus@workbench.io",
    roleIds: ["role_admin", "role_contractor"], // has 2 roles
    createdAt: now,
  },
  {
    id: "user_3",
    name: "Sofia Reyes",
    email: "sofia@workbench.io",
    roleIds: ["role_member"],
    createdAt: now,
  },
  {
    id: "user_4",
    name: "James Okafor",
    email: "james@workbench.io",
    roleIds: ["role_viewer"],
    createdAt: now,
  },
];

// ─── Mutable In-Memory Store ──────────────────────────────────────────────────

class Store {
  private roles: Map<string, Role>;
  private users: Map<string, User>;

  constructor() {
    this.roles = new Map(seedRoles.map((r) => [r.id, { ...r }]));
    this.users = new Map(seedUsers.map((u) => [u.id, { ...u }]));
  }

  // ── Roles ──
  getRoles(): Role[] {
    return Array.from(this.roles.values()).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  getRoleById(id: string): Role | undefined {
    return this.roles.get(id);
  }

  createRole(data: { name: string; description: string; permissions: string[] }): Role {
    const id = `role_${Date.now()}`;
    const ts = new Date().toISOString();
    const role: Role = {
      id,
      name: data.name.trim(),
      description: data.description.trim(),
      permissions: data.permissions,
      isSystem: false,
      createdAt: ts,
      updatedAt: ts,
    };
    this.roles.set(id, role);
    return role;
  }

  updateRole(
    id: string,
    data: Partial<{ name: string; description: string; permissions: string[] }>
  ): Role | null {
    const role = this.roles.get(id);
    if (!role) return null;
    const updated: Role = {
      ...role,
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(data.description !== undefined && { description: data.description.trim() }),
      ...(data.permissions !== undefined && { permissions: data.permissions }),
      updatedAt: new Date().toISOString(),
    };
    this.roles.set(id, updated);
    return updated;
  }

  deleteRole(id: string): boolean {
    const role = this.roles.get(id);
    if (!role || role.isSystem) return false;
    this.roles.delete(id);
    // unassign role from all users
    for (const [uid, user] of this.users) {
      if (user.roleIds.includes(id)) {
        this.users.set(uid, {
          ...user,
          roleIds: user.roleIds.filter((r) => r !== id),
        });
      }
    }
    return true;
  }

  // ── Users ──
  getUsers(): User[] {
    return Array.from(this.users.values()).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  assignRole(userId: string, roleId: string): User | null {
    const user = this.users.get(userId);
    if (!user) return null;
    if (!this.roles.has(roleId)) return null;
    if (user.roleIds.includes(roleId)) return user; // already assigned
    const updated: User = { ...user, roleIds: [...user.roleIds, roleId] };
    this.users.set(userId, updated);
    return updated;
  }

  unassignRole(userId: string, roleId: string): User | null {
    const user = this.users.get(userId);
    if (!user) return null;
    const updated: User = {
      ...user,
      roleIds: user.roleIds.filter((r) => r !== roleId),
    };
    this.users.set(userId, updated);
    return updated;
  }

  // ── Effective Permissions ──
  getEffectivePermissions(userId: string): string[] {
    const user = this.users.get(userId);
    if (!user) return [];
    const permSet = new Set<string>();
    for (const roleId of user.roleIds) {
      const role = this.roles.get(roleId);
      if (role) {
        role.permissions.forEach((p) => permSet.add(p));
      }
    }
    return Array.from(permSet);
  }
}

// Singleton instance shared across all API routes in the same server process
let globalStore: Store | undefined;

export function getStore(): Store {
  if (!globalStore) {
    globalStore = new Store();
  }
  return globalStore;
}
