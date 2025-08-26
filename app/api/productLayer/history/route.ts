import { NextResponse } from "next/server";
import connect from "@/lib/data";
import ProductLayer from "@/models/productLayer";
import StepExecution from "@/models/StepExecution";
import glass from "@/models/glass";
import product from "@/models/product";
import invoice from "@/models/invoice";
import productionLine from "@/models/productionLine";
import steps from "@/models/steps";
import glassTreatment from "@/models/glassTreatment";

export async function GET() {
  try {
    await connect();
    
    // Get all layers with their basic info
    const layers = await ProductLayer.find({}).populate([
      {
        path: "glass",
        model: glass,
        select: "name code",
      },
      {
        path: "product",
        model: product,
        select: "name",
      },
      {
        path: "invoice",
        model: invoice,
        select: "customer",
        populate: {
          path: "customer",
          select: "name",
        },
      },
      {
        path: "productionLine",
        model: productionLine,
        select: "name",
      },
      {
        path: "currentStep",
        model: steps,
        select: "name code",
      },
    ]);

    // Get step executions for all layers
    const stepExecutions = await StepExecution.find({}).populate([
      {
        path: "step",
        model: steps,
        select: "name code",
      },
      {
        path: "productionLine",
        model: productionLine,
        select: "name",
      },
      {
        path: "treatmentsApplied.treatment",
        model: glassTreatment,
        select: "name",
      },
    ]).sort({ scannedAt: -1 });

    // Group step executions by layer
    const layerHistoryMap = new Map();
    stepExecutions.forEach(execution => {
      const layerId = execution.layer.toString();
      if (!layerHistoryMap.has(layerId)) {
        layerHistoryMap.set(layerId, []);
      }
      layerHistoryMap.get(layerId).push(execution);
    });

    // Combine layers with their history
    const layersWithHistory = layers.map(layer => ({
      ...layer.toObject(),
      history: layerHistoryMap.get(layer._id.toString()) || [],
    }));

    return NextResponse.json(layersWithHistory, { status: 200 });
  } catch (error) {
    console.error("Error fetching layers with history:", error);
    return NextResponse.json(
      { error: "Failed to fetch layers with history" },
      { status: 500 }
    );
  }
}