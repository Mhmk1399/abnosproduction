import connect from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";
import poroductionLine from "@/models/productionLine";
import steps from "@/models/steps";
import glassTreatment from "@/models/glassTreatment";
import productionInventory from "@/models/productionInventory";


export async function GET(request: NextRequest) {
  const id = request.headers.get("id") || '';
  await connect();
  try {
    const productionLine = await poroductionLine.findById(id).populate([
      {
        path: "steps.step",
        model: steps,
        populate: {
          path: "handlesTreatments",
          model: glassTreatment,
          select: "name code",
        }, select: "-password -__v -createdAt -updatedAt"

      },
      {
        path: "inventory",
        model: productionInventory,
      }
    ]);
    if (productionLine === null) {
      return NextResponse.json({ error: "Production line not found" }, { status: 404 });
    }
    return NextResponse.json(productionLine, { status: 200 });



  } catch (error) {
    console.error("Error fetching production lines:", error);
    return NextResponse.json({ error: "Failed to fetch production lines" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.headers.get("id") || '';
  await connect();
  try {
    const result = await poroductionLine.findByIdAndDelete(id);
    if (!result) {
      return NextResponse.json({ error: "Production line not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Production line deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting production line:", error);
    return NextResponse.json({ error: "Failed to delete production line" }, { status: 500 });
  }
}


export async function PATCH(request: NextRequest) {
  const id = request.headers.get("id") || '';
  await connect();
  try {
    const body = await request.json();
    const result = await poroductionLine.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!result) {
      return NextResponse.json({ error: "Production line not found" }, { status: 404 });
    }
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error updating production line:", error);
    return NextResponse.json({ error: "Failed to update production line" }, { status: 500 });
  }
}