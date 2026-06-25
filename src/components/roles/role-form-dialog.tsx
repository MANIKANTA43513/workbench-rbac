"use client";

import { useState, useEffect } from "react";
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Input,
  Textarea,
  Label,
  Separator,
} from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { PermissionMatrix } from "@/components/permissions/permission-matrix";
import { useRolesStore, usePermissionsStore, useToastStore } from "@/store";
import type { Role } from "@/types";

interface RoleFormDialogProps {
  open: boolean;
  onClose: () => void;
  editingRole?: Role | null;
}

export function RoleFormDialog({ open, onClose, editingRole }: RoleFormDialogProps) {
  const { createRole, updateRole } = useRolesStore();
  const { resourceGroups } = usePermissionsStore();
  const { addToast } = useToastStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState("");

  const isEditing = !!editingRole;
  const isSystemRole = editingRole?.isSystem ?? false;
  const totalPermissions = resourceGroups.reduce((a, g) => a + g.permissions.length, 0);

  useEffect(() => {
    if (open) {
      setName(editingRole?.name ?? "");
      setDescription(editingRole?.description ?? "");
      setSelected(new Set(editingRole?.permissions ?? []));
      setNameError("");
    }
  }, [open, editingRole]);

  const handlePermissionChange = (permId: string, checked: boolean) => {
    if (isSystemRole) return;
    setSelected((prev) => {
      const next = new Set(prev);
      checked ? next.add(permId) : next.delete(permId);
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelected(new Set(resourceGroups.flatMap((g) => g.permissions.map((p) => p.id))));
  };

  const handleClearAll = () => setSelected(new Set());

  const validate = (): boolean => {
    if (!name.trim()) {
      setNameError("Role name is required");
      return false;
    }
    if (name.trim().length < 2) {
      setNameError("Name must be at least 2 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (isEditing && editingRole) {
        await updateRole(editingRole.id, {
          name,
          description,
          permissions: Array.from(selected),
        });
        addToast(`"${name.trim()}" updated`);
      } else {
        await createRole({ name, description, permissions: Array.from(selected) });
        addToast(`Role "${name.trim()}" created`);
      }
      onClose();
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Something went wrong", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            {isEditing ? `Edit "${editingRole?.name}"` : "Create a new role"}
          </DialogTitle>
          <DialogDescription>
            {isSystemRole
              ? "System roles are read-only and cannot be modified."
              : isEditing
              ? "Update this role's details and adjust which permissions it grants."
              : "Give the role a name, then pick exactly which permissions it grants."}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* System role banner */}
          {isSystemRole && (
            <div className="flex items-start gap-3 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                System roles are built-in and protected. You can view their permissions but cannot change them.
              </p>
            </div>
          )}

          {/* Name + Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="role-name">
                Role name{" "}
                {!isSystemRole && <span className="text-destructive">*</span>}
              </Label>
              <Input
                id="role-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError("");
                }}
                placeholder="e.g. Contractor, Auditor, Designer…"
                disabled={isSystemRole}
                className={nameError ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {nameError && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {nameError}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role-desc">Description</Label>
              <Input
                id="role-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What can this role do?"
                disabled={isSystemRole}
              />
            </div>
          </div>

          <Separator />

          {/* Permission matrix */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-sm font-semibold">Permission matrix</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isSystemRole ? (
                    <>Viewing {selected.size} of {totalPermissions} permissions</>
                  ) : (
                    <>
                      <span className="font-semibold text-foreground">{selected.size}</span> of{" "}
                      {totalPermissions} permissions selected — click a row's{" "}
                      <span className="font-medium">All</span> checkbox to toggle a whole resource
                    </>
                  )}
                </p>
              </div>
              {!isSystemRole && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAll}
                    type="button"
                    disabled={selected.size === 0}
                  >
                    Clear all
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    type="button"
                    disabled={selected.size === totalPermissions}
                  >
                    Select all
                  </Button>
                </div>
              )}
            </div>

            <PermissionMatrix
              resourceGroups={resourceGroups}
              selected={selected}
              onChange={handlePermissionChange}
              readOnly={isSystemRole}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            {isSystemRole ? "Close" : "Cancel"}
          </Button>
          {!isSystemRole && (
            <Button onClick={handleSubmit} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Saving…" : isEditing ? "Save changes" : "Create role"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
