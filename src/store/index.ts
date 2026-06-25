"use client";

import { create } from "zustand";
import type { Role, User, ResourceGroup, EffectivePermissions } from "@/types";

// ─── Permissions Store ────────────────────────────────────────────────────────

interface PermissionsState {
  resourceGroups: ResourceGroup[];
  loading: boolean;
  fetchPermissions: () => Promise<void>;
}

export const usePermissionsStore = create<PermissionsState>((set) => ({
  resourceGroups: [],
  loading: false,
  fetchPermissions: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/permissions");
      const json = await res.json();
      if (json.success) set({ resourceGroups: json.data });
    } finally {
      set({ loading: false });
    }
  },
}));

// ─── Roles Store ──────────────────────────────────────────────────────────────

interface RolesState {
  roles: Role[];
  loading: boolean;
  fetchRoles: () => Promise<void>;
  createRole: (data: {
    name: string;
    description: string;
    permissions: string[];
  }) => Promise<Role | null>;
  updateRole: (
    id: string,
    data: Partial<{ name: string; description: string; permissions: string[] }>
  ) => Promise<Role | null>;
  deleteRole: (id: string) => Promise<boolean>;
}

export const useRolesStore = create<RolesState>((set, get) => ({
  roles: [],
  loading: false,
  fetchRoles: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/roles");
      const json = await res.json();
      if (json.success) set({ roles: json.data });
    } finally {
      set({ loading: false });
    }
  },
  createRole: async (data) => {
    const res = await fetch("/api/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      set({ roles: [...get().roles, json.data] });
      return json.data;
    }
    throw new Error(json.error ?? "Failed to create role");
  },
  updateRole: async (id, data) => {
    const res = await fetch(`/api/roles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      set({
        roles: get().roles.map((r) => (r.id === id ? json.data : r)),
      });
      // FIX 4: any user holding this role now has stale effective permissions;
      // clear only those entries so the panel re-fetches on next expand
      const affectedUserIds = useUsersStore
        .getState()
        .users.filter((u) => u.roleIds.includes(id))
        .map((u) => u.id);
      if (affectedUserIds.length > 0) {
        useUsersStore.getState().clearEffectivePermissionsForUsers(affectedUserIds);
      }
      return json.data;
    }
    throw new Error(json.error ?? "Failed to update role");
  },
  deleteRole: async (id) => {
    const res = await fetch(`/api/roles/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      set({ roles: get().roles.filter((r) => r.id !== id) });
      // FIX 3: refresh users so removed roleId chips disappear immediately
      await useUsersStore.getState().fetchUsers();
      // FIX 4: wipe all effectivePermissions — the deleted role may have
      // contributed permissions to any user who held it
      useUsersStore.getState().clearEffectivePermissions();
      return true;
    }
    throw new Error(json.error ?? "Failed to delete role");
  },
}));

// ─── Users Store ──────────────────────────────────────────────────────────────

interface UsersState {
  users: User[];
  effectivePermissions: Record<string, EffectivePermissions>;
  loading: boolean;
  fetchUsers: () => Promise<void>;
  assignRole: (userId: string, roleId: string) => Promise<void>;
  unassignRole: (userId: string, roleId: string) => Promise<void>;
  fetchEffectivePermissions: (userId: string) => Promise<void>;
  clearEffectivePermissions: () => void;
  clearEffectivePermissionsForUsers: (userIds: string[]) => void;
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  effectivePermissions: {},
  loading: false,
  fetchUsers: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/users");
      const json = await res.json();
      if (json.success) set({ users: json.data });
    } finally {
      set({ loading: false });
    }
  },
  assignRole: async (userId, roleId) => {
    const res = await fetch(`/api/users/${userId}/roles/${roleId}`, {
      method: "POST",
    });
    const json = await res.json();
    if (json.success) {
      set({
        users: get().users.map((u) => (u.id === userId ? json.data : u)),
      });
    } else {
      throw new Error(json.error ?? "Failed to assign role");
    }
  },
  unassignRole: async (userId, roleId) => {
    const res = await fetch(`/api/users/${userId}/roles/${roleId}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (json.success) {
      set({
        users: get().users.map((u) => (u.id === userId ? json.data : u)),
      });
    } else {
      throw new Error(json.error ?? "Failed to unassign role");
    }
  },
  fetchEffectivePermissions: async (userId) => {
    const res = await fetch(`/api/users/${userId}/permissions`);
    const json = await res.json();
    if (json.success) {
      set({
        effectivePermissions: {
          ...get().effectivePermissions,
          [userId]: json.data,
        },
      });
    }
  },
  // FIX 3 + 4: clear the full cache (used after role deletion)
  clearEffectivePermissions: () => {
    set({ effectivePermissions: {} });
  },
  // FIX 4: clear only specific users' cache entries (used after role update)
  clearEffectivePermissionsForUsers: (userIds: string[]) => {
    const next = { ...get().effectivePermissions };
    for (const id of userIds) {
      delete next[id];
    }
    set({ effectivePermissions: next });
  },
}));

// ─── Toast Store ──────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastState {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  addToast: (message, type = "success") => {
    const id = `toast_${Date.now()}`;
    set({ toasts: [...get().toasts, { id, message, type }] });
    setTimeout(() => {
      set({ toasts: get().toasts.filter((t) => t.id !== id) });
    }, 3500);
  },
  removeToast: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },
}));
