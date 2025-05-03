import connect from "@/lib/data";
import { NextRequest } from "next/server";
import {
  getProductLayers,
  getProductLayerById,
  deleteProductLayer,
  updateProductLayer,
} from "@/middlewares/productLayers";

export async function GET(req: NextRequest) {
  await connect();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (id) {
    return getProductLayerById(id);
  }
  return getProductLayers();
}
export async function PATCH(req: NextRequest) {
  await connect();
  return updateProductLayer(req);
}
export async function DELETE(req: NextRequest) {
  await connect();
  return deleteProductLayer(req);
}
