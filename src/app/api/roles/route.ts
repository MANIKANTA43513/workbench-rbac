import { NextRequest, NextResponse } from "next/server";
import { getStore, ALL_PERMISSIONS } from "@/lib/store";
import type { ApiResponse, Role, CreateRolePayload } from "@/types";

const VALID_PERMISSION_IDS = new Set(ALL_PERMISSIONS.map((p) => p.id));

export async function GET(): Promise<NextResponse<ApiResponse<Role[]>>> {
  const store = getStore();
  return NextResponse.json({ success: true, data: store.getRoles() });
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<Role>>> {
  const store = getStore();

  let body: CreateRolePayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { name, description, permissions } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json(
      { success: false, error: "Role name is required" },
      { status: 400 }
    );
  }

  if (!Array.isArray(permissions)) {
    return NextResponse.json(
      { success: false, error: "permissions must be an array" },
      { status: 400 }
    );
  }

  // FIX 5: block zero-permission roles
  if (permissions.length === 0) {
    return NextResponse.json(
      { success: false, error: "A role must have at least one permission" },
      { status: 400 }
    );
  }

  // FIX 2: validate every submitted permission ID against the known list
  const invalid = permissions.filter((p) => !VALID_PERMISSION_IDS.has(p));
  if (invalid.length > 0) {
    return NextResponse.json(
      { success: false, error: `Unknown permission IDs: ${invalid.join(", ")}` },
      { status: 400 }
    );
  }

  // check duplicate name
  const existing = store.getRoles().find(
    (r) => r.name.toLowerCase() === name.trim().toLowerCase()
  );
  if (existing) {
    return NextResponse.json(
      { success: false, error: `A role named "${name.trim()}" already exists` },
      { status: 409 }
    );
  }

  const role = store.createRole({
    name,
    description: description ?? "",
    permissions,
  });

  return NextResponse.json({ success: true, data: role }, { status: 201 });
}
