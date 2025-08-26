import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import Glass from "@/models/glass";

export async function POST(request: NextRequest) {
  try {
    await connect();
    
    const { glassId, usedArea } = await request.json();

    if (!glassId || !usedArea) {
      return NextResponse.json(
        { error: "Glass ID and used area are required" },
        { status: 400 }
      );
    }

    const glass = await Glass.findById(glassId);
    if (!glass) {
      return NextResponse.json(
        { error: "Glass not found" },
        { status: 404 }
      );
    }

    // Update used count and reduce stock
    glass.usedCount = (glass.usedCount || 0) + usedArea;
    glass.stock = Math.max(0, (glass.stock || 0) - usedArea);

    await glass.save();

    return NextResponse.json({
      success: true,
      glass: {
        id: glass._id,
        name: glass.name,
        usedCount: glass.usedCount,
        stock: glass.stock,
        remaining: glass.stock
      }
    });

  } catch (error) {
    console.error("Error updating glass usage:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}