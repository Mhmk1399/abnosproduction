import connect from "../../../../lib/data";
import { NextRequest, NextResponse } from "next/server";
import steps from "@/models/steps";
import GlassTreatment from "@/models/glassTreatment";

export async function GET(request: NextRequest) {
  await connect();

  try {
    const id = request.headers.get("id") || "";
    if (!id) {
      return NextResponse.json(
        { error: "Step ID is required" },
        { status: 400 }
      );
    }
    const step = await steps.findById(id).populate({
      path: "handlesTreatments",
      model: GlassTreatment,
      select: "name",
    });
    if (step === null) {
      return NextResponse.json({ error: "Step not found" }, { status: 404 });
    }
    return NextResponse.json(step, { status: 200 });
  } catch (error) {
    console.error("Error fetching steps:", error);
    return NextResponse.json(
      { error: "Failed to fetch steps" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  await connect();
  const id = request.headers.get("id") || "";
  if (!id) {
    return NextResponse.json({ error: "Step ID is required" }, { status: 400 });
  }

  try {
    const result = await steps.findByIdAndDelete(id);
    if (!result) {
      return NextResponse.json({ error: "Step not found" }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Step deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting step:", error);
    return NextResponse.json(
      { error: "Failed to delete step" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  await connect();

  const id = request.headers.get("id") || "";
  if (!id) {
    return NextResponse.json({ error: "Step ID is required" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const result = await steps.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!result) {
      return NextResponse.json({ error: "Step not found" }, { status: 404 });
    }
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error updating step:", error);
    return NextResponse.json(
      { error: "Failed to update step" },
      { status: 500 }
    );
  }
}
