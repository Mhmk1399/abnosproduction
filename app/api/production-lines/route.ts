import { NextRequest } from "next/server";
import { getAllProductionLines, createProductionLine } from "@/middlewares/productionLines";

// GET all production lines
export async function GET() {
  return getAllProductionLines();
}

// POST a new production line
export async function POST(request: NextRequest) {
  return createProductionLine(request);
}
