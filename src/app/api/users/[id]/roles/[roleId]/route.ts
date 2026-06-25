import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import type { ApiResponse, User } from "@/types";

interface Params {
  params: { id: string; roleId: string };
}

export async function POST(
  _req: NextRequest,
  { params }: Params
): Promise<NextResponse<ApiResponse<User>>> {
  const store = getStore();

  const user = store.getUserById(params.id);
  if (!user) {
    return NextResponse.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );
  }

  const role = store.getRoleById(params.roleId);
  if (!role) {
    return NextResponse.json(
      { success: false, error: "Role not found" },
      { status: 404 }
    );
  }

  const updated = store.assignRole(params.id, params.roleId);
  if (!updated) {
    return NextResponse.json(
      { success: false, error: "Failed to assign role" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: Params
): Promise<NextResponse<ApiResponse<User>>> {
  const store = getStore();

  const user = store.getUserById(params.id);
  if (!user) {
    return NextResponse.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );
  }

  const updated = store.unassignRole(params.id, params.roleId);
  if (!updated) {
    return NextResponse.json(
      { success: false, error: "Failed to unassign role" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data: updated });
}
