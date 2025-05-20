import connect from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";
import inventory from "@/models/inevntory";

export async function GET(request: NextRequest) {
  await connect();

  try {
    const inventories = await inventory.find({}).sort({ createdAt: -1 });
    return NextResponse.json(inventories, { status: 200 });
  } catch (error) {
    console.error("Error fetching inventories:", error);
    return NextResponse.json({ error: "Failed to fetch inventories" }, { status: 500 });
  }


}

