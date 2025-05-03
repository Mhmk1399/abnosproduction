import { NextRequest, NextResponse } from "next/server";
import {
  recordProcessEvent,
  getProcessHistory,
} from "@/middlewares/processEvents";

export async function POST(request: NextRequest) {
  const id = (await request.headers.get("id")) || "";
  if (!id) {
    return NextResponse.json(
      { error: "Layer ID is required" },
      { status: 400 }
    );
  }
  return recordProcessEvent(request, id);
}

export async function GET(request: NextRequest) {
  const id = (await request.headers.get("id")) || "";
  if (!id) {
    return NextResponse.json(
      { error: "Layer ID is required" },
      { status: 400 }
    );
  }
  return getProcessHistory(id);
}
