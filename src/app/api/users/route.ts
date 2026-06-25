import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import type { ApiResponse, User } from "@/types";

export async function GET(): Promise<NextResponse<ApiResponse<User[]>>> {
  const store = getStore();
  return NextResponse.json({ success: true, data: store.getUsers() });
}
