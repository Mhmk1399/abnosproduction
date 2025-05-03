import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import Layer from "../models/layers";

export const recordProcessEvent = async (
  request: NextRequest,
  layerId: string
) => {
  try {
    await connect();

    const body = await request.json();

    // Validate required fields
    if (!body.stepId || !body.eventType) {
      return NextResponse.json(
        { error: "Step ID and event type are required" },
        { status: 400 }
      );
    }

    // Find the layer
    const layer = await Layer.findById(layerId);

    if (!layer) {
      return NextResponse.json({ error: "Layer not found" }, { status: 404 });
    }

    // Update layer based on event type
    if (body.eventType === "start") {
      // Update layer status and current step
      layer.status = "in-progress";
      layer.currentStep = {
        stepId: body.stepId,
        startTime: new Date(),
      };

      // Add to process history
      layer.processHistory.push({
        stepId: body.stepId,
        startTime: new Date(),
        status: "in-progress",
        workerId: body.workerId || "unknown",
      });
    } else if (body.eventType === "complete" || body.eventType === "defect") {
      // Find the current process history entry for this step
      const historyEntry = layer.processHistory
        .filter(
          (h: { stepId: { toString: () => any }; status: string }) =>
            h.stepId.toString() === body.stepId.toString() &&
            h.status === "in-progress"
        )
        .pop();

      if (historyEntry) {
        historyEntry.endTime = new Date();
        historyEntry.status =
          body.eventType === "complete" ? "completed" : "defective";
        historyEntry.notes = body.notes;
      }

      // Update overall layer status
      if (body.eventType === "defect") {
        layer.status = "defective";
      } else {
        // For now, just mark as completed
        // In a real app, you'd check if this was the last step in the production line
        layer.status = "completed";
      }

      // Clear current step
      layer.currentStep = undefined;
    }

    await layer.save();

    return NextResponse.json(
      {
        success: true,
        layer,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing layer:", error);
    return NextResponse.json(
      { error: "Failed to process layer" },
      { status: 500 }
    );
  }
};

export const getProcessHistory = async (layerId: string) => {
  try {
    await connect();

    const layer = await Layer.findById(layerId)
      .populate("processHistory.stepId")
      .populate("currentStep.stepId");

    if (!layer) {
      return NextResponse.json({ error: "Layer not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        processHistory: layer.processHistory,
        currentStep: layer.currentStep,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching process history:", error);
    return NextResponse.json(
      { error: "Failed to fetch process history" },
      { status: 500 }
    );
  }
};
