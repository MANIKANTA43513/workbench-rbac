import { NextRequest, NextResponse } from "next/server";
import { getStore, ALL_PERMISSIONS, RESOURCE_GROUPS } from "@/lib/store";
import type { ApiResponse, EffectivePermissions } from "@/types";

interface Params {
  params: { id: string };
}

export async function GET(
  _req: NextRequest,
  { params }: Params
): Promise<NextResponse<ApiResponse<EffectivePermissions>>> {
  const store = getStore();

  const user = store.getUserById(params.id);
  if (!user) {
    return NextResponse.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );
  }

  const permissionIds = store.getEffectivePermissions(params.id);
  const permIdSet = new Set(permissionIds);
  const permissions = ALL_PERMISSIONS.filter((p) => permIdSet.has(p.id));

  const result: EffectivePermissions = {
    userId: user.id,
    roleIds: user.roleIds,
    permissions,
    permissionIds,
  };

  return NextResponse.json({ success: true, data: result });
}
