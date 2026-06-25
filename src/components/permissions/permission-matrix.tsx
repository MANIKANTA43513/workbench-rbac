"use client";

import { Checkbox } from "@/components/ui/primitives";
import type { ResourceGroup } from "@/types";
import { cn } from "@/lib/utils";

interface PermissionMatrixProps {
  resourceGroups: ResourceGroup[];
  selected: Set<string>;
  onChange: (permId: string, checked: boolean) => void;
  readOnly?: boolean;
}

// All possible actions in display order — some resources won't have all of them
const ACTION_COLUMNS = [
  { key: "view",              label: "View" },
  { key: "create",            label: "Create" },
  { key: "edit",              label: "Edit" },
  { key: "delete",            label: "Delete" },
  { key: "archive",           label: "Archive" },
  { key: "assign",            label: "Assign" },
  { key: "invite",            label: "Invite" },
  { key: "remove",            label: "Remove" },
  { key: "update_role",       label: "Update Role" },
  { key: "update",            label: "Update" },
  { key: "download_invoices", label: "Download Invoices" },
] as const;

const RESOURCE_ACCENT: Record<string, { row: string; badge: string; dot: string }> = {
  projects: { row: "hover:bg-violet-50/60",  badge: "bg-violet-100 text-violet-700", dot: "bg-violet-400" },
  tasks:    { row: "hover:bg-blue-50/60",    badge: "bg-blue-100 text-blue-700",     dot: "bg-blue-400"   },
  members:  { row: "hover:bg-emerald-50/60", badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-400" },
  billing:  { row: "hover:bg-amber-50/60",   badge: "bg-amber-100 text-amber-700",   dot: "bg-amber-400"  },
  settings: { row: "hover:bg-rose-50/60",    badge: "bg-rose-100 text-rose-700",     dot: "bg-rose-400"   },
};

export function PermissionMatrix({
  resourceGroups,
  selected,
  onChange,
  readOnly = false,
}: PermissionMatrixProps) {
  const handleResourceToggle = (group: ResourceGroup) => {
    if (readOnly) return;
    const allSelected = group.permissions.every((p) => selected.has(p.id));
    group.permissions.forEach((p) => onChange(p.id, !allSelected));
  };

  // Only show columns that are actually used by at least one resource
  const usedActionKeys = new Set(
    resourceGroups.flatMap((g) => g.permissions.map((p) => p.action as string))
  );
  const visibleColumns = ACTION_COLUMNS.filter((c) => usedActionKeys.has(c.key));

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          {/* Column headers — actions */}
          <thead>
            <tr className="bg-muted/40 border-b border-border">
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-40 sticky left-0 bg-muted/40">
                Resource
              </th>
              <th className="px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center w-16">
                All
              </th>
              {visibleColumns.map((col) => (
                <th
                  key={col.key}
                  className="px-3 py-3 text-xs font-medium text-muted-foreground text-center whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* One row per resource */}
          <tbody className="divide-y divide-border">
            {resourceGroups.map((group, idx) => {
              const accent = RESOURCE_ACCENT[group.resource] ?? {
                row: "hover:bg-muted/30",
                badge: "bg-secondary text-secondary-foreground",
                dot: "bg-muted-foreground",
              };
              const allSelected = group.permissions.every((p) => selected.has(p.id));
              const someSelected = group.permissions.some((p) => selected.has(p.id));

              return (
                <tr
                  key={group.resource}
                  className={cn(
                    "transition-colors",
                    accent.row,
                    idx % 2 === 0 ? "bg-background" : "bg-muted/10"
                  )}
                >
                  {/* Resource label */}
                  <td className="px-5 py-3.5 sticky left-0 bg-inherit">
                    <div className="flex items-center gap-2.5">
                      <span className={cn("h-2 w-2 rounded-full shrink-0", accent.dot)} />
                      <span className="font-semibold text-sm text-foreground">
                        {group.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 ml-4.5 pl-0.5">
                      {group.permissions.length} action{group.permissions.length !== 1 ? "s" : ""}
                    </p>
                  </td>

                  {/* Toggle-all checkbox */}
                  <td className="px-3 py-3.5 text-center">
                    <div className="flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleResourceToggle(group)}
                        disabled={readOnly}
                        className={cn(
                          "h-4 w-4 rounded border transition-colors flex items-center justify-center",
                          allSelected
                            ? "bg-primary border-primary text-primary-foreground"
                            : someSelected
                            ? "bg-primary/30 border-primary/50"
                            : "border-input bg-background",
                          !readOnly && "hover:border-primary cursor-pointer",
                          readOnly && "cursor-default opacity-60"
                        )}
                        aria-label={`Toggle all ${group.label} permissions`}
                        title={readOnly ? undefined : `Toggle all ${group.label}`}
                      >
                        {allSelected && (
                          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="1.5,6 4.5,9 10.5,3" />
                          </svg>
                        )}
                        {someSelected && !allSelected && (
                          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="currentColor">
                            <rect x="2" y="5" width="8" height="2" rx="1" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Per-action checkboxes */}
                  {visibleColumns.map((col) => {
                    const perm = group.permissions.find((p) => p.action === col.key);
                    return (
                      <td key={col.key} className="px-3 py-3.5 text-center">
                        {perm ? (
                          <div className="flex items-center justify-center">
                            <Checkbox
                              checked={selected.has(perm.id)}
                              onCheckedChange={(checked) =>
                                onChange(perm.id, checked === true)
                              }
                              disabled={readOnly}
                              aria-label={`${group.label}: ${perm.label}`}
                            />
                          </div>
                        ) : (
                          <span className="text-muted-foreground/25 text-xs select-none">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
