import connect from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";
import productionInventory from "@/models/productionInventory";

export async function GET(request: NextRequest) {
  await connect();

  const id = request.headers.get("id") || "";
  if (!id) {
    return NextResponse.json(
      { error: "Inventory ID is required" },
      { status: 400 }
    );
  }
  try {
    const inventory = await productionInventory.findById(id);
    if (inventory === null) {
      return NextResponse.json(
        { error: "Inventory not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(inventory, { status: 200 });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.headers.get("id") || "";
  if (!id) {
    return NextResponse.json(
      { error: "Inventory ID is required" },
      { status: 400 }
    );
  }
  await connect();
  try {
    const result = await productionInventory.findByIdAndDelete(id);
    if (!result) {
      return NextResponse.json(
        { error: "Inventory not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Inventory deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting inventory:", error);
    return NextResponse.json(
      { error: "Failed to delete inventory" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const id = request.headers.get("id") || "";
  console.log("Received ID:", id);
  console.log("All headers:", Object.fromEntries(request.headers.entries()));
  
  if (!id) {
    console.log("No ID provided in headers");
    return NextResponse.json(
      { error: "Inventory ID is required" },
      { status: 400 }
    );
  }
  await connect();
  try {
    const body = await request.json();
    console.log("Request body:", body);
    const result = await productionInventory.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!result) {
      return NextResponse.json(
        { error: "Inventory not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error updating inventory:", error);
    return NextResponse.json(
      { error: "Failed to update inventory" },
      { status: 500 }
    );
  }
}
