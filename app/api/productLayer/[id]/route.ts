import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import ProductLayer from "../../../../models/productLayer";

// GET a specific layer
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params; // Destructure id from params

  try {
    await connect();

    // Try to find by ID first
    let productLayer = await ProductLayer.findById(id);

    // If not found by ID, try to find by code
    if (!productLayer) {
      productLayer = await ProductLayer.findOne({ code: id });
    }

    if (!productLayer) {
      return NextResponse.json(
        { error: "Product layer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(productLayer, { status: 200 });
  } catch (error) {
    console.error("Error fetching product layer:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch product layer",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// UPDATE a layer
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params; // Destructure id from params

  try {
    await connect();
    const body = await request.json();

    // Find the layer
    const layer = await ProductLayer.findById(id);

    if (!layer) {
      return NextResponse.json({ error: "Layer not found" }, { status: 404 });
    }

    // Update fields based on the updated model
    if (body.customer) layer.customer = body.customer;
    if (body.code) layer.code = body.code;
    if (body.glass) layer.glass = body.glass;
    if (body.treatments) layer.treatments = body.treatments;
    if (body.width) layer.width = body.width;
    if (body.height) layer.height = body.height;
    if (body.product) layer.product = body.product;
    if (body.invoice) layer.invoice = body.invoice;
    if (body.productionCode) layer.productionCode = body.productionCode;
    if (body.productionLine) layer.productionLine = body.productionLine;
    if (body.productionDate) layer.productionDate = body.productionDate;
    if (body.currentStep) layer.currentStep = body.currentStep;
    if (body.productionNotes) layer.productionNotes = body.productionNotes;
    if (body.designNumber) layer.designNumber = body.designNumber;
    if (body.status) layer.status = body.status;

    await layer.save();

    return NextResponse.json(layer, { status: 200 });
  } catch (error) {
    console.error("Error updating layer:", error);
    return NextResponse.json(
      {
        error: "Failed to update layer",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// DELETE a layer
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params; // Destructure id from params

  try {
    await connect();

    const result = await ProductLayer.findByIdAndDelete(id);

    if (!result) {
      return NextResponse.json({ error: "Layer not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting layer:", error);
    return NextResponse.json(
      {
        error: "Failed to delete layer",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
