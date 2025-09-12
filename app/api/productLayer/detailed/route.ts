import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import ProductLayer from "@/models/productLayer";
import glass from "@/models/glass";
import glassTreatment from "@/models/glassTreatment";
import product from "@/models/product";
import invoice from "@/models/invoice";
import productionLine from "@/models/productionLine";
import steps from "@/models/steps";
import productionInventory from "@/models/productionInventory";
import design from "@/models/design";

export async function PATCH(request: NextRequest) {
  try {
    await connect();
    const id = request.headers.get("id");
    const body = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const updatedLayer = await ProductLayer.findByIdAndUpdate(id, body, {
      new: true,
    }).populate([
      { path: "glass", model: glass, select: "name code" },
      { path: "treatments.treatment", model: glassTreatment },
      { path: "product", model: product },
      { path: "invoice", model: invoice },
      { path: "productionLine", model: productionLine },
      { path: "currentStep", model: steps },
      { path: "currentInventory", model: productionInventory },
      { path: "designNumber", model: design },
    ]);

    if (!updatedLayer) {
      return NextResponse.json({ error: "Layer not found" }, { status: 404 });
    }

    return NextResponse.json(updatedLayer);
  } catch (error) {
    console.error("Error updating layer:", error);
    return NextResponse.json(
      { error: "Failed to update layer" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connect();
    const id = request.headers.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const deletedLayer = await ProductLayer.findByIdAndDelete(id);

    if (!deletedLayer) {
      return NextResponse.json({ error: "Layer not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Layer deleted successfully" });
  } catch (error) {
    console.error("Error deleting layer:", error);
    return NextResponse.json(
      { error: "Failed to delete layer" },
      { status: 500 }
    );
  }
}