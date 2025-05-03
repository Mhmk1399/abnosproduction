import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import Layer from "../../../../models/layers";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    await connect();

    const body = await request.json();

    if (
      !body.layers ||
      !Array.isArray(body.layers) ||
      body.layers.length === 0
    ) {
      return NextResponse.json(
        { error: "No layers provided" },
        { status: 400 }
      );
    }

    // Create layers in batch
    const layersToCreate = body.layers.map((layer: any) => ({
      code: `LAYER-${uuidv4().substring(0, 8)}`,
      batchId: layer.batchId,
      dimensions: layer.dimensions || {},
      status: "waiting",
      productionLineId: layer.productionLineId,
      metadata: layer.metadata || {},
    }));

    const createdLayers = await Layer.insertMany(layersToCreate);

    return NextResponse.json(
      {
        success: true,
        layers: createdLayers,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating batch of layers:", error);

    return NextResponse.json(
      { error: "Failed to create batch of layers" },
      { status: 500 }
    );
  }
}
