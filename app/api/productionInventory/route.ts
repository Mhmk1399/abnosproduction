import { NextRequest } from "next/server";
import {
  getAllInventories,
  createInventory,
} from "@/middlewares/productionInventory";

export async function GET() {
  return getAllInventories();
}

export async function POST(request: NextRequest) {
  return createInventory(request);
}
