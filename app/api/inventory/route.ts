import connect from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";
import {
  createInventory,
  getAllInventories,
  updateInventory,
  deleteInventory,
} from "@/middlewares/inventory";

export const GET = async () => {
  await connect();
  return getAllInventories();
};

export const POST = async (request: NextRequest) => {
  await connect();
  return createInventory(request);
};

export const PUT = async (request: NextRequest) => {
  await connect();
  const body = await request.json();
  const _id = body._id;
  if (!_id) {
    return NextResponse.json(
      { error: "Inventory ID is required" },
      { status: 400 }
    );
  }
  return updateInventory(body, _id);
};

export const DELETE = async (request: NextRequest) => {
  await connect();
  const body = await request.json();
  const _id = body._id;
  if (!_id) {
    return NextResponse.json(
      { error: "Inventory ID is required" },
      { status: 400 }
    );
  }
  return deleteInventory(_id);
};
