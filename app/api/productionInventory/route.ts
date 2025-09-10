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
      .populate({
        path: "products",
        model: "Product",
      })
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
    console.log("Received body:", body);
    
    const code = body.code || `${uuidv4().substring(0, 8)}`;
    console.log("Generated code:", code);
    
    const inventoryData = {
      name: body.name,
      code: code,
      Capacity: body.Capacity,
      location: body.location,
      shapeCode: body.shapeCode,
      productwidth: body.productwidth ? Number(body.productwidth) : undefined,
      productheight: body.productheight ? Number(body.productheight) : undefined,
      productthikness: body.productthikness ? Number(body.productthikness) : undefined,
      products: body.products || [],
      description: body.description,
    };
    console.log("Inventory data to save:", inventoryData);
    
    const newInventory = new productionInventory(inventoryData);
    const savedInventory = await newInventory.save();
    console.log("Saved inventory:", savedInventory);
    
    return NextResponse.json(savedInventory, { status: 201 });
  } catch (error) {
    console.error("Error creating inventory:", error);
    return NextResponse.json(
      { error: "Failed to create inventory" },
      { status: 500 }
    );
  }
}
