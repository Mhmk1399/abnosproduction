import { NextRequest, NextResponse } from "next/server";
import connect from "@/lib/data";
import Steps from "@/models/steps";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    await connect();

    const body = await request.json();
    const { name, password } = body;

    // Validate required fields
    if (!name || !password) {
      return NextResponse.json(
        { error: "Step name and password are required" },
        { status: 400 }
      );
    }

    // Find the step by name
    const step = await Steps.findOne({ name });

    // Check if step exists
    if (!step) {
      return NextResponse.json({ error: "Step not found" }, { status: 404 });
    }

    // Verify password using bcrypt compare
    const isPasswordValid = await bcrypt.compare(password, step.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Return step information (excluding password)
    const stepData = {
      _id: step._id,
      name: step.name,
      code: step.code,
      description: step.description,
      type: step.type,
      handlesTreatments: step.handlesTreatments,
      productionLine: step.productionLine,
      requiresScan: step.requiresScan,
    };

    return NextResponse.json(
      {
        message: "Authentication successful",
        step: stepData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error authenticating step:", error);
    return NextResponse.json(
      { error: "Failed to authenticate step" },
      { status: 500 }
    );
  }
}
