import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Permission, ResourceGroup } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getAvatarColor(name: string): string {
  const colors = [
    "bg-violet-500",
    "bg-blue-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-cyan-500",
    "bg-indigo-500",
    "bg-pink-500",
  ];
  const index =
    name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;
  return colors[index];
}

export function formatPermissionId(id: string): string {
  const [resource, action] = id.split(":");
  return `${capitalize(resource)}: ${capitalize(action?.replace(/_/g, " ") ?? "")}`;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function groupPermissionsByResource(
  permissionIds: string[],
  resourceGroups: ResourceGroup[]
): { resource: string; label: string; permissions: Permission[] }[] {
  const idSet = new Set(permissionIds);
  return resourceGroups
    .map((group) => ({
      resource: group.resource,
      label: group.label,
      permissions: group.permissions.filter((p) => idSet.has(p.id)),
    }))
    .filter((g) => g.permissions.length > 0);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}
