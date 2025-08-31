import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import WastedProduct from "@/models/wastedProduct";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const wastedProduct = new WastedProduct(body);
    await wastedProduct.save();
    
    return NextResponse.json(wastedProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create wasted product" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();
    
    const wastedProducts = await WastedProduct.find()
      .populate("reason")
      .populate("step")
      .populate("user");
    
    return NextResponse.json(wastedProducts);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch wasted products" },
      { status: 500 }
    );
  }
}