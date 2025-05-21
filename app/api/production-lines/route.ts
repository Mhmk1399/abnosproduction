import connect from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";
import poroductionLine from "@/models/productionLine";
import { v4 as uuidv4 } from "uuid";
import steps from "@/models/steps";
import productionInventory from "@/models/productionInventory";
import glassTreatment from "@/models/glassTreatment";

export async function GET() {
  await connect();
  try {
    const productionLines = await poroductionLine.find({}).populate([
      {
        path: "steps.step",
        model: steps,
        populate: {
          path: "handlesTreatments",
          model: glassTreatment,
          select: "name code",
        },
        select: "-password -__v -createdAt -updatedAt",
      },
      {
        path: "inventory",
        model: productionInventory,
      },
    ]);
    return NextResponse.json(productionLines, { status: 200 });
  } catch (error) {
    console.error("Error fetching production lines:", error);
    return NextResponse.json(
      { error: "Failed to fetch production lines" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  await connect();

  try {
    const body = await request.json();
    const code = `${body.name}-${uuidv4().substring(0, 8)}`;
    const newProductionLine = new poroductionLine({
      name: body.name,
      code: code,
      description: body.description,
      steps: body.steps,
      inventory: body.inventory,
      active: body.active || true,
    });
    await newProductionLine.save();
    return NextResponse.json(newProductionLine, { status: 201 });
  } catch (error) {
    console.error("Error creating production line:", error);
    return NextResponse.json(
      { error: "Failed to create production line" },
      { status: 500 }
    );
  }
}
