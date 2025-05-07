import { NextRequest, NextResponse } from "next/server";
import { 
  getProductLayers, 
  getProductLayerById, 
  createProductLayer, 
  updateProductLayer, 
  deleteProductLayer 
} from "@/middlewares/productLayers";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  
  if (id) {
    return getProductLayerById(id);
  }
  
  return getProductLayers();
}

export async function POST(req: NextRequest) {
  return createProductLayer(req);
}

export async function PUT(req: NextRequest) {
  return updateProductLayer(req);
}

export async function DELETE(req: NextRequest) {
  return deleteProductLayer(req);
}
