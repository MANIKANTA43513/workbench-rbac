// ─── Permission Types ────────────────────────────────────────────────────────

export type Resource = "projects" | "tasks" | "members" | "billing" | "settings";

export type ProjectAction = "view" | "create" | "edit" | "delete" | "archive";
export type TaskAction = "view" | "create" | "edit" | "delete" | "assign";
export type MemberAction = "view" | "invite" | "remove" | "update_role";
export type BillingAction = "view" | "update" | "download_invoices";
export type SettingsAction = "view" | "update";

export type Action =
  | ProjectAction
  | TaskAction
  | MemberAction
  | BillingAction
  | SettingsAction;

export interface Permission {
  id: string; // e.g. "projects:view"
  resource: Resource;
  action: Action;
  label: string; // human readable "View Projects"
}

export interface ResourceGroup {
  resource: Resource;
  label: string;
  permissions: Permission[];
}

// ─── Role Types ──────────────────────────────────────────────────────────────

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // permission ids
  isSystem: boolean; // system roles cannot be deleted
  createdAt: string;
  updatedAt: string;
}

export type CreateRolePayload = {
  name: string;
  description: string;
  permissions: string[];
};

export type UpdateRolePayload = Partial<CreateRolePayload>;

// ─── User Types ───────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  roleIds: string[]; // assigned role ids
  createdAt: string;
}

export type AssignRolePayload = {
  roleId: string;
};

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── Effective Permissions ─────────────────────────────────────────────────

export interface EffectivePermissions {
  userId: string;
  roleIds: string[];
  permissions: Permission[];
  permissionIds: string[];
}
