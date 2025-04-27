import { NextRequest, NextResponse } from "next/server";
import { initSocketServer } from "@/lib/socket";

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    // Initialize Socket.IO server
    initSocketServer(req as any, res as any);
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error initializing Socket.IO server:', error);
    return NextResponse.json(
      { error: 'Failed to initialize Socket.IO server' },
      { status: 500 }
    );
  }
}
