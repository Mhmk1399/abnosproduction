import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import Inventory from "@/models/inevntory";

export async function POST(request: NextRequest) {
  try {
    await connect();
    
    const { glassId } = await request.json();
    console.log("Received request - glassId:", glassId);

    const inventory = await Inventory.findOne({ glass: glassId });
    console.log("Found inventory:", inventory);
    
    if (!inventory) {
      console.log("No inventory found for glassId:", glassId);
      return NextResponse.json(
        { error: "Inventory not found for this glass" },
        { status: 404 }
      );
    }

    const oldUsedCount = inventory.usedCount || 0;
    inventory.usedCount = oldUsedCount + 1;
    await inventory.save();
    
    console.log("Updated inventory - old usedCount:", oldUsedCount, "new usedCount:", inventory.usedCount);

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