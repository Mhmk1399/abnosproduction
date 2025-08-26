import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import Inventory from "@/models/inevntory";

export async function GET(request: NextRequest) {
  try {
    await connect();
    
    const { searchParams } = new URL(request.url);
    const glassId = searchParams.get('glassId');
    
    if (glassId) {
      const inventory = await Inventory.findOne({ glass: glassId });
      if (!inventory) {
        return NextResponse.json(
          { error: "Inventory not found" },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        inventory: {
          id: inventory._id,
          name: inventory.name,
          count: inventory.count,
          usedCount: inventory.usedCount,
          availableStock: inventory.availableStock
        }
      });
    }
    
    const inventories = await Inventory.find({});
    return NextResponse.json({
      success: true,
      inventories: inventories.map(inv => ({
        id: inv._id,
        name: inv.name,
        count: inv.count,
        usedCount: inv.usedCount,
        availableStock: inv.availableStock
      }))
    });

  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}