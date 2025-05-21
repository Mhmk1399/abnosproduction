import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import productionInventory from "@/models/productionInventory";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  await connect();
  try {
    // Add await to resolve the promise and get the actual data
    const inventories = await productionInventory
      .find()
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(inventories, { status: 200 });
  } catch (error) {
    console.error("Error fetching inventories:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  await connect();
  try {
    const body = await request.json();
    const code = `${body.name}-${uuidv4().substring(0, 8)}`;
    const newInventory = new productionInventory({
      name: body.name,
      code: code,
      Capacity: body.Capacity,
      location: body.location,
      description: body.description,
    });
    await newInventory.save();
    return NextResponse.json(newInventory, { status: 201 });
  } catch (error) {
    console.error("Error creating inventory:", error);
    return NextResponse.json(
      { error: "Failed to create inventory" },
      { status: 500 }
    );
  }
}
