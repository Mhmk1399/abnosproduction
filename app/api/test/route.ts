import connect from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";
import  {findProductLayerRelationships}  from "@/middlewares/findProductLayerRelationships";

// GET a specific product layer

export async function GET(
  request: NextRequest,
) {
  const id = request.headers.get('id')|| '';

  try {
    await connect();

    // Find the product layer and its relationships
    const result = await findProductLayerRelationships(id);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error fetching product layer relationships:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product layer relationships' },
      { status: 500 }
    );
  }
}