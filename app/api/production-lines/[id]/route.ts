import { NextRequest } from "next/server";
import { getProductionLineById, updateProductionLine, deleteProductionLine } from "@/middlewares/productionLines";

// GET a specific production line
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
  
) {
  const id = params.id;
    return getProductionLineById(id);
}

// UPDATE a production line
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  return updateProductionLine(request, id);
}

// DELETE a production line
export async function DELETE(
  request: NextRequest,
) {
  const id = request.headers.get('id')|| '';
    return deleteProductionLine(id);
}
