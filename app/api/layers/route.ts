import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import Layer from "../../../models/layers";
import { v4 as uuidv4 } from "uuid";

// GET layers with filtering options
export async function GET(request: NextRequest) {
  try {
    await connect();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const stepId = searchParams.get("stepId");
    const lineId = searchParams.get("lineId");
    const batchId = searchParams.get("batchId");
    const limit = parseInt(searchParams.get("limit") || "100");
    const page = parseInt(searchParams.get("page") || "1");

    // Build query
    const query: any = {};
    if (status) query.status = status;
    if (stepId) query["currentStep.stepId"] = stepId;
    if (lineId) query.productionLineId = lineId;
    if (batchId) query.batchId = batchId;

    // Execute query with pagination
    const layers = await Layer.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("currentStep.stepId")
      .populate("productionLineId");

    // Get total count for pagination
    const total = await Layer.countDocuments(query);

    return NextResponse.json(
      {
        layers,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching layers:", error);
    return NextResponse.json(
      { error: "Failed to fetch layers" },
      { status: 500 }
    );
  }
}

// POST a new layer
export async function POST(request: NextRequest) {
  try {
    await connect();

    const body = await request.json();

    // Validate required fields
    if (!body.code) {
      body.code = `LAYER-${uuidv4().substring(0, 8)}`;
    }

    const newLayer = new Layer({
      code: body.code,
      batchId: body.batchId,
      dimensions: body.dimensions || {},
      status: body.status || "waiting",
      productionLineId: body.productionLineId,
      metadata: body.metadata || {},
    });

    await newLayer.save();

    return NextResponse.json(newLayer, { status: 201 });
  } catch (error: any) {
    console.error("Error creating layer:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "A layer with this code already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create layer" },
      { status: 500 }
    );
  }
}
