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
import { isValidObjectId } from "mongoose";

export async function GET(request: NextRequest) {
  try {
    await connect();
    
    const { searchParams } = new URL(request.url);
    const productionCode = searchParams.get('productionCode');
    
    let query = {};
    if (productionCode) {
      query = { productionCode: productionCode }; // Exact match
    }
    
    const productLayers = await ProductLayer.find(query).populate([
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
    return NextResponse.json(productLayers, { status: 200 });
  } catch (error) {
    console.error("Error fetching product layers:", error);
    return NextResponse.json(
      { error: "Failed to fetch product layers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connect();
    const body = await request.json();

    // Validate required fields
    if (!body.productionCode) {
      return NextResponse.json(
        { error: "Production code is required" },
        { status: 400 }
      );
    }

    if (!body.width || typeof body.width !== "number" || body.width <= 0) {
      return NextResponse.json(
        { error: "Valid width is required" },
        { status: 400 }
      );
    }

    if (!body.height || typeof body.height !== "number" || body.height <= 0) {
      return NextResponse.json(
        { error: "Valid height is required" },
        { status: 400 }
      );
    }

    if (!body.productionDate) {
      return NextResponse.json(
        { error: "Production date is required" },
        { status: 400 }
      );
    }

    // Validate ObjectIds
    if (body.glass && !isValidObjectId(body.glass)) {
      return NextResponse.json({ error: "Invalid glass ID" }, { status: 400 });
    }

    if (body.product && !isValidObjectId(body.product)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    if (body.invoice && !isValidObjectId(body.invoice)) {
      return NextResponse.json(
        { error: "Invalid invoice ID" },
        { status: 400 }
      );
    }

    if (body.productionLine && !isValidObjectId(body.productionLine)) {
      return NextResponse.json(
        { error: "Invalid production line ID" },
        { status: 400 }
      );
    }

    if (body.currentStep && !isValidObjectId(body.currentStep)) {
      return NextResponse.json(
        { error: "Invalid current step ID" },
        { status: 400 }
      );
    }

    if (body.currentInventory && !isValidObjectId(body.currentInventory)) {
      return NextResponse.json(
        { error: "Invalid current inventory ID" },
        { status: 400 }
      );
    }

    if (body.designNumber && !isValidObjectId(body.designNumber)) {
      return NextResponse.json(
        { error: "Invalid design number ID" },
        { status: 400 }
      );
    }

    // Validate treatments array
    if (body.treatments && Array.isArray(body.treatments)) {
      for (const treatment of body.treatments) {
        if (!treatment.treatment || !isValidObjectId(treatment.treatment)) {
          return NextResponse.json(
            { error: "Invalid treatment ID in treatments array" },
            { status: 400 }
          );
        }

        if (
          treatment.count &&
          (typeof treatment.count !== "number" || treatment.count < 0)
        ) {
          return NextResponse.json(
            { error: "Invalid count in treatments array" },
            { status: 400 }
          );
        }
      }
    }

    // Verify referenced documents exist
    if (body.glass) {
      const glassExists = await glass.findById(body.glass);
      if (!glassExists) {
        return NextResponse.json(
          { error: "Referenced glass not found" },
          { status: 404 }
        );
      }
    }

    if (body.product) {
      const productExists = await product.findById(body.product);
      if (!productExists) {
        return NextResponse.json(
          { error: "Referenced product not found" },
          { status: 404 }
        );
      }
    }

    if (body.productionLine) {
      const lineExists = await productionLine.findById(body.productionLine);
      if (!lineExists) {
        return NextResponse.json(
          { error: "Referenced production line not found" },
          { status: 404 }
        );
      }
    }

    if (body.currentStep) {
      const stepExists = await steps.findById(body.currentStep);
      if (!stepExists) {
        return NextResponse.json(
          { error: "Referenced step not found" },
          { status: 404 }
        );
      }
    }

    // Create the product layer
    const productLayer = await ProductLayer.create(body);
    return NextResponse.json(productLayer, { status: 201 });
  } catch (error) {
    console.error("Error creating product layer:", error);
    return NextResponse.json(
      { error: "Failed to create product layer" },
      { status: 500 }
    );
  }
}
