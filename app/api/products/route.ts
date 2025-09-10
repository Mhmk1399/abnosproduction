import { NextResponse } from "next/server";
import connect from "@/lib/data";
import Product from "@/models/product";

export async function GET() {
  await connect();
  try {
    const products = await Product.find().select('name _id').lean();
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}