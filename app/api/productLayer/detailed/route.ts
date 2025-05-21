import connect from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";
import ProductLayer from "@/models/productLayer";
import glass from "@/models/glass";
import glassTreatment from "@/models/glassTreatment";
import product from "@/models/product";
import invoice from "@/models/invoice";
import productionLine from "@/models/productionLine";
import steps from "@/models/steps";
import productionInventory from "@/models/productionInventory";
import design from "@/models/design";

export async function GET(request: NextRequest) {
  const id = request.headers.get("id") || "";

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  await connect();
  try {
    const productLayer = await ProductLayer.findById(id).populate([
      {
        path: "glass",
        model: glass,
        select: "name code",
      },
      {
        path: "treatments.treatment",
        model: glassTreatment,
      },
      {
        path: "product",
        model: product,
      },
      {
        path: "invoice",
        model: invoice,
      },
      {
        path: "productionLine",
        model: productionLine,
        populate: {
          path: "steps.step",
          model: steps,
        },
      },
      {
        path: "currentStep",
        model: steps,
      },
      {
        path: "currentInventory",
        model: productionInventory,
      },
      {
        path: "designNumber",
        model: design,
      },
    ]);

    if (productLayer === null) {
      return NextResponse.json(
        { error: "Product layer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(productLayer, { status: 200 });
  } catch (error) {
    console.error("Error fetching product layer:", error);
    return NextResponse.json(
      { error: "Failed to fetch product layer" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.headers.get("id") || "";
  if (!id) {
    return NextResponse.json(
      { error: "Product layer ID is required" },
      { status: 400 }
    );
  }
  await connect();
  try {
    const result = await ProductLayer.findByIdAndDelete(id);
    if (!result) {
      return NextResponse.json(
        { error: "Product layer not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Product layer deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting product layer:", error);
    return NextResponse.json(
      { error: "Failed to delete product layer" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  await connect();
  const id = request.headers.get("id") || "";
  try {
    const body = await request.json();
    const result = await ProductLayer.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!result) {
      return NextResponse.json(
        { error: "Product layer not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error updating product layer:", error);
    return NextResponse.json(
      { error: "Failed to update product layer" },
      { status: 500 }
    );
  }
}
