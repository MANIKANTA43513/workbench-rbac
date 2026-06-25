import { NextRequest, NextResponse } from "next/server";
import { getStore, ALL_PERMISSIONS } from "@/lib/store";
import type { ApiResponse, Role, UpdateRolePayload } from "@/types";

const VALID_PERMISSION_IDS = new Set(ALL_PERMISSIONS.map((p) => p.id));

interface Params {
  params: { id: string };
}

export async function GET(
  _req: NextRequest,
  { params }: Params
): Promise<NextResponse<ApiResponse<Role>>> {
  const store = getStore();
  const role = store.getRoleById(params.id);
  if (!role) {
    return NextResponse.json(
      { success: false, error: "Role not found" },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, data: role });
}

export async function PATCH(
  req: NextRequest,
  { params }: Params
): Promise<NextResponse<ApiResponse<Role>>> {
  const store = getStore();

  const role = store.getRoleById(params.id);
  if (!role) {
    return NextResponse.json(
      { success: false, error: "Role not found" },
      { status: 404 }
    );
  }

  // FIX 1: system roles are read-only
  if (role.isSystem) {
    return NextResponse.json(
      { success: false, error: "System roles cannot be modified" },
      { status: 403 }
    );
  }

  let body: UpdateRolePayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  // duplicate name check (excluding self)
  if (body.name) {
    const existing = store
      .getRoles()
      .find(
        (r) =>
          r.id !== params.id &&
          r.name.toLowerCase() === body.name!.trim().toLowerCase()
      );
    if (existing) {
      return NextResponse.json(
        { success: false, error: `A role named "${body.name.trim()}" already exists` },
        { status: 409 }
      );
    }
  }

  // FIX 2: validate permission IDs
  if (body.permissions !== undefined) {
    if (!Array.isArray(body.permissions)) {
      return NextResponse.json(
        { success: false, error: "permissions must be an array" },
        { status: 400 }
      );
    }
    // FIX 5 (PATCH path): block zero-permission roles
    if (body.permissions.length === 0) {
      return NextResponse.json(
        { success: false, error: "A role must have at least one permission" },
        { status: 400 }
      );
    }
    const invalid = body.permissions.filter((p) => !VALID_PERMISSION_IDS.has(p));
    if (invalid.length > 0) {
      return NextResponse.json(
        { success: false, error: `Unknown permission IDs: ${invalid.join(", ")}` },
        { status: 400 }
      );
    }
  }

  const updated = store.updateRole(params.id, body);
  if (!updated) {
    return NextResponse.json(
      { success: false, error: "Failed to update role" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: Params
): Promise<NextResponse<ApiResponse<{ id: string }>>> {
  const store = getStore();

  const role = store.getRoleById(params.id);
  if (!role) {
    return NextResponse.json(
      { success: false, error: "Role not found" },
      { status: 404 }
    );
  }

  if (role.isSystem) {
    return NextResponse.json(
      { success: false, error: "System roles cannot be deleted" },
      { status: 403 }
    );
  }

  const deleted = store.deleteRole(params.id);
  if (!deleted) {
    return NextResponse.json(
      { success: false, error: "Failed to delete role" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data: { id: params.id } });
}
