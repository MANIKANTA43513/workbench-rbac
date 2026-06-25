import { NextResponse } from "next/server";
import { RESOURCE_GROUPS } from "@/lib/store";
import type { ApiResponse, ResourceGroup } from "@/types";

export async function GET(): Promise<NextResponse<ApiResponse<ResourceGroup[]>>> {
  return NextResponse.json({ success: true, data: RESOURCE_GROUPS });
}
