import connect from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";
import glass from "@/models/glass";
import glassTreatment from "@/models/glassTreatment";
import product from "@/models/product";

import productLayer from "@/models/productLayer";
import invoice from "@/models/invoice";
import { isValidObjectId } from "mongoose";
import steps from "@/models/steps";
import productionInventory from "@/models/productionInventory";
import design from "@/models/design";

export async function GET(request: NextRequest) {
  try {
    await connect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const layer = await productLayer.findById(id).populate([
        { path: "glass", model: glass, select: "name code" },
        { path: "treatments.treatment", model: glassTreatment },
        { path: "product", model: product },
        { path: "invoice", model: invoice },
        { path: "produtionSteps.step", model: steps },
        { path: "currentStep", model: steps },
        { path: "currentInventory", model: productionInventory },
        { path: "designNumber", model: design },
        { path: "customer", model: "Customer" },
      ]);
      if (!layer) {
        return NextResponse.json({ error: "Layer not found" }, { status: 404 });
      }
      return NextResponse.json(layer);
    }

    // Get query parameters for pagination and filtering
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const productionCode = searchParams.get("productionCode");
    const width = searchParams.get("width");
    const height = searchParams.get("height");
    const productionDateFrom = searchParams.get("productionDateFrom");
    const productionDateTo = searchParams.get("productionDateTo");
    const currentStep = searchParams.get("currentStep");
    const currentInventory = searchParams.get("currentInventory");

    console.log('ProductLayer API - Query params:', {
      page, limit, productionCode, width, height, 
      productionDateFrom, productionDateTo, currentStep, currentInventory
    });

    // Build filter object
    const filter: any = {};

    if (productionCode) {
      filter.productionCode = { $regex: productionCode, $options: "i" };
    }

    if (width) {
      filter.width = Number(width);
    }

    if (height) {
      filter.height = Number(height);
    }

    if (currentStep) {
      filter.currentStep = currentStep;
    }

    if (currentInventory) {
      filter.currentInventory = currentInventory;
    }

    if (productionDateFrom || productionDateTo) {
      filter.productionDate = {};
      if (productionDateFrom) {
        filter.productionDate.$gte = new Date(productionDateFrom);
      }
      if (productionDateTo) {
        filter.productionDate.$lte = new Date(productionDateTo);
      }
    }

    console.log('ProductLayer API - Filter object:', filter);

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalRecords = await productLayer.countDocuments(filter);
    const totalPages = Math.ceil(totalRecords / limit);

    // Fetch layers with pagination and filtering
    const layers = await productLayer
      .find(filter)
      .populate([
        { path: "glass", model: glass, select: "name code" },
        { path: "treatments.treatment", model: glassTreatment },
        { path: "product", model: product },
        { path: "invoice", model: invoice },
        { path: "produtionSteps.step", model: steps },
        { path: "currentStep", model: steps },
        { path: "currentInventory", model: productionInventory },
        { path: "designNumber", model: design },
        { path: "customer", model: "Customer" },
      ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);



    const response = {
      layers,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords,
        recordsPerPage: limit,
      },
    };

   

    return NextResponse.json(response);
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

    if (body.layerNumber && (typeof body.layerNumber !== "number" || body.layerNumber <= 0)) {
      return NextResponse.json(
        { error: "Valid layer number is required" },
        { status: 400 }
      );
    }

    if (body.thiknes && (typeof body.thiknes !== "number" || body.thiknes <= 0)) {
      return NextResponse.json(
        { error: "Valid thickness is required" },
        { status: 400 }
      );
    }

    if (!body.dueDate) {
      return NextResponse.json(
        { error: "Due date is required" },
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

    // Validate produtionSteps array
    if (body.produtionSteps && Array.isArray(body.produtionSteps)) {
      for (const prodStep of body.produtionSteps) {
        if (!prodStep.step || !isValidObjectId(prodStep.step)) {
          return NextResponse.json(
            { error: "Invalid step ID in produtionSteps array" },
            { status: 400 }
          );
        }
        if (typeof prodStep.sequence !== "number") {
          return NextResponse.json(
            { error: "Invalid sequence in produtionSteps array" },
            { status: 400 }
          );
        }
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
    const productLayers = await productLayer.create(body);
    return NextResponse.json(productLayer, { status: 201 });
  } catch (error) {
    console.error("Error creating product layer:", error);
    return NextResponse.json(
      { error: "Failed to create product layer" },
      { status: 500 }
    );
  }
}
