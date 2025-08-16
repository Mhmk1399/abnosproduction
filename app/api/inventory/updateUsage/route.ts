import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Inventory from "@/models/inevntory";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { glassId, usedArea } = await request.json();

    const inventory = await Inventory.findOne({ glass: glassId });
    if (!inventory) {
      return NextResponse.json(
        { error: "Inventory not found for this glass" },
        { status: 404 }
      );
    }

    inventory.usedCount = (inventory.usedCount || 0) + usedArea;
    await inventory.save();

    return NextResponse.json({
      success: true,
      inventory: {
        id: inventory._id,
        name: inventory.name,
        count: inventory.count,
        usedCount: inventory.usedCount,
        availableStock: inventory.count - inventory.usedCount
      }
    });

  } catch (error) {
    console.error("Error updating inventory usage:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}