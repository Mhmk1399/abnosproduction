import { NextRequest } from "next/server";
import {
  getProductionLineById,
  updateProductionLine,
  deleteProductionLine,
} from "@/middlewares/productionLines";

// GET a specific production line
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Fix: Properly await params.id
    const id = request.url.split("/").pop();
    console.log("Fetching production line with ID:", id);
    if (id) return await getProductionLineById(id);
  }
  catch (error) {
    console.error("Error fetching production line:", error);
    return new Response("Failed to fetch production line", { status: 500 });
  }
}

// UPDATE a production line
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Fix: Properly use params.id without awaiting
  const id = params.id;
  return updateProductionLine(request, id);
}

// DELETE a production line
export async function DELETE(request: NextRequest) {
  const id = request.headers.get("id") || "";
  return deleteProductionLine(id);
}
