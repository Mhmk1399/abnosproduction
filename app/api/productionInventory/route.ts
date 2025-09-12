import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import productionInventory from "@/models/productionInventory";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: NextRequest) {
  try {
    await connect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const inventory = await productionInventory.findById(id)
        .populate({
          path: "products",
          model: "Product",
        });
      if (!inventory) {
        return NextResponse.json({ error: "Inventory not found" }, { status: 404 });
      }
      return NextResponse.json(inventory);
    }

    // Get query parameters for pagination and filtering
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const name = searchParams.get('name');
    const location = searchParams.get('location');
    const code = searchParams.get('code');
    const shapeCode = searchParams.get('shapeCode');

    // Build filter object
    const filter: any = {};

    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (code) {
      filter.code = { $regex: code, $options: 'i' };
    }

    if (shapeCode) {
      filter.shapeCode = shapeCode;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalRecords = await productionInventory.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / limit);

    // Fetch inventories with pagination and filtering
    const inventories = await productionInventory.find(filter)
      .populate({
        path: "products",
        model: "Product",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);



    const response = {
      inventories,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords,
        recordsPerPage: limit,
      },
    };
    
    return NextResponse.json(response);
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
