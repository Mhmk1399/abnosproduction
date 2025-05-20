import connect from "@/lib/data";
import { NextRequest, NextResponse } from "next/server";
import StepExecution from "@/models/StepExecution";
import steps from "@/models/steps";
import productionLine from "@/models/productionLine";
import productLayer from "@/models/productLayer";
import glassTreatment from "@/models/glassTreatment";

export async function GET(request: NextRequest) {
  await connect();
  const id = request.headers.get("id") || "";
  try {
    const stepExecutions = await StepExecution.findById(id).populate([
      {
        path: "step",
        model: steps,
        select: "id name code",
      },
      {
        path: "productionLine",
        model: productionLine,
        select: "id name steps",
      },
      {
        path: "layer",
        model: productLayer,
      },
      {
        path: "treatmentsApplied",
        model: glassTreatment,
        select: "name",
      },
    ]);
    return NextResponse.json(stepExecutions, { status: 200 });
  } catch (error) {
    console.error("Error fetching step executions:", error);
    return NextResponse.json(
      { error: "Failed to fetch step executions" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const id = request.headers.get("id") || "";
  await connect();
  try {
    const body = await request.json();
    const result = await StepExecution.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!result) {
      return NextResponse.json(
        { error: "Step execution not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error updating step execution:", error);
    return NextResponse.json(
      { error: "Failed to update step execution" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.headers.get("id") || "";
  await connect();
  try {
    const result = await StepExecution.findByIdAndDelete(id);
    if (!result) {
      return NextResponse.json(
        { error: "Step execution not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Step execution deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting step execution:", error);
    return NextResponse.json(
      { error: "Failed to delete step execution" },
      { status: 500 }
    );
  }
}
