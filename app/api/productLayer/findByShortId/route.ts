import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import ProductLayer from "@/models/productLayer";

export async function GET(request: NextRequest) {
  await connect();

  try {
    const shortId = request.headers.get("shortId") || "";

    if (!shortId) {
      return NextResponse.json(
        { error: "Short ID is required" },
        { status: 400 }
      );
    }

    console.log(shortId, "shortId");

    // Fetch all layers and manually check if any ID starts with the shortId
    const allLayers = await ProductLayer.find({});

    // Find the layer whose ID starts with the shortId
    const matchingLayer = allLayers.find((layer) =>
      layer._id.toString().startsWith(shortId)
    );

    if (!matchingLayer) {
      console.log("No matching layer found for shortId:", shortId);
      console.log(
        "Available IDs:",
        allLayers.map((layer) => layer._id.toString().substring(0, 10))
      );
      return NextResponse.json(
        { error: "No matching layer found" },
        { status: 404 }
      );
    }

    console.log("Found matching layer:", matchingLayer._id.toString());

    return NextResponse.json(
      {
        layerId: matchingLayer._id.toString(),
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error finding layer by short ID:", error);
    return NextResponse.json(
      { error: "Failed to find layer" },
      { status: 500 }
    );
  }
}
